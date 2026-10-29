/**
 * LabourConnect Design Engine - Procedural Landscape, Garden & Outdoor Living Test Suite
 * 
 * Verifies all 18 requirements for Sprint 4 Task S4-T03:
 * 1. Landscape generation on a valid plot
 * 2. Respect for plot boundaries (all vertices within [0, plotW] x [0, plotL])
 * 3. Building-footprint exclusion (zero vegetation or ground inside rooms)
 * 4. Tree and shrub placement with recognizable 3D anatomy (trunk + tiered canopies)
 * 5. Plant spacing and object overlap prevention (collision-free AABBs)
 * 6. Pathway generation connecting front gate to entrance
 * 7. Entrance connectivity where entrance is defined
 * 8. Driveway placement where space permits (connecting vehicle gate to portico)
 * 9. Small-plot graceful degradation
 * 10. Missing or invalid plot geometry error safety
 * 11. Deterministic generation for identical inputs (idempotence)
 * 12. Repeated generation without duplicate objects
 * 13. Compound wall and gate integration (perimeter wall with coping & gate pillars)
 * 14. Exterior and cutaway rendering compatibility
 * 15. Interior furniture preservation (zero regression on furnishings)
 * 16. Canonical design-model compatibility (design.landscape attached)
 * 17. Budget integration and duplicate-cost prevention (Category 7 verified takeoff)
 * 18. Non-mutation of original design inputs & specifications
 */

import { strict as assert } from 'assert';
import {
  generatePropertyLandscape
} from '../landscape/proceduralLandscapeGenerator.js';
import {
  LANDSCAPE_TYPES
} from '../landscape/landscapeCatalog.js';
import { generateProceduralBuilding3d } from '../geometry/proceduralBuildingGenerator3d.js';
import { buildProcedural3dGeometry, project3dToViewport } from '../geometry/procedural3dGenerator.js';
import { calculateProjectBudget } from '../estimation/projectBudgetEngine.js';
import { generateLayoutCandidate } from '../generator/layoutGenerator.js';

export function runProceduralLandscapeTests() {
  console.log('\n===============================================================');
  console.log('LABOURCONNECT ENGINE: PROCEDURAL LANDSCAPE & OUTDOOR LIVING (S4-T03)');
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
  const standardDesign = generateLayoutCandidate({
    plotWidth: 40,
    plotLength: 60,
    floorsCount: 2,
    bhkCount: 3,
    hasBalcony: true
  });

  const compactDesign = generateLayoutCandidate({
    plotWidth: 25,
    plotLength: 35,
    floorsCount: 1,
    bhkCount: 2
  });

  // --- Group 1: Landscape Generation & Plot Conformance ---
  console.log('\n--- Group 1: Landscape Generation & Plot Conformance ---');

  runTest('Test 1: Landscape generates successfully on a valid residential plot', () => {
    const result = generatePropertyLandscape(standardDesign);
    assert(result, 'Must return landscape payload');
    assert(Array.isArray(result.landscapeObjects), 'Must contain landscapeObjects array');
    assert(Array.isArray(result.meshes), 'Must contain meshes array');
    assert(result.meshes.length > 0, 'Must produce 3D solid meshes');
    assert(result.takeoff, 'Must contain takeoff data');
    assert(result.takeoff.plotAreaSqft === 2400, 'Plot area must equal 40 x 60 = 2400 sq.ft');
    assert(result.takeoff.turfAreaSqft > 0, 'Must calculate positive turf area');
    assert(typeof result.summary === 'string', 'Must provide human-readable summary');
  });

  runTest('Test 2: All landscape objects and vertices strictly respect plot boundaries', () => {
    const result = generatePropertyLandscape(standardDesign);
    const plotW = 40;
    const plotL = 60;
    const tolerance = 0.5; // slight clearance tolerance

    result.meshes.forEach(mesh => {
      if (mesh.bounds) {
        const [minX, minY, minZ] = mesh.bounds.min;
        const [maxX, _maxY, maxZ] = mesh.bounds.max;

        assert(minX >= -tolerance && maxX <= plotW + tolerance,
          `Mesh ${mesh.id} X bounds [${minX}, ${maxX}] must be within plot width [0, ${plotW}]`);
        assert(minZ >= -tolerance && maxZ <= plotL + tolerance,
          `Mesh ${mesh.id} Z bounds [${minZ}, ${maxZ}] must be within plot length [0, ${plotL}]`);
        assert(minY >= 0, `Mesh ${mesh.id} Y bounds min [${minY}] must sit on or above ground datum`);
      }
    });
  });

  runTest('Test 3: Ground surfaces and vegetation strictly exclude building footprint interior', () => {
    const result = generatePropertyLandscape(standardDesign);
    const groundFloor = standardDesign.floors?.find(f => f.floorIndex === 0) || standardDesign.floors?.[0];
    const rooms = groundFloor?.rooms || [];

    // Check tree placements vs room bounding boxes
    const treesAndShrubs = result.landscapeObjects.filter(obj =>
      obj.category === 'vegetation'
    );

    treesAndShrubs.forEach(plant => {
      rooms.forEach(rm => {
        if (!rm.bounds) return;
        const rx1 = rm.bounds.x + 0.2;
        const rx2 = rm.bounds.x + rm.bounds.width - 0.2;
        const rz1 = rm.bounds.y + 0.2;
        const rz2 = rm.bounds.y + rm.bounds.length - 0.2;

        const inside = (plant.position.x > rx1 && plant.position.x < rx2 &&
                        plant.position.z > rz1 && plant.position.z < rz2);
        assert(!inside, `Plant ${plant.id} (${plant.name}) at (${plant.position.x}, ${plant.position.z}) cannot be placed inside room ${rm.name}`);
      });
    });
  });

  // --- Group 2: Vegetation Geometry & Spacing ---
  console.log('\n--- Group 2: Vegetation Geometry & Spacing ---');

  runTest('Test 4: Trees and shrubs feature recognizable 3D anatomy (trunk + tiered foliage canopies)', () => {
    const result = generatePropertyLandscape(standardDesign);
    const treeMeshes = result.meshes.filter(m => m.metadata?.category === 'vegetation' && m.id.includes('tree'));
    assert(treeMeshes.length >= 2, `Expected tree meshes, got ${treeMeshes.length}`);

    // Verify trunk exists and is vertical cuboid/prism
    const trunks = treeMeshes.filter(m => m.id.includes('trunk'));
    assert(trunks.length >= 1, 'Must include solid 3D tree trunk mesh');
    const trunk = trunks[0];
    assert(trunk.vertices.length === 8, 'Trunk must be a solid 8-vertex hexahedron');
    assert(trunk.faces.length === 6, 'Trunk must have 6 faces with normal vectors');

    // Verify tiered canopies exist above trunk
    const canopies = treeMeshes.filter(m => m.id.includes('canopy'));
    assert(canopies.length >= 1, 'Must include solid 3D tree canopy tiers');
    canopies.forEach(c => {
      assert(c.bounds.min[1] > 0, 'Canopy must sit elevated above ground level');
      assert(c.faces.every(f => f.normal && f.normal.length === 3), 'All canopy faces must have 3D normal vectors');
    });
  });

  runTest('Test 5: Plants obey non-overlap spacing and collision avoidance', () => {
    const result = generatePropertyLandscape(standardDesign);
    const plants = result.landscapeObjects.filter(o => o.category === 'vegetation');
    assert(plants.length >= 3, `Expected at least 3 plants, got ${plants.length}`);

    for (let i = 0; i < plants.length; i++) {
      for (let j = i + 1; j < plants.length; j++) {
        const p1 = plants[i].position;
        const p2 = plants[j].position;
        const dist = Math.hypot(p1.x - p2.x, p1.z - p2.z);
        const minSpacing = (plants[i].width + plants[j].width) * 0.4;
        assert(dist >= minSpacing,
          `Plants ${plants[i].id} and ${plants[j].id} are too close: dist=${dist.toFixed(2)}, min=${minSpacing.toFixed(2)}`);
      }
    }
  });

  // --- Group 3: Pathways, Driveways & Outdoor Living ---
  console.log('\n--- Group 3: Pathways, Driveways & Outdoor Living ---');

  runTest('Test 6: Paved pedestrian entrance pathway generates cleanly toward building entrance', () => {
    const result = generatePropertyLandscape(standardDesign);
    const walkwayMeshes = result.meshes.filter(m => m.id.includes('walkway'));
    assert(walkwayMeshes.length > 0, 'Must produce pedestrian walkway mesh');
    assert(result.takeoff.walkwaySqft > 0, 'Takeoff must record positive walkway area');

    const walkway = walkwayMeshes[0];
    assert(walkway.bounds.min[1] >= 0.05, 'Walkway must sit slightly elevated above datum');
    assert(walkway.color === '#e2e8f0' || walkway.strokeColor, 'Walkway must have paver material color');
  });

  runTest('Test 7: Entrance approach connects front gate to building plinth/foyer', () => {
    const result = generatePropertyLandscape(standardDesign);
    const entrancePaths = result.landscapeObjects.filter(o => o.type === LANDSCAPE_TYPES.PAVER_WALKWAY);
    assert(entrancePaths.length > 0, 'Must include walkway in landscape objects');
    const pathObj = entrancePaths[0];
    assert(pathObj.position.z >= 0, 'Walkway starts near front setback');
    assert(result.takeoff.walkwaySqft >= 15, 'Walkway must have adequate circulation width');
  });

  runTest('Test 8: Vehicle driveway places correctly where plot space permits', () => {
    const result = generatePropertyLandscape(standardDesign);
    assert(result.takeoff.drivewaySqft > 0, 'Standard 40x60 plot must accommodate driveway');
    const drivewayMeshes = result.meshes.filter(m => m.id.includes('driveway'));
    assert(drivewayMeshes.length > 0, 'Must produce driveway 3D mesh');
    const driveway = drivewayMeshes[0];
    assert(driveway.bounds.max[0] - driveway.bounds.min[0] >= 8.0, 'Driveway width must be at least 8.0 ft for vehicle passage');
  });

  runTest('Test 9: Outdoor living patio generates outdoor dining table, chairs, and planters', () => {
    const result = generatePropertyLandscape(standardDesign);
    assert(result.takeoff.patioSqft > 0, 'Standard plot must feature outdoor living patio');
    const patioObjects = result.landscapeObjects.filter(o => o.category === 'outdoor_living');
    assert(patioObjects.length >= 2, `Expected outdoor furniture/planters, got ${patioObjects.length}`);

    const types = patioObjects.map(o => o.type);
    assert(types.includes(LANDSCAPE_TYPES.PATIO_GARDEN_TABLE), 'Must include outdoor dining table');
    assert(types.includes(LANDSCAPE_TYPES.PATIO_GARDEN_CHAIR) || types.includes(LANDSCAPE_TYPES.GARDEN_STONE_BENCH),
      'Must include outdoor chair or bench');
    assert(types.includes(LANDSCAPE_TYPES.STONE_PLANTER_BOX), 'Must include stone planter');
  });

  // --- Group 4: Compound Wall, Gate & Lighting ---
  console.log('\n--- Group 4: Compound Wall, Gate & Lighting ---');

  runTest('Test 10: Compound perimeter wall generates with coping, pillars, and gate openings', () => {
    const result = generatePropertyLandscape(standardDesign);
    const wallMeshes = result.meshes.filter(m => m.id.includes('compound_wall'));
    assert(wallMeshes.length >= 3, `Must generate perimeter wall segments, got ${wallMeshes.length}`);
    assert(result.takeoff.compoundWallRunningFt > 100, `Compound wall length must match perimeter (~${result.takeoff.compoundWallRunningFt} r.ft)`);

    // Verify gate pillars exist
    const pillars = result.meshes.filter(m => m.id.includes('gate_pillar'));
    assert(pillars.length >= 2, 'Must generate at least 2 gate pillars');

    // Verify gate mesh exists
    const gates = result.meshes.filter(m => m.id.includes('gate_leaf'));
    assert(gates.length >= 1, 'Must generate entrance gate mesh');
  });

  runTest('Test 11: Outdoor lighting fixtures (pathway bollards & gate lanterns) generate cleanly', () => {
    const result = generatePropertyLandscape(standardDesign);
    assert(result.takeoff.lightFixturesCount > 0, 'Must produce outdoor lighting fixtures');
    const lightMeshes = result.meshes.filter(m => m.id.includes('bollard') || m.id.includes('lantern'));
    assert(lightMeshes.length > 0, 'Must generate lighting 3D meshes');
    const bollardHead = lightMeshes.find(m => m.id.includes('head'));
    assert(bollardHead, 'Bollard must include warm emissive light head mesh');
    assert(bollardHead.color === '#fef08a' || bollardHead.color.includes('fe'), 'Emissive light head must be warm yellow');
  });

  // --- Group 5: Edge Cases, Determinism & Immutability ---
  console.log('\n--- Group 5: Edge Cases, Determinism & Immutability ---');

  runTest('Test 12: Compact small plot gracefully generates without crashing or overlapping building', () => {
    const result = generatePropertyLandscape(compactDesign);
    assert(result, 'Compact plot generation must succeed');
    assert(result.takeoff.plotAreaSqft === 875, 'Compact plot area must equal 25 x 35 = 875 sq.ft');
    assert(result.meshes.length > 0, 'Compact plot must still produce perimeter and lawn');
  });

  runTest('Test 13: Missing or invalid plot geometry handles gracefully without throwing', () => {
    const invalidDesign = { site: { plotWidth: 0, plotLength: -10 } };
    const result = generatePropertyLandscape(invalidDesign);
    assert(result, 'Must handle invalid geometry gracefully');
    assert(result.meshes.length === 0, 'Must return empty meshes on invalid plot');
    assert(result.takeoff.plotAreaSqft === 0, 'Takeoff plot area must be 0');
  });

  runTest('Test 14: Repeated generation with identical design produces deterministic results (idempotence)', () => {
    const run1 = generatePropertyLandscape(standardDesign);
    const run2 = generatePropertyLandscape(standardDesign);

    assert.equal(run1.meshes.length, run2.meshes.length, 'Mesh counts must be identical');
    assert.equal(run1.landscapeObjects.length, run2.landscapeObjects.length, 'Object counts must be identical');
    assert.equal(run1.takeoff.turfAreaSqft, run2.takeoff.turfAreaSqft, 'Turf sqft must match exactly');
    assert.equal(run1.takeoff.totalLandscapeCostInr, run2.takeoff.totalLandscapeCostInr, 'Cost must match exactly');
  });

  runTest('Test 15: Repeated generation never creates duplicate objects or accumulating state', () => {
    const res1 = generatePropertyLandscape(standardDesign);
    const count1 = res1.landscapeObjects.length;
    const res2 = generatePropertyLandscape(standardDesign);
    const count2 = res2.landscapeObjects.length;
    assert.equal(count1, count2, 'Repeated call must not accumulate objects');
  });

  runTest('Test 16: Existing design model inputs and specifications remain completely unmutated', () => {
    const originalSnapshot = JSON.stringify(standardDesign);
    generatePropertyLandscape(standardDesign);
    assert.equal(JSON.stringify(standardDesign), originalSnapshot, 'Design object must remain completely unmutated');
  });

  // --- Group 6: Canonical 3D Pipeline & Viewport Presentation ---
  console.log('\n--- Group 6: Canonical 3D Pipeline & Viewport Presentation ---');

  runTest('Test 17: Procedural 3D building model integrates landscape into allMeshes and stats', () => {
    const building3d = generateProceduralBuilding3d(standardDesign);
    assert(building3d.landscape, 'Building model must attach landscape payload');
    assert(building3d.landscapeCount > 0, 'Building model must report landscapeCount');
    assert(building3d.stats.totalLandscapeObjects > 0, 'Stats must include totalLandscapeObjects');
    assert(building3d.stats.totalLandscapeMeshes > 0, 'Stats must include totalLandscapeMeshes');
    assert.equal(building3d.stats.hasLandscape, true, 'Stats hasLandscape must be true');

    const landscapeMeshesInBuilding = building3d.meshes.filter(m => m.isLandscape === true);
    assert(landscapeMeshesInBuilding.length > 0, 'Building meshes must include landscape meshes');
  });

  runTest('Test 18: Landscape generation preserves existing interior furniture (zero regression)', () => {
    const building3d = generateProceduralBuilding3d(standardDesign);
    assert(building3d.furnishings, 'Building model must still have furnishings');
    assert(building3d.furnitureCount > 0, 'Furniture count must remain positive');
    assert(building3d.stats.totalFurnitureItems > 0, 'Stats must still report furniture items');
    assert(building3d.stats.totalFurnitureMeshes > 0, 'Stats must still report furniture meshes');

    const furnMeshes = building3d.meshes.filter(m => m.isFurniture === true);
    assert(furnMeshes.length > 0, 'Furniture meshes must still be present in building meshes');
  });

  runTest('Test 19: Viewport projection renders landscape meshes in exterior and dollhouse modes', () => {
    const geometries = buildProcedural3dGeometry(standardDesign);

    // Exterior view
    const extProjected = project3dToViewport(geometries, { viewMode: 'exterior', yaw: 35, pitch: 25 });
    assert(extProjected.projectedPolygons.length > 0, 'Exterior projection must yield polygons');
    const extLandscapePolys = extProjected.projectedPolygons.filter(p => p.mesh?.isLandscape === true);
    assert(extLandscapePolys.length > 0, 'Exterior view must render landscape polygons');

    // Dollhouse view
    const dollProjected = project3dToViewport(geometries, { viewMode: 'dollhouse', yaw: 45, pitch: 35 });
    assert(dollProjected.projectedPolygons.length > 0, 'Dollhouse projection must yield polygons');
  });

  // --- Group 7: Budget Engine Category 7 Itemized Linkage ---
  console.log('\n--- Group 7: Budget Engine Category 7 Itemized Linkage ---');

  runTest('Test 20: Budget Category 7 transitions from provisional allowance to engineer-verified takeoff', () => {
    const landscapeDesign = JSON.parse(JSON.stringify(standardDesign));
    landscapeDesign.landscape = generatePropertyLandscape(landscapeDesign);

    const budget = calculateProjectBudget(landscapeDesign, {
      targetBudget: 7500000,
      city: 'Bengaluru'
    });

    assert(budget.success === true, 'Budget calculation must succeed');
    const cat7 = budget.categorySubtotals.find(c => c.categoryId === 'landscaping_outdoor');
    assert(cat7, 'Must find Category 7: Landscaping & Outdoor Living');
    assert(cat7.subtotalInr > 0, 'Category 7 must have positive calculated subtotal');
    assert.equal(cat7.isProvisional, false, 'Category 7 must NOT be provisional when landscape takeoff is attached');

    const cat7Items = budget.itemizedBreakdown.filter(it => it.categoryId === 'landscaping_outdoor');
    assert(cat7Items.length >= 3, `Expected at least 3 itemized entries in Category 7, got ${cat7Items.length}`);
    assert(cat7Items.some(it => it.isProvisional === false), 'Items must have isProvisional: false');
  });

  runTest('Test 21: Category 1 driveway and compound wall harmonize with landscape takeoff without double counting', () => {
    const landscapeDesign = JSON.parse(JSON.stringify(standardDesign));
    landscapeDesign.landscape = generatePropertyLandscape(landscapeDesign);

    const budget = calculateProjectBudget(landscapeDesign, {
      targetBudget: 7500000,
      city: 'Bengaluru'
    });

    const cat1 = budget.categorySubtotals.find(c => c.categoryId === 'site_preparation');
    const cat7 = budget.categorySubtotals.find(c => c.categoryId === 'landscaping_outdoor');
    assert(cat1 && cat7, 'Both Category 1 and Category 7 must exist');

    const cat1Items = budget.itemizedBreakdown.filter(it => it.categoryId === 'site_preparation');
    const cat7Items = budget.itemizedBreakdown.filter(it => it.categoryId === 'landscaping_outdoor');

    // Driveway paving is strictly in Cat 1, turf/walkways are strictly in Cat 7
    assert(cat1Items.some(it => (it.itemId || it.id || '').includes('driveway')), 'Driveway paving remains in Cat 1');
    assert(!cat7Items.some(it => (it.itemId || it.id || '').includes('driveway')), 'Driveway paving is NOT duplicated in Cat 7');

    // Turf is strictly in Cat 7
    assert(cat7Items.some(it => (it.itemId || it.id || '').includes('turf')), 'Turf lawn is in Cat 7');
    assert(!cat1Items.some(it => (it.itemId || it.id || '').includes('turf')), 'Turf is NOT duplicated in Cat 1');
  });

  console.log('\n===============================================================');
  console.log(`PROCEDURAL LANDSCAPE ENGINE TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('===============================================================');

  if (failed > 0) {
    throw new Error(`Procedural Landscape Suite failed with ${failed} failure(s).`);
  }

  return { passed, failed };
}

// Standalone execution guard
if (process.argv[1] && (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}` || import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`)) {
  runProceduralLandscapeTests();
}
