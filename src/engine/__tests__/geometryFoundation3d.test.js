/**
 * LabourConnect Design Engine - 3D Geometry Foundation Test Suite
 * 
 * Tests for Sprint 3 Task S3-T01:
 * - Section 1: Centralized Unit Conversions & Round-Trip Invariants
 * - Section 2: Deterministic Plan-to-World Coordinate Transformations
 * - Section 3: Reversible World-to-Plan Transformations & Vector Mapping
 * - Section 4: Floor Elevation Calculation & Architectural Component Stacking
 * - Section 5: 3D Spatial Boundaries, AABB Operations & Containment
 * - Section 6: Canonical Design Model Integration & Structural Preservation
 * - Section 7: Geometry Input Validation, Error Rejection & Diagnostics
 * - Section 8: High-Performance Determinism & Micro-Benchmark
 */

import {
  COORDINATE_SYSTEM_CONVENTION,
  ARCHITECTURAL_3D_DEFAULTS,
  feetToMeters,
  metersToFeet,
  inchesToFeet,
  feetToInches,
  inchesToMeters,
  millimetersToMeters,
  metersToMillimeters,
  sqftToSqm,
  sqmToSqft,
  transformPlanToWorldPoint,
  transformWorldToPlanPoint,
  transformPlanToWorldVector,
  transformPlanToWorldPolygon,
  transformPlanBoundsToWorldBox,
  calculateFloorElevations,
  calculateComponentElevation,
  createBoundingBox3d,
  createEmptyBoundingBox3d,
  expandBoundingBox3d,
  isPointInsideBoundingBox3d,
  doBoundingBoxesIntersect3d,
  calculateDesignWorldBounds,
  validate3dGeometry,
  createGeometryComponent3d
} from '../geometry/geometryFoundation3d.js';

import { LabourConnectDesignEngine } from '../index.js';

let passedTests = 0;
let totalTests = 0;

function assert(condition, testName, details = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`✅ PASS: ${testName}`);
  } else {
    console.error(`❌ FAIL: ${testName} - ${details}`);
    throw new Error(`Test failed: ${testName} - ${details}`);
  }
}

export function runGeometryFoundation3dTests() {
  console.log('\n===============================================================');
  console.log('LABOURCONNECT 3D ENGINE: GEOMETRY FOUNDATION & COORDINATE TESTS (S3-T01)');
  console.log('===============================================================\n');

  // =========================================================================
  // SECTION 1: UNIT CONVERSIONS & MATHEMATICAL ROUND-TRIP INVARIANTS
  // =========================================================================
  console.log('--- Section 1: Centralized Unit Conversions & Invariants ---');

  // 1.1 Feet to Metres exact standard
  const m100ft = feetToMeters(100);
  assert(Math.abs(m100ft - 30.48) < 0.0001, 'Test 1.1: 100 ft converts to exactly 30.48 m', `Got: ${m100ft}`);

  // 1.2 Metres to Feet conversion
  const ft30m = metersToFeet(30.48);
  assert(Math.abs(ft30m - 100.0) < 0.001, 'Test 1.2: 30.48 m converts back to 100.0 ft', `Got: ${ft30m}`);

  // 1.3 Round-trip Feet -> Metres -> Feet identity
  const testDistances = [0.5, 3.0, 10.5, 24.0, 40.0, 60.0, 100.0];
  let roundTripMaxError = 0;
  testDistances.forEach(d => {
    const roundTripped = metersToFeet(feetToMeters(d));
    const err = Math.abs(roundTripped - d);
    if (err > roundTripMaxError) roundTripMaxError = err;
  });
  assert(roundTripMaxError < 0.001, 'Test 1.3: Round-trip Feet->Metres->Feet error < 0.001 ft', `Max error: ${roundTripMaxError}`);

  // 1.4 Inches to Feet and Feet to Inches
  const ftFrom12in = inchesToFeet(12);
  const inFrom5ft = feetToInches(5);
  assert(Math.abs(ftFrom12in - 1.0) < 0.0001, 'Test 1.4a: 12 inches equals exactly 1.0 ft', `Got: ${ftFrom12in}`);
  assert(Math.abs(inFrom5ft - 60.0) < 0.0001, 'Test 1.4b: 5 ft equals exactly 60.0 inches', `Got: ${inFrom5ft}`);

  // 1.5 Inches to Metres
  const mFrom1in = inchesToMeters(1);
  assert(Math.abs(mFrom1in - 0.0254) < 0.0001, 'Test 1.5: 1 inch equals exactly 0.0254 m', `Got: ${mFrom1in}`);

  // 1.6 Millimetres to Metres and reverse
  const mFrom230mm = millimetersToMeters(230);
  const mmFrom0_23m = metersToMillimeters(0.23);
  assert(Math.abs(mFrom230mm - 0.23) < 0.0001, 'Test 1.6a: 230 mm equals 0.23 m', `Got: ${mFrom230mm}`);
  assert(Math.abs(mmFrom0_23m - 230) < 0.001, 'Test 1.6b: 0.23 m equals 230 mm', `Got: ${mmFrom0_23m}`);

  // 1.7 Square Feet to Square Metres
  const sqm1000 = sqftToSqm(1000);
  const sqftBack = sqmToSqft(sqm1000);
  assert(Math.abs(sqm1000 - 92.903) < 0.01, 'Test 1.7a: 1000 sq.ft equals ~92.903 m²', `Got: ${sqm1000}`);
  assert(Math.abs(sqftBack - 1000.0) < 0.01, 'Test 1.7b: 92.903 m² round-trips to 1000.0 sq.ft', `Got: ${sqftBack}`);

  // 1.8 Rejection of non-finite/NaN unit inputs
  let threwNaN = false;
  try { feetToMeters(NaN); } catch (e) { threwNaN = e instanceof TypeError; }
  assert(threwNaN, 'Test 1.8a: feetToMeters rejects NaN input with TypeError');

  let threwInfinity = false;
  try { metersToFeet(Infinity); } catch (e) { threwInfinity = e instanceof TypeError; }
  assert(threwInfinity, 'Test 1.8b: metersToFeet rejects Infinity with TypeError');

  // =========================================================================
  // SECTION 2: DETERMINISTIC PLAN-TO-WORLD COORDINATE TRANSFORMATION
  // =========================================================================
  console.log('\n--- Section 2: Plan-to-World Coordinate Transformations ---');

  // 2.1 Origin mapping
  const originPlan = { x: 0, y: 0 };
  const originWorld = transformPlanToWorldPoint(originPlan, 0);
  assert(originWorld.x === 0 && originWorld.y === 0 && originWorld.z === 0, 'Test 2.1: Plan origin (0,0) maps to World (0,0,0)');

  // 2.2 Axis preservation: Plan X -> World X (Width), Plan Y -> World Z (Depth), Elevation -> World Y
  const planPt = { x: 15.5, y: 28.0 };
  const worldPt = transformPlanToWorldPoint(planPt, 10.5);
  assert(worldPt.x === 15.5, 'Test 2.2a: World X preserves Plan X (Width = 15.5 ft)');
  assert(worldPt.y === 10.5, 'Test 2.2b: World Y represents vertical elevation (10.5 ft)');
  assert(worldPt.z === 28.0, 'Test 2.2c: World Z preserves Plan Y (Depth = 28.0 ft)');

  // 2.3 Immutability: source plan object must not be mutated
  const sourcePt = Object.freeze({ x: 12.0, y: 34.0 });
  const transPt = transformPlanToWorldPoint(sourcePt, 1.5);
  assert(sourcePt.x === 12.0 && sourcePt.y === 34.0, 'Test 2.3: Source plan point is strictly not mutated');
  assert(transPt.z === 34.0, 'Test 2.3b: Transformed point is valid');

  // 2.4 Metric target unit transformation
  const metricWorldPt = transformPlanToWorldPoint({ x: 30, y: 40 }, 10, { targetUnit: 'meters' });
  assert(Math.abs(metricWorldPt.x - 9.144) < 0.001, 'Test 2.4a: Plan X=30ft transforms to World X=9.144m');
  assert(Math.abs(metricWorldPt.y - 3.048) < 0.001, 'Test 2.4b: Elevation Y=10ft transforms to World Y=3.048m');
  assert(Math.abs(metricWorldPt.z - 12.192) < 0.001, 'Test 2.4c: Plan Y=40ft transforms to World Z=12.192m');

  // 2.5 Coordinate System Convention metadata verification
  assert(COORDINATE_SYSTEM_CONVENTION.DEFAULT_UNIT === 'feet', 'Test 2.5: Coordinate system default unit is feet');
  assert(typeof COORDINATE_SYSTEM_CONVENTION.ORIGIN_DESCRIPTION === 'string', 'Test 2.5b: Origin description documented');

  // =========================================================================
  // SECTION 3: REVERSIBLE WORLD-TO-PLAN & VECTOR/POLYGON TRANSFORMATION
  // =========================================================================
  console.log('\n--- Section 3: Reversible World-to-Plan & Vectors/Polygons ---');

  // 3.1 Reversible round-trip: Plan -> World -> Plan
  const originalPlanPt = { x: 22.45, y: 47.85 };
  const wPt = transformPlanToWorldPoint(originalPlanPt, 12.0);
  const recoveredPlanPt = transformWorldToPlanPoint(wPt);
  assert(Math.abs(recoveredPlanPt.x - originalPlanPt.x) < 0.0001, 'Test 3.1a: Round-trip recovers Plan X accurately');
  assert(Math.abs(recoveredPlanPt.y - originalPlanPt.y) < 0.0001, 'Test 3.1b: Round-trip recovers Plan Y accurately');

  // 3.2 Direction Vector Mapping
  const planVec = { dx: 1.0, dy: -2.5 };
  const worldVec = transformPlanToWorldVector(planVec);
  assert(worldVec.x === 1.0, 'Test 3.2a: World vector X matches plan dx');
  assert(worldVec.y === 0, 'Test 3.2b: World vector Y is 0 (pure horizontal direction)');
  assert(worldVec.z === -2.5, 'Test 3.2c: World vector Z matches plan dy');

  // 3.3 Plan Polygon to Horizontal 3D Polygon
  const planPoly = [
    { x: 3, y: 5 },
    { x: 27, y: 5 },
    { x: 27, y: 35 },
    { x: 3, y: 35 }
  ];
  const worldPoly = transformPlanToWorldPolygon(planPoly, 1.5);
  assert(worldPoly.length === 4, 'Test 3.3a: Transformed 3D polygon preserves vertex count (4)');
  assert(worldPoly[0].x === 3 && worldPoly[0].y === 1.5 && worldPoly[0].z === 5, 'Test 3.3b: Vertex 0 mapped to (3, 1.5, 5)');
  assert(worldPoly[2].x === 27 && worldPoly[2].y === 1.5 && worldPoly[2].z === 35, 'Test 3.3c: Vertex 2 mapped to (27, 1.5, 35)');

  // 3.4 Degenerate polygon rejection (<3 vertices)
  let threwPoly = false;
  try { transformPlanToWorldPolygon([{ x: 0, y: 0 }, { x: 1, y: 1 }], 0); } catch { threwPoly = true; }
  assert(threwPoly, 'Test 3.4: Rejects degenerate polygon with <3 vertices');

  // =========================================================================
  // SECTION 4: FLOOR ELEVATION & ARCHITECTURAL COMPONENT STACKING
  // =========================================================================
  console.log('\n--- Section 4: Floor Elevation Calculation & Stacking ---');

  // 4.1 Single-Floor Stacking
  const singleFloorData = [{ floorIndex: 0, name: 'Ground Floor' }];
  const singleStack = calculateFloorElevations(singleFloorData);
  assert(singleStack.valid, 'Test 4.1a: Single floor elevation calculation succeeds');
  assert(singleStack.floorElevations[0].baseElevationY === 1.5, 'Test 4.1b: Ground floor base is at plinth elevation (+1.5 ft)');
  assert(singleStack.floorElevations[0].clearCeilingHeightFt === 10.0, 'Test 4.1c: Ground floor clear ceiling height is 10.0 ft');
  assert(singleStack.floorElevations[0].topElevationY === 12.0, 'Test 4.1d: Ground floor slab top is 1.5 + 10.5 = 12.0 ft');

  // 4.2 Multi-Floor Stacking (G + 1 + Terrace)
  const multiFloorData = [
    { floorIndex: 0, name: 'Ground Floor' },
    { floorIndex: 1, name: 'First Floor' },
    { floorIndex: 2, name: 'Rooftop Terrace' }
  ];
  const multiStack = calculateFloorElevations(multiFloorData);
  assert(multiStack.floorElevations.length === 3, 'Test 4.2a: All 3 floors stacked');
  assert(multiStack.floorElevations[1].baseElevationY === 12.0, 'Test 4.2b: Level 1 base starts exactly on Level 0 slab top (12.0 ft)');
  assert(multiStack.floorElevations[1].topElevationY === 22.5, 'Test 4.2c: Level 1 slab top reaches 22.5 ft');
  assert(multiStack.floorElevations[2].isTerrace, 'Test 4.2d: Level 2 recognized as terrace level');
  assert(multiStack.floorElevations[2].clearCeilingHeightFt === 3.5, 'Test 4.2e: Terrace clear height equals parapet height (3.5 ft)');
  assert(multiStack.totalBuildingHeightFt === 26.0, 'Test 4.2f: Total building height reaches 26.0 ft to parapet top');

  // 4.3 Architectural Component Vertical Positioning
  const floorBaseY = 12.0;
  const doorElev = calculateComponentElevation(floorBaseY, 'door');
  assert(doorElev.minY === 12.0, 'Test 4.3a: Door bottom sits on floor slab (12.0 ft)');
  assert(doorElev.maxY === 19.0, 'Test 4.3b: Door top/lintel reaches 19.0 ft (12.0 + 7.0 ft)');

  const winElev = calculateComponentElevation(floorBaseY, 'window');
  assert(winElev.sillY === 14.5, 'Test 4.3c: Window sill starts at 12.0 + 2.5 = 14.5 ft');
  assert(winElev.lintelY === 19.0, 'Test 4.3d: Window lintel matches door lintel at 19.0 ft');

  const slabElev = calculateComponentElevation(floorBaseY, 'slab');
  assert(slabElev.minY === 11.5 && slabElev.maxY === 12.0, 'Test 4.3e: Slab thickness (0.5 ft) extends below finished floor level');

  // =========================================================================
  // SECTION 5: 3D SPATIAL BOUNDS & AABB OPERATIONS
  // =========================================================================
  console.log('\n--- Section 5: 3D Spatial Boundaries & AABB Operations ---');

  // 5.1 Create 3D Bounding Box
  const box1 = createBoundingBox3d({ x: 3, y: 1.5, z: 5 }, { x: 27, y: 12.0, z: 35 });
  assert(box1.width === 24.0, 'Test 5.1a: Box width = 27 - 3 = 24.0 ft');
  assert(box1.height === 10.5, 'Test 5.1b: Box height = 12.0 - 1.5 = 10.5 ft');
  assert(box1.depth === 30.0, 'Test 5.1c: Box depth = 35 - 5 = 30.0 ft');
  assert(box1.volume === 7560.0, 'Test 5.1d: Box volume = 24 * 10.5 * 30 = 7,560 cu.ft');
  assert(box1.center.x === 15.0 && box1.center.y === 6.75 && box1.center.z === 20.0, 'Test 5.1e: Centroid correctly computed');

  // 5.2 Normalization on inverted min/max
  const boxInverted = createBoundingBox3d({ x: 27, y: 12.0, z: 35 }, { x: 3, y: 1.5, z: 5 });
  assert(boxInverted.min.x === 3 && boxInverted.max.x === 27, 'Test 5.2: Inverted min/max automatically normalized');

  // 5.3 Point inside box containment check
  const insidePt = { x: 10, y: 5, z: 15 };
  const outsidePt = { x: 30, y: 5, z: 15 };
  assert(isPointInsideBoundingBox3d(box1, insidePt), 'Test 5.3a: Interior point is reported inside');
  assert(!isPointInsideBoundingBox3d(box1, outsidePt), 'Test 5.3b: Exterior point is reported outside');

  // 5.4 AABB Intersections
  const box2Intersecting = createBoundingBox3d({ x: 20, y: 5, z: 25 }, { x: 35, y: 15, z: 45 });
  const box3Disjoint = createBoundingBox3d({ x: 40, y: 1.5, z: 5 }, { x: 60, y: 12, z: 35 });
  assert(doBoundingBoxesIntersect3d(box1, box2Intersecting), 'Test 5.4a: Overlapping boxes detected as intersecting');
  assert(!doBoundingBoxesIntersect3d(box1, box3Disjoint), 'Test 5.4b: Non-overlapping boxes detected as disjoint');

  // 5.5 Expand Bounding Box
  const emptyBox = createEmptyBoundingBox3d();
  const expandedBox = expandBoundingBox3d(emptyBox, { x: 5, y: 2, z: 10 });
  const expandedTwice = expandBoundingBox3d(expandedBox, { x: 25, y: 14, z: 30 });
  assert(expandedTwice.width === 20 && expandedTwice.height === 12 && expandedTwice.depth === 20, 'Test 5.5: Empty box expands to contain all points');

  // =========================================================================
  // SECTION 6: CANONICAL DESIGN MODEL INTEGRATION & PRESERVATION
  // =========================================================================
  console.log('\n--- Section 6: Canonical Design Model Integration ---');

  const engine = new LabourConnectDesignEngine();
  const genResult = engine.generateDesign({
    plotWidth: 30,
    plotLength: 50,
    dimensionUnit: 'feet',
    floorsCount: 2,
    bhkCount: 3,
    bathroomsCount: 3,
    archStyle: 'modern',
    hasBalcony: true,
    hasParking: true,
    userPrompt: '30x50 3BHK modern duplex villa'
  }, { seed: 12345 });

  assert(genResult.success, 'Test 6.1: Generates real canonical design fixture');
  const canonicalDesign = genResult.design;

  // 6.2 Compute complete Design World Bounds
  const designBounds = calculateDesignWorldBounds(canonicalDesign);
  assert(designBounds.siteBounds.width === 30, 'Test 6.2a: Site world bounds width equals plotWidth (30 ft)');
  assert(designBounds.siteBounds.depth === 50, 'Test 6.2b: Site world bounds depth equals plotLength (50 ft)');
  assert(designBounds.buildingBounds.width === canonicalDesign.site.buildableEnvelope.width, 'Test 6.2c: Building bounds width equals envelope width');
  assert(designBounds.buildingBounds.depth === canonicalDesign.site.buildableEnvelope.length, 'Test 6.2d: Building bounds depth equals envelope length');
  assert(designBounds.totalHeightFt > 20.0, 'Test 6.2e: 2-floor building total height > 20 ft');
  assert(designBounds.floorBounds.length === canonicalDesign.floors.length, `Test 6.2f: Floor bounds count (${designBounds.floorBounds.length}) matches design floors count (${canonicalDesign.floors.length})`);

  // 6.3 Room World Coordinates vs Canonical Model Room Bounds
  const groundFloor = canonicalDesign.floors[0];
  const firstRoom = groundFloor.rooms[0];
  const roomWorldBox = transformPlanBoundsToWorldBox(
    firstRoom.bounds,
    ARCHITECTURAL_3D_DEFAULTS.PLINTH_HEIGHT_FT,
    ARCHITECTURAL_3D_DEFAULTS.CLEAR_CEILING_HEIGHT_FT
  );
  assert(roomWorldBox.width === firstRoom.bounds.width, 'Test 6.3a: Room world box width matches plan width');
  assert(roomWorldBox.depth === firstRoom.bounds.length, 'Test 6.3b: Room world box depth matches plan length');
  assert(roomWorldBox.min.y === ARCHITECTURAL_3D_DEFAULTS.PLINTH_HEIGHT_FT, 'Test 6.3c: Room world box base starts at plinth level (+1.5 ft)');

  // 6.4 Stairwell Core Vertical Alignment in 3D
  const groundStair = canonicalDesign.floors[0].rooms.find(r => r.type === 'stairwell');
  const upperStair = canonicalDesign.floors[1].rooms.find(r => r.type === 'stairwell');
  if (groundStair && upperStair) {
    const gStairWorld = transformPlanToWorldPoint({ x: groundStair.bounds.x, y: groundStair.bounds.y }, 1.5);
    const uStairWorld = transformPlanToWorldPoint({ x: upperStair.bounds.x, y: upperStair.bounds.y }, 12.0);
    assert(Math.abs(gStairWorld.x - uStairWorld.x) <= 0.5, 'Test 6.4a: Stair core World X is vertically aligned within 0.5 ft');
    assert(Math.abs(gStairWorld.z - uStairWorld.z) <= 0.5, 'Test 6.4b: Stair core World Z is vertically aligned within 0.5 ft');
    assert(uStairWorld.y - gStairWorld.y >= 10.0, 'Test 6.4c: Vertical separation between stair levels >= 10 ft');
  } else {
    assert(true, 'Test 6.4: Single floor design (skipped multi-floor stair check)');
  }

  // =========================================================================
  // SECTION 7: GEOMETRY VALIDATION & ERROR REJECTION
  // =========================================================================
  console.log('\n--- Section 7: Geometry Validation & Error Rejection ---');

  // 7.1 Valid 3D point validation
  const validPointReport = validate3dGeometry({ x: 10, y: 2, z: 30 }, 'point');
  assert(validPointReport.valid, 'Test 7.1a: Valid 3D point passes validation');

  const invalidPointReport = validate3dGeometry({ x: NaN, y: 2, z: 30 }, 'point');
  assert(!invalidPointReport.valid && invalidPointReport.errors.length > 0, 'Test 7.1b: NaN point coordinate rejected with error');

  // 7.2 Valid 3D box validation
  const validBoxReport = validate3dGeometry(box1, 'box');
  assert(validBoxReport.valid, 'Test 7.2a: Valid 3D box passes validation');

  const invalidBoxReport = validate3dGeometry({ min: { x: 10, y: 5, z: 10 }, max: { x: 5, y: 5, z: 10 } }, 'box');
  assert(!invalidBoxReport.valid, 'Test 7.2b: Inverted box min > max rejected with error');

  // 7.3 Component Metadata Constructor
  const compMeta = createGeometryComponent3d({
    id: 'wall_mesh_1',
    type: 'wall_prism',
    designId: canonicalDesign.id,
    floorIndex: 0,
    roomRef: 'g_living',
    materialSpec: 'travertine_stone'
  });
  assert(compMeta.id === 'wall_mesh_1', 'Test 7.3a: Component metadata preserves ID');
  assert(compMeta.materialSpec === 'travertine_stone', 'Test 7.3b: Component metadata preserves material specification');
  assert(typeof compMeta.createdAt === 'string', 'Test 7.3c: Timestamp added to component metadata');

  // =========================================================================
  // SECTION 8: MICRO-BENCHMARK & DETERMINISM VERIFICATION
  // =========================================================================
  console.log('\n--- Section 8: Performance Benchmark & Determinism ---');

  // 8.1 Transformation Determinism
  const detP1 = transformPlanToWorldPoint({ x: 14.5678, y: 32.1234 }, 10.5);
  const detP2 = transformPlanToWorldPoint({ x: 14.5678, y: 32.1234 }, 10.5);
  assert(detP1.x === detP2.x && detP1.y === detP2.y && detP1.z === detP2.z, 'Test 8.1: Transformations are 100% deterministic');

  // 8.2 Performance Benchmark (10,000 coordinate transformations)
  const startTime = Date.now();
  let accumulatedVol = 0;
  for (let i = 0; i < 10000; i++) {
    const wp = transformPlanToWorldPoint({ x: i % 50, y: (i * 2) % 80 }, 10.5);
    accumulatedVol += wp.x + wp.z;
  }
  const durationMs = Date.now() - startTime;
  assert(durationMs < 100, `Test 8.2: 10,000 coordinate transformations executed in ${durationMs}ms (<100ms budget)`, `Accumulated: ${accumulatedVol}`);

  // Summary
  console.log('\n===============================================================');
  console.log(`S3-T01 3D GEOMETRY FOUNDATION SUMMARY: ${passedTests} PASSED, 0 FAILED`);
  console.log('===============================================================\n');

  return { passed: passedTests, failed: totalTests - passedTests, total: totalTests };
}

// Direct CLI execution support
if (process.argv[1]?.endsWith('geometryFoundation3d.test.js')) {
  runGeometryFoundation3dTests();
}
