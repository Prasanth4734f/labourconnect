import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  applyPlanarUVs,
  getWoodFloorTexture,
  getTeakDeckingTexture,
  getPorcelainTileTexture,
  getAreaRugTexture,
  getPlasterBumpMap
} from './architecturalMaterialSystem.js';
import { simplifyRoomName } from './architecturalRoomUtils.js';

/**
 * ThreeJsArchitecturalViewer
 * 
 * Professional Architectural 3D WebGL Visualization Viewport.
 * Produces visualization quality matching luxury isometric cutaway reference standards:
 * - Real 3D geometry with depth buffering and soft contact shadow mapping (PCFSoftShadowMap).
 * - Dimensionally accurate procedural PBR materials (hardwood planks, porcelain tiles, woven rugs, plaster).
 * - Multi-directional architectural illumination (Sun key, Sky hemisphere, Soft bounce fill, Warm interior lights).
 * - Professional camera angles: Elevated 35° Isometric Cutaway, 90° Top-Down Floor Plan, Elevations.
 * - Floor-by-floor inspection: Hides upper floors (open top), keeps lower floors attached below as building base.
 * - Floating room labels and dimensions HUD.
 * - Modes:
 *     1. Complete House: Construction-complete architectural exterior with crisp white roof/terrace tiles and realistic off-white plaster.
 *     2. Infrastructure: Unified mode bundling ALL interior infrastructure (furniture, electrical appliances, split ACs, luminaires, doors, windows, finishes).
 */
/**
 * Evaluates whether a wall or component obstructs the camera view into an active inspected room
 * and calculates appropriate transparency/cutaway parameters.
 */
function evaluateRoomInspectionCutaway(mesh, activeRoom) {
  if (!activeRoom || !activeRoom.bounds || !mesh.bounds) {
    return { shouldCutaway: false, isOpaqueFramingWall: false, inRoom: false };
  }
  const b = activeRoom.bounds;
  const m = mesh.bounds;
  const minX = Array.isArray(m.min) ? m.min[0] : (m.minX !== undefined ? m.minX : 0);
  const maxX = Array.isArray(m.max) ? m.max[0] : (m.maxX !== undefined ? m.maxX : 0);
  const minZ = Array.isArray(m.min) ? m.min[2] : (m.minZ !== undefined ? m.minZ : 0);
  const maxZ = Array.isArray(m.max) ? m.max[2] : (m.maxZ !== undefined ? m.maxZ : 0);

  const roomFl = activeRoom.floorIndex !== undefined ? Number(activeRoom.floorIndex) : 0;
  const meshFl = mesh.floorIndex !== undefined ? Number(mesh.floorIndex) : 0;
  if (meshFl !== roomFl) {
    return { shouldCutaway: false, isOpaqueFramingWall: false, inRoom: false };
  }

  // Check if mesh is inside the room
  const inRoom = (maxX >= b.x - 0.5 && minX <= b.x + b.width + 0.5 &&
                  maxZ >= b.y - 0.5 && minZ <= b.y + b.length + 0.5);

  // 1. Is it a wall that frames the BACK (North) or LEFT (West) of the room?
  // Camera views from South-East (elevated +Z, +X). The North wall (minZ <= b.y + 0.6) and West wall (minX <= b.x + 0.6)
  // are the backdrop that frames the room beautifully.
  const isBackWallNorth = maxZ <= b.y + 0.6 && maxX >= b.x - 0.5 && minX <= b.x + b.width + 0.5;
  const isSideWallWest = maxX <= b.x + 0.6 && maxZ >= b.y - 0.5 && minZ <= b.y + b.length + 0.5;
  if (isBackWallNorth || isSideWallWest) {
    return { shouldCutaway: false, isOpaqueFramingWall: true, inRoom };
  }

  // 2. Is it a wall that borders the FRONT (South) or RIGHT (East) of the room?
  // Facing the camera, these walls obstruct the sightline into the room.
  const isFrontWallSouth = minZ >= b.y + b.length - 1.2 && maxZ <= b.y + b.length + 1.2 && maxX >= b.x - 0.5 && minX <= b.x + b.width + 0.5;
  const isSideWallEast = minX >= b.x + b.width - 1.2 && maxX <= b.x + b.width + 1.2 && maxZ >= b.y - 0.5 && minZ <= b.y + b.length + 0.5;
  if (isFrontWallSouth || isSideWallEast) {
    return { shouldCutaway: true, isOpaqueFramingWall: false, inRoom };
  }

  // 3. Intervening walls from OTHER rooms situated directly between the camera (South-East) and the room:
  // Any wall with minZ >= b.y + b.length - 0.2 that intersects the camera view cone
  const isInterveningSouth = minZ >= b.y + b.length - 0.2 && maxX >= b.x - 1.0 && minX <= b.x + b.width + 16.0;
  const isInterveningEast = minX >= b.x + b.width - 0.2 && maxZ >= b.y - 1.0 && minZ <= b.y + b.length + 16.0;
  if (isInterveningSouth || isInterveningEast) {
    return { shouldCutaway: true, isOpaqueFramingWall: false, inRoom: false };
  }

  return { shouldCutaway: false, isOpaqueFramingWall: false, inRoom };
}

const ThreeJsArchitecturalViewer = forwardRef(function ThreeJsArchitecturalViewer({
  meshes = [],
  design = null,
  viewMode = 'furniture', // 'complete_home' | 'infrastructure' | 'furniture' | 'electrical_appliances'
  solarTime = 17.75,
  activeFloorFilter = 'all',
  focusedRoom = null,
  inspectingRoom = null,
  isAutoRotating = false,
  showRoomLabels = false, // Clean unobstructed photorealistic view like Image 5
  renderingStyle = 'photorealistic', // 'photorealistic' | 'blueprint' | 'minimalist' | 'artistic' | 'wireframe'
  viewAngle = 'birds_eye', // 'birds_eye' | 'top_down' | 'isometric' | 'walkthrough' | 'exterior'
  backgroundMode = 'isolated_white', // 'isolated_white' | 'neighborhood' | 'garden' | 'seaside'
  technicalPlan = null, // null | 'electrical' | 'plumbing' | 'lighting'
  onSnapshot
}, ref) {
  const activeRoom = inspectingRoom || focusedRoom;
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const sunLightRef = useRef(null);
  const hemiLightRef = useRef(null);
  const fillLightRef = useRef(null);
  const houseGroupRef = useRef(null);
  const roomFinishesGroupRef = useRef(null);
  const interiorLightsGroupRef = useRef(null);
  const siteGroupRef = useRef(null);
  const boundsCenterRef = useRef(new THREE.Vector3(20, 8, 25));
  const boundsRadiusRef = useRef(35);
  const autoRotateRef = useRef(isAutoRotating);
  const viewModeRef = useRef(viewMode);
  const designRef = useRef(design);
  const activeFloorFilterRef = useRef(activeFloorFilter);
  const showRoomLabelsRef = useRef(showRoomLabels);
  const renderingStyleRef = useRef(renderingStyle);
  const viewAngleRef = useRef(viewAngle);
  const backgroundModeRef = useRef(backgroundMode);
  const technicalPlanRef = useRef(technicalPlan);

  // Screen projected room labels state
  const [hudLabels, setHudLabels] = useState([]);

  useEffect(() => {
    autoRotateRef.current = isAutoRotating;
  }, [isAutoRotating]);
  useEffect(() => {
    viewModeRef.current = viewMode;
  }, [viewMode]);
  useEffect(() => {
    designRef.current = design;
  }, [design]);
  useEffect(() => {
    activeFloorFilterRef.current = activeFloorFilter;
  }, [activeFloorFilter]);
  useEffect(() => {
    showRoomLabelsRef.current = showRoomLabels;
  }, [showRoomLabels]);
  useEffect(() => {
    renderingStyleRef.current = renderingStyle;
  }, [renderingStyle]);
  useEffect(() => {
    viewAngleRef.current = viewAngle;
  }, [viewAngle]);
  useEffect(() => {
    backgroundModeRef.current = backgroundMode;
  }, [backgroundMode]);
  useEffect(() => {
    technicalPlanRef.current = technicalPlan;
  }, [technicalPlan]);

  // Compute Lighting parameters based on solar time
  const lightingStyle = useMemo(() => {
    const t = Number(solarTime) || 12;
    let skyTop = '#e0f2fe';
    let skyBottom = '#f8fafc';
    let sunColor = '#fff8eb';
    let sunIntensity = 1.6;
    let hemiIntensity = 0.95;
    let fillIntensity = 0.6;
    let groundColor = '#94a3b8'; // Neutral warm limestone/concrete bounce to prevent cartoon green tint on walls
    let studioBg = '#f1f5f9';
    let isNight = false;

    // Azimuth and Elevation
    const angle = ((t - 6) / 12) * Math.PI; // 0 at 6AM, PI at 6PM
    const sunDist = 95;
    const sunX = Math.cos(angle) * sunDist;
    const sunY = Math.max(12, Math.sin(angle) * sunDist * 0.85);
    const sunZ = 45;

    if (t <= 7.5) {
      // Dawn / Sunrise
      skyTop = '#fed7aa';
      skyBottom = '#cbd5e1';
      sunColor = '#fdba74';
      sunIntensity = 1.3;
      hemiIntensity = 0.8;
      fillIntensity = 0.5;
      studioBg = '#e2e8f0';
    } else if (t > 7.5 && t < 16.5) {
      // Full Daylight
      skyTop = '#e0f2fe';
      skyBottom = '#f8fafc';
      sunColor = '#fffbeb';
      sunIntensity = 1.65;
      hemiIntensity = 0.95;
      fillIntensity = 0.65;
      studioBg = '#f1f5f9';
    } else if (t >= 16.5 && t <= 18.75) {
      // Sunset Golden Hour
      skyTop = '#fdba74';
      skyBottom = '#fed7aa';
      sunColor = '#fbbf24';
      sunIntensity = 1.5;
      hemiIntensity = 0.85;
      fillIntensity = 0.55;
      studioBg = '#e2e8f0';
    } else {
      // Architectural Night
      skyTop = '#090d16';
      skyBottom = '#020617';
      sunColor = '#93c5fd';
      sunIntensity = 0.4;
      hemiIntensity = 0.45;
      fillIntensity = 0.3;
      groundColor = '#0f172a';
      studioBg = '#0a0f1d';
      isNight = true;
    }

    return {
      skyTop,
      skyBottom,
      sunColor,
      sunIntensity,
      hemiIntensity,
      fillIntensity,
      groundColor,
      studioBg,
      sunPos: [sunX, sunY, sunZ],
      isNight
    };
  }, [solarTime]);

  // Expose camera presets, zoom, compass rotation, room focus, and 4K snapshot imperative handles
  useImperativeHandle(ref, () => ({
    setCameraPreset: (preset) => {
      if (!cameraRef.current || !controlsRef.current) return;
      const c = boundsCenterRef.current;
      const r = boundsRadiusRef.current;
      const dist = r * 1.85;

      switch (preset) {
        case 'birds_eye':
          // Elevated 38° dollhouse cutaway looking down into full interior (Image 5 standard)
          cameraRef.current.position.set(c.x + dist * 0.92, c.y + dist * 1.15, c.z + dist * 0.92);
          break;
        case 'isometric':
          cameraRef.current.position.set(c.x + dist * 1.05, c.y + dist * 0.85, c.z + dist * 1.05);
          break;
        case 'walkthrough':
          cameraRef.current.position.set(c.x, c.y + 2.5, c.z + dist * 0.4);
          controlsRef.current.target.set(c.x, c.y + 2.5, c.z);
          break;
        case 'exterior':
          cameraRef.current.position.set(c.x + dist * 1.15, c.y + dist * 0.75, c.z + dist * 1.15);
          break;
        case 'front':
          cameraRef.current.position.set(c.x, c.y + 4, c.z - dist);
          break;
        case 'rear':
          cameraRef.current.position.set(c.x, c.y + 4, c.z + dist);
          break;
        case 'left':
          cameraRef.current.position.set(c.x - dist, c.y + 4, c.z);
          break;
        case 'right':
          cameraRef.current.position.set(c.x + dist, c.y + 4, c.z);
          break;
        case 'top_down':
          // 90° Top-Down Floor Plan view
          cameraRef.current.position.set(c.x, c.y + dist * 1.6, c.z + 0.01);
          break;
        case 'iso_cutaway':
        case 'iso':
        default:
          cameraRef.current.position.set(c.x + dist * 0.92, c.y + dist * 1.15, c.z + dist * 0.92);
          break;
      }
      controlsRef.current.target.copy(c);
      controlsRef.current.update();
    },
    setRenderingStyle: (style) => {
      renderingStyleRef.current = style;
    },
    setViewAngle: (angle) => {
      viewAngleRef.current = angle;
      if (!cameraRef.current || !controlsRef.current) return;
      const c = boundsCenterRef.current;
      const r = boundsRadiusRef.current;
      const dist = r * 1.85;
      if (angle === 'birds_eye') {
        cameraRef.current.position.set(c.x + dist * 0.92, c.y + dist * 1.15, c.z + dist * 0.92);
        controlsRef.current.target.copy(c);
      } else if (angle === 'top_down') {
        cameraRef.current.position.set(c.x, c.y + dist * 1.6, c.z + 0.01);
        controlsRef.current.target.copy(c);
      } else if (angle === 'isometric') {
        cameraRef.current.position.set(c.x + dist * 1.05, c.y + dist * 0.85, c.z + dist * 1.05);
        controlsRef.current.target.copy(c);
      } else if (angle === 'walkthrough') {
        cameraRef.current.position.set(c.x, c.y + 2.5, c.z + dist * 0.4);
        controlsRef.current.target.set(c.x, c.y + 2.5, c.z);
      } else if (angle === 'exterior') {
        cameraRef.current.position.set(c.x + dist * 1.15, c.y + dist * 0.75, c.z + dist * 1.15);
        controlsRef.current.target.copy(c);
      }
      controlsRef.current.update();
    },
    setBackgroundMode: (bg) => {
      backgroundModeRef.current = bg;
    },
    setTechnicalPlan: (plan) => {
      technicalPlanRef.current = plan;
    },
    rotateCompass: (deltaDeg = 45) => {
      if (!cameraRef.current || !controlsRef.current) return;
      const target = controlsRef.current.target;
      const pos = cameraRef.current.position;
      const offset = pos.clone().sub(target);
      const rad = (deltaDeg * Math.PI) / 180;
      const x = offset.x * Math.cos(rad) - offset.z * Math.sin(rad);
      const z = offset.x * Math.sin(rad) + offset.z * Math.cos(rad);
      cameraRef.current.position.set(target.x + x, pos.y, target.z + z);
      controlsRef.current.update();
    },
    focusRoom: (room) => {
      if (!cameraRef.current || !controlsRef.current || !room || !room.bounds) return;
      const { x, y, width, length } = room.bounds;
      const fIdx = room.floorIndex !== undefined ? Number(room.floorIndex) : 0;
      const rx = x + width / 2;
      const rz = y + length / 2;
      const ry = fIdx * 10.5 + 1.5;
      const span = Math.max(width, length);

      // Elevated interior inspection angle looking down directly into room center (35° declination)
      const interiorDist = Math.max(span * 1.35, 6.5);
      const camX = rx + interiorDist * 0.68;
      const camY = ry + Math.min(Math.max(span * 0.85, 4.5), 8.5);
      const camZ = rz + interiorDist * 0.88;

      controlsRef.current.target.set(rx, ry + 2.0, rz);
      cameraRef.current.position.set(camX, camY, camZ);
      controlsRef.current.minDistance = 1.0;
      controlsRef.current.maxDistance = 60;
      controlsRef.current.update();
    },
    zoomIn: () => {
      if (!cameraRef.current || !controlsRef.current) return;
      const c = controlsRef.current.target;
      cameraRef.current.position.lerp(c, 0.15);
      controlsRef.current.update();
    },
    zoomOut: () => {
      if (!cameraRef.current || !controlsRef.current) return;
      const c = controlsRef.current.target;
      const dir = cameraRef.current.position.clone().sub(c).multiplyScalar(1.18);
      cameraRef.current.position.copy(c).add(dir);
      controlsRef.current.update();
    },
    resetCamera: () => {
      if (!cameraRef.current || !controlsRef.current) return;
      const c = boundsCenterRef.current;
      const r = boundsRadiusRef.current;
      const dist = r * 1.85;
      cameraRef.current.position.set(c.x + dist * 0.85, c.y + dist * 0.75, c.z + dist * 0.85);
      controlsRef.current.target.copy(c);
      controlsRef.current.minDistance = 6;
      controlsRef.current.maxDistance = 240;
      controlsRef.current.update();
    },
    handleResize: () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = mountRef.current.clientWidth || 680;
      const h = mountRef.current.clientHeight || 560;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    },
    captureSnapshot: () => {
      if (!rendererRef.current) return null;
      try {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
        const dataUrl = rendererRef.current.domElement.toDataURL('image/png', 1.0);
        if (onSnapshot) onSnapshot(dataUrl);
        return dataUrl;
      } catch (err) {
        console.warn('[ThreeJsArchitecturalViewer] Snapshot error:', err);
        return null;
      }
    }
  }));

  // Initialize Three.js Scene, Camera, Renderer, OrbitControls, and Lighting
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 680;
    const height = container.clientHeight || 560;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera (Perspective with 36° FOV for realistic architectural isometric feel)
    const camera = new THREE.PerspectiveCamera(36, width / height, 0.5, 900);
    camera.position.set(50, 38, 55);
    cameraRef.current = camera;

    // 3. WebGL Renderer with High-Performance Antialiasing, Soft Shadows, ACES Tone Mapping
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. OrbitControls with smooth damping
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 6;
    controls.maxDistance = 240;
    controls.maxPolarAngle = Math.PI / 2 + 0.02; // Prevent underground clipping
    controls.target.set(20, 8, 25);
    controlsRef.current = controls;

    // 5. Professional Architectural Lighting Setup
    // Key Sun Light
    const sunLight = new THREE.DirectionalLight('#fff8eb', 1.65);
    sunLight.position.set(45, 65, 45);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 1;
    sunLight.shadow.camera.far = 320;
    const d = 60;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    sunLight.shadow.bias = -0.0003;
    sunLight.shadow.normalBias = 0.025; // Prevents shadow acne on walls
    sunLight.shadow.radius = 2.0;       // Soft contact penumbra
    scene.add(sunLight);
    sunLightRef.current = sunLight;

    // Hemisphere Skylight & Warm Ground Bounce
    const hemiLight = new THREE.HemisphereLight('#e0f2fe', '#fef3c7', 0.95);
    scene.add(hemiLight);
    hemiLightRef.current = hemiLight;

    // Secondary Soft Fill Light (from opposite angle - fills dark cavities)
    const fillLight = new THREE.DirectionalLight('#e0f2fe', 0.6);
    fillLight.position.set(-45, 50, -35);
    fillLight.castShadow = false;
    scene.add(fillLight);
    fillLightRef.current = fillLight;

    // 6. House Geometries Group
    const houseGroup = new THREE.Group();
    scene.add(houseGroup);
    houseGroupRef.current = houseGroup;

    // 7. Room Floor Finishes Group (Hardwood, Tiles, Rugs)
    const roomFinishesGroup = new THREE.Group();
    scene.add(roomFinishesGroup);
    roomFinishesGroupRef.current = roomFinishesGroup;

    // 8. Interior Warm Room Lights Group
    const interiorGroup = new THREE.Group();
    scene.add(interiorGroup);
    interiorLightsGroupRef.current = interiorGroup;

    // 9. Site Platform (Lawn & Driveway, active in Complete Home mode)
    const siteGroup = new THREE.Group();
    scene.add(siteGroup);
    siteGroupRef.current = siteGroup;

    const groundGeo = new THREE.PlaneGeometry(160, 160);
    const groundMat = new THREE.MeshStandardMaterial({
      color: '#36533d', // Muted natural landscape lawn
      roughness: 0.95,
      metalness: 0.01
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.05;
    ground.receiveShadow = true;
    siteGroup.add(ground);

    // Decorative Concrete Driveway & Entrance Walkway
    const driveGeo = new THREE.PlaneGeometry(16, 42);
    const driveMat = new THREE.MeshStandardMaterial({
      color: '#cbd5e1',
      roughness: 0.65,
      metalness: 0.08
    });
    const driveway = new THREE.Mesh(driveGeo, driveMat);
    driveway.rotation.x = -Math.PI / 2;
    driveway.position.set(10, 0.02, 5);
    driveway.receiveShadow = true;
    siteGroup.add(driveway);

    // Contact Shadow Plane (grounds the house with soft ambient occlusion shadow in ALL modes)
    const shadowPlaneGeo = new THREE.PlaneGeometry(160, 160);
    const shadowPlaneMat = new THREE.ShadowMaterial({
      opacity: 0.25
    });
    const shadowPlane = new THREE.Mesh(shadowPlaneGeo, shadowPlaneMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = 0.01;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    // Animation & Projection Loop
    let animId = null;
    const tempVec = new THREE.Vector3();

    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (controlsRef.current) {
        controlsRef.current.autoRotate = autoRotateRef.current;
        controlsRef.current.autoRotateSpeed = 1.2;
        controlsRef.current.update();
      }

      // Update Screen Coordinates for Floating Room Labels
      if (sceneRef.current && cameraRef.current && mountRef.current) {
        const cWidth = mountRef.current.clientWidth || 680;
        const cHeight = mountRef.current.clientHeight || 560;

        // Collect rooms for the active floor
        const currentActiveFloor = activeFloorFilterRef.current;
        const currentDesign = designRef.current;
        const currentShowLabels = showRoomLabelsRef.current;
        const currentViewMode = viewModeRef.current;

        const targetFloorIndex = currentActiveFloor === 'all' ? 0 : Number(currentActiveFloor);
        const activeFloor = currentDesign?.floors ? currentDesign.floors[targetFloorIndex] : null;
        const roomsToLabel = (activeFloor && Array.isArray(activeFloor.rooms)) ? activeFloor.rooms : [];

        if (currentShowLabels && roomsToLabel.length > 0 && (currentViewMode === 'infrastructure' || currentViewMode === 'furniture')) {
          const newLabels = [];
          const floorY = (targetFloorIndex * 10.5 + 1.5) + 3.2;

          roomsToLabel.forEach(rm => {
            if (!rm.bounds) return;
            const rx = rm.bounds.x + rm.bounds.width / 2;
            const rz = rm.bounds.y + rm.bounds.length / 2;

            tempVec.set(rx, floorY, rz);
            tempVec.project(camera);

            // Only display if within view frustum
            if (tempVec.z < 1.0 && tempVec.x >= -1.1 && tempVec.x <= 1.1 && tempVec.y >= -1.1 && tempVec.y <= 1.1) {
              const screenX = (tempVec.x * 0.5 + 0.5) * cWidth;
              const screenY = (-tempVec.y * 0.5 + 0.5) * cHeight;

              newLabels.push({
                id: rm.id,
                name: simplifyRoomName(rm.name, rm.type),
                screenX: Math.round(screenX),
                screenY: Math.round(screenY)
              });
            }
          });

          setHudLabels(newLabels);
        } else {
          setHudLabels([]);
        }
      }

      renderer.render(scene, camera);
    };
    animate();

    // Responsive Canvas Resize
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const newW = container.clientWidth || 680;
      const newH = container.clientHeight || 560;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
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

  // Update Lighting Style dynamically when solar time changes
  useEffect(() => {
    if (!sunLightRef.current || !hemiLightRef.current || !fillLightRef.current) return;
    const { sunColor, sunIntensity, hemiIntensity, fillIntensity, groundColor, sunPos, isNight } = lightingStyle;

    sunLightRef.current.color.set(sunColor);
    sunLightRef.current.intensity = sunIntensity;
    sunLightRef.current.position.set(sunPos[0], sunPos[1], sunPos[2]);

    hemiLightRef.current.color.set(isNight ? '#1e293b' : '#e0f2fe');
    hemiLightRef.current.groundColor.set(groundColor);
    hemiLightRef.current.intensity = hemiIntensity;

    fillLightRef.current.intensity = fillIntensity;
  }, [lightingStyle]);

  // Build Three.js Meshes from Procedural Building Engine with High-Fidelity Architectural Materials
  useEffect(() => {
    if (!houseGroupRef.current || !sceneRef.current) return;
    const houseGroup = houseGroupRef.current;
    const roomFinishesGroup = roomFinishesGroupRef.current;
    const interiorGroup = interiorLightsGroupRef.current;

    // Clear existing meshes
    while (houseGroup.children.length > 0) {
      const child = houseGroup.children[0];
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
        else child.material.dispose();
      }
      houseGroup.remove(child);
    }

    if (roomFinishesGroup) {
      while (roomFinishesGroup.children.length > 0) {
        const child = roomFinishesGroup.children[0];
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
        roomFinishesGroup.remove(child);
      }
    }

    if (interiorGroup) {
      while (interiorGroup.children.length > 0) {
        interiorGroup.remove(interiorGroup.children[0]);
      }
    }

    if (siteGroupRef.current) {
      siteGroupRef.current.visible = (backgroundModeRef.current !== 'isolated_white' && viewMode === 'complete_home');
    }
    if (sceneRef.current) {
      const bg = backgroundModeRef.current || backgroundMode;
      if (bg === 'isolated_white') {
        sceneRef.current.background = new THREE.Color('#ffffff');
      } else if (bg === 'garden') {
        sceneRef.current.background = new THREE.Color('#e0f2fe');
      } else if (bg === 'seaside') {
        sceneRef.current.background = new THREE.Color('#bae6fd');
      } else {
        sceneRef.current.background = new THREE.Color('#f8fafc');
      }
    }

    if (!Array.isArray(meshes) || meshes.length === 0) return;

    // Calculate Compound Bounds
    let bMinX = Infinity, bMinY = Infinity, bMinZ = Infinity;
    let bMaxX = -Infinity, bMaxY = -Infinity, bMaxZ = -Infinity;

    meshes.forEach(m => {
      if (m.bounds && Array.isArray(m.bounds.min) && Array.isArray(m.bounds.max)) {
        bMinX = Math.min(bMinX, m.bounds.min[0]);
        bMinY = Math.min(bMinY, m.bounds.min[1]);
        bMinZ = Math.min(bMinZ, m.bounds.min[2]);
        bMaxX = Math.max(bMaxX, m.bounds.max[0]);
        bMaxY = Math.max(bMaxY, m.bounds.max[1]);
        bMaxZ = Math.max(bMaxZ, m.bounds.max[2]);
      }
    });

    if (bMinX !== Infinity) {
      const center = new THREE.Vector3(
        (bMinX + bMaxX) / 2,
        (bMinY + bMaxY) / 2,
        (bMinZ + bMaxZ) / 2
      );
      boundsCenterRef.current = center;
      const sizeX = bMaxX - bMinX;
      const sizeY = bMaxY - bMinY;
      const sizeZ = bMaxZ - bMinZ;
      boundsRadiusRef.current = Math.max(sizeX, sizeY, sizeZ);

      // Auto-initialize camera position and target center
      if (controlsRef.current) {
        controlsRef.current.target.copy(center);
        if (!controlsRef.current.userData?.initialized) {
          const dist = Math.max(sizeX, sizeY, sizeZ) * 1.85;
          cameraRef.current.position.set(center.x + dist * 0.85, center.y + dist * 0.75, center.z + dist * 0.85);
          controlsRef.current.userData = { initialized: true };
        }
        controlsRef.current.update();
      }

      // Add warm 2700K ambient interior fill lights inside rooms
      if (interiorGroup) {
        const intLight = new THREE.PointLight('#fef08a', lightingStyle.isNight ? 1.8 : 1.1, 55);
        intLight.position.set(center.x, Math.max(5, (bMinY + bMaxY) * 0.45), center.z);
        interiorGroup.add(intLight);
      }
    }

    // =========================================================================
    // ROOM FLOOR FINISHES (HARDWOOD PLANKS, TILES, WOVEN RUGS)
    // Displayed in 'infrastructure', 'furniture', and activeRoom inspection modes
    // =========================================================================
    if ((viewMode === 'infrastructure' || viewMode === 'furniture' || Boolean(activeRoom)) && roomFinishesGroup && design && Array.isArray(design.floors)) {
      const targetFl = activeFloorFilter === 'all' ? null : Number(activeFloorFilter);

      design.floors.forEach((fl, fIdx) => {
        if (targetFl !== null && targetFl !== fIdx) return;

        const floorBaseY = fIdx * 10.5 + 1.5 + 0.03; // Just above structural slab

        (fl.rooms || []).forEach(rm => {
          if (!rm.bounds || !rm.bounds.width || !rm.bounds.length) return;
          const { x, y, width, length } = rm.bounds;
          const rType = (rm.type || '').toLowerCase();

          // Margin inset to align neatly within interior wall face
          const inset = 0.25;
          const rw = Math.max(1.0, width - inset * 2);
          const rl = Math.max(1.0, length - inset * 2);

          const floorGeo = new THREE.PlaneGeometry(rw, rl);
          floorGeo.rotateX(-Math.PI / 2);

          let floorMat;
          if (rType.includes('terrace') || rType.includes('balcony') || rType.includes('deck') || rType.includes('outdoor') || rType.includes('verandah') || rType.includes('patio')) {
            // Real horizontal teak wood decking planks (Matching Image 5 standard!)
            const { map, roughnessMap } = getTeakDeckingTexture(rw / 3, rl / 3);
            floorMat = new THREE.MeshStandardMaterial({
              map,
              roughnessMap,
              roughness: 0.38,
              metalness: 0.04,
              side: THREE.DoubleSide
            });
          } else if (rType.includes('bath') || rType.includes('toilet') || rType.includes('kitchen') || rType.includes('utility')) {
            // High-end porcelain / marble tiles
            const { map } = getPorcelainTileTexture(rw / 3, rl / 3, rType.includes('bath') ? 'marble_calacatta' : 'dark_slate');
            floorMat = new THREE.MeshStandardMaterial({
              map,
              roughness: 0.18,
              metalness: 0.05,
              side: THREE.DoubleSide
            });
          } else {
            // Warm natural oak / teak wood floor planks (Reference Image 5 interior standard)
            const { map, roughnessMap } = getWoodFloorTexture(rw / 4, rl / 4);
            floorMat = new THREE.MeshStandardMaterial({
              map,
              roughnessMap,
              roughness: 0.35,
              metalness: 0.05,
              side: THREE.DoubleSide
            });
          }

          const floorMesh = new THREE.Mesh(floorGeo, floorMat);
          floorMesh.position.set(x + width / 2, floorBaseY, y + length / 2);
          floorMesh.receiveShadow = true;
          roomFinishesGroup.add(floorMesh);

          // Living Room & Master Bedroom Area Rugs
          if (rType.includes('living') || rType.includes('hall')) {
            const rugW = Math.min(rw * 0.65, 12);
            const rugL = Math.min(rl * 0.55, 9);
            const rugGeo = new THREE.PlaneGeometry(rugW, rugL);
            rugGeo.rotateX(-Math.PI / 2);
            const rugMat = new THREE.MeshStandardMaterial({
              map: getAreaRugTexture(),
              roughness: 0.85,
              metalness: 0.0
            });
            const rugMesh = new THREE.Mesh(rugGeo, rugMat);
            rugMesh.position.set(x + width / 2, floorBaseY + 0.015, y + length / 2 + 0.5);
            rugMesh.receiveShadow = true;
            roomFinishesGroup.add(rugMesh);
          } else if (rType.includes('bed') && rm.type === 'master_bedroom') {
            const rugW = Math.min(rw * 0.7, 10);
            const rugL = Math.min(rl * 0.65, 8);
            const rugGeo = new THREE.PlaneGeometry(rugW, rugL);
            rugGeo.rotateX(-Math.PI / 2);
            const rugMat = new THREE.MeshStandardMaterial({
              map: getAreaRugTexture(),
              roughness: 0.85,
              metalness: 0.0
            });
            const rugMesh = new THREE.Mesh(rugGeo, rugMat);
            rugMesh.position.set(x + width / 2, floorBaseY + 0.015, y + length / 2);
            rugMesh.receiveShadow = true;
            roomFinishesGroup.add(rugMesh);
          }
        });
      });
    }

    // =========================================================================
    // 3D MODEL MESH GENERATION & VIEW MODE MATERIAL ASSIGNMENT
    // =========================================================================
    meshes.forEach((mesh) => {
      const compType = (mesh.componentType || mesh.type || '').toLowerCase();
      const isWall = compType.includes('wall') || compType === 'parapet';
      const isRoof = compType.includes('roof') || compType.includes('ridge') || compType.includes('parapet_coping') || compType.includes('terrace');
      const isOpening = compType.includes('door') || compType.includes('window') || compType.includes('frame') || compType.includes('glass') || compType.includes('chajja');
      const isFurniture = Boolean(mesh.isFurniture || mesh.metadata?.isFurniture || compType.includes('bed') || compType.includes('sofa') || compType.includes('table') || compType.includes('counter'));
      const isElectrical = Boolean(mesh.isElectrical || mesh.category === 'electrical_appliances' || compType.includes('fan') || compType.includes('ac_') || compType.includes('light_') || compType.includes('mcb_'));
      const isLandscape = Boolean(mesh.isLandscape || mesh.metadata?.isLandscape);
      const isColumn = compType.includes('column') || compType.includes('pillar');
      const isPergola = compType.includes('pergola') || compType.includes('porch');

      // -----------------------------------------------------------------------
      // FLOOR-BY-FLOOR INSPECTION FILTERING (Attached Building Base)
      // When 1st floor is selected: top is open, but Ground floor remains attached below!
      // -----------------------------------------------------------------------
      if (activeFloorFilter !== 'all') {
        const targetFl = Number(activeFloorFilter);
        // Hide roofs in floor inspection so inspected floor is open top
        if (isRoof) return;
        // Hide floors above the inspected target floor
        if (mesh.floorIndex !== undefined && mesh.floorIndex > targetFl) return;
        // For floors below target floor: KEEP FIRMLY ATTACHED AS THE SOLID FOUNDATION/BASE!
        if (mesh.floorIndex !== undefined && mesh.floorIndex < targetFl) {
          // Hide interior furnishings and electrical fixtures from lower floors so the focus is strictly on the target floor
          if (isFurniture || isElectrical) return;
          // Lower floor exterior walls, interior partition walls, foundation plinth, and floor slabs remain attached!
        }
        // Hide non-exterior pillars
        if (isColumn && !isPergola) return;
      }

      // -----------------------------------------------------------------------
      // ROOM INTERIOR INSPECTION FILTERING (Unobstructed Room View)
      // When inspecting a specific room (e.g. Pooja Room, Living Room, etc.):
      // - Hide roofs and upper floors so room interior is directly accessible.
      // - Hide ceiling slabs over the inspected room's floor.
      // -----------------------------------------------------------------------
      if (activeRoom && activeRoom.bounds) {
        const roomFl = activeRoom.floorIndex !== undefined ? Number(activeRoom.floorIndex) : 0;
        if (isRoof) return;
        if (mesh.floorIndex !== undefined && mesh.floorIndex > roomFl) return;
        if (compType.includes('roof_terrace_slab') || compType.includes('ceiling') || compType.includes('chajja')) return;
      }

      // Suppress intrusive freestanding grid columns that clutter rooms and facades
      if (isColumn && !isPergola && !compType.includes('porch') && !compType.includes('gate')) {
        return;
      }

      // Check room interior inspection cutaway
      const cutaway = evaluateRoomInspectionCutaway(mesh, activeRoom);
      const isVintageOrTraditional = String(design?.inputs?.archStyle || design?.metadata?.style || '').toLowerCase().includes('vintage') ||
        String(design?.inputs?.archStyle || design?.metadata?.style || '').toLowerCase().includes('traditional');

      // In room inspection, hide furniture & electrical fixtures outside inspected room so focus is 100% on target room
      if (activeRoom && (isFurniture || isElectrical)) {
        if (!cutaway.inRoom) {
          return;
        }
      }

      // -----------------------------------------------------------------------
      // EXACT VIEW MODES
      // 1. Complete House: Construction-complete exterior with white/terracotta tiles and realistic plaster.
      // 2. Infrastructure: Unified interior mode bundling ALL furnishings, electrical appliances, split ACs, luminaires, doors, windows, and finishes.
      // -----------------------------------------------------------------------

      let isVisible = true;
      let overrideOpacity = mesh.opacity !== undefined ? mesh.opacity : 1.0;
      let overrideTransparent = overrideOpacity < 1.0;
      let overrideColor = mesh.color || '#f1f5f9';
      let overrideRoughness = mesh.roughness !== undefined ? mesh.roughness : 0.75;
      let overrideMetalness = mesh.metalness !== undefined ? mesh.metalness : 0.05;
      let overrideEmissive = '#000000';
      let overrideEmissiveIntensity = 0;
      let overrideWireframe = false;
      let usePlasterBump = false;

      if (viewMode === 'complete_home') {
        // Complete House: Unfurnished construction-complete exterior with realistic materials
        if (isFurniture || isElectrical) {
          if (activeRoom) {
            // In room inspection, show furniture & lighting inside the inspected room!
            isVisible = cutaway.inRoom;
          } else {
            isVisible = false; // strictly unfurnished exterior
          }
        } else if (isWall) {
          overrideColor = '#fdfbf7'; // Warm architectural limewash off-white plaster
          overrideRoughness = 0.88;
          overrideMetalness = 0.02;
          usePlasterBump = true;

          // Controlled cutaway for front/intervening walls when inspecting room interior
          if (activeRoom) {
            if (cutaway.shouldCutaway) {
              overrideTransparent = true;
              overrideOpacity = 0.10;
            } else if (cutaway.isOpaqueFramingWall) {
              overrideTransparent = false;
              overrideOpacity = 1.0;
            }
          }
        } else if (compType.includes('sloping_roof') || compType.includes('ridge')) {
          overrideColor = isVintageOrTraditional ? (mesh.color || '#b91c1c') : '#ffffff';
          overrideRoughness = 0.72;
          overrideMetalness = 0.05;
        } else if (compType.includes('coping')) {
          overrideColor = '#ffffff'; // Crisp white stone parapet coping
          overrideRoughness = 0.45;
        } else if (compType.includes('parapet')) {
          overrideColor = '#fdfbf7'; // Warm off-white parapet wall plaster
          overrideRoughness = 0.88;
          usePlasterBump = true;
        } else if (compType.includes('slab')) {
          if (compType.includes('plinth')) {
            overrideColor = '#1e293b'; // Polished jet-black granite plinth foundation
            overrideRoughness = 0.25;
            overrideMetalness = 0.1;
          } else if (compType.includes('terrace')) {
            overrideColor = '#ffffff'; // Crisp white anti-skid terrace vitrified tiles
            overrideRoughness = 0.45;
          } else {
            overrideColor = '#e2e8f0'; // Clean architectural concrete floor/terrace slab edge
            overrideRoughness = 0.6;
          }
        } else if (compType.includes('chajja') || compType.includes('sunshade')) {
          overrideColor = '#ffffff'; // Crisp white architectural sunshade chajjas
          overrideRoughness = 0.6;
        } else if (compType.includes('railing') || compType.includes('post')) {
          overrideColor = '#0f172a'; // Black metal railing
          overrideRoughness = 0.35;
          overrideMetalness = 0.8;
        }
      } else if (viewMode === 'infrastructure' || viewMode === 'furniture') {
        // Infrastructure Mode: Bundles ALL things in the home (furniture, electrical appliances, split ACs, luminaires, doors, windows, finishes)
        if (isRoof) {
          isVisible = false; // Cutaway roof reveals complete infrastructure
        } else if (isWall) {
          // Clean architectural matte grey plaster with smooth coping (Image 5 standard)
          overrideColor = '#cbd5e1';
          overrideRoughness = 0.82;
          overrideMetalness = 0.02;
          usePlasterBump = true;

          // Controlled cutaway for front/intervening walls when inspecting room interior
          if (activeRoom) {
            if (cutaway.shouldCutaway) {
              overrideTransparent = true;
              overrideOpacity = 0.10;
            } else if (cutaway.isOpaqueFramingWall) {
              overrideTransparent = false;
              overrideOpacity = 1.0;
            }
          }
        } else if (isFurniture) {
          overrideOpacity = 1.0;
          if (compType.includes('sofa') || compType.includes('cushion') || compType.includes('mattress')) {
            overrideColor = compType.includes('sofa') ? '#475569' : '#f8fafc';
            overrideRoughness = 0.85;
            overrideMetalness = 0.0;
          } else if (compType.includes('table') || compType.includes('wardrobe') || compType.includes('headboard')) {
            overrideColor = '#9a6b3d'; // Rich warm teak wood
            overrideRoughness = 0.35;
            overrideMetalness = 0.05;
          } else if (compType.includes('counter')) {
            overrideColor = '#f8fafc'; // Quartz waterfall counter
            overrideRoughness = 0.15;
            overrideMetalness = 0.05;
          }
        } else if (isElectrical) {
          // Electrical appliances operational and highlighted
          overrideOpacity = 1.0;
          overrideRoughness = 0.25;
          overrideMetalness = 0.75;
          if (compType.includes('light_') || compType.includes('chandelier') || compType.includes('lantern')) {
            overrideColor = '#fffbeb';
            overrideEmissive = '#fef08a';
            overrideEmissiveIntensity = 0.75;
          } else if (compType.includes('ac_')) {
            overrideColor = '#ffffff'; // Crisp white modern split AC indoor unit
            overrideRoughness = 0.2;
            overrideMetalness = 0.1;
          } else if (compType.includes('fan_')) {
            overrideColor = '#334155'; // Matte graphite ceiling fan
            overrideRoughness = 0.3;
            overrideMetalness = 0.5;
          } else if (compType.includes('mcb_')) {
            overrideColor = '#e2e8f0'; // Industrial metal MCB enclosure
            overrideRoughness = 0.25;
            overrideMetalness = 0.85;
          }
        }
      } else if (viewMode === 'electrical_appliances') {
        // Fallback Electrical Mode
        if (isRoof) {
          isVisible = false;
        } else if (isWall || compType.includes('slab')) {
          overrideTransparent = true;
          overrideOpacity = 0.16;
          overrideColor = '#1e293b';
        } else if (isElectrical) {
          overrideOpacity = 1.0;
          overrideRoughness = 0.2;
          overrideMetalness = 0.8;
          overrideEmissive = mesh.glow?.color || '#38bdf8';
          overrideEmissiveIntensity = 0.9;
        } else if (isFurniture) {
          overrideTransparent = true;
          overrideOpacity = 0.2;
        }
      } else if (viewMode === 'doors_windows') {
        // Fallback Doors & Windows Mode
        if (isOpening) {
          overrideOpacity = 1.0;
          overrideRoughness = 0.2;
          overrideMetalness = compType.includes('handle') ? 0.9 : 0.35;
          if (compType.includes('glass') || compType.includes('pane')) {
            overrideColor = '#67e8f9';
            overrideEmissive = '#0284c7';
            overrideEmissiveIntensity = 0.45;
          }
        } else if (isLandscape) {
          isVisible = false;
        } else {
          overrideTransparent = true;
          overrideOpacity = 0.12;
          overrideColor = '#64748b';
          overrideWireframe = true;
        }
      }

      if (!isVisible) return;

      // Build Three.js BufferGeometry from mesh vertices & faces
      const vertices = mesh.vertices || [];
      const faces = mesh.faces || [];
      if (vertices.length < 3 || faces.length === 0) return;

      const positions = [];
      const indices = [];

      vertices.forEach(v => {
        positions.push(v[0], v[1], v[2]);
      });

      faces.forEach(f => {
        const idxs = f.indices || [];
        if (idxs.length === 3) {
          indices.push(idxs[0], idxs[1], idxs[2]);
        } else if (idxs.length === 4) {
          indices.push(idxs[0], idxs[1], idxs[2]);
          indices.push(idxs[0], idxs[2], idxs[3]);
        }
      });

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geometry.setIndex(indices);
      geometry.computeVertexNormals();

      // Automatically apply dimensionally-accurate planar UVs
      applyPlanarUVs(geometry, 10.0);

      // -----------------------------------------------------------------------
      // UNMISTAKABLE DISTINCTION: WINDOW GLASS VS TEAK WOOD DOORS
      // -----------------------------------------------------------------------
      // Window Glass Material: Acoustic sky-blue clear double glazing
      if (compType.includes('window_pane') || compType.includes('glass')) {
        overrideTransparent = true;
        overrideOpacity = viewMode === 'doors_windows' ? 0.85 : (lightingStyle.isNight ? 0.70 : 0.32);
        overrideRoughness = 0.02;
        overrideMetalness = 0.45;
        overrideColor = '#7dd3fc';
        if (lightingStyle.isNight) {
          overrideEmissive = '#fef08a';
          overrideEmissiveIntensity = 0.85;
        }
      }

      // Window Frames: Architectural dark charcoal aluminum (or heritage wood for vintage)
      if (compType.includes('window_frame')) {
        overrideColor = isVintageOrTraditional ? '#451a03' : '#0f172a';
        overrideRoughness = isVintageOrTraditional ? 0.38 : 0.25;
        overrideMetalness = isVintageOrTraditional ? 0.05 : 0.7;
      }

      // Doors: Authentic Warm Teak Wood
      if (compType === 'door_leaf') {
        overrideColor = isVintageOrTraditional ? '#5c2c16' : '#78350f';
        overrideRoughness = 0.32;
        overrideMetalness = 0.05;
      }
      if (compType.includes('door_frame')) {
        overrideColor = isVintageOrTraditional ? '#3b1802' : '#451a03';
        overrideRoughness = 0.4;
      }

      // -----------------------------------------------------------------------
      // RENDERING STYLE & TECHNICAL PLANS OVERRIDES
      // -----------------------------------------------------------------------
      const currentStyle = renderingStyleRef.current || renderingStyle;
      const currentPlan = technicalPlanRef.current || technicalPlan;

      if (currentPlan === 'electrical') {
        if (isElectrical) {
          overrideColor = '#fef08a';
          overrideEmissive = '#fef08a';
          overrideEmissiveIntensity = 1.6;
          overrideOpacity = 1.0;
          overrideTransparent = false;
        } else if (isWall || compType.includes('slab')) {
          overrideTransparent = true;
          overrideOpacity = 0.16;
          overrideColor = '#1e293b';
        } else if (isFurniture) {
          overrideTransparent = true;
          overrideOpacity = 0.22;
        }
      } else if (currentPlan === 'plumbing') {
        const isPlumbing = compType.includes('pipe') || compType.includes('drain') || compType.includes('basin') || compType.includes('sink') || compType.includes('ewc') || compType.includes('toilet') || compType.includes('vanity') || compType.includes('shower') || compType.includes('tap');
        if (isPlumbing) {
          overrideColor = '#06b6d4';
          overrideEmissive = '#0891b2';
          overrideEmissiveIntensity = 1.2;
          overrideOpacity = 1.0;
          overrideTransparent = false;
        } else if (isWall || compType.includes('slab')) {
          overrideTransparent = true;
          overrideOpacity = 0.16;
          overrideColor = '#1e293b';
        } else if (isFurniture) {
          overrideTransparent = true;
          overrideOpacity = 0.22;
        }
      } else if (currentPlan === 'lighting') {
        const isLight = compType.includes('light_') || compType.includes('chandelier') || compType.includes('lantern') || compType.includes('fan_');
        if (isLight) {
          overrideColor = '#fffbeb';
          overrideEmissive = '#fef08a';
          overrideEmissiveIntensity = 2.0;
          overrideOpacity = 1.0;
          overrideTransparent = false;
        } else if (isWall || compType.includes('slab')) {
          overrideTransparent = true;
          overrideOpacity = 0.35;
          overrideColor = '#334155';
        }
      } else if (currentStyle === 'blueprint') {
        overrideColor = isWall ? '#0284c7' : (isFurniture ? '#0369a1' : '#075985');
        overrideRoughness = 0.5;
        overrideMetalness = 0.1;
      } else if (currentStyle === 'minimalist') {
        overrideColor = isWall ? '#f8fafc' : (isFurniture ? '#e2e8f0' : '#cbd5e1');
        overrideRoughness = 0.8;
      } else if (currentStyle === 'artistic') {
        overrideColor = isWall ? '#fef3c7' : (isFurniture ? '#b45309' : '#fde68a');
        overrideRoughness = 0.9;
      } else if (currentStyle === 'wireframe') {
        overrideWireframe = true;
        overrideColor = '#38bdf8';
        overrideTransparent = true;
        overrideOpacity = 0.85;
      }

      const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(overrideColor),
        roughness: overrideRoughness,
        metalness: overrideMetalness,
        transparent: overrideTransparent,
        opacity: overrideOpacity,
        wireframe: overrideWireframe,
        side: THREE.DoubleSide,
        emissive: new THREE.Color(overrideEmissive),
        emissiveIntensity: overrideEmissiveIntensity,
        bumpMap: usePlasterBump ? getPlasterBumpMap() : null,
        bumpScale: 0.015,
        depthWrite: (!overrideTransparent || overrideOpacity > 0.8) && !cutaway.shouldCutaway
      });

      const threeMesh = new THREE.Mesh(geometry, material);
      threeMesh.castShadow = !overrideTransparent;
      threeMesh.receiveShadow = true;

      // -----------------------------------------------------------------------
      // 3D ARCHITECTURAL DETAILS FOR DOORS & WINDOWS
      // -----------------------------------------------------------------------
      geometry.computeBoundingBox();
      const bbox = geometry.boundingBox;

      if (bbox) {
        const dx = bbox.max.x - bbox.min.x;
        const dy = bbox.max.y - bbox.min.y;
        const dz = bbox.max.z - bbox.min.z;
        const cx = (bbox.min.x + bbox.max.x) / 2;
        const cy = (bbox.min.y + bbox.max.y) / 2;
        const cz = (bbox.min.z + bbox.max.z) / 2;

        // 1. DOOR HARDWARE: Real brass lever handle and escutcheon plate at ergonomic 3ft height
        if (compType === 'door_leaf' && dy > 4) {
          const handleMat = new THREE.MeshStandardMaterial({
            color: '#d97706', // Polished architectural satin brass
            metalness: 0.95,
            roughness: 0.15
          });
          const isAlignedX = dx > dz;
          const handleGeo = new THREE.BoxGeometry(
            isAlignedX ? 0.35 : 0.08,
            0.5,
            isAlignedX ? 0.08 : 0.35
          );
          const handleMesh = new THREE.Mesh(handleGeo, handleMat);
          const handleY = bbox.min.y + Math.min(3.0, dy * 0.45);
          const hx = isAlignedX ? (cx + dx * 0.32) : cx;
          const hz = isAlignedX ? cz : (cz + dz * 0.32);
          handleMesh.position.set(hx, handleY, hz);
          threeMesh.add(handleMesh);
        }

        // 2. WINDOW MULLIONS & PROJECTING SILL: Cross dividers & stone sill shelf
        if ((compType.includes('window_pane') || compType === 'window') && dy > 1.5) {
          const mullionMat = new THREE.MeshStandardMaterial({
            color: '#0f172a',
            roughness: 0.25,
            metalness: 0.7
          });
          const isAlignedX = dx > dz;

          // Horizontal transom divider bar
          const transGeo = new THREE.BoxGeometry(
            isAlignedX ? dx : 0.08,
            0.1,
            isAlignedX ? 0.08 : dz
          );
          const transMesh = new THREE.Mesh(transGeo, mullionMat);
          transMesh.position.set(cx, cy, cz);
          threeMesh.add(transMesh);

          // Vertical mullion divider bar
          const vertGeo = new THREE.BoxGeometry(
            isAlignedX ? 0.1 : 0.08,
            dy,
            isAlignedX ? 0.08 : 0.1
          );
          const vertMesh = new THREE.Mesh(vertGeo, mullionMat);
          vertMesh.position.set(cx, cy, cz);
          threeMesh.add(vertMesh);

          // Projecting architectural stone window sill shelf at bottom
          const sillMat = new THREE.MeshStandardMaterial({
            color: '#e2e8f0', // Crisp stone sill
            roughness: 0.5,
            metalness: 0.05
          });
          const sillGeo = new THREE.BoxGeometry(
            isAlignedX ? dx + 0.4 : 0.35,
            0.12,
            isAlignedX ? 0.35 : dz + 0.4
          );
          const sillMesh = new THREE.Mesh(sillGeo, sillMat);
          sillMesh.position.set(cx, bbox.min.y - 0.06, cz);
          threeMesh.add(sillMesh);
        }
      }

      threeMesh.userData = {
        meshId: mesh.id,
        componentType: compType,
        sourceId: mesh.sourceId,
        metadata: mesh.metadata
      };

      houseGroup.add(threeMesh);
    });

  }, [meshes, design, viewMode, activeFloorFilter, lightingStyle, activeRoom]);

  // Dynamically position camera into room interior when a room is selected
  useEffect(() => {
    if (activeRoom && activeRoom.bounds && cameraRef.current && controlsRef.current) {
      const { x, y, width, length } = activeRoom.bounds;
      const fIdx = activeRoom.floorIndex !== undefined ? Number(activeRoom.floorIndex) : 0;
      const rx = x + width / 2;
      const rz = y + length / 2;
      const ry = fIdx * 10.5 + 1.5;
      const span = Math.max(width, length);

      const interiorDist = Math.max(span * 1.35, 6.5);
      const camX = rx + interiorDist * 0.68;
      const camY = ry + Math.min(Math.max(span * 0.85, 4.5), 8.5);
      const camZ = rz + interiorDist * 0.88;

      controlsRef.current.target.set(rx, ry + 2.0, rz);
      cameraRef.current.position.set(camX, camY, camZ);
      controlsRef.current.minDistance = 1.0;
      controlsRef.current.maxDistance = 60;
      controlsRef.current.update();
    }
  }, [activeRoom]);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        background: backgroundMode === 'isolated_white' 
          ? '#ffffff' 
          : backgroundMode === 'garden' 
            ? 'linear-gradient(180deg, #e0f2fe 0%, #dcfce7 100%)' 
            : backgroundMode === 'seaside' 
              ? 'linear-gradient(180deg, #bae6fd 0%, #fef3c7 100%)' 
              : `linear-gradient(180deg, ${lightingStyle.studioBg} 0%, #cbd5e1 100%)`,
        borderRadius: '16px',
        touchAction: 'none'
      }}
    >
      {/* Three.js Canvas Mount */}
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />

      {/* Floating Clean Room Name Badges (No Dimensions Clutter) */}
      {showRoomLabels && viewMode !== 'complete_home' && hudLabels.map(label => (
        <div
          key={label.id}
          style={{
            position: 'absolute',
            left: `${label.screenX}px`,
            top: `${label.screenY}px`,
            transform: 'translate(-50%, -50%)',
            background: 'rgba(15, 23, 42, 0.88)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(56, 189, 248, 0.45)',
            borderRadius: '20px',
            padding: '3px 10px',
            color: '#ffffff',
            fontSize: '0.68rem',
            fontWeight: 700,
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 14px rgba(0,0,0,0.45)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            zIndex: 15,
            transition: 'left 0.05s linear, top 0.05s linear'
          }}
        >
          <span style={{ color: '#38bdf8', fontSize: '0.65rem' }}>🏷️</span>
          <span>{label.name}</span>
        </div>
      ))}
    </div>
  );
});

export default ThreeJsArchitecturalViewer;
