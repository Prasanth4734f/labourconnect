/**
 * LabourConnect Design Engine - Procedural Electrical Engine Test Suite
 * 
 * Verifies procedural 3D electrical appliances & lighting generation:
 * - Ceiling Fans: Hub, downrod, and 3 angled aerodynamic rotor blades.
 * - Split AC Units: High-wall indoor chassis, louver slot, and LED indicator.
 * - Architectural Lighting: Multi-tier chandeliers, recessed ceiling spots, vanity bars, gate lanterns.
 * - Main Distribution Board: 12-way MCB electrical panel with breakers.
 * - Category Tagging, Immutability, and Determinism.
 */

import assert from 'node:assert';
import { generatePropertyElectrical } from '../electrical/proceduralElectricalGenerator.js';
import { generateLayoutCandidate } from '../generator/layoutGenerator.js';

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

export function runProceduralElectricalEngineTests() {
  console.log('\n===============================================================');
  console.log('LABOURCONNECT 3D ENGINE: PROCEDURAL ELECTRICAL & LIGHTING');
  console.log('===============================================================');

  const duplexDesign = generateLayoutCandidate({
    plotWidth: 30,
    plotLength: 50,
    floorsCount: 2,
    bhkCount: 3,
    hasBalcony: true
  });

  const singleStoreyDesign = generateLayoutCandidate({
    plotWidth: 30,
    plotLength: 40,
    floorsCount: 1,
    bhkCount: 2
  });

  // --- Group 1: Robust Input Handling & Schema ---
  console.log('\n--- Group 1: Robust Input Handling & Schema ---');

  runTest('Test 1: Gracefully handles null / undefined design inputs', () => {
    const res = generatePropertyElectrical(null);
    assert.strictEqual(res.totalCount, 0);
    assert.strictEqual(res.meshes.length, 0);
  });

  runTest('Test 2: Generates non-empty electrical appliances for valid design', () => {
    const res = generatePropertyElectrical(singleStoreyDesign);
    assert.ok(res.totalCount > 0, `Generated ${res.totalCount} electrical meshes`);
    assert.ok(res.appliances.length > 0, `Generated ${res.appliances.length} itemized appliances`);
  });

  // --- Group 2: Ceiling Fans & Rotor Blades ---
  console.log('\n--- Group 2: Ceiling Fans & Rotor Blades ---');

  runTest('Test 3: Ceiling fans are generated in bedrooms and living areas', () => {
    const res = generatePropertyElectrical(duplexDesign);
    const fans = res.appliances.filter(a => a.type === 'ceiling_fan');
    assert.ok(fans.length >= 3, `Expected at least 3 ceiling fans across 3BHK, found ${fans.length}`);
    assert.ok(res.countsByType.ceilingFans >= 3);
  });

  runTest('Test 4: Ceiling fan mesh contains motor hub, downrod, and 3 angled blades', () => {
    const res = generatePropertyElectrical(duplexDesign);
    const fanMeshes = res.meshes.filter(m => m.componentType === 'ceiling_fan' || m.id.includes('fan_'));
    const hubs = fanMeshes.filter(m => m.id.includes('motor_hub'));
    const downrods = fanMeshes.filter(m => m.id.includes('downrod'));
    const blades = fanMeshes.filter(m => m.id.includes('blade'));

    assert.ok(hubs.length > 0, 'Motor hub meshes present');
    assert.ok(downrods.length > 0, 'Downrod meshes present');
    assert.ok(blades.length >= hubs.length * 3, `Expected at least 3 blades per hub, found ${blades.length}`);
  });

  // --- Group 3: Air Conditioners (Split AC) ---
  console.log('\n--- Group 3: Air Conditioners (Split AC) ---');

  runTest('Test 5: Split AC indoor units are placed in living room and bedrooms', () => {
    const res = generatePropertyElectrical(duplexDesign);
    const acs = res.appliances.filter(a => a.type === 'air_conditioner');
    assert.ok(acs.length >= 2, `Expected at least 2 split AC units, found ${acs.length}`);
  });

  runTest('Test 6: Split AC unit geometry has realistic width and wall mounting height', () => {
    const res = generatePropertyElectrical(duplexDesign);
    const acBodies = res.meshes.filter(m => m.id.includes('ac_') && m.id.includes('body'));
    assert.ok(acBodies.length > 0);
    const firstAc = acBodies[0];
    assert.strictEqual(firstAc.dimensions.width, 3.2, 'Standard 3.2 ft wide indoor split AC unit');
    assert.ok(firstAc.bounds.min[1] > 8.0, 'Mounted high on wall near ceiling');
  });

  // --- Group 4: Architectural Lighting Fixtures ---
  console.log('\n--- Group 4: Architectural Lighting Fixtures ---');

  runTest('Test 7: Grand chandelier / pendant luminaire is placed in living room', () => {
    const res = generatePropertyElectrical(duplexDesign);
    const chandeliers = res.meshes.filter(m => m.type.includes('chandelier') || m.id.includes('chandelier'));
    assert.ok(chandeliers.length >= 1, 'Chandelier mesh present in living room');
  });

  runTest('Test 8: Kitchen receives ceiling light and exhaust ventilation fan', () => {
    const res = generatePropertyElectrical(duplexDesign);
    const kitLight = res.meshes.filter(m => m.id.includes('light_kitchen'));
    const kitExhaust = res.meshes.filter(m => m.id.includes('exhaust_kitchen'));
    assert.ok(kitLight.length >= 1, 'Kitchen ceiling panel luminaire present');
    assert.ok(kitExhaust.length >= 1, 'Kitchen exhaust fan present');
  });

  runTest('Test 9: Entrance gate receives twin brass pillar lanterns', () => {
    const res = generatePropertyElectrical(duplexDesign);
    const gateLanterns = res.meshes.filter(m => m.id.includes('entrance_pillar'));
    assert.strictEqual(gateLanterns.length, 2, '2 Gate pillar lanterns placed at entrance');
  });

  // --- Group 5: Main Distribution Board (MCB Panel) ---
  console.log('\n--- Group 5: Main Distribution Board (MCB Panel) ---');

  runTest('Test 10: 12-way MCB distribution board is placed on ground floor near entry', () => {
    const res = generatePropertyElectrical(duplexDesign);
    const mcb = res.appliances.find(a => a.type === 'electrical_panel');
    assert.ok(mcb !== undefined, 'Main MCB distribution board appliance present');
    assert.strictEqual(mcb.floorIndex, 0, 'Placed on ground floor');
    assert.strictEqual(mcb.isSafetyBreaker, true);
  });

  // --- Group 6: Immutability & Determinism ---
  console.log('\n--- Group 6: Immutability & Determinism ---');

  runTest('Test 11: All meshes have isElectrical: true and category: electrical_appliances', () => {
    const res = generatePropertyElectrical(duplexDesign);
    const allValid = res.meshes.every(m => m.isElectrical === true && m.category === 'electrical_appliances');
    assert.ok(allValid, 'All meshes strictly tagged with isElectrical: true and category: electrical_appliances');
  });

  runTest('Test 12: Input canonical design is strictly unmutated', () => {
    const snapshot = JSON.stringify(duplexDesign);
    generatePropertyElectrical(duplexDesign);
    assert.strictEqual(JSON.stringify(duplexDesign), snapshot, 'Input canonical design remained completely unmutated');
  });

  runTest('Test 13: Generation is 100% deterministic across repeated calls', () => {
    const res1 = generatePropertyElectrical(duplexDesign);
    const res2 = generatePropertyElectrical(duplexDesign);
    assert.strictEqual(res1.meshes.length, res2.meshes.length);
    assert.strictEqual(res1.appliances.length, res2.appliances.length);
  });

  console.log('\n===============================================================');
  console.log(`ELECTRICAL ENGINE TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('===============================================================');

  if (failed > 0) {
    throw new Error(`Electrical engine tests failed with ${failed} failures.`);
  }

  return { passed, failed };
}

// Direct execution runner
if (process.argv[1]?.endsWith('proceduralElectricalEngine.test.js')) {
  runProceduralElectricalEngineTests();
}
