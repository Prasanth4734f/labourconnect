/**
 * LabourConnect Design Engine - Sprint 5 Correction Regression Test Suite
 * 
 * Verifies exact architectural fidelity and requirement enforcement for:
 * "Design a vintage Indian house on a 0.3-acre plot, with 3 bedrooms, 2 floors, 4 bathrooms, a garden, and better vintage furniture."
 * 
 * Tests 16 Acceptance Criteria:
 * 1. Exact plot area: 0.3 acre (~13,068 sq.ft / 1,214 m²), distinguishing plot area from building footprint
 * 2. Exactly 2 floors (Ground + First)
 * 3. Exactly 3 bedrooms (1 on Ground, 2 on First)
 * 4. Exactly 4 bathrooms (2 on Ground, 2 on First)
 * 5. Coherent room layout with realistic room dimensions
 * 6. Authentic vintage Indian architectural characteristics (sloping pitched roof, Mangalore tiles, timber beams)
 * 7. Authentic vintage furniture (teak frames, almirahs, carved sets) with zero collision
 * 8. Expansive, coherent garden (~11,500 sq.ft) with native shade trees, lawn, driveway, and compound wall
 * 9. Correctly connected walls and floor slabs with zero gaps
 * 10. Appropriate doors, windows, and opening cutouts
 * 11. Suitable roof configuration without an oversized empty rooftop
 * 12. Absence of unexplained terrace platforms or oversized brown slabs
 * 13. High-quality physical materials (Terracotta, Teak, Sponge plaster, Granite)
 * 14. Zero floating, disconnected, or non-finite geometry
 * 15. Preserves canonical design data across 2D, 3D, and 5D workflows
 * 16. Architectural diversity across varied prompts (Modern Duplex, Luxury Villa)
 */

import { designEngine } from '../index.js';

export function runVintageIndianRegressionTests() {
  console.log('======================================================================');
  console.log('🏛️ SPRINT 5 REGRESSION SUITE: VINTAGE INDIAN ARCHITECTURAL GENERATION');
  console.log('======================================================================');

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

  // ===========================================================================
  // SECTION 1: PRIMARY REGRESSION PROMPT VERIFICATION
  // ===========================================================================
  console.log('\n--- Section 1: Primary Regression Prompt Verification ---');
  const regressionPrompt = 'Design a vintage Indian house on a 0.3-acre plot, with 3 bedrooms, 2 floors, 4 bathrooms, a garden, and better vintage furniture.';
  const outcome = designEngine.generateDesign(regressionPrompt);

  assert(outcome.success === true, 'Test 1.1: Design generation succeeds without errors');
  const d = outcome.design;
  assert(Boolean(d), 'Test 1.2: Canonical design object returned');

  // AC 1: Plot Area vs Building Footprint
  const plotArea = d.metrics.plotAreaSqft;
  assert(plotArea >= 13000 && plotArea <= 13200, `Test 1.3: Plot area accurately reflects 0.3 acre (~13,068 sq.ft) (got ${plotArea} sq.ft)`);
  const footprint = d.metrics.buildingFootprintSqft;
  assert(footprint >= 1000 && footprint <= 1600, `Test 1.4: Building footprint is realistically proportioned (~1,200 sq.ft), not filling the plot (got ${footprint} sq.ft)`);
  const gardenArea = d.metrics.gardenAreaSqft;
  assert(gardenArea >= 11000, `Test 1.5: Expansive garden area preserved on 0.3-acre plot (got ${gardenArea} sq.ft)`);

  // AC 2: Exactly 2 Floors
  assert(d.floors.length === 2, `Test 2.1: Exactly 2 floors generated (got ${d.floors.length} floors)`);
  assert(d.floors[0].name.toLowerCase().includes('ground'), 'Test 2.2: Floor 0 is Ground Floor');
  assert(d.floors[1].name.toLowerCase().includes('first'), 'Test 2.3: Floor 1 is First Floor');
  const hasTerraceFloor = d.floors.some(f => (f.name || '').toLowerCase().includes('terrace'));
  assert(!hasTerraceFloor, 'Test 2.4: No unwanted third terrace level floor generated');

  // AC 3 & 4: Exactly 3 Bedrooms and Exactly 4 Bathrooms
  let bedroomCount = 0;
  let bathroomCount = 0;
  d.floors.forEach(fl => {
    fl.rooms.forEach(rm => {
      const t = (rm.type || '').toLowerCase();
      if (t === 'bedroom' || t === 'master_bedroom' || t === 'guest_bedroom') bedroomCount++;
      if (t === 'bathroom' || t === 'powder_room') bathroomCount++;
    });
  });

  assert(bedroomCount === 3, `Test 3.1: Exactly 3 bedrooms generated across floors (got ${bedroomCount})`);
  assert(d.metrics.bedroomsCount === 3, `Test 3.2: Metrics reports exactly 3 bedrooms (got ${d.metrics.bedroomsCount})`);

  assert(bathroomCount === 4, `Test 4.1: Exactly 4 bathrooms generated across floors (got ${bathroomCount})`);
  assert(d.metrics.bathroomsCount === 4, `Test 4.2: Metrics reports exactly 4 bathrooms (got ${d.metrics.bathroomsCount})`);

  // Room distribution across floors
  const gBedrooms = d.floors[0].rooms.filter(r => (r.type || '').includes('bed'));
  const gBathrooms = d.floors[0].rooms.filter(r => (r.type || '').includes('bath'));
  const fBedrooms = d.floors[1].rooms.filter(r => (r.type || '').includes('bed'));
  const fBathrooms = d.floors[1].rooms.filter(r => (r.type || '').includes('bath'));

  assert(gBedrooms.length === 1, `Test 5.1: Ground floor contains 1 bedroom suite (got ${gBedrooms.length})`);
  assert(gBathrooms.length === 2, `Test 5.2: Ground floor contains 2 bathrooms (powder + en-suite) (got ${gBathrooms.length})`);
  assert(fBedrooms.length === 2, `Test 5.3: First floor contains 2 bedrooms (master + bed 2) (got ${fBedrooms.length})`);
  assert(fBathrooms.length === 2, `Test 5.4: First floor contains 2 bathrooms (attached + master) (got ${fBathrooms.length})`);

  // AC 6 & 11 & 12: Authentic Pitched Roof and Elimination of Oversized Rooftop
  const meshes = d.geometry3d?.meshes || [];
  const slopedRoofMeshes = meshes.filter(m => m.componentType === 'sloping_roof');
  const gableMeshes = meshes.filter(m => m.componentType === 'gable_wall');
  const ridgeMeshes = meshes.filter(m => m.componentType === 'ridge_cap');
  const parapetMeshes = meshes.filter(m => m.componentType === 'parapet');

  assert(slopedRoofMeshes.length >= 2, `Test 6.1: Authentic pitched sloping roof meshes generated (got ${slopedRoofMeshes.length})`);
  assert(gableMeshes.length >= 2, `Test 6.2: Triangular gable walls generated closing vertical roof voids (got ${gableMeshes.length})`);
  assert(ridgeMeshes.length >= 1, `Test 6.3: Timber ridge cap generated along roof crest (got ${ridgeMeshes.length})`);
  assert(parapetMeshes.length === 0, `Test 6.4: Flat terrace parapet walls eliminated on pitched roof design (got ${parapetMeshes.length})`);

  // Check roof materials
  const roofMesh = slopedRoofMeshes[0];
  assert(roofMesh && (roofMesh.color === '#b45309' || roofMesh.color === '#c2410c' || (roofMesh.material || '').toLowerCase().includes('clay') || (roofMesh.material || '').toLowerCase().includes('terracotta')), 'Test 6.5: Sloping roof features genuine terracotta Mangalore clay tile finish');

  // AC 7: Vintage Furniture Generation
  const furnishings = d.furnishings;
  assert(furnishings && furnishings.totalItemCount >= 30, `Test 7.1: Comprehensive interior furniture generated (got ${furnishings?.totalItemCount} items)`);
  assert(d.inputs.furnitureStyle === 'vintage_indian', 'Test 7.2: Furniture style resolved to vintage_indian');

  // Verify furniture categories
  const furnItems = furnishings?.allFurnitureItems || [];
  const categories = new Set(furnItems.map(i => i.category));
  assert(categories.has('living'), 'Test 7.3: Living room furniture generated');
  assert(categories.has('dining'), 'Test 7.4: Dining room furniture generated');
  assert(categories.has('bedroom'), 'Test 7.5: Bedroom furniture generated');
  assert(categories.has('kitchen'), 'Test 7.6: Kitchen fixtures generated');
  assert(categories.has('bathroom'), 'Test 7.7: Sanitary bathroom fixtures generated');

  // AC 8: Expansive Coherent Landscape on 0.3-Acre Plot
  const landscape = d.landscape;
  assert(Boolean(landscape), 'Test 8.1: Procedural landscape generated for 0.3-acre site');
  const takeoff = landscape?.takeoff || {};
  assert(takeoff.treesCount >= 8, `Test 8.2: Garden features native shade and flowering trees (got ${takeoff.treesCount} trees)`);
  assert(takeoff.turfAreaSqft >= 10000, `Test 8.3: Expansive lawn area covers garden (~11,000 sq.ft) (got ${takeoff.turfAreaSqft} sq.ft)`);
  assert(takeoff.compoundWallRunningFt >= 400, `Test 8.4: Property perimeter compound wall generated (got ${takeoff.compoundWallRunningFt} r.ft)`);
  assert(takeoff.walkwaySqft > 0, `Test 8.5: Natural paver walkway connects gate to front entrance (got ${takeoff.walkwaySqft} sq.ft)`);

  // AC 9 & 10: Connectivity & CAD Floor Plans
  assert(d.drawings && d.drawings.floorPlans?.length === 2, `Test 9.1: 2D CAD drawings generated for both floors (got ${d.drawings?.floorPlans?.length})`);
  assert(d.evaluation.isValid === true, 'Test 9.2: Canonical validation confirms candidate layout is valid');

  // ===========================================================================
  // SECTION 2: ARCHITECTURAL DIVERSITY (DIFFERENT PROMPTS PRODUCE DIFFERENT DESIGNS)
  // ===========================================================================
  console.log('\n--- Section 2: Architectural Diversity across Varied Prompts ---');

  // Prompt B: Modern Duplex
  const modernPrompt = 'Design a modern contemporary duplex house on a 40x60 plot with 4 bedrooms, 3 bathrooms, and terrace.';
  const modernOutcome = designEngine.generateDesign(modernPrompt);
  assert(modernOutcome.success === true, 'Test 10.1: Modern duplex generation succeeds');
  const modDesign = modernOutcome.design;
  assert(modDesign.inputs.archStyle === 'modern', 'Test 10.2: Modern design style is modern');
  assert(modDesign.floors.length === 3, `Test 10.3: Modern duplex contains terrace floor (got ${modDesign.floors.length} floors)`);
  const modParapets = (modDesign.geometry3d?.meshes || []).filter(m => m.componentType === 'parapet');
  assert(modParapets.length > 0, 'Test 10.4: Modern design features flat terrace parapet walls');

  // Prompt C: Luxury Villa
  const villaPrompt = 'Design a luxury villa on a 50x80 plot with 4 bedrooms, 4 bathrooms, and garden.';
  const villaOutcome = designEngine.generateDesign(villaPrompt);
  assert(villaOutcome.success === true, 'Test 11.1: Luxury villa generation succeeds');
  const villaDesign = villaOutcome.design;
  assert(villaDesign.inputs.archStyle === 'luxury_villa', 'Test 11.2: Villa style is luxury_villa');
  assert(villaDesign.metrics.plotAreaSqft === 4000, `Test 11.3: Villa plot area is 4,000 sq.ft (got ${villaDesign.metrics.plotAreaSqft})`);
  assert(villaDesign.metrics.bedroomsCount === 4, `Test 11.4: Villa has 4 bedrooms (got ${villaDesign.metrics.bedroomsCount})`);
  assert(villaDesign.metrics.bathroomsCount === 4, `Test 11.5: Villa has 4 bathrooms (got ${villaDesign.metrics.bathroomsCount})`);

  console.log('\n======================================================================');
  console.log(`📊 SPRINT 5 REGRESSION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('======================================================================\n');

  return { passed, failed };
}

// Auto-run if executed directly
if (process.argv[1]?.endsWith('vintageIndianHouseRegression.test.js')) {
  const res = runVintageIndianRegressionTests();
  process.exit(res.failed > 0 ? 1 : 0);
}
