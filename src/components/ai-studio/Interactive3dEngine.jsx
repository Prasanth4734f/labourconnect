import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  Camera,
  Sparkles,
  RotateCcw,
  Sliders,
  Play,
  Pause,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  ChevronDown,
  Check,
  Layers,
  Compass,
  Sun,
  Eye,
  Palette
} from 'lucide-react';
import TouchSensitiveLightingLine from './TouchSensitiveLightingLine';
import DesignCustomizationPanel from './DesignCustomizationPanel';
import ThreeJsArchitecturalViewer from './ThreeJsArchitecturalViewer';
import { simplifyRoomName } from './architecturalRoomUtils.js';
import { buildProcedural3dGeometry } from '../../engine/geometry/procedural3dGenerator.js';
import { generateLayoutCandidate } from '../../engine/generator/layoutGenerator.js';

const RENDERING_STYLES = [
  {
    id: 'photorealistic',
    label: 'Photorealistic',
    thumbnail: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ borderRadius: '6px', flexShrink: 0 }}>
        <rect width="36" height="36" rx="6" fill="#fdfaf6" />
        <rect x="4" y="4" width="28" height="18" fill="#e2e8f0" />
        <rect x="7" y="7" width="11" height="12" fill="#bae6fd" />
        <rect x="4" y="22" width="28" height="10" fill="#b45309" />
        <rect x="14" y="16" width="12" height="9" rx="2" fill="#475569" />
        <rect x="6" y="24" width="6" height="6" rx="1" fill="#92400e" />
      </svg>
    )
  },
  {
    id: 'blueprint',
    label: 'Architectural Blueprint',
    thumbnail: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ borderRadius: '6px', flexShrink: 0 }}>
        <rect width="36" height="36" rx="6" fill="#0284c7" />
        <line x1="4" y1="12" x2="32" y2="12" stroke="#38bdf8" strokeWidth="0.7" strokeDasharray="2 2" />
        <line x1="4" y1="24" x2="32" y2="24" stroke="#38bdf8" strokeWidth="0.7" strokeDasharray="2 2" />
        <line x1="12" y1="4" x2="12" y2="32" stroke="#38bdf8" strokeWidth="0.7" strokeDasharray="2 2" />
        <line x1="24" y1="4" x2="24" y2="32" stroke="#38bdf8" strokeWidth="0.7" strokeDasharray="2 2" />
        <rect x="7" y="7" width="22" height="22" fill="none" stroke="#ffffff" strokeWidth="1.5" />
        <line x1="7" y1="18" x2="29" y2="18" stroke="#ffffff" strokeWidth="1.2" />
        <line x1="18" y1="7" x2="18" y2="29" stroke="#ffffff" strokeWidth="1.2" />
      </svg>
    )
  },
  {
    id: 'minimalist',
    label: 'Modern Minimalist',
    thumbnail: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ borderRadius: '6px', flexShrink: 0 }}>
        <rect width="36" height="36" rx="6" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />
        <rect x="6" y="6" width="24" height="24" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
        <rect x="9" y="18" width="10" height="9" fill="#e2e8f0" />
        <line x1="21" y1="9" x2="27" y2="9" stroke="#0f172a" strokeWidth="2" />
        <line x1="21" y1="13" x2="27" y2="13" stroke="#94a3b8" strokeWidth="1.5" />
      </svg>
    )
  },
  {
    id: 'artistic',
    label: 'Artistic Interpretation',
    thumbnail: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ borderRadius: '6px', flexShrink: 0 }}>
        <rect width="36" height="36" rx="6" fill="#fef3c7" />
        <path d="M6 28L14 14L22 24L30 10" stroke="#92400e" strokeWidth="2" strokeLinecap="round" />
        <circle cx="26" cy="11" r="3.5" fill="#f59e0b" opacity="0.65" />
        <line x1="6" y1="30" x2="30" y2="30" stroke="#78350f" strokeWidth="1.5" />
      </svg>
    )
  },
  {
    id: 'wireframe',
    label: 'Wireframe',
    thumbnail: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ borderRadius: '6px', flexShrink: 0 }}>
        <rect width="36" height="36" rx="6" fill="#030712" />
        <polygon points="18,7 30,16 18,25 6,16" stroke="#38bdf8" strokeWidth="1.3" fill="none" />
        <line x1="18" y1="7" x2="18" y2="29" stroke="#38bdf8" strokeWidth="1.1" strokeDasharray="1.5 1.5" />
        <line x1="6" y1="16" x2="18" y2="29" stroke="#38bdf8" strokeWidth="1.1" />
        <line x1="30" y1="16" x2="18" y2="29" stroke="#38bdf8" strokeWidth="1.1" />
      </svg>
    )
  }
];

const VIEW_ANGLES = [
  {
    id: 'birds_eye',
    label: "Bird's Eye View",
    thumbnail: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ borderRadius: '6px', flexShrink: 0 }}>
        <rect width="36" height="36" rx="6" fill="#f1f5f9" />
        <polygon points="18,4 32,12 18,20 4,12" fill="#cbd5e1" stroke="#475569" strokeWidth="1.2" />
        <polygon points="4,12 18,20 18,32 4,24" fill="#94a3b8" stroke="#475569" strokeWidth="1.2" />
        <polygon points="18,20 32,12 32,24 18,32" fill="#64748b" stroke="#475569" strokeWidth="1.2" />
        <rect x="10" y="10" width="8" height="6" fill="#b45309" opacity="0.85" rx="1" />
      </svg>
    )
  },
  {
    id: 'top_down',
    label: 'Top-Down',
    thumbnail: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ borderRadius: '6px', flexShrink: 0 }}>
        <rect width="36" height="36" rx="6" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />
        <rect x="5" y="5" width="26" height="26" fill="#ffffff" stroke="#0f172a" strokeWidth="1.5" />
        <line x1="5" y1="17" x2="31" y2="17" stroke="#0f172a" strokeWidth="1.2" />
        <line x1="18" y1="5" x2="18" y2="31" stroke="#0f172a" strokeWidth="1.2" />
        <rect x="7" y="7" width="9" height="8" fill="#fed7aa" opacity="0.75" />
      </svg>
    )
  },
  {
    id: 'isometric',
    label: 'Isometric',
    thumbnail: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ borderRadius: '6px', flexShrink: 0 }}>
        <rect width="36" height="36" rx="6" fill="#f1f5f9" />
        <polygon points="18,5 31,13 18,21 5,13" fill="#e2e8f0" stroke="#334155" strokeWidth="1.2" />
        <polygon points="5,13 18,21 18,31 5,23" fill="#cbd5e1" stroke="#334155" strokeWidth="1.2" />
        <polygon points="18,21 31,13 31,23 18,31" fill="#94a3b8" stroke="#334155" strokeWidth="1.2" />
      </svg>
    )
  },
  {
    id: 'walkthrough',
    label: 'Walk-through',
    thumbnail: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ borderRadius: '6px', flexShrink: 0 }}>
        <rect width="36" height="36" rx="6" fill="#f8fafc" />
        <polygon points="4,4 12,12 12,24 4,32" fill="#cbd5e1" />
        <polygon points="32,4 24,12 24,24 32,32" fill="#cbd5e1" />
        <rect x="12" y="12" width="12" height="12" fill="#e2e8f0" stroke="#475569" strokeWidth="1" />
        <polygon points="4,32 12,24 24,24 32,32" fill="#b45309" opacity="0.8" />
      </svg>
    )
  },
  {
    id: 'exterior',
    label: 'Exterior View',
    thumbnail: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ borderRadius: '6px', flexShrink: 0 }}>
        <rect width="36" height="36" rx="6" fill="#bae6fd" />
        <rect x="6" y="15" width="24" height="17" fill="#ffffff" stroke="#0f172a" strokeWidth="1.5" />
        <polygon points="4,15 18,6 32,15" fill="#b91c1c" />
        <rect x="14" y="22" width="8" height="10" fill="#78350f" />
        <rect x="8" y="17" width="5" height="5" fill="#67e8f9" />
      </svg>
    )
  }
];

const BACKGROUND_MODES = [
  {
    id: 'isolated_white',
    label: 'Isolated on white',
    thumbnail: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ borderRadius: '6px', flexShrink: 0 }}>
        <rect width="36" height="36" rx="6" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
        <ellipse cx="18" cy="28" rx="14" ry="4" fill="#cbd5e1" opacity="0.6" />
        <rect x="8" y="10" width="20" height="16" fill="#e2e8f0" stroke="#64748b" strokeWidth="1.2" />
        <polygon points="6,10 18,4 30,10" fill="#94a3b8" />
      </svg>
    )
  },
  {
    id: 'neighborhood',
    label: 'Neighborhood context',
    thumbnail: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ borderRadius: '6px', flexShrink: 0 }}>
        <rect width="36" height="36" rx="6" fill="#e0f2fe" />
        <rect x="0" y="24" width="36" height="12" fill="#86efac" />
        <rect x="12" y="24" width="12" height="12" fill="#94a3b8" />
        <rect x="8" y="12" width="20" height="12" fill="#ffffff" stroke="#334155" strokeWidth="1" />
        <circle cx="5" cy="18" r="4" fill="#15803d" />
      </svg>
    )
  },
  {
    id: 'garden',
    label: 'Garden',
    thumbnail: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ borderRadius: '6px', flexShrink: 0 }}>
        <rect width="36" height="36" rx="6" fill="#dcfce7" />
        <circle cx="8" cy="12" r="5" fill="#16a34a" />
        <circle cx="28" cy="14" r="6" fill="#22c55e" />
        <circle cx="18" cy="8" r="4" fill="#15803d" />
        <rect x="10" y="14" width="16" height="14" fill="#f8fafc" stroke="#475569" strokeWidth="1" />
        <rect x="0" y="26" width="36" height="10" fill="#4ade80" />
      </svg>
    )
  },
  {
    id: 'seaside',
    label: 'Seaside',
    thumbnail: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ borderRadius: '6px', flexShrink: 0 }}>
        <rect width="36" height="36" rx="6" fill="#7dd3fc" />
        <rect x="0" y="22" width="36" height="14" fill="#0284c7" />
        <path d="M0 22 Q9 18 18 22 T36 22" fill="#38bdf8" />
        <rect x="10" y="10" width="16" height="12" fill="#ffffff" stroke="#0369a1" strokeWidth="1" />
        <circle cx="30" cy="8" r="4" fill="#facc15" />
      </svg>
    )
  }
];

const TECHNICAL_PLANS = [
  { id: 'electrical', label: 'Electrical Plan' },
  { id: 'plumbing', label: 'Plumbing Plan' },
  { id: 'lighting', label: 'Lighting Plan' }
];

/**
 * Interactive3dEngine
 * Next-generation 360° Orbit 3D Architectural Visualizer with dynamic solar daylight simulation
 * for both Ultra Low-Cost (₹1 Lakh) and Luxury Multi-Crore homes.
 */
export default function Interactive3dEngine({
  design = null,
  budgetInr = 4500000,
  bhk = 3,
  floors = 2,
  plotWidth = 40,
  plotLength = 60,
  style = 'modern_luxury',
  _facing = 'East',
  prompt = '',
  onCaptureSnapshot,
  onDesignChange
}) {
  const [activeFloorFilter, setActiveFloorFilter] = useState('all');
  const isUltraLowCost = Number(budgetInr) <= 300000 || prompt?.toLowerCase()?.includes('100000') || prompt?.toLowerCase()?.includes('1 lakh') || prompt?.toLowerCase()?.includes('tiny') || prompt?.toLowerCase()?.includes('micro');
  const isLuxury = Number(budgetInr) > 3500000;

  // Solar Daylight Simulation State (06:00 AM to 10:00 PM)
  const [solarTime, setSolarTime] = useState(17.75); // Default to gorgeous Golden Hour 5:45 PM
  
  // Primary Viewing Modes: 'furniture' (default cutaway) | 'complete_home' | 'electrical_appliances'
  const [viewMode, setViewMode] = useState('furniture');
  const [showRoomLabels, setShowRoomLabels] = useState(false); // Clean unobstructed view
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const [focusedRoom, setFocusedRoom] = useState(null);
  const [activeHotspot, setActiveHotspot] = useState(null);
  const [isCustomizationOpen, setIsCustomizationOpen] = useState(false);
  const [selectedCustomObjectId, setSelectedCustomObjectId] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Architectural Visualizer Dropdown Controls matching User Reference Images
  const [renderingStyle, setRenderingStyle] = useState('photorealistic'); // 'photorealistic' | 'blueprint' | 'minimalist' | 'artistic' | 'wireframe'
  const [viewAngle, setViewAngle] = useState('birds_eye'); // 'birds_eye' | 'top_down' | 'isometric' | 'walkthrough' | 'exterior'
  const [backgroundMode, setBackgroundMode] = useState('isolated_white'); // 'isolated_white' | 'neighborhood' | 'garden' | 'seaside'
  const [technicalPlan, setTechnicalPlan] = useState(null); // null | 'electrical' | 'plumbing' | 'lighting'
  const [activeDropdown, setActiveDropdown] = useState(null); // null | 'style' | 'angle' | 'background'
  const [isSettingsPanelOpen, setIsSettingsPanelOpen] = useState(true);

  const dropdownRef = useRef(null);
  const threeViewerRef = useRef(null);

  const currentStyleObj = RENDERING_STYLES.find(s => s.id === renderingStyle) || RENDERING_STYLES[0];
  const currentAngleObj = VIEW_ANGLES.find(a => a.id === viewAngle) || VIEW_ANGLES[0];
  const currentBgObj = BACKGROUND_MODES.find(b => b.id === backgroundMode) || BACKGROUND_MODES[0];

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleSelectStyle = (id) => {
    setRenderingStyle(id);
    setActiveDropdown(null);
    threeViewerRef.current?.setRenderingStyle(id);
  };

  const handleSelectAngle = (id) => {
    setViewAngle(id);
    setActiveDropdown(null);
    threeViewerRef.current?.setViewAngle(id);
  };

  const handleSelectBg = (id) => {
    setBackgroundMode(id);
    setActiveDropdown(null);
    threeViewerRef.current?.setBackgroundMode(id);
  };

  const handleSelectTechnicalPlan = (id) => {
    const next = technicalPlan === id ? null : id;
    setTechnicalPlan(next);
    threeViewerRef.current?.setTechnicalPlan(next);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  useEffect(() => {
    const timer = setTimeout(() => {
      threeViewerRef.current?.handleResize();
    }, 80);
    return () => clearTimeout(timer);
  }, [isFullscreen]);

  // Preset Camera Angles
  const setCameraPreset = (name) => {
    setIsAutoRotating(false);
    threeViewerRef.current?.setCameraPreset(name);
  };

  // Canonical Target Design
  const targetDesign = useMemo(() => {
    if (design && Array.isArray(design.floors) && design.floors.length > 0 && design.site) {
      return design;
    }
    try {
      return generateLayoutCandidate({
        plotWidth: Number(plotWidth) || 40,
        plotLength: Number(plotLength) || 60,
        floorsCount: Number(floors) || 2,
        bhkCount: Number(bhk) || 3,
        hasBalcony: true
      });
    } catch {
      return null;
    }
  }, [design, bhk, floors, plotWidth, plotLength]);

  // Procedural 3D Building Geometries (All Meshes for Three.js WebGL)
  const proceduralGeometries = useMemo(() => {
    if (!targetDesign) return null;
    try {
      return buildProcedural3dGeometry(targetDesign, {
        style,
        includeFurniture: true,
        includeLandscape: true,
        includeElectrical: true
      });
    } catch (err) {
      console.warn('[Interactive3dEngine] Error building 3d geometry:', err);
      return null;
    }
  }, [targetDesign, style]);

  const allMeshes = useMemo(() => {
    return proceduralGeometries?.meshes || [];
  }, [proceduralGeometries]);

  // Dynamic Floor Options (Attached Base Navigation based on actual model floors)
  const floorOptions = useMemo(() => {
    const opts = [{ id: 'all', label: '🏢 All Levels' }];
    if (targetDesign && Array.isArray(targetDesign.floors) && targetDesign.floors.length > 0) {
      targetDesign.floors.forEach((fl, idx) => {
        const isTerrace = Boolean(fl.isTerrace) || (fl.name || '').toLowerCase().includes('terrace');
        const label = isTerrace
          ? '☀️ Terrace'
          : idx === 0
            ? '🏠 Ground Floor'
            : idx === 1
              ? '🪜 1st Floor'
              : idx === 2
                ? '🪜 2nd Floor'
                : `🪜 Floor ${idx}`;
        const fid = String(fl.floorIndex !== undefined ? fl.floorIndex : idx);
        opts.push({ id: fid, label });
      });
      return opts;
    }
    const totalFloorCount = Number(floors) || 2;
    for (let i = 0; i < totalFloorCount; i++) {
      const name = i === 0 ? '🏠 Ground Floor' : i === 1 ? '🪜 1st Floor' : `🪜 Floor ${i}`;
      opts.push({ id: String(i), label: name });
    }
    opts.push({ id: String(totalFloorCount), label: '☀️ Terrace' });
    return opts;
  }, [targetDesign, floors]);

  // Unique Rooms List for Dream House Tour Navigation
  const uniqueRoomsList = useMemo(() => {
    if (!targetDesign?.floors) return [];
    const rooms = [];
    const seenNames = new Set();
    const targetFl = activeFloorFilter === 'all' ? null : Number(activeFloorFilter);

    targetDesign.floors.forEach((fl, fIdx) => {
      if (targetFl !== null && targetFl !== fIdx) return;
      (fl.rooms || []).forEach(rm => {
        if (!rm.bounds) return;
        const simpleName = simplifyRoomName(rm.name, rm.type);
        const key = `${simpleName}_fl${fIdx}`;
        if (!seenNames.has(key)) {
          seenNames.add(key);
          rooms.push({
            ...rm,
            displayName: simpleName,
            floorIndex: fIdx
          });
        }
      });
    });
    return rooms;
  }, [targetDesign, activeFloorFilter]);

  // Divided Budget: Civil Core Construction vs Infrastructure Fit-Out
  const totalBudget = Number(budgetInr) || 4500000;
  const coreBuildingBudget = totalBudget * 0.68;
  const infraBudget = totalBudget * 0.32;

  return (
    <div
      id="interactive-3d-engine-root"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: isFullscreen ? '8px' : '12px',
        width: isFullscreen ? '100vw' : '100%',
        height: isFullscreen ? '100vh' : 'auto',
        position: isFullscreen ? 'fixed' : 'relative',
        top: isFullscreen ? 0 : 'auto',
        left: isFullscreen ? 0 : 'auto',
        zIndex: isFullscreen ? 99999 : 'auto',
        background: isFullscreen ? '#030712' : 'transparent',
        padding: isFullscreen ? '12px' : '0px',
        boxSizing: 'border-box',
        overflow: 'hidden',
        fontFamily: 'Outfit, Inter, sans-serif',
        userSelect: 'none'
      }}
    >
      {/* 3D ENGINE TOP CONTROL DOCK */}
      <div
        id="engine-top-dock"
        style={{
          background: '#0a0f1d',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          borderRadius: '16px',
          padding: isFullscreen ? '8px 14px' : '12px 18px',
          display: 'flex',
          flexDirection: 'column',
          gap: isFullscreen ? '8px' : '12px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          flexShrink: 0
        }}
      >
        {/* Row 1: Daylight Mood + ONLY 2 Main Viewing Buttons (Complete House, Infrastructure) + Snapshots */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          {/* Touch-Sensitive Moving Line for Daylight Mood */}
          <TouchSensitiveLightingLine
            solarTime={solarTime}
            onChange={setSolarTime}
            accentColor="#f59e0b"
          />

          {/* Right: The Exactly 2 Main Viewing Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <div
              id="view-modes-toolbar"
              data-testid="view-modes-toolbar"
              style={{
                display: 'flex',
                background: 'rgba(255,255,255,0.06)',
                padding: '3px',
                borderRadius: '8px',
                gap: '3px',
                border: '1px solid rgba(56, 189, 248, 0.25)'
              }}
            >
              {[
                { id: 'complete_home', label: 'Complete Home', icon: '🏠', testId: 'btn-view-complete-home' },
                { id: 'furniture', label: 'Furniture', icon: '🛋️', testId: 'btn-view-furniture' },
                { id: 'electrical_appliances', label: 'Electrical', icon: '⚡', testId: 'btn-view-electrical' }
              ].map(m => {
                const isActive = viewMode === m.id || (m.id === 'furniture' && viewMode === 'infrastructure');
                return (
                  <button
                    key={m.id}
                    id={m.testId}
                    data-testid={m.testId}
                    onClick={() => {
                      setViewMode(m.id);
                      setFocusedRoom(null);
                      if (m.id === 'complete_home') {
                        threeViewerRef.current?.setCameraPreset('iso');
                      } else {
                        threeViewerRef.current?.setCameraPreset('iso_cutaway');
                      }
                    }}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '6px',
                      background: isActive ? 'linear-gradient(135deg, #0284c7, #0369a1)' : 'transparent',
                      color: isActive ? '#ffffff' : '#94a3b8',
                      border: isActive ? '1px solid #38bdf8' : '1px solid transparent',
                      fontSize: '0.74rem',
                      fontWeight: isActive ? 800 : 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.15s ease',
                      boxShadow: isActive ? '0 2px 8px rgba(56, 189, 248, 0.35)' : 'none'
                    }}
                  >
                    <span>{m.icon}</span>
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setIsAutoRotating(!isAutoRotating)}
              style={{
                background: isAutoRotating ? '#38bdf8' : 'rgba(255,255,255,0.06)',
                color: isAutoRotating ? '#080b11' : '#f8fafc',
                border: isAutoRotating ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.12)',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              {isAutoRotating ? <Pause size={12} /> : <Play size={12} />}
              <span>360° Auto-Orbit</span>
            </button>

            <button
              onClick={() => {
                const url = threeViewerRef.current?.captureSnapshot();
                if (onCaptureSnapshot && url) onCaptureSnapshot(url);
                if (typeof window !== 'undefined' && typeof window.confetti === 'function') {
                  window.confetti({ particleCount: 35, spread: 60 });
                }
                alert('📸 3D High-Res Architectural Rendering captured at 4K resolution!');
              }}
              style={{
                background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                border: '1px solid #38bdf8',
                color: '#ffffff',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.72rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                boxShadow: '0 4px 14px rgba(56, 189, 248, 0.35)'
              }}
            >
              <Camera size={13} />
              <span>4K Snapshot</span>
            </button>

            <button
              onClick={() => setIsCustomizationOpen(!isCustomizationOpen)}
              style={{
                background: isCustomizationOpen ? 'linear-gradient(135deg, #0284c7, #38bdf8)' : 'rgba(255,255,255,0.06)',
                border: isCustomizationOpen ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.15)',
                color: '#ffffff',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.72rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                boxShadow: isCustomizationOpen ? '0 4px 14px rgba(56, 189, 248, 0.4)' : 'none'
              }}
            >
              <Sliders size={13} />
              <span>Customize & Edit</span>
            </button>
          </div>
        </div>

        {/* Row 2: Contextual Controls & Floor Navigation & Dream House Room Tour */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
            paddingTop: '8px',
            borderTop: '1px solid rgba(255,255,255,0.08)'
          }}
        >
          {viewMode === 'complete_home' ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', width: '100%' }}>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>
                Exterior Views:
              </span>
              <div style={{ display: 'flex', background: 'rgba(255,255,255,0.06)', padding: '3px', borderRadius: '8px', gap: '3px', flexWrap: 'wrap' }}>
                {[
                  { id: 'iso', label: '3D Orbit' },
                  { id: 'front', label: 'Front (0°)' },
                  { id: 'rear', label: 'Rear (180°)' },
                  { id: 'left', label: 'Left (90°)' },
                  { id: 'right', label: 'Right (270°)' },
                  { id: 'top_down', label: 'Top Plan' }
                ].map(c => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setCameraPreset(c.id);
                      threeViewerRef.current?.setCameraPreset(c.id);
                    }}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '6px',
                      background: 'transparent',
                      color: '#f8fafc',
                      border: 'none',
                      fontSize: '0.70rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              {/* 360° Compass Quick Step Controls */}
              <div style={{ display: 'flex', background: 'rgba(255,255,255,0.06)', padding: '3px', borderRadius: '8px', gap: '3px' }}>
                <button
                  onClick={() => threeViewerRef.current?.rotateCompass(-45)}
                  style={{ padding: '4px 8px', borderRadius: '6px', background: 'transparent', color: '#f8fafc', border: 'none', fontSize: '0.70rem', fontWeight: 700, cursor: 'pointer' }}
                  title="Rotate 45° Left"
                >
                  ⟲ -45°
                </button>
                <button
                  onClick={() => threeViewerRef.current?.rotateCompass(45)}
                  style={{ padding: '4px 8px', borderRadius: '6px', background: 'transparent', color: '#f8fafc', border: 'none', fontSize: '0.70rem', fontWeight: 700, cursor: 'pointer' }}
                  title="Rotate 45° Right"
                >
                  ⟳ +45°
                </button>
              </div>

              <span style={{ fontSize: '0.70rem', color: '#38bdf8', background: 'rgba(56, 189, 248, 0.1)', padding: '3px 8px', borderRadius: '6px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                ✨ Crisp White Architectural Tiles • Realistic Limewash Plaster Facade
              </span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
              {/* Floor Tabs with Attached Building Base */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>
                  Floors (Attached Base):
                </span>
                <div style={{ display: 'flex', background: 'rgba(255,255,255,0.06)', padding: '3px', borderRadius: '8px', gap: '3px', flexWrap: 'wrap' }}>
                  {floorOptions.map(f => (
                    <button
                      key={f.id}
                      onClick={() => {
                        setActiveFloorFilter(f.id);
                        setFocusedRoom(null);
                        threeViewerRef.current?.setCameraPreset('iso_cutaway');
                      }}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        background: activeFloorFilter === f.id ? '#0284c7' : 'transparent',
                        color: activeFloorFilter === f.id ? '#ffffff' : '#94a3b8',
                        border: 'none',
                        fontSize: '0.70rem',
                        fontWeight: activeFloorFilter === f.id ? 700 : 500,
                        cursor: 'pointer'
                      }}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {/* Compass Directional Controls */}
                <div style={{ display: 'flex', background: 'rgba(255,255,255,0.06)', padding: '3px', borderRadius: '8px', gap: '3px' }}>
                  <button
                    onClick={() => threeViewerRef.current?.rotateCompass(-45)}
                    style={{ padding: '4px 8px', borderRadius: '6px', background: 'transparent', color: '#f8fafc', border: 'none', fontSize: '0.70rem', fontWeight: 700, cursor: 'pointer' }}
                    title="Rotate Left 45°"
                  >
                    ⟲ -45°
                  </button>
                  <button
                    onClick={() => threeViewerRef.current?.rotateCompass(45)}
                    style={{ padding: '4px 8px', borderRadius: '6px', background: 'transparent', color: '#f8fafc', border: 'none', fontSize: '0.70rem', fontWeight: 700, cursor: 'pointer' }}
                    title="Rotate Right 45°"
                  >
                    ⟳ +45°
                  </button>
                  <button
                    onClick={() => {
                      setCameraPreset('iso_cutaway');
                      setFocusedRoom(null);
                    }}
                    style={{ padding: '4px 8px', borderRadius: '6px', background: 'transparent', color: '#f8fafc', border: 'none', fontSize: '0.70rem', fontWeight: 600, cursor: 'pointer' }}
                    title="Elevated 35° Isometric Cutaway"
                  >
                    📐 Cutaway
                  </button>
                  <button
                    onClick={() => {
                      setCameraPreset('top_down');
                      setFocusedRoom(null);
                    }}
                    style={{ padding: '4px 8px', borderRadius: '6px', background: 'transparent', color: '#f8fafc', border: 'none', fontSize: '0.70rem', fontWeight: 600, cursor: 'pointer' }}
                    title="Direct 90° Top-Down Floor Plan"
                  >
                    📄 Top Plan
                  </button>
                </div>

                {/* Room Labels Toggle */}
                <button
                  onClick={() => setShowRoomLabels(!showRoomLabels)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    background: showRoomLabels ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255,255,255,0.06)',
                    color: showRoomLabels ? '#38bdf8' : '#94a3b8',
                    border: showRoomLabels ? '1px solid #38bdf8' : '1px solid transparent',
                    fontSize: '0.70rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                  title="Toggle Room Names"
                >
                  🏷️ Room Names: {showRoomLabels ? 'ON' : 'OFF'}
                </button>
              </div>

              {/* Dream House Room Tour Navigator */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 700 }}>
                  🏡 Room Tour:
                </span>
                <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', padding: '3px', borderRadius: '8px', gap: '4px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => {
                      setFocusedRoom(null);
                      threeViewerRef.current?.setCameraPreset('iso_cutaway');
                    }}
                    style={{
                      padding: '3px 8px',
                      borderRadius: '6px',
                      background: focusedRoom === null ? 'rgba(56, 189, 248, 0.25)' : 'transparent',
                      color: focusedRoom === null ? '#38bdf8' : '#94a3b8',
                      border: focusedRoom === null ? '1px solid #38bdf8' : '1px solid transparent',
                      fontSize: '0.68rem',
                      fontWeight: focusedRoom === null ? 700 : 500,
                      cursor: 'pointer'
                    }}
                  >
                    All Rooms (Full House)
                  </button>

                  {uniqueRoomsList.map((rm, idx) => {
                    const isSelected = focusedRoom?.id === rm.id;
                    return (
                      <button
                        key={rm.id || idx}
                        onClick={() => {
                          setFocusedRoom(rm);
                          threeViewerRef.current?.focusRoom(rm);
                        }}
                        style={{
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: isSelected ? 'linear-gradient(135deg, #0284c7, #38bdf8)' : 'rgba(255,255,255,0.06)',
                          color: isSelected ? '#ffffff' : '#cbd5e1',
                          border: isSelected ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)',
                          fontSize: '0.68rem',
                          fontWeight: isSelected ? 700 : 500,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <span>{rm.displayName}</span>
                        {rm.floorIndex !== undefined && (
                          <span style={{ fontSize: '0.58rem', opacity: 0.7 }}>
                            ({rm.floorIndex === 0 ? 'G' : `F${rm.floorIndex}`})
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3D INTERACTIVE VIEWPORT CONTAINER (THREE.JS WEBGL ARCHITECTURAL VIEWPORT) */}
      <div
        id="interactive-3d-viewport"
        data-testid="interactive-3d-viewport"
        style={{
          background: '#030712',
          borderRadius: isFullscreen ? '12px' : '16px',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          height: isFullscreen ? 'calc(100vh - 150px)' : '560px',
          width: '100%',
          flex: isFullscreen ? 1 : 'none',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: isFullscreen ? 'none' : '0 25px 50px rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease'
        }}
      >
        {/* Tier Indicator Overlay with Divided Budget */}
        <div
          style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            zIndex: 10,
            background: 'rgba(10, 15, 29, 0.90)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: '10px',
            padding: '10px 14px',
            fontSize: '0.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '3px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            pointerEvents: 'none'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: isUltraLowCost ? '#34d399' : '#38bdf8', fontWeight: 800 }}>
            <Sparkles size={14} />
            <span>
              {isUltraLowCost ? '₹1 LAKH ULTRA LOW-COST MICRO-HOME' : isLuxury ? 'ULTRA-LUXURY ARCHITECTURAL VILLA' : 'MODERN RESIDENTIAL HOME'}
            </span>
          </div>

          {/* Divided Budget: Civil Core Construction vs Infrastructure Fit-Out */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '2px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', fontSize: '0.68rem', color: '#cbd5e1' }}>
              <span>🏛️ Core Building (Civil):</span>
              <strong style={{ color: '#38bdf8' }}>₹{(coreBuildingBudget / 100000).toFixed(2)} Lakhs (68%)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', fontSize: '0.68rem', color: '#cbd5e1' }}>
              <span>🛋️ Infrastructure & Fit-Out:</span>
              <strong style={{ color: '#a78bfa' }}>₹{(infraBudget / 100000).toFixed(2)} Lakhs (32%)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', fontSize: '0.70rem', color: '#ffffff', fontWeight: 700 }}>
              <span>💰 Total Estimated Budget:</span>
              <span style={{ color: '#34d399' }}>₹{(totalBudget / 100000).toFixed(2)} Lakhs</span>
            </div>
          </div>

          <div style={{ color: '#94a3b8', fontSize: '0.65rem', marginTop: '2px' }}>
            Plot: {plotWidth}×{plotLength} ft • Left-drag: Orbit 360° • Right-drag: Pan • Scroll: Zoom
          </div>
        </div>

        {/* Floating Touch Controls (Zoom In, Zoom Out, Reset Camera, Fullscreen) */}
        <div
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            background: 'rgba(10, 15, 29, 0.88)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: '10px',
            padding: '6px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
          }}
        >
          <button
            onClick={() => threeViewerRef.current?.zoomIn()}
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#ffffff',
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              fontSize: '1rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Zoom In"
            data-testid="btn-zoom-in"
          >
            <ZoomIn size={15} />
          </button>
          <button
            onClick={() => threeViewerRef.current?.zoomOut()}
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#ffffff',
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              fontSize: '1rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Zoom Out"
            data-testid="btn-zoom-out"
          >
            <ZoomOut size={15} />
          </button>
          <button
            onClick={() => {
              threeViewerRef.current?.resetCamera();
            }}
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#38bdf8',
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Reset Camera & Touch Zoom"
            data-testid="btn-reset-camera"
          >
            <RotateCcw size={14} />
          </button>
          <button
            id="btn-fullscreen"
            data-testid="btn-fullscreen"
            onClick={() => {
              const nextState = !isFullscreen;
              setIsFullscreen(nextState);
              setTimeout(() => {
                threeViewerRef.current?.handleResize();
              }, 60);
            }}
            style={{
              background: isFullscreen ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255,255,255,0.08)',
              border: isFullscreen ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.15)',
              color: isFullscreen ? '#38bdf8' : '#ffffff',
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen 3D Architectural Viewer'}
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
        </div>

        {/* Genuine Three.js WebGL Architectural 3D Viewport */}
        <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 1 }}>
          <ThreeJsArchitecturalViewer
            ref={threeViewerRef}
            meshes={allMeshes}
            design={targetDesign}
            viewMode={viewMode}
            solarTime={solarTime}
            activeFloorFilter={activeFloorFilter}
            focusedRoom={focusedRoom}
            inspectingRoom={focusedRoom}
            isAutoRotating={isAutoRotating}
            showRoomLabels={showRoomLabels}
            renderingStyle={renderingStyle}
            viewAngle={viewAngle}
            backgroundMode={backgroundMode}
            technicalPlan={technicalPlan}
            onSnapshot={onCaptureSnapshot}
          />
        </div>

        {/* Architectural Settings Panel matching User Reference Images */}
        <div
          ref={dropdownRef}
          id="architectural-settings-panel"
          data-testid="architectural-settings-panel"
          style={{
            position: 'absolute',
            top: '16px',
            right: '64px',
            zIndex: 25,
            width: isSettingsPanelOpen ? '260px' : 'auto',
            maxHeight: 'calc(100% - 32px)',
            background: '#ffffff',
            borderRadius: '12px',
            boxShadow: '0 12px 36px rgba(0,0,0,0.25)',
            border: '1.5px solid #cbd5e1',
            padding: isSettingsPanelOpen ? '14px 16px' : '6px',
            transition: 'all 0.18s ease',
            fontFamily: 'Outfit, Inter, sans-serif',
            overflowY: isSettingsPanelOpen ? 'auto' : 'visible'
          }}
        >
          {isSettingsPanelOpen ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Header with minimize */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.01em' }}>
                  🎨 Render Settings
                </span>
                <button
                  onClick={() => setIsSettingsPanelOpen(false)}
                  style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
                  title="Minimize Panel"
                >
                  <ChevronDown size={16} />
                </button>
              </div>

              {/* 1. Rendering Style Dropdown (Image 1 Standard) */}
              <div style={{ position: 'relative' }}>
                <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                  Rendering Style
                </div>
                <div
                  id="dropdown-rendering-style-trigger"
                  data-testid="dropdown-rendering-style-trigger"
                  onClick={() => setActiveDropdown(activeDropdown === 'style' ? null : 'style')}
                  style={{
                    background: '#ffffff',
                    border: '1.5px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '6px 10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {currentStyleObj?.thumbnail}
                    <span style={{ fontSize: '0.86rem', fontWeight: 600, color: '#0f172a' }}>
                      {currentStyleObj?.label}
                    </span>
                  </div>
                  <ChevronDown size={16} style={{ color: '#64748b', transform: activeDropdown === 'style' ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }} />
                </div>

                {activeDropdown === 'style' && (
                  <div
                    id="dropdown-rendering-style-menu"
                    data-testid="dropdown-rendering-style-menu"
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 4px)',
                      left: 0,
                      right: 0,
                      background: '#ffffff',
                      border: '1.5px solid #cbd5e1',
                      borderRadius: '10px',
                      boxShadow: '0 12px 30px rgba(0,0,0,0.18)',
                      padding: '4px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px',
                      zIndex: 100
                    }}
                  >
                    {RENDERING_STYLES.map(opt => {
                      const isSel = renderingStyle === opt.id;
                      return (
                        <div
                          key={opt.id}
                          id={`option-style-${opt.id}`}
                          onClick={() => handleSelectStyle(opt.id)}
                          style={{
                            padding: '6px 8px',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: isSel ? '#eff6ff' : 'transparent',
                            cursor: 'pointer',
                            transition: 'background 0.12s ease'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {opt.thumbnail}
                            <span style={{ fontSize: '0.84rem', fontWeight: isSel ? 700 : 600, color: isSel ? '#2563eb' : '#0f172a' }}>
                              {opt.label}
                            </span>
                          </div>
                          {isSel && <Check size={16} style={{ color: '#2563eb' }} />}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 2. View Angle Dropdown (Image 2 Standard) */}
              <div style={{ position: 'relative' }}>
                <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                  View Angle
                </div>
                <div
                  id="dropdown-view-angle-trigger"
                  data-testid="dropdown-view-angle-trigger"
                  onClick={() => setActiveDropdown(activeDropdown === 'angle' ? null : 'angle')}
                  style={{
                    background: '#ffffff',
                    border: '1.5px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '6px 10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {currentAngleObj?.thumbnail}
                    <span style={{ fontSize: '0.86rem', fontWeight: 600, color: '#0f172a' }}>
                      {currentAngleObj?.label}
                    </span>
                  </div>
                  <ChevronDown size={16} style={{ color: '#64748b', transform: activeDropdown === 'angle' ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }} />
                </div>

                {activeDropdown === 'angle' && (
                  <div
                    id="dropdown-view-angle-menu"
                    data-testid="dropdown-view-angle-menu"
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 4px)',
                      left: 0,
                      right: 0,
                      background: '#ffffff',
                      border: '1.5px solid #cbd5e1',
                      borderRadius: '10px',
                      boxShadow: '0 12px 30px rgba(0,0,0,0.18)',
                      padding: '4px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px',
                      zIndex: 100
                    }}
                  >
                    {VIEW_ANGLES.map(opt => {
                      const isSel = viewAngle === opt.id;
                      return (
                        <div
                          key={opt.id}
                          id={`option-angle-${opt.id}`}
                          onClick={() => handleSelectAngle(opt.id)}
                          style={{
                            padding: '6px 8px',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: isSel ? '#eff6ff' : 'transparent',
                            cursor: 'pointer',
                            transition: 'background 0.12s ease'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {opt.thumbnail}
                            <span style={{ fontSize: '0.84rem', fontWeight: isSel ? 700 : 600, color: isSel ? '#2563eb' : '#0f172a' }}>
                              {opt.label}
                            </span>
                          </div>
                          {isSel && <Check size={16} style={{ color: '#2563eb' }} />}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 3. Background Dropdown (Image 3 Standard) */}
              <div style={{ position: 'relative' }}>
                <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                  Background
                </div>
                <div
                  id="dropdown-background-trigger"
                  data-testid="dropdown-background-trigger"
                  onClick={() => setActiveDropdown(activeDropdown === 'background' ? null : 'background')}
                  style={{
                    background: '#ffffff',
                    border: '1.5px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '6px 10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {currentBgObj?.thumbnail}
                    <span style={{ fontSize: '0.86rem', fontWeight: 600, color: '#0f172a' }}>
                      {currentBgObj?.label}
                    </span>
                  </div>
                  <ChevronDown size={16} style={{ color: '#64748b', transform: activeDropdown === 'background' ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }} />
                </div>

                {activeDropdown === 'background' && (
                  <div
                    id="dropdown-background-menu"
                    data-testid="dropdown-background-menu"
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 4px)',
                      left: 0,
                      right: 0,
                      background: '#ffffff',
                      border: '1.5px solid #cbd5e1',
                      borderRadius: '10px',
                      boxShadow: '0 12px 30px rgba(0,0,0,0.18)',
                      padding: '4px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px',
                      zIndex: 100
                    }}
                  >
                    {BACKGROUND_MODES.map(opt => {
                      const isSel = backgroundMode === opt.id;
                      return (
                        <div
                          key={opt.id}
                          id={`option-bg-${opt.id}`}
                          onClick={() => handleSelectBg(opt.id)}
                          style={{
                            padding: '6px 8px',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: isSel ? '#eff6ff' : 'transparent',
                            cursor: 'pointer',
                            transition: 'background 0.12s ease'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {opt.thumbnail}
                            <span style={{ fontSize: '0.84rem', fontWeight: isSel ? 700 : 600, color: isSel ? '#2563eb' : '#0f172a' }}>
                              {opt.label}
                            </span>
                          </div>
                          {isSel && <Check size={16} style={{ color: '#2563eb' }} />}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 4. TECHNICAL PLANS Section (Image 4 Standard) */}
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.06em', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
                  TECHNICAL PLANS
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {TECHNICAL_PLANS.map(plan => {
                    const isSel = technicalPlan === plan.id;
                    return (
                      <button
                        key={plan.id}
                        id={`btn-tech-plan-${plan.id}`}
                        data-testid={`btn-tech-plan-${plan.id}`}
                        onClick={() => handleSelectTechnicalPlan(plan.id)}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '9px 12px',
                          borderRadius: '8px',
                          border: 'none',
                          background: isSel ? '#eff6ff' : 'transparent',
                          color: isSel ? '#2563eb' : '#0f172a',
                          fontWeight: isSel ? 700 : 600,
                          fontSize: '0.84rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <span>{plan.label}</span>
                        {isSel && <Check size={15} style={{ color: '#2563eb' }} />}
                      </button>
                    );
                  })}
                  {technicalPlan !== null && (
                    <button
                      onClick={() => handleSelectTechnicalPlan(technicalPlan)}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        border: 'none',
                        background: 'transparent',
                        color: '#94a3b8',
                        fontSize: '0.70rem',
                        cursor: 'pointer',
                        textAlign: 'right'
                      }}
                    >
                      ✕ Reset to standard 3D
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsSettingsPanelOpen(true)}
              style={{
                background: '#ffffff',
                border: 'none',
                color: '#0f172a',
                padding: '6px 10px',
                borderRadius: '8px',
                fontSize: '0.76rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>🎨 Render Styles & Plans</span>
              <ChevronDown size={14} style={{ transform: 'rotate(-90deg)' }} />
            </button>
          )}
        </div>

        {/* Dream House Room Tour Floating Status Banner */}
        {focusedRoom && (
          <div
            id="room-tour-status-banner"
            data-testid="room-tour-status-banner"
            style={{
              position: 'absolute',
              bottom: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 15,
              background: 'rgba(10, 15, 29, 0.94)',
              backdropFilter: 'blur(12px)',
              border: '1px solid #38bdf8',
              borderRadius: '30px',
              padding: '8px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.7)',
              color: '#ffffff',
              fontSize: '0.78rem'
            }}
          >
            <span style={{ color: '#38bdf8', fontWeight: 800 }}>
              🏡 Visiting: {focusedRoom.displayName || focusedRoom.name}
            </span>
            <span style={{ color: '#94a3b8', fontSize: '0.72rem' }}>
              • Drag mouse to orbit 360° around this room
            </span>
            <button
              id="btn-exit-room-tour"
              data-testid="btn-exit-room-tour"
              onClick={() => {
                setFocusedRoom(null);
                threeViewerRef.current?.setCameraPreset(viewMode === 'infrastructure' ? 'iso_cutaway' : 'iso');
              }}
              style={{
                background: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.25)',
                borderRadius: '16px',
                color: '#ffffff',
                padding: '4px 10px',
                fontSize: '0.70rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              ✕ Full House View
            </button>
          </div>
        )}

        {/* 3D Hotspot Detail Modal / Popover */}
        {activeHotspot && (
          <div
            style={{
              position: 'absolute',
              bottom: '20px',
              left: '20px',
              right: '20px',
              background: 'rgba(10, 15, 29, 0.95)',
              backdropFilter: 'blur(12px)',
              border: '1px solid #f59e0b',
              borderLeft: '5px solid #f59e0b',
              borderRadius: '12px',
              padding: '14px 18px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxShadow: '0 10px 30px rgba(0,0,0,0.8)',
              zIndex: 20
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fbbf24', margin: 0 }}>
                  {activeHotspot.title}
                </h4>
                <span style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', fontSize: '0.74rem', padding: '2px 8px', borderRadius: '5px', fontWeight: 700 }}>
                  Cost: {activeHotspot.cost}
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#cbd5e1', margin: '4px 0 0 0' }}>
                {activeHotspot.desc}
              </p>
            </div>
            <button
              onClick={() => setActiveHotspot(null)}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#ffffff',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.74rem',
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>
        )}
      </div>

      {/* S4-T05: INTERACTIVE CUSTOMIZATION & PERSISTENCE PANEL */}
      {isCustomizationOpen && (
        <DesignCustomizationPanel
          design={design}
          onDesignChange={onDesignChange}
          selectedObjectId={selectedCustomObjectId}
          onSelectObject={setSelectedCustomObjectId}
          onClose={() => setIsCustomizationOpen(false)}
        />
      )}
    </div>
  );
}
