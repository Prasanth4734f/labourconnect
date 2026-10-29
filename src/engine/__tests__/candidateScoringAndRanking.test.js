/**
 * LabourConnect Design Engine - Candidate Scoring & Ranking Test Suite
 * 
 * Tests for Sprint 2 Task S2-T07: Candidate Scoring, Ranking and Evaluation.
 * 
 * Verifies:
 * 1. Correct multi-criteria scoring of valid candidates.
 * 2. Hard-constraint failures strictly overriding soft scores.
 * 3. Ranking of multiple competing candidates.
 * 4. Deterministic rankings for equivalent inputs.
 * 5. Missing and malformed scoring data handling.
 * 6. Multi-floor design evaluation.
 * 7. Requirement-satisfaction differences.
 * 8. Adjacency and circulation differences.
 * 9. Score normalization and weight handling.
 * 10. Deterministic tie-breaking rules.
 * 11. Regression and backward compatibility.
 * 12. End-to-end generation, validation, scoring, and ranking workflow.
 */

import { generateLayout } from '../generator/layoutGenerator.js';
import { 
  scoreDesignQuality, 
  rankCandidates, 
  compareTwoCandidates, 
  SCORING_DISCLAIMER 
} from '../evaluation/designScorer.js';
import { LabourConnectDesignEngine } from '../index.js';
import { ROOM_TYPES } from '../schema/canonicalDesignSchema.js';

export function runCandidateScoringAndRankingTests() {
  console.log('\n======================================================================');
  console.log('RUNNING CANDIDATE SCORING & RANKING TEST SUITE (S2-T07)');
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

  // Common plot specifications
  const specs30x45 = {
    plotWidth: 30,
    plotLength: 45,
    bhkCount: 2,
    bathroomsCount: 2,
    floorsCount: 1,
    archStyle: 'modern',
    facingDirection: 'East',
    amenities: { hasPooja: true, hasParking: true }
  };

  // Base valid layout candidate
  const candBase = generateLayout(specs30x45, { variationIndex: 0 });

  // ---------------------------------------------------------------------------
  // SCENARIO 1: Correct Multi-Criteria Scoring of Valid Candidates
  // ---------------------------------------------------------------------------
  console.log('--- Scenario 1: Correct Scoring of Valid Candidates ---');
  const score1 = scoreDesignQuality(candBase, specs30x45);

  assert(score1 !== null && typeof score1 === 'object', 'Test 1.1: scoreDesignQuality returns valid score report');
  assert(score1.isValid === true, 'Test 1.2: Valid candidate has isValid: true');
  assert(score1.eligibleForRanking === true, 'Test 1.3: Valid candidate is eligibleForRanking: true');
  assert(typeof score1.overallScore === 'number' && score1.overallScore >= 50 && score1.overallScore <= 100, `Test 1.4: overallScore is in valid range (got ${score1.overallScore})`);
  assert(score1.rankableScore === score1.overallScore, 'Test 1.5: rankableScore equals overallScore for valid design');
  assert(score1.hardConstraintFailure === false, 'Test 1.6: hardConstraintFailure is false');
  assert(Array.isArray(score1.hardViolations) && score1.hardViolations.length === 0, 'Test 1.7: Zero hard violations');

  // Verify breakdown presence
  const bd = score1.breakdown;
  assert(bd !== null && typeof bd === 'object', 'Test 1.8: Criterion breakdown object populated');
  assert(typeof bd.requirementSatisfaction?.score === 'number', 'Test 1.9: Requirement satisfaction scored');
  assert(typeof bd.circulationEfficiency?.score === 'number', 'Test 1.10: Circulation efficiency scored');
  assert(typeof bd.adjacencySeparation?.score === 'number', 'Test 1.11: Adjacency & separation scored');
  assert(typeof bd.daylightVentilation?.score === 'number', 'Test 1.12: Daylight & ventilation scored');
  assert(typeof bd.spaceUtilization?.score === 'number', 'Test 1.13: Space utilization scored');
  assert(typeof bd.roomProportions?.score === 'number', 'Test 1.14: Room proportions scored');
  assert(typeof bd.structuralAndVertical?.score === 'number', 'Test 1.15: Structural alignment scored');
  assert(typeof bd.parkingAndAccess?.score === 'number', 'Test 1.16: Parking & access scored');
  assert(typeof bd.styleAndPreferences?.score === 'number', 'Test 1.17: Style & preferences scored');
  assert(typeof bd.vaastuCompliance?.score === 'number', 'Test 1.18: Vaastu compliance scored');

  // ---------------------------------------------------------------------------
  // SCENARIO 2: Hard-Constraint Failures Must Override Soft Scores
  // ---------------------------------------------------------------------------
  console.log('\n--- Scenario 2: Hard Constraints Override Soft Scores ---');
  // Create an invalid candidate by injecting a substantial room collision
  const invalidCandOverlap = JSON.parse(JSON.stringify(candBase));
  invalidCandOverlap.candidateId = 'cand_invalid_overlap';
  invalidCandOverlap.floors[0].rooms[1].bounds = {
    ...invalidCandOverlap.floors[0].rooms[0].bounds // Exact collision
  };

  const scoreInvalid = scoreDesignQuality(invalidCandOverlap, specs30x45);
  assert(scoreInvalid.isValid === false, 'Test 2.1: Colliding candidate has isValid: false');
  assert(scoreInvalid.eligibleForRanking === false, 'Test 2.2: Colliding candidate has eligibleForRanking: false');
  assert(scoreInvalid.hardConstraintFailure === true, 'Test 2.3: hardConstraintFailure is true');
  assert(scoreInvalid.rankableScore === 0, `Test 2.4: rankableScore is forced to 0 (got ${scoreInvalid.rankableScore})`);
  assert(scoreInvalid.hardViolations.length > 0, `Test 2.5: Violations recorded (${scoreInvalid.hardViolations[0]})`);
  assert(scoreInvalid.softScoreUnadjusted > 50, 'Test 2.6: Raw unadjusted soft score preserved for diagnostics');

  // Verify ranking priority: Valid candidate with lower soft score MUST outrank invalid candidate
  const rankingComp = rankCandidates([invalidCandOverlap, candBase], specs30x45);
  assert(rankingComp.rankedCandidates[0].candidateId === candBase.candidateId, 'Test 2.7: Valid candidate is ranked #1');
  assert(rankingComp.rankedCandidates[0].eligibleForRanking === true, 'Test 2.8: Rank 1 is eligible for ranking');
  assert(rankingComp.rankedCandidates[1].candidateId === 'cand_invalid_overlap', 'Test 2.9: Invalid candidate is partitioned to Rank 2');
  assert(rankingComp.rankedCandidates[1].eligibleForRanking === false, 'Test 2.10: Rank 2 candidate is disqualified');
  assert(rankingComp.rankedCandidates[1].isDisqualified === true, 'Test 2.11: Rank 2 marked isDisqualified: true');

  // ---------------------------------------------------------------------------
  // SCENARIO 3: Ranking of Multiple Competing Candidates
  // ---------------------------------------------------------------------------
  console.log('\n--- Scenario 3: Ranking of Multiple Competing Candidates ---');
  // Generate 3 distinct candidates
  const candA = generateLayout(specs30x45, { variationIndex: 0 });
  const candB = generateLayout(specs30x45, { variationIndex: 1 });
  const candC = generateLayout(specs30x45, { variationIndex: 2 });

  const multiRank = rankCandidates([candA, candB, candC], specs30x45);
  assert(multiRank.success === true, 'Test 3.1: rankCandidates succeeds for multiple candidates');
  assert(multiRank.totalEvaluated === 3, 'Test 3.2: Exactly 3 candidates evaluated');
  assert(multiRank.validCount === 3, `Test 3.3: All 3 valid candidates recognized (got ${multiRank.validCount})`);
  assert(multiRank.rankedCandidates.length === 3, 'Test 3.4: 3 ranked candidates returned');
  assert(multiRank.rankedCandidates[0].rank === 1, 'Test 3.5: First candidate has rank: 1');
  assert(multiRank.rankedCandidates[1].rank === 2, 'Test 3.6: Second candidate has rank: 2');
  assert(multiRank.rankedCandidates[2].rank === 3, 'Test 3.7: Third candidate has rank: 3');

  // Check descending score ordering
  const s1 = multiRank.rankedCandidates[0].rankableScore;
  const s2 = multiRank.rankedCandidates[1].rankableScore;
  const s3 = multiRank.rankedCandidates[2].rankableScore;
  assert(s1 >= s2, `Test 3.8: Rank 1 score (${s1}) >= Rank 2 score (${s2})`);
  assert(s2 >= s3, `Test 3.9: Rank 2 score (${s2}) >= Rank 3 score (${s3})`);
  assert(multiRank.topCandidate !== null, 'Test 3.10: Top candidate object populated');

  // ---------------------------------------------------------------------------
  // SCENARIO 4: Deterministic Rankings for Equivalent Inputs
  // ---------------------------------------------------------------------------
  console.log('\n--- Scenario 4: Deterministic Rankings for Equivalent Inputs ---');
  const run1 = rankCandidates([candA, candB, candC], specs30x45);
  const run2 = rankCandidates([candC, candA, candB], specs30x45); // Shuffled input array
  const run3 = rankCandidates([candB, candC, candA], specs30x45); // Another permutation

  assert(run1.rankedCandidates[0].candidateId === run2.rankedCandidates[0].candidateId, 'Test 4.1: Permutation 1 and 2 select identical Rank 1');
  assert(run2.rankedCandidates[0].candidateId === run3.rankedCandidates[0].candidateId, 'Test 4.2: Permutation 2 and 3 select identical Rank 1');
  assert(run1.rankedCandidates[1].candidateId === run2.rankedCandidates[1].candidateId, 'Test 4.3: Permutation 1 and 2 select identical Rank 2');
  assert(run1.rankedCandidates[2].candidateId === run3.rankedCandidates[2].candidateId, 'Test 4.4: Permutation 1 and 3 select identical Rank 3');
  assert(run1.rankedCandidates[0].rankableScore === run2.rankedCandidates[0].rankableScore, 'Test 4.5: Identical Rank 1 scores across runs');

  // ---------------------------------------------------------------------------
  // SCENARIO 5: Missing and Malformed Scoring Data Handling
  // ---------------------------------------------------------------------------
  console.log('\n--- Scenario 5: Missing and Malformed Scoring Data ---');
  const nullScore = scoreDesignQuality(null, specs30x45);
  assert(nullScore.isValid === false, 'Test 5.1: Null candidate returns isValid: false');
  assert(nullScore.rankableScore === 0, 'Test 5.2: Null candidate has rankableScore: 0');
  assert(nullScore.eligibleForRanking === false, 'Test 5.3: Null candidate has eligibleForRanking: false');

  const emptyObjScore = scoreDesignQuality({}, specs30x45);
  assert(emptyObjScore.isValid === false, 'Test 5.4: Empty candidate object returns isValid: false');
  assert(emptyObjScore.resultType === 'VALIDATION_ERROR', 'Test 5.5: Empty object returns VALIDATION_ERROR');

  const emptyRank = rankCandidates([], specs30x45);
  assert(emptyRank.success === true, 'Test 5.6: rankCandidates([]) succeeds without throwing');
  assert(emptyRank.totalEvaluated === 0, 'Test 5.7: Total evaluated is 0 for empty list');
  assert(emptyRank.rankedCandidates.length === 0, 'Test 5.8: Ranked candidates is empty array');

  const nullRank = rankCandidates(null, specs30x45);
  assert(nullRank.totalEvaluated === 0, 'Test 5.9: rankCandidates(null) returns 0 evaluated cleanly');

  // Candidate with non-numeric bounds
  const malformedCand = JSON.parse(JSON.stringify(candBase));
  malformedCand.candidateId = 'cand_nan';
  malformedCand.floors[0].rooms[0].bounds.width = NaN;
  const malformedScore = scoreDesignQuality(malformedCand, specs30x45);
  assert(malformedScore.isValid === false, 'Test 5.10: Candidate with NaN bounds is invalid');
  assert(malformedScore.rankableScore === 0, 'Test 5.11: Candidate with NaN bounds has rankableScore 0');

  // ---------------------------------------------------------------------------
  // SCENARIO 6: Multi-Floor Design Evaluation
  // ---------------------------------------------------------------------------
  console.log('\n--- Scenario 6: Multi-Floor Design Evaluation ---');
  const specsGPlus1 = {
    plotWidth: 30,
    plotLength: 45,
    bhkCount: 3,
    bathroomsCount: 3,
    floorsCount: 2,
    archStyle: 'contemporary',
    amenities: { hasPooja: true, hasParking: true, hasBalcony: true }
  };

  const candMulti = generateLayout(specsGPlus1, { variationIndex: 0 });
  const scoreMulti = scoreDesignQuality(candMulti, specsGPlus1);

  assert(scoreMulti.isValid === true, 'Test 6.1: Valid multi-floor layout passes scoring validation');
  assert(scoreMulti.breakdown.structuralAndVertical?.isMultiFloor === true, 'Test 6.2: Structural evaluator detects multi-floor design');
  assert(scoreMulti.breakdown.structuralAndVertical?.stairwellAligned === true, 'Test 6.3: Multi-floor stairwell core vertically aligned');
  assert(scoreMulti.breakdown.structuralAndVertical?.score >= 85, `Test 6.4: Aligned multi-floor structural score >= 85 (got ${scoreMulti.breakdown.structuralAndVertical?.score})`);

  // Displaced upper stairwell
  const candMultiShifted = JSON.parse(JSON.stringify(candMulti));
  candMultiShifted.candidateId = 'cand_multi_shifted';
  const upperStair = candMultiShifted.floors[1].rooms.find(r => r.type === ROOM_TYPES.STAIRWELL);
  if (upperStair) {
    upperStair.bounds.x += 4.0; // Significant horizontal shift
  }
  const scoreShifted = scoreDesignQuality(candMultiShifted, specsGPlus1);
  assert(scoreShifted.isValid === false, 'Test 6.5: Horizontally shifted stairwell fails hard constraint validation');
  assert(scoreShifted.rankableScore === 0, 'Test 6.6: Horizontally shifted stairwell has rankableScore: 0');

  // ---------------------------------------------------------------------------
  // SCENARIO 7: Requirement-Satisfaction Differences
  // ---------------------------------------------------------------------------
  console.log('\n--- Scenario 7: Requirement-Satisfaction Differences ---');
  // Candidate A: Satisfies all 3 bedrooms, 3 baths, kitchen, pooja
  const candFullReq = generateLayout({ plotWidth: 35, plotLength: 50, bhkCount: 3, floorsCount: 2 });
  const scoreFullReq = scoreDesignQuality(candFullReq, { bhkCount: 3, bathroomsCount: 3 });

  // Candidate B: Strip out a bedroom to simulate unmet requirements
  const candPartialReq = JSON.parse(JSON.stringify(candFullReq));
  candPartialReq.candidateId = 'cand_partial_req';
  candPartialReq.floors[1].rooms = candPartialReq.floors[1].rooms.filter(r => !r.type.includes('bed'));

  const scorePartialReq = scoreDesignQuality(candPartialReq, { bhkCount: 3, bathroomsCount: 3 });

  const reqScoreFull = scoreFullReq.breakdown.requirementSatisfaction.score;
  const reqScorePartial = scorePartialReq.breakdown.requirementSatisfaction.score;
  assert(reqScoreFull > reqScorePartial, `Test 7.1: Full requirement score (${reqScoreFull}) > Partial requirement score (${reqScorePartial})`);
  assert(scorePartialReq.breakdown.requirementSatisfaction.missingItems.length > 0, 'Test 7.2: Missing rooms explicitly listed in partial score breakdown');

  // ---------------------------------------------------------------------------
  // SCENARIO 8: Adjacency and Circulation Differences
  // ---------------------------------------------------------------------------
  console.log('\n--- Scenario 8: Adjacency and Circulation Differences ---');
  // High circulation efficiency layout
  const circScoreBase = score1.breakdown.circulationEfficiency;
  assert(circScoreBase.carpetRatio >= 0.70, `Test 8.1: Carpet ratio is realistic (got ${circScoreBase.carpetRatio})`);
  assert(circScoreBase.score >= 70, `Test 8.2: Base circulation score is solid (got ${circScoreBase.score})`);

  // Low circulation candidate: artificially inflate built-up area (simulate 50% wall/corridor waste)
  const candLowCirc = JSON.parse(JSON.stringify(candBase));
  candLowCirc.candidateId = 'cand_low_circ';
  candLowCirc.metrics.builtUpAreaSqft = Math.round(candLowCirc.metrics.carpetAreaSqft / 0.55); // 55% carpet ratio
  const scoreLowCirc = scoreDesignQuality(candLowCirc, specs30x45);

  assert(scoreLowCirc.breakdown.circulationEfficiency.score < circScoreBase.score, 
    `Test 8.3: Low carpet ratio score (${scoreLowCirc.breakdown.circulationEfficiency.score}) < Normal score (${circScoreBase.score})`);
  assert(scoreLowCirc.breakdown.circulationEfficiency.carpetRatio < 0.60, 'Test 8.4: Low carpet ratio recorded');

  // ---------------------------------------------------------------------------
  // SCENARIO 9: Score Normalization and Weight Handling
  // ---------------------------------------------------------------------------
  console.log('\n--- Scenario 9: Score Normalization and Weight Handling ---');
  // Custom weights prioritizing daylighting (50%)
  const customWeights = {
    daylightVentilation: 0.50,
    requirementSatisfaction: 0.10,
    circulationEfficiency: 0.10,
    adjacencySeparation: 0.10,
    spaceUtilization: 0.10,
    roomProportions: 0.10
  };

  const scoreCustom = scoreDesignQuality(candBase, specs30x45, { weights: customWeights });
  assert(scoreCustom.weights.daylightVentilation > 0.40, 'Test 9.1: Daylight weight prioritized in normalized weights');
  const sumWeights = Object.values(scoreCustom.weights).reduce((a, b) => a + b, 0);
  assert(Math.abs(sumWeights - 1.0) < 0.001, `Test 9.2: Normalized weights sum to 1.00 (got ${sumWeights.toFixed(4)})`);

  // Non-normalized weights (e.g. summing to 100 instead of 1.0)
  const bigWeights = {
    circulationEfficiency: 40,
    daylightVentilation: 30,
    requirementSatisfaction: 30
  };
  const scoreBigWeights = scoreDesignQuality(candBase, specs30x45, { weights: bigWeights });
  const sumBig = Object.values(scoreBigWeights.weights).reduce((a, b) => a + b, 0);
  assert(Math.abs(sumBig - 1.0) < 0.001, `Test 9.3: Weights summing to 100 normalized safely to 1.00 (got ${sumBig.toFixed(4)})`);
  assert(scoreBigWeights.overallScore >= 50 && scoreBigWeights.overallScore <= 100, 'Test 9.4: Score remains normalized within 0-100 range');

  // ---------------------------------------------------------------------------
  // SCENARIO 10: Deterministic Tie-Breaking
  // ---------------------------------------------------------------------------
  console.log('\n--- Scenario 10: Deterministic Tie-Breaking ---');
  // Create two clone candidates with identical overall scores but differing candidateId
  const cloneA = JSON.parse(JSON.stringify(candBase));
  cloneA.candidateId = 'candidate_A';
  cloneA.id = 'candidate_A';

  const cloneB = JSON.parse(JSON.stringify(candBase));
  cloneB.candidateId = 'candidate_B';
  cloneB.id = 'candidate_B';

  const tieRank1 = rankCandidates([cloneB, cloneA], specs30x45);
  const tieRank2 = rankCandidates([cloneA, cloneB], specs30x45);

  // Both should order candidate_A before candidate_B deterministically via stable ID tie-breaker
  assert(tieRank1.rankedCandidates[0].candidateId === 'candidate_A', 'Test 10.1: Deterministic tie-breaker selects candidate_A first');
  assert(tieRank2.rankedCandidates[0].candidateId === 'candidate_A', 'Test 10.2: Permuted tie-breaker selects candidate_A first');
  assert(tieRank1.rankedCandidates[0].rankableScore === tieRank1.rankedCandidates[1].rankableScore, 'Test 10.3: Both tied candidates have identical scores');

  // Tie-breaker on requirement satisfaction
  const cloneC = JSON.parse(JSON.stringify(candBase));
  cloneC.candidateId = 'candidate_C_req_lead';
  // Force high requirement satisfaction score
  const rankWithReqLead = rankCandidates([cloneB, cloneC], specs30x45);
  assert(rankWithReqLead.rankedCandidates.length === 2, 'Test 10.4: Two candidates ranked with tie-breaker');

  // ---------------------------------------------------------------------------
  // SCENARIO 11: Regression and Backward Compatibility
  // ---------------------------------------------------------------------------
  console.log('\n--- Scenario 11: Regression and Backward Compatibility ---');
  // Test legacy fields for existing callers
  assert(typeof score1.overall === 'number', 'Test 11.1: Legacy field "overall" present and numeric');
  assert(typeof score1.circulation === 'number', 'Test 11.2: Legacy field "circulation" present and numeric');
  assert(typeof score1.daylightVentilation === 'number', 'Test 11.3: Legacy field "daylightVentilation" present and numeric');
  assert(typeof score1.vaastuCompliance === 'number', 'Test 11.4: Legacy field "vaastuCompliance" present and numeric');
  assert(typeof score1.structuralEfficiency === 'number', 'Test 11.5: Legacy field "structuralEfficiency" present and numeric');
  assert(score1.disclaimer === SCORING_DISCLAIMER, 'Test 11.6: Explicit regulatory disclaimer present');

  // Verify compareTwoCandidates helper
  const comparison = compareTwoCandidates(candA, invalidCandOverlap, specs30x45);
  assert(comparison !== null && typeof comparison === 'object', 'Test 11.7: compareTwoCandidates returns structured comparison');
  assert(comparison.verdict.includes('wins decisively'), `Test 11.8: Valid candidate wins decisively over invalid (${comparison.verdict})`);
  assert(Array.isArray(comparison.keyDifferentiators), 'Test 11.9: Key differentiators array returned');

  // ---------------------------------------------------------------------------
  // SCENARIO 12: End-to-End Generation, Validation, Scoring, and Ranking
  // ---------------------------------------------------------------------------
  console.log('\n--- Scenario 12: End-to-End Generation & Ranking Workflow ---');
  const engine = new LabourConnectDesignEngine();

  // Generate 2 variations through engine
  const varResult = engine.generateVariations({
    plotWidth: 30,
    plotLength: 45,
    bhkCount: 2,
    floorsCount: 1,
    archStyle: 'contemporary'
  }, 2);

  assert(varResult.success === true, 'Test 12.1: Engine generates 2 variations');
  assert(varResult.variations.length === 2, 'Test 12.2: Exactly 2 variations produced');

  // Rank the variations via engine.rankCandidates
  const ranked = engine.rankCandidates(varResult.variations, { bhkCount: 2 });
  assert(ranked.success === true, 'Test 12.3: engine.rankCandidates succeeds');
  assert(ranked.totalEvaluated === 2, 'Test 12.4: Exactly 2 variations evaluated and ranked');
  assert(ranked.validCount === 2, 'Test 12.5: Both variations are valid');
  assert(ranked.topCandidate !== null, 'Test 12.6: Top candidate selected');
  assert(ranked.rankedCandidates[0].rank === 1, 'Test 12.7: Rank 1 candidate identified');
  assert(ranked.rankedCandidates[1].rank === 2, 'Test 12.8: Rank 2 candidate identified');
  assert(ranked.rankedCandidates[0].rankableScore >= ranked.rankedCandidates[1].rankableScore, 'Test 12.9: Rank 1 score >= Rank 2 score');

  // Top candidate has valid 3D geometry and BOQ estimate attached
  const topDesign = ranked.topCandidate;
  assert(topDesign.geometry3d !== null && Array.isArray(topDesign.geometry3d.rooms3d), 'Test 12.10: Top candidate has procedural 3D geometry');
  const boqTotal = topDesign.boqEstimate?.totalCostInr || topDesign.boqEstimate?.grandTotalInr;
  assert(topDesign.boqEstimate !== null && typeof boqTotal === 'number', 'Test 12.11: Top candidate has deterministic BOQ estimate');

  console.log('\n======================================================================');
  console.log(`CANDIDATE SCORING & RANKING TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('======================================================================\n');

  return { passed, failed };
}

if (import.meta.url === `file:///${process.argv[1]?.replace(/\\/g, '/')}`) {
  const result = runCandidateScoringAndRankingTests();
  if (result.failed > 0) process.exit(1);
}
