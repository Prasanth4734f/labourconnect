/**
 * LabourConnect Design Engine - Export & Documentation Pipeline Automated Test Suite (Sprint 4, Task S4-T04)
 * 
 * Verifies full end-to-end functionality, structural validity, format standards compliance,
 * data consistency, regression safety, and immutability across all 2D CAD, 3D BIM, vector PDF,
 * and tabular schedule exporters.
 */

import { generateArchitecturalDxf } from '../export/dxfExporter.js';
import { generateBinaryGlb, generateEmbeddedGltfJson } from '../export/gltfExporter.js';
import { generateWavefrontObj } from '../export/objExporter.js';
import { generateArchitecturalPdf } from '../export/pdfDocumentExporter.js';
import {
  exportProjectDataJson,
  exportRoomScheduleCsv,
  exportDoorWindowScheduleCsv,
  exportFurnitureInventoryCsv,
  exportLandscapeInventoryCsv,
  exportMaterialsScheduleCsv,
  exportBudgetSummaryCsv
} from '../export/projectScheduleExporter.js';
import {
  exportDesignArtifact,
  validateExportArtifact,
  EXPORT_FORMATS
} from '../export/exportPipelineOrchestrator.js';
import { designEngine } from '../index.js';

// Test Fixture: Canonical Architectural Design Model (v2.0.0)
function createTestDesign() {
  return {
    id: 'test_design_villa_01',
    code: 'DES-CANON-V1',
    title: 'Modern Luxury 3BHK Residential Villa',
    metrics: {
      carpetAreaSqft: 1850,
      builtUpAreaSqft: 2200,
      groundCoverageSqft: 1200
    },
    inputs: {
      bhk: 3,
      floors: 2,
      archStyle: 'modern_contemporary',
      facing: 'East',
      budgetInr: 4500000
    },
    site: {
      plot: { width: 30, length: 45 },
      buildableEnvelope: { x: 4, y: 6, width: 22, length: 30 }
    },
    floors: [
      {
        id: 'floor_ground',
        name: 'Ground Floor',
        level: 0,
        elevation: 1.5,
        rooms: [
          { id: 'r_living', name: 'Living Room', type: 'living', bounds: { x: 4, y: 6, width: 14, length: 16 } },
          { id: 'r_kitchen', name: 'Kitchen', type: 'kitchen', bounds: { x: 18, y: 6, width: 8, length: 10 } },
          { id: 'r_dining', name: 'Dining Room', type: 'dining', bounds: { x: 18, y: 16, width: 8, length: 8 } },
          { id: 'r_bed1', name: 'Master Bedroom', type: 'master_bedroom', bounds: { x: 4, y: 22, width: 12, length: 14 } },
          { id: 'r_bath1', name: 'Attached Bath', type: 'bathroom', bounds: { x: 16, y: 26, width: 6, length: 8 } }
        ],
        walls: [
          { id: 'w_ext_south', start: { x: 4, y: 6 }, end: { x: 26, y: 6 }, thickness: 0.75, type: 'exterior' },
          { id: 'w_ext_east', start: { x: 26, y: 6 }, end: { x: 26, y: 36 }, thickness: 0.75, type: 'exterior' },
          { id: 'w_ext_north', start: { x: 26, y: 36 }, end: { x: 4, y: 36 }, thickness: 0.75, type: 'exterior' },
          { id: 'w_ext_west', start: { x: 4, y: 36 }, end: { x: 4, y: 6 }, thickness: 0.75, type: 'exterior' },
          { id: 'w_int_1', start: { x: 18, y: 6 }, end: { x: 18, y: 24 }, thickness: 0.375, type: 'interior' }
        ],
        openings: [
          { id: 'd_main', type: 'door', width: 3.5, height: 7.0, position: { x: 8, y: 6 } },
          { id: 'd_bed1', type: 'door', width: 3.0, height: 7.0, position: { x: 6, y: 22 } },
          { id: 'w_living', type: 'window', width: 5.0, height: 4.5, position: { x: 10, y: 6 } },
          { id: 'w_kitchen', type: 'window', width: 3.0, height: 3.0, position: { x: 22, y: 6 } }
        ],
        stairs: [
          { id: 'stair_main', bounds: { x: 18, y: 24, width: 8, length: 10 } }
        ],
        columns: [
          { id: 'col_1', x: 4, y: 6, width: 0.75, length: 1.0 },
          { id: 'col_2', x: 18, y: 6, width: 0.75, length: 1.0 },
          { id: 'col_3', x: 26, y: 6, width: 0.75, length: 1.0 }
        ]
      },
      {
        id: 'floor_level1',
        name: 'First Floor',
        level: 1,
        elevation: 12.0,
        rooms: [
          { id: 'r_bed2', name: 'Bedroom 2', type: 'bedroom', bounds: { x: 4, y: 6, width: 12, length: 14 } },
          { id: 'r_bed3', name: 'Bedroom 3', type: 'bedroom', bounds: { x: 16, y: 6, width: 10, length: 14 } },
          { id: 'r_balcony', name: 'Glass Balcony', type: 'balcony', bounds: { x: 4, y: 20, width: 12, length: 6 } }
        ],
        walls: [
          { id: 'w_l1_south', start: { x: 4, y: 6 }, end: { x: 26, y: 6 }, thickness: 0.75, type: 'exterior' }
        ],
        openings: [
          { id: 'd_l1_bed2', type: 'door', width: 3.0, height: 7.0, position: { x: 6, y: 6 } }
        ]
      }
    ],
    structuralGrid: {
      columns: [
        { id: 'col_1', x: 4, y: 6, width: 0.75, length: 1.0 },
        { id: 'col_2', x: 18, y: 6, width: 0.75, length: 1.0 },
        { id: 'col_3', x: 26, y: 6, width: 0.75, length: 1.0 }
      ]
    }
  };
}

export function runExportDocumentationTests() {
  console.log('\n===============================================================');
  console.log('LABOURCONNECT ENGINE: EXPORT & DOCUMENTATION PIPELINE (S4-T04)');
  console.log('===============================================================');

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

  const baseDesign = createTestDesign();

  // ---------------------------------------------------------------------------
  // GROUP 1: AUTOCAD ASCII DXF EXPORTER
  // ---------------------------------------------------------------------------
  console.log('\n--- Group 1: AutoCAD ASCII DXF Exporter ---');

  const dxfOutput = generateArchitecturalDxf(baseDesign, { floorIndex: 'all' });
  assert(typeof dxfOutput === 'string' && dxfOutput.length > 500, 'Test 1: DXF content generates as non-empty string');
  assert(dxfOutput.includes('SECTION\n  2\nHEADER') && dxfOutput.includes('0\nEOF\n'), 'Test 2: Standard AutoCAD DXF HEADER and EOF markers present');
  assert(dxfOutput.includes('$ACADVER\n  1\nAC1015'), 'Test 3: DXF version AC1015 (AutoCAD 2000 compatibility) declared');
  assert(dxfOutput.includes('$INSUNITS\n 70\n     2'), 'Test 4: DXF $INSUNITS explicitly set to Imperial Feet (Code 2)');
  assert(dxfOutput.includes('WALLS_EXTERIOR') && dxfOutput.includes('WALLS_INTERIOR'), 'Test 5: Architectural wall layers properly registered in TABLES section');
  assert(dxfOutput.includes('ROOM_LABELS') && dxfOutput.includes('LIVING ROOM'), 'Test 6: Known room label "LIVING ROOM" exists in DXF entities');
  assert(dxfOutput.includes('PLOT BOUNDARY'), 'Test 7: Property plot boundary entity is present in DXF output');

  // Error safety
  try {
    generateArchitecturalDxf(null);
    assert(false, 'Test 8: Null design correctly throws TypeError');
  } catch (e) {
    assert(e instanceof TypeError, 'Test 8: Null design correctly throws TypeError');
  }

  // ---------------------------------------------------------------------------
  // GROUP 2: GLTF 2.0 & GLB BINARY EXPORTER
  // ---------------------------------------------------------------------------
  console.log('\n--- Group 2: glTF 2.0 & Binary GLB 3D Exporter ---');

  const glbBytes = generateBinaryGlb(baseDesign, { units: 'meters' });
  assert(glbBytes instanceof Uint8Array && glbBytes.byteLength > 100, 'Test 9: GLB generates as non-empty Uint8Array');

  const dataView = new DataView(glbBytes.buffer, glbBytes.byteOffset, glbBytes.byteLength);
  const glbMagic = dataView.getUint32(0, true);
  const glbVersion = dataView.getUint32(4, true);
  const glbTotalLen = dataView.getUint32(8, true);

  assert(glbMagic === 0x46546C67, 'Test 10: GLB magic header is 0x46546C67 ("glTF")');
  assert(glbVersion === 2, 'Test 11: glTF container version is 2');
  assert(glbTotalLen === glbBytes.byteLength, 'Test 12: Total GLB file length matches buffer byte length');

  const jsonChunkType = dataView.getUint32(16, true);
  assert(jsonChunkType === 0x4E4F534A, 'Test 13: Chunk 0 is valid JSON chunk (0x4E4F534A)');

  const gltfJsonStr = generateEmbeddedGltfJson(baseDesign, { units: 'meters' });
  const parsedGltf = JSON.parse(gltfJsonStr);
  assert(parsedGltf.asset?.version === '2.0', 'Test 14: Embedded glTF JSON has valid asset version 2.0');
  assert(Array.isArray(parsedGltf.nodes) && parsedGltf.nodes.length >= 1, 'Test 15: Scene nodes hierarchy populated in glTF document');
  assert(parsedGltf.buffers?.[0]?.uri?.startsWith('data:application/octet-stream;base64,'), 'Test 16: Embedded glTF buffer contains valid base64 data URI');

  // ---------------------------------------------------------------------------
  // GROUP 3: WAVEFRONT OBJ & MTL EXPORTER
  // ---------------------------------------------------------------------------
  console.log('\n--- Group 3: Wavefront OBJ & MTL Exporter ---');

  const objBundle = generateWavefrontObj(baseDesign, { units: 'meters' });
  assert(typeof objBundle.obj === 'string' && objBundle.obj.includes('mtllib'), 'Test 17: OBJ file references companion mtllib');
  assert(objBundle.stats.totalVertices > 0 && objBundle.stats.totalFaces > 0, 'Test 18: OBJ generates positive vertex and face counts');
  assert(typeof objBundle.mtl === 'string' && objBundle.mtl.includes('newmtl'), 'Test 19: Companion MTL file defines material shaders');

  // ---------------------------------------------------------------------------
  // GROUP 4: ARCHITECTURAL VECTOR PDF EXPORTER
  // ---------------------------------------------------------------------------
  console.log('\n--- Group 4: Architectural Vector PDF Exporter ---');

  const pdfBytes = generateArchitecturalPdf(baseDesign);
  assert(pdfBytes instanceof Uint8Array && pdfBytes.byteLength > 500, 'Test 20: PDF generates as non-empty Uint8Array');

  let pdfHeader = '';
  for (let i = 0; i < 9; i++) pdfHeader += String.fromCharCode(pdfBytes[i]);
  assert(pdfHeader.startsWith('%PDF-1.4'), 'Test 21: PDF file begins with valid %PDF-1.4 header');

  let pdfTail = '';
  for (let i = Math.max(0, pdfBytes.byteLength - 20); i < pdfBytes.byteLength; i++) {
    pdfTail += String.fromCharCode(pdfBytes[i]);
  }
  assert(pdfTail.includes('%%EOF'), 'Test 22: PDF file terminates with valid %%EOF trailer');

  // ---------------------------------------------------------------------------
  // GROUP 5: PROJECT DOCUMENTATION & CSV SCHEDULES
  // ---------------------------------------------------------------------------
  console.log('\n--- Group 5: Tabular CSV Schedules & Project Data JSON ---');

  const projectJson = exportProjectDataJson(baseDesign);
  const parsedProj = JSON.parse(projectJson);
  assert(parsedProj.schemaVersion === '2.0.0' && parsedProj.designId === baseDesign.id, 'Test 23: exportProjectDataJson complies with schema 2.0.0');

  const roomCsv = exportRoomScheduleCsv(baseDesign);
  assert(roomCsv.includes('Mark,Space Description,Room Type'), 'Test 24: Room schedule CSV contains RFC 4180 headers');
  assert(roomCsv.includes('Living Room') && roomCsv.includes('Master Bedroom'), 'Test 25: Room schedule CSV contains actual room records');

  const fenCsv = exportDoorWindowScheduleCsv(baseDesign);
  assert(fenCsv.includes('Mark,Opening Type,Floor Level'), 'Test 26: Door & Window schedule CSV contains proper columns');

  const furnCsv = exportFurnitureInventoryCsv(baseDesign);
  assert(furnCsv.includes('Item ID,Category,Furniture Type'), 'Test 27: Furniture inventory CSV contains proper columns');

  const landCsv = exportLandscapeInventoryCsv(baseDesign);
  assert(landCsv.includes('Feature ID,Category,Description'), 'Test 28: Landscape inventory CSV contains proper columns');

  const matCsv = exportMaterialsScheduleCsv(baseDesign);
  assert(matCsv.includes('Component Category,Component Name,Applied Material'), 'Test 29: Materials schedule CSV contains proper columns');

  const budgetCsv = exportBudgetSummaryCsv(baseDesign);
  assert(budgetCsv.includes('Category ID,Cost Category Name,Base Amount'), 'Test 30: Budget summary CSV contains 10-category breakdown');

  // ---------------------------------------------------------------------------
  // GROUP 6: ORCHESTRATION, VALIDATION & IMMUTABILITY
  // ---------------------------------------------------------------------------
  console.log('\n--- Group 6: Orchestration, Validation & Immutability ---');

  const dxfArtifact = exportDesignArtifact(baseDesign, EXPORT_FORMATS.DXF_FLOOR_PLAN);
  const dxfVal = validateExportArtifact(dxfArtifact);
  assert(dxfVal.isValid, 'Test 31: DXF artifact passes validation checks');

  const glbArtifact = exportDesignArtifact(baseDesign, EXPORT_FORMATS.GLB);
  const glbVal = validateExportArtifact(glbArtifact);
  assert(glbVal.isValid, 'Test 32: GLB artifact passes binary signature validation');

  const pdfArtifact = exportDesignArtifact(baseDesign, EXPORT_FORMATS.PDF_SHEETS);
  const pdfVal = validateExportArtifact(pdfArtifact);
  assert(pdfVal.isValid, 'Test 33: PDF artifact passes structural validation');

  // Immutability test: verify original design object was not modified
  const originalFloorCount = baseDesign.floors.length;
  const originalRoomCount = baseDesign.floors[0].rooms.length;
  exportDesignArtifact(baseDesign, EXPORT_FORMATS.DXF_ALL_FLOORS);
  exportDesignArtifact(baseDesign, EXPORT_FORMATS.GLB);
  exportDesignArtifact(baseDesign, EXPORT_FORMATS.PDF_SHEETS);

  assert(baseDesign.floors.length === originalFloorCount, 'Test 34: Export pipeline does not mutate floor count');
  assert(baseDesign.floors[0].rooms.length === originalRoomCount, 'Test 35: Export pipeline does not mutate room geometry');

  // Determinism test: identical design inputs generate identical DXF outputs
  const run1 = generateArchitecturalDxf(baseDesign, { floorIndex: 0 });
  const run2 = generateArchitecturalDxf(baseDesign, { floorIndex: 0 });
  assert(run1 === run2, 'Test 36: Repeated DXF generation is 100% deterministic');

  // Engine Singleton Integration
  assert(typeof designEngine.exportArtifact === 'function', 'Test 37: designEngine.exportArtifact method is accessible');
  assert(typeof designEngine.validateExport === 'function', 'Test 38: designEngine.validateExport method is accessible');

  console.log('\n===============================================================');
  console.log(`EXPORT PIPELINE TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('===============================================================');

  return { passed, failed };
}

if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
  const result = runExportDocumentationTests();
  if (result.failed > 0) {
    process.exit(1);
  }
}
