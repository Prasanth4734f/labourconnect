import React, { useState, useMemo } from 'react';
import {
  Sliders,
  Move,
  RotateCw,
  RotateCcw,
  Trash2,
  Plus,
  Palette,
  Undo2,
  Redo2,
  Save,
  FolderOpen,
  Download,
  Upload,
  RefreshCw,
  Layers,
  CheckCircle2,
  DollarSign,
  X
} from 'lucide-react';
import {
  CUSTOMIZATION_ACTION_TYPES,
  OBJECT_CATEGORIES,
  listCustomizableObjects,
  createCustomizationSession,
  applySessionCommand,
  undoSession,
  redoSession
} from '../../engine/customization/interactiveCustomizationEngine.js';
import {
  saveProject,
  loadProject,
  listSavedProjects,
  deleteProject,
  exportProjectBundleJson,
  importProjectBundleJson
} from '../../engine/customization/projectPersistenceManager.js';
import { FURNITURE_TYPES } from '../../engine/interior/furnitureCatalog.js';
import { LANDSCAPE_TYPES } from '../../engine/landscape/landscapeCatalog.js';

const AVAILABLE_MATERIALS = [
  { id: 'wood_teak_matte', name: 'Burma Teak Wood', color: '#854d0e', category: 'wood' },
  { id: 'wood_rosewood_polished', name: 'Indian Rosewood (Sheesham)', color: '#451a03', category: 'wood' },
  { id: 'tile_italian_marble', name: 'Italian Statuario Marble', color: '#f8fafc', category: 'tile' },
  { id: 'stone_travertine', name: 'Roman Travertine Stone', color: '#e2e8f0', category: 'masonry' },
  { id: 'fabric_emerald_velvet', name: 'Emerald Green Velvet', color: '#065f46', category: 'fabric' },
  { id: 'fabric_charcoal_linen', name: 'Charcoal Grey Linen', color: '#334155', category: 'fabric' },
  { id: 'metal_brushed_brass', name: 'Brushed Gold Brass', color: '#d97706', category: 'metal' },
  { id: 'metal_matte_black', name: 'Powder-Coated Matte Black', color: '#0f172a', category: 'metal' },
  { id: 'glass_acoustic_tint', name: 'Acoustic Tinted Glazing', color: '#38bdf8', category: 'glass' },
  { id: 'cseb_earth_block', name: 'CSEB Interlocking Earth', color: '#b45309', category: 'masonry' }
];

const FACADE_MATERIALS = [
  { id: 'plaster_luxury_travertine', name: 'Travertine Natural Stone & Plaster', preview: '#e2e8f0' },
  { id: 'plaster_contemporary_offwhite', name: 'Contemporary Warm Off-White Stucco', preview: '#f1f5f9' },
  { id: 'cseb_earth', name: 'Compressed Earth Blocks (Eco Rustic)', preview: '#b45309' },
  { id: 'exposed_terracotta_brick', name: 'Exposed Wirecut Terracotta Brick', preview: '#9a3412' }
];

/**
 * DesignCustomizationPanel
 * 
 * Interactive customization dock allowing users to select objects, translate $(X, Z)$,
 * rotate, swap materials, add from catalog, manage undo/redo history, save/load projects,
 * and view live synchronized budget impact.
 */
export default function DesignCustomizationPanel({
  design,
  onDesignChange,
  selectedObjectId = null,
  onSelectObject = () => {},
  onClose = () => {}
}) {
  const [activeTab, setActiveTab] = useState('inspect'); // 'inspect' | 'catalog' | 'finishes' | 'projects'
  const [session, setSession] = useState(() => createCustomizationSession(design));
  const [projectTitle, setProjectTitle] = useState(design?.title || 'My Customized Villa');
  const [projectNotes, setProjectNotes] = useState('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(null);
  const [savedProjectsList, setSavedProjectsList] = useState(() => listSavedProjects());

  // Current synchronized design
  const currentDesign = session.currentDesign || design;

  // List of customizable objects
  const outliner = useMemo(() => listCustomizableObjects(currentDesign), [currentDesign]);

  // Selected Object Details
  const selectedDetails = useMemo(() => {
    if (!selectedObjectId) return null;
    return (
      outliner.furniture.find(f => f.id === selectedObjectId) ||
      outliner.landscape.find(l => l.id === selectedObjectId) ||
      outliner.rooms.find(r => r.id === selectedObjectId) ||
      null
    );
  }, [selectedObjectId, outliner]);

  // Baseline vs Current Budget calculation
  const baselineCost = session.initialBaseline?.projectBudget?.totalEstimatedCost || design?.inputs?.homeBudgetInr || 4500000;
  const currentCost = currentDesign.projectBudget?.totalEstimatedCost || baselineCost;
  const costDelta = currentCost - baselineCost;

  // Handle Action execution
  const executeAction = (actionType, payload) => {
    const outcome = applySessionCommand(session, actionType, payload);
    if (outcome.success) {
      setSession({ ...session });
      if (onDesignChange) {
        onDesignChange(session.currentDesign);
      }
    }
  };

  // Undo Handler
  const handleUndo = () => {
    const res = undoSession(session);
    if (res.success) {
      setSession({ ...session });
      if (onDesignChange) {
        onDesignChange(session.currentDesign);
      }
    }
  };

  // Redo Handler
  const handleRedo = () => {
    const res = redoSession(session);
    if (res.success) {
      setSession({ ...session });
      if (onDesignChange) {
        onDesignChange(session.currentDesign);
      }
    }
  };

  // Reset Handler
  const handleReset = () => {
    if (window.confirm('Reset all interactive customizations back to initial generator baseline?')) {
      executeAction(CUSTOMIZATION_ACTION_TYPES.RESET_CUSTOMIZATIONS);
    }
  };

  // Nudge Move
  const handleNudge = (deltaX, deltaZ) => {
    if (!selectedObjectId) return;
    executeAction(CUSTOMIZATION_ACTION_TYPES.MOVE_OBJECT, {
      objectId: selectedObjectId,
      deltaX,
      deltaZ
    });
  };

  // Rotate
  const handleRotate = (angleDeg) => {
    if (!selectedObjectId) return;
    executeAction(CUSTOMIZATION_ACTION_TYPES.ROTATE_OBJECT, {
      objectId: selectedObjectId,
      angleDegrees: angleDeg
    });
  };

  // Remove
  const handleRemove = () => {
    if (!selectedObjectId) return;
    executeAction(CUSTOMIZATION_ACTION_TYPES.REMOVE_OBJECT, { objectId: selectedObjectId });
    onSelectObject(null);
  };

  // Material Swap
  const handleMaterialChange = (matKey) => {
    if (!selectedObjectId) return;
    executeAction(CUSTOMIZATION_ACTION_TYPES.CHANGE_MATERIAL, {
      objectId: selectedObjectId,
      material: matKey
    });
  };

  // Add Item
  const handleAddItem = (objectType, category) => {
    executeAction(CUSTOMIZATION_ACTION_TYPES.ADD_OBJECT, {
      objectType,
      category
    });
    setActiveTab('inspect');
  };

  // Save Project
  const handleSaveProject = () => {
    const saveRes = saveProject(currentDesign, {
      title: projectTitle,
      description: projectNotes
    });
    if (saveRes.success) {
      setSaveSuccessMsg(`Project saved successfully as "${projectTitle}"!`);
      setSavedProjectsList(listSavedProjects());
      setTimeout(() => setSaveSuccessMsg(null), 3500);
    }
  };

  // Load Saved Project
  const handleLoadProject = (projId) => {
    const loadRes = loadProject(projId);
    if (loadRes.success && loadRes.design) {
      const newSession = createCustomizationSession(loadRes.design);
      setSession(newSession);
      if (onDesignChange) {
        onDesignChange(loadRes.design);
      }
      setSaveSuccessMsg(`Restored project "${loadRes.project.title}"!`);
      setTimeout(() => setSaveSuccessMsg(null), 3000);
    }
  };

  // Delete Project
  const handleDeleteProject = (projId, e) => {
    e.stopPropagation();
    if (window.confirm('Delete this saved project permanently?')) {
      deleteProject(projId);
      setSavedProjectsList(listSavedProjects());
    }
  };

  // Export JSON Bundle
  const handleExportJson = () => {
    const jsonStr = exportProjectBundleJson(currentDesign, { title: projectTitle });
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectTitle.replace(/[^a-zA-Z0-9_-]/g, '_')}_project_bundle.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON Bundle
  const handleImportJson = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result;
      const res = importProjectBundleJson(text);
      if (res.success && res.design) {
        const newSession = createCustomizationSession(res.design);
        setSession(newSession);
        if (onDesignChange) {
          onDesignChange(res.design);
        }
        setSaveSuccessMsg('Project bundle imported successfully!');
        setTimeout(() => setSaveSuccessMsg(null), 3000);
      } else {
        alert(`Failed to import JSON bundle: ${res.error}`);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div
      style={{
        background: '#0a0f1d',
        border: '1px solid rgba(56, 189, 248, 0.35)',
        borderRadius: '16px',
        padding: '16px',
        color: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        boxShadow: '0 16px 40px rgba(0, 0, 0, 0.65)',
        fontFamily: 'Outfit, Inter, sans-serif'
      }}
    >
      {/* HEADER & TOP CONTROLS */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff'
            }}
          >
            <Sliders size={15} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '0.90rem', fontWeight: 800, color: '#f8fafc' }}>
              Interactive Customization & Real-Time Editing
            </h4>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
              Select, nudge, rotate, swap materials, and save customized project state
            </span>
          </div>
        </div>

        {/* Undo / Redo Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={handleUndo}
            disabled={!session.canUndo}
            style={{
              background: session.canUndo ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              color: session.canUndo ? '#38bdf8' : '#64748b',
              padding: '5px 10px',
              borderRadius: '7px',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: session.canUndo ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
            title="Undo last change (Ctrl+Z)"
          >
            <Undo2 size={13} />
            <span>Undo</span>
          </button>

          <button
            onClick={handleRedo}
            disabled={!session.canRedo}
            style={{
              background: session.canRedo ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              color: session.canRedo ? '#38bdf8' : '#64748b',
              padding: '5px 10px',
              borderRadius: '7px',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: session.canRedo ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
            title="Redo change (Ctrl+Y)"
          >
            <Redo2 size={13} />
            <span>Redo</span>
          </button>

          <button
            onClick={handleReset}
            style={{
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              padding: '5px 10px',
              borderRadius: '7px',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
            title="Reset to generator baseline"
          >
            <RefreshCw size={12} />
            <span>Reset</span>
          </button>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              color: '#94a3b8',
              padding: '5px',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* SYNCHRONIZED LIVE BUDGET IMPACT BADGE */}
      <div
        style={{
          background: 'rgba(15, 23, 42, 0.75)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          borderRadius: '10px',
          padding: '8px 14px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem' }}>
          <DollarSign size={15} color="#38bdf8" />
          <span style={{ color: '#94a3b8' }}>Live Project Budget:</span>
          <strong style={{ color: '#38bdf8', fontSize: '0.88rem' }}>
            ₹{Number(currentCost).toLocaleString('en-IN')}
          </strong>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem' }}>
          <span style={{ color: '#94a3b8' }}>Customization Delta:</span>
          <span
            style={{
              padding: '2px 8px',
              borderRadius: '6px',
              fontWeight: 800,
              background: costDelta > 0 ? 'rgba(234, 179, 8, 0.15)' : costDelta < 0 ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255, 255, 255, 0.06)',
              color: costDelta > 0 ? '#fde047' : costDelta < 0 ? '#4ade80' : '#94a3b8',
              border: `1px solid ${costDelta > 0 ? 'rgba(234, 179, 8, 0.3)' : costDelta < 0 ? 'rgba(34, 197, 94, 0.3)' : 'transparent'}`
            }}
          >
            {costDelta > 0 ? `+ ₹${costDelta.toLocaleString('en-IN')}` : costDelta < 0 ? `- ₹${Math.abs(costDelta).toLocaleString('en-IN')}` : '₹0 (In Baseline)'}
          </span>
        </div>
      </div>

      {/* SUCCESS NOTIFICATION */}
      {saveSuccessMsg && (
        <div
          style={{
            background: 'rgba(34, 197, 94, 0.15)',
            border: '1px solid rgba(34, 197, 94, 0.4)',
            color: '#4ade80',
            padding: '8px 12px',
            borderRadius: '8px',
            fontSize: '0.78rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <CheckCircle2 size={14} />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* NAVIGATION TABS */}
      <div style={{ display: 'flex', gap: '6px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '8px' }}>
        {[
          { id: 'inspect', label: 'Object Inspector', icon: <Sliders size={13} /> },
          { id: 'catalog', label: 'Add Items', icon: <Plus size={13} /> },
          { id: 'finishes', label: 'Finishes & Facade', icon: <Palette size={13} /> },
          { id: 'projects', label: 'Saved Designs', icon: <FolderOpen size={13} /> }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              background: activeTab === t.id ? '#0284c7' : 'rgba(255, 255, 255, 0.05)',
              border: activeTab === t.id ? '1px solid #38bdf8' : '1px solid transparent',
              color: activeTab === t.id ? '#ffffff' : '#cbd5e1',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {t.icon}
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* TAB CONTENT 1: OBJECT INSPECTOR & NUDGE CONTROLS */}
      {activeTab === 'inspect' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          {/* Left: Scene Objects List */}
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.65)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '10px',
              padding: '10px',
              maxHeight: '260px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '5px'
            }}
          >
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#38bdf8', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Layers size={12} />
              <span>CLICK OBJECT TO SELECT & EDIT:</span>
            </div>

            {/* Furniture Group */}
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
              Interior Furniture ({outliner.furniture.length})
            </div>
            {outliner.furniture.map(f => (
              <div
                key={f.id}
                onClick={() => onSelectObject(f.id)}
                style={{
                  padding: '5px 8px',
                  borderRadius: '6px',
                  background: selectedObjectId === f.id ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255, 255, 255, 0.03)',
                  border: selectedObjectId === f.id ? '1px solid #38bdf8' : '1px solid transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.72rem',
                  color: selectedObjectId === f.id ? '#ffffff' : '#cbd5e1'
                }}
              >
                <span>{f.name}</span>
                <span style={{ fontSize: '0.65rem', color: '#38bdf8', opacity: 0.8 }}>({f.room})</span>
              </div>
            ))}

            {/* Landscape Group */}
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginTop: '6px' }}>
              Site & Landscape ({outliner.landscape.length})
            </div>
            {outliner.landscape.map(l => (
              <div
                key={l.id}
                onClick={() => onSelectObject(l.id)}
                style={{
                  padding: '5px 8px',
                  borderRadius: '6px',
                  background: selectedObjectId === l.id ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255, 255, 255, 0.03)',
                  border: selectedObjectId === l.id ? '1px solid #38bdf8' : '1px solid transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.72rem',
                  color: selectedObjectId === l.id ? '#ffffff' : '#cbd5e1'
                }}
              >
                <span>{l.name}</span>
                <span style={{ fontSize: '0.65rem', color: '#4ade80', opacity: 0.8 }}>Outdoor</span>
              </div>
            ))}
          </div>

          {/* Right: Selected Object Inspector */}
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.65)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '10px',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}
          >
            {selectedDetails ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h5 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 800, color: '#f8fafc' }}>
                      {selectedDetails.name}
                    </h5>
                    <span style={{ fontSize: '0.68rem', color: '#38bdf8' }}>
                      Pos: ({selectedDetails.position?.x?.toFixed(1)}, {selectedDetails.position?.z?.toFixed(1)} ft) • Rot: {selectedDetails.rotation}°
                    </span>
                  </div>

                  <button
                    onClick={handleRemove}
                    style={{
                      background: 'rgba(239, 68, 68, 0.15)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: '#f87171',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Trash2 size={11} />
                    <span>Delete</span>
                  </button>
                </div>

                {/* Spatial Nudge Controls (4 Directional Arrows) */}
                <div>
                  <div style={{ fontSize: '0.70rem', color: '#94a3b8', marginBottom: '4px', fontWeight: 600 }}>
                    Nudge Position (Room Clamped):
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 32px)', gap: '4px', justifyContent: 'center' }}>
                    <div />
                    <button
                      onClick={() => handleNudge(0, -1.0)}
                      style={{ padding: '6px', borderRadius: '6px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', cursor: 'pointer' }}
                      title="Nudge Forward (-Z)"
                    >
                      ↑
                    </button>
                    <div />
                    <button
                      onClick={() => handleNudge(-1.0, 0)}
                      style={{ padding: '6px', borderRadius: '6px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', cursor: 'pointer' }}
                      title="Nudge Left (-X)"
                    >
                      ←
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8', fontSize: '0.7rem' }}>
                      <Move size={13} />
                    </div>
                    <button
                      onClick={() => handleNudge(1.0, 0)}
                      style={{ padding: '6px', borderRadius: '6px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', cursor: 'pointer' }}
                      title="Nudge Right (+X)"
                    >
                      →
                    </button>
                    <div />
                    <button
                      onClick={() => handleNudge(0, 1.0)}
                      style={{ padding: '6px', borderRadius: '6px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', cursor: 'pointer' }}
                      title="Nudge Back (+Z)"
                    >
                      ↓
                    </button>
                    <div />
                  </div>
                </div>

                {/* Rotation Controls */}
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.70rem', color: '#94a3b8' }}>Rotate:</span>
                  <button
                    onClick={() => handleRotate(-90)}
                    style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '4px 8px', borderRadius: '6px', fontSize: '0.70rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                  >
                    <RotateCcw size={11} /> -90°
                  </button>
                  <button
                    onClick={() => handleRotate(90)}
                    style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '4px 8px', borderRadius: '6px', fontSize: '0.70rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                  >
                    <RotateCw size={11} /> +90°
                  </button>
                </div>

                {/* Material Swap Swatches */}
                <div>
                  <div style={{ fontSize: '0.70rem', color: '#94a3b8', marginBottom: '5px' }}>
                    Swap Material / Finish:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    {AVAILABLE_MATERIALS.map(m => (
                      <button
                        key={m.id}
                        onClick={() => handleMaterialChange(m.id)}
                        style={{
                          width: '22px',
                          height: '22px',
                          borderRadius: '50%',
                          background: m.color,
                          border: selectedDetails.material === m.id ? '2px solid #38bdf8' : '1px solid rgba(255,255,255,0.2)',
                          cursor: 'pointer',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                        }}
                        title={m.name}
                      />
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8', textAlign: 'center', gap: '8px' }}>
                <Move size={24} color="#38bdf8" />
                <span style={{ fontSize: '0.75rem' }}>Select an object on the left or click directly on the 3D model to inspect and edit.</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: ADD ITEMS FROM CATALOG */}
      {activeTab === 'catalog' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#38bdf8' }}>
            ADD INTERIOR FURNITURE TO ROOMS:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
            {[
              { type: FURNITURE_TYPES.KING_BED, label: 'King Size Bed' },
              { type: FURNITURE_TYPES.SOFA_SECTIONAL_L, label: 'L-Sectional Sofa' },
              { type: FURNITURE_TYPES.DINING_TABLE_6S, label: '6-Seater Dining' },
              { type: FURNITURE_TYPES.COFFEE_TABLE, label: 'Coffee Table' },
              { type: FURNITURE_TYPES.TV_CONSOLE, label: 'TV Media Console' },
              { type: FURNITURE_TYPES.WARDROBE_3DOOR, label: '3-Door Wardrobe' },
              { type: FURNITURE_TYPES.STUDY_DESK, label: 'Study & Desk' },
              { type: FURNITURE_TYPES.POOJA_MANDIR, label: 'Pooja Mandir' }
            ].map(item => (
              <button
                key={item.type}
                onClick={() => handleAddItem(item.type, OBJECT_CATEGORIES.FURNITURE)}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#f8fafc',
                  padding: '7px 8px',
                  borderRadius: '7px',
                  fontSize: '0.70rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                + {item.label}
              </button>
            ))}
          </div>

          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#4ade80', marginTop: '6px' }}>
            ADD OUTDOOR LANDSCAPE & GARDEN:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
            {[
              { type: LANDSCAPE_TYPES.TREE_NEEM_SHADE, label: 'Neem Shade Tree' },
              { type: LANDSCAPE_TYPES.TREE_ASHOKA_COLUMNAR, label: 'Columnar Ashoka' },
              { type: LANDSCAPE_TYPES.TREE_FRANGIPANI_FLOWERING, label: 'Frangipani Tree' },
              { type: LANDSCAPE_TYPES.SHRUB_BOUGAINVILLEA, label: 'Bougainvillea' },
              { type: LANDSCAPE_TYPES.LIGHT_BOLLARD_PATHWAY, label: 'Pathway Bollard' },
              { type: LANDSCAPE_TYPES.PATIO_GARDEN_TABLE, label: 'Patio Dining Table' }
            ].map(item => (
              <button
                key={item.type}
                onClick={() => handleAddItem(item.type, OBJECT_CATEGORIES.LANDSCAPE)}
                style={{
                  background: 'rgba(34, 197, 94, 0.08)',
                  border: '1px solid rgba(34, 197, 94, 0.2)',
                  color: '#86efac',
                  padding: '7px 8px',
                  borderRadius: '7px',
                  fontSize: '0.70rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                + {item.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: FINISHES & FACADE */}
      {activeTab === 'finishes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#38bdf8', marginBottom: '6px' }}>
              EXTERIOR FACADE MATERIAL:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              {FACADE_MATERIALS.map(f => (
                <button
                  key={f.id}
                  onClick={() => executeAction(CUSTOMIZATION_ACTION_TYPES.CHANGE_FACADE_MATERIAL, { material: f.id })}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px',
                    borderRadius: '8px',
                    background: currentDesign.customMaterials?.exterior_facade === f.id ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255,255,255,0.05)',
                    border: currentDesign.customMaterials?.exterior_facade === f.id ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)',
                    color: '#f8fafc',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: f.preview, border: '1px solid rgba(0,0,0,0.3)' }} />
                  <span>{f.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: SAVED PROJECTS & PERSISTENCE */}
      {activeTab === 'projects' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Save Active Project Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="text"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                placeholder="Project Name..."
                style={{
                  flex: 1,
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: '#fff',
                  padding: '6px 10px',
                  borderRadius: '7px',
                  fontSize: '0.75rem'
                }}
              />
              <button
                onClick={handleSaveProject}
                style={{
                  background: '#0284c7',
                  border: '1px solid #38bdf8',
                  color: '#fff',
                  padding: '6px 12px',
                  borderRadius: '7px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Save size={13} />
                <span>Save Project</span>
              </button>
            </div>
            <input
              type="text"
              value={projectNotes}
              onChange={(e) => setProjectNotes(e.target.value)}
              placeholder="Project Notes / Client Specs (Optional)..."
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.10)',
                color: '#cbd5e1',
                padding: '5px 10px',
                borderRadius: '7px',
                fontSize: '0.72rem',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Import / Export JSON Buttons */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleExportJson}
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#cbd5e1',
                padding: '6px 10px',
                borderRadius: '7px',
                fontSize: '0.72rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Download size={12} />
              <span>Export Project JSON</span>
            </button>

            <label
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#cbd5e1',
                padding: '6px 10px',
                borderRadius: '7px',
                fontSize: '0.72rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Upload size={12} />
              <span>Import Project JSON</span>
              <input type="file" accept=".json" onChange={handleImportJson} style={{ display: 'none' }} />
            </label>
          </div>

          {/* Saved Projects Catalog */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '180px', overflowY: 'auto' }}>
            <div style={{ fontSize: '0.70rem', color: '#94a3b8', fontWeight: 700 }}>
              SAVED PROJECTS ({savedProjectsList.length}):
            </div>
            {savedProjectsList.length === 0 ? (
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontStyle: 'italic' }}>
                No saved projects yet. Click "Save Project" above to store your custom design.
              </div>
            ) : (
              savedProjectsList.map(p => (
                <div
                  key={p.id}
                  onClick={() => handleLoadProject(p.id)}
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '8px',
                    padding: '8px 10px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <div>
                    <strong style={{ fontSize: '0.78rem', color: '#f8fafc' }}>{p.title}</strong>
                    <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                      {p.code} • Updated: {new Date(p.updatedAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.70rem', color: '#38bdf8', fontWeight: 700 }}>Restore →</span>
                    <button
                      onClick={(e) => handleDeleteProject(p.id, e)}
                      style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', padding: '4px' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
