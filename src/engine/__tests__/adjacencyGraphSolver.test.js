/**
 * LabourConnect Design Engine - Topological Adjacency Graph Solver Unit Tests
 * 
 * Verifies S2-T03 acceptance criteria:
 * 1. Valid representation of REQUIRED_ADJACENCY, PREFERRED_ADJACENCY, REQUIRED_SEPARATION,
 *    ACCESS_RELATIONSHIP, and VERTICAL_CONNECTION.
 * 2. Clear distinction of Hard Constraints vs Soft Preferences.
 * 3. Endpoint and relationship type validation.
 * 4. Contradiction detection: REQUIRED_ADJACENCY vs REQUIRED_SEPARATION on same pair.
 * 5. Other contradiction detections: self-loops, same-floor vertical connection, access vs separation.
 * 6. Deduplication and handling of duplicate relationships.
 * 7. Graceful handling of missing rooms and malformed inputs without crashing.
 * 8. Floor assignment and vertical connection preservation.
 * 9. Backward compatibility with existing buildAdjacencyGraph() consumers.
 */

import {
  SPATIAL_ARCHETYPES,
  RELATIONSHIP_TYPES,
  RELATIONSHIP_NATURE,
  ACCESS_PORTAL_TYPES,
  createRelationshipEdge,
  validateRoomRelationships,
  solveRoomRelationshipGraph,
  buildAdjacencyGraph,
  selectSpatialArchetype
} from '../generator/adjacencyGraphSolver.js';
import { generateRoomProgram } from '../generator/roomProgrammer.js';
import { ROOM_TYPES } from '../schema/canonicalDesignSchema.js';

export function runAdjacencyGraphTests() {
  console.log('======================================================================');
  console.log('LABOURCONNECT ENGINE: ROOM RELATIONSHIP GRAPH TEST SUITE (S2-T03)');
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

  // Sample room records for test fixture
  const sampleRooms = [
    { id: 'g_portico', name: 'Car Porch', type: ROOM_TYPES.PORTICO, floorIndex: 0 },
    { id: 'g_foyer', name: 'Foyer', type: ROOM_TYPES.FOYER, floorIndex: 0 },
    { id: 'g_living', name: 'Living Room', type: ROOM_TYPES.LIVING, floorIndex: 0 },
    { id: 'g_dining', name: 'Dining', type: ROOM_TYPES.DINING, floorIndex: 0 },
    { id: 'g_kitchen', name: 'Kitchen', type: ROOM_TYPES.KITCHEN, floorIndex: 0 },
    { id: 'g_stairwell_core', name: 'Stairwell (Ground)', type: ROOM_TYPES.STAIRWELL, floorIndex: 0 },
    { id: 'f_stairwell_core', name: 'Stairwell (First)', type: ROOM_TYPES.STAIRWELL, floorIndex: 1 },
    { id: 'f_master_suite', name: 'Master Bedroom', type: ROOM_TYPES.MASTER_BEDROOM, floorIndex: 1 },
    { id: 'f_master_bath', name: 'Master Bath', type: ROOM_TYPES.BATHROOM, floorIndex: 1 }
  ];

  // -------------------------------------------------------------------------
  // TEST 1: Valid Relationship Types & Hard vs Soft Nature
  // -------------------------------------------------------------------------
  const edgeAdj = createRelationshipEdge('g_dining', 'g_kitchen', RELATIONSHIP_TYPES.REQUIRED_ADJACENCY);
  assert(edgeAdj.type === RELATIONSHIP_TYPES.REQUIRED_ADJACENCY, 'Test 1.1: REQUIRED_ADJACENCY type assigned');
  assert(edgeAdj.nature === RELATIONSHIP_NATURE.HARD_CONSTRAINT, 'Test 1.2: REQUIRED_ADJACENCY marked HARD_CONSTRAINT');
  assert(edgeAdj.isHardConstraint === true, 'Test 1.3: isHardConstraint is true for REQUIRED_ADJACENCY');

  const edgePref = createRelationshipEdge('g_living', 'g_dining', RELATIONSHIP_TYPES.PREFERRED_ADJACENCY);
  assert(edgePref.type === RELATIONSHIP_TYPES.PREFERRED_ADJACENCY, 'Test 1.4: PREFERRED_ADJACENCY type assigned');
  assert(edgePref.nature === RELATIONSHIP_NATURE.SOFT_PREFERENCE, 'Test 1.5: PREFERRED_ADJACENCY marked SOFT_PREFERENCE');
  assert(edgePref.isHardConstraint === false, 'Test 1.6: isHardConstraint is false for PREFERRED_ADJACENCY');

  const edgeSep = createRelationshipEdge('g_living', 'g_portico', RELATIONSHIP_TYPES.REQUIRED_SEPARATION);
  assert(edgeSep.type === RELATIONSHIP_TYPES.REQUIRED_SEPARATION, 'Test 1.7: REQUIRED_SEPARATION type assigned');
  assert(edgeSep.isHardConstraint === true, 'Test 1.8: REQUIRED_SEPARATION marked HARD_CONSTRAINT');

  const edgeAccess = createRelationshipEdge('g_portico', 'g_foyer', RELATIONSHIP_TYPES.ACCESS_RELATIONSHIP, {
    portalType: ACCESS_PORTAL_TYPES.ENTRY
  });
  assert(edgeAccess.type === RELATIONSHIP_TYPES.ACCESS_RELATIONSHIP, 'Test 1.9: ACCESS_RELATIONSHIP type assigned');
  assert(edgeAccess.portalType === ACCESS_PORTAL_TYPES.ENTRY, 'Test 1.10: Portal type preserved');

  const edgeVert = createRelationshipEdge('g_stairwell_core', 'f_stairwell_core', RELATIONSHIP_TYPES.VERTICAL_CONNECTION);
  assert(edgeVert.type === RELATIONSHIP_TYPES.VERTICAL_CONNECTION, 'Test 1.11: VERTICAL_CONNECTION type assigned');
  assert(edgeVert.isHardConstraint === true, 'Test 1.12: VERTICAL_CONNECTION marked HARD_CONSTRAINT');

  // -------------------------------------------------------------------------
  // TEST 2: Validation of Normal Relationships
  // -------------------------------------------------------------------------
  const validEdges = [edgeAdj, edgePref, edgeSep, edgeAccess, edgeVert];
  const valResult = validateRoomRelationships(validEdges, sampleRooms);

  assert(valResult.valid === true, 'Test 2.1: Valid edges pass validation');
  assert(valResult.errors.length === 0, 'Test 2.2: Zero errors for valid edges');
  assert(valResult.contradictions.length === 0, 'Test 2.3: Zero contradictions for valid edges');

  // -------------------------------------------------------------------------
  // TEST 3: Contradiction Detection - REQUIRED_ADJACENCY vs REQUIRED_SEPARATION
  // -------------------------------------------------------------------------
  const conflictingEdges = [
    createRelationshipEdge('g_kitchen', 'g_living', RELATIONSHIP_TYPES.REQUIRED_ADJACENCY),
    createRelationshipEdge('g_kitchen', 'g_living', RELATIONSHIP_TYPES.REQUIRED_SEPARATION)
  ];
  const valConflict = validateRoomRelationships(conflictingEdges, sampleRooms);

  assert(valConflict.valid === false, 'Test 3.1: Conflicting adjacency and separation marked invalid');
  assert(valConflict.contradictions.length > 0, 'Test 3.2: Contradiction detected');
  assert(valConflict.contradictions[0].includes('REQUIRED_ADJACENCY and REQUIRED_SEPARATION'), 'Test 3.3: Informative conflict message produced');

  // Reverse pair conflict: A->B adjacency vs B->A separation
  const reverseConflict = [
    createRelationshipEdge('g_living', 'g_dining', RELATIONSHIP_TYPES.REQUIRED_ADJACENCY),
    createRelationshipEdge('g_dining', 'g_living', RELATIONSHIP_TYPES.REQUIRED_SEPARATION)
  ];
  const valReverse = validateRoomRelationships(reverseConflict, sampleRooms);
  assert(valReverse.valid === false, 'Test 3.4: Reverse directional pair conflict detected');

  // -------------------------------------------------------------------------
  // TEST 4: Contradiction Detection - ACCESS vs REQUIRED_SEPARATION
  // -------------------------------------------------------------------------
  const accessSepConflict = [
    createRelationshipEdge('f_master_suite', 'g_living', RELATIONSHIP_TYPES.ACCESS_RELATIONSHIP),
    createRelationshipEdge('f_master_suite', 'g_living', RELATIONSHIP_TYPES.REQUIRED_SEPARATION)
  ];
  const valAccessSep = validateRoomRelationships(accessSepConflict, sampleRooms);
  assert(valAccessSep.valid === false, 'Test 4.1: Access vs separation marked invalid');
  assert(valAccessSep.contradictions.some(c => c.includes('ACCESS_RELATIONSHIP and REQUIRED_SEPARATION')), 'Test 4.2: Access vs separation contradiction recorded');

  // -------------------------------------------------------------------------
  // TEST 5: Contradiction Detection - Self-Loops and Same-Floor Vertical
  // -------------------------------------------------------------------------
  const selfLoopEdges = [
    createRelationshipEdge('g_living', 'g_living', RELATIONSHIP_TYPES.REQUIRED_ADJACENCY)
  ];
  const valSelfLoop = validateRoomRelationships(selfLoopEdges, sampleRooms);
  assert(valSelfLoop.valid === false, 'Test 5.1: Self-loop relationship rejected');
  assert(valSelfLoop.contradictions.some(c => c.includes('Self-referencing')), 'Test 5.2: Self-referencing error recorded');

  // Vertical connection on same floor
  const sameFloorVert = [
    createRelationshipEdge('g_living', 'g_dining', RELATIONSHIP_TYPES.VERTICAL_CONNECTION)
  ];
  const valSameFloor = validateRoomRelationships(sameFloorVert, sampleRooms);
  assert(valSameFloor.valid === false, 'Test 5.3: Vertical connection between same-floor rooms rejected');
  assert(valSameFloor.contradictions.some(c => c.includes('Vertical connection contradiction')), 'Test 5.4: Same floor vertical error recorded');

  // -------------------------------------------------------------------------
  // TEST 6: Unknown Relationship Types & Missing Identifiers
  // -------------------------------------------------------------------------
  const invalidTypeEdge = [
    { source: 'g_living', target: 'g_dining', type: 'SUPER_WARP_PORTAL' }
  ];
  const valInvalidType = validateRoomRelationships(invalidTypeEdge, sampleRooms);
  assert(valInvalidType.valid === false, 'Test 6.1: Unknown relationship type rejected');
  assert(valInvalidType.errors.some(e => e.includes('Unknown relationship type')), 'Test 6.2: Unknown type error emitted');

  const missingSourceEdge = [
    { source: '', target: 'g_living', type: RELATIONSHIP_TYPES.REQUIRED_ADJACENCY }
  ];
  const valMissingSource = validateRoomRelationships(missingSourceEdge, sampleRooms);
  assert(valMissingSource.valid === false, 'Test 6.3: Empty source identifier rejected');

  const missingTargetEdge = [
    { source: 'g_living', target: null, type: RELATIONSHIP_TYPES.REQUIRED_ADJACENCY }
  ];
  const valMissingTarget = validateRoomRelationships(missingTargetEdge, sampleRooms);
  assert(valMissingTarget.valid === false, 'Test 6.4: Null target identifier rejected');

  // -------------------------------------------------------------------------
  // TEST 7: References to Nonexistent Rooms
  // -------------------------------------------------------------------------
  const ghostRoomEdge = [
    createRelationshipEdge('g_living', 'subterranean_dungeon', RELATIONSHIP_TYPES.REQUIRED_ADJACENCY)
  ];
  const valGhost = validateRoomRelationships(ghostRoomEdge, sampleRooms);
  assert(valGhost.valid === false, 'Test 7.1: Reference to nonexistent room rejected');
  assert(valGhost.missingRooms.includes('subterranean_dungeon'), 'Test 7.2: Ghost room identified in missingRooms');

  // -------------------------------------------------------------------------
  // TEST 8: Deduplication of Identical Relationships
  // -------------------------------------------------------------------------
  const duplicateEdges = [
    createRelationshipEdge('g_dining', 'g_kitchen', RELATIONSHIP_TYPES.REQUIRED_ADJACENCY),
    createRelationshipEdge('g_dining', 'g_kitchen', RELATIONSHIP_TYPES.REQUIRED_ADJACENCY)
  ];
  const valDup = validateRoomRelationships(duplicateEdges, sampleRooms);
  assert(valDup.valid === true, 'Test 8.1: Duplicate relationship handled safely without failure');
  assert(valDup.validEdges.length === 1, `Test 8.2: Duplicate edge deduplicated (got ${valDup.validEdges.length})`);
  assert(valDup.warnings.some(w => w.includes('deduplicated')), 'Test 8.3: Deduplication warning emitted');

  // -------------------------------------------------------------------------
  // TEST 9: Empty and Malformed Inputs
  // -------------------------------------------------------------------------
  const emptyRes = validateRoomRelationships([]);
  assert(emptyRes.valid === true, 'Test 9.1: Empty edges array produces valid result');
  assert(emptyRes.validEdges.length === 0, 'Test 9.2: Empty edges array has 0 valid edges');

  const nullRes = validateRoomRelationships(null);
  assert(nullRes.valid === false, 'Test 9.3: Null edges argument handled gracefully');
  assert(nullRes.errors.length > 0, 'Test 9.4: Error emitted for non-array');

  const malformedList = [null, undefined, 42, 'not-an-edge'];
  const malformedRes = validateRoomRelationships(malformedList, sampleRooms);
  assert(malformedRes.valid === false, 'Test 9.5: Malformed list entries handled without throwing');
  assert(malformedRes.errors.length === 4, 'Test 9.6: 4 errors emitted for 4 malformed entries');

  // -------------------------------------------------------------------------
  // TEST 10: Full Graph Solving from Room Program (S2-T02 Integration)
  // -------------------------------------------------------------------------
  const visionPrompt = "Design a modern two-floor house on a 30 ft × 40 ft plot with three bedrooms, two bathrooms, a living room, kitchen, parking, and a balcony.";
  const roomProg = generateRoomProgram(visionPrompt);
  const solvedGraph = solveRoomRelationshipGraph(roomProg);

  assert(solvedGraph !== null && typeof solvedGraph === 'object', 'Test 10.1: Solved graph generated from room program');
  assert(Array.isArray(solvedGraph.nodes), 'Test 10.2: Graph contains nodes array');
  assert(solvedGraph.nodes.length > 0, `Test 10.3: Graph populated with nodes (got ${solvedGraph.nodes.length})`);
  assert(Array.isArray(solvedGraph.edges), 'Test 10.4: Graph contains edges array');
  assert(solvedGraph.edges.length > 0, `Test 10.5: Graph populated with edges (got ${solvedGraph.edges.length})`);
  assert(Array.isArray(solvedGraph.hardConstraints), 'Test 10.6: Hard constraints array present');
  assert(Array.isArray(solvedGraph.softPreferences), 'Test 10.7: Soft preferences array present');
  assert(Array.isArray(solvedGraph.verticalConnections), 'Test 10.8: Vertical connections array present');
  assert(solvedGraph.verticalConnections.length >= 1, `Test 10.9: Multi-floor design includes vertical stairwell connection (got ${solvedGraph.verticalConnections.length})`);
  assert(solvedGraph.validation.valid === true, 'Test 10.10: Generated graph is structurally valid');
  assert(solvedGraph.geometricFeasibilityClaimed === false, 'Test 10.11: Explicitly discloses geometric feasibility is not claimed from graph alone');

  // -------------------------------------------------------------------------
  // TEST 11: Backward Compatibility of buildAdjacencyGraph()
  // -------------------------------------------------------------------------
  const legacyGroundRooms = roomProg.floorPrograms[0].rooms;
  const legacyGraph = buildAdjacencyGraph(legacyGroundRooms, SPATIAL_ARCHETYPES.OPEN_CONTEMPORARY, 0);

  assert(legacyGraph.archetype === SPATIAL_ARCHETYPES.OPEN_CONTEMPORARY, 'Test 11.1: Legacy graph preserves archetype');
  assert(legacyGraph.floorIndex === 0, 'Test 11.2: Legacy graph preserves floorIndex');
  assert(Array.isArray(legacyGraph.edges), 'Test 11.3: Legacy graph includes edges array');
  assert(legacyGraph.edges.length > 0, 'Test 11.4: Legacy graph contains edges');
  assert(typeof legacyGraph.edges[0].source === 'string', 'Test 11.5: Edge contains source string');
  assert(typeof legacyGraph.edges[0].target === 'string', 'Test 11.6: Edge contains target string');
  assert(typeof legacyGraph.edges[0].type === 'string', 'Test 11.7: Edge contains type string');
  assert(Array.isArray(legacyGraph.circulationSpine), 'Test 11.8: Legacy graph contains circulationSpine');

  // -------------------------------------------------------------------------
  // TEST 12: Spatial Archetype Selection
  // -------------------------------------------------------------------------
  const narrowArch = selectSpatialArchetype({ plotWidth: 20, plotLength: 40 });
  assert(narrowArch === SPATIAL_ARCHETYPES.LINEAR_SPINE, 'Test 12.1: Narrow plot selects LINEAR_SPINE archetype');

  const courtArch = selectSpatialArchetype({ plotWidth: 40, plotLength: 40, amenities: { hasCourtyard: true } });
  assert(courtArch === SPATIAL_ARCHETYPES.COURTYARD_CENTRIC, 'Test 12.2: Courtyard amenity selects COURTYARD_CENTRIC archetype');

  console.log('\n======================================================================');
  console.log(`ROOM RELATIONSHIP GRAPH TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('======================================================================\n');

  if (failed > 0) {
    if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
      process.exit(1);
    }
    throw new Error(`${failed} adjacency graph solver tests failed.`);
  }

  return { passed, failed };
}

// Allow direct CLI execution
if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
  runAdjacencyGraphTests();
}
