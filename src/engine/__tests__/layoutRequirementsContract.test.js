/**
 * LabourConnect Design Engine - Layout Requirements Contract Unit Tests
 * 
 * Verifies S2-T01 acceptance criteria:
 * 1. Requirements have a documented structured representation feeding the layout generator.
 * 2. Units of measurement are explicit and preserved.
 * 3. Provenance (EXPLICIT, INFERRED, DEFAULT, MISSING) is preserved across all room and site entities.
 * 4. Spatial infeasibility (carpet + circulation exceeding buildable envelope) is detected cleanly.
 * 5. Contradictions and missing plot dimensions are reported with detailed diagnostic guidance.
 * 6. Hard constraints (minimum dimensions, exterior requirements) are specified for every room.
 */

import { compileLayoutRequirements } from '../interpreter/layoutRequirementsContract.js';
import { REQUIREMENT_SOURCE } from '../interpreter/structuredRequirementParser.js';
import { ROOM_TYPES } from '../schema/canonicalDesignSchema.js';

export function runContractTests() {
  console.log('======================================================================');
  console.log('LABOURCONNECT ENGINE: LAYOUT REQUIREMENTS CONTRACT TEST SUITE (S2-T01)');
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
  // TEST 1: Complete Representative Vision Prompt Compilation
  // -------------------------------------------------------------------------
  const visionPrompt = "Design a modern two-floor house on a 30 ft × 40 ft plot with three bedrooms, two bathrooms, a living room, kitchen, parking, and a balcony.";
  const res1 = compileLayoutRequirements(visionPrompt);

  assert(res1.success === true, 'Test 1.1: Vision prompt compiles successfully');
  assert(res1.isValid === true, 'Test 1.2: Requirements are valid');
  assert(res1.isFeasible === true, 'Test 1.3: Requirements are spatially feasible');
  assert(res1.requirements.site.plotWidth === 30, 'Test 1.4: Site plot width is 30 ft');
  assert(res1.requirements.site.plotLength === 40, 'Test 1.5: Site plot length is 40 ft');
  assert(res1.requirements.site.inputUnits === 'feet', 'Test 1.6: Input units preserved as feet');
  assert(res1.requirements.site.plotAreaSqft === 1200, 'Test 1.7: Plot area is 1,200 sq.ft');
  assert(res1.requirements.site.buildableEnvelope.width > 0, 'Test 1.8: Buildable envelope width > 0');
  assert(res1.requirements.site.buildableEnvelope.length > 0, 'Test 1.9: Buildable envelope length > 0');
  assert(res1.requirements.building.floorsCount === 2, 'Test 1.10: Building floors count is 2');
  assert(res1.requirements.rooms.length >= 8, `Test 1.11: Generated ${res1.requirements.rooms.length} room requirement specifications`);

  // Verify room types in requirements
  const roomTypes = res1.requirements.rooms.map(r => r.type);
  assert(roomTypes.includes(ROOM_TYPES.PORTICO), 'Test 1.12: Portico requirement present');
  assert(roomTypes.includes(ROOM_TYPES.FOYER), 'Test 1.13: Foyer requirement present');
  assert(roomTypes.includes(ROOM_TYPES.LIVING), 'Test 1.14: Living room requirement present');
  assert(roomTypes.includes(ROOM_TYPES.DINING), 'Test 1.15: Dining area requirement present');
  assert(roomTypes.includes(ROOM_TYPES.KITCHEN), 'Test 1.16: Kitchen requirement present');
  assert(roomTypes.includes(ROOM_TYPES.STAIRWELL), 'Test 1.17: Stairwell requirement present');
  assert(roomTypes.includes(ROOM_TYPES.MASTER_BEDROOM), 'Test 1.18: Master bedroom requirement present');
  assert(roomTypes.includes(ROOM_TYPES.BEDROOM), 'Test 1.19: Secondary bedroom requirement present');
  assert(roomTypes.includes(ROOM_TYPES.BATHROOM), 'Test 1.20: Bathroom requirement present');
  assert(roomTypes.includes(ROOM_TYPES.BALCONY), 'Test 1.21: Balcony requirement present');

  // Verify provenance tracking
  const porticoReq = res1.requirements.rooms.find(r => r.type === ROOM_TYPES.PORTICO);
  assert(porticoReq.provenance === REQUIREMENT_SOURCE.EXPLICIT, 'Test 1.22: Portico marked EXPLICIT provenance');

  const diningReq = res1.requirements.rooms.find(r => r.type === ROOM_TYPES.DINING);
  assert(diningReq.provenance === REQUIREMENT_SOURCE.DEFAULT, 'Test 1.23: Dining marked DEFAULT provenance');

  const stairReq = res1.requirements.rooms.find(r => r.type === ROOM_TYPES.STAIRWELL);
  assert(stairReq.provenance === REQUIREMENT_SOURCE.INFERRED, 'Test 1.24: Stairwell marked INFERRED provenance');

  // -------------------------------------------------------------------------
  // TEST 2: Metric Input Units Conversion & Preservation
  // -------------------------------------------------------------------------
  const metricPrompt = "Modern house on 10m x 15m plot with 3 bedrooms";
  const res2 = compileLayoutRequirements(metricPrompt);

  assert(res2.success === true, 'Test 2.1: Metric prompt compiles successfully');
  assert(res2.requirements.site.inputUnits === 'metres', 'Test 2.2: Preserves inputUnits as "metres"');
  assert(Math.abs(res2.requirements.site.plotWidth - 32.8) < 0.5, `Test 2.3: 10m converted to ~32.8 ft (got ${res2.requirements.site.plotWidth.toFixed(1)})`);
  assert(Math.abs(res2.requirements.site.plotLength - 49.2) < 0.5, `Test 2.4: 15m converted to ~49.2 ft (got ${res2.requirements.site.plotLength.toFixed(1)})`);

  // -------------------------------------------------------------------------
  // TEST 3: Infeasible Program Rejection (Area Overflow)
  // -------------------------------------------------------------------------
  const infeasiblePrompt = {
    userPrompt: "Huge 5BHK mansion with pooja, courtyard, and parking on tiny 10x15 plot with 1 floor",
    plotWidth: 10,
    plotLength: 15,
    bhkCount: 5,
    floorsCount: 1
  };
  const res3 = compileLayoutRequirements(infeasiblePrompt);

  assert(res3.success === false, 'Test 3.1: Infeasible prompt rejected cleanly');
  assert(res3.isFeasible === false, 'Test 3.2: isFeasible is false');
  assert(res3.errors.some(e => e.includes('Spatial infeasibility')), 'Test 3.3: Returns explicit spatial infeasibility error');

  // -------------------------------------------------------------------------
  // TEST 4: Missing Plot Dimensions Rejection
  // -------------------------------------------------------------------------
  const missingPlotPrompt = "I want a 3BHK house with parking and balcony";
  const res4 = compileLayoutRequirements(missingPlotPrompt);

  assert(res4.success === false, 'Test 4.1: Missing plot dimensions rejected');
  assert(res4.missingInformation.some(m => m.field === 'plotDimensions'), 'Test 4.2: Missing plotDimensions flagged');

  // -------------------------------------------------------------------------
  // TEST 5: Contradiction Rejection
  // -------------------------------------------------------------------------
  const contraPrompt = "Single floor house with G+2 duplex on 30x40 plot";
  const res5 = compileLayoutRequirements(contraPrompt);

  assert(res5.success === false, 'Test 5.1: Contradictory floor instructions rejected');
  assert(res5.contradictions.length > 0, 'Test 5.2: Contradictions array populated');

  // -------------------------------------------------------------------------
  // TEST 6: Hard Constraints Specified on All Rooms
  // -------------------------------------------------------------------------
  let allRoomsHaveHardConstraints = true;
  for (const rm of res1.requirements.rooms) {
    if (!rm.minWidth || rm.minWidth <= 0) allRoomsHaveHardConstraints = false;
    if (!rm.minLength || rm.minLength <= 0) allRoomsHaveHardConstraints = false;
    if (!rm.minArea || rm.minArea <= 0) allRoomsHaveHardConstraints = false;
    if (typeof rm.requiresExterior !== 'boolean') allRoomsHaveHardConstraints = false;
  }
  assert(allRoomsHaveHardConstraints, 'Test 6.1: All room records contain explicit non-zero minimum dimensions and exterior constraints');

  console.log('\n======================================================================');
  console.log(`LAYOUT REQUIREMENTS CONTRACT TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('======================================================================\n');

  if (failed > 0) {
    if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
      process.exit(1);
    }
    throw new Error(`${failed} layout requirement contract tests failed.`);
  }

  return { passed, failed };
}

export const runLayoutRequirementsTests = runContractTests;

// Allow direct CLI execution
if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
  runContractTests();
}
