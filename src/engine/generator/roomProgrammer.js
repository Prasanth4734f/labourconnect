/**
 * LabourConnect Design Engine - Architectural Room Programmer
 * 
 * S2-T02: Converts structured requirements into a formal, floor-by-floor Room Program.
 * 
 * Each room record contains:
 * - Stable room ID
 * - Canonical Room type and Zone
 * - Floor assignment and elevation
 * - Minimum, preferred, and maximum dimensions and areas
 * - Target aspect ratio (L/W)
 * - Explicit Hard Constraints vs Soft Preferences
 * - Access and circulation requirements
 * - Requirement provenance (EXPLICIT, INFERRED, DEFAULT)
 * - Validation status and physical feasibility checks
 */

import { ROOM_TYPES, ZONES } from '../schema/canonicalDesignSchema.js';
import { compileLayoutRequirements, ARCHITECTURAL_SPACE_STANDARDS, CIRCULATION_WALL_FACTOR } from '../interpreter/layoutRequirementsContract.js';
import { REQUIREMENT_SOURCE } from '../interpreter/structuredRequirementParser.js';

/**
 * Access relationship types for circulation planning
 */
export const ACCESS_REQUIREMENTS = {
  EXTERIOR_STREET: 'EXTERIOR_STREET',       // Direct approach from site entry (Portico, Verandah)
  PUBLIC_CIRCULATION: 'PUBLIC_CIRCULATION', // Accessible from main foyer or formal circulation
  CENTRAL_CORE: 'CENTRAL_CORE',             // Accessible from central family dining/living hall
  PRIVATE_CORRIDOR: 'PRIVATE_CORRIDOR',     // Accessible from private bedroom lobby
  ENSUITE_ONLY: 'ENSUITE_ONLY',             // Direct private access only from within a bedroom
  VERTICAL_CORE: 'VERTICAL_CORE',           // Connected to stairwell / lift core
  ROOFTOP_ACCESS: 'ROOFTOP_ACCESS'          // Accessible from terrace mumty landing
};

/**
 * Generates a validated, structured room program per floor from requirements.
 * 
 * @param {Object|string} input - Raw prompt string, parsed requirements, or legacy specs object
 * @param {Object} [options] - Compiler and programmer options
 * @returns {Object} Structured room program with feasibility status and floor allocations
 */
export function generateRoomProgram(input, options = {}) {
  // 1. Compile or Normalize Layout Requirements
  let requirements;
  let compiledReport = null;

  if (input && input.requirements && input.requirements.site && input.requirements.rooms) {
    // Already compiled layout requirements contract
    requirements = input.requirements;
    compiledReport = input;
  } else {
    // Compile from raw prompt or legacy specs object
    compiledReport = compileLayoutRequirements(input, options);
    if (!compiledReport.requirements || (compiledReport.missingInformation && compiledReport.missingInformation.length > 0)) {
      return {
        success: false,
        isFeasible: false,
        floorPrograms: [],
        errors: compiledReport.errors || ['Layout requirements compilation failed.'],
        warnings: compiledReport.warnings || [],
        summary: null
      };
    }
    requirements = compiledReport.requirements;
  }

  const { site, building, rooms: roomSpecs, features = {} } = requirements;
  const floorsCount = building.floorsCount || 1;
  const bhkCount = building.bhkCount || 
    (roomSpecs ? roomSpecs.filter(r => r.type === ROOM_TYPES.BEDROOM || r.type === ROOM_TYPES.MASTER_BEDROOM).reduce((sum, r) => sum + (r.count || 1), 0) : (building.bhk || 3)) || 3;
  const facingDirection = site.facingDirection || 'East';
  
  const explicitPooja = features.pooja !== undefined 
    ? features.pooja 
    : (building.amenities?.hasPooja !== undefined 
      ? building.amenities.hasPooja 
      : building.hasPooja);

  const explicitParking = features.parking !== undefined
    ? features.parking
    : (building.amenities?.hasParking !== undefined
      ? building.amenities.hasParking
      : building.hasParking);

  const explicitBalcony = features.balcony !== undefined
    ? features.balcony
    : (building.amenities?.hasBalcony !== undefined
      ? building.amenities.hasBalcony
      : building.hasBalcony);

  const amenities = {
    hasParking: explicitParking !== undefined ? Boolean(explicitParking) : Boolean(building.amenities?.hasParking),
    hasBalcony: explicitBalcony !== undefined ? Boolean(explicitBalcony) : Boolean(building.amenities?.hasBalcony),
    hasPooja: explicitPooja !== undefined ? Boolean(explicitPooja) : false,
    hasCourtyard: features.courtyard !== undefined ? features.courtyard : Boolean(building.amenities?.hasCourtyard),
    ...(building.amenities || {})
  };
  if (explicitPooja !== undefined) {
    amenities.hasPooja = Boolean(explicitPooja);
  }
  if (explicitParking !== undefined) {
    amenities.hasParking = Boolean(explicitParking);
  }
  if (explicitBalcony !== undefined) {
    amenities.hasBalcony = Boolean(explicitBalcony);
  }

  const rawEnv = site.buildableEnvelope || {};
  const envWidth = rawEnv.width || Math.max(10, (site.plotWidth || 30) - 6);
  const envLength = rawEnv.length || Math.max(15, (site.plotLength || 40) - 10);
  const envArea = rawEnv.area || rawEnv.areaSqft || Math.round(envWidth * envLength);

  const buildableEnv = {
    width: envWidth,
    length: envLength,
    area: envArea
  };

  const floorPrograms = [];
  const errors = [...(compiledReport && !compiledReport.isFeasible ? compiledReport.errors : [])];
  const warnings = [...(compiledReport?.warnings || [])];

  const promptText = (input?.userPrompt || input?.prompt || (requirements?.userConstraints || []).join(' ') || '').toLowerCase();
  const isCompactPlot = buildableEnv.area <= 760 || buildableEnv.width <= 24 || promptText.includes('compact');
  let hasGroundBedroom = false;

  // =========================================================================
  // GROUND FLOOR PROGRAM (Floor 0)
  // =========================================================================
  const groundRooms = [];

  // 1. Covered Car Porch / Portico
  if (amenities.hasParking) {
    const std = ARCHITECTURAL_SPACE_STANDARDS[ROOM_TYPES.PORTICO];
    groundRooms.push(createRoomRecord({
      id: 'g_portico',
      name: 'Covered Car Porch & Portico',
      type: ROOM_TYPES.PORTICO,
      zone: ZONES.OUTDOOR,
      floorIndex: 0,
      floorName: 'Ground Floor',
      targetRatio: std.targetRatio,
      minWidth: std.minWidth,
      minLength: std.minLength,
      preferredWidth: Math.max(std.minWidth, 10.0),
      preferredLength: Math.max(std.minLength, 15.0),
      maxWidth: buildableEnv.width,
      maxLength: 22.0,
      minArea: std.minArea,
      preferredArea: 160,
      maxArea: 280,
      requiresExterior: true,
      orientation: 'North-West',
      finish: 'Cobblestone Interlocking Pavers',
      access: ACCESS_REQUIREMENTS.EXTERIOR_STREET,
      provenance: findRoomProvenance(roomSpecs, ROOM_TYPES.PORTICO, REQUIREMENT_SOURCE.EXPLICIT),
      hardConstraints: {
        positiveDimensions: true,
        requiredRoomPresence: true,
        minWidth: std.minWidth,
        minLength: std.minLength,
        minArea: std.minArea,
        maxWidth: buildableEnv.width,
        maxLength: 22.0,
        maxArea: 280,
        floorAssignment: 0,
        requiresExterior: true,
        strictlyInsideBuildableEnvelope: true
      },
      softPreferences: {
        preferredAdjacencies: [ROOM_TYPES.FOYER, ROOM_TYPES.LIVING],
        preferredSeparations: [ROOM_TYPES.BEDROOM, ROOM_TYPES.POOJA],
        preferredOrientation: 'North-West',
        targetRatio: std.targetRatio,
        zoning: ZONES.OUTDOOR,
        priority: 1
      }
    }));
  }

  // 2. Entrance Foyer & Verandah
  const foyerStd = ARCHITECTURAL_SPACE_STANDARDS[ROOM_TYPES.FOYER];
  const foyerMinArea = isCompactPlot ? 25 : foyerStd.minArea;
  const foyerMinWidth = isCompactPlot ? 4.5 : foyerStd.minWidth;
  const foyerMinLength = isCompactPlot ? 5.0 : foyerStd.minLength;
  groundRooms.push(createRoomRecord({
    id: 'g_foyer',
    name: 'Entrance Foyer & Verandah',
    type: ROOM_TYPES.FOYER,
    zone: ZONES.PUBLIC,
    floorIndex: 0,
    floorName: 'Ground Floor',
    targetRatio: foyerStd.targetRatio,
    minWidth: foyerMinWidth,
    minLength: foyerMinLength,
    preferredWidth: 6.0,
    preferredLength: 8.0,
    maxWidth: 12.0,
    maxLength: 14.0,
    minArea: foyerMinArea,
    preferredArea: 50,
    maxArea: 90,
    requiresExterior: true,
    orientation: facingDirection,
    finish: 'Polished Flamed Granite',
    access: ACCESS_REQUIREMENTS.EXTERIOR_STREET,
    provenance: findRoomProvenance(roomSpecs, ROOM_TYPES.FOYER, REQUIREMENT_SOURCE.DEFAULT),
    hardConstraints: {
      positiveDimensions: true,
      requiredRoomPresence: true,
      minWidth: foyerMinWidth,
      minLength: foyerMinLength,
      minArea: foyerMinArea,
      maxWidth: 12.0,
      maxLength: 14.0,
      maxArea: 90,
      floorAssignment: 0,
      requiresExterior: true,
      strictlyInsideBuildableEnvelope: true
    },
    softPreferences: {
      preferredAdjacencies: [ROOM_TYPES.PORTICO, ROOM_TYPES.LIVING],
      preferredSeparations: [ROOM_TYPES.BATHROOM, ROOM_TYPES.KITCHEN],
      preferredOrientation: facingDirection,
      targetRatio: foyerStd.targetRatio,
      zoning: ZONES.PUBLIC,
      priority: 2
    }
  }));

  // 3. Formal Living Lounge
  const livingStd = ARCHITECTURAL_SPACE_STANDARDS[ROOM_TYPES.LIVING];
  const livingMinArea = isCompactPlot ? 110 : livingStd.minArea;
  const livingMinWidth = isCompactPlot ? 10.0 : livingStd.minWidth;
  const livingMinLength = isCompactPlot ? 10.5 : livingStd.minLength;
  groundRooms.push(createRoomRecord({
    id: 'g_living',
    name: 'Formal Living Lounge',
    type: ROOM_TYPES.LIVING,
    zone: ZONES.PUBLIC,
    floorIndex: 0,
    floorName: 'Ground Floor',
    targetRatio: livingStd.targetRatio,
    minWidth: livingMinWidth,
    minLength: livingMinLength,
    preferredWidth: 13.0,
    preferredLength: 16.0,
    maxWidth: buildableEnv.width,
    maxLength: buildableEnv.length,
    minArea: livingMinArea,
    preferredArea: 210,
    maxArea: 380,
    requiresExterior: true,
    orientation: 'North-East',
    finish: 'Italian Statuario Marble',
    access: ACCESS_REQUIREMENTS.PUBLIC_CIRCULATION,
    provenance: findRoomProvenance(roomSpecs, ROOM_TYPES.LIVING, REQUIREMENT_SOURCE.EXPLICIT),
    hardConstraints: {
      positiveDimensions: true,
      requiredRoomPresence: true,
      minWidth: livingMinWidth,
      minLength: livingMinLength,
      minArea: livingMinArea,
      maxWidth: buildableEnv.width,
      maxLength: buildableEnv.length,
      maxArea: 380,
      floorAssignment: 0,
      requiresExterior: true,
      strictlyInsideBuildableEnvelope: true
    },
    softPreferences: {
      preferredAdjacencies: [ROOM_TYPES.FOYER, ROOM_TYPES.DINING],
      preferredSeparations: [ROOM_TYPES.BATHROOM],
      preferredOrientation: 'North-East',
      targetRatio: livingStd.targetRatio,
      zoning: ZONES.PUBLIC,
      priority: 3
    }
  }));

  // 4. Central Dining Space
  const diningStd = ARCHITECTURAL_SPACE_STANDARDS[ROOM_TYPES.DINING];
  const diningMinArea = isCompactPlot ? 65 : diningStd.minArea;
  const diningMinWidth = isCompactPlot ? 7.5 : diningStd.minWidth;
  const diningMinLength = isCompactPlot ? 8.5 : diningStd.minLength;
  groundRooms.push(createRoomRecord({
    id: 'g_dining',
    name: 'Central Dining Area',
    type: ROOM_TYPES.DINING,
    zone: ZONES.SEMI_PRIVATE,
    floorIndex: 0,
    floorName: 'Ground Floor',
    targetRatio: diningStd.targetRatio,
    minWidth: diningMinWidth,
    minLength: diningMinLength,
    preferredWidth: 11.0,
    preferredLength: 13.0,
    maxWidth: buildableEnv.width,
    maxLength: buildableEnv.length,
    minArea: diningMinArea,
    preferredArea: 140,
    maxArea: 220,
    requiresExterior: false,
    orientation: 'East',
    finish: 'Polished Vitrified 800×1600',
    access: ACCESS_REQUIREMENTS.CENTRAL_CORE,
    provenance: findRoomProvenance(roomSpecs, ROOM_TYPES.DINING, REQUIREMENT_SOURCE.DEFAULT),
    hardConstraints: {
      positiveDimensions: true,
      requiredRoomPresence: true,
      minWidth: diningMinWidth,
      minLength: diningMinLength,
      minArea: diningMinArea,
      maxWidth: buildableEnv.width,
      maxLength: buildableEnv.length,
      maxArea: 220,
      floorAssignment: 0,
      requiresExterior: false,
      strictlyInsideBuildableEnvelope: true
    },
    softPreferences: {
      preferredAdjacencies: [ROOM_TYPES.KITCHEN, ROOM_TYPES.LIVING, ROOM_TYPES.POOJA],
      preferredSeparations: [ROOM_TYPES.PORTICO],
      preferredOrientation: 'East',
      targetRatio: diningStd.targetRatio,
      zoning: ZONES.SEMI_PRIVATE,
      priority: 4
    }
  }));

  // 5. Modular Kitchen & Pantry
  const kitchenStd = ARCHITECTURAL_SPACE_STANDARDS[ROOM_TYPES.KITCHEN];
  const kitchenMinArea = isCompactPlot ? 50 : kitchenStd.minArea;
  const kitchenMinWidth = isCompactPlot ? 6.0 : kitchenStd.minWidth;
  const kitchenMinLength = isCompactPlot ? 7.5 : kitchenStd.minLength;
  groundRooms.push(createRoomRecord({
    id: 'g_kitchen',
    name: 'Modular Kitchen & Pantry',
    type: ROOM_TYPES.KITCHEN,
    zone: ZONES.SERVICE,
    floorIndex: 0,
    floorName: 'Ground Floor',
    targetRatio: kitchenStd.targetRatio,
    minWidth: kitchenMinWidth,
    minLength: kitchenMinLength,
    preferredWidth: 9.0,
    preferredLength: 11.5,
    maxWidth: 16.0,
    maxLength: 18.0,
    minArea: kitchenMinArea,
    preferredArea: 100,
    maxArea: 180,
    requiresExterior: true,
    orientation: 'South-East', // Agni zone
    finish: 'Calacatta Quartz Counter',
    access: ACCESS_REQUIREMENTS.CENTRAL_CORE,
    provenance: findRoomProvenance(roomSpecs, ROOM_TYPES.KITCHEN, REQUIREMENT_SOURCE.EXPLICIT),
    hardConstraints: {
      positiveDimensions: true,
      requiredRoomPresence: true,
      minWidth: kitchenMinWidth,
      minLength: kitchenMinLength,
      minArea: kitchenMinArea,
      maxWidth: 16.0,
      maxLength: 18.0,
      maxArea: 180,
      floorAssignment: 0,
      requiresExterior: true,
      strictlyInsideBuildableEnvelope: true
    },
    softPreferences: {
      preferredAdjacencies: [ROOM_TYPES.DINING, ROOM_TYPES.UTILITY],
      preferredSeparations: [ROOM_TYPES.POOJA, ROOM_TYPES.BATHROOM],
      preferredOrientation: 'South-East',
      targetRatio: kitchenStd.targetRatio,
      zoning: ZONES.SERVICE,
      priority: 5
    }
  }));

  // 6. Optional Pooja Sanctum
  if (amenities.hasPooja) {
    const poojaStd = ARCHITECTURAL_SPACE_STANDARDS[ROOM_TYPES.POOJA];
    groundRooms.push(createRoomRecord({
      id: 'g_pooja',
      name: 'Ishanya Pooja Sanctum',
      type: ROOM_TYPES.POOJA,
      zone: ZONES.SEMI_PRIVATE,
      floorIndex: 0,
      floorName: 'Ground Floor',
      targetRatio: poojaStd.targetRatio,
      minWidth: poojaStd.minWidth,
      minLength: poojaStd.minLength,
      preferredWidth: 5.5,
      preferredLength: 5.5,
      maxWidth: 8.0,
      maxLength: 8.0,
      minArea: poojaStd.minArea,
      preferredArea: 30,
      maxArea: 48,
      requiresExterior: false,
      orientation: 'North-East',
      finish: 'Makrana White Marble',
      access: ACCESS_REQUIREMENTS.CENTRAL_CORE,
      provenance: findRoomProvenance(roomSpecs, ROOM_TYPES.POOJA, REQUIREMENT_SOURCE.DEFAULT),
      hardConstraints: {
        positiveDimensions: true,
        requiredRoomPresence: true,
        minWidth: poojaStd.minWidth,
        minLength: poojaStd.minLength,
        minArea: poojaStd.minArea,
        maxWidth: 8.0,
        maxLength: 8.0,
        maxArea: 48,
        floorAssignment: 0,
        requiresExterior: false,
        strictlyInsideBuildableEnvelope: true
      },
      softPreferences: {
        preferredAdjacencies: [ROOM_TYPES.DINING, ROOM_TYPES.LIVING],
        preferredSeparations: [ROOM_TYPES.BATHROOM, ROOM_TYPES.KITCHEN],
        preferredOrientation: 'North-East',
        targetRatio: poojaStd.targetRatio,
        zoning: ZONES.SEMI_PRIVATE,
        priority: 6
      }
    }));
  }

  // 7. Optional Courtyard / Lightwell
  if (amenities.hasCourtyard) {
    const courtStd = ARCHITECTURAL_SPACE_STANDARDS[ROOM_TYPES.COURTYARD];
    groundRooms.push(createRoomRecord({
      id: 'g_courtyard',
      name: 'Brahmasthan Lightwell Courtyard',
      type: ROOM_TYPES.COURTYARD,
      zone: ZONES.OUTDOOR,
      floorIndex: 0,
      floorName: 'Ground Floor',
      targetRatio: courtStd.targetRatio,
      minWidth: courtStd.minWidth,
      minLength: courtStd.minLength,
      preferredWidth: 8.0,
      preferredLength: 8.0,
      maxWidth: 16.0,
      maxLength: 16.0,
      minArea: courtStd.minArea,
      preferredArea: 64,
      maxArea: 140,
      requiresExterior: true,
      orientation: 'Center',
      finish: 'Natural Kota Stone with Planter Bed',
      access: ACCESS_REQUIREMENTS.CENTRAL_CORE,
      provenance: findRoomProvenance(roomSpecs, ROOM_TYPES.COURTYARD, REQUIREMENT_SOURCE.EXPLICIT),
      hardConstraints: {
        positiveDimensions: true,
        requiredRoomPresence: true,
        minWidth: courtStd.minWidth,
        minLength: courtStd.minLength,
        minArea: courtStd.minArea,
        maxWidth: 16.0,
        maxLength: 16.0,
        maxArea: 140,
        floorAssignment: 0,
        requiresExterior: true,
        strictlyInsideBuildableEnvelope: true
      },
      softPreferences: {
        preferredAdjacencies: [ROOM_TYPES.DINING, ROOM_TYPES.LIVING],
        preferredSeparations: [ROOM_TYPES.PORTICO],
        preferredOrientation: 'Center',
        targetRatio: courtStd.targetRatio,
        zoning: ZONES.OUTDOOR,
        priority: 7
      }
    }));
  }

  // 8. Ground Stairwell Vertical Anchor (if multi-floor)
  if (floorsCount > 1) {
    const stairStd = ARCHITECTURAL_SPACE_STANDARDS[ROOM_TYPES.STAIRWELL];
    groundRooms.push(createRoomRecord({
      id: 'g_stairwell_core',
      name: 'RCC Dog-Legged Stairwell',
      type: ROOM_TYPES.STAIRWELL,
      zone: ZONES.PUBLIC,
      floorIndex: 0,
      floorName: 'Ground Floor',
      targetRatio: stairStd.targetRatio,
      minWidth: stairStd.minWidth,
      minLength: stairStd.minLength,
      preferredWidth: 7.5,
      preferredLength: 12.0,
      maxWidth: 10.0,
      maxLength: 16.0,
      minArea: stairStd.minArea,
      preferredArea: 90,
      maxArea: 130,
      requiresExterior: false,
      orientation: 'South-West',
      finish: 'Granite Treads with SS Rail',
      access: ACCESS_REQUIREMENTS.VERTICAL_CORE,
      provenance: REQUIREMENT_SOURCE.INFERRED,
      hardConstraints: {
        positiveDimensions: true,
        requiredRoomPresence: true,
        minWidth: stairStd.minWidth,
        minLength: stairStd.minLength,
        minArea: stairStd.minArea,
        maxWidth: 10.0,
        maxLength: 16.0,
        maxArea: 130,
        floorAssignment: 0,
        requiresExterior: false,
        strictlyInsideBuildableEnvelope: true
      },
      softPreferences: {
        preferredAdjacencies: [ROOM_TYPES.DINING, ROOM_TYPES.FOYER],
        preferredSeparations: [ROOM_TYPES.POOJA],
        preferredOrientation: 'South-West',
        targetRatio: stairStd.targetRatio,
        zoning: ZONES.PUBLIC,
        priority: 8
      }
    }));
  }

  // 9. Ground Floor Bedroom & Sanitary Allocation
  if (floorsCount === 1) {
    // Single-story: allocate all requested bedrooms on Ground
    const totalRequestedBaths = building.bathroomsCount ?? building.bath ?? (bhkCount >= 3 ? 2 : 1);
    const isCompactPlot = buildableEnv.area <= 650;

    for (let b = 1; b <= bhkCount; b++) {
      const isMaster = (b === 1);
      const bedStd = isMaster
        ? ARCHITECTURAL_SPACE_STANDARDS[ROOM_TYPES.MASTER_BEDROOM]
        : ARCHITECTURAL_SPACE_STANDARDS[ROOM_TYPES.BEDROOM];
      const bathStd = ARCHITECTURAL_SPACE_STANDARDS[ROOM_TYPES.BATHROOM];

      const minBedWidth = isCompactPlot ? (isMaster ? 10.0 : 9.0) : bedStd.minWidth;
      const minBedLength = isCompactPlot ? (isMaster ? 11.0 : 10.0) : bedStd.minLength;
      const minBedArea = isCompactPlot ? (isMaster ? 110 : 90) : bedStd.minArea;

      groundRooms.push(createRoomRecord({
        id: `g_bed_${b}`,
        name: isMaster ? 'Master Bedroom Suite' : `Bedroom ${b}`,
        type: isMaster ? ROOM_TYPES.MASTER_BEDROOM : ROOM_TYPES.BEDROOM,
        zone: ZONES.PRIVATE,
        floorIndex: 0,
        floorName: 'Ground Floor',
        targetRatio: bedStd.targetRatio,
        minWidth: minBedWidth,
        minLength: minBedLength,
        preferredWidth: isMaster ? 13.0 : 11.0,
        preferredLength: isMaster ? 15.0 : 13.0,
        maxWidth: buildableEnv.width,
        maxLength: buildableEnv.length,
        minArea: minBedArea,
        preferredArea: isMaster ? 195 : 145,
        maxArea: isMaster ? 260 : 190,
        requiresExterior: true,
        orientation: isMaster ? 'South-West' : 'North-West',
        finish: isMaster ? 'Oak Hardwood Flooring' : 'Glazed Vitrified Tiles',
        access: ACCESS_REQUIREMENTS.PRIVATE_CORRIDOR,
        provenance: REQUIREMENT_SOURCE.EXPLICIT,
        hardConstraints: {
          positiveDimensions: true,
          requiredRoomPresence: true,
          minWidth: minBedWidth,
          minLength: minBedLength,
          minArea: minBedArea,
          maxWidth: buildableEnv.width,
          maxLength: buildableEnv.length,
          maxArea: isMaster ? 260 : 190,
          floorAssignment: 0,
          requiresExterior: true,
          strictlyInsideBuildableEnvelope: true
        },
        softPreferences: {
          preferredAdjacencies: [ROOM_TYPES.DINING, ROOM_TYPES.BATHROOM],
          preferredSeparations: [ROOM_TYPES.PORTICO, ROOM_TYPES.FOYER],
          preferredOrientation: isMaster ? 'South-West' : 'North-West',
          targetRatio: bedStd.targetRatio,
          zoning: ZONES.PRIVATE,
          priority: 9 + b
        }
      }));

      // Attached/Adjacent Bathroom - only allocate if within requested bathroom count
      if (b <= totalRequestedBaths) {
        groundRooms.push(createRoomRecord({
          id: `g_bath_${b}`,
          name: isMaster ? 'En-suite Master Bath' : `Bathroom ${b}`,
          type: ROOM_TYPES.BATHROOM,
          zone: ZONES.SERVICE,
          floorIndex: 0,
          floorName: 'Ground Floor',
          targetRatio: bathStd.targetRatio,
          minWidth: isCompactPlot ? 4.5 : bathStd.minWidth,
          minLength: isCompactPlot ? 6.5 : bathStd.minLength,
          preferredWidth: 6.0,
          preferredLength: 8.0,
          maxWidth: 9.0,
          maxLength: 12.0,
          minArea: isCompactPlot ? 30 : bathStd.minArea,
          preferredArea: 48,
          maxArea: 75,
          requiresExterior: true,
          orientation: 'West',
          finish: 'Anti-skid Ceramic Vitrified',
          access: isMaster ? ACCESS_REQUIREMENTS.ENSUITE_ONLY : ACCESS_REQUIREMENTS.PRIVATE_CORRIDOR,
          provenance: REQUIREMENT_SOURCE.EXPLICIT,
          hardConstraints: {
            positiveDimensions: true,
            requiredRoomPresence: true,
            minWidth: isCompactPlot ? 4.5 : bathStd.minWidth,
            minLength: isCompactPlot ? 6.5 : bathStd.minLength,
            minArea: isCompactPlot ? 30 : bathStd.minArea,
            maxWidth: 9.0,
            maxLength: 12.0,
            maxArea: 75,
            floorAssignment: 0,
            requiresExterior: true,
            strictlyInsideBuildableEnvelope: true
          },
          softPreferences: {
            preferredAdjacencies: [isMaster ? ROOM_TYPES.MASTER_BEDROOM : ROOM_TYPES.BEDROOM],
            preferredSeparations: [ROOM_TYPES.KITCHEN, ROOM_TYPES.POOJA],
            preferredOrientation: 'West',
            targetRatio: bathStd.targetRatio,
            zoning: ZONES.SERVICE,
            priority: 15 + b
          }
        }));
      }
    }
  } else {
    // Multi-floor: determine if ground floor has capacity for a guest bedroom
    const bedStd = ARCHITECTURAL_SPACE_STANDARDS[ROOM_TYPES.BEDROOM];
    const bathStd = ARCHITECTURAL_SPACE_STANDARDS[ROOM_TYPES.BATHROOM];

    const currentGroundEnclosed = groundRooms.filter(r => r.zone !== ZONES.OUTDOOR).reduce((sum, r) => sum + r.minArea, 0);
    const currentGroundOutdoor = groundRooms.filter(r => r.zone === ZONES.OUTDOOR).reduce((sum, r) => sum + r.minArea, 0);
    const canFitGroundBedroom = (Math.round((currentGroundEnclosed + bedStd.minArea + bathStd.minArea) * CIRCULATION_WALL_FACTOR) + currentGroundOutdoor) <= buildableEnv.area;

    if (canFitGroundBedroom) {
      hasGroundBedroom = true;
      groundRooms.push(createRoomRecord({
        id: 'g_bed_guest',
        name: bhkCount >= 3 ? 'Ground Suite (Guest/Elder)' : 'Ground Bedroom',
        type: ROOM_TYPES.BEDROOM,
        zone: ZONES.PRIVATE,
        floorIndex: 0,
        floorName: 'Ground Floor',
        targetRatio: bedStd.targetRatio,
        minWidth: bedStd.minWidth,
        minLength: bedStd.minLength,
        preferredWidth: 11.0,
        preferredLength: 13.0,
        maxWidth: buildableEnv.width,
        maxLength: buildableEnv.length,
        minArea: bedStd.minArea,
        preferredArea: 140,
        maxArea: 190,
        requiresExterior: true,
        orientation: 'South-West',
        finish: 'Matte Vitrified Tiles',
        access: ACCESS_REQUIREMENTS.PRIVATE_CORRIDOR,
        provenance: REQUIREMENT_SOURCE.EXPLICIT,
        hardConstraints: {
          positiveDimensions: true,
          requiredRoomPresence: true,
          minWidth: bedStd.minWidth,
          minLength: bedStd.minLength,
          minArea: bedStd.minArea,
          maxWidth: buildableEnv.width,
          maxLength: buildableEnv.length,
          maxArea: 190,
          floorAssignment: 0,
          requiresExterior: true,
          strictlyInsideBuildableEnvelope: true
        },
        softPreferences: {
          preferredAdjacencies: [ROOM_TYPES.DINING, ROOM_TYPES.BATHROOM],
          preferredSeparations: [ROOM_TYPES.PORTICO, ROOM_TYPES.FOYER],
          preferredOrientation: 'South-West',
          targetRatio: bedStd.targetRatio,
          zoning: ZONES.PRIVATE,
          priority: 9
        }
      }));
    }

    groundRooms.push(createRoomRecord({
      id: 'g_bath_common',
      name: 'Ground Sanitary Bath & Powder',
      type: ROOM_TYPES.BATHROOM,
      zone: ZONES.SERVICE,
      floorIndex: 0,
      floorName: 'Ground Floor',
      targetRatio: bathStd.targetRatio,
      minWidth: bathStd.minWidth,
      minLength: bathStd.minLength,
      preferredWidth: 5.5,
      preferredLength: 7.5,
      maxWidth: 8.0,
      maxLength: 10.0,
      minArea: bathStd.minArea,
      preferredArea: 42,
      maxArea: 60,
      requiresExterior: true,
      orientation: 'West',
      finish: 'Anti-skid Ceramic Tiles',
      access: ACCESS_REQUIREMENTS.PUBLIC_CIRCULATION,
      provenance: REQUIREMENT_SOURCE.EXPLICIT,
      hardConstraints: {
        positiveDimensions: true,
        requiredRoomPresence: true,
        minWidth: bathStd.minWidth,
        minLength: bathStd.minLength,
        minArea: bathStd.minArea,
        maxWidth: 8.0,
        maxLength: 10.0,
        maxArea: 60,
        floorAssignment: 0,
        requiresExterior: true,
        strictlyInsideBuildableEnvelope: true
      },
      softPreferences: {
        preferredAdjacencies: [ROOM_TYPES.BEDROOM, ROOM_TYPES.DINING],
        preferredSeparations: [ROOM_TYPES.POOJA, ROOM_TYPES.KITCHEN],
        preferredOrientation: 'West',
        targetRatio: bathStd.targetRatio,
        zoning: ZONES.SERVICE,
        priority: 10
      }
    }));

    // If 4 or more bathrooms requested across the house, allocate an en-suite bath for the ground bedroom
    const totalRequestedBaths = building.bathroomsCount ?? building.bath ?? (bhkCount >= 3 ? 2 : 1);
    if (totalRequestedBaths >= 4 && hasGroundBedroom) {
      groundRooms.push(createRoomRecord({
        id: 'g_bath_suite',
        name: 'Ground Suite En-suite Bath',
        type: ROOM_TYPES.BATHROOM,
        zone: ZONES.SERVICE,
        floorIndex: 0,
        floorName: 'Ground Floor',
        targetRatio: bathStd.targetRatio,
        minWidth: bathStd.minWidth,
        minLength: bathStd.minLength,
        preferredWidth: 5.5,
        preferredLength: 7.5,
        maxWidth: 8.0,
        maxLength: 10.0,
        minArea: bathStd.minArea,
        preferredArea: 42,
        maxArea: 60,
        requiresExterior: true,
        orientation: 'South',
        finish: 'Anti-skid Ceramic Tiles',
        access: ACCESS_REQUIREMENTS.ENSUITE_ONLY,
        provenance: REQUIREMENT_SOURCE.EXPLICIT,
        hardConstraints: {
          positiveDimensions: true,
          requiredRoomPresence: true,
          minWidth: bathStd.minWidth,
          minLength: bathStd.minLength,
          minArea: bathStd.minArea,
          maxWidth: 8.0,
          maxLength: 10.0,
          maxArea: 60,
          floorAssignment: 0,
          requiresExterior: true,
          strictlyInsideBuildableEnvelope: true
        },
        softPreferences: {
          preferredAdjacencies: [ROOM_TYPES.BEDROOM],
          preferredSeparations: [ROOM_TYPES.POOJA, ROOM_TYPES.KITCHEN],
          preferredOrientation: 'South',
          targetRatio: bathStd.targetRatio,
          zoning: ZONES.SERVICE,
          priority: 11
        }
      }));
    }
  }

  // Validate Ground Floor Capacity: Enclosed rooms require internal circulation & masonry allowance
  let groundEnclosedCarpet = groundRooms.filter(r => r.zone !== ZONES.OUTDOOR).reduce((sum, r) => sum + r.minArea, 0);
  let groundOutdoorCarpet = groundRooms.filter(r => r.zone === ZONES.OUTDOOR).reduce((sum, r) => sum + r.minArea, 0);
  let groundNetCarpet = groundEnclosedCarpet + groundOutdoorCarpet;
  let groundGrossRequired = Math.round(groundEnclosedCarpet * CIRCULATION_WALL_FACTOR) + groundOutdoorCarpet;

  if (groundGrossRequired > buildableEnv.area && buildableEnv.area >= 280) {
    const scale = Math.max(0.70, ((buildableEnv.area - groundOutdoorCarpet) * 0.95) / (groundEnclosedCarpet * CIRCULATION_WALL_FACTOR));
    groundRooms.forEach(r => {
      if (r.zone !== ZONES.OUTDOOR) {
        r.minArea = Math.round(r.minArea * scale);
        r.preferredArea = Math.round(r.preferredArea * scale);
        r.minWidth = Number((r.minWidth * Math.sqrt(scale)).toFixed(1));
        r.minLength = Number((r.minLength * Math.sqrt(scale)).toFixed(1));
      }
    });
    groundEnclosedCarpet = groundRooms.filter(r => r.zone !== ZONES.OUTDOOR).reduce((sum, r) => sum + r.minArea, 0);
    groundGrossRequired = Math.round(groundEnclosedCarpet * CIRCULATION_WALL_FACTOR) + groundOutdoorCarpet;
    groundNetCarpet = groundEnclosedCarpet + groundOutdoorCarpet;
  }

  if (groundGrossRequired > buildableEnv.area) {
    errors.push(
      `Ground Floor room program requires ${groundGrossRequired} sq.ft (including walls & circulation) which exceeds available ground buildable envelope of ${buildableEnv.area} sq.ft.`
    );
  }

  floorPrograms.push({
    floorIndex: 0,
    name: 'Ground Floor',
    elevationZ: 0,
    floorHeight: 10.0,
    netCarpetArea: groundNetCarpet,
    grossAreaRequired: groundGrossRequired,
    buildableArea: buildableEnv.area,
    capacityFeasible: groundGrossRequired <= buildableEnv.area,
    rooms: groundRooms
  });

  // =========================================================================
  // FIRST FLOOR PROGRAM (Floor 1)
  // =========================================================================
  if (floorsCount >= 2) {
    const firstRooms = [];

    // 1. Aligned Stairwell Upper Landing Core
    const stairStd = ARCHITECTURAL_SPACE_STANDARDS[ROOM_TYPES.STAIRWELL];
    firstRooms.push(createRoomRecord({
      id: 'f_stairwell_core',
      name: 'RCC Dog-Legged Stairwell (Upper)',
      type: ROOM_TYPES.STAIRWELL,
      zone: ZONES.PUBLIC,
      floorIndex: 1,
      floorName: 'First Floor',
      targetRatio: stairStd.targetRatio,
      minWidth: stairStd.minWidth,
      minLength: stairStd.minLength,
      preferredWidth: 7.5,
      preferredLength: 12.0,
      maxWidth: 10.0,
      maxLength: 16.0,
      minArea: stairStd.minArea,
      preferredArea: 90,
      maxArea: 130,
      requiresExterior: false,
      orientation: 'South-West',
      finish: 'Granite Treads with SS Rail',
      access: ACCESS_REQUIREMENTS.VERTICAL_CORE,
      provenance: REQUIREMENT_SOURCE.INFERRED,
      hardConstraints: {
        positiveDimensions: true,
        requiredRoomPresence: true,
        minWidth: stairStd.minWidth,
        minLength: stairStd.minLength,
        minArea: stairStd.minArea,
        maxWidth: 10.0,
        maxLength: 16.0,
        maxArea: 130,
        floorAssignment: 1,
        requiresExterior: false,
        strictlyInsideBuildableEnvelope: true
      },
      softPreferences: {
        preferredAdjacencies: [ROOM_TYPES.LIVING],
        preferredSeparations: [],
        preferredOrientation: 'South-West',
        targetRatio: stairStd.targetRatio,
        zoning: ZONES.PUBLIC,
        priority: 1
      }
    }));

    // 2. Family Media Lounge & Library (Allocated if space permits or explicitly requested)
    const wantsFamilyLounge = features.familyLounge || (buildableEnv.area > 650 || bhkCount >= 3);
    if (wantsFamilyLounge) {
      const livingStd = ARCHITECTURAL_SPACE_STANDARDS[ROOM_TYPES.LIVING];
      firstRooms.push(createRoomRecord({
        id: 'f_family_lounge',
        name: 'Family Media Lounge & Library',
        type: ROOM_TYPES.LIVING,
        zone: ZONES.SEMI_PRIVATE,
        floorIndex: 1,
        floorName: 'First Floor',
        targetRatio: livingStd.targetRatio,
        minWidth: 10.0,
        minLength: 12.0,
        preferredWidth: 12.0,
        preferredLength: 14.0,
        maxWidth: buildableEnv.width,
        maxLength: buildableEnv.length,
        minArea: 120,
        preferredArea: 168,
        maxArea: 240,
        requiresExterior: true,
        orientation: 'North',
        finish: 'Vitrified Satin Finish',
        access: ACCESS_REQUIREMENTS.CENTRAL_CORE,
        provenance: REQUIREMENT_SOURCE.DEFAULT,
        hardConstraints: {
          positiveDimensions: true,
          requiredRoomPresence: true,
          minWidth: 10.0,
          minLength: 12.0,
          minArea: 120,
          maxWidth: buildableEnv.width,
          maxLength: buildableEnv.length,
          maxArea: 240,
          floorAssignment: 1,
          requiresExterior: true,
          strictlyInsideBuildableEnvelope: true
        },
        softPreferences: {
          preferredAdjacencies: [ROOM_TYPES.STAIRWELL, ROOM_TYPES.BALCONY],
          preferredSeparations: [],
          preferredOrientation: 'North',
          targetRatio: livingStd.targetRatio,
          zoning: ZONES.SEMI_PRIVATE,
          priority: 2
        }
      }));
    }

    // 3. Upper Master Penthouse Suite
    const masterStd = ARCHITECTURAL_SPACE_STANDARDS[ROOM_TYPES.MASTER_BEDROOM];
    firstRooms.push(createRoomRecord({
      id: 'f_master_suite',
      name: 'Upper Master Penthouse Suite',
      type: ROOM_TYPES.MASTER_BEDROOM,
      zone: ZONES.PRIVATE,
      floorIndex: 1,
      floorName: 'First Floor',
      targetRatio: masterStd.targetRatio,
      minWidth: masterStd.minWidth,
      minLength: masterStd.minLength,
      preferredWidth: 13.5,
      preferredLength: 16.0,
      maxWidth: buildableEnv.width,
      maxLength: buildableEnv.length,
      minArea: masterStd.minArea,
      preferredArea: 216,
      maxArea: 280,
      requiresExterior: true,
      orientation: 'South-West',
      finish: 'Engineered Teak Wood',
      access: ACCESS_REQUIREMENTS.PRIVATE_CORRIDOR,
      provenance: REQUIREMENT_SOURCE.EXPLICIT,
      hardConstraints: {
        positiveDimensions: true,
        requiredRoomPresence: true,
        minWidth: masterStd.minWidth,
        minLength: masterStd.minLength,
        minArea: masterStd.minArea,
        maxWidth: buildableEnv.width,
        maxLength: buildableEnv.length,
        maxArea: 280,
        floorAssignment: 1,
        requiresExterior: true,
        strictlyInsideBuildableEnvelope: true
      },
      softPreferences: {
        preferredAdjacencies: [ROOM_TYPES.BATHROOM, ROOM_TYPES.BALCONY],
        preferredSeparations: [ROOM_TYPES.STAIRWELL],
        preferredOrientation: 'South-West',
        targetRatio: masterStd.targetRatio,
        zoning: ZONES.PRIVATE,
        priority: 3
      }
    }));

    // 4. Master En-suite Spa Bath
    const bathStd = ARCHITECTURAL_SPACE_STANDARDS[ROOM_TYPES.BATHROOM];
    firstRooms.push(createRoomRecord({
      id: 'f_master_bath',
      name: 'Master En-suite Spa Bath',
      type: ROOM_TYPES.BATHROOM,
      zone: ZONES.SERVICE,
      floorIndex: 1,
      floorName: 'First Floor',
      targetRatio: bathStd.targetRatio,
      minWidth: 5.5,
      minLength: 7.5,
      preferredWidth: 6.5,
      preferredLength: 9.0,
      maxWidth: 10.0,
      maxLength: 12.0,
      minArea: 42,
      preferredArea: 58,
      maxArea: 90,
      requiresExterior: true,
      orientation: 'West',
      finish: 'Calacatta Glazed Porcelain',
      access: ACCESS_REQUIREMENTS.ENSUITE_ONLY,
      provenance: REQUIREMENT_SOURCE.EXPLICIT,
      hardConstraints: {
        positiveDimensions: true,
        requiredRoomPresence: true,
        minWidth: 5.5,
        minLength: 7.5,
        minArea: 42,
        maxWidth: 10.0,
        maxLength: 12.0,
        maxArea: 90,
        floorAssignment: 1,
        requiresExterior: true,
        strictlyInsideBuildableEnvelope: true
      },
      softPreferences: {
        preferredAdjacencies: [ROOM_TYPES.MASTER_BEDROOM],
        preferredSeparations: [],
        preferredOrientation: 'West',
        targetRatio: bathStd.targetRatio,
        zoning: ZONES.SERVICE,
        priority: 4
      }
    }));

    // 5. Additional Upper Bedrooms (for 3BHK, 4BHK)
    const upperBedCount = hasGroundBedroom ? Math.max(0, bhkCount - 2) : Math.max(1, bhkCount - 1);
    const bedStd = ARCHITECTURAL_SPACE_STANDARDS[ROOM_TYPES.BEDROOM];

    for (let i = 0; i < upperBedCount; i++) {
      const bedNum = i + 2;
      firstRooms.push(createRoomRecord({
        id: `f_bed_${bedNum}`,
        name: `Bedroom ${bedNum + 1} Suite`,
        type: ROOM_TYPES.BEDROOM,
        zone: ZONES.PRIVATE,
        floorIndex: 1,
        floorName: 'First Floor',
        targetRatio: bedStd.targetRatio,
        minWidth: bedStd.minWidth,
        minLength: bedStd.minLength,
        preferredWidth: 11.0,
        preferredLength: 13.0,
        maxWidth: buildableEnv.width,
        maxLength: buildableEnv.length,
        minArea: bedStd.minArea,
        preferredArea: 143,
        maxArea: 180,
        requiresExterior: true,
        orientation: 'North-West',
        finish: 'Matte Vitrified Tiles',
        access: ACCESS_REQUIREMENTS.PRIVATE_CORRIDOR,
        provenance: REQUIREMENT_SOURCE.EXPLICIT,
        hardConstraints: {
          positiveDimensions: true,
          requiredRoomPresence: true,
          minWidth: bedStd.minWidth,
          minLength: bedStd.minLength,
          minArea: bedStd.minArea,
          maxWidth: buildableEnv.width,
          maxLength: buildableEnv.length,
          maxArea: 180,
          floorAssignment: 1,
          requiresExterior: true,
          strictlyInsideBuildableEnvelope: true
        },
        softPreferences: {
          preferredAdjacencies: [ROOM_TYPES.BATHROOM],
          preferredSeparations: [],
          preferredOrientation: 'North-West',
          targetRatio: bedStd.targetRatio,
          zoning: ZONES.PRIVATE,
          priority: 5 + i
        }
      }));

      firstRooms.push(createRoomRecord({
        id: `f_bath_${bedNum}`,
        name: `Bathroom ${bedNum + 1}`,
        type: ROOM_TYPES.BATHROOM,
        zone: ZONES.SERVICE,
        floorIndex: 1,
        floorName: 'First Floor',
        targetRatio: bathStd.targetRatio,
        minWidth: bathStd.minWidth,
        minLength: bathStd.minLength,
        preferredWidth: 5.5,
        preferredLength: 7.5,
        maxWidth: 8.0,
        maxLength: 10.0,
        minArea: bathStd.minArea,
        preferredArea: 42,
        maxArea: 65,
        requiresExterior: true,
        orientation: 'West',
        finish: 'Anti-skid Ceramic Tiles',
        access: ACCESS_REQUIREMENTS.PRIVATE_CORRIDOR,
        provenance: REQUIREMENT_SOURCE.EXPLICIT,
        hardConstraints: {
          positiveDimensions: true,
          requiredRoomPresence: true,
          minWidth: bathStd.minWidth,
          minLength: bathStd.minLength,
          minArea: bathStd.minArea,
          maxWidth: 8.0,
          maxLength: 10.0,
          maxArea: 65,
          floorAssignment: 1,
          requiresExterior: true,
          strictlyInsideBuildableEnvelope: true
        },
        softPreferences: {
          preferredAdjacencies: [ROOM_TYPES.BEDROOM],
          preferredSeparations: [],
          preferredOrientation: 'West',
          targetRatio: bathStd.targetRatio,
          zoning: ZONES.SERVICE,
          priority: 10 + i
        }
      }));
    }

    // 6. Cantilever Glass Balcony Deck
    if (amenities.hasBalcony) {
      const balcStd = ARCHITECTURAL_SPACE_STANDARDS[ROOM_TYPES.BALCONY];
      firstRooms.push(createRoomRecord({
        id: 'f_balcony',
        name: 'Cantilever Glass Balcony Deck',
        type: ROOM_TYPES.BALCONY,
        zone: ZONES.OUTDOOR,
        floorIndex: 1,
        floorName: 'First Floor',
        targetRatio: balcStd.targetRatio,
        minWidth: balcStd.minWidth,
        minLength: balcStd.minLength,
        preferredWidth: 5.0,
        preferredLength: 12.0,
        maxWidth: 8.0,
        maxLength: buildableEnv.width,
        minArea: balcStd.minArea,
        preferredArea: 60,
        maxArea: 120,
        requiresExterior: true,
        orientation: facingDirection,
        finish: 'Weatherproof WPC Wood Planks',
        access: ACCESS_REQUIREMENTS.PUBLIC_CIRCULATION,
        provenance: findRoomProvenance(roomSpecs, ROOM_TYPES.BALCONY, REQUIREMENT_SOURCE.EXPLICIT),
        hardConstraints: {
          positiveDimensions: true,
          requiredRoomPresence: true,
          minWidth: balcStd.minWidth,
          minLength: balcStd.minLength,
          minArea: balcStd.minArea,
          maxWidth: 8.0,
          maxLength: buildableEnv.width,
          maxArea: 120,
          floorAssignment: 1,
          requiresExterior: true,
          strictlyInsideBuildableEnvelope: true
        },
        softPreferences: {
          preferredAdjacencies: [ROOM_TYPES.MASTER_BEDROOM, ROOM_TYPES.LIVING],
          preferredSeparations: [ROOM_TYPES.BATHROOM],
          preferredOrientation: facingDirection,
          targetRatio: balcStd.targetRatio,
          zoning: ZONES.OUTDOOR,
          priority: 15
        }
      }));
    }

    // Validate First Floor Capacity: Enclosed rooms require internal circulation & masonry allowance
    let firstEnclosedCarpet = firstRooms.filter(r => r.zone !== ZONES.OUTDOOR).reduce((sum, r) => sum + r.minArea, 0);
    let firstOutdoorCarpet = firstRooms.filter(r => r.zone === ZONES.OUTDOOR).reduce((sum, r) => sum + r.minArea, 0);
    let firstNetCarpet = firstEnclosedCarpet + firstOutdoorCarpet;
    let firstGrossRequired = Math.round(firstEnclosedCarpet * CIRCULATION_WALL_FACTOR) + firstOutdoorCarpet;

    if (firstGrossRequired > buildableEnv.area && buildableEnv.area >= 280) {
      const scale = Math.max(0.70, ((buildableEnv.area - firstOutdoorCarpet) * 0.95) / (firstEnclosedCarpet * CIRCULATION_WALL_FACTOR));
      firstRooms.forEach(r => {
        if (r.zone !== ZONES.OUTDOOR) {
          r.minArea = Math.round(r.minArea * scale);
          r.preferredArea = Math.round(r.preferredArea * scale);
          r.minWidth = Number((r.minWidth * Math.sqrt(scale)).toFixed(1));
          r.minLength = Number((r.minLength * Math.sqrt(scale)).toFixed(1));
        }
      });
      firstEnclosedCarpet = firstRooms.filter(r => r.zone !== ZONES.OUTDOOR).reduce((sum, r) => sum + r.minArea, 0);
      firstGrossRequired = Math.round(firstEnclosedCarpet * CIRCULATION_WALL_FACTOR) + firstOutdoorCarpet;
      firstNetCarpet = firstEnclosedCarpet + firstOutdoorCarpet;
    }

    if (firstGrossRequired > buildableEnv.area) {
      errors.push(
        `First Floor room program requires ${firstGrossRequired} sq.ft which exceeds available buildable envelope of ${buildableEnv.area} sq.ft.`
      );
    }

    floorPrograms.push({
      floorIndex: 1,
      name: 'First Floor',
      elevationZ: 10.5,
      floorHeight: 10.0,
      netCarpetArea: firstNetCarpet,
      grossAreaRequired: firstGrossRequired,
      buildableArea: buildableEnv.area,
      capacityFeasible: firstGrossRequired <= buildableEnv.area,
      rooms: firstRooms
    });
  }

  // =========================================================================
  // INTERMEDIATE UPPER FLOORS (Floors 2 to floorsCount - 1)
  // Dynamic multi-storey floor generation supporting arbitrary floor counts (up to 10)
  // =========================================================================
  const FLOOR_NAMES = [
    'Ground Floor',
    'First Floor',
    'Second Floor',
    'Third Floor',
    'Fourth Floor',
    'Fifth Floor',
    'Sixth Floor',
    'Seventh Floor',
    'Eighth Floor',
    'Ninth Floor',
    'Tenth Floor'
  ];

  const archStyle = (building.archStyle || building.style || requirements?.style || '').toLowerCase();
  const isPenthouseRequested = archStyle.includes('penthouse') || promptText.includes('penthouse');

  for (let fl = 2; fl < floorsCount; fl++) {
    const isTopHabitable = (fl === floorsCount - 1);
    const floorName = FLOOR_NAMES[fl] || `Floor Level ${fl}`;
    const flRooms = [];

    // 1. Aligned Stairwell Upper Landing Core
    const stairStd = ARCHITECTURAL_SPACE_STANDARDS[ROOM_TYPES.STAIRWELL];
    flRooms.push(createRoomRecord({
      id: `f${fl}_stairwell_core`,
      name: `RCC Dog-Legged Stairwell (Level ${fl})`,
      type: ROOM_TYPES.STAIRWELL,
      zone: ZONES.PUBLIC,
      floorIndex: fl,
      floorName,
      targetRatio: stairStd.targetRatio,
      minWidth: stairStd.minWidth,
      minLength: stairStd.minLength,
      preferredWidth: 7.5,
      preferredLength: 12.0,
      maxWidth: 10.0,
      maxLength: 16.0,
      minArea: stairStd.minArea,
      preferredArea: 90,
      maxArea: 130,
      requiresExterior: false,
      orientation: 'South-West',
      finish: 'Granite Treads with SS Rail',
      access: ACCESS_REQUIREMENTS.VERTICAL_CORE,
      provenance: REQUIREMENT_SOURCE.INFERRED,
      hardConstraints: {
        positiveDimensions: true,
        requiredRoomPresence: true,
        minWidth: stairStd.minWidth,
        minLength: stairStd.minLength,
        minArea: stairStd.minArea,
        maxWidth: 10.0,
        maxLength: 16.0,
        maxArea: 130,
        floorAssignment: fl,
        requiresExterior: false,
        strictlyInsideBuildableEnvelope: true
      },
      softPreferences: {
        preferredAdjacencies: [ROOM_TYPES.LIVING],
        preferredSeparations: [],
        preferredOrientation: 'South-West',
        targetRatio: stairStd.targetRatio,
        zoning: ZONES.PUBLIC,
        priority: 1
      }
    }));

    // If Penthouse on top habitable floor
    if (isTopHabitable && isPenthouseRequested) {
      // Penthouse Private Terrace Deck
      const balcStd = ARCHITECTURAL_SPACE_STANDARDS[ROOM_TYPES.BALCONY];
      flRooms.push(createRoomRecord({
        id: `f${fl}_penthouse_terrace`,
        name: 'Private Panoramic Sky Terrace',
        type: ROOM_TYPES.BALCONY,
        zone: ZONES.OUTDOOR,
        floorIndex: fl,
        floorName,
        targetRatio: balcStd.targetRatio || 1.5,
        minWidth: Math.max(balcStd.minWidth || 5.0, 8.0),
        minLength: Math.max(balcStd.minLength || 6.0, 12.0),
        preferredWidth: 10.0,
        preferredLength: 16.0,
        maxWidth: buildableEnv.width,
        maxLength: buildableEnv.length,
        minArea: 80,
        preferredArea: 140,
        maxArea: 250,
        requiresExterior: true,
        orientation: facingDirection,
        finish: 'Weatherproof Teak Decking & Glass Balustrade',
        access: ACCESS_REQUIREMENTS.PUBLIC_CIRCULATION,
        provenance: REQUIREMENT_SOURCE.EXPLICIT,
        hardConstraints: {
          positiveDimensions: true,
          requiredRoomPresence: true,
          minWidth: 8.0,
          minLength: 12.0,
          minArea: 80,
          maxWidth: buildableEnv.width,
          maxLength: buildableEnv.length,
          maxArea: 250,
          floorAssignment: fl,
          requiresExterior: true,
          strictlyInsideBuildableEnvelope: true
        },
        softPreferences: {
          preferredAdjacencies: [ROOM_TYPES.MASTER_BEDROOM],
          preferredSeparations: [],
          preferredOrientation: facingDirection,
          targetRatio: 1.5,
          zoning: ZONES.OUTDOOR,
          priority: 2
        }
      }));

      // Penthouse Master Sky Suite
      const masterStd = ARCHITECTURAL_SPACE_STANDARDS[ROOM_TYPES.MASTER_BEDROOM];
      flRooms.push(createRoomRecord({
        id: `f${fl}_penthouse_suite`,
        name: 'Executive Penthouse Master Suite',
        type: ROOM_TYPES.MASTER_BEDROOM,
        zone: ZONES.PRIVATE,
        floorIndex: fl,
        floorName,
        targetRatio: masterStd.targetRatio,
        minWidth: 12.0,
        minLength: 14.0,
        preferredWidth: 14.0,
        preferredLength: 18.0,
        maxWidth: buildableEnv.width,
        maxLength: buildableEnv.length,
        minArea: 160,
        preferredArea: 240,
        maxArea: 320,
        requiresExterior: true,
        orientation: 'South-West',
        finish: 'Italian Statuario Marble & Oak Paneling',
        access: ACCESS_REQUIREMENTS.PRIVATE_CORRIDOR,
        provenance: REQUIREMENT_SOURCE.EXPLICIT,
        hardConstraints: {
          positiveDimensions: true,
          requiredRoomPresence: true,
          minWidth: 12.0,
          minLength: 14.0,
          minArea: 160,
          maxWidth: buildableEnv.width,
          maxLength: buildableEnv.length,
          maxArea: 320,
          floorAssignment: fl,
          requiresExterior: true,
          strictlyInsideBuildableEnvelope: true
        },
        softPreferences: {
          preferredAdjacencies: [ROOM_TYPES.BALCONY, ROOM_TYPES.BATHROOM],
          preferredSeparations: [ROOM_TYPES.STAIRWELL],
          preferredOrientation: 'South-West',
          targetRatio: masterStd.targetRatio,
          zoning: ZONES.PRIVATE,
          priority: 3
        }
      }));

      // Penthouse Luxury Spa Bath
      const bathStd = ARCHITECTURAL_SPACE_STANDARDS[ROOM_TYPES.BATHROOM];
      flRooms.push(createRoomRecord({
        id: `f${fl}_penthouse_bath`,
        name: 'Sky Spa Jacuzzi Bath',
        type: ROOM_TYPES.BATHROOM,
        zone: ZONES.SERVICE,
        floorIndex: fl,
        floorName,
        targetRatio: bathStd.targetRatio,
        minWidth: 6.0,
        minLength: 8.0,
        preferredWidth: 7.0,
        preferredLength: 10.0,
        maxWidth: 10.0,
        maxLength: 12.0,
        minArea: 48,
        preferredArea: 70,
        maxArea: 100,
        requiresExterior: true,
        orientation: 'West',
        finish: 'Calacatta Glazed Porcelain',
        access: ACCESS_REQUIREMENTS.ENSUITE_ONLY,
        provenance: REQUIREMENT_SOURCE.EXPLICIT,
        hardConstraints: {
          positiveDimensions: true,
          requiredRoomPresence: true,
          minWidth: 6.0,
          minLength: 8.0,
          minArea: 48,
          maxWidth: 10.0,
          maxLength: 12.0,
          maxArea: 100,
          floorAssignment: fl,
          requiresExterior: true,
          strictlyInsideBuildableEnvelope: true
        },
        softPreferences: {
          preferredAdjacencies: [ROOM_TYPES.MASTER_BEDROOM],
          preferredSeparations: [],
          preferredOrientation: 'West',
          targetRatio: bathStd.targetRatio,
          zoning: ZONES.SERVICE,
          priority: 4
        }
      }));
    } else {
      // Standard Multi-Storey Residential Floor
      // 2. Front Balcony
      const balcStd = ARCHITECTURAL_SPACE_STANDARDS[ROOM_TYPES.BALCONY];
      flRooms.push(createRoomRecord({
        id: `f${fl}_balcony`,
        name: `Cantilever Balcony Deck (Level ${fl})`,
        type: ROOM_TYPES.BALCONY,
        zone: ZONES.OUTDOOR,
        floorIndex: fl,
        floorName,
        targetRatio: balcStd.targetRatio,
        minWidth: balcStd.minWidth,
        minLength: balcStd.minLength,
        preferredWidth: 5.0,
        preferredLength: 12.0,
        maxWidth: 8.0,
        maxLength: buildableEnv.width,
        minArea: balcStd.minArea,
        preferredArea: 60,
        maxArea: 120,
        requiresExterior: true,
        orientation: facingDirection,
        finish: 'Weatherproof WPC Wood Planks',
        access: ACCESS_REQUIREMENTS.PUBLIC_CIRCULATION,
        provenance: REQUIREMENT_SOURCE.DEFAULT,
        hardConstraints: {
          positiveDimensions: true,
          requiredRoomPresence: true,
          minWidth: balcStd.minWidth,
          minLength: balcStd.minLength,
          minArea: balcStd.minArea,
          maxWidth: 8.0,
          maxLength: buildableEnv.width,
          maxArea: 120,
          floorAssignment: fl,
          requiresExterior: true,
          strictlyInsideBuildableEnvelope: true
        },
        softPreferences: {
          preferredAdjacencies: [ROOM_TYPES.LIVING],
          preferredSeparations: [],
          preferredOrientation: facingDirection,
          targetRatio: balcStd.targetRatio,
          zoning: ZONES.OUTDOOR,
          priority: 2
        }
      }));

      // 3. Family Lounge / Living Space
      const livingStd = ARCHITECTURAL_SPACE_STANDARDS[ROOM_TYPES.LIVING];
      flRooms.push(createRoomRecord({
        id: `f${fl}_family_lounge`,
        name: `Living Lounge (Level ${fl})`,
        type: ROOM_TYPES.LIVING,
        zone: ZONES.SEMI_PRIVATE,
        floorIndex: fl,
        floorName,
        targetRatio: livingStd.targetRatio,
        minWidth: 10.0,
        minLength: 12.0,
        preferredWidth: 12.0,
        preferredLength: 14.0,
        maxWidth: buildableEnv.width,
        maxLength: buildableEnv.length,
        minArea: 120,
        preferredArea: 168,
        maxArea: 240,
        requiresExterior: true,
        orientation: 'North',
        finish: 'Vitrified Satin Finish',
        access: ACCESS_REQUIREMENTS.CENTRAL_CORE,
        provenance: REQUIREMENT_SOURCE.DEFAULT,
        hardConstraints: {
          positiveDimensions: true,
          requiredRoomPresence: true,
          minWidth: 10.0,
          minLength: 12.0,
          minArea: 120,
          maxWidth: buildableEnv.width,
          maxLength: buildableEnv.length,
          maxArea: 240,
          floorAssignment: fl,
          requiresExterior: true,
          strictlyInsideBuildableEnvelope: true
        },
        softPreferences: {
          preferredAdjacencies: [ROOM_TYPES.STAIRWELL, ROOM_TYPES.BALCONY],
          preferredSeparations: [],
          preferredOrientation: 'North',
          targetRatio: livingStd.targetRatio,
          zoning: ZONES.SEMI_PRIVATE,
          priority: 3
        }
      }));

      // 4. Primary Suite on this level
      const bedStd = ARCHITECTURAL_SPACE_STANDARDS[ROOM_TYPES.BEDROOM];
      const bathStd = ARCHITECTURAL_SPACE_STANDARDS[ROOM_TYPES.BATHROOM];
      flRooms.push(createRoomRecord({
        id: `f${fl}_bed_1`,
        name: `Suite Bedroom (Level ${fl})`,
        type: ROOM_TYPES.BEDROOM,
        zone: ZONES.PRIVATE,
        floorIndex: fl,
        floorName,
        targetRatio: bedStd.targetRatio,
        minWidth: bedStd.minWidth,
        minLength: bedStd.minLength,
        preferredWidth: 11.5,
        preferredLength: 14.0,
        maxWidth: buildableEnv.width,
        maxLength: buildableEnv.length,
        minArea: bedStd.minArea,
        preferredArea: 155,
        maxArea: 220,
        requiresExterior: true,
        orientation: 'South-West',
        finish: 'Engineered Teak Wood',
        access: ACCESS_REQUIREMENTS.PRIVATE_CORRIDOR,
        provenance: REQUIREMENT_SOURCE.DEFAULT,
        hardConstraints: {
          positiveDimensions: true,
          requiredRoomPresence: true,
          minWidth: bedStd.minWidth,
          minLength: bedStd.minLength,
          minArea: bedStd.minArea,
          maxWidth: buildableEnv.width,
          maxLength: buildableEnv.length,
          maxArea: 220,
          floorAssignment: fl,
          requiresExterior: true,
          strictlyInsideBuildableEnvelope: true
        },
        softPreferences: {
          preferredAdjacencies: [ROOM_TYPES.BATHROOM],
          preferredSeparations: [ROOM_TYPES.STAIRWELL],
          preferredOrientation: 'South-West',
          targetRatio: bedStd.targetRatio,
          zoning: ZONES.PRIVATE,
          priority: 4
        }
      }));

      // 5. En-suite Bath
      flRooms.push(createRoomRecord({
        id: `f${fl}_bath_1`,
        name: `Sanitary Bath (Level ${fl})`,
        type: ROOM_TYPES.BATHROOM,
        zone: ZONES.SERVICE,
        floorIndex: fl,
        floorName,
        targetRatio: bathStd.targetRatio,
        minWidth: 5.5,
        minLength: 7.5,
        preferredWidth: 6.0,
        preferredLength: 8.5,
        maxWidth: 9.0,
        maxLength: 11.0,
        minArea: 42,
        preferredArea: 51,
        maxArea: 75,
        requiresExterior: true,
        orientation: 'West',
        finish: 'Anti-skid Ceramic Vitrified',
        access: ACCESS_REQUIREMENTS.PRIVATE_CORRIDOR,
        provenance: REQUIREMENT_SOURCE.DEFAULT,
        hardConstraints: {
          positiveDimensions: true,
          requiredRoomPresence: true,
          minWidth: 5.5,
          minLength: 7.5,
          minArea: 42,
          maxWidth: 9.0,
          maxLength: 11.0,
          maxArea: 75,
          floorAssignment: fl,
          requiresExterior: true,
          strictlyInsideBuildableEnvelope: true
        },
        softPreferences: {
          preferredAdjacencies: [ROOM_TYPES.BEDROOM],
          preferredSeparations: [],
          preferredOrientation: 'West',
          targetRatio: bathStd.targetRatio,
          zoning: ZONES.SERVICE,
          priority: 5
        }
      }));

      // 6. Secondary Bedroom
      flRooms.push(createRoomRecord({
        id: `f${fl}_bed_2`,
        name: `Guest Bedroom (Level ${fl})`,
        type: ROOM_TYPES.BEDROOM,
        zone: ZONES.PRIVATE,
        floorIndex: fl,
        floorName,
        targetRatio: bedStd.targetRatio,
        minWidth: bedStd.minWidth,
        minLength: bedStd.minLength,
        preferredWidth: 10.5,
        preferredLength: 12.5,
        maxWidth: buildableEnv.width,
        maxLength: buildableEnv.length,
        minArea: bedStd.minArea,
        preferredArea: 130,
        maxArea: 180,
        requiresExterior: true,
        orientation: 'North-West',
        finish: 'Matte Vitrified Tiles',
        access: ACCESS_REQUIREMENTS.PRIVATE_CORRIDOR,
        provenance: REQUIREMENT_SOURCE.DEFAULT,
        hardConstraints: {
          positiveDimensions: true,
          requiredRoomPresence: true,
          minWidth: bedStd.minWidth,
          minLength: bedStd.minLength,
          minArea: bedStd.minArea,
          maxWidth: buildableEnv.width,
          maxLength: buildableEnv.length,
          maxArea: 180,
          floorAssignment: fl,
          requiresExterior: true,
          strictlyInsideBuildableEnvelope: true
        },
        softPreferences: {
          preferredAdjacencies: [ROOM_TYPES.BATHROOM],
          preferredSeparations: [],
          preferredOrientation: 'North-West',
          targetRatio: bedStd.targetRatio,
          zoning: ZONES.PRIVATE,
          priority: 6
        }
      }));
    }

    const flEnclosedCarpet = flRooms.filter(r => r.zone !== ZONES.OUTDOOR).reduce((sum, r) => sum + r.minArea, 0);
    const flOutdoorCarpet = flRooms.filter(r => r.zone === ZONES.OUTDOOR).reduce((sum, r) => sum + r.minArea, 0);
    const flNetCarpet = flEnclosedCarpet + flOutdoorCarpet;
    const flGrossRequired = Math.round(flEnclosedCarpet * CIRCULATION_WALL_FACTOR) + flOutdoorCarpet;

    floorPrograms.push({
      floorIndex: fl,
      name: floorName,
      elevationZ: fl * 10.5,
      floorHeight: 10.0,
      netCarpetArea: flNetCarpet,
      grossAreaRequired: flGrossRequired,
      buildableArea: buildableEnv.area,
      capacityFeasible: flGrossRequired <= buildableEnv.area,
      rooms: flRooms
    });
  }

  // =========================================================================
  // TERRACE FLOOR PROGRAM (Floor = floorsCount)
  // =========================================================================
  const isTerraceExplicitlyRequested = features.terrace === true ||
    amenities.hasTerrace === true ||
    (requirements.userConstraints || []).some(c => /terrace|rooftop deck|open deck/i.test(c)) ||
    building.archStyle === 'penthouse';

  const isSlopedRoofStyle = (
    building.archStyle === 'vintage' || 
    building.archStyle === 'traditional_indian' || 
    building.hasSlopedRoof === true || 
    options.rooflineStyle === 'sloping_pitched' ||
    (requirements.userConstraints || []).some(c => /slop(?:ing|ed)\s*roof|pitched\s*roof|tiled\s*roof/i.test(c))
  );

  const shouldIncludeTerraceFloor = isTerraceExplicitlyRequested || (!isSlopedRoofStyle && floorsCount >= 2);

  if (shouldIncludeTerraceFloor) {
    const terraceRooms = [];
    const stairStd = ARCHITECTURAL_SPACE_STANDARDS[ROOM_TYPES.STAIRWELL];

  terraceRooms.push(createRoomRecord({
    id: 't_mumty',
    name: 'Stairhead Mumty & Overhead Tank',
    type: ROOM_TYPES.STAIRWELL,
    zone: ZONES.SERVICE,
    floorIndex: floorsCount,
    floorName: 'Terrace Level',
    targetRatio: 1.2,
    minWidth: stairStd.minWidth,
    minLength: stairStd.minLength,
    preferredWidth: 8.0,
    preferredLength: 10.0,
    maxWidth: 10.0,
    maxLength: 14.0,
    minArea: stairStd.minArea,
    preferredArea: 80,
    maxArea: 120,
    requiresExterior: true,
    orientation: 'South-West',
    finish: 'Waterproof IPS Screed',
    access: ACCESS_REQUIREMENTS.ROOFTOP_ACCESS,
    provenance: REQUIREMENT_SOURCE.INFERRED,
    hardConstraints: {
      positiveDimensions: true,
      requiredRoomPresence: true,
      minWidth: stairStd.minWidth,
      minLength: stairStd.minLength,
      minArea: stairStd.minArea,
      maxWidth: 10.0,
      maxLength: 14.0,
      maxArea: 120,
      floorAssignment: floorsCount,
      requiresExterior: true,
      strictlyInsideBuildableEnvelope: true
    },
    softPreferences: {
      preferredAdjacencies: [ROOM_TYPES.TERRACE],
      preferredSeparations: [],
      preferredOrientation: 'South-West',
      targetRatio: 1.2,
      zoning: ZONES.SERVICE,
      priority: 1
    }
  }));

  const openDeckArea = Math.round(buildableEnv.area * 0.75);
  terraceRooms.push(createRoomRecord({
    id: 't_open_deck',
    name: 'Open Rooftop Terrace Garden',
    type: ROOM_TYPES.TERRACE,
    zone: ZONES.OUTDOOR,
    floorIndex: floorsCount,
    floorName: 'Terrace Level',
    targetRatio: 1.4,
    minWidth: 12.0,
    minLength: 15.0,
    preferredWidth: 16.0,
    preferredLength: 22.0,
    maxWidth: buildableEnv.width,
    maxLength: buildableEnv.length,
    minArea: 100,
    preferredArea: openDeckArea,
    maxArea: buildableEnv.area,
    requiresExterior: true,
    orientation: facingDirection,
    finish: 'High SRI White Cool Roof Tiles',
    access: ACCESS_REQUIREMENTS.ROOFTOP_ACCESS,
    provenance: REQUIREMENT_SOURCE.DEFAULT,
    hardConstraints: {
      positiveDimensions: true,
      requiredRoomPresence: true,
      minWidth: 12.0,
      minLength: 15.0,
      minArea: 100,
      maxWidth: buildableEnv.width,
      maxLength: buildableEnv.length,
      maxArea: buildableEnv.area,
      floorAssignment: floorsCount,
      requiresExterior: true,
      strictlyInsideBuildableEnvelope: true
    },
    softPreferences: {
      preferredAdjacencies: [ROOM_TYPES.STAIRWELL],
      preferredSeparations: [],
      preferredOrientation: facingDirection,
      targetRatio: 1.4,
      zoning: ZONES.OUTDOOR,
      priority: 2
    }
  }));

    floorPrograms.push({
      floorIndex: floorsCount,
      name: 'Terrace Level',
      elevationZ: floorsCount * 10.5,
      floorHeight: 4.0,
      netCarpetArea: terraceRooms.reduce((sum, r) => sum + r.minArea, 0),
      grossAreaRequired: Math.round(terraceRooms.reduce((sum, r) => sum + r.minArea, 0) * CIRCULATION_WALL_FACTOR),
      buildableArea: buildableEnv.area,
      capacityFeasible: true,
      rooms: terraceRooms
    });
  }

  // Calculate Aggregates
  let grandTotalRooms = 0;
  let grandTotalNetCarpet = 0;
  let grandTotalGrossRequired = 0;

  for (const fp of floorPrograms) {
    grandTotalRooms += fp.rooms.length;
    grandTotalNetCarpet += fp.netCarpetArea;
    grandTotalGrossRequired += fp.grossAreaRequired;
  }

  const isFeasible = errors.length === 0;

  return {
    success: isFeasible,
    isFeasible,
    floorPrograms,
    summary: {
      floorsCount,
      totalRoomsCount: grandTotalRooms,
      totalNetCarpetArea: grandTotalNetCarpet,
      totalGrossRequiredArea: grandTotalGrossRequired,
      buildableEnvelopeArea: buildableEnv.area,
      groundCoverageRatio: Number((groundGrossRequired / (site.plotArea || (site.plotWidth * site.plotLength))).toFixed(2))
    },
    errors,
    warnings
  };
}

/**
 * Backward-compatible room programming entry point
 * 
 * Reused by layoutGenerator.js and existing engine components.
 * Returns the floorPrograms array enriched with feasibility metadata.
 */
export function programRooms(specs) {
  const result = generateRoomProgram(specs);
  const floorPrograms = result.floorPrograms || [];

  // Attach report metadata directly to the returned array for caller convenience
  floorPrograms.success = result.success;
  floorPrograms.isFeasible = result.isFeasible;
  floorPrograms.summary = result.summary;
  floorPrograms.errors = result.errors;
  floorPrograms.warnings = result.warnings;

  return floorPrograms;
}

/**
 * Helper to construct a standardized, typed Room Record
 */
function createRoomRecord(cfg) {
  return {
    id: cfg.id,
    name: cfg.name,
    type: cfg.type,
    zone: cfg.zone,
    floor: cfg.floorIndex,
    floorIndex: cfg.floorIndex,
    floorName: cfg.floorName,
    requiredQuantity: cfg.requiredQuantity || 1,
    targetRatio: cfg.targetRatio,
    minWidth: cfg.minWidth,
    minLength: cfg.minLength,
    preferredWidth: cfg.preferredWidth,
    preferredLength: cfg.preferredLength,
    maxWidth: cfg.maxWidth !== undefined ? cfg.maxWidth : null,
    maxLength: cfg.maxLength !== undefined ? cfg.maxLength : null,
    minArea: cfg.minArea,
    preferredArea: cfg.preferredArea,
    maxArea: cfg.maxArea,
    requiresExterior: cfg.requiresExterior,
    orientation: cfg.orientation,
    finish: cfg.finish,
    accessRequirements: cfg.access,
    provenance: cfg.provenance || REQUIREMENT_SOURCE.DEFAULT,
    validationStatus: 'VALID',
    hardConstraints: cfg.hardConstraints,
    softPreferences: cfg.softPreferences
  };
}

/**
 * Finds provenance from compiled room specs or defaults
 */
function findRoomProvenance(roomSpecs, roomType, fallback) {
  if (!roomSpecs || !Array.isArray(roomSpecs)) return fallback;
  const match = roomSpecs.find(r => r.roomType === roomType || r.type === roomType);
  return match ? (match.provenance || fallback) : fallback;
}
