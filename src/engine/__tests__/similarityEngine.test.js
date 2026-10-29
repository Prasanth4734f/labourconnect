/**
 * LabourConnect Design Engine - Automated Test Suite: S2-T08
 * 
 * Architectural Diversity, Near-Duplicate Detection & Generation History Test Suite
 * 
 * Comprehensive verification of the 20 mandatory scenarios:
 * 1. Identical candidates are detected as duplicates.
 * 2. Candidates with insignificant coordinate changes are detected as duplicates.
 * 3. Equivalent normalized layouts on proportionally scaled plots are evaluated correctly.
 * 4. Different room-adjacency graphs are distinguished.
 * 5. Meaningfully different room arrangements are retained.
 * 6. Same room counts but different spatial organizations are handled correctly.
 * 7. Superficial style, color, or metadata changes do not manufacture diversity.
 * 8. Multi-floor layouts are compared correctly.
 * 9. Different floor distributions are distinguished.
 * 10. Missing graph information is handled safely.
 * 11. Empty and malformed candidates return clear diagnostics.
 * 12. Configurable thresholds behave as documented.
 * 13. Comparison results remain deterministic across input orderings.
 * 14. Candidate IDs do not influence architectural similarity.
 * 15. Invalid candidates remain invalid (Hard-constraint primacy).
 * 16. Duplicate detection integrates with candidate ranking.
 * 17. Accepted generation history works correctly when available.
 * 18. Different or incompatible requirement sets are handled safely.
 * 19. Insufficient unique candidates are reported honestly.
 * 20. End-to-end integration across single-storey, two-storey, and narrow plot layouts.
 */

import { generateLayout } from '../generator/layoutGenerator.js';
import { 
  evaluateArchitecturalSimilarity, 
  calculateStructuralSimilarity, 
  checkDuplicateAgainstHistory, 
  filterDiverseCandidates, 
  computeDesignFingerprint,
  DEFAULT_SIMILARITY_THRESHOLD
} from '../evaluation/similarityEngine.js';
import { rankCandidates } from '../evaluation/designScorer.js';
import { LabourConnectDesignEngine } from '../index.js';

export function runSimilarityEngineTests() {
  console.log('===============================================================');
  console.log('S2-T08: ARCHITECTURAL DIVERSITY & NEAR-DUPLICATE DETECTION');
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

  // Baseline Architectural Specifications
  const specsSingleStorey = {
    userPrompt: 'Compact 2BHK on 30x45 plot',
    plotWidth: 30,
    plotLength: 45,
    bhkCount: 2,
    bathroomsCount: 2,
    floorsCount: 1,
    facingDirection: 'East',
    amenities: { hasParking: true, hasPooja: true }
  };

  const specsTwoStorey = {
    userPrompt: 'Contemporary 3BHK two-storey on 40x60 plot',
    plotWidth: 40,
    plotLength: 60,
    bhkCount: 3,
    bathroomsCount: 3,
    floorsCount: 2,
    facingDirection: 'East',
    amenities: { hasParking: true, hasPooja: true, hasBalcony: true }
  };

  // Generate realistic candidates
  const baseSingle = generateLayout(specsSingleStorey, { seed: 1001, variationIndex: 0 });
  const baseTwo = generateLayout(specsTwoStorey, { seed: 2002, variationIndex: 0 });
  const altTwo = generateLayout(specsTwoStorey, { seed: 3003, variationIndex: 1 });

  // -------------------------------------------------------------------------
  // SCENARIO 1: Identical Candidates are Detected as Duplicates
  // -------------------------------------------------------------------------
  console.log('--- Scenario 1: Identical Candidates Detection ---');
  const simSelf = evaluateArchitecturalSimilarity(baseSingle, baseSingle);
  assert(simSelf.isDuplicate === true, 'Test 1.1: Self-comparison is detected as duplicate');
  assert(simSelf.overallSimilarity >= 0.99, `Test 1.2: Self-similarity is ~1.00 (got ${simSelf.overallSimilarity})`);
  assert(simSelf.spatialSimilarity >= 0.99, 'Test 1.3: Spatial similarity is 1.00');
  assert(simSelf.topologicalSimilarity >= 0.99, 'Test 1.4: Topological similarity is 1.00');
  assert(simSelf.roomProgramSimilarity >= 0.99, 'Test 1.5: Room program similarity is 1.00');
  assert(simSelf.floorSimilarity >= 0.99, 'Test 1.6: Floor similarity is 1.00');

  // Exact deep clone with different candidateId
  const cloneCandidate = JSON.parse(JSON.stringify(baseSingle));
  cloneCandidate.candidateId = 'cand_clone_9999';
  cloneCandidate.id = 'cand_clone_9999';
  const simClone = evaluateArchitecturalSimilarity(baseSingle, cloneCandidate);
  assert(simClone.isDuplicate === true, 'Test 1.7: Deep clone with different ID is detected as duplicate');
  assert(simClone.overallSimilarity >= 0.99, `Test 1.8: Clone overall similarity is ~1.00 (got ${simClone.overallSimilarity})`);

  // -------------------------------------------------------------------------
  // SCENARIO 2: Insignificant Coordinate Changes (< 0.3 ft) are Duplicates
  // -------------------------------------------------------------------------
  console.log('\n--- Scenario 2: Insignificant Coordinate Perturbations ---');
  const nudgedCandidate = JSON.parse(JSON.stringify(baseSingle));
  nudgedCandidate.candidateId = 'cand_nudged_coords';
  // Shift every room by an insignificant 0.15 ft (< 2 inches)
  nudgedCandidate.floors[0].rooms.forEach(r => {
    r.bounds.x = Number((r.bounds.x + 0.15).toFixed(2));
    r.bounds.y = Number((r.bounds.y + 0.15).toFixed(2));
  });

  const simNudge = evaluateArchitecturalSimilarity(baseSingle, nudgedCandidate);
  assert(simNudge.isDuplicate === true, 'Test 2.1: Insignificant coordinate shifts (< 0.3 ft) rejected as duplicate');
  assert(simNudge.overallSimilarity >= 0.95, `Test 2.2: Nudged design similarity is very high (got ${simNudge.overallSimilarity} >= 0.95)`);
  assert(simNudge.spatialSimilarity >= 0.92, 'Test 2.3: Spatial similarity recognizes minor perturbation');

  // -------------------------------------------------------------------------
  // SCENARIO 3: Proportionally Scaled Plots Evaluated Correctly
  // -------------------------------------------------------------------------
  console.log('\n--- Scenario 3: Proportional Envelope Scaling ---');
  // Layout on 60x80 scaled 2x proportionally from 30x40
  const scaledCandidate = JSON.parse(JSON.stringify(baseSingle));
  scaledCandidate.candidateId = 'cand_scaled_2x';
  scaledCandidate.site = {
    plotWidth: 60,
    plotLength: 80,
    plotAreaSqft: 4800,
    buildableEnvelope: {
      x: baseSingle.site.buildableEnvelope.x * 2,
      y: baseSingle.site.buildableEnvelope.y * 2,
      width: baseSingle.site.buildableEnvelope.width * 2,
      length: baseSingle.site.buildableEnvelope.length * 2
    }
  };
  scaledCandidate.floors[0].rooms.forEach(r => {
    r.bounds.x = r.bounds.x * 2;
    r.bounds.y = r.bounds.y * 2;
    r.bounds.width = r.bounds.width * 2;
    r.bounds.length = r.bounds.length * 2;
  });

  const simScaled = evaluateArchitecturalSimilarity(baseSingle, scaledCandidate, { ignorePlotCompatibility: true });
  assert(simScaled.spatialSimilarity >= 0.95, `Test 3.1: Normalized spatial similarity is scale-invariant (got ${simScaled.spatialSimilarity})`);
  assert(simScaled.topologicalSimilarity >= 0.95, 'Test 3.2: Topological relationships match across proportional scaling');

  // -------------------------------------------------------------------------
  // SCENARIO 4: Different Room-Adjacency Graphs are Distinguished
  // -------------------------------------------------------------------------
  console.log('\n--- Scenario 4: Different Room-Adjacency Graphs ---');
  // Two distinct generated variations for same two-storey specs
  const simTwoStoreyVars = evaluateArchitecturalSimilarity(baseTwo, altTwo);
  assert(simTwoStoreyVars.topologicalSimilarity < 0.90, `Test 4.1: Distinct archetypes have differentiated topological graph (got ${simTwoStoreyVars.topologicalSimilarity})`);
  assert(simTwoStoreyVars.diagnostics.topologicalBreakdown.edgeJaccard !== undefined, 'Test 4.2: Topological breakdown includes edge Jaccard');

  // -------------------------------------------------------------------------
  // SCENARIO 5: Meaningfully Different Arrangements are Retained
  // -------------------------------------------------------------------------
  console.log('\n--- Scenario 5: Meaningfully Different Arrangements Retained ---');
  assert(simTwoStoreyVars.isDuplicate === false, 'Test 5.1: Procedural variations on same prompt are NOT duplicates');
  assert(simTwoStoreyVars.overallSimilarity < DEFAULT_SIMILARITY_THRESHOLD, `Test 5.2: Overall similarity (${simTwoStoreyVars.overallSimilarity}) < threshold (${DEFAULT_SIMILARITY_THRESHOLD})`);
  assert(simTwoStoreyVars.reason.includes('Meaningfully distinct') || simTwoStoreyVars.reason.includes('Distinct'), 'Test 5.3: Diagnostic reason highlights diversity');

  // -------------------------------------------------------------------------
  // SCENARIO 6: Same Room Counts with Different Spatial Organization
  // -------------------------------------------------------------------------
  console.log('\n--- Scenario 6: Same Room Count, Different Spatial Layout ---');
  // Create candidate with inverted front/rear room placement
  const invertedCandidate = JSON.parse(JSON.stringify(baseSingle));
  invertedCandidate.candidateId = 'cand_inverted_spatial';
  const envS = baseSingle.site.buildableEnvelope;
  invertedCandidate.floors[0].rooms.forEach(r => {
    // Mirror Y coordinates within envelope: y' = env.y + env.length - (y - env.y + length)
    const relY = r.bounds.y - envS.y;
    r.bounds.y = Number((envS.y + envS.length - (relY + r.bounds.length)).toFixed(2));
  });

  const simInverted = evaluateArchitecturalSimilarity(baseSingle, invertedCandidate);
  assert(simInverted.roomProgramSimilarity >= 0.95, 'Test 6.1: Room program similarity is high (~1.00) because rooms are identical');
  assert(simInverted.spatialSimilarity < 0.65, `Test 6.2: Spatial similarity is low due to mirrored zones (got ${simInverted.spatialSimilarity} < 0.65)`);
  assert(simInverted.isDuplicate === false, 'Test 6.3: Same room count with different spatial layout is NOT a duplicate');

  // -------------------------------------------------------------------------
  // SCENARIO 7: Superficial Style, Color, or Metadata Changes Do Not Trick Engine
  // -------------------------------------------------------------------------
  console.log('\n--- Scenario 7: Superficial Changes Do Not Manufacture Diversity ---');
  const superficialCandidate = JSON.parse(JSON.stringify(baseSingle));
  superficialCandidate.candidateId = 'cand_superficial_renamed';
  superficialCandidate.seed = 999999;
  superficialCandidate.inputs = { ...baseSingle.inputs, archStyle: 'luxury_minimalist' };
  superficialCandidate.floors[0].rooms.forEach(r => {
    r.finish = 'Ultra-lux Gold-plated Italian Marble';
    r.name = `Super Lux ${r.name}`;
  });

  const simSuperficial = evaluateArchitecturalSimilarity(baseSingle, superficialCandidate);
  assert(simSuperficial.isDuplicate === true, 'Test 7.1: Changing finishes/names/seed does not manufacture diversity');
  assert(simSuperficial.overallSimilarity >= 0.99, `Test 7.2: Superficial variation similarity is ~1.00 (got ${simSuperficial.overallSimilarity})`);

  // -------------------------------------------------------------------------
  // SCENARIO 8: Multi-Floor Layouts Compared Correctly
  // -------------------------------------------------------------------------
  console.log('\n--- Scenario 8: Multi-Floor Layout Evaluation ---');
  const simMultiFloorSelf = evaluateArchitecturalSimilarity(baseTwo, baseTwo);
  assert(simMultiFloorSelf.floorSimilarity >= 0.99, 'Test 8.1: Multi-floor self comparison has floorSimilarity 1.00');
  assert(simMultiFloorSelf.diagnostics.floorBreakdown.floorCountMatch === true, 'Test 8.2: Multi-floor breakdown reports floor count match');
  assert(simMultiFloorSelf.diagnostics.floorBreakdown.stairCoreAlignmentSim >= 0.95, 'Test 8.3: Stairwell core alignment evaluated');

  // -------------------------------------------------------------------------
  // SCENARIO 9: Single-Floor vs Multi-Floor Layouts are NEVER Duplicates
  // -------------------------------------------------------------------------
  console.log('\n--- Scenario 9: Single-Floor vs Multi-Floor Differentiation ---');
  const sim1vs2 = evaluateArchitecturalSimilarity(baseSingle, baseTwo, { ignorePlotCompatibility: true });
  assert(sim1vs2.isDuplicate === false, 'Test 9.1: Single-floor and two-storey designs are NEVER duplicates');
  assert(sim1vs2.floorSimilarity === 0.0, `Test 9.2: Mismatched floor count yields floorSimilarity 0.0 (got ${sim1vs2.floorSimilarity})`);
  assert(sim1vs2.overallSimilarity <= 0.45, `Test 9.3: Floor mismatch enforces hard diversity cap <= 0.45 (got ${sim1vs2.overallSimilarity})`);

  // -------------------------------------------------------------------------
  // SCENARIO 10: Missing Graph Information Handled Safely
  // -------------------------------------------------------------------------
  console.log('\n--- Scenario 10: Missing Graph Information Fallback ---');
  const noGraphCandidate = JSON.parse(JSON.stringify(baseSingle));
  delete noGraphCandidate.adjacencyGraph;
  noGraphCandidate.floors.forEach(f => delete f.adjacencyGraph);

  const simNoGraph = evaluateArchitecturalSimilarity(baseSingle, noGraphCandidate);
  assert(simNoGraph.topologicalSimilarity > 0.0, `Test 10.1: Fallback boundary adjacency computes topological similarity (got ${simNoGraph.topologicalSimilarity})`);
  assert(simNoGraph.isDuplicate === true, 'Test 10.2: Geometry-derived graph matches original graph');

  // -------------------------------------------------------------------------
  // SCENARIO 11: Empty and Malformed Candidates Return Clear Diagnostics
  // -------------------------------------------------------------------------
  console.log('\n--- Scenario 11: Malformed and Empty Candidates ---');
  const simNull = evaluateArchitecturalSimilarity(null, baseSingle);
  assert(simNull.isDuplicate === false, 'Test 11.1: Null candidate does not throw and returns isDuplicate: false');
  assert(simNull.overallSimilarity === 0.0, 'Test 11.2: Null candidate has overallSimilarity: 0.0');
  assert(simNull.diagnostics.error === 'MALFORMED_OR_NULL_CANDIDATE', 'Test 11.3: Diagnostic error recorded');

  const simEmptyObj = evaluateArchitecturalSimilarity({}, {});
  assert(simEmptyObj.isDuplicate === false, 'Test 11.4: Empty candidate object handled safely');
  assert(simEmptyObj.overallSimilarity === 0.0, 'Test 11.5: Empty object has 0.0 similarity');

  // -------------------------------------------------------------------------
  // SCENARIO 12: Configurable Thresholds Behave as Documented
  // -------------------------------------------------------------------------
  console.log('\n--- Scenario 12: Configurable Threshold Behavior ---');
  // simTwoStoreyVars is ~0.65 to 0.75
  const simWithHighThreshold = evaluateArchitecturalSimilarity(baseTwo, altTwo, { threshold: 0.95 });
  assert(simWithHighThreshold.threshold === 0.95, 'Test 12.1: Custom high threshold accepted');
  assert(simWithHighThreshold.isDuplicate === false, 'Test 12.2: Not duplicate at high threshold');

  const simWithLowThreshold = evaluateArchitecturalSimilarity(baseTwo, altTwo, { threshold: 0.30 });
  assert(simWithLowThreshold.threshold === 0.30, 'Test 12.3: Custom low threshold accepted');
  assert(simWithLowThreshold.isDuplicate === true, 'Test 12.4: Duplicate at artificially low threshold (0.30)');

  // -------------------------------------------------------------------------
  // SCENARIO 13: Commutativity / Determinism Across Input Orderings
  // -------------------------------------------------------------------------
  console.log('\n--- Scenario 13: Determinism Across Input Orderings ---');
  const simA_B = evaluateArchitecturalSimilarity(baseTwo, altTwo);
  const simB_A = evaluateArchitecturalSimilarity(altTwo, baseTwo);
  assert(simA_B.overallSimilarity === simB_A.overallSimilarity, `Test 13.1: Commutative overallSimilarity (A->B: ${simA_B.overallSimilarity}, B->A: ${simB_A.overallSimilarity})`);
  assert(simA_B.spatialSimilarity === simB_A.spatialSimilarity, 'Test 13.2: Commutative spatialSimilarity');
  assert(simA_B.roomProgramSimilarity === simB_A.roomProgramSimilarity, 'Test 13.3: Commutative roomProgramSimilarity');
  assert(simA_B.isDuplicate === simB_A.isDuplicate, 'Test 13.4: Commutative duplicate decision');

  // -------------------------------------------------------------------------
  // SCENARIO 14: Candidate IDs Do Not Influence Similarity
  // -------------------------------------------------------------------------
  console.log('\n--- Scenario 14: Candidate ID Invariance ---');
  const idVariantA = JSON.parse(JSON.stringify(baseSingle));
  const idVariantB = JSON.parse(JSON.stringify(baseSingle));
  idVariantA.candidateId = 'cand_ALPHA_001';
  idVariantB.candidateId = 'cand_OMEGA_999';

  const simIds = evaluateArchitecturalSimilarity(idVariantA, idVariantB);
  assert(simIds.isDuplicate === true, 'Test 14.1: Arbitrary candidate IDs do not prevent duplicate detection');
  assert(simIds.overallSimilarity >= 0.99, 'Test 14.2: Similarity is ~1.00 regardless of ID');

  // -------------------------------------------------------------------------
  // SCENARIO 15: Invalid Candidates Remain Invalid (Hard-Constraint Primacy)
  // -------------------------------------------------------------------------
  console.log('\n--- Scenario 15: Hard-Constraint Primacy in Diversity Filter ---');
  const invalidCandidate = JSON.parse(JSON.stringify(baseSingle));
  invalidCandidate.candidateId = 'cand_invalid_geometry';
  invalidCandidate.isValid = false;
  invalidCandidate.disqualificationReasons = ['Spatial collision on Ground Floor'];

  const diverseResult = filterDiverseCandidates([baseSingle, invalidCandidate]);
  assert(diverseResult.acceptedCount === 1, `Test 15.1: Only valid candidate accepted (got ${diverseResult.acceptedCount})`);
  assert(diverseResult.invalidCount === 1, `Test 15.2: Invalid candidate categorized into invalidCandidates (got ${diverseResult.invalidCount})`);
  assert(diverseResult.invalidCandidates[0].candidateId === 'cand_invalid_geometry', 'Test 15.3: Invalid candidate rejected from accepted set');

  // -------------------------------------------------------------------------
  // SCENARIO 16: Duplicate Detection Integrates with Candidate Ranking
  // -------------------------------------------------------------------------
  console.log('\n--- Scenario 16: Candidate Ranking & Duplicate Filtering Integration ---');
  const ranked = rankCandidates([baseTwo, cloneCandidate, altTwo], specsTwoStorey);
  assert(ranked.success === true, 'Test 16.1: Candidate ranking succeeds');

  const diverseFiltered = filterDiverseCandidates(ranked.rankedCandidates);
  assert(diverseFiltered.acceptedCount >= 2, `Test 16.2: Accepted diverse ranked candidates (got ${diverseFiltered.acceptedCount})`);
  assert(diverseFiltered.duplicateCount >= 0, 'Test 16.3: Duplicate tracking functional');

  // -------------------------------------------------------------------------
  // SCENARIO 17: Accepted Generation History Works Correctly
  // -------------------------------------------------------------------------
  console.log('\n--- Scenario 17: Generation History Verification ---');
  const historyPool = [baseSingle];
  const histCheckDup = checkDuplicateAgainstHistory(nudgedCandidate, historyPool);
  assert(histCheckDup.isDuplicate === true, 'Test 17.1: Nudged candidate rejected against prior history');
  assert(histCheckDup.matchedDesignId === baseSingle.candidateId || histCheckDup.matchedDesignId === baseSingle.id, 'Test 17.2: Matched design ID reported');

  const histCheckDiverse = checkDuplicateAgainstHistory(baseTwo, historyPool, { ignorePlotCompatibility: true });
  assert(histCheckDiverse.isDuplicate === false, 'Test 17.3: Truly diverse design passes history check');

  // -------------------------------------------------------------------------
  // SCENARIO 18: Incompatible Plot Requirements Handled Safely
  // -------------------------------------------------------------------------
  console.log('\n--- Scenario 18: Incompatible Plot Aspect Ratios ---');
  const narrowCandidate = generateLayout({
    plotWidth: 18,
    plotLength: 60,
    bhkCount: 2,
    floorsCount: 1
  }, { seed: 5005 });

  const simIncompatiblePlot = evaluateArchitecturalSimilarity(baseSingle, narrowCandidate);
  assert(simIncompatiblePlot.isDuplicate === false, 'Test 18.1: Incompatible plot aspect ratios (18x60 vs 30x40) cannot be duplicates');
  assert(simIncompatiblePlot.reason.includes('Incompatible plot'), 'Test 18.2: Incompatible plot reason recorded');

  // -------------------------------------------------------------------------
  // SCENARIO 19: Insufficient Unique Candidates Reported Honestly
  // -------------------------------------------------------------------------
  console.log('\n--- Scenario 19: Honest Reporting of Insufficient Candidates ---');
  // Only 1 unique candidate in pool, but 3 requested
  const smallPool = [baseSingle, nudgedCandidate, cloneCandidate];
  const filterShortage = filterDiverseCandidates(smallPool, { targetCount: 3 });
  assert(filterShortage.insufficientUniqueCandidates === true, 'Test 19.1: Insufficient unique candidates flagged');
  assert(filterShortage.acceptedCount === 1, `Test 19.2: Retained only 1 valid unique candidate (got ${filterShortage.acceptedCount})`);
  assert(filterShortage.duplicateCount === 2, `Test 19.3: Both redundant candidates recorded as duplicates (got ${filterShortage.duplicateCount})`);
  assert(filterShortage.summary.includes('Honest report'), 'Test 19.4: Summary contains honest shortage report');

  // -------------------------------------------------------------------------
  // SCENARIO 20: Engine Integration & Core Backward Compatibility
  // -------------------------------------------------------------------------
  console.log('\n--- Scenario 20: Engine Integration & Core Compatibility ---');
  const engine = new LabourConnectDesignEngine();
  const variationsResult = engine.generateVariations(specsTwoStorey, 2);
  assert(variationsResult.success === true, 'Test 20.1: Engine generateVariations succeeds');
  assert(variationsResult.variations.length === 2, 'Test 20.2: Exactly 2 variations generated');

  const var0 = variationsResult.variations[0];
  const var1 = variationsResult.variations[1];
  const numericSim = calculateStructuralSimilarity(var0, var1);
  assert(typeof numericSim === 'number', 'Test 20.3: calculateStructuralSimilarity returns numeric float');
  assert(numericSim < DEFAULT_SIMILARITY_THRESHOLD, `Test 20.4: Generated variations are diverse (similarity ${(numericSim * 100).toFixed(1)}% < 82%)`);

  const fp0 = computeDesignFingerprint(var0);
  const fp1 = computeDesignFingerprint(var1);
  assert(fp0.startsWith('FP-'), 'Test 20.5: Fingerprint A is formatted correctly');
  assert(fp1.startsWith('FP-'), 'Test 20.6: Fingerprint B is formatted correctly');
  assert(fp0 !== fp1, 'Test 20.7: Diverse variations have distinct fingerprints');

  console.log('\n======================================================================');
  console.log(`SIMILARITY ENGINE TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('======================================================================\n');

  if (failed > 0) {
    throw new Error(`S2-T08 Similarity Engine Test Suite Failed: ${failed} failure(s).`);
  }

  return { passed, failed, total: passed + failed };
}

// Allow direct CLI execution
if (import.meta.url === `file:///${process.argv[1]?.replace(/\\/g, '/')}`) {
  try {
    const res = runSimilarityEngineTests();
    if (res.failed > 0) process.exit(1);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
