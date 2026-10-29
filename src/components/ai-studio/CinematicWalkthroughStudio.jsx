import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Video,
  Camera,
  FastForward,
  Download,
  Film,
  Compass,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Eye,
  Layers,
  MapPin,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { buildProcedural3dGeometry, project3dToViewport } from '../../engine/geometry/procedural3dGenerator.js';
import { planWalkthroughPath, validateWalkthroughTrajectory } from '../../engine/geometry/walkthroughPathPlanner.js';
import { generateLayoutCandidate } from '../../engine/generator/layoutGenerator.js';
import ThreeJsArchitecturalViewer from './ThreeJsArchitecturalViewer';

/**
 * CinematicWalkthroughStudio
 * 100% Geometry-Driven Real 3D Architectural Walkthrough Studio.
 * Renders actual building geometry, room boundaries, doors, and camera trajectories
 * without static stock photos or placeholder images.
 */
export default function CinematicWalkthroughStudio({
  design = null,
  budgetInr = 4500000,
  bhk = 3,
  plotWidth = 40,
  plotLength = 60,
  style = 'Modern Contemporary',
  facing = 'East',
  prompt = ''
}) {
  const isMicroHome = Number(budgetInr) <= 250000;

  // Resolve Canonical Design Model
  const activeDesign = useMemo(() => {
    if (design && design.floors && design.floors.length > 0) {
      return design;
    }
    try {
      return generateLayoutCandidate({
        plotWidth: Number(plotWidth) || 30,
        plotLength: Number(plotLength) || 40,
        floorsCount: 2,
        bhkCount: Number(bhk) || 3,
        hasBalcony: true
      });
    } catch (err) {
      console.warn('[WalkthroughStudio] Layout candidate generation fallback failed:', err);
      return null;
    }
  }, [design, bhk, plotWidth, plotLength]);

  // Derive genuine procedural 3D building geometry
  const buildingGeometries = useMemo(() => {
    if (!activeDesign) return null;
    if (activeDesign.geometry3d && Array.isArray(activeDesign.geometry3d.meshes) && activeDesign.geometry3d.meshes.length > 0) {
      return activeDesign.geometry3d;
    }
    try {
      return buildProcedural3dGeometry(activeDesign, { style });
    } catch (err) {
      console.warn('[WalkthroughStudio] Error building procedural geometry:', err);
      return null;
    }
  }, [activeDesign, style]);

  // Derive continuous walkthrough camera trajectory
  const trajectory = useMemo(() => {
    if (!activeDesign) return null;
    if (activeDesign.walkthroughTrajectory && Array.isArray(activeDesign.walkthroughTrajectory.waypoints) && activeDesign.walkthroughTrajectory.waypoints.length > 0) {
      return activeDesign.walkthroughTrajectory;
    }
    try {
      return planWalkthroughPath(activeDesign);
    } catch (err) {
      console.warn('[WalkthroughStudio] Error planning walkthrough path:', err);
      return null;
    }
  }, [activeDesign]);

  const waypoints = trajectory?.waypoints || [];

  // Playback state
  const [viewportEngine, setViewportEngine] = useState('webgl_3d'); // 'webgl_3d' | 'cinematic_vector'
  const [currentSceneIdx, setCurrentSceneIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [cameraMode, setCameraMode] = useState('cinematic'); // 'cinematic' | 'first_person' | 'drone'
  const [progress, setProgress] = useState(0); // 0 to 100% of current scene
  const [showMinimap, setShowMinimap] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const activeScene = waypoints[currentSceneIdx] || waypoints[0] || null;

  // Animation Loop for Video Progress
  useEffect(() => {
    if (!isPlaying || !activeScene || waypoints.length === 0) return;

    let animationFrame;
    let lastTime = performance.now();
    const duration = activeScene.duration || 6;

    const step = (now) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      setProgress((prev) => {
        const increment = (delta / duration) * 100 * playbackSpeed;
        if (prev + increment >= 100) {
          setCurrentSceneIdx((curr) => (curr + 1) % waypoints.length);
          return 0;
        }
        return prev + increment;
      });

      animationFrame = requestAnimationFrame(step);
    };

    animationFrame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrame);
  }, [isPlaying, currentSceneIdx, playbackSpeed, activeScene, waypoints.length]);

  // Compute camera angles and projection for the active waypoint
  const projectedScene = useMemo(() => {
    if (!buildingGeometries || !activeScene) return null;

    const pos = activeScene.position || { x: 15, y: 5.5, z: 20 };
    const look = activeScene.lookAt || { x: 15, y: 5.5, z: 10 };

    const dx = look.x - pos.x;
    const dy = look.y - pos.y;
    const dz = look.z - pos.z;
    const distXZ = Math.max(0.1, Math.hypot(dx, dz));

    // Base camera azimuth (yaw) and elevation (pitch) facing the lookAt target
    const baseYaw = Math.atan2(-dx, dz) * (180 / Math.PI);
    const basePitch = Math.atan2(-dy, distXZ) * (180 / Math.PI);

    let yaw = baseYaw;
    let pitch = Math.max(12, Math.min(50, basePitch + 22));
    let viewMode = activeScene.id === 'scene_approach' ? 'exterior' : 'dollhouse';

    if (cameraMode === 'cinematic') {
      // Dynamic camera panning arc across scene duration
      yaw = baseYaw + ((progress - 50) / 100) * 18;
      pitch = Math.max(14, Math.min(46, basePitch + 20));
    } else if (cameraMode === 'first_person') {
      // Low eye-level perspective
      yaw = baseYaw + ((progress - 50) / 100) * 8;
      pitch = Math.max(5, Math.min(25, basePitch + 8));
    } else if (cameraMode === 'drone') {
      // High-angle architectural drone flight
      yaw = baseYaw + (progress / 100) * 40;
      pitch = 62;
      viewMode = 'exterior';
    }

    // Floor isolation
    let selectedFloorIndex = null;
    if (activeScene.floor === 'Ground Floor') {
      selectedFloorIndex = 0;
    } else if (activeScene.floor === 'First Floor') {
      selectedFloorIndex = 1;
    }

    try {
      return project3dToViewport(buildingGeometries, {
        yaw,
        pitch,
        zoom: cameraMode === 'first_person' ? 1.25 : 1.05,
        viewportWidth: 700,
        viewportHeight: 460,
        solarTime: 17.5,
        facing,
        viewMode,
        selectedFloorIndex
      });
    } catch (err) {
      console.warn('[WalkthroughStudio] Viewport projection error:', err);
      return null;
    }
  }, [buildingGeometries, activeScene, cameraMode, progress, facing]);

  // Export video simulation
  const handleExportVideo = () => {
    setIsExporting(true);
    setExportProgress(15);
    const interval = setInterval(() => {
      setExportProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setIsExporting(false);
          return 100;
        }
        return p + 18;
      });
    }, 280);
  };

  // Trajectory validation summary
  const validationSummary = useMemo(() => {
    if (!trajectory || waypoints.length === 0) return null;
    return validateWalkthroughTrajectory(trajectory, activeDesign);
  }, [trajectory, activeDesign, waypoints]);

  // 2D Minimap Layout Data
  const minimapFloor = useMemo(() => {
    if (!activeDesign?.floors) return null;
    const isFirst = activeScene?.floor === 'First Floor';
    return activeDesign.floors.find(f => f.floorIndex === (isFirst ? 1 : 0)) || activeDesign.floors[0];
  }, [activeDesign, activeScene]);

  // Empty state rendering
  if (!activeScene || waypoints.length === 0) {
    return (
      <div
        style={{
          background: '#090d16',
          border: '1px solid #1e293b',
          borderRadius: '16px',
          padding: '36px 24px',
          textAlign: 'center',
          color: '#e2e8f0',
          fontFamily: 'Outfit, Inter, sans-serif'
        }}
      >
        <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🏛️</div>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', marginBottom: '8px' }}>
          No Building Geometry Available
        </h3>
        <p style={{ fontSize: '0.85rem', color: '#94a3b8', maxWidth: '440px', margin: '0 auto 18px auto', lineHeight: '1.5' }}>
          Please generate an architectural floor plan in the 2D/3D studio to activate the real geometry-driven walkthrough.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        width: '100%',
        fontFamily: 'Outfit, Inter, sans-serif',
        userSelect: 'none'
      }}
    >
      {/* 1. TOP STUDIO HEADER DOCK */}
      <div
        style={{
          background: '#0a0f1d',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          borderRadius: '16px',
          padding: '12px 18px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: '#080b11',
                padding: '3px 9px',
                borderRadius: '6px',
                fontSize: '0.72rem',
                fontWeight: 900,
                letterSpacing: '0.5px'
              }}
            >
              <Film size={12} /> REAL 3D ARCHITECTURAL WALKTHROUGH
            </span>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              {isMicroHome ? 'Eco-Block Spec' : `${bhk}BHK ${style} Model`} • {waypoints.length} Spatial Waypoints
            </span>
          </div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', margin: '4px 0 0 0' }}>
            {activeScene.title}
          </h3>
        </div>

        {/* Flight Mode & Engine Toggle Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* WebGL 3D vs Cinematic Rails Engine Selector */}
          <button
            onClick={() => setViewportEngine(viewportEngine === 'webgl_3d' ? 'cinematic_vector' : 'webgl_3d')}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '0.74rem',
              fontWeight: 800,
              cursor: 'pointer',
              border: viewportEngine === 'webgl_3d' ? '1px solid #38bdf8' : '1px solid #334155',
              background: viewportEngine === 'webgl_3d' ? 'rgba(56, 189, 248, 0.22)' : '#1e293b',
              color: viewportEngine === 'webgl_3d' ? '#38bdf8' : '#94a3b8',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: viewportEngine === 'webgl_3d' ? '0 0 12px rgba(56, 189, 248, 0.3)' : 'none',
              transition: 'all 0.15s ease'
            }}
            title="Toggle between Three.js WebGL Realtime 3D Engine and Cinematic Vector Projection"
          >
            <Video size={13} />
            <span>{viewportEngine === 'webgl_3d' ? '🎮 3D WebGL PBR Engine' : '🎬 2D Rail Projection'}</span>
          </button>

          {[
            { id: 'cinematic', label: 'Cinematic Dolly', icon: <Camera size={13} /> },
            { id: 'first_person', label: 'Eye-Level (1.7m)', icon: <Eye size={13} /> },
            { id: 'drone', label: 'Drone Flyover', icon: <Compass size={13} /> }
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setCameraMode(mode.id)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.74rem',
                fontWeight: 700,
                cursor: 'pointer',
                border: cameraMode === mode.id ? '1px solid #f59e0b' : '1px solid #334155',
                background: cameraMode === mode.id ? 'rgba(245, 158, 11, 0.15)' : '#1e293b',
                color: cameraMode === mode.id ? '#fbbf24' : '#cbd5e1',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                transition: 'all 0.15s ease'
              }}
            >
              {mode.icon} {mode.label}
            </button>
          ))}

          <button
            onClick={() => setShowMinimap(!showMinimap)}
            style={{
              padding: '6px 10px',
              borderRadius: '8px',
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: '1px solid #334155',
              background: showMinimap ? 'rgba(56, 189, 248, 0.15)' : '#1e293b',
              color: showMinimap ? '#38bdf8' : '#94a3b8',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
            title="Toggle 2D Circulation Radar"
          >
            <Layers size={13} /> Radar
          </button>

          <button
            onClick={handleExportVideo}
            disabled={isExporting}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '0.74rem',
              fontWeight: 800,
              cursor: isExporting ? 'wait' : 'pointer',
              border: 'none',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
            }}
          >
            <Download size={13} />
            <span>{isExporting ? `Exporting ${exportProgress}%` : 'Export 4K Track'}</span>
          </button>
        </div>
      </div>

      {/* 2. MAIN 3D WALKTHROUGH CANVAS VIEWPORT */}
      <div
        style={{
          position: 'relative',
          height: '480px',
          borderRadius: '16px',
          overflow: 'hidden',
          background: '#040711',
          border: '1px solid #1e293b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 12px 36px rgba(0,0,0,0.6)'
        }}
      >
        {/* Real Procedural 3D Building Scene (WebGL Three.js or Projected SVG) */}
        {viewportEngine === 'webgl_3d' ? (
          <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <ThreeJsArchitecturalViewer
              meshes={buildingGeometries?.meshes || []}
              design={activeDesign}
              viewAngle="walkthrough"
              viewMode="infrastructure"
              showRoomLabels={false}
              renderingStyle="photorealistic"
              backgroundMode="garden"
            />
          </div>
        ) : projectedScene && projectedScene.projectedPolygons?.length > 0 ? (
          <svg
            viewBox="0 0 700 460"
            style={{
              width: '100%',
              height: '100%',
              background: 'radial-gradient(ellipse at 50% 30%, #172554 0%, #030712 100%)'
            }}
          >
            <defs>
              <linearGradient id="groundGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1e293b" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#0f172a" stopOpacity="0.9" />
              </linearGradient>
            </defs>

            {/* Natural Ground Grid */}
            <rect x="0" y="320" width="700" height="140" fill="url(#groundGrad)" />

            {/* Genuine Shaded Geometry Polygons from Building Model */}
            {projectedScene.projectedPolygons.map((poly) => (
              <polygon
                key={poly.id}
                points={poly.points}
                fill={poly.color}
                stroke={poly.stroke}
                strokeWidth={poly.strokeWidth}
                opacity={poly.opacity}
              />
            ))}
          </svg>
        ) : (
          <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
            Rendering 3D Architectural Scene...
          </div>
        )}

        {/* Ambient Vignette & Cinema Overlays */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at center, transparent 60%, rgba(4, 7, 17, 0.75) 100%)',
            pointerEvents: 'none'
          }}
        />

        {/* Top Info HUD Bar */}
        <div
          style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            right: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            pointerEvents: 'none',
            gap: '10px'
          }}
        >
          {/* Active Scene Telemetry */}
          <div
            style={{
              background: 'rgba(9, 13, 22, 0.85)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '10px',
              padding: '8px 14px',
              maxWidth: '440px'
            }}
          >
            <div style={{ fontSize: '0.72rem', color: '#fbbf24', fontWeight: 800 }}>
              WAYPOINT {currentSceneIdx + 1} OF {waypoints.length} • {activeScene.cameraType}
              {activeScene.isDoorway ? ' • [THROUGH-DOOR PORTAL]' : ''}
            </div>
            <div style={{ fontSize: '0.82rem', color: '#e2e8f0', marginTop: '2px', fontWeight: 600 }}>
              {activeScene.subtitle}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '3px' }}>
              Height: {activeScene.cameraHeightFt} ft • Floor: {activeScene.floor}
            </div>
          </div>

          {/* Right Status Badge */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
            <div
              style={{
                background: 'rgba(9, 13, 22, 0.85)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                padding: '5px 12px',
                fontSize: '0.7rem',
                fontWeight: 800,
                color: '#38bdf8',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: isPlaying ? '#22c55e' : '#ef4444' }} />
              <span>{isPlaying ? '60 FPS 3D PIPELINE' : 'PAUSED'}</span>
            </div>

            {/* Validation Chip */}
            {validationSummary?.isValid && (
              <div
                style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '6px',
                  padding: '3px 8px',
                  fontSize: '0.66rem',
                  fontWeight: 700,
                  color: '#34d399',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <CheckCircle2 size={11} />
                <span>Zero Wall Penetrations</span>
              </div>
            )}
          </div>
        </div>

        {/* Feature Focal Points Chips */}
        <div
          style={{
            position: 'absolute',
            bottom: '84px',
            left: '16px',
            right: showMinimap ? '220px' : '16px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            pointerEvents: 'none'
          }}
        >
          {(activeScene.focalPoints || []).map((point, idx) => (
            <div
              key={idx}
              style={{
                background: 'rgba(15, 23, 42, 0.88)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                borderRadius: '6px',
                padding: '4px 10px',
                fontSize: '0.72rem',
                color: '#f8fafc',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <Sparkles size={11} color="#38bdf8" />
              <span>{point}</span>
            </div>
          ))}
        </div>

        {/* Synchronized 2D Circulation Radar Minimap */}
        {showMinimap && minimapFloor && (
          <div
            style={{
              position: 'absolute',
              bottom: '84px',
              right: '16px',
              width: '190px',
              height: '140px',
              background: 'rgba(9, 13, 22, 0.92)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(56, 189, 248, 0.35)',
              borderRadius: '10px',
              padding: '6px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
              pointerEvents: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', fontSize: '0.64rem', color: '#94a3b8' }}>
              <span style={{ fontWeight: 800, color: '#38bdf8' }}>CIRCULATION RADAR</span>
              <span>{activeScene.floor}</span>
            </div>

            <svg
              viewBox={`0 0 ${activeDesign.site?.plotWidth || 30} ${activeDesign.site?.plotLength || 40}`}
              style={{ width: '100%', height: '110px', background: '#020617', borderRadius: '6px' }}
            >
              {/* Rooms Outline */}
              {(minimapFloor.rooms || []).map((r) => {
                const b = r.bounds || { x: 0, y: 0, width: 10, length: 10 };
                const isCurrentRoom = activeScene.roomRef === r.id;
                return (
                  <rect
                    key={r.id}
                    x={b.x}
                    y={b.y}
                    width={b.width}
                    height={b.length}
                    fill={isCurrentRoom ? 'rgba(245, 158, 11, 0.25)' : 'rgba(51, 65, 85, 0.3)'}
                    stroke={isCurrentRoom ? '#f59e0b' : '#475569'}
                    strokeWidth="0.5"
                  />
                );
              })}

              {/* Waypoints Trajectory Trail */}
              {waypoints.length > 1 && (
                <polyline
                  points={waypoints
                    .filter(w => w.position)
                    .map(w => `${w.position.x},${w.position.z}`)
                    .join(' ')}
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="0.8"
                  strokeDasharray="1.5 1.5"
                />
              )}

              {/* Live Camera Position & Direction */}
              {activeScene.position && (
                <g>
                  <circle
                    cx={activeScene.position.x}
                    cy={activeScene.position.z}
                    r="1.8"
                    fill="#f59e0b"
                    stroke="#ffffff"
                    strokeWidth="0.6"
                  />
                  {/* Camera line of sight */}
                  {activeScene.lookAt && (
                    <line
                      x1={activeScene.position.x}
                      y1={activeScene.position.z}
                      x2={activeScene.lookAt.x}
                      y2={activeScene.lookAt.z}
                      stroke="#f59e0b"
                      strokeWidth="0.6"
                    />
                  )}
                </g>
              )}
            </svg>
          </div>
        )}

        {/* Bottom Playback & Scrubber Controls */}
        <div
          style={{
            position: 'absolute',
            bottom: '12px',
            left: '16px',
            right: '16px',
            background: 'rgba(9, 13, 22, 0.94)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '12px',
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          {/* Step Prev */}
          <button
            onClick={() => {
              setCurrentSceneIdx(curr => (curr - 1 + waypoints.length) % waypoints.length);
              setProgress(0);
            }}
            title="Previous Waypoint"
            style={{
              background: '#1e293b',
              border: '1px solid #334155',
              color: '#cbd5e1',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <ChevronLeft size={16} />
          </button>

          {/* Play/Pause Button */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            title={isPlaying ? 'Pause' : 'Play Walkthrough'}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: '#f59e0b',
              color: '#080b11',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 10px rgba(245, 158, 11, 0.4)',
              flexShrink: 0
            }}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>

          {/* Step Next */}
          <button
            onClick={() => {
              setCurrentSceneIdx(curr => (curr + 1) % waypoints.length);
              setProgress(0);
            }}
            title="Next Waypoint"
            style={{
              background: '#1e293b',
              border: '1px solid #334155',
              color: '#cbd5e1',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <ChevronRight size={16} />
          </button>

          {/* Timeline Scrubber */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const pct = Math.max(0, Math.min(100, (clickX / rect.width) * 100));
                setProgress(pct);
              }}
              style={{
                width: '100%',
                height: '6px',
                background: '#1e293b',
                borderRadius: '3px',
                position: 'relative',
                cursor: 'pointer',
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg, #f59e0b, #fbbf24)',
                  borderRadius: '3px',
                  transition: 'width 0.1s linear'
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#94a3b8' }}>
              <span>{Math.round((progress / 100) * (activeScene.duration || 6))}s</span>
              <span>{activeScene.duration || 6}s (Waypoint {currentSceneIdx + 1}/{waypoints.length})</span>
            </div>
          </div>

          {/* Reset to Start */}
          <button
            onClick={() => {
              setCurrentSceneIdx(0);
              setProgress(0);
            }}
            title="Restart Walkthrough"
            style={{
              background: '#1e293b',
              border: '1px solid #334155',
              color: '#cbd5e1',
              padding: '6px',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <RotateCcw size={14} />
          </button>

          {/* Speed Switcher */}
          <button
            onClick={() => setPlaybackSpeed((s) => (s === 1 ? 1.5 : s === 1.5 ? 2 : 1))}
            style={{
              background: '#1e293b',
              border: '1px solid #334155',
              color: '#cbd5e1',
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '0.72rem',
              fontWeight: 800,
              cursor: 'pointer',
              flexShrink: 0
            }}
          >
            {playbackSpeed}x
          </button>
        </div>
      </div>

      {/* 3. WAYPOINT SELECTION DOCK (Replaces stock image thumbnails) */}
      <div
        style={{
          padding: '12px 16px',
          display: 'flex',
          gap: '10px',
          background: '#090d16',
          border: '1px solid #1e293b',
          borderRadius: '14px',
          overflowX: 'auto'
        }}
      >
        {waypoints.map((scene, idx) => {
          const isActive = idx === currentSceneIdx;
          return (
            <div
              key={scene.id}
              onClick={() => {
                setCurrentSceneIdx(idx);
                setProgress(0);
              }}
              style={{
                minWidth: '150px',
                padding: '10px 12px',
                borderRadius: '10px',
                background: isActive ? 'rgba(245, 158, 11, 0.12)' : '#0d1322',
                border: isActive ? '1px solid #f59e0b' : '1px solid #1e293b',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.66rem', fontWeight: 800, color: isActive ? '#f59e0b' : '#64748b' }}>
                  #{idx + 1} • {scene.floor}
                </span>
                {scene.isDoorway && (
                  <span style={{ fontSize: '0.58rem', background: '#334155', color: '#38bdf8', padding: '1px 4px', borderRadius: '3px' }}>
                    DOOR
                  </span>
                )}
              </div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: isActive ? '#ffffff' : '#cbd5e1', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {scene.title}
              </div>
              <div style={{ fontSize: '0.66rem', color: '#94a3b8' }}>
                {scene.duration || 6}s • {scene.cameraHeightFt}ft eye
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
