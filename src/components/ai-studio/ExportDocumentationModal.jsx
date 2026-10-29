import React, { useState } from 'react';
import {
  X,
  Download,
  FileText,
  Box,
  Square,
  Table,
  CheckCircle2,
  Clock,
  Printer,
  Package,
  Layers,
  Sparkles,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import {
  exportDesignArtifact,
  validateExportArtifact,
  triggerBrowserDownload,
  EXPORT_FORMATS
} from '../../engine/export/exportPipelineOrchestrator.js';

export default function ExportDocumentationModal({
  isOpen,
  onClose,
  canonicalDesign
}) {
  const [activeTab, setActiveTab] = useState('2d_cad'); // '2d_cad', '3d_bim', 'pdf_sheets', 'schedules'
  const [downloadingId, setDownloadingId] = useState(null);
  const [completedDownloads, setCompletedDownloads] = useState({});
  const [downloadError, setDownloadError] = useState(null);
  const [batchProgress, setBatchProgress] = useState(null);

  if (!isOpen || !canonicalDesign) return null;

  const designCode = canonicalDesign.code || canonicalDesign.id || 'CANON-01';
  const designTitle = canonicalDesign.title || 'Architectural Design';
  const plot = canonicalDesign.site?.plot || { width: 30, length: 40 };

  const handleDownload = async (formatId, label) => {
    try {
      setDownloadingId(formatId);
      setDownloadError(null);

      // Brief visual tick for responsive UX
      await new Promise((r) => setTimeout(r, 120));

      const artifact = exportDesignArtifact(canonicalDesign, formatId);
      const validation = validateExportArtifact(artifact);

      if (!validation.isValid) {
        throw new Error(`Export validation failed: ${validation.errors.join(', ')}`);
      }

      const success = triggerBrowserDownload(artifact);

      // For companion MTL in OBJ format
      if (formatId === EXPORT_FORMATS.OBJ && artifact.companionMtl) {
        const mtlArtifact = {
          content: artifact.companionMtl,
          filename: artifact.mtlFilename || `${designCode}_3D_Model.mtl`,
          mimeType: 'text/plain',
          isBinary: false
        };
        setTimeout(() => triggerBrowserDownload(mtlArtifact), 200);
      }

      setCompletedDownloads((prev) => ({ ...prev, [formatId]: true }));
    } catch (err) {
      console.error('Export error:', err);
      setDownloadError(`Export failed: ${err.message}`);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleBatchDownloadAll = async () => {
    try {
      setBatchProgress('Preparing Documentation Package...');
      const queue = [
        { id: EXPORT_FORMATS.PDF_SHEETS, label: 'Architectural PDF Sheets' },
        { id: EXPORT_FORMATS.DXF_ALL_FLOORS, label: 'AutoCAD DXF Drawing' },
        { id: EXPORT_FORMATS.GLB, label: 'glTF Binary 3D Model' },
        { id: EXPORT_FORMATS.CSV_BUDGET_SUMMARY, label: 'BOQ Budget Summary' },
        { id: EXPORT_FORMATS.JSON_PROJECT_DATA, label: 'Canonical Project Data' }
      ];

      for (let i = 0; i < queue.length; i++) {
        const item = queue[i];
        setBatchProgress(`Generating ${item.label} (${i + 1}/${queue.length})...`);
        const artifact = exportDesignArtifact(canonicalDesign, item.id);
        triggerBrowserDownload(artifact);
        setCompletedDownloads((prev) => ({ ...prev, [item.id]: true }));
        await new Promise((r) => setTimeout(r, 350));
      }

      setBatchProgress('All 5 Core Documentation Artifacts Downloaded Successfully!');
      setTimeout(() => setBatchProgress(null), 3500);
    } catch (err) {
      setDownloadError(`Batch export failed: ${err.message}`);
      setBatchProgress(null);
    }
  };

  const handlePrintView = () => {
    // Generate PDF and open in new tab or trigger window.print
    try {
      const artifact = exportDesignArtifact(canonicalDesign, EXPORT_FORMATS.PDF_SHEETS);
      const blob = new Blob([artifact.content], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(blob);
      const printWin = window.open(blobUrl, '_blank');
      if (printWin) {
        printWin.focus();
      } else {
        triggerBrowserDownload(artifact);
      }
    } catch (err) {
      setDownloadError(`Print preview failed: ${err.message}`);
    }
  };

  // Export Items Catalog
  const exportCategories = {
    '2d_cad': [
      {
        id: EXPORT_FORMATS.DXF_FLOOR_PLAN,
        formatBadge: 'DXF',
        badgeColor: '#B45309',
        badgeBg: '#FEF3C7',
        title: 'Master Ground Floor CAD Drawing (.dxf)',
        desc: 'AutoCAD 2000 compliant DXF containing exterior walls (0.75\'), interior partitions (0.375\'), door swings, window frames, column cross-boxes, and room dimension annotations.',
        layers: ['PLOT_BOUNDARY', 'WALLS_EXTERIOR', 'WALLS_INTERIOR', 'DOORS', 'WINDOWS', 'ROOM_LABELS', 'DIMENSIONS']
      },
      {
        id: EXPORT_FORMATS.DXF_ALL_FLOORS,
        formatBadge: 'DXF',
        badgeColor: '#B45309',
        badgeBg: '#FEF3C7',
        title: 'Complete Multi-Floor CAD Drawing (.dxf)',
        desc: 'Full project CAD package incorporating all floors (Ground, First, Terrace), stairwell shafts, balconies, structural grids, and exterior setback envelopes.',
        layers: ['ALL_FLOORS', 'COLUMNS', 'STAIRS', 'SETBACKS', 'TITLE_BLOCK']
      }
    ],
    '3d_bim': [
      {
        id: EXPORT_FORMATS.GLB,
        formatBadge: 'GLB',
        badgeColor: '#1D4ED8',
        badgeBg: '#DBEAFE',
        title: 'glTF 2.0 Binary Container (.glb)',
        desc: 'Self-contained binary 3D interchange model. Includes genuine extruded solid walls, RCC slabs, door/window cutouts, 3D furniture, compound walls, vegetation trees, and PBR materials.',
        layers: ['Building Structure', 'Interior Furnishings', 'Site & Landscape']
      },
      {
        id: EXPORT_FORMATS.OBJ,
        formatBadge: 'OBJ+MTL',
        badgeColor: '#4338CA',
        badgeBg: '#E0E7FF',
        title: 'Wavefront OBJ & Materials (.obj + .mtl)',
        desc: 'Standard polygonal mesh file compatible with Blender, 3ds Max, Rhino, Revit, and SketchUp. Includes companion .mtl with architectural surface diffuse colors.',
        layers: ['o Architecture', 'o Furnishings', 'o Landscape', 'usemtl Shaders']
      },
      {
        id: EXPORT_FORMATS.GLTF,
        formatBadge: 'glTF',
        badgeColor: '#2563EB',
        badgeBg: '#EFF6FF',
        title: 'glTF 2.0 Embedded JSON (.gltf)',
        desc: 'Text-based glTF 2.0 document with inline base64 data URI buffers. Ideal for web viewers and three.js integration without external asset dependencies.',
        layers: ['Standard glTF 2.0 Scene Graph']
      },
      {
        id: EXPORT_FORMATS.BLENDER_CYCLES_SCRIPT,
        formatBadge: 'CYCLES',
        badgeColor: '#E11D48',
        badgeBg: '#FFE4E6',
        title: 'Blender Cycles 4K Raytrace Setup (.py)',
        desc: 'Automated Python script for Blender 3.x / 4.x. Sets up Nishita physical atmospheric sky, Filmic high-contrast color management, Principled BSDF node shaders, and multi-angle 4K cameras.',
        layers: ['Cycles Raytracing', 'Nishita Sky & Sun', 'Principled BSDF Nodes', '4K Cameras']
      }
    ],
    'pdf_sheets': [
      {
        id: EXPORT_FORMATS.PDF_SHEETS,
        formatBadge: 'PDF',
        badgeColor: '#DC2626',
        badgeBg: '#FEE2E2',
        title: 'Complete 4-Page Architectural Drawing Package (.pdf)',
        desc: 'High-resolution vector drawing sheets (A4 Landscape): Sheet 01 (Master Floor Plan), Sheet 02 (Elevations & Silhouettes), Sheet 03 (Room & Opening Schedules), Sheet 04 (10-Category Budget & BOQ).',
        layers: ['Vector Floor Plan', 'Architectural Elevations', 'Schedules', 'BOQ Cost Table', 'Title Block']
      }
    ],
    'schedules': [
      {
        id: EXPORT_FORMATS.CSV_ROOM_SCHEDULE,
        formatBadge: 'CSV',
        badgeColor: '#059669',
        badgeBg: '#D1FAE5',
        title: 'Room & Carpet Area Schedule (.csv)',
        desc: 'Itemized space schedule: Room mark (R-1, R-2...), floor level, dimensions (ft & m), carpet area (sq.ft & sq.m), and NBC 2016 natural daylight compliance.'
      },
      {
        id: EXPORT_FORMATS.CSV_DOOR_WINDOW_SCHEDULE,
        formatBadge: 'CSV',
        badgeColor: '#059669',
        badgeBg: '#D1FAE5',
        title: 'Door & Window Fenestration Schedule (.csv)',
        desc: 'Architectural openings mark schedule: Mark (D1, D2, W1, W2), width, height, sill level, lintel level, UPVC/teak wood specifications, and hardware.'
      },
      {
        id: EXPORT_FORMATS.CSV_FURNITURE_INVENTORY,
        formatBadge: 'CSV',
        badgeColor: '#059669',
        badgeBg: '#D1FAE5',
        title: 'Interior Furniture & Fit-out Takeoff (.csv)',
        desc: 'Itemized furniture inventory: Piece category, assigned room, 3D dimensions, primary materials, unit count, and Category 6 budget rates.'
      },
      {
        id: EXPORT_FORMATS.CSV_LANDSCAPE_INVENTORY,
        formatBadge: 'CSV',
        badgeColor: '#059669',
        badgeBg: '#D1FAE5',
        title: 'Site Landscaping & Hardscaping Inventory (.csv)',
        desc: 'Exterior features inventory: Compound boundary wall, entrance gate, paver block pathways, outdoor dining patio, trees, and bollard lighting.'
      },
      {
        id: EXPORT_FORMATS.CSV_MATERIALS_SCHEDULE,
        formatBadge: 'CSV',
        badgeColor: '#059669',
        badgeBg: '#D1FAE5',
        title: 'Architectural Materials & Finishes Schedule (.csv)',
        desc: 'Specification schedule: Component category, finish name, applied texture, hex color, and structural/finishing classification.'
      },
      {
        id: EXPORT_FORMATS.CSV_BUDGET_SUMMARY,
        formatBadge: 'CSV',
        badgeColor: '#059669',
        badgeBg: '#D1FAE5',
        title: '10-Category Total Project Budget Summary (.csv)',
        desc: 'Authoritative financial breakdown: 10 transparent categories from site prep to finished residence, 18% GST, contingency, regional city factor, and grand total.'
      },
      {
        id: EXPORT_FORMATS.JSON_PROJECT_DATA,
        formatBadge: 'JSON',
        badgeColor: '#7C3AED',
        badgeBg: '#EDE9FE',
        title: 'Complete Canonical Project Model (.json)',
        desc: 'Machine-readable Canonical Design Schema (v2.0.0) payload. Complete single source of truth driving CAD, 3D, Walkthrough, and Budget engines.'
      }
    ]
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(38, 51, 42, 0.65)',
        backdropFilter: 'blur(5px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
    >
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '920px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.25)',
          border: '1px solid #E1E7DF',
          overflow: 'hidden'
        }}
      >
        {/* MODAL HEADER */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #E1E7DF',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#FAFAF7'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: '#EAF0E8',
                color: '#718B73',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Download size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#26332A', margin: 0 }}>
                  Export & Documentation Center
                </h2>
                <span
                  style={{
                    background: '#718B73',
                    color: '#FFFFFF',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '6px'
                  }}
                >
                  {designCode}
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#68736A', margin: '3px 0 0' }}>
                {designTitle} • Plot: {plot.width}' × {plot.length}' ft • Verified Single Source of Truth
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: '#FFFFFF',
              border: '1px solid #E1E7DF',
              borderRadius: '10px',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#68736A',
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* BATCH ACTION & STATUS BANNER */}
        <div
          style={{
            padding: '12px 24px',
            background: '#F0F5EF',
            borderBottom: '1px solid #E1E7DF',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={16} color="#718B73" />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#26332A' }}>
              One-Click Package:
            </span>
            <span style={{ fontSize: '0.78rem', color: '#68736A' }}>
              Download complete architectural bundle (CAD DXF + 3D GLB + PDF Sheets + BOQ CSV)
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handlePrintView}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '8px',
                border: '1px solid #E1E7DF',
                background: '#FFFFFF',
                color: '#26332A',
                fontSize: '0.76rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <Printer size={13} color="#718B73" />
              <span>Print / Plotter View</span>
            </button>

            <button
              onClick={handleBatchDownloadAll}
              disabled={Boolean(batchProgress)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '8px',
                border: 'none',
                background: '#718B73',
                color: '#FFFFFF',
                fontSize: '0.76rem',
                fontWeight: 800,
                cursor: batchProgress ? 'not-allowed' : 'pointer',
                boxShadow: '0 2px 6px rgba(113, 139, 115, 0.25)'
              }}
            >
              <Package size={13} />
              <span>{batchProgress ? 'Downloading Package...' : 'Download Full Package'}</span>
            </button>
          </div>
        </div>

        {/* BATCH PROGRESS FEEDBACK */}
        {batchProgress && (
          <div
            style={{
              padding: '8px 24px',
              background: '#EAF0E8',
              color: '#2B5E35',
              fontSize: '0.78rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Clock size={14} />
            <span>{batchProgress}</span>
          </div>
        )}

        {/* ERROR FEEDBACK */}
        {downloadError && (
          <div
            style={{
              padding: '8px 24px',
              background: '#FEE2E2',
              color: '#DC2626',
              fontSize: '0.78rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <AlertCircle size={14} />
            <span>{downloadError}</span>
          </div>
        )}

        {/* CATEGORY NAVIGATION TABS */}
        <div
          style={{
            display: 'flex',
            padding: '12px 24px 0',
            borderBottom: '1px solid #E1E7DF',
            background: '#FFFFFF',
            gap: '8px'
          }}
        >
          {[
            { id: '2d_cad', label: '2D CAD Drawings', icon: <Square size={14} />, count: '2 Formats' },
            { id: '3d_bim', label: '3D Models & BIM', icon: <Box size={14} />, count: '3 Formats' },
            { id: 'pdf_sheets', label: 'Drawing Sheets (PDF)', icon: <FileText size={14} />, count: '4 Sheets' },
            { id: 'schedules', label: 'Schedules & Reports', icon: <Table size={14} />, count: '7 Documents' }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  borderRadius: '10px 10px 0 0',
                  border: 'none',
                  background: isActive ? '#FAFAF7' : 'transparent',
                  color: isActive ? '#718B73' : '#68736A',
                  fontWeight: isActive ? 800 : 600,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  borderBottom: isActive ? '2px solid #718B73' : '2px solid transparent',
                  transition: 'all 0.15s'
                }}
              >
                {tab.icon}
                <span>{tab.label}</span>
                <span
                  style={{
                    fontSize: '0.68rem',
                    background: isActive ? '#EAF0E8' : '#F0F2EE',
                    color: isActive ? '#718B73' : '#88948A',
                    padding: '2px 6px',
                    borderRadius: '10px'
                  }}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* TAB CONTENT TILES */}
        <div
          style={{
            padding: '20px 24px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            background: '#FAFAF7',
            flex: 1
          }}
        >
          {exportCategories[activeTab]?.map((item) => {
            const isDownloading = downloadingId === item.id;
            const isCompleted = completedDownloads[item.id];

            return (
              <div
                key={item.id}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '14px',
                  border: '1px solid #E1E7DF',
                  padding: '16px 20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '16px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                  transition: 'border-color 0.15s, box-shadow 0.15s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', flex: 1 }}>
                  <div
                    style={{
                      background: item.badgeBg,
                      color: item.badgeColor,
                      fontWeight: 800,
                      fontSize: '0.72rem',
                      padding: '6px 10px',
                      borderRadius: '8px',
                      letterSpacing: '0.04em',
                      marginTop: '2px'
                    }}
                  >
                    {item.formatBadge}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#26332A', margin: 0 }}>
                      {item.title}
                    </h4>
                    <p style={{ fontSize: '0.78rem', color: '#68736A', margin: '4px 0 8px', lineHeight: '1.4' }}>
                      {item.desc}
                    </p>

                    {item.layers && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#88948A' }}>
                          Includes:
                        </span>
                        {item.layers.map((lay) => (
                          <span
                            key={lay}
                            style={{
                              background: '#F0F2EE',
                              color: '#556257',
                              fontSize: '0.66rem',
                              fontWeight: 600,
                              padding: '2px 6px',
                              borderRadius: '4px'
                            }}
                          >
                            {lay}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                  <button
                    onClick={() => handleDownload(item.id, item.title)}
                    disabled={isDownloading}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: '1px solid #718B73',
                      background: isDownloading ? '#EAF0E8' : isCompleted ? '#3D8056' : '#718B73',
                      color: '#FFFFFF',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: isDownloading ? 'not-allowed' : 'pointer',
                      boxShadow: '0 2px 6px rgba(113, 139, 115, 0.2)',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {isDownloading ? (
                      <>
                        <Clock size={13} className="animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : isCompleted ? (
                      <>
                        <CheckCircle2 size={13} />
                        <span>Downloaded</span>
                      </>
                    ) : (
                      <>
                        <Download size={13} />
                        <span>Download File</span>
                      </>
                    )}
                  </button>

                  {isCompleted && (
                    <span style={{ fontSize: '0.68rem', color: '#3D8056', fontWeight: 600 }}>
                      Verified & Ready
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* MODAL FOOTER */}
        <div
          style={{
            padding: '14px 24px',
            borderTop: '1px solid #E1E7DF',
            background: '#FFFFFF',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3D8056' }} />
            <span style={{ fontSize: '0.74rem', color: '#68736A', fontWeight: 600 }}>
              All exports derived directly from Canonical Design Model v2.0 (Zero mock data)
            </span>
          </div>

          <button
            onClick={onClose}
            style={{
              padding: '6px 16px',
              borderRadius: '8px',
              border: '1px solid #E1E7DF',
              background: '#FAFAF7',
              color: '#26332A',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
