/**
 * LabourConnect Design Engine - 3D Landscape & Outdoor Living Solid Mesh Builder
 * 
 * Generates genuine 3D solid geometry (vertices, quad faces, surface normal unit vectors,
 * bounds, and outlines) for residential landscape, garden, and boundary elements.
 */

import { LANDSCAPE_TYPES } from './landscapeCatalog.js';

/**
 * Creates a solid 3D cuboid mesh with 8 vertices, 6 planar quad faces, and unit normal vectors.
 */
export function createSolidBoxMesh(id, componentType, bounds, matDef = {}) {
  const { minX, minY, minZ, maxX, maxY, maxZ } = bounds;

  const vertices = [
    [minX, minY, maxZ], // 0: Bottom-Front-Left
    [maxX, minY, maxZ], // 1: Bottom-Front-Right
    [maxX, maxY, maxZ], // 2: Top-Front-Right
    [minX, maxY, maxZ], // 3: Top-Front-Left
    [minX, minY, minZ], // 4: Bottom-Rear-Left
    [maxX, minY, minZ], // 5: Bottom-Rear-Right
    [maxX, maxY, minZ], // 6: Top-Rear-Right
    [minX, maxY, minZ]  // 7: Top-Rear-Left
  ];

  const faces = [
    { indices: [0, 1, 2, 3], normal: [0, 0, 1] },   // Front (+Z)
    { indices: [5, 4, 7, 6], normal: [0, 0, -1] },  // Rear (-Z)
    { indices: [3, 2, 6, 7], normal: [0, 1, 0] },   // Top (+Y)
    { indices: [4, 5, 1, 0], normal: [0, -1, 0] },  // Bottom (-Y)
    { indices: [4, 0, 3, 7], normal: [-1, 0, 0] },  // Left (-X)
    { indices: [1, 5, 6, 2], normal: [1, 0, 0] }    // Right (+X)
  ];

  return {
    id,
    type: componentType,
    componentType,
    isLandscape: true,
    floorIndex: 0,
    bounds: {
      min: [minX, minY, minZ],
      max: [maxX, maxY, maxZ]
    },
    vertices,
    faces,
    color: matDef.color || '#15803d',
    strokeColor: matDef.strokeColor || '#166534',
    strokeWidth: matDef.strokeWidth || 0.8,
    opacity: matDef.opacity ?? 1.0,
    roughness: matDef.roughness ?? 0.8,
    metalness: matDef.metalness ?? 0.05,
    materialKey: matDef.materialKey || componentType,
    metadata: {
      componentType,
      isLandscape: true,
      ...matDef.metadata
    }
  };
}

/**
 * Creates a tapered solid prism (e.g. pyramidal tree canopy or tapered trunk).
 */
export function createTaperedPrismMesh(id, componentType, btmBox, topBox, matDef = {}) {
  const vertices = [
    [btmBox.minX, btmBox.y, btmBox.maxZ], // 0
    [btmBox.maxX, btmBox.y, btmBox.maxZ], // 1
    [topBox.maxX, topBox.y, topBox.maxZ], // 2
    [topBox.minX, topBox.y, topBox.maxZ], // 3
    [btmBox.minX, btmBox.y, btmBox.minZ], // 4
    [btmBox.maxX, btmBox.y, btmBox.minZ], // 5
    [topBox.maxX, topBox.y, topBox.minZ], // 6
    [topBox.minX, topBox.y, topBox.minZ]  // 7
  ];

  const faces = [
    { indices: [0, 1, 2, 3], normal: [0, 0.35, 0.93] },   // Front (+Z)
    { indices: [5, 4, 7, 6], normal: [0, 0.35, -0.93] },  // Rear (-Z)
    { indices: [3, 2, 6, 7], normal: [0, 1, 0] },         // Top (+Y)
    { indices: [4, 5, 1, 0], normal: [0, -1, 0] },        // Bottom (-Y)
    { indices: [4, 0, 3, 7], normal: [-0.93, 0.35, 0] },  // Left (-X)
    { indices: [1, 5, 6, 2], normal: [0.93, 0.35, 0] }   // Right (+X)
  ];

  const minX = Math.min(btmBox.minX, topBox.minX);
  const maxX = Math.max(btmBox.maxX, topBox.maxX);
  const minY = Math.min(btmBox.y, topBox.y);
  const maxY = Math.max(btmBox.y, topBox.y);
  const minZ = Math.min(btmBox.minZ, topBox.minZ);
  const maxZ = Math.max(btmBox.maxZ, topBox.maxZ);

  return {
    id,
    type: componentType,
    componentType,
    isLandscape: true,
    floorIndex: 0,
    bounds: {
      min: [minX, minY, minZ],
      max: [maxX, maxY, maxZ]
    },
    vertices,
    faces,
    color: matDef.color || '#166534',
    strokeColor: matDef.strokeColor || '#14532d',
    strokeWidth: matDef.strokeWidth || 0.8,
    opacity: matDef.opacity ?? 1.0,
    roughness: matDef.roughness ?? 0.85,
    metalness: matDef.metalness ?? 0.02,
    materialKey: matDef.materialKey || componentType,
    metadata: {
      componentType,
      isLandscape: true,
      ...matDef.metadata
    }
  };
}

/**
 * Builds realistic 3D tree solid meshes with trunk and multi-tiered foliage canopy.
 */
export function buildTree3dMeshes(treeItem, treeDef, plotBounds = null) {
  const meshes = [];
  const { x, z } = treeItem.position;
  const dims = treeDef.dimensions;
  const tMat = treeDef.materials.trunk;
  const fMat = treeDef.materials.foliage;

  // Adaptive canopy radius: clamp to ensure canopy vertices never exceed plot boundaries
  let cr = dims.canopyRadius;
  if (plotBounds && plotBounds.plotW && plotBounds.plotL) {
    const margin = 0.4;
    const maxRadius = Math.min(
      dims.canopyRadius,
      x - margin,
      plotBounds.plotW - x - margin,
      z - margin,
      plotBounds.plotL - z - margin
    );
    cr = Math.max(0.9, maxRadius);
  } else if (treeItem.maxCanopyRadius) {
    cr = Math.min(dims.canopyRadius, treeItem.maxCanopyRadius);
  }

  // 1. Solid Tree Trunk
  const tr = dims.trunkRadius;
  const th = dims.trunkHeight;
  meshes.push(createSolidBoxMesh(
    `${treeItem.id}_trunk`,
    'landscape_tree_trunk',
    {
      minX: x - tr, minY: 0, minZ: z - tr,
      maxX: x + tr, maxY: th, maxZ: z + tr
    },
    { color: tMat.color, strokeColor: tMat.stroke, strokeWidth: 0.9, materialKey: 'tree_bark', metadata: { category: 'vegetation' } }
  ));

  // 2. Multi-tiered Foliage Canopy
  if (treeItem.type === LANDSCAPE_TYPES.TREE_ASHOKA_COLUMNAR) {
    // Tall, slender columnar canopy (2 vertical tiers)
    const tierH = (dims.totalHeight - th) / 2;
    
    // Lower column
    meshes.push(createTaperedPrismMesh(
      `${treeItem.id}_canopy_1`,
      'landscape_tree_canopy',
      { minX: x - cr, maxX: x + cr, minZ: z - cr, maxZ: z + cr, y: th - 0.5 },
      { minX: x - cr * 0.8, maxX: x + cr * 0.8, minZ: z - cr * 0.8, maxZ: z + cr * 0.8, y: th + tierH },
      { color: fMat.color, strokeColor: fMat.stroke, metadata: { category: 'vegetation' } }
    ));

    // Upper pointed peak
    meshes.push(createTaperedPrismMesh(
      `${treeItem.id}_canopy_2`,
      'landscape_tree_canopy',
      { minX: x - cr * 0.8, maxX: x + cr * 0.8, minZ: z - cr * 0.8, maxZ: z + cr * 0.8, y: th + tierH },
      { minX: x - 0.2, maxX: x + 0.2, minZ: z - 0.2, maxZ: z + 0.2, y: dims.totalHeight },
      { color: fMat.color, strokeColor: fMat.stroke, metadata: { category: 'vegetation' } }
    ));
  } else {
    // Spreading canopy: 3 layered faceted tiers
    const canopyH = dims.totalHeight - th;
    const stepH = canopyH / 3;

    // Tier 1 (Broad lower canopy)
    meshes.push(createTaperedPrismMesh(
      `${treeItem.id}_canopy_base`,
      'landscape_tree_canopy',
      { minX: x - cr, maxX: x + cr, minZ: z - cr, maxZ: z + cr, y: th },
      { minX: x - cr * 0.85, maxX: x + cr * 0.85, minZ: z - cr * 0.85, maxZ: z + cr * 0.85, y: th + stepH },
      { color: fMat.color, strokeColor: fMat.stroke, metadata: { category: 'vegetation' } }
    ));

    // Tier 2 (Mid canopy)
    const midColor = treeDef.materials.accent?.color || fMat.color;
    meshes.push(createTaperedPrismMesh(
      `${treeItem.id}_canopy_mid`,
      'landscape_tree_canopy',
      { minX: x - cr * 0.85, maxX: x + cr * 0.85, minZ: z - cr * 0.85, maxZ: z + cr * 0.85, y: th + stepH - 0.3 },
      { minX: x - cr * 0.5, maxX: x + cr * 0.5, minZ: z - cr * 0.5, maxZ: z + cr * 0.5, y: th + stepH * 2 },
      { color: midColor, strokeColor: fMat.stroke, metadata: { category: 'vegetation' } }
    ));

    // Tier 3 (Top crown canopy)
    meshes.push(createTaperedPrismMesh(
      `${treeItem.id}_canopy_top`,
      'landscape_tree_canopy',
      { minX: x - cr * 0.5, maxX: x + cr * 0.5, minZ: z - cr * 0.5, maxZ: z + cr * 0.5, y: th + stepH * 2 - 0.3 },
      { minX: x - 0.3, maxX: x + 0.3, minZ: z - 0.3, maxZ: z + 0.3, y: dims.totalHeight },
      { color: fMat.color, strokeColor: fMat.stroke, metadata: { category: 'vegetation' } }
    ));

    // Optional Frangipani decorative blossom crown
    if (treeDef.materials.blossoms) {
      const bMat = treeDef.materials.blossoms;
      meshes.push(createSolidBoxMesh(
        `${treeItem.id}_blossoms`,
        'landscape_tree_blossom',
        {
          minX: x - 0.8, minY: th + stepH * 1.5, minZ: z - 0.8,
          maxX: x + 0.8, maxY: th + stepH * 1.5 + 0.4, maxZ: z + 0.8
        },
        { color: bMat.color, strokeColor: bMat.stroke, strokeWidth: 0.8 }
      ));
    }
  }

  return meshes;
}

/**
 * Builds 3D solid garden shrub mesh.
 */
export function buildShrub3dMeshes(shrubItem, shrubDef, plotBounds = null) {
  const { x, z } = shrubItem.position;
  const dims = shrubDef.dimensions;
  const fMat = shrubDef.materials.foliage;
  let hw = dims.width / 2;
  let hd = dims.depth / 2;

  if (plotBounds && plotBounds.plotW && plotBounds.plotL) {
    const margin = 0.3;
    hw = Math.min(hw, Math.max(0.4, Math.min(x - margin, plotBounds.plotW - x - margin)));
    hd = Math.min(hd, Math.max(0.4, Math.min(z - margin, plotBounds.plotL - z - margin)));
  }

  const meshes = [
    createTaperedPrismMesh(
      `${shrubItem.id}_foliage`,
      'landscape_shrub',
      { minX: x - hw, maxX: x + hw, minZ: z - hd, maxZ: z + hd, y: 0.05 },
      { minX: x - hw * 0.6, maxX: x + hw * 0.6, minZ: z - hd * 0.6, maxZ: z + hd * 0.6, y: dims.height },
      { color: fMat.color, strokeColor: fMat.stroke, metadata: { category: 'vegetation' } }
    )
  ];

  if (shrubDef.materials.blossoms) {
    const bMat = shrubDef.materials.blossoms;
    meshes.push(createSolidBoxMesh(
      `${shrubItem.id}_flowers`,
      'landscape_shrub_flowers',
      {
        minX: x - hw * 0.5, minY: dims.height - 0.4, minZ: z - hd * 0.5,
        maxX: x + hw * 0.5, maxY: dims.height + 0.2, maxZ: z + hd * 0.5
      },
      { color: bMat.color, strokeColor: bMat.stroke }
    ));
  }

  return meshes;
}

/**
 * Builds 3D compound wall perimeter segments with top coping.
 */
export function buildCompoundWallSegmentMeshes(segmentId, start, end, wallDef) {
  const dims = wallDef.defaultDimensions;
  const mat = wallDef.materials;
  const height = dims.height;
  const thickness = dims.thickness;

  // Determine wall orientation
  const isAlongX = Math.abs(end.y - start.y) < 0.1;
  const minX = Math.min(start.x, end.x);
  const maxX = Math.max(start.x, end.x);
  const minZ = Math.min(start.y, end.y);
  const maxZ = Math.max(start.y, end.y);

  let wMinX, wMaxX, wMinZ, wMaxZ;
  if (isAlongX) {
    wMinX = minX;
    wMaxX = maxX;
    wMinZ = minZ - thickness / 2;
    wMaxZ = minZ + thickness / 2;
  } else {
    wMinX = minX - thickness / 2;
    wMaxX = minX + thickness / 2;
    wMinZ = minZ;
    wMaxZ = maxZ;
  }

  const meshes = [
    // 1. Wall Base / Carcass
    createSolidBoxMesh(
      `${segmentId}_wall`,
      'compound_wall',
      { minX: wMinX, minY: 0, minZ: wMinZ, maxX: wMaxX, maxY: height, maxZ: wMaxZ },
      { color: mat.wall.color, strokeColor: mat.wall.stroke, strokeWidth: 0.9, materialKey: 'compound_wall_plaster' }
    ),
    // 2. Weatherproof Coping Band
    createSolidBoxMesh(
      `${segmentId}_coping`,
      'compound_wall_coping',
      {
        minX: wMinX - (isAlongX ? 0 : dims.copingOverhang),
        minY: height,
        minZ: wMinZ - (isAlongX ? dims.copingOverhang : 0),
        maxX: wMaxX + (isAlongX ? 0 : dims.copingOverhang),
        maxY: height + dims.copingHeight,
        maxZ: wMaxZ + (isAlongX ? dims.copingOverhang : 0)
      },
      { color: mat.coping.color, strokeColor: mat.coping.stroke, strokeWidth: 0.8, materialKey: 'concrete_parapet_wall' }
    )
  ];

  return meshes;
}

/**
 * Builds 3D Gate Pillar mesh.
 */
export function buildGatePillarMeshes(pillarItem, pillarDef) {
  const { x, z } = pillarItem.position;
  const dims = pillarDef.defaultDimensions;
  const hw = dims.width / 2;
  const hd = dims.depth / 2;
  const h = dims.height;
  const mat = pillarDef.materials;

  return [
    // Pillar Body
    createSolidBoxMesh(
      `${pillarItem.id}_body`,
      'gate_pillar',
      { minX: x - hw, minY: 0, minZ: z - hd, maxX: x + hw, maxY: h - 0.5, maxZ: z + hd },
      { color: mat.body.color, strokeColor: mat.body.stroke, strokeWidth: 1.0 }
    ),
    // Pyramidal Dressed Granite Cap
    createTaperedPrismMesh(
      `${pillarItem.id}_cap`,
      'gate_pillar_cap',
      { minX: x - hw - 0.1, maxX: x + hw + 0.1, minZ: z - hd - 0.1, maxZ: z + hd + 0.1, y: h - 0.5 },
      { minX: x - 0.2, maxX: x + 0.2, minZ: z - 0.2, maxZ: z + 0.2, y: h + 0.3 },
      { color: mat.cap.color, strokeColor: mat.cap.stroke, strokeWidth: 0.9 }
    )
  ];
}

/**
 * Builds 3D Metal Entrance Gate mesh with frame and horizontal louvers.
 */
export function buildGateMeshes(gateItem, gateDef) {
  const { x, z } = gateItem.position;
  const dims = gateItem.dimensions || gateDef.defaultDimensions;
  const hw = dims.width / 2;
  const hd = (dims.depth || 0.35) / 2;
  const h = dims.height;
  const mat = gateDef.materials;

  const meshes = [
    // Left Stile
    createSolidBoxMesh(`${gateItem.id}_gate_leaf_stile_l`, 'entrance_gate_frame', {
      minX: x - hw, minY: 0.1, minZ: z - hd, maxX: x - hw + 0.25, maxY: h, maxZ: z + hd
    }, { color: mat.frame.color, strokeColor: mat.frame.stroke }),

    // Right Stile
    createSolidBoxMesh(`${gateItem.id}_gate_leaf_stile_r`, 'entrance_gate_frame', {
      minX: x + hw - 0.25, minY: 0.1, minZ: z - hd, maxX: x + hw, maxY: h, maxZ: z + hd
    }, { color: mat.frame.color, strokeColor: mat.frame.stroke }),

    // Top Rail
    createSolidBoxMesh(`${gateItem.id}_gate_leaf_rail_top`, 'entrance_gate_frame', {
      minX: x - hw, minY: h - 0.25, minZ: z - hd, maxX: x + hw, maxY: h, maxZ: z + hd
    }, { color: mat.frame.color, strokeColor: mat.frame.stroke }),

    // Bottom Rail
    createSolidBoxMesh(`${gateItem.id}_gate_leaf_rail_btm`, 'entrance_gate_frame', {
      minX: x - hw, minY: 0.1, minZ: z - hd, maxX: x + hw, maxY: 0.35, maxZ: z + hd
    }, { color: mat.frame.color, strokeColor: mat.frame.stroke })
  ];

  // Horizontal louvers (4 evenly spaced louvers)
  const louverCount = 4;
  const louverH = 0.2;
  const spacing = (h - 0.6) / (louverCount + 1);
  for (let i = 1; i <= louverCount; i++) {
    const ly = 0.35 + i * spacing;
    meshes.push(createSolidBoxMesh(
      `${gateItem.id}_gate_leaf_louver_${i}`,
      'entrance_gate_louver',
      {
        minX: x - hw + 0.25, minY: ly, minZ: z - hd + 0.05,
        maxX: x + hw - 0.25, maxY: ly + louverH, maxZ: z + hd - 0.05
      },
      { color: mat.louvers.color, strokeColor: mat.louvers.stroke, strokeWidth: 0.7 }
    ));
  }

  return meshes;
}

/**
 * Builds 3D Pathway Bollard Light mesh.
 */
export function buildBollardLightMeshes(lightItem, lightDef) {
  const { x, z } = lightItem.position;
  const dims = lightDef.defaultDimensions;
  const hw = dims.width / 2;
  const h = dims.height;
  const mat = lightDef.materials;

  return [
    // Metal Post
    createSolidBoxMesh(
      `${lightItem.id}_pole`,
      'landscape_light_bollard',
      { minX: x - hw, minY: 0.1, minZ: z - hw, maxX: x + hw, maxY: h - 0.5, maxZ: z + hw },
      { color: mat.pole.color, strokeColor: mat.pole.stroke }
    ),
    // Warm Emissive Luminaire Head
    createSolidBoxMesh(
      `${lightItem.id}_head`,
      'landscape_light_luminaire',
      { minX: x - hw + 0.05, minY: h - 0.5, minZ: z - hw + 0.05, maxX: x + hw - 0.05, maxY: h, maxZ: z + hw - 0.05 },
      { color: mat.head.color, strokeColor: mat.head.stroke, strokeWidth: 0.9, opacity: 0.95 }
    )
  ];
}
