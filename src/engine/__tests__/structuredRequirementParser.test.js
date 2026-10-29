/**
 * LabourConnect Design Engine - Structured Requirement Parser Unit Tests
 * 
 * Verifies S1-T06 acceptance criteria:
 * 1. Complete representative prompts parse all entities (plot, floors, bedrooms, bathrooms, living, kitchen, parking, balcony).
 * 2. Units of measurement are strictly preserved (metres vs feet).
 * 3. Provenance classification correctly distinguishes EXPLICIT, INFERRED, DEFAULT, and MISSING.
 * 4. Missing plot dimensions are never silently invented (returns valid: false + missingInformation).
 * 5. Direct contradictions are detected and reported cleanly.
 * 6. Unsupported requests (skyscrapers, helipads, bunkers, malls) return structured errors.
 * 7. Negative requirements ("without kitchen", "no parking") are respected explicitly.
 */

import { parseStructuredRequirements, REQUIREMENT_SOURCE } from '../interpreter/structuredRequirementParser.js';
import { interpretRequirements } from '../interpreter/requirementInterpreter.js';

export function runParserTests() {
  console.log('===============================================================');
  console.log('LABOURCONNECT ENGINE: STRUCTURED REQUIREMENT PARSER TEST SUITE (S1-T06)');
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
  // TEST 1: Complete Representative User Prompt (Section 1 Vision)
  // "Design a modern two-floor house on a 30 ft × 40 ft plot with three bedrooms,
  //  two bathrooms, a living room, kitchen, parking, and a balcony."
  // -------------------------------------------------------------------------
  const visionPrompt = "Design a modern two-floor house on a 30 ft × 40 ft plot with three bedrooms, two bathrooms, a living room, kitchen, parking, and a balcony.";
  const res1 = parseStructuredRequirements(visionPrompt);

  assert(res1.valid === true, 'Test 1.1: Vision prompt is valid');
  assert(res1.requirements.plotWidth === 30, `Test 1.2: Plot width is 30 ft (got ${res1.requirements.plotWidth})`);
  assert(res1.requirements.plotLength === 40, `Test 1.3: Plot length is 40 ft (got ${res1.requirements.plotLength})`);
  assert(res1.requirements.inputUnits === 'feet', 'Test 1.4: Units preserved as feet');
  assert(res1.requirements.floorsCount === 2, `Test 1.5: Floor count is 2 (got ${res1.requirements.floorsCount})`);
  assert(res1.requirements.requiredBedrooms === 3, `Test 1.6: Bedroom count is 3 (got ${res1.requirements.requiredBedrooms})`);
  assert(res1.requirements.requiredBathrooms === 2, `Test 1.7: Bathroom count is 2 (got ${res1.requirements.requiredBathrooms})`);
  assert(res1.requirements.livingRoom === true, 'Test 1.8: Living room is true');
  assert(res1.requirements.kitchen === true, 'Test 1.9: Kitchen is true');
  assert(res1.requirements.parking === true, 'Test 1.10: Parking is true');
  assert(res1.requirements.balcony === true, 'Test 1.11: Balcony is true');
  assert(res1.provenance.plotWidth === REQUIREMENT_SOURCE.EXPLICIT, 'Test 1.12: Plot width is EXPLICIT');
  assert(res1.provenance.floorsCount === REQUIREMENT_SOURCE.EXPLICIT, 'Test 1.13: Floor count is EXPLICIT');
  assert(res1.provenance.requiredBedrooms === REQUIREMENT_SOURCE.EXPLICIT, 'Test 1.14: Bedroom count is EXPLICIT');
  assert(res1.provenance.requiredBathrooms === REQUIREMENT_SOURCE.EXPLICIT, 'Test 1.15: Bathroom count is EXPLICIT');

  // -------------------------------------------------------------------------
  // TEST 2: Metric Units Preservation
  // -------------------------------------------------------------------------
  const metricPrompt = "Modern villa on 12m x 20m plot with 4 bedrooms";
  const res2 = parseStructuredRequirements(metricPrompt);
  assert(res2.valid === true, 'Test 2.1: Metric prompt is valid');
  assert(res2.requirements.inputUnits === 'metres', 'Test 2.2: Preserves inputUnits as "metres"');
  assert(res2.requirements.plotWidth === 12, 'Test 2.3: Preserves metric plot width (12m)');
  assert(res2.requirements.plotLength === 20, 'Test 2.4: Preserves metric plot length (20m)');

  // -------------------------------------------------------------------------
  // TEST 3: Inferred Values (Duplex -> 2 Floors; Cents -> Area)
  // -------------------------------------------------------------------------
  const inferredPrompt = "Contemporary duplex on 3 cents plot with pooja room and car porch";
  const res3 = parseStructuredRequirements(inferredPrompt);
  assert(res3.valid === true, 'Test 3.1: Inferred duplex prompt is valid');
  assert(res3.requirements.floorsCount === 2, 'Test 3.2: "duplex" infers 2 floors');
  assert(res3.provenance.floorsCount === REQUIREMENT_SOURCE.INFERRED, 'Test 3.3: Provenance marked INFERRED for floorsCount');
  assert(res3.provenance.plotWidth === REQUIREMENT_SOURCE.INFERRED, 'Test 3.4: "3 cents" infers plot dimensions');
  assert(res3.requirements.plotWidth > 0 && res3.requirements.plotLength > 0, 'Test 3.5: Positive plot dimensions calculated from cents');

  // -------------------------------------------------------------------------
  // TEST 4: Missing Information Must Never Be Silently Invented
  // -------------------------------------------------------------------------
  const missingPlotPrompt = "I want a 3BHK house with parking and balcony";
  const res4 = parseStructuredRequirements(missingPlotPrompt);
  assert(res4.valid === false, 'Test 4.1: Missing plot dimensions correctly causes valid: false');
  assert(res4.missingInformation.length > 0, 'Test 4.2: missingInformation array populated');
  assert(res4.missingInformation.some(m => m.field === 'plotDimensions'), 'Test 4.3: Identifies plotDimensions as missing required field');
  assert(res4.provenance.plotWidth === REQUIREMENT_SOURCE.MISSING, 'Test 4.4: Plot width provenance marked MISSING');

  // Explicit opt-in fallback option
  const res4b = parseStructuredRequirements(missingPlotPrompt, { allowDefaultPlot: true });
  assert(res4b.valid === true, 'Test 4.5: With allowDefaultPlot opt-in, validation passes');
  assert(res4b.provenance.plotWidth === REQUIREMENT_SOURCE.DEFAULT, 'Test 4.6: Defaulted plot dimensions marked DEFAULT, not EXPLICIT');
  assert(res4b.warnings.length > 0, 'Test 4.7: Emits warning about defaulted plot');

  // -------------------------------------------------------------------------
  // TEST 5: Contradictory User Requirements
  // -------------------------------------------------------------------------
  // Contradiction A: Single floor AND duplex
  const contraPromptA = "Single floor house with G+2 duplex and 4 storeys on 30x40 plot";
  const res5a = parseStructuredRequirements(contraPromptA);
  assert(res5a.valid === false, 'Test 5.1: Contradictory floor specifications rejected');
  assert(res5a.contradictions.length > 0, 'Test 5.2: contradictions array populated');
  assert(res5a.contradictions.some(c => c.fields.includes('floorsCount')), 'Test 5.3: Identifies floorsCount contradiction');

  // Contradiction B: Object payload says 2 floors, prompt says G+3
  const contraObj = {
    userPrompt: "Modern G+3 mansion on 40x60 plot",
    floorsCount: 2
  };
  const res5b = parseStructuredRequirements(contraObj);
  assert(res5b.valid === false, 'Test 5.4: Payload vs Prompt contradiction detected');
  assert(res5b.errors.some(e => e.includes('Contradiction detected')), 'Test 5.5: Explicit error emitted');

  // Contradiction C: 0 Bathrooms for a 4BHK house
  const zeroBathPrompt = {
    userPrompt: "4BHK luxury house on 40x60 plot",
    bathroomsCount: 0
  };
  const res5c = parseStructuredRequirements(zeroBathPrompt);
  assert(res5c.valid === false, 'Test 5.6: Zero bathrooms for multi-bedroom rejected');
  assert(res5c.contradictions.some(c => c.fields.includes('requiredBathrooms')), 'Test 5.7: Sanitary code contradiction flagged');

  // -------------------------------------------------------------------------
  // TEST 6: Unsupported Requests
  // -------------------------------------------------------------------------
  const unsuppPrompt = "Build a 20-floor skyscraper with rooftop helipad and nuclear bunker on 40x60 plot";
  const res6 = parseStructuredRequirements(unsuppPrompt);
  assert(res6.valid === false, 'Test 6.1: Unsupported requests rejected');
  assert(res6.unsupportedRequests.length >= 2, `Test 6.2: Detected ${res6.unsupportedRequests.length} unsupported requests`);
  assert(res6.unsupportedRequests.some(u => u.request.includes('Skyscraper')), 'Test 6.3: Flags high-rise skyscraper request');
  assert(res6.unsupportedRequests.some(u => u.request.includes('Helipad')), 'Test 6.4: Flags helipad aviation request');
  assert(res6.unsupportedRequests.some(u => u.request.includes('Bunker')), 'Test 6.5: Flags bunker underground request');

  // -------------------------------------------------------------------------
  // TEST 7: Negative Explicit Requirements
  // -------------------------------------------------------------------------
  const negativePrompt = "3BHK house on 30x40 plot without kitchen and no parking";
  const res7 = parseStructuredRequirements(negativePrompt);
  assert(res7.valid === true, 'Test 7.1: Negative prompt is valid');
  assert(res7.requirements.kitchen === false, 'Test 7.2: kitchen is false');
  assert(res7.requirements.parking === false, 'Test 7.3: parking is false');
  assert(res7.provenance.kitchen === REQUIREMENT_SOURCE.EXPLICIT, 'Test 7.4: kitchen marked EXPLICIT');
  assert(res7.provenance.parking === REQUIREMENT_SOURCE.EXPLICIT, 'Test 7.5: parking marked EXPLICIT');

  // -------------------------------------------------------------------------
  // TEST 8: Pooja Room Exclusion & Precedence Regressions (Sprint 2 Pass)
  // -------------------------------------------------------------------------
  // 8.A: Explicit amenities.hasPooja = false excludes pooja
  const poojaA = parseStructuredRequirements({
    userPrompt: "3BHK house on 30x40 plot",
    amenities: { hasPooja: false }
  });
  assert(poojaA.requirements.pooja === false, 'Test 8.A: amenities.hasPooja=false sets requirements.pooja to false');
  assert(poojaA.provenance.pooja === REQUIREMENT_SOURCE.EXPLICIT, 'Test 8.A2: pooja provenance marked EXPLICIT');

  // 8.B: Explicit top-level hasPooja = false excludes pooja
  const poojaB = parseStructuredRequirements({
    userPrompt: "3BHK house on 30x40 plot",
    hasPooja: false
  });
  assert(poojaB.requirements.pooja === false, 'Test 8.B: top-level hasPooja=false sets requirements.pooja to false');

  // 8.C: Natural language "2BHK without pooja" excludes pooja
  const poojaC = parseStructuredRequirements("2BHK without pooja on 30x40 plot");
  assert(poojaC.requirements.pooja === false, 'Test 8.C: "without pooja" sets requirements.pooja to false');
  assert(poojaC.provenance.pooja === REQUIREMENT_SOURCE.EXPLICIT, 'Test 8.C2: "without pooja" provenance is EXPLICIT');

  // 8.D: Natural language "2BHK, no mandir" excludes pooja
  const poojaD = parseStructuredRequirements("2BHK, no mandir on 30x40 plot");
  assert(poojaD.requirements.pooja === false, 'Test 8.D: "no mandir" sets requirements.pooja to false');

  // 8.D2: Additional negative variations: "do not include a pooja room", "exclude the pooja room"
  const poojaD2 = parseStructuredRequirements("3BHK on 40x50 plot, do not include a pooja room");
  assert(poojaD2.requirements.pooja === false, 'Test 8.D2: "do not include a pooja room" excludes pooja');
  const poojaD3 = parseStructuredRequirements("3BHK on 40x50 plot, exclude the pooja room");
  assert(poojaD3.requirements.pooja === false, 'Test 8.D3: "exclude the pooja room" excludes pooja');

  // 8.E: Explicit amenities.hasPooja = true includes pooja
  const poojaE = parseStructuredRequirements({
    userPrompt: "3BHK house on 30x40 plot",
    amenities: { hasPooja: true }
  });
  assert(poojaE.requirements.pooja === true, 'Test 8.E: amenities.hasPooja=true sets requirements.pooja to true');

  // 8.F: Normal positive pooja request when no structured flag supplied
  const poojaF = parseStructuredRequirements("3BHK house on 30x40 plot with dedicated pooja room");
  assert(poojaF.requirements.pooja === true, 'Test 8.F: prompt with pooja room includes pooja');
  assert(poojaF.requirements.userConstraints.some(c => c.includes('Pooja')), 'Test 8.F2: userConstraints contains Pooja constraint');

  // 8.G: Contradictory natural language and structured flag (precedence check)
  const poojaG1 = parseStructuredRequirements({
    userPrompt: "3BHK house on 30x40 with beautiful pooja room",
    amenities: { hasPooja: false }
  });
  assert(poojaG1.requirements.pooja === false, 'Test 8.G1: structured hasPooja=false overrides positive prompt mention');
  assert(poojaG1.warnings.some(w => w.includes('hasPooja=false')), 'Test 8.G2: Emits validation warning for pooja contradiction');

  const poojaG2 = parseStructuredRequirements({
    userPrompt: "3BHK house on 30x40 without pooja",
    amenities: { hasPooja: true }
  });
  assert(poojaG2.requirements.pooja === true, 'Test 8.G3: structured hasPooja=true overrides negative prompt exclusion');
  assert(poojaG2.warnings.some(w => w.includes('hasPooja=true')), 'Test 8.G4: Emits validation warning for pooja override');

  // -------------------------------------------------------------------------
  // TEST 9: Floor Count Contradiction Regressions (Sprint 2 Pass)
  // -------------------------------------------------------------------------
  // 9.A: "single-floor duplex" is identified as contradictory
  const contra9A = parseStructuredRequirements("single-floor duplex on 30x40 plot");
  assert(contra9A.valid === false, 'Test 9.A: "single-floor duplex" is detected as contradictory');
  assert(contra9A.contradictions.some(c => c.fields.includes('floorsCount')), 'Test 9.A2: floorsCount contradiction flagged');

  // 9.B: "single floor duplex" is identified as contradictory
  const contra9B = parseStructuredRequirements("single floor duplex on 30x40 plot");
  assert(contra9B.valid === false, 'Test 9.B: "single floor duplex" is detected as contradictory');

  // 9.B2: "single-storey duplex" is identified as contradictory
  const contra9B2 = parseStructuredRequirements("single-storey duplex on 30x40 plot");
  assert(contra9B2.valid === false, 'Test 9.B2: "single-storey duplex" is detected as contradictory');

  // 9.C: Structured floorsCount: 1 combined with duplex is contradictory
  const contra9C = parseStructuredRequirements({
    userPrompt: "Modern duplex villa on 30x40 plot",
    floorsCount: 1
  });
  assert(contra9C.valid === false, 'Test 9.C: floorsCount: 1 vs prompt duplex detected as contradictory');
  assert(contra9C.contradictions.some(c => c.fields.includes('floorsCount')), 'Test 9.C2: floorsCount contradiction flagged');

  // 9.D: Valid single-floor house is accepted
  const validSingle = parseStructuredRequirements("single-floor 2BHK on 30x40 plot");
  assert(validSingle.valid === true, 'Test 9.D: Valid single-floor house accepted');
  assert(validSingle.requirements.floorsCount === 1, 'Test 9.D2: floorsCount is 1');
  assert(validSingle.contradictions.length === 0, 'Test 9.D3: No contradictions for valid single-floor');

  // 9.E: Valid duplex or multistory request accepted when no conflicting one-floor constraint
  const validDuplex = parseStructuredRequirements("Contemporary duplex on 30x40 plot");
  assert(validDuplex.valid === true, 'Test 9.E: Valid duplex accepted');
  assert(validDuplex.requirements.floorsCount === 2, 'Test 9.E2: duplex parsed as 2 floors');

  // 9.F: Parser does not produce false positives for unrelated text
  const unrelatedText = parseStructuredRequirements("Spacious 3BHK on 30x40 plot with double height ceiling and wooden floor");
  assert(unrelatedText.valid === true, 'Test 9.F: Unrelated text does not trigger false positive contradiction');
  assert(unrelatedText.contradictions.length === 0, 'Test 9.F2: Zero contradictions for unrelated text');

  // -------------------------------------------------------------------------
  // TEST 10: Parking & Balcony Negation and Precedence Regressions
  // -------------------------------------------------------------------------
  // 10.A: "do not include parking" sets parking: false
  const park10A = parseStructuredRequirements("3BHK on 30x40 plot, do not include parking");
  assert(park10A.requirements.parking === false, 'Test 10.A: "do not include parking" correctly sets parking: false');

  // 10.B: "exclude car porch" sets parking: false
  const park10B = parseStructuredRequirements("2BHK on 30x40 plot, exclude car porch");
  assert(park10B.requirements.parking === false, 'Test 10.B: "exclude car porch" correctly sets parking: false');

  // 10.C: Structured hasParking=false overrides prompt mention
  const park10C = parseStructuredRequirements({
    userPrompt: "3BHK on 30x40 plot with covered car parking",
    hasParking: false
  });
  assert(park10C.requirements.parking === false, 'Test 10.C: Structured hasParking=false overrides prompt positive mention');
  assert(park10C.warnings.some(w => w.includes('hasParking=false')), 'Test 10.C2: Warning emitted for parking override');

  // 10.D: "do not include a balcony" sets balcony: false
  const balc10D = parseStructuredRequirements("duplex on 30x40 plot, do not include a balcony");
  assert(balc10D.requirements.balcony === false, 'Test 10.D: "do not include a balcony" correctly sets balcony: false');

  // 10.E: Structured hasBalcony=false overrides prompt mention
  const balc10E = parseStructuredRequirements({
    userPrompt: "Duplex villa on 30x40 plot with cantilever balcony",
    hasBalcony: false
  });
  assert(balc10E.requirements.balcony === false, 'Test 10.E: Structured hasBalcony=false overrides prompt positive mention');
  assert(balc10E.warnings.some(w => w.includes('hasBalcony=false')), 'Test 10.E2: Warning emitted for balcony override');

  // 10.F: Positive parking and balcony continue to work
  const posParkBalc = parseStructuredRequirements("3BHK on 30x40 plot with car parking and balcony");
  assert(posParkBalc.requirements.parking === true, 'Test 10.F: Positive parking recognized');
  assert(posParkBalc.requirements.balcony === true, 'Test 10.F2: Positive balcony recognized');

  // -------------------------------------------------------------------------
  // TEST 11: Interpreter Unification and Semantic Decision Parity
  // -------------------------------------------------------------------------
  // 11.A: Negative parking parity across structured parser and interpreter
  const pCase1 = "2BHK on 30x40, do not include parking";
  const pCase2 = "2BHK on 30x40, exclude car porch";
  const pParse1 = parseStructuredRequirements(pCase1);
  const pInterp1 = interpretRequirements({ userPrompt: pCase1, plotWidth: 30, plotLength: 40 });
  const pParse2 = parseStructuredRequirements(pCase2);
  const pInterp2 = interpretRequirements({ userPrompt: pCase2, plotWidth: 30, plotLength: 40 });
  assert(pParse1.requirements.parking === false && pInterp1.specs.amenities.hasParking === false, 'Test 11.A1: "do not include parking" parity (both false)');
  assert(pParse2.requirements.parking === false && pInterp2.specs.amenities.hasParking === false, 'Test 11.A2: "exclude car porch" parity (both false)');

  // 11.B: Negative balcony parity across structured parser and interpreter
  const bCase1 = "2BHK two-storey on 30x40 without balcony";
  const bCase2 = "2BHK two-storey on 30x40, balcony is not required";
  const bParse1 = parseStructuredRequirements(bCase1);
  const bInterp1 = interpretRequirements({ userPrompt: bCase1, plotWidth: 30, plotLength: 40, floorsCount: 2 });
  const bParse2 = parseStructuredRequirements(bCase2);
  const bInterp2 = interpretRequirements({ userPrompt: bCase2, plotWidth: 30, plotLength: 40, floorsCount: 2 });
  assert(bParse1.requirements.balcony === false && bInterp1.specs.amenities.hasBalcony === false, 'Test 11.B1: "without balcony" parity (both false)');
  assert(bParse2.requirements.balcony === false && bInterp2.specs.amenities.hasBalcony === false, 'Test 11.B2: "balcony is not required" parity (both false)');

  // 11.C: Positive parking and balcony parity
  const posPrompt = "3BHK on 30x40 with car parking and balcony";
  const posParse = parseStructuredRequirements(posPrompt);
  const posInterp = interpretRequirements({ userPrompt: posPrompt, plotWidth: 30, plotLength: 40 });
  assert(posParse.requirements.parking === true && posInterp.specs.amenities.hasParking === true, 'Test 11.C1: Positive parking parity (both true)');
  assert(posParse.requirements.balcony === true && posInterp.specs.amenities.hasBalcony === true, 'Test 11.C2: Positive balcony parity (both true)');

  // 11.D: Explicit top-level boolean false override parity
  const overPark = { userPrompt: "3BHK with parking on 30x40", plotWidth: 30, plotLength: 40, hasParking: false };
  const overBalc = { userPrompt: "2BHK with balcony on 30x40", plotWidth: 30, plotLength: 40, hasBalcony: false };
  const overParkParse = parseStructuredRequirements(overPark);
  const overParkInterp = interpretRequirements(overPark);
  const overBalcParse = parseStructuredRequirements(overBalc);
  const overBalcInterp = interpretRequirements(overBalc);
  assert(overParkParse.requirements.parking === false && overParkInterp.specs.amenities.hasParking === false, 'Test 11.D1: Top-level hasParking=false override parity');
  assert(overBalcParse.requirements.balcony === false && overBalcInterp.specs.amenities.hasBalcony === false, 'Test 11.D2: Top-level hasBalcony=false override parity');

  // 11.E: Nested amenities boolean false override parity
  const nestedOver = { userPrompt: "3BHK with parking and balcony on 30x40", plotWidth: 30, plotLength: 40, amenities: { hasParking: false, hasBalcony: false } };
  const nestParse = parseStructuredRequirements(nestedOver);
  const nestInterp = interpretRequirements(nestedOver);
  assert(nestParse.requirements.parking === false && nestInterp.specs.amenities.hasParking === false, 'Test 11.E1: Nested hasParking=false parity');
  assert(nestParse.requirements.balcony === false && nestInterp.specs.amenities.hasBalcony === false, 'Test 11.E2: Nested hasBalcony=false parity');

  // 11.F: Warning preservation on override
  assert(overParkInterp.warnings.some(w => w.includes('hasParking=false')), 'Test 11.F1: Interpreter forwards parking override warning from parser');
  assert(overBalcInterp.warnings.some(w => w.includes('hasBalcony=false')), 'Test 11.F2: Interpreter forwards balcony override warning from parser');

  // 11.G: Pooja room parity
  const poojaNeg = "2BHK without pooja on 30x40";
  const poojaPos = "2BHK with pooja on 30x40";
  assert(parseStructuredRequirements(poojaNeg).requirements.pooja === false && interpretRequirements({ userPrompt: poojaNeg, plotWidth: 30, plotLength: 40 }).specs.amenities.hasPooja === false, 'Test 11.G1: Pooja negative parity');
  assert(parseStructuredRequirements(poojaPos).requirements.pooja === true && interpretRequirements({ userPrompt: poojaPos, plotWidth: 30, plotLength: 40 }).specs.amenities.hasPooja === true, 'Test 11.G2: Pooja positive parity');

  console.log('\n===============================================================');
  console.log(`STRUCTURED REQUIREMENT PARSER TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('===============================================================\n');

  if (failed > 0) {
    if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
      process.exit(1);
    }
    throw new Error(`${failed} parser tests failed.`);
  }
  return { passed, failed };
}

// Allow direct CLI execution
if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
  runParserTests();
}
