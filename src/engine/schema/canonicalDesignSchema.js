/**
 * LabourConnect Design Engine - Canonical Design Schema v2.0
 * 
 * Single source of truth canonical representation for architectural designs.
 * Governs 2D CAD blueprint views, 3D geometry generation, walkthrough paths,
 * structural layouts, and deterministic BOQ estimation.
 */

export const SCHEMA_VERSION = '2.0.0';

export const DESIGN_LEVELS = {
  CONCEPT: 'Concept design',
  VALIDATED: 'Validated preliminary design',
  CONSTRUCTION_READY: 'Construction-ready design'
};

export const ROOM_TYPES = {
  LIVING: 'living',
  DINING: 'dining',
  KITCHEN: 'kitchen',
  MASTER_BEDROOM: 'master_bedroom',
  BEDROOM: 'bedroom',
  BATHROOM: 'bathroom',
  POOJA: 'pooja',
  PORTICO: 'portico',
  BALCONY: 'balcony',
  COURTYARD: 'courtyard',
  FOYER: 'foyer',
  STAIRWELL: 'stairwell',
  UTILITY: 'utility',
  TERRACE: 'terrace',
  STUDY: 'study'
};

export const ZONES = {
  PUBLIC: 'public',
  SEMI_PRIVATE: 'semi_private',
  PRIVATE: 'private',
  SERVICE: 'service',
  OUTDOOR: 'outdoor'
};

/**
 * Creates an empty canonical design structure
 */
export function createEmptyDesign(meta = {}) {
  const seed = meta.seed || Date.now();
  const id = meta.id || `des-${seed}-${Math.random().toString(36).substring(2, 7)}`;
  const code = meta.code || `LC-${Math.abs(seed % 90000 + 10000)}`;

  return {
    schemaVersion: SCHEMA_VERSION,
    id,
    code,
    title: meta.title || 'Architectural Design',
    designLevel: DESIGN_LEVELS.VALIDATED,
    timestamp: new Date().toISOString(),
    seed,
    source: 'LabourConnect AI Design Engine v2.0',
    inputs: {
      plotWidth: 40,
      plotLength: 60,
      dimensionUnit: 'feet',
      floorsCount: 2,
      bhkCount: 3,
      bathroomsCount: 3,
      archStyle: 'modern',
      facingDirection: 'East',
      homeBudgetInr: 4500000,
      hasPooja: true,
      hasParking: true,
      hasBalcony: true,
      hasCourtyard: false,
      hasSolarPergola: true,
      kitchenType: 'open_modular',
      userPrompt: ''
    },
    site: {
      plotWidth: 40,
      plotLength: 60,
      dimensionUnit: 'feet',
      plotAreaSqft: 2400,
      orientation: 'East',
      setbacks: { front: 5, rear: 4, left: 3, right: 3 },
      buildableEnvelope: { x: 3, y: 5, width: 34, length: 51, areaSqft: 1734 }
    },
    metrics: {
      plotAreaSqft: 2400,
      builtUpAreaSqft: 0,
      carpetAreaSqft: 0,
      groundCoverageSqft: 0,
      groundCoverageRatio: 0,
      fsiAchieved: 0,
      roomCountTotal: 0,
      floorsCount: 2
    },
    floors: [],
    structuralGrid: {
      columns: [],
      beams: [],
      columnCount: 0,
      beamCount: 0,
      gridLinesX: [],
      gridLinesY: []
    },
    walkthroughTrajectory: {
      waypoints: [],
      totalDurationSeconds: 0
    },
    boqEstimate: {
      totalCostInr: 0,
      costPerSqft: 0,
      uncertaintyPercentage: 8,
      itemizedBreakdown: [],
      assumptions: []
    },
    evaluation: {
      isValid: false,
      constraintViolations: [],
      scores: {
        overall: 0,
        circulation: 0,
        daylightVentilation: 0,
        vaastuCompliance: 0,
        structuralEfficiency: 0
      },
      fingerprint: ''
    }
  };
}

/**
 * Validates that an object conforms to the Canonical Design Schema
 */
export function validateCanonicalSchema(design) {
  const errors = [];

  if (!design || typeof design !== 'object') {
    return { valid: false, errors: ['Design payload must be a non-null object.'] };
  }

  if (design.schemaVersion !== SCHEMA_VERSION) {
    errors.push(`Invalid schema version: expected ${SCHEMA_VERSION}, received ${design.schemaVersion}`);
  }

  if (!design.id || typeof design.id !== 'string') {
    errors.push('Missing or invalid design identifier (id).');
  }

  if (!design.site || typeof design.site !== 'object') {
    errors.push('Missing site definition.');
  } else {
    if (!design.site.plotWidth || design.site.plotWidth <= 0) errors.push('Plot width must be greater than 0.');
    if (!design.site.plotLength || design.site.plotLength <= 0) errors.push('Plot length must be greater than 0.');
    if (!design.site.buildableEnvelope) errors.push('Missing buildable envelope geometry.');
  }

  if (!Array.isArray(design.floors) || design.floors.length === 0) {
    errors.push('Design must contain at least one floor level.');
  } else {
    design.floors.forEach((fl, idx) => {
      if (typeof fl.floorIndex !== 'number') errors.push(`Floor at index ${idx} missing numeric floorIndex.`);
      if (!Array.isArray(fl.rooms) || fl.rooms.length === 0) {
        errors.push(`Floor ${fl.name || idx} contains no rooms.`);
      } else {
        fl.rooms.forEach((rm, rIdx) => {
          if (!rm.id) errors.push(`Room at floor ${idx}, index ${rIdx} missing id.`);
          if (!rm.bounds || typeof rm.bounds.width !== 'number' || typeof rm.bounds.length !== 'number') {
            errors.push(`Room ${rm.name || rIdx} missing valid bounding dimensions.`);
          }
        });
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
