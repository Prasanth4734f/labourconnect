/**
 * LabourConnect Design Engine - Procedural 3D Geometry Pipeline
 * 
 * Generates exact 3D geometric entities (slabs, extruded walls, openings, stairs, roofs)
 * strictly derived from the canonical design JSON.
 * 
 * Integrates with proceduralBuildingGenerator3d to deliver genuine 3D meshes
 * (vertices, faces, normals, through-wall openings) with backward-compatible API.
 */

import { generateProceduralBuilding3d } from './proceduralBuildingGenerator3d.js';
import { calculateSunPosition, calculateFaceShading } from '../rendering/lightingEngine.js';
import { resolveMaterial } from '../rendering/materialCatalog.js';

/**
 * Builds the complete 3D geometric representation from canonical design JSON
 */
export function buildProcedural3dGeometry(design, options = {}) {
  const { site, floors = [], structuralGrid = {} } = design;
  const env = site?.buildingEnvelope || site?.buildableEnvelope || { x: 3, y: 5, width: 34, length: 51 };

  // 1. Generate full procedural 3D building model (Sprint 3 Enterprise Pipeline)
  let buildingModel3d = null;
  try {
    buildingModel3d = generateProceduralBuilding3d(design, options);
  } catch (err) {
    console.warn('[3dEngine] Procedural building generation encountered issue:', err.message);
  }

  const geometries = {
    buildingModel3d,
    meshes: buildingModel3d?.meshes || [],
    slabs: [],
    walls: [],
    openings: [],
    stairs: [],
    railings: [],
    columns: [],
    rooms3d: [],
    bounds3d: buildingModel3d?.bounds ? {
      min: { x: buildingModel3d.bounds.min[0], y: buildingModel3d.bounds.min[1], z: buildingModel3d.bounds.min[2] },
      max: { x: buildingModel3d.bounds.max[0], y: buildingModel3d.bounds.max[1], z: buildingModel3d.bounds.max[2] }
    } : {
      min: { x: env.x - 2, y: 0, z: env.y - 2 },
      max: {
        x: env.x + env.width + 2,
        y: floors.length * 10.5 + 4,
        z: env.y + env.length + 2
      }
    }
  };

  // 2. Foundation Plinth Platform (Y = 0 to 1.5 ft)
  geometries.slabs.push({
    id: 'slab_plinth',
    type: 'foundation_plinth',
    x: env.x - 0.5,
    z: env.y - 0.5,
    width: env.width + 1.0,
    length: env.length + 1.0,
    elevationY: 0,
    thickness: 1.5,
    material: 'Jet-Black Granite Plinth',
    color: '#1e293b'
  });

  // 3. Iterate Floors to build legacy collections for backward-compatibility
  floors.forEach((fl) => {
    const floorBaseY = fl.elevationZ || (fl.floorIndex * 10.5);
    const wallHeight = fl.floorHeight || 10.0;
    const isTerrace = fl.floorIndex >= 2;

    // Floor Slab (thickness 0.5 ft / 6 inches)
    if (fl.floorIndex > 0) {
      geometries.slabs.push({
        id: `slab_floor_${fl.floorIndex}`,
        type: isTerrace ? 'roof_terrace_slab' : 'intermediate_rcc_slab',
        x: env.x,
        z: env.y,
        width: env.width,
        length: env.length,
        elevationY: floorBaseY,
        thickness: 0.5,
        material: isTerrace ? 'Solar Reflective Tile Screed' : 'RCC M25 Structural Slab',
        color: isTerrace ? '#f8fafc' : '#cbd5e1'
      });
    }

    // Walls for this floor
    (fl.walls || []).forEach((w) => {
      const isExt = w.type === 'exterior';
      const wallH = isTerrace ? 3.5 : wallHeight;
      geometries.walls.push({
        id: `${w.id}_fl${fl.floorIndex}`,
        type: w.type,
        start: { x: w.start.x, y: floorBaseY, z: w.start.y },
        end: { x: w.end.x, y: floorBaseY, z: w.end.y },
        thickness: w.thickness || (isExt ? 0.75 : 0.375),
        height: wallH,
        elevationY: floorBaseY,
        material: isExt ? 'Travertine Stone & Acrylic Sponge Plaster' : 'Gypsum Plaster & Primer',
        color: isExt ? '#e2e8f0' : '#f1f5f9'
      });
    });

    // Room 3D Volumes & Openings
    (fl.rooms || []).forEach((rm) => {
      const b = rm.bounds;
      if (!b) return;

      geometries.rooms3d.push({
        id: `${rm.id}_3d`,
        name: rm.name,
        type: rm.type,
        floorIndex: fl.floorIndex,
        box: {
          minX: b.x,
          maxX: b.x + b.width,
          minY: floorBaseY,
          maxY: floorBaseY + wallHeight,
          minZ: b.y,
          maxZ: b.y + b.length
        },
        centroid: {
          x: Number((b.x + b.width / 2).toFixed(2)),
          y: Number((floorBaseY + wallHeight / 2).toFixed(2)),
          z: Number((b.y + b.length / 2).toFixed(2))
        },
        floorMaterial: rm.finish,
        wallMaterial: rm.type.includes('bath') ? 'Glazed Ceramic Tiles' : 'Warm Off-White Emulsion'
      });

      // Doors
      (rm.doors || []).forEach((d, dIdx) => {
        geometries.openings.push({
          id: `door_${rm.id}_${dIdx}`,
          type: 'door',
          roomRef: rm.id,
          position: { x: d.x, y: floorBaseY, z: d.y },
          width: d.width || 3.0,
          height: 7.0,
          wall: d.wall,
          material: 'Solid Teak Veneer Door'
        });
      });

      // Windows
      (rm.windows || []).forEach((w, wIdx) => {
        geometries.openings.push({
          id: `win_${rm.id}_${wIdx}`,
          type: 'window',
          roomRef: rm.id,
          position: { x: w.x, y: floorBaseY + 2.5, z: w.y },
          width: w.width || 4.0,
          height: 4.5,
          wall: w.wall,
          material: 'UPVC Tinted Acoustic Glass'
        });
      });

      // Balcony Railing
      if (rm.type === 'balcony') {
        geometries.railings.push({
          id: `railing_${rm.id}`,
          position: { x: b.x, y: floorBaseY, z: b.y },
          width: b.width,
          height: 3.5,
          material: 'Toughened Laminated Glass with SS 316 Spigots'
        });
      }
    });
  });

  // 4. 3D Staircase (Ground to First floor)
  const stairRoom = floors[0]?.rooms?.find(r => r.type === 'stairwell');
  if (stairRoom && stairRoom.bounds && floors.length >= 2) {
    const sb = stairRoom.bounds;
    const numTreads = 18;
    const riserHeight = 10.5 / numTreads;
    const treadDepth = (sb.length * 0.8) / (numTreads / 2);

    for (let step = 0; step < numTreads; step++) {
      const isFirstFlight = step < numTreads / 2;
      const stepIndexInFlight = isFirstFlight ? step : (step - numTreads / 2);
      const stepX = isFirstFlight ? sb.x : sb.x + sb.width / 2;
      const stepZ = isFirstFlight 
        ? sb.y + stepIndexInFlight * treadDepth 
        : (sb.y + sb.length * 0.8) - stepIndexInFlight * treadDepth;

      geometries.stairs.push({
        stepNumber: step + 1,
        elevationY: Number((step * riserHeight).toFixed(2)),
        riserHeight: Number(riserHeight.toFixed(2)),
        treadDepth: Number(treadDepth.toFixed(2)),
        width: sb.width / 2,
        position: { x: Number(stepX.toFixed(2)), y: Number((step * riserHeight).toFixed(2)), z: Number(stepZ.toFixed(2)) },
        material: 'Granite Treads with Anti-Slip Grooves'
      });
    }
  }

  // 5. Structural Columns
  (structuralGrid?.columns || []).forEach((col) => {
    geometries.columns.push({
      id: `${col.id}_3d`,
      position: { x: col.x, y: 0, z: col.y },
      width: col.width,
      length: col.length,
      height: floors.length * 10.5,
      spec: col.spec
    });
  });

  return geometries;
}

/**
 * Projects 3D geometric entities into a 2D camera viewport (Isometric / Perspective 3D)
 * for immediate interactive canvas or SVG rendering.
 * 
 * Supports genuine 3D solid meshes with backface culling, directional shading,
 * and painter's depth sorting.
 */
export function project3dToViewport(geometries, camera = {}) {
  // Graceful empty / invalid geometry check
  if (!geometries) {
    return {
      projectedPolygons: [],
      faces: [],
      bounds3d: null,
      lighting: null,
      viewMode: camera.viewMode || 'exterior',
      scale: 1,
      framing: null,
      isEmpty: true
    };
  }

  const yawAngle = camera.azimuth !== undefined ? camera.azimuth : (camera.yaw !== undefined ? camera.yaw : 35);
  const pitchAngle = camera.elevation !== undefined ? camera.elevation : (camera.pitch !== undefined ? camera.pitch : 25);
  const yaw = yawAngle * (Math.PI / 180);
  const pitch = pitchAngle * (Math.PI / 180);
  const zoom = Number.isFinite(camera.zoom) && camera.zoom > 0 ? camera.zoom : 1.0;
  const panX = camera.panX || 0;
  const panY = camera.panY || 0;
  const vpWidth = camera.viewportWidth || camera.width || 680;
  const vpHeight = camera.viewportHeight || camera.height || 560;
  const selectedFloorIndex = camera.selectedFloorIndex !== undefined 
    ? camera.selectedFloorIndex 
    : (camera.isolatedFloor !== undefined ? camera.isolatedFloor : (camera.floorIndex !== undefined ? camera.floorIndex : null));

  // Presentation Mode: 'exterior' | 'dollhouse' | 'all'
  const rawViewMode = (camera.viewMode || camera.presentationMode || 'exterior').toLowerCase();
  const viewMode = rawViewMode.includes('dollhouse') ? 'dollhouse' : (rawViewMode.includes('all') ? 'all' : 'exterior');

  // Projection mode: 'orthographic' vs 'perspective'
  const projection = camera.projection || (camera.isOrthographic || camera.orthographic ? 'orthographic' : 'perspective');
  const isOrthographic = projection === 'orthographic';

  // Solar Lighting Simulation Configuration (diurnal solar path)
  const solarTime = camera.solarTime !== undefined ? camera.solarTime : 14.0;
  const facing = camera.facing || geometries?.buildingModel3d?.facing || 'East';
  const lightingConfig = camera.lightingConfig || calculateSunPosition(solarTime, facing);

  const cosY = Math.cos(yaw);
  const sinY = Math.sin(yaw);
  const cosP = Math.cos(pitch);
  const sinP = Math.sin(pitch);

  // Compute actual model bounds from geometries or input meshes
  let bounds = geometries.bounds3d || geometries.buildingModel3d?.bounds;
  const inputMeshList = Array.isArray(geometries) 
    ? geometries 
    : (geometries?.buildingModel3d?.meshes || geometries?.meshes || null);

  if (!bounds && Array.isArray(inputMeshList) && inputMeshList.length > 0) {
    let bMinX = Infinity, bMinY = Infinity, bMinZ = Infinity;
    let bMaxX = -Infinity, bMaxY = -Infinity, bMaxZ = -Infinity;
    inputMeshList.forEach(m => {
      const b = m.bounds;
      if (b) {
        const min = Array.isArray(b.min) ? b.min : [b.min?.x, b.min?.y, b.min?.z];
        const max = Array.isArray(b.max) ? b.max : [b.max?.x, b.max?.y, b.max?.z];
        if (Number.isFinite(min[0]) && min[0] < bMinX) bMinX = min[0];
        if (Number.isFinite(min[1]) && min[1] < bMinY) bMinY = min[1];
        if (Number.isFinite(min[2]) && min[2] < bMinZ) bMinZ = min[2];
        if (Number.isFinite(max[0]) && max[0] > bMaxX) bMaxX = max[0];
        if (Number.isFinite(max[1]) && max[1] > bMaxY) bMaxY = max[1];
        if (Number.isFinite(max[2]) && max[2] > bMaxZ) bMaxZ = max[2];
      }
    });
    if (Number.isFinite(bMinX)) {
      bounds = { min: [bMinX, bMinY, bMinZ], max: [bMaxX, bMaxY, bMaxZ] };
    }
  }

  bounds = bounds || {
    min: { x: 0, y: 0, z: 0 },
    max: { x: 30, y: 25, z: 40 }
  };
  const minX = Array.isArray(bounds.min) ? bounds.min[0] : (bounds.min?.x ?? 0);
  const minY = Array.isArray(bounds.min) ? bounds.min[1] : (bounds.min?.y ?? 0);
  const minZ = Array.isArray(bounds.min) ? bounds.min[2] : (bounds.min?.z ?? 0);
  const maxX = Array.isArray(bounds.max) ? bounds.max[0] : (bounds.max?.x ?? 30);
  const maxY = Array.isArray(bounds.max) ? bounds.max[1] : (bounds.max?.y ?? 25);
  const maxZ = Array.isArray(bounds.max) ? bounds.max[2] : (bounds.max?.z ?? 40);

  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  const centerZ = (minZ + maxZ) / 2;

  const fov = 750;

  // 1. Calculate dynamic viewport framing bounds across 8 bounding box corners
  const bboxCorners = [
    [minX, minY, minZ], [maxX, minY, minZ],
    [minX, maxY, minZ], [maxX, maxY, minZ],
    [minX, minY, maxZ], [maxX, minY, maxZ],
    [minX, maxY, maxZ], [maxX, maxY, maxZ]
  ];

  let minPx = Infinity, maxPx = -Infinity, minPy = Infinity, maxPy = -Infinity;
  bboxCorners.forEach(([bx, by, bz]) => {
    const brx = bx - centerX;
    const bry = by - centerY;
    const brz = bz - centerZ;

    const bx1 = brx * cosY - brz * sinY;
    const bz1 = brx * sinY + brz * cosY;

    // Derived camera pitch transformation: elevated camera looking down from above
    const by2 = bry * cosP + bz1 * sinP;
    const bz2 = -bry * sinP + bz1 * cosP;

    // In orthographic projection, rays are parallel (bp = 1.0)
    const bp = isOrthographic ? 1.0 : (fov / Math.max(10, fov + bz2));
    const bpx = bx1 * bp;
    const bpy = -by2 * bp;

    if (bpx < minPx) minPx = bpx;
    if (bpx > maxPx) maxPx = bpx;
    if (bpy < minPy) minPy = bpy;
    if (bpy > maxPy) maxPy = bpy;
  });

  const spanX = Math.max(0.1, maxPx - minPx);
  const spanY = Math.max(0.1, maxPy - minPy);
  const midPx = (minPx + maxPx) / 2;
  const midPy = (minPy + maxPy) / 2;

  // Viewport padding (configurable, default 40px)
  const padding = typeof camera.padding === 'number' ? camera.padding : 40;
  const availW = Math.max(80, vpWidth - padding * 2);
  const availH = Math.max(80, vpHeight - padding * 2);
  const autoScale = Math.min(availW / spanX, availH / spanY);
  const effectiveScale = (Number.isFinite(autoScale) && autoScale > 0 ? autoScale : 10.0) * zoom;

  // Dynamic viewport centering
  const cx = (vpWidth / 2) + panX - midPx * effectiveScale;
  const cy = (vpHeight / 2) + panY - midPy * effectiveScale;

  const projectPoint = (x, y, z) => {
    const rx = x - centerX;
    const ry = y - centerY;
    const rz = z - centerZ;

    // Rotate yaw around Y axis
    const x1 = rx * cosY - rz * sinY;
    const z1 = rx * sinY + rz * cosY;

    // Derived camera pitch transformation: elevated camera looking down from above
    const y2 = ry * cosP + z1 * sinP;
    const z2 = -ry * sinP + z1 * cosP;

    // Perspective foreshortening: p = 1.0 for true orthographic
    const p = isOrthographic ? 1.0 : (fov / Math.max(10, fov + z2));

    return {
      x: cx + x1 * p * effectiveScale,
      y: cy - y2 * p * effectiveScale,
      depth: z2
    };
  };

  const projectedPolygons = [];
  const inputMeshes = Array.isArray(geometries)
    ? geometries
    : (geometries?.buildingModel3d?.meshes || geometries?.meshes || null);

  // Branch A: Project Genuine 3D Meshes from procedural building generator
  if (Array.isArray(inputMeshes) && inputMeshes.length > 0) {
    const meshes = inputMeshes;

    meshes.forEach((mesh) => {
      // Optional floor filtering (Floor-Isolation View)
      if (selectedFloorIndex !== undefined && selectedFloorIndex !== null && mesh.floorIndex !== selectedFloorIndex) {
        return;
      }

      // Presentation Mode filtering:
      // In 'exterior' mode, prevent interior partitions, columns, and interior stairs from cluttering exterior facade
      const isInterior = mesh.wallType === 'wall_interior' ||
        mesh.metadata?.wallType === 'wall_interior' ||
        mesh.componentType === 'stair_tread' ||
        mesh.componentType === 'stair_landing' ||
        mesh.componentType === 'column' ||
        mesh.isFurniture === true ||
        mesh.componentType === 'furniture' ||
        ((mesh.componentType === 'door_leaf' || mesh.componentType === 'door_frame') && mesh.metadata?.isExterior === false);

      const isRoofFeature = mesh.componentType === 'sloping_roof' ||
        mesh.componentType === 'ridge_cap' ||
        (typeof mesh.componentType === 'string' && mesh.componentType.startsWith('pergola_')) ||
        mesh.componentType === 'parapet_pier' ||
        mesh.componentType === 'parapet' ||
        mesh.componentType === 'roof_terrace_slab' ||
        mesh.type === 'roof_terrace_slab' ||
        (typeof mesh.id === 'string' && (mesh.id.includes('roof') || mesh.id.includes('parapet')));

      if (viewMode === 'exterior' && selectedFloorIndex === null) {
        if (isInterior) return;
      } else if (viewMode === 'dollhouse') {
        // Cutaway dollhouse view: reveal interior rooms with roof off
        if (isRoofFeature) return;
      }

      const verts = mesh.vertices || [];
      const faces = mesh.faces || [];
      const projectedVerts = verts.map(v => projectPoint(v[0], v[1], v[2]));

      faces.forEach((face, fIdx) => {
        const idxs = face.indices;
        if (!idxs || idxs.length < 3) return;

        const pts = idxs.map(i => projectedVerts[i]).filter(Boolean);
        if (pts.length < 3) return;

        // Depth is average depth of face vertices
        const avgDepth = pts.reduce((sum, p) => sum + p.depth, 0) / pts.length;

        // 2D Normal test for backface culling (cross-product in screen space)
        const v0 = pts[0];
        const v1 = pts[1];
        const v2 = pts[2];
        const cross = (v1.x - v0.x) * (v2.y - v0.y) - (v1.y - v0.y) * (v2.x - v0.x);

        // Discard back-facing polygons for closed solids
        if (cross < 0) return;

        // Face Normal & Shading Calculation
        const normal = face.normal || [0, 1, 0];
        const faceMat = mesh.materialDef || resolveMaterial(mesh.materialId || mesh.componentType, {
          baseColor: mesh.color,
          opacity: mesh.opacity,
          roughness: mesh.roughness,
          metalness: mesh.metalness,
          strokeColor: mesh.strokeColor,
          strokeWidth: mesh.strokeWidth
        });

        const shading = calculateFaceShading(normal, faceMat, lightingConfig, {
          viewVector: [sinY * cosP, Math.sin(pitch), -cosY * cosP]
        });

        let fillColor = shading.shadedColor || mesh.color || '#cbd5e1';
        let strokeColor = mesh.strokeColor || faceMat.strokeColor || '#334155';
        let strokeWidth = mesh.strokeWidth || faceMat.strokeWidth || 0.6;
        let opacity = mesh.opacity !== undefined ? mesh.opacity : (faceMat.opacity !== undefined ? faceMat.opacity : 1.0);

        // Special component handling
        if (mesh.componentType === 'window_pane') {
          // Semi-transparent acoustic glass with high specular brilliance
          opacity = Math.max(0.35, Math.min(0.65, faceMat.opacity || 0.50));
        }

        projectedPolygons.push({
          id: `${mesh.id}_f${fIdx}`,
          type: mesh.componentType || mesh.type,
          componentType: mesh.componentType,
          floorIndex: mesh.floorIndex,
          points: pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' '),
          color: fillColor,
          baseColor: faceMat.baseColor,
          shadedColor: shading.shadedColor,
          stroke: strokeColor,
          strokeWidth,
          opacity,
          depth: avgDepth,
          shadeFactor: shading.shadingFactor,
          materialId: faceMat.id,
          isUpward: shading.isUpward,
          isDownward: shading.isDownward,
          isVertical: shading.isVertical,
          mesh,
          isLandscape: mesh.isLandscape === true,
          isFurniture: mesh.isFurniture === true
        });
      });
    });
  } else if (geometries?.slabs || geometries?.walls) {
    // Branch B: Fallback to basic slabs and walls projection
    (geometries.slabs || []).forEach(s => {
      const p1 = projectPoint(s.x, s.elevationY, s.z);
      const p2 = projectPoint(s.x + s.width, s.elevationY, s.z);
      const p3 = projectPoint(s.x + s.width, s.elevationY, s.z + s.length);
      const p4 = projectPoint(s.x, s.elevationY, s.z + s.length);
      const avgDepth = (p1.depth + p2.depth + p3.depth + p4.depth) / 4;

      projectedPolygons.push({
        id: s.id,
        type: 'slab',
        points: `${p1.x.toFixed(1)},${p1.y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)} ${p3.x.toFixed(1)},${p3.y.toFixed(1)} ${p4.x.toFixed(1)},${p4.y.toFixed(1)}`,
        color: s.color || '#cbd5e1',
        baseColor: s.color || '#cbd5e1',
        shadedColor: s.color || '#cbd5e1',
        stroke: '#334155',
        strokeWidth: 1.0,
        opacity: 1.0,
        depth: avgDepth,
        shadeFactor: 1.0
      });
    });

    (geometries.walls || []).forEach(w => {
      const p1 = projectPoint(w.start.x, w.elevationY, w.start.z);
      const p2 = projectPoint(w.end.x, w.elevationY, w.end.z);
      const p3 = projectPoint(w.end.x, w.elevationY + w.height, w.end.z);
      const p4 = projectPoint(w.start.x, w.elevationY + w.height, w.start.z);
      const avgDepth = (p1.depth + p2.depth + p3.depth + p4.depth) / 4;

      projectedPolygons.push({
        id: w.id,
        type: 'wall',
        points: `${p1.x.toFixed(1)},${p1.y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)} ${p3.x.toFixed(1)},${p3.y.toFixed(1)} ${p4.x.toFixed(1)},${p4.y.toFixed(1)}`,
        color: w.color || '#e2e8f0',
        baseColor: w.color || '#e2e8f0',
        shadedColor: w.color || '#e2e8f0',
        stroke: w.type === 'exterior' ? '#94a3b8' : '#cbd5e1',
        strokeWidth: w.type === 'exterior' ? 1.5 : 0.8,
        opacity: 1.0,
        depth: avgDepth,
        shadeFactor: 1.0
      });
    });
  }

  // Painter's algorithm: sort back-to-front by camera depth with deterministic tie-breaker
  projectedPolygons.sort((a, b) => {
    const depthDiff = b.depth - a.depth;
    if (Math.abs(depthDiff) > 1e-6) return depthDiff;
    return a.id.localeCompare(b.id);
  });

  return {
    projectedPolygons,
    faces: projectedPolygons,
    bounds3d: geometries?.bounds3d || geometries?.buildingModel3d?.bounds,
    lighting: lightingConfig,
    viewMode,
    projection,
    elevationSide: camera.elevationSide || null,
    scale: effectiveScale,
    framing: {
      spanX,
      spanY,
      midPx,
      midPy,
      baseScale: autoScale,
      effectiveScale
    }
  };
}

/**
 * Standard elevation view presets for true orthographic views
 */
export const ELEVATION_PRESETS = {
  front: { yaw: 0, pitch: 0, projection: 'orthographic', viewMode: 'exterior', label: 'Front Elevation (0°)' },
  rear: { yaw: 180, pitch: 0, projection: 'orthographic', viewMode: 'exterior', label: 'Rear Elevation (180°)' },
  left: { yaw: 90, pitch: 0, projection: 'orthographic', viewMode: 'exterior', label: 'Left Elevation (90°)' },
  right: { yaw: -90, pitch: 0, projection: 'orthographic', viewMode: 'exterior', label: 'Right Elevation (-90° / 270°)' },
  top_down: { yaw: 0, pitch: 89.99, projection: 'orthographic', viewMode: 'dollhouse', label: 'Top-Down Cutaway Plan' },
  cutaway_plan: { yaw: 0, pitch: 89.99, projection: 'orthographic', viewMode: 'dollhouse', label: 'Top-Down Cutaway Plan' },
  iso: { yaw: 35, pitch: 25, projection: 'perspective', viewMode: 'exterior', label: 'Isometric 3D Orbit' },
  dollhouse: { yaw: 35, pitch: 45, projection: 'perspective', viewMode: 'dollhouse', label: '3D Cutaway Dollhouse' }
};

/**
 * Projects a genuine orthographic elevation (Front, Rear, Left, Right)
 * from the actual 3D building geometry.
 * 
 * @param {Object} geometries - Geometry model produced by buildProcedural3dGeometry
 * @param {'front'|'rear'|'left'|'right'} side - Elevation side name
 * @param {Object} options - Viewport options (viewportWidth, viewportHeight, padding, zoom, etc.)
 * @returns {Object} Projected orthographic elevation scene
 */
export function projectOrthographicElevation(geometries, side = 'front', options = {}) {
  const normSide = String(side || 'front').toLowerCase().replace(/_elevation|-elevation/, '');
  const preset = ELEVATION_PRESETS[normSide] || ELEVATION_PRESETS.front;
  
  return project3dToViewport(geometries, {
    ...options,
    yaw: preset.yaw,
    pitch: preset.pitch,
    projection: 'orthographic',
    viewMode: options.viewMode || preset.viewMode || 'exterior',
    elevationSide: normSide
  });
}

/**
 * Projects a true top-down orthographic cutaway plan aligned with the 2D CAD layout.
 * 
 * @param {Object} geometries - Geometry model produced by buildProcedural3dGeometry
 * @param {Object} options - Viewport options (selectedFloorIndex, viewportWidth, viewportHeight, etc.)
 * @returns {Object} Projected top-down cutaway scene
 */
export function projectTopDownCutaway(geometries, options = {}) {
  return project3dToViewport(geometries, {
    ...options,
    yaw: 0,
    pitch: 89.99,
    projection: 'orthographic',
    viewMode: 'dollhouse'
  });
}
