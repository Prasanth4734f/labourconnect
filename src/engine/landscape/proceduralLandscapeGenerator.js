/**
 * LabourConnect Design Engine - Procedural Landscape, Garden & Outdoor Living Generator
 * 
 * Generates genuine, site-aware procedural 3D exterior environments for residential buildings:
 * - Real plot-boundary conforming ground & lawn surfaces.
 * - Subdivided yard zones (front, rear, side setbacks) that strictly avoid building interiors.
 * - Native shade trees, columnar screening trees, and flowering shrubs with recognizable 3D anatomy.
 * - Paved pedestrian entrance pathways connecting front wicket gate to building entrance.
 * - Heavy-duty vehicle driveways connecting front vehicle gate to car porch/portico.
 * - Paved outdoor patio sit-outs with outdoor dining sets, benches, and stone planters.
 * - Full perimeter compound boundary walls with RCC coping, gate pillars, and metal louvers.
 * - Architectural outdoor illumination (pathway bollards and gate pillar lanterns).
 * - Full integration with Canonical Design Model, 3D viewport renderer, and Budget Category 7.
 */

import {
  LANDSCAPE_TYPES,
  getLandscapeDefinition
} from './landscapeCatalog.js';
import {
  createSolidBoxMesh,
  buildTree3dMeshes,
  buildShrub3dMeshes,
  buildCompoundWallSegmentMeshes,
  buildGatePillarMeshes,
  buildGateMeshes,
  buildBollardLightMeshes
} from './landscape3dMeshBuilder.js';

/**
 * Checks if a 2D box intersects an existing box in the XZ plane.
 */
function boxesOverlapXZ(b1, b2, margin = 0.1) {
  return !(
    b1.maxX <= b2.minX + margin ||
    b1.minX >= b2.maxX - margin ||
    b1.maxZ <= b2.minZ + margin ||
    b1.minZ >= b2.maxZ - margin
  );
}

/**
 * Generates procedural landscape and outdoor living environment for a residential design.
 * 
 * @param {Object} design - Canonical Design Model
 * @param {Object} [options={}] - Configuration options
 * @returns {Object} Comprehensive landscape payload { landscapeObjects, meshes, takeoff, summary }
 */
export function generatePropertyLandscape(design, _options = {}) {
  const landscapeObjects = [];
  const meshes = [];
  const placedBoxes = [];

  // 1. Plot and Site Geometry Resolution
  const site = design?.site || {};
  const inputs = design?.inputs || {};
  const plotW = Number(site.plotWidth || inputs.plotWidth || 40);
  const plotL = Number(site.plotLength || inputs.plotLength || 60);

  if (plotW <= 0 || plotL <= 0 || isNaN(plotW) || isNaN(plotL)) {
    return {
      landscapeObjects: [],
      meshes: [],
      takeoff: {
        plotAreaSqft: 0,
        turfAreaSqft: 0,
        walkwaySqft: 0,
        drivewaySqft: 0,
        patioSqft: 0,
        compoundWallRunningFt: 0,
        treesCount: 0,
        shrubsCount: 0,
        lightFixturesCount: 0,
        totalLandscapeCostInr: 0
      },
      summary: 'Invalid or zero-dimension plot; landscape skipped.'
    };
  }

  // Setbacks and Buildable Envelope
  const setbacks = site.setbacks || { front: 5, rear: 4, left: 3, right: 3 };
  const sFront = Number(setbacks.front ?? 5);
  const sRear = Number(setbacks.rear ?? 4);
  const sLeft = Number(setbacks.left ?? 3);
  const sRight = Number(setbacks.right ?? 3);

  // 2. Building Footprint Resolution (Ground Floor)
  const groundFloor = (design?.floors || []).find(f => f.floorIndex === 0) || design?.floors?.[0];
  const groundRooms = groundFloor?.rooms || [];

  let bMinX = sLeft;
  let bMaxX = plotW - sRight;
  let bMinZ = sFront;
  let bMaxZ = plotL - sRear;

  if (groundRooms.length > 0) {
    let rMinX = Infinity, rMaxX = -Infinity, rMinZ = Infinity, rMaxZ = -Infinity;
    groundRooms.forEach(rm => {
      const b = rm.bounds;
      if (b && typeof b.x === 'number') {
        rMinX = Math.min(rMinX, b.x);
        rMaxX = Math.max(rMaxX, b.x + (b.width || 0));
        rMinZ = Math.min(rMinZ, b.y);
        rMaxZ = Math.max(rMaxZ, b.y + (b.length || 0));
      }
    });
    if (Number.isFinite(rMinX) && Number.isFinite(rMaxX)) {
      bMinX = rMinX;
      bMaxX = rMaxX;
      bMinZ = rMinZ;
      bMaxZ = rMaxZ;
    }
  }

  // Reserve building footprint in placedBoxes to prevent tree/path/patio collisions
  const buildingBox = { minX: bMinX - 0.5, maxX: bMaxX + 0.5, minZ: bMinZ - 0.5, maxZ: bMaxZ + 0.5 };
  placedBoxes.push(buildingBox);

  // 3. Main Entrance and Parking Point Detection
  const porticoRoom = groundRooms.find(r => (r.type || '').toLowerCase().includes('portico') || (r.type || '').toLowerCase().includes('parking'));
  const entranceRoom = groundRooms.find(r => {
    const t = (r.type || '').toLowerCase();
    return t.includes('verandah') || t.includes('foyer') || t.includes('living') || t.includes('entrance');
  }) || groundRooms[0];

  const hasParking = inputs.hasParking !== false;
  const drivewayWidth = Math.min(11.0, Math.max(9.0, (bMaxX - bMinX) * 0.35));
  
  // Align driveway with portico if present, else place on right side of front setback
  let driveMinX = bMinX;
  if (porticoRoom?.bounds) {
    driveMinX = Math.max(0.8, porticoRoom.bounds.x);
  } else {
    driveMinX = Math.max(1.0, bMaxX - drivewayWidth);
  }
  const driveMaxX = Math.min(plotW - 0.8, driveMinX + drivewayWidth);
  const driveLength = Math.max(1.0, bMinZ);

  // Pedestrian Walkway: Align with entrance room or left side of front yard
  let walkMinX = bMinX + 1.0;
  if (entranceRoom?.bounds) {
    walkMinX = Math.max(1.0, Math.min(plotW - 5.0, entranceRoom.bounds.x + 1.0));
  }
  // Ensure walkway does not overlap driveway
  if (walkMinX + 3.5 > driveMinX && walkMinX < driveMaxX) {
    walkMinX = Math.max(1.0, driveMinX - 4.0);
  }
  const walkMaxX = walkMinX + 3.5;
  const walkLength = Math.max(1.0, bMinZ);

  // 4. Ground & Lawn Surfaces (Partitioned around Building to prevent interior penetration)
  const lawnDef = getLandscapeDefinition(LANDSCAPE_TYPES.LAWN_BERMUDA_GRASS);
  const yardStrips = [];

  // Front Yard Strip
  if (bMinZ > 0.5) {
    yardStrips.push({ minX: 0.5, maxX: plotW - 0.5, minZ: 0.5, maxZ: bMinZ });
  }
  // Rear Yard Strip
  if (plotL - bMaxZ > 0.5) {
    yardStrips.push({ minX: 0.5, maxX: plotW - 0.5, minZ: bMaxZ, maxZ: plotL - 0.5 });
  }
  // Left Yard Flank
  if (bMinX > 0.5) {
    yardStrips.push({ minX: 0.5, maxX: bMinX, minZ: bMinZ, maxZ: bMaxZ });
  }
  // Right Yard Flank
  if (plotW - bMaxX > 0.5) {
    yardStrips.push({ minX: bMaxX, maxX: plotW - 0.5, minZ: bMinZ, maxZ: bMaxZ });
  }

  let totalLawnAreaSqft = 0;
  yardStrips.forEach((strip, sIdx) => {
    const area = (strip.maxX - strip.minX) * (strip.maxZ - strip.minZ);
    totalLawnAreaSqft += area;
    meshes.push(createSolidBoxMesh(
      `landscape_lawn_strip_${sIdx}`,
      'landscape_lawn',
      {
        minX: strip.minX, minY: 0, minZ: strip.minZ,
        maxX: strip.maxX, maxY: lawnDef.defaultElevationY, maxZ: strip.maxZ
      },
      { color: lawnDef.color, strokeColor: lawnDef.strokeColor, strokeWidth: 0.5, materialKey: 'site_grass_lawn' }
    ));
  });

  landscapeObjects.push({
    id: 'landscape_lawn_overall',
    type: LANDSCAPE_TYPES.LAWN_BERMUDA_GRASS,
    name: lawnDef.name,
    category: lawnDef.category,
    quantity: Math.round(totalLawnAreaSqft),
    unit: 'sq.ft',
    baseRateInr: lawnDef.baseRateInr,
    rateKey: lawnDef.rateKey
  });

  // 5. Vehicle Driveway & Pedestrian Pathway
  let drivewaySqft = 0;
  if (hasParking && driveLength > 1.5) {
    drivewaySqft = Math.round((driveMaxX - driveMinX) * driveLength);
    const driveDef = getLandscapeDefinition(LANDSCAPE_TYPES.DRIVEWAY_PAVERS);
    const driveBox = { minX: driveMinX, maxX: driveMaxX, minZ: 0.5, maxZ: bMinZ };
    placedBoxes.push(driveBox);

    meshes.push(createSolidBoxMesh(
      'landscape_driveway',
      'landscape_driveway',
      { minX: driveMinX, minY: 0.05, minZ: 0.5, maxX: driveMaxX, maxY: driveDef.defaultElevationY, maxZ: bMinZ },
      { color: driveDef.color, strokeColor: driveDef.strokeColor, strokeWidth: 0.8, materialKey: driveDef.materialKey }
    ));

    landscapeObjects.push({
      id: 'landscape_driveway_paving',
      type: LANDSCAPE_TYPES.DRIVEWAY_PAVERS,
      name: driveDef.name,
      category: driveDef.category,
      position: { x: (driveMinX + driveMaxX) / 2, z: (0.5 + bMinZ) / 2 },
      dimensions: { width: driveMaxX - driveMinX, length: driveLength },
      quantity: drivewaySqft,
      unit: 'sq.ft',
      baseRateInr: driveDef.baseRateInr,
      rateKey: driveDef.rateKey
    });
  }

  // Pedestrian Walkway Slabs
  let walkwaySqft = 0;
  if (walkLength > 1.5) {
    walkwaySqft = Math.round((walkMaxX - walkMinX) * walkLength);
    const walkDef = getLandscapeDefinition(LANDSCAPE_TYPES.PAVER_WALKWAY);
    const walkBox = { minX: walkMinX, maxX: walkMaxX, minZ: 0.5, maxZ: bMinZ };
    placedBoxes.push(walkBox);

    meshes.push(createSolidBoxMesh(
      'landscape_walkway',
      'landscape_walkway',
      { minX: walkMinX, minY: 0.05, minZ: 0.5, maxX: walkMaxX, maxY: walkDef.defaultElevationY, maxZ: bMinZ },
      { color: walkDef.color, strokeColor: walkDef.strokeColor, strokeWidth: 0.7, materialKey: walkDef.materialKey }
    ));

    landscapeObjects.push({
      id: 'landscape_pedestrian_walkway',
      type: LANDSCAPE_TYPES.PAVER_WALKWAY,
      name: walkDef.name,
      category: walkDef.category,
      position: { x: (walkMinX + walkMaxX) / 2, z: (0.5 + bMinZ) / 2 },
      dimensions: { width: walkMaxX - walkMinX, length: walkLength },
      quantity: walkwaySqft,
      unit: 'sq.ft',
      baseRateInr: walkDef.baseRateInr,
      rateKey: walkDef.rateKey
    });
  }

  // Deduct driveway and walkway from effective lawn area for budget transparency
  const effectiveTurfSqft = Math.max(0, totalLawnAreaSqft - (drivewaySqft + walkwaySqft));

  // 6. Outdoor Living Patio & Sit-Out
  let patioSqft = 0;
  const rearDepth = plotL - bMaxZ;
  const frontDepth = bMinZ;

  let pMinX = 0, pMaxX = 0, pMinZ = 0, pMaxZ = 0;
  let patioFeasible = false;

  // Check 1: Central Front Courtyard (between walkway and driveway)
  if (frontDepth >= 4.0 && (driveMinX - walkMaxX) >= 5.0) {
    pMinX = walkMaxX + 0.8;
    pMaxX = Math.min(driveMinX - 0.8, pMinX + 8.5);
    pMinZ = 0.8;
    pMaxZ = Math.min(bMinZ - 0.5, pMinZ + 4.5);
    patioFeasible = true;
  } else if (rearDepth >= 5.0) {
    // Check 2: Rear Garden Patio Sit-Out
    const patioW = Math.min(12.0, Math.max(7.0, plotW * 0.25));
    const patioL = Math.min(6.0, Math.max(3.5, rearDepth - 1.5));
    pMinX = Math.max(2.0, (plotW - patioW) / 2);
    pMaxX = pMinX + patioW;
    pMinZ = bMaxZ + 0.8;
    pMaxZ = pMinZ + patioL;
    patioFeasible = true;
  } else if (frontDepth >= 4.0) {
    // Check 3: Front Corner Sit-Out
    const patioW = Math.min(8.0, Math.max(5.0, plotW * 0.2));
    const patioL = Math.min(4.5, frontDepth - 0.8);
    pMinX = (driveMinX > plotW / 2) ? 1.2 : Math.max(1.2, plotW - patioW - 1.2);
    pMaxX = pMinX + patioW;
    pMinZ = 0.6;
    pMaxZ = pMinZ + patioL;
    patioFeasible = true;
  }

  if (patioFeasible) {
    const pBox = { minX: pMinX, maxX: pMaxX, minZ: pMinZ, maxZ: pMaxZ };
    let canPlacePatio = true;
    for (const pb of placedBoxes) {
      if (boxesOverlapXZ(pBox, pb, 0.1)) {
        canPlacePatio = false;
        break;
      }
    }

    if (canPlacePatio) {
      patioSqft = Math.round((pMaxX - pMinX) * (pMaxZ - pMinZ));
      placedBoxes.push(pBox);
      const patioDef = getLandscapeDefinition(LANDSCAPE_TYPES.PATIO_TERRACE);

      // Paved Patio Slab
      meshes.push(createSolidBoxMesh(
        'landscape_patio_slab',
        'landscape_patio',
        { minX: pMinX, minY: 0.05, minZ: pMinZ, maxX: pMaxX, maxY: patioDef.defaultElevationY, maxZ: pMaxZ },
        { color: patioDef.color, strokeColor: patioDef.strokeColor, strokeWidth: 0.8, materialKey: patioDef.materialKey }
      ));

      landscapeObjects.push({
        id: 'landscape_patio_terrace',
        type: LANDSCAPE_TYPES.PATIO_TERRACE,
        name: patioDef.name,
        category: patioDef.category,
        quantity: patioSqft,
        unit: 'sq.ft',
        baseRateInr: patioDef.baseRateInr,
        rateKey: patioDef.rateKey
      });

      // Patio Table & Garden Chairs
      const tableCenterX = (pMinX + pMaxX) / 2;
      const tableCenterZ = (pMinZ + pMaxZ) / 2;
      const tableDef = getLandscapeDefinition(LANDSCAPE_TYPES.PATIO_GARDEN_TABLE);
      meshes.push(createSolidBoxMesh(
        'landscape_patio_table',
        'outdoor_furniture',
        {
          minX: tableCenterX - 1.2, minY: patioDef.defaultElevationY, minZ: tableCenterZ - 1.0,
          maxX: tableCenterX + 1.2, maxY: patioDef.defaultElevationY + 2.5, maxZ: tableCenterZ + 1.0
        },
        { color: tableDef.materials.top.color, strokeColor: tableDef.materials.top.stroke }
      ));
      landscapeObjects.push({
        id: 'landscape_patio_table_1',
        type: LANDSCAPE_TYPES.PATIO_GARDEN_TABLE,
        name: tableDef.name,
        category: tableDef.category,
        quantity: 1,
        unit: 'nos',
        baseRateInr: tableDef.baseRateInr,
        rateKey: tableDef.rateKey
      });

      // 2 Wicker Armchairs
      const chairDef = getLandscapeDefinition(LANDSCAPE_TYPES.PATIO_GARDEN_CHAIR);
      meshes.push(createSolidBoxMesh(
        'landscape_patio_chair_1',
        'outdoor_furniture',
        {
          minX: Math.max(pMinX + 0.2, tableCenterX - 2.4), minY: patioDef.defaultElevationY, minZ: tableCenterZ - 0.8,
          maxX: Math.max(pMinX + 1.4, tableCenterX - 1.4), maxY: patioDef.defaultElevationY + 2.6, maxZ: tableCenterZ + 0.8
        },
        { color: chairDef.materials.body.color, strokeColor: chairDef.materials.body.stroke }
      ));
      meshes.push(createSolidBoxMesh(
        'landscape_patio_chair_2',
        'outdoor_furniture',
        {
          minX: Math.min(pMaxX - 1.4, tableCenterX + 1.4), minY: patioDef.defaultElevationY, minZ: tableCenterZ - 0.8,
          maxX: Math.min(pMaxX - 0.2, tableCenterX + 2.4), maxY: patioDef.defaultElevationY + 2.6, maxZ: tableCenterZ + 0.8
        },
        { color: chairDef.materials.body.color, strokeColor: chairDef.materials.body.stroke }
      ));
      landscapeObjects.push({
        id: 'landscape_patio_chairs',
        type: LANDSCAPE_TYPES.PATIO_GARDEN_CHAIR,
        name: chairDef.name,
        category: chairDef.category,
        quantity: 2,
        unit: 'nos',
        baseRateInr: chairDef.baseRateInr,
        rateKey: chairDef.rateKey
      });

      // Stone Bench
      const benchDef = getLandscapeDefinition(LANDSCAPE_TYPES.GARDEN_STONE_BENCH);
      meshes.push(createSolidBoxMesh(
        'landscape_patio_bench',
        'outdoor_furniture',
        {
          minX: tableCenterX - 1.8, minY: patioDef.defaultElevationY, minZ: Math.max(pMinZ + 0.2, tableCenterZ - 1.8),
          maxX: tableCenterX + 1.8, maxY: patioDef.defaultElevationY + 1.6, maxZ: Math.max(pMinZ + 0.8, tableCenterZ - 1.2)
        },
        { color: benchDef.materials.slab.color, strokeColor: benchDef.materials.slab.stroke }
      ));
      landscapeObjects.push({
        id: 'landscape_patio_bench_1',
        type: LANDSCAPE_TYPES.GARDEN_STONE_BENCH,
        name: benchDef.name,
        category: benchDef.category,
        quantity: 1,
        unit: 'nos',
        baseRateInr: benchDef.baseRateInr,
        rateKey: benchDef.rateKey
      });

      // Stone Planter Box along patio edge
      const planterDef = getLandscapeDefinition(LANDSCAPE_TYPES.STONE_PLANTER_BOX);
      meshes.push(createSolidBoxMesh(
        'landscape_patio_planter',
        'landscape_planter',
        {
          minX: pMinX + 0.2, minY: patioDef.defaultElevationY, minZ: Math.min(pMaxZ - 1.0, tableCenterZ + 1.2),
          maxX: pMinX + 2.8, maxY: patioDef.defaultElevationY + 1.5, maxZ: pMaxZ - 0.2
        },
        { color: planterDef.materials.box.color, strokeColor: planterDef.materials.box.stroke }
      ));
      landscapeObjects.push({
        id: 'landscape_patio_planter_1',
        type: LANDSCAPE_TYPES.STONE_PLANTER_BOX,
        name: planterDef.name,
        category: planterDef.category,
        quantity: 1,
        unit: 'nos',
        baseRateInr: planterDef.baseRateInr,
        rateKey: planterDef.rateKey
      });
    }
  }

  // 7. Compound Boundary Wall, Gate Pillars & Entrance Gates
  const wallDef = getLandscapeDefinition(LANDSCAPE_TYPES.COMPOUND_WALL_SECTION);
  let compoundWallRunningFt = 0;

  if (inputs.hasCompoundWall !== false) {
    // Left Boundary (Full Length)
    const leftMeshes = buildCompoundWallSegmentMeshes(
      'compound_wall_left',
      { x: 0.35, y: 0.35 },
      { x: 0.35, y: plotL - 0.35 },
      wallDef
    );
    meshes.push(...leftMeshes);
    compoundWallRunningFt += plotL;

    // Right Boundary (Full Length)
    const rightMeshes = buildCompoundWallSegmentMeshes(
      'compound_wall_right',
      { x: plotW - 0.35, y: 0.35 },
      { x: plotW - 0.35, y: plotL - 0.35 },
      wallDef
    );
    meshes.push(...rightMeshes);
    compoundWallRunningFt += plotL;

    // Rear Boundary (Full Width)
    const rearMeshes = buildCompoundWallSegmentMeshes(
      'compound_wall_rear',
      { x: 0.35, y: plotL - 0.35 },
      { x: plotW - 0.35, y: plotL - 0.35 },
      wallDef
    );
    meshes.push(...rearMeshes);
    compoundWallRunningFt += plotW;

    // Front Roadside Boundary (with Gate Openings)
    // Front has: [Left Wall Segment] -> [Pedestrian Gate] -> [Pillar] -> [Vehicle Gate] -> [Pillar] -> [Right Wall Segment]
    const vGateDef = getLandscapeDefinition(LANDSCAPE_TYPES.ENTRANCE_GATE_VEHICLE);
    const pGateDef = getLandscapeDefinition(LANDSCAPE_TYPES.ENTRANCE_GATE_PEDESTRIAN);
    const pillarDef = getLandscapeDefinition(LANDSCAPE_TYPES.GATE_PILLAR);

    const vGateW = Math.min(11.0, driveMaxX - driveMinX);
    const vGateX = driveMinX + vGateW / 2;
    const pGateW = 3.5;
    const pGateX = walkMinX + pGateW / 2;

    // Front Gate Pillars
    const pillar1X = driveMinX - 0.7;
    const pillar2X = driveMaxX + 0.7;
    const pPillarX = walkMaxX + 0.7;

    // Pillar 1 (Left of Vehicle Gate)
    meshes.push(...buildGatePillarMeshes({ id: 'gate_pillar_1', position: { x: pillar1X, z: 0.35 } }, pillarDef));
    // Pillar 2 (Right of Vehicle Gate)
    meshes.push(...buildGatePillarMeshes({ id: 'gate_pillar_2', position: { x: pillar2X, z: 0.35 } }, pillarDef));
    // Pedestrian Pillar
    meshes.push(...buildGatePillarMeshes({ id: 'gate_pillar_ped', position: { x: pPillarX, z: 0.35 } }, pillarDef));

    // Vehicle Gate
    meshes.push(...buildGateMeshes({
      id: 'entrance_gate_vehicle',
      position: { x: vGateX, z: 0.35 },
      dimensions: { width: vGateW, height: 5.0 }
    }, vGateDef));

    // Pedestrian Gate
    meshes.push(...buildGateMeshes({
      id: 'entrance_gate_ped',
      position: { x: pGateX, z: 0.35 },
      dimensions: { width: pGateW, height: 5.0 }
    }, pGateDef));

    // Fill remaining front wall segments
    const frontSegments = [
      { start: { x: 0.35, y: 0.35 }, end: { x: Math.min(pGateX - pGateW / 2 - 0.5, pillar1X - 0.5), y: 0.35 } },
      { start: { x: pillar2X + 0.5, y: 0.35 }, end: { x: plotW - 0.35, y: 0.35 } }
    ];

    frontSegments.forEach((seg, idx) => {
      if (seg.end.x > seg.start.x + 1.0) {
        const segMeshes = buildCompoundWallSegmentMeshes(`compound_wall_front_${idx}`, seg.start, seg.end, wallDef);
        meshes.push(...segMeshes);
        compoundWallRunningFt += (seg.end.x - seg.start.x);
      }
    });

    landscapeObjects.push({
      id: 'landscape_compound_wall',
      type: LANDSCAPE_TYPES.COMPOUND_WALL_SECTION,
      name: wallDef.name,
      category: wallDef.category,
      quantity: Math.round(compoundWallRunningFt),
      unit: 'r.ft',
      baseRateInr: wallDef.baseRateInr,
      rateKey: wallDef.rateKey
    });

    landscapeObjects.push({
      id: 'landscape_entrance_gate',
      type: LANDSCAPE_TYPES.ENTRANCE_GATE_VEHICLE,
      name: vGateDef.name,
      category: vGateDef.category,
      quantity: 1,
      unit: 'nos',
      baseRateInr: vGateDef.baseRateInr,
      rateKey: vGateDef.rateKey
    });
  }

  // 8. Deterministic Tree and Shrub Placement
  let treesCount = 0;
  let shrubsCount = 0;

  function tryPlaceVegetation(type, posProposal) {
    const def = getLandscapeDefinition(type);
    if (!def) return false;

    // Use trunk/root collision box (radius 0.7-1.0 ft)
    const trunkRadius = type.includes('tree') ? 0.9 : 0.7;
    const testBox = {
      minX: posProposal.x - trunkRadius,
      maxX: posProposal.x + trunkRadius,
      minZ: posProposal.z - trunkRadius,
      maxZ: posProposal.z + trunkRadius
    };

    // Boundary check: must be strictly inside plot boundary with 0.6 ft margin
    if (
      testBox.minX < 0.6 ||
      testBox.maxX > plotW - 0.6 ||
      testBox.minZ < 0.6 ||
      testBox.maxZ > plotL - 0.6
    ) {
      return false;
    }

    // Overlap check against building, driveway, walkway, patio, and existing trees
    for (const pb of placedBoxes) {
      if (boxesOverlapXZ(testBox, pb, 0.05)) {
        return false;
      }
    }

    // Valid placement: create record and 3D meshes
    const itemId = `veg_${type}_${landscapeObjects.length + 1}`;
    const vegItem = {
      id: itemId,
      type,
      name: def.name,
      category: def.category,
      position: { x: posProposal.x, z: posProposal.z },
      dimensions: def.dimensions,
      width: def.dimensions?.width || 2.0,
      height: def.dimensions?.height || 2.0,
      baseRateInr: def.baseRateInr,
      rateKey: def.rateKey
    };

    landscapeObjects.push(vegItem);
    placedBoxes.push(testBox);

    if (def.category === 'vegetation') {
      if (type.includes('tree')) {
        treesCount++;
        meshes.push(...buildTree3dMeshes(vegItem, def, { plotW, plotL }));
      } else {
        shrubsCount++;
        meshes.push(...buildShrub3dMeshes(vegItem, def, { plotW, plotL }));
      }
    }
    return true;
  }

  // A. Rear Setback: 2-3 Native Shade Trees (Neem / Rain Tree)
  const rearDepthVal = plotL - bMaxZ;
  if (rearDepthVal >= 2.5) {
    const rearTreeZ = bMaxZ + Math.min(15, rearDepthVal * 0.4);
    tryPlaceVegetation(LANDSCAPE_TYPES.TREE_NEEM_SHADE, { x: plotW * 0.22, z: rearTreeZ });
    tryPlaceVegetation(LANDSCAPE_TYPES.TREE_NEEM_SHADE, { x: plotW * 0.78, z: rearTreeZ });
    if (plotW >= 42) {
      tryPlaceVegetation(LANDSCAPE_TYPES.TREE_NEEM_SHADE, { x: plotW * 0.5, z: rearTreeZ });
    }
    // Expansive rear garden (e.g. 0.3 acre estates with deep yards)
    if (rearDepthVal >= 25) {
      const rearTreeZ2 = bMaxZ + rearDepthVal * 0.75;
      tryPlaceVegetation(LANDSCAPE_TYPES.TREE_FRANGIPANI_FLOWERING, { x: plotW * 0.25, z: rearTreeZ2 });
      tryPlaceVegetation(LANDSCAPE_TYPES.TREE_FRANGIPANI_FLOWERING, { x: plotW * 0.75, z: rearTreeZ2 });
      tryPlaceVegetation(LANDSCAPE_TYPES.TREE_NEEM_SHADE, { x: plotW * 0.5, z: rearTreeZ2 });
      if (plotW >= 65) {
        tryPlaceVegetation(LANDSCAPE_TYPES.TREE_ASHOKA_COLUMNAR, { x: plotW * 0.12, z: rearTreeZ2 });
        tryPlaceVegetation(LANDSCAPE_TYPES.TREE_ASHOKA_COLUMNAR, { x: plotW * 0.88, z: rearTreeZ2 });
      }
    }
  }

  // B. Side Setbacks: Columnar Ashoka Screening Trees along property flanks
  const midZ1 = (bMinZ + bMaxZ) * 0.35;
  const midZ2 = (bMinZ + bMaxZ) * 0.65;

  // Left setback screening
  if (bMinX >= 1.8) {
    tryPlaceVegetation(LANDSCAPE_TYPES.TREE_ASHOKA_COLUMNAR, { x: bMinX * 0.5, z: midZ1 });
    tryPlaceVegetation(LANDSCAPE_TYPES.TREE_ASHOKA_COLUMNAR, { x: bMinX * 0.5, z: midZ2 });
  }
  // Right setback screening
  if (plotW - bMaxX >= 1.8) {
    tryPlaceVegetation(LANDSCAPE_TYPES.TREE_ASHOKA_COLUMNAR, { x: bMaxX + (plotW - bMaxX) * 0.5, z: midZ1 });
    tryPlaceVegetation(LANDSCAPE_TYPES.TREE_ASHOKA_COLUMNAR, { x: bMaxX + (plotW - bMaxX) * 0.5, z: midZ2 });
  }

  // C. Front Garden: Flowering Frangipani Champa Tree as focal point
  if (bMinZ >= 3.5) {
    const frontTreeX = (driveMinX > plotW / 2) ? 2.5 : plotW - 2.5;
    tryPlaceVegetation(LANDSCAPE_TYPES.TREE_FRANGIPANI_FLOWERING, { x: frontTreeX, z: bMinZ * 0.5 });
  }

  // D. Flowering Bougainvillea & Boxwood Shrubs along perimeter and garden edges
  const shrubYards = [
    { x: 1.5, z: 1.5 },
    { x: plotW - 1.5, z: 1.5 },
    { x: 1.5, z: plotL - 1.5 },
    { x: plotW - 1.5, z: plotL - 1.5 },
    { x: plotW * 0.5, z: plotL - 1.5 }
  ];
  shrubYards.forEach(s => {
    tryPlaceVegetation(LANDSCAPE_TYPES.SHRUB_BOUGAINVILLEA, s);
    tryPlaceVegetation(LANDSCAPE_TYPES.SHRUB_EVERGREEN_BOXWOOD, { x: Math.min(plotW - 1.5, s.x + 1.2), z: s.z });
  });

  // 9. Architectural Outdoor Illumination (Bollards & Gate Lanterns)
  let lightFixturesCount = 0;
  const bollardDef = getLandscapeDefinition(LANDSCAPE_TYPES.LIGHT_BOLLARD_PATHWAY);

  // Bollard lights along pedestrian walkway
  if (walkLength > 4.0) {
    const b1 = { id: 'light_bollard_1', position: { x: walkMinX - 0.6, z: 2.5 } };
    const b2 = { id: 'light_bollard_2', position: { x: walkMinX - 0.6, z: bMinZ - 1.5 } };
    meshes.push(...buildBollardLightMeshes(b1, bollardDef));
    meshes.push(...buildBollardLightMeshes(b2, bollardDef));
    lightFixturesCount += 2;
  }

  // Bollard lights along driveway edge
  if (hasParking && driveLength > 4.0) {
    const b3 = { id: 'light_bollard_3', position: { x: driveMaxX + 0.6, z: 2.5 } };
    const b4 = { id: 'light_bollard_4', position: { x: driveMaxX + 0.6, z: bMinZ - 1.5 } };
    meshes.push(...buildBollardLightMeshes(b3, bollardDef));
    meshes.push(...buildBollardLightMeshes(b4, bollardDef));
    lightFixturesCount += 2;
  }

  if (lightFixturesCount > 0) {
    landscapeObjects.push({
      id: 'landscape_lighting_bollards',
      type: LANDSCAPE_TYPES.LIGHT_BOLLARD_PATHWAY,
      name: bollardDef.name,
      category: bollardDef.category,
      quantity: lightFixturesCount,
      unit: 'nos',
      baseRateInr: bollardDef.baseRateInr,
      rateKey: bollardDef.rateKey
    });
  }

  // 10. Itemized Cost Takeoff Calculation
  const totalLandscapeCostInr = landscapeObjects.reduce((sum, obj) => {
    const qty = Number(obj.quantity) || 1;
    const rate = Number(obj.baseRateInr) || 0;
    return sum + (qty * rate);
  }, 0);

  const takeoff = {
    plotAreaSqft: plotW * plotL,
    turfAreaSqft: Math.round(effectiveTurfSqft),
    walkwaySqft,
    drivewaySqft,
    patioSqft,
    compoundWallRunningFt: Math.round(compoundWallRunningFt),
    treesCount,
    shrubsCount,
    lightFixturesCount,
    totalLandscapeCostInr: Math.round(totalLandscapeCostInr)
  };

  return {
    landscapeObjects,
    meshes,
    takeoff,
    summary: `Procedurally generated ${treesCount} trees, ${shrubsCount} shrubs, ${Math.round(effectiveTurfSqft)} sq.ft lawn, ${walkwaySqft} sq.ft walkway, and ${Math.round(compoundWallRunningFt)} r.ft compound wall.`
  };
}
