/**
 * LabourConnect Design Engine - Export Pipeline Orchestrator (Sprint 4, Task S4-T04)
 * 
 * Central orchestration module for all 2D CAD, 3D BIM, vector PDF drawing sheets,
 * and tabular schedule exports derived from the Canonical Architectural Design Model.
 * 
 * Responsibilities:
 * - Directs requests to format-specific serialisers (DXF, glTF, GLB, OBJ, PDF, CSV, JSON).
 * - Structural artifact validation (verifies signatures, headers, and byte arrays).
 * - Safe browser download execution with clean Object URLs and Blob management.
 * - Batch documentation packaging and status tracking.
 */

import { generateArchitecturalDxf } from './dxfExporter.js';
import { generateBinaryGlb, generateEmbeddedGltfJson } from './gltfExporter.js';
import { generateWavefrontObj } from './objExporter.js';
import { generateArchitecturalPdf } from './pdfDocumentExporter.js';
import { generateBlenderCyclesPythonScript } from './blenderCyclesExporter.js';
import {
  exportProjectDataJson,
  exportRoomScheduleCsv,
  exportDoorWindowScheduleCsv,
  exportFurnitureInventoryCsv,
  exportLandscapeInventoryCsv,
  exportMaterialsScheduleCsv,
  exportBudgetSummaryCsv
} from './projectScheduleExporter.js';

export const EXPORT_FORMATS = {
  DXF_FLOOR_PLAN: 'dxf_floor_plan',
  DXF_ALL_FLOORS: 'dxf_all_floors',
  GLB: 'glb',
  GLTF: 'gltf',
  OBJ: 'obj',
  BLENDER_CYCLES_SCRIPT: 'blender_cycles_script',
  PDF_SHEETS: 'pdf_sheets',
  JSON_PROJECT_DATA: 'json_project_data',
  CSV_ROOM_SCHEDULE: 'csv_room_schedule',
  CSV_DOOR_WINDOW_SCHEDULE: 'csv_door_window_schedule',
  CSV_FURNITURE_INVENTORY: 'csv_furniture_inventory',
  CSV_LANDSCAPE_INVENTORY: 'csv_landscape_inventory',
  CSV_MATERIALS_SCHEDULE: 'csv_materials_schedule',
  CSV_BUDGET_SUMMARY: 'csv_budget_summary'
};

/**
 * Generates an export artifact for a given format and canonical design.
 * 
 * @param {Object} canonicalDesign - Canonical Design Model (v2.0.0)
 * @param {string} formatId - Key from EXPORT_FORMATS
 * @param {Object} [options] - Format-specific configuration options
 * @returns {Object} { content, filename, mimeType, byteSize, formatId }
 */
export function exportDesignArtifact(canonicalDesign, formatId, options = {}) {
  if (!canonicalDesign || typeof canonicalDesign !== 'object') {
    throw new TypeError('exportDesignArtifact requires a valid canonical design object.');
  }

  const code = (canonicalDesign.code || canonicalDesign.id || 'DES_CANON').replace(/[^a-zA-Z0-9_-]/g, '_');

  switch (formatId) {
    // --- 2D CAD Drawings ---
    case EXPORT_FORMATS.DXF_FLOOR_PLAN: {
      const dxfContent = generateArchitecturalDxf(canonicalDesign, { ...options, floorIndex: 0 });
      return {
        formatId,
        content: dxfContent,
        filename: `${code}_Floor_Plan.dxf`,
        mimeType: 'application/dxf',
        byteSize: dxfContent.length,
        isBinary: false
      };
    }

    case EXPORT_FORMATS.DXF_ALL_FLOORS: {
      const dxfContent = generateArchitecturalDxf(canonicalDesign, { ...options, floorIndex: 'all' });
      return {
        formatId,
        content: dxfContent,
        filename: `${code}_All_Floors_CAD.dxf`,
        mimeType: 'application/dxf',
        byteSize: dxfContent.length,
        isBinary: false
      };
    }

    // --- 3D BIM Models ---
    case EXPORT_FORMATS.GLB: {
      const glbBytes = generateBinaryGlb(canonicalDesign, options);
      return {
        formatId,
        content: glbBytes,
        filename: `${code}_3D_Model.glb`,
        mimeType: 'model/gltf-binary',
        byteSize: glbBytes.byteLength,
        isBinary: true
      };
    }

    case EXPORT_FORMATS.GLTF: {
      const gltfJson = generateEmbeddedGltfJson(canonicalDesign, options);
      return {
        formatId,
        content: gltfJson,
        filename: `${code}_3D_Scene.gltf`,
        mimeType: 'model/gltf+json',
        byteSize: gltfJson.length,
        isBinary: false
      };
    }

    case EXPORT_FORMATS.OBJ: {
      const objBundle = generateWavefrontObj(canonicalDesign, options);
      return {
        formatId,
        content: objBundle.obj,
        companionMtl: objBundle.mtl,
        filename: `${code}_3D_Model.obj`,
        mtlFilename: `${code}_3D_Model.mtl`,
        mimeType: 'text/plain',
        byteSize: objBundle.obj.length,
        isBinary: false
      };
    }

    case EXPORT_FORMATS.BLENDER_CYCLES_SCRIPT: {
      const pyContent = generateBlenderCyclesPythonScript(canonicalDesign, options);
      return {
        formatId,
        content: pyContent,
        filename: `${code}_Blender_Cycles_Setup.py`,
        mimeType: 'text/x-python',
        byteSize: pyContent.length,
        isBinary: false
      };
    }

    // --- Vector PDF Architectural Sheets ---
    case EXPORT_FORMATS.PDF_SHEETS: {
      const pdfBytes = generateArchitecturalPdf(canonicalDesign, options);
      return {
        formatId,
        content: pdfBytes,
        filename: `${code}_Architectural_Sheets.pdf`,
        mimeType: 'application/pdf',
        byteSize: pdfBytes.byteLength,
        isBinary: true
      };
    }

    // --- Schedules & Documentation ---
    case EXPORT_FORMATS.JSON_PROJECT_DATA: {
      const jsonContent = exportProjectDataJson(canonicalDesign, options);
      return {
        formatId,
        content: jsonContent,
        filename: `${code}_project_data.json`,
        mimeType: 'application/json',
        byteSize: jsonContent.length,
        isBinary: false
      };
    }

    case EXPORT_FORMATS.CSV_ROOM_SCHEDULE: {
      const csv = exportRoomScheduleCsv(canonicalDesign, options);
      return {
        formatId,
        content: csv,
        filename: `${code}_room_schedule.csv`,
        mimeType: 'text/csv',
        byteSize: csv.length,
        isBinary: false
      };
    }

    case EXPORT_FORMATS.CSV_DOOR_WINDOW_SCHEDULE: {
      const csv = exportDoorWindowScheduleCsv(canonicalDesign, options);
      return {
        formatId,
        content: csv,
        filename: `${code}_door_window_schedule.csv`,
        mimeType: 'text/csv',
        byteSize: csv.length,
        isBinary: false
      };
    }

    case EXPORT_FORMATS.CSV_FURNITURE_INVENTORY: {
      const csv = exportFurnitureInventoryCsv(canonicalDesign, options);
      return {
        formatId,
        content: csv,
        filename: `${code}_furniture_inventory.csv`,
        mimeType: 'text/csv',
        byteSize: csv.length,
        isBinary: false
      };
    }

    case EXPORT_FORMATS.CSV_LANDSCAPE_INVENTORY: {
      const csv = exportLandscapeInventoryCsv(canonicalDesign, options);
      return {
        formatId,
        content: csv,
        filename: `${code}_landscape_inventory.csv`,
        mimeType: 'text/csv',
        byteSize: csv.length,
        isBinary: false
      };
    }

    case EXPORT_FORMATS.CSV_MATERIALS_SCHEDULE: {
      const csv = exportMaterialsScheduleCsv(canonicalDesign, options);
      return {
        formatId,
        content: csv,
        filename: `${code}_materials_schedule.csv`,
        mimeType: 'text/csv',
        byteSize: csv.length,
        isBinary: false
      };
    }

    case EXPORT_FORMATS.CSV_BUDGET_SUMMARY: {
      const csv = exportBudgetSummaryCsv(canonicalDesign, options);
      return {
        formatId,
        content: csv,
        filename: `${code}_budget_summary.csv`,
        mimeType: 'text/csv',
        byteSize: csv.length,
        isBinary: false
      };
    }

    default:
      throw new Error(`Unsupported export format requested: ${formatId}`);
  }
}

/**
 * Validates the structural integrity and file signatures of an exported artifact.
 * 
 * @param {Object} artifact - Output from exportDesignArtifact
 * @returns {Object} { isValid: boolean, checks: string[], errors: string[] }
 */
export function validateExportArtifact(artifact) {
  if (!artifact || typeof artifact !== 'object') {
    return { isValid: false, checks: [], errors: ['Null or invalid artifact'] };
  }

  const { formatId, content, byteSize } = artifact;
  const checks = [];
  const errors = [];

  if (!byteSize || byteSize <= 0) {
    errors.push('Artifact has zero or negative byte size.');
  } else {
    checks.push(`Byte size verified (${byteSize} bytes).`);
  }

  // Format-specific verification
  if (formatId === EXPORT_FORMATS.DXF_FLOOR_PLAN || formatId === EXPORT_FORMATS.DXF_ALL_FLOORS) {
    if (typeof content !== 'string') {
      errors.push('DXF content is not a string.');
    } else {
      if (content.includes('SECTION\n  2\nHEADER') && content.includes('0\nEOF\n')) {
        checks.push('AutoCAD DXF header and EOF signature verified.');
      } else {
        errors.push('DXF content missing valid AutoCAD header or EOF marker.');
      }
      if (content.includes('WALLS_EXTERIOR') && content.includes('ROOM_LABELS')) {
        checks.push('Architectural layers verified.');
      } else {
        errors.push('DXF missing expected architectural layers.');
      }
    }
  } else if (formatId === EXPORT_FORMATS.GLB) {
    if (!(content instanceof Uint8Array)) {
      errors.push('GLB content is not a Uint8Array.');
    } else if (content.byteLength < 20) {
      errors.push('GLB file too short.');
    } else {
      const view = new DataView(content.buffer, content.byteOffset, content.byteLength);
      const magic = view.getUint32(0, true);
      const version = view.getUint32(4, true);
      const totalLen = view.getUint32(8, true);

      if (magic === 0x46546C67) {
        checks.push('GLB magic header 0x46546C67 (glTF) verified.');
      } else {
        errors.push(`Invalid GLB magic header: 0x${magic.toString(16)}`);
      }

      if (version === 2) {
        checks.push('glTF version 2 verified.');
      } else {
        errors.push(`Invalid glTF version: ${version}`);
      }

      if (totalLen === content.byteLength) {
        checks.push('GLB total length matches byte buffer size.');
      } else {
        errors.push(`GLB header length (${totalLen}) does not match buffer (${content.byteLength}).`);
      }
    }
  } else if (formatId === EXPORT_FORMATS.PDF_SHEETS) {
    if (!(content instanceof Uint8Array)) {
      errors.push('PDF content is not a Uint8Array.');
    } else if (content.byteLength < 32) {
      errors.push('PDF file too short.');
    } else {
      let head = '';
      for (let i = 0; i < Math.min(10, content.byteLength); i++) {
        head += String.fromCharCode(content[i]);
      }
      let tail = '';
      for (let i = Math.max(0, content.byteLength - 20); i < content.byteLength; i++) {
        tail += String.fromCharCode(content[i]);
      }

      if (head.startsWith('%PDF-1.')) {
        checks.push('PDF-1.x header signature verified.');
      } else {
        errors.push(`Invalid PDF header: ${head}`);
      }

      if (tail.includes('%%EOF')) {
        checks.push('PDF %%EOF trailer marker verified.');
      } else {
        errors.push('PDF missing %%EOF trailer marker.');
      }
    }
  } else if (formatId.startsWith('csv_')) {
    if (typeof content !== 'string') {
      errors.push('CSV content is not a string.');
    } else {
      const lines = content.trim().split(/\r?\n/);
      if (lines.length >= 2) {
        checks.push(`CSV contains ${lines.length} lines with header.`);
      } else {
        errors.push('CSV has fewer than 2 lines.');
      }
    }
  } else if (formatId === EXPORT_FORMATS.JSON_PROJECT_DATA) {
    try {
      const parsed = JSON.parse(content);
      if (parsed.schemaVersion && parsed.designId) {
        checks.push('Valid JSON project data with schemaVersion.');
      } else {
        errors.push('JSON missing expected schema fields.');
      }
    } catch (e) {
      errors.push(`Malformed JSON: ${e.message}`);
    }
  }

  return {
    isValid: errors.length === 0,
    checks,
    errors
  };
}

/**
 * Triggers a real browser file download for an artifact.
 * 
 * @param {Object} artifact - Artifact object from exportDesignArtifact
 * @returns {boolean} True if download was initiated
 */
export function triggerBrowserDownload(artifact) {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return false; // Headless environment
  }

  const { content, filename, mimeType } = artifact;
  const blob = new Blob([content], { type: mimeType });
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();

  setTimeout(() => {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 100);

  return true;
}
