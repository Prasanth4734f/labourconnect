/**
 * LabourConnect Design Engine - Comprehensive Automated Test Runner
 * 
 * Executes all test suites across Sprint 1 Foundation and Sprint 2 Original Layout Generation:
 * 
 * Sprint 1:
 * - dimensionalCalculator.test.js
 * - geometricValidator.test.js
 * - structuredRequirementParser.test.js
 * - engineCore.test.js
 * 
 * Sprint 2:
 * - layoutRequirementsContract.test.js (S2-T01)
 * - (more to be added as tasks complete: roomProgrammer, adjacencyGraphSolver, layoutGenerator, etc.)
 */

import { runDimensionalTests } from './dimensionalCalculator.test.js';
import { runGeometricTests } from './geometricValidator.test.js';
import { runParserTests } from './structuredRequirementParser.test.js';
import { runEngineCoreTests } from './engineCore.test.js';
import { runLayoutRequirementsTests } from './layoutRequirementsContract.test.js';
import { runRoomProgrammerTests } from './roomProgrammer.test.js';
import { runAdjacencyGraphTests } from './adjacencyGraphSolver.test.js';
import { runLayoutGeneratorTests } from './layoutGenerator.test.js';
import { runConstraintValidatorTests } from './constraintValidator.test.js';
import { runGeometricValidationIntegrationTests } from './geometricValidationIntegration.test.js';
import { runCandidateScoringAndRankingTests } from './candidateScoringAndRanking.test.js';
import { runSimilarityEngineTests } from './similarityEngine.test.js';
import { runFloorPlanGeneratorTests } from './floorPlanGenerator.test.js';
import { runEndToEndWorkflowTests } from './endToEndWorkflow.test.js';
import { runGeometryFoundation3dTests } from './geometryFoundation3d.test.js';
import { runProceduralBuildingGenerator3dTests } from './proceduralBuildingGenerator3d.test.js';
import { runGeometryVerificationAuditTests } from './geometryVerificationAudit.test.js';
import { runArchitecturalDesignIntelligenceTests } from './architecturalDesignIntelligence.test.js';
import { runProfessionalMaterialsAndLightingTests } from './professionalMaterialsAndLighting.test.js';
import { runHouseReconstructionFixesTests } from './houseReconstructionFixes.test.js';
import { runMultiViewQualityAssuranceTests } from './multiViewQualityAssurance.test.js';
import { runTotalProjectBudgetTests } from './totalProjectBudget.test.js';
import { runProceduralFurnitureTests } from './proceduralFurnitureEngine.test.js';
import { runProceduralLandscapeTests } from './proceduralLandscapeEngine.test.js';
import { runExportDocumentationTests } from './exportDocumentationPipeline.test.js';
import { runInteractiveCustomizationTests } from './interactiveCustomizationPersistence.test.js';
import { runProceduralElectricalEngineTests } from './proceduralElectricalEngine.test.js';
import { runSprint5TransformationTests } from './sprint5Transformation.test.js';
import { runVisuals5dParityTests } from './visuals5dParity.test.js';
import { runVintageIndianRegressionTests } from './vintageIndianHouseRegression.test.js';
import { runPhotorealisticEngineTests } from './photorealisticEngine.test.js';

export function runAllTests() {
  const startTime = Date.now();
  console.log('======================================================================');
  console.log('🚀 LABOURCONNECT AI ENGINE: COMPREHENSIVE AUTOMATED TEST RUNNER');
  console.log('======================================================================\n');

  const suites = [
    { name: '[S1] Dimensional Calculator Suite', runner: runDimensionalTests },
    { name: '[S1] Geometric Validator Suite', runner: runGeometricTests },
    { name: '[S1] Structured Requirement Parser', runner: runParserTests },
    { name: '[S1] Engine Core Acceptance Suite', runner: runEngineCoreTests },
    { name: '[S2] Layout Requirements Contract', runner: runLayoutRequirementsTests },
    { name: '[S2] Room Program Generator Suite', runner: runRoomProgrammerTests },
    { name: '[S2] Room Relationship Graph Suite', runner: runAdjacencyGraphTests },
    { name: '[S2] Procedural Layout Generator Suite', runner: runLayoutGeneratorTests },
    { name: '[S2] Constraint Validator & Optimizer Suite', runner: runConstraintValidatorTests },
    { name: '[S2] Geometric Validation Integration Suite', runner: runGeometricValidationIntegrationTests },
    { name: '[S2] Candidate Scoring & Ranking Suite', runner: runCandidateScoringAndRankingTests },
    { name: '[S2] Architectural Similarity & Diversity Suite', runner: runSimilarityEngineTests },
    { name: '[S2] Professional 2D Floor-Plan Engine Suite', runner: runFloorPlanGeneratorTests },
    { name: '[S2] End-to-End Workflow & Diversity Suite', runner: runEndToEndWorkflowTests },
    { name: '[S3] 3D Geometry Foundation Suite', runner: runGeometryFoundation3dTests },
    { name: '[S3] Procedural Building Generator Suite', runner: runProceduralBuildingGenerator3dTests },
    { name: '[S3] Geometry Verification & Defect Audit Suite', runner: runGeometryVerificationAuditTests },
    { name: '[S3] Architectural Intelligence & Variation', runner: runArchitecturalDesignIntelligenceTests },
    { name: '[S3] Professional Materials & Lighting', runner: runProfessionalMaterialsAndLightingTests },
    { name: '[S3] 3D House Reconstruction Root-Fixes', runner: runHouseReconstructionFixesTests },
    { name: '[S3] Multi-View Integration & QA Suite', runner: runMultiViewQualityAssuranceTests },
    { name: '[S4] Total Project Budget & Regional Rates', runner: runTotalProjectBudgetTests },
    { name: '[S4] Procedural Interior Furniture & Fit-Out', runner: runProceduralFurnitureTests },
    { name: '[S4] Procedural Landscape & Outdoor Living', runner: runProceduralLandscapeTests },
    { name: '[S4] Export & Documentation Pipeline', runner: runExportDocumentationTests },
    { name: '[S4] Interactive Customization & Persistence', runner: runInteractiveCustomizationTests },
    { name: '[S4] Procedural Electrical & Lighting', runner: runProceduralElectricalEngineTests },
    { name: '[S5] Complete Architectural Transformation', runner: runSprint5TransformationTests },
    { name: '[S5D] 5D Visuals Parity & Cutaways Suite', runner: runVisuals5dParityTests },
    { name: '[S5-REG] Vintage Indian House Regression', runner: runVintageIndianRegressionTests },
    { name: '[S6-PHOTO] Photorealistic Visualization Engine', runner: runPhotorealisticEngineTests }
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
  console.log('📊 CONSOLIDATED ENGINE EXECUTION MATRIX');
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
  console.log(`| TOTALS: ${suites.length} Test Suites                  | ${grandTotalFailed === 0 ? '✅ PASS' : '❌ FAIL'} | ${String(grandTotalPassed).padStart(6)} | ${String(grandTotalFailed).padStart(6)} |`);
  console.log('======================================================================');
  console.log(`Execution Duration: ${(durationMs / 1000).toFixed(2)} seconds`);
  console.log(`Grand Total Assertions: ${grandTotalPassed + grandTotalFailed}`);
  console.log(`Result: ${grandTotalFailed === 0 ? `ALL ${grandTotalPassed} TESTS PASSED (100% PASS RATE)` : `${grandTotalFailed} TESTS FAILED`}`);
  console.log('======================================================================\n');

  if (grandTotalFailed > 0) {
    process.exit(1);
  }
}

if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
  runAllTests();
}
