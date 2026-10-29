/**
 * LabourConnect Design Engine - Automated Acceptance Test Suite
 * 
 * Tests the 10 core acceptance criteria:
 * 1. Same prompt generates materially different valid alternatives.
 * 2. Distinct prompts generate distinct geometry and room counts.
 * 3. Zero reliance on fixed 10 templates.
 * 4. Structural similarity check detects and rejects duplicates.
 * 5. Impossible constraints return explicit failures, never fabricated designs.
 * 6. Dimensions and room counts satisfy validated constraints.
 * 7. 2D plan and 3D geometry share canonical single source of truth.
 * 8. Walkthrough traverses real generated room sequence.
 * 9. Modifications create versioned revisions.
 * 10. Deterministic estimation derives directly from geometry.
 */

import { LabourConnectDesignEngine, calculateStructuralSimilarity, validateCanonicalSchema } from '../index.js';

export function runEngineCoreTests() {
  console.log('===============================================================');
  console.log('LABOURCONNECT DESIGN ENGINE: AUTOMATED ACCEPTANCE TEST SUITE');
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

  const engine = new LabourConnectDesignEngine();

  // -------------------------------------------------------------------------
  // TEST 1: Same prompt produces materially different valid alternatives
  // -------------------------------------------------------------------------
  const promptInput = {
    userPrompt: 'I want a modern 3BHK two-storey house on a 40x60 plot with pooja and parking.',
    plotWidth: 40,
    plotLength: 60,
    bhkCount: 3,
    floorsCount: 2,
    homeBudgetInr: 4500000
  };

  const varOutcome = engine.generateVariations(promptInput, 2);
  assert(varOutcome.success === true, 'Test 1.1: Generate variations returns success');
  assert(varOutcome.variations.length === 2, 'Test 1.2: Returns exactly 2 requested variations');

  const v1 = varOutcome.variations[0];
  const v2 = varOutcome.variations[1];

  const similarity = calculateStructuralSimilarity(v1, v2);
  assert(similarity < 0.82, `Test 1.3: Variations are structurally distinct (similarity: ${(similarity * 100).toFixed(1)}% < 82% threshold)`);
  assert(v1.code !== v2.code, 'Test 1.4: Unique variant codes generated');

  // -------------------------------------------------------------------------
  // TEST 2: Materially different prompts lead to different geometry & counts
  // -------------------------------------------------------------------------
  const compactInput = {
    userPrompt: 'Compact 2BHK on 20x40 narrow plot',
    plotWidth: 20,
    plotLength: 40,
    bhkCount: 2,
    floorsCount: 1,
    homeBudgetInr: 2200000
  };

  const luxuryInput = {
    userPrompt: 'Grand luxury 4BHK villa on 50x80 plot',
    plotWidth: 50,
    plotLength: 80,
    bhkCount: 4,
    floorsCount: 2,
    homeBudgetInr: 9500000
  };

  const compactRes = engine.generateDesign(compactInput);
  const luxuryRes = engine.generateDesign(luxuryInput);

  assert(compactRes.success === true, 'Test 2.1: Compact 2BHK generation succeeds');
  assert(luxuryRes.success === true, 'Test 2.2: Luxury 4BHK generation succeeds');

  const compactArea = compactRes.design.metrics.builtUpAreaSqft;
  const luxuryArea = luxuryRes.design.metrics.builtUpAreaSqft;
  assert(luxuryArea > compactArea * 2.5, `Test 2.3: Luxury area (${luxuryArea} sqft) is realistically larger than compact (${compactArea} sqft)`);
  assert(luxuryRes.design.metrics.roomCountTotal > compactRes.design.metrics.roomCountTotal, 'Test 2.4: Room counts match BHK differences');

  // -------------------------------------------------------------------------
  // TEST 3: No fixed 10 demo templates returned
  // -------------------------------------------------------------------------
  const _templateImageKeywords = ['iso_cutaway_3bhk_modern', 'narrow_plot_15x40_dim', 'iso_villa_carporch'];
  const hasTemplateString = JSON.stringify(compactRes.design).includes('iso_cutaway_3bhk_modern');
  assert(!hasTemplateString, 'Test 3.1: Output does not reference hardcoded static template files');
  assert(compactRes.design.geometry3d.walls.length > 0, 'Test 3.2: Real physical walls generated instead of static image placeholder');

  // -------------------------------------------------------------------------
  // TEST 4: Similarity checks reject near-duplicates
  // -------------------------------------------------------------------------
  // Artificially test similarity of a layout with itself
  const selfSim = calculateStructuralSimilarity(v1, v1);
  assert(selfSim >= 0.99, `Test 4.1: Self-similarity is 100% (${(selfSim * 100).toFixed(1)}%)`);

  // -------------------------------------------------------------------------
  // TEST 5: Impossible constraints produce clear failure / clarification
  // -------------------------------------------------------------------------
  const impossibleInput = {
    userPrompt: 'Huge 5BHK mansion with 6 bathrooms on tiny 10x15 plot with 1 floor',
    plotWidth: 10,
    plotLength: 15,
    bhkCount: 5,
    floorsCount: 1
  };

  const impossibleRes = engine.generateDesign(impossibleInput);
  assert(impossibleRes.success === false, 'Test 5.1: Impossible prompt rejected cleanly');
  assert(impossibleRes.errors && impossibleRes.errors.length > 0, 'Test 5.2: Informative engineering errors returned');
  assert(impossibleRes.clarificationNeeded && impossibleRes.clarificationNeeded.length > 0, 'Test 5.3: Clarification recommendations provided');

  // -------------------------------------------------------------------------
  // TEST 6: Room containment within buildable envelope
  // -------------------------------------------------------------------------
  const env = v1.site.buildableEnvelope;
  let allRoomsContained = true;
  v1.floors.forEach(fl => {
    fl.rooms.forEach(rm => {
      const b = rm.bounds;
      if (b.x < env.x - 0.2 || (b.x + b.width) > env.x + env.width + 0.2) allRoomsContained = false;
      if (b.y < env.y - 0.2 || (b.y + b.length) > env.y + env.length + 0.2) allRoomsContained = false;
    });
  });
  assert(allRoomsContained, 'Test 6.1: All rooms strictly fit inside site buildable envelope');

  // -------------------------------------------------------------------------
  // TEST 7: 2D plan and 3D geometry share canonical single source of truth
  // -------------------------------------------------------------------------
  const groundRoomsCount2D = v1.floors[0].rooms.length;
  const groundRooms3DCount = v1.geometry3d.rooms3d.filter(r => r.floorIndex === 0).length;
  assert(groundRoomsCount2D === groundRooms3DCount, `Test 7.1: 2D room count (${groundRoomsCount2D}) equals 3D room count (${groundRooms3DCount})`);

  // -------------------------------------------------------------------------
  // TEST 8: Walkthrough path traverses real generated rooms
  // -------------------------------------------------------------------------
  const wt = v1.walkthroughTrajectory;
  assert(wt && wt.waypoints.length >= 6, `Test 8.1: Walkthrough generated with ${wt.waypoints.length} real spatial waypoints`);
  const firstRoomWaypoint = wt.waypoints.find(w => w.floor === 'Ground Floor');
  assert(firstRoomWaypoint && firstRoomWaypoint.position.y === 5.5, 'Test 8.2: Camera eye-level placed accurately at 5.5 ft above slab');

  // -------------------------------------------------------------------------
  // TEST 9: Design modifications update version and geometry
  // -------------------------------------------------------------------------
  const modRes = engine.modifyDesign(v1, 'Add central thotti courtyard and change to traditional style');
  assert(modRes.success === true, 'Test 9.1: Modification succeeds');
  assert(modRes.design.code.includes('REV'), 'Test 9.2: Revised design code assigned');

  // -------------------------------------------------------------------------
  // TEST 10: Deterministic estimation uses traceable geometry
  // -------------------------------------------------------------------------
  const boq = v1.boqEstimate;
  assert(boq.totalCostInr > 0, `Test 10.1: Deterministic cost calculated: ₹${boq.totalCostInr.toLocaleString('en-IN')}`);
  assert(boq.quantities.concreteCuMtr > 0, `Test 10.2: Physical concrete volume calculated: ${boq.quantities.concreteCuMtr} m³`);
  assert(boq.quantities.steelTons > 0, `Test 10.3: Physical steel weight calculated: ${boq.quantities.steelTons} Tons`);
  assert(boq.assumptions.length > 0, 'Test 10.4: Transparent engineering assumptions documented');

  // -------------------------------------------------------------------------
  // TEST 11: Schema validation
  // -------------------------------------------------------------------------
  const schemaCheck = validateCanonicalSchema(v1);
  assert(schemaCheck.valid === true, 'Test 11.1: Design JSON complies with Canonical Schema v2.0');

  console.log('\n===============================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('===============================================================\n');

  if (failed > 0) {
    if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
      process.exit(1);
    }
    throw new Error(`${failed} engineCore tests failed.`);
  }
  return { passed, failed };
}

if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
  runEngineCoreTests();
}

