/**
 * LabourConnect Design Engine - Room Program Generator Unit Tests
 * 
 * Verifies S2-T02 acceptance criteria:
 * 1. Structured room records are produced with stable, floor-scoped identifiers.
 * 2. Floors are explicitly assigned with vertical elevations.
 * 3. Hard constraints and soft preferences are cleanly separated.
 * 4. Provenance and access requirements are preserved.
 * 5. Infeasible room programs (excessive area for buildable envelope) are reported cleanly.
 * 6. Backward compatibility of programRooms(specs) is preserved for layoutGenerator.js.
 */

import { generateRoomProgram, programRooms, ACCESS_REQUIREMENTS } from '../generator/roomProgrammer.js';
import { compileLayoutRequirements } from '../interpreter/layoutRequirementsContract.js';
import { ROOM_TYPES, ZONES } from '../schema/canonicalDesignSchema.js';

export function runRoomProgrammerTests() {
  console.log('======================================================================');
  console.log('LABOURCONNECT ENGINE: ROOM PROGRAM GENERATOR TEST SUITE (S2-T02)');
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
  // TEST 1: Representative Multi-Floor Vision Prompt Room Program
  // -------------------------------------------------------------------------
  const visionPrompt = "Design a modern two-floor house on a 30 ft × 40 ft plot with three bedrooms, two bathrooms, a living room, kitchen, parking, and a balcony.";
  const compiled = compileLayoutRequirements(visionPrompt);
  const prog1 = generateRoomProgram(compiled);

  assert(prog1.success === true, 'Test 1.1: Multi-floor program generates successfully');
  assert(prog1.isFeasible === true, 'Test 1.2: Program marked feasible');
  assert(Array.isArray(prog1.floorPrograms), 'Test 1.3: Returns array of floor programs');
  assert(prog1.floorPrograms.length === 3, `Test 1.4: 2-floor house creates 3 levels (Ground, First, Terrace), got ${prog1.floorPrograms.length}`);

  // Ground Floor Verification
  const groundProg = prog1.floorPrograms.find(f => f.floorIndex === 0);
  assert(groundProg !== undefined, 'Test 1.5: Ground floor program exists');
  assert(groundProg.name === 'Ground Floor', 'Test 1.6: Ground floor named correctly');
  assert(groundProg.elevationZ === 0, 'Test 1.7: Ground floor elevation Z is 0');
  assert(groundProg.rooms.length >= 6, `Test 1.8: Ground floor contains allocated rooms (got ${groundProg.rooms.length})`);

  // Verify Essential Ground Rooms
  const gPortico = groundProg.rooms.find(r => r.id === 'g_portico');
  assert(gPortico !== undefined, 'Test 1.9: Portico allocated on ground floor');
  assert(gPortico.type === ROOM_TYPES.PORTICO, 'Test 1.10: Portico canonical type verified');
  assert(gPortico.zone === ZONES.OUTDOOR, 'Test 1.11: Portico outdoor zone verified');
  assert(gPortico.accessRequirements === ACCESS_REQUIREMENTS.EXTERIOR_STREET, 'Test 1.12: Portico street access requirement verified');

  const gLiving = groundProg.rooms.find(r => r.id === 'g_living');
  assert(gLiving !== undefined, 'Test 1.13: Living room allocated on ground floor');
  assert(gLiving.zone === ZONES.PUBLIC, 'Test 1.14: Living room public zone verified');

  const gDining = groundProg.rooms.find(r => r.id === 'g_dining');
  assert(gDining !== undefined, 'Test 1.15: Dining room allocated on ground floor');

  const gKitchen = groundProg.rooms.find(r => r.id === 'g_kitchen');
  assert(gKitchen !== undefined, 'Test 1.16: Kitchen allocated on ground floor');
  assert(gKitchen.zone === ZONES.SERVICE, 'Test 1.17: Kitchen service zone verified');

  const gStair = groundProg.rooms.find(r => r.id === 'g_stairwell_core');
  assert(gStair !== undefined, 'Test 1.18: Stairwell vertical anchor allocated on ground floor');

  // First Floor Verification
  const firstProg = prog1.floorPrograms.find(f => f.floorIndex === 1);
  assert(firstProg !== undefined, 'Test 1.19: First floor program exists');
  assert(firstProg.elevationZ > 0, 'Test 1.20: First floor elevation Z > 0');

  const fStair = firstProg.rooms.find(r => r.id === 'f_stairwell_core');
  assert(fStair !== undefined, 'Test 1.21: Upper stairwell core allocated on first floor');

  const fMaster = firstProg.rooms.find(r => r.id === 'f_master_suite');
  assert(fMaster !== undefined, 'Test 1.22: Master suite allocated on first floor');
  assert(fMaster.zone === ZONES.PRIVATE, 'Test 1.23: Master suite private zone verified');

  const fMasterBath = firstProg.rooms.find(r => r.id === 'f_master_bath');
  assert(fMasterBath !== undefined, 'Test 1.24: Master bath allocated');
  assert(fMasterBath.accessRequirements === ACCESS_REQUIREMENTS.ENSUITE_ONLY, 'Test 1.25: Master bath requires ensuite access');

  const fBalcony = firstProg.rooms.find(r => r.id === 'f_balcony');
  assert(fBalcony !== undefined, 'Test 1.26: Balcony allocated on first floor');

  // Terrace Floor Verification
  const terraceProg = prog1.floorPrograms.find(f => f.floorIndex === 2);
  assert(terraceProg !== undefined, 'Test 1.27: Terrace program exists');
  assert(terraceProg.rooms.some(r => r.id === 't_mumty'), 'Test 1.28: Stairhead mumty present on terrace');
  assert(terraceProg.rooms.some(r => r.id === 't_open_deck'), 'Test 1.29: Open rooftop deck present on terrace');

  // -------------------------------------------------------------------------
  // TEST 2: Hard Constraints vs Soft Preferences Verification
  // -------------------------------------------------------------------------
  let allRoomsHaveHardAndSoft = true;
  let allRoomsHavePositiveDims = true;

  for (const fp of prog1.floorPrograms) {
    for (const room of fp.rooms) {
      if (!room.hardConstraints || !room.softPreferences) {
        allRoomsHaveHardAndSoft = false;
      }
      if (room.minWidth <= 0 || room.minLength <= 0 || room.minArea <= 0) {
        allRoomsHavePositiveDims = false;
      }
      if (typeof room.hardConstraints.positiveDimensions !== 'boolean' ||
          typeof room.hardConstraints.minWidth !== 'number' ||
          typeof room.hardConstraints.minArea !== 'number' ||
          typeof room.hardConstraints.strictlyInsideBuildableEnvelope !== 'boolean') {
        allRoomsHaveHardAndSoft = false;
      }
      if (!Array.isArray(room.softPreferences.preferredAdjacencies) ||
          typeof room.softPreferences.priority !== 'number') {
        allRoomsHaveHardAndSoft = false;
      }
    }
  }

  assert(allRoomsHaveHardAndSoft, 'Test 2.1: Every room record has explicit hardConstraints and softPreferences structures');
  assert(allRoomsHavePositiveDims, 'Test 2.2: Every room record has strictly positive minimum dimensions and areas');

  // -------------------------------------------------------------------------
  // TEST 3: Single Floor (1-Floor) Program Verification
  // -------------------------------------------------------------------------
  const singleFloorPrompt = "Design a 2BHK house on 30x40 plot with 1 floor without parking";
  const progSingle = generateRoomProgram(singleFloorPrompt);

  assert(progSingle.success === true, 'Test 3.1: Single floor house generates successfully');
  const singleGround = progSingle.floorPrograms.find(f => f.floorIndex === 0);
  assert(singleGround.rooms.some(r => r.type === ROOM_TYPES.MASTER_BEDROOM), 'Test 3.2: Single floor has master bedroom on ground');
  assert(singleGround.rooms.some(r => r.type === ROOM_TYPES.BEDROOM), 'Test 3.3: Single floor has second bedroom on ground');
  assert(!singleGround.rooms.some(r => r.type === ROOM_TYPES.STAIRWELL), 'Test 3.4: Single floor ground level requires no stairwell');

  // -------------------------------------------------------------------------
  // TEST 4: Spatial Infeasibility Detection
  // -------------------------------------------------------------------------
  const impossibleSpecs = {
    plotWidth: 15,
    plotLength: 20,
    bhkCount: 4,
    floorsCount: 1,
    amenities: { hasParking: true, hasCourtyard: true }
  };
  const progImpossible = generateRoomProgram(impossibleSpecs);

  assert(progImpossible.success === false, 'Test 4.1: Spatially impossible room program rejected');
  assert(progImpossible.isFeasible === false, 'Test 4.2: Marked isFeasible: false');
  assert(progImpossible.errors.length > 0, 'Test 4.3: Diagnostic errors returned');

  // -------------------------------------------------------------------------
  // TEST 5: Backward Compatibility of programRooms()
  // -------------------------------------------------------------------------
  const legacySpecs = {
    plotWidth: 30,
    plotLength: 40,
    bhkCount: 3,
    floorsCount: 2,
    amenities: { hasParking: true, hasBalcony: true, hasPooja: true }
  };
  const legacyResult = programRooms(legacySpecs);

  assert(Array.isArray(legacyResult), 'Test 5.1: programRooms returns an array of floor programs');
  assert(legacyResult.length >= 2, 'Test 5.2: Legacy result contains at least ground and first floor');
  assert(typeof legacyResult[0].floorIndex === 'number', 'Test 5.3: First element has floorIndex');
  assert(Array.isArray(legacyResult[0].rooms), 'Test 5.4: First element has rooms array');
  assert(legacyResult.success === true, 'Test 5.5: Legacy array includes success property');
  assert(legacyResult.isFeasible === true, 'Test 5.6: Legacy array includes isFeasible property');

  console.log('\n======================================================================');
  console.log(`ROOM PROGRAM GENERATOR TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('======================================================================\n');

  if (failed > 0) {
    if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
      process.exit(1);
    }
    throw new Error(`${failed} room programmer tests failed.`);
  }

  return { passed, failed };
}

// Allow direct CLI execution
if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
  runRoomProgrammerTests();
}
