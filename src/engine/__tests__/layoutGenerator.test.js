/**
 * LabourConnect Design Engine - Algorithmic 2D Layout Generator Test Suite
 * 
 * S2-T04: Verifies the procedural spatial layout generation engine:
 * 1. Candidate structure: candidateId, success, isFeasible, site, metrics, floors, structuralGrid, generationMetadata.
 * 2. Real geometric placement: coordinates, bounds, non-overlap, boundary containment, positive dimensions.
 * 3. Polygons, walls, doors, and windows generation.
 * 4. Multi-floor vertical structural alignment (stairwell column stacking).
 * 5. Plot size diversity (narrow 20x40, medium 30x40, standard 30x50, large 40x60, luxury 50x80).
 * 6. BHK diversity (1BHK, 2BHK, 3BHK, 4BHK).
 * 7. Archetype and variation diversity.
 * 8. Honest infeasibility rejection on impossible plots.
 * 9. Integration with geometricValidator, similarityEngine, designScorer, and 3D pipeline.
 */

import { generateLayout, generateLayoutCandidate, ENGINE_GENERATOR_VERSION } from '../generator/layoutGenerator.js';
import { validateArchitectureGeometry } from '../evaluation/geometricValidator.js';
import { calculateStructuralSimilarity } from '../evaluation/similarityEngine.js';
import { scoreDesignQuality } from '../evaluation/designScorer.js';
import { buildProcedural3dGeometry } from '../geometry/procedural3dGenerator.js';
import { ROOM_TYPES } from '../schema/canonicalDesignSchema.js';

export function runLayoutGeneratorTests() {
  console.log('======================================================================');
  console.log('LABOURCONNECT ENGINE: PROCEDURAL LAYOUT GENERATOR TEST SUITE (S2-T04)');
  console.log('======================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, details = '') {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName} - ${details}`);
      failed++;
    }
  }

  // -------------------------------------------------------------------------
  // TEST 1: Candidate Structure & Complete Architectural Representation
  // -------------------------------------------------------------------------
  const specs30x40 = {
    plotWidth: 30,
    plotLength: 40,
    bhkCount: 3,
    floorsCount: 2,
    facingDirection: 'East',
    amenities: { hasParking: true, hasBalcony: true, hasPooja: true }
  };

  const cand1 = generateLayout(specs30x40, { seed: 10401, variationIndex: 0 });

  assert(cand1 !== null && typeof cand1 === 'object', 'Test 1.1: Returns candidate object');
  assert(cand1.success === true, 'Test 1.2: Candidate marked success: true');
  assert(cand1.isFeasible === true, 'Test 1.3: Candidate marked isFeasible: true');
  assert(typeof cand1.candidateId === 'string' && cand1.candidateId.length > 0, `Test 1.4: Emits candidateId (${cand1.candidateId})`);
  assert(cand1.seed === 10401, 'Test 1.5: Seed preserved');
  assert(cand1.variationIndex === 0, 'Test 1.6: VariationIndex preserved');
  assert(cand1.site !== null && typeof cand1.site === 'object', 'Test 1.7: Site definition present');
  assert(cand1.site.plotWidth === 30, 'Test 1.8: Site plotWidth is 30');
  assert(cand1.site.plotLength === 40, 'Test 1.9: Site plotLength is 40');
  assert(cand1.site.buildableEnvelope.width > 0, 'Test 1.10: Buildable envelope width > 0');
  assert(cand1.site.buildableEnvelope.length > 0, 'Test 1.11: Buildable envelope length > 0');
  assert(cand1.metrics !== null && typeof cand1.metrics === 'object', 'Test 1.12: Metrics structure present');
  assert(cand1.metrics.builtUpAreaSqft > 0, `Test 1.13: Built-up area calculated (${cand1.metrics.builtUpAreaSqft} sq.ft)`);
  assert(cand1.metrics.carpetAreaSqft > 0, `Test 1.14: Carpet area calculated (${cand1.metrics.carpetAreaSqft} sq.ft)`);
  assert(cand1.metrics.fsiAchieved > 0, `Test 1.15: FSI achieved calculated (${cand1.metrics.fsiAchieved})`);
  assert(cand1.generationMetadata !== null, 'Test 1.16: Generation metadata present');
  assert(cand1.generationMetadata.engineVersion === ENGINE_GENERATOR_VERSION, 'Test 1.17: Engine version recorded in metadata');
  assert(cand1.generationMetadata.candidateStatus === 'FEASIBLE', 'Test 1.18: Candidate status marked FEASIBLE');
  assert(cand1.adjacencyGraph !== null, 'Test 1.19: Topological relationship graph attached to candidate');

  // -------------------------------------------------------------------------
  // TEST 2: Geometric Room Placement & Polygon Integrity
  // -------------------------------------------------------------------------
  assert(Array.isArray(cand1.floors) && cand1.floors.length === 3, `Test 2.1: Floors array has 3 levels (G+1+Terrace), got ${cand1.floors.length}`);

  let allRoomsHaveValidBounds = true;
  let allRoomsHavePolygons = true;
  let allRoomsHaveLabels = true;
  let allRoomsHaveOpenings = true;
  let allRoomsHaveUniqueIds = true;
  const seenIds = new Set();

  cand1.floors.forEach(fl => {
    fl.rooms.forEach(rm => {
      const b = rm.bounds;
      if (!b || b.x < 0 || b.y < 0 || b.width <= 0 || b.length <= 0) {
        allRoomsHaveValidBounds = false;
      }
      if (!Array.isArray(rm.polygon) || rm.polygon.length !== 4) {
        allRoomsHavePolygons = false;
      }
      if (typeof rm.dimensionsLabel !== 'string' || !rm.dimensionsLabel.includes("'")) {
        allRoomsHaveLabels = false;
      }
      if (!Array.isArray(rm.doors) || !Array.isArray(rm.windows)) {
        allRoomsHaveOpenings = false;
      }
      if (seenIds.has(rm.id)) {
        allRoomsHaveUniqueIds = false;
      }
      seenIds.add(rm.id);
    });
  });

  assert(allRoomsHaveValidBounds, 'Test 2.2: Every room has strictly positive non-negative bounding coordinates');
  assert(allRoomsHavePolygons, 'Test 2.3: Every room has 4-vertex polygon with explicit coordinates');
  assert(allRoomsHaveLabels, 'Test 2.4: Every room has architectural dimensions label');
  assert(allRoomsHaveOpenings, 'Test 2.5: Every room has doors and windows arrays');
  assert(allRoomsHaveUniqueIds, 'Test 2.6: Every room has a globally unique element identifier');

  // -------------------------------------------------------------------------
  // TEST 3: Strict Boundary Containment & Collision-Free Geometry
  // -------------------------------------------------------------------------
  const env1 = cand1.site.buildableEnvelope;
  let allRoomsContained = true;

  cand1.floors.forEach(fl => {
    fl.rooms.forEach(rm => {
      const b = rm.bounds;
      if (b.x < env1.x - 0.2 || (b.x + b.width) > env1.x + env1.width + 0.2) allRoomsContained = false;
      if (b.y < env1.y - 0.2 || (b.y + b.length) > env1.y + env1.length + 0.2) allRoomsContained = false;
    });
  });

  assert(allRoomsContained, 'Test 3.1: All rooms strictly fit inside site buildable envelope');

  // Verify through canonical 10-check geometric validator
  const validation1 = validateArchitectureGeometry(cand1);
  assert(validation1.valid === true, 'Test 3.2: Geometric validation passes all 10 canonical checks');
  assert(validation1.errors.length === 0, `Test 3.3: Zero geometric validation errors (got: ${validation1.errors.join('; ')})`);

  // -------------------------------------------------------------------------
  // TEST 4: Multi-Floor Vertical Structural Alignment (Stairwell Core)
  // -------------------------------------------------------------------------
  const groundStair = cand1.floors[0].rooms.find(r => r.type === ROOM_TYPES.STAIRWELL);
  const upperStair = cand1.floors[1].rooms.find(r => r.type === ROOM_TYPES.STAIRWELL);
  const terraceMumty = cand1.floors[2].rooms.find(r => r.type === ROOM_TYPES.STAIRWELL);

  assert(groundStair !== undefined, 'Test 4.1: Ground floor contains stairwell');
  assert(upperStair !== undefined, 'Test 4.2: First floor contains stairwell');
  assert(terraceMumty !== undefined, 'Test 4.3: Terrace level contains stairhead mumty');

  const stairXMatch = (groundStair.bounds.x === upperStair.bounds.x) && (groundStair.bounds.x === terraceMumty.bounds.x);
  const stairYMatch = (groundStair.bounds.y === upperStair.bounds.y) && (groundStair.bounds.y === terraceMumty.bounds.y);
  const stairWMatch = (groundStair.bounds.width === upperStair.bounds.width) && (groundStair.bounds.width === terraceMumty.bounds.width);
  const stairLMatch = (groundStair.bounds.length === upperStair.bounds.length) && (groundStair.bounds.length === terraceMumty.bounds.length);

  assert(stairXMatch && stairYMatch && stairWMatch && stairLMatch, 'Test 4.4: Stairwell bounding box is identical across Ground, Upper, and Terrace floors (Z-axis column stacking)');

  // -------------------------------------------------------------------------
  // TEST 5: Plot Size Versatility
  // -------------------------------------------------------------------------
  // 5.1 Narrow Plot (20x40)
  const narrowCand = generateLayout({ plotWidth: 20, plotLength: 40, bhkCount: 2, floorsCount: 1 });
  assert(narrowCand.success === true, 'Test 5.1: Narrow 20x40 plot generates successfully');
  assert(narrowCand.floors[0].rooms.length >= 6, `Test 5.2: Narrow plot has allocated rooms (got ${narrowCand.floors[0].rooms.length})`);
  const narrowVal = validateArchitectureGeometry(narrowCand);
  assert(narrowVal.valid === true, 'Test 5.3: Narrow plot geometry is 100% valid');

  // 5.2 Medium Plot (30x40)
  const medCand = generateLayout({ plotWidth: 30, plotLength: 40, bhkCount: 3, floorsCount: 2 });
  assert(medCand.success === true, 'Test 5.4: Medium 30x40 plot generates successfully');
  assert(validateArchitectureGeometry(medCand).valid === true, 'Test 5.5: Medium plot geometry is valid');

  // 5.3 Standard Plot (30x50)
  const stdCand = generateLayout({ plotWidth: 30, plotLength: 50, bhkCount: 3, floorsCount: 2 });
  assert(stdCand.success === true, 'Test 5.6: Standard 30x50 plot generates successfully');
  assert(validateArchitectureGeometry(stdCand).valid === true, 'Test 5.7: Standard plot geometry is valid');

  // 5.4 Large Plot (40x60)
  const largeCand = generateLayout({ plotWidth: 40, plotLength: 60, bhkCount: 4, floorsCount: 2 });
  assert(largeCand.success === true, 'Test 5.8: Large 40x60 plot generates successfully');
  assert(validateArchitectureGeometry(largeCand).valid === true, 'Test 5.9: Large plot geometry is valid');

  // 5.5 Luxury Villa Plot (50x80)
  const luxuryCand = generateLayout({ plotWidth: 50, plotLength: 80, bhkCount: 4, floorsCount: 2 });
  assert(luxuryCand.success === true, 'Test 5.10: Luxury 50x80 plot generates successfully');
  assert(validateArchitectureGeometry(luxuryCand).valid === true, 'Test 5.11: Luxury plot geometry is valid');
  assert(luxuryCand.metrics.builtUpAreaSqft > narrowCand.metrics.builtUpAreaSqft * 3.0, 'Test 5.12: Luxury built-up area is realistically > 3x compact');

  // -------------------------------------------------------------------------
  // TEST 6: BHK Configuration Versatility
  // -------------------------------------------------------------------------
  // 1BHK Single Floor
  const bhk1 = generateLayout({ plotWidth: 25, plotLength: 35, bhkCount: 1, floorsCount: 1 });
  assert(bhk1.success === true, 'Test 6.1: 1BHK single-floor generates successfully');
  assert(bhk1.floors.length === 1, 'Test 6.2: 1BHK has 1 floor level');
  assert(!bhk1.floors[0].rooms.some(r => r.type === ROOM_TYPES.STAIRWELL), 'Test 6.3: 1BHK single floor has no stairwell');

  // 2BHK Single Floor
  const bhk2 = generateLayout({ plotWidth: 30, plotLength: 40, bhkCount: 2, floorsCount: 1 });
  assert(bhk2.success === true, 'Test 6.4: 2BHK single-floor generates successfully');
  const bhk2BedCount = bhk2.floors[0].rooms.filter(r => r.type === ROOM_TYPES.BEDROOM || r.type === ROOM_TYPES.MASTER_BEDROOM).length;
  assert(bhk2BedCount === 2, `Test 6.5: 2BHK single floor contains 2 bedrooms (got ${bhk2BedCount})`);

  // 4BHK Two Floors
  const bhk4 = generateLayout({ plotWidth: 40, plotLength: 60, bhkCount: 4, floorsCount: 2 });
  assert(bhk4.success === true, 'Test 6.6: 4BHK two-floor generates successfully');
  const upperBeds = bhk4.floors[1].rooms.filter(r => r.type === ROOM_TYPES.BEDROOM || r.type === ROOM_TYPES.MASTER_BEDROOM).length;
  assert(upperBeds >= 2, `Test 6.7: 4BHK upper floor contains bedrooms (got ${upperBeds})`);

  // -------------------------------------------------------------------------
  // TEST 7: Spatial Archetype & Variation Diversity
  // -------------------------------------------------------------------------
  const var0 = generateLayout(specs30x40, { seed: 55555, variationIndex: 0 });
  const var1 = generateLayout(specs30x40, { seed: 55555, variationIndex: 1 });

  assert(var0.success === true && var1.success === true, 'Test 7.1: Both variations generate successfully');
  const sim = calculateStructuralSimilarity(var0, var1);
  assert(sim < 0.85, `Test 7.2: Variations are structurally distinct (similarity: ${(sim * 100).toFixed(1)}% < 85%)`);

  // Verify stairwell position flips between variations
  const stairX0 = var0.floors[0].rooms.find(r => r.type === ROOM_TYPES.STAIRWELL).bounds.x;
  const stairX1 = var1.floors[0].rooms.find(r => r.type === ROOM_TYPES.STAIRWELL).bounds.x;
  assert(stairX0 !== stairX1, `Test 7.3: Stairwell location flips across variations (var0 X: ${stairX0}, var1 X: ${stairX1})`);

  // -------------------------------------------------------------------------
  // TEST 8: Honest Infeasibility Handling
  // -------------------------------------------------------------------------
  // 8.1 Spatially impossible tiny plot
  const inf1 = generateLayout({ plotWidth: 8, plotLength: 10, bhkCount: 3, floorsCount: 1 });
  assert(inf1.success === false, 'Test 8.1: Impossible 8x10 plot returns success: false');
  assert(inf1.isFeasible === false, 'Test 8.2: Impossible plot returns isFeasible: false');
  assert(inf1.candidateId === null, 'Test 8.3: Infeasible result has candidateId: null');
  assert(inf1.errors && inf1.errors.length > 0, `Test 8.4: Infeasible result has diagnostic errors (${inf1.errors[0]})`);

  // 8.2 Huge room count on tiny envelope
  const inf2 = generateLayout({ plotWidth: 15, plotLength: 20, bhkCount: 5, floorsCount: 1 });
  assert(inf2.success === false, 'Test 8.5: 5BHK on 15x20 plot returns success: false');
  assert(inf2.isFeasible === false, 'Test 8.6: 5BHK on 15x20 plot returns isFeasible: false');

  // 8.3 Negative or zero plot dimensions
  const inf3 = generateLayout({ plotWidth: -30, plotLength: 40 });
  assert(inf3.success === false, 'Test 8.7: Negative plot width rejected');

  // 8.4 Null or invalid input
  const inf4 = generateLayout(null);
  assert(inf4.success === false, 'Test 8.8: Null input rejected cleanly without throwing');

  // -------------------------------------------------------------------------
  // TEST 9: Wall & Structural Grid Generation
  // -------------------------------------------------------------------------
  const walls = cand1.floors[0].walls;
  assert(Array.isArray(walls) && walls.length >= 4, `Test 9.1: Walls generated (got ${walls.length})`);
  const extWalls = walls.filter(w => w.type === 'exterior');
  assert(extWalls.length === 4, `Test 9.2: Exactly 4 exterior perimeter walls generated, got ${extWalls.length}`);

  const grid = cand1.structuralGrid;
  assert(grid !== null && typeof grid === 'object', 'Test 9.3: Structural grid object present');
  assert(grid.columnCount > 0, `Test 9.4: RCC structural columns generated (got ${grid.columnCount})`);
  assert(grid.beamCount > 0, `Test 9.5: Tie beams generated (got ${grid.beamCount})`);

  // -------------------------------------------------------------------------
  // TEST 10: Downstream Engine Compatibility (3D & Scoring)
  // -------------------------------------------------------------------------
  // Verify 3D geometry generator consumes candidate
  const geom3d = buildProcedural3dGeometry(cand1);
  assert(geom3d !== null && Array.isArray(geom3d.rooms3d), 'Test 10.1: Procedural 3D geometry generated from layout candidate');
  assert(geom3d.rooms3d.length === cand1.metrics.roomCountTotal, `Test 10.2: 3D room count (${geom3d.rooms3d.length}) matches total layout room count (${cand1.metrics.roomCountTotal})`);

  // Verify Quality Scorer evaluates candidate
  const quality = scoreDesignQuality(cand1, specs30x40);
  assert(quality !== null && typeof quality.overall === 'number', 'Test 10.3: Design quality score evaluated');
  assert(quality.overall >= 50 && quality.overall <= 100, `Test 10.4: Quality score is within valid range (got ${quality.overall})`);

  // Formal alias function verification
  const candAlias = generateLayoutCandidate(specs30x40);
  assert(candAlias.success === true, 'Test 10.5: generateLayoutCandidate alias produces valid candidate');

  console.log('\n======================================================================');
  console.log(`PROCEDURAL LAYOUT GENERATOR TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('======================================================================\n');

  return { passed, failed };
}

if (import.meta.url === `file:///${process.argv[1]?.replace(/\\/g, '/')}`) {
  const result = runLayoutGeneratorTests();
  if (result.failed > 0) process.exit(1);
}
