import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  Layers,
  Sun,
  Sunset,
  Moon,
  Sparkles,
  Download,
  RotateCcw,
  Play,
  Pause,
  Eye,
  EyeOff,
  ZoomIn,
  ZoomOut,
  FolderPlus,
  Home,
  Building,
  Compass,
  Camera,
  Maximize2,
  Video,
  ChevronRight
} from 'lucide-react';
import {
  buildVisuals5dScene,
  DEFAULTS_5D,
  LIGHTING_PRESETS_5D,
  CAMERA_PRESETS_5D
} from '../../engine/visuals5d/visuals5dEngine.js';
import {
  getWoodFloorTexture,
  getTeakDeckingTexture,
  getPorcelainTileTexture,
  getAreaRugTexture,
  getGrassLawnTexture,
  getStonePaverTexture,
  getMangaloreRoofTileTexture,
  getCalacattaMarbleTexture
} from './architecturalMaterialSystem.js';
import { simplifyRoomName } from './architecturalRoomUtils.js';
import { buildRealisticModel } from '../../engine/interior/assetLoaderService.js';

// =============================================================================
// VIEWPOINT & INSPECTION PRESETS
// =============================================================================

export const VISUAL_MODES = Object.freeze({
  ROOM_WALK_IN: 'room_walk_in',       // First-person 360° immersive room inspection
  EXTERIOR_REALITY: 'exterior_reality', // Multi-angle photorealistic building exterior
  CUTAWAY_5D: 'cutaway'               // Authoritative 5D isometric cutaway
});

export const EXTERIOR_VIEWPOINTS = [
  { id: 'front', label: 'Front Elevation', desc: 'Eye-level frontal view of entrance facade' },
  { id: 'front_left', label: 'Front-Left (Hero)', desc: '3/4 dramatic hero angle showcasing massing' },
  { id: 'front_right', label: 'Front-Right', desc: 'View featuring car porch, entrance and garden' },
  { id: 'left', label: 'Left Flank', desc: 'Side elevation highlighting fenestrations and balconies' },
  { id: 'right', label: 'Right Flank', desc: 'Side elevation showcasing building profile' },
  { id: 'rear', label: 'Rear Elevation', desc: 'Backyard elevation with privacy openings' },
  { id: 'entrance', label: 'Grand Entrance', desc: 'Close-up perspective of verandah, porch and teak door' },
  { id: 'garden', label: 'Garden & Walkway', desc: 'Ground perspective through landscaped lawn and trees' },
  { id: 'terrace', label: 'Rooftop Terrace', desc: 'Elevated view from rooftop pergola deck' },
  { id: 'aerial', label: 'Aerial Drone Orbit', desc: 'High-altitude panoramic view of the entire property' }
];

export const ROOM_INSPECTION_ANGLES = [
  { id: 'front', label: 'Front / Counter', icon: '⬆️', desc: 'Look forward at primary counter / feature wall' },
  { id: 'left', label: 'Left Wall', icon: '⬅️', desc: 'View complete left side of room' },
  { id: 'right', label: 'Right Wall', icon: '➡️', desc: 'View complete right side of room' },
  { id: 'behind', label: 'Behind / Entrance', icon: '⬇️', desc: 'View entrance door and opposite wall' },
  { id: 'ceiling', label: 'Ceiling & Lights', icon: '🔼', desc: 'Look upward at ceiling, recessed lights, and chimney/fan' },
  { id: 'floor', label: 'Floor & Finishes', icon: '🔽', desc: 'Look downward at floor tiles, skirting, and base cabinets' },
  { id: 'corner_nw', label: 'NW Corner', icon: '↖️', desc: 'Inspect North-West corner' },
  { id: 'corner_ne', label: 'NE Corner', icon: '↗️', desc: 'Inspect North-East corner' },
  { id: 'corner_se', label: 'SE Corner', icon: '↘️', desc: 'Inspect South-East corner' },
  { id: 'corner_sw', label: 'SW Corner', icon: '↙️', desc: 'Inspect South-West corner' },
  { id: 'tour_360', label: '360° Pan Tour', icon: '🔄', desc: 'Continuous 360° panoramic rotation around room' }
];

/**
 * Visuals5dStudio
 * 
 * LABOURCONNECT 2.0 — 5D Photorealistic Architectural Reality Visual Engine.
 * 
 * Strict Single Source of Truth:
 * All floors, rooms, dimensions, walls, doors, windows, and furniture positions
 * are extracted directly from the currently generated 3D design.
 */
export default function Visuals5dStudio({
  design = null,
  onBackToDesign,
  onSaveToProject
}) {
  // ---------------------------------------------------------------------------
  // STATE MANAGEMENT
  // ---------------------------------------------------------------------------
  const [activeVisualMode, setActiveVisualMode] = useState(VISUAL_MODES.ROOM_WALK_IN);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [exteriorViewpoint, setExteriorViewpoint] = useState('front_left');
  const [roomInspectionAngle, setRoomInspectionAngle] = useState('front');
  const [lightingAtmosphere, setLightingAtmosphere] = useState('day'); // 'day' | 'golden_hour' | 'night'
  const [wallMode, setWallMode] = useState('low'); // 'low' (cutaway) | 'full'
  const [activeFloorFilter, setActiveFloorFilter] = useState('all');
  const [showFurniture, setShowFurniture] = useState(true);
  const [showRoomLabels, setShowRoomLabels] = useState(true);
  const [isAutoOrbiting, setIsAutoOrbiting] = useState(false);
  const [hudLabels, setHudLabels] = useState([]);
  const [isSnapshotting, setIsSnapshotting] = useState(false);

  // Canvas & Three.js Refs
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const orthoCameraRef = useRef(null);
  const perspCameraRef = useRef(null);
  const activeCameraRef = useRef(null);
  const controlsRef = useRef(null);

  // Group Refs
  const walkInGroupRef = useRef(null);
  const exteriorGroupRef = useRef(null);
  const cutawayGroupRef = useRef(null);
  const lightsGroupRef = useRef(null);

  // Target Camera Poses for smooth animations
  const roomStandingPosRef = useRef(new THREE.Vector3(20, 5.25, 30));
  const roomLookTargetRef = useRef(new THREE.Vector3(20, 5.25, 20));
  const panTourAngleRef = useRef(0);

  // ---------------------------------------------------------------------------
  // 1. EXTRACT AUTHORITATIVE DESIGN DATA (SINGLE SOURCE OF TRUTH)
  // ---------------------------------------------------------------------------
  const scene5d = useMemo(() => {
    if (!design || !design.site || !Array.isArray(design.floors)) {
      return null;
    }
    try {
      return buildVisuals5dScene(design, {
        wallMode,
        activeFloor: activeFloorFilter,
        showFurniture,
        lightingPreset: lightingAtmosphere === 'golden_hour' ? 'warm_evening' : (lightingAtmosphere === 'night' ? 'dusk' : 'day')
      });
    } catch (err) {
      console.warn('[Visuals5dStudio] Failed to build 5D scene:', err);
      return null;
    }
  }, [design, wallMode, activeFloorFilter, showFurniture, lightingAtmosphere]);

  // Extract Floor Groups with Rooms dynamically from canonical design
  const floorGroups = useMemo(() => {
    if (!design || !Array.isArray(design.floors)) return [];
    return design.floors.map((fl, fIdx) => ({
      floorIndex: fIdx,
      id: fl.id || `floor_${fIdx}`,
      name: fl.name || (fIdx === 0 ? 'Ground Floor' : fIdx === 1 ? 'First Floor' : 'Terrace Floor'),
      rooms: Array.isArray(fl.rooms) ? fl.rooms : []
    }));
  }, [design]);

  // All rooms flattened for easy search
  const allDesignRooms = useMemo(() => {
    return floorGroups.flatMap(f => f.rooms.map(r => ({
      ...r,
      floorIndex: f.floorIndex,
      floorName: f.name
    })));
  }, [floorGroups]);

  // Active selected room object
  const activeRoom = useMemo(() => {
    if (!allDesignRooms.length) return null;
    if (selectedRoomId) {
      const match = allDesignRooms.find(r => r.id === selectedRoomId);
      if (match) return match;
    }
    // Default to Kitchen or Living Room if present, else first available room
    const kitchen = allDesignRooms.find(r => (r.type || '').includes('kitchen') || (r.name || '').toLowerCase().includes('kitchen'));
    if (kitchen) return kitchen;
    const living = allDesignRooms.find(r => (r.type || '').includes('living') || (r.name || '').toLowerCase().includes('living'));
    if (living) return living;
    return allDesignRooms[0];
  }, [allDesignRooms, selectedRoomId]);

  // Synchronize initial selected room ID
  useEffect(() => {
    if (activeRoom && (!selectedRoomId || !allDesignRooms.some(r => r.id === selectedRoomId))) {
      setSelectedRoomId(activeRoom.id);
    }
  }, [activeRoom, selectedRoomId, allDesignRooms]);

  // ---------------------------------------------------------------------------
  // 2. THREE.JS INITIALIZATION & LIFECYCLE
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;
    const aspect = width / height;

    // A. SCENE
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#FAFAF7');
    sceneRef.current = scene;

    // B. ORTHOGRAPHIC CAMERA (For 5D Cutaway mode)
    const frustumSize = 85;
    const orthoCam = new THREE.OrthographicCamera(
      (-frustumSize * aspect) / 2,
      (frustumSize * aspect) / 2,
      frustumSize / 2,
      -frustumSize / 2,
      0.1,
      1000
    );
    orthoCam.position.set(65, 60, 65);
    orthoCam.zoom = 1.0;
    orthoCam.updateProjectionMatrix();
    orthoCameraRef.current = orthoCam;

    // C. PERSPECTIVE CAMERA (For Room Walk-in & Exterior Reality modes)
    const perspCam = new THREE.PerspectiveCamera(70, aspect, 0.1, 1000);
    perspCam.position.set(20, 5.25, 30);
    perspCameraRef.current = perspCam;

    // Set initial active camera
    activeCameraRef.current = activeVisualMode === VISUAL_MODES.CUTAWAY_5D ? orthoCam : perspCam;

    // D. RENDERER
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // E. ORBIT CONTROLS
    const controls = new OrbitControls(activeCameraRef.current, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.screenSpacePanning = true;
    controls.maxPolarAngle = Math.PI - 0.05; // Full vertical freedom
    controls.minDistance = 0.1;
    controls.update();
    controlsRef.current = controls;

    // F. GROUPS
    const walkInGroup = new THREE.Group();
    const exteriorGroup = new THREE.Group();
    const cutawayGroup = new THREE.Group();
    const lightsGroup = new THREE.Group();

    scene.add(walkInGroup);
    scene.add(exteriorGroup);
    scene.add(cutawayGroup);
    scene.add(lightsGroup);

    walkInGroupRef.current = walkInGroup;
    exteriorGroupRef.current = exteriorGroup;
    cutawayGroupRef.current = cutawayGroup;
    lightsGroupRef.current = lightsGroup;

    // G. ANIMATION LOOP
    let animId = null;
    const tempVec = new THREE.Vector3();

    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (controlsRef.current) {
        controlsRef.current.update();
      }

      // Continuous 360° pan tour in Room Walk-In mode
      if (activeVisualMode === VISUAL_MODES.ROOM_WALK_IN && roomInspectionAngle === 'tour_360' && controlsRef.current && perspCameraRef.current) {
        panTourAngleRef.current += 0.007;
        const standing = roomStandingPosRef.current;
        const radius = 6.0;
        const tx = standing.x + Math.sin(panTourAngleRef.current) * radius;
        const tz = standing.z + Math.cos(panTourAngleRef.current) * radius;
        controlsRef.current.target.set(tx, standing.y, tz);
      }

      // Exterior auto orbit
      if (activeVisualMode === VISUAL_MODES.EXTERIOR_REALITY && isAutoOrbiting && controlsRef.current) {
        controlsRef.current.autoRotate = true;
        controlsRef.current.autoRotateSpeed = 1.4;
      } else if (controlsRef.current) {
        controlsRef.current.autoRotate = false;
      }

      // Render Active Camera
      const curCam = activeCameraRef.current || perspCam;
      renderer.render(scene, curCam);
    };
    animate();

    // H. RESIZE OBSERVER
    const handleResize = () => {
      if (!container || !renderer) return;
      const newW = container.clientWidth || 800;
      const newH = container.clientHeight || 600;
      const newAspect = newW / newH;

      if (orthoCam) {
        orthoCam.left = (-frustumSize * newAspect) / 2;
        orthoCam.right = (frustumSize * newAspect) / 2;
        orthoCam.top = frustumSize / 2;
        orthoCam.bottom = -frustumSize / 2;
        orthoCam.updateProjectionMatrix();
      }

      if (perspCam) {
        perspCam.aspect = newAspect;
        perspCam.updateProjectionMatrix();
      }

      renderer.setSize(newW, newH);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // ---------------------------------------------------------------------------
  // 3. SYNCHRONIZE ACTIVE CAMERA WITH VISUAL MODE
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!controlsRef.current || !rendererRef.current) return;
    const targetCam = activeVisualMode === VISUAL_MODES.CUTAWAY_5D
      ? orthoCameraRef.current
      : perspCameraRef.current;

    if (targetCam) {
      activeCameraRef.current = targetCam;
      controlsRef.current.object = targetCam;
      controlsRef.current.update();
    }

    // Toggle group visibility
    if (walkInGroupRef.current) {
      walkInGroupRef.current.visible = activeVisualMode === VISUAL_MODES.ROOM_WALK_IN;
    }
    if (exteriorGroupRef.current) {
      exteriorGroupRef.current.visible = activeVisualMode === VISUAL_MODES.EXTERIOR_REALITY;
    }
    if (cutawayGroupRef.current) {
      cutawayGroupRef.current.visible = activeVisualMode === VISUAL_MODES.CUTAWAY_5D;
    }
  }, [activeVisualMode]);

  // ---------------------------------------------------------------------------
  // 4. DYNAMIC LIGHTING ENGINE (DAYLIGHT, GOLDEN-HOUR, NIGHT)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!lightsGroupRef.current || !sceneRef.current) return;
    const group = lightsGroupRef.current;
    while (group.children.length > 0) group.remove(group.children[0]);

    const isNight = lightingAtmosphere === 'night';
    const isGolden = lightingAtmosphere === 'golden_hour';

    const bgCol = isNight ? '#0b1329' : isGolden ? '#fef3c7' : '#f8fafc';
    sceneRef.current.background = new THREE.Color(bgCol);

    if (rendererRef.current) {
      rendererRef.current.toneMappingExposure = isNight ? 1.25 : isGolden ? 1.05 : 1.0;
    }

    // A. Sky & Ambient Light
    const hemiSky = isNight ? '#1e293b' : isGolden ? '#fed7aa' : '#ffffff';
    const hemiGround = isNight ? '#020617' : isGolden ? '#ea580c' : '#e2e8f0';
    const hemiInt = isNight ? 0.35 : isGolden ? 0.75 : 0.95;
    const hemiLight = new THREE.HemisphereLight(hemiSky, hemiGround, hemiInt);
    group.add(hemiLight);

    // B. Directional Sun Light
    const sunColor = isNight ? '#60a5fa' : isGolden ? '#f97316' : '#fffbeb';
    const sunIntensity = isNight ? 0.25 : isGolden ? 1.4 : 1.35;
    const sunDir = isGolden ? [50, 22, 35] : [45, 65, 30];
    const sunLight = new THREE.DirectionalLight(sunColor, sunIntensity);
    sunLight.position.set(sunDir[0], sunDir[1], sunDir[2]);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.bias = -0.0004;
    group.add(sunLight);

    // C. Interior Warm Glowing Lights (Crucial for Night & Golden Hour)
    if (activeRoom && activeRoom.bounds) {
      const b = activeRoom.bounds;
      const fIdx = activeRoom.floorIndex !== undefined ? activeRoom.floorIndex : 0;
      const floorY = fIdx * DEFAULTS_5D.FLOOR_TO_FLOOR_HEIGHT + DEFAULTS_5D.PLINTH_HEIGHT;
      const rx = b.x + b.width / 2;
      const rz = b.y + b.length / 2;

      const roomSpot = new THREE.PointLight(
        isNight ? '#fde047' : '#fef08a',
        isNight ? 2.5 : 1.2,
        28,
        1.5
      );
      roomSpot.position.set(rx, floorY + 8.5, rz);
      roomSpot.castShadow = true;
      group.add(roomSpot);
    }
  }, [lightingAtmosphere, activeRoom]);

  // ---------------------------------------------------------------------------
  // 5. BUILD COMPLETE ROOM WALK-IN REALITY ENVIRONMENT
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!walkInGroupRef.current || !activeRoom || !activeRoom.bounds || !design) return;
    const group = walkInGroupRef.current;
    while (group.children.length > 0) group.remove(group.children[0]);

    const b = activeRoom.bounds;
    const fIdx = activeRoom.floorIndex !== undefined ? activeRoom.floorIndex : 0;
    const floorY = fIdx * DEFAULTS_5D.FLOOR_TO_FLOOR_HEIGHT + DEFAULTS_5D.PLINTH_HEIGHT;
    const ceilY = floorY + 10.0;
    const rType = (activeRoom.type || activeRoom.name || '').toLowerCase();
    const archStyle = design.inputs?.archStyle || design.metadata?.style || 'contemporary';
    const isVintage = archStyle === 'vintage' || archStyle === 'traditional_duplex';

    const rw = b.width;
    const rl = b.length;
    const rx = b.x;
    const rz = b.y;

    // Helper: make textured standard mesh
    const makeBox = (bx, by, bz, bw, bh, bl, mat, cast = true, recv = true) => {
      const geo = new THREE.BoxGeometry(bw, bh, bl);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(bx + bw / 2, by + bh / 2, bz + bl / 2);
      mesh.castShadow = cast;
      mesh.receiveShadow = recv;
      return mesh;
    };

    // 1. FLOOR COVERING (HIGH-RES PBR TEXTURE)
    let floorMat;
    if (rType.includes('kitchen') || rType.includes('bath')) {
      const tileTex = getPorcelainTileTexture(Math.max(2, Math.round(rw / 2.5)), Math.max(2, Math.round(rl / 2.5)));
      floorMat = new THREE.MeshStandardMaterial({
        map: tileTex,
        roughness: 0.18,
        metalness: 0.05
      });
    } else if (rType.includes('bed')) {
      const woodTex = getWoodFloorTexture(Math.max(2, Math.round(rw / 3)), Math.max(2, Math.round(rl / 3)));
      floorMat = new THREE.MeshStandardMaterial({
        map: woodTex,
        roughness: 0.35,
        metalness: 0.02
      });
    } else if (rType.includes('pooja')) {
      const marbleTex = getCalacattaMarbleTexture(2, 2);
      floorMat = new THREE.MeshStandardMaterial({
        map: marbleTex,
        roughness: 0.12,
        metalness: 0.04
      });
    } else {
      // Living / Dining: Statuario Marble
      const marbleTex = getCalacattaMarbleTexture(Math.max(2, Math.round(rw / 4)), Math.max(2, Math.round(rl / 4)));
      floorMat = new THREE.MeshStandardMaterial({
        map: marbleTex,
        roughness: 0.15,
        metalness: 0.03
      });
    }
    group.add(makeBox(rx, floorY, rz, rw, 0.08, rl, floorMat, false, true));

    // Area Rug under seating/bed
    if (rType.includes('living') || rType.includes('bed')) {
      const rugTex = getAreaRugTexture();
      const rugW = Math.min(rw * 0.65, 11);
      const rugL = Math.min(rl * 0.55, 8.5);
      const rugMat = new THREE.MeshStandardMaterial({ map: rugTex, roughness: 0.95 });
      group.add(makeBox(rx + (rw - rugW) / 2, floorY + 0.09, rz + (rl - rugL) / 2, rugW, 0.02, rugL, rugMat, false, true));
    }

    // 2. CEILING SLAB & FALSE CEILING COVE LIGHTING
    const ceilMat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.7 });
    group.add(makeBox(rx, ceilY, rz, rw, 0.4, rl, ceilMat, false, true));

    // Perimeter False Ceiling Drop Strip with Warm LED Glow
    const coveDrop = 0.55;
    const coveBorder = 1.2;
    const coveMat = new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.5 });
    // North, South, East, West false ceiling borders
    group.add(makeBox(rx, ceilY - coveDrop, rz, rw, coveDrop, coveBorder, coveMat));
    group.add(makeBox(rx, ceilY - coveDrop, rz + rl - coveBorder, rw, coveDrop, coveBorder, coveMat));
    group.add(makeBox(rx, ceilY - coveDrop, rz + coveBorder, coveBorder, coveDrop, rl - coveBorder * 2, coveMat));
    group.add(makeBox(rx + rw - coveBorder, ceilY - coveDrop, rz + coveBorder, coveBorder, coveDrop, rl - coveBorder * 2, coveMat));

    // LED Cove Light Strip (Warm Glowing Emissive Trim)
    const ledMat = new THREE.MeshStandardMaterial({
      color: '#fef08a',
      emissive: '#fef08a',
      emissiveIntensity: lightingAtmosphere === 'night' ? 1.6 : 0.8,
      roughness: 0.2
    });
    group.add(makeBox(rx + coveBorder, ceilY - coveDrop + 0.02, rz + coveBorder, rw - coveBorder * 2, 0.04, 0.08, ledMat));

    // 3. FOUR FULL 10-FT WALLS WITH SKIRTING
    const wallThick = 0.5;
    const wallMat = new THREE.MeshStandardMaterial({
      color: isVintage ? '#fbf8f2' : '#f8fafc',
      roughness: 0.8
    });
    const skirtingMat = new THREE.MeshStandardMaterial({
      color: isVintage ? '#3e2723' : '#1e293b',
      roughness: 0.4
    });

    // North Wall (Front / Counter)
    group.add(makeBox(rx, floorY, rz - wallThick, rw, 10.0, wallThick, wallMat));
    group.add(makeBox(rx, floorY, rz, rw, 0.35, 0.06, skirtingMat));

    // South Wall (Behind / Entrance)
    group.add(makeBox(rx, floorY, rz + rl, rw, 10.0, wallThick, wallMat));
    group.add(makeBox(rx, floorY, rz + rl - 0.06, rw, 0.35, 0.06, skirtingMat));

    // West Wall (Left side)
    group.add(makeBox(rx - wallThick, floorY, rz, wallThick, 10.0, rl, wallMat));
    group.add(makeBox(rx, floorY, rz, 0.06, 0.35, rl, skirtingMat));

    // East Wall (Right side)
    group.add(makeBox(rx + rw, floorY, rz, wallThick, 10.0, rl, wallMat));
    group.add(makeBox(rx + rw - 0.06, floorY, rz, 0.06, 0.35, rl, skirtingMat));

    // 4. KITCHEN EXPERIENCE SPECIFICS
    if (rType.includes('kitchen')) {
      // A. Modular Base Counter (Shaker doors, marble top, undermount sink, mixer faucet, 4-burner hob)
      const counterW = rw - 1.2;
      const counterD = 2.4;
      const counterH = 2.9;
      const baseCounter = buildRealisticModel('kitchen_counter_base', { width: counterW, depth: counterD, height: counterH }, archStyle);
      baseCounter.position.set(rx + rw / 2, floorY, rz + counterD / 2 + 0.1);
      group.add(baseCounter);

      // B. Overhead Upper Wall Cabinets (Mounted 5.6 ft above floor with under-cabinet LED light)
      const upperCab = buildRealisticModel('kitchen_upper_cabinets', { width: counterW, depth: 1.3, height: 2.6 }, archStyle);
      upperCab.position.set(rx + rw / 2, floorY + 5.5, rz + 0.65 + 0.1);
      group.add(upperCab);

      // C. Overhead Pyramid Chimney Hood with Flue
      const chimney = buildRealisticModel('kitchen_hob_unit', { width: 3.2, depth: 1.8, height: 2.8 }, archStyle);
      chimney.position.set(rx + rw * 0.72, floorY, rz + counterD / 2 + 0.1);
      group.add(chimney);

      // D. French Door Stainless Steel Refrigerator
      const fridge = buildRealisticModel('refrigerator', { width: 3.2, depth: 2.8, height: 6.2 }, archStyle);
      fridge.position.set(rx + 2.0, floorY, rz + rl - 1.8);
      group.add(fridge);

      // E. Breakfast Island & Stools (if width >= 11 ft)
      if (rw >= 11.0 && rl >= 10.0) {
        const island = buildRealisticModel('kitchen_island', { width: rw * 0.55, depth: 2.8, height: 3.0 }, archStyle);
        island.position.set(rx + rw / 2, floorY, rz + rl * 0.58);
        group.add(island);
      }
    }

    // 5. LIVING ROOM EXPERIENCE SPECIFICS
    else if (rType.includes('living')) {
      // A. Sectional Sofa Suite
      const sofa = buildRealisticModel('sofa_sectional_l', { width: rw * 0.62, depth: 7.0, height: 2.9 }, archStyle);
      sofa.position.set(rx + rw * 0.42, floorY, rz + rl * 0.65);
      group.add(sofa);

      // B. Low Coffee Table
      const coffeeTable = buildRealisticModel('coffee_table', { width: 4.2, depth: 2.4, height: 1.4 }, archStyle);
      coffeeTable.position.set(rx + rw * 0.42, floorY, rz + rl * 0.45);
      group.add(coffeeTable);

      // C. Media Credenza with 65" 4K OLED TV
      const tvConsole = buildRealisticModel('tv_console', { width: rw * 0.58, depth: 1.6, height: 4.5 }, archStyle);
      tvConsole.position.set(rx + rw * 0.42, floorY, rz + 1.2);
      group.add(tvConsole);

      // D. Architectural Ceiling Fan
      const fan = buildRealisticModel('ceiling_fan', { width: 4.5, depth: 4.5, height: 1.8 });
      fan.position.set(rx + rw / 2, ceilY - 1.8, rz + rl / 2);
      group.add(fan);
    }

    // 6. MASTER BEDROOM SPECIFICS
    else if (rType.includes('bed')) {
      const isMaster = rType.includes('master');
      // King Platform Bed with Headboard, Duvet & Pillows
      const bed = buildRealisticModel(isMaster ? 'king_bed' : 'queen_bed', { width: 6.8, depth: 7.2, height: 4.2 }, archStyle);
      bed.position.set(rx + rw / 2, floorY, rz + 4.2);
      group.add(bed);

      // Twin Bedside Nightstands with Lamps
      const standL = buildRealisticModel('bedside_table', { width: 1.8, depth: 1.6, height: 2.2 }, archStyle);
      standL.position.set(rx + rw / 2 - 4.4, floorY, rz + 1.4);
      group.add(standL);

      const standR = buildRealisticModel('bedside_table', { width: 1.8, depth: 1.6, height: 2.2 }, archStyle);
      standR.position.set(rx + rw / 2 + 4.4, floorY, rz + 1.4);
      group.add(standR);

      // Full-Height 3-Door Wardrobe with Mirrors
      const wardrobe = buildRealisticModel('wardrobe_3door', { width: rw * 0.65, depth: 2.2, height: 7.8 }, archStyle);
      wardrobe.position.set(rx + rw / 2, floorY, rz + rl - 1.4);
      group.add(wardrobe);

      // Ceiling Fan
      const fan = buildRealisticModel('ceiling_fan', { width: 4.2, depth: 4.2, height: 1.8 });
      fan.position.set(rx + rw / 2, ceilY - 1.8, rz + rl / 2);
      group.add(fan);
    }

    // 7. POOJA ROOM SPECIFICS
    else if (rType.includes('pooja')) {
      // Sacred Carved Teak Mandir Altar with Shikhara, Brass Bell and Diya Lamps
      const mandir = buildRealisticModel('pooja_mandir', { width: rw * 0.75, depth: 2.6, height: 5.6 }, 'vintage');
      mandir.position.set(rx + rw / 2, floorY, rz + 1.6);
      group.add(mandir);
    }

    // 8. DINING ROOM SPECIFICS
    else if (rType.includes('dining')) {
      // 6-Seater Wooden Dining Table with Upholstered Chairs
      const dining = buildRealisticModel('dining_table_6s', { width: rw * 0.65, depth: 4.2, height: 2.8 }, archStyle);
      dining.position.set(rx + rw / 2, floorY, rz + rl / 2);
      group.add(dining);

      // Suspended Pendant Chandelier
      const pendant = buildRealisticModel('pendant_light', { width: 2.4, depth: 2.4, height: 3.2 });
      pendant.position.set(rx + rw / 2, ceilY - 3.2, rz + rl / 2);
      group.add(pendant);
    }

    // 9. BATHROOM SPECIFICS
    else if (rType.includes('bath') || rType.includes('toilet')) {
      // Wall-hung EWC Toilet
      const wc = buildRealisticModel('toilet_ewc', { width: 1.8, depth: 2.4, height: 2.5 });
      wc.position.set(rx + 1.8, floorY, rz + 1.5);
      group.add(wc);

      // Floating Vanity with LED Mirror
      const vanity = buildRealisticModel('bathroom_vanity', { width: 3.0, depth: 1.8, height: 3.2 });
      vanity.position.set(rx + rw - 2.2, floorY, rz + 1.5);
      group.add(vanity);

      // Frameless Glass Shower Enclosure with Rain Shower
      const shower = buildRealisticModel('shower_enclosure', { width: 3.8, depth: 3.8, height: 7.2 });
      shower.position.set(rx + rw - 2.4, floorY, rz + rl - 2.4);
      group.add(shower);
    }

    // Update Standing Eye Level Position inside Room
    roomStandingPosRef.current.set(rx + rw * 0.48, floorY + 5.25, rz + rl * 0.52);

  }, [activeRoom, design, lightingAtmosphere]);

  // ---------------------------------------------------------------------------
  // 6. BUILD COMPLETE PHOTOREALISTIC EXTERIOR BUILDING SCENE
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!exteriorGroupRef.current || !scene5d || !design) return;
    const group = exteriorGroupRef.current;
    while (group.children.length > 0) group.remove(group.children[0]);

    const site = design.site || {};
    const plotW = site.plotWidth || 40;
    const plotL = site.plotLength || 60;
    const env = site.buildableEnvelope || { x: 3, y: 5, width: 34, length: 50 };
    const archStyle = design.inputs?.archStyle || design.metadata?.style || 'contemporary';
    const isVintage = archStyle === 'vintage' || archStyle === 'traditional_duplex';

    // Helper: Box
    const makeBox = (bx, by, bz, bw, bh, bl, mat, cast = true, recv = true) => {
      const geo = new THREE.BoxGeometry(bw, bh, bl);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(bx + bw / 2, by + bh / 2, bz + bl / 2);
      mesh.castShadow = cast;
      mesh.receiveShadow = recv;
      return mesh;
    };

    // A. Lush Green Landscaped Turf Lawn (PBR Grass Texture)
    const lawnTex = getGrassLawnTexture(10, 10);
    const lawnMat = new THREE.MeshStandardMaterial({ map: lawnTex, roughness: 0.85 });
    group.add(makeBox(-15, 0.01, -15, plotW + 30, 0.1, plotL + 30, lawnMat, false, true));

    // B. Cobblestone Driveway & Paved Walkways
    const paverTex = getStonePaverTexture(6, 6);
    const paverMat = new THREE.MeshStandardMaterial({ map: paverTex, roughness: 0.65 });
    group.add(makeBox(env.x + 2, 0.08, 0, 12, 0.12, env.y + 2, paverMat, false, true));

    // C. Foundation Plinth Platform (1.5 ft white rendered base)
    const plinthMat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.85 });
    group.add(makeBox(env.x - 0.8, 0, env.y - 0.8, env.width + 1.6, 1.5, env.length + 1.6, plinthMat, true, true));

    // D. Multi-Storey Exterior Walls & Floor Slabs
    const wallPlasterMat = new THREE.MeshStandardMaterial({
      color: isVintage ? '#fcfbf7' : '#f8fafc',
      roughness: 0.75
    });
    const slabMat = new THREE.MeshStandardMaterial({ color: '#e2e8f0', roughness: 0.5 });
    const floorsCount = design.floors?.length || 2;

    for (let f = 0; f < floorsCount; f++) {
      const fy = f * DEFAULTS_5D.FLOOR_TO_FLOOR_HEIGHT + DEFAULTS_5D.PLINTH_HEIGHT;
      const fh = 10.0;

      // Exterior Walls for Floor f
      group.add(makeBox(env.x, fy, env.y, env.width, fh, 0.75, wallPlasterMat)); // North
      group.add(makeBox(env.x, fy, env.y + env.length - 0.75, env.width, fh, 0.75, wallPlasterMat)); // South
      group.add(makeBox(env.x, fy, env.y, 0.75, fh, env.length, wallPlasterMat)); // West
      group.add(makeBox(env.x + env.width - 0.75, fy, env.y, 0.75, fh, env.length, wallPlasterMat)); // East

      // Intermediate Slab
      if (f > 0) {
        group.add(makeBox(env.x - 0.4, fy - 0.5, env.y - 0.4, env.width + 0.8, 0.5, env.length + 0.8, slabMat));
      }

      // Windows with Frames & Acoustic Glazing
      const windowMat = new THREE.MeshPhysicalMaterial({
        color: '#93c5fd',
        transmission: 0.85,
        opacity: 0.4,
        transparent: true,
        roughness: 0.05
      });
      const frameMat = new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.4 });

      // Front Window Pair
      group.add(makeBox(env.x + 3.5, fy + 2.8, env.y - 0.1, 4.5, 4.5, 0.25, frameMat));
      group.add(makeBox(env.x + 3.7, fy + 3.0, env.y, 4.1, 4.1, 0.05, windowMat));

      group.add(makeBox(env.x + env.width - 8.0, fy + 2.8, env.y - 0.1, 4.5, 4.5, 0.25, frameMat));
      group.add(makeBox(env.x + env.width - 7.8, fy + 3.0, env.y, 4.1, 4.1, 0.05, windowMat));
    }

    // E. ROOF & TERRACE PARAPET
    const topFloorY = floorsCount * DEFAULTS_5D.FLOOR_TO_FLOOR_HEIGHT + DEFAULTS_5D.PLINTH_HEIGHT;
    group.add(makeBox(env.x - 0.6, topFloorY, env.y - 0.6, env.width + 1.2, 0.6, env.length + 1.2, slabMat));

    if (isVintage) {
      // Sloping Mangalore Terracotta Roof
      const tileTex = getMangaloreRoofTileTexture(8, 8);
      const roofMat = new THREE.MeshStandardMaterial({ map: tileTex, roughness: 0.65 });
      const roofGeo = new THREE.ConeGeometry(Math.max(env.width, env.length) * 0.72, 7.5, 4);
      const roof = new THREE.Mesh(roofGeo, roofMat);
      roof.position.set(env.x + env.width / 2, topFloorY + 3.75 + 0.6, env.y + env.length / 2);
      roof.rotation.y = Math.PI / 4;
      roof.castShadow = true;
      group.add(roof);
    } else {
      // Modern Rooftop Terrace Safety Parapet & Pergola
      const parapetMat = new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.7 });
      group.add(makeBox(env.x - 0.4, topFloorY + 0.6, env.y - 0.4, env.width + 0.8, 3.5, 0.4, parapetMat));
      group.add(makeBox(env.x - 0.4, topFloorY + 0.6, env.y + env.length, env.width + 0.8, 3.5, 0.4, parapetMat));
      group.add(makeBox(env.x - 0.4, topFloorY + 0.6, env.y - 0.4, 0.4, 3.5, env.length + 0.8, parapetMat));
      group.add(makeBox(env.x + env.width, topFloorY + 0.6, env.y - 0.4, 0.4, 3.5, env.length + 0.8, parapetMat));
    }

    // F. BOUNDARY WALL & GATE
    const boundMat = new THREE.MeshStandardMaterial({ color: '#e2e8f0', roughness: 0.8 });
    const wallH = 4.2;
    // Front gate opening left & right
    group.add(makeBox(0, 0, 0, env.x + 2, wallH, 0.6, boundMat));
    group.add(makeBox(env.x + 14, 0, 0, plotW - (env.x + 14), wallH, 0.6, boundMat));
    group.add(makeBox(0, 0, plotL, plotW, wallH, 0.6, boundMat)); // Rear wall
    group.add(makeBox(0, 0, 0, 0.6, wallH, plotL, boundMat)); // West wall
    group.add(makeBox(plotW - 0.6, 0, 0, 0.6, wallH, plotL, boundMat)); // East wall

    // Metal Gate
    const gateMat = new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.35, metalness: 0.8 });
    group.add(makeBox(env.x + 2.2, 0, 0, 11.6, 4.0, 0.15, gateMat));

    // G. REALISTIC LANDSCAPE TREES
    const treeCoords = [
      [-6, 8], [-6, 32], [-6, 48],
      [plotW + 6, 12], [plotW + 6, 38],
      [6, plotL + 6], [plotW - 8, plotL + 6]
    ];
    treeCoords.forEach(([tx, tz]) => {
      const trunkMat = new THREE.MeshStandardMaterial({ color: '#543d2b', roughness: 0.9 });
      const trunkGeo = new THREE.CylinderGeometry(0.4, 0.6, 6.0, 8);
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.set(tx, 3.0, tz);
      trunk.castShadow = true;
      group.add(trunk);

      const leafMat = new THREE.MeshStandardMaterial({ color: '#2d6a4f', roughness: 0.75 });
      const leafGeo = new THREE.DodecahedronGeometry(3.5, 1);
      const leaf = new THREE.Mesh(leafGeo, leafMat);
      leaf.position.set(tx, 7.8, tz);
      leaf.castShadow = true;
      group.add(leaf);
    });

  }, [scene5d, design]);

  // ---------------------------------------------------------------------------
  // 7. BUILD 5D ISOMETRIC CUTAWAY ENVIRONMENT
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!cutawayGroupRef.current || !scene5d) return;
    const group = cutawayGroupRef.current;
    while (group.children.length > 0) group.remove(group.children[0]);

    // Add elements from scene5d (plinths, low walls, slate caps, doors, windows, furniture)
    const makeBox = (b, mat, cast = true, recv = true) => {
      const bw = Math.max(0.05, b.maxX - b.minX);
      const bh = Math.max(0.05, b.maxY - b.minY);
      const bl = Math.max(0.05, b.maxZ - b.minZ);
      const geo = new THREE.BoxGeometry(bw, bh, bl);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(b.minX + bw / 2, b.minY + bh / 2, b.minZ + bl / 2);
      mesh.castShadow = cast;
      mesh.receiveShadow = recv;
      return mesh;
    };

    // Plinth
    scene5d.elements.plinths.forEach(p => {
      if (p.type === 'contact_shadow_plane') return;
      const mat = new THREE.MeshStandardMaterial({ color: p.color || '#ffffff', roughness: 0.85 });
      group.add(makeBox(p.bounds, mat, true, true));
    });

    // Floor Covers
    scene5d.elements.roomFloors.forEach(rf => {
      const mat = new THREE.MeshStandardMaterial({ color: rf.color || '#c69966', roughness: 0.35 });
      group.add(makeBox(rf.bounds, mat, false, true));
    });

    // Low Cutaway Walls
    scene5d.elements.walls.forEach(w => {
      if (activeFloorFilter !== 'all' && w.floorIndex > Number(activeFloorFilter)) return;
      const mat = new THREE.MeshStandardMaterial({ color: w.color || '#ffffff', roughness: 0.8 });
      group.add(makeBox(w.bounds, mat, true, true));
    });

    // Slate Wall Caps
    scene5d.elements.wallCaps.forEach(cap => {
      if (activeFloorFilter !== 'all' && cap.floorIndex > Number(activeFloorFilter)) return;
      const mat = new THREE.MeshStandardMaterial({ color: cap.color || '#0f172a', roughness: 0.35, metalness: 0.15 });
      group.add(makeBox(cap.bounds, mat, true, true));
    });

    // Furniture in Cutaway Mode
    if (showFurniture) {
      const archStyle = design?.inputs?.archStyle || 'contemporary';
      scene5d.elements.furniture.forEach(item => {
        if (activeFloorFilter !== 'all' && item.floorIndex !== undefined && item.floorIndex > Number(activeFloorFilter)) return;
        const b = item.bounds;
        if (!b) return;
        const w = Math.max(0.5, b.maxX - b.minX);
        const d = Math.max(0.5, b.maxZ - b.minZ);
        const h = Math.max(0.5, b.maxY - b.minY);
        const px = (b.minX + b.maxX) / 2;
        const pz = (b.minZ + b.maxZ) / 2;
        const py = b.minY;

        try {
          let resolved = item.type;
          if (resolved === 'kitchen_counter') resolved = 'kitchen_counter_base';
          else if (resolved === 'l_sofa') resolved = 'sofa_sectional_l';
          else if (resolved === 'dining_table') resolved = 'dining_table_6s';
          else if (resolved === 'wardrobe') resolved = 'wardrobe_3door';
          const model = buildRealisticModel(resolved, { width: w, depth: d, height: h }, archStyle);
          model.position.set(px, py, pz);
          group.add(model);
        } catch {
          const fMat = new THREE.MeshStandardMaterial({ color: item.color || '#9a6b3d', roughness: 0.5 });
          group.add(makeBox(item.bounds, fMat, true, true));
        }
      });
    }

  }, [scene5d, activeFloorFilter, showFurniture, design]);

  // ---------------------------------------------------------------------------
  // 8. CAMERA CONTROLLER: ROOM WALK-IN & EXTERIOR VIEWPOINTS
  // ---------------------------------------------------------------------------
  // Room Walk-In Directional Inspection
  useEffect(() => {
    if (activeVisualMode !== VISUAL_MODES.ROOM_WALK_IN || !activeRoom || !activeRoom.bounds || !controlsRef.current || !perspCameraRef.current) return;
    const b = activeRoom.bounds;
    const standing = roomStandingPosRef.current;
    const rw = b.width;
    const rl = b.length;
    const rx = b.x;
    const rz = b.y;
    const target = roomLookTargetRef.current;

    perspCameraRef.current.position.copy(standing);

    switch (roomInspectionAngle) {
      case 'front': // Look Forward at counter / feature wall (North)
        target.set(standing.x, standing.y, rz + 0.1);
        break;
      case 'left': // Look Left (West)
        target.set(rx + 0.1, standing.y, standing.z);
        break;
      case 'right': // Look Right (East)
        target.set(rx + rw - 0.1, standing.y, standing.z);
        break;
      case 'behind': // Look Behind at entrance door (South)
        target.set(standing.x, standing.y, rz + rl - 0.1);
        break;
      case 'ceiling': // Look straight Up at ceiling slab & lights
        target.set(standing.x, standing.y + 6.0, standing.z + 0.05);
        break;
      case 'floor': // Look straight Down at floor tiles & base
        target.set(standing.x, standing.y - 6.0, standing.z + 0.05);
        break;
      case 'corner_nw':
        target.set(rx + 0.2, standing.y, rz + 0.2);
        break;
      case 'corner_ne':
        target.set(rx + rw - 0.2, standing.y, rz + 0.2);
        break;
      case 'corner_se':
        target.set(rx + rw - 0.2, standing.y, rz + rl - 0.2);
        break;
      case 'corner_sw':
        target.set(rx + 0.2, standing.y, rz + rl - 0.2);
        break;
      case 'tour_360':
        // Managed in animate loop
        break;
      default:
        target.set(standing.x, standing.y, rz + 0.1);
        break;
    }

    controlsRef.current.target.copy(target);
    controlsRef.current.update();

  }, [activeVisualMode, activeRoom, roomInspectionAngle]);

  // Exterior Viewpoints Positioning
  useEffect(() => {
    if (activeVisualMode !== VISUAL_MODES.EXTERIOR_REALITY || !design || !controlsRef.current || !perspCameraRef.current) return;
    const site = design.site || {};
    const plotW = site.plotWidth || 40;
    const plotL = site.plotLength || 60;
    const cx = plotW / 2;
    const cz = plotL / 2;
    const cy = 8.0;
    const dist = Math.max(plotW, plotL) * 1.35;

    const cam = perspCameraRef.current;
    const controls = controlsRef.current;

    controls.target.set(cx, cy, cz);

    switch (exteriorViewpoint) {
      case 'front': // Front elevation
        cam.position.set(cx, 6.0, cz - dist * 1.05);
        break;
      case 'front_left': // Hero 3/4 angle
        cam.position.set(cx - dist * 0.75, 9.0, cz - dist * 0.75);
        break;
      case 'front_right': // Porch & lawn perspective
        cam.position.set(cx + dist * 0.75, 9.0, cz - dist * 0.75);
        break;
      case 'left': // Left side
        cam.position.set(cx - dist * 1.05, 8.0, cz);
        break;
      case 'right': // Right side
        cam.position.set(cx + dist * 1.05, 8.0, cz);
        break;
      case 'rear': // Rear backyard
        cam.position.set(cx, 8.0, cz + dist * 1.05);
        break;
      case 'entrance': // Close-up entrance porch
        cam.position.set(cx, 5.0, cz - 16);
        controls.target.set(cx, 5.0, cz - 4);
        break;
      case 'garden': // Garden ground perspective
        cam.position.set(cx - 14, 4.0, cz - 20);
        controls.target.set(cx, 6.0, cz - 5);
        break;
      case 'terrace': // Rooftop terrace deck perspective
        cam.position.set(cx, 22.0, cz - 8);
        controls.target.set(cx, 22.0, cz + 10);
        break;
      case 'aerial': // Aerial drone orbit
        cam.position.set(cx + dist * 0.85, dist * 1.25, cz - dist * 0.85);
        break;
      default:
        cam.position.set(cx - dist * 0.75, 9.0, cz - dist * 0.75);
        break;
    }

    controls.update();

  }, [activeVisualMode, exteriorViewpoint, design]);

  // ---------------------------------------------------------------------------
  // 9. HIGH-RESOLUTION SNAPSHOT EXPORT (PNG)
  // ---------------------------------------------------------------------------
  const handleDownloadSnapshot = () => {
    if (!rendererRef.current || !sceneRef.current || !activeCameraRef.current) return;
    setIsSnapshotting(true);
    try {
      rendererRef.current.render(sceneRef.current, activeCameraRef.current);
      const dataUrl = rendererRef.current.domElement.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      const modeName = activeVisualMode === VISUAL_MODES.ROOM_WALK_IN
        ? (activeRoom ? simplifyRoomName(activeRoom.name, activeRoom.type) : 'Room')
        : (activeVisualMode === VISUAL_MODES.EXTERIOR_REALITY ? 'Exterior' : 'Cutaway');
      link.download = `LabourConnect_5D_${modeName}_${lightingAtmosphere}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.warn('[Visuals5dStudio] Snapshot error:', err);
    } finally {
      setIsSnapshotting(false);
    }
  };

  // ---------------------------------------------------------------------------
  // 10. RENDER EMPTY STATE IF DESIGN IS ABSENT
  // ---------------------------------------------------------------------------
  if (!design || !scene5d) {
    return (
      <div
        data-testid="visuals-5d-empty"
        style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E1E7DF',
          padding: '60px 24px',
          minHeight: '520px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          gap: '18px'
        }}
      >
        <div
          style={{
            width: '84px',
            height: '84px',
            borderRadius: '22px',
            background: '#F1F5E9',
            border: '1px solid #E1E7DF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2.4rem'
          }}
        >
          🏛️
        </div>
        <div style={{ maxWidth: '420px' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#26332A', marginBottom: '8px' }}>
            Generate an architectural design first
          </h3>
          <p style={{ fontSize: '0.86rem', color: '#68736A', lineHeight: '1.5' }}>
            The 5D Reality Engine transforms your exact generated floor plan, room dimensions, doors, windows, and furnishings into an immersive first-person walk-in reality.
          </p>
        </div>
        <button
          onClick={() => onBackToDesign && onBackToDesign()}
          style={{
            background: '#718B73',
            color: '#FFFFFF',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '10px',
            fontSize: '0.85rem',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(113, 139, 115, 0.3)'
          }}
        >
          ← Back to Design Studio
        </button>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // 11. MAIN 5D REALITY INTERACTION STUDIO
  // ---------------------------------------------------------------------------
  return (
    <div
      data-testid="visuals-5d-studio"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        width: '100%',
        color: '#26332A'
      }}
    >
      {/* =====================================================================
          HEADER BAR: THREE REALITY MODES & LIGHTING ATMOSPHERES
      ===================================================================== */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          background: '#FAFAF7',
          padding: '12px 16px',
          borderRadius: '14px',
          border: '1px solid #E1E7DF'
        }}
      >
        {/* Left: 3 Primary Reality Modes */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveVisualMode(VISUAL_MODES.ROOM_WALK_IN)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              border: activeVisualMode === VISUAL_MODES.ROOM_WALK_IN ? '2px solid #718B73' : '1px solid #E1E7DF',
              background: activeVisualMode === VISUAL_MODES.ROOM_WALK_IN ? '#718B73' : '#FFFFFF',
              color: activeVisualMode === VISUAL_MODES.ROOM_WALK_IN ? '#FFFFFF' : '#26332A',
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: activeVisualMode === VISUAL_MODES.ROOM_WALK_IN ? '0 2px 8px rgba(113, 139, 115, 0.25)' : 'none'
            }}
          >
            <Home size={15} />
            <span>Room Walk-in Reality</span>
          </button>

          <button
            onClick={() => setActiveVisualMode(VISUAL_MODES.EXTERIOR_REALITY)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              border: activeVisualMode === VISUAL_MODES.EXTERIOR_REALITY ? '2px solid #718B73' : '1px solid #E1E7DF',
              background: activeVisualMode === VISUAL_MODES.EXTERIOR_REALITY ? '#718B73' : '#FFFFFF',
              color: activeVisualMode === VISUAL_MODES.EXTERIOR_REALITY ? '#FFFFFF' : '#26332A',
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: activeVisualMode === VISUAL_MODES.EXTERIOR_REALITY ? '0 2px 8px rgba(113, 139, 115, 0.25)' : 'none'
            }}
          >
            <Building size={15} />
            <span>Exterior Reality</span>
          </button>

          <button
            onClick={() => setActiveVisualMode(VISUAL_MODES.CUTAWAY_5D)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              border: activeVisualMode === VISUAL_MODES.CUTAWAY_5D ? '2px solid #718B73' : '1px solid #E1E7DF',
              background: activeVisualMode === VISUAL_MODES.CUTAWAY_5D ? '#718B73' : '#FFFFFF',
              color: activeVisualMode === VISUAL_MODES.CUTAWAY_5D ? '#FFFFFF' : '#26332A',
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: activeVisualMode === VISUAL_MODES.CUTAWAY_5D ? '0 2px 8px rgba(113, 139, 115, 0.25)' : 'none'
            }}
          >
            <Layers size={15} />
            <span>5D Isometric Cutaway</span>
          </button>
        </div>

        {/* Right: Lighting Atmospheres */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#68736A', textTransform: 'uppercase', marginRight: '4px' }}>
            Atmosphere:
          </span>
          {[
            { id: 'day', label: 'Daylight', icon: <Sun size={13} color="#f59e0b" /> },
            { id: 'golden_hour', label: 'Golden Hour', icon: <Sunset size={13} color="#f97316" /> },
            { id: 'night', label: 'Night Scene', icon: <Moon size={13} color="#60a5fa" /> }
          ].map((lp) => (
            <button
              key={lp.id}
              onClick={() => setLightingAtmosphere(lp.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 12px',
                borderRadius: '7px',
                border: lightingAtmosphere === lp.id ? '1px solid #718B73' : '1px solid #E1E7DF',
                background: lightingAtmosphere === lp.id ? '#EBF1EB' : '#FFFFFF',
                color: '#26332A',
                fontSize: '0.76rem',
                fontWeight: lightingAtmosphere === lp.id ? 800 : 600,
                cursor: 'pointer'
              }}
            >
              {lp.icon}
              <span>{lp.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* =====================================================================
          DYNAMIC NAVIGATION BAR: GROUPED STRICTLY BY FLOOR FROM SOURCE DESIGN
      ===================================================================== */}
      {activeVisualMode === VISUAL_MODES.ROOM_WALK_IN && (
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E1E7DF',
            padding: '12px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#718B73', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Select Room to Physically Enter:
            </span>
            <span style={{ fontSize: '0.72rem', color: '#68736A' }}>
              Single Source of Truth ({allDesignRooms.length} rooms mapped from 3D layout)
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {floorGroups.map((fl) => (
              <div key={fl.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#26332A', minWidth: '95px' }}>
                  {fl.name}:
                </span>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', flex: 1 }}>
                  {fl.rooms.map((rm) => {
                    const isSelected = activeRoom?.id === rm.id;
                    const dimLabel = rm.bounds ? `${rm.bounds.width.toFixed(1)}' × ${rm.bounds.length.toFixed(1)}'` : '';
                    const sqftLabel = rm.bounds ? `${Math.round(rm.bounds.width * rm.bounds.length)} sq.ft` : '';

                    return (
                      <button
                        key={rm.id}
                        onClick={() => {
                          setSelectedRoomId(rm.id);
                          setRoomInspectionAngle('front');
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          border: isSelected ? '2px solid #718B73' : '1px solid #E1E7DF',
                          background: isSelected ? '#EBF1EB' : '#FAFAF7',
                          color: isSelected ? '#718B73' : '#26332A',
                          fontSize: '0.75rem',
                          fontWeight: isSelected ? 800 : 600,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <span>{simplifyRoomName(rm.name, rm.type)}</span>
                        {sqftLabel && (
                          <span style={{ fontSize: '0.66rem', color: isSelected ? '#718B73' : '#94a3b8', fontWeight: 500 }}>
                            ({dimLabel})
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* EXTERIOR REALITY VIEWPOINTS BAR */}
      {activeVisualMode === VISUAL_MODES.EXTERIOR_REALITY && (
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E1E7DF',
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            overflowX: 'auto',
            scrollbarWidth: 'none'
          }}
        >
          <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#718B73', textTransform: 'uppercase', flexShrink: 0 }}>
            Camera Viewpoint:
          </span>
          {EXTERIOR_VIEWPOINTS.map((vp) => (
            <button
              key={vp.id}
              onClick={() => setExteriorViewpoint(vp.id)}
              style={{
                padding: '6px 12px',
                borderRadius: '7px',
                border: exteriorViewpoint === vp.id ? '2px solid #718B73' : '1px solid #E1E7DF',
                background: exteriorViewpoint === vp.id ? '#EBF1EB' : '#FAFAF7',
                color: exteriorViewpoint === vp.id ? '#718B73' : '#26332A',
                fontSize: '0.75rem',
                fontWeight: exteriorViewpoint === vp.id ? 800 : 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
              title={vp.desc}
            >
              {vp.label}
            </button>
          ))}
        </div>
      )}

      {/* =====================================================================
          MAIN 5D REALITY THREE.JS VIEWPORT CANVAS
      ===================================================================== */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '620px',
          background: lightingAtmosphere === 'night' ? '#0b1329' : (lightingAtmosphere === 'golden_hour' ? '#fef3c7' : '#f8fafc'),
          borderRadius: '16px',
          border: '1px solid #E1E7DF',
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.04)'
        }}
      >
        {/* Three.js Canvas Container */}
        <div ref={mountRef} style={{ width: '100%', height: '100%' }} />

        {/* Viewport Floating Info Pill (Top Left) */}
        <div
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            background: 'rgba(255, 255, 255, 0.94)',
            backdropFilter: 'blur(8px)',
            border: '1px solid #E1E7DF',
            borderRadius: '10px',
            padding: '8px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            fontSize: '0.72rem',
            color: '#26332A',
            zIndex: 10,
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}
        >
          {activeVisualMode === VISUAL_MODES.ROOM_WALK_IN && activeRoom && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.85rem' }}>🚪</span>
                <strong style={{ fontSize: '0.82rem', color: '#26332A' }}>
                  {activeRoom.name || 'Room'}
                </strong>
                <span style={{ color: '#718B73', fontWeight: 800 }}>•</span>
                <span style={{ color: '#68736A' }}>{activeRoom.floorName}</span>
              </div>
              <div style={{ color: '#68736A', fontSize: '0.68rem' }}>
                Dimensions: {activeRoom.bounds?.width.toFixed(1)}′ × {activeRoom.bounds?.length.toFixed(1)}′ ({Math.round((activeRoom.bounds?.width || 0) * (activeRoom.bounds?.length || 0))} sq.ft) • Eye Height: 5.3 ft
              </div>
            </>
          )}

          {activeVisualMode === VISUAL_MODES.EXTERIOR_REALITY && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.85rem' }}>🏛️</span>
                <strong style={{ fontSize: '0.82rem', color: '#26332A' }}>
                  {design.title || 'Architectural Residence'}
                </strong>
              </div>
              <div style={{ color: '#68736A', fontSize: '0.68rem' }}>
                {EXTERIOR_VIEWPOINTS.find(v => v.id === exteriorViewpoint)?.label || 'Exterior View'} • {design.site?.plotWidth}′ × {design.site?.plotLength}′ Plot • {lightingAtmosphere.toUpperCase()}
              </div>
            </>
          )}

          {activeVisualMode === VISUAL_MODES.CUTAWAY_5D && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.85rem' }}>📐</span>
                <strong style={{ fontSize: '0.82rem', color: '#26332A' }}>
                  5D Technical Axonometric Cutaway
                </strong>
              </div>
              <div style={{ color: '#68736A', fontSize: '0.68rem' }}>
                {wallMode === 'low' ? '3.5 ft Capped Walls' : '10.0 ft Full Walls'} • Parallel Orthographic Projection
              </div>
            </>
          )}
        </div>

        {/* Floating Quick Action Buttons (Top Right) */}
        <div
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            zIndex: 10
          }}
        >
          {activeVisualMode === VISUAL_MODES.EXTERIOR_REALITY && (
            <button
              onClick={() => setIsAutoOrbiting(prev => !prev)}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: isAutoOrbiting ? '#718B73' : 'rgba(255, 255, 255, 0.95)',
                color: isAutoOrbiting ? '#FFFFFF' : '#26332A',
                border: '1px solid #E1E7DF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
              }}
              title={isAutoOrbiting ? 'Pause 360° Orbit' : 'Start 360° Orbit'}
            >
              {isAutoOrbiting ? <Pause size={15} /> : <Play size={15} />}
            </button>
          )}

          {/* Reset Camera View */}
          <button
            onClick={() => {
              if (activeVisualMode === VISUAL_MODES.ROOM_WALK_IN) {
                setRoomInspectionAngle('front');
              } else if (activeVisualMode === VISUAL_MODES.EXTERIOR_REALITY) {
                setExteriorViewpoint('front_left');
              } else {
                if (orthoCameraRef.current && controlsRef.current) {
                  orthoCameraRef.current.position.set(65, 60, 65);
                  orthoCameraRef.current.zoom = 1.0;
                  orthoCameraRef.current.updateProjectionMatrix();
                  controlsRef.current.target.set(20, 8, 30);
                  controlsRef.current.update();
                }
              }
            }}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.95)',
              color: '#26332A',
              border: '1px solid #E1E7DF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
            }}
            title="Reset to default angle"
          >
            <RotateCcw size={15} />
          </button>
        </div>

        {/* ===================================================================
            ROOM WALK-IN REALITY: FLOATING 360° INSPECTION COMPASS BAR (BOTTOM)
        =================================================================== */}
        {activeVisualMode === VISUAL_MODES.ROOM_WALK_IN && (
          <div
            style={{
              position: 'absolute',
              bottom: '16px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(255, 255, 255, 0.96)',
              backdropFilter: 'blur(10px)',
              border: '1px solid #E1E7DF',
              borderRadius: '12px',
              padding: '6px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              maxWidth: '92%',
              overflowX: 'auto',
              scrollbarWidth: 'none',
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
              zIndex: 20
            }}
          >
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#718B73', textTransform: 'uppercase', marginRight: '4px', flexShrink: 0 }}>
              Inspect Direction:
            </span>
            {ROOM_INSPECTION_ANGLES.map((ang) => (
              <button
                key={ang.id}
                onClick={() => setRoomInspectionAngle(ang.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  border: roomInspectionAngle === ang.id ? '2px solid #718B73' : '1px solid #E1E7DF',
                  background: roomInspectionAngle === ang.id ? '#EBF1EB' : '#FFFFFF',
                  color: roomInspectionAngle === ang.id ? '#718B73' : '#26332A',
                  fontSize: '0.74rem',
                  fontWeight: roomInspectionAngle === ang.id ? 800 : 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0
                }}
                title={ang.desc}
              >
                <span>{ang.icon}</span>
                <span>{ang.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* =====================================================================
          BOTTOM ACTION BAR: SNAPSHOT & SAVE TO PROJECT
      ===================================================================== */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          background: '#FAFAF7',
          padding: '12px 18px',
          borderRadius: '14px',
          border: '1px solid #E1E7DF'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.78rem', color: '#68736A' }}>
            Interactive Reality: <strong>Click & drag inside viewport for smooth 360° pan/tilt</strong>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* HD Snapshot */}
          <button
            id="btn-5d-snapshot"
            data-testid="btn-5d-snapshot"
            onClick={handleDownloadSnapshot}
            disabled={isSnapshotting}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid #718B73',
              background: '#FFFFFF',
              color: '#718B73',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <Download size={14} />
            <span>{isSnapshotting ? 'Capturing HD...' : 'HD Reality Snapshot (PNG)'}</span>
          </button>

          {/* Save to Project */}
          <button
            id="btn-5d-save-project"
            data-testid="btn-5d-save-project"
            onClick={() => onSaveToProject && onSaveToProject(design)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 18px',
              borderRadius: '8px',
              border: 'none',
              background: '#718B73',
              color: '#FFFFFF',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(113, 139, 115, 0.25)',
              transition: 'all 0.15s ease'
            }}
          >
            <FolderPlus size={14} />
            <span>Save to Project</span>
          </button>
        </div>
      </div>
    </div>
  );
}
