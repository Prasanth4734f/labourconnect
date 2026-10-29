/**
 * LabourConnect Design Engine - Consolidated Final Sprint 2 Test Suite: S2-T10
 * 
 * Comprehensive verification of the unified design-generation workflow:
 * 
 * Part 1: Unified End-to-End Workflow Pipeline
 *   Natural-language requirements ➔ structured interpretation ➔ room program ➔
 *   relationship graph ➔ procedural layout ➔ constraint optimization ➔
 *   geometric validation ➔ quality scoring & ranking ➔ similarity detection ➔
 *   canonical design model ➔ 2D floor plans & CAD drawings.
 * 
 * Part 2: Representative Scenario Matrix (Scenarios 1 through 10)
 *   1. Compact 1BHK home
 *   2. Compact 2BHK home
 *   3. Narrow and deep plot (18×60 ft)
 *   4. Wide and shallow plot (50×30 ft)
 *   5. Premium 4BHK luxury villa (50×70 ft)
 *   6. Multi-floor house (2 storeys)
 *   7. Requirements with parking and pooja room
 *   8. Requirements with optional amenities disabled
 *   9. Restrictive plot dimensions and setbacks (Infeasibility diagnostic)
 *   10. Contradictory architectural requirements (Contradiction diagnostic)
 * 
 * Part 3: Architectural Diversity & Regression Tests (Tests A through K)
 *   - Test A: Different Plot Dimensions
 *   - Test B: Different Room Programs
 *   - Test C: Multi-Floor Designs & Vertical Alignment
 *   - Test D: Infeasible Constraint Rejection
 *   - Test E: Multi-Candidate Diversity on Same Prompt (<82% similarity)
 *   - Test F: Deterministic Reproducibility
 *   - Test G: 2D Floor-Plan Geometric Consistency
 *   - Test H: 3D Geometry and Slabs Alignment
 *   - Test I: Deterministic BOQ & Material Takeoff
 *   - Test J: Continuous Walkthrough Trajectory Planning
 *   - Test K: Near-Duplicate Detection & History Filtering
 * 
 * Part 4: Professional 2D CAD Output Quality & Geometry Inspection
 *   - Plot and building boundary dimension chains
 *   - Clear vs nominal room dimension schedules
 *   - Physical wall thicknesses (0.75 ft exterior vs 0.375 ft interior)
 *   - Shared-wall deduplication and clean opening subtraction
 *   - Door hinges, leaf endpoints, and quarter-circle swing arcs
 *   - Window frame lines, sills, and bathroom louver vents
 *   - Staircase tread geometry (~10"), landings, and travel direction arrows
 *   - SVG vector CAD structure (defs, grid, layers, title block, NBC 2016 note, compass)
 */

import {
  LabourConnectDesignEngine,
  calculateStructuralSimilarity,
  evaluateArchitecturalSimilarity,
  generate2dFloorPlan,
  generateFloorPlanSvg,
  validateCanonicalSchema,
  CAD_LINE_WEIGHTS
} from '../index.js';

export function runEndToEndWorkflowTests() {
  console.log('======================================================================');
  console.log('🚀 S2-T10: CONSOLIDATED END-TO-END WORKFLOW & DIVERSITY VERIFICATION');
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

  const engine = new LabourConnectDesignEngine();

  // ===========================================================================
  // PART 1: UNIFIED END-TO-END WORKFLOW PIPELINE
  // ===========================================================================
  console.log('--- Part 1: Unified End-to-End Generation Workflow ---');

  const baselinePrompt = {
    userPrompt: 'Modern 3BHK two-storey villa on 40x60 plot with parking, pooja, and balcony',
    plotWidth: 40,
    plotLength: 60,
    bhkCount: 3,
    floorsCount: 2,
    homeBudgetInr: 5500000
  };

  const e2eOutcome = engine.generateDesign(baselinePrompt);
  assert(e2eOutcome.success === true, 'Test 1.1: End-to-end design generation succeeds');

  const design = e2eOutcome.design;
  assert(design !== null && typeof design === 'object', 'Test 1.2: Design object produced');

  // Validate against canonical schema v2.0
  const schemaValidation = validateCanonicalSchema(design);
  assert(schemaValidation.valid === true, 'Test 1.3: Design complies with Canonical Design Schema v2.0');

  // Verify inputs and site
  assert(design.site.plotWidth === 40, 'Test 1.4: Site plot width is 40 ft');
  assert(design.site.plotLength === 60, 'Test 1.5: Site plot length is 60 ft');
  assert(design.site.buildableEnvelope.width > 0, 'Test 1.6: Buildable envelope width is positive');
  assert(design.site.buildableEnvelope.length > 0, 'Test 1.7: Buildable envelope length is positive');

  // Verify room schedule and geometry
  assert(Array.isArray(design.floors) && design.floors.length === 3, 'Test 1.8: Has Ground, First, and Terrace floors');
  const allRooms = design.floors.flatMap(f => f.rooms);
  assert(allRooms.length >= 7, `Test 1.9: Generated realistic room count (${allRooms.length} rooms)`);
  assert(allRooms.every(r => r.bounds.width > 0 && r.bounds.length > 0), 'Test 1.10: All rooms have positive dimensions');

  // Verify 3D procedural geometry
  assert(design.geometry3d && design.geometry3d.walls.length > 0, 'Test 1.11: 3D procedural geometry generated');
  assert(design.geometry3d.slabs.length >= 2, 'Test 1.12: 3D floor slabs generated');

  // Verify continuous walkthrough path
  assert(design.walkthroughTrajectory && design.walkthroughTrajectory.waypoints.length >= 6, 'Test 1.13: Walkthrough camera trajectory planned');

  // Verify deterministic BOQ estimate
  assert(design.boqEstimate && design.boqEstimate.totalCostInr > 0, 'Test 1.14: Deterministic BOQ takeoff calculated');
  assert(design.boqEstimate.quantities.concreteCuMtr > 0, 'Test 1.15: Concrete volume calculated from geometry');
  assert(design.boqEstimate.quantities.steelTons > 0, 'Test 1.16: Reinforcement steel weight calculated from geometry');

  // Verify evaluation report, scoring, and fingerprint
  assert(design.evaluation && design.evaluation.isValid === true, 'Test 1.17: Design marked valid in evaluation report');
  assert(design.evaluation.scores && design.evaluation.scores.overallScore > 0, 'Test 1.18: Design quality scored across architectural criteria');
  assert(typeof design.evaluation.fingerprint === 'string' && design.evaluation.fingerprint.length > 0, 'Test 1.19: Design fingerprint computed');

  // Verify 2D CAD floor plan drawings attachment
  assert(design.drawings && design.drawings.success === true, 'Test 1.20: 2D CAD floor plan drawing suite attached to design');
  assert(design.drawings.floorPlans.length === design.floors.length, 'Test 1.21: 2D drawings generated for all floors');

  // ===========================================================================
  // PART 2: REPRESENTATIVE SCENARIO MATRIX (SCENARIOS 1 THROUGH 10)
  // ===========================================================================
  console.log('\n--- Part 2: Representative Scenario Matrix (Scenarios 1-10) ---');

  // Scenario 1: Compact 1BHK home
  const sc1 = engine.generateDesign({ userPrompt: 'Compact 1BHK home on 25x35 plot', plotWidth: 25, plotLength: 35, bhkCount: 1, floorsCount: 1 });
  assert(sc1.success === true, 'Test 2.1: Scenario 1 (Compact 1BHK on 25×35) succeeds');
  assert(sc1.design.metrics.builtUpAreaSqft < 700, `Test 2.2: Scenario 1 built-up area is compact (${sc1.design.metrics.builtUpAreaSqft} sq.ft)`);

  // Scenario 2: Compact 2BHK home
  const sc2 = engine.generateDesign({ userPrompt: 'Compact 2BHK home on 30x45 plot', plotWidth: 30, plotLength: 45, bhkCount: 2, floorsCount: 1 });
  assert(sc2.success === true, 'Test 2.3: Scenario 2 (Compact 2BHK on 30×45) succeeds');
  assert(sc2.design.inputs.bhkCount === 2, 'Test 2.4: Scenario 2 bedroom count is 2');

  // Scenario 3: Narrow and deep plot
  const sc3 = engine.generateDesign({ userPrompt: 'Narrow and deep plot 18x60 2BHK', plotWidth: 18, plotLength: 60, bhkCount: 2, floorsCount: 1 });
  assert(sc3.success === true, 'Test 2.5: Scenario 3 (Narrow 18×60 plot) succeeds');
  assert(sc3.design.site.plotWidth === 18 && sc3.design.site.plotLength === 60, 'Test 2.6: Scenario 3 preserves narrow plot geometry');

  // Scenario 4: Wide and shallow plot
  const sc4 = engine.generateDesign({ userPrompt: 'Wide and shallow plot 50x30 3BHK', plotWidth: 50, plotLength: 30, bhkCount: 3, floorsCount: 2 });
  assert(sc4.success === true, 'Test 2.7: Scenario 4 (Wide 50×30 plot) succeeds');

  // Scenario 5: Premium 4BHK luxury villa
  const sc5 = engine.generateDesign({ userPrompt: 'Premium 4BHK luxury villa on 50x70 plot', plotWidth: 50, plotLength: 70, bhkCount: 4, floorsCount: 2, archStyle: 'luxury_villa' });
  assert(sc5.success === true, 'Test 2.8: Scenario 5 (Premium 4BHK on 50×70) succeeds');
  assert(sc5.design.metrics.builtUpAreaSqft > 2500, `Test 2.9: Scenario 5 luxury built-up area scales realistically (${sc5.design.metrics.builtUpAreaSqft} sq.ft)`);

  // Scenario 6: Multi-floor house
  const sc6 = engine.generateDesign({ userPrompt: 'Two-storey 3BHK on 35x50 plot', plotWidth: 35, plotLength: 50, bhkCount: 3, floorsCount: 2 });
  assert(sc6.success === true, 'Test 2.10: Scenario 6 (Two-storey house) succeeds');
  assert(sc6.design.floors.length === 3, 'Test 2.11: Scenario 6 contains Ground, First, and Terrace levels');

  // Scenario 7: Requirements with parking and pooja room
  const sc7 = engine.generateDesign({ userPrompt: '3BHK with parking and pooja on 40x50 plot', plotWidth: 40, plotLength: 50, bhkCount: 3, floorsCount: 2, amenities: { hasParking: true, hasPooja: true } });
  assert(sc7.success === true, 'Test 2.12: Scenario 7 (With parking and pooja) succeeds');
  assert(sc7.design.inputs.amenities.hasParking === true, 'Test 2.13: Scenario 7 parking amenity enabled');
  assert(sc7.design.inputs.amenities.hasPooja === true, 'Test 2.14: Scenario 7 pooja room amenity enabled');
  assert(sc7.design.floors.some(f => f.rooms.some(r => r.type === 'pooja')), 'Test 2.14b: Scenario 7 generated layout contains room with type === "pooja"');

  // Scenario 8: Requirements with optional amenities disabled
  const sc8 = engine.generateDesign({ userPrompt: 'Simple 2BHK without parking or pooja on 30x45', plotWidth: 30, plotLength: 45, bhkCount: 2, floorsCount: 1, amenities: { hasParking: false, hasPooja: false, hasBalcony: false } });
  assert(sc8.success === true, 'Test 2.15: Scenario 8 (Optional amenities disabled) succeeds');
  assert(sc8.design.inputs.amenities.hasParking === false, 'Test 2.16: Scenario 8 parking amenity disabled');
  assert(sc8.design.inputs.amenities.hasPooja === false, 'Test 2.17: Scenario 8 pooja amenity disabled in metadata');
  assert(!sc8.design.floors.some(f => f.rooms.some(r => r.type === 'pooja')), 'Test 2.17b: Scenario 8 generated layout contains NO room with type === "pooja"');

  // Scenario 9: Restrictive plot dimensions and setbacks
  const sc9 = engine.generateDesign({ userPrompt: '5BHK mansion on tiny 12x15 plot with 1 floor', plotWidth: 12, plotLength: 15, bhkCount: 5, floorsCount: 1 });
  assert(sc9.success === false, 'Test 2.18: Scenario 9 (Restrictive impossible plot) cleanly rejected');
  assert(sc9.errors && sc9.errors.length > 0, 'Test 2.19: Scenario 9 returns informative engineering errors');
  assert(sc9.clarificationNeeded && sc9.clarificationNeeded.length > 0, 'Test 2.20: Scenario 9 provides civil engineering guidance');

  // Scenario 10: Contradictory architectural requirements
  const sc10 = engine.generateDesign({ userPrompt: 'Single floor duplex house on 30x40', plotWidth: 30, plotLength: 40 });
  assert(sc10.success === false, 'Test 2.21: Scenario 10 (Contradictory single floor duplex) cleanly rejected');
  assert(sc10.contradictions && sc10.contradictions.length > 0, 'Test 2.22: Scenario 10 returns structured contradiction details');

  // Scenario 10b: Hyphenated "single-floor duplex" contradiction
  const sc10b = engine.generateDesign({ userPrompt: 'single-floor duplex on 30x40', plotWidth: 30, plotLength: 40 });
  assert(sc10b.success === false, 'Test 2.23: Hyphenated single-floor duplex cleanly rejected');
  assert(sc10b.contradictions.some(c => c.fields.includes('floorsCount')), 'Test 2.24: Hyphenated single-floor duplex flags floorsCount contradiction');

  // Scenario 10c: Structured floorsCount: 1 vs prompt duplex contradiction
  const sc10c = engine.generateDesign({ userPrompt: 'duplex villa on 30x40', plotWidth: 30, plotLength: 40, floorsCount: 1 });
  assert(sc10c.success === false, 'Test 2.25: Structured floorsCount: 1 vs duplex cleanly rejected');
  assert(sc10c.contradictions.some(c => c.fields.includes('floorsCount')), 'Test 2.26: Structured floorsCount: 1 flags contradiction');

  // Additional End-to-End Pooja Exclusion & Precedence Verification (Tests E2E-P1 to E2E-P5)
  // E2E-P1: Top-level hasPooja: false excludes pooja room from all generated floors
  const scTopLevelNoPooja = engine.generateDesign({ userPrompt: '3BHK on 30x45 plot', plotWidth: 30, plotLength: 45, hasPooja: false });
  assert(scTopLevelNoPooja.success === true, 'Test E2E-P1.1: Top-level hasPooja=false succeeds');
  assert(!scTopLevelNoPooja.design.floors.some(f => f.rooms.some(r => r.type === 'pooja')), 'Test E2E-P1.2: Generated design has NO pooja room when top-level hasPooja=false');

  // E2E-P2: Natural language "2BHK without pooja" excludes pooja room from all generated floors
  const scWithoutPooja = engine.generateDesign({ userPrompt: '2BHK without pooja on 30x45', plotWidth: 30, plotLength: 45 });
  assert(scWithoutPooja.success === true, 'Test E2E-P2.1: Prompt "without pooja" succeeds');
  assert(!scWithoutPooja.design.floors.some(f => f.rooms.some(r => r.type === 'pooja')), 'Test E2E-P2.2: Generated design has NO pooja room for prompt "without pooja"');

  // E2E-P3: Natural language "2BHK, no mandir" excludes pooja room from all generated floors
  const scNoMandir = engine.generateDesign({ userPrompt: '2BHK, no mandir on 30x45', plotWidth: 30, plotLength: 45 });
  assert(scNoMandir.success === true, 'Test E2E-P3.1: Prompt "no mandir" succeeds');
  assert(!scNoMandir.design.floors.some(f => f.rooms.some(r => r.type === 'pooja')), 'Test E2E-P3.2: Generated design has NO pooja room for prompt "no mandir"');

  // E2E-P4: Contradictory positive prompt with structured hasPooja: false follows structured flag
  const scContradictPooja = engine.generateDesign({ userPrompt: '3BHK with pooja room on 30x45', plotWidth: 30, plotLength: 45, amenities: { hasPooja: false } });
  assert(scContradictPooja.success === true, 'Test E2E-P4.1: Contradictory pooja request generates successfully');
  assert(!scContradictPooja.design.floors.some(f => f.rooms.some(r => r.type === 'pooja')), 'Test E2E-P4.2: Structured hasPooja=false overrides prompt mention; NO pooja generated');

  // E2E-P5: Positive pooja in prompt with no structured flag includes pooja room
  const scPositivePooja = engine.generateDesign({ userPrompt: '3BHK with pooja on 35x50', plotWidth: 35, plotLength: 50 });
  assert(scPositivePooja.success === true, 'Test E2E-P5.1: Positive prompt "with pooja" succeeds');
  assert(scPositivePooja.design.floors.some(f => f.rooms.some(r => r.type === 'pooja')), 'Test E2E-P5.2: Generated design includes pooja room for positive prompt');

  // Additional End-to-End Balcony Exclusion & Precedence Verification (Tests E2E-B1 to E2E-B5)
  // E2E-B1: Top-level hasBalcony: false excludes balcony from all floors of multistory house
  const scTopLevelNoBalc = engine.generateDesign({ plotWidth: 30, plotLength: 40, floorsCount: 2, bhkCount: 3, hasBalcony: false });
  assert(scTopLevelNoBalc.success === true, 'Test E2E-B1.1: Top-level hasBalcony=false multistory succeeds');
  assert(!scTopLevelNoBalc.design.floors.some(f => f.rooms.some(r => r.type === 'balcony' || r.id.includes('balcony'))), 'Test E2E-B1.2: No floor contains balcony when top-level hasBalcony=false');

  // E2E-B2: Nested amenities.hasBalcony: false excludes balcony from multistory house
  const scNestedNoBalc = engine.generateDesign({ plotWidth: 30, plotLength: 40, floorsCount: 2, bhkCount: 3, amenities: { hasBalcony: false } });
  assert(scNestedNoBalc.success === true, 'Test E2E-B2.1: Nested amenities.hasBalcony=false multistory succeeds');
  assert(!scNestedNoBalc.design.floors.some(f => f.rooms.some(r => r.type === 'balcony' || r.id.includes('balcony'))), 'Test E2E-B2.2: No floor contains balcony when amenities.hasBalcony=false');

  // E2E-B3: Natural language "without balcony" on multistory house excludes balcony
  const scPromptWithoutBalc = engine.generateDesign({ userPrompt: '2BHK two-storey on 30x40 without balcony', plotWidth: 30, plotLength: 40, floorsCount: 2, bhkCount: 2 });
  assert(scPromptWithoutBalc.success === true, 'Test E2E-B3.1: Prompt "without balcony" succeeds');
  assert(!scPromptWithoutBalc.design.floors.some(f => f.rooms.some(r => r.type === 'balcony' || r.id.includes('balcony'))), 'Test E2E-B3.2: No floor contains balcony for prompt "without balcony"');

  // E2E-B4: Natural language "balcony is not required" on multistory house excludes balcony
  const scPromptNotReqBalc = engine.generateDesign({ userPrompt: '2BHK two-storey on 30x40, balcony is not required', plotWidth: 30, plotLength: 40, floorsCount: 2, bhkCount: 2 });
  assert(scPromptNotReqBalc.success === true, 'Test E2E-B4.1: Prompt "balcony is not required" succeeds');
  assert(!scPromptNotReqBalc.design.floors.some(f => f.rooms.some(r => r.type === 'balcony' || r.id.includes('balcony'))), 'Test E2E-B4.2: No floor contains balcony for prompt "balcony is not required"');

  // E2E-B5: Positive balcony on multistory house includes balcony
  const scPositiveBalc = engine.generateDesign({ plotWidth: 30, plotLength: 40, floorsCount: 2, bhkCount: 3, hasBalcony: true });
  assert(scPositiveBalc.success === true, 'Test E2E-B5.1: Positive hasBalcony=true succeeds');
  assert(scPositiveBalc.design.floors.some(f => f.rooms.some(r => r.type === 'balcony')), 'Test E2E-B5.2: Generated design includes balcony for positive hasBalcony=true');

  // Additional End-to-End Parking Exclusion & Precedence Verification (Tests E2E-PK1 to E2E-PK4)
  // E2E-PK1: Top-level hasParking: false excludes parking/portico
  const scTopLevelNoPark = engine.generateDesign({ plotWidth: 30, plotLength: 40, floorsCount: 2, bhkCount: 2, hasParking: false });
  assert(scTopLevelNoPark.success === true, 'Test E2E-PK1.1: Top-level hasParking=false succeeds');
  assert(!scTopLevelNoPark.design.floors.some(f => f.rooms.some(r => r.type === 'parking' || r.id.includes('portico'))), 'Test E2E-PK1.2: Generated design has NO parking/portico when hasParking=false');

  // E2E-PK2: Natural language "do not include parking" excludes parking/portico
  const scPromptDoNotIncludePark = engine.generateDesign({ userPrompt: '2BHK on 30x40, do not include parking', plotWidth: 30, plotLength: 40, floorsCount: 2, bhkCount: 2 });
  assert(scPromptDoNotIncludePark.success === true, 'Test E2E-PK2.1: Prompt "do not include parking" succeeds');
  assert(!scPromptDoNotIncludePark.design.floors.some(f => f.rooms.some(r => r.type === 'parking' || r.id.includes('portico'))), 'Test E2E-PK2.2: Generated design has NO parking/portico for "do not include parking"');

  // E2E-PK3: Natural language "exclude car porch" excludes parking/portico
  const scPromptExcludePorch = engine.generateDesign({ userPrompt: '2BHK on 30x40, exclude car porch', plotWidth: 30, plotLength: 40, floorsCount: 2, bhkCount: 2 });
  assert(scPromptExcludePorch.success === true, 'Test E2E-PK3.1: Prompt "exclude car porch" succeeds');
  assert(!scPromptExcludePorch.design.floors.some(f => f.rooms.some(r => r.type === 'parking' || r.id.includes('portico'))), 'Test E2E-PK3.2: Generated design has NO parking/portico for "exclude car porch"');

  // E2E-PK4: Positive parking request includes parking/portico
  const scPositivePark = engine.generateDesign({ plotWidth: 30, plotLength: 40, floorsCount: 2, bhkCount: 2, hasParking: true });
  assert(scPositivePark.success === true, 'Test E2E-PK4.1: Positive hasParking=true succeeds');
  assert(scPositivePark.design.floors.some(f => f.rooms.some(r => r.type === 'parking' || r.id.includes('portico'))), 'Test E2E-PK4.2: Generated design includes parking/portico for positive hasParking=true');

  // ===========================================================================
  // PART 3: ARCHITECTURAL DIVERSITY & REGRESSION TESTS (TESTS A THROUGH K)
  // ===========================================================================
  console.log('\n--- Part 3: Architectural Diversity & Regression Tests (Tests A-K) ---');

  // Test A: Different Plot Dimensions
  const plotA = sc1.design.site;
  const plotB = sc5.design.site;
  assert(plotA.plotWidth !== plotB.plotWidth && plotA.plotLength !== plotB.plotLength, 'Test A.1: Distinct plot dimensions applied');
  assert(sc5.design.metrics.builtUpAreaSqft > sc1.design.metrics.builtUpAreaSqft * 3, 'Test A.2: Built-up area scales with plot size');

  // Test B: Different Room Programs
  const rooms1BHK = sc1.design.floors[0].rooms.map(r => r.type);
  const rooms4BHK = sc5.design.floors.flatMap(f => f.rooms).map(r => r.type);
  assert(rooms4BHK.filter(t => t.includes('bed')).length > rooms1BHK.filter(t => t.includes('bed')).length, 'Test B.1: Bedroom counts reflect room program');

  // Test C: Multi-Floor Designs & Vertical Alignment
  const groundRoomsC = sc6.design.floors[0].rooms;
  const upperRoomsC = sc6.design.floors[1].rooms;
  const groundStair = groundRoomsC.find(r => r.type === 'stairwell');
  const upperStair = upperRoomsC.find(r => r.type === 'stairwell');
  assert(groundStair !== undefined, 'Test C.1: Ground floor contains stairwell');
  assert(upperStair !== undefined, 'Test C.2: Upper floor contains stairwell');
  if (groundStair && upperStair) {
    const dx = Math.abs(groundStair.bounds.x - upperStair.bounds.x);
    const dy = Math.abs(groundStair.bounds.y - upperStair.bounds.y);
    assert(dx <= 0.5 && dy <= 0.5, `Test C.3: Vertical stairwell core aligned across floors (dx=${dx}, dy=${dy})`);
  }

  // Test D: Infeasible Constraint Rejection
  assert(sc9.isFeasible === false, 'Test D.1: Infeasible plot marked isFeasible: false');
  assert(sc9.errors[0].includes('Cannot fit'), 'Test D.2: Error explains spatial infeasibility honestly');

  // Test E: Multi-Candidate Diversity on Same Prompt
  const varResult = engine.generateVariations(baselinePrompt, 2);
  assert(varResult.success === true && varResult.variations.length === 2, 'Test E.1: Multiple variations generated');
  const variation1 = varResult.variations[0];
  const variation2 = varResult.variations[1];
  const varSimilarity = calculateStructuralSimilarity(variation1, variation2);
  assert(varSimilarity < 0.82, `Test E.2: Candidates on same prompt are diverse (similarity: ${(varSimilarity * 100).toFixed(1)}% < 82%)`);
  assert(variation1.code !== variation2.code, 'Test E.3: Variations have distinct variant codes');

  // Test F: Deterministic Reproducibility
  const fixedSeed = 8842109;
  const run1 = engine.generateDesign(baselinePrompt, { seed: fixedSeed, variationIndex: 0 });
  const run2 = engine.generateDesign(baselinePrompt, { seed: fixedSeed, variationIndex: 0 });
  assert(run1.success === true && run2.success === true, 'Test F.1: Both seeded runs succeed');
  assert(run1.design.evaluation.fingerprint === run2.design.evaluation.fingerprint, 'Test F.2: Identical inputs and seed produce identical fingerprint');
  const runSim = calculateStructuralSimilarity(run1.design, run2.design);
  assert(runSim >= 0.99, `Test F.3: Seeded reproducibility yields 100% similarity (got ${(runSim * 100).toFixed(1)}%)`);

  // Test G: 2D Floor-Plan Geometric Consistency
  const gPlan = generate2dFloorPlan(variation1, { floorIndex: 0 });
  assert(gPlan.success === true, 'Test G.1: 2D floor plan generation succeeds');
  assert(gPlan.roomElements.length === variation1.floors[0].rooms.length, 'Test G.2: 2D room count matches canonical model floor rooms');
  assert(gPlan.dimensions.plotDimensions.width === variation1.site.plotWidth, 'Test G.3: 2D plot width matches site specification');

  // Test H: 3D Geometry and Slabs Alignment
  const rooms2DCount = variation1.floors.flatMap(f => f.rooms).length;
  const rooms3DCount = variation1.geometry3d.rooms3d.length;
  assert(rooms2DCount === rooms3DCount, `Test H.1: 2D rooms count (${rooms2DCount}) matches 3D rooms count (${rooms3DCount})`);
  assert(variation1.geometry3d.slabs.length === variation1.floors.length, 'Test H.2: 3D slab count matches floor count');

  // Test I: Deterministic BOQ & Material Takeoff
  const boq1 = variation1.boqEstimate;
  assert(boq1.totalCostInr > 1000000, `Test I.1: BOQ cost calculated (₹${boq1.totalCostInr})`);
  assert(boq1.quantities.steelTons > 0, `Test I.2: Reinforcement steel calculated (${boq1.quantities.steelTons} Tons)`);
  assert(boq1.quantities.concreteCuMtr > 0, `Test I.3: Concrete volume calculated (${boq1.quantities.concreteCuMtr} m³)`);

  // Test J: Continuous Walkthrough Trajectory Planning
  const wtTraj = variation1.walkthroughTrajectory;
  assert(wtTraj && wtTraj.waypoints.length >= 6, `Test J.1: Walkthrough has ${wtTraj.waypoints.length} waypoints`);
  assert(wtTraj.waypoints.every(wp => wp.cameraHeightFt >= 5.0), 'Test J.2: Camera eye-level maintained at human eye height (>= 5 ft)');

  // Test K: Near-Duplicate Detection & History Filtering
  // Create an artificial nudged clone with 0.1 ft coordinate nudge
  const clonedLayout = JSON.parse(JSON.stringify(variation1.floors));
  clonedLayout[0].rooms[0].bounds.x += 0.1;
  const nudgeCandidate = {
    ...variation1,
    id: 'nudge-test',
    floors: clonedLayout
  };
  const nudgeReport = evaluateArchitecturalSimilarity(variation1, nudgeCandidate);
  assert(nudgeReport.isDuplicate === true, 'Test K.1: Nudged design (<0.3 ft) detected as duplicate');
  assert(nudgeReport.overallSimilarity >= 0.95, `Test K.2: Nudged design similarity is >=95% (got ${(nudgeReport.overallSimilarity * 100).toFixed(1)}%)`);

  // ===========================================================================
  // PART 4: PROFESSIONAL 2D CAD OUTPUT QUALITY & GEOMETRY INSPECTION
  // ===========================================================================
  console.log('\n--- Part 4: Professional 2D CAD Output Quality & Geometry Inspection ---');

  const svgGround = generateFloorPlanSvg(variation1, { floorIndex: 0 });
  const _svgUpper = generateFloorPlanSvg(variation1, { floorIndex: 1 });

  // 1. SVG Vector Markup Structure
  assert(typeof svgGround === 'string' && svgGround.length > 1000, 'Test 4.1: Ground floor SVG generated with substantial markup (>1KB)');
  assert(svgGround.includes('<svg xmlns="http://www.w3.org/2000/svg"'), 'Test 4.2: Valid SVG namespace declaration');
  assert(svgGround.includes('viewBox="0 0'), 'Test 4.3: Scaled viewBox defined');
  assert(svgGround.includes('<defs>'), 'Test 4.4: CAD defs with grid patterns, hatches, and markers present');

  // 2. Layer Hierarchy Inspection
  assert(svgGround.includes('id="layer-site-boundaries"'), 'Test 4.5: Site boundaries layer present');
  assert(svgGround.includes('id="layer-rooms"'), 'Test 4.6: Rooms layer present');
  assert(svgGround.includes('id="layer-walls"'), 'Test 4.7: Cut walls layer present');
  assert(svgGround.includes('id="layer-doors"'), 'Test 4.8: Doors and swings layer present');
  assert(svgGround.includes('id="layer-windows"'), 'Test 4.9: Windows and sills layer present');
  assert(svgGround.includes('id="layer-dimensions"'), 'Test 4.10: Dimension chains layer present');
  assert(svgGround.includes('id="title-block"'), 'Test 4.11: Professional CAD title block present');
  assert(svgGround.includes('id="north-arrow"'), 'Test 4.12: Orientation compass north arrow present');

  // 3. Wall Line Thicknesses and Opening Subtraction
  assert(svgGround.includes(`stroke-width="${CAD_LINE_WEIGHTS.CUT_WALL_EXTERIOR}"`), 'Test 4.13: Exterior load-bearing walls rendered with 2.8pt cut weight');
  assert(svgGround.includes(`stroke-width="${CAD_LINE_WEIGHTS.CUT_WALL_INTERIOR}"`), 'Test 4.14: Interior partitions rendered with 1.8pt line weight');
  assert(gPlan.walls.stats.openingsSubtractedCount > 0, `Test 4.15: Wall openings subtracted (${gPlan.walls.stats.openingsSubtractedCount} openings)`);

  // 4. Doors and Swing Arcs
  assert(gPlan.openings.doors.length > 0, `Test 4.16: Ground floor has ${gPlan.openings.doors.length} doors`);
  assert(gPlan.openings.doors.every(d => d.swingPath !== undefined), 'Test 4.17: All doors have quarter-circle swing arc paths');

  // 5. Windows and Sills
  assert(gPlan.openings.windows.length > 0, `Test 4.18: Ground floor has ${gPlan.openings.windows.length} windows`);
  assert(gPlan.openings.windows.every(w => w.start !== undefined && w.end !== undefined), 'Test 4.19: All windows have architectural sill coordinates');

  // 6. Circulation and Staircase
  assert(gPlan.staircases.length > 0, 'Test 4.20: Ground floor staircase present');
  assert(gPlan.staircases[0].treadCount >= 8, `Test 4.21: Staircase has realistic tread count (${gPlan.staircases[0].treadCount})`);
  assert(gPlan.staircases[0].travelArrow.direction === 'UP', 'Test 4.22: Ground floor stair direction is UP');

  // 7. Multi-Floor Upper Plan
  const uPlan = generate2dFloorPlan(variation1, { floorIndex: 1 });
  assert(uPlan.success === true, 'Test 4.23: Upper floor plan model generated');
  if (uPlan.staircases.length > 0) {
    assert(uPlan.staircases[0].travelArrow.direction === 'DN', 'Test 4.24: Upper floor stair direction is DN');
  }

  // 8. 4-Tier Dimension Chains Inspection
  assert(gPlan.dimensions.plotDimensions.width === variation1.site.plotWidth && gPlan.dimensions.plotDimensions.length === variation1.site.plotLength, 'Test 4.25: Tier 1 Plot dimensions match site specs');
  assert(gPlan.dimensions.setbackDimensions.length === 4, 'Test 4.26: Tier 2 Municipal setbacks (front, rear, left, right) present');
  assert(gPlan.dimensions.buildingDimensions.width === gPlan.site.envelope.width && gPlan.dimensions.buildingDimensions.length === gPlan.site.envelope.length, 'Test 4.27: Tier 3 Building footprint dimensions match envelope');
  assert(gPlan.dimensions.roomDimensions.length === gPlan.roomElements.length, 'Test 4.28: Tier 4 Internal room dimensions present for all rooms');

  // 9. Compliance Note & Disclaimer (Corrected qualified wording)
  assert(svgGround.includes('NBC 2016 SPACE STANDARDS ALIGNED'), 'Test 4.29a: Qualified space standards label present');
  assert(!svgGround.includes('NBC 2016 COMPLIANT |'), 'Test 4.29b: Obsolete unqualified compliance claim removed');
  assert(svgGround.includes('NOT FOR DIRECT CONSTRUCTION WITHOUT LICENSED STAMP'), 'Test 4.30: Mandatory architectural disclaimer present');

  console.log('\n======================================================================');
  console.log(`S2-T10 END-TO-END TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('======================================================================\n');

  return { passed, failed };
}

if (process.argv[1]?.endsWith('endToEndWorkflow.test.js')) {
  const outcome = runEndToEndWorkflowTests();
  if (outcome.failed > 0) {
    process.exit(1);
  }
}
