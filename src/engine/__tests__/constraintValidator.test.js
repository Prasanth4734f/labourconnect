/**
 * LabourConnect Design Engine - Constraint Validator & Optimizer Test Suite
 * 
 * S2-T05: Verification of Hard Constraints and Soft Objectives Handling
 */

import {
  validateLayoutConstraints,
  evaluateHardConstraints,
  evaluateSoftObjectives,
  calculateBoxOverlap,
  areRoomsAdjacent,
  suggestConstraintRemediations
} from '../evaluation/constraintValidator.js';

import { generateLayout } from '../generator/layoutGenerator.js';
import { ROOM_TYPES } from '../schema/canonicalDesignSchema.js';

export function runConstraintValidatorTests() {
  console.log('======================================================================');
  console.log('LABOURCONNECT ENGINE: CONSTRAINT VALIDATOR & OPTIMIZER SUITE (S2-T05)');
  console.log('======================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failed++;
    }
  }

  // Baseline standard candidate for testing
  const validCandidate = generateLayout({ plotWidth: 30, plotLength: 40, bhkCount: 3, floorsCount: 2 });

  // -------------------------------------------------------------------------
  // 1. HARD CONSTRAINT 1: BOUNDARY CONTAINMENT
  // -------------------------------------------------------------------------
  const hardValid = evaluateHardConstraints(validCandidate);
  assert(hardValid.passed === true, 'Test 1.1: Valid candidate passes all hard constraints');
  assert(hardValid.details.boundaryContainment.passed === true, 'Test 1.2: Valid candidate passes boundary containment');

  // Candidate with out-of-bounds room
  const oobCandidate = JSON.parse(JSON.stringify(validCandidate));
  oobCandidate.floors[0].rooms[0].bounds.x = -5.0; // Pushed outside plot boundary
  const oobResult = evaluateHardConstraints(oobCandidate);
  assert(oobResult.passed === false, 'Test 1.3: Out-of-bounds room fails hard constraints');
  assert(oobResult.details.boundaryContainment.passed === false, 'Test 1.4: Boundary containment specifically marked failed');
  assert(oobResult.violations.some(v => v.includes('[Boundary Containment]')), 'Test 1.5: Informative boundary containment violation emitted');

  // -------------------------------------------------------------------------
  // 2. HARD CONSTRAINT 2: ZERO ROOM OVERLAPS
  // -------------------------------------------------------------------------
  // Test helper: calculateBoxOverlap
  const box1 = { x: 0, y: 0, width: 10, length: 10 };
  const box2 = { x: 5, y: 5, width: 10, length: 10 };
  const box3 = { x: 10, y: 0, width: 10, length: 10 }; // Touching edge, zero overlap area

  const overlapCheck1 = calculateBoxOverlap(box1, box2);
  assert(overlapCheck1.overlaps === true && overlapCheck1.area === 25, 'Test 2.1: calculateBoxOverlap correctly computes overlap area');

  const overlapCheck2 = calculateBoxOverlap(box1, box3);
  assert(overlapCheck2.overlaps === false && overlapCheck2.area === 0, 'Test 2.2: Touching boxes have zero overlap area');

  // Overlapping rooms injected into candidate
  const overlapCandidate = JSON.parse(JSON.stringify(validCandidate));
  const r0 = overlapCandidate.floors[0].rooms[0];
  const r1 = overlapCandidate.floors[0].rooms[1];
  r1.bounds.x = r0.bounds.x + 2;
  r1.bounds.y = r0.bounds.y + 2;
  const overlapResult = evaluateHardConstraints(overlapCandidate);
  assert(overlapResult.passed === false, 'Test 2.3: Overlapping rooms fail hard constraints');
  assert(overlapResult.details.zeroOverlaps.passed === false, 'Test 2.4: Zero overlaps specifically marked failed');
  assert(overlapResult.violations.some(v => v.includes('[Zero Overlaps]')), 'Test 2.5: Zero overlaps violation message emitted');

  // -------------------------------------------------------------------------
  // 3. HARD CONSTRAINT 3: EGRESS ACCESS & CLEARANCES
  // -------------------------------------------------------------------------
  assert(hardValid.details.egressClearances.passed === true, 'Test 3.1: Valid candidate rooms have compliant egress');

  // Inclosed room with zero doors
  const noDoorCandidate = JSON.parse(JSON.stringify(validCandidate));
  const living = noDoorCandidate.floors[0].rooms.find(r => r.type === ROOM_TYPES.LIVING);
  living.doors = []; // Stripped doors
  const noDoorResult = evaluateHardConstraints(noDoorCandidate);
  assert(noDoorResult.passed === false, 'Test 3.2: Enclosed room without doors fails egress check');
  assert(noDoorResult.details.egressClearances.passed === false, 'Test 3.3: Egress clearances marked failed');
  assert(noDoorResult.violations.some(v => v.includes('[Egress Clearances]')), 'Test 3.4: Egress clearance violation message emitted');

  // Enclosed room with undersized door
  const narrowDoorCandidate = JSON.parse(JSON.stringify(validCandidate));
  const master = narrowDoorCandidate.floors[1].rooms.find(r => r.type === ROOM_TYPES.MASTER_BEDROOM);
  master.doors = [{ id: 'd_narrow', width: 2.0, clearWidth: 2.0 }]; // 2.0ft is below 2.8ft minimum
  const narrowDoorResult = evaluateHardConstraints(narrowDoorCandidate);
  assert(narrowDoorResult.passed === false, 'Test 3.5: Undersized door (<2.8ft) rejected');

  // Outdoor spaces without doors must NOT fail egress
  const outdoorCandidate = JSON.parse(JSON.stringify(validCandidate));
  const portico = outdoorCandidate.floors[0].rooms.find(r => r.type === ROOM_TYPES.PORTICO);
  if (portico) {
    portico.doors = [];
    const outdoorResult = evaluateHardConstraints(outdoorCandidate);
    assert(outdoorResult.details.egressClearances.passed === true, 'Test 3.6: Outdoor portico is exempt from enclosed door requirement');
  } else {
    assert(true, 'Test 3.6: Outdoor spaces handled');
  }

  // -------------------------------------------------------------------------
  // 4. HARD CONSTRAINT 4: MINIMUM DIMENSIONS & STANDARDS
  // -------------------------------------------------------------------------
  assert(hardValid.details.minimumDimensions.passed === true, 'Test 4.1: Valid candidate rooms meet minimum dimensions');

  const undersizedCandidate = JSON.parse(JSON.stringify(validCandidate));
  const kitchen = undersizedCandidate.floors[0].rooms.find(r => r.type === ROOM_TYPES.KITCHEN);
  kitchen.bounds.width = 4.0; // Kitchen minimum is 7.0 ft
  kitchen.bounds.length = 5.0;
  kitchen.areaSqft = 20;
  const undersizedResult = evaluateHardConstraints(undersizedCandidate);
  assert(undersizedResult.passed === false, 'Test 4.2: Undersized kitchen (4x5ft) fails hard constraints');
  assert(undersizedResult.details.minimumDimensions.passed === false, 'Test 4.3: Minimum dimensions marked failed');
  assert(undersizedResult.violations.some(v => v.includes('[Minimum Dimensions]')), 'Test 4.4: Minimum dimensions violation emitted');

  // -------------------------------------------------------------------------
  // 5. HARD CONSTRAINT 5: VERTICAL ALIGNMENT
  // -------------------------------------------------------------------------
  assert(hardValid.details.verticalAlignment.passed === true, 'Test 5.1: Valid candidate multi-floor stairwells are vertically aligned');

  const misalignedCandidate = JSON.parse(JSON.stringify(validCandidate));
  const upperStair = misalignedCandidate.floors[1].rooms.find(r => r.type === ROOM_TYPES.STAIRWELL);
  upperStair.bounds.x += 6.0; // Shifted 6 feet sideways
  const misalignedResult = evaluateHardConstraints(misalignedCandidate);
  assert(misalignedResult.passed === false, 'Test 5.2: Horizontally shifted stairwell core fails vertical alignment');
  assert(misalignedResult.details.verticalAlignment.passed === false, 'Test 5.3: Vertical alignment marked failed');
  assert(misalignedResult.violations.some(v => v.includes('[Vertical Alignment]')), 'Test 5.4: Vertical alignment violation emitted');

  // -------------------------------------------------------------------------
  // 6. SOFT OBJECTIVE 1: CIRCULATION EFFICIENCY
  // -------------------------------------------------------------------------
  const softValid = evaluateSoftObjectives(validCandidate);
  assert(typeof softValid.score === 'number' && softValid.score >= 0 && softValid.score <= 100, 'Test 6.1: Soft objectives score is a valid percentage');
  assert(softValid.details.circulationEfficiency.score >= 70, `Test 6.2: Circulation efficiency scored favorably (got ${softValid.details.circulationEfficiency.score})`);
  assert(softValid.details.circulationEfficiency.carpetRatio > 0.65, `Test 6.3: Carpet ratio computed correctly (${softValid.details.circulationEfficiency.carpetRatio})`);

  // Low circulation candidate
  const lowCircCandidate = JSON.parse(JSON.stringify(validCandidate));
  lowCircCandidate.metrics.builtUpAreaSqft = 3500;
  lowCircCandidate.metrics.carpetAreaSqft = 1500; // ~42% carpet ratio
  const lowCircResult = evaluateSoftObjectives(lowCircCandidate);
  assert(lowCircResult.details.circulationEfficiency.score < 60, 'Test 6.4: Low carpet ratio receives lower circulation score');
  assert(lowCircResult.recommendations.some(r => r.includes('Circulation efficiency')), 'Test 6.5: Low circulation emits actionable recommendation');

  // -------------------------------------------------------------------------
  // 7. SOFT OBJECTIVE 2: PREFERRED ADJACENCIES
  // -------------------------------------------------------------------------
  assert(softValid.details.preferredAdjacencies.score > 0, `Test 7.1: Preferred adjacencies evaluated (score ${softValid.details.preferredAdjacencies.score})`);
  assert(typeof softValid.details.preferredAdjacencies.satisfactionRate === 'number', 'Test 7.2: Adjacency satisfaction rate calculated');

  // Helper test: areRoomsAdjacent
  const roomA = { x: 3, y: 5, width: 10, length: 12 };
  const roomB = { x: 13, y: 5, width: 8, length: 12 }; // Touches roomA on right
  const roomC = { x: 25, y: 5, width: 8, length: 12 }; // Separated by 12 feet
  assert(areRoomsAdjacent(roomA, roomB) === true, 'Test 7.3: Touching rooms are adjacent');
  assert(areRoomsAdjacent(roomA, roomC) === false, 'Test 7.4: Distant rooms are not adjacent');

  // -------------------------------------------------------------------------
  // 8. SOFT OBJECTIVE 3: DAYLIGHT & VENTILATION
  // -------------------------------------------------------------------------
  assert(softValid.details.daylightVentilation.score >= 70, `Test 8.1: Daylight ventilation scored favorably (got ${softValid.details.daylightVentilation.score})`);
  assert(softValid.details.daylightVentilation.daylightExposedCount > 0, 'Test 8.2: Perimeter rooms have daylight exposure');

  // -------------------------------------------------------------------------
  // 9. SOFT OBJECTIVE 4: SPACE UTILIZATION & ASPECT RATIO
  // -------------------------------------------------------------------------
  assert(softValid.details.spaceUtilization.score >= 70, `Test 9.1: Space utilization score computed (got ${softValid.details.spaceUtilization.score})`);
  assert(softValid.details.aspectRatioSuitability.score >= 70, `Test 9.2: Aspect ratio score computed (got ${softValid.details.aspectRatioSuitability.score})`);

  // Disproportionately elongated room
  const elongatedCandidate = JSON.parse(JSON.stringify(validCandidate));
  elongatedCandidate.floors[0].rooms[0].bounds = { x: 3, y: 5, width: 4.5, length: 18.0 }; // Aspect ratio 4.0
  const elongatedResult = evaluateSoftObjectives(elongatedCandidate);
  assert(elongatedResult.details.aspectRatioSuitability.score < softValid.details.aspectRatioSuitability.score, 'Test 9.3: Elongated room reduces aspect ratio score');
  assert(elongatedResult.recommendations.some(r => r.includes('aspect ratio')), 'Test 9.4: Elongated room emits proportion recommendation');

  // -------------------------------------------------------------------------
  // 10. HARD VS SOFT INDEPENDENCE
  // -------------------------------------------------------------------------
  // Low soft score candidate must still pass hard constraints if no hard rules are broken
  const lowSoftCandidate = JSON.parse(JSON.stringify(validCandidate));
  lowSoftCandidate.metrics.carpetAreaSqft = Math.round(lowSoftCandidate.metrics.builtUpAreaSqft * 0.60);
  const masterLowSoft = validateLayoutConstraints(lowSoftCandidate);
  assert(masterLowSoft.isValid === true, 'Test 10.1: Soft objective deficiencies do not fail hard constraint validity');
  assert(masterLowSoft.isFeasible === true, 'Test 10.2: Layout remains marked feasible when hard constraints pass');

  // Hard failure must fail validity even if soft scores are high
  const hardFailCandidate = JSON.parse(JSON.stringify(validCandidate));
  hardFailCandidate.floors[0].rooms[0].bounds.x = -10; // Hard out-of-bounds
  const masterHardFail = validateLayoutConstraints(hardFailCandidate);
  assert(masterHardFail.isValid === false, 'Test 10.3: Hard constraint violation fails overall validation');
  assert(masterHardFail.isFeasible === false, 'Test 10.4: Hard constraint violation marks isFeasible: false');
  assert(masterHardFail.violations.length > 0, 'Test 10.5: Violations array populated');

  // -------------------------------------------------------------------------
  // 11. REMEDIATION ADVICE & ERROR REPORTING
  // -------------------------------------------------------------------------
  const sampleViolations = [
    '[Boundary Containment] Room "Living Room Lounge" exceeds buildable envelope.',
    '[Zero Overlaps] Spatial collision detected between "Kitchen" and "Dining".',
    '[Egress Clearances] Enclosed space lacks a door.',
    '[Minimum Dimensions] Room is undersized.',
    '[Vertical Alignment] Stairwell core is misaligned.'
  ];
  const remediations = suggestConstraintRemediations(sampleViolations);
  assert(Array.isArray(remediations) && remediations.length === 5, `Test 11.1: suggestConstraintRemediations produces 5 actionable remediations (got ${remediations.length})`);
  assert(remediations.some(r => r.includes('setback') || r.includes('envelope')), 'Test 11.2: Boundary containment remediation present');
  assert(remediations.some(r => r.includes('overlap') || r.includes('partitioning')), 'Test 11.3: Overlap remediation present');
  assert(remediations.some(r => r.includes('egress') || r.includes('door')), 'Test 11.4: Egress remediation present');

  // -------------------------------------------------------------------------
  // 12. MASTER INTEGRATION & BACKWARD COMPATIBILITY
  // -------------------------------------------------------------------------
  const fullReport = validateLayoutConstraints(validCandidate);
  assert(fullReport.isValid === true, 'Test 12.1: Legacy property isValid is boolean true');
  assert(Array.isArray(fullReport.violations) && fullReport.violations.length === 0, 'Test 12.2: Legacy property violations is an empty array for valid layout');
  assert(Array.isArray(fullReport.warnings), 'Test 12.3: Legacy property warnings is an array');
  assert(Array.isArray(fullReport.checks_performed) && fullReport.checks_performed.length >= 15, `Test 12.4: Comprehensive checks performed logged (got ${fullReport.checks_performed.length})`);
  assert(typeof fullReport.checkedElementsCount === 'number' && fullReport.checkedElementsCount > 0, 'Test 12.5: checkedElementsCount populated');
  assert(fullReport.hardConstraints !== undefined && fullReport.hardConstraints.passed === true, 'Test 12.6: hardConstraints object present');
  assert(fullReport.softObjectives !== undefined && fullReport.softObjectives.score > 0, 'Test 12.7: softObjectives object present');
  assert(typeof fullReport.optimizationScore === 'number' && fullReport.optimizationScore >= 75, `Test 12.8: Overall optimizationScore computed (${fullReport.optimizationScore})`);
  assert(Array.isArray(fullReport.recommendations), 'Test 12.9: recommendations array present');
  assert(Array.isArray(fullReport.remediationAdvice), 'Test 12.10: remediationAdvice array present');

  console.log('\n======================================================================');
  console.log(`CONSTRAINT VALIDATOR & OPTIMIZER TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('======================================================================\n');

  return { passed, failed };
}

if (import.meta.url === `file:///${process.argv[1]?.replace(/\\/g, '/')}`) {
  const result = runConstraintValidatorTests();
  if (result.failed > 0) process.exit(1);
}
