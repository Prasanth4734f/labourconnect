/**
 * LabourConnect Design Engine - Procedural 3D Electrical Appliances & Lighting Generator
 * 
 * Generates genuine 3D solid geometry (vertices, quad faces, surface normal unit vectors,
 * bounds, materials, and luminescent accents) for residential electrical appliances:
 * - Ceiling Fans: Central motor hub, ceiling downrod, and 3 aerodynamic rotor blades.
 * - Air Conditioners (Split AC): Sleek indoor high-wall unit with air louver and LED display.
 * - Architectural Lighting Fixtures:
 *     - Living Room: Contemporary multi-tier chandelier/pendant + perimeter recessed LED downlights.
 *     - Dining Room: Linear suspended pendant chandelier over dining table.
 *     - Bedrooms: Flush warm LED ceiling luminaires + dual bedside reading sconces.
 *     - Kitchen: Recessed ceiling panel + wall-mounted exhaust fan.
 *     - Bathrooms: Vanity mirror light bar + moisture-resistant ceiling spot + exhaust vent.
 *     - Entrance / Porch: Welcoming warm entrance downlight + pillar lantern sconces.
 * - Main Distribution Board: Flush MCB electrical distribution panel with circuit breakers.
 * 
 * Adheres to Right-Handed World Coordinates:
 * World X (Width), World Y (Elevation Up), World Z (Depth).
 */

import { ARCHITECTURAL_DEFAULTS_3D } from '../geometry/geometryFoundation3d.js';

/**
 * Creates an axis-aligned solid 3D box mesh.
 */
function createBoxMesh(id, componentType, bounds, metadata = {}) {
  const { minX, minY, minZ, maxX, maxY, maxZ } = bounds;

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

  const faces = [
    { indices: [0, 3, 2, 1], normal: [0, 0, -1], name: 'front' },
    { indices: [5, 6, 7, 4], normal: [0, 0, 1], name: 'back' },
    { indices: [4, 7, 3, 0], normal: [-1, 0, 0], name: 'left' },
    { indices: [1, 2, 6, 5], normal: [1, 0, 0], name: 'right' },
    { indices: [4, 0, 1, 5], normal: [0, -1, 0], name: 'bottom' },
    { indices: [3, 7, 6, 2], normal: [0, 1, 0], name: 'top' }
  ];

  const w = Math.max(0.01, maxX - minX);
  const h = Math.max(0.01, maxY - minY);
  const d = Math.max(0.01, maxZ - minZ);

  return {
    id,
    type: componentType,
    componentType,
    category: 'electrical_appliances',
    isElectrical: true,
    floorIndex: metadata.floorIndex !== undefined ? metadata.floorIndex : 0,
    dimensions: {
      width: Number(w.toFixed(3)),
      height: Number(h.toFixed(3)),
      depth: Number(d.toFixed(3)),
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
    material: metadata.material || 'Architectural Electrical Fixture',
    materialId: metadata.materialId || componentType,
    color: metadata.color || '#f8fafc',
    opacity: metadata.opacity !== undefined ? metadata.opacity : 1.0,
    roughness: metadata.roughness !== undefined ? metadata.roughness : 0.35,
    metalness: metadata.metalness !== undefined ? metadata.metalness : 0.65,
    glow: metadata.glow || null,
    strokeColor: metadata.strokeColor || '#38bdf8',
    strokeWidth: metadata.strokeWidth || 0.8,
    metadata: {
      isElectrical: true,
      category: 'electrical_appliances',
      ...metadata
    }
  };
}

/**
 * Creates an angled rectangular blade component for ceiling fans.
 */
function createFanBladeMesh(id, centerX, centerY, centerZ, angleDeg, radius, bladeWidth, metadata = {}) {
  const rad = (angleDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  const innerR = 0.55;
  const outerR = radius;
  const halfW = bladeWidth / 2;
  const thick = 0.04;

  // Tangent perpendicular vector in horizontal plane
  const tx = -sin;
  const tz = cos;

  // 4 corners of bottom face
  const p0x = centerX + (innerR * cos - halfW * tx);
  const p0z = centerZ + (innerR * sin - halfW * tz);

  const p1x = centerX + (outerR * cos - halfW * tx);
  const p1z = centerZ + (outerR * sin - halfW * tz);

  const p2x = centerX + (outerR * cos + halfW * tx);
  const p2z = centerZ + (outerR * sin + halfW * tz);

  const p3x = centerX + (innerR * cos + halfW * tx);
  const p3z = centerZ + (innerR * sin + halfW * tz);

  const y0 = centerY;
  const y1 = centerY + thick;

  const vertices = [
    [Number(p0x.toFixed(3)), y0, Number(p0z.toFixed(3))],
    [Number(p1x.toFixed(3)), y0, Number(p1z.toFixed(3))],
    [Number(p2x.toFixed(3)), y0, Number(p2z.toFixed(3))],
    [Number(p3x.toFixed(3)), y0, Number(p3z.toFixed(3))],
    [Number(p0x.toFixed(3)), y1, Number(p0z.toFixed(3))],
    [Number(p1x.toFixed(3)), y1, Number(p1z.toFixed(3))],
    [Number(p2x.toFixed(3)), y1, Number(p2z.toFixed(3))],
    [Number(p3x.toFixed(3)), y1, Number(p3z.toFixed(3))]
  ];

  const faces = [
    { indices: [0, 3, 2, 1], normal: [0, -1, 0], name: 'bottom' },
    { indices: [4, 5, 6, 7], normal: [0, 1, 0], name: 'top' },
    { indices: [0, 1, 5, 4], normal: [tx, 0, tz], name: 'trailing_edge' },
    { indices: [2, 3, 7, 6], normal: [-tx, 0, -tz], name: 'leading_edge' },
    { indices: [1, 2, 6, 5], normal: [cos, 0, sin], name: 'tip' },
    { indices: [3, 0, 4, 7], normal: [-cos, 0, -sin], name: 'root' }
  ];

  const xs = vertices.map(v => v[0]);
  const ys = vertices.map(v => v[1]);
  const zs = vertices.map(v => v[2]);

  return {
    id,
    type: 'fan_blade',
    componentType: 'ceiling_fan',
    category: 'electrical_appliances',
    isElectrical: true,
    floorIndex: metadata.floorIndex !== undefined ? metadata.floorIndex : 0,
    dimensions: {
      width: Number((outerR - innerR).toFixed(3)),
      height: thick,
      depth: bladeWidth,
      units: 'feet'
    },
    bounds: {
      min: [Math.min(...xs), Math.min(...ys), Math.min(...zs)],
      max: [Math.max(...xs), Math.max(...ys), Math.max(...zs)]
    },
    centroid: [centerX, centerY, centerZ],
    vertices,
    faces,
    material: metadata.material || 'Aerodynamic ABS Fan Blade',
    materialId: 'fan_blade',
    color: metadata.color || '#334155',
    opacity: 1.0,
    roughness: 0.3,
    metalness: 0.4,
    strokeColor: '#38bdf8',
    strokeWidth: 0.8,
    metadata: {
      isElectrical: true,
      category: 'electrical_appliances',
      angleDeg,
      ...metadata
    }
  };
}

/**
 * Generates procedural 3D electrical appliances and lighting fixtures for a canonical home design.
 * 
 * @param {Object} canonicalDesign - The canonical design model (v2.0.0)
 * @param {Object} [options] - Options { floorElevations, style }
 * @returns {Object} { appliances: Array, meshes: Array, countsByType: Object, totalCount: number }
 */
export function generatePropertyElectrical(canonicalDesign, _options = {}) {
  if (!canonicalDesign || typeof canonicalDesign !== 'object') {
    return { appliances: [], meshes: [], countsByType: {}, totalCount: 0 };
  }

  const floors = canonicalDesign.floors || [];
  const appliances = [];
  const meshes = [];

  const countsByType = {
    ceilingFans: 0,
    airConditioners: 0,
    lightFixtures: 0,
    distributionPanels: 0,
    exhaustFans: 0
  };

  let mcbPlaced = false;

  floors.forEach((fl, fIdx) => {
    const isTerrace = fl.floorIndex >= 2;
    if (isTerrace) return; // Open terrace usually has dedicated exterior lighting only

    const floorBaseY = fl.elevationZ !== undefined ? fl.elevationZ : (fIdx * 10.5 + 1.5);
    const clearHeight = fl.floorHeight || ARCHITECTURAL_DEFAULTS_3D.CLEAR_CEILING_HEIGHT;
    const ceilingY = floorBaseY + clearHeight;

    const rooms = fl.rooms || [];

    rooms.forEach((rm) => {
      const b = rm.bounds;
      if (!b || b.width < 3 || b.length < 3) return;

      const roomType = (rm.type || rm.name || '').toLowerCase();
      const roomLabel = rm.name || rm.type || `Room_${rm.id}`;
      const centerX = b.x + b.width / 2;
      const centerZ = b.y + b.length / 2;

      // -----------------------------------------------------------------------
      // 1. CEILING FANS
      // Living Room, Dining Room, Bedrooms, Family Lounge, Study
      // -----------------------------------------------------------------------
      const needsFan = roomType.includes('bed') ||
        roomType.includes('living') ||
        roomType.includes('hall') ||
        roomType.includes('lounge') ||
        roomType.includes('dining') ||
        roomType.includes('study') ||
        roomType.includes('office');

      if (needsFan) {
        countsByType.ceilingFans++;
        const fanId = `fan_${fl.floorIndex}_${rm.id}`;
        const fanElevationY = ceilingY - 1.2;

        // Fan Downrod (Ceiling canopy down to motor)
        const rodMesh = createBoxMesh(
          `${fanId}_downrod`,
          'ceiling_fan_downrod',
          {
            minX: centerX - 0.08,
            minY: fanElevationY + 0.35,
            minZ: centerZ - 0.08,
            maxX: centerX + 0.08,
            maxY: ceilingY,
            maxZ: centerZ + 0.08
          },
          {
            floorIndex: fIdx,
            roomRef: rm.id,
            roomName: roomLabel,
            material: 'Brushed Nickel Fan Downrod',
            color: '#64748b',
            metalness: 0.85,
            roughness: 0.2
          }
        );
        meshes.push(rodMesh);

        // Fan Motor Hub (Cylindrical center body)
        const motorMesh = createBoxMesh(
          `${fanId}_motor_hub`,
          'ceiling_fan_motor',
          {
            minX: centerX - 0.45,
            minY: fanElevationY,
            minZ: centerZ - 0.45,
            maxX: centerX + 0.45,
            maxY: fanElevationY + 0.35,
            maxZ: centerZ + 0.45
          },
          {
            floorIndex: fIdx,
            roomRef: rm.id,
            roomName: roomLabel,
            material: 'High-Efficiency BLDC Fan Motor',
            color: '#1e293b',
            metalness: 0.8,
            roughness: 0.25,
            glow: { color: '#38bdf8', intensity: 0.3 }
          }
        );
        meshes.push(motorMesh);

        // 3 Aerodynamic Rotor Blades (120° apart)
        const bladeRadius = Math.min(2.1, Math.min(b.width, b.length) * 0.42);
        [0, 120, 240].forEach((angle, bIdx) => {
          const bladeMesh = createFanBladeMesh(
            `${fanId}_blade_${bIdx}`,
            centerX,
            fanElevationY + 0.15,
            centerZ,
            angle,
            bladeRadius,
            0.38,
            {
              floorIndex: fIdx,
              roomRef: rm.id,
              roomName: roomLabel,
              color: '#334155'
            }
          );
          meshes.push(bladeMesh);
        });

        appliances.push({
          id: fanId,
          type: 'ceiling_fan',
          name: `BLDC Ceiling Fan (${roomLabel})`,
          roomRef: rm.id,
          roomName: roomLabel,
          floorIndex: fIdx,
          position: { x: centerX, y: fanElevationY, z: centerZ },
          powerWatts: 28,
          energyRating: '5 Star BEE Rated'
        });
      }

      // -----------------------------------------------------------------------
      // 2. AIR CONDITIONERS (SPLIT AC INDOOR UNITS)
      // Master Bedroom, Bedrooms, Living Room / Lounge
      // -----------------------------------------------------------------------
      const needsAc = roomType.includes('bed') ||
        roomType.includes('master') ||
        roomType.includes('living') ||
        roomType.includes('lounge');

      if (needsAc) {
        countsByType.airConditioners++;
        const acId = `ac_${fl.floorIndex}_${rm.id}`;
        const acElevY = ceilingY - 1.4;
        const acWidth = 3.2;
        const acHeight = 0.9;
        const acDepth = 0.65;

        // Position on top of North wall inside room
        const acMinX = centerX - acWidth / 2;
        const acMaxX = centerX + acWidth / 2;
        const acMinZ = b.y + 0.1;
        const acMaxZ = b.y + 0.1 + acDepth;

        // Split AC Indoor Unit Body
        const acBodyMesh = createBoxMesh(
          `${acId}_body`,
          'air_conditioner_indoor',
          {
            minX: acMinX,
            minY: acElevY,
            minZ: acMinZ,
            maxX: acMaxX,
            maxY: acElevY + acHeight,
            maxZ: acMaxZ
          },
          {
            floorIndex: fIdx,
            roomRef: rm.id,
            roomName: roomLabel,
            material: 'Gloss Pure-White Indoor Split AC',
            color: '#f8fafc',
            metalness: 0.15,
            roughness: 0.18,
            glow: { color: '#38bdf8', intensity: 0.5 }
          }
        );
        meshes.push(acBodyMesh);

        // Louver slot accent
        const louverMesh = createBoxMesh(
          `${acId}_louver`,
          'air_conditioner_louver',
          {
            minX: acMinX + 0.2,
            minY: acElevY + 0.08,
            minZ: acMaxZ - 0.05,
            maxX: acMaxX - 0.2,
            maxY: acElevY + 0.22,
            maxZ: acMaxZ + 0.04
          },
          {
            floorIndex: fIdx,
            roomRef: rm.id,
            roomName: roomLabel,
            material: 'AC Air Discharge Louver',
            color: '#0284c7',
            metalness: 0.3,
            roughness: 0.2
          }
        );
        meshes.push(louverMesh);

        appliances.push({
          id: acId,
          type: 'air_conditioner',
          name: `1.5 Ton 5-Star Inverter Split AC (${roomLabel})`,
          roomRef: rm.id,
          roomName: roomLabel,
          floorIndex: fIdx,
          position: { x: centerX, y: acElevY, z: acMinZ },
          coolingCapacityTons: 1.5,
          energyRating: '5 Star Dual Inverter'
        });
      }

      // -----------------------------------------------------------------------
      // 3. ARCHITECTURAL LIGHT FIXTURES
      // -----------------------------------------------------------------------
      if (roomType.includes('living') || roomType.includes('hall')) {
        // Grand Living Chandelier / Multi-tier Pendant
        countsByType.lightFixtures++;
        const chId = `light_chandelier_${fl.floorIndex}_${rm.id}`;
        const chMesh = createBoxMesh(
          chId,
          'architectural_light_chandelier',
          {
            minX: centerX - 0.9,
            minY: ceilingY - 1.8,
            minZ: centerZ - 0.9,
            maxX: centerX + 0.9,
            maxY: ceilingY - 0.6,
            maxZ: centerZ + 0.9
          },
          {
            floorIndex: fIdx,
            roomRef: rm.id,
            roomName: roomLabel,
            material: 'Modern Warm Brass Halo Chandelier',
            color: '#fbbf24',
            metalness: 0.85,
            roughness: 0.15,
            glow: { color: '#fef08a', intensity: 1.2 }
          }
        );
        meshes.push(chMesh);

        // 4 Corner Recessed Warm Downlights
        const offsets = [
          [-b.width * 0.35, -b.length * 0.35],
          [b.width * 0.35, -b.length * 0.35],
          [-b.width * 0.35, b.length * 0.35],
          [b.width * 0.35, b.length * 0.35]
        ];

        offsets.forEach(([dx, dz], cIdx) => {
          countsByType.lightFixtures++;
          const spotMesh = createBoxMesh(
            `light_spot_${fl.floorIndex}_${rm.id}_${cIdx}`,
            'architectural_light_spot',
            {
              minX: centerX + dx - 0.25,
              minY: ceilingY - 0.08,
              minZ: centerZ + dz - 0.25,
              maxX: centerX + dx + 0.25,
              maxY: ceilingY,
              maxZ: centerZ + dz + 0.25
            },
            {
              floorIndex: fIdx,
              roomRef: rm.id,
              roomName: roomLabel,
              material: 'Warm White Recessed LED COB Spot (3000K)',
              color: '#fef08a',
              metalness: 0.2,
              roughness: 0.1,
              glow: { color: '#fef08a', intensity: 0.9 }
            }
          );
          meshes.push(spotMesh);
        });

      } else if (roomType.includes('dining')) {
        // Dining Table Linear Pendant Drop
        countsByType.lightFixtures++;
        const dinLightMesh = createBoxMesh(
          `light_dining_${fl.floorIndex}_${rm.id}`,
          'architectural_light_dining_pendant',
          {
            minX: centerX - 1.4,
            minY: ceilingY - 2.2,
            minZ: centerZ - 0.3,
            maxX: centerX + 1.4,
            maxY: ceilingY - 1.2,
            maxZ: centerZ + 0.3
          },
          {
            floorIndex: fIdx,
            roomRef: rm.id,
            roomName: roomLabel,
            material: 'Linear Warm Brass Dining Island Pendant',
            color: '#f59e0b',
            metalness: 0.8,
            roughness: 0.2,
            glow: { color: '#fef08a', intensity: 1.1 }
          }
        );
        meshes.push(dinLightMesh);

      } else if (roomType.includes('kitchen')) {
        // Kitchen Recessed 2×2 LED Daylight Luminaire
        countsByType.lightFixtures++;
        const kitLightMesh = createBoxMesh(
          `light_kitchen_${fl.floorIndex}_${rm.id}`,
          'architectural_light_kitchen_panel',
          {
            minX: centerX - 1.0,
            minY: ceilingY - 0.08,
            minZ: centerZ - 1.0,
            maxX: centerX + 1.0,
            maxY: ceilingY,
            maxZ: centerZ + 1.0
          },
          {
            floorIndex: fIdx,
            roomRef: rm.id,
            roomName: roomLabel,
            material: 'Anti-Glare Slim 4000K Kitchen LED Luminaire',
            color: '#ffffff',
            metalness: 0.1,
            roughness: 0.15,
            glow: { color: '#ffffff', intensity: 1.0 }
          }
        );
        meshes.push(kitLightMesh);

        // Kitchen Exhaust Ventilation Fan
        countsByType.exhaustFans++;
        const exhaustMesh = createBoxMesh(
          `exhaust_kitchen_${fl.floorIndex}_${rm.id}`,
          'appliance_exhaust_fan',
          {
            minX: b.x + b.width - 0.35,
            minY: ceilingY - 1.2,
            minZ: centerZ - 0.45,
            maxX: b.x + b.width,
            maxY: ceilingY - 0.3,
            maxZ: centerZ + 0.45
          },
          {
            floorIndex: fIdx,
            roomRef: rm.id,
            roomName: roomLabel,
            material: 'Heavy-Duty Kitchen Louver Exhaust Fan',
            color: '#475569',
            metalness: 0.6,
            roughness: 0.3
          }
        );
        meshes.push(exhaustMesh);

      } else if (roomType.includes('bath') || roomType.includes('toilet') || roomType.includes('wc')) {
        // Bathroom Vanity Mirror Strip Light + Exhaust
        countsByType.lightFixtures++;
        const bathLightMesh = createBoxMesh(
          `light_bath_${fl.floorIndex}_${rm.id}`,
          'architectural_light_bath_vanity',
          {
            minX: centerX - 0.8,
            minY: floorBaseY + 6.0,
            minZ: b.y + 0.08,
            maxX: centerX + 0.8,
            maxY: floorBaseY + 6.35,
            maxZ: b.y + 0.25
          },
          {
            floorIndex: fIdx,
            roomRef: rm.id,
            roomName: roomLabel,
            material: 'IP65 Moisture-Proof Vanity Light Strip',
            color: '#fef08a',
            metalness: 0.3,
            roughness: 0.1,
            glow: { color: '#fef08a', intensity: 0.95 }
          }
        );
        meshes.push(bathLightMesh);

        countsByType.exhaustFans++;
        const bathExhaustMesh = createBoxMesh(
          `exhaust_bath_${fl.floorIndex}_${rm.id}`,
          'appliance_exhaust_fan',
          {
            minX: b.x + b.width - 0.3,
            minY: ceilingY - 1.1,
            minZ: centerZ - 0.35,
            maxX: b.x + b.width,
            maxY: ceilingY - 0.4,
            maxZ: centerZ + 0.35
          },
          {
            floorIndex: fIdx,
            roomRef: rm.id,
            roomName: roomLabel,
            material: 'Silent Automatic Shutter Bathroom Exhaust Fan',
            color: '#94a3b8',
            metalness: 0.2,
            roughness: 0.2
          }
        );
        meshes.push(bathExhaustMesh);

      } else {
        // Standard Bed / Room Ceiling Downlight
        countsByType.lightFixtures++;
        const roomSpotMesh = createBoxMesh(
          `light_ceiling_${fl.floorIndex}_${rm.id}`,
          'architectural_light_spot',
          {
            minX: centerX - 0.3,
            minY: ceilingY - 0.08,
            minZ: centerZ - 0.3,
            maxX: centerX + 0.3,
            maxY: ceilingY,
            maxZ: centerZ + 0.3
          },
          {
            floorIndex: fIdx,
            roomRef: rm.id,
            roomName: roomLabel,
            material: 'Warm Recessed Ceiling LED Luminaire',
            color: '#fef08a',
            metalness: 0.2,
            roughness: 0.1,
            glow: { color: '#fef08a', intensity: 0.85 }
          }
        );
        meshes.push(roomSpotMesh);
      }

      // -----------------------------------------------------------------------
      // 4. MAIN MCB DISTRIBUTION BOARD (Placed once on ground floor near entry)
      // -----------------------------------------------------------------------
      if (!mcbPlaced && fIdx === 0 && (roomType.includes('foyer') || roomType.includes('living') || roomType.includes('entry'))) {
        mcbPlaced = true;
        countsByType.distributionPanels++;
        const mcbId = `mcb_panel_main`;
        const mcbElevY = floorBaseY + 4.2;

        const mcbMesh = createBoxMesh(
          mcbId,
          'electrical_panel_mcb',
          {
            minX: b.x + 0.3,
            minY: mcbElevY,
            minZ: b.y + 0.08,
            maxX: b.x + 1.8,
            maxY: mcbElevY + 2.2,
            maxZ: b.y + 0.38
          },
          {
            floorIndex: 0,
            roomRef: rm.id,
            roomName: roomLabel,
            material: '12-Way Double Door MCB Distribution Board',
            color: '#e2e8f0',
            metalness: 0.75,
            roughness: 0.25,
            glow: { color: '#22c55e', intensity: 0.6 }
          }
        );
        meshes.push(mcbMesh);

        appliances.push({
          id: mcbId,
          type: 'electrical_panel',
          name: '12-Way 3-Phase MCB Distribution Board with ELCB/RCCB',
          roomRef: rm.id,
          roomName: roomLabel,
          floorIndex: 0,
          position: { x: b.x + 1.0, y: mcbElevY + 1.1, z: b.y + 0.2 },
          isSafetyBreaker: true
        });
      }
    });
  });

  // Exterior Entrance Gate / Pillar Lanterns
  const env = canonicalDesign.site?.buildableEnvelope || { x: 3, y: 5, width: 34, length: 51 };
  countsByType.lightFixtures += 2;
  const gateLight1 = createBoxMesh(
    'light_entrance_pillar_left',
    'architectural_light_pillar',
    {
      minX: env.x - 1.2,
      minY: 4.8,
      minZ: env.y - 1.5,
      maxX: env.x - 0.4,
      maxY: 5.6,
      maxZ: env.y - 0.7
    },
    {
      floorIndex: 0,
      material: 'Heritage Brass Gate Pillar Lantern',
      color: '#fbbf24',
      metalness: 0.8,
      roughness: 0.2,
      glow: { color: '#fef08a', intensity: 1.1 }
    }
  );
  meshes.push(gateLight1);

  const gateLight2 = createBoxMesh(
    'light_entrance_pillar_right',
    'architectural_light_pillar',
    {
      minX: env.x + env.width + 0.4,
      minY: 4.8,
      minZ: env.y - 1.5,
      maxX: env.x + env.width + 1.2,
      maxY: 5.6,
      maxZ: env.y - 0.7
    },
    {
      floorIndex: 0,
      material: 'Heritage Brass Gate Pillar Lantern',
      color: '#fbbf24',
      metalness: 0.8,
      roughness: 0.2,
      glow: { color: '#fef08a', intensity: 1.1 }
    }
  );
  meshes.push(gateLight2);

  const totalCount = meshes.length;

  return {
    appliances,
    meshes,
    countsByType,
    totalCount
  };
}
