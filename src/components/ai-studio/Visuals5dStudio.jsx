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
  Home
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
  getAreaRugTexture
} from './architecturalMaterialSystem.js';
import { simplifyRoomName } from './architecturalRoomUtils.js';

/**
 * Visuals5dStudio
 * 
 * Premium Architectural 5D Isometric Cutaway Studio.
 * Features:
 * - Pure Orthographic projection with zero perspective distortion (parallel lines stay parallel).
 * - Cutaway low walls (~3.5 ft exterior / ~3.0 ft interior) with dark slate capping strips.
 * - Exact door openings with 90° swinging physical leaves and window frames with glass.
 * - Photorealistic materials: honey wood planking, porcelain tiles, stone decking, woven rugs.
 * - Procedural real-world scale furniture in every room with doorway clearances.
 * - Daylight, Warm Evening, and Dusk architectural illumination with soft PCF shadow mapping.
 * - Dynamic floor selector, camera presets, room chips, and 4K PNG snapshot download.
 */
export default function Visuals5dStudio({
  design = null,
  onBackToDesign,
  onSaveToProject
}) {
  // ---------------------------------------------------------------------------
  // STATE MANAGEMENT
  // ---------------------------------------------------------------------------
  const [wallMode, setWallMode] = useState('low'); // 'low' (cutaway) | 'full'
  const [activeFloorFilter, setActiveFloorFilter] = useState('all'); // 'all' | 0 | 1 | ...
  const [lightingPreset, setLightingPreset] = useState('day'); // 'day' | 'warm_evening' | 'dusk'
  const [showFurniture, setShowFurniture] = useState(true);
  const [showRoomLabels, setShowRoomLabels] = useState(true);
  const [viewModeInterior, setViewModeInterior] = useState(true); // true = Interior Cutaway, false = Exterior View
  const [isAutoOrbiting, setIsAutoOrbiting] = useState(false);
  const [focusedRoomId, setFocusedRoomId] = useState(null);
  const [isEnhanceActive, setIsEnhanceActive] = useState(false);
  const [hudLabels, setHudLabels] = useState([]);
  const [previousVisibilityState, setPreviousVisibilityState] = useState(null);
  const [isSnapshotting, setIsSnapshotting] = useState(false);

  // Canvas & Three.js Refs
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const houseGroupRef = useRef(null);
  const furnitureGroupRef = useRef(null);
  const exteriorGroupRef = useRef(null);
  const lightsGroupRef = useRef(null);

  // Animation Transition Refs
  const camTargetPosRef = useRef(new THREE.Vector3());
  const camLookAtRef = useRef(new THREE.Vector3());
  const camTargetZoomRef = useRef(1.0);
  const boundsCenterRef = useRef(new THREE.Vector3(20, 8, 30));
  const boundsSpanRef = useRef(45);

  // ---------------------------------------------------------------------------
  // 1. SCENE DATA EXTRACTION (SINGLE SOURCE OF TRUTH)
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
        lightingPreset
      });
    } catch (err) {
      console.warn('[Visuals5dStudio] Failed to build 5D scene:', err);
      return null;
    }
  }, [design, wallMode, activeFloorFilter, showFurniture, lightingPreset]);

  // Dynamic State Refs for 60fps Animation Loop
  const isAutoOrbitingRef = useRef(isAutoOrbiting);
  isAutoOrbitingRef.current = isAutoOrbiting;
  const showRoomLabelsRef = useRef(showRoomLabels);
  showRoomLabelsRef.current = showRoomLabels;
  const activeFloorFilterRef = useRef(activeFloorFilter);
  activeFloorFilterRef.current = activeFloorFilter;
  const scene5dRef = useRef(scene5d);
  scene5dRef.current = scene5d;

  // Floors list for dynamic selector
  const availableFloors = useMemo(() => {
    if (!scene5d) return [];
    return scene5d.floors || [];
  }, [scene5d]);

  // Rooms list for active floor chips
  const activeFloorRooms = useMemo(() => {
    if (!scene5d || !availableFloors.length) return [];
    if (activeFloorFilter === 'all') {
      return availableFloors.flatMap(f => f.rooms || []);
    }
    const fl = availableFloors.find(f => f.floorIndex === Number(activeFloorFilter));
    return fl ? (fl.rooms || []) : [];
  }, [scene5d, availableFloors, activeFloorFilter]);

  // ---------------------------------------------------------------------------
  // 2. THREE.JS INITIALIZATION WITH ORTHOGRAPHIC CAMERA
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;
    const aspect = width / height;

    // A. SCENE
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(LIGHTING_PRESETS_5D[lightingPreset]?.background || '#ffffff');
    sceneRef.current = scene;

    // B. ORTHOGRAPHIC CAMERA (Parallel Lines Stay Parallel)
    const frustumSize = 85;
    const camera = new THREE.OrthographicCamera(
      (-frustumSize * aspect) / 2,
      (frustumSize * aspect) / 2,
      frustumSize / 2,
      -frustumSize / 2,
      0.1,
      1000
    );
    // Initial 45° isometric viewpoint centered on building (cx=20, cy=8, cz=30)
    const initDist = 85;
    camera.position.set(20 + initDist * 0.95, 8 + initDist * 1.05, 30 + initDist * 0.95);
    camera.zoom = 1.0;
    camera.updateProjectionMatrix();
    cameraRef.current = camera;

    // C. RENDERER WITH ACES TONE MAPPING & PCF SOFT SHADOWS
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true // Required for HD PNG snapshot
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

    // D. ORBIT CONTROLS
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.screenSpacePanning = true;
    controls.maxPolarAngle = Math.PI / 2 + 0.05; // Prevent viewing strictly from below ground
    controls.target.set(20, 8, 30);
    controls.update();
    controlsRef.current = controls;

    // E. GROUPS
    const houseGroup = new THREE.Group();
    const furnitureGroup = new THREE.Group();
    const exteriorGroup = new THREE.Group();
    const lightsGroup = new THREE.Group();

    scene.add(houseGroup);
    scene.add(furnitureGroup);
    scene.add(exteriorGroup);
    scene.add(lightsGroup);

    houseGroupRef.current = houseGroup;
    furnitureGroupRef.current = furnitureGroup;
    exteriorGroupRef.current = exteriorGroup;
    lightsGroupRef.current = lightsGroup;

    // F. ANIMATION & CONTROLS LOOP
    let animId = null;
    const tempVec = new THREE.Vector3();

    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (controlsRef.current) {
        controlsRef.current.autoRotate = Boolean(isAutoOrbitingRef.current);
        controlsRef.current.autoRotateSpeed = 1.8;
        controlsRef.current.update();
      }

      // Update Screen Coordinates for Floating Room Labels
      const currentScene5d = scene5dRef.current;
      const currentFloorFilter = activeFloorFilterRef.current;
      if (showRoomLabelsRef.current && currentScene5d && mountRef.current && cameraRef.current) {
        const cWidth = mountRef.current.clientWidth || 800;
        const cHeight = mountRef.current.clientHeight || 600;
        const labels = [];

        const targetFl = currentFloorFilter === 'all' ? 0 : Number(currentFloorFilter);
        const fl = currentScene5d.floors.find(f => f.floorIndex === targetFl) || currentScene5d.floors[0];
        if (fl && Array.isArray(fl.rooms)) {
          fl.rooms.forEach(rm => {
            if (!rm.bounds) return;
            const rx = rm.bounds.x + rm.bounds.width / 2;
            const rz = rm.bounds.y + rm.bounds.length / 2;
            const ry = (targetFl * DEFAULTS_5D.FLOOR_TO_FLOOR_HEIGHT + DEFAULTS_5D.PLINTH_HEIGHT) + 3.8;

            tempVec.set(rx, ry, rz);
            tempVec.project(cameraRef.current);

            if (tempVec.z < 1.0 && tempVec.x >= -1.05 && tempVec.x <= 1.05 && tempVec.y >= -1.05 && tempVec.y <= 1.05) {
              const screenX = (tempVec.x * 0.5 + 0.5) * cWidth;
              const screenY = (-tempVec.y * 0.5 + 0.5) * cHeight;
              labels.push({
                id: rm.id,
                name: simplifyRoomName(rm.name, rm.type),
                screenX: Math.round(screenX),
                screenY: Math.round(screenY)
              });
            }
          });
        }
        setHudLabels(labels);
      } else {
        setHudLabels([]);
      }

      renderer.render(scene, cameraRef.current);
    };
    animate();

    // G. RESIZE OBSERVER
    const handleResize = () => {
      if (!container || !renderer || !cameraRef.current) return;
      const newW = container.clientWidth || 800;
      const newH = container.clientHeight || 600;
      const newAspect = newW / newH;

      cameraRef.current.left = (-frustumSize * newAspect) / 2;
      cameraRef.current.right = (frustumSize * newAspect) / 2;
      cameraRef.current.top = frustumSize / 2;
      cameraRef.current.bottom = -frustumSize / 2;
      cameraRef.current.updateProjectionMatrix();

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
  // 3. DYNAMIC LIGHTING PRESET APPLICATION
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!lightsGroupRef.current || !sceneRef.current) return;
    const group = lightsGroupRef.current;
    while (group.children.length > 0) group.remove(group.children[0]);

    const preset = LIGHTING_PRESETS_5D[lightingPreset] || LIGHTING_PRESETS_5D.day;
    sceneRef.current.background = new THREE.Color(preset.background);
    if (rendererRef.current) {
      rendererRef.current.toneMappingExposure = preset.exposure;
    }

    // 1. Hemisphere Light (Soft Sky + Ground Bounce)
    const hemiLight = new THREE.HemisphereLight(
      preset.ambientColor,
      preset.groundColor,
      preset.ambientIntensity
    );
    group.add(hemiLight);

    // 2. Directional Sun Key Light (Produces Soft Contact Shadows)
    const sunLight = new THREE.DirectionalLight(preset.sunColor, preset.sunIntensity);
    sunLight.position.set(preset.sunDirection[0], preset.sunDirection[1], preset.sunDirection[2]);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 250;
    sunLight.shadow.camera.left = -50;
    sunLight.shadow.camera.right = 50;
    sunLight.shadow.camera.top = 50;
    sunLight.shadow.camera.bottom = -50;
    sunLight.shadow.bias = -0.0004;
    group.add(sunLight);

    // 3. Soft Ambient Fill Light (Fills dark interior corners)
    const fillLight = new THREE.DirectionalLight('#e0f2fe', 0.45);
    fillLight.position.set(-35, 45, -25);
    fillLight.castShadow = false;
    group.add(fillLight);

    // 4. Warm Point Lights for Rooms in Evening / Dusk
    if (lightingPreset !== 'day' && scene5d) {
      const center = boundsCenterRef.current;
      const warmLight = new THREE.PointLight('#fef08a', preset.interiorWarmth, 60);
      warmLight.position.set(center.x, 8.0, center.z);
      group.add(warmLight);
    }
  }, [lightingPreset, scene5d]);

  // ---------------------------------------------------------------------------
  // 4. GEOMETRIC MESH POPULATION (SLABS, WALLS, CAPS, OPENINGS, FURNITURE)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!scene5d || !houseGroupRef.current || !furnitureGroupRef.current || !exteriorGroupRef.current) return;

    const houseGroup = houseGroupRef.current;
    const furnitureGroup = furnitureGroupRef.current;
    const extGroup = exteriorGroupRef.current;

    // Clear previous geometries
    const clearGroup = (g) => {
      while (g.children.length > 0) {
        const c = g.children[0];
        if (c.geometry) c.geometry.dispose();
        if (c.material) {
          if (Array.isArray(c.material)) c.material.forEach(m => m.dispose());
          else c.material.dispose();
        }
        g.remove(c);
      }
    };
    clearGroup(houseGroup);
    clearGroup(furnitureGroup);
    clearGroup(extGroup);

    // Update Bounds Center and Radius
    const b = scene5d.bounds;
    boundsCenterRef.current.set(b.centerX, b.centerY, b.centerZ);
    boundsSpanRef.current = Math.max(b.width, b.length, b.height);

    // Helper: Create Box Mesh
    const makeBoxMesh = (boxBounds, material, castShadow = true, receiveShadow = true) => {
      const w = Math.max(0.1, boxBounds.maxX - boxBounds.minX);
      const h = Math.max(0.04, boxBounds.maxY - boxBounds.minY);
      const l = Math.max(0.1, boxBounds.maxZ - boxBounds.minZ);
      const geo = new THREE.BoxGeometry(w, h, l);
      const mesh = new THREE.Mesh(geo, material);
      mesh.position.set(
        (boxBounds.minX + boxBounds.maxX) / 2,
        (boxBounds.minY + boxBounds.maxY) / 2,
        (boxBounds.minZ + boxBounds.maxZ) / 2
      );
      mesh.castShadow = castShadow;
      mesh.receiveShadow = receiveShadow;
      return mesh;
    };

    // A. FOUNDATION PLINTH & CONTACT SHADOW
    scene5d.elements.plinths.forEach(p => {
      if (p.type === 'contact_shadow_plane') {
        const shadowGeo = new THREE.PlaneGeometry(
          p.bounds.maxX - p.bounds.minX,
          p.bounds.maxZ - p.bounds.minZ
        );
        const shadowMat = new THREE.ShadowMaterial({ opacity: p.opacity || 0.22 });
        const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
        shadowMesh.rotation.x = -Math.PI / 2;
        shadowMesh.position.set(
          (p.bounds.minX + p.bounds.maxX) / 2,
          p.bounds.minY,
          (p.bounds.minZ + p.bounds.maxZ) / 2
        );
        shadowMesh.receiveShadow = true;
        houseGroup.add(shadowMesh);
      } else {
        const plinthMat = new THREE.MeshStandardMaterial({
          color: p.color || '#ffffff',
          roughness: p.roughness || 0.9,
          metalness: 0.02
        });
        houseGroup.add(makeBoxMesh(p.bounds, plinthMat, false, true));
      }
    });

    // B. STRUCTURAL SLABS
    scene5d.elements.slabs.forEach(slab => {
      if (activeFloorFilter !== 'all' && slab.floorIndex > Number(activeFloorFilter)) return;
      const slabMat = new THREE.MeshStandardMaterial({
        color: slab.color || '#f1f5f9',
        roughness: 0.85
      });
      houseGroup.add(makeBoxMesh(slab.bounds, slabMat, true, true));
    });

    // C. ROOM FLOOR FINISHES (WOOD, PORCELAIN, DECKING, RUGS)
    scene5d.elements.roomFloors.forEach(rf => {
      if (activeFloorFilter !== 'all' && rf.floorIndex !== Number(activeFloorFilter)) return;

      const rw = rf.bounds.width;
      const rl = rf.bounds.length;
      let mat;

      if (rf.finishType === 'wood_plank') {
        const { map, roughnessMap } = getWoodFloorTexture(rw / 4, rl / 4);
        mat = new THREE.MeshStandardMaterial({
          map,
          roughnessMap,
          roughness: 0.35,
          metalness: 0.04
        });
      } else if (rf.finishType === 'porcelain_tile') {
        const { map } = getPorcelainTileTexture(rw / 3, rl / 3, 'marble_calacatta');
        mat = new THREE.MeshStandardMaterial({
          map,
          roughness: 0.2,
          metalness: 0.06
        });
      } else if (rf.finishType === 'grey_stone_decking') {
        const { map, roughnessMap } = getTeakDeckingTexture(rw / 3, rl / 3);
        mat = new THREE.MeshStandardMaterial({
          map,
          roughnessMap,
          roughness: 0.45,
          metalness: 0.05
        });
      } else if (rf.finishType === 'area_rug') {
        mat = new THREE.MeshStandardMaterial({
          map: getAreaRugTexture(),
          roughness: 0.85,
          metalness: 0.0
        });
      } else {
        mat = new THREE.MeshStandardMaterial({
          color: rf.color || '#ffffff',
          roughness: 0.6
        });
      }

      const planeGeo = new THREE.PlaneGeometry(rw, rl);
      const floorPlane = new THREE.Mesh(planeGeo, mat);
      floorPlane.rotation.x = -Math.PI / 2;
      floorPlane.position.set(
        (rf.bounds.minX + rf.bounds.maxX) / 2,
        rf.bounds.minY,
        (rf.bounds.minZ + rf.bounds.maxZ) / 2
      );
      floorPlane.receiveShadow = true;
      houseGroup.add(floorPlane);
    });

    // D. WALLS (CUTAWAY OR FULL)
    const plasterMat = new THREE.MeshStandardMaterial({
      color: '#f8fafc',
      roughness: 0.88,
      metalness: 0.02
    });

    scene5d.elements.walls.forEach(w => {
      if (activeFloorFilter !== 'all' && w.floorIndex > Number(activeFloorFilter)) return;
      houseGroup.add(makeBoxMesh(w.bounds, plasterMat, true, true));
    });

    // E. DARK SLATE / BLACK WALL CAPPING STRIPS
    scene5d.elements.wallCaps.forEach(cap => {
      if (activeFloorFilter !== 'all' && cap.floorIndex > Number(activeFloorFilter)) return;
      const capMat = new THREE.MeshStandardMaterial({
        color: cap.color || '#0f172a',
        roughness: 0.35,
        metalness: 0.15
      });
      houseGroup.add(makeBoxMesh(cap.bounds, capMat, true, true));
    });

    // F. DOORS (90° OPEN PHYSICAL LEAF & SWING ARC)
    scene5d.elements.doors.forEach(d => {
      if (activeFloorFilter !== 'all' && d.floorIndex > Number(activeFloorFilter)) return;

      // 1. Black Door Frame Jambs
      const frameMat = new THREE.MeshStandardMaterial({ color: d.frameColor || '#1e293b', roughness: 0.5 });
      const jambGeo = new THREE.BoxGeometry(0.18, d.height, 0.18);
      const leftJamb = new THREE.Mesh(jambGeo, frameMat);
      leftJamb.position.set(d.x - d.width / 2, d.y + d.height / 2, d.z);
      houseGroup.add(leftJamb);

      // 2. Door Leaf swung 90° open into room
      const leafMat = new THREE.MeshStandardMaterial({ color: d.leafColor || '#78350f', roughness: 0.45 });
      const leafGeo = new THREE.BoxGeometry(d.width, d.height, 0.12);
      const leafMesh = new THREE.Mesh(leafGeo, leafMat);
      // Anchor leaf at pivot
      leafMesh.position.set(d.x - d.width / 2, d.y + d.height / 2, d.z + d.width / 2);
      leafMesh.rotation.y = Math.PI / 2; // 90° open
      leafMesh.castShadow = true;
      houseGroup.add(leafMesh);

      // 3. Quarter-circle door swing arc on floor
      if (d.showSwingArc) {
        const curve = new THREE.EllipseCurve(
          d.x - d.width / 2, d.z,
          d.width, d.width,
          0, Math.PI / 2,
          false,
          0
        );
        const points = curve.getPoints(16);
        const arcGeo = new THREE.BufferGeometry().setFromPoints(
          points.map(p => new THREE.Vector3(p.x, d.y + 0.03, p.y))
        );
        const arcMat = new THREE.LineDashedMaterial({
          color: '#94a3b8',
          dashSize: 0.4,
          gapSize: 0.2
        });
        const arcLine = new THREE.Line(arcGeo, arcMat);
        arcLine.computeLineDistances();
        houseGroup.add(arcLine);
      }
    });

    // G. WINDOWS (BLACK FRAMES WITH GLASS PANES)
    scene5d.elements.windows.forEach(w => {
      if (activeFloorFilter !== 'all' && w.floorIndex > Number(activeFloorFilter)) return;

      // Frame
      const frameMat = new THREE.MeshStandardMaterial({ color: w.frameColor || '#0f172a', roughness: 0.4 });
      const frameBounds = {
        minX: w.x - w.width / 2,
        minY: w.y,
        minZ: w.z - 0.12,
        maxX: w.x + w.width / 2,
        maxY: w.y + w.height,
        maxZ: w.z + 0.12
      };
      houseGroup.add(makeBoxMesh(frameBounds, frameMat, true, true));

      // Transparent Glass Pane
      const glassMat = new THREE.MeshPhysicalMaterial({
        color: w.glassColor || '#93c5fd',
        transparent: true,
        opacity: w.glassOpacity || 0.35,
        roughness: 0.05,
        metalness: 0.1,
        transmission: 0.85,
        ior: 1.5
      });
      const glassGeo = new THREE.PlaneGeometry(w.width - 0.3, w.height - 0.3);
      const glassMesh = new THREE.Mesh(glassGeo, glassMat);
      glassMesh.position.set(w.x, w.y + w.height / 2, w.z);
      houseGroup.add(glassMesh);
    });

    // H. FURNITURE (PROCEDURAL GLB EQUIVALENT RIGID PRIMITIVES)
    if (showFurniture) {
      scene5d.elements.furniture.forEach(item => {
        if (activeFloorFilter !== 'all' && item.floorIndex !== undefined && item.floorIndex > Number(activeFloorFilter)) return;
        const fMat = new THREE.MeshStandardMaterial({
          color: item.color || '#e2e8f0',
          roughness: 0.6,
          metalness: 0.05
        });
        furnitureGroup.add(makeBoxMesh(item.bounds, fMat, true, true));
      });
    }

    // I. EXTERIOR & LANDSCAPING
    if (viewModeInterior) {
      // In interior cutaway mode, keep landscaping, steps, portico, and low compound wall
      scene5d.elements.exterior.forEach(ext => {
        if (ext.type === 'tree') {
          // Clean procedural architectural tree (cylinder trunk + sphere foliage)
          const trunkMat = new THREE.MeshStandardMaterial({ color: '#78350f', roughness: 0.9 });
          const trunkGeo = new THREE.CylinderGeometry(0.35, 0.5, ext.height * 0.45, 8);
          const trunk = new THREE.Mesh(trunkGeo, trunkMat);
          trunk.position.set(ext.centerX, ext.baseY + ext.height * 0.22, ext.centerZ);
          trunk.castShadow = true;
          extGroup.add(trunk);

          const leafMat = new THREE.MeshStandardMaterial({ color: ext.foliageColor || '#2d5a27', roughness: 0.8 });
          const leafGeo = new THREE.DodecahedronGeometry(ext.radius, 1);
          const foliage = new THREE.Mesh(leafGeo, leafMat);
          foliage.position.set(ext.centerX, ext.baseY + ext.height * 0.68, ext.centerZ);
          foliage.castShadow = true;
          extGroup.add(foliage);
        } else {
          const extMat = new THREE.MeshStandardMaterial({
            color: ext.color || '#e2e8f0',
            roughness: 0.7
          });
          extGroup.add(makeBoxMesh(ext.bounds, extMat, true, true));
        }
      });
    }

  }, [scene5d, activeFloorFilter, showFurniture, viewModeInterior]);

  // ---------------------------------------------------------------------------
  // 5. CAMERA PRESET HANDLERS
  // ---------------------------------------------------------------------------
  const applyCameraPreset = (presetKey) => {
    if (!cameraRef.current || !controlsRef.current || !scene5d) return;
    setIsAutoOrbiting(false);
    setFocusedRoomId(null);

    const c = boundsCenterRef.current;
    const span = boundsSpanRef.current || 55;
    const dist = span * 1.8;

    switch (presetKey) {
      case 'isometric':
        cameraRef.current.position.set(c.x + dist * 0.95, c.y + dist * 1.05, c.z + dist * 0.95);
        break;
      case 'steep_isometric':
        cameraRef.current.position.set(c.x + dist * 0.65, c.y + dist * 1.45, c.z + dist * 0.65);
        break;
      case 'top_down':
        cameraRef.current.position.set(c.x, c.y + dist * 1.85, c.z + 0.01);
        break;
      case 'front':
        cameraRef.current.position.set(c.x + dist * 0.35, c.y + dist * 0.85, c.z - dist * 1.15);
        break;
      case 'rear':
        cameraRef.current.position.set(c.x - dist * 0.35, c.y + dist * 0.85, c.z + dist * 1.15);
        break;
      case 'left':
        cameraRef.current.position.set(c.x - dist * 1.15, c.y + dist * 0.85, c.z + dist * 0.35);
        break;
      case 'right':
        cameraRef.current.position.set(c.x + dist * 1.15, c.y + dist * 0.85, c.z - dist * 0.35);
        break;
      default:
        cameraRef.current.position.set(c.x + dist * 0.95, c.y + dist * 1.05, c.z + dist * 0.95);
        break;
    }
    cameraRef.current.zoom = 1.0;
    cameraRef.current.updateProjectionMatrix();
    controlsRef.current.target.copy(c);
    controlsRef.current.update();
  };

  // Focus specific room chip
  const handleSelectRoom = (room) => {
    if (!room || !room.bounds || !cameraRef.current || !controlsRef.current) return;

    if (focusedRoomId === room.id) {
      // Toggle off / restore previous visibility
      setFocusedRoomId(null);
      if (previousVisibilityState) {
        setActiveFloorFilter(previousVisibilityState.floor);
      }
      applyCameraPreset('isometric');
      return;
    }

    // Save state before focusing
    setPreviousVisibilityState({ floor: activeFloorFilter });
    setFocusedRoomId(room.id);

    // Isolate floor of this room
    const targetFl = room.floorIndex !== undefined ? room.floorIndex : 0;
    setActiveFloorFilter(targetFl);

    // Calculate room center
    const rx = room.bounds.x + room.bounds.width / 2;
    const rz = room.bounds.y + room.bounds.length / 2;
    const ry = (targetFl * DEFAULTS_5D.FLOOR_TO_FLOOR_HEIGHT + DEFAULTS_5D.PLINTH_HEIGHT) + 1.5;

    const span = Math.max(room.bounds.width, room.bounds.length);
    const dist = Math.max(span * 2.2, 16);

    cameraRef.current.position.set(rx + dist * 0.85, ry + dist * 1.1, rz + dist * 0.85);
    cameraRef.current.zoom = 1.8;
    cameraRef.current.updateProjectionMatrix();
    controlsRef.current.target.set(rx, ry, rz);
    controlsRef.current.update();
  };

  const handleResetView = () => {
    setIsAutoOrbiting(false);
    setFocusedRoomId(null);
    setActiveFloorFilter('all');
    setWallMode('low');
    applyCameraPreset('isometric');
  };

  // ---------------------------------------------------------------------------
  // 6. HD SNAPSHOT EXPORT (PNG)
  // ---------------------------------------------------------------------------
  const handleDownloadSnapshot = () => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;
    setIsSnapshotting(true);

    try {
      rendererRef.current.render(sceneRef.current, cameraRef.current);
      const dataUrl = rendererRef.current.domElement.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.download = `LabourConnect_5D_Visuals_${design?.id || 'Design'}_${wallMode === 'low' ? 'Cutaway' : 'Full'}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.warn('[Visuals5dStudio] Snapshot failed:', err);
    } finally {
      setIsSnapshotting(false);
    }
  };

  // ---------------------------------------------------------------------------
  // 7. EMPTY STATE (IF NO DESIGN GENERATED YET)
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
            Generate a design first
          </h3>
          <p style={{ fontSize: '0.86rem', color: '#68736A', lineHeight: '1.5' }}>
            5D Visuals synthesize real-time isometric cutaways, material finishes, and room-aware furniture directly from your generated architectural plan.
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
            boxShadow: '0 4px 12px rgba(113, 139, 115, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          ← Back to Design Studio
        </button>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // 8. RENDER 5D SCREEN & CONTROLS
  // ---------------------------------------------------------------------------
  return (
    <div
      data-testid="visuals-5d-studio"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        width: '100%'
      }}
    >
      {/* =====================================================================
          CONTROL BAR 1: FLOORS & VIEW MODES
      ===================================================================== */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px',
          background: '#FAFAF7',
          padding: '10px 14px',
          borderRadius: '12px',
          border: '1px solid #E1E7DF'
        }}
      >
        {/* Left: Dynamic Floor Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#68736A', textTransform: 'uppercase', marginRight: '4px' }}>
            Level:
          </span>
          <button
            onClick={() => { setActiveFloorFilter('all'); setFocusedRoomId(null); }}
            style={{
              padding: '5px 12px',
              borderRadius: '6px',
              fontSize: '0.76rem',
              fontWeight: activeFloorFilter === 'all' ? 800 : 600,
              border: activeFloorFilter === 'all' ? '1px solid #718B73' : '1px solid #E1E7DF',
              background: activeFloorFilter === 'all' ? '#718B73' : '#FFFFFF',
              color: activeFloorFilter === 'all' ? '#FFFFFF' : '#26332A',
              cursor: 'pointer'
            }}
          >
            All Levels
          </button>
          {availableFloors.map((fl) => (
            <button
              key={fl.id}
              onClick={() => { setActiveFloorFilter(fl.floorIndex); setFocusedRoomId(null); }}
              style={{
                padding: '5px 12px',
                borderRadius: '6px',
                fontSize: '0.76rem',
                fontWeight: activeFloorFilter === fl.floorIndex ? 800 : 600,
                border: activeFloorFilter === fl.floorIndex ? '1px solid #718B73' : '1px solid #E1E7DF',
                background: activeFloorFilter === fl.floorIndex ? '#718B73' : '#FFFFFF',
                color: activeFloorFilter === fl.floorIndex ? '#FFFFFF' : '#26332A',
                cursor: 'pointer'
              }}
            >
              {fl.name}
            </button>
          ))}
        </div>

        {/* Right: Architectural Cutaway Toggles */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Low Walls / Full Walls Toggle */}
          <button
            onClick={() => setWallMode(prev => prev === 'low' ? 'full' : 'low')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '7px',
              border: '1px solid #E1E7DF',
              background: wallMode === 'low' ? '#EBF1EB' : '#FFFFFF',
              color: '#26332A',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
            title="Toggle between cutaway 3.5ft low walls and full height walls"
          >
            <Layers size={13} color="#718B73" />
            <span>{wallMode === 'low' ? 'Low Walls (Cutaway)' : 'Full Walls (10 ft)'}</span>
          </button>

          {/* Interior / Exterior Toggle */}
          <button
            onClick={() => setViewModeInterior(prev => !prev)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '7px',
              border: '1px solid #E1E7DF',
              background: viewModeInterior ? '#EBF1EB' : '#FFFFFF',
              color: '#26332A',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <Home size={13} color="#718B73" />
            <span>{viewModeInterior ? 'Interior Cutaway' : 'Exterior Enclosure'}</span>
          </button>

          {/* Furniture On/Off */}
          <button
            onClick={() => setShowFurniture(prev => !prev)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '7px',
              border: '1px solid #E1E7DF',
              background: showFurniture ? '#EBF1EB' : '#FFFFFF',
              color: '#26332A',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <Sparkles size={13} color="#718B73" />
            <span>Furniture: {showFurniture ? 'On' : 'Off'}</span>
          </button>

          {/* Room Labels On/Off */}
          <button
            onClick={() => setShowRoomLabels(prev => !prev)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '7px',
              border: '1px solid #E1E7DF',
              background: showRoomLabels ? '#EBF1EB' : '#FFFFFF',
              color: '#26332A',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            {showRoomLabels ? <Eye size={13} color="#718B73" /> : <EyeOff size={13} color="#94a3b8" />}
            <span>Labels</span>
          </button>
        </div>
      </div>

      {/* =====================================================================
          CONTROL BAR 2: CAMERA PRESETS & LIGHTING DIALS
      ===================================================================== */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px'
        }}
      >
        {/* Camera Preset Buttons */}
        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#68736A', textTransform: 'uppercase', marginRight: '4px' }}>
            Camera:
          </span>
          {Object.values(CAMERA_PRESETS_5D).map((cp) => (
            <button
              key={cp.id}
              onClick={() => applyCameraPreset(cp.id)}
              style={{
                padding: '5px 10px',
                borderRadius: '6px',
                border: '1px solid #E1E7DF',
                background: '#FFFFFF',
                color: '#26332A',
                fontSize: '0.74rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              title={cp.description}
            >
              {cp.label}
            </button>
          ))}
        </div>

        {/* Lighting Atmosphere Preset */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#68736A', textTransform: 'uppercase', marginRight: '4px' }}>
            Lighting:
          </span>
          {[
            { id: 'day', label: 'Daylight', icon: <Sun size={12} color="#f59e0b" /> },
            { id: 'warm_evening', label: 'Evening', icon: <Sunset size={12} color="#f97316" /> },
            { id: 'dusk', label: 'Dusk', icon: <Moon size={12} color="#60a5fa" /> }
          ].map((lp) => (
            <button
              key={lp.id}
              onClick={() => setLightingPreset(lp.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '5px 10px',
                borderRadius: '6px',
                border: lightingPreset === lp.id ? '1px solid #718B73' : '1px solid #E1E7DF',
                background: lightingPreset === lp.id ? '#EBF1EB' : '#FFFFFF',
                color: '#26332A',
                fontSize: '0.74rem',
                fontWeight: lightingPreset === lp.id ? 800 : 600,
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
          ROOM CHIPS BAR: CLICKING ISOLATES FLOOR & CENTERS ROOM
      ===================================================================== */}
      {activeFloorRooms.length > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            overflowX: 'auto',
            paddingBottom: '4px',
            scrollbarWidth: 'none'
          }}
        >
          <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', flexShrink: 0 }}>
            Inspect Room:
          </span>
          {activeFloorRooms.map((rm) => (
            <button
              key={rm.id}
              onClick={() => handleSelectRoom(rm)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                borderRadius: '16px',
                border: focusedRoomId === rm.id ? '1px solid #718B73' : '1px solid #E1E7DF',
                background: focusedRoomId === rm.id ? '#718B73' : '#FFFFFF',
                color: focusedRoomId === rm.id ? '#FFFFFF' : '#26332A',
                fontSize: '0.72rem',
                fontWeight: focusedRoomId === rm.id ? 800 : 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
            >
              <span>{simplifyRoomName(rm.name, rm.type)}</span>
              {rm.areaSqFt && <span style={{ opacity: 0.7, fontSize: '0.65rem' }}>({rm.areaSqFt} sq.ft)</span>}
            </button>
          ))}
        </div>
      )}

      {/* =====================================================================
          MAIN 5D WEBGL ORTHOGRAPHIC VIEWPORT CANVAS
      ===================================================================== */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '620px',
          background: LIGHTING_PRESETS_5D[lightingPreset]?.background || '#ffffff',
          borderRadius: '16px',
          border: '1px solid #E1E7DF',
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.04)'
        }}
      >
        {/* Three.js Canvas Container */}
        <div ref={mountRef} style={{ width: '100%', height: '100%' }} />

        {/* Floating 2D Room Label Badges */}
        {showRoomLabels && hudLabels.map((lbl) => (
          <div
            key={lbl.id}
            style={{
              position: 'absolute',
              left: `${lbl.screenX}px`,
              top: `${lbl.screenY}px`,
              transform: 'translate(-50%, -50%)',
              background: 'rgba(255, 255, 255, 0.94)',
              backdropFilter: 'blur(4px)',
              border: '1px solid #E1E7DF',
              borderRadius: '6px',
              padding: '3px 8px',
              fontSize: '0.68rem',
              fontWeight: 800,
              color: '#26332A',
              pointerEvents: 'none',
              boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
              whiteSpace: 'nowrap',
              zIndex: 10
            }}
          >
            {lbl.name}
          </div>
        ))}

        {/* Viewport Floating Quick Actions (Top Right) */}
        <div
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            zIndex: 20
          }}
        >
          {/* Auto Orbit Toggle */}
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
            title={isAutoOrbiting ? 'Pause Auto Orbit' : 'Start Auto Orbit'}
          >
            {isAutoOrbiting ? <Pause size={15} /> : <Play size={15} />}
          </button>

          {/* Reset View */}
          <button
            onClick={handleResetView}
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
            title="Reset to default Isometric View"
          >
            <RotateCcw size={15} />
          </button>

          {/* Zoom In */}
          <button
            onClick={() => {
              if (cameraRef.current) {
                cameraRef.current.zoom = Math.min(cameraRef.current.zoom * 1.2, 4.0);
                cameraRef.current.updateProjectionMatrix();
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
            title="Zoom In"
          >
            <ZoomIn size={15} />
          </button>

          {/* Zoom Out */}
          <button
            onClick={() => {
              if (cameraRef.current) {
                cameraRef.current.zoom = Math.max(cameraRef.current.zoom * 0.85, 0.4);
                cameraRef.current.updateProjectionMatrix();
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
            title="Zoom Out"
          >
            <ZoomOut size={15} />
          </button>
        </div>

        {/* Viewport Floating Watermark / Architectural Tag (Bottom Left) */}
        <div
          style={{
            position: 'absolute',
            bottom: '12px',
            left: '12px',
            background: 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(6px)',
            border: '1px solid #E1E7DF',
            borderRadius: '8px',
            padding: '6px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.72rem',
            color: '#26332A',
            fontWeight: 700,
            boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
          }}
        >
          <span style={{ color: '#718B73', fontSize: '0.8rem' }}>🏛️</span>
          <span>5D Isometric Cutaway</span>
          <span style={{ color: '#94a3b8' }}>•</span>
          <span style={{ color: '#68736A' }}>{wallMode === 'low' ? '3.5ft Capped Walls' : 'Full Walls'}</span>
          <span style={{ color: '#94a3b8' }}>•</span>
          <span style={{ color: '#68736A' }}>{scene5d.deterministicHash}</span>
        </div>
      </div>

      {/* =====================================================================
          BOTTOM ACTION BAR: SNAPSHOT, SAVE TO PROJECT, ENHANCE
      ===================================================================== */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px',
          background: '#FAFAF7',
          padding: '12px 16px',
          borderRadius: '12px',
          border: '1px solid #E1E7DF'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Optional Enhance Button (Mock/Off by default) */}
          <button
            onClick={() => setIsEnhanceActive(prev => !prev)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              border: isEnhanceActive ? '1px solid #718B73' : '1px solid #E1E7DF',
              background: isEnhanceActive ? '#EBF1EB' : '#FFFFFF',
              color: isEnhanceActive ? '#718B73' : '#68736A',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
            title="Image-to-image AI architectural render enhancement (low strength)"
          >
            <Sparkles size={14} />
            <span>AI Enhance: {isEnhanceActive ? 'Active' : 'Off'}</span>
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* HD Snapshot (PNG) */}
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
            <span>{isSnapshotting ? 'Rendering HD...' : 'HD Snapshot (PNG)'}</span>
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
              padding: '8px 16px',
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
