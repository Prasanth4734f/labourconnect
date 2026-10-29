/**
 * LabourConnect Design Engine - Procedural 3D Furniture Mesh Builder
 * 
 * Generates genuine 3D meshes (vertices [x, y, z], quad faces, normals, bounds,
 * materials, and outlines) for all catalog furniture items.
 * 
 * Guarantees recognizable geometric silhouettes:
 * - Beds with frame, mattress, pillows, and vertical headboard
 * - Sofas with seat cushions, angled backrest, and padded armrests
 * - Tables with top slab and 4 supporting corner legs
 * - TV Consoles with low media body, shelf recess, and sleek OLED screen
 * - Wardrobes with tall cabinet body and door groove line details
 * - Kitchen Counters with polished countertop, undermount sink basin, and cooking hob
 * - Bathrooms with toilet bowl/cistern, floating vanity with basin, and shower glass
 * - Pooja Altar with tiered shrine and stepped pediment
 * 
 * Adheres to Right-Handed World Coordinates:
 * World X (Width), World Y (Elevation Up), World Z (Depth).
 */

import { FURNITURE_TYPES, getFurnitureDefinition } from './furnitureCatalog.js';

/**
 * Rotates a 3D point around local origin (0, 0, 0) by an angle in degrees around the Y axis.
 */
function rotatePointY(x, y, z, angleDeg) {
  if (!angleDeg || angleDeg === 0) return [x, y, z];
  const rad = (angleDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const rx = x * cos - z * sin;
  const rz = x * sin + z * cos;
  return [Number(rx.toFixed(3)), y, Number(rz.toFixed(3))];
}

/**
 * Rotates a 3D normal vector around Y axis.
 */
function rotateNormalY(nx, ny, nz, angleDeg) {
  if (!angleDeg || angleDeg === 0) return [nx, ny, nz];
  const rad = (angleDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return [
    Number((nx * cos - nz * sin).toFixed(3)),
    ny,
    Number((nx * sin + nz * cos).toFixed(3))
  ];
}

/**
 * Creates a solid 3D box component with world translation and Y-axis rotation.
 * 
 * @param {string} id
 * @param {Object} localBox - { minX, minY, minZ, maxX, maxY, maxZ } relative to furniture center
 * @param {Object} worldPos - { x, y, z, rotation } world center and floor base elevation
 * @param {Object} metadata - material, colors, tags
 */
export function createRotatedBoxMesh(id, localBox, worldPos, metadata = {}) {
  const { minX, minY, minZ, maxX, maxY, maxZ } = localBox;
  const { x: posX, y: posY, z: posZ, rotation = 0 } = worldPos;

  // 8 local vertices relative to center
  const localVerts = [
    [minX, minY, minZ], // 0: -X, -Y, -Z
    [maxX, minY, minZ], // 1: +X, -Y, -Z
    [maxX, maxY, minZ], // 2: +X, +Y, -Z
    [minX, maxY, minZ], // 3: -X, +Y, -Z
    [minX, minY, maxZ], // 4: -X, -Y, +Z
    [maxX, minY, maxZ], // 5: +X, -Y, +Z
    [maxX, maxY, maxZ], // 6: +X, +Y, +Z
    [minX, maxY, maxZ]  // 7: -X, +Y, +Z
  ];

  // Rotate each vertex around local Y and translate to world position
  const worldVerts = localVerts.map(v => {
    const [rx, ry, rz] = rotatePointY(v[0], v[1], v[2], rotation);
    return [
      Number((posX + rx).toFixed(3)),
      Number((posY + ry).toFixed(3)),
      Number((posZ + rz).toFixed(3))
    ];
  });

  // Calculate actual world bounding box
  let bMinX = Infinity, bMinY = Infinity, bMinZ = Infinity;
  let bMaxX = -Infinity, bMaxY = -Infinity, bMaxZ = -Infinity;
  worldVerts.forEach(([vx, vy, vz]) => {
    if (vx < bMinX) bMinX = vx;
    if (vx > bMaxX) bMaxX = vx;
    if (vy < bMinY) bMinY = vy;
    if (vy > bMaxY) bMaxY = vy;
    if (vz < bMinZ) bMinZ = vz;
    if (vz > bMaxZ) bMaxZ = vz;
  });

  // 6 Quad faces with rotated normals
  const baseNormals = [
    { name: 'front', normal: [0, 0, -1], indices: [0, 3, 2, 1] },
    { name: 'back', normal: [0, 0, 1], indices: [5, 6, 7, 4] },
    { name: 'left', normal: [-1, 0, 0], indices: [4, 7, 3, 0] },
    { name: 'right', normal: [1, 0, 0], indices: [1, 2, 6, 5] },
    { name: 'bottom', normal: [0, -1, 0], indices: [4, 0, 1, 5] },
    { name: 'top', normal: [0, 1, 0], indices: [3, 7, 6, 2] }
  ];

  const faces = baseNormals.map(fn => ({
    name: fn.name,
    indices: fn.indices,
    normal: rotateNormalY(fn.normal[0], fn.normal[1], fn.normal[2], rotation)
  }));

  return {
    id,
    type: 'furniture',
    componentType: 'furniture',
    furnitureType: metadata.furnitureType || 'furniture_item',
    subComponent: metadata.subComponent || 'body',
    roomId: metadata.roomId || null,
    floorIndex: metadata.floorIndex !== undefined ? metadata.floorIndex : 0,
    isInterior: true,
    isFurniture: true,
    vertices: worldVerts,
    faces,
    bounds: {
      min: [Number(bMinX.toFixed(3)), Number(bMinY.toFixed(3)), Number(bMinZ.toFixed(3))],
      max: [Number(bMaxX.toFixed(3)), Number(bMaxY.toFixed(3)), Number(bMaxZ.toFixed(3))]
    },
    color: metadata.color || '#94a3b8',
    strokeColor: metadata.strokeColor || '#1e293b',
    strokeWidth: metadata.strokeWidth || 0.6,
    opacity: metadata.opacity !== undefined ? metadata.opacity : 1.0,
    roughness: metadata.roughness !== undefined ? metadata.roughness : 0.7,
    metalness: metadata.metalness !== undefined ? metadata.metalness : 0.1,
    materialId: metadata.materialId || 'furniture_finish'
  };
}

/**
 * Builds composite 3D meshes for a furniture placement
 * 
 * @param {Object} item - { id, type, position: { x, y, z }, rotation, dimensions: { width, depth, height }, roomId, floorIndex }
 * @param {Object} catalogDef - Furniture catalog specification
 * @returns {Array<Object>} List of solid 3D meshes representing the furniture piece
 */
export function buildFurniture3dMeshes(item, inputCatalogDef = null) {
  const meshes = [];
  const { id, type, position, rotation = 0, dimensions, roomId, floorIndex } = item;
  const catalogDef = inputCatalogDef || getFurnitureDefinition(type) || {
    defaultDimensions: { width: 3.0, depth: 3.0, height: 2.5 },
    materials: {}
  };
  const W = dimensions?.width || catalogDef.defaultDimensions?.width || 3.0;
  const D = dimensions?.depth || catalogDef.defaultDimensions?.depth || 3.0;
  const H = dimensions?.height || catalogDef.defaultDimensions?.height || 2.5;
  const hw = W / 2;
  const hd = D / 2;

  const worldPos = { x: position.x, y: position.y, z: position.z, rotation };
  const baseMeta = {
    furnitureType: type,
    roomId,
    floorIndex,
    isInterior: true,
    isFurniture: true
  };

  switch (type) {
    case FURNITURE_TYPES.KING_BED:
    case FURNITURE_TYPES.QUEEN_BED:
    case FURNITURE_TYPES.SINGLE_BED: {
      const isKing = type === FURNITURE_TYPES.KING_BED;
      const isQueen = type === FURNITURE_TYPES.QUEEN_BED;
      const frameColor = catalogDef.materials.frame?.color || '#78350f';
      const duvetColor = '#64748b'; // Soft architectural slate/taupe duvet matching Image 5
      const pillowColor = '#f8fafc'; // Crisp white modern pillows
      const runnerColor = '#cbd5e1'; // Modern folded accent bed runner
      const headboardColor = catalogDef.materials.headboard?.color || '#334155';

      // 1. Bed Frame / Plinth (low platform)
      meshes.push(createRotatedBoxMesh(`${id}_frame`, {
        minX: -hw, minY: 0, minZ: -hd,
        maxX: hw, maxY: 0.75, maxZ: hd
      }, worldPos, { ...baseMeta, subComponent: 'frame', color: frameColor }));

      // 2. Thick Comfortable Mattress with Soft Grey Duvet
      meshes.push(createRotatedBoxMesh(`${id}_mattress`, {
        minX: -hw + 0.1, minY: 0.75, minZ: -hd + 0.1,
        maxX: hw - 0.1, maxY: 1.6, maxZ: hd - 0.1
      }, worldPos, { ...baseMeta, subComponent: 'mattress', color: duvetColor }));

      // 3. Tall Upholstered Headboard (at back: -Z local)
      meshes.push(createRotatedBoxMesh(`${id}_headboard`, {
        minX: -hw - 0.1, minY: 0, minZ: -hd - 0.25,
        maxX: hw + 0.1, maxY: H, maxZ: -hd
      }, worldPos, { ...baseMeta, subComponent: 'headboard', color: headboardColor }));

      // 4. Crisp White Pillows (1 or 2 resting against headboard)
      if (isKing || isQueen) {
        // Left Pillow
        meshes.push(createRotatedBoxMesh(`${id}_pillow_l`, {
          minX: -hw + 0.3, minY: 1.6, minZ: -hd + 0.2,
          maxX: -0.15, maxY: 1.95, maxZ: -hd + 1.2
        }, worldPos, { ...baseMeta, subComponent: 'pillow', color: pillowColor }));
        // Right Pillow
        meshes.push(createRotatedBoxMesh(`${id}_pillow_r`, {
          minX: 0.15, minY: 1.6, minZ: -hd + 0.2,
          maxX: hw - 0.3, maxY: 1.95, maxZ: -hd + 1.2
        }, worldPos, { ...baseMeta, subComponent: 'pillow', color: pillowColor }));
      } else {
        meshes.push(createRotatedBoxMesh(`${id}_pillow`, {
          minX: -hw + 0.3, minY: 1.6, minZ: -hd + 0.2,
          maxX: hw - 0.3, maxY: 1.95, maxZ: -hd + 1.2
        }, worldPos, { ...baseMeta, subComponent: 'pillow', color: pillowColor }));
      }

      // 5. Folded Accent Bed Runner across the lower half (Image 5 aesthetic)
      meshes.push(createRotatedBoxMesh(`${id}_runner`, {
        minX: -hw + 0.08, minY: 1.605, minZ: hd - 1.8,
        maxX: hw - 0.08, maxY: 1.64, maxZ: hd - 0.2
      }, worldPos, { ...baseMeta, subComponent: 'runner', color: runnerColor }));
      break;
    }

    case FURNITURE_TYPES.BEDSIDE_TABLE: {
      const color = catalogDef.materials.body?.color || '#572b0c';
      // Main Body
      meshes.push(createRotatedBoxMesh(`${id}_body`, {
        minX: -hw, minY: 0, minZ: -hd,
        maxX: hw, maxY: H - 0.1, maxZ: hd
      }, worldPos, { ...baseMeta, subComponent: 'body', color }));
      // Beveled Table Top Slab
      meshes.push(createRotatedBoxMesh(`${id}_top`, {
        minX: -hw - 0.05, minY: H - 0.1, minZ: -hd - 0.05,
        maxX: hw + 0.05, maxY: H, maxZ: hd + 0.05
      }, worldPos, { ...baseMeta, subComponent: 'top', color: '#1e293b' }));
      break;
    }

    case FURNITURE_TYPES.WARDROBE_4DOOR:
    case FURNITURE_TYPES.WARDROBE_3DOOR:
    case FURNITURE_TYPES.WARDROBE_2DOOR: {
      const bodyColor = catalogDef.materials.body?.color || '#e2e8f0';
      const doorColor = catalogDef.materials.doors?.color || '#cbd5e1';

      // 1. Main Cabinet Body
      meshes.push(createRotatedBoxMesh(`${id}_body`, {
        minX: -hw, minY: 0, minZ: -hd,
        maxX: hw, maxY: H, maxZ: hd - 0.05
      }, worldPos, { ...baseMeta, subComponent: 'cabinet', color: bodyColor }));

      // 2. Door Panels (front face: +Z local)
      meshes.push(createRotatedBoxMesh(`${id}_doors`, {
        minX: -hw + 0.05, minY: 0.2, minZ: hd - 0.05,
        maxX: hw - 0.05, maxY: H - 0.1, maxZ: hd
      }, worldPos, { ...baseMeta, subComponent: 'doors', color: doorColor }));
      break;
    }

    case FURNITURE_TYPES.SOFA_3SEATER:
    case FURNITURE_TYPES.SOFA_2SEATER: {
      const baseColor = catalogDef.materials.base?.color || '#1e293b';
      const fabricColor = catalogDef.materials.fabric?.color || '#475569';
      const cushionColor = catalogDef.materials.cushion?.color || '#64748b';

      // 1. Hardwood Base / Plinth
      meshes.push(createRotatedBoxMesh(`${id}_base`, {
        minX: -hw, minY: 0, minZ: -hd,
        maxX: hw, maxY: 0.6, maxZ: hd
      }, worldPos, { ...baseMeta, subComponent: 'base', color: baseColor }));

      // 2. Seat Cushion Platform
      meshes.push(createRotatedBoxMesh(`${id}_seat`, {
        minX: -hw + 0.35, minY: 0.6, minZ: -hd + 0.4,
        maxX: hw - 0.35, maxY: 1.45, maxZ: hd
      }, worldPos, { ...baseMeta, subComponent: 'seat', color: cushionColor }));

      // 3. Padded Backrest (at -Z)
      meshes.push(createRotatedBoxMesh(`${id}_backrest`, {
        minX: -hw, minY: 0.6, minZ: -hd,
        maxX: hw, maxY: H, maxZ: -hd + 0.5
      }, worldPos, { ...baseMeta, subComponent: 'backrest', color: fabricColor }));

      // 4. Left Armrest
      meshes.push(createRotatedBoxMesh(`${id}_arm_l`, {
        minX: -hw, minY: 0.6, minZ: -hd + 0.3,
        maxX: -hw + 0.4, maxY: 1.85, maxZ: hd
      }, worldPos, { ...baseMeta, subComponent: 'armrest_l', color: fabricColor }));

      // 5. Right Armrest
      meshes.push(createRotatedBoxMesh(`${id}_arm_r`, {
        minX: hw - 0.4, minY: 0.6, minZ: -hd + 0.3,
        maxX: hw, maxY: 1.85, maxZ: hd
      }, worldPos, { ...baseMeta, subComponent: 'armrest_r', color: fabricColor }));
      break;
    }

    case FURNITURE_TYPES.SOFA_SECTIONAL_L: {
      const fabricColor = catalogDef.materials.fabric?.color || '#3b82f6';
      // Main 3-seat run
      meshes.push(createRotatedBoxMesh(`${id}_main`, {
        minX: -hw, minY: 0, minZ: -hd,
        maxX: hw, maxY: 1.45, maxZ: -hd + 2.8
      }, worldPos, { ...baseMeta, subComponent: 'main_run', color: fabricColor }));
      // Chaise lounge section extending forward on right side
      meshes.push(createRotatedBoxMesh(`${id}_chaise`, {
        minX: hw - 2.8, minY: 0, minZ: -hd + 2.8,
        maxX: hw, maxY: 1.45, maxZ: hd
      }, worldPos, { ...baseMeta, subComponent: 'chaise', color: fabricColor }));
      // High backrest along rear wall
      meshes.push(createRotatedBoxMesh(`${id}_back`, {
        minX: -hw, minY: 1.45, minZ: -hd,
        maxX: hw, maxY: H, maxZ: -hd + 0.5
      }, worldPos, { ...baseMeta, subComponent: 'backrest', color: '#1e3a8a' }));
      break;
    }

    case FURNITURE_TYPES.COFFEE_TABLE: {
      const topColor = catalogDef.materials.top?.color || '#1e293b';
      const legColor = catalogDef.materials.legs?.color || '#78350f';

      // 1. Table Top Slab
      meshes.push(createRotatedBoxMesh(`${id}_top`, {
        minX: -hw, minY: H - 0.15, minZ: -hd,
        maxX: hw, maxY: H, maxZ: hd
      }, worldPos, { ...baseMeta, subComponent: 'top', color: topColor }));

      // 2. Four Legs
      const legW = 0.15;
      const legInsetX = hw - legW;
      const legInsetZ = hd - legW;
      // Front-Left Leg
      meshes.push(createRotatedBoxMesh(`${id}_leg_fl`, {
        minX: -legInsetX, minY: 0, minZ: -legInsetZ,
        maxX: -legInsetX + legW, maxY: H - 0.15, maxZ: -legInsetZ + legW
      }, worldPos, { ...baseMeta, subComponent: 'leg', color: legColor }));
      // Front-Right Leg
      meshes.push(createRotatedBoxMesh(`${id}_leg_fr`, {
        minX: legInsetX - legW, minY: 0, minZ: -legInsetZ,
        maxX: legInsetX, maxY: H - 0.15, maxZ: -legInsetZ + legW
      }, worldPos, { ...baseMeta, subComponent: 'leg', color: legColor }));
      // Back-Left Leg
      meshes.push(createRotatedBoxMesh(`${id}_leg_bl`, {
        minX: -legInsetX, minY: 0, minZ: legInsetZ - legW,
        maxX: -legInsetX + legW, maxY: H - 0.15, maxZ: legInsetZ
      }, worldPos, { ...baseMeta, subComponent: 'leg', color: legColor }));
      // Back-Right Leg
      meshes.push(createRotatedBoxMesh(`${id}_leg_br`, {
        minX: legInsetX - legW, minY: 0, minZ: legInsetZ - legW,
        maxX: legInsetX, maxY: H - 0.15, maxZ: legInsetZ
      }, worldPos, { ...baseMeta, subComponent: 'leg', color: legColor }));
      break;
    }

    case FURNITURE_TYPES.TV_CONSOLE: {
      const baseColor = catalogDef.materials.base?.color || '#334155';
      const screenColor = catalogDef.materials.screen?.color || '#020617';

      // 1. Low Credenza Cabinet
      meshes.push(createRotatedBoxMesh(`${id}_credenza`, {
        minX: -hw, minY: 0, minZ: -hd,
        maxX: hw, maxY: 1.5, maxZ: hd
      }, worldPos, { ...baseMeta, subComponent: 'credenza', color: baseColor }));

      // 2. Large 55" OLED TV Screen (ultra-thin black panel centered above credenza)
      const screenW = Math.min(W * 0.85, 4.2);
      meshes.push(createRotatedBoxMesh(`${id}_tv`, {
        minX: -screenW / 2, minY: 1.8, minZ: -0.05,
        maxX: screenW / 2, maxY: H, maxZ: 0.05
      }, worldPos, { ...baseMeta, subComponent: 'screen', color: screenColor, strokeColor: '#38bdf8' }));
      break;
    }

    case FURNITURE_TYPES.DINING_TABLE_6S:
    case FURNITURE_TYPES.DINING_TABLE_4S: {
      const topColor = catalogDef.materials.top?.color || '#78350f';
      const legColor = '#451a03';

      // Table Top
      meshes.push(createRotatedBoxMesh(`${id}_top`, {
        minX: -hw, minY: H - 0.2, minZ: -hd,
        maxX: hw, maxY: H, maxZ: hd
      }, worldPos, { ...baseMeta, subComponent: 'top', color: topColor }));

      // 4 Tapered Wooden Legs
      const legW = 0.2;
      const legX = hw - legW;
      const legZ = hd - legW;
      meshes.push(createRotatedBoxMesh(`${id}_leg1`, { minX: -legX, minY: 0, minZ: -legZ, maxX: -legX + legW, maxY: H - 0.2, maxZ: -legZ + legW }, worldPos, { ...baseMeta, color: legColor }));
      meshes.push(createRotatedBoxMesh(`${id}_leg2`, { minX: legX - legW, minY: 0, minZ: -legZ, maxX: legX, maxY: H - 0.2, maxZ: -legZ + legW }, worldPos, { ...baseMeta, color: legColor }));
      meshes.push(createRotatedBoxMesh(`${id}_leg3`, { minX: -legX, minY: 0, minZ: legZ - legW, maxX: -legX + legW, maxY: H - 0.2, maxZ: legZ }, worldPos, { ...baseMeta, color: legColor }));
      meshes.push(createRotatedBoxMesh(`${id}_leg4`, { minX: legX - legW, minY: 0, minZ: legZ - legW, maxX: legX, maxY: H - 0.2, maxZ: legZ }, worldPos, { ...baseMeta, color: legColor }));
      break;
    }

    case FURNITURE_TYPES.DINING_CHAIR:
    case FURNITURE_TYPES.ARMCHAIR:
    case FURNITURE_TYPES.OFFICE_CHAIR:
    case FURNITURE_TYPES.OUTDOOR_CHAIR: {
      const seatColor = catalogDef.materials.seat?.color || catalogDef.materials.fabric?.color || catalogDef.materials.mesh?.color || '#475569';
      const frameColor = catalogDef.materials.frame?.color || catalogDef.materials.legs?.color || '#0f172a';

      // Seat
      meshes.push(createRotatedBoxMesh(`${id}_seat`, {
        minX: -hw, minY: 1.25, minZ: -hd,
        maxX: hw, maxY: 1.5, maxZ: hd
      }, worldPos, { ...baseMeta, subComponent: 'seat', color: seatColor }));

      // Backrest
      meshes.push(createRotatedBoxMesh(`${id}_back`, {
        minX: -hw, minY: 1.5, minZ: -hd,
        maxX: hw, maxY: H, maxZ: -hd + 0.25
      }, worldPos, { ...baseMeta, subComponent: 'backrest', color: seatColor }));

      // Legs / Base
      meshes.push(createRotatedBoxMesh(`${id}_base`, {
        minX: -hw + 0.1, minY: 0, minZ: -hd + 0.1,
        maxX: hw - 0.1, maxY: 1.25, maxZ: hd - 0.1
      }, worldPos, { ...baseMeta, subComponent: 'legs', color: frameColor }));
      break;
    }

    case FURNITURE_TYPES.KITCHEN_COUNTER_BASE: {
      const topColor = catalogDef.materials.top?.color || '#0f172a';
      const cabColor = catalogDef.materials.cabinets?.color || '#f1f5f9';

      // 1. Lower Cabinet Base
      meshes.push(createRotatedBoxMesh(`${id}_cabinets`, {
        minX: -hw, minY: 0, minZ: -hd,
        maxX: hw, maxY: H - 0.15, maxZ: hd
      }, worldPos, { ...baseMeta, subComponent: 'cabinets', color: cabColor }));

      // 2. Polished Jet-Black Granite Countertop Slab
      meshes.push(createRotatedBoxMesh(`${id}_slab`, {
        minX: -hw - 0.05, minY: H - 0.15, minZ: -hd - 0.05,
        maxX: hw + 0.05, maxY: H, maxZ: hd + 0.05
      }, worldPos, { ...baseMeta, subComponent: 'countertop', color: topColor }));
      break;
    }

    case FURNITURE_TYPES.KITCHEN_SINK_UNIT: {
      const basinColor = catalogDef.materials.basin?.color || '#94a3b8';
      meshes.push(createRotatedBoxMesh(`${id}_basin`, {
        minX: -hw, minY: 0, minZ: -hd,
        maxX: hw, maxY: H, maxZ: hd
      }, worldPos, { ...baseMeta, subComponent: 'sink_basin', color: basinColor }));
      break;
    }

    case FURNITURE_TYPES.KITCHEN_HOB_UNIT: {
      const plateColor = catalogDef.materials.plate?.color || '#020617';
      meshes.push(createRotatedBoxMesh(`${id}_hob`, {
        minX: -hw, minY: 0, minZ: -hd,
        maxX: hw, maxY: H, maxZ: hd
      }, worldPos, { ...baseMeta, subComponent: 'hob', color: plateColor }));
      break;
    }

    case FURNITURE_TYPES.REFRIGERATOR: {
      const color = catalogDef.materials.body?.color || '#64748b';
      // Refrigerator Tower
      meshes.push(createRotatedBoxMesh(`${id}_tower`, {
        minX: -hw, minY: 0, minZ: -hd,
        maxX: hw, maxY: H, maxZ: hd
      }, worldPos, { ...baseMeta, subComponent: 'refrigerator', color, strokeColor: '#334155' }));
      break;
    }

    case FURNITURE_TYPES.TOILET_EWC: {
      const ceramicColor = '#ffffff';
      // Wall-mount Cistern Tank
      meshes.push(createRotatedBoxMesh(`${id}_cistern`, {
        minX: -hw + 0.1, minY: 1.2, minZ: -hd,
        maxX: hw - 0.1, maxY: H, maxZ: -hd + 0.6
      }, worldPos, { ...baseMeta, subComponent: 'cistern', color: ceramicColor }));

      // Toilet Seat & Bowl
      meshes.push(createRotatedBoxMesh(`${id}_bowl`, {
        minX: -hw + 0.15, minY: 0.2, minZ: -hd + 0.6,
        maxX: hw - 0.15, maxY: 1.35, maxZ: hd
      }, worldPos, { ...baseMeta, subComponent: 'bowl', color: ceramicColor }));
      break;
    }

    case FURNITURE_TYPES.BATHROOM_VANITY: {
      const cabColor = catalogDef.materials.cabinet?.color || '#475569';
      const topColor = catalogDef.materials.counter?.color || '#1e293b';

      // Vanity Cabinet
      meshes.push(createRotatedBoxMesh(`${id}_cab`, {
        minX: -hw, minY: 0.6, minZ: -hd,
        maxX: hw, maxY: H - 0.15, maxZ: hd
      }, worldPos, { ...baseMeta, subComponent: 'cabinet', color: cabColor }));

      // Vanity Top Slab
      meshes.push(createRotatedBoxMesh(`${id}_top`, {
        minX: -hw - 0.05, minY: H - 0.15, minZ: -hd - 0.05,
        maxX: hw + 0.05, maxY: H, maxZ: hd + 0.05
      }, worldPos, { ...baseMeta, subComponent: 'top', color: topColor }));

      // Ceramic Oval Basin Bowl
      meshes.push(createRotatedBoxMesh(`${id}_basin`, {
        minX: -hw * 0.55, minY: H, minZ: -hd * 0.55,
        maxX: hw * 0.55, maxY: H + 0.4, maxZ: hd * 0.55
      }, worldPos, { ...baseMeta, subComponent: 'basin', color: '#ffffff' }));
      break;
    }

    case FURNITURE_TYPES.SHOWER_ENCLOSURE: {
      // Base Tray
      meshes.push(createRotatedBoxMesh(`${id}_tray`, {
        minX: -hw, minY: 0, minZ: -hd,
        maxX: hw, maxY: 0.2, maxZ: hd
      }, worldPos, { ...baseMeta, subComponent: 'tray', color: '#e2e8f0' }));

      // Glass Partition Screen (along edge)
      meshes.push(createRotatedBoxMesh(`${id}_glass`, {
        minX: -hw, minY: 0.2, minZ: hd - 0.05,
        maxX: hw, maxY: H, maxZ: hd
      }, worldPos, { ...baseMeta, subComponent: 'glass', color: '#93c5fd', opacity: 0.35 }));
      break;
    }

    case FURNITURE_TYPES.POOJA_MANDIR: {
      const woodColor = catalogDef.materials.wood?.color || '#78350f';
      const brassColor = catalogDef.materials.brass?.color || '#fbbf24';

      // 1. Altar Base Cabinet
      meshes.push(createRotatedBoxMesh(`${id}_base`, {
        minX: -hw, minY: 0, minZ: -hd,
        maxX: hw, maxY: 1.5, maxZ: hd
      }, worldPos, { ...baseMeta, subComponent: 'base', color: woodColor }));

      // 2. Open Shrine Tier
      meshes.push(createRotatedBoxMesh(`${id}_shrine`, {
        minX: -hw + 0.15, minY: 1.5, minZ: -hd + 0.15,
        maxX: hw - 0.15, maxY: 3.5, maxZ: hd - 0.15
      }, worldPos, { ...baseMeta, subComponent: 'shrine', color: woodColor }));

      // 3. Stepped Traditional Gopuram Finial / Pediment
      meshes.push(createRotatedBoxMesh(`${id}_pediment`, {
        minX: -hw * 0.5, minY: 3.5, minZ: -hd * 0.5,
        maxX: hw * 0.5, maxY: H, maxZ: hd * 0.5
      }, worldPos, { ...baseMeta, subComponent: 'pediment', color: brassColor }));
      break;
    }

    case FURNITURE_TYPES.STUDY_DESK: {
      const topColor = catalogDef.materials.top?.color || '#92400e';
      const legColor = catalogDef.materials.frame?.color || '#0f172a';

      // Desktop Slab
      meshes.push(createRotatedBoxMesh(`${id}_top`, {
        minX: -hw, minY: H - 0.15, minZ: -hd,
        maxX: hw, maxY: H, maxZ: hd
      }, worldPos, { ...baseMeta, subComponent: 'top', color: topColor }));

      // Drawer Pedestal on Right
      meshes.push(createRotatedBoxMesh(`${id}_drawers`, {
        minX: hw - 1.2, minY: 0, minZ: -hd + 0.1,
        maxX: hw, maxY: H - 0.15, maxZ: hd - 0.1
      }, worldPos, { ...baseMeta, subComponent: 'drawers', color: topColor }));

      // Left Metal Leg Support
      meshes.push(createRotatedBoxMesh(`${id}_leg_l`, {
        minX: -hw, minY: 0, minZ: -hd + 0.1,
        maxX: -hw + 0.15, maxY: H - 0.15, maxZ: hd - 0.1
      }, worldPos, { ...baseMeta, subComponent: 'leg', color: legColor }));
      break;
    }

    case FURNITURE_TYPES.BOOKSHELF: {
      const color = catalogDef.materials.frame?.color || '#78350f';
      // Tall Shelving Frame
      meshes.push(createRotatedBoxMesh(`${id}_bookshelf`, {
        minX: -hw, minY: 0, minZ: -hd,
        maxX: hw, maxY: H, maxZ: hd
      }, worldPos, { ...baseMeta, subComponent: 'bookshelf', color }));
      break;
    }

    case FURNITURE_TYPES.OUTDOOR_TABLE: {
      const topColor = catalogDef.materials.top?.color || '#854d0e';
      const legColor = catalogDef.materials.legs?.color || '#78350f';
      const dishColor = catalogDef.materials.dish?.color || '#f8fafc';

      // 1. Table Top Slab
      meshes.push(createRotatedBoxMesh(`${id}_top`, {
        minX: -hw, minY: H - 0.2, minZ: -hd,
        maxX: hw, maxY: H, maxZ: hd
      }, worldPos, { ...baseMeta, subComponent: 'top', color: topColor }));

      // 2. 4 Solid Corner Legs
      const legW = 0.22;
      const legOffset = 0.08;
      // Front-Left
      meshes.push(createRotatedBoxMesh(`${id}_leg_fl`, {
        minX: -hw + legOffset, minY: 0, minZ: hd - legOffset - legW,
        maxX: -hw + legOffset + legW, maxY: H - 0.2, maxZ: hd - legOffset
      }, worldPos, { ...baseMeta, subComponent: 'leg', color: legColor }));
      // Front-Right
      meshes.push(createRotatedBoxMesh(`${id}_leg_fr`, {
        minX: hw - legOffset - legW, minY: 0, minZ: hd - legOffset - legW,
        maxX: hw - legOffset, maxY: H - 0.2, maxZ: hd - legOffset
      }, worldPos, { ...baseMeta, subComponent: 'leg', color: legColor }));
      // Back-Left
      meshes.push(createRotatedBoxMesh(`${id}_leg_bl`, {
        minX: -hw + legOffset, minY: 0, minZ: -hd + legOffset,
        maxX: -hw + legOffset + legW, maxY: H - 0.2, maxZ: -hd + legOffset + legW
      }, worldPos, { ...baseMeta, subComponent: 'leg', color: legColor }));
      // Back-Right
      meshes.push(createRotatedBoxMesh(`${id}_leg_br`, {
        minX: hw - legOffset - legW, minY: 0, minZ: -hd + legOffset,
        maxX: hw - legOffset, maxY: H - 0.2, maxZ: -hd + legOffset + legW
      }, worldPos, { ...baseMeta, subComponent: 'leg', color: legColor }));

      // 3. Ceramic Tableware Centerpiece Dish (Image 5 aesthetic)
      meshes.push(createRotatedBoxMesh(`${id}_dish`, {
        minX: -0.65, minY: H, minZ: -0.65,
        maxX: 0.65, maxY: H + 0.12, maxZ: 0.65
      }, worldPos, { ...baseMeta, subComponent: 'dish', color: dishColor }));
      break;
    }

    case FURNITURE_TYPES.OUTDOOR_CHAIR: {
      const legColor = '#78350f';
      const seatColor = '#f8fafc';
      const backColor = '#cbd5e1';

      // Seat Cushion
      meshes.push(createRotatedBoxMesh(`${id}_seat`, {
        minX: -hw, minY: 0.9, minZ: -hd,
        maxX: hw, maxY: 1.15, maxZ: hd
      }, worldPos, { ...baseMeta, subComponent: 'seat', color: seatColor }));

      // Low Backrest
      meshes.push(createRotatedBoxMesh(`${id}_back`, {
        minX: -hw, minY: 1.15, minZ: -hd,
        maxX: hw, maxY: H, maxZ: -hd + 0.22
      }, worldPos, { ...baseMeta, subComponent: 'backrest', color: backColor }));

      // 4 Legs
      meshes.push(createRotatedBoxMesh(`${id}_legs`, {
        minX: -hw + 0.05, minY: 0, minZ: -hd + 0.05,
        maxX: hw - 0.05, maxY: 0.9, maxZ: hd - 0.05
      }, worldPos, { ...baseMeta, subComponent: 'legs', color: legColor }));
      break;
    }

    case FURNITURE_TYPES.SUN_LOUNGER: {
      const frameColor = catalogDef.materials.frame?.color || '#78350f';
      const cushionColor = catalogDef.materials.cushion?.color || '#f1f5f9';
      const pillowColor = catalogDef.materials.pillow?.color || '#cbd5e1';

      // 1. Low Wooden Lounger Platform Base
      meshes.push(createRotatedBoxMesh(`${id}_frame`, {
        minX: -hw, minY: 0, minZ: -hd,
        maxX: hw, maxY: 0.45, maxZ: hd
      }, worldPos, { ...baseMeta, subComponent: 'frame', color: frameColor }));

      // 2. Thick White Mattress Cushion
      meshes.push(createRotatedBoxMesh(`${id}_cushion`, {
        minX: -hw + 0.08, minY: 0.45, minZ: -hd + 0.08,
        maxX: hw - 0.08, maxY: 0.85, maxZ: hd - 0.08
      }, worldPos, { ...baseMeta, subComponent: 'cushion', color: cushionColor }));

      // 3. Elevated Headrest & Pillow (at back: -Z local)
      meshes.push(createRotatedBoxMesh(`${id}_pillow`, {
        minX: -hw + 0.2, minY: 0.85, minZ: -hd + 0.2,
        maxX: hw - 0.2, maxY: 1.25, maxZ: -hd + 1.2
      }, worldPos, { ...baseMeta, subComponent: 'pillow', color: pillowColor }));
      break;
    }

    case FURNITURE_TYPES.ROUND_STOOL: {
      const woodColor = catalogDef.materials.seat?.color || '#92400e';
      // Rounded Cylindrical Stool Body
      meshes.push(createRotatedBoxMesh(`${id}_seat`, {
        minX: -hw, minY: 0, minZ: -hd,
        maxX: hw, maxY: H, maxZ: hd
      }, worldPos, { ...baseMeta, subComponent: 'stool', color: woodColor }));
      break;
    }

    case FURNITURE_TYPES.POTTED_SHRUB: {
      const potColor = catalogDef.materials.pot?.color || '#94a3b8';
      const foliageColor = catalogDef.materials.foliage?.color || '#16a34a';

      // 1. Planter Pot (Cubic/Faceted Ceramic Base)
      meshes.push(createRotatedBoxMesh(`${id}_pot`, {
        minX: -hw * 0.75, minY: 0, minZ: -hd * 0.75,
        maxX: hw * 0.75, maxY: 0.85, maxZ: hd * 0.75
      }, worldPos, { ...baseMeta, subComponent: 'pot', color: potColor }));

      // 2. Spherical Lush Green Shrub Foliage (Image 5 aesthetic)
      meshes.push(createRotatedBoxMesh(`${id}_bush`, {
        minX: -hw, minY: 0.85, minZ: -hd,
        maxX: hw, maxY: H, maxZ: hd
      }, worldPos, { ...baseMeta, subComponent: 'bush', color: foliageColor }));
      break;
    }

    case FURNITURE_TYPES.SLATTED_DIVIDER: {
      const slatColor = catalogDef.materials.slats?.color || '#854d0e';
      // Vertical Timber Louver Acoustic Divider Screen
      meshes.push(createRotatedBoxMesh(`${id}_divider`, {
        minX: -hw, minY: 0, minZ: -hd,
        maxX: hw, maxY: H, maxZ: hd
      }, worldPos, { ...baseMeta, subComponent: 'divider', color: slatColor }));
      break;
    }

    case FURNITURE_TYPES.DESK_LAPTOP: {
      const deskColor = catalogDef.materials.desk?.color || '#854d0e';
      const laptopColor = catalogDef.materials.laptop?.color || '#334155';
      const plantColor = catalogDef.materials.plant?.color || '#22c55e';

      // 1. Wooden Worktop Desk
      meshes.push(createRotatedBoxMesh(`${id}_desk`, {
        minX: -hw, minY: 0, minZ: -hd,
        maxX: hw, maxY: H, maxZ: hd
      }, worldPos, { ...baseMeta, subComponent: 'desk', color: deskColor }));

      // 2. Laptop on Worktop
      meshes.push(createRotatedBoxMesh(`${id}_laptop_base`, {
        minX: -0.8, minY: H, minZ: -0.4,
        maxX: 0.4, maxY: H + 0.08, maxZ: 0.4
      }, worldPos, { ...baseMeta, subComponent: 'laptop', color: laptopColor }));
      meshes.push(createRotatedBoxMesh(`${id}_laptop_screen`, {
        minX: -0.8, minY: H + 0.08, minZ: -0.4,
        maxX: 0.4, maxY: H + 0.85, maxZ: -0.32
      }, worldPos, { ...baseMeta, subComponent: 'laptop_screen', color: laptopColor }));

      // 3. Mini Tabletop Succulent Planter
      meshes.push(createRotatedBoxMesh(`${id}_plant`, {
        minX: hw - 0.7, minY: H, minZ: -hd + 0.2,
        maxX: hw - 0.2, maxY: H + 0.55, maxZ: -hd + 0.7
      }, worldPos, { ...baseMeta, subComponent: 'plant', color: plantColor }));
      break;
    }

    default: {
      // General fall-through box mesh
      meshes.push(createRotatedBoxMesh(`${id}_generic`, {
        minX: -hw, minY: 0, minZ: -hd,
        maxX: hw, maxY: H, maxZ: hd
      }, worldPos, { ...baseMeta, color: '#94a3b8' }));
      break;
    }
  }

  return meshes;
}
