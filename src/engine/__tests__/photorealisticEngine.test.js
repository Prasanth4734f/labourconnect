/**
 * LabourConnect Design Engine - Photorealistic Architectural Visualization Engine Test Suite
 * 
 * Verifies:
 * 1. Blender Cycles Standalone Python Script Exporter (Nishita sky, Filmic, Principled BSDF, 4K Cameras)
 * 2. Export Pipeline Orchestrator integration for Blender Cycles scripts
 * 3. Architectural Material Catalog PBR invariants
 */

import { generateBlenderCyclesPythonScript } from '../export/blenderCyclesExporter.js';
import { exportDesignArtifact, EXPORT_FORMATS } from '../export/exportPipelineOrchestrator.js';
import { generateLayoutCandidate } from '../generator/layoutGenerator.js';
import { ARCHITECTURAL_MATERIALS, MATERIAL_KEYS } from '../rendering/materialCatalog.js';

export function runPhotorealisticEngineTests() {
  console.log('======================================================================');
  console.log('✨ PHOTOREALISTIC ARCHITECTURAL VISUALIZATION ENGINE TEST SUITE');
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

  const sampleDesign = generateLayoutCandidate({
    plotWidth: 40,
    plotLength: 60,
    floorsCount: 2,
    bhkCount: 3,
    hasBalcony: true
  });

  // Section 1: Standalone Blender Cycles Exporter
  console.log('\n--- Section 1: Standalone Blender Cycles Script Exporter ---');
  const script = generateBlenderCyclesPythonScript(sampleDesign);
  assert(typeof script === 'string' && script.length > 500, 'Test 1.1: Generates substantial standalone Python script');
  assert(script.includes("scene.render.engine = 'CYCLES'"), 'Test 1.2: Configures CYCLES render engine');
  assert(script.includes("scene.view_settings.view_transform = 'Filmic'"), 'Test 1.3: Sets Filmic photorealistic tone mapping');
  assert(script.includes("scene.view_settings.look = 'High Contrast'"), 'Test 1.4: Sets High Contrast look curve');
  assert(script.includes("scene.render.resolution_x = 3840") && script.includes("scene.render.resolution_y = 2160"), 'Test 1.5: Configures true 4K resolution (3840x2160)');
  assert(script.includes("node_sky.sky_type = 'NISHITA'"), 'Test 1.6: Instantiates Nishita physical atmospheric sky');
  assert(script.includes("node_sky.sun_elevation") && script.includes("node_sky.sun_disc = True"), 'Test 1.7: Configures astronomical sun elevation and disc');
  assert(script.includes("ShaderNodeBsdfPrincipled"), 'Test 1.8: Creates Cycles Principled BSDF PBR material shaders');
  assert(script.includes("Mat_Plaster_OffWhite"), 'Test 1.9: Defines architectural plaster material node');
  assert(script.includes("Mat_Mangalore_Clay_Tile"), 'Test 1.10: Defines Mangalore terracotta clay tile material node');
  assert(script.includes("Mat_Float_Glass") && script.includes("Transmission Weight"), 'Test 1.11: Defines physical float glass with refractive transmission');
  assert(script.includes("Mat_Calacatta_Marble"), 'Test 1.12: Defines polished marble material node');
  assert(script.includes("Cam_Isometric_Cutaway") && script.includes("Cam_Exterior_Elevation"), 'Test 1.13: Configures isometric cutaway and eye-level architectural cameras');

  // Section 2: Export Pipeline Orchestrator Integration
  console.log('\n--- Section 2: Export Pipeline Orchestrator Integration ---');
  const artifact = exportDesignArtifact(sampleDesign, EXPORT_FORMATS.BLENDER_CYCLES_SCRIPT);
  assert(artifact && artifact.formatId === EXPORT_FORMATS.BLENDER_CYCLES_SCRIPT, 'Test 2.1: Exporter recognizes BLENDER_CYCLES_SCRIPT format');
  assert(artifact.filename.endsWith('.py'), 'Test 2.2: Exported filename has .py extension');
  assert(artifact.mimeType === 'text/x-python', 'Test 2.3: MIME type is text/x-python');
  assert(artifact.isBinary === false, 'Test 2.4: Artifact is clean text format');
  assert(artifact.byteSize > 500, `Test 2.5: Artifact byte size is substantial (${artifact.byteSize} bytes)`);

  // Section 3: Material Catalog PBR Invariants
  console.log('\n--- Section 3: Architectural Material Catalog Invariants ---');
  let allKeysExist = true;
  Object.values(MATERIAL_KEYS).forEach(key => {
    if (!ARCHITECTURAL_MATERIALS[key]) allKeysExist = false;
  });
  assert(allKeysExist, 'Test 3.1: All canonical material keys defined in catalog');

  const roofMat = ARCHITECTURAL_MATERIALS[MATERIAL_KEYS.ROOF_MANGALORE_CLAY_TILE];
  assert(roofMat && roofMat.category === 'tile' && roofMat.roughness >= 0.65, 'Test 3.2: Terracotta roof tile has authentic roughness and category');

  const glassMat = ARCHITECTURAL_MATERIALS[MATERIAL_KEYS.GLASS_ACOUSTIC_TINTED];
  assert(glassMat && glassMat.category === 'glass' && glassMat.roughness <= 0.15, 'Test 3.3: Float glass has physical smoothness');

  console.log('======================================================================');
  console.log(`📊 PHOTOREALISTIC ENGINE SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('======================================================================\n');

  return { total: passed + failed, passed, failed };
}
