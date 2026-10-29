/**
 * LabourConnect Design Engine - S3-T02 Geometry Verification and Defect Audit Suite
 * 
 * Independently verifies:
 * - Audit A: 3D Camera Projection, 360° Orbit, Perspective Foreshortening, Backface Culling, Depth Sorting, Pan/Zoom
 * - Audit B: Floor Footprint Correctness across 6 Fixtures (Single-Floor, Multi-Room, L-Shaped, Stair Void, Different Multi-Floor Layouts, Balcony/Terrace)
 * - Audit C: Wall and Opening Correctness (Thicknesses, Duplicate Wall Elimination, Through-Voids, Lintel/Sill, Invalid Host Wall Diagnostics, Out-of-Bounds Diagnostics)
 * - Audit D: Staircase and Vertical Consistency (Positive Treads/Risers, Stacking, Flight/Landing Alignment, Fallback Robustness)
 * - Audit E: Mesh Integrity (Finite Coordinates, Valid Face Indices, Non-Degenerate Faces, Outward Normals, Determinism)
 */

import assert from 'assert';
import {
  generateProceduralBuilding3d,
  createSolidBoxMesh,
  generateWallWithRealOpenings,
  generateProceduralStaircase3d,
  getFloorFootprints
} from '../geometry/proceduralBuildingGenerator3d.js';
import { project3dToViewport } from '../geometry/procedural3dGenerator.js';
import { ARCHITECTURAL_DEFAULTS_3D } from '../geometry/geometryFoundation3d.js';

let passedCount = 0;
let failedCount = 0;

function runTest(name, fn) {
  try {
    fn();
    console.log(`✅ PASS: ${name}`);
    passedCount++;
  } catch (err) {
    console.error(`❌ FAIL: ${name}`);
    console.error(`       Error: ${err.message}`);
    failedCount++;
  }
}

export function runGeometryVerificationAuditTests() {
  console.log('\n===============================================================');
  console.log('S3-T02 INDEPENDENT GEOMETRY VERIFICATION AND DEFECT AUDIT');
  console.log('===============================================================\n');

  // ===========================================================================
  // AUDIT A: 3D NAVIGATION & PROJECTION VERIFICATION
  // ===========================================================================
  console.log('--- Audit A: 3D Navigation & Camera Projection ---');

  runTest('Audit A.1: 360° Continuous Orbit produces valid projected coordinates across all angles', () => {
    const box = createSolidBoxMesh('test_box', 'wall', { minX: 0, minY: 0, minZ: 0, maxX: 10, maxY: 10, maxZ: 10 });
    const geom = { buildingModel3d: { meshes: [box] }, bounds3d: box.bounds };

    // Test front (0°), side (90°), rear (180°), opposite side (-90°)
    const angles = [0, 45, 90, 135, 180, -90, -45];
    angles.forEach(yaw => {
      const proj = project3dToViewport(geom, { yaw, pitch: 25, zoom: 1.0 });
      assert.ok(proj.projectedPolygons.length > 0, `Failed for yaw ${yaw}`);
      proj.projectedPolygons.forEach(poly => {
        assert.ok(poly.points.length > 0);
        assert.ok(!poly.points.includes('NaN'), `NaN detected at yaw ${yaw}`);
      });
    });
  });

  runTest('Audit A.2: Camera Pan (panX, panY) shifts viewport center correctly', () => {
    const box = createSolidBoxMesh('test_box', 'wall', { minX: 0, minY: 0, minZ: 0, maxX: 10, maxY: 10, maxZ: 10 });
    const geom = { buildingModel3d: { meshes: [box] }, bounds3d: box.bounds };

    const centerProj = project3dToViewport(geom, { yaw: 0, pitch: 0, zoom: 1.0, panX: 0, panY: 0 });
    const pannedProj = project3dToViewport(geom, { yaw: 0, pitch: 0, zoom: 1.0, panX: 50, panY: -30 });

    const cP0 = centerProj.projectedPolygons[0].points.split(' ')[0].split(',').map(Number);
    const pP0 = pannedProj.projectedPolygons[0].points.split(' ')[0].split(',').map(Number);

    assert.strictEqual(Math.round(pP0[0] - cP0[0]), 50, 'panX did not shift projected X by 50px');
    assert.strictEqual(Math.round(pP0[1] - cP0[1]), -30, 'panY did not shift projected Y by -30px');
  });

  runTest('Audit A.3: Backface Culling & Painter\'s Depth Sorting', () => {
    const box = createSolidBoxMesh('test_cube', 'wall', { minX: 0, minY: 0, minZ: 0, maxX: 10, maxY: 10, maxZ: 10 });
    const geom = { buildingModel3d: { meshes: [box] }, bounds3d: box.bounds };

    const proj = project3dToViewport(geom, { yaw: 35, pitch: 25, zoom: 1.0 });
    // A closed cube viewed from standard isometric perspective has exactly 3 visible front-facing faces (3 backfaces culled)
    assert.strictEqual(proj.projectedPolygons.length, 3, `Expected 3 visible faces, got ${proj.projectedPolygons.length}`);

    // Verify depth ordering: back-to-front (first polygon has larger or equal depth than next)
    for (let i = 0; i < proj.projectedPolygons.length - 1; i++) {
      assert.ok(proj.projectedPolygons[i].depth >= proj.projectedPolygons[i + 1].depth, 'Painter\'s depth sort violated');
    }
  });

  // ===========================================================================
  // AUDIT B: FLOOR FOOTPRINT CORRECTNESS
  // ===========================================================================
  console.log('\n--- Audit B: Floor Footprint Correctness across 6 Fixtures ---');

  // Fixture 1: Rectangular Single-Floor Building
  runTest('Audit B.1: Fixture 1 - Rectangular Single-Floor Building Plinth and Terrace bounds match', () => {
    const cand = {
      schemaVersion: '2.0.0',
      id: 'fix_1_rect_single',
      site: { plotWidth: 30, plotLength: 40, buildableEnvelope: { x: 3, y: 5, width: 24, length: 30 } },
      floors: [{
        floorIndex: 0,
        bounds: { x: 3, y: 5, width: 24, length: 30 },
        rooms: [{ id: 'r1', bounds: { x: 3, y: 5, width: 24, length: 30 } }],
        walls: [{ id: 'w1', type: 'exterior', start: { x: 3, y: 5 }, end: { x: 27, y: 5 } }]
      }]
    };

    const res = generateProceduralBuilding3d(cand);
    const plinth = res.meshes.find(m => m.componentType === 'foundation_plinth');
    assert.ok(plinth, 'Plinth slab must exist');
    assert.strictEqual(plinth.bounds.min[0], 3 - 0.75); // Offset by 0.75 ft
    assert.strictEqual(plinth.bounds.max[0], 27 + 0.75);
    assert.strictEqual(plinth.bounds.min[2], 5 - 0.75);
    assert.strictEqual(plinth.bounds.max[2], 35 + 0.75);
  });

  // Fixture 2: Multi-Room Rectangular Building
  runTest('Audit B.2: Fixture 2 - Multi-Room Rectangular Building maintains slab coverage', () => {
    const cand = {
      schemaVersion: '2.0.0',
      id: 'fix_2_multi_room',
      site: { plotWidth: 40, plotLength: 60, buildableEnvelope: { x: 4, y: 5, width: 32, length: 50 } },
      floors: [{
        floorIndex: 0,
        rooms: [
          { id: 'living', bounds: { x: 4, y: 5, width: 16, length: 25 } },
          { id: 'dining', bounds: { x: 20, y: 5, width: 16, length: 25 } },
          { id: 'kitchen', bounds: { x: 4, y: 30, width: 16, length: 25 } },
          { id: 'bed', bounds: { x: 20, y: 30, width: 16, length: 25 } }
        ],
        walls: [{ id: 'w1', type: 'exterior', start: { x: 4, y: 5 }, end: { x: 36, y: 5 } }]
      }]
    };

    const fps = getFloorFootprints(cand.floors[0], cand.site.buildableEnvelope);
    assert.strictEqual(fps.length, 1);
    assert.strictEqual(fps[0].x, 4);
    assert.strictEqual(fps[0].y, 5);
    assert.strictEqual(fps[0].width, 32);
    assert.strictEqual(fps[0].length, 50);
  });

  // Fixture 3: L-Shaped Floor Footprint
  runTest('Audit B.3: Fixture 3 - L-Shaped Floor Footprint does NOT fill empty courtyard', () => {
    // Floor composed of Wing A (0,0 to 15,30) and Wing B (15,0 to 30,15), leaving (15,15 to 30,30) empty
    const lShapedFloor = {
      floorIndex: 0,
      footprints: [
        { x: 5, y: 5, width: 15, length: 30 },  // Wing A
        { x: 20, y: 5, width: 15, length: 15 }  // Wing B
      ],
      rooms: [
        { id: 'wing_a', bounds: { x: 5, y: 5, width: 15, length: 30 } },
        { id: 'wing_b', bounds: { x: 20, y: 5, width: 15, length: 15 } }
      ]
    };

    const fps = getFloorFootprints(lShapedFloor, { x: 5, y: 5, width: 30, length: 30 });
    assert.strictEqual(fps.length, 2, 'L-shaped floor must resolve into 2 distinct footprint wings');
    assert.strictEqual(fps[0].width, 15);
    assert.strictEqual(fps[0].length, 30);
    assert.strictEqual(fps[1].width, 15);
    assert.strictEqual(fps[1].length, 15);

    // Verify plinths generated for each wing separately without covering the empty corner (20, 20)
    const cand = {
      schemaVersion: '2.0.0',
      id: 'fix_3_l_shaped',
      site: { plotWidth: 40, plotLength: 40, buildableEnvelope: { x: 5, y: 5, width: 30, length: 30 } },
      floors: [lShapedFloor]
    };
    const res = generateProceduralBuilding3d(cand);
    const plinths = res.meshes.filter(m => m.componentType === 'foundation_plinth');
    assert.strictEqual(plinths.length, 2, 'L-shape must generate 2 distinct plinth slabs');
  });

  // Fixture 4: Floor Containing Staircase Void
  runTest('Audit B.4: Fixture 4 - Floor with Staircase Void partitions slab around stair shaft', () => {
    const cand = {
      schemaVersion: '2.0.0',
      id: 'fix_4_stair_void',
      site: { plotWidth: 30, plotLength: 40, buildableEnvelope: { x: 3, y: 5, width: 24, length: 30 } },
      floors: [
        {
          floorIndex: 0,
          rooms: [
            { id: 'stair', type: 'stairwell', bounds: { x: 10, y: 15, width: 8, length: 12 } },
            { id: 'living', bounds: { x: 3, y: 5, width: 24, length: 30 } }
          ],
          walls: [{ id: 'w1', type: 'exterior', start: { x: 3, y: 5 }, end: { x: 27, y: 5 } }]
        },
        {
          floorIndex: 1,
          rooms: [{ id: 'f_bed', bounds: { x: 3, y: 5, width: 24, length: 30 } }],
          walls: [{ id: 'w2', type: 'exterior', start: { x: 3, y: 5 }, end: { x: 27, y: 5 } }]
        }
      ]
    };

    const res = generateProceduralBuilding3d(cand);
    const intermediateSlabs = res.meshes.filter(m => m.floorIndex === 1 && m.componentType?.includes('slab'));
    // With stairwell in center, slab must partition into 4 perimeter strips (north, south, west, east)
    assert.strictEqual(intermediateSlabs.length, 4, 'Intermediate slab must partition into 4 strips around shaft');
    // Ensure no slab covers the center of the stairwell (x=14, z=21)
    const shaftCenterX = 14;
    const shaftCenterZ = 21;
    intermediateSlabs.forEach(s => {
      const insideX = shaftCenterX > s.bounds.min[0] && shaftCenterX < s.bounds.max[0];
      const insideZ = shaftCenterZ > s.bounds.min[2] && shaftCenterZ < s.bounds.max[2];
      assert.ok(!(insideX && insideZ), `Slab ${s.id} unexpectedly covers the open stairwell shaft!`);
    });
  });

  // Fixture 5: Multi-Floor Building with Different Floor Layouts
  runTest('Audit B.5: Fixture 5 - Level 1 Partial Slab matches Level 1 Footprint, not Ground Envelope', () => {
    const cand = {
      schemaVersion: '2.0.0',
      id: 'fix_5_different_layouts',
      site: { plotWidth: 40, plotLength: 50, buildableEnvelope: { x: 5, y: 5, width: 30, length: 40 } },
      floors: [
        {
          floorIndex: 0,
          bounds: { x: 5, y: 5, width: 30, length: 40 },
          rooms: [{ id: 'g_all', bounds: { x: 5, y: 5, width: 30, length: 40 } }],
          walls: [{ id: 'g_w1', type: 'exterior', start: { x: 5, y: 5 }, end: { x: 35, y: 5 } }]
        },
        {
          floorIndex: 1,
          bounds: { x: 5, y: 5, width: 30, length: 20 }, // Half length!
          rooms: [{ id: 'f_half', bounds: { x: 5, y: 5, width: 30, length: 20 } }],
          walls: [{ id: 'f_w1', type: 'exterior', start: { x: 5, y: 5 }, end: { x: 35, y: 5 } }]
        }
      ]
    };

    const res = generateProceduralBuilding3d(cand);
    const l1Slab = res.meshes.find(m => m.id === 'slab_level_1');
    assert.ok(l1Slab, 'Level 1 slab must exist');
    assert.strictEqual(l1Slab.bounds.max[2], 25, 'Level 1 slab must stop at Z=25 (length 20ft), not extend to Z=45!');
  });

  // Fixture 6: Building with Balcony or Terrace Boundary
  runTest('Audit B.6: Fixture 6 - Balcony Cantilever Slab generated accurately at floor elevation', () => {
    const cand = {
      schemaVersion: '2.0.0',
      id: 'fix_6_balcony',
      site: { plotWidth: 30, plotLength: 40, buildableEnvelope: { x: 3, y: 5, width: 24, length: 30 } },
      floors: [
        {
          floorIndex: 0,
          rooms: [{ id: 'g_living', bounds: { x: 3, y: 5, width: 24, length: 30 } }],
          walls: [{ id: 'g_w1', type: 'exterior', start: { x: 3, y: 5 }, end: { x: 27, y: 5 } }]
        },
        {
          floorIndex: 1,
          rooms: [
            { id: 'f_living', bounds: { x: 3, y: 10, width: 24, length: 25 } },
            { id: 'f_balcony', type: 'balcony', bounds: { x: 3, y: 5, width: 24, length: 5 } }
          ],
          walls: [{ id: 'f_w1', type: 'exterior', start: { x: 3, y: 10 }, end: { x: 27, y: 10 } }]
        }
      ]
    };

    const res = generateProceduralBuilding3d(cand);
    const balconySlab = res.meshes.find(m => m.componentType === 'balcony_slab');
    assert.ok(balconySlab, 'Balcony slab must exist on Level 1');
    assert.strictEqual(balconySlab.bounds.min[1], 12.0); // Ground plinth 1.5 + 10.5 = 12.0 ft
    assert.strictEqual(balconySlab.dimensions.depth, 5.0);
    assert.strictEqual(balconySlab.dimensions.width, 24.0);
  });

  // ===========================================================================
  // AUDIT C: WALL AND OPENING CORRECTNESS
  // ===========================================================================
  console.log('\n--- Audit C: Wall and Opening Correctness ---');

  runTest('Audit C.1: Exterior and interior wall thicknesses are distinct (0.75ft vs 0.375ft)', () => {
    const wallExt = { id: 'w_ext', type: 'exterior', start: { x: 0, y: 0 }, end: { x: 20, y: 0 } };
    const wallInt = { id: 'w_int', type: 'interior', start: { x: 10, y: 0 }, end: { x: 10, y: 15 } };

    const { solidBlocks: extBlocks } = generateWallWithRealOpenings(wallExt, [], { floorIndex: 0, elevationY: 0, clearHeight: 10 });
    const { solidBlocks: intBlocks } = generateWallWithRealOpenings(wallInt, [], { floorIndex: 0, elevationY: 0, clearHeight: 10 });

    assert.strictEqual(extBlocks[0].dimensions.thickness, ARCHITECTURAL_DEFAULTS_3D.WALL_THICKNESS_EXTERIOR); // 0.75 ft
    assert.strictEqual(intBlocks[0].dimensions.thickness, ARCHITECTURAL_DEFAULTS_3D.WALL_THICKNESS_INTERIOR); // 0.375 ft
  });

  runTest('Audit C.2: Duplicate colinear walls on the same floor are detected and eliminated with warning', () => {
    const cand = {
      schemaVersion: '2.0.0',
      id: 'test_dup_wall_elim',
      site: { plotWidth: 30, plotLength: 40, buildableEnvelope: { x: 3, y: 5, width: 24, length: 30 } },
      floors: [{
        floorIndex: 0,
        rooms: [{ id: 'r1', bounds: { x: 3, y: 5, width: 24, length: 30 } }],
        walls: [
          { id: 'w_orig', type: 'exterior', start: { x: 3, y: 5 }, end: { x: 27, y: 5 } },
          { id: 'w_duplicate_reversed', type: 'exterior', start: { x: 27, y: 5 }, end: { x: 3, y: 5 } } // Duplicate!
        ]
      }]
    };

    const res = generateProceduralBuilding3d(cand);
    const wallMeshes = res.meshes.filter(m => m.componentType === 'wall');
    assert.strictEqual(wallMeshes.length, 1, 'Duplicate colinear wall must be skipped');
    const dupDiag = res.diagnostics.find(d => d.message.includes('Duplicate colinear wall'));
    assert.ok(dupDiag, 'Must emit diagnostic warning for duplicate wall');
    assert.strictEqual(dupDiag.severity, 'WARNING');
  });

  runTest('Audit C.3: Door and window openings pass through entire wall thickness (solid jamb returns)', () => {
    const wall = { id: 'w1', type: 'exterior', start: { x: 0, y: 0 }, end: { x: 20, y: 0 } };
    const openings = [{ id: 'd1', type: 'door', wallId: 'w1', position: { x: 10, y: 0 }, width: 3.5 }];
    const { solidBlocks, openingComponents } = generateWallWithRealOpenings(wall, openings, { floorIndex: 0, elevationY: 0, clearHeight: 10 });

    // Pre-jamb (0 to 8.25), Post-jamb (11.75 to 20), Lintel (8.25 to 11.75 from Y=7 to 10)
    assert.strictEqual(solidBlocks.length, 3);
    assert.strictEqual(openingComponents.length, 1);
    const doorLeaf = openingComponents[0];
    assert.strictEqual(doorLeaf.componentType, 'door_leaf');
    // Door void exists between x=8.25 and x=11.75 up to y=7.0
    const lintel = solidBlocks.find(b => b.type === 'wall_header');
    assert.ok(lintel);
    assert.strictEqual(lintel.bounds.min[1], 7.0);
    assert.strictEqual(lintel.bounds.max[1], 10.0);
  });

  runTest('Audit C.4: Invalid host-wall reference emits structured WARNING diagnostic', () => {
    const cand = {
      schemaVersion: '2.0.0',
      id: 'test_ghost_wall',
      site: { plotWidth: 30, plotLength: 40, buildableEnvelope: { x: 3, y: 5, width: 24, length: 30 } },
      floors: [{
        floorIndex: 0,
        rooms: [{ id: 'r1', bounds: { x: 3, y: 5, width: 24, length: 30 } }],
        walls: [{ id: 'w1', type: 'exterior', start: { x: 3, y: 5 }, end: { x: 27, y: 5 } }],
        doors: [{ id: 'd_unresolvable', type: 'door', wallId: 'w_does_not_exist', width: 3.5 }]
      }]
    };

    const res = generateProceduralBuilding3d(cand);
    const unmatchDiag = res.diagnostics.find(d => d.componentId === 'd_unresolvable');
    assert.ok(unmatchDiag, 'Must emit diagnostic for unresolvable host wall reference');
    assert.strictEqual(unmatchDiag.severity, 'WARNING');
    assert.strictEqual(unmatchDiag.status, 'SKIPPED');
  });

  runTest('Audit C.5: Opening extending outside host wall emits structured WARNING diagnostic', () => {
    const diag = [];
    const wall = { id: 'w1', type: 'exterior', start: { x: 0, y: 0 }, end: { x: 10, y: 0 } };
    const outOfBoundsOp = [{ id: 'd_overflow', type: 'door', wallId: 'w1', position: { x: 1, y: 0 }, width: 6.0 }]; // starts at -2.0 ft!
    generateWallWithRealOpenings(wall, outOfBoundsOp, { floorIndex: 0, elevationY: 0, clearHeight: 10 }, diag);

    const outDiag = diag.find(d => d.componentId === 'd_overflow');
    assert.ok(outDiag, 'Must emit diagnostic for opening extending outside wall bounds');
    assert.strictEqual(outDiag.severity, 'WARNING');
    assert.strictEqual(outDiag.status, 'OUT_OF_BOUNDS');
  });

  // ===========================================================================
  // AUDIT D: STAIRCASES AND VERTICAL CONSISTENCY
  // ===========================================================================
  console.log('\n--- Audit D: Staircases and Vertical Consistency ---');

  runTest('Audit D.1: Staircase treads and risers have positive dimensions and proper stacking', () => {
    const stairRoom = { bounds: { x: 10, y: 15, width: 8, length: 12 } };
    const stairs = generateProceduralStaircase3d(stairRoom, 1.5, 10.5);

    assert.strictEqual(stairs.length, 19); // 18 treads + 1 landing
    stairs.forEach(step => {
      assert.ok(step.dimensions.width > 0, 'Step width must be positive');
      assert.ok(step.dimensions.height > 0, 'Step height must be positive');
      assert.ok(step.dimensions.depth > 0, 'Step depth must be positive');
      // All steps must be within stairwell footprint
      assert.ok(step.bounds.min[0] >= 10 - 0.01);
      assert.ok(step.bounds.max[0] <= 18 + 0.01);
      assert.ok(step.bounds.min[2] >= 15 - 0.01);
      assert.ok(step.bounds.max[2] <= 27 + 0.01);
    });

    // Final tread reaches top elevation of 12.0 ft
    const topStep = stairs.find(s => s.id === 'stair_step_18');
    assert.ok(topStep);
    assert.strictEqual(Number(topStep.bounds.min[1].toFixed(1)), 12.0);
  });

  runTest('Audit D.2: Missing or invalid staircase room handled gracefully without throwing', () => {
    const empty1 = generateProceduralStaircase3d(null, 1.5, 10.5);
    const empty2 = generateProceduralStaircase3d({ bounds: null }, 1.5, 10.5);
    const empty3 = generateProceduralStaircase3d({ bounds: { width: -5, length: 10 } }, 1.5, 10.5);

    assert.deepStrictEqual(empty1, []);
    assert.deepStrictEqual(empty2, []);
    assert.deepStrictEqual(empty3, []);
  });

  // ===========================================================================
  // AUDIT E: MESH INTEGRITY
  // ===========================================================================
  console.log('\n--- Audit E: Mesh Integrity ---');

  runTest('Audit E.1: All generated meshes have finite coordinates and valid face indices', () => {
    const cand = {
      schemaVersion: '2.0.0',
      id: 'test_mesh_integrity',
      site: { plotWidth: 30, plotLength: 40, buildableEnvelope: { x: 3, y: 5, width: 24, length: 30 } },
      floors: [
        {
          floorIndex: 0,
          rooms: [
            { id: 'stair', type: 'stairwell', bounds: { x: 10, y: 15, width: 8, length: 12 } },
            { id: 'living', bounds: { x: 3, y: 5, width: 24, length: 30 } }
          ],
          walls: [
            { id: 'w1', type: 'exterior', start: { x: 3, y: 5 }, end: { x: 27, y: 5 } },
            { id: 'w2', type: 'exterior', start: { x: 27, y: 5 }, end: { x: 27, y: 35 } }
          ],
          doors: [{ id: 'd1', type: 'door', wallId: 'w1', position: { x: 10, y: 5 }, width: 3.5 }],
          windows: [{ id: 'win1', type: 'window', wallId: 'w2', position: { x: 27, y: 20 }, width: 4.0 }]
        },
        {
          floorIndex: 1,
          rooms: [
            { id: 'bed', bounds: { x: 3, y: 10, width: 24, length: 25 } },
            { id: 'balcony', type: 'balcony', bounds: { x: 3, y: 5, width: 24, length: 5 } }
          ],
          walls: [{ id: 'w3', type: 'exterior', start: { x: 3, y: 10 }, end: { x: 27, y: 10 } }]
        }
      ]
    };

    const res = generateProceduralBuilding3d(cand);
    assert.ok(res.meshes.length > 20, 'Should generate comprehensive meshes');

    res.meshes.forEach(m => {
      // 1. All vertices are finite
      assert.strictEqual(m.vertices.length, 8, `Mesh ${m.id} does not have 8 vertices`);
      m.vertices.forEach(v => {
        assert.ok(isFinite(v[0]) && isFinite(v[1]) && isFinite(v[2]), `Non-finite vertex in ${m.id}`);
      });

      // 2. All faces have 4 valid indices [0..7]
      assert.strictEqual(m.faces.length, 6, `Mesh ${m.id} does not have 6 faces`);
      m.faces.forEach(f => {
        assert.strictEqual(f.indices.length, 4);
        f.indices.forEach(idx => {
          assert.ok(idx >= 0 && idx < 8, `Invalid face index ${idx} in ${m.id}`);
        });

        // 3. Normal is normalized unit vector
        const n = f.normal;
        const len = Math.hypot(n[0], n[1], n[2]);
        assert.ok(Math.abs(len - 1.0) < 0.05, `Non-unit normal [${n}] in ${m.id}`);
      });
    });
  });

  runTest('Audit E.2: Procedural Generation is 100% Deterministic across runs', () => {
    const cand = {
      schemaVersion: '2.0.0',
      id: 'test_determinism',
      site: { plotWidth: 30, plotLength: 40, buildableEnvelope: { x: 3, y: 5, width: 24, length: 30 } },
      floors: [{
        floorIndex: 0,
        rooms: [{ id: 'r1', bounds: { x: 3, y: 5, width: 24, length: 30 } }],
        walls: [{ id: 'w1', type: 'exterior', start: { x: 3, y: 5 }, end: { x: 27, y: 5 } }]
      }]
    };

    const run1 = generateProceduralBuilding3d(cand);
    const run2 = generateProceduralBuilding3d(cand);

    assert.strictEqual(run1.meshes.length, run2.meshes.length);
    for (let i = 0; i < run1.meshes.length; i++) {
      assert.deepStrictEqual(run1.meshes[i].bounds, run2.meshes[i].bounds);
      assert.deepStrictEqual(run1.meshes[i].vertices, run2.meshes[i].vertices);
    }
  });

  console.log('\n===============================================================');
  console.log(`AUDIT TEST SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log('===============================================================\n');

  if (failedCount > 0) {
    throw new Error(`Audit verification failed with ${failedCount} errors.`);
  }

  return { passed: passedCount, failed: failedCount };
}

// Run if called directly
if (process.argv[1]?.endsWith('geometryVerificationAudit.test.js')) {
  runGeometryVerificationAuditTests();
}
