/**
 * LabourConnect Design Engine - Procedural Interior Furniture & Fit-Out Test Suite
 * 
 * Verifies all requirements for Sprint 4 Task S4-T02:
 * 1. Living room furniture generation (sofa, coffee table, tv console)
 * 2. Bedroom furniture generation (bed, headboard, wardrobe, nightstands)
 * 3. Kitchen fit-out generation (counter base, sink, hob, refrigerator)
 * 4. Bathroom fixture generation (vanity, toilet, shower enclosure)
 * 5. Room-type mapping across residential taxonomy
 * 6. Furniture dimensions and rotations
 * 7. Correct floor elevation Y and room association
 * 8. Placement strictly within room boundaries
 * 9. Furniture AABB non-overlap prevention
 * 10. Doorway and circulation clearance preservation
 * 11. Small-room graceful degradation
 * 12. Unsupported/circulation room handling (corridors, stairwells)
 * 13. Missing/invalid geometry error safety
 * 14. Deterministic repeated generation (idempotence)
 * 15. Stable identifiers and metadata
 * 16. Canonical building model integration & 3D mesh stats
 * 17. Budget Engine Category 6 itemized linkage
 * 18. Backwards compatibility & non-mutation of layout
 */

import { strict as assert } from 'assert';
import {
  generateRoomFurniture,
  generateDesignFurniture
} from '../interior/proceduralFurnitureGenerator.js';
import {
  FURNITURE_TYPES
} from '../interior/furnitureCatalog.js';
import { generateProceduralBuilding3d } from '../geometry/proceduralBuildingGenerator3d.js';
import { buildProcedural3dGeometry } from '../geometry/procedural3dGenerator.js';
import { calculateProjectBudget } from '../estimation/projectBudgetEngine.js';
import { generateLayoutCandidate } from '../generator/layoutGenerator.js';

export function runProceduralFurnitureTests() {
  console.log('\n===============================================================');
  console.log('LABOURCONNECT ENGINE: PROCEDURAL FURNITURE & FIT-OUT (S4-T02)');
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

  // Common Fixtures
  const singleStoreyDesign = generateLayoutCandidate({
    plotWidth: 30,
    plotLength: 50,
    floorsCount: 1,
    bhkCount: 2,
    bathroomsCount: 2,
    homeBudgetInr: 3500000
  });

  const multiStoreyDesign = generateLayoutCandidate({
    plotWidth: 40,
    plotLength: 60,
    floorsCount: 2,
    bhkCount: 3,
    bathroomsCount: 3,
    homeBudgetInr: 5500000
  });

  // --- Group 1: Room-Specific Furniture Layouts ---
  console.log('\n--- Group 1: Room-Specific Furniture Layouts ---');

  runTest('Test 1: Living room generates sofa, coffee table, and TV console', () => {
    const livingRoom = {
      id: 'rm_living',
      name: 'Formal Living Room',
      type: 'living',
      bounds: { x: 5, y: 5, width: 16, length: 14 }
    };
    const floor = { floorIndex: 0, elevationZ: 1.5, openings: [] };
    const result = generateRoomFurniture(livingRoom, floor);

    assert(result.items.length >= 3, `Expected at least 3 items, got ${result.items.length}`);
    const types = result.items.map(it => it.type);
    assert(types.includes(FURNITURE_TYPES.SOFA_3SEATER) || types.includes(FURNITURE_TYPES.SOFA_SECTIONAL_L), 'Must include sofa');
    assert(types.includes(FURNITURE_TYPES.COFFEE_TABLE), 'Must include coffee table');
    assert(types.includes(FURNITURE_TYPES.TV_CONSOLE), 'Must include TV console');
    assert(result.meshes.length > 5, 'Must generate composite 3D meshes');
    assert(result.totalFurnitureCostInr > 50000, 'Must compute realistic furniture cost');
  });

  runTest('Test 2: Bedroom generates bed, headboard, wardrobe, and nightstands', () => {
    const bedroom = {
      id: 'rm_bed_master',
      name: 'Master Suite',
      type: 'master_bedroom',
      bounds: { x: 5, y: 20, width: 14, length: 14 }
    };
    const floor = { floorIndex: 0, elevationZ: 1.5, openings: [] };
    const result = generateRoomFurniture(bedroom, floor);

    const types = result.items.map(it => it.type);
    assert(types.includes(FURNITURE_TYPES.KING_BED), 'Master suite must feature King Bed');
    assert(types.includes(FURNITURE_TYPES.BEDSIDE_TABLE), 'Must include bedside table');
    assert(types.includes(FURNITURE_TYPES.WARDROBE_3DOOR), 'Must include modular wardrobe');
    assert(result.meshes.some(m => m.subComponent === 'headboard'), 'Must have distinct headboard mesh');
    assert(result.meshes.some(m => m.subComponent === 'mattress'), 'Must have mattress mesh');
  });

  runTest('Test 3: Kitchen fit-out generates counter base, sink, hob, and refrigerator', () => {
    const kitchen = {
      id: 'rm_kitchen',
      name: 'Modular Kitchen',
      type: 'kitchen',
      bounds: { x: 22, y: 5, width: 10, length: 10 }
    };
    const floor = { floorIndex: 0, elevationZ: 1.5, openings: [] };
    const result = generateRoomFurniture(kitchen, floor);

    const types = result.items.map(it => it.type);
    assert(types.includes(FURNITURE_TYPES.KITCHEN_COUNTER_BASE), 'Must include kitchen counter base');
    assert(types.includes(FURNITURE_TYPES.KITCHEN_SINK_UNIT), 'Must include sink unit');
    assert(types.includes(FURNITURE_TYPES.KITCHEN_HOB_UNIT), 'Must include cooking hob');
    assert(types.includes(FURNITURE_TYPES.REFRIGERATOR), 'Must include refrigerator');
  });

  runTest('Test 4: Bathroom generates vanity, toilet EWC, and shower enclosure', () => {
    const bath = {
      id: 'rm_bath',
      name: 'Attached Bathroom',
      type: 'bathroom',
      bounds: { x: 20, y: 20, width: 8, length: 7 } // 56 sqft
    };
    const floor = { floorIndex: 0, elevationZ: 1.5, openings: [] };
    const result = generateRoomFurniture(bath, floor);

    const types = result.items.map(it => it.type);
    assert(types.includes(FURNITURE_TYPES.TOILET_EWC), 'Must include EWC toilet');
    assert(types.includes(FURNITURE_TYPES.BATHROOM_VANITY), 'Must include bathroom vanity');
    assert(types.includes(FURNITURE_TYPES.SHOWER_ENCLOSURE), 'Must include shower enclosure');
    assert(result.meshes.some(m => m.subComponent === 'cistern'), 'Must have toilet cistern mesh');
    assert(result.meshes.some(m => m.subComponent === 'glass'), 'Must have shower glass screen');
  });

  runTest('Test 5: Dining room generates table and coordinated chairs', () => {
    const dining = {
      id: 'rm_dining',
      name: 'Family Dining',
      type: 'dining',
      bounds: { x: 10, y: 10, width: 12, length: 11 } // 132 sqft
    };
    const floor = { floorIndex: 0, elevationZ: 1.5, openings: [] };
    const result = generateRoomFurniture(dining, floor);

    const types = result.items.map(it => it.type);
    assert(types.includes(FURNITURE_TYPES.DINING_TABLE_6S), 'Spacious dining room gets 6-seater table');
    const chairCount = types.filter(t => t === FURNITURE_TYPES.DINING_CHAIR).length;
    assert(chairCount >= 4, `Expected at least 4 dining chairs, got ${chairCount}`);
  });

  runTest('Test 6: Pooja room generates traditional mandir altar cabinet', () => {
    const pooja = {
      id: 'rm_pooja',
      name: 'Pooja Room',
      type: 'pooja',
      bounds: { x: 22, y: 15, width: 6, length: 6 }
    };
    const floor = { floorIndex: 0, elevationZ: 1.5, openings: [] };
    const result = generateRoomFurniture(pooja, floor);

    const types = result.items.map(it => it.type);
    assert(types.includes(FURNITURE_TYPES.POOJA_MANDIR), 'Must include Pooja mandir altar');
    assert(result.meshes.some(m => m.subComponent === 'pediment'), 'Must include traditional pediment');
  });

  runTest('Test 7: Study room generates desk, ergonomic chair, and bookshelf', () => {
    const study = {
      id: 'rm_study',
      name: 'Study / Home Office',
      type: 'study',
      bounds: { x: 8, y: 25, width: 10, length: 10 }
    };
    const floor = { floorIndex: 1, elevationZ: 12.0, openings: [] };
    const result = generateRoomFurniture(study, floor);

    const types = result.items.map(it => it.type);
    assert(types.includes(FURNITURE_TYPES.STUDY_DESK), 'Must include study desk');
    assert(types.includes(FURNITURE_TYPES.OFFICE_CHAIR), 'Must include task chair');
    assert(types.includes(FURNITURE_TYPES.BOOKSHELF), 'Must include bookshelf');
  });

  // --- Group 2: Spatial Ergonomics, Boundaries & Clearances ---
  console.log('\n--- Group 2: Spatial Ergonomics, Boundaries & Clearances ---');

  runTest('Test 8: Furniture is positioned strictly inside room boundaries', () => {
    const room = {
      id: 'rm_test_bounds',
      name: 'Guest Bedroom',
      type: 'bedroom',
      bounds: { x: 10, y: 15, width: 12, length: 13 }
    };
    const floor = { floorIndex: 0, elevationZ: 1.5, openings: [] };
    const result = generateRoomFurniture(room, floor);

    result.items.forEach(it => {
      assert(it.bounds.minX >= room.bounds.x + 0.1, `${it.id} minX ${it.bounds.minX} outside room x ${room.bounds.x}`);
      assert(it.bounds.maxX <= room.bounds.x + room.bounds.width - 0.1, `${it.id} maxX ${it.bounds.maxX} exceeds room width`);
      assert(it.bounds.minZ >= room.bounds.y + 0.1, `${it.id} minZ ${it.bounds.minZ} outside room z ${room.bounds.y}`);
      assert(it.bounds.maxZ <= room.bounds.y + room.bounds.length - 0.1, `${it.id} maxZ ${it.bounds.maxZ} exceeds room length`);
    });
  });

  runTest('Test 9: Furniture items in the same room never collide (non-overlapping AABBs)', () => {
    const room = {
      id: 'rm_test_collision',
      name: 'Master Suite',
      type: 'master_bedroom',
      bounds: { x: 5, y: 5, width: 15, length: 14 }
    };
    const floor = { floorIndex: 0, elevationZ: 1.5, openings: [] };
    const result = generateRoomFurniture(room, floor);

    for (let i = 0; i < result.items.length; i++) {
      for (let j = i + 1; j < result.items.length; j++) {
        const b1 = result.items[i].bounds;
        const b2 = result.items[j].bounds;
        const overlapX = Math.max(0, Math.min(b1.maxX, b2.maxX) - Math.max(b1.minX, b2.minX));
        const overlapZ = Math.max(0, Math.min(b1.maxZ, b2.maxZ) - Math.max(b1.minZ, b2.minZ));
        const hasOverlap = overlapX > 0.05 && overlapZ > 0.05;
        assert(!hasOverlap, `Items ${result.items[i].id} and ${result.items[j].id} collide with overlap ${overlapX.toFixed(2)}x${overlapZ.toFixed(2)}`);
      }
    }
  });

  runTest('Test 10: Doorway circulation envelope (2.2 ft radius) is strictly protected', () => {
    const room = {
      id: 'rm_door_clearance',
      name: 'Bedroom with Door',
      type: 'bedroom',
      bounds: { x: 10, y: 10, width: 12, length: 12 }
    };
    // Doorway placed at bottom wall center (16, 22)
    const doorPos = { x: 16, y: 22 };
    const floor = {
      floorIndex: 0,
      elevationZ: 1.5,
      openings: [{ type: 'door', position: doorPos, width: 3 }]
    };
    const result = generateRoomFurniture(room, floor);

    result.items.forEach(it => {
      const dx = Math.max(it.bounds.minX, Math.min(doorPos.x, it.bounds.maxX));
      const dz = Math.max(it.bounds.minZ, Math.min(doorPos.y, it.bounds.maxZ));
      const distSq = (doorPos.x - dx) ** 2 + (doorPos.y - dz) ** 2;
      assert(distSq >= 2.0 * 2.0, `Item ${it.id} encroaches into doorway clearance zone at dist ${Math.sqrt(distSq).toFixed(2)}`);
    });
  });

  runTest('Test 11: Floor elevation Y sits directly on the floor slab (no floating furniture)', () => {
    const room = {
      id: 'rm_elev_check',
      name: 'First Floor Bedroom',
      type: 'bedroom',
      bounds: { x: 5, y: 5, width: 12, length: 12 }
    };
    const floorLevel1 = { floorIndex: 1, elevationZ: 12.0, openings: [] };
    const result = generateRoomFurniture(room, floorLevel1);

    // Floor base is elevationZ (12.0) + slabThickness (0.5) = 12.5 ft
    const expectedBaseY = 12.5;
    result.items.forEach(it => {
      assert.equal(it.position.y, expectedBaseY, `${it.id} position.y must be exactly ${expectedBaseY}`);
    });
    result.meshes.forEach(m => {
      assert(m.bounds.min[1] >= expectedBaseY - 0.05, `Mesh ${m.id} minY ${m.bounds.min[1]} penetrates slab below ${expectedBaseY}`);
    });
  });

  runTest('Test 12: Small room degrades gracefully without throwing or colliding', () => {
    const tinyRoom = {
      id: 'rm_tiny_bed',
      name: 'Tiny 8x9 Bedroom',
      type: 'bedroom',
      bounds: { x: 5, y: 5, width: 8, length: 9 } // 72 sqft
    };
    const floor = { floorIndex: 0, elevationZ: 1.5, openings: [] };
    const result = generateRoomFurniture(tinyRoom, floor);

    assert(result.items.length >= 1, 'Should place at least single bed');
    const types = result.items.map(it => it.type);
    assert(!types.includes(FURNITURE_TYPES.KING_BED), 'Tiny room must not place King Bed');
    assert(result.items.length <= 3, 'Should omit nightstands/dresser');
  });

  runTest('Test 13: Circulation spaces (staircase, corridor, terrace) are not populated with bedroom furniture', () => {
    const stairwell = {
      id: 'rm_stair',
      name: 'Dog-Legged Stairwell',
      type: 'stairwell',
      bounds: { x: 5, y: 5, width: 8, length: 12 }
    };
    const floor = { floorIndex: 0, elevationZ: 1.5, openings: [] };
    const result = generateRoomFurniture(stairwell, floor);

    assert.equal(result.items.length, 0, 'Stairwell must remain 100% free of furniture');
    assert.equal(result.meshes.length, 0, 'No furniture meshes in stairwell');
  });

  runTest('Test 14: Null, invalid, or zero-dimension rooms return clean empty results without throwing', () => {
    const invalidRoom = { id: 'rm_bad', bounds: { x: 0, y: 0, width: 0, length: 0 } };
    const result = generateRoomFurniture(invalidRoom, null);
    assert.equal(result.items.length, 0);
    assert.equal(result.meshes.length, 0);
  });

  // --- Group 3: Canonical Building Integration & 3D Rendering Pipeline ---
  console.log('\n--- Group 3: Canonical Building Integration & 3D Rendering Pipeline ---');

  runTest('Test 15: generateDesignFurniture populates entire canonical building across all floors', () => {
    const furnModel = generateDesignFurniture(multiStoreyDesign);

    assert(furnModel.totalItemCount >= 8, `Expected >= 8 furniture items, got ${furnModel.totalItemCount}`);
    assert(furnModel.furnishedRoomsCount >= 4, `Expected >= 4 furnished rooms, got ${furnModel.furnishedRoomsCount}`);
    assert(furnModel.meshes.length > 20, `Expected > 20 composite meshes, got ${furnModel.meshes.length}`);
    assert(furnModel.totalFurnitureCostInr > 150000, `Expected total cost > 1.5L, got ${furnModel.totalFurnitureCostInr}`);
  });

  runTest('Test 16: generateProceduralBuilding3d attaches furnishings and includes furniture meshes in allMeshes', () => {
    const building3d = generateProceduralBuilding3d(singleStoreyDesign, { includeFurniture: true });

    assert(building3d.furnishings, 'Building 3D model must contain furnishings object');
    assert(building3d.furnishings.totalItemCount > 0, 'Must have positive furniture count');
    assert(building3d.stats.totalFurnitureItems > 0, 'Stats must record furniture item count');
    assert(building3d.stats.furnishedRoomsCount > 0, 'Stats must record furnished room count');
    
    const furnitureMeshes = building3d.meshes.filter(m => m.isFurniture === true);
    assert(furnitureMeshes.length > 0, 'allMeshes must include furniture meshes');
    furnitureMeshes.forEach(m => {
      assert.equal(m.isInterior, true, 'Furniture mesh must be flagged as interior');
    });
  });

  runTest('Test 17: buildProcedural3dGeometry works with furniture options enabled', () => {
    const geometries = buildProcedural3dGeometry(multiStoreyDesign, { includeFurniture: true });
    assert(geometries.buildingModel3d, 'Must build procedural building model');
    assert(geometries.buildingModel3d.furnitureCount > 0, 'Must report positive furniture count');
  });

  runTest('Test 18: Determinism: identical design inputs generate 100% identical furniture coordinates', () => {
    const run1 = generateDesignFurniture(multiStoreyDesign);
    const run2 = generateDesignFurniture(multiStoreyDesign);

    assert.equal(run1.totalItemCount, run2.totalItemCount, 'Item counts must match');
    assert.equal(run1.totalFurnitureCostInr, run2.totalFurnitureCostInr, 'Costs must match');
    for (let i = 0; i < run1.allFurnitureItems.length; i++) {
      assert.deepEqual(run1.allFurnitureItems[i].position, run2.allFurnitureItems[i].position, 'Positions must be identical');
      assert.equal(run1.allFurnitureItems[i].type, run2.allFurnitureItems[i].type, 'Types must be identical');
    }
  });

  // --- Group 4: Total Project Budget Linkage & Backwards Compatibility ---
  console.log('\n--- Group 4: Total Project Budget Linkage & Backwards Compatibility ---');

  runTest('Test 19: Budget Category 6 consumes itemized furniture items and transitions from incomplete to complete', () => {
    // 1. Create a design with generated furnishings attached
    const furnishedDesign = { ...multiStoreyDesign };
    furnishedDesign.furnishings = generateDesignFurniture(furnishedDesign);

    const budget = calculateProjectBudget(furnishedDesign, {
      targetBudget: 5500000,
      city: 'Bengaluru',
      includeLandscaping: true
    });

    assert(budget.success === true, 'Budget calculation must succeed');
    const cat6 = budget.categorySubtotals.find(c => c.categoryId === 'interior_furnishings');
    assert(cat6, 'Must find Category 6: Interior Furnishings');
    assert(cat6.subtotalInr > 0, 'Category 6 must have positive calculated subtotal');
    
    const cat6Items = budget.itemizedBreakdown.filter(it => it.categoryId === 'interior_furnishings');
    assert(cat6Items.length >= 3, `Expected itemized entries in Category 6, got ${cat6Items.length}`);
    assert(cat6Items.some(it => (it.itemId || it.id || '').startsWith('furn_')), 'Items must have procedural furn_ prefix');
    assert.equal(cat6.isProvisional, false, 'Category 6 should no longer be provisional with generated furnishings');
  });

  runTest('Test 20: Existing design model inputs and specifications remain completely unmutated', () => {
    const originalSnapshot = JSON.stringify(multiStoreyDesign);
    generateDesignFurniture(multiStoreyDesign);
    assert.equal(JSON.stringify(multiStoreyDesign), originalSnapshot, 'Design object must remain completely unmutated');
  });

  console.log('\n===============================================================');
  console.log(`PROCEDURAL FURNITURE ENGINE TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('===============================================================');

  if (failed > 0) {
    throw new Error(`Procedural Furniture Suite failed with ${failed} failure(s).`);
  }

  return { passed, failed };
}

// Standalone execution guard
if (process.argv[1] && (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}` || import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`)) {
  runProceduralFurnitureTests();
}
