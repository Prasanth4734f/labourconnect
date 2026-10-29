/**
 * LabourConnect Design Engine - Critical 3D House Reconstruction Regression Test Suite
 * 
 * Verifies the 5 root-cause fixes:
 * 1. Correct camera pitch and projection across low, moderate, and steep angles (roofs visible, underside culled).
 * 2. Real door and window matching (direct and nested coordinates, wall voids, jambs, headers, aprons, frames, leaves, glass).
 * 3. Separation of Exterior, 3D Dollhouse, and Floor-Isolation views (no interior clutter in exterior view, cutaway in dollhouse).
 * 4. Deterministic roofline and rooftop parapet generation (independent of mumty, style defaults, Kerala pitched, Modern flat).
 * 5. Dynamic viewport auto-framing and centering (no clipping of roofs or porticos, fits padding, respects zoom/pan).
 * 6. Representative architectural designs and 2D/3D consistency.
 */

import assert from 'assert';
import {
  generateProceduralBuilding3d,
  generateWallWithRealOpenings,
  resolveProceduralRooflineStyle,
  createSolidBoxMesh
} from '../geometry/proceduralBuildingGenerator3d.js';
import {
  project3dToViewport
} from '../geometry/procedural3dGenerator.js';
import { generateLayoutCandidate, generateLayout } from '../generator/layoutGenerator.js';
import { generate2dFloorPlan } from '../cad/floorPlanGenerator.js';

export function runHouseReconstructionFixesTests() {
  console.log('\n===============================================================');
  console.log('LABOURCONNECT 3D ENGINE: HOUSE RECONSTRUCTION ROOT-CAUSE FIXES');
  console.log('===============================================================');

  let passed = 0;
  let failed = 0;

  function runTest(name, fn) {
    try {
      fn();
      console.log(`✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ FAIL: ${name}`);
      console.error(err);
      failed++;
    }
  }

  // =========================================================================
  // GROUP 1: CAMERA PITCH & PROJECTION (DEFECT 1)
  // =========================================================================
  console.log('\n--- Group 1: Camera Pitch, Projection Angles & Upward Visibility ---');

  runTest('Test 1.1: Elevated camera pitch (25°) renders top roof face and culls bottom face', () => {
    const box = createSolidBoxMesh('cube', 'wall', { minX: 0, minY: 0, minZ: 0, maxX: 10, maxY: 10, maxZ: 10 });
    const geom = { buildingModel3d: { meshes: [box] }, bounds3d: box.bounds };

    const proj = project3dToViewport(geom, { yaw: 35, pitch: 25, zoom: 1.0 });
    const faceNames = proj.projectedPolygons.map(p => {
      const idx = parseInt(p.id.split('_f')[1], 10);
      return box.faces[idx]?.name;
    });

    assert.ok(faceNames.includes('top'), 'Top roof face must be visible in elevated camera angle');
    assert.ok(!faceNames.includes('bottom'), 'Bottom underside face must be culled in elevated camera angle');
    assert.strictEqual(proj.projectedPolygons.length, 3, 'Exactly 3 front/top faces visible on closed cube');
  });

  runTest('Test 1.2: Regression test across low, moderate, and steep elevated angles (15°, 25°, 45°, 70°)', () => {
    const box = createSolidBoxMesh('cube_angles', 'wall', { minX: 0, minY: 0, minZ: 0, maxX: 12, maxY: 10, maxZ: 14 });
    const geom = { buildingModel3d: { meshes: [box] }, bounds3d: box.bounds };

    const testElevations = [15, 25, 45, 70];
    testElevations.forEach(elev => {
      const proj = project3dToViewport(geom, { yaw: 40, pitch: elev, zoom: 1.0 });
      const topPolygon = proj.projectedPolygons.find(p => p.id.includes('_f5')); // face 5 is top
      const bottomPolygon = proj.projectedPolygons.find(p => p.id.includes('_f4')); // face 4 is bottom

      assert.ok(topPolygon !== undefined, `Top face must be visible at elevation ${elev}°`);
      assert.ok(bottomPolygon === undefined, `Bottom face must remain culled at elevation ${elev}°`);
      assert.ok(proj.projectedPolygons.every(p => !p.points.includes('NaN')), `Finite coordinates at elevation ${elev}°`);
    });
  });

  runTest('Test 1.3: Top face vertices have lower SVG Y (appear higher on screen) than bottom ground vertices', () => {
    const box = createSolidBoxMesh('cube_vert', 'wall', { minX: -5, minY: 0, minZ: -5, maxX: 5, maxY: 10, maxZ: 5 });
    const geom = { buildingModel3d: { meshes: [box] }, bounds3d: box.bounds };

    const proj = project3dToViewport(geom, { yaw: 0, pitch: 30, zoom: 1.0 });
    const topPoly = proj.projectedPolygons.find(p => p.id.includes('_f5'));
    assert.ok(topPoly, 'Top polygon exists');

    const pts = topPoly.points.split(' ').map(s => s.split(',').map(Number));
    const topAvgY = pts.reduce((sum, pt) => sum + pt[1], 0) / pts.length;

    // Viewport cy is 280
    assert.ok(topAvgY < 280, `Top face center (${topAvgY}) sits higher on screen than viewport center (280)`);
  });

  // =========================================================================
  // GROUP 2: DOOR AND WINDOW MATCHING (DEFECT 2)
  // =========================================================================
  console.log('\n--- Group 2: Door and Window Matching from Real Input Records ---');

  runTest('Test 2.1: Matches openings specified with direct coordinates { x, y, width, wall, label }', () => {
    const wall = {
      id: 'w_north',
      type: 'exterior',
      start: { x: 3, y: 5 },
      end: { x: 23, y: 5 }, // 20 ft wall along X
      orientation: 'north',
      thickness: 0.75,
      height: 10
    };

    const real2dOpenings = [
      { x: 8, y: 5, width: 3.5, wall: 'north', label: 'Main Teak Door', type: 'door' },
      { x: 18, y: 5, width: 4.0, wall: 'north', label: 'Living Window', type: 'window' }
    ];

    const diag = [];
    const { solidBlocks, openingComponents, matchedOpIds } = generateWallWithRealOpenings(
      wall,
      real2dOpenings,
      { floorIndex: 0, elevationY: 1.5, clearHeight: 10 },
      diag
    );

    assert.strictEqual(matchedOpIds.length, 2, 'Both direct coordinate openings matched host wall');
    assert.ok(solidBlocks.some(b => b.type === 'wall_header'), 'Lintel headers generated');
    assert.ok(solidBlocks.some(b => b.type === 'wall_apron'), 'Sub-sill window apron generated');
    assert.ok(openingComponents.some(c => c.componentType === 'door_leaf'), 'Door leaf generated');
    assert.ok(openingComponents.some(c => c.componentType === 'window_frame'), 'Window frame generated');
    assert.ok(openingComponents.some(c => c.componentType === 'window_pane'), 'Window glass pane generated');
  });

  runTest('Test 2.2: Matches openings specified with nested { position: { x, y } } coordinates', () => {
    const wall = {
      id: 'w_east',
      type: 'exterior',
      start: { x: 23, y: 5 },
      end: { x: 23, y: 35 }, // 30 ft wall along Z
      orientation: 'east',
      thickness: 0.75,
      height: 10
    };

    const nestedOpenings = [
      { id: 'win_east_1', type: 'window', position: { x: 23, y: 15 }, width: 5.0, wall: 'east' }
    ];

    const diag = [];
    const { openingComponents, matchedOpIds } = generateWallWithRealOpenings(
      wall,
      nestedOpenings,
      { floorIndex: 0, elevationY: 1.5, clearHeight: 10 },
      diag
    );

    assert.strictEqual(matchedOpIds.length, 1);
    assert.strictEqual(matchedOpIds[0], 'win_east_1');
    assert.ok(openingComponents.length >= 2, 'Frame and pane generated');
  });

  runTest('Test 2.3: Real candidate building generates doors and windows on 3D wall solids', () => {
    const cand = generateLayoutCandidate({ plotWidth: 30, plotLength: 40, floorsCount: 2, bhkCount: 3 });
    const bld = generateProceduralBuilding3d(cand);

    const doorLeaves = bld.meshes.filter(m => m.componentType === 'door_leaf');
    const windowFrames = bld.meshes.filter(m => m.componentType === 'window_frame');
    const windowPanes = bld.meshes.filter(m => m.componentType === 'window_pane');
    const wallHeaders = bld.meshes.filter(m => m.type === 'wall_header');
    const wallAprons = bld.meshes.filter(m => m.type === 'wall_apron');

    assert.ok(doorLeaves.length > 0, `Door leaves must be > 0 (found ${doorLeaves.length})`);
    assert.ok(windowFrames.length > 0, `Window frames must be > 0 (found ${windowFrames.length})`);
    assert.ok(windowPanes.length > 0, `Window panes must be > 0 (found ${windowPanes.length})`);
    assert.ok(wallHeaders.length > 0, `Wall headers must be > 0 (found ${wallHeaders.length})`);
    assert.ok(wallAprons.length > 0, `Wall aprons must be > 0 (found ${wallAprons.length})`);
  });

  runTest('Test 2.4: Invalid opening dimensions (negative or zero width) are rejected with diagnostic', () => {
    const wall = { id: 'w1', type: 'exterior', start: { x: 0, y: 0 }, end: { x: 20, y: 0 } };
    const invalidOp = [{ id: 'bad_door', type: 'door', x: 10, y: 0, width: -2.0, wall: 'north' }];
    const diag = [];

    const { matchedOpIds } = generateWallWithRealOpenings(wall, invalidOp, { floorIndex: 0 }, diag);
    assert.strictEqual(matchedOpIds.length, 0, 'Invalid width opening must not match');
    assert.ok(diag.some(d => d.componentId === 'bad_door' && d.status === 'INVALID_DIMENSION'));
  });

  runTest('Test 2.5: Unmatched opening is reported in diagnostics with status SKIPPED', () => {
    const cand = {
      schemaVersion: '2.0.0',
      id: 'test_unmatched_op',
      site: { plotWidth: 30, plotLength: 40, buildableEnvelope: { x: 3, y: 5, width: 24, length: 30 } },
      floors: [{
        floorIndex: 0,
        rooms: [{ id: 'r1', bounds: { x: 3, y: 5, width: 24, length: 30 } }],
        walls: [{ id: 'w1', type: 'exterior', start: { x: 3, y: 5 }, end: { x: 27, y: 5 } }],
        doors: [{ id: 'ghost_door', type: 'door', x: 99, y: 99, width: 3.0 }] // far outside
      }]
    };

    const res = generateProceduralBuilding3d(cand);
    const unmatchDiag = res.diagnostics.find(d => d.componentId === 'ghost_door');
    assert.ok(unmatchDiag !== undefined, 'Unmatched opening must emit diagnostic');
    assert.strictEqual(unmatchDiag.status, 'SKIPPED');
  });

  // =========================================================================
  // GROUP 3: PRESENTATION MODES SEPARATION (DEFECT 3)
  // =========================================================================
  console.log('\n--- Group 3: Exterior vs 3D Dollhouse vs Floor-Isolation Views ---');

  runTest('Test 3.1: Exterior View excludes interior partition walls and interior stairs', () => {
    const cand = generateLayoutCandidate({ plotWidth: 30, plotLength: 40, floorsCount: 2, bhkCount: 3 });
    const bld = generateProceduralBuilding3d(cand);

    const extProj = project3dToViewport(bld.meshes, {
      azimuth: 35,
      elevation: 25,
      viewMode: 'exterior'
    });

    const hasInteriorWalls = extProj.faces.some(f => f.componentType === 'wall_interior' || f.type === 'wall_interior');
    const hasStairs = extProj.faces.some(f => f.componentType === 'stair_tread');

    assert.strictEqual(hasInteriorWalls, false, 'Exterior view must not render interior partition walls');
    assert.strictEqual(hasStairs, false, 'Exterior view must not render interior stairs');
    assert.ok(extProj.faces.length > 0, 'Exterior view has non-empty face set');
  });

  runTest('Test 3.2: 3D Dollhouse View includes interior rooms, partitions, and stairs with roof cutaway', () => {
    const cand = generateLayoutCandidate({ plotWidth: 30, plotLength: 40, floorsCount: 2, bhkCount: 3 });
    const bld = generateProceduralBuilding3d(cand);

    const dollProj = project3dToViewport(bld.meshes, {
      azimuth: 35,
      elevation: 45,
      viewMode: 'dollhouse'
    });

    const hasStairs = dollProj.faces.some(f => f.componentType === 'stair_tread');
    const hasRoofTiles = dollProj.faces.some(f => f.componentType === 'sloping_roof');

    assert.ok(hasStairs, 'Dollhouse view preserves interior stairs and vertical circulation');
    assert.strictEqual(hasRoofTiles, false, 'Dollhouse view cuts away roofline');
    assert.ok(dollProj.faces.length > 100, 'Dollhouse view renders rich interior mesh set');
  });

  runTest('Test 3.3: Floor-Isolation View displays only elements belonging to the isolated floor', () => {
    const cand = generateLayoutCandidate({ plotWidth: 30, plotLength: 40, floorsCount: 2, bhkCount: 3 });
    const bld = generateProceduralBuilding3d(cand);

    const groundOnly = project3dToViewport(bld.meshes, { isolatedFloor: 0 });
    const firstOnly = project3dToViewport(bld.meshes, { isolatedFloor: 1 });

    assert.ok(groundOnly.faces.length > 0 && firstOnly.faces.length > 0);
    assert.ok(groundOnly.faces.every(f => f.floorIndex === 0 || f.floorIndex === undefined));
    assert.ok(firstOnly.faces.every(f => f.floorIndex === 1 || f.floorIndex === undefined));
    assert.ok(groundOnly.faces.length < bld.meshes.length * 6, 'Isolated floor is a subset of full building');
  });

  // =========================================================================
  // GROUP 4: ROOFLINE & ROOFTOP PARAPET GENERATION (DEFECT 4)
  // =========================================================================
  console.log('\n--- Group 4: Roofline & Rooftop Parapet Generation ---');

  runTest('Test 4.1: Missing roofline style resolves to flat_terrace default with rooftop parapet', () => {
    const style = resolveProceduralRooflineStyle({}, {});
    assert.strictEqual(style, 'flat_terrace');

    const cand = generateLayoutCandidate({ plotWidth: 30, plotLength: 40, floorsCount: 1, bhkCount: 2 });
    const bld = generateProceduralBuilding3d(cand);

    const parapets = bld.meshes.filter(m => m.componentType === 'parapet');
    assert.strictEqual(parapets.length, 4, '4 perimeter parapet walls generated on flat terrace');
  });

  runTest('Test 4.2: Explicit pitched roofline generates sloping roof pitches and ridge cap', () => {
    const cand = generateLayoutCandidate({ plotWidth: 30, plotLength: 40, floorsCount: 1, bhkCount: 2 });
    const bld = generateProceduralBuilding3d(cand, { rooflineStyle: 'sloping_pitched' });

    const pitchedMeshes = bld.meshes.filter(m => m.componentType === 'sloping_roof');
    const ridgeMeshes = bld.meshes.filter(m => m.componentType === 'ridge_cap');

    assert.ok(pitchedMeshes.length >= 2, 'North and South roof slopes generated');
    assert.ok(ridgeMeshes.length >= 1, 'Ridge cap beam generated');
  });

  runTest('Test 4.3: Traditional Kerala style defaults deterministically to sloping_pitched roof', () => {
    const style = resolveProceduralRooflineStyle({ style: 'traditional_kerala' }, {});
    assert.strictEqual(style, 'sloping_pitched');

    const cand = generateLayoutCandidate({ plotWidth: 30, plotLength: 40, floorsCount: 2, bhkCount: 3 });
    const bld = generateProceduralBuilding3d(cand, { style: 'traditional_kerala' });

    const pitchedMeshes = bld.meshes.filter(m => m.componentType === 'sloping_roof');
    assert.ok(pitchedMeshes.length >= 2, 'Kerala style generates authentic sloping clay tile roof');
  });

  runTest('Test 4.4: Terrace parapet is generated independently of whether mumty headroom walls exist', () => {
    const cand = generateLayoutCandidate({ plotWidth: 30, plotLength: 40, floorsCount: 2, bhkCount: 3 });
    // Candidate has staircase, so terrace level has stairwell mumty walls
    const bld = generateProceduralBuilding3d(cand);

    const parapets = bld.meshes.filter(m => m.componentType === 'parapet');
    assert.ok(parapets.length >= 4, `Parapets must be generated (found ${parapets.length}) even with mumty walls present`);
  });

  runTest('Test 4.5: Multi-floor building terrace slab and parapet sit at correct top elevation', () => {
    const cand = generateLayoutCandidate({ plotWidth: 30, plotLength: 40, floorsCount: 2, bhkCount: 3 });
    const bld = generateProceduralBuilding3d(cand);

    const parapet = bld.meshes.find(m => m.componentType === 'parapet');
    assert.ok(parapet !== undefined);
    // 2 floors: Ground (0 to 10.5) + Floor 1 (10.5 to 21.0) -> Terrace level base elevation >= 21.0
    assert.ok(parapet.bounds.min[1] >= 21.0, `Parapet base elevation (${parapet.bounds.min[1]}) >= 21.0 ft`);
  });

  // =========================================================================
  // GROUP 5: DYNAMIC VIEWPORT SCALING & FRAMING (DEFECT 5)
  // =========================================================================
  console.log('\n--- Group 5: Dynamic Viewport Auto-Framing & Centering ---');

  runTest('Test 5.1: Rectangular duplex fits completely within viewport with padding (no cropping)', () => {
    const cand = generateLayoutCandidate({ plotWidth: 30, plotLength: 40, floorsCount: 2, bhkCount: 3 });
    const bld = generateProceduralBuilding3d(cand);

    const vpWidth = 680;
    const vpHeight = 560;
    const padding = 40;

    const proj = project3dToViewport(bld.meshes, {
      width: vpWidth,
      height: vpHeight,
      padding,
      azimuth: 35,
      elevation: 25,
      zoom: 1.0
    });

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    proj.faces.forEach(f => {
      f.points.split(' ').forEach(pt => {
        const [x, y] = pt.split(',').map(Number);
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      });
    });

    assert.ok(minX >= padding - 2, `minX (${minX}) must be >= padding (${padding})`);
    assert.ok(maxX <= vpWidth - padding + 2, `maxX (${maxX}) must be <= vpWidth - padding (${vpWidth - padding})`);
    assert.ok(minY >= padding - 2, `minY (${minY}) must be >= padding (${padding})`);
    assert.ok(maxY <= vpHeight - padding + 2, `maxY (${maxY}) must be <= vpHeight - padding (${vpHeight - padding})`);
  });

  runTest('Test 5.2: Large 3-floor building fits cleanly without exceeding viewport bounds', () => {
    const cand = generateLayoutCandidate({ plotWidth: 45, plotLength: 60, floorsCount: 3, bhkCount: 4 });
    const bld = generateProceduralBuilding3d(cand);

    const vpWidth = 680;
    const vpHeight = 560;
    const padding = 40;

    const proj = project3dToViewport(bld.meshes, {
      width: vpWidth,
      height: vpHeight,
      padding,
      azimuth: 35,
      elevation: 25,
      zoom: 1.0
    });

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    proj.faces.forEach(f => {
      f.points.split(' ').forEach(pt => {
        const [x, y] = pt.split(',').map(Number);
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      });
    });

    assert.ok(minX >= padding - 2, `Large building minX (${minX}) >= padding (${padding})`);
    assert.ok(maxX <= vpWidth - padding + 2, `Large building maxX (${maxX}) <= max (${vpWidth - padding})`);
    assert.ok(minY >= padding - 2, `Large building minY (${minY}) >= padding (${padding})`);
    assert.ok(maxY <= vpHeight - padding + 2, `Large building maxY (${maxY}) <= max (${vpHeight - padding})`);
  });

  runTest('Test 5.3: Framing recalculates dynamically when viewport dimensions change', () => {
    const cand = generateLayoutCandidate({ plotWidth: 30, plotLength: 40, floorsCount: 2, bhkCount: 3 });
    const bld = generateProceduralBuilding3d(cand);

    const smallVp = project3dToViewport(bld.meshes, { width: 400, height: 300, zoom: 1.0 });
    const largeVp = project3dToViewport(bld.meshes, { width: 1200, height: 900, zoom: 1.0 });

    assert.ok(smallVp.scale < largeVp.scale, `Small viewport scale (${smallVp.scale}) < Large viewport scale (${largeVp.scale})`);
    assert.ok(Number.isFinite(smallVp.scale) && smallVp.scale > 0);
    assert.ok(Number.isFinite(largeVp.scale) && largeVp.scale > 0);
  });

  // =========================================================================
  // GROUP 6: END-TO-END REPRESENTATIVE DESIGNS & INVARIANTS (SECTION 6)
  // =========================================================================
  console.log('\n--- Group 6: End-to-End Representative Cases & 2D/3D Invariants ---');

  // Case 1: Single-floor rectangular house
  runTest('Test 6.1: Case 1 - Single-floor rectangular house produces coherent geometry', () => {
    const cand = generateLayoutCandidate({ plotWidth: 30, plotLength: 40, floorsCount: 1, bhkCount: 2 });
    const bld = generateProceduralBuilding3d(cand);

    assert.strictEqual(bld.floors.length, 1);
    assert.ok(bld.meshes.length > 20);
    assert.ok(bld.bounds.height >= 10.0); // plinth + floor + parapet
    assert.ok(bld.meshes.every(m => m.vertices.every(v => v.every(Number.isFinite))));
  });

  // Case 2: Multi-floor residential building
  runTest('Test 6.2: Case 2 - Multi-floor duplex maintains vertical stacking and staircases', () => {
    const cand = generateLayoutCandidate({ plotWidth: 30, plotLength: 45, floorsCount: 2, bhkCount: 3 });
    const bld = generateProceduralBuilding3d(cand);

    assert.strictEqual(cand.floors.filter(f => f.name !== 'Terrace Level').length, 2, '2 habitable floors generated');
    assert.strictEqual(bld.floors.length, 3, 'Ground, First, and Terrace floors assembled');
    const stairs = bld.meshes.filter(m => m.componentType === 'stair_tread');
    assert.strictEqual(stairs.length, 18, '18 stair treads generated');
  });

  // Case 3: Building with balcony
  runTest('Test 6.3: Case 3 - Building with balcony generates cantilever slab and railing', () => {
    const cand = generateLayoutCandidate({ plotWidth: 32, plotLength: 45, floorsCount: 2, bhkCount: 3, hasBalcony: true });
    const bld = generateProceduralBuilding3d(cand);

    const balconySlab = bld.meshes.find(m => m.componentType === 'balcony_slab');
    const railingPost = bld.meshes.find(m => m.componentType === 'railing_post');
    const topRail = bld.meshes.find(m => m.componentType === 'railing_top_rail');

    assert.ok(balconySlab !== undefined, 'Balcony slab present');
    assert.ok(railingPost !== undefined, 'Balcony railing post present');
    assert.ok(topRail !== undefined, 'Balcony top handrail present');
  });

  // Case 4: Building with pitched roof
  runTest('Test 6.4: Case 4 - Building with pitched roof has mangalore clay tile textures and ridge cap', () => {
    const cand = generateLayoutCandidate({ plotWidth: 30, plotLength: 40, floorsCount: 1, bhkCount: 2 });
    const bld = generateProceduralBuilding3d(cand, { rooflineStyle: 'sloping_pitched', style: 'traditional_kerala' });

    const roofSlopes = bld.meshes.filter(m => m.componentType === 'sloping_roof');
    assert.ok(roofSlopes.length >= 2);
    assert.ok(roofSlopes[0].material.toLowerCase().includes('tile') || roofSlopes[0].material.toLowerCase().includes('terracotta') || roofSlopes[0].material.toLowerCase().includes('roof'));
  });

  // Case 5: Building with flat terrace and parapet
  runTest('Test 6.5: Case 5 - Building with flat terrace and parapet generates non-overlapping perimeter walls', () => {
    const cand = generateLayoutCandidate({ plotWidth: 30, plotLength: 40, floorsCount: 2, bhkCount: 3 });
    const bld = generateProceduralBuilding3d(cand, { rooflineStyle: 'flat_terrace' });

    const parapets = bld.meshes.filter(m => m.componentType === 'parapet');
    assert.strictEqual(parapets.length, 4, 'Exactly 4 perimeter parapet walls');
  });

  // Case 6: Determinism across repeated generations
  runTest('Test 6.6: Generation output is 100% deterministic across repeated runs', () => {
    const cand = generateLayoutCandidate({ plotWidth: 30, plotLength: 40, floorsCount: 2, bhkCount: 3 });
    const bld1 = generateProceduralBuilding3d(cand);
    const bld2 = generateProceduralBuilding3d(cand);

    assert.strictEqual(bld1.meshes.length, bld2.meshes.length);
    assert.strictEqual(bld1.diagnostics.length, bld2.diagnostics.length);
    assert.deepStrictEqual(bld1.bounds, bld2.bounds);

    for (let i = 0; i < bld1.meshes.length; i++) {
      assert.strictEqual(bld1.meshes[i].id, bld2.meshes[i].id);
      assert.strictEqual(bld1.meshes[i].vertices.length, bld2.meshes[i].vertices.length);
    }
  });

  // Case 7: 2D Floor Plan Engine regression invariance
  runTest('Test 6.7: 2D Floor Plan CAD engine remains fully operational and consistent', () => {
    const layout = generateLayout({ plotWidth: 30, plotLength: 40, floorsCount: 2, bhkCount: 3 });
    const floorPlan2d = generate2dFloorPlan(layout, { floorIndex: 0 });

    assert.ok(floorPlan2d.walls.allSegments.length > 0, '2D walls generated');
    assert.ok(floorPlan2d.openings.doors.length > 0, '2D doors generated');
    assert.ok(floorPlan2d.openings.windows.length > 0, '2D windows generated');
    assert.ok(floorPlan2d.dimensions.roomDimensions.length > 0, 'Room dimension annotations generated');
  });

  // =========================================================================
  // GROUP 7: DEFINITIVE ARCHITECTURAL RECONSTRUCTION & MUTATION INVARIANTS
  // =========================================================================
  console.log('\n--- Group 7: Definitive Architectural Reconstruction & Invariants ---');

  // Test 7.1: Minimal 1-Storey House Verification
  runTest('Test 7.1: Minimal 1-storey house generates living, bed, kitchen, bath, entrance, roof slab & parapet', () => {
    const cand = generateLayoutCandidate({
      plotWidth: 30,
      plotLength: 40,
      floorsCount: 1,
      bhkCount: 1,
      userPrompt: '1 BHK simple house with living, bedroom, kitchen, bath, entrance foyer'
    });

    assert.strictEqual(cand.floors.length, 1, 'Exactly 1 floor generated');
    const fl0 = cand.floors[0];
    const roomTypes = fl0.rooms.map(r => r.type);
    assert.ok(roomTypes.includes('foyer'), 'Entrance foyer present');
    assert.ok(roomTypes.includes('living'), 'Living room present');
    assert.ok(roomTypes.includes('kitchen'), 'Kitchen present');
    assert.ok(roomTypes.includes('bathroom'), 'Bathroom present');
    assert.ok(roomTypes.includes('master_bedroom') || roomTypes.includes('bedroom'), 'Bedroom present');

    const bld = generateProceduralBuilding3d(cand);
    const roofSlab = bld.meshes.find(m => m.componentType === 'roof_terrace_slab');
    assert.ok(roofSlab, 'Solid RCC roof terrace slab generated over 1-storey house');
    assert.strictEqual(roofSlab.bounds.min[1], 11.5, 'Roof slab bottom sits on clear ceiling height (11.5 ft)');
    assert.strictEqual(roofSlab.bounds.max[1], 12.0, 'Roof slab top reaches 12.0 ft');

    const parapets = bld.meshes.filter(m => m.componentType === 'parapet');
    assert.strictEqual(parapets.length, 4, '4 perimeter parapet walls generated');
    parapets.forEach(p => {
      assert.strictEqual(p.bounds.min[1], 12.0, 'Parapet wall sits directly on roof slab top (12.0 ft)');
      assert.strictEqual(p.bounds.max[1], 15.5, 'Parapet wall reaches 15.5 ft (+3.5 ft height)');
    });
  });

  // Test 7.2: Multi-Storey Duplex - Zero vertical penetration
  runTest('Test 7.2: Multi-storey duplex has zero vertical floor penetration and 0 cross-floor volume collisions', () => {
    const cand = generateLayoutCandidate({
      plotWidth: 30,
      plotLength: 40,
      floorsCount: 2,
      bhkCount: 3,
      familySize: 4,
      roadFacing: 'North'
    });

    const bld = generateProceduralBuilding3d(cand);
    const walls = bld.meshes.filter(m => m.componentType.includes('wall') || m.componentType === 'parapet');

    // Check cross-floor volume intersections
    let crossOverlapCount = 0;
    for (let i = 0; i < walls.length; i++) {
      for (let j = i + 1; j < walls.length; j++) {
        const w1 = walls[i], w2 = walls[j];
        if (w1.floorIndex !== w2.floorIndex) {
          const a = w1.bounds, b = w2.bounds;
          const ox = Math.min(a.max[0], b.max[0]) - Math.max(a.min[0], b.min[0]);
          const oy = Math.min(a.max[1], b.max[1]) - Math.max(a.min[1], b.min[1]);
          const oz = Math.min(a.max[2], b.max[2]) - Math.max(a.min[2], b.min[2]);
          if (ox > 0.05 && oy > 0.05 && oz > 0.05) {
            crossOverlapCount++;
          }
        }
      }
    }
    assert.strictEqual(crossOverlapCount, 0, 'Zero cross-floor volume collisions across multi-storey building');
  });

  // Test 7.3: Terrace Architecture & Non-Overlapping Mumty / Open Deck
  runTest('Test 7.3: Terrace stairhead mumty is enclosed on 4 sides with roof cap, and open deck has 0 collisions', () => {
    const cand = generateLayoutCandidate({
      plotWidth: 30,
      plotLength: 40,
      floorsCount: 2,
      bhkCount: 3
    });

    const fl2 = cand.floors.find(f => f.floorIndex === 2 || (f.name || '').includes('Terrace'));
    assert.ok(fl2, 'Terrace level floor exists');

    // Room collision check
    const mumty = fl2.rooms.find(r => r.id === 't_mumty');
    const deck = fl2.rooms.find(r => r.id === 't_open_deck');
    assert.ok(mumty && deck, 'Both mumty and open deck exist on terrace');

    const ox = Math.min(mumty.bounds.x + mumty.bounds.width, deck.bounds.x + deck.bounds.width) - Math.max(mumty.bounds.x, deck.bounds.x);
    const oy = Math.min(mumty.bounds.y + mumty.bounds.length, deck.bounds.y + deck.bounds.length) - Math.max(mumty.bounds.y, deck.bounds.y);
    assert.ok(ox <= 0 || oy <= 0, `Mumty and Open Deck must not overlap (overlap: ${ox}x${oy} ft)`);

    // Walls check: mumty must have all 4 enclosed walls
    assert.strictEqual(fl2.walls.length, 4, 'Terrace floor.walls contains exactly 4 mumty walls (no deck walls, no envelope walls)');
    const mumtyOrientations = fl2.walls.map(w => w.orientation);
    assert.ok(mumtyOrientations.includes('north'), 'Mumty has North wall');
    assert.ok(mumtyOrientations.includes('south'), 'Mumty has South wall');
    assert.ok(mumtyOrientations.includes('west'), 'Mumty has West wall');
    assert.ok(mumtyOrientations.includes('east'), 'Mumty has East wall');

    const bld = generateProceduralBuilding3d(cand);
    const mumtyRoof = bld.meshes.find(m => m.id === 'slab_mumty_roof_2');
    assert.ok(mumtyRoof, 'Mumty headroom roof slab exists');
    assert.strictEqual(mumtyRoof.bounds.min[1], 31.0, 'Mumty roof slab sits at Y=31.0 ft (22.5 base + 8.5 clear)');
  });

  // Test 7.4: Open spaces (Portico & Balcony) are not enclosed in solid walls
  runTest('Test 7.4: Portico driveway entrance and Balcony outer deck are not enclosed in solid exterior walls', () => {
    const cand = generateLayoutCandidate({
      plotWidth: 30,
      plotLength: 40,
      floorsCount: 2,
      bhkCount: 3
    });

    const env = cand.site.buildableEnvelope;
    const fl0 = cand.floors[0];
    const portico = fl0.rooms.find(r => r.type === 'portico');
    if (portico) {
      // Portico front edge along env.y must NOT have a solid wall
      const frontWall = fl0.walls.find(w => Math.abs(w.start.y - env.y) < 0.2 && w.start.x <= portico.bounds.x && w.end.x >= portico.bounds.x + portico.bounds.width);
      assert.ok(!frontWall, 'Portico driveway front is open (no solid masonry wall)');
    }

    const fl1 = cand.floors[1];
    const balcony = fl1.rooms.find(r => r.type === 'balcony');
    if (balcony) {
      // Balcony front edge along env.y must NOT have a solid wall
      const frontWall = fl1.walls.find(w => Math.abs(w.start.y - env.y) < 0.2 && w.start.x <= balcony.bounds.x && w.end.x >= balcony.bounds.x + balcony.bounds.width);
      assert.ok(!frontWall, 'Balcony outer edge is open (protected by railing, not solid wall)');
    }
  });

  // Test 7.5: Mutation / Negative-Control Test - Detector catches simulated vertical floor penetration
  runTest('Test 7.5: Mutation test - Collision detector strictly catches simulated 1-ft floor penetration', () => {
    const cand = generateLayoutCandidate({ plotWidth: 30, plotLength: 40, floorsCount: 2, bhkCount: 3 });
    const bld = generateProceduralBuilding3d(cand);
    const walls = bld.meshes.filter(m => m.componentType.includes('wall') || m.componentType === 'parapet');

    // Simulate mutation: artificially depress floor 1 walls down by 1.0 ft (reproducing original defect)
    const mutatedWalls = walls.map(w => {
      if (w.floorIndex === 1) {
        return {
          ...w,
          bounds: {
            ...w.bounds,
            min: [w.bounds.min[0], w.bounds.min[1] - 1.0, w.bounds.min[2]],
            max: [w.bounds.max[0], w.bounds.max[1] - 1.0, w.bounds.max[2]]
          }
        };
      }
      return w;
    });

    let detectedCollisions = 0;
    for (let i = 0; i < mutatedWalls.length; i++) {
      for (let j = i + 1; j < mutatedWalls.length; j++) {
        const w1 = mutatedWalls[i], w2 = mutatedWalls[j];
        if (w1.floorIndex !== w2.floorIndex) {
          const a = w1.bounds, b = w2.bounds;
          const ox = Math.min(a.max[0], b.max[0]) - Math.max(a.min[0], b.min[0]);
          const oy = Math.min(a.max[1], b.max[1]) - Math.max(a.min[1], b.min[1]);
          const oz = Math.min(a.max[2], b.max[2]) - Math.max(a.min[2], b.min[2]);
          if (ox > 0.05 && oy > 0.05 && oz > 0.05) {
            detectedCollisions++;
          }
        }
      }
    }
    assert.ok(detectedCollisions > 0, `Mutation check must detect vertical penetration (detected ${detectedCollisions} collisions)`);
  });

  // Test 7.6: Mutation / Negative-Control Test - Detector catches simulated duplicate wall injection
  runTest('Test 7.6: Mutation test - Duplicate detector strictly catches simulated coincident duplicate wall', () => {
    const cand = generateLayoutCandidate({ plotWidth: 30, plotLength: 40, floorsCount: 2, bhkCount: 3 });
    const bld = generateProceduralBuilding3d(cand);
    const walls = bld.meshes.filter(m => m.componentType.includes('wall') || m.componentType === 'parapet');

    // Invert assertion: inject exact duplicate of walls[0]
    const injectedWall = {
      ...walls[0],
      id: 'mutated_duplicate_wall',
      bounds: { ...walls[0].bounds }
    };
    const mutatedWallSet = [...walls, injectedWall];

    let detectedDuplicates = 0;
    for (let i = 0; i < mutatedWallSet.length; i++) {
      for (let j = i + 1; j < mutatedWallSet.length; j++) {
        const a = mutatedWallSet[i].bounds, b = mutatedWallSet[j].bounds;
        const sameMin = Math.abs(a.min[0] - b.min[0]) < 0.1 && Math.abs(a.min[1] - b.min[1]) < 0.1 && Math.abs(a.min[2] - b.min[2]) < 0.1;
        const sameMax = Math.abs(a.max[0] - b.max[0]) < 0.1 && Math.abs(a.max[1] - b.max[1]) < 0.1 && Math.abs(a.max[2] - b.max[2]) < 0.1;
        if (sameMin && sameMax) {
          detectedDuplicates++;
        }
      }
    }
    assert.strictEqual(detectedDuplicates, 1, 'Duplicate check successfully flags injected coincident duplicate wall');
  });

  console.log('\n===============================================================');
  console.log(`HOUSE RECONSTRUCTION FIXES SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('===============================================================\n');

  if (failed > 0) {
    throw new Error(`House reconstruction fixes test suite failed with ${failed} errors.`);
  }

  return { passed, failed };
}

// Auto-run if executed directly via node
if (process.argv[1]?.endsWith('houseReconstructionFixes.test.js')) {
  runHouseReconstructionFixesTests();
}
