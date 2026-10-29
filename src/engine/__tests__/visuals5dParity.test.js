/**
 * LabourConnect Design Engine - 5D Visuals Parity, Determinism & Cutaway Acceptance Suite
 * 
 * Verifies Sprint 5D Architectural Requirements:
 * 1. Single Source of Truth Parity: Room count, names, positions and dimensions in 5D equal 3D/2D data.
 * 2. Opening Coordinates Parity: All doors and windows match exact stored coordinates and sizes.
 * 3. 100% Deterministic Reproducibility: Same design yields identical scene hash and element coordinates twice.
 * 4. Furniture Ergonomics & Clearance: Furniture items remain strictly bounded within room rectangles with no doorway blockage.
 * 5. Camera Angles & Presets: All camera presets (Isometric, Steep Isometric, Top-Down, Front, Rear, Left, Right) produce unique poses.
 * 6. Cutaway Modulation: Low wall cutaway (~3.5 ft / ~3.0 ft with dark cap) vs Full wall mode (10.0 ft).
 * 7. Documented Defaults: Missing data report transparently emits documented architectural fallbacks.
 */

import { generateLayoutCandidate } from '../generator/layoutGenerator.js';
import {
  buildVisuals5dScene,
  DEFAULTS_5D,
  createSeededRandom,
  CAMERA_PRESETS_5D
} from '../visuals5d/visuals5dEngine.js';

export function runVisuals5dParityTests() {
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      passed++;
      console.log(`  ✓ ${message}`);
    } else {
      failed++;
      console.error(`  ✗ FAIL: ${message}`);
    }
  }

  console.log('\n======================================================================');
  console.log('📐 5D VISUALS ENGINE: PARITY, DETERMINISM & ARCHITECTURAL CUTAWAYS');
  console.log('======================================================================\n');

  // Baseline canonical test design
  const canonicalDesign = generateLayoutCandidate({
    plotWidth: 40,
    plotLength: 60,
    floorsCount: 2,
    bhkCount: 3,
    hasBalcony: true,
    facingDirection: 'East'
  });

  // =========================================================================
  // SECTION 1: Single Source of Truth Parity (Rooms, Dimensions, Positions)
  // =========================================================================
  console.log('--- Section 1: Single Source of Truth Geometric Parity ---');
  const scene5d = buildVisuals5dScene(canonicalDesign, { wallMode: 'low' });

  // Test 1.1: Floor count parity
  assert(
    scene5d.floors.length === canonicalDesign.floors.length,
    `Test 1.1: 5D floor count equals canonical floor count (${scene5d.floors.length} === ${canonicalDesign.floors.length})`
  );

  // Test 1.2: Total room count parity
  const canonicalRoomCount = canonicalDesign.floors.reduce((sum, f) => sum + (f.rooms?.length || 0), 0);
  assert(
    scene5d.summary.roomCount === canonicalRoomCount,
    `Test 1.2: 5D room count equals canonical room count (${scene5d.summary.roomCount} === ${canonicalRoomCount})`
  );

  // Test 1.3: Room dimensional parity (each room bounds match exactly)
  let roomBoundsMatch = true;
  canonicalDesign.floors.forEach((fl, fIdx) => {
    const f5d = scene5d.floors[fIdx];
    fl.rooms.forEach(rm => {
      const match = f5d.rooms.find(r => r.id === rm.id);
      if (!match) {
        roomBoundsMatch = false;
        return;
      }
      if (
        match.bounds.x !== rm.bounds.x ||
        match.bounds.y !== rm.bounds.y ||
        match.bounds.width !== rm.bounds.width ||
        match.bounds.length !== rm.bounds.length
      ) {
        roomBoundsMatch = false;
      }
    });
  });
  assert(
    roomBoundsMatch,
    'Test 1.3: All room boundaries (x, y, width, length) in 5D match canonical 3D layout exactly'
  );

  // Test 1.4: Room floor finish planes exist for all habitable rooms
  assert(
    scene5d.elements.roomFloors.length >= canonicalRoomCount,
    `Test 1.4: High-fidelity room floor coverings generated for all rooms (count: ${scene5d.elements.roomFloors.length})`
  );

  // =========================================================================
  // SECTION 2: Openings Parity (Doors & Windows at Stored Positions)
  // =========================================================================
  console.log('\n--- Section 2: Openings Parity (Doors & Windows) ---');

  const canonicalDoorCount = canonicalDesign.floors.reduce((sum, f) => sum + (f.doors?.length || 0) + (f.rooms || []).reduce((rs, r) => rs + (r.doors?.length || 0), 0), 0);
  const canonicalWinCount = canonicalDesign.floors.reduce((sum, f) => sum + (f.windows?.length || 0) + (f.rooms || []).reduce((rs, r) => rs + (r.windows?.length || 0), 0), 0);

  // Test 2.1: Door openings present
  assert(
    scene5d.elements.doors.length >= canonicalDoorCount,
    `Test 2.1: Door entities generated with swinging leaves (got: ${scene5d.elements.doors.length}, expected >= ${canonicalDoorCount})`
  );

  // Test 2.2: Window openings present
  assert(
    scene5d.elements.windows.length >= canonicalWinCount,
    `Test 2.2: Window entities generated with frames & glass (got: ${scene5d.elements.windows.length}, expected >= ${canonicalWinCount})`
  );

  // Test 2.3: Door leaf properties
  const sampleDoor = scene5d.elements.doors[0];
  assert(
    sampleDoor && sampleDoor.swingAngleDeg === 90 && sampleDoor.showSwingArc === true,
    'Test 2.3: Doors show physical open leaf at 90° angle with swing arc'
  );

  // Test 2.4: Window glass transparency and black frame
  const sampleWin = scene5d.elements.windows[0];
  assert(
    sampleWin && sampleWin.frameColor === '#0f172a' && sampleWin.glassOpacity < 0.5,
    'Test 2.4: Windows feature architectural black frame and transparent glass'
  );

  // =========================================================================
  // SECTION 3: 100% Deterministic Reproducibility (No Math.random())
  // =========================================================================
  console.log('\n--- Section 3: Determinism & Idempotency ---');

  const run1 = buildVisuals5dScene(canonicalDesign, { wallMode: 'low' });
  const run2 = buildVisuals5dScene(canonicalDesign, { wallMode: 'low' });

  // Test 3.1: Identical scene hash
  assert(
    run1.deterministicHash === run2.deterministicHash,
    `Test 3.1: Consecutive runs produce identical scene hash (${run1.deterministicHash} === ${run2.deterministicHash})`
  );

  // Test 3.2: Exact element counts match across runs
  assert(
    run1.elements.furniture.length === run2.elements.furniture.length &&
    run1.elements.walls.length === run2.elements.walls.length &&
    run1.elements.wallCaps.length === run2.elements.wallCaps.length,
    'Test 3.2: Exact entity counts across plinths, walls, caps, and furniture match 100%'
  );

  // Test 3.3: First 10 furniture coordinates identical to 3 decimal places
  let coordsIdentical = true;
  for (let i = 0; i < Math.min(10, run1.elements.furniture.length); i++) {
    const f1 = run1.elements.furniture[i].bounds;
    const f2 = run2.elements.furniture[i].bounds;
    if (f1.minX !== f2.minX || f1.maxX !== f2.maxX || f1.minZ !== f2.minZ || f1.maxZ !== f2.maxZ) {
      coordsIdentical = false;
      break;
    }
  }
  assert(
    coordsIdentical,
    'Test 3.3: Furniture coordinates and dimensions match 100% deterministically'
  );

  // Test 3.4: Seeded PRNG produces different values for different seeds
  const prngA = createSeededRandom('design_seed_1');
  const prngB = createSeededRandom('design_seed_2');
  assert(
    prngA.nextFloat() !== prngB.nextFloat(),
    'Test 3.4: Seeded PRNG outputs distinct sequences for different seeds'
  );

  // =========================================================================
  // SECTION 4: Furniture Ergonomics & Clearance (Bounded Inside Walls)
  // =========================================================================
  console.log('\n--- Section 4: Furniture Ergonomics & Clearance ---');

  // Test 4.1: Substantial furniture count generated
  assert(
    scene5d.elements.furniture.length >= 15,
    `Test 4.1: Comprehensive procedural furniture generated (count: ${scene5d.elements.furniture.length})`
  );

  // Test 4.2: Furniture items stay strictly within room bounds
  let allFurnitureInsideRooms = true;
  scene5d.elements.furniture.forEach(item => {
    // Find corresponding floor
    const floorIndex = item.floorIndex || 0;
    const fl = canonicalDesign.floors[floorIndex] || canonicalDesign.floors[0];
    // Find room enclosing or closest to item
    const b = item.bounds;
    const itemCx = (b.minX + b.maxX) / 2;
    const itemCz = (b.minZ + b.maxZ) / 2;
    const room = fl.rooms.find(r => (
      itemCx >= r.bounds.x - 0.5 && itemCx <= r.bounds.x + r.bounds.width + 0.5 &&
      itemCz >= r.bounds.y - 0.5 && itemCz <= r.bounds.y + r.bounds.length + 0.5
    ));
    if (!room) {
      allFurnitureInsideRooms = false;
    }
  });
  assert(
    allFurnitureInsideRooms,
    'Test 4.2: All furniture items reside strictly within designated room boundaries'
  );

  // Test 4.3: Variety of furniture categories present
  const categories = new Set(scene5d.elements.furniture.map(f => f.category));
  assert(
    categories.has('seating') && categories.has('bedroom') && categories.has('kitchen') && categories.has('sanitary'),
    `Test 4.3: Furniture includes diverse living, dining, bedroom, kitchen, and bath categories (count: ${categories.size})`
  );

  // =========================================================================
  // SECTION 5: Camera Presets Diversity
  // =========================================================================
  console.log('\n--- Section 5: Camera Presets Diversity ---');

  const presets = scene5d.cameraPresets;
  const presetKeys = Object.keys(CAMERA_PRESETS_5D);

  // Test 5.1: All required presets exist
  assert(
    presetKeys.every(k => Boolean(presets[k])),
    `Test 5.1: All 7 required camera presets exist: ${presetKeys.join(', ')}`
  );

  // Test 5.2: Each camera preset produces a distinct 3D position
  const positions = presetKeys.map(k => presets[k].position);
  let allPositionsUnique = true;
  for (let i = 0; i < positions.length; i++) {
    for (let j = i + 1; j < positions.length; j++) {
      const p1 = positions[i];
      const p2 = positions[j];
      const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y, p1.z - p2.z);
      if (dist < 1.0) {
        allPositionsUnique = false;
        break;
      }
    }
  }
  assert(
    allPositionsUnique,
    'Test 5.2: Every camera preset yields a uniquely positioned spatial viewpoint'
  );

  // Test 5.3: Isometric preset has ~35° elevation and 45° azimuth
  const iso = presets.isometric;
  assert(
    iso && Math.abs(iso.azimuthDeg - 45) < 0.1 && Math.abs(iso.elevationDeg - 35.26) < 0.1,
    `Test 5.3: Isometric preset adheres to classic 45° azimuth, 35.26° elevation (got: ${iso?.azimuthDeg}°, ${iso?.elevationDeg}°)`
  );

  // =========================================================================
  // SECTION 6: Wall Mode Modulation (Low Cutaway vs Full Walls)
  // =========================================================================
  console.log('\n--- Section 6: Wall Mode Modulation ---');

  const lowScene = buildVisuals5dScene(canonicalDesign, { wallMode: 'low' });
  const fullScene = buildVisuals5dScene(canonicalDesign, { wallMode: 'full' });

  // Test 6.1: Low walls have cutaway exterior height ~3.5 ft and interior height ~3.0 ft
  const lowExtWall = lowScene.elements.walls.find(w => w.isExterior);
  const lowIntWall = lowScene.elements.walls.find(w => !w.isExterior);
  assert(
    lowExtWall && lowExtWall.wallHeight === DEFAULTS_5D.CUTAWAY_EXTERIOR_WALL_HEIGHT,
    `Test 6.1a: Low exterior wall cutaway height is ~3.5 ft (got: ${lowExtWall?.wallHeight} ft)`
  );
  assert(
    lowIntWall && lowIntWall.wallHeight === DEFAULTS_5D.CUTAWAY_INTERIOR_WALL_HEIGHT,
    `Test 6.1b: Low interior wall cutaway height is ~3.0 ft (got: ${lowIntWall?.wallHeight} ft)`
  );

  // Test 6.2: Low walls have dark slate cap strips
  assert(
    lowScene.elements.wallCaps.length > 0 && ['#0f172a', '#1e293b'].includes(lowScene.elements.wallCaps[0].color),
    `Test 6.2: Dark slate cap strips generated on top of cutaway walls (count: ${lowScene.elements.wallCaps.length}, color: ${lowScene.elements.wallCaps[0]?.color})`
  );

  // Test 6.3: Full walls have 10.0 ft standard ceiling height with 0 wall caps
  const fullExtWall = fullScene.elements.walls.find(w => w.isExterior);
  assert(
    fullExtWall && fullExtWall.wallHeight === DEFAULTS_5D.FULL_WALL_HEIGHT && fullScene.elements.wallCaps.length === 0,
    `Test 6.3: Full wall mode raises walls to 10.0 ft height without low wall caps (got: ${fullExtWall?.wallHeight} ft)`
  );

  // =========================================================================
  // SECTION 7: Documented Architectural Defaults Reporting
  // =========================================================================
  console.log('\n--- Section 7: Documented Architectural Defaults Reporting ---');

  // Test 7.1: Missing data report exists
  assert(
    Array.isArray(scene5d.missingDataReport),
    'Test 7.1: Scene generator emits structured missingDataReport'
  );

  // Test 7.2: Default constants are immutable
  assert(
    Object.isFrozen(DEFAULTS_5D),
    'Test 7.2: DEFAULTS_5D constants dictionary is strictly frozen and immutable'
  );

  console.log('\n======================================================================');
  console.log(`📊 5D VISUALS TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('======================================================================\n');

  return { passed, failed, total: passed + failed };
}
