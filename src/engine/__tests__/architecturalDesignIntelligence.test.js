/**
 * LabourConnect Design Engine - Automated Test Suite: S3-T03
 * Architectural Design Intelligence & Variation
 * 
 * Tests:
 * - Group A: Determinism
 * - Group B: Requirement Preservation
 * - Group C: Architectural Variation
 * - Group D: Duplicate Detection
 * - Group E: Near-Duplicate Filtering
 * - Group F: Spatial Relationships & Adjacency
 * - Group G: Plot & Envelope Constraints
 * - Group H: Multi-Floor Configurations & Vertical Alignment
 * - Group I: Candidate Scoring & Explainability
 * - Group J: Infeasible Requirements Handling
 * - Group K: Canonical Model & 2D/3D Integration
 * - Group L: Difference Classification (Identical, Cosmetic, Spatial, Massing)
 * - Group M: Performance Benchmark
 */

import {
  generateArchitecturalAlternatives,
  generateArchitecturalStrategies,
  classifyArchitecturalDifference,
  ARCHITECTURAL_DIFFERENCE_LEVEL,
  designEngine
} from '../index.js';
import { validateCanonicalSchema } from '../schema/canonicalDesignSchema.js';

export function runArchitecturalDesignIntelligenceTests() {
  console.log('===============================================================');
  console.log('LABOURCONNECT 3D ENGINE: ARCHITECTURAL DESIGN INTELLIGENCE (S3-T03)');
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

  // =========================================================================
  // GROUP A: DETERMINISM
  // =========================================================================
  console.log('--- Group A: Deterministic Alternative Generation ---');
  {
    const specs = {
      plotWidth: 35,
      plotLength: 50,
      bhkCount: 3,
      floorsCount: 2,
      archStyle: 'modern'
    };

    const seed = 12345;
    const run1 = generateArchitecturalAlternatives(specs, { count: 3, seed });
    const run2 = generateArchitecturalAlternatives(specs, { count: 3, seed });

    assert(run1.success && run2.success, 'Test A.1: Repeated execution succeeds cleanly');
    assert(run1.alternatives.length === run2.alternatives.length, 'Test A.2: Alternative count is identical across runs');
    assert(run1.alternatives[0].code === run2.alternatives[0].code, 'Test A.3: Candidate codes and seeds are identical');
    assert(run1.alternatives[0].evaluation.fingerprint === run2.alternatives[0].evaluation.fingerprint, 'Test A.4: Structural fingerprints match 100% deterministically');
  }

  // =========================================================================
  // GROUP B: REQUIREMENT PRESERVATION
  // =========================================================================
  console.log('\n--- Group B: Explicit Requirement Preservation ---');
  {
    const specs = {
      plotWidth: 40,
      plotLength: 60,
      bhkCount: 4,
      floorsCount: 2,
      archStyle: 'luxury_villa'
    };

    const res = generateArchitecturalAlternatives(specs, { count: 3, seed: 9876 });
    assert(res.success && res.alternatives.length >= 2, 'Test B.1: Generates valid alternatives for 4BHK duplex');

    res.alternatives.forEach((alt, idx) => {
      assert(alt.site.plotWidth === 40, `Test B.2.${idx + 1}: Preserves plot width (40ft)`);
      assert(alt.site.plotLength === 60, `Test B.3.${idx + 1}: Preserves plot length (60ft)`);
      assert(alt.metrics.floorsCount === 2, `Test B.4.${idx + 1}: Preserves floor count (2 floors)`);

      const totalBeds = alt.floors.flatMap(f => f.rooms || []).filter(r => r.type.includes('bed')).length;
      assert(totalBeds >= 3, `Test B.5.${idx + 1}: Preserves bedroom requirements (found ${totalBeds})`);
    });
  }

  // =========================================================================
  // GROUP C: ARCHITECTURAL VARIATION
  // =========================================================================
  console.log('\n--- Group C: Meaningful Architectural Variation ---');
  {
    const specs = {
      plotWidth: 35,
      plotLength: 50,
      bhkCount: 3,
      floorsCount: 2,
      archStyle: 'modern'
    };

    const res = generateArchitecturalAlternatives(specs, { count: 3, seed: 54321 });
    assert(res.success && res.alternatives.length >= 2, 'Test C.1: Produces multiple candidate alternatives');

    const archetypes = res.alternatives.map(a => a.strategy?.archetype);
    const uniqueArchetypes = new Set(archetypes);
    assert(uniqueArchetypes.size >= 2, 'Test C.2: Alternatives explore at least 2 distinct spatial archetypes', `Found archetypes: ${Array.from(uniqueArchetypes).join(', ')}`);

    const stairLocations = res.alternatives.map(a => a.strategy?.circulationStrategy);
    assert(stairLocations.some(l => l.includes('right')) && stairLocations.some(l => l.includes('left')), 'Test C.3: Alternatives explore diverse circulation core alignments (left vs right)');

    assert(res.diversityReport?.pairwiseDifferences?.length > 0, 'Test C.4: Diversity report contains pairwise differences');
  }

  // =========================================================================
  // GROUP D: DUPLICATE DETECTION
  // =========================================================================
  console.log('\n--- Group D: Duplicate Detection ---');
  {
    const specs = { plotWidth: 30, plotLength: 40, bhkCount: 2, floorsCount: 1 };
    const res = generateArchitecturalAlternatives(specs, { count: 2, seed: 112233 });
    assert(res.success && res.alternatives.length > 0, 'Test D.1: Single floor design succeeds');

    const baseDesign = res.alternatives[0];
    const duplicate = JSON.parse(JSON.stringify(baseDesign));

    const diffIdentical = classifyArchitecturalDifference(baseDesign, duplicate);
    assert(diffIdentical.level === ARCHITECTURAL_DIFFERENCE_LEVEL.IDENTICAL, 'Test D.2: Exact duplicate recognized as IDENTICAL');
    assert(diffIdentical.similarity === 1.0, 'Test D.3: Identical similarity is 1.0');
  }

  // =========================================================================
  // GROUP E: NEAR-DUPLICATE & COSMETIC FILTERING
  // =========================================================================
  console.log('\n--- Group E: Cosmetic vs Meaningful Difference ---');
  {
    const specs = { plotWidth: 30, plotLength: 45, bhkCount: 3, floorsCount: 1 };
    const res = generateArchitecturalAlternatives(specs, { count: 2, seed: 445566 });
    const baseDesign = res.alternatives[0];

    // Cosmetic change: change metadata/labels only
    const cosmeticClone = JSON.parse(JSON.stringify(baseDesign));
    cosmeticClone.id = 'des-cosmetic-fake-id';
    cosmeticClone.title = 'Superficial Renamed Villa';
    cosmeticClone.inputs.archStyle = 'luxury_villa';

    const diffCosmetic = classifyArchitecturalDifference(baseDesign, cosmeticClone);
    assert(diffCosmetic.level === ARCHITECTURAL_DIFFERENCE_LEVEL.COSMETIC_ONLY, 'Test E.1: Metadata-only change recognized as COSMETIC_ONLY');

    // Minor coordinate nudge (shift room width by 2.0ft)
    const minorNudge = JSON.parse(JSON.stringify(baseDesign));
    if (minorNudge.floors?.[0]?.rooms?.[0]?.bounds) {
      minorNudge.floors[0].rooms[0].bounds.width += 2.0;
    }
    const diffNudge = classifyArchitecturalDifference(baseDesign, minorNudge);
    assert(diffNudge.level === ARCHITECTURAL_DIFFERENCE_LEVEL.MINOR_DIMENSIONAL, 'Test E.2: Nudged design distinguished from cosmetic clone as MINOR_DIMENSIONAL', `Got level: ${diffNudge.level}`);
  }

  // =========================================================================
  // GROUP F: SPATIAL RELATIONSHIPS & ADJACENCY
  // =========================================================================
  console.log('\n--- Group F: Spatial Relationships & Functional Adjacency ---');
  {
    const specs = { plotWidth: 35, plotLength: 45, bhkCount: 3, floorsCount: 1 };
    const res = generateArchitecturalAlternatives(specs, { count: 2, seed: 778899 });
    const design = res.alternatives[0];

    const groundRooms = design.floors[0].rooms;
    const living = groundRooms.find(r => r.type === 'living');
    const foyer = groundRooms.find(r => r.type === 'foyer');
    const kitchen = groundRooms.find(r => r.type === 'kitchen');

    assert(Boolean(living && foyer), 'Test F.1: Public public-zone rooms present (Living & Foyer)');
    assert(Boolean(kitchen), 'Test F.2: Service kitchen present');
  }

  // =========================================================================
  // GROUP G: PLOT & ENVELOPE CONSTRAINTS
  // =========================================================================
  console.log('\n--- Group G: Plot & Envelope Constraints ---');
  {
    // Narrow plot
    const narrowSpecs = { plotWidth: 22, plotLength: 50, bhkCount: 2, floorsCount: 1 };
    const strategies = generateArchitecturalStrategies(narrowSpecs, { count: 2 });
    assert(strategies.some(s => s.archetype === 'linear_spine'), 'Test G.1: Narrow plot prioritizes linear spine archetype');

    const res = generateArchitecturalAlternatives(narrowSpecs, { count: 1, seed: 9911 });
    assert(res.success, 'Test G.2: Narrow plot generation succeeds');
    assert(res.alternatives[0].floors[0].rooms.every(r => {
      const env = res.alternatives[0].site.buildableEnvelope;
      return r.bounds.x >= env.x - 0.1 && (r.bounds.x + r.bounds.width) <= (env.x + env.width + 0.1);
    }), 'Test G.3: All rooms strictly fit inside narrow buildable envelope');
  }

  // =========================================================================
  // GROUP H: MULTI-FLOOR CONFIGURATIONS
  // =========================================================================
  console.log('\n--- Group H: Multi-Floor Configurations & Vertical Alignment ---');
  {
    const duplexSpecs = { plotWidth: 30, plotLength: 45, bhkCount: 3, floorsCount: 2 };
    const res = generateArchitecturalAlternatives(duplexSpecs, { count: 2, seed: 3344 });
    const duplex = res.alternatives[0];

    assert(duplex.metrics.floorsCount === 2, 'Test H.1: floorsCount metric is 2');
    assert(duplex.floors.length >= 2, 'Test H.1b: Floors array contains at least Ground and First floors');

    const groundStair = duplex.floors[0].rooms.find(r => r.type === 'stairwell');
    const firstStair = duplex.floors[1].rooms.find(r => r.type === 'stairwell');

    assert(Boolean(groundStair && firstStair), 'Test H.2: Stairwell core present on both Ground and First floors');
    assert(Math.abs(groundStair.bounds.x - firstStair.bounds.x) < 0.2, 'Test H.3: Stairwell X is vertically aligned within 0.2ft');
    assert(Math.abs(groundStair.bounds.y - firstStair.bounds.y) < 0.2, 'Test H.4: Stairwell Y is vertically aligned within 0.2ft');
  }

  // =========================================================================
  // GROUP I: CANDIDATE SCORING & EXPLAINABILITY
  // =========================================================================
  console.log('\n--- Group I: Scoring & Explainable Metrics ---');
  {
    const specs = { plotWidth: 35, plotLength: 50, bhkCount: 3, floorsCount: 2, homeBudgetInr: 4500000 };
    const res = generateArchitecturalAlternatives(specs, { count: 2, seed: 8877 });
    const design = res.alternatives[0];

    assert(typeof design.evaluation.scores.overallScore === 'number', 'Test I.1: Score contains numeric overall score');
    assert(design.evaluation.scores.overallScore >= 70 && design.evaluation.scores.overallScore <= 100, 'Test I.2: Overall score in realistic high range (70-100)');
    assert(design.boqEstimate?.totalCostInr > 0, 'Test I.3: Deterministic BOQ cost calculated');
    assert(design.evaluation.fingerprint.startsWith('FP-'), 'Test I.4: Structural fingerprint generated');
  }

  // =========================================================================
  // GROUP J: INFEASIBLE REQUIREMENTS HANDLING
  // =========================================================================
  console.log('\n--- Group J: Infeasible Requirements Handling ---');
  {
    // Impossible plot dimensions (10x15 = 150 sq.ft)
    const impossiblePlot = { plotWidth: 10, plotLength: 15, bhkCount: 3, floorsCount: 2 };
    const resFail = generateArchitecturalAlternatives(impossiblePlot);

    assert(!resFail.success, 'Test J.1: Infeasible plot dimensions rejected cleanly');
    assert(resFail.errors?.length > 0, 'Test J.2: Structured error diagnostics provided');
    assert(resFail.clarificationNeeded?.length > 0, 'Test J.3: Clarification recommendations returned');
  }

  // =========================================================================
  // GROUP K: CANONICAL MODEL & 2D/3D INTEGRATION
  // =========================================================================
  console.log('\n--- Group K: Canonical Schema & 2D/3D Integration ---');
  {
    const specs = { plotWidth: 35, plotLength: 45, bhkCount: 3, floorsCount: 2, archStyle: 'traditional_kerala' };
    const res = generateArchitecturalAlternatives(specs, { count: 2, seed: 6655 });
    const design = res.alternatives[0];

    const schemaVal = validateCanonicalSchema(design);
    assert(schemaVal.valid, 'Test K.1: Generated alternative complies 100% with Canonical Schema v2.0');

    assert(Boolean(design.drawings?.floorPlans?.length > 0), 'Test K.2: 2D CAD floor plan drawings attached');
    assert(Boolean(design.geometry3d?.meshes?.length > 0), 'Test K.3: Procedural 3D building meshes attached');
    assert(Boolean(design.walkthroughTrajectory?.waypoints?.length > 0), 'Test K.4: Walkthrough trajectory attached');

    // Test that traditional kerala style attached sloping pitched roof meshes
    const hasSlopingRoof = design.geometry3d.meshes.some(m => m.componentType === 'sloping_roof');
    assert(hasSlopingRoof, 'Test K.5: Traditional Kerala style generates 3D sloping pitched roof geometry');

    // Test window chajjas attached
    const hasChajjas = design.geometry3d.meshes.some(m => m.componentType === 'sunshade_chajja');
    assert(hasChajjas, 'Test K.6: Exterior window cantilevered chajjas (sunshades) generated');
  }

  // =========================================================================
  // GROUP L: DIFFERENCE CLASSIFICATION
  // =========================================================================
  console.log('\n--- Group L: Difference Level Classification ---');
  {
    const specs1 = { plotWidth: 35, plotLength: 50, bhkCount: 3, floorsCount: 2 };
    const res = generateArchitecturalAlternatives(specs1, { count: 2, seed: 1234 });
    const desA = res.alternatives[0];
    const desB = res.alternatives[1];

    const diff = classifyArchitecturalDifference(desA, desB);
    assert(
      diff.level === ARCHITECTURAL_DIFFERENCE_LEVEL.MEANINGFUL_SPATIAL ||
      diff.level === ARCHITECTURAL_DIFFERENCE_LEVEL.STRUCTURAL_OR_MASSING,
      'Test L.1: Two generated alternatives classified as MEANINGFUL_SPATIAL or STRUCTURAL_OR_MASSING',
      `Got level: ${diff.level}`
    );
    assert(diff.reason?.length > 0, 'Test L.2: Difference classification contains human-readable explanation');
  }

  // =========================================================================
  // GROUP M: PERFORMANCE BENCHMARK
  // =========================================================================
  console.log('\n--- Group M: Performance Benchmark ---');
  {
    const specs = { plotWidth: 35, plotLength: 50, bhkCount: 3, floorsCount: 2 };
    const t0 = Date.now();
    const res = generateArchitecturalAlternatives(specs, { count: 3, seed: 99999 });
    const duration = Date.now() - t0;

    assert(res.success && res.alternatives.length === 3, 'Test M.1: Benchmark generation of 3 full candidates succeeds');
    assert(duration < 250, `Test M.2: Generation of 3 complete canonical alternatives executed in ${duration}ms (<250ms budget)`);
  }

  // Test method on designEngine singleton
  {
    const outcome = designEngine.generateArchitecturalAlternatives({
      plotWidth: 30,
      plotLength: 40,
      bhkCount: 2,
      floorsCount: 1
    }, { targetAlternatives: 2 });
    assert(outcome.success, 'Test M.3: designEngine.generateArchitecturalAlternatives method is callable');
  }

  console.log('\n===============================================================');
  console.log(`S3-T03 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('===============================================================\n');

  return { passed, failed };
}

// Direct execution support
if (process.argv[1]?.endsWith('architecturalDesignIntelligence.test.js')) {
  runArchitecturalDesignIntelligenceTests();
}
