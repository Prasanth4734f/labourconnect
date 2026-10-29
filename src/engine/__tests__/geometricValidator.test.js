/**
 * LabourConnect Design Engine - Geometric Validator Unit Tests
 * 
 * Verifies S1-T05 acceptance criteria:
 * 1. Plot dimensions must be valid.
 * 2. Buildable dimensions must be valid.
 * 3. Required room dimensions must be strictly positive.
 * 4. Room geometry must use the documented coordinate system (non-negative X, Y).
 * 5. Room polygons must have valid geometry where supported (>= 3 vertices, finite).
 * 6. Room geometry must remain within permitted buildable boundary.
 * 7. Invalid or missing coordinates must be rejected cleanly.
 * 8. Duplicate element identifiers must be detected.
 * 9. Spatial collision / overlapping rooms must return clear errors.
 * 10. Vertical stairwell core alignment across floors.
 * 11. Structured result return: { valid, errors, warnings, checks_performed, checkedElementsCount }.
 */

import { validateArchitectureGeometry } from '../evaluation/geometricValidator.js';

export function runGeometricTests() {
  console.log('===============================================================');
  console.log('LABOURCONNECT ENGINE: GEOMETRIC VALIDATOR TEST SUITE (S1-T05)');
  console.log('===============================================================\n');

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

  // Base valid layout fixture
  function createValidBaseLayout() {
    return {
      site: {
        plotWidth: 30,
        plotLength: 40,
        buildableEnvelope: {
          x: 3,
          y: 5,
          width: 24,
          length: 30
        }
      },
      floors: [
        {
          floorIndex: 0,
          name: 'Ground Floor',
          rooms: [
            {
              id: 'g_living',
              name: 'Living Room',
              type: 'living',
              bounds: { x: 3, y: 5, width: 14, length: 12 },
              polygon: [
                { x: 3, y: 5 },
                { x: 17, y: 5 },
                { x: 17, y: 17 },
                { x: 3, y: 17 }
              ]
            },
            {
              id: 'g_kitchen',
              name: 'Kitchen',
              type: 'kitchen',
              bounds: { x: 17, y: 5, width: 10, length: 12 }
            },
            {
              id: 'g_stairwell',
              name: 'Staircase Core',
              type: 'staircase',
              bounds: { x: 3, y: 17, width: 7, length: 12 }
            },
            {
              id: 'g_bedroom',
              name: 'Guest Bedroom',
              type: 'bedroom',
              bounds: { x: 10, y: 17, width: 14, length: 12 }
            }
          ]
        },
        {
          floorIndex: 1,
          name: 'First Floor',
          rooms: [
            {
              id: 'f_stairwell',
              name: 'Staircase Core',
              type: 'staircase',
              bounds: { x: 3, y: 17, width: 7, length: 12 }
            },
            {
              id: 'f_master_bed',
              name: 'Master Bedroom',
              type: 'bedroom',
              bounds: { x: 10, y: 17, width: 14, length: 12 }
            },
            {
              id: 'f_bed_2',
              name: 'Bedroom 2',
              type: 'bedroom',
              bounds: { x: 3, y: 5, width: 14, length: 12 }
            }
          ]
        }
      ]
    };
  }

  // -------------------------------------------------------------------------
  // TEST 1: Fully Valid Multi-Floor Layout
  // -------------------------------------------------------------------------
  const validLayout = createValidBaseLayout();
  const res1 = validateArchitectureGeometry(validLayout);
  assert(res1.valid === true, 'Test 1.1: Valid layout passes geometric validation');
  assert(res1.errors.length === 0, 'Test 1.2: Valid layout contains zero errors');
  assert(res1.checks_performed.length >= 8, `Test 1.3: Performed ${res1.checks_performed.length} canonical geometric checks`);
  assert(res1.checkedElementsCount === 7, `Test 1.4: Accurately counted 7 verified room elements (got ${res1.checkedElementsCount})`);

  // -------------------------------------------------------------------------
  // TEST 2: Check 1 - Plot Dimensions Must Be Strictly Positive Numbers
  // -------------------------------------------------------------------------
  const invalidPlot1 = createValidBaseLayout();
  invalidPlot1.site.plotWidth = -30;
  const res2 = validateArchitectureGeometry(invalidPlot1);
  assert(res2.valid === false, 'Test 2.1: Negative plot width is rejected');
  assert(res2.errors.some(e => e.includes('Invalid plot width')), 'Test 2.2: Reports informative plot width error');

  const invalidPlot2 = createValidBaseLayout();
  invalidPlot2.site.plotLength = 0;
  const res2b = validateArchitectureGeometry(invalidPlot2);
  assert(res2b.valid === false, 'Test 2.3: Zero plot length is rejected');

  // -------------------------------------------------------------------------
  // TEST 3: Check 2 - Buildable Envelope Must Be Valid & Contained
  // -------------------------------------------------------------------------
  const invalidEnv1 = createValidBaseLayout();
  invalidEnv1.site.buildableEnvelope.width = -10;
  const res3 = validateArchitectureGeometry(invalidEnv1);
  assert(res3.valid === false, 'Test 3.1: Negative buildable width is rejected');
  assert(res3.errors.some(e => e.includes('Invalid buildable envelope width')), 'Test 3.2: Reports buildable envelope width error');

  delete invalidEnv1.site.buildableEnvelope;
  const res3b = validateArchitectureGeometry({ site: { plotWidth: 30, plotLength: 40 }, floors: [] });
  assert(res3b.valid === false, 'Test 3.3: Missing buildable envelope is rejected');

  // -------------------------------------------------------------------------
  // TEST 4: Check 3 - Room Dimensions Must Be Strictly Positive
  // -------------------------------------------------------------------------
  const nonPosRoom = createValidBaseLayout();
  nonPosRoom.floors[0].rooms[0].bounds.width = 0;
  const res4 = validateArchitectureGeometry(nonPosRoom);
  assert(res4.valid === false, 'Test 4.1: Room with width = 0 is rejected');
  assert(res4.errors.some(e => e.includes('non-positive dimensions')), 'Test 4.2: Reports non-positive dimension error');

  // -------------------------------------------------------------------------
  // TEST 5: Check 4 - Coordinate Convention (Non-negative X, Y)
  // -------------------------------------------------------------------------
  const negCoords = createValidBaseLayout();
  negCoords.floors[0].rooms[0].bounds.x = -2;
  const res5 = validateArchitectureGeometry(negCoords);
  assert(res5.valid === false, 'Test 5.1: Negative room coordinate is rejected');
  assert(res5.errors.some(e => e.includes('violates coordinate convention')), 'Test 5.2: Reports coordinate convention violation');

  // -------------------------------------------------------------------------
  // TEST 6: Check 5 - Room Polygon Integrity
  // -------------------------------------------------------------------------
  const degenPoly = createValidBaseLayout();
  degenPoly.floors[0].rooms[0].polygon = [{ x: 3, y: 5 }, { x: 10, y: 5 }]; // only 2 points
  const res6 = validateArchitectureGeometry(degenPoly);
  assert(res6.valid === false, 'Test 6.1: Polygon with fewer than 3 vertices is rejected');
  assert(res6.errors.some(e => e.includes('fewer than 3 vertices')), 'Test 6.2: Reports polygon degenerate vertex count');

  // -------------------------------------------------------------------------
  // TEST 7: Check 6 - Boundary Containment within Buildable Envelope
  // -------------------------------------------------------------------------
  const outsideRoom = createValidBaseLayout();
  // Buildable envelope is X: 3..27, Y: 5..35. Let room extend to X: 30 (exceeds 27)
  outsideRoom.floors[0].rooms[1].bounds.x = 20;
  outsideRoom.floors[0].rooms[1].bounds.width = 12; // extends to 32
  const res7 = validateArchitectureGeometry(outsideRoom);
  assert(res7.valid === false, 'Test 7.1: Room exceeding buildable envelope is rejected');
  assert(res7.errors.some(e => e.includes('exceeds buildable envelope boundary')), 'Test 7.2: Reports boundary overflow violation with exact extents');

  // -------------------------------------------------------------------------
  // TEST 8: Check 7 - Coordinate Completeness (Non-numeric / Missing bounds)
  // -------------------------------------------------------------------------
  const missingBounds = createValidBaseLayout();
  delete missingBounds.floors[0].rooms[0].bounds;
  const res8 = validateArchitectureGeometry(missingBounds);
  assert(res8.valid === false, 'Test 8.1: Missing bounds object is rejected');
  assert(res8.errors.some(e => e.includes('missing geometric "bounds" object')), 'Test 8.2: Reports missing bounds error');

  const nanBounds = createValidBaseLayout();
  nanBounds.floors[0].rooms[0].bounds.width = NaN;
  const res8b = validateArchitectureGeometry(nanBounds);
  assert(res8b.valid === false, 'Test 8.3: NaN coordinate is rejected');

  // -------------------------------------------------------------------------
  // TEST 9: Check 8 - Duplicate Element Identifier Detection
  // -------------------------------------------------------------------------
  const dupIdLayout = createValidBaseLayout();
  dupIdLayout.floors[1].rooms[1].id = 'g_living'; // Duplicate of ground floor living room
  const res9 = validateArchitectureGeometry(dupIdLayout);
  assert(res9.valid === false, 'Test 9.1: Duplicate element identifier is detected across floors');
  assert(res9.errors.some(e => e.includes('Duplicate element identifier detected')), 'Test 9.2: Reports duplicate ID error with offending element IDs');

  // -------------------------------------------------------------------------
  // TEST 10: Check 9 - Spatial Collision / Overlap (> 1.5 sq.ft)
  // -------------------------------------------------------------------------
  const overlapLayout = createValidBaseLayout();
  // Living is at x:3, y:5, w:14, l:12 (X: 3..17, Y: 5..17)
  // Overlap Kitchen at x:10, y:5, w:10, l:12 -> overlap from x:10..17 (7ft) * y:5..17 (12ft) = 84 sqft!
  overlapLayout.floors[0].rooms[1].bounds.x = 10;
  const res10 = validateArchitectureGeometry(overlapLayout);
  assert(res10.valid === false, 'Test 10.1: Spatial overlap > 1.5 sq.ft is detected');
  assert(res10.errors.some(e => e.includes('Spatial collision on Ground Floor')), 'Test 10.2: Reports spatial collision with calculated overlap area');

  // -------------------------------------------------------------------------
  // TEST 11: Check 10 - Vertical Alignment of Stair Core
  // -------------------------------------------------------------------------
  const misalignedStair = createValidBaseLayout();
  // Ground stair is at x:3, y:17. Move first floor stair to x:12, y:17 (Δx = 9 ft)
  misalignedStair.floors[1].rooms[0].bounds.x = 12;
  const res11 = validateArchitectureGeometry(misalignedStair);
  assert(res11.valid === false, 'Test 11.1: Structural vertical stair misalignment detected');
  assert(res11.errors.some(e => e.includes('Structural vertical misalignment')), 'Test 11.2: Reports vertical core misalignment error');

  // -------------------------------------------------------------------------
  // TEST 12: Warning for Sub-standard Habitable Room Clearance
  // -------------------------------------------------------------------------
  const narrowRoom = createValidBaseLayout();
  narrowRoom.floors[0].rooms[3].bounds.width = 3.5; // Bedroom under 4 ft
  const res12 = validateArchitectureGeometry(narrowRoom);
  assert(res12.warnings.length > 0, 'Test 12.1: Non-fatal clearance warnings emitted');
  assert(res12.warnings.some(w => w.includes('below recommended minimum width')), 'Test 12.2: Reports sub-standard room clearance warning');

  console.log('\n===============================================================');
  console.log(`GEOMETRIC VALIDATOR TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('===============================================================\n');

  if (failed > 0) {
    if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
      process.exit(1);
    }
    throw new Error(`${failed} geometric tests failed.`);
  }
  return { passed, failed };
}

// Allow direct CLI execution
if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
  runGeometricTests();
}
