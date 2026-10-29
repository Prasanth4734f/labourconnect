/**
 * LabourConnect Design Engine - Dimensional Calculator Unit Tests
 * 
 * Verifies S1-T04 acceptance criteria:
 * - Example A: 30×40 ft plot -> 1,200 sq.ft plot area.
 * - Example B: 30×40 ft plot with setbacks -> 24×30 ft buildable (720 sq.ft).
 * - Example C: Setbacks consuming entire width -> explicit validation failure.
 * - Example D: Zero, negative, or non-numeric inputs -> rejected cleanly.
 * - Example E: Unit conversion round-trip accuracy within tolerance.
 */

import {
  calculatePlotArea,
  calculateBuildableEnvelope,
  convertUnits,
  roundToPrecision
} from '../geometry/dimensionalCalculator.js';

export function runDimensionalTests() {
  console.log('===============================================================');
  console.log('LABOURCONNECT ENGINE: DIMENSIONAL CALCULATOR TEST SUITE');
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

  // -------------------------------------------------------------------------
  // TEST 1: Example A - 30 ft × 40 ft Plot Area Calculation
  // -------------------------------------------------------------------------
  const plotA = calculatePlotArea(30, 40, 'feet');
  assert(plotA.success === true, 'Test 1.1: Calculate plot area returns success for 30x40');
  assert(plotA.plotAreaSqft === 1200, `Test 1.2: Plot area is exactly 1,200 sq.ft (got ${plotA.plotAreaSqft})`);
  assert(plotA.plotAreaSqm === roundToPrecision(1200 * 0.09290304, 2), 'Test 1.3: Metric equivalent calculated correctly');

  // -------------------------------------------------------------------------
  // TEST 2: Example B - 30×40 ft Plot with Standard Rectangular Setbacks
  // Setbacks: Left 3 ft, Right 3 ft, Front 5 ft, Rear 5 ft
  // Expected: Buildable width = 24 ft, length = 30 ft, area = 720 sq.ft
  // -------------------------------------------------------------------------
  const envB = calculateBuildableEnvelope(30, 40, { left: 3, right: 3, front: 5, rear: 5 });
  assert(envB.success === true, 'Test 2.1: Buildable envelope calculation returns success');
  assert(envB.buildableEnvelope.width === 24, `Test 2.2: Buildable width is 24 ft (got ${envB.buildableEnvelope.width})`);
  assert(envB.buildableEnvelope.length === 30, `Test 2.3: Buildable length is 30 ft (got ${envB.buildableEnvelope.length})`);
  assert(envB.buildableEnvelope.areaSqft === 720, `Test 2.4: Buildable area is 720 sq.ft (got ${envB.buildableEnvelope.areaSqft})`);
  assert(envB.buildableEnvelope.x === 3, 'Test 2.5: Left setback offset X is 3 ft');
  assert(envB.buildableEnvelope.y === 5, 'Test 2.6: Front setback offset Y is 5 ft');
  assert(envB.metrics.groundCoverageRatio === 0.6, 'Test 2.7: Coverage ratio is 60.0% (720/1200)');

  // -------------------------------------------------------------------------
  // TEST 3: Example C - Setbacks Consume Entire Width (Impossible Setback)
  // Plot width 10, setbacks left 6 + right 6 = 12 > 10
  // Expected: Explicit failure, NOT silently clamped or negative
  // -------------------------------------------------------------------------
  const envC = calculateBuildableEnvelope(10, 40, { left: 6, right: 6, front: 5, rear: 5 });
  assert(envC.success === false, 'Test 3.1: Excessive horizontal setbacks rejected cleanly');
  assert(envC.isFeasible === false, 'Test 3.2: isFeasible is false');
  assert(envC.errors.length > 0, 'Test 3.3: Informative error message generated');
  assert(envC.errors[0].includes('Setbacks consume entire plot width'), `Test 3.4: Error identifies width consumption (${envC.errors[0]})`);
  assert(envC.buildableEnvelope === null, 'Test 3.5: No invalid buildable envelope emitted');

  // Excessive vertical setbacks
  const envCVert = calculateBuildableEnvelope(30, 20, { left: 3, right: 3, front: 12, rear: 10 });
  assert(envCVert.success === false, 'Test 3.6: Excessive vertical setbacks rejected cleanly');
  assert(envCVert.errors[0].includes('Setbacks consume entire plot length'), 'Test 3.7: Error identifies length consumption');

  // -------------------------------------------------------------------------
  // TEST 4: Example D - Zero, Negative, Missing, or Non-Numeric Inputs
  // -------------------------------------------------------------------------
  const invalidPlot1 = calculatePlotArea(0, 40);
  assert(invalidPlot1.success === false, 'Test 4.1: Zero plot width rejected');

  const invalidPlot2 = calculatePlotArea(-30, 40);
  assert(invalidPlot2.success === false, 'Test 4.2: Negative plot width rejected');

  const invalidPlot3 = calculatePlotArea(null, 40);
  assert(invalidPlot3.success === false, 'Test 4.3: Null plot width rejected');

  const invalidPlot4 = calculatePlotArea('thirty', 40);
  assert(invalidPlot4.success === false, 'Test 4.4: String non-numeric plot width rejected');

  const invalidEnv1 = calculateBuildableEnvelope(-20, 40);
  assert(invalidEnv1.success === false, 'Test 4.5: Negative plot dimension in envelope rejected');

  const invalidEnv2 = calculateBuildableEnvelope(30, 40, { left: -2 });
  assert(invalidEnv2.success === false, 'Test 4.6: Negative setback value rejected');

  // -------------------------------------------------------------------------
  // TEST 5: Example E - Unit Conversion Round-Trip Accuracy
  // -------------------------------------------------------------------------
  // 100 feet to metres
  const metres = convertUnits(100, 'feet', 'metres');
  assert(metres === 30.48, `Test 5.1: 100 ft converts to exactly 30.48 m (got ${metres})`);

  // Metres back to feet (round-trip accuracy within 0.001 tolerance)
  const feetBack = convertUnits(metres, 'metres', 'feet');
  assert(Math.abs(feetBack - 100) < 0.001, `Test 5.2: Round-trip length conversion accurate to < 0.001 ft (got ${feetBack})`);

  // Area: 1000 sq.ft to sq.m
  const sqm = convertUnits(1000, 'sqft', 'sqm', true);
  assert(sqm === 92.903, `Test 5.3: 1,000 sq.ft converts to 92.903 m² (got ${sqm})`);

  // Area round-trip
  const sqftBack = convertUnits(sqm, 'sqm', 'sqft', true);
  assert(Math.abs(sqftBack - 1000) < 0.01, `Test 5.4: Round-trip area conversion accurate to < 0.01 sq.ft (got ${sqftBack})`);

  // Indian Cents to Sq.Ft (1 cent = 435.6 sq.ft)
  const sqftFromCents = convertUnits(2.5, 'cents', 'sqft', true);
  assert(sqftFromCents === 1089.0, `Test 5.5: 2.5 Cents converts to 1,089.0 sq.ft (got ${sqftFromCents})`);

  console.log('\n===============================================================');
  console.log(`DIMENSIONAL TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('===============================================================\n');

  if (failed > 0) {
    if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
      process.exit(1);
    }
    throw new Error(`${failed} dimensional tests failed.`);
  }
  return { passed, failed };
}

// Run immediately if executed directly via Node
if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
  runDimensionalTests();
}
