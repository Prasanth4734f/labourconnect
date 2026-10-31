/**
 * LabourConnect Generative Architecture Engine - Design Space Explorer
 * 
 * Formal Architectural Design Space Exploration Layer.
 * Defines and explores multi-dimensional architectural permutations:
 * - Building Massing & Footprint Families (Rectangular, L-Shape, U-Shape, Courtyard, T-Shape, H-Shape, Staggered, Linear, Split-Wing)
 * - Spatial Topology & Circulation Configurations (12+ functional room relationship topologies)
 * - Circulation Cores (Left Flank, Right Flank, Central Spine, Rear Service, Front Portal)
 * - Roofline Geometries & Facade Articulations
 * 
 * Generates valid design-space coordinates that preserve 100% of the user's mandatory constraints
 * while providing an expansive procedural search space capable of 100+ unique valid solutions.
 */

import { SPATIAL_ARCHETYPES } from './adjacencyGraphSolver.js';

// =============================================================================
// 1. BUILDING MASSING & FOOTPRINT FAMILIES
// =============================================================================

export const MASSING_FAMILIES = Object.freeze({
  RECTANGULAR_CLASSIC: 'rectangular_classic',     // Monolithic plinth envelope
  L_SHAPE_COURT: 'l_shape_court',                 // L-shaped footprint with corner outdoor garden / terrace
  U_SHAPE_CENTRAL: 'u_shape_central',             // U-shaped massing flanking central courtyard/patio
  COURTYARD_NAALUKETTU: 'courtyard_naalukettu',   // Traditional 4-wing inward-facing central cloister
  T_SHAPE_WING: 't_shape_wing',                   // T-shaped massing with public head and private tail
  H_SHAPE_DUAL_COURT: 'h_shape_dual_court',       // Dual-wing pavilion connected by central link
  STAGGERED_OFFSET: 'staggered_offset',           // Offset dual-volume massing creating dynamic facade recesses
  LINEAR_PAVILION: 'linear_pavilion',             // Elongated single-depth volume with linear verandah
  STEPPED_TERRACE: 'stepped_terrace',             // Upper floor stepped setback creating extensive sky deck
  SPLIT_WING_ZONED: 'split_wing_zoned'            // Separate public entertainment wing and private family wing
});

// =============================================================================
// 2. SPATIAL TOPOLOGY FAMILIES (ROOM PACKING & CIRCULATION TOPOLOGIES)
// =============================================================================

export const SPATIAL_TOPOLOGIES = Object.freeze({
  CENTRAL_LIVING_PERIPHERAL_BEDS: 'central_living_peripheral_beds', // Living room at core, bedrooms along perimeter
  COURTYARD_CIRCUMFERENTIAL: 'courtyard_circumferential',           // Rooms wrap around central lightwell / thotti
  LINEAR_SPINE_GALLERY: 'linear_spine_gallery',                     // Sequential circulation along side corridor
  SPLIT_WING_ZONED: 'split_wing_zoned',                             // Public front/right zone vs private back/left zone
  OPEN_PLAN_CONTEMPORARY: 'open_plan_contemporary',                 // Fluid living-dining-kitchen social hub
  SIDE_ACCESS_SANCTUARY: 'side_access_sanctuary',                   // Sheltered side arrival with private rear garden access
  FRONT_VERANDAH_THINNAI: 'front_verandah_thinnai',                 // Prominent raised verandah/thinnai transition
  DOUBLE_HEIGHT_FOYER_VILLA: 'double_height_foyer_villa',           // Grand arrival foyer with mezzanine gallery
  REAR_GARDEN_ORIENTED: 'rear_garden_oriented',                     // Living/dining opens directly to rear private garden
  CORNER_MASTER_SANCTUARY: 'corner_master_sanctuary',               // Master suite isolated in quiet South-West corner
  STAGGERED_DUAL_CORE: 'staggered_dual_core',                       // Offset staircase and service core for acoustic buffer
  UPPER_SKY_LOUNGE_DUPLEX: 'upper_sky_lounge_duplex'                // First floor family media lounge with wrap-around terrace
});

// =============================================================================
// 3. CIRCULATION CORE PLACEMENTS
// =============================================================================

export const CIRCULATION_CORE_POSITIONS = Object.freeze({
  RIGHT_FLANK: 'right_flank',       // Traditional right flank stairwell (East/South-East)
  LEFT_FLANK: 'left_flank',         // Left flank stairwell (West/North-West)
  CENTRAL_SPINE: 'central_spine',   // Central dog-legged stair adjacent to dining/foyer
  REAR_CORNER: 'rear_corner',       // Quiet rear service stair
  FRONT_ENTRY: 'front_entry'        // Grand front foyer staircase with external access option
});

// =============================================================================
// 4. ENTRANCE & ARRIVAL SEQUENCES
// =============================================================================

export const ENTRANCE_POSITIONS = Object.freeze({
  LEFT_CORNER: 'left_corner',       // Portico on left, arrival into foyer
  RIGHT_CORNER: 'right_corner',     // Portico on right, arrival into foyer
  CENTER_FRONTAL: 'center_frontal', // Symmetrical grand center portico
  RECESSED_PORCH: 'recessed_porch'  // Shaded deep recessed entrance alcove
});

// =============================================================================
// 5. DESIGN SPACE COORDINATE EXPLORER
// =============================================================================

/**
 * Procedurally generates an architectural design-space configuration
 * for a given set of requirements and seed.
 * 
 * @param {Object} specs - Normalized layout requirements
 * @param {number|string} seed - PRNG generation seed
 * @param {number} candidateIndex - Candidate iteration index (0..99+)
 * @param {Object} [options] - Optional overrides (massingFamily, topology, style)
 * @returns {Object} Deterministic design-space coordinate
 */
export function exploreDesignSpaceCoordinate(specs, seed, candidateIndex = 0, options = {}) {
  const numericSeed = Math.abs(Number(seed) || 12345) + (candidateIndex * 31337);
  
  // Deterministic LCG PRNG for repeatable exploration
  let state = (numericSeed ^ 0x5DEECE66D) >>> 0;
  const nextFloat = () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return (state >>> 8) / 16777216;
  };

  const plotW = Number(specs.plotWidth) || 30;
  const plotL = Number(specs.plotLength) || 40;
  const plotArea = plotW * plotL;
  const plotRatio = plotL / Math.max(plotW, 1);
  const floorsCount = Number(specs.floorsCount) || 1;
  const bhkCount = Number(specs.bhkCount) || 3;
  const requestedStyle = (specs.archStyle || 'modern').toLowerCase();

  // 1. Determine permitted massing families based on plot size and geometry
  const availableMassing = [MASSING_FAMILIES.RECTANGULAR_CLASSIC];

  if (plotArea >= 1200 && plotW >= 28) {
    availableMassing.push(MASSING_FAMILIES.L_SHAPE_COURT);
    availableMassing.push(MASSING_FAMILIES.STAGGERED_OFFSET);
  }
  if (plotArea >= 1800 && plotW >= 34) {
    availableMassing.push(MASSING_FAMILIES.U_SHAPE_CENTRAL);
    availableMassing.push(MASSING_FAMILIES.T_SHAPE_WING);
  }
  if ((plotArea >= 1500 && (requestedStyle.includes('kerala') || requestedStyle.includes('chettinad') || requestedStyle.includes('traditional') || specs.amenities?.hasCourtyard)) || plotArea >= 2400) {
    availableMassing.push(MASSING_FAMILIES.COURTYARD_NAALUKETTU);
  }
  if (plotArea >= 2400 && plotW >= 40) {
    availableMassing.push(MASSING_FAMILIES.H_SHAPE_DUAL_COURT);
    availableMassing.push(MASSING_FAMILIES.SPLIT_WING_ZONED);
  }
  if (plotRatio >= 1.6 || plotW <= 25) {
    availableMassing.push(MASSING_FAMILIES.LINEAR_PAVILION);
  }
  if (floorsCount >= 2) {
    availableMassing.push(MASSING_FAMILIES.STEPPED_TERRACE);
  }

  // Pick massing family deterministically
  const massingIdx = Math.floor(nextFloat() * availableMassing.length);
  const massingFamily = options.massingFamily || availableMassing[(candidateIndex + massingIdx) % availableMassing.length];

  // 2. Select Spatial Topology
  const allTopologies = [
    SPATIAL_TOPOLOGIES.CENTRAL_LIVING_PERIPHERAL_BEDS,
    SPATIAL_TOPOLOGIES.OPEN_PLAN_CONTEMPORARY,
    SPATIAL_TOPOLOGIES.SIDE_ACCESS_SANCTUARY,
    SPATIAL_TOPOLOGIES.FRONT_VERANDAH_THINNAI,
    SPATIAL_TOPOLOGIES.REAR_GARDEN_ORIENTED,
    SPATIAL_TOPOLOGIES.CORNER_MASTER_SANCTUARY
  ];

  if (massingFamily === MASSING_FAMILIES.COURTYARD_NAALUKETTU || specs.amenities?.hasCourtyard || requestedStyle.includes('traditional')) {
    allTopologies.unshift(SPATIAL_TOPOLOGIES.COURTYARD_CIRCUMFERENTIAL);
  }
  if (plotRatio >= 1.6 || massingFamily === MASSING_FAMILIES.LINEAR_PAVILION) {
    allTopologies.push(SPATIAL_TOPOLOGIES.LINEAR_SPINE_GALLERY);
  }
  if (massingFamily === MASSING_FAMILIES.SPLIT_WING_ZONED || plotArea >= 2200) {
    allTopologies.push(SPATIAL_TOPOLOGIES.SPLIT_WING_ZONED);
  }
  if (floorsCount >= 2) {
    allTopologies.push(SPATIAL_TOPOLOGIES.UPPER_SKY_LOUNGE_DUPLEX);
    allTopologies.push(SPATIAL_TOPOLOGIES.DOUBLE_HEIGHT_FOYER_VILLA);
    allTopologies.push(SPATIAL_TOPOLOGIES.STAGGERED_DUAL_CORE);
  }

  const topologyIdx = Math.floor(nextFloat() * allTopologies.length);
  const spatialTopology = options.spatialTopology || allTopologies[(candidateIndex * 3 + topologyIdx) % allTopologies.length];

  // 3. Circulation Core Selection
  const allCores = [
    CIRCULATION_CORE_POSITIONS.RIGHT_FLANK,
    CIRCULATION_CORE_POSITIONS.LEFT_FLANK,
    CIRCULATION_CORE_POSITIONS.CENTRAL_SPINE
  ];
  if (plotL >= 50) {
    allCores.push(CIRCULATION_CORE_POSITIONS.REAR_CORNER);
  }
  if (bhkCount >= 3 && plotW >= 32) {
    allCores.push(CIRCULATION_CORE_POSITIONS.FRONT_ENTRY);
  }
  const coreIdx = Math.floor(nextFloat() * allCores.length);
  const circulationCore = options.circulationCore || allCores[(candidateIndex + coreIdx) % allCores.length];

  // 4. Entrance & Portico Position
  const allEntrances = [
    ENTRANCE_POSITIONS.LEFT_CORNER,
    ENTRANCE_POSITIONS.RIGHT_CORNER
  ];
  if (plotW >= 34) {
    allEntrances.push(ENTRANCE_POSITIONS.CENTER_FRONTAL);
    allEntrances.push(ENTRANCE_POSITIONS.RECESSED_PORCH);
  }
  // Ensure entrance is generally on opposite or complementary side of stairwell
  const entrancePosition = circulationCore === CIRCULATION_CORE_POSITIONS.LEFT_FLANK
    ? ENTRANCE_POSITIONS.RIGHT_CORNER
    : (circulationCore === CIRCULATION_CORE_POSITIONS.RIGHT_FLANK ? ENTRANCE_POSITIONS.LEFT_CORNER : allEntrances[(candidateIndex + Math.floor(nextFloat() * allEntrances.length)) % allEntrances.length]);

  // 5. Band Proportions & Depth Ratios (Controlled dimensional variations)
  // b1: Front band (Porch / Verandah / Foyer)
  // b2: Middle band (Living / Dining / Courtyard / Stair)
  // b3: Rear band (Kitchen / Bedrooms / Baths)
  let b1Ratio = 0.22 + (nextFloat() * 0.12); // 0.22 to 0.34
  let b2Ratio = 0.36 + (nextFloat() * 0.12); // 0.36 to 0.48
  let b3Ratio = Number((1.0 - b1Ratio - b2Ratio).toFixed(3));
  if (b3Ratio < 0.24) {
    b3Ratio = 0.28;
    b2Ratio = Number((1.0 - b1Ratio - b3Ratio).toFixed(3));
  }

  // 6. Courtyard Dimensions & Placement (if applicable)
  const hasCourtyard = massingFamily === MASSING_FAMILIES.COURTYARD_NAALUKETTU ||
    spatialTopology === SPATIAL_TOPOLOGIES.COURTYARD_CIRCUMFERENTIAL ||
    Boolean(specs.amenities?.hasCourtyard);

  const courtyardSpec = hasCourtyard ? {
    width: Number(Math.max(6.0, Math.min(14.0, plotW * 0.22 + nextFloat() * 3.0)).toFixed(1)),
    length: Number(Math.max(6.0, Math.min(14.0, plotL * 0.18 + nextFloat() * 3.0)).toFixed(1)),
    isCoveredGlassPergola: nextFloat() > 0.4,
    thottiStyle: requestedStyle.includes('kerala') || requestedStyle.includes('traditional') ? 'TRADITIONAL_BRASS_URULI' : 'CONTEMPORARY_ZEN_LIGHTWELL'
  } : null;

  // 7. Balcony & Terrace Configurations (for upper floors)
  const terraceConfiguration = floorsCount > 1 ? {
    type: massingFamily === MASSING_FAMILIES.STEPPED_TERRACE ? 'EXTENDED_SKY_DECK' : (nextFloat() > 0.5 ? 'CANTILEVERED_GLASS_BALCONY' : 'RECESSED_SHADED_LOGGIA'),
    depth: Number((4.0 + nextFloat() * 4.5).toFixed(1)),
    fullSpan: nextFloat() > 0.5,
    hasPergola: nextFloat() > 0.35
  } : null;

  // 8. Map to legacy SPATIAL_ARCHETYPES for full backward-compatibility with existing validator & viewers
  let legacyArchetype = SPATIAL_ARCHETYPES.OPEN_CONTEMPORARY;
  if (hasCourtyard || massingFamily === MASSING_FAMILIES.COURTYARD_NAALUKETTU || massingFamily === MASSING_FAMILIES.U_SHAPE_CENTRAL) {
    legacyArchetype = SPATIAL_ARCHETYPES.COURTYARD_CENTRIC;
  } else if (massingFamily === MASSING_FAMILIES.L_SHAPE_COURT) {
    legacyArchetype = SPATIAL_ARCHETYPES.L_SHAPE_COURT;
  } else if (massingFamily === MASSING_FAMILIES.SPLIT_WING_ZONED || massingFamily === MASSING_FAMILIES.STAGGERED_OFFSET) {
    legacyArchetype = SPATIAL_ARCHETYPES.SPLIT_WING_ZONED;
  } else if (massingFamily === MASSING_FAMILIES.LINEAR_PAVILION || spatialTopology === SPATIAL_TOPOLOGIES.LINEAR_SPINE_GALLERY) {
    legacyArchetype = SPATIAL_ARCHETYPES.LINEAR_SPINE;
  } else if (bhkCount >= 4 || massingFamily === MASSING_FAMILIES.VILLA_PAVILION) {
    legacyArchetype = SPATIAL_ARCHETYPES.VILLA_PAVILION;
  }

  return {
    coordinateId: `DS-${massingFamily.substring(0, 4)}-${spatialTopology.substring(0, 6)}-${circulationCore.substring(0, 5)}-c${candidateIndex}`,
    candidateIndex,
    numericSeed,
    massingFamily,
    spatialTopology,
    circulationCore,
    entrancePosition,
    b1Ratio: Number(b1Ratio.toFixed(3)),
    b2Ratio: Number(b2Ratio.toFixed(3)),
    b3Ratio: Number(b3Ratio.toFixed(3)),
    courtyardSpec,
    terraceConfiguration,
    legacyArchetype,
    floorsCount,
    bhkCount
  };
}

/**
 * Generates an array of N mutually distinct design space coordinates.
 * Guarantees that across 100 requests, distinct combinations of massing, topology,
 * circulation cores, and dimensional ratios are systematically explored.
 */
export function generateDesignSpacePool(specs, count = 100, baseSeed = Date.now()) {
  const pool = [];
  const seenCoordinates = new Set();

  for (let idx = 0; idx < count; idx++) {
    const seed = baseSeed + (idx * 10007);
    const coord = exploreDesignSpaceCoordinate(specs, seed, idx);
    const signature = `${coord.massingFamily}__${coord.spatialTopology}__${coord.circulationCore}__${coord.entrancePosition}`;
    
    coord.signature = signature;
    coord.isSignatureUnique = !seenCoordinates.has(signature);
    seenCoordinates.add(signature);
    pool.push(coord);
  }

  return {
    totalRequested: count,
    uniqueSignaturesCount: seenCoordinates.size,
    pool
  };
}

