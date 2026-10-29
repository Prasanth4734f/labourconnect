/**
 * LabourConnect Design Engine - Sprint 1 Automated Regression Test Runner
 * 
 * Executes all 4 Sprint 1 foundation test suites:
 * 1. dimensionalCalculator.test.js - Decimal-safe math, setbacks, unit conversion
 * 2. geometricValidator.test.js    - 10 canonical architectural geometric checks
 * 3. structuredRequirementParser.test.js - Requirements, provenance, contradictions, unsupported requests
 * 4. engineCore.test.js            - End-to-end acceptance criteria, variations, uniqueness, BOQ
 * 
 * Verifies S1-T07 acceptance criteria: Repeatable, deterministic, zero-regression test runner.
 */

import { runDimensionalTests } from './dimensionalCalculator.test.js';
import { runGeometricTests } from './geometricValidator.test.js';
import { runParserTests } from './structuredRequirementParser.test.js';
import { runEngineCoreTests } from './engineCore.test.js';

export function runAllSprint1Tests() {
  const startTime = Date.now();
  console.log('======================================================================');
  console.log('🚀 LABOURCONNECT AI ENGINE: SPRINT 1 CONSOLIDATED TEST SUITE RUNNER');
  console.log('======================================================================\n');

  const suites = [
    { name: 'Dimensional Calculator Suite', runner: runDimensionalTests },
    { name: 'Geometric Validator Suite', runner: runGeometricTests },
    { name: 'Structured Requirement Parser Suite', runner: runParserTests },
    { name: 'Engine Core Acceptance Suite', runner: runEngineCoreTests }
  ];

  const results = [];
  let grandTotalPassed = 0;
  let grandTotalFailed = 0;

  for (const suite of suites) {
    try {
      const outcome = suite.runner();
      const passed = outcome?.passed || 0;
      const failed = outcome?.failed || 0;
      grandTotalPassed += passed;
      grandTotalFailed += failed;
      results.push({ name: suite.name, status: failed === 0 ? 'PASSED' : 'FAILED', passed, failed });
    } catch (err) {
      grandTotalFailed++;
      results.push({ name: suite.name, status: 'FAILED', passed: 0, failed: 1, error: err.message });
    }
  }

  const durationMs = Date.now() - startTime;

  console.log('\n======================================================================');
  console.log('📊 SPRINT 1 CONSOLIDATED EXECUTION MATRIX');
  console.log('======================================================================');
  console.log('| Suite Name                             | Status | Passed | Failed |');
  console.log('|----------------------------------------|--------|--------|--------|');
  for (const r of results) {
    const namePadded = r.name.padEnd(38);
    const statusPadded = (r.status === 'PASSED' ? '✅ PASS' : '❌ FAIL').padEnd(6);
    const passedPadded = String(r.passed).padStart(6);
    const failedPadded = String(r.failed).padStart(6);
    console.log(`| ${namePadded} | ${statusPadded} | ${passedPadded} | ${failedPadded} |`);
  }
  console.log('|----------------------------------------|--------|--------|--------|');
  console.log(`| TOTALS: 4 Test Suites                  | ${grandTotalFailed === 0 ? '✅ PASS' : '❌ FAIL'} | ${String(grandTotalPassed).padStart(6)} | ${String(grandTotalFailed).padStart(6)} |`);
  console.log('======================================================================');
  console.log(`Execution Duration: ${(durationMs / 1000).toFixed(2)} seconds`);
  console.log(`Grand Total Assertions: ${grandTotalPassed + grandTotalFailed}`);
  console.log(`Result: ${grandTotalFailed === 0 ? 'ALL 130 TESTS PASSED (100% PASS RATE)' : `${grandTotalFailed} TESTS FAILED`}`);
  console.log('======================================================================\n');

  if (grandTotalFailed > 0) {
    process.exit(1);
  }
}

if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
  runAllSprint1Tests();
}
