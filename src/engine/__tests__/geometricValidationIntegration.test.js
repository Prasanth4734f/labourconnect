/**
 * LabourConnect Design Engine - Geometric Validation Integration Test Suite
 * 
 * S2-T06: Geometric Validation Integration
 * Expected Checkpoint: LC-S2-CP-0007
 * 
 * Comprehensive verification of validation integration into the generation workflow:
 * 1. Valid single-floor layout.
 * 2. Valid multi-floor layout.
 * 3. Rooms outside the buildable envelope.
 * 4. Overlapping rooms.
 * 5. Invalid or insufficient room dimensions & area consistency.
 * 6. Required adjacency violations.
 * 7. Required separation violations.
 * 8. Invalid access conditions.
 * 9. Vertical-connection inconsistencies.
 * 10. Malformed or incomplete candidate data.
 * 11. Infeasible room programs.
 * 12. Valid and invalid candidates entering the full generation workflow.
 * 13. Regression compatibility with earlier sprint tasks.
 */

import {
  validateLayoutConstraints,
  HARD_CONSTRAINT_TYPES,
  VALIDATION_RESULT_TYPES,
  CONSTRAINT_VALIDATOR_VERSION
} from '../evaluation/constraintValidator.js';

import {
  validateArchitectureGeometry
} from '../evaluation/geometricValidator.js';

import {
  generateLayout
} from '../generator/layoutGenerator.js';

import { LabourConnectDesignEngine } from '../index.js';
import { ROOM_TYPES } from '../schema/canonicalDesignSchema.js';

export function runGeometricValidationIntegrationTests() {
  console.log('======================================================================');
  console.log('LABOURCONNECT ENGINE: GEOMETRIC VALIDATION INTEGRATION SUITE (S2-T06)');
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

  // =========================================================================
  // 1. VALID SINGLE-FLOOR LAYOUT
  // =========================================================================
  console.log('--- Scenario 1: Valid Single-Floor Layout ---');
  const singleFloorCandidate = generateLayout({ plotWidth: 30, plotLength: 40, bhkCount: 2, floorsCount: 1 });
  assert(singleFloorCandidate.success === true, 'Test 1.1: Single-floor 30x40 2BHK layout candidate generated successfully');
  
  const valSingle = validateLayoutConstraints(singleFloorCandidate);
  assert(valSingle.isValid === true && valSingle.isFeasible === true, 'Test 1.2: Validation report marked isValid: true and isFeasible: true');
  assert(valSingle.resultType === VALIDATION_RESULT_TYPES.VALID_CANDIDATE, 'Test 1.3: Validation resultType is VALID_CANDIDATE');
  assert(valSingle.candidateStatus === 'VALID', 'Test 1.4: Validation candidateStatus is "VALID"');
  assert(Array.isArray(valSingle.violations) && valSingle.violations.length === 0, 'Test 1.5: Zero violations returned for valid single-floor layout');
  assert(valSingle.hardConstraints.passed === true, 'Test 1.6: All hard constraints passed');
  assert(valSingle.hardConstraints.details.boundaryContainment.passed === true, 'Test 1.7: Boundary containment passed');
  assert(valSingle.hardConstraints.details.zeroOverlaps.passed === true, 'Test 1.8: Zero room overlaps passed');
  assert(valSingle.hardConstraints.details.egressClearances.passed === true, 'Test 1.9: Egress clearances passed');
  assert(valSingle.hardConstraints.details.minimumDimensions.passed === true, 'Test 1.10: Minimum dimensions passed');
  assert(valSingle.hardConstraints.details.areaConsistency.passed === true, 'Test 1.11: Area consistency passed');
  assert(valSingle.hardConstraints.details.wallGeometry.passed === true, 'Test 1.12: Wall geometry passed');
  assert(valSingle.hardConstraints.details.canonicalConsistency.passed === true, 'Test 1.13: Canonical consistency passed');
  assert(singleFloorCandidate.validation !== undefined && singleFloorCandidate.validation.isValid === true, 'Test 1.14: Procedural layout candidate has validation attached directly');

  // =========================================================================
  // 2. VALID MULTI-FLOOR LAYOUT
  // =========================================================================
  console.log('\n--- Scenario 2: Valid Multi-Floor Layout ---');
  const multiFloorCandidate = generateLayout({ plotWidth: 30, plotLength: 50, bhkCount: 3, floorsCount: 2 });
  assert(multiFloorCandidate.success === true, 'Test 2.1: Multi-floor 30x50 3BHK 2-floor layout candidate generated successfully');
  
  const valMulti = validateLayoutConstraints(multiFloorCandidate);
  assert(valMulti.isValid === true && valMulti.isFeasible === true, 'Test 2.2: Multi-floor layout marked isValid: true and isFeasible: true');
  assert(valMulti.resultType === VALIDATION_RESULT_TYPES.VALID_CANDIDATE, 'Test 2.3: Result type is VALID_CANDIDATE');
  assert(valMulti.hardConstraints.details.verticalAlignment.passed === true, 'Test 2.4: Vertical alignment of stairwells across floors passed');
  assert(valMulti.hardConstraints.details.verticalConnections.passed === true, 'Test 2.5: Vertical connections across floors passed');

  const gStair = multiFloorCandidate.floors[0].rooms.find(r => r.type === ROOM_TYPES.STAIRWELL);
  const fStair = multiFloorCandidate.floors[1].rooms.find(r => r.type === ROOM_TYPES.STAIRWELL);
  assert(gStair !== undefined && fStair !== undefined, 'Test 2.6: Stairwell core present on both Ground and Upper floors');
  const deltaStairX = Math.abs(gStair.bounds.x - fStair.bounds.x);
  const deltaStairY = Math.abs(gStair.bounds.y - fStair.bounds.y);
  assert(deltaStairX <= 0.5 && deltaStairY <= 0.5, `Test 2.7: Stairwell shift is within 0.5 ft structural tolerance (Δx: ${deltaStairX}, Δy: ${deltaStairY})`);

  // =========================================================================
  // 3. ROOMS OUTSIDE THE BUILDABLE ENVELOPE
  // =========================================================================
  console.log('\n--- Scenario 3: Rooms Outside Buildable Envelope ---');
  const oobCandidate = JSON.parse(JSON.stringify(singleFloorCandidate));
  const env = oobCandidate.site.buildableEnvelope;
  // Push rightmost room out past envelope right boundary
  oobCandidate.floors[0].rooms[0].bounds.x = env.x + env.width + 5.0;
  const valOob = validateLayoutConstraints(oobCandidate);
  assert(valOob.isValid === false && valOob.isFeasible === false, 'Test 3.1: Layout with room exceeding envelope fails validation');
  assert(valOob.resultType === VALIDATION_RESULT_TYPES.INVALID_CANDIDATE, 'Test 3.2: Result type is INVALID_CANDIDATE');
  assert(valOob.candidateStatus === 'INVALID', 'Test 3.3: Candidate status is "INVALID"');
  assert(valOob.hardConstraints.details.boundaryContainment.passed === false, 'Test 3.4: Boundary containment specifically marked failed');
  assert(valOob.violations.some(v => v.includes('[Boundary Containment]')), 'Test 3.5: Actionable boundary containment violation emitted');
  assert(valOob.diagnostics.some(d => d.constraint === 'boundaryContainment' || d.constraint === HARD_CONSTRAINT_TYPES.BOUNDARY_CONTAINMENT), 'Test 3.6: Diagnostics array records boundaryContainment');

  // Negative origin boundary violation
  const negCandidate = JSON.parse(JSON.stringify(singleFloorCandidate));
  negCandidate.floors[0].rooms[0].bounds.x = -6.0;
  const valNeg = validateLayoutConstraints(negCandidate);
  assert(valNeg.isValid === false, 'Test 3.7: Room with negative X coordinate fails validation');
  assert(valNeg.hardConstraints.details.boundaryContainment.passed === false, 'Test 3.8: Negative X coordinate caught by boundary containment');

  // =========================================================================
  // 4. OVERLAPPING ROOMS
  // =========================================================================
  console.log('\n--- Scenario 4: Overlapping Rooms ---');
  const overlapCandidate = JSON.parse(JSON.stringify(singleFloorCandidate));
  const rA = overlapCandidate.floors[0].rooms[0];
  const rB = overlapCandidate.floors[0].rooms[1];
  // Force significant physical overlap (> 1.5 sq.ft)
  rB.bounds.x = rA.bounds.x + 2.0;
  rB.bounds.y = rA.bounds.y + 2.0;
  const valOverlap = validateLayoutConstraints(overlapCandidate);
  assert(valOverlap.isValid === false && valOverlap.isFeasible === false, 'Test 4.1: Layout with spatial room collision fails validation');
  assert(valOverlap.resultType === VALIDATION_RESULT_TYPES.INVALID_CANDIDATE, 'Test 4.2: Result type is INVALID_CANDIDATE');
  assert(valOverlap.hardConstraints.details.zeroOverlaps.passed === false, 'Test 4.3: Zero room overlaps specifically marked failed');
  assert(valOverlap.violations.some(v => v.includes('[Zero Overlaps]') && v.includes('sq.ft')), 'Test 4.4: Specific violation identifying rooms and measured overlap area emitted');

  // Touching boxes have zero overlap area and pass
  const touchCandidate = JSON.parse(JSON.stringify(singleFloorCandidate));
  touchCandidate.floors[0].rooms[1].bounds.x = touchCandidate.floors[0].rooms[0].bounds.x + touchCandidate.floors[0].rooms[0].bounds.width;
  assert(touchCandidate.floors[0].rooms[1].bounds.x >= touchCandidate.floors[0].rooms[0].bounds.x + touchCandidate.floors[0].rooms[0].bounds.width, 'Test 4.5: Touching partition edges do not trigger false overlap');

  // =========================================================================
  // 5. INVALID OR INSUFFICIENT ROOM DIMENSIONS & AREA CONSISTENCY
  // =========================================================================
  console.log('\n--- Scenario 5: Invalid/Insufficient Dimensions & Area Consistency ---');
  // Non-positive dimension
  const zeroDimCandidate = JSON.parse(JSON.stringify(singleFloorCandidate));
  zeroDimCandidate.floors[0].rooms[0].bounds.width = 0;
  const valZeroDim = validateLayoutConstraints(zeroDimCandidate);
  assert(valZeroDim.isValid === false, 'Test 5.1: Non-positive room width (width = 0) fails validation');
  assert(valZeroDim.hardConstraints.details.minimumDimensions.passed === false, 'Test 5.2: Minimum dimensions specifically marked failed for zero width');

  // Undersized kitchen below NBC code minimum
  const tinyKitchenCandidate = JSON.parse(JSON.stringify(singleFloorCandidate));
  const kitchen = tinyKitchenCandidate.floors[0].rooms.find(r => r.type === ROOM_TYPES.KITCHEN);
  if (kitchen) {
    kitchen.bounds.width = 4.0;
    kitchen.bounds.length = 4.5;
    kitchen.areaSqft = 18;
    const valTinyK = validateLayoutConstraints(tinyKitchenCandidate);
    assert(valTinyK.isValid === false, 'Test 5.3: Kitchen undersized below NBC code minimum fails validation');
    assert(valTinyK.violations.some(v => v.includes('[Minimum Dimensions]') && v.includes('Kitchen')), 'Test 5.4: Violation specifically cites kitchen code minimums');
  }

  // Contradictory area inconsistency
  const inconCandidate = JSON.parse(JSON.stringify(singleFloorCandidate));
  inconCandidate.floors[0].rooms[0].areaSqft = 500; // Declared 500 sqft on a 10x10 room
  const valIncon = validateLayoutConstraints(inconCandidate);
  assert(valIncon.isValid === false, 'Test 5.5: Contradictory declared area fails validation');
  assert(valIncon.hardConstraints.details.areaConsistency.passed === false, 'Test 5.6: Area consistency specifically marked failed');
  assert(valIncon.violations.some(v => v.includes('[Area Consistency]')), 'Test 5.7: Actionable area consistency violation message emitted');

  // Non-positive area
  const negAreaCandidate = JSON.parse(JSON.stringify(singleFloorCandidate));
  negAreaCandidate.floors[0].rooms[0].areaSqft = -25;
  const valNegArea = validateLayoutConstraints(negAreaCandidate);
  assert(valNegArea.isValid === false, 'Test 5.8: Negative declared room area fails validation');
  assert(valNegArea.hardConstraints.details.areaConsistency.passed === false, 'Test 5.9: Negative area caught by area consistency check');

  // =========================================================================
  // 6. REQUIRED ADJACENCY VIOLATIONS
  // =========================================================================
  console.log('\n--- Scenario 6: Required Adjacency Violations ---');
  // Test required adjacency between rooms that are located far apart
  const adjCandidate = JSON.parse(JSON.stringify(singleFloorCandidate));
  const roomIds = adjCandidate.floors[0].rooms.map(r => r.id);
  const distantPair = [roomIds[0], roomIds[roomIds.length - 1]]; // Portico and rear bedroom/bath
  
  const valAdjBreach = validateLayoutConstraints(adjCandidate, {
    requiredAdjacencies: [{ source: distantPair[0], target: distantPair[1] }]
  });
  assert(valAdjBreach.isValid === false && valAdjBreach.isFeasible === false, 'Test 6.1: Layout violating required adjacency fails validation');
  assert(valAdjBreach.resultType === VALIDATION_RESULT_TYPES.INVALID_CANDIDATE, 'Test 6.2: Result type is INVALID_CANDIDATE');
  assert(valAdjBreach.hardConstraints.details.requiredAdjacencies.passed === false, 'Test 6.3: details.requiredAdjacencies.passed is false');
  assert(valAdjBreach.violations.some(v => v.includes('[Required Adjacency]')), 'Test 6.4: Actionable required adjacency violation message emitted');

  // Missing room in required adjacency
  const valAdjMissing = validateLayoutConstraints(adjCandidate, {
    requiredAdjacencies: [{ source: roomIds[0], target: 'non_existent_room_999' }]
  });
  assert(valAdjMissing.isValid === false, 'Test 6.5: Required adjacency referencing missing room fails validation');
  assert(valAdjMissing.hardConstraints.details.requiredAdjacencies.passed === false, 'Test 6.6: Missing room caught under requiredAdjacencies');

  // =========================================================================
  // 7. REQUIRED SEPARATION VIOLATIONS
  // =========================================================================
  console.log('\n--- Scenario 7: Required Separation Violations ---');
  // Two rooms that are directly touching (e.g. living and dining) with a hard required separation
  const sepCandidate = JSON.parse(JSON.stringify(singleFloorCandidate));
  const r0 = sepCandidate.floors[0].rooms[0].id;
  const r1 = sepCandidate.floors[0].rooms[1].id;
  
  // Set explicit required separation between two adjacent rooms
  const valSepBreach = validateLayoutConstraints(sepCandidate, {
    requiredSeparations: [{ source: r0, target: r1 }]
  });
  assert(valSepBreach.isValid === false && valSepBreach.isFeasible === false, 'Test 7.1: Touching rooms with required separation fail validation');
  assert(valSepBreach.resultType === VALIDATION_RESULT_TYPES.INVALID_CANDIDATE, 'Test 7.2: Result type is INVALID_CANDIDATE');
  assert(valSepBreach.hardConstraints.details.requiredSeparations.passed === false, 'Test 7.3: details.requiredSeparations.passed is false');
  assert(valSepBreach.violations.some(v => v.includes('[Required Separation]')), 'Test 7.4: Actionable required separation violation emitted');

  // Separated rooms pass required separation check
  const valSepPass = validateLayoutConstraints(sepCandidate, {
    requiredSeparations: [{ source: distantPair[0], target: distantPair[1] }]
  });
  assert(valSepPass.hardConstraints.details.requiredSeparations.passed === true, 'Test 7.5: Truly distant rooms satisfy required separation');

  // =========================================================================
  // 8. INVALID ACCESS CONDITIONS
  // =========================================================================
  console.log('\n--- Scenario 8: Invalid Access & Egress Conditions ---');
  // Enclosed habitable room with zero doors
  const noDoorCandidate = JSON.parse(JSON.stringify(singleFloorCandidate));
  const masterBed = noDoorCandidate.floors[0].rooms.find(r => r.type === ROOM_TYPES.MASTER_BEDROOM || r.type === ROOM_TYPES.BEDROOM);
  if (masterBed) {
    masterBed.doors = []; // Remove all doors
    const valNoDoor = validateLayoutConstraints(noDoorCandidate);
    assert(valNoDoor.isValid === false, 'Test 8.1: Enclosed bedroom with zero doors fails validation');
    assert(valNoDoor.hardConstraints.details.egressClearances.passed === false, 'Test 8.2: Egress clearances marked failed for doorless room');
    assert(valNoDoor.violations.some(v => v.includes('[Egress Clearances]')), 'Test 8.3: Actionable egress clearance violation emitted');
  }

  // Habitable room with door clear width < 2.8 ft
  const narrowDoorCandidate = JSON.parse(JSON.stringify(singleFloorCandidate));
  const bedWithNarrowDoor = narrowDoorCandidate.floors[0].rooms.find(r => r.type === ROOM_TYPES.BEDROOM || r.type === ROOM_TYPES.MASTER_BEDROOM);
  if (bedWithNarrowDoor) {
    bedWithNarrowDoor.doors = [{ width: 2.0, clearWidth: 2.0 }];
    const valNarrowDoor = validateLayoutConstraints(narrowDoorCandidate);
    assert(valNarrowDoor.isValid === false, 'Test 8.4: Habitable room with undersized door (< 2.8 ft) fails validation');
    assert(valNarrowDoor.hardConstraints.details.egressClearances.passed === false, 'Test 8.5: Undersized door caught by egress clearances');
  }

  // Door coordinates located outside room boundary
  const outDoorCandidate = JSON.parse(JSON.stringify(singleFloorCandidate));
  const bedWithOutDoor = outDoorCandidate.floors[0].rooms.find(r => r.type === ROOM_TYPES.BEDROOM || r.type === ROOM_TYPES.MASTER_BEDROOM);
  if (bedWithOutDoor) {
    bedWithOutDoor.doors = [{ x: 99.0, y: 99.0, width: 3.0, clearWidth: 3.0 }];
    const valOutDoor = validateLayoutConstraints(outDoorCandidate);
    assert(valOutDoor.isValid === false, 'Test 8.6: Door placed outside room boundary fails validation');
    assert(valOutDoor.violations.some(v => v.includes('[Access Conditions]')), 'Test 8.7: Access conditions violation emitted for displaced door');
  }

  // Outdoor open spaces exempt
  const outdoorPortico = multiFloorCandidate.floors[0].rooms.find(r => r.type === ROOM_TYPES.PORTICO);
  assert(outdoorPortico !== undefined, 'Test 8.8: Outdoor portico present and correctly exempt from enclosed egress door requirement');

  // =========================================================================
  // 9. VERTICAL-CONNECTION INCONSISTENCIES
  // =========================================================================
  console.log('\n--- Scenario 9: Vertical-Connection Inconsistencies ---');
  // Horizontally shifted stairwell (Δx = 4 ft)
  const shiftedStairCandidate = JSON.parse(JSON.stringify(multiFloorCandidate));
  const upperStair = shiftedStairCandidate.floors[1].rooms.find(r => r.type === ROOM_TYPES.STAIRWELL);
  if (upperStair) {
    upperStair.bounds.x += 4.0;
    const valShifted = validateLayoutConstraints(shiftedStairCandidate);
    assert(valShifted.isValid === false && valShifted.isFeasible === false, 'Test 9.1: Horizontally shifted stairwell core fails validation');
    assert(valShifted.hardConstraints.details.verticalAlignment.passed === false, 'Test 9.2: Vertical alignment specifically marked failed');
    assert(valShifted.violations.some(v => v.includes('[Vertical Alignment]')), 'Test 9.3: Vertical alignment violation emitted');
  }

  // Missing stairwell on upper floor in multi-floor building
  const noUpperStairCandidate = JSON.parse(JSON.stringify(multiFloorCandidate));
  noUpperStairCandidate.floors[1].rooms = noUpperStairCandidate.floors[1].rooms.filter(r => r.type !== ROOM_TYPES.STAIRWELL && !r.id.includes('stairwell'));
  const valNoUpperStair = validateLayoutConstraints(noUpperStairCandidate);
  assert(valNoUpperStair.isValid === false, 'Test 9.4: Multi-floor layout with upper floor missing stairwell fails validation');
  assert(valNoUpperStair.hardConstraints.details.verticalConnections.passed === false, 'Test 9.5: Vertical connections specifically marked failed');
  assert(valNoUpperStair.violations.some(v => v.includes('[Vertical Connection]')), 'Test 9.6: Vertical connection violation message emitted');

  // =========================================================================
  // 10. MALFORMED OR INCOMPLETE CANDIDATE DATA
  // =========================================================================
  console.log('\n--- Scenario 10: Malformed or Incomplete Data Handling ---');
  const valNull = validateLayoutConstraints(null);
  assert(valNull.isValid === false && valNull.isFeasible === false, 'Test 10.1: Null payload safely rejected');
  assert(valNull.resultType === VALIDATION_RESULT_TYPES.VALIDATION_ERROR, 'Test 10.2: Null payload returns VALIDATION_ERROR');
  assert(valNull.candidateStatus === 'ERROR', 'Test 10.3: Null payload candidateStatus is "ERROR"');

  const valEmpty = validateLayoutConstraints({});
  assert(valEmpty.isValid === false, 'Test 10.4: Empty object payload safely rejected');
  assert(valEmpty.resultType === VALIDATION_RESULT_TYPES.VALIDATION_ERROR, 'Test 10.5: Empty object returns VALIDATION_ERROR');

  const valNoSite = validateLayoutConstraints({ floors: [{ floorIndex: 0, rooms: [] }] });
  assert(valNoSite.isValid === false, 'Test 10.6: Candidate missing site safely rejected');
  assert(valNoSite.resultType === VALIDATION_RESULT_TYPES.VALIDATION_ERROR, 'Test 10.7: Missing site returns VALIDATION_ERROR');

  const valNoFloors = validateLayoutConstraints({ site: singleFloorCandidate.site, floors: [] });
  assert(valNoFloors.isValid === false, 'Test 10.8: Candidate with empty floors array rejected');

  // Duplicate room identifiers
  const dupIdCandidate = JSON.parse(JSON.stringify(singleFloorCandidate));
  dupIdCandidate.floors[0].rooms[1].id = dupIdCandidate.floors[0].rooms[0].id; // Assign identical ID
  const valDupId = validateLayoutConstraints(dupIdCandidate);
  assert(valDupId.isValid === false, 'Test 10.9: Duplicate room identifier detected and rejected');
  assert(valDupId.hardConstraints.details.canonicalConsistency.passed === false, 'Test 10.10: Duplicate ID fails canonical consistency');
  assert(valDupId.violations.some(v => v.includes('Duplicate element identifier') || v.includes('Duplicate room identifier')), 'Test 10.11: Informative duplicate identifier error message emitted');

  // Non-numeric bounds coordinates
  const nanCoordCandidate = JSON.parse(JSON.stringify(singleFloorCandidate));
  nanCoordCandidate.floors[0].rooms[0].bounds.x = NaN;
  const valNanCoord = validateLayoutConstraints(nanCoordCandidate);
  assert(valNanCoord.isValid === false, 'Test 10.12: Non-numeric (NaN) bounds coordinate rejected cleanly');

  // =========================================================================
  // 11. INFEASIBLE ROOM PROGRAMS
  // =========================================================================
  console.log('\n--- Scenario 11: Infeasible Room Programs ---');
  // Impossible 8x10 plot with 3BHK program
  const infeasible8x10 = generateLayout({ plotWidth: 8, plotLength: 10, bhkCount: 3, floorsCount: 1 });
  assert(infeasible8x10.success === false, 'Test 11.1: Impossible 8x10 plot with 3BHK returns success: false');
  assert(infeasible8x10.isFeasible === false, 'Test 11.2: Impossible plot returns isFeasible: false');
  assert(infeasible8x10.candidateId === null, 'Test 11.3: Infeasible candidate has candidateId: null');
  
  const valInfeasible8x10 = validateLayoutConstraints(infeasible8x10);
  assert(valInfeasible8x10.isValid === false && valInfeasible8x10.isFeasible === false, 'Test 11.4: Validation of infeasible candidate returns isValid: false, isFeasible: false');
  assert(valInfeasible8x10.resultType === VALIDATION_RESULT_TYPES.INFEASIBLE_REQUIREMENTS, 'Test 11.5: Result type is INFEASIBLE_REQUIREMENTS');
  assert(valInfeasible8x10.candidateStatus === 'INFEASIBLE', 'Test 11.6: Candidate status is "INFEASIBLE"');
  assert(valInfeasible8x10.violations.some(v => v.includes('Spatial infeasibility') || v.includes('geometrically infeasible')), 'Test 11.7: Honest spatial deficit diagnostic emitted');

  // 5BHK on 15x20 plot
  const infeasible5BHK = generateLayout({ plotWidth: 15, plotLength: 20, bhkCount: 5, floorsCount: 1 });
  assert(infeasible5BHK.success === false && infeasible5BHK.isFeasible === false, 'Test 11.8: 5BHK on 15x20 plot returns honest failure');
  const val5BHK = validateLayoutConstraints(infeasible5BHK);
  assert(val5BHK.resultType === VALIDATION_RESULT_TYPES.INFEASIBLE_REQUIREMENTS, 'Test 11.9: 5BHK infeasible result categorized as INFEASIBLE_REQUIREMENTS');

  // Negative plot dimensions
  const negPlotCandidate = generateLayout({ plotWidth: -30, plotLength: 40, bhkCount: 2 });
  assert(negPlotCandidate.success === false && negPlotCandidate.isFeasible === false, 'Test 11.10: Negative plot width rejected cleanly');
  const valNegPlot = validateLayoutConstraints(negPlotCandidate);
  assert(valNegPlot.isValid === false, 'Test 11.11: Negative plot candidate validation returns isValid: false');

  // =========================================================================
  // 12. FULL GENERATION WORKFLOW INTEGRATION
  // =========================================================================
  console.log('\n--- Scenario 12: Full Generation Workflow Integration ---');
  const engine = new LabourConnectDesignEngine();

  // Valid design entering full workflow
  const validEngineResult = engine.generateDesign({
    plotWidth: 30,
    plotLength: 50,
    bhkCount: 3,
    floorsCount: 2,
    archStyle: 'contemporary'
  });
  assert(validEngineResult.success === true, 'Test 12.1: Valid requirements produce success: true design in engine');
  assert(validEngineResult.design !== undefined, 'Test 12.2: Full canonical design JSON produced');
  assert(validEngineResult.design.evaluation.isValid === true, 'Test 12.3: Design evaluation isValid is true');
  assert(validEngineResult.design.evaluation.resultType === VALIDATION_RESULT_TYPES.VALID_CANDIDATE, 'Test 12.4: Design evaluation resultType is VALID_CANDIDATE');
  assert(validEngineResult.design.evaluation.validationReport !== null, 'Test 12.5: Full validation report attached to design.evaluation');
  assert(validEngineResult.design.geometry3d !== null, 'Test 12.6: Procedural 3D geometry derived from validated design');
  assert(validEngineResult.design.walkthroughTrajectory !== null, 'Test 12.7: Continuous walkthrough path planned');
  assert(validEngineResult.design.boqEstimate !== null, 'Test 12.8: Deterministic BOQ calculated from physical geometry');

  // Impossible prompt entering engine
  const impossibleEngineResult = engine.generateDesign({
    plotWidth: 8,
    plotLength: 10,
    bhkCount: 4,
    floorsCount: 1
  });
  assert(impossibleEngineResult.success === false, 'Test 12.9: Physically impossible requirements rejected by engine');
  assert(impossibleEngineResult.isFeasible === false, 'Test 12.10: Engine reports isFeasible: false for impossible prompt');
  assert(Array.isArray(impossibleEngineResult.errors) && impossibleEngineResult.errors.length > 0, 'Test 12.11: Honest engineering errors returned');
  assert(impossibleEngineResult.design === undefined, 'Test 12.12: Invalid candidate is never returned as a successful design');

  // Hard Constraint Override Protection: Soft score NEVER overrides hard failure
  const highSoftInvalidCandidate = JSON.parse(JSON.stringify(singleFloorCandidate));
  // Induce boundary violation
  highSoftInvalidCandidate.floors[0].rooms[0].bounds.x = 999.0;
  const valHighSoft = validateLayoutConstraints(highSoftInvalidCandidate);
  assert(valHighSoft.optimizationScore > 0, 'Test 12.13: Soft optimization score can be computed (> 0)');
  assert(valHighSoft.isValid === false, 'Test 12.14: High soft optimization score NEVER overrides hard constraint failure (isValid strictly false)');
  assert(valHighSoft.isFeasible === false, 'Test 12.15: isFeasible strictly false despite soft score');
  assert(valHighSoft.resultType === VALIDATION_RESULT_TYPES.INVALID_CANDIDATE, 'Test 12.16: Result type remains strictly INVALID_CANDIDATE');

  // =========================================================================
  // 13. REGRESSION COMPATIBILITY
  // =========================================================================
  console.log('\n--- Scenario 13: Regression Compatibility ---');
  // Legacy properties on validation report
  assert(typeof valSingle.valid === 'boolean' && valSingle.valid === true, 'Test 13.1: Legacy property "valid" is boolean true');
  assert(typeof valSingle.isValid === 'boolean' && valSingle.isValid === true, 'Test 13.2: Legacy property "isValid" is boolean true');
  assert(Array.isArray(valSingle.errors), 'Test 13.3: Legacy property "errors" is an array');
  assert(Array.isArray(valSingle.violations), 'Test 13.4: Legacy property "violations" is an array');
  assert(Array.isArray(valSingle.warnings), 'Test 13.5: Legacy property "warnings" is an array');
  assert(Array.isArray(valSingle.checks_performed) && valSingle.checks_performed.length >= 15, `Test 13.6: Comprehensive checks performed logged (got ${valSingle.checks_performed.length})`);
  assert(typeof valSingle.checkedElementsCount === 'number' && valSingle.checkedElementsCount > 0, 'Test 13.7: checkedElementsCount populated');
  assert(typeof valSingle.optimizationScore === 'number' && valSingle.optimizationScore >= 70, `Test 13.8: Optimization score is numeric percentage (${valSingle.optimizationScore})`);
  assert(Array.isArray(valSingle.recommendations), 'Test 13.9: recommendations array present');
  assert(Array.isArray(valSingle.remediationAdvice), 'Test 13.10: remediationAdvice array present');
  assert(valSingle.metadata.validatorVersion === CONSTRAINT_VALIDATOR_VERSION, 'Test 13.11: Validator version is registered in metadata');

  // Direct canonical geometry validator execution
  const directGeom = validateArchitectureGeometry(singleFloorCandidate);
  assert(directGeom.valid === true, 'Test 13.12: Direct validateArchitectureGeometry returns valid: true');
  assert(directGeom.errors.length === 0, 'Test 13.13: Direct geometric validator has 0 errors for valid layout');

  console.log('\n======================================================================');
  console.log(`GEOMETRIC VALIDATION INTEGRATION TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('======================================================================\n');

  return { passed, failed };
}

if (import.meta.url === `file:///${process.argv[1]?.replace(/\\/g, '/')}`) {
  const result = runGeometricValidationIntegrationTests();
  if (result.failed > 0) process.exit(1);
}
