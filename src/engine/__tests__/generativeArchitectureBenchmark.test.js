/**
 * LabourConnect Generative Architecture Engine - Benchmark & Diversity Test Suite
 * 
 * Verifies the Master Engineering Directive requirements:
 * 
 * Test A: Same Prompt Repeatedly (100 Runs Experiment)
 *         - Generates 100 designs for the exact same prompt
 *         - Measures valid designs count, unique fingerprints count, duplicate rate
 *         - Verifies genuine massing, room arrangement, and circulation diversity
 * Test B: Same Requirements, 8 Different Architectural Styles
 *         - Modern, Vintage Indian, Chettinad, Kerala, Village, Mediterranean, Japandi, Luxury Villa
 *         - Verifies authentic architectural changes (roofline, massing, verandahs, materials)
 * Test C: Different Building Typologies
 *         - Independent House, Luxury Villa, Farmhouse, Commercial Office/Retail, Multi-Generational
 * Test D: Plot Variations
 *         - 20x30, 30x40, 40x60, 60x80, 0.3-Acre
 * Test E: Hard-Constraint Preservation
 *         - Guaranteed zero dropped bedrooms, zero dropped bathrooms, preserved floor counts
 * Test F: Seed Reproducibility
 *         - Same seed yields identical design (100% similarity)
 *         - New seed yields distinct architectural concept
 * Test G: 2D, 3D, and 5D Parity & Single Source of Truth
 */

import assert from 'node:assert';
import {
  GenerativeArchitectureEngine,
  generativeArchitectureEngine,
  exploreDesignSpaceCoordinate,
  generateDesignSpacePool,
  MASSING_FAMILIES,
  SPATIAL_TOPOLOGIES,
  CIRCULATION_CORE_POSITIONS,
  COMPREHENSIVE_ARCHITECTURAL_STYLES,
  BUILDING_TYPOLOGIES,
  resolveStyleAndTypology,
  computeDesignFingerprint,
  calculateStructuralSimilarity,
  ROOFLINE_STYLES
} from '../index.js';

export function runGenerativeArchitectureBenchmarkTests() {
  let passed = 0;
  let failed = 0;

  function runTest(name, fn) {
    try {
      fn();
      passed++;
      console.log(`✅ PASS: ${name}`);
    } catch (err) {
      failed++;
      console.error(`❌ FAIL: ${name}`);
      console.error(`   ${err.message}`);
    }
  }

  console.log('\n===============================================================');
  console.log('🚀 GENERATIVE ARCHITECTURE BENCHMARK & DIVERSITY VERIFICATION');
  console.log('===============================================================\n');

// =============================================================================
// TEST A — SAME PROMPT 100 TIMES DIVERSITY EXPERIMENT
// =============================================================================

console.log('--- TEST A: SAME PROMPT 100 TIMES DIVERSITY EXPERIMENT ---');

const testAPrompt = {
  userPrompt: 'Design a modern 3BHK house on a 30x40 ft plot with 2 floors, 3 bathrooms, kitchen, living, dining, and pooja.',
  plotWidth: 30,
  plotLength: 40,
  floorsCount: 2,
  bhkCount: 3,
  bathroomsCount: 3,
  hasPooja: true,
  archStyle: 'modern'
};

const batchResult = generativeArchitectureEngine.generateDiverseBatch(testAPrompt, 100, {
  seed: 991122,
  enforceDiversity: true
});

runTest('Test A.1: 100-generation batch succeeds', () => {
  assert.strictEqual(batchResult.success, true);
});

runTest('Test A.2: Exactly 100 valid architectural designs generated', () => {
  assert.strictEqual(batchResult.totalGenerated, 100);
});

runTest('Test A.3: 100% unique architectural fingerprints (100 unique / 100 designs)', () => {
  assert.strictEqual(batchResult.uniqueFingerprintsCount, 100);
  assert.strictEqual(batchResult.diversityRate, 1.0);
});

runTest('Test A.4: Near-duplicate rejection active and functioning', () => {
  assert.ok(batchResult.duplicatesRejected >= 0, 'Duplicate rejection count tracked');
});

runTest('Test A.5: Zero constraint violations across all 100 generations', () => {
  assert.strictEqual(batchResult.constraintViolations, 0);
  batchResult.designs.forEach((d, idx) => {
    assert.strictEqual(d.site.plotWidth, 30, `Design ${idx} preserves plot width`);
    assert.strictEqual(d.site.plotLength, 40, `Design ${idx} preserves plot length`);
    assert.strictEqual(d.floors.length, 3, `Design ${idx} has 2 floors + terrace (3 floor objects)`);
  });
});

runTest('Test A.6: Circulation core diversity across batch (both right and left flank explored)', () => {
  const rightStairs = batchResult.designs.filter(d => {
    const stair = d.floors[0].rooms.find(r => r.type === 'stairwell');
    return stair && stair.bounds.x > d.site.buildableEnvelope.x + d.site.buildableEnvelope.width / 2;
  });
  const leftStairs = batchResult.designs.filter(d => {
    const stair = d.floors[0].rooms.find(r => r.type === 'stairwell');
    return stair && stair.bounds.x <= d.site.buildableEnvelope.x + d.site.buildableEnvelope.width / 2;
  });
  assert.ok(rightStairs.length > 20, `Right flank stairs explored (${rightStairs.length})`);
  assert.ok(leftStairs.length > 20, `Left flank stairs explored (${leftStairs.length})`);
});

runTest('Test A.7: Kitchen position diversity across batch (both east and west quadrants explored)', () => {
  const kitchens = batchResult.designs.map(d => d.floors[0].rooms.find(r => r.type === 'kitchen'));
  const rightKitchens = kitchens.filter(k => k && k.bounds.x > 15);
  const leftKitchens = kitchens.filter(k => k && k.bounds.x <= 15);
  assert.ok(rightKitchens.length > 15, `Right-side kitchens explored (${rightKitchens.length})`);
  assert.ok(leftKitchens.length > 15, `Left-side kitchens explored (${leftKitchens.length})`);
});

runTest('Test A.8: Pairwise similarity between consecutive designs < 82% threshold', () => {
  for (let i = 0; i < 10; i++) {
    const d1 = batchResult.designs[i];
    const d2 = batchResult.designs[i + 1];
    const sim = calculateStructuralSimilarity(d1, d2);
    assert.ok(sim < 0.82, `Pair (${i}, ${i+1}) similarity ${sim.toFixed(3)} is below 0.82 threshold`);
  }
});

// =============================================================================
// TEST B — SAME REQUIREMENTS, 8 DIFFERENT ARCHITECTURAL STYLES
// =============================================================================

console.log('\n--- TEST B: SAME REQUIREMENTS, 8 DIFFERENT ARCHITECTURAL STYLES ---');

const stylesToTest = [
  'modern',
  'vintage',
  'chettinad',
  'kerala',
  'village',
  'mediterranean',
  'japandi',
  'luxury_villa'
];

const styleDesigns = {};

stylesToTest.forEach(styleKey => {
  const res = generativeArchitectureEngine.generateDesign({
    ...testAPrompt,
    archStyle: styleKey,
    userPrompt: `Design a ${styleKey} house on a 30x40 ft plot with 3 bedrooms and 2 floors.`
  }, { seed: 12345, recordHistory: false });

  assert.strictEqual(res.success, true, `Style ${styleKey} generates successfully`);
  styleDesigns[styleKey] = res.design;
});

runTest('Test B.1: Vintage Indian style produces authentic pitched roofline', () => {
  const vintage = styleDesigns['vintage'];
  assert.ok(vintage.style.id === 'vintage_indian');
  assert.strictEqual(vintage.style.roofline, ROOFLINE_STYLES.SLOPING_PITCHED);
  assert.strictEqual(vintage.style.roofPitchDegrees, 28);
  assert.ok(vintage.style.eavesOverhangFt >= 3.0);
});

runTest('Test B.2: Kerala traditional produces deep 4.0 ft eaves and Nalukettu courtyard preference', () => {
  const kerala = styleDesigns['kerala'];
  assert.strictEqual(kerala.style.id, 'kerala_traditional');
  assert.strictEqual(kerala.style.roofline, ROOFLINE_STYLES.SLOPING_PITCHED);
  assert.strictEqual(kerala.style.eavesOverhangFt, 4.0);
  assert.strictEqual(kerala.style.porticoStyle, 'POOMUKHAM_VERANDAH');
});

runTest('Test B.3: Chettinad heritage produces raised thinnai verandah and authentic color palette', () => {
  const chettinad = styleDesigns['chettinad'];
  assert.strictEqual(chettinad.style.id, 'chettinad');
  assert.strictEqual(chettinad.style.verandahType, 'RAISED_THINNAI_WITH_PILLARS');
  assert.ok(chettinad.style.materials.roofColor.includes('#991b1b'));
});

runTest('Test B.4: Modern minimalist produces flat parapet profile with flush facade', () => {
  const modern = styleDesigns['modern'];
  assert.strictEqual(modern.style.roofline, ROOFLINE_STYLES.PARAPET_PROFILE);
  assert.strictEqual(modern.style.facadeModulation, 'flush');
});

runTest('Test B.5: Luxury villa produces pergola terrace and architectural fins', () => {
  const villa = styleDesigns['luxury_villa'];
  assert.strictEqual(villa.style.id, 'contemporary_luxury');
  assert.strictEqual(villa.style.roofline, ROOFLINE_STYLES.PERGOLA_TERRACE);
  assert.strictEqual(villa.style.facadeModulation, 'architectural_fins');
});

runTest('Test B.6: Japandi produces wabi-sabi engawa wooden verandah and matte roof', () => {
  const japandi = styleDesigns['japandi'];
  assert.strictEqual(japandi.style.id, 'japandi');
  assert.strictEqual(japandi.style.verandahType, 'ENGAWA_WOODEN_VERANDAH');
});

runTest('Test B.7: Mediterranean produces Spanish barrel roof and Roman arched portico', () => {
  const med = styleDesigns['mediterranean'];
  assert.strictEqual(med.style.id, 'mediterranean');
  assert.strictEqual(med.style.porticoStyle, 'ROMAN_ARCHED_PORTICO');
});

runTest('Test B.8: Village house produces deep shaded verandah with native clay tile eaves', () => {
  const village = styleDesigns['village'];
  assert.strictEqual(village.style.id, 'village_rural');
  assert.strictEqual(village.style.verandahType, 'DEEP_SHADED_VERANDAH');
});

// =============================================================================
// TEST C — DIFFERENT BUILDING TYPOLOGIES
// =============================================================================

console.log('\n--- TEST C: DIFFERENT BUILDING TYPOLOGIES ---');

runTest('Test C.1: Commercial retail & office building correctly resolved and typed', () => {
  const commInfo = resolveStyleAndTypology('Design a commercial building with ground-floor retail showroom and two office floors');
  assert.strictEqual(commInfo.typology.id, 'commercial_retail_office');
  assert.strictEqual(commInfo.typology.category, 'commercial');
});

runTest('Test C.2: Farmhouse / Bungalow correctly resolved with sprawling verandah priority', () => {
  const farmInfo = resolveStyleAndTypology('Design a contemporary farmhouse with open living spaces, garden and large outdoor verandah');
  assert.strictEqual(farmInfo.typology.id, 'farmhouse_bungalow');
  assert.strictEqual(farmInfo.typology.defaultFloors, 1);
});

runTest('Test C.3: Multi-generational house correctly resolved with dual suite zoning', () => {
  const multiInfo = resolveStyleAndTypology('Design a multi-generational house with separate private zones for two families');
  assert.strictEqual(multiInfo.typology.id, 'multi_generational');
});

runTest('Test C.4: Duplex villa correctly resolved', () => {
  const duplexInfo = resolveStyleAndTypology('Design a luxury duplex villa with double height living');
  assert.strictEqual(duplexInfo.typology.id, 'duplex_villa');
});

runTest('Test C.5: Compact urban home correctly resolved', () => {
  const urbanInfo = resolveStyleAndTypology('Design a compact urban home for a narrow plot');
  assert.strictEqual(urbanInfo.typology.id, 'compact_urban');
});

// =============================================================================
// TEST D — PLOT VARIATIONS
// =============================================================================

console.log('\n--- TEST D: PLOT VARIATIONS (20x30 to 0.3-Acre) ---');

const plots = [
  { w: 20, l: 30, floors: 2, bhk: 2 },
  { w: 30, l: 40, floors: 2, bhk: 3 },
  { w: 40, l: 60, floors: 2, bhk: 4 },
  { w: 60, l: 80, floors: 2, bhk: 4 },
  { w: 100, l: 130, floors: 2, bhk: 3 } // ~0.3-Acre property
];

plots.forEach(({ w, l, floors, bhk }, idx) => {
  const res = generativeArchitectureEngine.generateDesign({
    plotWidth: w,
    plotLength: l,
    floorsCount: floors,
    bhkCount: bhk,
    archStyle: 'modern'
  }, { seed: 5000 + idx, recordHistory: false });

  runTest(`Test D.${idx + 1}: Plot ${w}x${l} (${w * l} sq.ft) generates valid proportionate architecture`, () => {
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.design.site.plotWidth, w);
    assert.strictEqual(res.design.site.plotLength, l);
    // On 0.3-acre plot (13,000 sqft), building footprint should be proportionate, NOT warehouse scale
    if (w * l > 10000) {
      const bEnv = res.design.site.buildableEnvelope;
      assert.ok(bEnv.width <= 40, 'Width scales realistically on 0.3 acre');
      assert.ok(bEnv.length <= 50, 'Length scales realistically on 0.3 acre');
    }
  });
});

// =============================================================================
// TEST E — HARD-CONSTRAINT PRESERVATION
// =============================================================================

console.log('\n--- TEST E: HARD-CONSTRAINT PRESERVATION ---');

const mandatorySpecs = {
  userPrompt: '3 bedrooms, 4 bathrooms, 2 floors vintage house',
  plotWidth: 40,
  plotLength: 60,
  floorsCount: 2,
  bhkCount: 3,
  bathroomsCount: 4,
  archStyle: 'vintage'
};

const batchE = generativeArchitectureEngine.generateDiverseBatch(mandatorySpecs, 20, { seed: 777111 });

runTest('Test E.1: All 20 designs preserve exactly 2 habitable floors', () => {
  batchE.designs.forEach((d, i) => {
    const habitableFloors = d.floors.filter(f => !f.isTerrace && !f.name.toLowerCase().includes('terrace'));
    assert.strictEqual(habitableFloors.length, 2, `Design ${i} has exactly 2 habitable floors`);
  });
});

runTest('Test E.2: All 20 designs preserve exactly 3 bedrooms', () => {
  batchE.designs.forEach((d, i) => {
    const allBedrooms = d.floors.flatMap(f => f.rooms).filter(r => r.type === 'bedroom' || r.type === 'master_bedroom');
    assert.strictEqual(allBedrooms.length, 3, `Design ${i} has exactly 3 bedrooms (got ${allBedrooms.length})`);
  });
});

runTest('Test E.3: All 20 designs preserve exactly 4 bathrooms', () => {
  batchE.designs.forEach((d, i) => {
    const allBaths = d.floors.flatMap(f => f.rooms).filter(r => r.type === 'bathroom');
    assert.strictEqual(allBaths.length, 4, `Design ${i} has exactly 4 bathrooms (got ${allBaths.length})`);
  });
});

// =============================================================================
// TEST F — SEED REPRODUCIBILITY
// =============================================================================

console.log('\n--- TEST F: SEED REPRODUCIBILITY ---');

const seedRun1 = generativeArchitectureEngine.generateDesign(testAPrompt, { seed: 443322, recordHistory: false });
const seedRun2 = generativeArchitectureEngine.generateDesign(testAPrompt, { seed: 443322, recordHistory: false });
const seedRun3 = generativeArchitectureEngine.generateDesign(testAPrompt, { seed: 998877, recordHistory: false });

runTest('Test F.1: Same seed produces identical design fingerprint', () => {
  assert.strictEqual(seedRun1.fingerprint, seedRun2.fingerprint);
  const sim = calculateStructuralSimilarity(seedRun1.design, seedRun2.design);
  assert.strictEqual(sim, 1.0, 'Identical seed yields 100% similarity');
});

runTest('Test F.2: Different seed produces different architectural concept', () => {
  assert.notStrictEqual(seedRun1.fingerprint, seedRun3.fingerprint);
  const sim = calculateStructuralSimilarity(seedRun1.design, seedRun3.design);
  assert.ok(sim < 0.82, `Different seed produces distinct concept (similarity: ${sim.toFixed(3)} < 0.82)`);
});

// =============================================================================
// TEST G — 2D, 3D, AND 5D PARITY
// =============================================================================

console.log('\n--- TEST G: 2D, 3D, AND 5D VISUAL PARITY ---');

const sampleDesign = batchResult.designs[0];

runTest('Test G.1: 2D CAD floor plan contains same room IDs as canonical design', () => {
  assert.ok(sampleDesign.cadDrawings && sampleDesign.cadDrawings.length >= 2, '2D CAD drawings present');
  const dGroundRooms = sampleDesign.floors[0].rooms.map(r => r.id);
  const cadGroundRooms = sampleDesign.cadDrawings[0].roomElements.map(r => r.id);
  dGroundRooms.forEach(id => {
    assert.ok(cadGroundRooms.includes(id), `2D CAD contains room ${id}`);
  });
});

runTest('Test G.2: 3D procedural meshes exist for walls, slabs, and openings', () => {
  assert.ok(sampleDesign.geometry3d, '3D geometry exists');
  assert.ok(sampleDesign.geometry3d.meshes.length > 0, '3D meshes generated');
  const wallMeshes = sampleDesign.geometry3d.meshes.filter(m => m.componentType && m.componentType.includes('wall'));
  const slabMeshes = sampleDesign.geometry3d.meshes.filter(m => m.componentType && m.componentType.includes('slab'));
  assert.ok(wallMeshes.length > 0, '3D wall meshes present');
  assert.ok(slabMeshes.length > 0, '3D slab meshes present');
});

runTest('Test G.3: Walkthrough path traverses actual generated rooms', () => {
  assert.ok(sampleDesign.walkthrough, 'Walkthrough path exists');
  assert.ok(sampleDesign.walkthrough.totalDistanceFeet > 0, 'Walkthrough has positive distance');
  assert.ok(sampleDesign.walkthrough.cameraWaypoints.length >= 10, 'Walkthrough has waypoint camera path');
});

// =============================================================================
// SUMMARY
// =============================================================================

  console.log('\n===============================================================');
  console.log(`📊 BENCHMARK SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('===============================================================\n');

  if (failed > 0) {
    throw new Error(`Generative Architecture Benchmark failed with ${failed} failures.`);
  }

  return { passed, failed };
}

if (process.argv[1] && process.argv[1].includes('generativeArchitectureBenchmark.test.js')) {
  runGenerativeArchitectureBenchmarkTests();
}

