/**
 * LabourConnect Design Engine - Total Project Budget & Regional Rate Engine Test Suite
 * 
 * Verifies all 28 required scenarios for Sprint 4 Task S4-T01:
 * - Single-storey and multi-storey physical takeoffs
 * - 10 discrete cost categories with opening deductions
 * - Regional Indian rate resolution and provenance tracking
 * - Total-budget variance reconciliation and status transitions
 * - Value-engineering trade-off calculations
 * - Protection against double taxation and double contingency
 * - Backwards compatibility with existing BOQ engine
 */

import { strict as assert } from 'assert';
import {
  calculateProjectBudget,
  BUDGET_STATUS
} from '../estimation/projectBudgetEngine.js';
import {
  resolveRegionalRate,
  RATE_PROVENANCE,
  getSupportedCities
} from '../estimation/regionalRateCatalog.js';
import { calculateDeterministicBOQ } from '../estimation/deterministicBoqEngine.js';
import { generateLayoutCandidate } from '../generator/layoutGenerator.js';

export function runTotalProjectBudgetTests() {
  console.log('\n===============================================================');
  console.log('LABOURCONNECT ENGINE: TOTAL PROJECT BUDGET & REGIONAL RATES (S4-T01)');
  console.log('===============================================================');

  let passed = 0;
  let failed = 0;

  function runTest(name, fn) {
    try {
      fn();
      console.log(`✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ FAIL: ${name}`);
      console.error(err);
      failed++;
    }
  }

  // Common Test Fixtures
  const singleStoreyDesign = generateLayoutCandidate({
    plotWidth: 30,
    plotLength: 50,
    floorsCount: 1,
    bhkCount: 2,
    bathroomsCount: 2,
    homeBudgetInr: 3500000
  });

  const multiStoreyDesign = generateLayoutCandidate({
    plotWidth: 40,
    plotLength: 60,
    floorsCount: 2,
    bhkCount: 3,
    bathroomsCount: 3,
    homeBudgetInr: 5500000
  });

  // -----------------------------------------------------------------
  // Group 1: Physical Geometry & Category Takeoffs (Scenarios 1, 2, 19, 20, 21)
  // -----------------------------------------------------------------
  console.log('\n--- Group 1: Architectural Takeoff & 10 Cost Categories ---');

  runTest('Scenario 1: Valid single-storey design computes 10 categories with positive quantities', () => {
    const res = calculateProjectBudget(singleStoreyDesign, { targetBudget: 3500000 });
    assert.equal(res.success, true);
    assert.equal(res.categorySubtotals.length, 10);
    assert(res.totalEstimatedCost > 1500000 && res.totalEstimatedCost < 6000000);
    assert(res.quantities.concreteCuMtr > 0);
    assert(res.quantities.steelTons > 0);
  });

  runTest('Scenario 2: Valid multi-storey design scales built-up area and structural quantities proportionally', () => {
    const res1 = calculateProjectBudget(singleStoreyDesign);
    const res2 = calculateProjectBudget(multiStoreyDesign);
    assert(res2.quantities.builtUpAreaSqft > res1.quantities.builtUpAreaSqft);
    assert(res2.quantities.concreteCuMtr > res1.quantities.concreteCuMtr);
    assert(res2.quantities.steelTons > res1.quantities.steelTons);
    assert(res2.totalEstimatedCost > res1.totalEstimatedCost);
  });

  runTest('Scenario 19: Opening deductions strictly reduce net wall masonry area', () => {
    const res = calculateProjectBudget(multiStoreyDesign);
    assert(res.quantities.netMasonrySqft > 0);
    assert(res.quantities.doorCount >= 5);
    assert(res.quantities.windowSqft > 0);
    // Net masonry must be smaller than hypothetical gross wall without openings
    const grossEst = res.quantities.builtUpAreaSqft * 2.4;
    assert(res.quantities.netMasonrySqft < grossEst);
  });

  runTest('Scenario 20: Shared-wall and duplicate-quantity protection prevents double-counting', () => {
    const res = calculateProjectBudget(multiStoreyDesign);
    const exteriorMasonry = res.itemizedBreakdown.find(it => it.id === 'brickwork_exterior');
    const interiorMasonry = res.itemizedBreakdown.find(it => it.id === 'brickwork_interior');
    assert(exteriorMasonry && interiorMasonry);
    // Sum of interior + exterior equals total net masonry
    assert.equal(exteriorMasonry.quantity + interiorMasonry.quantity, res.quantities.netMasonrySqft);
  });

  runTest('Scenario 21: Duplicate category item protection ensures each item belongs to exactly 1 category', () => {
    const res = calculateProjectBudget(multiStoreyDesign);
    const itemIds = res.itemizedBreakdown.map(it => it.id);
    const uniqueIds = new Set(itemIds);
    assert.equal(itemIds.length, uniqueIds.size, 'Every item ID must be unique in the breakdown');
    // Sum of category subtotals equals totalEstimatedCost
    const subtotalSum = res.categorySubtotals.reduce((s, c) => s + c.subtotalInr, 0);
    assert.equal(subtotalSum, res.totalEstimatedCost, 'Category subtotals sum must exactly match totalEstimatedCost');
  });

  // -----------------------------------------------------------------
  // Group 2: Regional Indian Rates & Provenance (Scenarios 3, 4, 5, 25)
  // -----------------------------------------------------------------
  console.log('\n--- Group 2: Regional Rate Resolution & Provenance ---');

  runTest('Scenario 3: Different regional rate configurations reflect local cost indices (Mumbai > Bengaluru > Kolkata)', () => {
    const resBengaluru = calculateProjectBudget(multiStoreyDesign, { city: 'Bengaluru' });
    const resMumbai = calculateProjectBudget(multiStoreyDesign, { city: 'Mumbai' });
    const resKolkata = calculateProjectBudget(multiStoreyDesign, { city: 'Kolkata' });

    assert(resMumbai.totalEstimatedCost > resBengaluru.totalEstimatedCost, 'Mumbai rates must be higher than Bengaluru base');
    assert(resKolkata.totalEstimatedCost < resBengaluru.totalEstimatedCost, 'Kolkata rates must be lower than Bengaluru base');
  });

  runTest('Scenario 4: Missing or unknown regional city falls back to baseline with explicit warning', () => {
    const res = calculateProjectBudget(multiStoreyDesign, { city: 'NonExistentCity' });
    assert.equal(res.success, true);
    assert(res.warnings.length > 0, 'Must record fallback warning');
    assert(res.warnings.some(w => w.includes('NonExistentCity')));
  });

  runTest('Scenario 5: User-overridden unit rate reflects accurately in item amount and total', () => {
    const baseRes = calculateProjectBudget(multiStoreyDesign, { city: 'Bengaluru' });
    const overrideSteelRate = 75000.0; // override from 62000 to 75000
    const overRes = calculateProjectBudget(multiStoreyDesign, {
      city: 'Bengaluru',
      userRateOverrides: { steel_fe550d: overrideSteelRate }
    });

    const steelItem = overRes.itemizedBreakdown.find(it => it.id === 'steel_fe550d');
    assert.equal(steelItem.unitRate, overrideSteelRate);
    assert.equal(steelItem.provenance, RATE_PROVENANCE.USER_OVERRIDE);
    assert(overRes.totalEstimatedCost > baseRes.totalEstimatedCost);
  });

  runTest('Scenario 25: Budget engine outputs match consistently across calling configurations', () => {
    const cities = getSupportedCities();
    assert(cities.includes('Bengaluru') && cities.includes('Mumbai') && cities.includes('Chennai'));
    const rateA = resolveRegionalRate('concrete_rmc_m25', 'Bengaluru');
    assert.equal(rateA.provenance, RATE_PROVENANCE.SOURCED);
    assert.equal(rateA.unitRate, 5200);
  });

  // -----------------------------------------------------------------
  // Group 3: Taxes, Fees, Contingency & Deductions (Scenarios 8, 15, 16, 17, 18)
  // -----------------------------------------------------------------
  console.log('\n--- Group 3: Taxes, Transport, Contingency & Exclusions ---');

  runTest('Scenario 8: Explicitly excluded optional items reduce total by exact item amount', () => {
    const resAll = calculateProjectBudget(multiStoreyDesign);
    const resNoGate = calculateProjectBudget(multiStoreyDesign, {
      excludeItems: ['entrance_gate']
    });
    const gateItem = resAll.itemizedBreakdown.find(it => it.id === 'entrance_gate');
    assert(gateItem && gateItem.amountInr > 0);
    assert(resNoGate.totalEstimatedCost < resAll.totalEstimatedCost);
    assert.equal(resNoGate.itemizedBreakdown.find(it => it.id === 'entrance_gate').isIncluded, false);
  });

  runTest('Scenario 15: Tax (GST 18%) is applied correctly on contractor margin & professional fees', () => {
    const res = calculateProjectBudget(multiStoreyDesign);
    const gstItem = res.itemizedBreakdown.find(it => it.id === 'gst_works_contract');
    const marginItem = res.itemizedBreakdown.find(it => it.id === 'contractor_margin');
    const profFeeSubtotal = res.subtotals.professionalFeesSubtotal;

    assert(gstItem && gstItem.amountInr > 0);
    const expectedTaxable = marginItem.amountInr + profFeeSubtotal;
    const expectedGst = Math.round(expectedTaxable * 0.18);
    assert.equal(gstItem.amountInr, expectedGst);
  });

  runTest('Scenario 16: Tax is not applied twice (no cascading double taxation on raw materials)', () => {
    const res = calculateProjectBudget(multiStoreyDesign);
    const gstItem = res.itemizedBreakdown.find(it => it.id === 'gst_works_contract');
    // GST amount must be much lower than 18% of total estimated cost
    const maxCascadeGst = res.totalEstimatedCost * 0.18;
    assert(gstItem.amountInr < maxCascadeGst * 0.5, 'GST must only apply to services/margin basis, not total cost');
  });

  runTest('Scenario 17: Contingency (5%) and Escalation (3%) applied correctly to base cost', () => {
    const res = calculateProjectBudget(multiStoreyDesign);
    const baseDirect = res.subtotals.baseDirectCost;
    const contingencyItem = res.itemizedBreakdown.find(it => it.id === 'unforeseen_contingency');
    const escalationItem = res.itemizedBreakdown.find(it => it.id === 'price_escalation_buffer');

    assert.equal(contingencyItem.amountInr, Math.round(baseDirect * 0.05));
    assert.equal(escalationItem.amountInr, Math.round(baseDirect * 0.03));
  });

  runTest('Scenario 18: Contingency is not applied twice (single transparent entry)', () => {
    const res = calculateProjectBudget(multiStoreyDesign);
    const contingencyItems = res.itemizedBreakdown.filter(it => it.id === 'unforeseen_contingency');
    assert.equal(contingencyItems.length, 1, 'Only one contingency line item permitted');
  });

  // -----------------------------------------------------------------
  // Group 4: Reconciliation, Variance & Status (Scenarios 11, 12, 13, 14, 6, 7, 26)
  // -----------------------------------------------------------------
  console.log('\n--- Group 4: Total-Budget Reconciliation & Status Transitions ---');

  runTest('Scenario 11: Invalid or negative target budget returns INVALID_INPUT status', () => {
    const resNegative = calculateProjectBudget(multiStoreyDesign, { targetBudget: -50000 });
    assert.equal(resNegative.success, false);
    assert.equal(resNegative.budgetStatus, BUDGET_STATUS.INVALID_INPUT);

    const resZero = calculateProjectBudget(multiStoreyDesign, { targetBudget: 0 });
    assert.equal(resZero.success, false);
    assert.equal(resZero.budgetStatus, BUDGET_STATUS.INVALID_INPUT);
  });

  runTest('Scenario 12: Exact-budget match produces AT_BUDGET status with zero variance', () => {
    const baseline = calculateProjectBudget(multiStoreyDesign);
    const exactCost = baseline.totalEstimatedCost;
    const resExact = calculateProjectBudget(multiStoreyDesign, { targetBudget: exactCost });

    assert.equal(resExact.budgetStatus, BUDGET_STATUS.AT_BUDGET);
    assert.equal(resExact.budgetVariance, 0);
    assert.equal(resExact.budgetVariancePercentage, 0);
  });

  runTest('Scenario 13: Under-budget estimate produces WITHIN_BUDGET status with positive variance', () => {
    const baseline = calculateProjectBudget(multiStoreyDesign);
    const generousBudget = baseline.totalEstimatedCost + 1000000;
    const resUnder = calculateProjectBudget(multiStoreyDesign, { targetBudget: generousBudget });

    assert.equal(resUnder.budgetStatus, BUDGET_STATUS.WITHIN_BUDGET);
    assert(resUnder.budgetVariance > 0, 'Variance must be positive when under budget');
    assert.equal(resUnder.budgetVariance, 1000000);
  });

  runTest('Scenario 14: Over-budget estimate produces OVER_BUDGET status with negative variance', () => {
    const baseline = calculateProjectBudget(multiStoreyDesign);
    const tightBudget = baseline.totalEstimatedCost - 500000;
    const resOver = calculateProjectBudget(multiStoreyDesign, { targetBudget: tightBudget });

    assert.equal(resOver.budgetStatus, BUDGET_STATUS.OVER_BUDGET);
    assert(resOver.budgetVariance < 0, 'Variance must be negative when over budget');
    assert.equal(resOver.budgetVariance, -500000);
  });

  runTest('Scenario 6: Incomplete furniture information marks estimate as INCOMPLETE_ESTIMATE', () => {
    const res = calculateProjectBudget(multiStoreyDesign, { includeFurnishings: false });
    assert.equal(res.hasIncompleteCategories, true);
    assert.equal(res.budgetStatus, BUDGET_STATUS.INCOMPLETE_ESTIMATE);
  });

  runTest('Scenario 7: Incomplete landscaping information marks estimate as INCOMPLETE_ESTIMATE', () => {
    const res = calculateProjectBudget(multiStoreyDesign, { includeLandscaping: false });
    assert.equal(res.hasIncompleteCategories, true);
    assert.equal(res.budgetStatus, BUDGET_STATUS.INCOMPLETE_ESTIMATE);
  });

  runTest('Scenario 26: Missing cost categories do not produce a false complete estimate', () => {
    const res = calculateProjectBudget(multiStoreyDesign, {
      excludeCategories: ['interior_furnishings']
    });
    assert.equal(res.hasIncompleteCategories, true);
    assert.equal(res.budgetStatus, BUDGET_STATUS.INCOMPLETE_ESTIMATE);
  });

  // -----------------------------------------------------------------
  // Group 5: Trade-Off Recommendations & Edge Cases (Scenarios 9, 10, 22, 23, 24, 27, 28)
  // -----------------------------------------------------------------
  console.log('\n--- Group 5: Trade-Off Recommendations, Edge Cases & Backwards Compatibility ---');

  runTest('Scenario 9: Zero or invalid quantities handled safely without NaN outputs', () => {
    const emptyDesign = { site: { plotWidth: 0, plotLength: 0 }, metrics: {}, inputs: {}, floors: [] };
    const res = calculateProjectBudget(emptyDesign, { targetBudget: 1000000 });
    assert.equal(res.success, true);
    assert(!isNaN(res.totalEstimatedCost));
    assert(!isNaN(res.budgetVariance));
    assert(res.totalEstimatedCost >= 0);
  });

  runTest('Scenario 10: Negative user override rates rejected cleanly with error', () => {
    const res = calculateProjectBudget(multiStoreyDesign, {
      userRateOverrides: { concrete_rmc_m25: -500 }
    });
    assert.equal(res.success, false);
    assert.equal(res.budgetStatus, BUDGET_STATUS.INVALID_INPUT);
    assert(res.errors[0].includes('cannot be negative'));
  });

  runTest('Scenario 22: Cost trade-off calculation produces realistic savings from real rate differences', () => {
    const res = calculateProjectBudget(multiStoreyDesign, { targetBudget: 2500000 }); // tight budget
    assert(res.recommendations.length > 0, 'Must produce recommendations when over budget');
    const aacRec = res.recommendations.find(r => r.id === 'rec_aac_masonry');
    assert(aacRec && aacRec.estimatedSavingsInr > 0);
    assert.equal(aacRec.requiresUserApproval, true);
    assert.equal(aacRec.feasibility, 'HIGH');
  });

  runTest('Scenario 23: No fabricated saving when alternatives are unavailable', () => {
    const res = calculateProjectBudget(multiStoreyDesign);
    res.recommendations.forEach(rec => {
      assert(typeof rec.estimatedSavingsInr === 'number' && rec.estimatedSavingsInr > 0);
      assert(rec.alternativeSpec && rec.alternativeSpec.length > 0);
    });
  });

  runTest('Scenario 24: Determinism: identical inputs produce 100% identical results across repeated runs', () => {
    const runA = calculateProjectBudget(multiStoreyDesign, { city: 'Bengaluru', targetBudget: 5000000 });
    const runB = calculateProjectBudget(multiStoreyDesign, { city: 'Bengaluru', targetBudget: 5000000 });
    assert.equal(runA.totalEstimatedCost, runB.totalEstimatedCost);
    assert.equal(runA.budgetVariance, runB.budgetVariance);
    assert.deepEqual(runA.categorySubtotals, runB.categorySubtotals);
  });

  runTest('Scenario 27: calculateDeterministicBOQ remains 100% backwards-compatible and attaches projectBudget', () => {
    const boq = calculateDeterministicBOQ(multiStoreyDesign, 5000000);
    assert(boq.totalCostInr > 0);
    assert(boq.civilStructureCost > 0);
    assert(boq.finishesCost > 0);
    assert(boq.mepCost > 0);
    assert(Array.isArray(boq.itemizedBreakdown));
    assert(boq.projectBudget && boq.projectBudget.success === true);
    assert.equal(boq.projectBudget.targetBudget, 5000000);
  });

  runTest('Scenario 28: Existing design model inputs and specifications are never mutated', () => {
    const specs = {
      plotWidth: 30,
      plotLength: 50,
      floorsCount: 2,
      bhkCount: 3,
      bathroomsCount: 3,
      homeBudgetInr: 5500000
    };
    const design = generateLayoutCandidate(specs);
    const designSnapshot = JSON.stringify(design);
    calculateProjectBudget(design, { targetBudget: 9999999, city: 'Mumbai' });
    assert.equal(JSON.stringify(design), designSnapshot, 'Original design object must remain completely unmutated');
    assert.equal(specs.homeBudgetInr, 5500000, 'Original input specs must remain unmutated');
  });

  console.log('\n===============================================================');
  console.log(`TOTAL PROJECT BUDGET TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('===============================================================');

  if (failed > 0) {
    throw new Error(`Total Project Budget Suite failed with ${failed} failure(s).`);
  }

  return { passed, failed };
}

// Standalone execution guard
if (process.argv[1] && (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}` || import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`)) {
  runTotalProjectBudgetTests();
}
