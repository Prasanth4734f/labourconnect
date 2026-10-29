/**
 * LabourConnect Design Engine - Procedural 3D Building Generator (Sprint 3, Task S3-T02)
 * 
 * Generates an enterprise-grade, fully inspectable, deterministic 3D architectural
 * building model directly from the Canonical Design Model (v2.0.0).
 * 
 * Archi tectural Features:
 * - 100% Genuine 3D Geometry: vertices [x, y, z], indexed quad/triangle faces, normals, bounds.
 * - Right-Handed World Coordinates: World X (Width), World Y (Elevation Up), World Z (Depth).
 * - Real Wall Thickness & Subtraction: Walls are extruded solids segmented around openings;
 *   door and window cutouts are true through-wall voids with physical jamb reveals.
 * - Component Insertion: Door frames, door leaves, window frames, and glass panes inside voids.
 * - Multi-Floor Stacking: Plinth, clear ceiling, RCC slabs, and stairwell void shafts.
 * - 3D Staircases: Individual treads, risers, and mid-landing platforms.
 * - Balconies & Railings: Cantilever slabs, vertical baluster posts, and top handrails.
 * - Structural Columns: RCC column pillars from foundation to roof.
 * - Parapet Walls: Rooftop perimeter enclosure.
 * - Strict Provenance: Distinguishes EXPLICIT canonical data from ASSUMED_DEFAULT visualization parameters.
 * - Diagnostics & Validation: Emits structured diagnostics and validates finite bounds.
 */

import {
  COORDINATE_SYSTEM_CONTRACT,
  ARCHITECTURAL_DEFAULTS_3D,
  calculateFloorElevations,
  feetToMeters
} from './geometryFoundation3d.js';
import {
  getMaterialForComponent,
  resolveMaterial
} from '../rendering/materialCatalog.js';
import {
  generateDesignFurniture
} from '../interior/proceduralFurnitureGenerator.js';
import {
  generatePropertyLandscape
} from '../landscape/proceduralLandscapeGenerator.js';
import {
  generatePropertyElectrical
} from '../electrical/proceduralElectricalGenerator.js';

// =============================================================================
// 1. SOLID 3D MESH BUILDERS & PRIMITIVES
// =============================================================================

/**
 * Creates an axis-aligned 3D solid cuboid (hexahedron) with 8 vertices, 6 faces, and outward normals.
 * 
 * @param {string} id - Component identifier
 * @param {string} type - Component classification (e.g. 'slab', 'wall_block', 'column')
 * @param {Object} bounds - Bounding box { minX, minY, minZ, maxX, maxY, maxZ }
 * @param {Object} metadata - Contextual metadata (materials, sourceIds, provenance)
 * @returns {Object} 3D Solid Mesh Entity
 */
export function createSolidBoxMesh(id, type, bounds, metadata = {}) {
  const { minX, minY, minZ, maxX, maxY, maxZ } = bounds;

  const width = Math.max(0, maxX - minX);
  const height = Math.max(0, maxY - minY);
  const depth = Math.max(0, maxZ - minZ);

  // 8 Vertices
  const vertices = [
    [minX, minY, minZ], // 0: Bottom-Left-Front (-Z)
    [maxX, minY, minZ], // 1: Bottom-Right-Front (-Z)
    [maxX, maxY, minZ], // 2: Top-Right-Front (-Z)
    [minX, maxY, minZ], // 3: Top-Left-Front (-Z)
    [minX, minY, maxZ], // 4: Bottom-Left-Back (+Z)
    [maxX, minY, maxZ], // 5: Bottom-Right-Back (+Z)
    [maxX, maxY, maxZ], // 6: Top-Right-Back (+Z)
    [minX, maxY, maxZ]  // 7: Top-Left-Back (+Z)
  ];

  // 6 Quad Faces with counter-clockwise outward winding and normals
  const faces = [
    // Front Face (pointing -Z in plan)
    { indices: [0, 3, 2, 1], normal: [0, 0, -1], name: 'front' },
    // Back Face (pointing +Z in plan)
    { indices: [5, 6, 7, 4], normal: [0, 0, 1], name: 'back' },
    // Left Face (pointing -X in plan)
    { indices: [4, 7, 3, 0], normal: [-1, 0, 0], name: 'left' },
    // Right Face (pointing +X in plan)
    { indices: [1, 2, 6, 5], normal: [1, 0, 0], name: 'right' },
    // Bottom Face (pointing -Y down)
    { indices: [4, 0, 1, 5], normal: [0, -1, 0], name: 'bottom' },
    // Top Face (pointing +Y up)
    { indices: [3, 7, 6, 2], normal: [0, 1, 0], name: 'top' }
  ];

  return {
    id,
    type,
    componentType: metadata.componentType || type,
    sourceId: metadata.sourceId || null,
    sourceType: metadata.sourceType || null,
    floorIndex: metadata.floorIndex !== undefined ? metadata.floorIndex : 0,
    dimensions: {
      width: Number(width.toFixed(3)),
      height: Number(height.toFixed(3)),
      depth: Number(depth.toFixed(3)),
      units: 'feet'
    },
    bounds: {
      min: [minX, minY, minZ],
      max: [maxX, maxY, maxZ]
    },
    centroid: [
      Number(((minX + maxX) / 2).toFixed(3)),
      Number(((minY + maxY) / 2).toFixed(3)),
      Number(((minZ + maxZ) / 2).toFixed(3))
    ],
    vertices,
    faces,
    material: metadata.material || 'Standard Masonry & Plaster',
    materialId: metadata.materialId || null,
    materialDef: metadata.materialDef || null,
    color: metadata.color || '#e2e8f0',
    opacity: metadata.opacity !== undefined ? metadata.opacity : 1.0,
    wireframe: Boolean(metadata.wireframe),
    roughness: metadata.roughness !== undefined ? metadata.roughness : 0.75,
    metalness: metadata.metalness !== undefined ? metadata.metalness : 0.05,
    strokeColor: metadata.strokeColor || null,
    strokeWidth: metadata.strokeWidth || null,
    surfaceTexture: metadata.surfaceTexture || null,
    provenance: metadata.provenance || 'EXPLICIT',
    metadata: metadata || {}
  };
}

/**
 * Creates an oriented 3D wall prism from 2D plan endpoints, thickness, and vertical heights.
 * 
 * @param {string} id - Component identifier
 * @param {string} type - 'wall_solid' | 'wall_header' | 'wall_apron' | 'wall_jamb'
 * @param {Object} startPlan - Plan start point { x, y }
 * @param {Object} endPlan - Plan end point { x, y }
 * @param {number} thickness - Wall thickness in feet
 * @param {number} baseElevationY - Bottom elevation in world feet
 * @param {number} height - Vertical height in feet
 * @param {Object} metadata - Additional metadata
 * @returns {Object} 3D Mesh Entity
 */
export function createOrientedWallPrism(id, type, startPlan, endPlan, thickness, baseElevationY, height, metadata = {}) {
  const dx = endPlan.x - startPlan.x;
  const dz = endPlan.y - startPlan.y; // Plan Y maps to World Z
  const len = Math.hypot(dx, dz);

  if (len < 0.001) {
    // Degenerate segment fallback
    return createSolidBoxMesh(id, type, {
      minX: startPlan.x - thickness / 2,
      minY: baseElevationY,
      minZ: startPlan.y - thickness / 2,
      maxX: startPlan.x + thickness / 2,
      maxY: baseElevationY + height,
      maxZ: startPlan.y + thickness / 2
    }, metadata);
  }

  // Normal perpendicular vector in X-Z plane
  const ux = dx / len;
  const uz = dz / len;
  const nx = -uz;
  const nz = ux;

  const halfT = thickness / 2;
  const h = typeof height === 'number' && isFinite(height) && height > 0 ? height : ARCHITECTURAL_DEFAULTS_3D.CLEAR_CEILING_HEIGHT;

  // 4 footprint points in X-Z world space
  // P0: Start - Normal
  const p0 = [startPlan.x - halfT * nx, startPlan.y - halfT * nz];
  // P1: End - Normal
  const p1 = [endPlan.x - halfT * nx, endPlan.y - halfT * nz];
  // P2: End + Normal
  const p2 = [endPlan.x + halfT * nx, endPlan.y + halfT * nz];
  // P3: Start + Normal
  const p3 = [startPlan.x + halfT * nx, startPlan.y + halfT * nz];

  const y0 = typeof baseElevationY === 'number' && isFinite(baseElevationY) ? baseElevationY : 0;
  const y1 = y0 + h;

  // 8 Vertices
  const vertices = [
    [p0[0], y0, p0[1]], // 0: Bottom Start-Left
    [p1[0], y0, p1[1]], // 1: Bottom End-Left
    [p2[0], y0, p2[1]], // 2: Bottom End-Right
    [p3[0], y0, p3[1]], // 3: Bottom Start-Right
    [p0[0], y1, p0[1]], // 4: Top Start-Left
    [p1[0], y1, p1[1]], // 5: Top End-Left
    [p2[0], y1, p2[1]], // 6: Top End-Right
    [p3[0], y1, p3[1]]  // 7: Top Start-Right
  ];

  // 6 Faces
  const faces = [
    // Outer side (-Normal)
    { indices: [0, 4, 5, 1], normal: [-nx, 0, -nz], name: 'side_exterior' },
    // Inner side (+Normal)
    { indices: [2, 6, 7, 3], normal: [nx, 0, nz], name: 'side_interior' },
    // Start end cap (-Tangent)
    { indices: [3, 7, 4, 0], normal: [-ux, 0, -uz], name: 'start_cap' },
    // End end cap (+Tangent)
    { indices: [1, 5, 6, 2], normal: [ux, 0, uz], name: 'end_cap' },
    // Bottom
    { indices: [3, 0, 1, 2], normal: [0, -1, 0], name: 'bottom' },
    // Top
    { indices: [4, 7, 6, 5], normal: [0, 1, 0], name: 'top' }
  ];

  const minX = Math.min(p0[0], p1[0], p2[0], p3[0]);
  const maxX = Math.max(p0[0], p1[0], p2[0], p3[0]);
  const minZ = Math.min(p0[1], p1[1], p2[1], p3[1]);
  const maxZ = Math.max(p0[1], p1[1], p2[1], p3[1]);

  return {
    id,
    type,
    componentType: metadata.componentType || 'wall',
    sourceId: metadata.sourceId || null,
    sourceType: metadata.sourceType || 'wall',
    floorIndex: metadata.floorIndex !== undefined ? metadata.floorIndex : 0,
    dimensions: {
      length: Number(len.toFixed(3)),
      thickness: Number(thickness.toFixed(3)),
      height: Number(h.toFixed(3)),
      units: 'feet'
    },
    bounds: {
      min: [minX, y0, minZ],
      max: [maxX, y1, maxZ]
    },
    centroid: [
      Number(((startPlan.x + endPlan.x) / 2).toFixed(3)),
      Number(((y0 + y1) / 2).toFixed(3)),
      Number(((startPlan.y + endPlan.y) / 2).toFixed(3))
    ],
    vertices,
    faces,
    material: metadata.material || 'Exterior Masonry & Sponge Plaster',
    materialId: metadata.materialId || null,
    materialDef: metadata.materialDef || null,
    color: metadata.color || '#e2e8f0',
    opacity: metadata.opacity !== undefined ? metadata.opacity : 1.0,
    roughness: metadata.roughness !== undefined ? metadata.roughness : 0.75,
    metalness: metadata.metalness !== undefined ? metadata.metalness : 0.05,
    strokeColor: metadata.strokeColor || null,
    strokeWidth: metadata.strokeWidth || null,
    surfaceTexture: metadata.surfaceTexture || null,
    provenance: metadata.provenance || 'EXPLICIT',
    metadata: metadata || {}
  };
}

/**
 * Creates a genuine inclined sloping 3D roof pitch mesh with thickness, eaves fascia,
 * and sloped outward normal vector.
 */
export function createPitchedRoofPitchMesh(id, componentType, params, metadata = {}) {
  const { minX, maxX, eavesZ, ridgeZ, eavesY, ridgeY, thickness = 0.4 } = params;

  const dy = ridgeY - eavesY;
  const dz = ridgeZ - eavesZ;
  const slopeLen = Math.max(0.01, Math.hypot(dy, dz));
  const ty = dy / slopeLen;
  const tz = dz / slopeLen;

  // Normal pointing outward/upward:
  // If tz > 0 (sloping towards +Z), normal is [0, tz, -ty]
  // If tz < 0 (sloping towards -Z), normal is [0, -tz, ty]
  const ny = Math.abs(tz);
  const nz = tz > 0 ? -Math.abs(ty) : Math.abs(ty);

  // 8 vertices: bottom plane (0..3) and top plane (4..7)
  const v0 = [minX, eavesY, eavesZ];
  const v1 = [maxX, eavesY, eavesZ];
  const v2 = [maxX, ridgeY, ridgeZ];
  const v3 = [minX, ridgeY, ridgeZ];

  const v4 = [minX, eavesY + thickness * ny, eavesZ + thickness * nz];
  const v5 = [maxX, eavesY + thickness * ny, eavesZ + thickness * nz];
  const v6 = [maxX, ridgeY + thickness * ny, ridgeZ + thickness * nz];
  const v7 = [minX, ridgeY + thickness * ny, ridgeZ + thickness * nz];

  const vertices = [v0, v1, v2, v3, v4, v5, v6, v7];

  // Quad faces
  const faces = [
    { indices: [4, 7, 6, 5], normal: [0, ny, nz], name: 'top_slope' },
    { indices: [0, 1, 2, 3], normal: [0, -ny, -nz], name: 'bottom_underside' },
    { indices: [0, 4, 5, 1], normal: [0, -ty, -tz], name: 'eaves_fascia' },
    { indices: [3, 2, 6, 7], normal: [0, ty, tz], name: 'ridge_edge' },
    { indices: [0, 3, 7, 4], normal: [-1, 0, 0], name: 'gable_west' },
    { indices: [1, 5, 6, 2], normal: [1, 0, 0], name: 'gable_east' }
  ];

  const xs = vertices.map(v => v[0]);
  const ys = vertices.map(v => v[1]);
  const zs = vertices.map(v => v[2]);

  return {
    id,
    type: componentType,
    componentType: metadata.componentType || componentType,
    floorIndex: metadata.floorIndex !== undefined ? metadata.floorIndex : 2,
    dimensions: {
      width: Number((maxX - minX).toFixed(3)),
      height: Number(dy.toFixed(3)),
      depth: Number(Math.abs(dz).toFixed(3)),
      units: 'feet'
    },
    bounds: {
      min: [Math.min(...xs), Math.min(...ys), Math.min(...zs)],
      max: [Math.max(...xs), Math.max(...ys), Math.max(...zs)]
    },
    centroid: [
      Number(((minX + maxX) / 2).toFixed(3)),
      Number(((eavesY + ridgeY) / 2 + (thickness * ny) / 2).toFixed(3)),
      Number(((eavesZ + ridgeZ) / 2 + (thickness * nz) / 2).toFixed(3))
    ],
    vertices,
    faces,
    material: metadata.material || 'Mangalore Clay Roofing Tile',
    materialId: metadata.materialId || null,
    materialDef: metadata.materialDef || null,
    color: metadata.color || '#ea580c',
    opacity: metadata.opacity !== undefined ? metadata.opacity : 1.0,
    roughness: metadata.roughness !== undefined ? metadata.roughness : 0.85,
    metalness: metadata.metalness !== undefined ? metadata.metalness : 0.05,
    strokeColor: metadata.strokeColor || '#9a3412',
    strokeWidth: metadata.strokeWidth || 1.0,
    metadata: metadata || {}
  };
}

/**
 * Creates a solid triangular gable wall closing the vertical space under a pitched roof.
 */
export function createTriangularGableMesh(id, componentType, params, metadata = {}) {
  const { x, thickness = 0.5, zEavesNorth, zEavesSouth, zRidge, yEaves, yRidge } = params;
  const halfT = thickness / 2;

  const x0 = x - halfT;
  const x1 = x + halfT;

  const vertices = [
    // Triangle at x0 (-X face)
    [x0, yEaves, zEavesNorth], // 0
    [x0, yEaves, zEavesSouth], // 1
    [x0, yRidge, zRidge],      // 2
    // Triangle at x1 (+X face)
    [x1, yEaves, zEavesNorth], // 3
    [x1, yEaves, zEavesSouth], // 4
    [x1, yRidge, zRidge]       // 5
  ];

  const faces = [
    { indices: [0, 2, 1], normal: [-1, 0, 0], name: 'west_gable' },
    { indices: [3, 4, 5], normal: [1, 0, 0], name: 'east_gable' },
    { indices: [0, 1, 4, 3], normal: [0, -1, 0], name: 'bottom' },
    { indices: [0, 3, 5, 2], normal: [0, 0.7, -0.7], name: 'north_slope' },
    { indices: [1, 2, 5, 4], normal: [0, 0.7, 0.7], name: 'south_slope' }
  ];

  const xs = vertices.map(v => v[0]);
  const ys = vertices.map(v => v[1]);
  const zs = vertices.map(v => v[2]);

  return {
    id,
    type: componentType,
    componentType: metadata.componentType || componentType,
    floorIndex: metadata.floorIndex !== undefined ? metadata.floorIndex : 2,
    dimensions: {
      width: thickness,
      height: Number((yRidge - yEaves).toFixed(3)),
      depth: Number((zEavesSouth - zEavesNorth).toFixed(3)),
      units: 'feet'
    },
    bounds: {
      min: [Math.min(...xs), Math.min(...ys), Math.min(...zs)],
      max: [Math.max(...xs), Math.max(...ys), Math.max(...zs)]
    },
    centroid: [x, (yEaves + yRidge) / 2, zRidge],
    vertices,
    faces,
    material: metadata.material || 'Exterior Masonry & Sponge Plaster',
    materialId: metadata.materialId || null,
    materialDef: metadata.materialDef || null,
    color: metadata.color || '#e2e8f0',
    opacity: 1.0,
    roughness: 0.8,
    metalness: 0.05,
    strokeColor: '#64748b',
    strokeWidth: 0.8,
    metadata: metadata || {}
  };
}

// =============================================================================
// 2. PROCEDURAL WALL GENERATION WITH REAL THROUGH-WALL OPENINGS
// =============================================================================

/**
 * Segments a wall around door and window openings, generating exact through-wall
 * cutout voids, solid jambs, sub-sill aprons, and lintel header blocks.
 * 
 * @param {Object} wall - Canonical wall object { id, type, start, end, thickness, height }
 * @param {Array} rawOpenings - Doors and windows associated with this floor
 * @param {Object} floorParams - { floorIndex, elevationY, clearHeight, isTerrace }
 * @param {Array} diagnostics - Collector for warnings/errors
 * @returns {Object} { solidBlocks: Array<Mesh>, openingComponents: Array<Mesh> }
 */
export function generateWallWithRealOpenings(wall, rawOpenings, floorParams, diagnostics = []) {
  const options = floorParams || {};
  const { floorIndex = 0, elevationY = 0, clearHeight, clearCeilingHeightFt, isTerrace = false, style = 'modern_contemporary' } = options;
  const isExterior = wall.type === 'exterior';
  const wallThickness = wall.thickness || (isExterior ? ARCHITECTURAL_DEFAULTS_3D.WALL_THICKNESS_EXTERIOR : ARCHITECTURAL_DEFAULTS_3D.WALL_THICKNESS_INTERIOR);
  const effectiveClearHeight = clearCeilingHeightFt || clearHeight || ARCHITECTURAL_DEFAULTS_3D.CLEAR_CEILING_HEIGHT;
  const wallHeight = isTerrace ? ARCHITECTURAL_DEFAULTS_3D.PARAPET_HEIGHT : (wall.height || effectiveClearHeight);

  const startPt = { x: wall.start.x, y: wall.start.y };
  const endPt = { x: wall.end.x, y: wall.end.y };
  const dx = endPt.x - startPt.x;
  const dy = endPt.y - startPt.y;
  const wallLength = Math.hypot(dx, dy);

  if (wallLength < 0.2) {
    diagnostics.push({
      severity: 'WARNING',
      componentType: 'wall',
      componentId: wall.id,
      message: `Wall ${wall.id} has near-zero length (${wallLength.toFixed(2)} ft) and was skipped.`,
      status: 'SKIPPED'
    });
    return { solidBlocks: [], openingComponents: [], matchedOpIds: [] };
  }

  const ux = dx / wallLength;
  const uy = dy / wallLength;

  // 1. Identify and match openings located on this wall segment
  const matchedOpenings = [];
  const matchedOpIds = [];

  rawOpenings.forEach(op => {
    // Op can have nested position { position: { x, y } } or direct coordinates { x, y, width, wall, label }
    let opX = null;
    let opY = null;
    if (op.position && typeof op.position.x === 'number') {
      opX = Number(op.position.x);
      opY = Number(op.position.y !== undefined ? op.position.y : (op.position.z !== undefined ? op.position.z : 0));
    } else if (typeof op.x === 'number') {
      opX = Number(op.x);
      opY = Number(op.y !== undefined ? op.y : (op.z !== undefined ? op.z : 0));
    }

    const opWidth = Number(op.width) || (op.type === 'door' ? ARCHITECTURAL_DEFAULTS_3D.DOOR_WIDTH : ARCHITECTURAL_DEFAULTS_3D.WINDOW_WIDTH);

    // Validate opening width
    if (!Number.isFinite(opWidth) || opWidth <= 0.1) {
      diagnostics.push({
        severity: 'WARNING',
        componentType: op.type || 'opening',
        componentId: op.id || 'unnamed_op',
        sourceId: wall.id,
        message: `Opening ${op.id || 'unnamed'} on wall ${wall.id} has invalid width (${opWidth}). Skipped.`,
        status: 'INVALID_DIMENSION'
      });
      return;
    }

    let isMatched = false;
    let projDist = 0;

    // Check Case A: Explicit host wall ID match
    if (op.wallId && (op.wallId === wall.id || op.hostWallId === wall.id)) {
      isMatched = true;
      if (opX !== null && opY !== null && Number.isFinite(opX) && Number.isFinite(opY)) {
        const vX = opX - startPt.x;
        const vY = opY - startPt.y;
        projDist = vX * ux + vY * uy;
      } else if (typeof op.positionAlongWall === 'number') {
        projDist = op.positionAlongWall;
      } else {
        projDist = wallLength / 2;
      }
    } else if (typeof op.positionAlongWall === 'number' && op.wallId === wall.id) {
      isMatched = true;
      projDist = op.positionAlongWall;
    } else if (opX !== null && opY !== null && Number.isFinite(opX) && Number.isFinite(opY)) {
      // Check Case B: Spatial coordinate matching (direct or nested)
      const vX = opX - startPt.x;
      const vY = opY - startPt.y;
      const dot = vX * ux + vY * uy;
      const perpDist = Math.abs(vX * (-uy) + vY * ux);

      // Distance tolerance: point lies along wall within boundary tolerance
      const tolerance = Math.max(1.2, wallThickness * 1.8);
      if (perpDist <= tolerance && dot >= -0.5 && dot <= wallLength + 0.5) {
        // Check orientation alignment if specified (e.g. 'north', 'south', 'east', 'west')
        let orientationMatches = true;
        if (op.wall) {
          const opW = String(op.wall).toLowerCase().trim();
          const wallO = String(wall.orientation || '').toLowerCase().trim();
          if (wallO) {
            if (wallO === 'horizontal') {
              orientationMatches = (opW === 'north' || opW === 'south');
            } else if (wallO === 'vertical') {
              orientationMatches = (opW === 'east' || opW === 'west');
            } else {
              orientationMatches = (opW === wallO);
            }
          }
        }
        if (orientationMatches) {
          isMatched = true;
          projDist = dot;
        }
      }
    }

    if (isMatched) {
      const halfW = opWidth / 2;
      const rawStart = projDist - halfW;
      const rawEnd = projDist + halfW;

      // Validate opening against host wall run bounds
      if (rawStart < -0.1 || rawEnd > wallLength + 0.1) {
        diagnostics.push({
          severity: 'WARNING',
          componentType: op.type || 'opening',
          componentId: op.id || 'unnamed',
          sourceId: wall.id,
          message: `Opening ${op.id || 'unnamed'} extends outside host wall ${wall.id} (bounds [${rawStart.toFixed(2)}, ${rawEnd.toFixed(2)}] ft exceed wall length ${wallLength.toFixed(2)} ft).`,
          status: 'OUT_OF_BOUNDS'
        });
      }

      const sStart = Math.max(0, rawStart);
      const sEnd = Math.min(wallLength, rawEnd);

      if (sEnd > sStart + 0.2 && rawEnd > 0.05 && rawStart < wallLength - 0.05) {
        matchedOpenings.push({
          ...op,
          sStart,
          sEnd,
          actualWidth: sEnd - sStart,
          midDist: (sStart + sEnd) / 2
        });
        const effectiveOpId = op.id || op.label || `op_${matchedOpenings.length}`;
        matchedOpIds.push(effectiveOpId);
      }
    }
  });

  // Sort openings along wall run
  matchedOpenings.sort((a, b) => a.sStart - b.sStart);

  // 2. Filter out overlapping openings (emit diagnostic for collisions)
  const validOpenings = [];
  let lastEnd = 0;

  matchedOpenings.forEach((op, idx) => {
    if (op.sStart < lastEnd - 0.05) {
      diagnostics.push({
        severity: 'WARNING',
        componentType: 'opening',
        componentId: op.id || `op_${idx}`,
        sourceId: wall.id,
        message: `Opening ${op.id || idx} overlaps previous opening on wall ${wall.id} and was skipped.`,
        status: 'SKIPPED'
      });
      return;
    }
    validOpenings.push(op);
    lastEnd = op.sEnd;
  });

  const solidBlocks = [];
  const openingComponents = [];
  const wallMat = isExterior
    ? getMaterialForComponent('wall_exterior', style, options)
    : getMaterialForComponent('wall_interior', style, options);

  // Helper to construct a sub-segment prism between s0 and s1 along the wall
  const addSubPrism = (subId, subType, s0, s1, baseElev, h, customMatDef) => {
    if (s1 <= s0 + 0.05 || h <= 0.05) return;
    const pt0 = { x: startPt.x + s0 * ux, y: startPt.y + s0 * uy };
    const pt1 = { x: startPt.x + s1 * ux, y: startPt.y + s1 * uy };
    const activeMat = customMatDef || wallMat;
    solidBlocks.push(createOrientedWallPrism(
      subId,
      subType,
      pt0,
      pt1,
      wallThickness,
      baseElev,
      h,
      {
        sourceId: wall.id,
        componentType: 'wall',
        wallType: isExterior ? 'wall_exterior' : 'wall_interior',
        floorIndex,
        material: activeMat.name,
        materialId: activeMat.id,
        materialDef: activeMat,
        color: activeMat.baseColor,
        opacity: activeMat.opacity,
        roughness: activeMat.roughness,
        metalness: activeMat.metalness,
        strokeColor: activeMat.strokeColor,
        strokeWidth: activeMat.strokeWidth,
        surfaceTexture: activeMat.surfaceTexture,
        provenance: 'EXPLICIT'
      }
    ));
  };

  // 3. Segment the wall along its run
  let currentS = 0;

  validOpenings.forEach((op, opIdx) => {
    // Solid jamb/segment before this opening
    if (op.sStart > currentS + 0.05) {
      addSubPrism(
        `${wall.id}_jamb_${opIdx}`,
        'wall_jamb',
        currentS,
        op.sStart,
        elevationY,
        wallHeight
      );
    }

    const opS0 = op.sStart;
    const opS1 = op.sEnd;
    const isDoor = op.type === 'door';
    const isWindow = op.type === 'window';

    const lintelHeight = Math.min(wallHeight, ARCHITECTURAL_DEFAULTS_3D.DOOR_HEIGHT);
    const headerHeight = Math.max(0, wallHeight - lintelHeight);

    // Header block above opening (lintel solid)
    if (headerHeight > 0.05) {
      addSubPrism(
        `${wall.id}_header_${opIdx}`,
        'wall_header',
        opS0,
        opS1,
        elevationY + lintelHeight,
        headerHeight
      );
    }

    if (isWindow) {
      // Sub-sill apron block below window opening
      const sillHeight = Math.min(lintelHeight - 1.0, ARCHITECTURAL_DEFAULTS_3D.WINDOW_SILL_HEIGHT);
      if (sillHeight > 0.05) {
        addSubPrism(
          `${wall.id}_apron_${opIdx}`,
          'wall_apron',
          opS0,
          opS1,
          elevationY,
          sillHeight
        );
      }

      // Inside the void: Generate Window Frame & Glass Pane Components!
      const winBottom = elevationY + sillHeight;
      const winHeight = Math.max(0.5, lintelHeight - sillHeight);
      const frameMat = getMaterialForComponent('window_frame', style, options);
      const glassMat = getMaterialForComponent('window_pane', style, options);

      // Window Frame (UPVC/Aluminum border)
      const framePt0 = { x: startPt.x + (opS0 + 0.1) * ux, y: startPt.y + (opS0 + 0.1) * uy };
      const framePt1 = { x: startPt.x + (opS1 - 0.1) * ux, y: startPt.y + (opS1 - 0.1) * uy };
      openingComponents.push(createOrientedWallPrism(
        `frame_${op.id || opIdx}`,
        'window_frame',
        framePt0,
        framePt1,
        wallThickness * 0.45,
        winBottom + 0.05,
        winHeight - 0.1,
        {
          sourceId: op.id || `win_${opIdx}`,
          componentType: 'window_frame',
          floorIndex,
          isExterior,
          wallType: isExterior ? 'wall_exterior' : 'wall_interior',
          material: frameMat.name,
          materialId: frameMat.id,
          materialDef: frameMat,
          color: frameMat.baseColor,
          opacity: frameMat.opacity,
          roughness: frameMat.roughness,
          metalness: frameMat.metalness,
          strokeColor: frameMat.strokeColor,
          strokeWidth: frameMat.strokeWidth,
          surfaceTexture: frameMat.surfaceTexture,
          provenance: 'EXPLICIT'
        }
      ));

      // Window Glass Pane (Double-glazed acoustic glass)
      const glassPt0 = { x: startPt.x + (opS0 + 0.2) * ux, y: startPt.y + (opS0 + 0.2) * uy };
      const glassPt1 = { x: startPt.x + (opS1 - 0.2) * ux, y: startPt.y + (opS1 - 0.2) * uy };
      openingComponents.push(createOrientedWallPrism(
        `glass_${op.id || opIdx}`,
        'window_pane',
        glassPt0,
        glassPt1,
        0.05, // 0.6 inch slim glass thickness
        winBottom + 0.15,
        winHeight - 0.3,
        {
          sourceId: op.id || `win_${opIdx}`,
          componentType: 'window_pane',
          floorIndex,
          isExterior,
          wallType: isExterior ? 'wall_exterior' : 'wall_interior',
          material: glassMat.name,
          materialId: glassMat.id,
          materialDef: glassMat,
          color: glassMat.baseColor,
          opacity: glassMat.opacity,
          roughness: glassMat.roughness,
          metalness: glassMat.metalness,
          strokeColor: glassMat.strokeColor,
          strokeWidth: glassMat.strokeWidth,
          surfaceTexture: glassMat.surfaceTexture,
          provenance: 'EXPLICIT'
        }
      ));

    } else if (isDoor) {
      // Door Leaf (Solid Timber / Veneer flush door)
      const doorPt0 = { x: startPt.x + (opS0 + 0.1) * ux, y: startPt.y + (opS0 + 0.1) * uy };
      const doorPt1 = { x: startPt.x + (opS1 - 0.1) * ux, y: startPt.y + (opS1 - 0.1) * uy };
      const doorMat = getMaterialForComponent('door_leaf', style, options);
      openingComponents.push(createOrientedWallPrism(
        `leaf_${op.id || opIdx}`,
        'door_leaf',
        doorPt0,
        doorPt1,
        0.18, // 2-inch solid door panel
        elevationY,
        lintelHeight - 0.05,
        {
          sourceId: op.id || `door_${opIdx}`,
          componentType: 'door_leaf',
          floorIndex,
          isExterior,
          wallType: isExterior ? 'wall_exterior' : 'wall_interior',
          material: doorMat.name,
          materialId: doorMat.id,
          materialDef: doorMat,
          color: doorMat.baseColor,
          opacity: doorMat.opacity,
          roughness: doorMat.roughness,
          metalness: doorMat.metalness,
          strokeColor: doorMat.strokeColor,
          strokeWidth: doorMat.strokeWidth,
          surfaceTexture: doorMat.surfaceTexture,
          provenance: 'EXPLICIT'
        }
      ));
    }

    currentS = opS1;
  });

  // If wall had openings, add final trailing solid wall jamb
  if (validOpenings.length > 0 && wallLength > currentS + 0.05) {
    addSubPrism(
      `${wall.id}_jamb_end`,
      'wall_jamb',
      currentS,
      wallLength,
      elevationY,
      wallHeight
    );
  }

  // If wall had zero openings, produce single solid wall prism
  if (validOpenings.length === 0) {
    solidBlocks.push(createOrientedWallPrism(
      `${wall.id}_solid`,
      'wall_solid',
      startPt,
      endPt,
      wallThickness,
      elevationY,
      wallHeight,
      {
        sourceId: wall.id,
        componentType: 'wall',
        wallType: isExterior ? 'wall_exterior' : 'wall_interior',
        floorIndex,
        material: wallMat.name,
        materialId: wallMat.id,
        materialDef: wallMat,
        color: wallMat.baseColor,
        opacity: wallMat.opacity,
        roughness: wallMat.roughness,
        metalness: wallMat.metalness,
        strokeColor: wallMat.strokeColor,
        strokeWidth: wallMat.strokeWidth,
        surfaceTexture: wallMat.surfaceTexture,
        provenance: 'EXPLICIT'
      }
    ));
  }

  return { solidBlocks, openingComponents, matchedOpIds };
}

// =============================================================================
// 3. PROCEDURAL SLABS & STAIRCASES
// =============================================================================

/**
 * Resolves the 2D footprint bounding box(es) for a floor.
 * Supports:
 * - Explicit floor.footprints array (e.g. for L-shaped or multi-wing floors)
 * - Explicit floor.bounds rectangle
 * - Inferred from room bounding boxes (and balconies)
 * - Fallback to site buildable envelope
 * 
 * @param {Object} floor - Canonical floor definition
 * @param {Object} fallbackEnvelope - Site buildable envelope fallback
 * @returns {Array<Object>} Array of { x, y, width, length }
 */
export function getFloorFootprints(floor, fallbackEnvelope) {
  if (!floor) return [fallbackEnvelope];

  // 1. Explicit multi-footprint array (e.g. L-shaped wings or multiple pavilions)
  if (Array.isArray(floor.footprints) && floor.footprints.length > 0) {
    const valid = floor.footprints.filter(fp => fp && typeof fp.width === 'number' && fp.width > 0 && typeof fp.length === 'number' && fp.length > 0);
    if (valid.length > 0) return valid;
  }

  // 2. Explicit floor bounds
  if (floor.bounds && typeof floor.bounds.width === 'number' && floor.bounds.width > 0 && typeof floor.bounds.length === 'number' && floor.bounds.length > 0) {
    return [floor.bounds];
  }

  // 3. Compute from rooms bounding box
  if (Array.isArray(floor.rooms) && floor.rooms.length > 0) {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    floor.rooms.forEach(rm => {
      const b = rm.bounds;
      if (b && typeof b.width === 'number' && b.width > 0 && typeof b.length === 'number' && b.length > 0) {
        minX = Math.min(minX, b.x);
        minY = Math.min(minY, b.y);
        maxX = Math.max(maxX, b.x + b.width);
        maxY = Math.max(maxY, b.y + b.length);
      }
    });

    if (isFinite(minX) && isFinite(maxX) && maxX > minX && maxY > minY) {
      return [{
        x: Number(minX.toFixed(2)),
        y: Number(minY.toFixed(2)),
        width: Number((maxX - minX).toFixed(2)),
        length: Number((maxY - minY).toFixed(2))
      }];
    }
  }

  return [fallbackEnvelope];
}

/**
 * Generates an RCC floor slab with optional staircase shaft cutout.
 */
export function generateFloorSlabWithCutouts(slabId, type, envelope, elevationY, thickness, stairCutout = null, metadata = {}) {
  const isCutoutValid = stairCutout &&
    stairCutout.width > 2.0 &&
    stairCutout.length > 2.0 &&
    stairCutout.x >= envelope.x &&
    stairCutout.x + stairCutout.width <= envelope.x + envelope.width &&
    stairCutout.y >= envelope.y &&
    stairCutout.y + stairCutout.length <= envelope.y + envelope.length;

  // If no cutout or invalid cutout, generate single monolithic slab
  if (!isCutoutValid) {
    return [createSolidBoxMesh(slabId, type, {
      minX: envelope.x,
      minY: elevationY,
      minZ: envelope.y,
      maxX: envelope.x + envelope.width,
      maxY: elevationY + thickness,
      maxZ: envelope.y + envelope.length
    }, metadata)];
  }

  // Partition slab into rectangular sub-regions around stairwell cutout void:
  // 1. North strip (ahead of stairwell in Y)
  // 2. South strip (behind stairwell in Y)
  // 3. West flank (left of stairwell between Y bounds)
  // 4. East flank (right of stairwell between Y bounds)
  const slabs = [];
  const eX0 = envelope.x;
  const eX1 = envelope.x + envelope.width;
  const eZ0 = envelope.y;
  const eZ1 = envelope.y + envelope.length;

  const sX0 = stairCutout.x;
  const sX1 = stairCutout.x + stairCutout.width;
  const sZ0 = stairCutout.y;
  const sZ1 = stairCutout.y + stairCutout.length;

  // Front / North strip
  if (sZ0 > eZ0 + 0.1) {
    slabs.push(createSolidBoxMesh(`${slabId}_north`, type, {
      minX: eX0, minY: elevationY, minZ: eZ0,
      maxX: eX1, maxY: elevationY + thickness, maxZ: sZ0
    }, { ...metadata, componentType: 'slab_strip' }));
  }

  // Rear / South strip
  if (eZ1 > sZ1 + 0.1) {
    slabs.push(createSolidBoxMesh(`${slabId}_south`, type, {
      minX: eX0, minY: elevationY, minZ: sZ1,
      maxX: eX1, maxY: elevationY + thickness, maxZ: eZ1
    }, { ...metadata, componentType: 'slab_strip' }));
  }

  // Left / West flank
  if (sX0 > eX0 + 0.1) {
    slabs.push(createSolidBoxMesh(`${slabId}_west`, type, {
      minX: eX0, minY: elevationY, minZ: sZ0,
      maxX: sX0, maxY: elevationY + thickness, maxZ: sZ1
    }, { ...metadata, componentType: 'slab_flank' }));
  }

  // Right / East flank
  if (eX1 > sX1 + 0.1) {
    slabs.push(createSolidBoxMesh(`${slabId}_east`, type, {
      minX: sX1, minY: elevationY, minZ: sZ0,
      maxX: eX1, maxY: elevationY + thickness, maxZ: sZ1
    }, { ...metadata, componentType: 'slab_flank' }));
  }

  return slabs;
}

/**
 * Generates an architectural 3D staircase with individual treads, risers, and landing.
 */
export function generateProceduralStaircase3d(stairRoom, startElevationY, floorToFloorHeight, metadata = {}) {
  const steps = [];
  if (!stairRoom || !stairRoom.bounds || typeof stairRoom.bounds.width !== 'number' || stairRoom.bounds.width <= 0 || typeof stairRoom.bounds.length !== 'number' || stairRoom.bounds.length <= 0) {
    return steps;
  }
  const style = metadata.style || 'modern_contemporary';
  const treadMat = getMaterialForComponent('stair_tread', style, metadata);
  const landingMat = getMaterialForComponent('stair_landing', style, metadata);

  const sb = stairRoom.bounds;
  const numSteps = 18; // 18 steps for 10.5 ft floor-to-floor
  const riserHeight = floorToFloorHeight / numSteps;
  const halfSteps = Math.floor(numSteps / 2);
  const flightWidth = (sb.width * 0.48);
  const runDepth = (sb.length * 0.75) / halfSteps;

  // Flight 1: Ascends from Ground to Mid-Landing
  for (let i = 0; i < halfSteps; i++) {
    const stepElevation = startElevationY + i * riserHeight;
    const stepZ = sb.y + i * runDepth;

    steps.push(createSolidBoxMesh(
      `stair_step_${i + 1}`,
      'stair_tread',
      {
        minX: sb.x,
        minY: stepElevation,
        minZ: stepZ,
        maxX: sb.x + flightWidth,
        maxY: stepElevation + riserHeight * 0.25, // 2-inch tread slab
        maxZ: stepZ + runDepth
      },
      {
        ...metadata,
        componentType: 'stair_tread',
        material: treadMat.name,
        materialId: treadMat.id,
        materialDef: treadMat,
        color: treadMat.baseColor,
        opacity: treadMat.opacity,
        roughness: treadMat.roughness,
        metalness: treadMat.metalness,
        strokeColor: treadMat.strokeColor,
        strokeWidth: treadMat.strokeWidth
      }
    ));
  }

  // Mid-Landing Platform
  const landingElevation = startElevationY + halfSteps * riserHeight;
  const landingZ = sb.y + halfSteps * runDepth;

  steps.push(createSolidBoxMesh(
    'stair_mid_landing',
    'stair_landing',
    {
      minX: sb.x,
      minY: landingElevation,
      minZ: landingZ,
      maxX: sb.x + sb.width,
      maxY: landingElevation + 0.4,
      maxZ: sb.y + sb.length
    },
    {
      ...metadata,
      componentType: 'stair_landing',
      material: landingMat.name,
      materialId: landingMat.id,
      materialDef: landingMat,
      color: landingMat.baseColor,
      opacity: landingMat.opacity,
      roughness: landingMat.roughness,
      metalness: landingMat.metalness,
      strokeColor: landingMat.strokeColor,
      strokeWidth: landingMat.strokeWidth
    }
  ));

  // Flight 2: Ascends from Mid-Landing to Upper Floor in reverse direction
  const flight2X = sb.x + sb.width - flightWidth;
  for (let i = 0; i < halfSteps; i++) {
    const stepIdx = halfSteps + i;
    const stepElevation = landingElevation + (i + 1) * riserHeight;
    const stepZ = landingZ - (i + 1) * runDepth;

    steps.push(createSolidBoxMesh(
      `stair_step_${stepIdx + 1}`,
      'stair_tread',
      {
        minX: flight2X,
        minY: stepElevation,
        minZ: Math.max(sb.y, stepZ),
        maxX: flight2X + flightWidth,
        maxY: stepElevation + riserHeight * 0.25,
        maxZ: Math.max(sb.y, stepZ) + runDepth
      },
      {
        ...metadata,
        componentType: 'stair_tread',
        material: treadMat.name,
        materialId: treadMat.id,
        materialDef: treadMat,
        color: treadMat.baseColor,
        opacity: treadMat.opacity,
        roughness: treadMat.roughness,
        metalness: treadMat.metalness,
        strokeColor: treadMat.strokeColor,
        strokeWidth: treadMat.strokeWidth
      }
    ));
  }

  return steps;
}

// =============================================================================
// 4. BALCONIES, RAILINGS & STRUCTURAL COLUMNS
// =============================================================================

/**
 * Generates balcony cantilever slab and perimeter balustrade railings.
 */
export function generateBalcony3d(balconyRoom, floorElevationY, metadata = {}) {
  const components = [];
  const b = balconyRoom.bounds;
  const railingHeight = ARCHITECTURAL_DEFAULTS_3D.BALCONY_RAILING_HEIGHT;
  const style = metadata.style || 'modern_contemporary';

  const deckMat = getMaterialForComponent('balcony_cantilever', style, metadata);
  const postMat = getMaterialForComponent('railing_post', style, metadata);
  const railMat = getMaterialForComponent('railing_handrail', style, metadata);

  // 1. Balcony cantilever floor slab
  components.push(createSolidBoxMesh(
    `balcony_slab_${balconyRoom.id}`,
    'balcony_slab',
    {
      minX: b.x,
      minY: floorElevationY,
      minZ: b.y,
      maxX: b.x + b.width,
      maxY: floorElevationY + ARCHITECTURAL_DEFAULTS_3D.SLAB_THICKNESS,
      maxZ: b.y + b.length
    },
    {
      ...metadata,
      componentType: 'balcony_slab',
      material: deckMat.name,
      materialId: deckMat.id,
      materialDef: deckMat,
      color: deckMat.baseColor,
      opacity: deckMat.opacity,
      roughness: deckMat.roughness,
      metalness: deckMat.metalness,
      strokeColor: deckMat.strokeColor,
      strokeWidth: deckMat.strokeWidth
    }
  ));

  // 2. Perimeter Railings (Posts and Top Rail)
  const numPosts = Math.max(3, Math.round(b.width / 2.5));
  const postStep = b.width / (numPosts - 1);

  // Vertical Posts along outer edge
  for (let i = 0; i < numPosts; i++) {
    const postX = b.x + i * postStep;
    components.push(createSolidBoxMesh(
      `railing_post_${balconyRoom.id}_${i}`,
      'railing_post',
      {
        minX: postX - 0.08,
        minY: floorElevationY + ARCHITECTURAL_DEFAULTS_3D.SLAB_THICKNESS,
        minZ: b.y - 0.08,
        maxX: postX + 0.08,
        maxY: floorElevationY + ARCHITECTURAL_DEFAULTS_3D.SLAB_THICKNESS + railingHeight,
        maxZ: b.y + 0.08
      },
      {
        ...metadata,
        componentType: 'railing_post',
        material: postMat.name,
        materialId: postMat.id,
        materialDef: postMat,
        color: postMat.baseColor,
        opacity: postMat.opacity,
        roughness: postMat.roughness,
        metalness: postMat.metalness,
        strokeColor: postMat.strokeColor,
        strokeWidth: postMat.strokeWidth
      }
    ));
  }

  // Continuous Top Rail
  components.push(createSolidBoxMesh(
    `railing_handrail_${balconyRoom.id}`,
    'railing_top_rail',
    {
      minX: b.x - 0.1,
      minY: floorElevationY + ARCHITECTURAL_DEFAULTS_3D.SLAB_THICKNESS + railingHeight - 0.12,
      minZ: b.y - 0.1,
      maxX: b.x + b.width + 0.1,
      maxY: floorElevationY + ARCHITECTURAL_DEFAULTS_3D.SLAB_THICKNESS + railingHeight,
      maxZ: b.y + 0.1
    },
    {
      ...metadata,
      componentType: 'railing_top_rail',
      material: railMat.name,
      materialId: railMat.id,
      materialDef: railMat,
      color: railMat.baseColor,
      opacity: railMat.opacity,
      roughness: railMat.roughness,
      metalness: railMat.metalness,
      strokeColor: railMat.strokeColor,
      strokeWidth: railMat.strokeWidth
    }
  ));

  return components;
}

/**
 * Generates RCC structural columns spanning from foundation plinth to roof.
 */
export function generateStructuralColumns3d(structuralGrid, totalBuildingHeight, metadata = {}) {
  const columns = [];
  const colList = structuralGrid?.columns || [];
  const style = metadata.style || 'modern_contemporary';
  const colMat = getMaterialForComponent('column', style, metadata);

  colList.forEach(col => {
    const width = col.width || ARCHITECTURAL_DEFAULTS_3D.COLUMN_WIDTH;
    const length = col.length || ARCHITECTURAL_DEFAULTS_3D.COLUMN_LENGTH;

    columns.push(createSolidBoxMesh(
      `${col.id}_solid`,
      'structural_column',
      {
        minX: col.x - width / 2,
        minY: 0, // From finished ground datum
        minZ: col.y - length / 2,
        maxX: col.x + width / 2,
        maxY: totalBuildingHeight,
        maxZ: col.y + length / 2
      },
      {
        ...metadata,
        sourceId: col.id,
        componentType: 'column',
        material: colMat.name,
        materialId: colMat.id,
        materialDef: colMat,
        color: colMat.baseColor,
        opacity: colMat.opacity,
        roughness: colMat.roughness,
        metalness: colMat.metalness,
        strokeColor: colMat.strokeColor,
        strokeWidth: colMat.strokeWidth
      }
    ));
  });

  return columns;
}

// =============================================================================
// 4B. PROCEDURAL ROOFLINES & EXTERIOR SUNSHADES (S3-T03)
// =============================================================================

/**
 * Resolves the effective procedural roofline style with strict precedence:
 * 1. Explicit user options (options.rooflineStyle)
 * 2. Explicit canonical design inputs (canonicalDesign.inputs.rooflineStyle)
 * 3. Deterministic style-based default (Traditional Kerala -> sloping_pitched, Eco -> pergola_terrace, Villa -> stepped_parapet, Modern/Minimalist -> flat_terrace)
 * 4. Fallback to 'flat_terrace'
 * 
 * @param {Object} options
 * @param {Object} canonicalDesign
 * @returns {string} Effective roofline style
 */
export function resolveProceduralRooflineStyle(options = {}, canonicalDesign = {}) {
  if (options.rooflineStyle) return options.rooflineStyle;
  if (canonicalDesign.inputs?.rooflineStyle) return canonicalDesign.inputs.rooflineStyle;
  if (options.hasSlopedRoof || canonicalDesign.inputs?.hasSlopedRoof) return 'sloping_pitched';

  const styleStr = String(
    options.style ||
    canonicalDesign.inputs?.archStyle ||
    canonicalDesign.inputs?.style ||
    canonicalDesign.metadata?.style ||
    'modern_contemporary'
  ).toLowerCase();

  if (styleStr.includes('kerala') || styleStr.includes('traditional') || styleStr.includes('vintage') || styleStr.includes('slop')) {
    return 'sloping_pitched';
  } else if (styleStr.includes('eco') || styleStr.includes('tropical')) {
    return 'pergola_terrace';
  } else if (styleStr.includes('villa') || styleStr.includes('luxury') || styleStr.includes('penthouse')) {
    return 'stepped_parapet';
  } else if (styleStr.includes('minimal')) {
    return 'flat_terrace';
  } else {
    return 'flat_terrace';
  }
}

/**
 * Generates solid 3D box and prism meshes for procedurally styled rooflines.
 * Supports: Sloping pitched mangalore tiles, pergola trellis beams, and stepped parapets.
 * 
 * @param {string} rooflineStyle - Style ('sloping_pitched', 'pergola_terrace', 'stepped_parapet', 'flat_terrace')
 * @param {Array<Object>} topFootprints - Top floor footprint bounds [{ x, y, width, length }]
 * @param {number} floorBaseY - Elevation of roof terrace slab
 * @param {Object} [options] - Options { floorIndex, material, color }
 * @returns {Array<Object>} Solid 3D roofline meshes
 */
export function generateProceduralRoofline3d(rooflineStyle, topFootprints = [], floorBaseY = 0, options = {}) {
  const meshes = [];
  const style = rooflineStyle || 'flat_terrace';
  const archStyle = options.style || 'modern_contemporary';
  const fIdx = options.floorIndex !== undefined ? options.floorIndex : 2;

  const roofMat = getMaterialForComponent('roof_sloping_pitch', archStyle, options);
  const ridgeMat = getMaterialForComponent('roof_ridge_cap', archStyle, options);
  const pergolaMat = getMaterialForComponent('roof_trellis_beam', archStyle, options);
  const pierMat = getMaterialForComponent('roof_stepped_pier', archStyle, options);

  topFootprints.forEach((fp, fpIdx) => {
    const W = fp.width;
    const L = fp.length;
    const overhang = 1.5; // 1.5 ft overhang past exterior wall line

    if (style === 'sloping_pitched') {
      // Sloping Pitched Roof with Genuine Inclined Mangalore Clay Tiles
      const ridgeHeight = 4.2;
      const midZ = fp.y + L / 2;
      const eavesY = floorBaseY + ARCHITECTURAL_DEFAULTS_3D.SLAB_THICKNESS;
      const ridgeY = eavesY + ridgeHeight;

      // North Pitch (Genuine Inclined Sloping Surface from North Eaves up to Ridge)
      meshes.push(createPitchedRoofPitchMesh(
        `roof_slope_north_fp${fpIdx}`,
        'sloping_roof_pitch',
        {
          minX: fp.x - overhang,
          maxX: fp.x + W + overhang,
          eavesZ: fp.y - overhang,
          ridgeZ: midZ,
          eavesY,
          ridgeY,
          thickness: 0.4
        },
        {
          floorIndex: fIdx,
          componentType: 'sloping_roof',
          material: roofMat.name,
          materialId: roofMat.id,
          materialDef: roofMat,
          color: roofMat.baseColor,
          opacity: roofMat.opacity,
          roughness: roofMat.roughness,
          metalness: roofMat.metalness,
          strokeColor: roofMat.strokeColor,
          strokeWidth: roofMat.strokeWidth,
          provenance: 'EXPLICIT_STYLE_RULE'
        }
      ));

      // South Pitch (Genuine Inclined Sloping Surface from South Eaves up to Ridge)
      meshes.push(createPitchedRoofPitchMesh(
        `roof_slope_south_fp${fpIdx}`,
        'sloping_roof_pitch',
        {
          minX: fp.x - overhang,
          maxX: fp.x + W + overhang,
          eavesZ: fp.y + L + overhang,
          ridgeZ: midZ,
          eavesY,
          ridgeY,
          thickness: 0.4
        },
        {
          floorIndex: fIdx,
          componentType: 'sloping_roof',
          material: roofMat.name,
          materialId: roofMat.id,
          materialDef: roofMat,
          color: roofMat.baseColor,
          opacity: roofMat.opacity,
          roughness: roofMat.roughness,
          metalness: roofMat.metalness,
          strokeColor: roofMat.strokeColor,
          strokeWidth: roofMat.strokeWidth,
          provenance: 'EXPLICIT_STYLE_RULE'
        }
      ));

      // Triangular Gable End Walls (West and East ends closing the gable void)
      meshes.push(createTriangularGableMesh(
        `roof_gable_west_fp${fpIdx}`,
        'roof_gable_wall',
        {
          x: fp.x - 0.25,
          thickness: 0.5,
          zEavesNorth: fp.y - overhang * 0.5,
          zEavesSouth: fp.y + L + overhang * 0.5,
          zRidge: midZ,
          yEaves: eavesY,
          yRidge: ridgeY
        },
        {
          floorIndex: fIdx,
          componentType: 'gable_wall',
          material: 'Exterior Masonry & Sponge Plaster',
          color: '#e2e8f0',
          roughness: 0.8,
          metalness: 0.05
        }
      ));

      meshes.push(createTriangularGableMesh(
        `roof_gable_east_fp${fpIdx}`,
        'roof_gable_wall',
        {
          x: fp.x + W + 0.25,
          thickness: 0.5,
          zEavesNorth: fp.y - overhang * 0.5,
          zEavesSouth: fp.y + L + overhang * 0.5,
          zRidge: midZ,
          yEaves: eavesY,
          yRidge: ridgeY
        },
        {
          floorIndex: fIdx,
          componentType: 'gable_wall',
          material: 'Exterior Masonry & Sponge Plaster',
          color: '#e2e8f0',
          roughness: 0.8,
          metalness: 0.05
        }
      ));

      // Timber Ridge Beam Cap
      meshes.push(createSolidBoxMesh(
        `roof_ridge_beam_fp${fpIdx}`,
        'roof_ridge_beam',
        {
          minX: fp.x - overhang - 0.2,
          minY: ridgeY - 0.15,
          minZ: midZ - 0.45,
          maxX: fp.x + W + overhang + 0.2,
          maxY: ridgeY + 0.35,
          maxZ: midZ + 0.45
        },
        {
          floorIndex: fIdx,
          componentType: 'ridge_cap',
          material: ridgeMat.name,
          materialId: ridgeMat.id,
          materialDef: ridgeMat,
          color: ridgeMat.baseColor,
          opacity: ridgeMat.opacity,
          roughness: ridgeMat.roughness,
          metalness: ridgeMat.metalness,
          strokeColor: ridgeMat.strokeColor,
          strokeWidth: ridgeMat.strokeWidth,
          provenance: 'EXPLICIT_STYLE_RULE'
        }
      ));

    } else if (style === 'flat_terrace') {
      // Parapet Coping Slabs and Weathering Screed Finish
      const parapetBaseY = floorBaseY + ARCHITECTURAL_DEFAULTS_3D.SLAB_THICKNESS + ARCHITECTURAL_DEFAULTS_3D.PARAPET_HEIGHT;
      const copingThickness = 0.25; // 3 inches
      const copingWidth = ARCHITECTURAL_DEFAULTS_3D.WALL_THICKNESS_EXTERIOR + 0.3; // Slight 1.8-inch overhang

      const copingRuns = [
        { minX: fp.x - 0.2, minZ: fp.y - copingWidth / 2, maxX: fp.x + W + 0.2, maxZ: fp.y + copingWidth / 2 },
        { minX: fp.x - 0.2, minZ: fp.y + L - copingWidth / 2, maxX: fp.x + W + 0.2, maxZ: fp.y + L + copingWidth / 2 },
        { minX: fp.x - copingWidth / 2, minZ: fp.y, maxX: fp.x + copingWidth / 2, maxZ: fp.y + L },
        { minX: fp.x + W - copingWidth / 2, minZ: fp.y, maxX: fp.x + W + copingWidth / 2, maxZ: fp.y + L }
      ];

      copingRuns.forEach((cRun, cIdx) => {
        meshes.push(createSolidBoxMesh(
          `parapet_coping_fp${fpIdx}_${cIdx}`,
          'parapet_coping',
          {
            minX: cRun.minX,
            minY: parapetBaseY,
            minZ: cRun.minZ,
            maxX: cRun.maxX,
            maxY: parapetBaseY + copingThickness,
            maxZ: cRun.maxZ
          },
          {
            floorIndex: fIdx,
            componentType: 'parapet_coping',
            material: 'Chamfered Natural Stone Parapet Coping',
            color: '#cbd5e1',
            roughness: 0.6,
            metalness: 0.1,
            strokeColor: '#94a3b8',
            strokeWidth: 0.6
          }
        ));
      });
    } else if (style === 'pergola_terrace') {
      // Pergola Trellis Beams over open terrace
      const pergolaBaseY = floorBaseY + ARCHITECTURAL_DEFAULTS_3D.SLAB_THICKNESS;
      const pergolaHeight = 8.5;

      const postLocations = [
        { x: fp.x + 1.0, z: fp.y + 1.0 },
        { x: fp.x + W - 1.0, z: fp.y + 1.0 },
        { x: fp.x + 1.0, z: fp.y + L - 1.0 },
        { x: fp.x + W - 1.0, z: fp.y + L - 1.0 }
      ];

      postLocations.forEach((pt, pIdx) => {
        meshes.push(createSolidBoxMesh(
          `pergola_post_fp${fpIdx}_${pIdx}`,
          'pergola_support_post',
          {
            minX: pt.x - 0.2,
            minY: pergolaBaseY,
            minZ: pt.z - 0.2,
            maxX: pt.x + 0.2,
            maxY: pergolaBaseY + pergolaHeight,
            maxZ: pt.z + 0.2
          },
          {
            floorIndex: fIdx,
            componentType: 'pergola_post',
            material: pergolaMat.name,
            materialId: pergolaMat.id,
            materialDef: pergolaMat,
            color: pergolaMat.baseColor,
            opacity: pergolaMat.opacity,
            roughness: pergolaMat.roughness,
            metalness: pergolaMat.metalness,
            strokeColor: pergolaMat.strokeColor,
            strokeWidth: pergolaMat.strokeWidth,
            provenance: 'EXPLICIT_STYLE_RULE'
          }
        ));
      });

      // 2 Longitudinal Runner Beams
      [-0.1, 0.1].forEach((_offset, rIdx) => {
        const beamZ = rIdx === 0 ? fp.y + 1.0 : fp.y + L - 1.0;
        meshes.push(createSolidBoxMesh(
          `pergola_runner_fp${fpIdx}_${rIdx}`,
          'pergola_runner_beam',
          {
            minX: fp.x + 0.5,
            minY: pergolaBaseY + pergolaHeight - 0.6,
            minZ: beamZ - 0.15,
            maxX: fp.x + W - 0.5,
            maxY: pergolaBaseY + pergolaHeight,
            maxZ: beamZ + 0.15
          },
          {
            floorIndex: fIdx,
            componentType: 'pergola_runner',
            material: pergolaMat.name,
            materialId: pergolaMat.id,
            materialDef: pergolaMat,
            color: pergolaMat.baseColor,
            opacity: pergolaMat.opacity,
            roughness: pergolaMat.roughness,
            metalness: pergolaMat.metalness,
            strokeColor: pergolaMat.strokeColor,
            strokeWidth: pergolaMat.strokeWidth,
            provenance: 'EXPLICIT_STYLE_RULE'
          }
        ));
      });

      // Transverse Cross-Rafter Trellis Bars
      const numRafters = Math.max(3, Math.floor(W / 2.5));
      const stepX = (W - 2.0) / (numRafters - 1);

      for (let r = 0; r < numRafters; r++) {
        const rafterX = fp.x + 1.0 + r * stepX;
        meshes.push(createSolidBoxMesh(
          `pergola_rafter_fp${fpIdx}_${r}`,
          'pergola_cross_rafter',
          {
            minX: rafterX - 0.12,
            minY: pergolaBaseY + pergolaHeight,
            minZ: fp.y + 0.5,
            maxX: rafterX + 0.12,
            maxY: pergolaBaseY + pergolaHeight + 0.35,
            maxZ: fp.y + L - 0.5
          },
          {
            floorIndex: fIdx,
            componentType: 'pergola_rafter',
            material: pergolaMat.name,
            materialId: pergolaMat.id,
            materialDef: pergolaMat,
            color: pergolaMat.baseColor,
            opacity: pergolaMat.opacity,
            roughness: pergolaMat.roughness,
            metalness: pergolaMat.metalness,
            strokeColor: pergolaMat.strokeColor,
            strokeWidth: pergolaMat.strokeWidth,
            provenance: 'EXPLICIT_STYLE_RULE'
          }
        ));
      }

    } else if (style === 'stepped_parapet') {
      // Stepped sculpted parapet with corner feature piers
      const parapetBaseY = floorBaseY + ARCHITECTURAL_DEFAULTS_3D.SLAB_THICKNESS;
      const cornerPillars = [
        { x: fp.x, z: fp.y },
        { x: fp.x + W, z: fp.y },
        { x: fp.x + W, z: fp.y + L },
        { x: fp.x, z: fp.y + L }
      ];

      cornerPillars.forEach((cp, cpIdx) => {
        meshes.push(createSolidBoxMesh(
          `stepped_parapet_pier_fp${fpIdx}_${cpIdx}`,
          'parapet_feature_pier',
          {
            minX: cp.x - 0.6,
            minY: parapetBaseY,
            minZ: cp.z - 0.6,
            maxX: cp.x + 0.6,
            maxY: parapetBaseY + 4.5,
            maxZ: cp.z + 0.6
          },
          {
            floorIndex: fIdx,
            componentType: 'parapet_pier',
            material: pierMat.name,
            materialId: pierMat.id,
            materialDef: pierMat,
            color: pierMat.baseColor,
            opacity: pierMat.opacity,
            roughness: pierMat.roughness,
            metalness: pierMat.metalness,
            strokeColor: pierMat.strokeColor,
            strokeWidth: pierMat.strokeWidth,
            provenance: 'EXPLICIT_STYLE_RULE'
          }
        ));
      });
    }
  });

  return meshes;
}

/**
 * Generates solid 3D cantilevered weather-shades (chajjas) over exterior windows.
 * 
 * @param {Array<Object>} windowOpenings - Exterior window openings [{ x, y, width, wall }]
 * @param {number} floorBaseY - Base elevation of the floor
 * @param {Object} [options] - Options { floorIndex }
 * @returns {Array<Object>} Solid 3D chajja meshes
 */
export function generateWindowChajjas3d(windowOpenings = [], floorBaseY = 0, options = {}) {
  const chajjas = [];
  const fIdx = options.floorIndex || 0;
  const lintelY = floorBaseY + 7.0; // Standard 7.0 ft lintel elevation
  const chajjaDepth = 1.5;          // 1.5 ft cantilever outward projection
  const chajjaThick = 0.25;         // 3-inch thick RCC weather-shade slab
  const jambExtension = 0.5;        // 0.5 ft extension past window jambs
  const archStyle = options.style || 'modern_contemporary';
  const chajjaMat = getMaterialForComponent('chajja', archStyle, options);

  windowOpenings.forEach((w, wIdx) => {
    if (w.x === undefined || w.y === undefined) return;

    const width = w.width || 4.0;
    const wallOrientation = w.wall || 'north';

    let minX, maxX, minZ, maxZ;

    if (wallOrientation === 'north' || wallOrientation === 'south') {
      minX = w.x - width / 2 - jambExtension;
      maxX = w.x + width / 2 + jambExtension;
      if (wallOrientation === 'north') {
        minZ = w.y - chajjaDepth;
        maxZ = w.y;
      } else {
        minZ = w.y;
        maxZ = w.y + chajjaDepth;
      }
    } else {
      minZ = w.y - width / 2 - jambExtension;
      maxZ = w.y + width / 2 + jambExtension;
      if (wallOrientation === 'west') {
        minX = w.x - chajjaDepth;
        maxX = w.x;
      } else {
        minX = w.x;
        maxX = w.x + chajjaDepth;
      }
    }

    chajjas.push(createSolidBoxMesh(
      `chajja_w_${fIdx}_${wIdx}`,
      'window_chajja_sunshade',
      {
        minX: Number(minX.toFixed(2)),
        minY: Number(lintelY.toFixed(2)),
        minZ: Number(minZ.toFixed(2)),
        maxX: Number(maxX.toFixed(2)),
        maxY: Number((lintelY + chajjaThick).toFixed(2)),
        maxZ: Number(maxZ.toFixed(2))
      },
      {
        floorIndex: fIdx,
        componentType: 'sunshade_chajja',
        material: chajjaMat.name,
        materialId: chajjaMat.id,
        materialDef: chajjaMat,
        color: chajjaMat.baseColor,
        opacity: chajjaMat.opacity,
        roughness: chajjaMat.roughness,
        metalness: chajjaMat.metalness,
        strokeColor: chajjaMat.strokeColor,
        strokeWidth: chajjaMat.strokeWidth,
        provenance: 'TROPICAL_CLIMATE_PASSIVE_RULE'
      }
    ));
  });

  return chajjas;
}

// =============================================================================
// 5. MASTER PROCEDURAL 3D BUILDING GENERATOR
// =============================================================================

/**
 * Procedurally generates a complete, mathematically exact 3D building model
 * derived directly from the canonical architectural design model.
 * 
 * @param {Object} canonicalDesign - Canonical design model payload (v2.0.0)
 * @param {Object} [options] - Generation options { units, includeDiagnostics, rooflineStyle, facadeModulation }
 * @returns {Object} Complete Procedural 3D Building Model
 */
export function generateProceduralBuilding3d(canonicalDesign, options = {}) {
  const diagnostics = [];

  if (!canonicalDesign || typeof canonicalDesign !== 'object') {
    throw new TypeError('generateProceduralBuilding3d requires a valid canonical design object.');
  }

  const { site, floors = [], structuralGrid = {} } = canonicalDesign;
  if (!site || !site.buildableEnvelope) {
    throw new Error('Canonical design must contain site and buildableEnvelope definitions.');
  }

  const env = site.buildableEnvelope;
  const floorCount = floors.length;
  const style = options.style || canonicalDesign?.inputs?.archStyle || canonicalDesign?.metadata?.style || 'modern_contemporary';

  // Calculate authoritative vertical floor elevations
  const elevResult = calculateFloorElevations(floors, {
    clearHeight: ARCHITECTURAL_DEFAULTS_3D.CLEAR_CEILING_HEIGHT,
    slabThickness: ARCHITECTURAL_DEFAULTS_3D.SLAB_THICKNESS,
    plinthHeight: ARCHITECTURAL_DEFAULTS_3D.PLINTH_HEIGHT,
    parapetHeight: ARCHITECTURAL_DEFAULTS_3D.PARAPET_HEIGHT
  });

  const floorElevationSpecs = elevResult?.floorElevations || [];
  const totalBuildingHeight = elevResult?.totalBuildingHeightFt || floorElevationSpecs.reduce((maxH, fl) => Math.max(maxH, fl.topElevationY || fl.baseElevationY + 10.0), 0);

  // Geometry Collections
  const allMeshes = [];
  const floorAssemblies = [];

  // 1. Foundation Plinth Platform (Ground datum Y = 0 to 1.5 ft)
  const groundFootprints = getFloorFootprints(floors[0], env);
  const plinthMat = getMaterialForComponent('foundation_plinth', style, options);
  groundFootprints.forEach((fp, fpIdx) => {
    const plinthId = groundFootprints.length === 1 ? 'slab_foundation_plinth' : `slab_foundation_plinth_${fpIdx}`;
    const plinthMesh = createSolidBoxMesh(
      plinthId,
      'foundation_plinth',
      {
        minX: fp.x - 0.75,
        minY: 0,
        minZ: fp.y - 0.75,
        maxX: fp.x + fp.width + 0.75,
        maxY: ARCHITECTURAL_DEFAULTS_3D.PLINTH_HEIGHT,
        maxZ: fp.y + fp.length + 0.75
      },
      {
        componentType: 'foundation_plinth',
        material: plinthMat.name,
        materialId: plinthMat.id,
        materialDef: plinthMat,
        color: plinthMat.baseColor,
        opacity: plinthMat.opacity,
        roughness: plinthMat.roughness,
        metalness: plinthMat.metalness,
        strokeColor: plinthMat.strokeColor,
        strokeWidth: plinthMat.strokeWidth,
        provenance: 'ASSUMED_DEFAULT'
      }
    );
    allMeshes.push(plinthMesh);
  });

  // 2. Structural RCC Columns
  const columnMeshes = generateStructuralColumns3d(structuralGrid, totalBuildingHeight, { ...options, style });
  allMeshes.push(...columnMeshes);

  // Identify stairwell footprint across floors for slab cutout voids
  const groundStairRoom = floors[0]?.rooms?.find(r => r.type === 'stairwell');
  const stairwellBounds = groundStairRoom?.bounds || null;

  // Track rooftop terrace parapet generation to prevent duplication across floors
  let terraceParapetGenerated = false;

  // 3. Process each Floor
  floors.forEach((fl, fIdx) => {
    const elevSpec = floorElevationSpecs[fIdx] || {
      baseElevationY: fIdx * 10.5 + 1.5,
      clearHeight: 10.0,
      clearCeilingHeightFt: 10.0,
      topElevationY: fIdx * 10.5 + 12.0,
      slabThickness: 0.5,
      isTerrace: Boolean(fl.isTerrace) || (fl.name || '').toLowerCase().includes('terrace') || Boolean((fl.rooms || []).some(r => r.id === 't_mumty' || (r.name || '').toLowerCase().includes('mumty'))) || (floors.length <= 3 && fIdx >= 2)
    };

    const isTerrace = elevSpec.isTerrace;
    const floorBaseY = elevSpec.baseElevationY;
    const effectiveClearHeight = elevSpec.clearCeilingHeightFt || elevSpec.clearHeight || ARCHITECTURAL_DEFAULTS_3D.CLEAR_CEILING_HEIGHT;
    const floorMeshes = {
      slabs: [],
      walls: [],
      openings: [],
      stairs: [],
      balconies: [],
      rooms: []
    };

    // A. Floor Slabs (Ground Floor is plinth top; Upper floors get RCC slabs with stair cutout)
    if (fIdx > 0) {
      const slabElevationY = floorBaseY - ARCHITECTURAL_DEFAULTS_3D.SLAB_THICKNESS;
      const floorFootprints = getFloorFootprints(fl, env);
      const slabMat = getMaterialForComponent(isTerrace ? 'roof_terrace_slab' : 'intermediate_rcc_slab', style, options);

      floorFootprints.forEach((fp, fpIdx) => {
        const hasStairCutout = !isTerrace && stairwellBounds &&
          stairwellBounds.x >= fp.x - 0.1 &&
          stairwellBounds.x + stairwellBounds.width <= fp.x + fp.width + 0.1 &&
          stairwellBounds.y >= fp.y - 0.1 &&
          stairwellBounds.y + stairwellBounds.length <= fp.y + fp.length + 0.1;

        const slabId = floorFootprints.length === 1 ? `slab_level_${fIdx}` : `slab_level_${fIdx}_${fpIdx}`;
        const slabMeshes = generateFloorSlabWithCutouts(
          slabId,
          isTerrace ? 'roof_terrace_slab' : 'intermediate_rcc_slab',
          fp,
          slabElevationY,
          ARCHITECTURAL_DEFAULTS_3D.SLAB_THICKNESS,
          hasStairCutout ? stairwellBounds : null,
          {
            floorIndex: fIdx,
            material: slabMat.name,
            materialId: slabMat.id,
            materialDef: slabMat,
            color: slabMat.baseColor,
            opacity: slabMat.opacity,
            roughness: slabMat.roughness,
            metalness: slabMat.metalness,
            strokeColor: slabMat.strokeColor,
            strokeWidth: slabMat.strokeWidth
          }
        );
        floorMeshes.slabs.push(...slabMeshes);
        allMeshes.push(...slabMeshes);
      });
    }

    // B. Collect all door and window definitions for this floor with deterministic IDs
    const floorOpenings = [];
    let opCounter = 1;
    const registerOp = (rawOp, defaultType, roomRef = null) => {
      const opId = rawOp.id || `${defaultType}_fl${fIdx}_${opCounter++}`;
      floorOpenings.push({
        ...rawOp,
        id: opId,
        type: rawOp.type || defaultType,
        roomRef: roomRef || rawOp.roomRef || null
      });
    };

    (fl.doors || []).forEach(d => registerOp(d, 'door'));
    (fl.windows || []).forEach(w => registerOp(w, 'window'));

    (fl.rooms || []).forEach(rm => {
      (rm.doors || []).forEach(d => registerOp(d, 'door', rm.id));
      (rm.windows || []).forEach(w => registerOp(w, 'window', rm.id));
    });

    // C. Procedural Walls with Real Openings and Duplicate Wall Elimination
    const processedWallKeys = new Set();
    const matchedOpeningIds = new Set();

    (fl.walls || []).forEach(w => {
      const x1 = Math.min(w.start.x, w.end.x);
      const y1 = Math.min(w.start.y, w.end.y);
      const x2 = Math.max(w.start.x, w.end.x);
      const y2 = Math.max(w.start.y, w.end.y);
      const wallKey = `${x1.toFixed(2)}_${y1.toFixed(2)}_${x2.toFixed(2)}_${y2.toFixed(2)}`;

      if (processedWallKeys.has(wallKey)) {
        diagnostics.push({
          severity: 'WARNING',
          componentType: 'wall',
          componentId: w.id,
          message: `Duplicate colinear wall ${w.id} on floor ${fIdx} was skipped to avoid overlapping geometry.`,
          status: 'SKIPPED'
        });
        return;
      }
      processedWallKeys.add(wallKey);

      const { solidBlocks, openingComponents, matchedOpIds } = generateWallWithRealOpenings(
        w,
        floorOpenings,
        {
          ...options,
          style,
          floorIndex: fIdx,
          elevationY: floorBaseY,
          clearHeight: effectiveClearHeight,
          clearCeilingHeightFt: effectiveClearHeight,
          isTerrace
        },
        diagnostics
      );

      (matchedOpIds || []).forEach(id => matchedOpeningIds.add(id));

      floorMeshes.walls.push(...solidBlocks);
      floorMeshes.openings.push(...openingComponents);
      allMeshes.push(...solidBlocks, ...openingComponents);
    });

    // Check for unmatched openings (invalid host-wall references or coordinate mismatch)
    floorOpenings.forEach(op => {
      if (op.id && !matchedOpeningIds.has(op.id)) {
        diagnostics.push({
          severity: 'WARNING',
          componentType: op.type || 'opening',
          componentId: op.id,
          sourceId: op.wallId || op.wall || null,
          message: `Opening ${op.id} (${op.type || 'opening'}, wall: '${op.wall || op.wallId || 'unspecified'}') could not be matched to any host wall on floor ${fIdx}.`,
          status: 'SKIPPED'
        });
      }
    });

    // D. 3D Staircase (Ground to First floor)
    if (fIdx === 0 && stairwellBounds && floorCount >= 2) {
      const stairMeshes = generateProceduralStaircase3d(
        groundStairRoom,
        floorBaseY,
        ARCHITECTURAL_DEFAULTS_3D.CLEAR_CEILING_HEIGHT + ARCHITECTURAL_DEFAULTS_3D.SLAB_THICKNESS,
        { ...options, style, floorIndex: 0 }
      );
      floorMeshes.stairs.push(...stairMeshes);
      allMeshes.push(...stairMeshes);
    }

    // E. Balconies & Railings (Upper floors)
    (fl.rooms || []).forEach(rm => {
      if (rm.type === 'balcony' && fIdx > 0 && rm.bounds) {
        const balconyMeshes = generateBalcony3d(rm, floorBaseY, { ...options, style, floorIndex: fIdx });
        floorMeshes.balconies.push(...balconyMeshes);
        allMeshes.push(...balconyMeshes);
      }
    });

    // E2. Cantilevered Window Weather-shades (Chajjas) for passive solar shading
    const facadeModulation = options.facadeModulation || canonicalDesign.inputs?.facadeModulation || null;
    if (facadeModulation === 'projecting_chajjas' || options.includeChajjas) {
      const extWindows = (fl.windows || []).concat(
        (fl.rooms || []).flatMap(rm => rm.windows || [])
      );
      if (extWindows.length > 0) {
        const chajjas = generateWindowChajjas3d(extWindows, floorBaseY, { ...options, style, floorIndex: fIdx });
        floorMeshes.openings.push(...chajjas);
        allMeshes.push(...chajjas);
      }
    }

    // F. Rooftop Parapet Wall & Procedural Roofline (for Terrace Level or Top Floor)
    const activeRoofline = resolveProceduralRooflineStyle(options, canonicalDesign);
    const isTopOrTerrace = isTerrace || (fIdx === floors.length - 1);

    if (isTopOrTerrace) {
      const topFootprints = getFloorFootprints(fl, env);

      // In a building without a dedicated terrace floor, generate solid RCC ceiling/roof slab over top of the walls
      if (!isTerrace && (floorCount === 1 || activeRoofline === 'sloping_pitched')) {
        const roofSlabElevationY = floorBaseY + effectiveClearHeight;
        const roofSlabMat = getMaterialForComponent('roof_terrace_slab', style, options);

        topFootprints.forEach((tfp, tfIdx) => {
          const roofSlabMeshes = generateFloorSlabWithCutouts(
            `slab_roof_top_${fIdx}_${tfIdx}`,
            'roof_terrace_slab',
            tfp,
            roofSlabElevationY,
            ARCHITECTURAL_DEFAULTS_3D.SLAB_THICKNESS,
            null,
            {
              floorIndex: fIdx,
              material: roofSlabMat.name,
              materialId: roofSlabMat.id,
              materialDef: roofSlabMat,
              color: roofSlabMat.baseColor,
              opacity: roofSlabMat.opacity,
              roughness: roofSlabMat.roughness,
              metalness: roofSlabMat.metalness,
              strokeColor: roofSlabMat.strokeColor,
              strokeWidth: roofSlabMat.strokeWidth
            }
          );
          floorMeshes.slabs.push(...roofSlabMeshes);
          allMeshes.push(...roofSlabMeshes);
        });
      }

      // If terrace floor has stairhead mumty, cap it with an RCC headroom roof slab
      if (isTerrace) {
        const mumtyRoom = (fl.rooms || []).find(r => r.id === 't_mumty');
        if (mumtyRoom && mumtyRoom.bounds) {
          const mumtySlabMat = getMaterialForComponent('roof_terrace_slab', style, options);
          const mumtyRoofElevationY = floorBaseY + 8.5; // 8.5 ft clear mumty headroom
          const mumtyRoofMeshes = generateFloorSlabWithCutouts(
            `slab_mumty_roof_${fIdx}`,
            'roof_terrace_slab',
            mumtyRoom.bounds,
            mumtyRoofElevationY,
            ARCHITECTURAL_DEFAULTS_3D.SLAB_THICKNESS,
            null,
            {
              floorIndex: fIdx,
              material: mumtySlabMat.name,
              materialId: mumtySlabMat.id,
              materialDef: mumtySlabMat,
              color: mumtySlabMat.baseColor,
              opacity: mumtySlabMat.opacity,
              roughness: mumtySlabMat.roughness,
              metalness: mumtySlabMat.metalness,
              strokeColor: mumtySlabMat.strokeColor,
              strokeWidth: mumtySlabMat.strokeWidth
            }
          );
          floorMeshes.slabs.push(...mumtyRoofMeshes);
          allMeshes.push(...mumtyRoofMeshes);
        }
      }

      const parapetBaseY = (!isTerrace && (floorCount === 1 || activeRoofline === 'sloping_pitched'))
        ? floorBaseY + effectiveClearHeight + ARCHITECTURAL_DEFAULTS_3D.SLAB_THICKNESS
        : floorBaseY;

      // Generate styled roofline if specified (sloping pitched tiles, pergola trellis, stepped piers)
      if (activeRoofline && activeRoofline !== 'flat_terrace') {
        const rooflineMeshes = generateProceduralRoofline3d(activeRoofline, topFootprints, parapetBaseY, { ...options, style, floorIndex: fIdx });
        floorMeshes.walls.push(...rooflineMeshes);
        allMeshes.push(...rooflineMeshes);
      }

      // Parapet perimeter geometry is generated along the terrace footprint independently of whether mumty walls exist
      const needsParapet = activeRoofline !== 'sloping_pitched';
      if (needsParapet && !terraceParapetGenerated) {
        terraceParapetGenerated = true;
        const parapetThickness = ARCHITECTURAL_DEFAULTS_3D.WALL_THICKNESS_EXTERIOR;
        const parapetHeight = ARCHITECTURAL_DEFAULTS_3D.PARAPET_HEIGHT;
        const parapetMat = getMaterialForComponent('parapet', style, options);

        topFootprints.forEach((tfp, tfIdx) => {
          const corners = [
            { start: { x: tfp.x, y: tfp.y }, end: { x: tfp.x + tfp.width, y: tfp.y } },
            { start: { x: tfp.x + tfp.width, y: tfp.y }, end: { x: tfp.x + tfp.width, y: tfp.y + tfp.length } },
            { start: { x: tfp.x + tfp.width, y: tfp.y + tfp.length }, end: { x: tfp.x, y: tfp.y + tfp.length } },
            { start: { x: tfp.x, y: tfp.y + tfp.length }, end: { x: tfp.x, y: tfp.y } }
          ];

          corners.forEach((p, pIdx) => {
            const parapetKey = `parapet_${fIdx}_${tfIdx}_${pIdx}`;
            if (processedWallKeys.has(parapetKey)) return;
            processedWallKeys.add(parapetKey);

            const pMesh = createOrientedWallPrism(
              `parapet_wall_fp${tfIdx}_${pIdx}`,
              'parapet_wall',
              p.start,
              p.end,
              parapetThickness,
              parapetBaseY,
              parapetHeight,
              {
                floorIndex: fIdx,
                componentType: 'parapet',
                wallType: 'wall_exterior',
                material: parapetMat.name,
                materialId: parapetMat.id,
                materialDef: parapetMat,
                color: parapetMat.baseColor,
                opacity: parapetMat.opacity,
                roughness: parapetMat.roughness,
                metalness: parapetMat.metalness,
                strokeColor: parapetMat.strokeColor,
                strokeWidth: parapetMat.strokeWidth,
                provenance: 'ASSUMED_DEFAULT'
              }
            );
            floorMeshes.walls.push(pMesh);
            allMeshes.push(pMesh);
          });
        });
      }
    }

    floorAssemblies.push({
      floorIndex: fIdx,
      elevationY: floorBaseY,
      clearHeight: effectiveClearHeight,
      isTerrace,
      components: floorMeshes
    });
  });

  // 12. Procedural Interior Furniture & Fit-Out Generation (Sprint 4, Task S4-T02 / S4-T05)
  let furnishings = null;
  if (options.includeFurniture !== false) {
    try {
      furnishings = (options.furnishings || canonicalDesign.furnishings) || generateDesignFurniture(canonicalDesign, options);
      if (Array.isArray(furnishings?.meshes) && furnishings.meshes.length > 0) {
        allMeshes.push(...furnishings.meshes);
      }
    } catch (furnErr) {
      console.warn('[3dBuilding] Procedural furniture generation skipped due to error:', furnErr.message);
    }
  }

  // 13. Procedural Landscape, Garden & Outdoor Living Generation (Sprint 4, Task S4-T03 / S4-T05)
  let landscape = null;
  if (options.includeLandscape !== false) {
    try {
      landscape = (options.landscape || canonicalDesign.landscape) || generatePropertyLandscape(canonicalDesign, options);
      if (Array.isArray(landscape?.meshes) && landscape.meshes.length > 0) {
        allMeshes.push(...landscape.meshes);
      }
    } catch (landErr) {
      console.warn('[3dBuilding] Procedural landscape generation skipped due to error:', landErr.message);
    }
  }

  // 13B. Procedural Electrical Appliances & Lighting Generation
  let electrical = null;
  if (options.includeElectrical !== false) {
    try {
      electrical = (options.electrical || canonicalDesign.electrical) || generatePropertyElectrical(canonicalDesign, options);
      if (Array.isArray(electrical?.meshes) && electrical.meshes.length > 0) {
        allMeshes.push(...electrical.meshes);
      }
    } catch (elecErr) {
      console.warn('[3dBuilding] Procedural electrical generation skipped due to error:', elecErr.message);
    }
  }

  // 14. Custom Material Overrides (Sprint 4, Task S4-T05)
  const customMaterials = options.customMaterials || canonicalDesign.customMaterials || null;
  if (customMaterials && typeof customMaterials === 'object') {
    allMeshes.forEach(m => {
      const directKey = customMaterials[m.id] || customMaterials[m.metadata?.sourceItemId];
      if (directKey) {
        const mat = resolveMaterial(directKey, { baseColor: m.color });
        m.materialId = mat.id;
        m.materialDef = mat;
        m.color = mat.baseColor;
      } else if (customMaterials.exterior_facade && (m.componentType === 'wall_exterior' || m.metadata?.wallType === 'wall_exterior')) {
        const mat = resolveMaterial(customMaterials.exterior_facade, { baseColor: m.color });
        m.materialId = mat.id;
        m.materialDef = mat;
        m.color = mat.baseColor;
      }
    });
  }

  // Calculate Global 3D Bounding Box
  let minX = Infinity, minY = Infinity, minZ = Infinity;
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;

  allMeshes.forEach(m => {
    if (m.bounds) {
      minX = Math.min(minX, m.bounds.min[0]);
      minY = Math.min(minY, m.bounds.min[1]);
      minZ = Math.min(minZ, m.bounds.min[2]);
      maxX = Math.max(maxX, m.bounds.max[0]);
      maxY = Math.max(maxY, m.bounds.max[1]);
      maxZ = Math.max(maxZ, m.bounds.max[2]);
    }
  });

  const compoundBounds = {
    min: [Number(minX.toFixed(3)), Number(minY.toFixed(3)), Number(minZ.toFixed(3))],
    max: [Number(maxX.toFixed(3)), Number(maxY.toFixed(3)), Number(maxZ.toFixed(3))],
    width: Number((maxX - minX).toFixed(3)),
    height: Number((maxY - minY).toFixed(3)),
    depth: Number((maxZ - minZ).toFixed(3))
  };

  const totalVertices = allMeshes.reduce((acc, m) => acc + (m.vertices?.length || 0), 0);
  const totalFaces = allMeshes.reduce((acc, m) => acc + (m.faces?.length || 0), 0);

  return {
    id: `building_3d_${canonicalDesign.id || 'canon'}`,
    sourceDesignId: canonicalDesign.id || null,
    units: 'feet',
    coordinateSystem: COORDINATE_SYSTEM_CONTRACT.CONVENTION,
    bounds: compoundBounds,
    dimensionsMetric: {
      widthMeters: feetToMeters(compoundBounds.width),
      heightMeters: feetToMeters(compoundBounds.height),
      depthMeters: feetToMeters(compoundBounds.depth)
    },
    floors: floorAssemblies,
    furnishings,
    furnitureCount: furnishings?.totalItemCount || 0,
    landscape,
    landscapeCount: landscape?.landscapeObjects?.length || 0,
    electrical,
    electricalCount: electrical?.appliances?.length || 0,
    meshes: allMeshes,
    diagnostics,
    style,
    architecturalStyle: style,
    materialCatalogVersion: '3.0.0-s3-t04',
    stats: {
      totalMeshes: allMeshes.length,
      totalVertices,
      totalFaces,
      totalFloors: floorCount,
      totalColumns: columnMeshes.length,
      totalFurnitureItems: furnishings?.totalItemCount || 0,
      totalFurnitureMeshes: furnishings?.totalMeshesCount || 0,
      furnishedRoomsCount: furnishings?.furnishedRoomsCount || 0,
      totalLandscapeObjects: landscape?.landscapeObjects?.length || 0,
      totalLandscapeMeshes: landscape?.meshes?.length || 0,
      totalElectricalAppliances: electrical?.appliances?.length || 0,
      totalElectricalMeshes: electrical?.meshes?.length || 0,
      hasLandscape: Boolean(landscape && landscape.meshes?.length > 0),
      hasElectrical: Boolean(electrical && electrical.meshes?.length > 0),
      hasStaircase: Boolean(groundStairRoom && floorCount >= 2),
      hasPlinth: true
    }
  };
}
