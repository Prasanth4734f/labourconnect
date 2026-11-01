/**
 * LabourConnect Architectural Intelligence Engine
 * Specialized Procedural Layout Solvers for True Architectural Diversity
 * 
 * Implements genuine spatial archetypes and volumetric massings:
 * 1. Courtyard-Centric Residence (Traditional Nalukettu / Inward-Facing Brahmasthan)
 * 2. L-Shaped Court Residence (Dual-Wing with Corner Outdoor Garden Court)
 * 3. Split-Wing Staggered Residence (Offset Articulated Volumetric Masses)
 * 4. Pavilion-Based Villa (Central Social Pavilion flanked by Private Pods)
 */

import { ROOM_TYPES, ZONES } from '../schema/canonicalDesignSchema.js';

/**
 * Creates a normalized room record with bounds, polygon, area, and dimensions label.
 */
export function createPlacedRoomRecord({ id, name, type, zone, bounds, finish, orientation, doors = [], windows = [] }) {
  const b = {
    x: Number(bounds.x.toFixed(2)),
    y: Number(bounds.y.toFixed(2)),
    width: Number(bounds.width.toFixed(2)),
    length: Number(bounds.length.toFixed(2))
  };

  const polygon = [
    { x: b.x, y: b.y },
    { x: Number((b.x + b.width).toFixed(2)), y: b.y },
    { x: Number((b.x + b.width).toFixed(2)), y: Number((b.y + b.length).toFixed(2)) },
    { x: b.x, y: Number((b.y + b.length).toFixed(2)) }
  ];

  return {
    id,
    name,
    type,
    zone,
    bounds: b,
    polygon,
    areaSqft: Math.round(b.width * b.length),
    dimensionsLabel: `${b.width.toFixed(1)}' × ${b.length.toFixed(1)}'`,
    finish,
    orientation,
    doors,
    windows
  };
}

/**
 * Pre-computes structural stairwell bounds for an archetype to ensure vertical alignment across floors.
 */
export function getArchetypeStairwellBounds(archetype, env, options = {}) {
  const W = env.width;
  const L = env.length;

  if (archetype === 'courtyard_centric') {
    const frontL = Number(Math.max(7.5, Math.min(10.5, L * 0.22)).toFixed(2));
    const midL = Number(Math.max(14.0, Math.min(22.0, L * 0.48)).toFixed(2));
    const yMid = Number((env.y + frontL).toFixed(2));
    const stairW = Number(Math.max(5.5, Math.min(7.5, W * 0.16)).toFixed(2));
    const stairX = Number((env.x + W - stairW).toFixed(2));
    return { x: stairX, y: yMid, width: stairW, length: midL };
  }

  if (archetype === 'l_shape_court') {
    const courtL = Number(Math.max(12.0, Math.min(18.0, L * 0.40)).toFixed(2));
    const rearWingL = Number((L - courtL).toFixed(2));
    const yRear = Number((env.y + courtL).toFixed(2));
    const stairW = Number(Math.max(7.0, Math.min(8.5, W * 0.20)).toFixed(2));
    const stairL = Number(Math.max(12.0, Math.min(15.0, rearWingL * 0.55)).toFixed(2));
    return { x: env.x, y: yRear, width: stairW, length: stairL };
  }

  if (archetype === 'split_wing_zoned') {
    const wing1W = Number((W * 0.52).toFixed(2));
    const wing2W = Number((W * 0.52).toFixed(2));
    const coreW = Number((wing1W + wing2W - W).toFixed(2));
    const xCore = Number((env.x + wing1W - coreW).toFixed(2));
    const yCore = Number((env.y + L * 0.40).toFixed(2));
    const coreL = Number(Math.max(13.0, Math.min(16.0, L * 0.35)).toFixed(2));
    return { x: xCore, y: yCore, width: coreW, length: coreL };
  }

  if (archetype === 'villa_pavilion') {
    const verL = Number(Math.max(6.5, Math.min(9.5, L * 0.18)).toFixed(2));
    const mainL = Number((L - verL).toFixed(2));
    const yMain = Number((env.y + verL).toFixed(2));
    const pod1W = Number((W * 0.32).toFixed(2));
    const stairL = Number((mainL * 0.38).toFixed(2));
    return { x: env.x, y: yMain, width: pod1W, length: stairL };
  }

  return null;
}

// =============================================================================
// 1. COURTYARD-CENTRIC RESIDENCE (Nalukettu / Inward-Facing Court)
// =============================================================================

export function solveCourtyardGroundLayout({ env, specs, floorProg, stairwellBounds, options = {}, rng }) {
  const rooms = [];
  const W = env.width;
  const L = env.length;

  const hasParking = specs.amenities?.hasParking !== false && specs.hasParking !== false;
  const isPoojaDisabled = specs.amenities?.hasPooja === false || specs.hasPooja === false;

  // 1. Front Arrival Band (22% depth)
  const yFront = env.y;
  let frontL, midL, rearL, yMid, yRear;

  if (stairwellBounds) {
    yMid = Number(stairwellBounds.y.toFixed(2));
    midL = Number(stairwellBounds.length.toFixed(2));
    frontL = Number((yMid - env.y).toFixed(2));
    yRear = Number((yMid + midL).toFixed(2));
    rearL = Number(((env.y + L) - yRear).toFixed(2));
  } else {
    frontL = Number(Math.max(7.5, Math.min(10.5, L * 0.22)).toFixed(2));
    midL = Number(Math.max(14.0, Math.min(22.0, L * 0.48)).toFixed(2));
    rearL = Number((L - (frontL + midL)).toFixed(2));
    yMid = Number((yFront + frontL).toFixed(2));
    yRear = Number((yMid + midL).toFixed(2));
  }

  // Front Wing: Portico + Grand Entrance Verandah / Poomukham
  if (hasParking) {
    const porticoW = Number(Math.min(15.0, Math.max(12.0, W * 0.42)).toFixed(2));
    const foyerW = Number((W - porticoW).toFixed(2));
    const porticoOnLeft = Boolean(options.porticoOnLeft);
    const porticoX = porticoOnLeft ? env.x : Number((env.x + foyerW).toFixed(2));
    const foyerX = porticoOnLeft ? Number((env.x + porticoW).toFixed(2)) : env.x;

    rooms.push(createPlacedRoomRecord({
      id: 'g_portico',
      name: 'Pillared Car Porch & Portico',
      type: ROOM_TYPES.PORTICO,
      zone: ZONES.OUTDOOR,
      bounds: { x: porticoX, y: yFront, width: porticoW, length: frontL },
      finish: 'Handcrafted Terracotta Stone Pavers',
      orientation: specs.facingDirection || 'East',
      doors: [],
      windows: []
    }));

    rooms.push(createPlacedRoomRecord({
      id: 'g_foyer',
      name: 'Grand Entrance Verandah & Poomukham',
      type: ROOM_TYPES.FOYER,
      zone: ZONES.PUBLIC,
      bounds: { x: foyerX, y: yFront, width: foyerW, length: frontL },
      finish: 'Heritage Athangudi Chettinad Tiles',
      orientation: specs.facingDirection || 'East',
      doors: [
        { x: Number((foyerX + foyerW / 2).toFixed(2)), y: yFront, width: 4.0, wall: 'north', label: 'Carved Teak Main Door' },
        { x: Number((foyerX + foyerW / 2).toFixed(2)), y: yMid, width: 4.5, wall: 'south', label: 'Inner Court Threshold' }
      ],
      windows: [{ x: foyerX, y: Number((yFront + frontL / 2).toFixed(2)), width: 5.0, wall: 'west' }]
    }));
  } else {
    rooms.push(createPlacedRoomRecord({
      id: 'g_foyer',
      name: 'Grand Entrance Verandah & Poomukham',
      type: ROOM_TYPES.FOYER,
      zone: ZONES.PUBLIC,
      bounds: { x: env.x, y: yFront, width: W, length: frontL },
      finish: 'Heritage Athangudi Chettinad Tiles',
      orientation: specs.facingDirection || 'East',
      doors: [
        { x: Number((env.x + W / 2).toFixed(2)), y: yFront, width: 4.0, wall: 'north', label: 'Carved Teak Main Door' },
        { x: Number((env.x + W / 2).toFixed(2)), y: yMid, width: 4.5, wall: 'south', label: 'Inner Court Threshold' }
      ],
      windows: [{ x: env.x, y: Number((yFront + frontL / 2).toFixed(2)), width: 5.0, wall: 'west' }]
    }));
  }

  // 2. Mid Core: Central Courtyard + Left Living + Right Dining/Staircase
  const courtW = Number(Math.max(8.0, Math.min(12.0, W * 0.28)).toFixed(2));
  const courtL = Number(Math.max(8.0, Math.min(12.0, midL * 0.65)).toFixed(2));
  const courtX = Number((env.x + (W - courtW) / 2).toFixed(2));
  const courtY = Number((yMid + (midL - courtL) / 2).toFixed(2));

  // Courtyard in the center
  rooms.push(createPlacedRoomRecord({
    id: 'g_courtyard',
    name: 'Traditional Central Courtyard (Nadumuttam)',
    type: ROOM_TYPES.COURTYARD,
    zone: ZONES.OUTDOOR,
    bounds: { x: courtX, y: courtY, width: courtW, length: courtL },
    finish: 'Open Sky Sunken Court + Flamed Granite & Thulsi Mandap',
    orientation: 'Central',
    doors: [
      { x: Number((courtX + courtW / 2).toFixed(2)), y: courtY, width: 3.5, wall: 'north', label: 'Verandah Colonnade' },
      { x: courtX, y: Number((courtY + courtL / 2).toFixed(2)), width: 3.5, wall: 'west', label: 'Living Room Cloister' },
      { x: Number((courtX + courtW).toFixed(2)), y: Number((courtY + courtL / 2).toFixed(2)), width: 3.5, wall: 'east', label: 'Dining Cloister' }
    ],
    windows: []
  }));

  // Left Wing: Formal Living Lounge (spans from env.x to courtX)
  const leftW = Number((courtX - env.x).toFixed(2));
  rooms.push(createPlacedRoomRecord({
    id: 'g_living',
    name: 'Formal Living Lounge & Majlis',
    type: ROOM_TYPES.LIVING,
    zone: ZONES.PUBLIC,
    bounds: { x: env.x, y: yMid, width: leftW, length: midL },
    finish: 'White Makrana Marble + Brass Inlays',
    orientation: 'West',
    doors: [
      { x: courtX, y: Number((yMid + midL / 2).toFixed(2)), width: 4.0, wall: 'east', label: 'Courtyard Arch' }
    ],
    windows: [
      { x: env.x, y: Number((yMid + midL / 2).toFixed(2)), width: 6.0, wall: 'west', label: 'Bay Window' }
    ]
  }));

  // Right Wing: Dining & Pooja + Stairwell (spans from courtX + courtW to env.x + W)
  const rightX = Number((courtX + courtW).toFixed(2));
  const rightW = Number(((env.x + W) - rightX).toFixed(2));
  const stairW = stairwellBounds ? stairwellBounds.width : Number(Math.min(7.5, rightW * 0.45).toFixed(2));
  const diningW = Number((rightW - stairW).toFixed(2));
  const stairX = Number(((env.x + W) - stairW).toFixed(2));

  // Aligned Staircase on the far right flank
  const effectiveStairBounds = stairwellBounds || {
    x: stairX,
    y: yMid,
    width: stairW,
    length: midL
  };

  rooms.push(createPlacedRoomRecord({
    id: 'g_stairwell_core',
    name: 'RCC Dog-Legged Stairwell',
    type: ROOM_TYPES.STAIRWELL,
    zone: ZONES.PUBLIC,
    bounds: { ...effectiveStairBounds },
    finish: 'Flamed Granite Steps + Brass Balustrade',
    orientation: 'South-East',
    doors: [{ x: Number((effectiveStairBounds.x + effectiveStairBounds.width / 2).toFixed(2)), y: effectiveStairBounds.y, width: 3.0, wall: 'north' }],
    windows: [{ x: Number((effectiveStairBounds.x + effectiveStairBounds.width).toFixed(2)), y: Number((effectiveStairBounds.y + effectiveStairBounds.length / 2).toFixed(2)), width: 3.0, wall: 'east' }]
  }));

  // Dining and Pooja between Courtyard and Staircase
  if (!isPoojaDisabled) {
    const poojaL = Number(Math.max(3.5, Math.min(5.5, midL * 0.30)).toFixed(2));
    const diningL = Number((midL - poojaL).toFixed(2));

    rooms.push(createPlacedRoomRecord({
      id: 'g_pooja',
      name: 'Ishanya Pooja Sanctum',
      type: ROOM_TYPES.POOJA,
      zone: ZONES.SEMI_PRIVATE,
      bounds: { x: rightX, y: yMid, width: diningW, length: poojaL },
      finish: 'White Makrana Carved Marble',
      orientation: 'North-East',
      doors: [{ x: Number((rightX + diningW / 2).toFixed(2)), y: Number((yMid + poojaL).toFixed(2)), width: 2.5, wall: 'south', label: 'Brass Jali Door' }],
      windows: []
    }));

    rooms.push(createPlacedRoomRecord({
      id: 'g_dining',
      name: 'Central Dining Area',
      type: ROOM_TYPES.DINING,
      zone: ZONES.SEMI_PRIVATE,
      bounds: { x: rightX, y: Number((yMid + poojaL).toFixed(2)), width: diningW, length: diningL },
      finish: 'Polished Teak Parquet Vitrified',
      orientation: 'East',
      doors: [
        { x: rightX, y: Number((yMid + poojaL + diningL / 2).toFixed(2)), width: 3.5, wall: 'west', label: 'Courtyard Access' },
        { x: Number((rightX + diningW / 2).toFixed(2)), y: yRear, width: 3.0, wall: 'south', label: 'Kitchen Door' }
      ],
      windows: []
    }));
  } else {
    rooms.push(createPlacedRoomRecord({
      id: 'g_dining',
      name: 'Central Dining Area',
      type: ROOM_TYPES.DINING,
      zone: ZONES.SEMI_PRIVATE,
      bounds: { x: rightX, y: yMid, width: diningW, length: midL },
      finish: 'Polished Teak Parquet Vitrified',
      orientation: 'East',
      doors: [
        { x: rightX, y: Number((yMid + midL / 2).toFixed(2)), width: 3.5, wall: 'west', label: 'Courtyard Access' },
        { x: Number((rightX + diningW / 2).toFixed(2)), y: yRear, width: 3.0, wall: 'south', label: 'Kitchen Door' }
      ],
      windows: []
    }));
  }

  // 3. Rear Band: Kitchen (SE) + Ground Master Suite (SW) + 2 Bathrooms
  const needsTwoGroundBaths = (specs.bathroomsCount >= 4) || (floorProg.rooms?.filter(r => r.type === ROOM_TYPES.BATHROOM).length >= 2);

  if (needsTwoGroundBaths) {
    const bathCommonW = Number(Math.max(4.0, Math.min(5.5, W * 0.15)).toFixed(2));
    const bathSuiteW = Number(Math.max(4.0, Math.min(5.5, W * 0.15)).toFixed(2));
    const kitchW = Number(Math.max(7.5, Math.min(11.0, W * 0.32)).toFixed(2));
    const bedW = Number((W - bathCommonW - bathSuiteW - kitchW).toFixed(2));

    const bedX = env.x;
    const bathSuiteX = Number((bedX + bedW).toFixed(2));
    const bathCommonX = Number((bathSuiteX + bathSuiteW).toFixed(2));
    const kitchX = Number((bathCommonX + bathCommonW).toFixed(2));

    rooms.push(createPlacedRoomRecord({
      id: 'g_bed_master',
      name: 'Ground Master Bedroom Suite',
      type: ROOM_TYPES.MASTER_BEDROOM,
      zone: ZONES.PRIVATE,
      bounds: { x: bedX, y: yRear, width: bedW, length: rearL },
      finish: 'Matte Oak Hardwood Vitrified',
      orientation: 'South-West',
      doors: [
        { x: Number((bedX + bedW / 2).toFixed(2)), y: yRear, width: 3.0, wall: 'north' },
        { x: Number((bedX + bedW).toFixed(2)), y: Number((yRear + rearL / 2).toFixed(2)), width: 2.5, wall: 'east', label: 'En-suite Door' }
      ],
      windows: [
        { x: bedX, y: Number((yRear + rearL / 2).toFixed(2)), width: 5.0, wall: 'west' },
        { x: Number((bedX + bedW / 2).toFixed(2)), y: Number((yRear + rearL).toFixed(2)), width: 4.5, wall: 'south' }
      ]
    }));

    rooms.push(createPlacedRoomRecord({
      id: 'g_bath_suite',
      name: 'Master En-suite Bathroom',
      type: ROOM_TYPES.BATHROOM,
      zone: ZONES.SERVICE,
      bounds: { x: bathSuiteX, y: yRear, width: bathSuiteW, length: rearL },
      finish: 'Anti-skid Flamed Granite',
      orientation: 'South',
      doors: [{ x: bathSuiteX, y: Number((yRear + rearL / 2).toFixed(2)), width: 2.5, wall: 'west' }],
      windows: [{ x: Number((bathSuiteX + bathSuiteW / 2).toFixed(2)), y: Number((yRear + rearL).toFixed(2)), width: 2.0, wall: 'south', label: 'Louvered Vent' }]
    }));

    rooms.push(createPlacedRoomRecord({
      id: 'g_bath_common',
      name: 'Sanitary Bath & Powder',
      type: ROOM_TYPES.BATHROOM,
      zone: ZONES.SERVICE,
      bounds: { x: bathCommonX, y: yRear, width: bathCommonW, length: rearL },
      finish: 'Anti-skid Ceramic Vitrified',
      orientation: 'South',
      doors: [{ x: Number((bathCommonX + bathCommonW / 2).toFixed(2)), y: yRear, width: 2.5, wall: 'north' }],
      windows: [{ x: Number((bathCommonX + bathCommonW / 2).toFixed(2)), y: Number((yRear + rearL).toFixed(2)), width: 2.0, wall: 'south', label: 'Louvered Vent' }]
    }));

    rooms.push(createPlacedRoomRecord({
      id: 'g_kitchen',
      name: 'Traditional Modular Kitchen & Utility',
      type: ROOM_TYPES.KITCHEN,
      zone: ZONES.SERVICE,
      bounds: { x: kitchX, y: yRear, width: kitchW, length: rearL },
      finish: 'Jet-Black Granite Counter + Brass Fittings',
      orientation: 'South-East',
      doors: [{ x: Number((kitchX + kitchW / 2).toFixed(2)), y: yRear, width: 3.0, wall: 'north' }],
      windows: [
        { x: Number((kitchX + kitchW).toFixed(2)), y: Number((yRear + rearL / 2).toFixed(2)), width: 4.0, wall: 'east' },
        { x: Number((kitchX + kitchW / 2).toFixed(2)), y: Number((yRear + rearL).toFixed(2)), width: 3.5, wall: 'south' }
      ]
    }));
  } else {
    const bathW = Number(Math.max(4.5, Math.min(6.5, W * 0.18)).toFixed(2));
    const kitchW = Number(Math.max(8.0, Math.min(12.0, W * 0.38)).toFixed(2));
    const bedW = Number((W - bathW - kitchW).toFixed(2));

    const bedX = env.x;
    const bathX = Number((bedX + bedW).toFixed(2));
    const kitchX = Number((bathX + bathW).toFixed(2));

    rooms.push(createPlacedRoomRecord({
      id: 'g_bed_master',
      name: 'Ground Master Bedroom Suite',
      type: ROOM_TYPES.MASTER_BEDROOM,
      zone: ZONES.PRIVATE,
      bounds: { x: bedX, y: yRear, width: bedW, length: rearL },
      finish: 'Matte Oak Hardwood Vitrified',
      orientation: 'South-West',
      doors: [{ x: Number((bedX + bedW / 2).toFixed(2)), y: yRear, width: 3.0, wall: 'north' }],
      windows: [
        { x: bedX, y: Number((yRear + rearL / 2).toFixed(2)), width: 5.0, wall: 'west' },
        { x: Number((bedX + bedW / 2).toFixed(2)), y: Number((yRear + rearL).toFixed(2)), width: 4.5, wall: 'south' }
      ]
    }));

    rooms.push(createPlacedRoomRecord({
      id: 'g_bath_common',
      name: 'Sanitary Bath & Toilet',
      type: ROOM_TYPES.BATHROOM,
      zone: ZONES.SERVICE,
      bounds: { x: bathX, y: yRear, width: bathW, length: rearL },
      finish: 'Anti-skid Ceramic Vitrified',
      orientation: 'South',
      doors: [{ x: Number((bathX + bathW / 2).toFixed(2)), y: yRear, width: 2.5, wall: 'north' }],
      windows: [{ x: Number((bathX + bathW / 2).toFixed(2)), y: Number((yRear + rearL).toFixed(2)), width: 2.0, wall: 'south', label: 'Louvered Vent' }]
    }));

    rooms.push(createPlacedRoomRecord({
      id: 'g_kitchen',
      name: 'Traditional Modular Kitchen',
      type: ROOM_TYPES.KITCHEN,
      zone: ZONES.SERVICE,
      bounds: { x: kitchX, y: yRear, width: kitchW, length: rearL },
      finish: 'Jet-Black Granite Counter + Brass Fittings',
      orientation: 'South-East',
      doors: [{ x: Number((kitchX + kitchW / 2).toFixed(2)), y: yRear, width: 3.0, wall: 'north' }],
      windows: [{ x: Number((kitchX + kitchW).toFixed(2)), y: Number((yRear + rearL / 2).toFixed(2)), width: 4.0, wall: 'east' }]
    }));
  }

  return {
    rooms,
    footprints: [{ ...env }]
  };
}

export function solveCourtyardUpperLayout({ env, specs, floorProg, stairwellBounds, options = {}, rng }) {
  const rooms = [];
  const W = env.width;
  const L = env.length;

  const defaultFrontL = Number(Math.max(7.5, Math.min(10.5, L * 0.22)).toFixed(2));
  const defaultMidL = Number(Math.max(14.0, Math.min(22.0, L * 0.48)).toFixed(2));
  const stairW = stairwellBounds ? stairwellBounds.width : Number(Math.min(7.5, W * 0.22).toFixed(2));

  const effectiveStairBounds = stairwellBounds || {
    x: Number(((env.x + W) - stairW).toFixed(2)),
    y: Number((env.y + defaultFrontL).toFixed(2)),
    width: stairW,
    length: defaultMidL
  };

  const yMid = Number(effectiveStairBounds.y.toFixed(2));
  const frontL = Number((yMid - env.y).toFixed(2));
  const midL = Number(effectiveStairBounds.length.toFixed(2));
  const yRear = Number((yMid + midL).toFixed(2));
  const rearL = Number(((env.y + L) - yRear).toFixed(2));

  // Front Cantilever Balcony
  rooms.push(createPlacedRoomRecord({
    id: 'f_balcony',
    name: 'Upper Heritage Balcony & Charupadi',
    type: ROOM_TYPES.BALCONY,
    zone: ZONES.OUTDOOR,
    bounds: { x: env.x, y: env.y, width: W, length: frontL },
    finish: 'Weatherproof Teak Charupadi Bench Seating',
    orientation: specs.facingDirection || 'East',
    doors: [{ x: Number((env.x + W / 2).toFixed(2)), y: yMid, width: 4.5, wall: 'south', label: 'Glass Sliding Door' }],
    windows: []
  }));

  // Mid Band: Stairwell on right flank + Family Mezzanine Lounge on remainder
  rooms.push(createPlacedRoomRecord({
    id: 'f_stairwell_core',
    name: 'RCC Dog-Legged Stairwell (Upper)',
    type: ROOM_TYPES.STAIRWELL,
    zone: ZONES.PUBLIC,
    bounds: { ...effectiveStairBounds },
    finish: 'Flamed Granite Steps + Brass Balustrade',
    orientation: 'South-East',
    doors: [{ x: Number((effectiveStairBounds.x + effectiveStairBounds.width / 2).toFixed(2)), y: effectiveStairBounds.y, width: 3.0, wall: 'north' }],
    windows: [{ x: Number((effectiveStairBounds.x + effectiveStairBounds.width).toFixed(2)), y: Number((effectiveStairBounds.y + effectiveStairBounds.length / 2).toFixed(2)), width: 3.0, wall: 'east' }]
  }));

  const loungeW = Number((W - effectiveStairBounds.width).toFixed(2));
  rooms.push(createPlacedRoomRecord({
    id: 'f_family_lounge',
    name: 'Mezzanine Family Lounge (Overlooking Courtyard)',
    type: ROOM_TYPES.LIVING,
    zone: ZONES.SEMI_PRIVATE,
    bounds: { x: env.x, y: yMid, width: loungeW, length: midL },
    finish: 'Italian Polished Vitrified 800×1600mm',
    orientation: 'Central',
    doors: [
      { x: Number((env.x + loungeW / 2).toFixed(2)), y: yMid, width: 4.0, wall: 'north', label: 'Balcony Portal' },
      { x: Number((env.x + loungeW / 2).toFixed(2)), y: yRear, width: 3.0, wall: 'south', label: 'Bedrooms Lobby' }
    ],
    windows: [{ x: env.x, y: Number((yMid + midL / 2).toFixed(2)), width: 6.0, wall: 'west' }]
  }));

  // Rear Band: Upper Bedroom 2 + Upper Bedroom 3 + 2 Attached Bathrooms
  const halfW = Number((W / 2).toFixed(2));
  const bathW = Number(Math.max(4.5, Math.min(6.0, halfW * 0.35)).toFixed(2));
  const bed1W = Number((halfW - bathW).toFixed(2));
  const bed2W = bed1W;

  const bed1X = env.x;
  const bath1X = Number((bed1X + bed1W).toFixed(2));
  const bath2X = Number((bath1X + bathW).toFixed(2));
  const bed2X = Number((bath2X + bathW).toFixed(2));

  rooms.push(createPlacedRoomRecord({
    id: 'f_bed_2',
    name: 'Children Suite Bedroom 2',
    type: ROOM_TYPES.BEDROOM,
    zone: ZONES.PRIVATE,
    bounds: { x: bed1X, y: yRear, width: bed1W, length: rearL },
    finish: 'Matte Oak Hardwood Vitrified',
    orientation: 'South-West',
    doors: [
      { x: Number((bed1X + bed1W / 2).toFixed(2)), y: yRear, width: 3.0, wall: 'north' },
      { x: Number((bed1X + bed1W).toFixed(2)), y: Number((yRear + rearL / 2).toFixed(2)), width: 2.5, wall: 'east', label: 'En-suite Door' }
    ],
    windows: [
      { x: bed1X, y: Number((yRear + rearL / 2).toFixed(2)), width: 5.0, wall: 'west' },
      { x: Number((bed1X + bed1W / 2).toFixed(2)), y: Number((yRear + rearL).toFixed(2)), width: 4.5, wall: 'south' }
    ]
  }));

  rooms.push(createPlacedRoomRecord({
    id: 'f_bath_3',
    name: 'Bedroom 2 En-suite Bath',
    type: ROOM_TYPES.BATHROOM,
    zone: ZONES.SERVICE,
    bounds: { x: bath1X, y: yRear, width: bathW, length: rearL },
    finish: 'Anti-skid Ceramic Vitrified',
    orientation: 'South',
    doors: [{ x: bath1X, y: Number((yRear + rearL / 2).toFixed(2)), width: 2.5, wall: 'west' }],
    windows: [{ x: Number((bath1X + bathW / 2).toFixed(2)), y: Number((yRear + rearL).toFixed(2)), width: 2.0, wall: 'south', label: 'Vent' }]
  }));

  rooms.push(createPlacedRoomRecord({
    id: 'f_bath_4',
    name: 'Guest Suite En-suite Bath',
    type: ROOM_TYPES.BATHROOM,
    zone: ZONES.SERVICE,
    bounds: { x: bath2X, y: yRear, width: bathW, length: rearL },
    finish: 'Anti-skid Ceramic Vitrified',
    orientation: 'South',
    doors: [{ x: Number((bath2X + bathW).toFixed(2)), y: Number((yRear + rearL / 2).toFixed(2)), width: 2.5, wall: 'east' }],
    windows: [{ x: Number((bath2X + bathW / 2).toFixed(2)), y: Number((yRear + rearL).toFixed(2)), width: 2.0, wall: 'south', label: 'Vent' }]
  }));

  rooms.push(createPlacedRoomRecord({
    id: 'f_bed_3',
    name: 'Upper Guest Bedroom 3',
    type: ROOM_TYPES.BEDROOM,
    zone: ZONES.PRIVATE,
    bounds: { x: bed2X, y: yRear, width: bed2W, length: rearL },
    finish: 'Matte Oak Hardwood Vitrified',
    orientation: 'South-East',
    doors: [
      { x: Number((bed2X + bed2W / 2).toFixed(2)), y: yRear, width: 3.0, wall: 'north' },
      { x: bed2X, y: Number((yRear + rearL / 2).toFixed(2)), width: 2.5, wall: 'west', label: 'En-suite Door' }
    ],
    windows: [
      { x: Number((bed2X + bed2W).toFixed(2)), y: Number((yRear + rearL / 2).toFixed(2)), width: 5.0, wall: 'east' },
      { x: Number((bed2X + bed2W / 2).toFixed(2)), y: Number((yRear + rearL).toFixed(2)), width: 4.5, wall: 'south' }
    ]
  }));

  return {
    rooms,
    footprints: [{ ...env }]
  };
}

// =============================================================================
// 2. L-SHAPED COURT RESIDENCE (Dual-Wing with Corner Outdoor Garden Court)
// =============================================================================

export function solveLShapeGroundLayout({ env, specs, floorProg, stairwellBounds, options = {}, rng }) {
  const rooms = [];
  const W = env.width;
  const L = env.length;

  const hasParking = specs.amenities?.hasParking !== false && specs.hasParking !== false;
  const isPoojaDisabled = specs.amenities?.hasPooja === false || specs.hasPooja === false;

  // L-Shape Geometry:
  // Front Cutout Corner: Width 44% on the Right, Depth 40% on the Front.
  // This corner is RESERVED FOR OUTDOOR GARDEN COURT!
  const courtW = Number((W * 0.44).toFixed(2));
  const courtL = Number((L * 0.40).toFixed(2));
  const frontWingW = Number((W - courtW).toFixed(2));
  const rearWingL = Number((L - courtL).toFixed(2));

  const yFront = env.y;
  const yRear = Number((env.y + courtL).toFixed(2));

  // 1. FRONT WING (Left: width frontWingW, depth courtL)
  if (hasParking) {
    const porticoL = Number(Math.max(7.5, Math.min(10.0, courtL * 0.48)).toFixed(2));
    const foyerL = Number((courtL - porticoL).toFixed(2));

    rooms.push(createPlacedRoomRecord({
      id: 'g_portico',
      name: 'Covered Car Porch & Portico',
      type: ROOM_TYPES.PORTICO,
      zone: ZONES.OUTDOOR,
      bounds: { x: env.x, y: yFront, width: frontWingW, length: porticoL },
      finish: 'Weatherproof Cobblestone Pavers',
      orientation: specs.facingDirection || 'East',
      doors: [],
      windows: []
    }));

    rooms.push(createPlacedRoomRecord({
      id: 'g_foyer',
      name: 'Grand Entrance Foyer & Verandah',
      type: ROOM_TYPES.FOYER,
      zone: ZONES.PUBLIC,
      bounds: { x: env.x, y: Number((yFront + porticoL).toFixed(2)), width: frontWingW, length: foyerL },
      finish: 'Italian Statuario Marble',
      orientation: specs.facingDirection || 'East',
      doors: [
        { x: Number((env.x + frontWingW / 2).toFixed(2)), y: Number((yFront + porticoL).toFixed(2)), width: 3.5, wall: 'north', label: 'Main Door' },
        { x: Number((env.x + frontWingW / 2).toFixed(2)), y: yRear, width: 4.5, wall: 'south', label: 'Arch to Living Lounge' }
      ],
      windows: [{ x: env.x, y: Number((yFront + porticoL + foyerL / 2).toFixed(2)), width: 4.5, wall: 'west' }]
    }));
  } else {
    rooms.push(createPlacedRoomRecord({
      id: 'g_foyer',
      name: 'Grand Entrance Foyer & Verandah',
      type: ROOM_TYPES.FOYER,
      zone: ZONES.PUBLIC,
      bounds: { x: env.x, y: yFront, width: frontWingW, length: courtL },
      finish: 'Italian Statuario Marble',
      orientation: specs.facingDirection || 'East',
      doors: [
        { x: Number((env.x + frontWingW / 2).toFixed(2)), y: yFront, width: 4.0, wall: 'north', label: 'Main Door' },
        { x: Number((env.x + frontWingW / 2).toFixed(2)), y: yRear, width: 4.5, wall: 'south', label: 'Arch to Living' }
      ],
      windows: [{ x: env.x, y: Number((yFront + courtL / 2).toFixed(2)), width: 5.0, wall: 'west' }]
    }));
  }

  // 2. REAR MAIN WING (Spans full width W from yRear to env.y + L)
  const row1L = Number((rearWingL * 0.52).toFixed(2));
  const row2L = Number((rearWingL - row1L).toFixed(2));
  const yRow2 = Number((yRear + row1L).toFixed(2));

  // Row 1: Aligned Staircase + Dining/Pooja + Living facing the Garden Court
  const stairW = stairwellBounds ? stairwellBounds.width : Number(Math.min(7.5, W * 0.20).toFixed(2));
  const stairL = stairwellBounds ? stairwellBounds.length : row1L;
  const livingW = Number((courtW * 0.85).toFixed(2));
  const diningW = Number((W - stairW - livingW).toFixed(2));

  const stairX = env.x;
  const diningX = Number((stairX + stairW).toFixed(2));
  const livingX = Number((diningX + diningW).toFixed(2));

  const effectiveStairBounds = stairwellBounds || {
    x: stairX,
    y: yRear,
    width: stairW,
    length: row1L
  };

  rooms.push(createPlacedRoomRecord({
    id: 'g_stairwell_core',
    name: 'RCC Dog-Legged Stairwell',
    type: ROOM_TYPES.STAIRWELL,
    zone: ZONES.PUBLIC,
    bounds: { ...effectiveStairBounds },
    finish: 'Flamed Granite Steps + Glass Railing',
    orientation: 'West',
    doors: [{ x: Number((effectiveStairBounds.x + effectiveStairBounds.width).toFixed(2)), y: Number((effectiveStairBounds.y + effectiveStairBounds.length / 2).toFixed(2)), width: 3.0, wall: 'east' }],
    windows: [{ x: effectiveStairBounds.x, y: Number((effectiveStairBounds.y + effectiveStairBounds.length / 2).toFixed(2)), width: 3.0, wall: 'west' }]
  }));

  // Dining & Pooja in middle
  if (!isPoojaDisabled) {
    const poojaW = Number(Math.min(5.0, diningW * 0.40).toFixed(2));
    const mainDiningW = Number((diningW - poojaW).toFixed(2));

    rooms.push(createPlacedRoomRecord({
      id: 'g_dining',
      name: 'Central Dining Area',
      type: ROOM_TYPES.DINING,
      zone: ZONES.SEMI_PRIVATE,
      bounds: { x: diningX, y: yRear, width: mainDiningW, length: row1L },
      finish: 'Polished Vitrified 800×1600mm',
      orientation: 'Central',
      doors: [
        { x: Number((diningX + mainDiningW).toFixed(2)), y: Number((yRear + row1L / 2).toFixed(2)), width: 4.0, wall: 'east', label: 'Arch to Living' },
        { x: Number((diningX + mainDiningW / 2).toFixed(2)), y: yRow2, width: 3.0, wall: 'south', label: 'Kitchen Door' }
      ],
      windows: []
    }));

    rooms.push(createPlacedRoomRecord({
      id: 'g_pooja',
      name: 'Ishanya Pooja Sanctum',
      type: ROOM_TYPES.POOJA,
      zone: ZONES.SEMI_PRIVATE,
      bounds: { x: Number((diningX + mainDiningW).toFixed(2)), y: yRear, width: poojaW, length: row1L },
      finish: 'White Makrana Carved Marble',
      orientation: 'North-East',
      doors: [{ x: Number((diningX + mainDiningW).toFixed(2)), y: Number((yRear + row1L / 2).toFixed(2)), width: 2.5, wall: 'west', label: 'Jali Door' }],
      windows: []
    }));
  } else {
    rooms.push(createPlacedRoomRecord({
      id: 'g_dining',
      name: 'Central Dining Area',
      type: ROOM_TYPES.DINING,
      zone: ZONES.SEMI_PRIVATE,
      bounds: { x: diningX, y: yRear, width: diningW, length: row1L },
      finish: 'Polished Vitrified 800×1600mm',
      orientation: 'Central',
      doors: [
        { x: Number((diningX + diningW).toFixed(2)), y: Number((yRear + row1L / 2).toFixed(2)), width: 4.0, wall: 'east', label: 'Arch to Living' },
        { x: Number((diningX + diningW / 2).toFixed(2)), y: yRow2, width: 3.0, wall: 'south', label: 'Kitchen Door' }
      ],
      windows: []
    }));
  }

  // Living Room directly opening into the private garden court!
  rooms.push(createPlacedRoomRecord({
    id: 'g_living',
    name: 'Garden-Facing Living Lounge',
    type: ROOM_TYPES.LIVING,
    zone: ZONES.PUBLIC,
    bounds: { x: livingX, y: yRear, width: livingW, length: row1L },
    finish: 'Italian Statuario Marble',
    orientation: 'North-East',
    doors: [
      { x: Number((livingX + livingW / 2).toFixed(2)), y: yRear, width: 6.0, wall: 'north', label: 'Garden French Doors' },
      { x: livingX, y: Number((yRear + row1L / 2).toFixed(2)), width: 4.0, wall: 'west', label: 'Arch from Dining' }
    ],
    windows: [
      { x: Number((livingX + livingW).toFixed(2)), y: Number((yRear + row1L / 2).toFixed(2)), width: 6.0, wall: 'east', label: 'Corner Window' }
    ]
  }));

  // Row 2: Gourmet Kitchen (SE) + Ground Master Bedroom Suite (SW) + 2 Bathrooms
  const needsTwoGroundBaths = (specs.bathroomsCount >= 4) || (floorProg.rooms?.filter(r => r.type === ROOM_TYPES.BATHROOM).length >= 2);

  if (needsTwoGroundBaths) {
    const bathCommonW = Number(Math.max(4.0, Math.min(5.5, W * 0.15)).toFixed(2));
    const bathSuiteW = Number(Math.max(4.0, Math.min(5.5, W * 0.15)).toFixed(2));
    const kitchW = Number(Math.max(8.0, Math.min(12.0, W * 0.34)).toFixed(2));
    const bedW = Number((W - bathCommonW - bathSuiteW - kitchW).toFixed(2));

    const bedX = env.x;
    const bathSuiteX = Number((bedX + bedW).toFixed(2));
    const bathCommonX = Number((bathSuiteX + bathSuiteW).toFixed(2));
    const kitchX = Number((bathCommonX + bathCommonW).toFixed(2));

    rooms.push(createPlacedRoomRecord({
      id: 'g_bed_master',
      name: 'Ground Master Bedroom Suite',
      type: ROOM_TYPES.MASTER_BEDROOM,
      zone: ZONES.PRIVATE,
      bounds: { x: bedX, y: yRow2, width: bedW, length: row2L },
      finish: 'Matte Oak Hardwood Vitrified',
      orientation: 'South-West',
      doors: [
        { x: Number((bedX + bedW / 2).toFixed(2)), y: yRow2, width: 3.0, wall: 'north' },
        { x: Number((bedX + bedW).toFixed(2)), y: Number((yRow2 + row2L / 2).toFixed(2)), width: 2.5, wall: 'east', label: 'En-suite Door' }
      ],
      windows: [
        { x: bedX, y: Number((yRow2 + row2L / 2).toFixed(2)), width: 5.0, wall: 'west' },
        { x: Number((bedX + bedW / 2).toFixed(2)), y: Number((yRow2 + row2L).toFixed(2)), width: 4.5, wall: 'south' }
      ]
    }));

    rooms.push(createPlacedRoomRecord({
      id: 'g_bath_suite',
      name: 'Master En-suite Bathroom',
      type: ROOM_TYPES.BATHROOM,
      zone: ZONES.SERVICE,
      bounds: { x: bathSuiteX, y: yRow2, width: bathSuiteW, length: row2L },
      finish: 'Anti-skid Flamed Granite',
      orientation: 'South',
      doors: [{ x: bathSuiteX, y: Number((yRow2 + row2L / 2).toFixed(2)), width: 2.5, wall: 'west' }],
      windows: [{ x: Number((bathSuiteX + bathSuiteW / 2).toFixed(2)), y: Number((yRow2 + row2L).toFixed(2)), width: 2.0, wall: 'south', label: 'Louvered Vent' }]
    }));

    rooms.push(createPlacedRoomRecord({
      id: 'g_bath_common',
      name: 'Sanitary Bath & Powder',
      type: ROOM_TYPES.BATHROOM,
      zone: ZONES.SERVICE,
      bounds: { x: bathCommonX, y: yRow2, width: bathCommonW, length: row2L },
      finish: 'Anti-skid Ceramic Vitrified',
      orientation: 'South',
      doors: [{ x: Number((bathCommonX + bathCommonW / 2).toFixed(2)), y: yRow2, width: 2.5, wall: 'north' }],
      windows: [{ x: Number((bathCommonX + bathCommonW / 2).toFixed(2)), y: Number((yRow2 + row2L).toFixed(2)), width: 2.0, wall: 'south', label: 'Vent' }]
    }));

    rooms.push(createPlacedRoomRecord({
      id: 'g_kitchen',
      name: 'Modular Gourmet Kitchen',
      type: ROOM_TYPES.KITCHEN,
      zone: ZONES.SERVICE,
      bounds: { x: kitchX, y: yRow2, width: kitchW, length: row2L },
      finish: 'Quartz Countertop + Matte Tiles',
      orientation: 'South-East',
      doors: [{ x: Number((kitchX + kitchW / 2).toFixed(2)), y: yRow2, width: 3.0, wall: 'north' }],
      windows: [
        { x: Number((kitchX + kitchW).toFixed(2)), y: Number((yRow2 + row2L / 2).toFixed(2)), width: 4.0, wall: 'east' },
        { x: Number((kitchX + kitchW / 2).toFixed(2)), y: Number((yRow2 + row2L).toFixed(2)), width: 3.5, wall: 'south' }
      ]
    }));
  } else {
    const bathW = Number(Math.max(4.5, Math.min(6.5, W * 0.18)).toFixed(2));
    const kitchW = Number(Math.max(8.0, Math.min(12.0, W * 0.38)).toFixed(2));
    const bedW = Number((W - bathW - kitchW).toFixed(2));

    const bedX = env.x;
    const bathX = Number((bedX + bedW).toFixed(2));
    const kitchX = Number((bathX + bathW).toFixed(2));

    rooms.push(createPlacedRoomRecord({
      id: 'g_bed_master',
      name: 'Ground Master Bedroom Suite',
      type: ROOM_TYPES.MASTER_BEDROOM,
      zone: ZONES.PRIVATE,
      bounds: { x: bedX, y: yRow2, width: bedW, length: row2L },
      finish: 'Matte Oak Hardwood Vitrified',
      orientation: 'South-West',
      doors: [{ x: Number((bedX + bedW / 2).toFixed(2)), y: yRow2, width: 3.0, wall: 'north' }],
      windows: [
        { x: bedX, y: Number((yRow2 + row2L / 2).toFixed(2)), width: 5.0, wall: 'west' },
        { x: Number((bedX + bedW / 2).toFixed(2)), y: Number((yRow2 + row2L).toFixed(2)), width: 4.5, wall: 'south' }
      ]
    }));

    rooms.push(createPlacedRoomRecord({
      id: 'g_bath_common',
      name: 'Sanitary Bath & Toilet',
      type: ROOM_TYPES.BATHROOM,
      zone: ZONES.SERVICE,
      bounds: { x: bathX, y: yRow2, width: bathW, length: row2L },
      finish: 'Anti-skid Ceramic Vitrified',
      orientation: 'South',
      doors: [{ x: Number((bathX + bathW / 2).toFixed(2)), y: yRow2, width: 2.5, wall: 'north' }],
      windows: [{ x: Number((bathX + bathW / 2).toFixed(2)), y: Number((yRow2 + row2L).toFixed(2)), width: 2.0, wall: 'south', label: 'Vent' }]
    }));

    rooms.push(createPlacedRoomRecord({
      id: 'g_kitchen',
      name: 'Modular Gourmet Kitchen',
      type: ROOM_TYPES.KITCHEN,
      zone: ZONES.SERVICE,
      bounds: { x: kitchX, y: yRow2, width: kitchW, length: row2L },
      finish: 'Quartz Countertop + Matte Tiles',
      orientation: 'South-East',
      doors: [{ x: Number((kitchX + kitchW / 2).toFixed(2)), y: yRow2, width: 3.0, wall: 'north' }],
      windows: [{ x: Number((kitchX + kitchW).toFixed(2)), y: Number((yRow2 + row2L / 2).toFixed(2)), width: 4.0, wall: 'east' }]
    }));
  }

  // 3D Footprints for the L-Shape
  const footprints = [
    { x: env.x, y: yFront, width: frontWingW, length: courtL },
    { x: env.x, y: yRear, width: W, length: rearWingL }
  ];

  return { rooms, footprints };
}

export function solveLShapeUpperLayout({ env, specs, floorProg, stairwellBounds, options = {}, rng }) {
  const rooms = [];
  const W = env.width;
  const L = env.length;

  const courtW = Number((W * 0.44).toFixed(2));
  const courtL = Number((L * 0.40).toFixed(2));
  const frontWingW = Number((W - courtW).toFixed(2));
  const rearWingL = Number((L - courtL).toFixed(2));

  const yFront = env.y;
  const yRear = Number((env.y + courtL).toFixed(2));

  // Front Wing: Sun Terrace Deck over the ground portico/foyer overlooking garden court!
  rooms.push(createPlacedRoomRecord({
    id: 'f_terrace_sun',
    name: 'Master Sun Terrace & Pergola Deck',
    type: ROOM_TYPES.BALCONY,
    zone: ZONES.OUTDOOR,
    bounds: { x: env.x, y: yFront, width: frontWingW, length: courtL },
    finish: 'Weatherproof Teak WPC Wood Decking + Glass Balustrade',
    orientation: specs.facingDirection || 'East',
    doors: [{ x: Number((env.x + frontWingW / 2).toFixed(2)), y: yRear, width: 5.0, wall: 'south', label: 'Sliding Glass Portal' }],
    windows: []
  }));

  // Rear Wing: Aligned Staircase + Upper Bedrooms + Baths + Family Lounge
  const stairW = stairwellBounds ? stairwellBounds.width : Number(Math.min(7.5, W * 0.20).toFixed(2));
  const defaultRow1L = Number((rearWingL * 0.52).toFixed(2));
  const effectiveStairBounds = stairwellBounds || {
    x: env.x,
    y: yRear,
    width: stairW,
    length: defaultRow1L
  };

  const actualRow1L = Number(effectiveStairBounds.length.toFixed(2));
  const actualYRow2 = Number((yRear + actualRow1L).toFixed(2));
  const actualRow2L = Number(((env.y + L) - actualYRow2).toFixed(2));

  rooms.push(createPlacedRoomRecord({
    id: 'f_stairwell_core',
    name: 'RCC Dog-Legged Stairwell (Upper)',
    type: ROOM_TYPES.STAIRWELL,
    zone: ZONES.PUBLIC,
    bounds: { ...effectiveStairBounds },
    finish: 'Flamed Granite Steps + SS Rail',
    orientation: 'West',
    doors: [{ x: Number((effectiveStairBounds.x + effectiveStairBounds.width).toFixed(2)), y: Number((effectiveStairBounds.y + effectiveStairBounds.length / 2).toFixed(2)), width: 3.0, wall: 'east' }],
    windows: [{ x: effectiveStairBounds.x, y: Number((effectiveStairBounds.y + effectiveStairBounds.length / 2).toFixed(2)), width: 3.0, wall: 'west' }]
  }));

  // Row 1: Family Media Lounge directly stepping out to the Sun Terrace
  const loungeW = Number((W - effectiveStairBounds.width).toFixed(2));
  const loungeX = Number((env.x + effectiveStairBounds.width).toFixed(2));

  rooms.push(createPlacedRoomRecord({
    id: 'f_family_lounge',
    name: 'Upper Family Media Lounge & Study',
    type: ROOM_TYPES.LIVING,
    zone: ZONES.SEMI_PRIVATE,
    bounds: { x: loungeX, y: yRear, width: loungeW, length: actualRow1L },
    finish: 'Italian Vitrified 800×1600mm',
    orientation: 'North-East',
    doors: [
      { x: Number((loungeX + frontWingW / 2).toFixed(2)), y: yRear, width: 5.0, wall: 'north', label: 'Sun Terrace Portal' },
      { x: Number((loungeX + loungeW / 2).toFixed(2)), y: actualYRow2, width: 3.0, wall: 'south', label: 'Bedrooms Lobby' }
    ],
    windows: [{ x: Number((loungeX + loungeW).toFixed(2)), y: Number((yRear + actualRow1L / 2).toFixed(2)), width: 6.0, wall: 'east' }]
  }));

  // Row 2: Upper Bedroom 2 + Upper Bedroom 3 + 2 En-suite Bathrooms
  const halfW = Number((W / 2).toFixed(2));
  const bathW = Number(Math.max(4.5, Math.min(6.0, halfW * 0.35)).toFixed(2));
  const bed1W = Number((halfW - bathW).toFixed(2));
  const bed2W = bed1W;

  const bed1X = env.x;
  const bath1X = Number((bed1X + bed1W).toFixed(2));
  const bath2X = Number((bath1X + bathW).toFixed(2));
  const bed2X = Number((bath2X + bathW).toFixed(2));

  rooms.push(createPlacedRoomRecord({
    id: 'f_bed_2',
    name: 'Secondary Bedroom Suite 2',
    type: ROOM_TYPES.BEDROOM,
    zone: ZONES.PRIVATE,
    bounds: { x: bed1X, y: actualYRow2, width: bed1W, length: actualRow2L },
    finish: 'Matte Oak Hardwood Vitrified',
    orientation: 'South-West',
    doors: [
      { x: Number((bed1X + bed1W / 2).toFixed(2)), y: actualYRow2, width: 3.0, wall: 'north' },
      { x: Number((bed1X + bed1W).toFixed(2)), y: Number((actualYRow2 + actualRow2L / 2).toFixed(2)), width: 2.5, wall: 'east', label: 'En-suite Door' }
    ],
    windows: [
      { x: bed1X, y: Number((actualYRow2 + actualRow2L / 2).toFixed(2)), width: 5.0, wall: 'west' },
      { x: Number((bed1X + bed1W / 2).toFixed(2)), y: Number((actualYRow2 + actualRow2L).toFixed(2)), width: 4.5, wall: 'south' }
    ]
  }));

  rooms.push(createPlacedRoomRecord({
    id: 'f_bath_3',
    name: 'Bedroom 2 En-suite Bath',
    type: ROOM_TYPES.BATHROOM,
    zone: ZONES.SERVICE,
    bounds: { x: bath1X, y: actualYRow2, width: bathW, length: actualRow2L },
    finish: 'Anti-skid Ceramic Vitrified',
    orientation: 'South',
    doors: [{ x: bath1X, y: Number((actualYRow2 + actualRow2L / 2).toFixed(2)), width: 2.5, wall: 'west' }],
    windows: [{ x: Number((bath1X + bathW / 2).toFixed(2)), y: Number((actualYRow2 + actualRow2L).toFixed(2)), width: 2.0, wall: 'south', label: 'Vent' }]
  }));

  rooms.push(createPlacedRoomRecord({
    id: 'f_bath_4',
    name: 'Guest Bedroom En-suite Bath',
    type: ROOM_TYPES.BATHROOM,
    zone: ZONES.SERVICE,
    bounds: { x: bath2X, y: actualYRow2, width: bathW, length: actualRow2L },
    finish: 'Anti-skid Ceramic Vitrified',
    orientation: 'South',
    doors: [{ x: Number((bath2X + bathW).toFixed(2)), y: Number((actualYRow2 + actualRow2L / 2).toFixed(2)), width: 2.5, wall: 'east' }],
    windows: [{ x: Number((bath2X + bathW / 2).toFixed(2)), y: Number((actualYRow2 + actualRow2L).toFixed(2)), width: 2.0, wall: 'south', label: 'Vent' }]
  }));

  rooms.push(createPlacedRoomRecord({
    id: 'f_bed_3',
    name: 'Upper Guest Bedroom 3',
    type: ROOM_TYPES.BEDROOM,
    zone: ZONES.PRIVATE,
    bounds: { x: bed2X, y: actualYRow2, width: bed2W, length: actualRow2L },
    finish: 'Matte Oak Hardwood Vitrified',
    orientation: 'South-East',
    doors: [
      { x: Number((bed2X + bed2W / 2).toFixed(2)), y: actualYRow2, width: 3.0, wall: 'north' },
      { x: bed2X, y: Number((actualYRow2 + actualRow2L / 2).toFixed(2)), width: 2.5, wall: 'west', label: 'En-suite Door' }
    ],
    windows: [
      { x: Number((bed2X + bed2W).toFixed(2)), y: Number((actualYRow2 + actualRow2L / 2).toFixed(2)), width: 5.0, wall: 'east' },
      { x: Number((bed2X + bed2W / 2).toFixed(2)), y: Number((actualYRow2 + actualRow2L).toFixed(2)), width: 4.5, wall: 'south' }
    ]
  }));

  const footprints = [
    { x: env.x, y: yFront, width: frontWingW, length: courtL },
    { x: env.x, y: yRear, width: W, length: rearWingL }
  ];

  return { rooms, footprints };
}

// =============================================================================
// 3. SPLIT-WING RESIDENCE (Staggered Offset Interconnected Masses)
// =============================================================================

export function solveSplitWingGroundLayout({ env, specs, floorProg, stairwellBounds, options = {}, rng }) {
  const rooms = [];
  const W = env.width;
  const L = env.length;

  const hasParking = specs.amenities?.hasParking !== false && specs.hasParking !== false;
  const isPoojaDisabled = specs.amenities?.hasPooja === false || specs.hasPooja === false;

  // Staggered Offset:
  // Wing 1 (Front Left): Starts at front y = env.y, projects forward. Depth 75% of L.
  // Wing 2 (Rear Right): Offset by 22% of L, extends to rear property line.
  const wing1W = Number((W * 0.52).toFixed(2));
  const wing2W = Number((W - wing1W).toFixed(2));
  const offset = Number(Math.max(6.0, Math.min(10.0, L * 0.22)).toFixed(2));

  const yWing1 = env.y;
  const lWing1 = Number((L - offset).toFixed(2));
  const yWing2 = Number((env.y + offset).toFixed(2));
  const lWing2 = Number((L - offset).toFixed(2));

  // --- WING 1 (Front Left): Portico + Foyer + Double-Height Formal Living
  const porticoL = Number(Math.max(7.5, Math.min(10.0, lWing1 * 0.26)).toFixed(2));
  const livingL = Number((lWing1 - porticoL).toFixed(2));
  const yLiving = Number((yWing1 + porticoL).toFixed(2));

  if (hasParking) {
    rooms.push(createPlacedRoomRecord({
      id: 'g_portico',
      name: 'Projecting Car Porch & Portico',
      type: ROOM_TYPES.PORTICO,
      zone: ZONES.OUTDOOR,
      bounds: { x: env.x, y: yWing1, width: wing1W, length: porticoL },
      finish: 'Anti-skid Granite Pavers',
      orientation: specs.facingDirection || 'East',
      doors: [],
      windows: []
    }));
  } else {
    rooms.push(createPlacedRoomRecord({
      id: 'g_foyer',
      name: 'Arrival Foyer & Verandah',
      type: ROOM_TYPES.FOYER,
      zone: ZONES.PUBLIC,
      bounds: { x: env.x, y: yWing1, width: wing1W, length: porticoL },
      finish: 'Italian Statuario Marble',
      orientation: specs.facingDirection || 'East',
      doors: [{ x: Number((env.x + wing1W / 2).toFixed(2)), y: yLiving, width: 4.0, wall: 'south', label: 'Main Portal' }],
      windows: [{ x: env.x, y: Number((yWing1 + porticoL / 2).toFixed(2)), width: 4.5, wall: 'west' }]
    }));
  }

  // Formal Living Lounge in Wing 1
  rooms.push(createPlacedRoomRecord({
    id: 'g_living',
    name: 'Double-Height Formal Living Lounge',
    type: ROOM_TYPES.LIVING,
    zone: ZONES.PUBLIC,
    bounds: { x: env.x, y: yLiving, width: wing1W, length: livingL },
    finish: 'Italian Statuario Marble',
    orientation: 'North-West',
    doors: [
      { x: Number((env.x + wing1W).toFixed(2)), y: Number((yLiving + livingL / 2).toFixed(2)), width: 4.5, wall: 'east', label: 'Spine Threshold' }
    ],
    windows: [
      { x: env.x, y: Number((yLiving + livingL / 2).toFixed(2)), width: 6.0, wall: 'west', label: 'Full-Height Window' },
      { x: Number((env.x + wing1W / 2).toFixed(2)), y: Number((yLiving + livingL).toFixed(2)), width: 5.0, wall: 'south' }
    ]
  }));

  // --- WING 2 (Rear Right, starts at yWing2): Staircase + Dining + Pooja + Kitchen + Master Suite
  const wing2X = Number((env.x + wing1W).toFixed(2));
  const rowDiningL = Number((lWing2 * 0.44).toFixed(2));
  const rowBedL = Number((lWing2 - rowDiningL).toFixed(2));
  const yRowBed = Number((yWing2 + rowDiningL).toFixed(2));

  // Aligned Staircase placed at front of Wing 2
  const stairW = stairwellBounds ? stairwellBounds.width : Number(Math.min(7.5, wing2W * 0.40).toFixed(2));
  const diningW = Number((wing2W - stairW).toFixed(2));
  const stairX = wing2X;
  const diningX = Number((stairX + stairW).toFixed(2));

  const effectiveStairBounds = stairwellBounds || {
    x: stairX,
    y: yWing2,
    width: stairW,
    length: rowDiningL
  };

  rooms.push(createPlacedRoomRecord({
    id: 'g_stairwell_core',
    name: 'Central Spine Stairwell',
    type: ROOM_TYPES.STAIRWELL,
    zone: ZONES.PUBLIC,
    bounds: { ...effectiveStairBounds },
    finish: 'Flamed Granite Steps + Stainless Steel Balustrade',
    orientation: 'Central',
    doors: [{ x: Number((effectiveStairBounds.x + effectiveStairBounds.width / 2).toFixed(2)), y: effectiveStairBounds.y, width: 3.0, wall: 'north' }],
    windows: [{ x: effectiveStairBounds.x, y: Number((effectiveStairBounds.y + effectiveStairBounds.length / 2).toFixed(2)), width: 3.0, wall: 'west' }]
  }));

  // Dining and Pooja in remainder of Wing 2 front row
  if (!isPoojaDisabled) {
    const poojaL = Number(Math.max(3.5, Math.min(5.5, rowDiningL * 0.35)).toFixed(2));
    const mainDiningL = Number((rowDiningL - poojaL).toFixed(2));

    rooms.push(createPlacedRoomRecord({
      id: 'g_pooja',
      name: 'Ishanya Pooja Sanctum',
      type: ROOM_TYPES.POOJA,
      zone: ZONES.SEMI_PRIVATE,
      bounds: { x: diningX, y: yWing2, width: diningW, length: poojaL },
      finish: 'White Makrana Carved Marble',
      orientation: 'North-East',
      doors: [{ x: Number((diningX + diningW / 2).toFixed(2)), y: Number((yWing2 + poojaL).toFixed(2)), width: 2.5, wall: 'south', label: 'Jali Door' }],
      windows: [{ x: Number((diningX + diningW).toFixed(2)), y: Number((yWing2 + poojaL / 2).toFixed(2)), width: 3.0, wall: 'east' }]
    }));

    rooms.push(createPlacedRoomRecord({
      id: 'g_dining',
      name: 'Central Dining Area',
      type: ROOM_TYPES.DINING,
      zone: ZONES.SEMI_PRIVATE,
      bounds: { x: diningX, y: Number((yWing2 + poojaL).toFixed(2)), width: diningW, length: mainDiningL },
      finish: 'Polished Vitrified 800×1600mm',
      orientation: 'East',
      doors: [
        { x: diningX, y: Number((yWing2 + poojaL + mainDiningL / 2).toFixed(2)), width: 3.5, wall: 'west', label: 'Stair/Living Portal' },
        { x: Number((diningX + diningW / 2).toFixed(2)), y: yRowBed, width: 3.0, wall: 'south', label: 'Kitchen Door' }
      ],
      windows: [{ x: Number((diningX + diningW).toFixed(2)), y: Number((yWing2 + poojaL + mainDiningL / 2).toFixed(2)), width: 4.5, wall: 'east' }]
    }));
  } else {
    rooms.push(createPlacedRoomRecord({
      id: 'g_dining',
      name: 'Central Dining Area',
      type: ROOM_TYPES.DINING,
      zone: ZONES.SEMI_PRIVATE,
      bounds: { x: diningX, y: yWing2, width: diningW, length: rowDiningL },
      finish: 'Polished Vitrified 800×1600mm',
      orientation: 'East',
      doors: [
        { x: diningX, y: Number((yWing2 + rowDiningL / 2).toFixed(2)), width: 3.5, wall: 'west', label: 'Stair/Living Portal' },
        { x: Number((diningX + diningW / 2).toFixed(2)), y: yRowBed, width: 3.0, wall: 'south', label: 'Kitchen Door' }
      ],
      windows: [{ x: Number((diningX + diningW).toFixed(2)), y: Number((yWing2 + rowDiningL / 2).toFixed(2)), width: 5.0, wall: 'east' }]
    }));
  }

  // Rear of Wing 2: Kitchen + Master Bedroom Suite + 2 Baths
  const needsTwoGroundBaths = (specs.bathroomsCount >= 4) || (floorProg.rooms?.filter(r => r.type === ROOM_TYPES.BATHROOM).length >= 2);

  if (needsTwoGroundBaths) {
    const bathW = Number(Math.max(4.0, Math.min(5.5, wing2W * 0.22)).toFixed(2));
    const kitchW = Number(Math.max(7.5, Math.min(10.5, wing2W * 0.40)).toFixed(2));
    const bedW = Number((wing2W - (bathW * 2) - kitchW).toFixed(2));

    const kitchX = wing2X;
    const bathCommonX = Number((kitchX + kitchW).toFixed(2));
    const bathSuiteX = Number((bathCommonX + bathW).toFixed(2));
    const bedX = Number((bathSuiteX + bathW).toFixed(2));

    rooms.push(createPlacedRoomRecord({
      id: 'g_kitchen',
      name: 'Modular Gourmet Kitchen',
      type: ROOM_TYPES.KITCHEN,
      zone: ZONES.SERVICE,
      bounds: { x: kitchX, y: yRowBed, width: kitchW, length: rowBedL },
      finish: 'Quartz Countertop + Matte Tiles',
      orientation: 'South',
      doors: [{ x: Number((kitchX + kitchW / 2).toFixed(2)), y: yRowBed, width: 3.0, wall: 'north' }],
      windows: [{ x: Number((kitchX + kitchW / 2).toFixed(2)), y: Number((yRowBed + rowBedL).toFixed(2)), width: 4.0, wall: 'south' }]
    }));

    rooms.push(createPlacedRoomRecord({
      id: 'g_bath_common',
      name: 'Sanitary Bath & Powder',
      type: ROOM_TYPES.BATHROOM,
      zone: ZONES.SERVICE,
      bounds: { x: bathCommonX, y: yRowBed, width: bathW, length: rowBedL },
      finish: 'Anti-skid Ceramic Vitrified',
      orientation: 'South',
      doors: [{ x: Number((bathCommonX + bathW / 2).toFixed(2)), y: yRowBed, width: 2.5, wall: 'north' }],
      windows: [{ x: Number((bathCommonX + bathW / 2).toFixed(2)), y: Number((yRowBed + rowBedL).toFixed(2)), width: 2.0, wall: 'south', label: 'Vent' }]
    }));

    rooms.push(createPlacedRoomRecord({
      id: 'g_bath_suite',
      name: 'Master En-suite Bathroom',
      type: ROOM_TYPES.BATHROOM,
      zone: ZONES.SERVICE,
      bounds: { x: bathSuiteX, y: yRowBed, width: bathW, length: rowBedL },
      finish: 'Anti-skid Flamed Granite',
      orientation: 'South',
      doors: [{ x: Number((bathSuiteX + bathW).toFixed(2)), y: Number((yRowBed + rowBedL / 2).toFixed(2)), width: 2.5, wall: 'east' }],
      windows: [{ x: Number((bathSuiteX + bathW / 2).toFixed(2)), y: Number((yRowBed + rowBedL).toFixed(2)), width: 2.0, wall: 'south', label: 'Vent' }]
    }));

    rooms.push(createPlacedRoomRecord({
      id: 'g_bed_master',
      name: 'Ground Master Bedroom Suite',
      type: ROOM_TYPES.MASTER_BEDROOM,
      zone: ZONES.PRIVATE,
      bounds: { x: bedX, y: yRowBed, width: bedW, length: rowBedL },
      finish: 'Matte Oak Hardwood Vitrified',
      orientation: 'South-East',
      doors: [
        { x: Number((bedX + bedW / 2).toFixed(2)), y: yRowBed, width: 3.0, wall: 'north' },
        { x: bedX, y: Number((yRowBed + rowBedL / 2).toFixed(2)), width: 2.5, wall: 'west', label: 'En-suite Door' }
      ],
      windows: [
        { x: Number((bedX + bedW).toFixed(2)), y: Number((yRowBed + rowBedL / 2).toFixed(2)), width: 5.0, wall: 'east' },
        { x: Number((bedX + bedW / 2).toFixed(2)), y: Number((yRowBed + rowBedL).toFixed(2)), width: 4.5, wall: 'south' }
      ]
    }));
  } else {
    const bathW = Number(Math.max(4.5, Math.min(6.5, wing2W * 0.25)).toFixed(2));
    const kitchW = Number(Math.max(8.0, Math.min(11.0, wing2W * 0.40)).toFixed(2));
    const bedW = Number((wing2W - bathW - kitchW).toFixed(2));

    const kitchX = wing2X;
    const bathX = Number((kitchX + kitchW).toFixed(2));
    const bedX = Number((bathX + bathW).toFixed(2));

    rooms.push(createPlacedRoomRecord({
      id: 'g_kitchen',
      name: 'Modular Gourmet Kitchen',
      type: ROOM_TYPES.KITCHEN,
      zone: ZONES.SERVICE,
      bounds: { x: kitchX, y: yRowBed, width: kitchW, length: rowBedL },
      finish: 'Quartz Countertop + Matte Tiles',
      orientation: 'South',
      doors: [{ x: Number((kitchX + kitchW / 2).toFixed(2)), y: yRowBed, width: 3.0, wall: 'north' }],
      windows: [{ x: Number((kitchX + kitchW / 2).toFixed(2)), y: Number((yRowBed + rowBedL).toFixed(2)), width: 4.0, wall: 'south' }]
    }));

    rooms.push(createPlacedRoomRecord({
      id: 'g_bath_common',
      name: 'Sanitary Bath & Toilet',
      type: ROOM_TYPES.BATHROOM,
      zone: ZONES.SERVICE,
      bounds: { x: bathX, y: yRowBed, width: bathW, length: rowBedL },
      finish: 'Anti-skid Ceramic Vitrified',
      orientation: 'South',
      doors: [{ x: Number((bathX + bathW / 2).toFixed(2)), y: yRowBed, width: 2.5, wall: 'north' }],
      windows: [{ x: Number((bathX + bathW / 2).toFixed(2)), y: Number((yRowBed + rowBedL).toFixed(2)), width: 2.0, wall: 'south', label: 'Vent' }]
    }));

    rooms.push(createPlacedRoomRecord({
      id: 'g_bed_master',
      name: 'Ground Master Bedroom Suite',
      type: ROOM_TYPES.MASTER_BEDROOM,
      zone: ZONES.PRIVATE,
      bounds: { x: bedX, y: yRowBed, width: bedW, length: rowBedL },
      finish: 'Matte Oak Hardwood Vitrified',
      orientation: 'South-East',
      doors: [{ x: Number((bedX + bedW / 2).toFixed(2)), y: yRowBed, width: 3.0, wall: 'north' }],
      windows: [{ x: Number((bedX + bedW).toFixed(2)), y: Number((yRowBed + rowBedL / 2).toFixed(2)), width: 4.5, wall: 'east' }]
    }));
  }

  const footprints = [
    { x: env.x, y: yWing1, width: wing1W, length: lWing1 },
    { x: wing2X, y: yWing2, width: wing2W, length: lWing2 }
  ];

  return { rooms, footprints };
}

export function solveSplitWingUpperLayout({ env, specs, floorProg, stairwellBounds, options = {}, rng }) {
  const rooms = [];
  const W = env.width;
  const L = env.length;

  const wing1W = Number((W * 0.52).toFixed(2));
  const wing2W = Number((W - wing1W).toFixed(2));
  const offset = Number(Math.max(6.0, Math.min(10.0, L * 0.22)).toFixed(2));

  const yWing1 = env.y;
  const lWing1 = Number((L - offset).toFixed(2));
  const yWing2 = Number((env.y + offset).toFixed(2));
  const lWing2 = Number((L - offset).toFixed(2));

  // Wing 1 (Front Left): Cantilever Balcony + Upper Bedroom 2 + En-suite Bath
  const balcL = Number(Math.max(5.5, Math.min(8.0, lWing1 * 0.24)).toFixed(2));
  const bed1L = Number((lWing1 - balcL).toFixed(2));
  const yBed1 = Number((yWing1 + balcL).toFixed(2));

  rooms.push(createPlacedRoomRecord({
    id: 'f_balcony',
    name: 'Cantilever Glass Balcony Deck',
    type: ROOM_TYPES.BALCONY,
    zone: ZONES.OUTDOOR,
    bounds: { x: env.x, y: yWing1, width: wing1W, length: balcL },
    finish: 'Weatherproof WPC Wood Planks',
    orientation: specs.facingDirection || 'East',
    doors: [{ x: Number((env.x + wing1W / 2).toFixed(2)), y: yBed1, width: 4.5, wall: 'south', label: 'Glass Sliding Door' }],
    windows: []
  }));

  const bathW = Number(Math.max(4.5, Math.min(6.0, wing1W * 0.32)).toFixed(2));
  const mainBed1W = Number((wing1W - bathW).toFixed(2));

  rooms.push(createPlacedRoomRecord({
    id: 'f_bed_2',
    name: 'Secondary Bedroom Suite 2',
    type: ROOM_TYPES.BEDROOM,
    zone: ZONES.PRIVATE,
    bounds: { x: env.x, y: yBed1, width: mainBed1W, length: bed1L },
    finish: 'Matte Oak Hardwood Vitrified',
    orientation: 'North-West',
    doors: [
      { x: Number((env.x + mainBed1W / 2).toFixed(2)), y: yBed1, width: 4.5, wall: 'north', label: 'Balcony Portal' },
      { x: Number((env.x + mainBed1W).toFixed(2)), y: Number((yBed1 + bed1L / 2).toFixed(2)), width: 2.5, wall: 'east', label: 'En-suite Door' }
    ],
    windows: [{ x: env.x, y: Number((yBed1 + bed1L / 2).toFixed(2)), width: 5.0, wall: 'west' }]
  }));

  rooms.push(createPlacedRoomRecord({
    id: 'f_bath_3',
    name: 'Bedroom 2 En-suite Bath',
    type: ROOM_TYPES.BATHROOM,
    zone: ZONES.SERVICE,
    bounds: { x: Number((env.x + mainBed1W).toFixed(2)), y: yBed1, width: bathW, length: bed1L },
    finish: 'Anti-skid Ceramic Vitrified',
    orientation: 'South',
    doors: [{ x: Number((env.x + mainBed1W).toFixed(2)), y: Number((yBed1 + bed1L / 2).toFixed(2)), width: 2.5, wall: 'west' }],
    windows: [{ x: Number((env.x + mainBed1W + bathW / 2).toFixed(2)), y: Number((yBed1 + bed1L).toFixed(2)), width: 2.0, wall: 'south', label: 'Vent' }]
  }));

  // Wing 2 (Rear Right): Aligned Staircase + Family Media Lounge + Upper Bedroom 3 + En-suite Bath
  const wing2X = Number((env.x + wing1W).toFixed(2));
  const rowLoungeL = Number((lWing2 * 0.44).toFixed(2));
  const bed2L = Number((lWing2 - rowLoungeL).toFixed(2));
  const yBed2 = Number((yWing2 + rowLoungeL).toFixed(2));

  // Aligned Staircase at front of Wing 2
  const stairW = stairwellBounds ? stairwellBounds.width : Number(Math.min(7.5, wing2W * 0.40).toFixed(2));
  const loungeW = Number((wing2W - stairW).toFixed(2));
  const stairX = wing2X;
  const loungeX = Number((stairX + stairW).toFixed(2));

  const effectiveStairBounds = stairwellBounds || {
    x: stairX,
    y: yWing2,
    width: stairW,
    length: rowLoungeL
  };

  rooms.push(createPlacedRoomRecord({
    id: 'f_stairwell_core',
    name: 'Central Spine Stairwell (Upper)',
    type: ROOM_TYPES.STAIRWELL,
    zone: ZONES.PUBLIC,
    bounds: { ...effectiveStairBounds },
    finish: 'Flamed Granite Steps + Stainless Steel Balustrade',
    orientation: 'Central',
    doors: [{ x: Number((effectiveStairBounds.x + effectiveStairBounds.width / 2).toFixed(2)), y: effectiveStairBounds.y, width: 3.0, wall: 'north' }],
    windows: [{ x: effectiveStairBounds.x, y: Number((effectiveStairBounds.y + effectiveStairBounds.length / 2).toFixed(2)), width: 3.0, wall: 'west' }]
  }));

  rooms.push(createPlacedRoomRecord({
    id: 'f_family_lounge',
    name: 'Upper Family Media Lounge & Study',
    type: ROOM_TYPES.LIVING,
    zone: ZONES.SEMI_PRIVATE,
    bounds: { x: loungeX, y: yWing2, width: loungeW, length: rowLoungeL },
    finish: 'Italian Vitrified 800×1600mm',
    orientation: 'North-East',
    doors: [
      { x: loungeX, y: Number((yWing2 + rowLoungeL / 2).toFixed(2)), width: 3.5, wall: 'west', label: 'Spine Access' },
      { x: Number((loungeX + loungeW / 2).toFixed(2)), y: yBed2, width: 3.0, wall: 'south', label: 'Guest Suite Lobby' }
    ],
    windows: [{ x: Number((loungeX + loungeW).toFixed(2)), y: Number((yWing2 + rowLoungeL / 2).toFixed(2)), width: 5.5, wall: 'east' }]
  }));

  // Rear of Wing 2: Upper Bedroom 3 + En-suite Bath
  const bath2W = Number(Math.max(4.5, Math.min(6.0, wing2W * 0.35)).toFixed(2));
  const mainBed2W = Number((wing2W - bath2W).toFixed(2));

  rooms.push(createPlacedRoomRecord({
    id: 'f_bath_4',
    name: 'Guest Bedroom En-suite Bath',
    type: ROOM_TYPES.BATHROOM,
    zone: ZONES.SERVICE,
    bounds: { x: wing2X, y: yBed2, width: bath2W, length: bed2L },
    finish: 'Anti-skid Ceramic Vitrified',
    orientation: 'South',
    doors: [{ x: Number((wing2X + bath2W).toFixed(2)), y: Number((yBed2 + bed2L / 2).toFixed(2)), width: 2.5, wall: 'east' }],
    windows: [{ x: Number((wing2X + bath2W / 2).toFixed(2)), y: Number((yBed2 + bed2L).toFixed(2)), width: 2.0, wall: 'south', label: 'Vent' }]
  }));

  rooms.push(createPlacedRoomRecord({
    id: 'f_bed_3',
    name: 'Upper Guest Bedroom 3',
    type: ROOM_TYPES.BEDROOM,
    zone: ZONES.PRIVATE,
    bounds: { x: Number((wing2X + bath2W).toFixed(2)), y: yBed2, width: mainBed2W, length: bed2L },
    finish: 'Matte Oak Hardwood Vitrified',
    orientation: 'South-East',
    doors: [
      { x: Number((wing2X + bath2W + mainBed2W / 2).toFixed(2)), y: yBed2, width: 3.0, wall: 'north' },
      { x: Number((wing2X + bath2W).toFixed(2)), y: Number((yBed2 + bed2L / 2).toFixed(2)), width: 2.5, wall: 'west', label: 'En-suite Door' }
    ],
    windows: [
      { x: Number((wing2X + wing2W).toFixed(2)), y: Number((yBed2 + bed2L / 2).toFixed(2)), width: 5.0, wall: 'east' },
      { x: Number((wing2X + bath2W + mainBed2W / 2).toFixed(2)), y: Number((yBed2 + bed2L).toFixed(2)), width: 4.5, wall: 'south' }
    ]
  }));

  const footprints = [
    { x: env.x, y: yWing1, width: wing1W, length: lWing1 },
    { x: wing2X, y: yWing2, width: wing2W, length: lWing2 }
  ];

  return { rooms, footprints };
}

// =============================================================================
// 4. PAVILION-BASED VILLA (Central Grand Pavilion flanked by Private Pods)
// =============================================================================

export function solvePavilionGroundLayout({ env, specs, floorProg, stairwellBounds, options = {}, rng }) {
  const rooms = [];
  const W = env.width;
  const L = env.length;

  const hasParking = specs.amenities?.hasParking !== false && specs.hasParking !== false;
  const isPoojaDisabled = specs.amenities?.hasPooja === false || specs.hasPooja === false;

  // Front Shaded Continuous Verandah
  const verL = Number(Math.max(6.5, Math.min(9.5, L * 0.18)).toFixed(2));
  const mainL = Number((L - verL).toFixed(2));

  const yVer = env.y;
  const yMain = Number((env.y + verL).toFixed(2));

  // Front Wrap-Around Verandah
  if (hasParking) {
    const porticoW = Number((W * 0.40).toFixed(2));
    const verW = Number((W - porticoW).toFixed(2));

    rooms.push(createPlacedRoomRecord({
      id: 'g_portico',
      name: 'Pillared Portico & Car Porch',
      type: ROOM_TYPES.PORTICO,
      zone: ZONES.OUTDOOR,
      bounds: { x: env.x, y: yVer, width: porticoW, length: verL },
      finish: 'Weatherproof Granite Pavers',
      orientation: specs.facingDirection || 'East',
      doors: [],
      windows: []
    }));

    rooms.push(createPlacedRoomRecord({
      id: 'g_foyer',
      name: 'Grand Shaded Pavilion Verandah',
      type: ROOM_TYPES.FOYER,
      zone: ZONES.PUBLIC,
      bounds: { x: Number((env.x + porticoW).toFixed(2)), y: yVer, width: verW, length: verL },
      finish: 'Polished Athangudi Heritage Tiles + Ornamental Teak Pillars',
      orientation: specs.facingDirection || 'East',
      doors: [{ x: Number((env.x + porticoW + verW / 2).toFixed(2)), y: yMain, width: 4.5, wall: 'south', label: 'Grand Central Portal' }],
      windows: []
    }));
  } else {
    rooms.push(createPlacedRoomRecord({
      id: 'g_foyer',
      name: 'Grand Shaded Pavilion Verandah',
      type: ROOM_TYPES.FOYER,
      zone: ZONES.PUBLIC,
      bounds: { x: env.x, y: yVer, width: W, length: verL },
      finish: 'Polished Athangudi Heritage Tiles + Ornamental Teak Pillars',
      orientation: specs.facingDirection || 'East',
      doors: [{ x: Number((env.x + W / 2).toFixed(2)), y: yMain, width: 4.5, wall: 'south', label: 'Grand Central Portal' }],
      windows: []
    }));
  }

  // Tripartite Mid Zone:
  // Pod 1 (West Wing): Width 32% of W. Staircase + Master Suite + Bath.
  // Pod 2 (Central Pavilion): Width 36% of W. Living & Dining.
  // Pod 3 (East Wing): Width 32% of W. Pooja + Bath + Kitchen.
  const pod1W = Number((W * 0.32).toFixed(2));
  const pod2W = Number((W * 0.36).toFixed(2));
  const pod3W = Number((W - pod1W - pod2W).toFixed(2));

  const xPod1 = env.x;
  const xPod2 = Number((env.x + pod1W).toFixed(2));
  const xPod3 = Number((xPod2 + pod2W).toFixed(2));

  // --- POD 2: CENTRAL LIVING & DINING PAVILION
  const livingL = Number((mainL * 0.54).toFixed(2));
  const diningL = Number((mainL - livingL).toFixed(2));
  const yDining = Number((yMain + livingL).toFixed(2));

  rooms.push(createPlacedRoomRecord({
    id: 'g_living',
    name: 'Grand Pavilion Living Lounge',
    type: ROOM_TYPES.LIVING,
    zone: ZONES.PUBLIC,
    bounds: { x: xPod2, y: yMain, width: pod2W, length: livingL },
    finish: 'White Makrana Marble + Brass Borders',
    orientation: 'Central',
    doors: [
      { x: Number((xPod2 + pod2W / 2).toFixed(2)), y: yMain, width: 4.5, wall: 'north', label: 'Main Portal' },
      { x: Number((xPod2 + pod2W / 2).toFixed(2)), y: yDining, width: 4.0, wall: 'south', label: 'Arch to Dining' },
      { x: xPod2, y: Number((yMain + livingL / 2).toFixed(2)), width: 3.5, wall: 'west', label: 'West Corridor' },
      { x: Number((xPod2 + pod2W).toFixed(2)), y: Number((yMain + livingL / 2).toFixed(2)), width: 3.5, wall: 'east', label: 'East Corridor' }
    ],
    windows: []
  }));

  rooms.push(createPlacedRoomRecord({
    id: 'g_dining',
    name: 'Pavilion Dining Hall',
    type: ROOM_TYPES.DINING,
    zone: ZONES.SEMI_PRIVATE,
    bounds: { x: xPod2, y: yDining, width: pod2W, length: diningL },
    finish: 'Polished Vitrified 800×1600mm',
    orientation: 'Central',
    doors: [
      { x: Number((xPod2 + pod2W / 2).toFixed(2)), y: yDining, width: 4.0, wall: 'north', label: 'Arch from Living' },
      { x: Number((xPod2 + pod2W).toFixed(2)), y: Number((yDining + diningL / 2).toFixed(2)), width: 3.0, wall: 'east', label: 'Kitchen Service' }
    ],
    windows: [{ x: Number((xPod2 + pod2W / 2).toFixed(2)), y: Number((yDining + diningL).toFixed(2)), width: 5.0, wall: 'south' }]
  }));

  // --- POD 1 (WEST POD): Staircase + Master Bedroom Suite + Bath
  const stairW = stairwellBounds ? stairwellBounds.width : pod1W;
  const stairL = stairwellBounds ? stairwellBounds.length : Number((mainL * 0.38).toFixed(2));
  const bedMasterL = Number((mainL - stairL).toFixed(2));
  const yBedMaster = Number((yMain + stairL).toFixed(2));

  const effectiveStairBounds = stairwellBounds || {
    x: xPod1,
    y: yMain,
    width: stairW,
    length: stairL
  };

  rooms.push(createPlacedRoomRecord({
    id: 'g_stairwell_core',
    name: 'West Wing Stairwell',
    type: ROOM_TYPES.STAIRWELL,
    zone: ZONES.PUBLIC,
    bounds: { ...effectiveStairBounds },
    finish: 'Flamed Granite Steps + Teak Handrail',
    orientation: 'West',
    doors: [{ x: Number((effectiveStairBounds.x + effectiveStairBounds.width).toFixed(2)), y: Number((effectiveStairBounds.y + effectiveStairBounds.length / 2).toFixed(2)), width: 3.0, wall: 'east' }],
    windows: [{ x: effectiveStairBounds.x, y: Number((effectiveStairBounds.y + effectiveStairBounds.length / 2).toFixed(2)), width: 3.0, wall: 'west' }]
  }));

  // Master Bedroom in West Pod
  const bathSuiteL = Number(Math.max(5.0, Math.min(6.5, bedMasterL * 0.35)).toFixed(2));
  const actualBedL = Number((bedMasterL - bathSuiteL).toFixed(2));
  const yBathSuite = Number((yBedMaster + actualBedL).toFixed(2));

  rooms.push(createPlacedRoomRecord({
    id: 'g_bed_master',
    name: 'Ground Master Bedroom Sanctuary',
    type: ROOM_TYPES.MASTER_BEDROOM,
    zone: ZONES.PRIVATE,
    bounds: { x: xPod1, y: yBedMaster, width: pod1W, length: actualBedL },
    finish: 'Matte Oak Hardwood Vitrified',
    orientation: 'South-West',
    doors: [
      { x: Number((xPod1 + pod1W).toFixed(2)), y: Number((yBedMaster + actualBedL / 2).toFixed(2)), width: 3.0, wall: 'east' },
      { x: Number((xPod1 + pod1W / 2).toFixed(2)), y: yBathSuite, width: 2.5, wall: 'south', label: 'En-suite Door' }
    ],
    windows: [{ x: xPod1, y: Number((yBedMaster + actualBedL / 2).toFixed(2)), width: 5.0, wall: 'west' }]
  }));

  rooms.push(createPlacedRoomRecord({
    id: 'g_bath_suite',
    name: 'Master Luxury En-suite Bath',
    type: ROOM_TYPES.BATHROOM,
    zone: ZONES.SERVICE,
    bounds: { x: xPod1, y: yBathSuite, width: pod1W, length: bathSuiteL },
    finish: 'Anti-skid Flamed Granite',
    orientation: 'South',
    doors: [{ x: Number((xPod1 + pod1W / 2).toFixed(2)), y: yBathSuite, width: 2.5, wall: 'north' }],
    windows: [{ x: Number((xPod1 + pod1W / 2).toFixed(2)), y: Number((yBathSuite + bathSuiteL).toFixed(2)), width: 2.0, wall: 'south', label: 'Vent' }]
  }));

  // --- POD 3 (EAST POD): Pooja + Common Bath + Gourmet Kitchen
  const poojaL = !isPoojaDisabled ? Number(Math.max(4.0, Math.min(5.5, mainL * 0.22)).toFixed(2)) : 0;
  const bathCommonL = Number(Math.max(4.5, Math.min(6.0, mainL * 0.22)).toFixed(2));
  const kitchL = Number((mainL - poojaL - bathCommonL).toFixed(2));

  const yPooja = yMain;
  const yBathCommon = Number((yPooja + poojaL).toFixed(2));
  const yKitch = Number((yBathCommon + bathCommonL).toFixed(2));

  if (!isPoojaDisabled) {
    rooms.push(createPlacedRoomRecord({
      id: 'g_pooja',
      name: 'Ishanya Pooja Sanctum',
      type: ROOM_TYPES.POOJA,
      zone: ZONES.SEMI_PRIVATE,
      bounds: { x: xPod3, y: yPooja, width: pod3W, length: poojaL },
      finish: 'White Makrana Carved Marble',
      orientation: 'North-East',
      doors: [{ x: xPod3, y: Number((yPooja + poojaL / 2).toFixed(2)), width: 2.5, wall: 'west', label: 'Brass Jali Door' }],
      windows: [{ x: Number((xPod3 + pod3W).toFixed(2)), y: Number((yPooja + poojaL / 2).toFixed(2)), width: 3.0, wall: 'east' }]
    }));
  }

  rooms.push(createPlacedRoomRecord({
    id: 'g_bath_common',
    name: 'Sanitary Bath & Powder',
    type: ROOM_TYPES.BATHROOM,
    zone: ZONES.SERVICE,
    bounds: { x: xPod3, y: yBathCommon, width: pod3W, length: bathCommonL },
    finish: 'Anti-skid Ceramic Vitrified',
    orientation: 'East',
    doors: [{ x: xPod3, y: Number((yBathCommon + bathCommonL / 2).toFixed(2)), width: 2.5, wall: 'west' }],
    windows: [{ x: Number((xPod3 + pod3W).toFixed(2)), y: Number((yBathCommon + bathCommonL / 2).toFixed(2)), width: 2.0, wall: 'east', label: 'Vent' }]
  }));

  rooms.push(createPlacedRoomRecord({
    id: 'g_kitchen',
    name: 'Modular Gourmet Kitchen & Pantry',
    type: ROOM_TYPES.KITCHEN,
    zone: ZONES.SERVICE,
    bounds: { x: xPod3, y: yKitch, width: pod3W, length: kitchL },
    finish: 'Quartz Countertop + Matte Tiles',
    orientation: 'South-East',
    doors: [{ x: xPod3, y: Number((yKitch + kitchL / 2).toFixed(2)), width: 3.0, wall: 'west' }],
    windows: [
      { x: Number((xPod3 + pod3W).toFixed(2)), y: Number((yKitch + kitchL / 2).toFixed(2)), width: 4.5, wall: 'east' },
      { x: Number((xPod3 + pod3W / 2).toFixed(2)), y: Number((yKitch + kitchL).toFixed(2)), width: 3.5, wall: 'south' }
    ]
  }));

  return {
    rooms,
    footprints: [{ ...env }]
  };
}

export function solvePavilionUpperLayout({ env, specs, floorProg, stairwellBounds, options = {}, rng }) {
  const rooms = [];
  const W = env.width;
  const L = env.length;

  // If stairwellBounds is passed from ground, align main band Y extents to stairwell Y
  const verL = stairwellBounds ? Number((stairwellBounds.y - env.y).toFixed(2)) : Number(Math.max(6.5, Math.min(9.5, L * 0.18)).toFixed(2));
  const mainL = Number((L - verL).toFixed(2));

  const yVer = env.y;
  const yMain = Number((env.y + verL).toFixed(2));

  // Front Covered Verandah / Balcony
  rooms.push(createPlacedRoomRecord({
    id: 'f_balcony',
    name: 'Pavilion Upper Shaded Verandah',
    type: ROOM_TYPES.BALCONY,
    zone: ZONES.OUTDOOR,
    bounds: { x: env.x, y: yVer, width: W, length: verL },
    finish: 'Teak Wood Floor + Heritage Balusters',
    orientation: specs.facingDirection || 'East',
    doors: [{ x: Number((env.x + W / 2).toFixed(2)), y: yMain, width: 4.5, wall: 'south', label: 'Glass Sliding Door' }],
    windows: []
  }));

  // Tripartite Upper Floor:
  const pod1W = Number((W * 0.32).toFixed(2));
  const pod2W = Number((W * 0.36).toFixed(2));
  const pod3W = Number((W - pod1W - pod2W).toFixed(2));

  const xPod1 = env.x;
  const xPod2 = Number((env.x + pod1W).toFixed(2));
  const xPod3 = Number((xPod2 + pod2W).toFixed(2));

  // Aligned Staircase in West Pod
  const stairW = stairwellBounds ? stairwellBounds.width : pod1W;
  const defaultStairL = Number((mainL * 0.38).toFixed(2));
  const effectiveStairBounds = stairwellBounds || {
    x: xPod1,
    y: yMain,
    width: stairW,
    length: defaultStairL
  };

  const actualStairL = Number(effectiveStairBounds.length.toFixed(2));
  const yBed2 = Number((effectiveStairBounds.y + actualStairL).toFixed(2));
  const bed2L = Number(((env.y + L) - yBed2).toFixed(2));

  rooms.push(createPlacedRoomRecord({
    id: 'f_stairwell_core',
    name: 'West Wing Stairwell (Upper)',
    type: ROOM_TYPES.STAIRWELL,
    zone: ZONES.PUBLIC,
    bounds: { ...effectiveStairBounds },
    finish: 'Flamed Granite Steps + Teak Handrail',
    orientation: 'West',
    doors: [{ x: Number((effectiveStairBounds.x + effectiveStairBounds.width).toFixed(2)), y: Number((effectiveStairBounds.y + effectiveStairBounds.length / 2).toFixed(2)), width: 3.0, wall: 'east' }],
    windows: [{ x: effectiveStairBounds.x, y: Number((effectiveStairBounds.y + effectiveStairBounds.length / 2).toFixed(2)), width: 3.0, wall: 'west' }]
  }));

  // Central Family Media Lounge
  rooms.push(createPlacedRoomRecord({
    id: 'f_family_lounge',
    name: 'Upper Grand Family Lounge',
    type: ROOM_TYPES.LIVING,
    zone: ZONES.SEMI_PRIVATE,
    bounds: { x: xPod2, y: yMain, width: pod2W, length: mainL },
    finish: 'Italian Polished Vitrified 800×1600mm',
    orientation: 'Central',
    doors: [
      { x: Number((xPod2 + pod2W / 2).toFixed(2)), y: yMain, width: 4.5, wall: 'north', label: 'Verandah Portal' },
      { x: xPod2, y: Number((yMain + mainL / 2).toFixed(2)), width: 3.0, wall: 'west', label: 'West Bedroom' },
      { x: Number((xPod2 + pod2W).toFixed(2)), y: Number((yMain + mainL / 2).toFixed(2)), width: 3.0, wall: 'east', label: 'East Bedroom' }
    ],
    windows: [{ x: Number((xPod2 + pod2W / 2).toFixed(2)), y: Number((yMain + mainL).toFixed(2)), width: 5.5, wall: 'south' }]
  }));

  // West Pod: Upper Bedroom 2 + En-suite Bath
  const bathSuiteL = Number(Math.max(5.0, Math.min(6.5, bed2L * 0.35)).toFixed(2));
  const actualBed2L = Number((bed2L - bathSuiteL).toFixed(2));
  const yBathSuite = Number((yBed2 + actualBed2L).toFixed(2));

  rooms.push(createPlacedRoomRecord({
    id: 'f_bed_2',
    name: 'Secondary Bedroom Suite 2',
    type: ROOM_TYPES.BEDROOM,
    zone: ZONES.PRIVATE,
    bounds: { x: xPod1, y: yBed2, width: pod1W, length: actualBed2L },
    finish: 'Matte Oak Hardwood Vitrified',
    orientation: 'South-West',
    doors: [
      { x: Number((xPod1 + pod1W).toFixed(2)), y: Number((yBed2 + actualBed2L / 2).toFixed(2)), width: 3.0, wall: 'east' },
      { x: Number((xPod1 + pod1W / 2).toFixed(2)), y: yBathSuite, width: 2.5, wall: 'south', label: 'En-suite Door' }
    ],
    windows: [{ x: xPod1, y: Number((yBed2 + actualBed2L / 2).toFixed(2)), width: 5.0, wall: 'west' }]
  }));

  rooms.push(createPlacedRoomRecord({
    id: 'f_bath_3',
    name: 'Bedroom 2 En-suite Bath',
    type: ROOM_TYPES.BATHROOM,
    zone: ZONES.SERVICE,
    bounds: { x: xPod1, y: yBathSuite, width: pod1W, length: bathSuiteL },
    finish: 'Anti-skid Ceramic Vitrified',
    orientation: 'South',
    doors: [{ x: Number((xPod1 + pod1W / 2).toFixed(2)), y: yBathSuite, width: 2.5, wall: 'north' }],
    windows: [{ x: Number((xPod1 + pod1W / 2).toFixed(2)), y: Number((yBathSuite + bathSuiteL).toFixed(2)), width: 2.0, wall: 'south', label: 'Vent' }]
  }));

  // East Pod: Upper Guest Bedroom 3 + En-suite Bath
  const bath4L = Number(Math.max(5.0, Math.min(6.5, mainL * 0.28)).toFixed(2));
  const actualBed3L = Number((mainL - bath4L).toFixed(2));
  const yBath4 = yMain;
  const yBed3 = Number((yMain + bath4L).toFixed(2));

  rooms.push(createPlacedRoomRecord({
    id: 'f_bath_4',
    name: 'Guest Bedroom En-suite Bath',
    type: ROOM_TYPES.BATHROOM,
    zone: ZONES.SERVICE,
    bounds: { x: xPod3, y: yBath4, width: pod3W, length: bath4L },
    finish: 'Anti-skid Ceramic Vitrified',
    orientation: 'North-East',
    doors: [{ x: xPod3, y: Number((yBath4 + bath4L / 2).toFixed(2)), width: 2.5, wall: 'west' }],
    windows: [{ x: Number((xPod3 + pod3W).toFixed(2)), y: Number((yBath4 + bath4L / 2).toFixed(2)), width: 2.0, wall: 'east', label: 'Vent' }]
  }));

  rooms.push(createPlacedRoomRecord({
    id: 'f_bed_3',
    name: 'Upper Guest Bedroom 3',
    type: ROOM_TYPES.BEDROOM,
    zone: ZONES.PRIVATE,
    bounds: { x: xPod3, y: yBed3, width: pod3W, length: actualBed3L },
    finish: 'Matte Oak Hardwood Vitrified',
    orientation: 'South-East',
    doors: [
      { x: xPod3, y: Number((yBed3 + actualBed3L / 2).toFixed(2)), width: 3.0, wall: 'west' }
    ],
    windows: [
      { x: Number((xPod3 + pod3W).toFixed(2)), y: Number((yBed3 + actualBed3L / 2).toFixed(2)), width: 5.0, wall: 'east' },
      { x: Number((xPod3 + pod3W / 2).toFixed(2)), y: Number((yBed3 + actualBed3L).toFixed(2)), width: 4.5, wall: 'south' }
    ]
  }));

  return {
    rooms,
    footprints: [{ ...env }]
  };
}
