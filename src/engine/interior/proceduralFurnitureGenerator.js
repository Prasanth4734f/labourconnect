/**
 * LabourConnect Design Engine - Procedural Interior Furniture & Fit-Out Generator
 * 
 * S4-T02: Room-Aware Procedural Interior Fit-Out Engine
 * 
 * Algorithmic placement of realistic, recognizable 3D furniture entities within
 * generated room boundaries, respecting door/window clearances, room zones,
 * floor elevations, and architectural style palettes.
 * 
 * Key Principles:
 * 1. Room-Aware Ergonomics: Furniture suited to room type, area, and aspect ratio.
 * 2. Boundary & Elevation Integrity: Placed strictly within room walls, resting directly on floor slabs.
 * 3. Doorway & Circulation Protection: Preserves minimum 2.5 ft clear entrance envelopes.
 * 4. Collision Avoidance: AABB non-overlap checks between adjacent furniture items.
 * 5. Graceful Degradation: Small rooms skip secondary items rather than forcing cramped collisions.
 * 6. Single Source of Truth: Produces 3D meshes for rendering AND itemized takeoff for budget Category 6.
 */

import {
  FURNITURE_TYPES,
  getFurnitureDefinition
} from './furnitureCatalog.js';
import { buildFurniture3dMeshes } from './furniture3dMeshBuilder.js';

/**
 * Checks whether an AABB [minX, minZ, maxX, maxZ] overlaps with a doorway circular clearance zone.
 */
function collidesWithDoorways(minX, minZ, maxX, maxZ, doorways, clearanceRadius = 2.5) {
  for (const door of doorways) {
    const dx = Math.max(minX, Math.min(door.x, maxX));
    const dz = Math.max(minZ, Math.min(door.z, maxZ));
    const distSq = (door.x - dx) * (door.x - dx) + (door.z - dz) * (door.z - dz);
    if (distSq < clearanceRadius * clearanceRadius) {
      return true;
    }
  }
  return false;
}

/**
 * Checks if two 2D AABB bounding boxes overlap in plan (XZ).
 */
function boxesOverlapXZ(b1, b2, padding = 0.05) {
  return (
    b1.minX < b2.maxX + padding &&
    b1.maxX > b2.minX - padding &&
    b1.minZ < b2.maxZ + padding &&
    b1.maxZ > b2.minZ - padding
  );
}

/**
 * Generates room-specific furniture items and composite 3D meshes for a single room.
 * 
 * @param {Object} room - { id, name, type, zone, bounds: { x, y, width, length } }
 * @param {Object} floor - { floorIndex, elevationZ, walls, openings }
 * @param {Object} [options={}]
 * @returns {Object} { roomId, roomType, items, meshes, totalFurnitureCostInr }
 */
export function generateRoomFurniture(room, floor, _options = {}) {
  const items = [];
  const meshes = [];
  let totalFurnitureCostInr = 0;

  if (!room || !room.bounds || room.bounds.width <= 0 || room.bounds.length <= 0) {
    return { roomId: room?.id || null, roomType: room?.type || 'unknown', items: [], meshes: [], totalFurnitureCostInr: 0 };
  }

  const { x: rx, y: rz, width: rw, length: rl } = room.bounds;
  const roomAreaSqft = Number((rw * rl).toFixed(2));
  const floorIndex = floor?.floorIndex !== undefined ? floor.floorIndex : 0;
  
  // Floor elevation Y (sitting directly on 0.5 ft floor slab)
  const floorBaseY = (floor?.elevationZ !== undefined ? floor.elevationZ : floorIndex * 10.5) + 0.5;

  // Extract doorway centers in plan for this room
  const doorways = [];
  (floor?.openings || []).forEach(op => {
    if (op.type === 'door' || op.label?.toLowerCase()?.includes('door') || op.category === 'door') {
      const opX = op.position?.x !== undefined ? op.position.x : (op.x || 0);
      const opZ = op.position?.y !== undefined ? op.position.y : (op.y || 0);
      // If opening is near or on this room's perimeter
      if (opX >= rx - 1.0 && opX <= rx + rw + 1.0 && opZ >= rz - 1.0 && opZ <= rz + rl + 1.0) {
        doorways.push({ x: opX, z: opZ });
      }
    }
  });

  const placedBoxes = [];

  /**
   * Helper to safely try placing an item inside room bounds without collisions.
   */
  function tryPlaceItem(furnitureType, posProposal, rotation = 0, customDims = null) {
    const catalogDef = getFurnitureDefinition(furnitureType);
    if (!catalogDef) return false;

    const dims = customDims || catalogDef.defaultDimensions;
    const isRotated = rotation === 90 || rotation === 270;
    const effW = isRotated ? dims.depth : dims.width;
    const effD = isRotated ? dims.width : dims.depth;

    const minX = Number((posProposal.x - effW / 2).toFixed(3));
    const maxX = Number((posProposal.x + effW / 2).toFixed(3));
    const minZ = Number((posProposal.z - effD / 2).toFixed(3));
    const maxZ = Number((posProposal.z + effD / 2).toFixed(3));

    // 1. Boundary check (at least 0.15 ft inside room walls)
    const margin = 0.15;
    if (minX < rx + margin || maxX > rx + rw - margin || minZ < rz + margin || maxZ > rz + rl - margin) {
      return false;
    }

    // 2. Doorway clearance check
    if (collidesWithDoorways(minX, minZ, maxX, maxZ, doorways, 2.2)) {
      return false;
    }

    // 3. Collision check against already placed items in room
    const testBox = { minX, maxX, minZ, maxZ, itemType: furnitureType };
    for (const pb of placedBoxes) {
      // Embedded fixtures (sink and hob) sit within kitchen counter base
      if (
        (furnitureType === FURNITURE_TYPES.KITCHEN_SINK_UNIT || furnitureType === FURNITURE_TYPES.KITCHEN_HOB_UNIT) &&
        pb.itemType === FURNITURE_TYPES.KITCHEN_COUNTER_BASE
      ) {
        continue;
      }
      if (boxesOverlapXZ(testBox, pb, 0.1)) {
        return false;
      }
    }

    // Valid placement: create item record and generate 3D meshes
    const itemId = `furn_${furnitureType}_${room.id}_${items.length + 1}`;
    const placedItem = {
      id: itemId,
      type: furnitureType,
      name: catalogDef.name,
      category: catalogDef.category,
      roomId: room.id,
      roomType: room.type,
      floorIndex,
      position: { x: posProposal.x, y: floorBaseY, z: posProposal.z },
      rotation,
      dimensions: dims,
      bounds: { minX, maxX, minZ, maxZ },
      baseRateInr: catalogDef.baseRateInr
    };

    items.push(placedItem);
    placedBoxes.push(testBox);
    totalFurnitureCostInr += catalogDef.baseRateInr;

    const itemMeshes = buildFurniture3dMeshes(placedItem, catalogDef);
    meshes.push(...itemMeshes);
    return true;
  }

  const normType = (room.type || '').toLowerCase();

  // ===========================================================================
  // 1. BEDROOMS (Master Bedroom & Standard Bedrooms)
  // ===========================================================================
  if (normType.includes('bed')) {
    const isMaster = normType.includes('master') || roomAreaSqft >= 130;
    const bedType = isMaster ? FURNITURE_TYPES.KING_BED : (roomAreaSqft >= 95 ? FURNITURE_TYPES.QUEEN_BED : FURNITURE_TYPES.SINGLE_BED);
    const bedDef = getFurnitureDefinition(bedType);
    const bedW = bedDef.defaultDimensions.width;
    const bedD = bedDef.defaultDimensions.depth;

    // Place Bed against top wall (rz) facing into room (+Z)
    const bedX = rx + rw / 2;
    const bedZ = rz + bedD / 2 + 0.35; // Headboard against top wall
    const bedPlaced = tryPlaceItem(bedType, { x: bedX, z: bedZ }, 0);

    if (bedPlaced && roomAreaSqft >= 85) {
      // Left Nightstand
      tryPlaceItem(FURNITURE_TYPES.BEDSIDE_TABLE, { x: bedX - bedW / 2 - 1.1, z: rz + 1.1 }, 0);
      // Right Nightstand
      tryPlaceItem(FURNITURE_TYPES.BEDSIDE_TABLE, { x: bedX + bedW / 2 + 1.1, z: rz + 1.1 }, 0);
    }

    // Wardrobe along bottom wall or side wall
    const wType = isMaster ? FURNITURE_TYPES.WARDROBE_3DOOR : FURNITURE_TYPES.WARDROBE_2DOOR;
    const wardZ = rz + rl - 1.3;
    const wardPlaced = tryPlaceItem(wType, { x: rx + 2.5, z: wardZ }, 180);
    if (!wardPlaced) {
      // Try side wall (right wall)
      tryPlaceItem(wType, { x: rx + rw - 1.3, z: rz + rl / 2 }, 270);
    }

    // Spacious master bedroom: add dressing console and vertical slatted divider
    if (isMaster && roomAreaSqft >= 120) {
      tryPlaceItem(FURNITURE_TYPES.DRESSER, { x: rx + rw - 1.8, z: rz + rl - 1.5 }, 180);
      tryPlaceItem(FURNITURE_TYPES.SLATTED_DIVIDER, { x: rx + rw - 0.5, z: rz + rl * 0.45 }, 0);
    }
  }

  // ===========================================================================
  // 2. LIVING ROOM / MAIN HALL
  // ===========================================================================
  else if (normType.includes('living') || normType.includes('hall')) {
    const isLargeLiving = roomAreaSqft >= 160;
    const sofaType = isLargeLiving ? FURNITURE_TYPES.SOFA_SECTIONAL_L : FURNITURE_TYPES.SOFA_3SEATER;
    const sofaDef = getFurnitureDefinition(sofaType);

    // Primary Sofa against top/rear wall facing center
    const sofaX = rx + rw / 2;
    const sofaZ = rz + sofaDef.defaultDimensions.depth / 2 + 0.5;
    const sofaPlaced = tryPlaceItem(sofaType, { x: sofaX, z: sofaZ }, 0);

    if (sofaPlaced) {
      // Coffee Table in front of Sofa with 1.8 ft clearance
      const ctDef = getFurnitureDefinition(FURNITURE_TYPES.COFFEE_TABLE);
      const ctZ = sofaZ + sofaDef.defaultDimensions.depth / 2 + ctDef.defaultDimensions.depth / 2 + 1.8;
      tryPlaceItem(FURNITURE_TYPES.COFFEE_TABLE, { x: sofaX, z: ctZ }, 0);

      // TV Console on opposite bottom wall facing sofa
      const tvDef = getFurnitureDefinition(FURNITURE_TYPES.TV_CONSOLE);
      const tvZ = rz + rl - tvDef.defaultDimensions.depth / 2 - 0.4;
      tryPlaceItem(FURNITURE_TYPES.TV_CONSOLE, { x: sofaX, z: tvZ }, 180);

      // Accent Armchair or Side Table if spacious
      if (roomAreaSqft >= 140) {
        tryPlaceItem(FURNITURE_TYPES.ARMCHAIR, { x: rx + 2.0, z: ctZ }, 90);
        tryPlaceItem(FURNITURE_TYPES.SIDE_TABLE, { x: sofaX + sofaDef.defaultDimensions.width / 2 + 1.2, z: sofaZ }, 0);
      }
    }
  }

  // ===========================================================================
  // 3. DINING ROOM
  // ===========================================================================
  else if (normType.includes('dining')) {
    const is6S = roomAreaSqft >= 100;
    const dtType = is6S ? FURNITURE_TYPES.DINING_TABLE_6S : FURNITURE_TYPES.DINING_TABLE_4S;
    const dtDef = getFurnitureDefinition(dtType);
    const tableX = rx + rw / 2;
    const tableZ = rz + rl / 2;

    const tablePlaced = tryPlaceItem(dtType, { x: tableX, z: tableZ }, 0);
    if (tablePlaced) {
      const chairDef = getFurnitureDefinition(FURNITURE_TYPES.DINING_CHAIR);
      const cDistZ = dtDef.defaultDimensions.depth / 2 + chairDef.defaultDimensions.depth / 2 + 0.35;
      
      // Top Chairs
      tryPlaceItem(FURNITURE_TYPES.DINING_CHAIR, { x: tableX - 1.2, z: tableZ - cDistZ }, 0);
      tryPlaceItem(FURNITURE_TYPES.DINING_CHAIR, { x: tableX + 1.2, z: tableZ - cDistZ }, 0);
      // Bottom Chairs
      tryPlaceItem(FURNITURE_TYPES.DINING_CHAIR, { x: tableX - 1.2, z: tableZ + cDistZ }, 180);
      tryPlaceItem(FURNITURE_TYPES.DINING_CHAIR, { x: tableX + 1.2, z: tableZ + cDistZ }, 180);

      if (is6S) {
        // Flank Chairs on Left and Right
        tryPlaceItem(FURNITURE_TYPES.DINING_CHAIR, { x: tableX - dtDef.defaultDimensions.width / 2 - 0.9, z: tableZ }, 90);
        tryPlaceItem(FURNITURE_TYPES.DINING_CHAIR, { x: tableX + dtDef.defaultDimensions.width / 2 + 0.9, z: tableZ }, 270);
      }
    }
  }

  // ===========================================================================
  // 4. KITCHEN
  // ===========================================================================
  else if (normType.includes('kitchen')) {
    // Modular counter along top wall
    const counterWidth = Math.min(rw - 1.0, 9.0);
    const counterX = rx + rw / 2;
    const counterZ = rz + 1.2;

    tryPlaceItem(FURNITURE_TYPES.KITCHEN_COUNTER_BASE, { x: counterX, z: counterZ }, 0, {
      width: counterWidth, depth: 2.0, height: 2.8
    });

    // Sink embedded on left
    tryPlaceItem(FURNITURE_TYPES.KITCHEN_SINK_UNIT, { x: counterX - counterWidth / 3, z: counterZ + 0.1 }, 0);

    // Cooking Hob embedded on right
    tryPlaceItem(FURNITURE_TYPES.KITCHEN_HOB_UNIT, { x: counterX + counterWidth / 3, z: counterZ + 0.1 }, 0);

    // Tall Refrigerator at side wall
    tryPlaceItem(FURNITURE_TYPES.REFRIGERATOR, { x: rx + rw - 1.6, z: rz + rl - 1.6 }, 270);
  }

  // ===========================================================================
  // 5. BATHROOM / TOILET
  // ===========================================================================
  else if (normType.includes('bath') || normType.includes('toilet')) {
    // Floating Vanity with Basin near entry
    tryPlaceItem(FURNITURE_TYPES.BATHROOM_VANITY, { x: rx + 1.8, z: rz + 1.2 }, 0);

    // EWC Toilet with Cistern on side wall
    tryPlaceItem(FURNITURE_TYPES.TOILET_EWC, { x: rx + rw - 1.2, z: rz + rl / 2 }, 270);

    // Shower Enclosure in far corner if space allows
    if (roomAreaSqft >= 32) {
      tryPlaceItem(FURNITURE_TYPES.SHOWER_ENCLOSURE, { x: rx + 1.8, z: rz + rl - 1.8 }, 0);
    }
  }

  // ===========================================================================
  // 6. POOJA ROOM
  // ===========================================================================
  else if (normType.includes('pooja') || normType.includes('mandir')) {
    // Traditional Mandir Altar centered against East or North wall
    tryPlaceItem(FURNITURE_TYPES.POOJA_MANDIR, { x: rx + rw / 2, z: rz + 1.1 }, 0);
  }

  // ===========================================================================
  // 7. STUDY / HOME OFFICE
  // ===========================================================================
  else if (normType.includes('study') || normType.includes('office')) {
    const deskX = rx + rw / 2;
    const deskZ = rz + 1.4;
    const deskPlaced = tryPlaceItem(FURNITURE_TYPES.STUDY_DESK, { x: deskX, z: deskZ }, 0);
    const chairDef = getFurnitureDefinition(FURNITURE_TYPES.OFFICE_CHAIR);

    if (deskPlaced) {
      const chairZ = deskZ + 2.1;
      tryPlaceItem(FURNITURE_TYPES.OFFICE_CHAIR, { x: deskX, z: chairZ }, 0);
    }
    // Bookshelf against side wall
    tryPlaceItem(FURNITURE_TYPES.BOOKSHELF, { x: rx + rw - 1.0, z: rz + rl / 2 }, 270);
  }

  // ===========================================================================
  // 8. BALCONY / TERRACE / OPEN DECK / SIT-OUT (Image 5 Architectural Standard)
  // ===========================================================================
  else if (normType.includes('balcony') || normType.includes('terrace') || normType.includes('deck') || normType.includes('portico') || normType.includes('verandah')) {
    if (roomAreaSqft >= 45) {
      // 1. Modern Square Outdoor Dining Table with Tableware Centerpiece Plate
      const tableX = rx + Math.min(rw * 0.35, 5.5);
      const tableZ = rz + Math.min(rl * 0.45, 6.0);
      tryPlaceItem(FURNITURE_TYPES.OUTDOOR_TABLE, { x: tableX, z: tableZ }, 0);

      // 4 Outdoor Dining Chairs Around Table
      tryPlaceItem(FURNITURE_TYPES.OUTDOOR_CHAIR, { x: tableX - 2.5, z: tableZ }, 90);
      tryPlaceItem(FURNITURE_TYPES.OUTDOOR_CHAIR, { x: tableX + 2.5, z: tableZ }, 270);
      tryPlaceItem(FURNITURE_TYPES.OUTDOOR_CHAIR, { x: tableX, z: tableZ - 2.5 }, 0);
      tryPlaceItem(FURNITURE_TYPES.OUTDOOR_CHAIR, { x: tableX, z: tableZ + 2.5 }, 180);

      // 2. White Fabric Cushioned Sun Lounger Daybed (Image 5 standard)
      const loungerX = rx + rw - Math.min(rw * 0.35, 4.5);
      const loungerZ = rz + rl - Math.min(rl * 0.35, 4.0);
      tryPlaceItem(FURNITURE_TYPES.SUN_LOUNGER, { x: loungerX, z: loungerZ }, 90);

      // 3. Round Wooden Stools (4 stools along deck)
      tryPlaceItem(FURNITURE_TYPES.ROUND_STOOL, { x: tableX + 2.8, z: tableZ + 2.8 }, 0);
      tryPlaceItem(FURNITURE_TYPES.ROUND_STOOL, { x: tableX + 4.2, z: tableZ + 2.8 }, 0);
      tryPlaceItem(FURNITURE_TYPES.ROUND_STOOL, { x: tableX + 2.8, z: tableZ + 4.2 }, 0);
      tryPlaceItem(FURNITURE_TYPES.ROUND_STOOL, { x: tableX + 4.2, z: tableZ + 4.2 }, 0);

      // 4. Perimeter Spherical Lush Green Potted Shrubs (lining corners & parapet)
      tryPlaceItem(FURNITURE_TYPES.POTTED_SHRUB, { x: rx + 1.2, z: rz + 1.2 }, 0);
      tryPlaceItem(FURNITURE_TYPES.POTTED_SHRUB, { x: rx + rw - 1.2, z: rz + 1.2 }, 0);
      tryPlaceItem(FURNITURE_TYPES.POTTED_SHRUB, { x: rx + 1.2, z: rz + rl - 1.2 }, 0);
      tryPlaceItem(FURNITURE_TYPES.POTTED_SHRUB, { x: rx + rw - 1.2, z: rz + rl - 1.2 }, 0);
      if (rw >= 14) {
        tryPlaceItem(FURNITURE_TYPES.POTTED_SHRUB, { x: rx + rw / 2, z: rz + 1.2 }, 0);
        tryPlaceItem(FURNITURE_TYPES.POTTED_SHRUB, { x: rx + rw / 2, z: rz + rl - 1.2 }, 0);
      }
    } else if (roomAreaSqft >= 20) {
      const centerX = rx + rw / 2;
      const centerZ = rz + rl / 2;
      tryPlaceItem(FURNITURE_TYPES.OUTDOOR_TABLE, { x: centerX, z: centerZ }, 0);
      tryPlaceItem(FURNITURE_TYPES.OUTDOOR_CHAIR, { x: centerX - 1.8, z: centerZ }, 90);
      tryPlaceItem(FURNITURE_TYPES.OUTDOOR_CHAIR, { x: centerX + 1.8, z: centerZ }, 270);
      tryPlaceItem(FURNITURE_TYPES.ROUND_STOOL, { x: centerX, z: centerZ + 1.8 }, 180);
      tryPlaceItem(FURNITURE_TYPES.POTTED_SHRUB, { x: rx + 1.0, z: rz + 1.0 }, 0);
      tryPlaceItem(FURNITURE_TYPES.POTTED_SHRUB, { x: rx + rw - 1.0, z: rz + rl - 1.0 }, 0);
    }
  }

  // ===========================================================================
  // 9. UTILITY
  // ===========================================================================
  else if (normType.includes('utility')) {
    tryPlaceItem(FURNITURE_TYPES.WASHING_MACHINE, { x: rx + 1.4, z: rz + 1.4 }, 0);
  }

  return {
    roomId: room.id,
    roomName: room.name || room.type,
    roomType: room.type,
    floorIndex,
    roomAreaSqft,
    items,
    meshes,
    totalFurnitureCostInr
  };
}

/**
 * Generates procedural furniture fit-outs for an entire canonical building design.
 * 
 * @param {Object} canonicalDesign - Canonical design model
 * @param {Object} [options={}]
 * @returns {Object} Comprehensive interior fit-out model
 */
export function generateDesignFurniture(canonicalDesign, options = {}) {
  if (!canonicalDesign || !Array.isArray(canonicalDesign.floors)) {
    return {
      furnitureByRoom: {},
      allFurnitureItems: [],
      allFurnitureMeshes: [],
      totalFurnitureCostInr: 0,
      totalItemCount: 0,
      furnishedRoomsCount: 0
    };
  }

  const furnitureByRoom = {};
  const allFurnitureItems = [];
  const allFurnitureMeshes = [];
  let totalFurnitureCostInr = 0;
  let furnishedRoomsCount = 0;

  canonicalDesign.floors.forEach(floor => {
    (floor.rooms || []).forEach(room => {
      const roomResult = generateRoomFurniture(room, floor, options);
      if (roomResult.items.length > 0) {
        furnitureByRoom[room.id] = roomResult;
        allFurnitureItems.push(...roomResult.items);
        allFurnitureMeshes.push(...roomResult.meshes);
        totalFurnitureCostInr += roomResult.totalFurnitureCostInr;
        furnishedRoomsCount++;
      }
    });
  });

  return {
    id: `furnishing_${canonicalDesign.id || 'des'}`,
    designId: canonicalDesign.id || null,
    generatedAt: new Date().toISOString(),
    totalItemCount: allFurnitureItems.length,
    totalMeshesCount: allFurnitureMeshes.length,
    furnishedRoomsCount,
    totalFurnitureCostInr,
    furnitureByRoom,
    allFurnitureItems,
    meshes: allFurnitureMeshes
  };
}
