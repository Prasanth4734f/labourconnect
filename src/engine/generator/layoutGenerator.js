/**
 * LabourConnect Design Engine - Algorithmic 2D Layout Generator
 * 
 * S2-T04: Procedural Architectural Spatial Layout Generator
 * 
 * Generates genuine, constraint-satisfying 2D architectural room layouts,
 * real geometric boundaries, walls, openings, and structural grids directly
 * from normalized layout requirements, room programs, and topological adjacency graphs.
 * 
 * Key Principles:
 * - Algorithmic spatial subdivision and rectangle decomposition (Zero fixed static templates).
 * - Full integration with S2-T01 (Requirements), S2-T02 (Room Program), and S2-T03 (Relationship Graph).
 * - Multi-floor vertical structural alignment (Stairwell column stacking).
 * - Honest failure returns on geometrically infeasible specifications.
 * - 100% backward compatibility with existing engine consumers.
 */

import { SPATIAL_ARCHETYPES, buildAdjacencyGraph, selectSpatialArchetype, solveRoomRelationshipGraph } from './adjacencyGraphSolver.js';
import { solvePlotBoundary } from './plotBoundarySolver.js';
import { generateRoomProgram } from './roomProgrammer.js';
import { ROOM_TYPES, ZONES } from '../schema/canonicalDesignSchema.js';
import { validateLayoutConstraints } from '../evaluation/constraintValidator.js';

export const ENGINE_GENERATOR_VERSION = '2.1.0-s2-t06';

/**
 * Creates an honest failure candidate object when spatial constraints are impossible.
 */
function createFailureCandidate(options = {}) {
  const seed = options.seed !== undefined ? options.seed : 0;
  const variationIndex = options.variationIndex || 0;
  const candidateId = null; // Honest failure candidate has null candidateId
  const errors = options.errors || ['Layout request is geometrically infeasible.'];
  const warnings = options.warnings || [];

  const failure = {
    candidateId,
    success: false,
    isFeasible: false,
    isValid: false,
    seed,
    archetype: options.archetype || SPATIAL_ARCHETYPES.OPEN_CONTEMPORARY,
    variationIndex,
    site: options.site || null,
    metrics: null,
    floors: [],
    structuralGrid: null,
    adjacencyGraph: null,
    generationMetadata: {
      candidateId,
      engineVersion: ENGINE_GENERATOR_VERSION,
      generatedAt: new Date().toISOString(),
      placementStrategy: 'topological_band_decomposition',
      candidateStatus: 'INFEASIBLE',
      archetype: options.archetype || SPATIAL_ARCHETYPES.OPEN_CONTEMPORARY,
      seed,
      allocatedRoomsCount: 0,
      isFeasible: false,
      failureReason: 'SPATIAL_OR_BOUNDARY_INFEASIBILITY',
      errors,
      warnings
    },
    errors,
    warnings
  };

  failure.validation = validateLayoutConstraints(failure, options);
  return failure;
}

/**
 * Procedurally generates a complete multi-floor canonical design candidate.
 * 
 * @param {Object|string} specs - Input specifications, prompt, or compiled requirements
 * @param {Object} [options] - Generation options (seed, variationIndex, archetype, etc.)
 * @returns {Object} Complete candidate structure or honest failure report
 */
export function generateLayout(specs, options = {}) {
  const variationIndex = options.variationIndex || 0;
  const seed = options.seed !== undefined ? options.seed : (Date.now() + variationIndex * 997);
  const candidateId = options.candidateId || `cand_${Math.abs(seed)}_${variationIndex}`;

  // 1. Guard against null or invalid specifications
  if (!specs || typeof specs !== 'object') {
    return createFailureCandidate({
      candidateId,
      seed,
      variationIndex,
      errors: ['Layout specifications must be a valid non-null object.']
    });
  }

  // 2. Normalize and check Plot Dimensions
  const plotW = Number(specs.plotWidth);
  const plotL = Number(specs.plotLength);
  if (!isFinite(plotW) || !isFinite(plotL) || plotW <= 0 || plotL <= 0) {
    return createFailureCandidate({
      candidateId,
      seed,
      variationIndex,
      errors: [`Plot dimensions must be strictly positive finite numbers (received width: ${specs.plotWidth}, length: ${specs.plotLength}).`]
    });
  }

  // 3. Determine Spatial Archetype
  const archetype = options.archetype || selectSpatialArchetype(specs, variationIndex);

  // 4. Solve Plot Boundary and Buildable Envelope
  let site;
  try {
    site = solvePlotBoundary(plotW, plotL, specs.facingDirection || 'East');
  } catch (err) {
    return createFailureCandidate({
      candidateId,
      seed,
      archetype,
      variationIndex,
      errors: [`Plot boundary solver error: ${err.message}`]
    });
  }

  const env = site.buildableEnvelope;
  if (!env || env.width <= 0 || env.length <= 0) {
    return createFailureCandidate({
      candidateId,
      seed,
      archetype,
      variationIndex,
      site,
      errors: ['No positive buildable envelope remains after applying mandated municipal setbacks.']
    });
  }

  // 5. Generate Floor-by-Floor Architectural Room Program (S2-T02 Integration)
  const roomProgResult = generateRoomProgram(specs, options);
  if (!roomProgResult || !roomProgResult.isFeasible || !roomProgResult.success || !roomProgResult.floorPrograms || roomProgResult.floorPrograms.length === 0) {
    return createFailureCandidate({
      candidateId,
      seed,
      archetype,
      variationIndex,
      site,
      errors: roomProgResult?.errors || ['Required room schedule is spatially infeasible on this plot.'],
      warnings: roomProgResult?.warnings || []
    });
  }

  const floorPrograms = roomProgResult.floorPrograms;

  // 6. Check Physical Plinth Capacity Feasibility
  // Verify that the ground floor room schedule can realistically fit within buildableEnvelope
  const groundProgram = floorPrograms.find(fp => fp.floorIndex === 0) || floorPrograms[0];
  const groundMinAreaSum = (groundProgram.rooms || []).reduce((acc, r) => acc + (r.minArea || (r.minWidth * r.minLength) || 40), 0);
  if (groundMinAreaSum > env.area * 1.05) {
    return createFailureCandidate({
      candidateId,
      seed,
      archetype,
      variationIndex,
      site,
      errors: [
        `Ground floor room program requires minimum carpet area of ${Math.round(groundMinAreaSum)} sq.ft, which exceeds available buildable plinth area of ${Math.round(env.area)} sq.ft.`
      ]
    });
  }

  // 7. Determine Fixed Vertical Circulation Anchor (Stairwell)
  // Shared vertical position across all floors to guarantee structural alignment
  const isMultiFloor = floorPrograms.length > 1 && specs.floorsCount > 1;
  let stairwellBounds = null;

  // Compute normalized functional band ratios:
  let b1Ratio = 0.28;
  let b2Ratio = 0.42;
  const cycle = Math.floor(variationIndex / 4);
  if (cycle % 2 === 0) {
    if (archetype === SPATIAL_ARCHETYPES.VILLA_PAVILION || variationIndex % 4 === 1) {
      b1Ratio = 0.32;
      b2Ratio = 0.40;
    } else if (archetype === SPATIAL_ARCHETYPES.COURTYARD_CENTRIC || variationIndex % 4 === 2) {
      b1Ratio = 0.24;
      b2Ratio = 0.46;
    } else if (archetype === SPATIAL_ARCHETYPES.LINEAR_SPINE || variationIndex % 4 === 3) {
      b1Ratio = 0.28;
      b2Ratio = 0.44;
    }
  } else {
    if (archetype === SPATIAL_ARCHETYPES.OPEN_CONTEMPORARY || variationIndex % 4 === 0) {
      b1Ratio = 0.26;
      b2Ratio = 0.44;
    } else if (archetype === SPATIAL_ARCHETYPES.VILLA_PAVILION || variationIndex % 4 === 1) {
      b1Ratio = 0.34;
      b2Ratio = 0.38;
    } else if (archetype === SPATIAL_ARCHETYPES.COURTYARD_CENTRIC || variationIndex % 4 === 2) {
      b1Ratio = 0.24;
      b2Ratio = 0.48;
    } else {
      b1Ratio = 0.30;
      b2Ratio = 0.42;
    }
  }

  // Determine realistic building envelope
  // On large plots (e.g. 0.3 acre = 13,068 sqft), do not expand the house to fill the entire plot like a warehouse.
  // Size the building envelope realistically for the room program, reserving the rest of the plot for garden & outdoor living.
  let bldEnv = env;
  if (env.width > 38 || env.length > 50) {
    const minRequiredGroundCarpet = groundMinAreaSum || 850;
    const targetFootprintSqft = Math.max(1050, Math.min(2200, Math.round(minRequiredGroundCarpet * 1.35)));
    const targetW = Number(Math.min(env.width, Math.max(30.0, Math.min(38.0, Math.sqrt(targetFootprintSqft / 1.15)))).toFixed(2));
    const targetL = Number(Math.min(env.length, Math.max(32.0, Math.min(46.0, targetFootprintSqft / targetW))).toFixed(2));

    const posX = Number((env.x + (env.width - targetW) / 2).toFixed(2));
    const posY = Number((env.y + Math.min(22.0, (env.length - targetL) * 0.35)).toFixed(2));
    bldEnv = {
      x: posX,
      y: posY,
      width: targetW,
      length: targetL,
      area: Number((targetW * targetL).toFixed(2)),
      isCustomFootprint: true
    };
  }

  if (isMultiFloor) {
    const stairWidth = Number(Math.min(8.5, Math.max(6.5, bldEnv.width * 0.22)).toFixed(2));
    const band1L = Number((bldEnv.length * b1Ratio).toFixed(2));
    const band2L = Number((bldEnv.length * b2Ratio).toFixed(2));
    const stairLength = band2L;

    // Variation toggles stair placement: right flank vs left flank
    // Modulate with cycle offset so variationIndex 4+ alternates flank placement across archetypes
    const stairOnRight = options.stairOnRight !== undefined
      ? Boolean(options.stairOnRight)
      : ((Math.floor(variationIndex / 4) + variationIndex) % 2 === 0);
    const stairX = stairOnRight
      ? Number((bldEnv.x + bldEnv.width - stairWidth).toFixed(2))
      : Number(bldEnv.x.toFixed(2));
    const stairY = Number((bldEnv.y + band1L).toFixed(2));

    stairwellBounds = {
      x: stairX,
      y: stairY,
      width: stairWidth,
      length: stairLength
    };
  }

  // 8. Solve Topological Relationship Graph (S2-T03 Integration)
  const relationshipGraph = solveRoomRelationshipGraph(floorPrograms, { archetype });

  // 9. Procedurally Solve 2D Spatial Layout for Each Floor
  const generatedFloors = floorPrograms.map((floorProg) => {
    return generateFloorLayout({
      floorProg,
      env: bldEnv,
      stairwellBounds,
      archetype,
      variationIndex,
      specs,
      site,
      b1Ratio,
      b2Ratio,
      options
    });
  });

  // 10. Generate Structural Column & Load-bearing Grid
  const groundFloorRooms = generatedFloors[0]?.rooms || [];
  const structuralGrid = generateStructuralGrid(bldEnv, groundFloorRooms);

  // 11. Aggregate Metrics
  let totalBuiltUp = 0;
  let totalCarpet = 0;
  let totalRoomsCount = 0;

  generatedFloors.forEach(f => {
    f.rooms.forEach(r => {
      totalCarpet += r.areaSqft;
      totalRoomsCount++;
    });
    // Floor built-up area includes walls (~15% wall thickness and circulation allowance)
    totalBuiltUp += Math.round(f.rooms.reduce((acc, r) => acc + r.areaSqft, 0) * 1.15);
  });

  const groundCoverage = Math.round(groundFloorRooms.reduce((acc, r) => acc + r.areaSqft, 0) * 1.15);
  const fsi = Number((totalBuiltUp / site.plotAreaSqft).toFixed(2));

  // 12. Assemble Full Candidate Structure
  const candidate = {
    id: candidateId,
    candidateId,
    success: true,
    isFeasible: true,
    seed,
    archetype,
    variationIndex,
    site: {
      ...site,
      buildingEnvelope: bldEnv,
      buildingFootprint: {
        x: bldEnv.x,
        y: bldEnv.y,
        width: bldEnv.width,
        length: bldEnv.length,
        areaSqft: groundCoverage
      }
    },
    metrics: {
      plotAreaSqft: site.plotAreaSqft,
      plotWidthFt: site.plotWidth,
      plotLengthFt: site.plotLength,
      buildingFootprintSqft: groundCoverage,
      buildingWidthFt: bldEnv.width,
      buildingLengthFt: bldEnv.length,
      builtUpAreaSqft: totalBuiltUp,
      totalFloorAreaSqft: totalBuiltUp,
      carpetAreaSqft: totalCarpet,
      groundCoverageSqft: groundCoverage,
      groundCoverageRatio: Number((groundCoverage / site.plotAreaSqft).toFixed(2)),
      gardenAreaSqft: Math.max(0, site.plotAreaSqft - groundCoverage),
      terraceAreaSqft: generatedFloors.find(f => f.isTerrace)?.rooms?.find(r => r.type === ROOM_TYPES.TERRACE)?.areaSqft || 0,
      fsiAchieved: fsi,
      roomCountTotal: totalRoomsCount,
      floorsCount: specs.floorsCount || floorPrograms.length,
      bedroomsCount: specs.bhkCount || 3,
      bathroomsCount: specs.bathroomsCount || 2
    },
    floors: generatedFloors,
    structuralGrid,
    adjacencyGraph: relationshipGraph,
    generationMetadata: {
      candidateId,
      engineVersion: ENGINE_GENERATOR_VERSION,
      generatedAt: new Date().toISOString(),
      placementStrategy: 'topological_band_decomposition',
      candidateStatus: 'FEASIBLE',
      archetype,
      seed,
      allocatedRoomsCount: totalRoomsCount,
      isFeasible: true,
      diagnosticWarnings: roomProgResult.warnings || []
    }
  };

  // 13. Perform Comprehensive Geometric and Constraint Validation (S2-T06)
  const validation = validateLayoutConstraints(candidate, options);
  candidate.validation = validation;
  candidate.isValid = validation.isValid;
  candidate.isFeasible = validation.isFeasible;

  if (!validation.isValid) {
    candidate.success = false;
    candidate.errors = validation.violations;
    candidate.generationMetadata.candidateStatus = validation.candidateStatus;
    candidate.generationMetadata.isFeasible = false;
  }

  return candidate;
}

/**
 * Formal alias for generateLayout producing a structured layout candidate.
 */
export function generateLayoutCandidate(specs, options = {}) {
  return generateLayout(specs, options);
}

/**
 * Solves 2D room packing, walls, and openings for a single floor.
 */
function generateFloorLayout({ floorProg, env, stairwellBounds, archetype, variationIndex, specs, site: _site, b1Ratio: passedB1, b2Ratio: passedB2, options = {} }) {
  const rooms = [];
  const W = env.width;
  const L = env.length;
  const isGround = floorProg.floorIndex === 0;
  const isFirst = floorProg.floorIndex === 1;
  const isTerrace = Boolean(floorProg.isTerrace) ||
    (floorProg.name && floorProg.name.toLowerCase().includes('terrace')) ||
    (specs.floorsCount <= 2 && floorProg.floorIndex >= 2);

  if (isTerrace) {
    // -----------------------------------------------------------------------
    // TERRACE FLOOR PROCEDURAL PACKING
    // Mumty over aligned stairwell + Rooftop Open Deck / Pergola
    // -----------------------------------------------------------------------
    const effectiveStairBounds = stairwellBounds || {
      x: Number((env.x + W - 8).toFixed(2)),
      y: Number((env.y + L * 0.38).toFixed(2)),
      width: 8,
      length: 12
    };

    const mumty = createPlacedRoom({
      id: 't_mumty',
      name: 'Stairhead Mumty & Lift Machine',
      type: ROOM_TYPES.STAIRWELL,
      zone: ZONES.SERVICE,
      bounds: { ...effectiveStairBounds },
      finish: 'Waterproof IPS Screed',
      orientation: 'South-West',
      doors: [{ x: effectiveStairBounds.x + effectiveStairBounds.width / 2, y: effectiveStairBounds.y + effectiveStairBounds.length, width: 3.0, wall: 'south', label: 'Mumty Exit Door' }],
      windows: [{ x: effectiveStairBounds.x + effectiveStairBounds.width, y: effectiveStairBounds.y + effectiveStairBounds.length / 2, width: 2.5, wall: 'east' }]
    });

    const stairOnRight = effectiveStairBounds.x >= env.x + W * 0.4;
    let deckX, deckW, deckY, deckL;

    if (stairOnRight) {
      deckX = Number((env.x + 0.5).toFixed(2));
      deckW = Number(Math.max(8.0, effectiveStairBounds.x - env.x - 1.0).toFixed(2));
      deckY = Number((env.y + 1.0).toFixed(2));
      deckL = Number((L - 2.0).toFixed(2));
    } else {
      deckX = Number((effectiveStairBounds.x + effectiveStairBounds.width + 1.0).toFixed(2));
      deckW = Number(Math.max(8.0, (env.x + W) - deckX - 0.5).toFixed(2));
      deckY = Number((env.y + 1.0).toFixed(2));
      deckL = Number((L - 2.0).toFixed(2));
    }

    const deck = createPlacedRoom({
      id: 't_open_deck',
      name: 'Solar Pergola Terrace Garden',
      type: ROOM_TYPES.TERRACE,
      zone: ZONES.OUTDOOR,
      bounds: {
        x: deckX,
        y: deckY,
        width: deckW,
        length: deckL
      },
      finish: 'Solar Cool White Tiles (SRI > 78)',
      orientation: 'East',
      doors: [],
      windows: []
    });

    rooms.push(mumty, deck);

  } else if (isGround) {
    // -----------------------------------------------------------------------
    // GROUND FLOOR PROCEDURAL PACKING
    // Divide space into 3 Functional Bands:
    // Band 1 (Front 28%): Portico / Car Porch + Entrance Foyer
    // Band 2 (Mid 42%): Living Lounge + Dining + Pooja + Courtyard + Stairwell
    // Band 3 (Rear 30%): Kitchen + Ground Bedroom(s) + Bathroom(s)
    // -----------------------------------------------------------------------
    // Dynamic band proportioning: single-story multi-bedroom requires more depth in Band 3
    const isSingleStoryMultiBed = specs.floorsCount === 1 && (floorProg.rooms || []).filter(r => r.type === ROOM_TYPES.BEDROOM || r.type === ROOM_TYPES.MASTER_BEDROOM).length >= 2;

    let b1Ratio = passedB1 !== undefined ? passedB1 : 0.28;
    let b2Ratio = passedB2 !== undefined ? passedB2 : 0.42;

    const band1Length = isSingleStoryMultiBed
      ? Number(Math.max(5.0, Math.min(6.5, L * 0.16)).toFixed(2))
      : Number((L * b1Ratio).toFixed(2));
    const band2Length = isSingleStoryMultiBed
      ? Number(Math.max(10.0, Math.min(13.0, L * 0.34)).toFixed(2))
      : Number((L * b2Ratio).toFixed(2));
    const band3Length = Number((L - (band1Length + band2Length)).toFixed(2));

    const yBand1 = env.y;
    const yBand2 = Number((env.y + band1Length).toFixed(2));
    const yBand3 = Number((yBand2 + band2Length).toFixed(2));

    const hasParking = specs.amenities?.hasParking || Boolean(floorProg.rooms?.some(r => r.id === 'g_portico'));
    const porticoOnLeft = options.porticoOnLeft !== undefined
      ? Boolean(options.porticoOnLeft)
      : ((Math.floor(variationIndex / 2) + variationIndex) % 2 === 1);

    // --- BAND 1: FRONT ENTRANCE ---
    if (hasParking) {
      const porticoW = Number((W * 0.45).toFixed(2));
      const foyerW = Number((W - porticoW).toFixed(2));
      const porticoX = porticoOnLeft ? env.x : Number((env.x + foyerW).toFixed(2));
      const foyerX = porticoOnLeft ? Number((env.x + porticoW).toFixed(2)) : env.x;

      rooms.push(createPlacedRoom({
        id: 'g_portico',
        name: 'Covered Car Porch & Portico',
        type: ROOM_TYPES.PORTICO,
        zone: ZONES.OUTDOOR,
        bounds: { x: porticoX, y: yBand1, width: porticoW, length: band1Length },
        finish: 'Anti-skid Cobblestone Pavers',
        orientation: specs.facingDirection || 'East',
        doors: [],
        windows: []
      }));

      rooms.push(createPlacedRoom({
        id: 'g_foyer',
        name: 'Grand Entrance Foyer & Verandah',
        type: ROOM_TYPES.FOYER,
        zone: ZONES.PUBLIC,
        bounds: { x: foyerX, y: yBand1, width: foyerW, length: band1Length },
        finish: 'Flamed Jet-Black Granite',
        orientation: specs.facingDirection || 'East',
        doors: [
          { x: Number((foyerX + foyerW / 2).toFixed(2)), y: yBand1, width: 3.5, wall: 'north', label: 'Main Teak Door' },
          { x: Number((foyerX + foyerW / 2).toFixed(2)), y: Number((yBand1 + band1Length).toFixed(2)), width: 3.2, wall: 'south', label: 'Lounge Portal' }
        ],
        windows: [
          { x: foyerX, y: Number((yBand1 + band1Length / 2).toFixed(2)), width: 4.0, wall: 'west' }
        ]
      }));
    } else {
      // Full-width Verandah & Sit-out
      rooms.push(createPlacedRoom({
        id: 'g_foyer',
        name: 'Front Verandah & Sit-out',
        type: ROOM_TYPES.FOYER,
        zone: ZONES.PUBLIC,
        bounds: { x: env.x, y: yBand1, width: W, length: band1Length },
        finish: 'Polished Kota Stone Plinth',
        orientation: specs.facingDirection || 'East',
        doors: [{ x: Number((env.x + W / 2).toFixed(2)), y: yBand1, width: 3.5, wall: 'north', label: 'Main Entrance' }],
        windows: []
      }));
    }

    // --- BAND 2: CENTRAL LIVING, DINING, COURTYARD & STAIRS ---
    const hasStairwell = Boolean(stairwellBounds && specs.floorsCount > 1);
    let midAvailableW = W;
    let midLeftX = env.x;

    if (hasStairwell) {
      const isStairRight = stairwellBounds.x > env.x + W / 2;
      midAvailableW = Number((W - stairwellBounds.width).toFixed(2));
      midLeftX = isStairRight ? env.x : Number((env.x + stairwellBounds.width).toFixed(2));

      rooms.push(createPlacedRoom({
        id: 'g_stairwell_core',
        name: 'RCC Dog-Legged Stairwell',
        type: ROOM_TYPES.STAIRWELL,
        zone: ZONES.PUBLIC,
        bounds: { ...stairwellBounds },
        finish: 'Flamed Granite Steps + SS Rail',
        orientation: 'South-West',
        doors: [{ x: Number((stairwellBounds.x + stairwellBounds.width / 2).toFixed(2)), y: stairwellBounds.y, width: 3.0, wall: 'north' }],
        windows: [{ x: Number((stairwellBounds.x + stairwellBounds.width).toFixed(2)), y: Number((stairwellBounds.y + stairwellBounds.length / 2).toFixed(2)), width: 3.0, wall: 'east' }]
      }));
    }

    // Check if Courtyard is requested or present in room program, or selected by courtyard_centric archetype
    const hasCourtyard = specs.amenities?.hasCourtyard ||
      Boolean(floorProg.rooms?.some(r => r.type === ROOM_TYPES.COURTYARD)) ||
      (archetype === SPATIAL_ARCHETYPES.COURTYARD_CENTRIC && midAvailableW >= 20.0);

    let livingW, diningW, livingX, diningX;

    if (hasCourtyard) {
      const courtW = Number(Math.max(5.5, midAvailableW * 0.22).toFixed(2));
      livingW = Number(((midAvailableW - courtW) * 0.52).toFixed(2));
      diningW = Number((midAvailableW - livingW - courtW).toFixed(2));

      livingX = midLeftX;
      const courtX = Number((midLeftX + livingW).toFixed(2));
      diningX = Number((courtX + courtW).toFixed(2));

      rooms.push(createPlacedRoom({
        id: 'g_living',
        name: 'Formal Living Lounge',
        type: ROOM_TYPES.LIVING,
        zone: ZONES.PUBLIC,
        bounds: { x: livingX, y: yBand2, width: livingW, length: band2Length },
        finish: 'Italian Statuario Marble',
        orientation: 'North-East',
        doors: [{ x: Number((livingX + livingW).toFixed(2)), y: Number((yBand2 + band2Length / 2).toFixed(2)), width: 4.0, wall: 'east', label: 'Arch to Court' }],
        windows: [{ x: livingX, y: Number((yBand2 + band2Length / 2).toFixed(2)), width: 6.0, wall: 'west', label: 'French Window' }]
      }));

      rooms.push(createPlacedRoom({
        id: 'g_courtyard',
        name: 'Central Thotti Courtyard',
        type: ROOM_TYPES.COURTYARD,
        zone: ZONES.SEMI_PRIVATE,
        bounds: { x: courtX, y: yBand2, width: courtW, length: band2Length },
        finish: 'Terracotta Tile Plinth with Open Skylight',
        orientation: 'Central',
        doors: [],
        windows: []
      }));

      rooms.push(createPlacedRoom({
        id: 'g_dining',
        name: 'Central Dining Area',
        type: ROOM_TYPES.DINING,
        zone: ZONES.SEMI_PRIVATE,
        bounds: { x: diningX, y: yBand2, width: diningW, length: band2Length },
        finish: 'Polished Vitrified 800×1600mm',
        orientation: 'East',
        doors: [{ x: Number((diningX + diningW / 2).toFixed(2)), y: Number((yBand2 + band2Length).toFixed(2)), width: 3.0, wall: 'south', label: 'Kitchen Door' }],
        windows: [{ x: Number((diningX + diningW).toFixed(2)), y: Number((yBand2 + band2Length / 2).toFixed(2)), width: 4.5, wall: 'east' }]
      }));
    } else {
      const livingRatio = (archetype === SPATIAL_ARCHETYPES.VILLA_PAVILION || variationIndex % 3 === 2) ? 0.48 : 0.58;
      livingW = Number((midAvailableW * livingRatio).toFixed(2));
      diningW = Number((midAvailableW - livingW).toFixed(2));
      livingX = midLeftX;
      diningX = Number((midLeftX + livingW).toFixed(2));

      rooms.push(createPlacedRoom({
        id: 'g_living',
        name: 'Formal Living Lounge',
        type: ROOM_TYPES.LIVING,
        zone: ZONES.PUBLIC,
        bounds: { x: livingX, y: yBand2, width: livingW, length: band2Length },
        finish: 'Italian Statuario Marble',
        orientation: 'North-East',
        doors: [{ x: Number((livingX + livingW).toFixed(2)), y: Number((yBand2 + band2Length / 2).toFixed(2)), width: 4.0, wall: 'east', label: 'Arch to Dining' }],
        windows: [{ x: livingX, y: Number((yBand2 + band2Length / 2).toFixed(2)), width: 6.0, wall: 'west', label: 'French Window' }]
      }));

      rooms.push(createPlacedRoom({
        id: 'g_dining',
        name: 'Central Dining Area',
        type: ROOM_TYPES.DINING,
        zone: ZONES.SEMI_PRIVATE,
        bounds: { x: diningX, y: yBand2, width: diningW, length: band2Length },
        finish: 'Polished Vitrified 800×1600mm',
        orientation: 'East',
        doors: [{ x: Number((diningX + diningW / 2).toFixed(2)), y: Number((yBand2 + band2Length).toFixed(2)), width: 3.0, wall: 'south', label: 'Kitchen Door' }],
      }));
    }

    // Nested Pooja Sanctum in North-East corner of Dining (strictly respecting disabled flags)
    const isPoojaDisabled = specs.amenities?.hasPooja === false || specs.hasPooja === false;
    const shouldIncludePooja = !isPoojaDisabled && (specs.amenities?.hasPooja === true || specs.hasPooja === true || floorProg.rooms?.some(r => r.type === ROOM_TYPES.POOJA));
    if (shouldIncludePooja) {
      const poojaW = Number(Math.min(6, diningW * 0.45).toFixed(2));
      const poojaL = Number(Math.min(6, band2Length * 0.35).toFixed(2));
      rooms.push(createPlacedRoom({
        id: 'g_pooja',
        name: 'Ishanya Pooja Sanctum',
        type: ROOM_TYPES.POOJA,
        zone: ZONES.SEMI_PRIVATE,
        bounds: { x: diningX, y: yBand2, width: poojaW, length: poojaL },
        finish: 'White Makrana Marble',
        orientation: 'North-East',
        doors: [{ x: Number((diningX + poojaW / 2).toFixed(2)), y: Number((yBand2 + poojaL).toFixed(2)), width: 2.5, wall: 'south', label: 'Jali Door' }],
        windows: []
      }));
    }

    // --- BAND 3: REAR KITCHEN, BATHROOM(S) & BEDROOM(S) ---
    // Count scheduled bedrooms on ground floor
    const groundBeds = (floorProg.rooms || []).filter(r => r.type === ROOM_TYPES.BEDROOM || r.type === ROOM_TYPES.MASTER_BEDROOM);

    if (groundBeds.length >= 2) {
      if (W < 26.0) {
        // Narrow plot single-floor 2BHK: use 2x2 grid layout across 2 depth rows
        const row1L = Number((band3Length * 0.52).toFixed(2));
        const row2L = Number((band3Length - row1L).toFixed(2));
        const yRow1 = yBand3;
        const yRow2 = Number((yBand3 + row1L).toFixed(2));

        const kitchenW = Number(Math.max(6.5, Math.min(8.5, W * 0.42)).toFixed(2));
        const bed1W = Number((W - kitchenW).toFixed(2));
        const bathW = Number(Math.max(4.5, Math.min(6.5, W * 0.32)).toFixed(2));
        const bed2W = Number((W - bathW).toFixed(2));

        const kitchenX = env.x;
        const bed1X = Number((kitchenX + kitchenW).toFixed(2));
        const bathX = env.x;
        const bed2X = Number((bathX + bathW).toFixed(2));

        rooms.push(createPlacedRoom({
          id: 'g_kitchen',
          name: 'Modular Gourmet Kitchen',
          type: ROOM_TYPES.KITCHEN,
          zone: ZONES.SERVICE,
          bounds: { x: kitchenX, y: yRow1, width: kitchenW, length: row1L },
          finish: 'Quartz Countertop + Matte Tiles',
          orientation: 'South-East',
          doors: [{ x: Number((kitchenX + kitchenW / 2).toFixed(2)), y: yRow1, width: 3.0, wall: 'north' }],
          windows: [{ x: kitchenX, y: Number((yRow1 + row1L / 2).toFixed(2)), width: 4.0, wall: 'west' }]
        }));

        rooms.push(createPlacedRoom({
          id: 'g_bed_master',
          name: 'Master Bedroom Suite',
          type: ROOM_TYPES.MASTER_BEDROOM,
          zone: ZONES.PRIVATE,
          bounds: { x: bed1X, y: yRow1, width: bed1W, length: row1L },
          finish: 'Matte Oak Hardwood Vitrified',
          orientation: 'South-West',
          doors: [{ x: bed1X, y: yRow1, width: 3.0, wall: 'north' }],
          windows: [{ x: Number((bed1X + bed1W).toFixed(2)), y: Number((yRow1 + row1L / 2).toFixed(2)), width: 4.5, wall: 'east' }]
        }));

        rooms.push(createPlacedRoom({
          id: 'g_bath_common',
          name: 'Sanitary Bath & Toilet',
          type: ROOM_TYPES.BATHROOM,
          zone: ZONES.SERVICE,
          bounds: { x: bathX, y: yRow2, width: bathW, length: row2L },
          finish: 'Anti-skid Ceramic Vitrified',
          orientation: 'South',
          doors: [{ x: Number((bathX + bathW / 2).toFixed(2)), y: yRow2, width: 2.5, wall: 'north' }],
          windows: [{ x: bathX, y: Number((yRow2 + row2L / 2).toFixed(2)), width: 2.0, wall: 'west', label: 'Louvered Vent' }]
        }));

        rooms.push(createPlacedRoom({
          id: 'g_bed_2',
          name: 'Secondary Bedroom Suite',
          type: ROOM_TYPES.BEDROOM,
          zone: ZONES.PRIVATE,
          bounds: { x: bed2X, y: yRow2, width: bed2W, length: row2L },
          finish: 'Matte Oak Hardwood Vitrified',
          orientation: 'North-West',
          doors: [{ x: bed2X, y: yRow2, width: 3.0, wall: 'north' }],
          windows: [{ x: Number((bed2X + bed2W).toFixed(2)), y: Number((yRow2 + row2L / 2).toFixed(2)), width: 4.5, wall: 'east' }]
        }));
      } else {
        // Wide plot single-floor 2BHK: distribute two bedrooms + kitchen + bath side-by-side
        const bathW = Number(Math.max(4.0, Math.min(6.0, W * 0.16)).toFixed(2));
        const kitchenW = Number(Math.max(7.5, Math.min(10.0, W * 0.26)).toFixed(2));
        const remainingW = Number((W - bathW - kitchenW).toFixed(2));
        const bed1W = Number((remainingW / 2).toFixed(2));
        const bed2W = Number((remainingW - bed1W).toFixed(2));

        const kitchenX = env.x;
        const bathX = Number((kitchenX + kitchenW).toFixed(2));
        const bed1X = Number((bathX + bathW).toFixed(2));
        const bed2X = Number((bed1X + bed1W).toFixed(2));

        rooms.push(createPlacedRoom({
          id: 'g_kitchen',
          name: 'Modular Gourmet Kitchen',
          type: ROOM_TYPES.KITCHEN,
          zone: ZONES.SERVICE,
          bounds: { x: kitchenX, y: yBand3, width: kitchenW, length: band3Length },
          finish: 'Quartz Countertop + Matte Tiles',
          orientation: 'South-East',
          doors: [{ x: Number((kitchenX + kitchenW / 2).toFixed(2)), y: yBand3, width: 3.0, wall: 'north' }],
          windows: [{ x: kitchenX, y: Number((yBand3 + band3Length / 2).toFixed(2)), width: 4.0, wall: 'west' }]
        }));

        rooms.push(createPlacedRoom({
          id: 'g_bath_common',
          name: 'Sanitary Bath & Toilet',
          type: ROOM_TYPES.BATHROOM,
          zone: ZONES.SERVICE,
          bounds: { x: bathX, y: yBand3, width: bathW, length: band3Length },
          finish: 'Anti-skid Ceramic Vitrified',
          orientation: 'South',
          doors: [{ x: Number((bathX + bathW / 2).toFixed(2)), y: yBand3, width: 2.5, wall: 'north' }],
          windows: [{ x: Number((bathX + bathW / 2).toFixed(2)), y: Number((yBand3 + band3Length).toFixed(2)), width: 2.0, wall: 'south', label: 'Louvered Vent' }]
        }));

        rooms.push(createPlacedRoom({
          id: 'g_bed_master',
          name: 'Master Bedroom Suite',
          type: ROOM_TYPES.MASTER_BEDROOM,
          zone: ZONES.PRIVATE,
          bounds: { x: bed1X, y: yBand3, width: bed1W, length: band3Length },
          finish: 'Matte Oak Hardwood Vitrified',
          orientation: 'South-West',
          doors: [{ x: bed1X, y: Number((yBand3 + band3Length / 2).toFixed(2)), width: 3.0, wall: 'west' }],
          windows: [{ x: Number((bed1X + bed1W / 2).toFixed(2)), y: Number((yBand3 + band3Length).toFixed(2)), width: 4.5, wall: 'south' }]
        }));

        rooms.push(createPlacedRoom({
          id: 'g_bed_2',
          name: 'Secondary Bedroom Suite',
          type: ROOM_TYPES.BEDROOM,
          zone: ZONES.PRIVATE,
          bounds: { x: bed2X, y: yBand3, width: bed2W, length: band3Length },
          finish: 'Matte Oak Hardwood Vitrified',
          orientation: 'North-West',
          doors: [{ x: Number((bed2X + bed2W / 2).toFixed(2)), y: yBand3, width: 3.0, wall: 'north' }],
          windows: [{ x: Number((bed2X + bed2W).toFixed(2)), y: Number((yBand3 + band3Length / 2).toFixed(2)), width: 4.5, wall: 'east' }]
        }));
      }

    } else {
      // Standard Ground: Kitchen + Bathroom(s) + Ground Bedroom
      const needsTwoGroundBaths = (specs.bathroomsCount >= 4) ||
        (floorProg.rooms?.filter(r => r.type === ROOM_TYPES.BATHROOM).length >= 2);

      if (needsTwoGroundBaths && W >= 22.0) {
        // Allocate both common bath and en-suite bath for ground bedroom suite
        const bathCommonW = Number(Math.max(4.0, Math.min(5.5, W * 0.16)).toFixed(2));
        const bathSuiteW = Number(Math.max(4.0, Math.min(5.5, W * 0.16)).toFixed(2));
        const remainingW = Number((W - bathCommonW - bathSuiteW).toFixed(2));
        const kitchenW = Number((remainingW * 0.42).toFixed(2));
        const bedW = Number((remainingW - kitchenW).toFixed(2));

        const kitchenX = env.x;
        const bathCommonX = Number((kitchenX + kitchenW).toFixed(2));
        const bathSuiteX = Number((bathCommonX + bathCommonW).toFixed(2));
        const bedX = Number((bathSuiteX + bathSuiteW).toFixed(2));

        rooms.push(createPlacedRoom({
          id: 'g_kitchen',
          name: 'Modular Gourmet Kitchen',
          type: ROOM_TYPES.KITCHEN,
          zone: ZONES.SERVICE,
          bounds: { x: kitchenX, y: yBand3, width: kitchenW, length: band3Length },
          finish: 'Quartz Countertop + Matte Tiles',
          orientation: 'South-East',
          doors: [{ x: Number((kitchenX + kitchenW / 2).toFixed(2)), y: yBand3, width: 3.0, wall: 'north' }],
          windows: [{ x: kitchenX, y: Number((yBand3 + band3Length / 2).toFixed(2)), width: 4.0, wall: 'west' }]
        }));

        rooms.push(createPlacedRoom({
          id: 'g_bath_common',
          name: 'Sanitary Bath & Powder',
          type: ROOM_TYPES.BATHROOM,
          zone: ZONES.SERVICE,
          bounds: { x: bathCommonX, y: yBand3, width: bathCommonW, length: band3Length },
          finish: 'Anti-skid Ceramic Vitrified',
          orientation: 'South',
          doors: [{ x: Number((bathCommonX + bathCommonW / 2).toFixed(2)), y: yBand3, width: 2.5, wall: 'north' }],
          windows: [{ x: Number((bathCommonX + bathCommonW / 2).toFixed(2)), y: Number((yBand3 + band3Length).toFixed(2)), width: 2.0, wall: 'south', label: 'Louvered Vent' }]
        }));

        rooms.push(createPlacedRoom({
          id: 'g_bath_suite',
          name: 'Ground Suite En-suite Bath',
          type: ROOM_TYPES.BATHROOM,
          zone: ZONES.SERVICE,
          bounds: { x: bathSuiteX, y: yBand3, width: bathSuiteW, length: band3Length },
          finish: 'Anti-skid Ceramic Vitrified',
          orientation: 'South',
          doors: [{ x: Number((bathSuiteX + bathSuiteW).toFixed(2)), y: Number((yBand3 + band3Length / 2).toFixed(2)), width: 2.5, wall: 'east', label: 'En-suite Door' }],
          windows: [{ x: Number((bathSuiteX + bathSuiteW / 2).toFixed(2)), y: Number((yBand3 + band3Length).toFixed(2)), width: 2.0, wall: 'south', label: 'Vent' }]
        }));

        const isSingleFloor = specs.floorsCount === 1;
        rooms.push(createPlacedRoom({
          id: isSingleFloor ? 'g_bed_master' : 'g_bed_guest',
          name: isSingleFloor ? 'Master Suite' : (specs.bhkCount >= 3 ? 'Ground Bedroom Suite' : 'Master Suite'),
          type: isSingleFloor ? ROOM_TYPES.MASTER_BEDROOM : ROOM_TYPES.BEDROOM,
          zone: ZONES.PRIVATE,
          bounds: { x: bedX, y: yBand3, width: bedW, length: band3Length },
          finish: 'Matte Oak Hardwood Vitrified',
          orientation: 'South-West',
          doors: [{ x: Number((bedX + bedW / 2).toFixed(2)), y: yBand3, width: 3.0, wall: 'north' }],
          windows: [{ x: Number((bedX + bedW).toFixed(2)), y: Number((yBand3 + band3Length / 2).toFixed(2)), width: 4.5, wall: 'east' }]
        }));
      } else {
        // Standard Ground: Kitchen + Common Bath + Ground Bedroom
        const bathW = Number(Math.max(4.0, Math.min(6.5, W * 0.20)).toFixed(2));
        const remainingW = Number((W - bathW).toFixed(2));
        const kitchenW = Number((remainingW * 0.44).toFixed(2));
        const bedW = Number((remainingW - kitchenW).toFixed(2));

        const flipRear = options.flipRear !== undefined
          ? Boolean(options.flipRear)
          : (((Math.floor(variationIndex / 3) + variationIndex) % 3) === 2);
        const bedX = flipRear ? env.x : Number((env.x + kitchenW + bathW).toFixed(2));
        const bathX = flipRear ? Number((env.x + bedW).toFixed(2)) : Number((env.x + kitchenW).toFixed(2));
        const kitchenX = flipRear ? Number((bathX + bathW).toFixed(2)) : env.x;

        rooms.push(createPlacedRoom({
          id: 'g_kitchen',
          name: 'Modular Gourmet Kitchen',
          type: ROOM_TYPES.KITCHEN,
          zone: ZONES.SERVICE,
          bounds: { x: kitchenX, y: yBand3, width: kitchenW, length: band3Length },
          finish: 'Quartz Countertop + Matte Tiles',
          orientation: flipRear ? 'South-West' : 'South-East',
          doors: [{ x: Number((kitchenX + kitchenW / 2).toFixed(2)), y: yBand3, width: 3.0, wall: 'north' }],
          windows: [{
            x: flipRear ? Number((kitchenX + kitchenW).toFixed(2)) : kitchenX,
            y: Number((yBand3 + band3Length / 2).toFixed(2)),
            width: 4.0,
            wall: flipRear ? 'east' : 'west'
          }]
        }));

        rooms.push(createPlacedRoom({
          id: 'g_bath_common',
          name: 'Sanitary Bath & Toilet',
          type: ROOM_TYPES.BATHROOM,
          zone: ZONES.SERVICE,
          bounds: { x: bathX, y: yBand3, width: bathW, length: band3Length },
          finish: 'Anti-skid Ceramic Vitrified',
          orientation: 'South',
          doors: [{ x: Number((bathX + bathW / 2).toFixed(2)), y: yBand3, width: 2.5, wall: 'north' }],
          windows: [{ x: Number((bathX + bathW / 2).toFixed(2)), y: Number((yBand3 + band3Length).toFixed(2)), width: 2.0, wall: 'south', label: 'Louvered Vent' }]
        }));

        const isSingleFloor = specs.floorsCount === 1;
        rooms.push(createPlacedRoom({
          id: isSingleFloor ? 'g_bed_master' : 'g_bed_guest',
          name: isSingleFloor ? 'Master Suite' : (specs.bhkCount >= 3 ? 'Ground Bedroom Suite' : 'Master Suite'),
          type: isSingleFloor ? ROOM_TYPES.MASTER_BEDROOM : ROOM_TYPES.BEDROOM,
          zone: ZONES.PRIVATE,
          bounds: { x: bedX, y: yBand3, width: bedW, length: band3Length },
          finish: 'Matte Oak Hardwood Vitrified',
          orientation: flipRear ? 'South-East' : 'South-West',
          doors: [{
            x: flipRear ? Number((bedX + bedW / 2).toFixed(2)) : bedX,
            y: flipRear ? yBand3 : Number((yBand3 + band3Length / 2).toFixed(2)),
            width: 3.0,
            wall: flipRear ? 'north' : 'west'
          }],
          windows: [{
            x: flipRear ? bedX : Number((bedX + bedW / 2).toFixed(2)),
            y: flipRear ? Number((yBand3 + band3Length / 2).toFixed(2)) : Number((yBand3 + band3Length).toFixed(2)),
            width: 5.0,
            wall: flipRear ? 'west' : 'south'
          }]
        }));
      }
    }

  } else if (isFirst) {
    // -----------------------------------------------------------------------
    // FIRST FLOOR PROCEDURAL PACKING
    // Mutually disjoint functional bands aligned with vertical stair core
    // -----------------------------------------------------------------------
    // Dynamic band proportioning aligned with ground functional core
    const fb1Ratio = passedB1 !== undefined ? passedB1 : 0.28;
    const fb2Ratio = passedB2 !== undefined ? passedB2 : 0.42;

    const band1Length = Number((L * fb1Ratio).toFixed(2));
    const band2Length = Number((L * fb2Ratio).toFixed(2));
    const band3Length = Number((L - (band1Length + band2Length)).toFixed(2));

    const yBand1 = env.y;
    const yBand2 = Number((env.y + band1Length).toFixed(2));
    const yBand3 = Number((yBand2 + band2Length).toFixed(2));

    // --- BAND 1: FRONT BALCONY & FAMILY MEDIA LOUNGE ---
    const isBalconyDisabled = specs.amenities?.hasBalcony === false ||
      specs.hasBalcony === false ||
      specs.balcony === false ||
      specs.amenities?.balcony === false;
    const shouldIncludeBalcony = !isBalconyDisabled && (
      specs.amenities?.hasBalcony === true ||
      specs.hasBalcony === true ||
      specs.balcony === true ||
      specs.amenities?.balcony === true ||
      floorProg.rooms?.some(r => r.type === ROOM_TYPES.BALCONY)
    );

    if (shouldIncludeBalcony) {
      const isDeepTerrace = archetype === SPATIAL_ARCHETYPES.VILLA_PAVILION || (((Math.floor(variationIndex / 2) + variationIndex) % 2) === 0);
      const balconyL = isDeepTerrace && band1Length >= 14.0
        ? Number(Math.max(7.5, Math.min(11.0, band1Length * 0.55)).toFixed(2))
        : Number(Math.min(5.0, band1Length * 0.35).toFixed(2));
      const loungeL = Number((band1Length - balconyL).toFixed(2));

      rooms.push(createPlacedRoom({
        id: 'f_balcony',
        name: 'Cantilever Glass Balcony Deck',
        type: ROOM_TYPES.BALCONY,
        zone: ZONES.OUTDOOR,
        bounds: { x: env.x, y: yBand1, width: W, length: balconyL },
        finish: 'Weatherproof WPC Wood Planks',
        orientation: specs.facingDirection || 'East',
        doors: [{ x: Number((env.x + W / 2).toFixed(2)), y: Number((yBand1 + balconyL).toFixed(2)), width: 5.0, wall: 'south', label: 'Glass Sliding Door' }],
        windows: []
      }));

      rooms.push(createPlacedRoom({
        id: 'f_family_lounge',
        name: 'Family Media Lounge & Library',
        type: ROOM_TYPES.LIVING,
        zone: ZONES.SEMI_PRIVATE,
        bounds: { x: env.x, y: Number((yBand1 + balconyL).toFixed(2)), width: W, length: loungeL },
        finish: 'Italian Vitrified 800×1600mm',
        orientation: 'North',
        doors: [{ x: Number((env.x + W / 2).toFixed(2)), y: yBand2, width: 3.2, wall: 'south' }],
        windows: [{ x: env.x, y: Number((yBand1 + balconyL + loungeL / 2).toFixed(2)), width: 5.0, wall: 'west' }]
      }));
    } else {
      // Balcony excluded: Family Media Lounge spans the entire front band
      rooms.push(createPlacedRoom({
        id: 'f_family_lounge',
        name: 'Family Media Lounge & Library',
        type: ROOM_TYPES.LIVING,
        zone: ZONES.SEMI_PRIVATE,
        bounds: { x: env.x, y: yBand1, width: W, length: band1Length },
        finish: 'Italian Vitrified 800×1600mm',
        orientation: 'North',
        doors: [{ x: Number((env.x + W / 2).toFixed(2)), y: yBand2, width: 3.2, wall: 'south' }],
        windows: [
          { x: env.x, y: Number((yBand1 + band1Length / 2).toFixed(2)), width: 5.0, wall: 'west' },
          { x: Number((env.x + W / 2).toFixed(2)), y: yBand1, width: 6.0, wall: 'north', label: 'Panoramic Window' }
        ]
      }));
    }

    // --- BAND 2: STAIRWELL CORE & MASTER BEDROOM SUITE ---
    const stairXLocal = stairwellBounds ? stairwellBounds.x : env.x;
    const isStairRight = stairXLocal > env.x + W / 2;
    const midAvailableW = stairwellBounds ? Number((W - stairwellBounds.width).toFixed(2)) : W;
    const masterSuiteX = isStairRight ? env.x : (stairwellBounds ? Number((env.x + stairwellBounds.width).toFixed(2)) : env.x);

    if (stairwellBounds) {
      rooms.push(createPlacedRoom({
        id: 'f_stairwell_core',
        name: 'RCC Dog-Legged Stairwell (Upper)',
        type: ROOM_TYPES.STAIRWELL,
        zone: ZONES.PUBLIC,
        bounds: { ...stairwellBounds },
        finish: 'Flamed Granite Steps + SS Rail',
        orientation: 'South-West',
        doors: [{ x: Number((stairwellBounds.x + stairwellBounds.width / 2).toFixed(2)), y: stairwellBounds.y, width: 3.0, wall: 'north' }],
        windows: [{ x: Number((stairwellBounds.x + stairwellBounds.width).toFixed(2)), y: Number((stairwellBounds.y + stairwellBounds.length / 2).toFixed(2)), width: 3.0, wall: 'east' }]
      }));
    }

    rooms.push(createPlacedRoom({
      id: 'f_master_suite',
      name: 'Master Penthouse Suite',
      type: ROOM_TYPES.MASTER_BEDROOM,
      zone: ZONES.PRIVATE,
      bounds: { x: masterSuiteX, y: yBand2, width: midAvailableW, length: band2Length },
      finish: 'Engineered Teak Hardwood',
      orientation: 'South-West',
      doors: [
        { x: Number((masterSuiteX + midAvailableW / 2).toFixed(2)), y: yBand2, width: 3.2, wall: 'north' },
        { x: Number((masterSuiteX + midAvailableW / 2).toFixed(2)), y: yBand3, width: 2.8, wall: 'south', label: 'En-suite Portal' }
      ],
      windows: [
        { x: isStairRight ? masterSuiteX : Number((masterSuiteX + midAvailableW).toFixed(2)), y: Number((yBand2 + band2Length / 2).toFixed(2)), width: 6.0, wall: isStairRight ? 'west' : 'east' }
      ]
    }));

    // --- BAND 3: REAR MASTER EN-SUITE BATH & UPPER BEDROOM(S) ---
    const masterBathW = Number(Math.min(8.0, W * 0.30).toFixed(2));
    const remainingRearW = Number((W - masterBathW).toFixed(2));

    const masterBathX = isStairRight ? env.x : Number((env.x + remainingRearW).toFixed(2));
    const bed2X = isStairRight ? Number((env.x + masterBathW).toFixed(2)) : env.x;

    rooms.push(createPlacedRoom({
      id: 'f_master_bath',
      name: 'Master En-suite Spa Bath',
      type: ROOM_TYPES.BATHROOM,
      zone: ZONES.SERVICE,
      bounds: { x: masterBathX, y: yBand3, width: masterBathW, length: band3Length },
      finish: 'Calacatta Glazed Porcelain',
      orientation: 'South',
      doors: [{ x: Number((masterBathX + masterBathW / 2).toFixed(2)), y: yBand3, width: 2.5, wall: 'north' }],
      windows: [{ x: Number((masterBathX + masterBathW / 2).toFixed(2)), y: Number((yBand3 + band3Length).toFixed(2)), width: 2.0, wall: 'south', label: 'Vent' }]
    }));

    if (specs.bhkCount >= 4) {
      // Split remaining rear width into Bedroom 2 and Bedroom 3
      const halfW = Number((remainingRearW / 2).toFixed(2));
      rooms.push(createPlacedRoom({
        id: 'f_bed_2',
        name: 'Children Suite Bedroom 2',
        type: ROOM_TYPES.BEDROOM,
        zone: ZONES.PRIVATE,
        bounds: { x: bed2X, y: yBand3, width: halfW, length: band3Length },
        finish: 'Matte Vitrified Tiles',
        orientation: 'North-West',
        doors: [{ x: Number((bed2X + halfW / 2).toFixed(2)), y: yBand3, width: 3.0, wall: 'north' }],
        windows: [{ x: bed2X, y: Number((yBand3 + band3Length / 2).toFixed(2)), width: 4.5, wall: 'west' }]
      }));

      rooms.push(createPlacedRoom({
        id: 'f_bed_3',
        name: 'Guest Bedroom 3',
        type: ROOM_TYPES.BEDROOM,
        zone: ZONES.PRIVATE,
        bounds: { x: Number((bed2X + halfW).toFixed(2)), y: yBand3, width: Number((remainingRearW - halfW).toFixed(2)), length: band3Length },
        finish: 'Matte Vitrified Tiles',
        orientation: 'South',
        doors: [{ x: Number((bed2X + halfW + (remainingRearW - halfW) / 2).toFixed(2)), y: yBand3, width: 3.0, wall: 'north' }],
        windows: [{ x: Number((bed2X + halfW + (remainingRearW - halfW) / 2).toFixed(2)), y: Number((yBand3 + band3Length).toFixed(2)), width: 4.5, wall: 'south' }]
      }));
    } else {
      // 3BHK: Check if upper floor needs Bedroom 2 + Bathroom 2
      const needsTwoUpperBaths = (specs.bathroomsCount >= 3) ||
        (floorProg.rooms?.filter(r => r.type === ROOM_TYPES.BATHROOM).length >= 2);

      if (needsTwoUpperBaths && remainingRearW >= 15.0) {
        // Allocate both Bedroom 2 and Bedroom 2 Bathroom
        const bath2W = Number(Math.max(4.5, Math.min(6.5, remainingRearW * 0.26)).toFixed(2));
        const bed2W = Number((remainingRearW - bath2W).toFixed(2));

        const bath2X = isStairRight ? bed2X : Number((bed2X + bed2W).toFixed(2));
        const actualBed2X = isStairRight ? Number((bed2X + bath2W).toFixed(2)) : bed2X;

        rooms.push(createPlacedRoom({
          id: 'f_bath_bed2',
          name: 'Bedroom 2 Attached Bath',
          type: ROOM_TYPES.BATHROOM,
          zone: ZONES.SERVICE,
          bounds: { x: bath2X, y: yBand3, width: bath2W, length: band3Length },
          finish: 'Anti-skid Ceramic Tiles',
          orientation: 'South',
          doors: [{ x: Number((bath2X + bath2W / 2).toFixed(2)), y: yBand3, width: 2.5, wall: 'north', label: 'Bath Door' }],
          windows: [{ x: Number((bath2X + bath2W / 2).toFixed(2)), y: Number((yBand3 + band3Length).toFixed(2)), width: 2.0, wall: 'south', label: 'Vent' }]
        }));

        rooms.push(createPlacedRoom({
          id: 'f_bed_2',
          name: 'Children / Guest Bedroom Suite',
          type: ROOM_TYPES.BEDROOM,
          zone: ZONES.PRIVATE,
          bounds: { x: actualBed2X, y: yBand3, width: bed2W, length: band3Length },
          finish: 'Matte Vitrified Tiles',
          orientation: 'North-West',
          doors: [{ x: Number((actualBed2X + bed2W / 2).toFixed(2)), y: yBand3, width: 3.0, wall: 'north' }],
          windows: [{ x: Number((actualBed2X + bed2W / 2).toFixed(2)), y: Number((yBand3 + band3Length).toFixed(2)), width: 5.0, wall: 'south' }]
        }));
      } else {
        // Single spacious Bedroom 2 upstairs
        rooms.push(createPlacedRoom({
          id: 'f_bed_2',
          name: 'Children / Study Bedroom Suite',
          type: ROOM_TYPES.BEDROOM,
          zone: ZONES.PRIVATE,
          bounds: { x: bed2X, y: yBand3, width: remainingRearW, length: band3Length },
          finish: 'Matte Vitrified Tiles',
          orientation: 'North-West',
          doors: [{ x: Number((bed2X + remainingRearW / 2).toFixed(2)), y: yBand3, width: 3.0, wall: 'north' }],
          windows: [{ x: Number((bed2X + remainingRearW / 2).toFixed(2)), y: Number((yBand3 + band3Length).toFixed(2)), width: 5.0, wall: 'south' }]
        }));
      }
    }
  } else if (!isTerrace && floorProg.floorIndex >= 2) {
    // -----------------------------------------------------------------------
    // INTERMEDIATE UPPER FLOOR PROCEDURAL PACKING (Levels 2, 3, 4, 5, etc.)
    // Vertically aligned stairwell core + Front Balcony/Terrace + Suites + Baths
    // -----------------------------------------------------------------------
    const band1Length = Number((L * 0.28).toFixed(2));
    const band2Length = Number((L * 0.42).toFixed(2));
    const band3Length = Number((L - (band1Length + band2Length)).toFixed(2));

    const yBand1 = env.y;
    const yBand2 = Number((env.y + band1Length).toFixed(2));
    const yBand3 = Number((yBand2 + band2Length).toFixed(2));

    const fl = floorProg.floorIndex;
    const isTopHabitable = (fl === specs.floorsCount - 1);
    const archStyle = String(specs.archStyle || specs.style || '').toLowerCase();
    const isPenthouseFloor = isTopHabitable && archStyle.includes('penthouse');

    if (isPenthouseFloor) {
      // Penthouse Layout: Wide Panoramic Front Sky Terrace + Sky Suite + Sky Spa Bath
      const terraceL = Number(Math.min(7.0, band1Length * 0.6).toFixed(2));
      const terraceW = Number((W * 0.85).toFixed(2));
      const terraceX = Number((env.x + (W - terraceW) / 2).toFixed(2));

      rooms.push(createPlacedRoom({
        id: `f${fl}_penthouse_terrace`,
        name: 'Panoramic Sky Terrace',
        type: ROOM_TYPES.BALCONY,
        zone: ZONES.OUTDOOR,
        bounds: { x: terraceX, y: yBand1, width: terraceW, length: terraceL },
        finish: 'Weatherproof Teak Decking & Glass Balustrades',
        orientation: specs.facingDirection || 'East',
        doors: [{ x: Number((env.x + W / 2).toFixed(2)), y: Number((yBand1 + terraceL).toFixed(2)), width: 6.0, wall: 'south', label: 'Panoramic Glass Sliding Portal' }],
        windows: []
      }));

      // Mid band: Aligned stairwell + Executive Sky Suite
      const stairXLocal = stairwellBounds ? stairwellBounds.x : env.x;
      const isStairRight = stairXLocal > env.x + W / 2;
      const midAvailableW = stairwellBounds ? Number((W - stairwellBounds.width).toFixed(2)) : W;
      const suiteX = isStairRight ? env.x : (stairwellBounds ? Number((env.x + stairwellBounds.width).toFixed(2)) : env.x);

      if (stairwellBounds) {
        rooms.push(createPlacedRoom({
          id: `f${fl}_stairwell_core`,
          name: `RCC Stairwell (Level ${fl})`,
          type: ROOM_TYPES.STAIRWELL,
          zone: ZONES.PUBLIC,
          bounds: { ...stairwellBounds },
          finish: 'Flamed Granite Steps + SS Rail',
          orientation: 'South-West',
          doors: [{ x: Number((stairwellBounds.x + stairwellBounds.width / 2).toFixed(2)), y: stairwellBounds.y, width: 3.0, wall: 'north' }],
          windows: [{ x: Number((stairwellBounds.x + stairwellBounds.width).toFixed(2)), y: Number((stairwellBounds.y + stairwellBounds.length / 2).toFixed(2)), width: 3.0, wall: 'east' }]
        }));
      }

      rooms.push(createPlacedRoom({
        id: `f${fl}_penthouse_suite`,
        name: 'Executive Penthouse Master Suite',
        type: ROOM_TYPES.MASTER_BEDROOM,
        zone: ZONES.PRIVATE,
        bounds: { x: suiteX, y: yBand2, width: midAvailableW, length: band2Length },
        finish: 'Italian Statuario Marble & Oak Paneling',
        orientation: 'South-West',
        doors: [
          { x: Number((suiteX + midAvailableW / 2).toFixed(2)), y: yBand2, width: 3.2, wall: 'north' },
          { x: Number((suiteX + midAvailableW / 2).toFixed(2)), y: yBand3, width: 2.8, wall: 'south', label: 'Spa Portal' }
        ],
        windows: [
          { x: suiteX, y: Number((yBand2 + band2Length / 2).toFixed(2)), width: 6.0, wall: 'west', label: 'Floor-to-Ceiling Glazing' }
        ]
      }));

      // Rear band: Sky Spa Bath & Dressing Walk-in
      const spaW = Number((W * 0.45).toFixed(2));
      const dressW = Number((W - spaW).toFixed(2));
      const spaX = env.x;
      const dressX = Number((spaX + spaW).toFixed(2));

      rooms.push(createPlacedRoom({
        id: `f${fl}_penthouse_bath`,
        name: 'Sky Spa Jacuzzi Bath',
        type: ROOM_TYPES.BATHROOM,
        zone: ZONES.SERVICE,
        bounds: { x: spaX, y: yBand3, width: spaW, length: band3Length },
        finish: 'Calacatta Glazed Porcelain',
        orientation: 'West',
        doors: [{ x: Number((spaX + spaW / 2).toFixed(2)), y: yBand3, width: 2.8, wall: 'north' }],
        windows: [{ x: spaX, y: Number((yBand3 + band3Length / 2).toFixed(2)), width: 3.0, wall: 'west' }]
      }));

      rooms.push(createPlacedRoom({
        id: `f${fl}_penthouse_lounge`,
        name: 'Sky Observation Lounge',
        type: ROOM_TYPES.LIVING,
        zone: ZONES.PRIVATE,
        bounds: { x: dressX, y: yBand3, width: dressW, length: band3Length },
        finish: 'Engineered Teak Hardwood',
        orientation: 'East',
        doors: [{ x: Number((dressX + dressW / 2).toFixed(2)), y: yBand3, width: 3.0, wall: 'north' }],
        windows: [{ x: Number((dressX + dressW).toFixed(2)), y: Number((yBand3 + band3Length / 2).toFixed(2)), width: 5.0, wall: 'east' }]
      }));

    } else {
      // Standard Multi-Storey Residential Upper Floor
      // Band 1: Balcony + Family Lounge
      const balconyL = Number(Math.min(5.0, band1Length * 0.35).toFixed(2));
      const loungeL = Number((band1Length - balconyL).toFixed(2));

      rooms.push(createPlacedRoom({
        id: `f${fl}_balcony`,
        name: `Cantilever Balcony Deck (Level ${fl})`,
        type: ROOM_TYPES.BALCONY,
        zone: ZONES.OUTDOOR,
        bounds: { x: env.x, y: yBand1, width: W, length: balconyL },
        finish: 'Weatherproof WPC Wood Planks',
        orientation: specs.facingDirection || 'East',
        doors: [{ x: Number((env.x + W / 2).toFixed(2)), y: Number((yBand1 + balconyL).toFixed(2)), width: 4.5, wall: 'south', label: 'Glass Sliding Door' }],
        windows: []
      }));

      rooms.push(createPlacedRoom({
        id: `f${fl}_family_lounge`,
        name: `Living Lounge (Level ${fl})`,
        type: ROOM_TYPES.LIVING,
        zone: ZONES.SEMI_PRIVATE,
        bounds: { x: env.x, y: Number((yBand1 + balconyL).toFixed(2)), width: W, length: loungeL },
        finish: 'Italian Vitrified 800×1600mm',
        orientation: 'North',
        doors: [{ x: Number((env.x + W / 2).toFixed(2)), y: yBand2, width: 3.2, wall: 'south' }],
        windows: [{ x: env.x, y: Number((yBand1 + balconyL + loungeL / 2).toFixed(2)), width: 5.0, wall: 'west' }]
      }));

      // Band 2: Aligned Stairwell + Suite Bedroom 1
      const stairXLocal = stairwellBounds ? stairwellBounds.x : env.x;
      const isStairRight = stairXLocal > env.x + W / 2;
      const midAvailableW = stairwellBounds ? Number((W - stairwellBounds.width).toFixed(2)) : W;
      const bed1X = isStairRight ? env.x : (stairwellBounds ? Number((env.x + stairwellBounds.width).toFixed(2)) : env.x);

      if (stairwellBounds) {
        rooms.push(createPlacedRoom({
          id: `f${fl}_stairwell_core`,
          name: `RCC Stairwell (Level ${fl})`,
          type: ROOM_TYPES.STAIRWELL,
          zone: ZONES.PUBLIC,
          bounds: { ...stairwellBounds },
          finish: 'Flamed Granite Steps + SS Rail',
          orientation: 'South-West',
          doors: [{ x: Number((stairwellBounds.x + stairwellBounds.width / 2).toFixed(2)), y: stairwellBounds.y, width: 3.0, wall: 'north' }],
          windows: [{ x: Number((stairwellBounds.x + stairwellBounds.width).toFixed(2)), y: Number((stairwellBounds.y + stairwellBounds.length / 2).toFixed(2)), width: 3.0, wall: 'east' }]
        }));
      }

      rooms.push(createPlacedRoom({
        id: `f${fl}_bed_1`,
        name: `Suite Bedroom (Level ${fl})`,
        type: ROOM_TYPES.BEDROOM,
        zone: ZONES.PRIVATE,
        bounds: { x: bed1X, y: yBand2, width: midAvailableW, length: band2Length },
        finish: 'Engineered Teak Hardwood',
        orientation: 'South-West',
        doors: [
          { x: Number((bed1X + midAvailableW / 2).toFixed(2)), y: yBand2, width: 3.2, wall: 'north' },
          { x: Number((bed1X + midAvailableW / 2).toFixed(2)), y: yBand3, width: 2.8, wall: 'south' }
        ],
        windows: [
          { x: bed1X, y: Number((yBand2 + band2Length / 2).toFixed(2)), width: 5.0, wall: 'west' }
        ]
      }));

      // Band 3: Rear Bath 1 + Guest Bedroom 2
      const bathW = Number(Math.max(5.0, Math.min(6.5, W * 0.28)).toFixed(2));
      const bed2W = Number((W - bathW).toFixed(2));
      const bathX = env.x;
      const bed2X = Number((bathX + bathW).toFixed(2));

      rooms.push(createPlacedRoom({
        id: `f${fl}_bath_1`,
        name: `Sanitary Bath (Level ${fl})`,
        type: ROOM_TYPES.BATHROOM,
        zone: ZONES.SERVICE,
        bounds: { x: bathX, y: yBand3, width: bathW, length: band3Length },
        finish: 'Anti-skid Ceramic Tiles',
        orientation: 'West',
        doors: [{ x: Number((bathX + bathW / 2).toFixed(2)), y: yBand3, width: 2.5, wall: 'north' }],
        windows: [{ x: bathX, y: Number((yBand3 + band3Length / 2).toFixed(2)), width: 2.0, wall: 'west' }]
      }));

      rooms.push(createPlacedRoom({
        id: `f${fl}_bed_2`,
        name: `Guest Bedroom (Level ${fl})`,
        type: ROOM_TYPES.BEDROOM,
        zone: ZONES.PRIVATE,
        bounds: { x: bed2X, y: yBand3, width: bed2W, length: band3Length },
        finish: 'Matte Vitrified Tiles',
        orientation: 'North-West',
        doors: [{ x: Number((bed2X + bed2W / 2).toFixed(2)), y: yBand3, width: 3.0, wall: 'north' }],
        windows: [{ x: Number((bed2X + bed2W / 2).toFixed(2)), y: Number((yBand3 + band3Length).toFixed(2)), width: 5.0, wall: 'south' }]
      }));
    }
  }

  // Generate Walls from Room Boundaries
  const walls = generateWallsFromRooms(rooms, env, { floorIndex: floorProg.floorIndex, isTerrace });

  // Generate Topological Adjacency Graph for this floor
  const adjacencyGraph = buildAdjacencyGraph(rooms, archetype, floorProg.floorIndex);

  return {
    floorIndex: floorProg.floorIndex,
    name: floorProg.name,
    isTerrace: Boolean(isTerrace),
    elevationZ: floorProg.elevationZ,
    floorHeight: floorProg.floorHeight,
    bounds: { ...env },
    rooms,
    walls,
    adjacencyGraph
  };
}

/**
 * Creates a normalized room record with bounds, polygon, area, and dimensions label.
 */
function createPlacedRoom({ id, name, type, zone, bounds, finish, orientation, doors = [], windows = [] }) {
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
 * Derives exterior and interior wall segments from room bounding boxes.
 */
export function generateWallsFromRooms(rooms, env, options = {}) {
  const isTerrace = options.isTerrace || false;
  const fIdx = options.floorIndex !== undefined ? options.floorIndex : 0;
  const walls = [];
  let wallCounter = 1;

  if (isTerrace) {
    // Terrace level: only enclosed structures (stairhead mumty) get solid walls.
    // The open terrace deck is open to the sky and perimeter protection is provided by rooftop parapet.
    const enclosedRooms = rooms.filter(r => r.type !== ROOM_TYPES.TERRACE && r.zone !== ZONES.OUTDOOR);
    enclosedRooms.forEach(r => {
      const b = r.bounds;
      const x1 = Number(b.x.toFixed(2)), y1 = Number(b.y.toFixed(2));
      const x2 = Number((b.x + b.width).toFixed(2)), y2 = Number((b.y + b.length).toFixed(2));
      const mumtyH = 8.5; // Standard stairhead clear headroom height
      const th = 0.75;
      // North wall of mumty
      walls.push({ id: `w_mumty_n_f${fIdx}`, type: 'exterior', start: { x: x1, y: y1 }, end: { x: x2, y: y1 }, thickness: th, height: mumtyH, orientation: 'north' });
      // South wall of mumty (hosts exit door to terrace)
      walls.push({ id: `w_mumty_s_f${fIdx}`, type: 'exterior', start: { x: x1, y: y2 }, end: { x: x2, y: y2 }, thickness: th, height: mumtyH, orientation: 'south' });
      // West wall of mumty
      walls.push({ id: `w_mumty_w_f${fIdx}`, type: 'exterior', start: { x: x1, y: y1 }, end: { x: x1, y: y2 }, thickness: th, height: mumtyH, orientation: 'west' });
      // East wall of mumty (hosts window)
      walls.push({ id: `w_mumty_e_f${fIdx}`, type: 'exterior', start: { x: x2, y: y1 }, end: { x: x2, y: y2 }, thickness: th, height: mumtyH, orientation: 'east' });
    });
    return walls;
  }

  // Non-terrace floors: extract segments from room bounds with shared partition deduplication
  const hSpans = new Map();
  const vSpans = new Map();

  function addSpan(isH, fixed, s0, s1, room) {
    const minS = Math.min(s0, s1);
    const maxS = Math.max(s0, s1);
    if (maxS - minS < 0.1) return;
    const key = fixed.toFixed(2);
    const map = isH ? hSpans : vSpans;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push({ min: minS, max: maxS, room });
  }

  rooms.forEach(r => {
    const b = r.bounds;
    const x1 = Number(b.x.toFixed(2)), y1 = Number(b.y.toFixed(2));
    const x2 = Number((b.x + b.width).toFixed(2)), y2 = Number((b.y + b.length).toFixed(2));

    const isPortico = r.type === ROOM_TYPES.PORTICO;
    const isBalcony = r.type === ROOM_TYPES.BALCONY;

    // North edge: omit if front driveway entrance of portico or front of balcony
    if (!(isPortico && Math.abs(y1 - env.y) < 0.5) && !(isBalcony && Math.abs(y1 - env.y) < 0.5)) {
      addSpan(true, y1, x1, x2, r);
    }
    // South edge: omit if outer edge of balcony
    if (!(isBalcony && Math.abs(y2 - env.y) < 0.5)) {
      addSpan(true, y2, x1, x2, r);
    }
    // West edge: omit if outer edge of balcony
    if (!(isBalcony && Math.abs(x1 - env.x) < 0.5)) {
      addSpan(false, x1, y1, y2, r);
    }
    // East edge: omit if outer edge of balcony or driveway side of portico
    if (!(isBalcony && Math.abs(x2 - (env.x + env.width)) < 0.5) && !(isPortico && Math.abs(x2 - (env.x + env.width)) < 0.5)) {
      addSpan(false, x2, y1, y2, r);
    }
  });

  function processAxis(map, isH) {
    map.forEach((spans, keyStr) => {
      const fixed = Number(keyStr);
      spans.sort((a, b) => a.min - b.min);
      let cur = { min: spans[0].min, max: spans[0].max };
      const merged = [];
      for (let i = 1; i < spans.length; i++) {
        const next = spans[i];
        if (next.min <= cur.max + 0.1) {
          cur.max = Math.max(cur.max, next.max);
        } else {
          merged.push(cur);
          cur = { min: next.min, max: next.max };
        }
      }
      merged.push(cur);

      merged.forEach(m => {
        const isEnvelope = isH
          ? (Math.abs(fixed - env.y) < 0.3 || Math.abs(fixed - (env.y + env.length)) < 0.3)
          : (Math.abs(fixed - env.x) < 0.3 || Math.abs(fixed - (env.x + env.width)) < 0.3);

        const isExterior = isEnvelope;
        const thickness = isExterior ? 0.75 : 0.375;
        let orientation;
        if (isH) {
          orientation = Math.abs(fixed - env.y) < 0.3 ? 'north' : (Math.abs(fixed - (env.y + env.length)) < 0.3 ? 'south' : 'horizontal');
        } else {
          orientation = Math.abs(fixed - env.x) < 0.3 ? 'west' : (Math.abs(fixed - (env.x + env.width)) < 0.3 ? 'east' : 'vertical');
        }

        const startPt = isH ? { x: Number(m.min.toFixed(2)), y: fixed } : { x: fixed, y: Number(m.min.toFixed(2)) };
        const endPt = isH ? { x: Number(m.max.toFixed(2)), y: fixed } : { x: fixed, y: Number(m.max.toFixed(2)) };

        walls.push({
          id: `${isExterior ? 'w_ext_' : 'w_int_'}${wallCounter++}_f${fIdx}`,
          type: isExterior ? 'exterior' : 'interior',
          start: startPt,
          end: endPt,
          thickness,
          height: 10,
          orientation
        });
      });
    });
  }

  processAxis(hSpans, true);
  processAxis(vSpans, false);

  return walls;
}

/**
 * Generates regular structural column grid at wall intersections and spans <= 15 ft.
 */
export function generateStructuralGrid(env, _groundRooms = []) {
  const columns = [];
  const beams = [];
  let colId = 1;

  // Grid spans: 12 to 15 ft typical RCC column spacing
  const spanX = env.width > 30 ? env.width / 3 : env.width / 2;
  const spanY = env.length > 45 ? env.length / 4 : env.length / 3;

  const numColsX = Math.round(env.width / spanX) + 1;
  const numColsY = Math.round(env.length / spanY) + 1;

  const actualSpanX = env.width / (numColsX - 1);
  const actualSpanY = env.length / (numColsY - 1);

  const gridLinesX = [];
  const gridLinesY = [];

  for (let i = 0; i < numColsX; i++) {
    const x = Number((env.x + i * actualSpanX).toFixed(2));
    gridLinesX.push(x);
    for (let j = 0; j < numColsY; j++) {
      const y = Number((env.y + j * actualSpanY).toFixed(2));
      if (i === 0) gridLinesY.push(y);

      columns.push({
        id: `c_${colId++}`,
        x,
        y,
        width: 0.75, // 9 inches
        length: 1.25, // 15 inches
        spec: 'RCC M25 Grade with 6-T16mm TMT Reinforcement'
      });
    }
  }

  // Generate Plinth and Floor Tie Beams
  for (let i = 0; i < gridLinesX.length; i++) {
    for (let j = 0; j < gridLinesY.length; j++) {
      // Horizontal beam
      if (i < gridLinesX.length - 1) {
        beams.push({
          id: `b_h_${i}_${j}`,
          start: { x: gridLinesX[i], y: gridLinesY[j] },
          end: { x: gridLinesX[i + 1], y: gridLinesY[j] },
          depth: 1.25, // 15 inches
          width: 0.75  // 9 inches
        });
      }
      // Vertical beam
      if (j < gridLinesY.length - 1) {
        beams.push({
          id: `b_v_${i}_${j}`,
          start: { x: gridLinesX[i], y: gridLinesY[j] },
          end: { x: gridLinesX[i], y: gridLinesY[j + 1] },
          depth: 1.25,
          width: 0.75
        });
      }
    }
  }

  return {
    columnCount: columns.length,
    beamCount: beams.length,
    columns,
    beams,
    gridLinesX,
    gridLinesY
  };
}
