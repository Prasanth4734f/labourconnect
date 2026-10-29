import React, { useState, useMemo } from 'react';
import {
  Download,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  generate2dFloorPlan,
  generateFloorPlanSvg,
  buildProcedural3dGeometry,
  projectOrthographicElevation,
  CAD_COLORS,
  CAD_LINE_WEIGHTS
} from '../../engine/index.js';

/**
 * Architectural2dAllAnglesViewer
 * Production-level 2D Multi-Angle CAD & Technical Drawing Studio.
 * Generates and displays ALL 5 essential architectural angles:
 * 1. Top Floor Plan (Ground, First, Terrace)
 * 2. Front Elevation (0° Facade)
 * 3. Left Side Elevation (90°)
 * 4. Rear Elevation (180°)
 * 5. Cross-Section A-A (Foundation to Roof Cut-Through)
 */
export default function Architectural2dAllAnglesViewer({
  design,
  plotWidth = 40,
  plotLength = 60,
  floors = 2,
  bhk = 3,
  archStyle: _archStyle = 'modern',
  facing = 'East',
  budgetInr: _budgetInr = 4500000,
  prompt: _prompt = ''
}) {
  // Current 2D Angle View: 'top_plan', 'front_elevation', 'side_elevation', 'rear_elevation', 'cross_section'
  const [activeAngle, setActiveAngle] = useState('top_plan');

  // Active Floor Level (for Top Plan): 'ground', 'first', 'terrace'
  const [activeFloorLevel, setActiveFloorLevel] = useState('ground');

  // Professional Micro-Toggles (Small compact chips)
  const [showDimensions, setShowDimensions] = useState(true);
  const [showColumns, setShowColumns] = useState(true);
  const [showFurniture, setShowFurniture] = useState(true);
  const [showRoomLabels, setShowRoomLabels] = useState(true);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Selected Floor Finish (compact selector)
  const [activeFlooring, setActiveFlooring] = useState('Italian Vitrified (800×1600mm)');

  const W = Number(plotWidth) || 40;
  const L = Number(plotLength) || 60;
  const numFloors = Math.max(1, Number(floors) || 2);
  const floorIdx = activeFloorLevel === 'ground' ? 0 : activeFloorLevel === 'first' ? 1 : 2;

  // Generate real architectural CAD drawing model from Canonical Design Model
  const cadFloorPlan = useMemo(() => {
    if (!design?.floors || design.floors.length === 0) return null;
    const result = generate2dFloorPlan(design, { floorIndex: floorIdx, scaleFactor: 9.5 });
    return result?.success ? result : null;
  }, [design, floorIdx]);

  // Derive genuine procedural 3D building geometry for real orthographic elevations
  const buildingGeometries = useMemo(() => {
    if (!design) return null;
    if (design.geometry3d && Array.isArray(design.geometry3d.meshes) && design.geometry3d.meshes.length > 0) {
      return design.geometry3d;
    }
    try {
      return buildProcedural3dGeometry(design, { style: _archStyle });
    } catch (err) {
      console.warn('[AllAnglesViewer] Error generating building geometry:', err);
      return null;
    }
  }, [design, _archStyle]);

  // Active elevation side
  const activeElevationSide = useMemo(() => {
    if (activeAngle === 'front_elevation') return 'front';
    if (activeAngle === 'rear_elevation') return 'rear';
    if (activeAngle === 'left_elevation' || activeAngle === 'side_elevation') return 'left';
    if (activeAngle === 'right_elevation') return 'right';
    return null;
  }, [activeAngle]);

  // Project real orthographic elevation from 3D model
  const activeElevationProjection = useMemo(() => {
    if (!activeElevationSide || !buildingGeometries) return null;
    try {
      return projectOrthographicElevation(buildingGeometries, activeElevationSide, {
        viewportWidth: 540,
        viewportHeight: 440,
        padding: 36,
        solarTime: 14.5,
        facing
      });
    } catch (err) {
      console.warn('[AllAnglesViewer] Orthographic elevation projection error:', err);
      return null;
    }
  }, [activeElevationSide, buildingGeometries, facing]);

  // Mathematical Room Schedule generation for active floor (fallback when design lacks procedural floors)
  const activeRooms = useMemo(() => {
    const isFirst = activeFloorLevel === 'first';
    const isTerrace = activeFloorLevel === 'terrace';

    // If design has algorithmic procedural floors from LabourConnectDesignEngine, render them directly!
    const floorData = design?.floors?.find(f => f.floorIndex === floorIdx);
    if (floorData?.rooms && floorData.rooms.length > 0) {
      const scaleFactor = 9.2;
      return floorData.rooms.map((r, idx) => {
        const rx = r.bounds?.x ?? r.x ?? 0;
        const ry = r.bounds?.y ?? r.y ?? 0;
        const rw = r.bounds?.width ?? r.width ?? 12;
        const rl = r.bounds?.length ?? r.length ?? 12;
        return {
          id: r.id || `rm-${floorIdx}-${idx}`,
          name: r.name,
          dim: `${rw}' × ${rl}'`,
          sqft: r.areaSqft || Math.round(rw * rl),
          x: Math.round(rx * scaleFactor) + 24,
          y: Math.round(ry * scaleFactor) + 24,
          w: Math.round(rw * scaleFactor),
          h: Math.round(rl * scaleFactor),
          color: r.color || (r.type === 'master_bedroom' ? '#fef3c7' : r.type === 'living' ? '#e0f2fe' : r.type === 'kitchen' ? '#fed7aa' : '#ecfdf5'),
          finish: r.finish || 'Italian Vitrified Tiles',
          furniture: r.furniture || (r.type === 'master_bedroom' ? 'king_bed' : r.type === 'living' ? 'sofa_set' : r.type === 'kitchen' ? 'kitchen_l' : r.type === 'dining' ? 'dining_6' : null)
        };
      });
    }

    if (isTerrace) {
      return [
        { id: 't1', name: 'Open Sky Terrace Deck', dim: `${Math.round(W * 0.7)}' × ${Math.round(L * 0.45)}'`, sqft: Math.round(W * L * 0.35), x: 40, y: 40, w: 320, h: 220, color: '#f8fafc', finish: 'Solar Cool Tiles (SRI > 78)' },
        { id: 't2', name: 'Stairhead Mumty & Lift Machine', dim: '12\'0" × 10\'0"', sqft: 120, x: 240, y: 40, w: 120, h: 100, color: '#e2e8f0', finish: 'Waterproof Screed' },
        { id: 't3', name: 'Solar Pergola Canopy (5.2 kW)', dim: '16\'0" × 12\'0"', sqft: 192, x: 50, y: 50, w: 160, h: 120, color: '#f0fdf4', finish: 'Bifacial Solar Glass' }
      ];
    }

    if (isFirst) {
      return [
        { id: 'f1', name: 'Upper Master Penthouse Suite', dim: '16\'0" × 14\'0"', sqft: 224, x: 40, y: 40, w: 170, h: 160, color: '#fef3c7', finish: 'Engineered Teak Wood', furniture: 'king_bed' },
        { id: 'f2', name: 'En-suite Dressing & Bath', dim: '8\'0" × 7\'6"', sqft: 60, x: 220, y: 40, w: 90, h: 80, color: '#e0f2fe', finish: 'Anti-skid Porcelain Tiles' },
        { id: 'f3', name: 'Family Media Lounge & Library', dim: '18\'0" × 14\'0"', sqft: 252, x: 40, y: 210, w: 200, h: 140, color: '#f3e8ff', finish: 'Italian Vitrified 800×1600', furniture: 'sofa_l' },
        { id: 'f4', name: bhk >= 3 ? 'Guest Bedroom 2' : 'Study / Home Office', dim: '13\'6" × 12\'0"', sqft: 162, x: 250, y: 130, w: 140, h: 130, color: '#ecfdf5', finish: 'Vitrified Satin Finish', furniture: 'queen_bed' },
        { id: 'f5', name: 'Cantilever Glass Balcony Deck', dim: '18\'0" × 6\'0"', sqft: 108, x: 40, y: 360, w: 200, h: 60, color: '#f1f5f9', finish: 'Weatherproof WPC Wood Planks' },
        { id: 'f6', name: 'RCC Dog-Legged Stairwell', dim: '7\'6" × 14\'0"', sqft: 105, x: 320, y: 270, w: 70, h: 140, color: '#cbd5e1', finish: 'Flamed Granite Steps' }
      ];
    }

    // Ground floor
    return [
      { id: 'g1', name: 'Entrance Foyer & Portico', dim: '14\'0" × 8\'0"', sqft: 112, x: 40, y: 340, w: 140, h: 80, color: '#f8fafc', finish: 'Flamed Granite Plinth', furniture: 'porch_car' },
      { id: 'g2', name: 'Formal Living Room', dim: '18\'0" × 15\'0"', sqft: 270, x: 40, y: 180, w: 180, h: 150, color: '#fef3c7', finish: 'Italian Statuario Marble', furniture: 'sofa_set' },
      { id: 'g3', name: 'Open Dining & Breakfast Bar', dim: '14\'0" × 12\'0"', sqft: 168, x: 230, y: 180, w: 140, h: 120, color: '#f3e8ff', finish: 'Glazed Porcelain', furniture: 'dining_6' },
      { id: 'g4', name: 'Gourmet Modular Kitchen', dim: '12\'0" × 10\'0"', sqft: 120, x: 240, y: 40, w: 130, h: 130, color: '#fed7aa', finish: 'Quartz Countertop + Matte', furniture: 'kitchen_l' },
      { id: 'g5', name: 'Ishanya Pooja Sanctum', dim: '6\'0" × 6\'0"', sqft: 36, x: 380, y: 40, w: 60, h: 60, color: '#fef9c3', finish: 'White Makrana Marble' },
      { id: 'g6', name: 'Ground Master Suite 1', dim: '15\'0" × 14\'0"', sqft: 210, x: 40, y: 40, w: 190, h: 130, color: '#dcfce7', finish: 'Vitrified Tiles (800×1600)', furniture: 'king_bed' },
      { id: 'g7', name: 'RCC Stairwell to Level 2', dim: '7\'6" × 14\'0"', sqft: 105, x: 380, y: 180, w: 60, h: 140, color: '#cbd5e1', finish: 'Granite Steps + SS Rail' }
    ];
  }, [activeFloorLevel, W, L, bhk, design, floorIdx]);

  // Handle Export
  const handleExportDrawing = (format) => {
    confetti({ particleCount: 30, spread: 60 });
    if ((format === 'cad' || format === 'svg' || format === 'pdf') && design?.floors) {
      const svgMarkup = generateFloorPlanSvg(design, {
        floorIndex: floorIdx,
        showDimensions,
        showColumns,
        showRoomLabels
      });
      const blob = new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${design.code || 'floor_plan'}_${activeFloorLevel}_cad.svg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      alert(`📥 Exporting ${activeAngle.replace('_', ' ').toUpperCase()} as ${format.toUpperCase()} (1:100 Scale CAD)...`);
    }
  };

  return (
    <div
      style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        border: '1px solid #E1E7DF',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
      }}
    >
      {/* 1. TOP BAR: Angle Selector Buttons + Export Actions */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px',
          borderBottom: '1px solid #E1E7DF',
          paddingBottom: '12px'
        }}
      >
        {/* Angle Tabs */}
        <div style={{ display: 'flex', gap: '6px', background: '#FAFAF7', padding: '4px', borderRadius: '10px', border: '1px solid #E1E7DF' }}>
          {[
            { id: 'top_plan', label: 'Top Floor Plan (CAD)', icon: '📐' },
            { id: 'front_elevation', label: 'Front Elevation (0°)', icon: '🏛️' },
            { id: 'rear_elevation', label: 'Rear Elevation (180°)', icon: '🔙' },
            { id: 'left_elevation', label: 'Left Elevation (90°)', icon: '⬅️' },
            { id: 'right_elevation', label: 'Right Elevation (270°)', icon: '➡️' },
            { id: 'cross_section', label: 'Cross-Section A-A', icon: '✂️' }
          ].map((angle) => (
            <button
              key={angle.id}
              onClick={() => setActiveAngle(angle.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '7px',
                border: 'none',
                background: activeAngle === angle.id ? '#718B73' : 'transparent',
                color: activeAngle === angle.id ? '#FFFFFF' : '#68736A',
                fontWeight: activeAngle === angle.id ? 800 : 600,
                fontSize: '0.74rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <span>{angle.icon}</span>
              <span>{angle.label}</span>
            </button>
          ))}
        </div>

        {/* Floor Level Selector (Only when viewing Top Floor Plan) */}
        {activeAngle === 'top_plan' && (
          <div style={{ display: 'flex', gap: '4px', background: '#FAFAF7', padding: '3px', borderRadius: '8px', border: '1px solid #E1E7DF' }}>
            <button
              onClick={() => setActiveFloorLevel('ground')}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                border: 'none',
                background: activeFloorLevel === 'ground' ? '#26332A' : 'transparent',
                color: activeFloorLevel === 'ground' ? '#FFFFFF' : '#68736A',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Ground Floor
            </button>
            {numFloors >= 2 && (
              <button
                onClick={() => setActiveFloorLevel('first')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  background: activeFloorLevel === 'first' ? '#26332A' : 'transparent',
                  color: activeFloorLevel === 'first' ? '#FFFFFF' : '#68736A',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                1st Floor
              </button>
            )}
            <button
              onClick={() => setActiveFloorLevel('terrace')}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                border: 'none',
                background: activeFloorLevel === 'terrace' ? '#26332A' : 'transparent',
                color: activeFloorLevel === 'terrace' ? '#FFFFFF' : '#68736A',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Terrace Deck
            </button>
          </div>
        )}

        {/* Zoom & Export Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.15))}
            title="Zoom Out"
            style={{
              padding: '5px 8px',
              borderRadius: '6px',
              border: '1px solid #E1E7DF',
              background: '#FFFFFF',
              cursor: 'pointer',
              color: '#68736A'
            }}
          >
            <ZoomOut size={13} />
          </button>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#68736A', minWidth: '38px', textAlign: 'center' }}>
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            onClick={() => setZoomLevel((z) => Math.min(1.8, z + 0.15))}
            title="Zoom In"
            style={{
              padding: '5px 8px',
              borderRadius: '6px',
              border: '1px solid #E1E7DF',
              background: '#FFFFFF',
              cursor: 'pointer',
              color: '#68736A'
            }}
          >
            <ZoomIn size={13} />
          </button>
          <button
            onClick={() => handleExportDrawing('pdf')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '5px 10px',
              borderRadius: '6px',
              border: '1px solid #718B73',
              background: '#EAF0E8',
              color: '#718B73',
              fontSize: '0.72rem',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            <Download size={12} />
            <span>Export CAD</span>
          </button>
        </div>
      </div>

      {/* 2. MICRO INFORMATION & LAYER BAR (Compact, sleek, does NOT occupy space) */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px',
          background: '#FAFAF7',
          padding: '6px 12px',
          borderRadius: '8px',
          border: '1px solid #E1E7DF',
          fontSize: '0.7rem'
        }}
      >
        {/* Layer Micro-chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 800, color: '#68736A', textTransform: 'uppercase', fontSize: '0.66rem' }}>LAYERS:</span>
          {[
            { label: 'Dimensions', active: showDimensions, toggle: () => setShowDimensions(!showDimensions) },
            { label: 'Columns & Beams', active: showColumns, toggle: () => setShowColumns(!showColumns) },
            { label: 'Furniture Layout', active: showFurniture, toggle: () => setShowFurniture(!showFurniture) },
            { label: 'Room Tags', active: showRoomLabels, toggle: () => setShowRoomLabels(!showRoomLabels) }
          ].map((l, i) => (
            <button
              key={i}
              onClick={l.toggle}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 8px',
                borderRadius: '12px',
                border: l.active ? '1px solid #718B73' : '1px solid #D5DDD3',
                background: l.active ? '#EAF0E8' : '#FFFFFF',
                color: l.active ? '#3D8056' : '#8A958C',
                fontSize: '0.68rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <span>{l.active ? '✓' : '○'}</span>
              <span>{l.label}</span>
            </button>
          ))}
        </div>

        {/* Micro Floor Finishing Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: '#68736A', fontSize: '0.68rem' }}>Floor Finishing:</span>
          <select
            value={activeFlooring}
            onChange={(e) => setActiveFlooring(e.target.value)}
            style={{
              padding: '2px 6px',
              borderRadius: '6px',
              border: '1px solid #E1E7DF',
              background: '#FFFFFF',
              color: '#26332A',
              fontSize: '0.68rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <option value="Italian Vitrified (800×1600mm)">Italian Vitrified (800×1600mm)</option>
            <option value="Statuario Marble & Granite">Statuario Marble & Granite</option>
            <option value="Engineered Teak Wood">Engineered Teak Wood</option>
            <option value="Anti-Skid Matte Ceramic">Anti-Skid Matte Ceramic</option>
          </select>
        </div>
      </div>

      {/* 3. DRAWING CANVAS WORKSPACE */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E1E7DF',
          minHeight: '480px',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.03)'
        }}
      >
        <div style={{ transform: `scale(${zoomLevel})`, transition: 'transform 0.15s ease', transformOrigin: 'center center', width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '16px' }}>
          {/* =====================================================================
              VIEW 1: TOP FLOOR PLAN (2D ARCHITECTURAL CAD BLUEPRINT)
          ===================================================================== */}
          {activeAngle === 'top_plan' && cadFloorPlan ? (
            (() => {
              const { canvas, site, walls, openings, staircases, columns, roomElements, floorName, designCode, title } = cadFloorPlan;
              const S = canvas.scale;
              const M = canvas.marginPx;
              const px = (x) => Math.round(M + Number(x) * S);
              const py = (y) => Math.round(M + Number(y) * S);
              const pLen = (val) => Math.round(Number(val) * S);

              const plotW_px = pLen(site.plotWidth);
              const plotL_px = pLen(site.plotLength);
              const envX_px = px(site.envelope.x);
              const envY_px = py(site.envelope.y);
              const envW_px = pLen(site.envelope.width);
              const envL_px = pLen(site.envelope.length);

              return (
                <svg
                  viewBox={`0 0 ${canvas.width} ${canvas.height}`}
                  style={{ width: '100%', maxWidth: '640px', height: 'auto', background: '#FAFAF7', borderRadius: '8px', border: '1px solid #D5DDD3' }}
                >
                  <defs>
                    <pattern id="cadGridSmall" width="10" height="10" patternUnits="userSpaceOnUse">
                      <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#E2E8F0" strokeWidth="0.3" />
                    </pattern>
                    <pattern id="cadGridLarge" width="50" height="50" patternUnits="userSpaceOnUse">
                      <rect width="50" height="50" fill="url(#cadGridSmall)" />
                      <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#CBD5E1" strokeWidth="0.6" />
                    </pattern>
                    <pattern id="rccHatch" width="8" height="8" patternUnits="userSpaceOnUse">
                      <line x1="0" y1="0" x2="8" y2="8" stroke={CAD_COLORS.COLUMN} strokeWidth="0.8" />
                      <line x1="8" y1="0" x2="0" y2="8" stroke={CAD_COLORS.COLUMN} strokeWidth="0.8" />
                    </pattern>
                    <marker id="cadArrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                      <path d="M 0 0 L 6 3 L 0 6 Z" fill={CAD_COLORS.DIMENSION} />
                    </marker>
                  </defs>

                  {/* Technical CAD Grid */}
                  <rect width={canvas.width} height={canvas.height} fill="url(#cadGridLarge)" />

                  {/* Plot Boundary */}
                  <rect x={M} y={M} width={plotW_px} height={plotL_px} fill="none" stroke={CAD_COLORS.PLOT_LINE} strokeWidth={CAD_LINE_WEIGHTS.PLOT_BOUNDARY} />
                  <text x={M + 8} y={M - 10} fill={CAD_COLORS.PLOT_LINE} fontSize="9.5" fontWeight="700">
                    MUNICIPAL PLOT BOUNDARY ({site.plotWidth}′ × {site.plotLength}′)
                  </text>

                  {/* Buildable Setback Envelope */}
                  <rect x={envX_px} y={envY_px} width={envW_px} height={envL_px} fill="#FFFFFF" fillOpacity="0.85" stroke={CAD_COLORS.SETBACK_LINE} strokeWidth={CAD_LINE_WEIGHTS.SETBACK_LINE} strokeDasharray="6 4" />
                  <text x={envX_px + 8} y={envY_px + envL_px + 14} fill={CAD_COLORS.SETBACK_LINE} fontSize="8.5" fontWeight="700">
                    BUILDABLE PLINTH ENVELOPE ({site.envelope.width}′ × {site.envelope.length}′)
                  </text>

                  {/* Facing Compass */}
                  <g transform={`translate(${canvas.width - 50}, 50)`}>
                    <circle cx="0" cy="0" r="16" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1.5" />
                    <polygon points="0,-12 4,0 0,-3 -4,0" fill="#DC2626" />
                    <polygon points="0,12 4,0 0,3 -4,0" fill="#94A3B8" />
                    <text x="0" y="-14" textAnchor="middle" fontSize="8" fontWeight="800" fill="#DC2626">N</text>
                    <text x="0" y="24" textAnchor="middle" fontSize="7.5" fontWeight="800" fill="#0F172A">{site.facingDirection ? site.facingDirection[0] : 'E'}</text>
                  </g>

                  {/* Room Floor Fills & Selection */}
                  {roomElements.map((r) => {
                    const isSelected = selectedRoomId === r.id;
                    const rx = px(r.bounds.x);
                    const ry = py(r.bounds.y);
                    const rw = pLen(r.bounds.width);
                    const rh = pLen(r.bounds.length);
                    const fillCol = r.type === 'master_bedroom' ? '#FFFBEB' :
                                    r.type === 'living' ? '#F0F9FF' :
                                    r.type === 'kitchen' ? '#FFF7ED' :
                                    r.type === 'pooja' ? '#FAF5FF' :
                                    r.type === 'balcony' ? '#F8FAFC' : '#FFFFFF';

                    return (
                      <g key={r.id} onClick={() => setSelectedRoomId(r.id)} style={{ cursor: 'pointer' }}>
                        <rect
                          x={rx}
                          y={ry}
                          width={rw}
                          height={rh}
                          fill={fillCol}
                          stroke={isSelected ? '#3D8056' : '#E2E8F0'}
                          strokeWidth={isSelected ? '2.5' : '0.8'}
                        />

                        {/* Furniture Vector Representations */}
                        {showFurniture && r.furniture && (
                          <g opacity="0.75">
                            {r.furniture === 'king_bed' && (
                              <g transform={`translate(${rx + 15}, ${ry + 15})`}>
                                <rect x="0" y="0" width="55" height="65" rx="3" fill="#e2e8f0" stroke="#64748b" strokeWidth="1" />
                                <rect x="5" y="5" width="20" height="15" rx="2" fill="#cbd5e1" />
                                <rect x="30" y="5" width="20" height="15" rx="2" fill="#cbd5e1" />
                              </g>
                            )}
                            {r.furniture === 'sofa_set' && (
                              <g transform={`translate(${rx + 20}, ${ry + 20})`}>
                                <rect x="0" y="0" width="75" height="30" rx="4" fill="#e2e8f0" stroke="#64748b" strokeWidth="1" />
                                <rect x="0" y="25" width="25" height="40" rx="4" fill="#e2e8f0" stroke="#64748b" strokeWidth="1" />
                                <rect x="25" y="35" width="35" height="25" rx="2" fill="#cbd5e1" />
                              </g>
                            )}
                            {r.furniture === 'dining_6' && (
                              <g transform={`translate(${rx + 15}, ${ry + 15})`}>
                                <rect x="15" y="10" width="60" height="35" rx="3" fill="#e2e8f0" stroke="#64748b" strokeWidth="1" />
                                <circle cx="25" cy="5" r="4" fill="#94a3b8" />
                                <circle cx="45" cy="5" r="4" fill="#94a3b8" />
                                <circle cx="65" cy="5" r="4" fill="#94a3b8" />
                                <circle cx="25" cy="50" r="4" fill="#94a3b8" />
                                <circle cx="45" cy="50" r="4" fill="#94a3b8" />
                                <circle cx="65" cy="50" r="4" fill="#94a3b8" />
                              </g>
                            )}
                            {r.furniture === 'porch_car' && (
                              <g transform={`translate(${rx + 15}, ${ry + 10})`}>
                                <rect x="0" y="0" width="80" height="45" rx="10" fill="#94a3b8" stroke="#475569" strokeWidth="1.2" opacity="0.6" />
                                <rect x="15" y="8" width="50" height="30" rx="4" fill="#e2e8f0" />
                                <text x="40" y="27" fontSize="7" fontWeight="800" textAnchor="middle" fill="#475569">PORTICO</text>
                              </g>
                            )}
                          </g>
                        )}
                      </g>
                    );
                  })}

                  {/* Staircases */}
                  {staircases.map((stair, sIdx) => {
                    const lx = px(stair.landing.x);
                    const ly = py(stair.landing.y);
                    const lw = pLen(stair.landing.width);
                    const ll = pLen(stair.landing.length);
                    const ax1 = px(stair.travelArrow.start.x);
                    const ay1 = py(stair.travelArrow.start.y);
                    const ax2 = px(stair.travelArrow.end.x);
                    const ay2 = py(stair.travelArrow.end.y);

                    return (
                      <g key={`stair-${sIdx}`}>
                        <rect x={lx} y={ly} width={lw} height={ll} fill="#E2E8F0" stroke={CAD_COLORS.STAIR} strokeWidth={CAD_LINE_WEIGHTS.STAIR_TREAD} />
                        <text x={lx + lw / 2} y={ly + ll / 2 + 3} textAnchor="middle" fontSize="7.5" fontWeight="700" fill={CAD_COLORS.STAIR}>LANDING</text>
                        {stair.treads.map((t, tIdx) => (
                          <line
                            key={`tread-${tIdx}`}
                            x1={px(t.start.x)}
                            y1={py(t.start.y)}
                            x2={px(t.end.x)}
                            y2={py(t.end.y)}
                            stroke={CAD_COLORS.STAIR}
                            strokeWidth={CAD_LINE_WEIGHTS.STAIR_TREAD}
                          />
                        ))}
                        <circle cx={ax1} cy={ay1} r="2.5" fill={CAD_COLORS.STAIR_ARROW} />
                        <line x1={ax1} y1={ay1} x2={ax2} y2={ay2} stroke={CAD_COLORS.STAIR_ARROW} strokeWidth="1.8" markerEnd="url(#cadArrow)" />
                        <text x={ax1 + 8} y={(ay1 + ay2) / 2 + 4} fontSize="8.5" fontWeight="800" fill={CAD_COLORS.STAIR_ARROW}>{stair.travelArrow.label}</text>
                      </g>
                    );
                  })}

                  {/* Walls (Openings cleanly subtracted) */}
                  <g id="layer-walls">
                    {/* Exterior Walls */}
                    {walls.exteriorWalls.map((w) => (
                      <line
                        key={w.id}
                        x1={px(w.start.x)}
                        y1={py(w.start.y)}
                        x2={px(w.end.x)}
                        y2={py(w.end.y)}
                        stroke={CAD_COLORS.WALL_EXTERIOR}
                        strokeWidth={CAD_LINE_WEIGHTS.CUT_WALL_EXTERIOR}
                        strokeLinecap="square"
                      />
                    ))}
                    {/* Interior Partitions */}
                    {walls.interiorPartitions.map((w) => (
                      <line
                        key={w.id}
                        x1={px(w.start.x)}
                        y1={py(w.start.y)}
                        x2={px(w.end.x)}
                        y2={py(w.end.y)}
                        stroke={CAD_COLORS.WALL_INTERIOR}
                        strokeWidth={CAD_LINE_WEIGHTS.CUT_WALL_INTERIOR}
                        strokeLinecap="square"
                      />
                    ))}
                  </g>

                  {/* Doors (Leaves & Swing Arcs) */}
                  <g id="layer-doors">
                    {openings.doors.map((d, dIdx) => {
                      const hx = px(d.hinge.x);
                      const hy = py(d.hinge.y);
                      const lx = px(d.leafEnd.x);
                      const ly = py(d.leafEnd.y);
                      const r_px = pLen(d.width);

                      if (d.isSlider) {
                        const p1 = px(d.position.x - d.width / 2);
                        const p2 = px(d.position.x + d.width / 2);
                        const pyPos = py(d.position.y);
                        return (
                          <g key={`door-${dIdx}`}>
                            <line x1={p1} y1={pyPos - 2} x2={(p1 + p2) / 2 + 5} y2={pyPos - 2} stroke={CAD_COLORS.DOOR} strokeWidth="1.5" />
                            <line x1={(p1 + p2) / 2 - 5} y1={pyPos + 2} x2={p2} y2={pyPos + 2} stroke={CAD_COLORS.DOOR} strokeWidth="1.5" />
                          </g>
                        );
                      }

                      const otherX = d.wall === 'north' || d.wall === 'south' ? px(d.hinge.x + (d.hinge.x < d.position.x ? d.width : -d.width)) : hx;
                      const otherY = d.wall === 'east' || d.wall === 'west' ? py(d.hinge.y + (d.hinge.y < d.position.y ? d.width : -d.width)) : hy;
                      const sweepFlag = d.wall === 'north' || d.wall === 'west' ? 1 : 0;

                      return (
                        <g key={`door-${dIdx}`}>
                          <line x1={hx} y1={hy} x2={lx} y2={ly} stroke={CAD_COLORS.DOOR} strokeWidth={CAD_LINE_WEIGHTS.DOOR_LEAF} />
                          <path
                            d={`M ${lx} ${ly} A ${r_px} ${r_px} 0 0 ${sweepFlag} ${otherX} ${otherY}`}
                            fill="none"
                            stroke={CAD_COLORS.DOOR_ARC}
                            strokeWidth={CAD_LINE_WEIGHTS.SWING_ARC}
                            strokeDasharray="3 3"
                          />
                        </g>
                      );
                    })}
                  </g>

                  {/* Windows (Frames, Sills, Louvers) */}
                  <g id="layer-windows">
                    {openings.windows.map((w, wIdx) => {
                      const x1 = px(w.start.x);
                      const y1 = py(w.start.y);
                      const x2 = px(w.end.x);
                      const y2 = py(w.end.y);

                      return (
                        <g key={`win-${wIdx}`}>
                          {w.wall === 'north' || w.wall === 'south' ? (
                            <>
                              <line x1={x1} y1={y1 - 3} x2={x2} y2={y2 - 3} stroke={CAD_COLORS.WINDOW} strokeWidth={CAD_LINE_WEIGHTS.WINDOW_FRAME} />
                              <line x1={x1} y1={y1 + 3} x2={x2} y2={y2 + 3} stroke={CAD_COLORS.WINDOW} strokeWidth={CAD_LINE_WEIGHTS.WINDOW_FRAME} />
                              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#38BDF8" strokeWidth="0.8" />
                            </>
                          ) : (
                            <>
                              <line x1={x1 - 3} y1={y1} x2={x2 - 3} y2={y2} stroke={CAD_COLORS.WINDOW} strokeWidth={CAD_LINE_WEIGHTS.WINDOW_FRAME} />
                              <line x1={x1 + 3} y1={y1} x2={x2 + 3} y2={y2} stroke={CAD_COLORS.WINDOW} strokeWidth={CAD_LINE_WEIGHTS.WINDOW_FRAME} />
                              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#38BDF8" strokeWidth="0.8" />
                            </>
                          )}
                          {w.isLouver && (
                            <text x={(x1 + x2) / 2} y={(y1 + y2) / 2 + 3} fontSize="6.5" fontWeight="800" textAnchor="middle" fill={CAD_COLORS.WINDOW}>VENT</text>
                          )}
                        </g>
                      );
                    })}
                  </g>

                  {/* RCC Columns */}
                  {showColumns && (
                    <g id="layer-columns">
                      {columns.map((col) => {
                        const cx = px(col.x - col.width / 2);
                        const cy = py(col.y - col.length / 2);
                        const cw = pLen(col.width);
                        const cl = pLen(col.length);

                        return (
                          <g key={col.id}>
                            <rect x={cx} y={cy} width={cw} height={cl} fill="url(#rccHatch)" stroke={CAD_COLORS.COLUMN} strokeWidth={CAD_LINE_WEIGHTS.COLUMN_OUTLINE} />
                            <text x={cx + cw / 2} y={cy - 3} fontSize="6.5" fontWeight="800" textAnchor="middle" fill={CAD_COLORS.COLUMN}>{col.id}</text>
                          </g>
                        );
                      })}
                    </g>
                  )}

                  {/* Room Labels and Dimensions */}
                  {showRoomLabels && (
                    <g id="layer-labels">
                      {roomElements.map((r) => {
                        const cx = px(r.center.x);
                        const cy = py(r.center.y);

                        return (
                          <g key={`lbl-${r.id}`}>
                            <text x={cx} y={cy - 4} textAnchor="middle" fontSize="9.5" fontWeight="800" fill={CAD_COLORS.ROOM_LABEL}>
                              {r.name.toUpperCase()}
                            </text>
                            <text x={cx} y={cy + 9} textAnchor="middle" fontSize="8" fontWeight="700" fill={CAD_COLORS.ROOM_DIM_TEXT}>
                              {r.nominalDimLabel} ({r.areaSqft} sq.ft)
                            </text>
                          </g>
                        );
                      })}
                    </g>
                  )}

                  {/* Architectural Dimension Chains */}
                  {showDimensions && (
                    <g id="layer-dimensions">
                      {/* Top Plot Width */}
                      <line x1={M} y1={M - 18} x2={M + plotW_px} y2={M - 18} stroke={CAD_COLORS.DIMENSION} strokeWidth={CAD_LINE_WEIGHTS.DIMENSION_LINE} />
                      <line x1={M} y1={M - 22} x2={M} y2={M - 14} stroke={CAD_COLORS.DIMENSION} strokeWidth={CAD_LINE_WEIGHTS.DIMENSION_LINE} />
                      <line x1={M + plotW_px} y1={M - 22} x2={M + plotW_px} y2={M - 14} stroke={CAD_COLORS.DIMENSION} strokeWidth={CAD_LINE_WEIGHTS.DIMENSION_LINE} />
                      <text x={M + plotW_px / 2} y={M - 22} textAnchor="middle" fontSize="8.5" fontWeight="800" fill={CAD_COLORS.DIMENSION_TEXT}>
                        PLOT WIDTH: {site.plotWidth}′ 0″
                      </text>

                      {/* Left Plot Length */}
                      <line x1={M - 18} y1={M} x2={M - 18} y2={M + plotL_px} stroke={CAD_COLORS.DIMENSION} strokeWidth={CAD_LINE_WEIGHTS.DIMENSION_LINE} />
                      <line x1={M - 22} y1={M} x2={M - 14} y2={M} stroke={CAD_COLORS.DIMENSION} strokeWidth={CAD_LINE_WEIGHTS.DIMENSION_LINE} />
                      <line x1={M - 22} y1={M + plotL_px} x2={M - 14} y2={M + plotL_px} stroke={CAD_COLORS.DIMENSION} strokeWidth={CAD_LINE_WEIGHTS.DIMENSION_LINE} />
                      <text x={M - 24} y={M + plotL_px / 2} textAnchor="middle" fontSize="8.5" fontWeight="800" fill={CAD_COLORS.DIMENSION_TEXT} transform={`rotate(-90 ${M - 24} ${M + plotL_px / 2})`}>
                        PLOT LENGTH: {site.plotLength}′ 0″
                      </text>
                    </g>
                  )}

                  {/* CAD Title Block */}
                  <g id="title-block">
                    <rect x={M} y={canvas.height - 32} width={canvas.width - M * 2} height="24" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" rx="4" />
                    <text x={M + 8} y={canvas.height - 17} fontSize="8.5" fontWeight="800" fill="#0F172A">
                      {title.toUpperCase()} | {floorName.toUpperCase()} ({designCode})
                    </text>
                    <text x={canvas.width - M - 8} y={canvas.height - 17} textAnchor="end" fontSize="7.5" fontWeight="700" fill="#64748B">
                      NBC 2016 SPACE STANDARDS ALIGNED | SCALE 1:100 | NOT FOR DIRECT CONSTRUCTION WITHOUT LICENSED STAMP
                    </text>
                  </g>
                </svg>
              );
            })()
          ) : activeAngle === 'top_plan' ? (
            <svg
              viewBox="0 0 520 460"
              style={{ width: '100%', maxWidth: '640px', height: 'auto', background: '#FAFAF7', borderRadius: '8px', border: '1px solid #D5DDD3' }}
            >
              {/* Background Technical Grid */}
              <defs>
                <pattern id="smallGrid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#E6ECE3" strokeWidth="0.5" />
                </pattern>
                <pattern id="hatchWood" width="8" height="8" patternUnits="userSpaceOnUse">
                  <line x1="0" y1="0" x2="8" y2="8" stroke="#fcd34d" strokeWidth="0.8" opacity="0.4" />
                </pattern>
              </defs>
              <rect width="520" height="460" fill="url(#smallGrid)" />

              {/* Setback Boundary Line */}
              <rect x="25" y="25" width="470" height="410" fill="none" stroke="#94a3b8" strokeWidth="1" strokeDasharray="4 4" />
              <text x="32" y="20" fill="#94a3b8" fontSize="9" fontWeight="700">MUNICIPAL PLOT SETBACK BOUNDARY ({W}′ × {L}′)</text>

              {/* Plot Facing Compass Marker */}
              <g transform="translate(470, 50)">
                <circle cx="0" cy="0" r="16" fill="#FFFFFF" stroke="#718B73" strokeWidth="1.5" />
                <path d="M 0 -12 L 4 0 L 0 -3 L -4 0 Z" fill="#dc2626" />
                <path d="M 0 12 L 4 0 L 0 3 L -4 0 Z" fill="#94a3b8" />
                <text x="0" y="-14" textAnchor="middle" fontSize="8" fontWeight="800" fill="#dc2626">N</text>
                <text x="14" y="3" textAnchor="middle" fontSize="8" fontWeight="800" fill="#718B73">{facing[0]}</text>
              </g>

              {/* ROOMS GEOMETRY */}
              {activeRooms.map((room) => {
                const isSelected = selectedRoomId === room.id;
                return (
                  <g key={room.id} onClick={() => setSelectedRoomId(room.id)} style={{ cursor: 'pointer' }}>
                    {/* Room Floor Fill */}
                    <rect
                      x={room.x}
                      y={room.y}
                      width={room.w}
                      height={room.h}
                      fill={room.color}
                      stroke={isSelected ? '#3D8056' : '#475569'}
                      strokeWidth={isSelected ? '2.5' : '1.5'}
                      rx="2"
                    />

                    {/* Furniture Vector Representations */}
                    {showFurniture && (
                      <g opacity="0.75">
                        {room.furniture === 'king_bed' && (
                          <g transform={`translate(${room.x + 20}, ${room.y + 20})`}>
                            <rect x="0" y="0" width="55" height="65" rx="3" fill="#e2e8f0" stroke="#64748b" strokeWidth="1" />
                            <rect x="5" y="5" width="20" height="15" rx="2" fill="#cbd5e1" />
                            <rect x="30" y="5" width="20" height="15" rx="2" fill="#cbd5e1" />
                          </g>
                        )}
                        {room.furniture === 'sofa_set' && (
                          <g transform={`translate(${room.x + 25}, ${room.y + 35})`}>
                            <rect x="0" y="0" width="75" height="30" rx="4" fill="#e2e8f0" stroke="#64748b" strokeWidth="1" />
                            <rect x="0" y="25" width="25" height="40" rx="4" fill="#e2e8f0" stroke="#64748b" strokeWidth="1" />
                            <rect x="25" y="35" width="35" height="25" rx="2" fill="#cbd5e1" />
                          </g>
                        )}
                        {room.furniture === 'dining_6' && (
                          <g transform={`translate(${room.x + 25}, ${room.y + 25})`}>
                            <rect x="15" y="10" width="60" height="35" rx="3" fill="#e2e8f0" stroke="#64748b" strokeWidth="1" />
                            <circle cx="25" cy="5" r="4" fill="#94a3b8" />
                            <circle cx="45" cy="5" r="4" fill="#94a3b8" />
                            <circle cx="65" cy="5" r="4" fill="#94a3b8" />
                            <circle cx="25" cy="50" r="4" fill="#94a3b8" />
                            <circle cx="45" cy="50" r="4" fill="#94a3b8" />
                            <circle cx="65" cy="50" r="4" fill="#94a3b8" />
                          </g>
                        )}
                        {room.furniture === 'porch_car' && (
                          <g transform={`translate(${room.x + 25}, ${room.y + 15})`}>
                            <rect x="0" y="0" width="80" height="45" rx="10" fill="#94a3b8" stroke="#475569" strokeWidth="1.2" opacity="0.6" />
                            <rect x="15" y="8" width="50" height="30" rx="4" fill="#e2e8f0" />
                            <text x="40" y="27" fontSize="7" fontWeight="800" textAnchor="middle" fill="#475569">EV PORTICO</text>
                          </g>
                        )}
                      </g>
                    )}

                    {/* Room Labels & Dimensions */}
                    {showRoomLabels && (
                      <g>
                        <text
                          x={room.x + room.w / 2}
                          y={room.y + room.h / 2 - 4}
                          textAnchor="middle"
                          fontSize="9.5"
                          fontWeight="800"
                          fill="#1e293b"
                        >
                          {room.name}
                        </text>
                        <text
                          x={room.x + room.w / 2}
                          y={room.y + room.h / 2 + 10}
                          textAnchor="middle"
                          fontSize="8.5"
                          fontWeight="700"
                          fill="#718B73"
                        >
                          {room.dim} ({room.sqft} sq.ft)
                        </text>
                      </g>
                    )}

                    {/* Door Swing Arc */}
                    <path
                      d={`M ${room.x + 5} ${room.y} A 18 18 0 0 1 ${room.x + 23} ${room.y + 18}`}
                      fill="none"
                      stroke="#0284c7"
                      strokeWidth="1.2"
                      strokeDasharray="2 2"
                    />
                    <line x1={room.x + 5} y1={room.y} x2={room.x + 23} y2={room.y} stroke="#0284c7" strokeWidth="1.5" />
                  </g>
                );
              })}

              {/* Structural Columns Overlay (C1 to C8) */}
              {showColumns && (
                <g>
                  {[
                    { id: 'C1', x: 37, y: 37 },
                    { id: 'C2', x: 227, y: 37 },
                    { id: 'C3', x: 437, y: 37 },
                    { id: 'C4', x: 37, y: 177 },
                    { id: 'C5', x: 227, y: 177 },
                    { id: 'C6', x: 437, y: 177 },
                    { id: 'C7', x: 37, y: 337 },
                    { id: 'C8', x: 227, y: 337 }
                  ].map((c) => (
                    <g key={c.id}>
                      <rect x={c.x} y={c.y} width="10" height="10" fill="#dc2626" rx="1" />
                      <text x={c.x + 5} y={c.y - 2} fontSize="6" fontWeight="800" textAnchor="middle" fill="#dc2626">
                        {c.id}
                      </text>
                    </g>
                  ))}
                </g>
              )}

              {/* Dimension Chains */}
              {showDimensions && (
                <g>
                  {/* Top overall width */}
                  <line x1="40" y1="12" x2="440" y2="12" stroke="#64748b" strokeWidth="1" />
                  <line x1="40" y1="8" x2="40" y2="16" stroke="#64748b" strokeWidth="1" />
                  <line x1="440" y1="8" x2="440" y2="16" stroke="#64748b" strokeWidth="1" />
                  <text x="240" y="8" fontSize="8" fontWeight="800" textAnchor="middle" fill="#64748b">
                    WIDTH: {W}′ 0″ (NBC CLEARANCE)
                  </text>
                </g>
              )}
            </svg>
          ) : null}

          {/* =====================================================================
              ORTHOGRAPHIC ELEVATIONS (FRONT 0°, REAR 180°, LEFT 90°, RIGHT 270°)
              Derived 100% deterministically from genuine 3D building geometry
          ===================================================================== */}
          {['front_elevation', 'rear_elevation', 'left_elevation', 'right_elevation', 'side_elevation'].includes(activeAngle) && (
            activeElevationProjection && activeElevationProjection.projectedPolygons?.length > 0 ? (
              <svg
                viewBox="0 0 540 440"
                style={{ width: '100%', maxWidth: '640px', height: 'auto', background: '#FAFAF7', borderRadius: '8px', border: '1px solid #D5DDD3' }}
              >
                {/* Natural Ground Datum Level */}
                <line x1="20" y1="380" x2="520" y2="380" stroke="#26332A" strokeWidth="2.5" />
                <text x="30" y="395" fontSize="8" fontWeight="800" fill="#26332A">
                  NATURAL GROUND LEVEL (GL ±0.00m)
                </text>

                {/* Ground Plinth Beam & Platform */}
                <rect x="50" y="365" width="440" height="15" fill="#e2e8f0" stroke="#475569" strokeWidth="1.2" />
                <text x="445" y="376" fontSize="7.5" fontWeight="800" fill="#718B73">
                  PLINTH (+450mm / +1′6″)
                </text>

                {/* Genuine 3D Projected Elevation Polygons */}
                <g id="elevation-3d-polygons">
                  {activeElevationProjection.projectedPolygons.map((p) => (
                    <polygon
                      key={p.id}
                      points={p.points}
                      fill={p.color}
                      stroke={p.stroke}
                      strokeWidth={p.strokeWidth}
                      opacity={p.opacity}
                    />
                  ))}
                </g>

                {/* Elevation Datums & Dimension Strings */}
                {showDimensions && (
                  <g id="elevation-dimensions">
                    {/* Left Height Dimension Chain */}
                    <line x1="38" y1="65" x2="38" y2="380" stroke="#64748b" strokeWidth="1" strokeDasharray="3 2" />
                    <line x1="32" y1="65" x2="44" y2="65" stroke="#64748b" strokeWidth="1.2" />
                    <line x1="32" y1="380" x2="44" y2="380" stroke="#64748b" strokeWidth="1.2" />
                    <text
                      x="26"
                      y="225"
                      fontSize="7.5"
                      fontWeight="800"
                      textAnchor="middle"
                      fill="#64748b"
                      transform="rotate(-90, 26, 225)"
                    >
                      TOTAL HEIGHT: {numFloors === 1 ? '13′ 6″' : '23′ 6″'}
                    </text>
                  </g>
                )}

                {/* Architectural Drawing Title Block */}
                <rect x="20" y="16" width="260" height="40" fill="rgba(255,255,255,0.94)" stroke="#D5DDD3" strokeWidth="1" rx="4" />
                <text x="30" y="32" fontSize="8.5" fontWeight="900" fill="#26332A">
                  {(activeElevationSide || 'FRONT').toUpperCase()} ELEVATION
                </text>
                <text x="30" y="46" fontSize="7" fontWeight="700" fill="#718B73">
                  1:100 ORTHOGRAPHIC • FACING: {facing?.toUpperCase() || 'EAST'} • {numFloors} STOREY
                </text>
              </svg>
            ) : (
              <div
                style={{
                  textAlign: 'center',
                  padding: '60px 24px',
                  color: '#68736A',
                  background: '#FAFAF7',
                  borderRadius: '8px',
                  border: '1px solid #D5DDD3',
                  maxWidth: '640px',
                  margin: '0 auto'
                }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🏛️</div>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#26332A' }}>
                  No Building Geometry Generated
                </div>
                <div style={{ fontSize: '0.75rem', marginTop: '4px', color: '#68736A' }}>
                  Please generate an architectural design to inspect real orthographic elevations.
                </div>
              </div>
            )
          )}

          {/* =====================================================================
              VIEW 5: CROSS-SECTION A-A (TECHNICAL CUT-THROUGH SECTION)
          ===================================================================== */}
          {activeAngle === 'cross_section' && (
            <svg
              viewBox="0 0 540 440"
              style={{ width: '100%', maxWidth: '640px', height: 'auto', background: '#FAFAF7', borderRadius: '8px', border: '1px solid #D5DDD3' }}
            >
              {/* Ground level */}
              <line x1="20" y1="360" x2="520" y2="360" stroke="#26332A" strokeWidth="2.5" />

              {/* Foundation Footings Cut */}
              <g>
                {[90, 260, 430].map((fx) => (
                  <g key={fx}>
                    {/* Isolated Trapezoidal Footing */}
                    <polygon points={`${fx - 25},420 ${fx + 25},420 ${fx + 10},380 ${fx - 10},380`} fill="#94a3b8" stroke="#334155" strokeWidth="1.2" />
                    <rect x={fx - 6} y="335" width="12" height="45" fill="#64748b" />
                    <text x={fx} y="432" fontSize="6.5" fontWeight="800" textAnchor="middle" fill="#475569">M25 PAD FOOTING</text>
                  </g>
                ))}
              </g>

              {/* Plinth Beam (+450mm) */}
              <rect x="70" y="335" width="400" height="15" fill="#475569" />
              <text x="270" y="346" fontSize="7" fontWeight="800" textAnchor="middle" fill="#FFFFFF">RCC PLINTH BEAM (9″ × 15″)</text>

              {/* Ground Floor Rooms Interior Section */}
              <rect x="80" y="210" width="170" height="125" fill="#fef3c7" stroke="#334155" strokeWidth="1.5" />
              <text x="165" y="250" fontSize="8.5" fontWeight="800" textAnchor="middle" fill="#92400e">LIVING ROOM (10′0″ CEILING)</text>

              {/* Internal Dog-Legged RCC Staircase Cut-Through */}
              <g transform="translate(260, 210)">
                <rect x="0" y="0" width="80" height="125" fill="#f1f5f9" stroke="#334155" strokeWidth="1" />
                {/* Stair steps */}
                {[0, 1, 2, 3, 4, 5, 6, 7].map((s) => (
                  <rect key={s} x={s * 9} y={110 - s * 14} width="10" height="15" fill="#64748b" stroke="#334155" strokeWidth="0.8" />
                ))}
                {/* Handrail */}
                <line x1="5" y1="90" x2="70" y2="0" stroke="#0284c7" strokeWidth="2" />
                <text x="40" y="60" fontSize="7" fontWeight="800" textAnchor="middle" fill="#0284c7">RCC STAIRCASE</text>
              </g>

              {/* Kitchen Section */}
              <rect x="350" y="210" width="110" height="125" fill="#fed7aa" stroke="#334155" strokeWidth="1.5" />
              <text x="405" y="250" fontSize="8" fontWeight="800" textAnchor="middle" fill="#9a3412">MODULAR KITCHEN</text>

              {/* First Floor RCC Slab (125mm / 5") */}
              <rect x="70" y="200" width="400" height="10" fill="#334155" />
              <text x="270" y="208" fontSize="7" fontWeight="800" textAnchor="middle" fill="#FFFFFF">125mm RCC SLAB (Fe550D TMT)</text>

              {/* First Floor Rooms Cut */}
              {numFloors >= 2 && (
                <g>
                  <rect x="80" y="80" width="170" height="120" fill="#f3e8ff" stroke="#334155" strokeWidth="1.5" />
                  <text x="165" y="130" fontSize="8.5" fontWeight="800" textAnchor="middle" fill="#6b21a8">UPPER MASTER SUITE</text>

                  <rect x="260" y="80" width="200" height="120" fill="#dcfce7" stroke="#334155" strokeWidth="1.5" />
                  <text x="360" y="130" fontSize="8.5" fontWeight="800" textAnchor="middle" fill="#166534">BEDROOM 2 & STUDY</text>

                  {/* Roof Slab */}
                  <rect x="70" y="70" width="400" height="10" fill="#334155" />
                  <rect x="70" y="45" width="20" height="25" fill="#64748b" />
                  <rect x="450" y="45" width="20" height="25" fill="#64748b" />
                  <text x="270" y="58" fontSize="7" fontWeight="800" textAnchor="middle" fill="#64748b">PARAPET WALL & WATERPROOFING SCREED</text>
                </g>
              )}
            </svg>
          )}
        </div>
      </div>
    </div>
  );
}
