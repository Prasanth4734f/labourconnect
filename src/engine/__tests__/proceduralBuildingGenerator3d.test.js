/**
 * LabourConnect Design Engine - Procedural 3D Building Generator Test Suite (S3-T02)
 * 
 * Verifies enterprise-grade procedural 3D building generation:
 * - Section 1: Solid 3D Box & Prism Mesh Primitives (vertices, quad faces, normals)
 * - Section 2: Procedural Wall Extrusion & Thickness Contracts (exterior 0.75ft, interior 0.375ft)
 * - Section 3: Real Door Openings (true through-wall cutouts, lintel headers, door leaves)
 * - Section 4: Real Window Openings (sub-sill aprons, lintel headers, UPVC frames, glass panes)
 * - Section 5: Multi-Floor Slabs & Stairwell Shaft Cutout Voids
 * - Section 6: 3D Staircases (individual treads, risers, landing platform)
 * - Section 7: Balconies, Railings, Structural Columns & Parapets
 * - Section 8: Canonical Model Integration, Diagnostics & Determinism
 */

import assert from 'assert';
import {
  generateProceduralBuilding3d,
  createSolidBoxMesh,
  createOrientedWallPrism,
  generateWallWithRealOpenings,
  generateFloorSlabWithCutouts,
  generateProceduralStaircase3d,
  generateBalcony3d,
  generateStructuralColumns3d
} from '../geometry/proceduralBuildingGenerator3d.js';
import { generateLayoutCandidate } from '../generator/layoutGenerator.js';
import { COORDINATE_SYSTEM_CONTRACT } from '../geometry/geometryFoundation3d.js';

export function runProceduralBuildingGenerator3dTests() {
  console.log('\n===============================================================');
  console.log('LABOURCONNECT 3D ENGINE: PROCEDURAL BUILDING GENERATOR (S3-T02)');
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

  // --- Section 1: Solid 3D Box & Prism Mesh Primitives ---
  console.log('\n--- Section 1: Solid 3D Box & Prism Mesh Primitives ---');

  runTest('Test 1.1: createSolidBoxMesh generates 8 distinct 3D vertices', () => {
    const box = createSolidBoxMesh('test_box_1', 'test', {
      minX: 0, minY: 1.5, minZ: 0,
      maxX: 10, maxY: 11.5, maxZ: 15
    });
    assert.strictEqual(box.vertices.length, 8);
    assert.deepStrictEqual(box.vertices[0], [0, 1.5, 0]);
    assert.deepStrictEqual(box.vertices[6], [10, 11.5, 15]);
  });

  runTest('Test 1.2: createSolidBoxMesh generates 6 quad faces with outward unit normals', () => {
    const box = createSolidBoxMesh('test_box_2', 'test', {
      minX: 0, minY: 0, minZ: 0,
      maxX: 5, maxY: 10, maxZ: 8
    });
    assert.strictEqual(box.faces.length, 6);
    // Top face normal should point +Y [0, 1, 0]
    const topFace = box.faces.find(f => f.name === 'top');
    assert.deepStrictEqual(topFace.normal, [0, 1, 0]);
    // Front face normal should point -Z [0, 0, -1]
    const frontFace = box.faces.find(f => f.name === 'front');
    assert.deepStrictEqual(frontFace.normal, [0, 0, -1]);
  });

  runTest('Test 1.3: createOrientedWallPrism preserves wall length, thickness, and elevation', () => {
    const prism = createOrientedWallPrism(
      'wall_p1',
      'wall_solid',
      { x: 5, y: 10 },
      { x: 25, y: 10 }, // 20 ft run along X
      0.75,             // 9-inch exterior thickness
      1.5,              // Elevation Y
      10.0              // Clear height
    );
    assert.strictEqual(prism.dimensions.length, 20);
    assert.strictEqual(prism.dimensions.thickness, 0.75);
    assert.strictEqual(prism.dimensions.height, 10.0);
    assert.strictEqual(prism.bounds.min[1], 1.5);
    assert.strictEqual(prism.bounds.max[1], 11.5);
  });

  // --- Section 2: Procedural Wall Extrusion & Thickness ---
  console.log('\n--- Section 2: Procedural Wall Extrusion & Thickness ---');

  runTest('Test 2.1: Continuous wall without openings produces single solid prism', () => {
    const wall = {
      id: 'w_solid_1',
      type: 'exterior',
      start: { x: 0, y: 0 },
      end: { x: 30, y: 0 },
      thickness: 0.75,
      height: 10.0
    };
    const { solidBlocks, openingComponents } = generateWallWithRealOpenings(
      wall,
      [],
      { floorIndex: 0, elevationY: 1.5, clearHeight: 10.0, isTerrace: false }
    );
    assert.strictEqual(solidBlocks.length, 1);
    assert.strictEqual(openingComponents.length, 0);
    assert.strictEqual(solidBlocks[0].dimensions.thickness, 0.75);
    assert.strictEqual(solidBlocks[0].dimensions.length, 30);
  });

  runTest('Test 2.2: Interior partition wall defaults to 0.375 ft (4.5 inches)', () => {
    const wall = {
      id: 'w_int_1',
      type: 'interior',
      start: { x: 10, y: 5 },
      end: { x: 10, y: 25 }
    };
    const { solidBlocks } = generateWallWithRealOpenings(
      wall,
      [],
      { floorIndex: 0, elevationY: 1.5, clearHeight: 10.0, isTerrace: false }
    );
    assert.strictEqual(solidBlocks[0].dimensions.thickness, 0.375);
  });

  // --- Section 3: Real Door Openings ---
  console.log('\n--- Section 3: Real Door Openings ---');

  runTest('Test 3.1: Door segments wall into pre-jamb, post-jamb, and header block', () => {
    const wall = {
      id: 'w_door_test',
      type: 'interior',
      start: { x: 0, y: 0 },
      end: { x: 20, y: 0 } // 20 ft wall
    };
    // Door centered at x = 10, width = 3.0 ft
    const door = {
      id: 'door_main',
      type: 'door',
      position: { x: 10, y: 0 },
      width: 3.0,
      wallId: 'w_door_test'
    };
    const { solidBlocks, openingComponents } = generateWallWithRealOpenings(
      wall,
      [door],
      { floorIndex: 0, elevationY: 1.5, clearHeight: 10.0, isTerrace: false }
    );

    // Should have 3 wall solid blocks:
    // 1. Left jamb (0 to 8.5 ft, full height 10.0)
    // 2. Lintel header block (8.5 to 11.5 ft, from 1.5 + 7.0 = 8.5 to 11.5 ft elevation)
    // 3. Right jamb (11.5 to 20 ft, full height 10.0)
    assert.strictEqual(solidBlocks.length, 3);
    const jamb1 = solidBlocks.find(b => b.type === 'wall_jamb');
    const header = solidBlocks.find(b => b.type === 'wall_header');
    assert(jamb1 !== undefined, 'Jamb block present');
    assert(header !== undefined, 'Header block present');
    assert.strictEqual(header.bounds.min[1], 1.5 + 7.0); // Sits at door lintel

    // Opening component includes door leaf
    assert.strictEqual(openingComponents.length, 1);
    assert.strictEqual(openingComponents[0].componentType, 'door_leaf');
  });

  runTest('Test 3.2: Door opening void has zero wall geometry from floor to 7ft lintel', () => {
    const wall = {
      id: 'w_void_check',
      type: 'exterior',
      start: { x: 0, y: 0 },
      end: { x: 20, y: 0 }
    };
    const door = {
      id: 'door_entry',
      type: 'door',
      position: { x: 10, y: 0 },
      width: 3.0,
      wallId: 'w_void_check'
    };
    const { solidBlocks } = generateWallWithRealOpenings(
      wall,
      [door],
      { floorIndex: 0, elevationY: 1.5, clearHeight: 10.0, isTerrace: false }
    );

    // Verify no wall solid block occupies the center void (x = 10, y = 4.0, z = 0)
    const blocksInVoid = solidBlocks.filter(b => {
      const minX = b.bounds.min[0];
      const maxX = b.bounds.max[0];
      const minY = b.bounds.min[1];
      const maxY = b.bounds.max[1];
      return 10 > minX && 10 < maxX && 4.0 > minY && 4.0 < maxY;
    });
    assert.strictEqual(blocksInVoid.length, 0, 'No solid wall geometry inside door void');
  });

  // --- Section 4: Real Window Openings ---
  console.log('\n--- Section 4: Real Window Openings ---');

  runTest('Test 4.1: Window segments wall into jambs, sub-sill apron, and lintel header', () => {
    const wall = {
      id: 'w_win_test',
      type: 'exterior',
      start: { x: 0, y: 0 },
      end: { x: 20, y: 0 }
    };
    const window = {
      id: 'win_1',
      type: 'window',
      position: { x: 10, y: 0 },
      width: 4.0,
      wallId: 'w_win_test'
    };
    const { solidBlocks, openingComponents } = generateWallWithRealOpenings(
      wall,
      [window],
      { floorIndex: 0, elevationY: 1.5, clearHeight: 10.0, isTerrace: false }
    );

    // 4 solid wall blocks: Left jamb, Sub-sill apron, Lintel header, Right jamb
    assert.strictEqual(solidBlocks.length, 4);
    const apron = solidBlocks.find(b => b.type === 'wall_apron');
    const header = solidBlocks.find(b => b.type === 'wall_header');
    assert(apron !== undefined, 'Sub-sill apron present');
    assert(header !== undefined, 'Lintel header present');

    // Apron elevation: from 1.5 to 1.5 + 2.5 = 4.0 ft
    assert.strictEqual(apron.bounds.min[1], 1.5);
    assert.strictEqual(apron.bounds.max[1], 4.0);

    // Lintel header elevation: from 1.5 + 7.0 = 8.5 to 11.5 ft
    assert.strictEqual(header.bounds.min[1], 8.5);
    assert.strictEqual(header.bounds.max[1], 11.5);

    // Opening components: UPVC frame and acoustic glass pane
    assert.strictEqual(openingComponents.length, 2);
    const frame = openingComponents.find(c => c.componentType === 'window_frame');
    const glass = openingComponents.find(c => c.componentType === 'window_pane');
    assert(frame !== undefined, 'Window frame present');
    assert(glass !== undefined, 'Acoustic glass pane present');
    assert.strictEqual(glass.opacity, 0.45);
  });

  runTest('Test 4.2: Window void has zero wall geometry between sill (2.5ft) and lintel (7.0ft)', () => {
    const wall = {
      id: 'w_win_void',
      type: 'exterior',
      start: { x: 0, y: 0 },
      end: { x: 20, y: 0 }
    };
    const window = {
      id: 'win_2',
      type: 'window',
      position: { x: 10, y: 0 },
      width: 4.0,
      wallId: 'w_win_void'
    };
    const { solidBlocks } = generateWallWithRealOpenings(
      wall,
      [window],
      { floorIndex: 0, elevationY: 1.5, clearHeight: 10.0, isTerrace: false }
    );

    // Check at x = 10, y = 5.0 (inside window opening)
    const blocksInWindowVoid = solidBlocks.filter(b => {
      const minX = b.bounds.min[0];
      const maxX = b.bounds.max[0];
      const minY = b.bounds.min[1];
      const maxY = b.bounds.max[1];
      return 10 > minX && 10 < maxX && 5.0 > minY && 5.0 < maxY;
    });
    assert.strictEqual(blocksInWindowVoid.length, 0, 'No solid wall geometry inside window void');
  });

  runTest('Test 4.3: Multiple openings on single wall partition into multiple solid sub-blocks', () => {
    const wall = {
      id: 'w_multi_openings',
      type: 'exterior',
      start: { x: 0, y: 0 },
      end: { x: 30, y: 0 } // 30 ft wall
    };
    const winA = { id: 'w1', type: 'window', position: { x: 6, y: 0 }, width: 4.0, wallId: 'w_multi_openings' };
    const winB = { id: 'w2', type: 'window', position: { x: 22, y: 0 }, width: 4.0, wallId: 'w_multi_openings' };

    const { solidBlocks, openingComponents } = generateWallWithRealOpenings(
      wall,
      [winA, winB],
      { floorIndex: 0, elevationY: 1.5, clearHeight: 10.0, isTerrace: false }
    );

    // 2 windows -> 2 aprons + 2 headers + 3 jambs = 7 solid wall blocks
    assert.strictEqual(solidBlocks.length, 7);
    assert.strictEqual(openingComponents.length, 4); // 2 frames + 2 glass panes
  });

  runTest('Test 4.4: Overlapping openings emit warning diagnostic and skip collision', () => {
    const wall = {
      id: 'w_collision',
      type: 'exterior',
      start: { x: 0, y: 0 },
      end: { x: 20, y: 0 }
    };
    // Two doors occupying the same spot
    const doorA = { id: 'dA', type: 'door', position: { x: 10, y: 0 }, width: 3.5, wallId: 'w_collision' };
    const doorB = { id: 'dB', type: 'door', position: { x: 11, y: 0 }, width: 3.5, wallId: 'w_collision' };
    const diags = [];

    const { openingComponents } = generateWallWithRealOpenings(
      wall,
      [doorA, doorB],
      { floorIndex: 0, elevationY: 1.5, clearHeight: 10.0, isTerrace: false },
      diags
    );

    assert.strictEqual(openingComponents.length, 1, 'Only non-overlapping door accepted');
    assert(diags.length > 0, 'Collision diagnostic emitted');
    assert.strictEqual(diags[0].severity, 'WARNING');
  });

  runTest('Test 4.5: Near-zero length wall emits warning and is safely skipped', () => {
    const wall = {
      id: 'w_degenerate',
      type: 'interior',
      start: { x: 5, y: 5 },
      end: { x: 5.05, y: 5.05 } // 0.07 ft length
    };
    const diags = [];
    const { solidBlocks } = generateWallWithRealOpenings(
      wall,
      [],
      { floorIndex: 0, elevationY: 1.5, clearHeight: 10.0, isTerrace: false },
      diags
    );
    assert.strictEqual(solidBlocks.length, 0);
    assert(diags.length > 0);
    assert.strictEqual(diags[0].status, 'SKIPPED');
  });

  // --- Section 5: Multi-Floor Slabs & Stairwell Shaft Cutout Voids ---
  console.log('\n--- Section 5: Multi-Floor Slabs & Stairwell Shaft Cutout Voids ---');

  runTest('Test 5.1: Intermediate slab partitions around stairwell to create open shaft void', () => {
    const envelope = { x: 0, y: 0, width: 30, length: 40 };
    const stairCutout = { x: 10, y: 15, width: 7, length: 12 };
    const slabs = generateFloorSlabWithCutouts(
      'slab_fl1',
      'intermediate_rcc_slab',
      envelope,
      11.5, // Slab elevation
      0.5,  // Thickness
      stairCutout
    );

    // Slabs should be partitioned into 4 outer boundary strips
    assert.strictEqual(slabs.length, 4);

    // Verify center of stairwell (x=13.5, y=11.75, z=21) contains NO slab solid
    const slabInStairwell = slabs.filter(s => {
      const b = s.bounds;
      return 13.5 >= b.min[0] && 13.5 <= b.max[0] && 21 >= b.min[2] && 21 <= b.max[2];
    });
    assert.strictEqual(slabInStairwell.length, 0, 'Stairwell shaft void is open through floor slab');
  });

  runTest('Test 5.2: Monolithic slab generated when no stairwell void exists', () => {
    const envelope = { x: 0, y: 0, width: 25, length: 35 };
    const slabs = generateFloorSlabWithCutouts(
      'slab_terrace',
      'roof_terrace_slab',
      envelope,
      22.0,
      0.5,
      null
    );
    assert.strictEqual(slabs.length, 1);
    assert.strictEqual(slabs[0].dimensions.width, 25);
    assert.strictEqual(slabs[0].dimensions.depth, 35);
  });

  // --- Section 6: 3D Staircases ---
  console.log('\n--- Section 6: 3D Staircases ---');

  runTest('Test 6.1: Generates 18 step treads and mid-landing platform', () => {
    const stairRoom = {
      id: 'stairwell_rm',
      type: 'stairwell',
      bounds: { x: 5, y: 10, width: 7.5, length: 14 }
    };
    const steps = generateProceduralStaircase3d(stairRoom, 1.5, 10.5);

    // 18 step treads + 1 mid-landing platform = 19 elements
    assert.strictEqual(steps.length, 19);
    const landing = steps.find(s => s.componentType === 'stair_landing');
    assert(landing !== undefined, 'Mid-landing platform generated');

    // Step 1 sits at plinth elevation 1.5 ft
    assert.strictEqual(steps[0].bounds.min[1], 1.5);

    // Final step reaches floor 1 level (1.5 + 10.5 - riserHeight)
    const finalStep = steps[steps.length - 1];
    assert(finalStep.bounds.min[1] > 11.0, 'Final step reaches upper floor');
  });

  // --- Section 7: Balconies, Railings, Structural Columns & Parapets ---
  console.log('\n--- Section 7: Balconies, Railings, Structural Columns & Parapets ---');

  runTest('Test 7.1: Balcony generates cantilever slab and perimeter post/railings', () => {
    const balconyRoom = {
      id: 'balcony_upper',
      type: 'balcony',
      bounds: { x: 5, y: 5, width: 12, length: 4.5 }
    };
    const components = generateBalcony3d(balconyRoom, 12.0);

    const slab = components.find(c => c.componentType === 'balcony_slab');
    const posts = components.filter(c => c.componentType === 'railing_post');
    const handrail = components.find(c => c.componentType === 'railing_top_rail');

    assert(slab !== undefined, 'Balcony cantilever slab generated');
    assert(posts.length >= 3, `Railing posts generated (got ${posts.length})`);
    assert(handrail !== undefined, 'Continuous handrail generated');
    assert.strictEqual(handrail.bounds.max[1], 12.0 + 0.5 + 3.5); // FFL + slab + 3.5ft rail
  });

  runTest('Test 7.2: Structural columns span ground to roof', () => {
    const grid = {
      columns: [
        { id: 'c1', x: 5, y: 5, width: 0.75, length: 1.0 },
        { id: 'c2', x: 20, y: 5, width: 0.75, length: 1.0 }
      ]
    };
    const columns = generateStructuralColumns3d(grid, 25.5);
    assert.strictEqual(columns.length, 2);
    assert.strictEqual(columns[0].bounds.min[1], 0);
    assert.strictEqual(columns[0].bounds.max[1], 25.5);
  });

  // --- Section 8: Canonical Model Integration, Diagnostics & Determinism ---
  console.log('\n--- Section 8: Canonical Model Integration, Diagnostics & Determinism ---');

  runTest('Test 8.1: Compact 1-Floor canonical design generates full 3D building model', () => {
    const cand = generateLayoutCandidate({
      plotWidth: 30,
      plotLength: 40,
      floorsCount: 1,
      bhkCount: 2
    });
    const model = generateProceduralBuilding3d(cand);

    assert(model !== null && typeof model === 'object');
    assert(model.meshes.length > 10, `Generated ${model.meshes.length} 3D meshes`);
    assert.strictEqual(model.floors.length, 1);
    assert.strictEqual(model.stats.totalFloors, 1);
    assert(model.bounds.width > 20, `Model width ${model.bounds.width} ft`);
    assert(model.bounds.height > 10, `Model height ${model.bounds.height} ft`);
    assert.strictEqual(model.units, 'feet');
    assert.strictEqual(model.coordinateSystem, COORDINATE_SYSTEM_CONTRACT.CONVENTION);
  });

  runTest('Test 8.2: Duplex 2-Floor design generates multi-floor assembly with staircase', () => {
    const cand = generateLayoutCandidate({
      plotWidth: 35,
      plotLength: 50,
      floorsCount: 2,
      bhkCount: 3,
      hasBalcony: true
    });
    const model = generateProceduralBuilding3d(cand);

    assert.strictEqual(model.floors.length, cand.floors.length);
    assert.strictEqual(model.stats.hasStaircase, true);
    assert.strictEqual(model.stats.hasPlinth, true);
    assert(model.bounds.height >= 22.0, `Total duplex height (${model.bounds.height} ft) >= 22.0 ft`);
    assert(model.stats.totalVertices > 100, `Total 3D vertices: ${model.stats.totalVertices}`);
    assert(model.stats.totalFaces > 50, `Total 3D faces: ${model.stats.totalFaces}`);
  });

  runTest('Test 8.3: Determinism - Repeated generation from same candidate produces identical geometry', () => {
    const cand = generateLayoutCandidate({ plotWidth: 30, plotLength: 40, floorsCount: 2, bhkCount: 2 });
    const modelA = generateProceduralBuilding3d(cand);
    const modelB = generateProceduralBuilding3d(cand);

    assert.strictEqual(modelA.meshes.length, modelB.meshes.length);
    assert.strictEqual(modelA.bounds.width, modelB.bounds.width);
    assert.strictEqual(modelA.bounds.height, modelB.bounds.height);
    assert.strictEqual(modelA.bounds.depth, modelB.bounds.depth);
    assert.strictEqual(modelA.stats.totalVertices, modelB.stats.totalVertices);
  });

  runTest('Test 8.4: Invalid canonical design throws TypeError cleanly', () => {
    let threw = false;
    try {
      generateProceduralBuilding3d(null);
    } catch (e) {
      threw = e instanceof TypeError;
    }
    assert(threw, 'Rejects null input with TypeError');
  });

  runTest('Test 8.5: Performance Benchmark - Duplex 3D model generated in < 25ms', () => {
    const cand = generateLayoutCandidate({ plotWidth: 30, plotLength: 45, floorsCount: 2, bhkCount: 3 });
    const start = performance.now();
    const model = generateProceduralBuilding3d(cand);
    const duration = performance.now() - start;

    assert(model.meshes.length > 15);
    assert(duration < 25, `Execution duration ${duration.toFixed(2)}ms (<25ms budget)`);
    console.log(`       Benchmark: Generated ${model.meshes.length} 3D meshes (${model.stats.totalVertices} vertices, ${model.stats.totalFaces} faces) in ${duration.toFixed(2)}ms`);
  });

  console.log('\n===============================================================');
  console.log(`S3-T02 PROCEDURAL 3D BUILDING TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('===============================================================');

  if (failed > 0) {
    throw new Error(`S3-T02 Test Suite failed with ${failed} failures.`);
  }

  return { passed, failed };
}

// Auto-run if executed directly
if (process.argv[1]?.endsWith('proceduralBuildingGenerator3d.test.js')) {
  runProceduralBuildingGenerator3dTests();
}
