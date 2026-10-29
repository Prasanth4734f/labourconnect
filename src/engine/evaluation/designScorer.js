/**
 * LabourConnect Design Engine - Architectural Design Quality Scorer & Candidate Ranker
 * 
 * Version: 2.2.0-s2-t07
 * 
 * Implements Sprint 2 Task S2-T07: Candidate Scoring, Ranking and Evaluation.
 * 
 * Multi-objective deterministic evaluation:
 * 1. Requirement Satisfaction: Bedroom count, bath count, essential rooms, requested amenities.
 * 2. Circulation Efficiency: Carpet-to-built-up ratio (75%-85% benchmark) & circulation overhead.
 * 3. Adjacency & Separation: Functional proximity and separation of conflicting zones.
 * 4. Daylight & Ventilation: Exterior wall contact, window exposure, corner cross-ventilation.
 * 5. Space Utilization: Envelope footprint utilization vs wasted plinth void.
 * 6. Room Proportions & Usability: Aspect ratios (L/W) and architectural code usability.
 * 7. Structural & Vertical Alignment: Multi-floor stairwell core continuity and regular column grids.
 * 8. Parking & Access: Portico/parking placement and main entrance exterior accessibility.
 * 9. Style & Spatial Preferences: Alignment with requested architectural style and archetype.
 * 10. Budget Feasibility: Ratio of physical BOQ estimate to user budget (only when reliable data is available).
 * 11. Authentic 8-Directional Vaastu Compliance: Preserves directional alignment scoring.
 * 
 * Hard-Constraint Primacy:
 * Candidates failing hard geometric or architectural constraints are strictly disqualified from
 * outranking valid candidates, regardless of soft score values.
 * 
 * Deterministic Ranking & Tie-Breaking:
 * Multi-candidate evaluation sorts valid candidates by composite score with documented
 * architectural tie-breakers (requirement satisfaction, circulation, space utilization, room proportions, stable ID).
 */

import { areRoomsAdjacent, validateLayoutConstraints, VALIDATION_RESULT_TYPES } from './constraintValidator.js';
import { ROOM_TYPES } from '../schema/canonicalDesignSchema.js';

export const SCORING_ENGINE_VERSION = '2.2.0-s2-t07';

/**
 * Standard Architectural Scoring Criteria IDs
 */
export const SCORING_CRITERIA = Object.freeze({
  REQUIREMENT_SATISFACTION: 'requirementSatisfaction',
  CIRCULATION_EFFICIENCY: 'circulationEfficiency',
  ADJACENCY_SEPARATION: 'adjacencySeparation',
  DAYLIGHT_VENTILATION: 'daylightVentilation',
  SPACE_UTILIZATION: 'spaceUtilization',
  ROOM_PROPORTIONS: 'roomProportions',
  STRUCTURAL_AND_VERTICAL: 'structuralAndVertical',
  PARKING_AND_ACCESS: 'parkingAndAccess',
  STYLE_AND_PREFERENCES: 'styleAndPreferences',
  BUDGET_FEASIBILITY: 'budgetFeasibility',
  VAASTU_COMPLIANCE: 'vaastuCompliance'
});

/**
 * Default Configurable Scoring Weights (sums to 1.00)
 */
export const DEFAULT_SCORING_WEIGHTS = Object.freeze({
  requirementSatisfaction: 0.20, // 20% - Program and requested spaces fulfilled
  circulationEfficiency: 0.15,   // 15% - Carpet ratio, minimal corridor waste
  adjacencySeparation: 0.15,     // 15% - Functional proximity and zone buffers
  daylightVentilation: 0.15,     // 15% - Exterior facade exposure & cross-ventilation
  spaceUtilization: 0.10,        // 10% - Envelope plinth utilization
  roomProportions: 0.10,         // 10% - Usability and aspect ratios
  structuralAndVertical: 0.05,   // 5%  - Multi-floor core alignment & column spans
  parkingAndAccess: 0.05,        // 5%  - Portico entry & entrance accessibility
  styleAndPreferences: 0.05      // 5%  - Architectural style alignment
});

/**
 * Explicit Engineering and Regulatory Disclaimer
 */
export const SCORING_DISCLAIMER = 'Quality scores represent heuristic algorithmic evaluation based on spatial planning principles, National Building Code (NBC) standards, and architectural conventions. They do not constitute professional civil engineering certification, structural safety sanction (IS 456), municipal sanction, or guaranteed constructability.';

// =============================================================================
// SUB-EVALUATOR 1: REQUIREMENT SATISFACTION
// =============================================================================

export function evaluateRequirementSatisfaction(layout, specs = {}) {
  const floors = layout?.floors || [];
  const allRooms = floors.flatMap(f => f.rooms || []);

  const requestedBeds = Math.max(1, specs.bhkCount || 2);
  const requestedBaths = Math.max(1, specs.bathroomsCount || requestedBeds);

  // Placed bedroom count
  const placedBeds = allRooms.filter(r => 
    r.type === ROOM_TYPES.BEDROOM || 
    r.type === ROOM_TYPES.MASTER_BEDROOM || 
    (typeof r.type === 'string' && r.type.includes('bed'))
  ).length;

  // Placed bathroom count
  const placedBaths = allRooms.filter(r => 
    r.type === ROOM_TYPES.BATHROOM || 
    (typeof r.type === 'string' && (r.type.includes('bath') || r.type.includes('toilet')))
  ).length;

  // Essential living zones
  const hasKitchen = allRooms.some(r => r.type === ROOM_TYPES.KITCHEN || (typeof r.name === 'string' && /kitchen/i.test(r.name)));
  const hasLiving = allRooms.some(r => r.type === ROOM_TYPES.LIVING || (typeof r.name === 'string' && /living/i.test(r.name)));
  const hasDining = allRooms.some(r => r.type === ROOM_TYPES.DINING || (typeof r.name === 'string' && /dining/i.test(r.name)));

  const bedScore = Math.min(100, Math.round((placedBeds / requestedBeds) * 100));
  const bathScore = Math.min(100, Math.round((placedBaths / requestedBaths) * 100));
  const kitchenScore = hasKitchen ? 100 : 0;
  const livingScore = hasLiving ? 100 : 0;
  const diningScore = hasDining ? 100 : 70; // Dining combined with living is acceptable

  // Optional requested amenities
  const amenityChecks = [];
  const amenities = specs.amenities || {};

  if (amenities.hasPooja || specs.hasPooja) {
    const hasPooja = allRooms.some(r => r.type === ROOM_TYPES.POOJA || /pooja/i.test(r.name || ''));
    amenityChecks.push({ name: 'Pooja Sanctum', satisfied: hasPooja });
  }

  if (amenities.hasParking || specs.hasParking || (specs.parkingRequirement && specs.parkingRequirement > 0)) {
    const hasParking = allRooms.some(r => r.type === ROOM_TYPES.PORTICO || /portico|parking|porch|garage/i.test(r.name || ''));
    amenityChecks.push({ name: 'Car Parking / Portico', satisfied: hasParking });
  }

  if (amenities.hasBalcony || specs.hasBalcony) {
    const hasBalcony = allRooms.some(r => r.type === ROOM_TYPES.BALCONY || r.type === ROOM_TYPES.TERRACE || /balcony|deck|terrace/i.test(r.name || ''));
    amenityChecks.push({ name: 'Balcony / Open Deck', satisfied: hasBalcony });
  }

  if (amenities.hasCourtyard || specs.hasCourtyard) {
    const hasCourtyard = allRooms.some(r => r.type === ROOM_TYPES.COURTYARD || /courtyard|thotti/i.test(r.name || ''));
    amenityChecks.push({ name: 'Central Courtyard', satisfied: hasCourtyard });
  }

  if (amenities.hasStudy || specs.hasStudy) {
    const hasStudy = allRooms.some(r => r.type === ROOM_TYPES.STUDY || /study|office/i.test(r.name || ''));
    amenityChecks.push({ name: 'Study / Home Office', satisfied: hasStudy });
  }

  let amenityScore = 100;
  if (amenityChecks.length > 0) {
    const satisfiedAmenityCount = amenityChecks.filter(a => a.satisfied).length;
    amenityScore = Math.round((satisfiedAmenityCount / amenityChecks.length) * 100);
  }

  // Composite Requirement Score
  // Weights: Bedrooms 30%, Bathrooms 20%, Kitchen 20%, Living/Dining 15%, Amenities 15%
  const compositeScore = Math.round(
    0.30 * bedScore +
    0.20 * bathScore +
    0.20 * kitchenScore +
    0.15 * ((livingScore + diningScore) / 2) +
    0.15 * amenityScore
  );

  const missingItems = [];
  if (placedBeds < requestedBeds) missingItems.push(`${requestedBeds - placedBeds} bedroom(s) unallocated`);
  if (placedBaths < requestedBaths) missingItems.push(`${requestedBaths - placedBaths} bathroom(s) unallocated`);
  if (!hasKitchen) missingItems.push('Kitchen missing from layout');
  if (!hasLiving) missingItems.push('Living space missing from layout');
  amenityChecks.filter(a => !a.satisfied).forEach(a => missingItems.push(`Requested ${a.name} missing`));

  return {
    score: Math.max(0, Math.min(100, compositeScore)),
    requested: {
      bhkCount: requestedBeds,
      bathroomsCount: requestedBaths,
      amenities: amenityChecks.map(a => a.name)
    },
    placed: {
      bedroomsCount: placedBeds,
      bathroomsCount: placedBaths,
      hasKitchen,
      hasLiving,
      hasDining,
      amenityChecks
    },
    missingItems,
    satisfactionRate: Number((compositeScore / 100).toFixed(2))
  };
}

// =============================================================================
// SUB-EVALUATOR 2: CIRCULATION EFFICIENCY
// =============================================================================

export function evaluateCirculationEfficiency(layout) {
  const metrics = layout?.metrics;
  const floors = layout?.floors || [];

  const builtUp = metrics?.builtUpAreaSqft || floors.reduce((acc, f) => {
    return acc + Math.round((f.rooms || []).reduce((ra, r) => ra + (r.areaSqft || 0), 0) * 1.15);
  }, 0);

  const carpet = metrics?.carpetAreaSqft || floors.reduce((acc, f) => {
    return acc + (f.rooms || []).reduce((ra, r) => ra + (r.areaSqft || 0), 0);
  }, 0);

  const carpetRatio = builtUp > 0 ? (carpet / builtUp) : 0.75;

  let circulationScore = 80;
  let assessment = 'Standard architectural circulation efficiency.';

  if (carpetRatio >= 0.82) {
    circulationScore = 100;
    assessment = 'Highly efficient circulation footprint; minimal floor area absorbed by walls and passages.';
  } else if (carpetRatio >= 0.75) {
    circulationScore = Math.round(85 + ((carpetRatio - 0.75) / 0.07) * 15);
    assessment = 'Optimal circulation ratio within standard residential benchmark (75%-82%).';
  } else if (carpetRatio >= 0.65) {
    circulationScore = Math.round(65 + ((carpetRatio - 0.65) / 0.10) * 20);
    assessment = 'Moderate circulation overhead; secondary corridors consume perceptible floor area.';
  } else {
    circulationScore = Math.max(30, Math.round((carpetRatio / 0.65) * 65));
    assessment = 'Low circulation efficiency; excessive floor area consumed by masonry or oversized transit zones.';
  }

  return {
    score: Math.max(0, Math.min(100, circulationScore)),
    carpetRatio: Number(carpetRatio.toFixed(3)),
    carpetAreaSqft: Math.round(carpet),
    builtUpAreaSqft: Math.round(builtUp),
    assessment
  };
}

// =============================================================================
// SUB-EVALUATOR 3: ADJACENCY & SEPARATION PREFERENCES
// =============================================================================

export function evaluateAdjacencyAndSeparation(layout, _specs = {}) {
  const floors = layout?.floors || [];
  const roomMap = new Map();
  floors.forEach(f => {
    (f.rooms || []).forEach(r => roomMap.set(r.id, r));
  });

  let totalPreferences = 0;
  let satisfiedPreferences = 0;
  const missedPreferences = [];
  const satisfiedPairs = [];

  const softEdges = layout?.adjacencyGraph?.softPreferences || [];

  if (softEdges.length > 0) {
    softEdges.forEach(edge => {
      const roomA = roomMap.get(edge.source);
      const roomB = roomMap.get(edge.target);
      if (!roomA || !roomB) return;

      totalPreferences++;
      const adjacent = areRoomsAdjacent(roomA.bounds, roomB.bounds);

      if (edge.type === 'PREFERRED_ADJACENCY') {
        if (adjacent) {
          satisfiedPreferences++;
          satisfiedPairs.push(`${roomA.name || edge.source} ↔ ${roomB.name || edge.target}`);
        } else {
          missedPreferences.push(`Preferred proximity between "${roomA.name || edge.source}" and "${roomB.name || edge.target}" unfulfilled.`);
        }
      } else if (edge.type === 'REQUIRED_SEPARATION') {
        if (!adjacent) {
          satisfiedPreferences++;
          satisfiedPairs.push(`${roomA.name || edge.source} separated from ${roomB.name || edge.target}`);
        } else {
          missedPreferences.push(`Separation preference compromised: "${roomA.name || edge.source}" touches "${roomB.name || edge.target}".`);
        }
      }
    });
  }

  // Standard architectural pairings if no explicit graph edges provided
  if (totalPreferences === 0) {
    const groundRooms = floors[0]?.rooms || [];
    const findR = (t) => groundRooms.find(r => r.type === t);

    const kitchen = findR(ROOM_TYPES.KITCHEN);
    const dining = findR(ROOM_TYPES.DINING);
    const living = findR(ROOM_TYPES.LIVING);
    const foyer = findR(ROOM_TYPES.FOYER);
    const pooja = findR(ROOM_TYPES.POOJA);

    totalPreferences = 3;

    // Kitchen ↔ Dining proximity
    if (kitchen && dining && areRoomsAdjacent(kitchen.bounds, dining.bounds)) {
      satisfiedPreferences++;
      satisfiedPairs.push('Kitchen ↔ Dining Area');
    } else {
      missedPreferences.push('Kitchen is separated from Dining area.');
    }

    // Living ↔ Dining continuity
    if (living && dining && areRoomsAdjacent(living.bounds, dining.bounds)) {
      satisfiedPreferences++;
      satisfiedPairs.push('Living Lounge ↔ Dining Area');
    } else {
      missedPreferences.push('Living Lounge is detached from Dining space.');
    }

    // Foyer ↔ Living arrival sequence
    if (foyer && living && areRoomsAdjacent(foyer.bounds, living.bounds)) {
      satisfiedPreferences++;
      satisfiedPairs.push('Entrance Foyer ↔ Living Lounge');
    } else {
      satisfiedPreferences++; // Neutral if no foyer exists
    }

    // Pooja sanctity check: Toilet not touching Pooja
    const toilets = groundRooms.filter(r => r.type === ROOM_TYPES.BATHROOM);
    if (pooja && toilets.length > 0) {
      totalPreferences++;
      const touchingToilet = toilets.some(t => areRoomsAdjacent(pooja.bounds, t.bounds));
      if (!touchingToilet) {
        satisfiedPreferences++;
        satisfiedPairs.push('Pooja Sanctum insulated from sanitary spaces');
      } else {
        missedPreferences.push('Pooja Sanctum shares a partition with a sanitary space.');
      }
    }
  }

  const satisfactionRate = totalPreferences > 0 ? (satisfiedPreferences / totalPreferences) : 0.85;
  const score = Math.round(satisfactionRate * 100);

  return {
    score: Math.max(0, Math.min(100, score)),
    totalPreferences,
    satisfiedPreferences,
    satisfactionRate: Number(satisfactionRate.toFixed(2)),
    satisfiedPairs,
    missedPreferences
  };
}

// =============================================================================
// SUB-EVALUATOR 4: DAYLIGHT & VENTILATION
// =============================================================================

export function evaluateDaylightAndVentilation(layout) {
  const floors = layout?.floors || [];
  const env = layout?.site?.buildableEnvelope || { x: 0, y: 0, width: 30, length: 40 };

  let habitableCount = 0;
  let exteriorWallCount = 0;
  let crossVentCount = 0;
  const landlockedRooms = [];

  floors.forEach(f => {
    (f.rooms || []).forEach(r => {
      // Evaluate habitable living spaces
      const isHabitable = (
        r.type === ROOM_TYPES.LIVING ||
        r.type === ROOM_TYPES.MASTER_BEDROOM ||
        r.type === ROOM_TYPES.BEDROOM ||
        r.type === ROOM_TYPES.DINING ||
        r.type === ROOM_TYPES.KITCHEN ||
        r.type === ROOM_TYPES.STUDY
      );

      if (!isHabitable || !r.bounds) return;

      habitableCount++;
      const b = r.bounds;
      let exteriorEdges = 0;

      // Check perimeter wall contact with buildable envelope
      if (Math.abs(b.x - env.x) < 0.6) exteriorEdges++;
      if (Math.abs((b.x + b.width) - (env.x + env.width)) < 0.6) exteriorEdges++;
      if (Math.abs(b.y - env.y) < 0.6) exteriorEdges++;
      if (Math.abs((b.y + b.length) - (env.y + env.length)) < 0.6) exteriorEdges++;

      const hasWindows = Array.isArray(r.windows) && r.windows.length > 0;

      if (exteriorEdges >= 1 || hasWindows) {
        exteriorWallCount++;
      } else {
        landlockedRooms.push(`${r.name || r.id} (${f.name || 'Floor'})`);
      }

      if (exteriorEdges >= 2) {
        crossVentCount++; // Dual-exposure corner room
      }
    });
  });

  const daylightRatio = habitableCount > 0 ? (exteriorWallCount / habitableCount) : 1.0;
  const crossVentRatio = habitableCount > 0 ? (crossVentCount / habitableCount) : 0.35;

  // Composite daylight score: 85% perimeter access + 15% cross-ventilation bonus
  const daylightScore = Math.min(100, Math.round((daylightRatio * 85) + (crossVentRatio * 15)));

  return {
    score: Math.max(0, Math.min(100, daylightScore)),
    habitableRoomsCount: habitableCount,
    daylightExposedCount: exteriorWallCount,
    crossVentilatedCount: crossVentCount,
    daylightExposureRate: Number(daylightRatio.toFixed(2)),
    landlockedRooms,
    disclaimer: 'Heuristic assessment based on envelope facade contact and window placements; does not constitute dynamic raytraced daylight autonomy (sDA) simulation.'
  };
}

// =============================================================================
// SUB-EVALUATOR 5: SPACE UTILIZATION
// =============================================================================

export function evaluateSpaceUtilization(layout) {
  const env = layout?.site?.buildableEnvelope || { width: 30, length: 40 };
  const envArea = env.areaSqft || env.area || (env.width * env.length) || 1200;

  const groundRooms = layout?.floors?.[0]?.rooms || [];
  const plinthOccupied = groundRooms.reduce((acc, r) => {
    return acc + (r.bounds ? (r.bounds.width * r.bounds.length) : (r.areaSqft || 0));
  }, 0);

  const utilizationRatio = envArea > 0 ? (plinthOccupied / envArea) : 0.85;

  let utilizationScore = 85;
  if (utilizationRatio >= 0.80 && utilizationRatio <= 0.98) {
    utilizationScore = Math.min(100, Math.round(92 + ((utilizationRatio - 0.80) / 0.18) * 8));
  } else if (utilizationRatio >= 0.70) {
    utilizationScore = Math.round(80 + ((utilizationRatio - 0.70) / 0.10) * 12);
  } else {
    utilizationScore = Math.max(35, Math.round((utilizationRatio / 0.70) * 80));
  }

  return {
    score: Math.max(0, Math.min(100, utilizationScore)),
    utilizationRatio: Number(utilizationRatio.toFixed(3)),
    plinthOccupiedSqft: Math.round(plinthOccupied),
    envelopeAreaSqft: Math.round(envArea)
  };
}

// =============================================================================
// SUB-EVALUATOR 6: ROOM PROPORTIONS & USABILITY
// =============================================================================

export function evaluateRoomProportions(layout) {
  const floors = layout?.floors || [];
  let evaluatedCount = 0;
  let totalPoints = 0;
  let ratioSum = 0;
  const awkwardRooms = [];

  floors.forEach(f => {
    (f.rooms || []).forEach(r => {
      if (!r.bounds) return;
      evaluatedCount++;

      const w = Math.min(r.bounds.width, r.bounds.length);
      const l = Math.max(r.bounds.width, r.bounds.length);
      const ratio = w > 0 ? (l / w) : 1.0;
      ratioSum += ratio;

      if (ratio <= 1.45) {
        totalPoints += 100;
      } else if (ratio <= 1.75) {
        totalPoints += 85;
      } else if (ratio <= 2.10) {
        totalPoints += 65;
        awkwardRooms.push({ room: r.name || r.id, ratio: Number(ratio.toFixed(2)), issue: 'Approaching corridor proportions' });
      } else {
        totalPoints += 40;
        awkwardRooms.push({ room: r.name || r.id, ratio: Number(ratio.toFixed(2)), issue: 'Awkward elongated proportion' });
      }
    });
  });

  const averageRatio = evaluatedCount > 0 ? Number((ratioSum / evaluatedCount).toFixed(2)) : 1.35;
  const proportionScore = evaluatedCount > 0 ? Math.round(totalPoints / evaluatedCount) : 90;

  return {
    score: Math.max(0, Math.min(100, proportionScore)),
    averageAspectRatio: averageRatio,
    roomsEvaluatedCount: evaluatedCount,
    awkwardRoomsCount: awkwardRooms.length,
    awkwardRooms
  };
}

// =============================================================================
// SUB-EVALUATOR 7: STRUCTURAL & VERTICAL ALIGNMENT
// =============================================================================

export function evaluateStructuralAndVertical(layout, _specs = {}) {
  const floors = layout?.floors || [];
  const isMultiFloor = floors.length > 1;

  let stairScore = 95;
  let maxCentroidDrift = 0;
  let stairwellAligned = true;

  if (isMultiFloor) {
    const groundStair = floors[0]?.rooms?.find(r => r.type === ROOM_TYPES.STAIRWELL);
    const upperStairs = floors.slice(1).map(f => f.rooms?.find(r => r.type === ROOM_TYPES.STAIRWELL));

    if (!groundStair) {
      stairScore = 30;
      stairwellAligned = false;
    } else {
      for (const upperStair of upperStairs) {
        if (!upperStair) {
          stairScore = Math.min(stairScore, 30);
          stairwellAligned = false;
          break;
        }

        const gcX = groundStair.bounds.x + groundStair.bounds.width / 2;
        const gcY = groundStair.bounds.y + groundStair.bounds.length / 2;
        const ucX = upperStair.bounds.x + upperStair.bounds.width / 2;
        const ucY = upperStair.bounds.y + upperStair.bounds.length / 2;

        const drift = Math.sqrt(Math.pow(gcX - ucX, 2) + Math.pow(gcY - ucY, 2));
        maxCentroidDrift = Math.max(maxCentroidDrift, drift);

        if (drift > 1.5) {
          stairScore = 20;
          stairwellAligned = false;
        } else if (drift > 0.5) {
          stairScore = Math.min(stairScore, 65);
          stairwellAligned = false;
        } else {
          stairScore = Math.min(stairScore, 100);
        }
      }
    }
  }

  // Structural Grid regular columns bonus
  const grid = layout?.structuralGrid;
  const hasGrid = grid && grid.columnCount > 0;
  const gridScore = hasGrid ? 95 : 80;

  const compositeScore = isMultiFloor
    ? Math.round(0.60 * stairScore + 0.40 * gridScore)
    : gridScore;

  return {
    score: Math.max(0, Math.min(100, compositeScore)),
    isMultiFloor,
    stairwellAligned,
    maxCentroidDrift: Number(maxCentroidDrift.toFixed(2)),
    hasStructuralGrid: Boolean(hasGrid),
    columnCount: grid?.columnCount || 0
  };
}

// =============================================================================
// SUB-EVALUATOR 8: PARKING & ACCESS REQUIREMENTS
// =============================================================================

export function evaluateParkingAndAccess(layout, specs = {}) {
  const groundRooms = layout?.floors?.[0]?.rooms || [];
  const env = layout?.site?.buildableEnvelope || { y: 0 };

  const parkingRequested = Boolean(
    specs.amenities?.hasParking || 
    specs.hasParking || 
    (specs.parkingRequirement && specs.parkingRequirement > 0)
  );

  let parkingScore = 95;
  let parkingSatisfied = true;

  if (parkingRequested) {
    const portico = groundRooms.find(r => r.type === ROOM_TYPES.PORTICO || /portico|parking|porch|garage/i.test(r.name || ''));
    if (portico) {
      // Check if placed in front zone
      const isFront = portico.bounds && (portico.bounds.y - env.y) < 10.0;
      parkingScore = isFront ? 100 : 80;
      parkingSatisfied = true;
    } else {
      parkingScore = 40;
      parkingSatisfied = false;
    }
  }

  // Entrance accessibility check
  const foyerOrLiving = groundRooms.find(r => 
    r.type === ROOM_TYPES.FOYER || 
    r.type === ROOM_TYPES.PORTICO || 
    r.type === ROOM_TYPES.LIVING
  );

  let entranceAccess = true;
  let entranceScore = 95;

  if (!foyerOrLiving) {
    entranceAccess = false;
    entranceScore = 50;
  } else if (foyerOrLiving.doors && foyerOrLiving.doors.length > 0) {
    entranceScore = 100;
  }

  const compositeScore = Math.round(0.50 * parkingScore + 0.50 * entranceScore);

  return {
    score: Math.max(0, Math.min(100, compositeScore)),
    parkingRequested,
    parkingSatisfied,
    entranceAccess
  };
}

// =============================================================================
// SUB-EVALUATOR 9: STYLE & SPATIAL PREFERENCES
// =============================================================================

export function evaluateStyleAndPreferences(layout, specs = {}) {
  const requestedStyle = specs.archStyle || 'modern';
  const archetype = layout?.archetype || 'STANDARD';
  const groundRooms = layout?.floors?.[0]?.rooms || [];

  let stylePoints = 85;
  const matchedAttributes = [];

  const styleLower = requestedStyle.toLowerCase();

  if (styleLower.includes('traditional') || styleLower.includes('kerala')) {
    const hasPooja = groundRooms.some(r => r.type === ROOM_TYPES.POOJA);
    const hasCourtyard = groundRooms.some(r => r.type === ROOM_TYPES.COURTYARD);
    const hasVerandah = groundRooms.some(r => r.type === ROOM_TYPES.PORTICO);

    if (hasPooja) { stylePoints += 5; matchedAttributes.push('Traditional Pooja Sanctum'); }
    if (hasCourtyard) { stylePoints += 8; matchedAttributes.push('Central Thotti Courtyard'); }
    if (hasVerandah) { stylePoints += 4; matchedAttributes.push('Traditional Poomukham Verandah'); }
  } else if (styleLower.includes('minimalist')) {
    if (archetype === 'LINEAR_SPINE' || archetype === 'OPEN_CONTEMPORARY') {
      stylePoints += 8;
      matchedAttributes.push('Clean Linear Flow Spine');
    }
    const carpetRatio = (layout?.metrics?.carpetAreaSqft && layout?.metrics?.builtUpAreaSqft)
      ? (layout.metrics.carpetAreaSqft / layout.metrics.builtUpAreaSqft)
      : 0.80;
    if (carpetRatio >= 0.78) {
      stylePoints += 5;
      matchedAttributes.push('Zero-waste compact footprint');
    }
  } else if (styleLower.includes('villa') || styleLower.includes('luxury')) {
    const bedCount = groundRooms.filter(r => r.type.includes('bed')).length;
    const bathCount = groundRooms.filter(r => r.type.includes('bath')).length;
    if (bathCount >= bedCount) {
      stylePoints += 6;
      matchedAttributes.push('En-suite attached bathrooms');
    }
    if (layout?.site?.plotAreaSqft > 2500) {
      stylePoints += 6;
      matchedAttributes.push('Expansive plot frontage');
    }
  } else {
    // Modern Contemporary
    const living = groundRooms.find(r => r.type === ROOM_TYPES.LIVING);
    const dining = groundRooms.find(r => r.type === ROOM_TYPES.DINING);
    if (living && dining && areRoomsAdjacent(living.bounds, dining.bounds)) {
      stylePoints += 8;
      matchedAttributes.push('Open-concept Living & Dining');
    }
  }

  const finalScore = Math.min(100, stylePoints);

  return {
    score: finalScore,
    requestedStyle,
    archetype,
    matchedAttributes
  };
}

// =============================================================================
// SUB-EVALUATOR 10: BUDGET FEASIBILITY (DATA-AWARE)
// =============================================================================

export function evaluateBudgetFeasibility(layout, specs = {}, options = {}) {
  const userBudget = specs.homeBudgetInr || options.budgetInr;
  const estimatedCost = layout?.boqEstimate?.totalCostInr || layout?.boqEstimate?.grandTotalInr || options.estimatedCostInr;

  if (typeof userBudget !== 'number' || userBudget <= 0 || typeof estimatedCost !== 'number' || estimatedCost <= 0) {
    return {
      isApplicable: false,
      score: null,
      userBudgetInr: userBudget || null,
      estimatedCostInr: estimatedCost || null,
      varianceRatio: null,
      note: 'Budget feasibility omitted from scoring: reliable user budget or physical BOQ cost estimate unavailable.'
    };
  }

  const costRatio = estimatedCost / userBudget;
  let score = 90;
  let status = 'Within budget';

  if (costRatio <= 1.0) {
    score = 100;
    status = 'Cost is comfortably within user budget.';
  } else if (costRatio <= 1.08) {
    score = Math.round(90 - ((costRatio - 1.0) / 0.08) * 10);
    status = 'Cost slightly exceeds budget by < 8%; within normal construction contingency.';
  } else if (costRatio <= 1.20) {
    score = Math.round(75 - ((costRatio - 1.08) / 0.12) * 20);
    status = 'Cost exceeds budget by 8%-20%; value engineering or material substitution recommended.';
  } else {
    score = Math.max(30, Math.round(50 - ((costRatio - 1.20) / 0.30) * 20));
    status = `Cost significantly exceeds budget by ${Math.round((costRatio - 1.0) * 100)}%; reduction in built-up area required.`;
  }

  return {
    isApplicable: true,
    score: Math.max(0, Math.min(100, score)),
    userBudgetInr: Math.round(userBudget),
    estimatedCostInr: Math.round(estimatedCost),
    varianceRatio: Number(costRatio.toFixed(3)),
    status
  };
}

// =============================================================================
// SUB-EVALUATOR 11: AUTHENTIC 8-DIRECTIONAL VAASTU COMPLIANCE
// =============================================================================

export function evaluateVaastuCompliance(layout, specs = {}) {
  const floors = layout?.floors || [];
  const groundRooms = floors[0]?.rooms || [];
  const roomByType = (t) => groundRooms.find(r => r.type === t);

  let vaastuPoints = 0;
  let maxVaastu = 0;

  // Pooja in North-East (Ishanya)
  const pooja = roomByType(ROOM_TYPES.POOJA);
  if (pooja && pooja.orientation) {
    maxVaastu += 25;
    if (pooja.orientation.includes('North') || pooja.orientation.includes('East')) vaastuPoints += 25;
    else vaastuPoints += 12;
  }

  // Kitchen in South-East (Agni)
  const kitchen = roomByType(ROOM_TYPES.KITCHEN);
  if (kitchen && kitchen.orientation) {
    maxVaastu += 25;
    if (kitchen.orientation.includes('South') || kitchen.orientation.includes('East')) vaastuPoints += 25;
    else vaastuPoints += 15;
  }

  // Master Bedroom in South-West (Nairutya)
  const masterBed = groundRooms.find(r => r.type === ROOM_TYPES.MASTER_BEDROOM) || 
                    floors[1]?.rooms?.find(r => r.type === ROOM_TYPES.MASTER_BEDROOM);
  if (masterBed && masterBed.orientation) {
    maxVaastu += 25;
    if (masterBed.orientation.includes('South') || masterBed.orientation.includes('West')) vaastuPoints += 25;
    else vaastuPoints += 15;
  }

  // Entrance Facing
  maxVaastu += 25;
  const facing = specs.facingDirection || layout?.site?.orientation || 'East';
  if (facing === 'East' || facing === 'North') vaastuPoints += 25;
  else vaastuPoints += 18;

  const vaastuComplianceScore = maxVaastu > 0 ? Math.round((vaastuPoints / maxVaastu) * 100) : 90;

  return {
    score: Math.max(0, Math.min(100, vaastuComplianceScore)),
    vaastuPoints,
    maxVaastu
  };
}

// =============================================================================
// MASTER FUNCTION: SCORE DESIGN QUALITY
// =============================================================================

/**
 * Computes multi-criteria architectural quality score for a layout candidate.
 * 
 * Enforces Hard-Constraint Priority:
 * If the candidate fails hard geometric or architectural constraints,
 * eligibleForRanking is set to false and rankableScore is 0.
 * 
 * @param {Object} layout - Layout candidate structure
 * @param {Object} [specs] - User requirements and plot specifications
 * @param {Object} [options] - Configurable weights and evaluation settings
 * @returns {Object} Comprehensive quality score report
 */
export function scoreDesignQuality(layout, specs = {}, options = {}) {
  // 1. Guard against empty, null, or malformed layout
  if (!layout || typeof layout !== 'object' || !Array.isArray(layout.floors) || layout.floors.length === 0) {
    return {
      overall: 0,
      overallScore: 0,
      rankableScore: 0,
      isValid: false,
      eligibleForRanking: false,
      resultType: VALIDATION_RESULT_TYPES.VALIDATION_ERROR,
      candidateStatus: 'ERROR',
      hardConstraintFailure: true,
      hardViolations: ['Layout candidate is missing, null, or has an invalid floor structure.'],
      breakdown: {},
      circulation: 0,
      daylightVentilation: 0,
      vaastuCompliance: 0,
      structuralEfficiency: 0,
      explanations: ['Candidate rejected due to malformed layout data.'],
      disclaimer: SCORING_DISCLAIMER
    };
  }

  // 2. Validate Hard Constraints via S2-T06 Integration
  const validation = (options.useCachedValidation && layout.validation)
    ? layout.validation
    : validateLayoutConstraints(layout, options);
  const isValid = Boolean(validation?.isValid);
  const resultType = validation?.resultType || (isValid ? VALIDATION_RESULT_TYPES.VALID_CANDIDATE : VALIDATION_RESULT_TYPES.INVALID_CANDIDATE);
  const candidateStatus = validation?.candidateStatus || (isValid ? 'VALID' : 'INVALID');
  const violations = validation?.violations || [];

  // 3. Evaluate Sub-Criteria
  const reqSatisfaction = evaluateRequirementSatisfaction(layout, specs);
  const circulation = evaluateCirculationEfficiency(layout);
  const adjSeparation = evaluateAdjacencyAndSeparation(layout, specs);
  const daylight = evaluateDaylightAndVentilation(layout);
  const spaceUtil = evaluateSpaceUtilization(layout);
  const proportions = evaluateRoomProportions(layout);
  const structural = evaluateStructuralAndVertical(layout, specs);
  const parkingAccess = evaluateParkingAndAccess(layout, specs);
  const stylePrefs = evaluateStyleAndPreferences(layout, specs);
  const budget = evaluateBudgetFeasibility(layout, specs, options);
  const vaastu = evaluateVaastuCompliance(layout, specs);

  // 4. Configure & Normalize Weights
  const rawWeights = { ...DEFAULT_SCORING_WEIGHTS, ...(options.weights || {}) };

  // If budget feasibility is applicable and user specified budget weight, include it
  if (budget.isApplicable && options.weights?.budgetFeasibility) {
    rawWeights.budgetFeasibility = options.weights.budgetFeasibility;
  } else {
    delete rawWeights.budgetFeasibility;
  }

  const weightSum = Object.values(rawWeights).reduce((a, b) => a + b, 0);
  const normalizedWeights = {};
  for (const [k, v] of Object.entries(rawWeights)) {
    normalizedWeights[k] = weightSum > 0 ? (v / weightSum) : 0;
  }

  // 5. Aggregate Soft Score
  let aggregate = 0;
  aggregate += (normalizedWeights.requirementSatisfaction || 0) * reqSatisfaction.score;
  aggregate += (normalizedWeights.circulationEfficiency || 0) * circulation.score;
  aggregate += (normalizedWeights.adjacencySeparation || 0) * adjSeparation.score;
  aggregate += (normalizedWeights.daylightVentilation || 0) * daylight.score;
  aggregate += (normalizedWeights.spaceUtilization || 0) * spaceUtil.score;
  aggregate += (normalizedWeights.roomProportions || 0) * proportions.score;
  aggregate += (normalizedWeights.structuralAndVertical || 0) * structural.score;
  aggregate += (normalizedWeights.parkingAndAccess || 0) * parkingAccess.score;
  aggregate += (normalizedWeights.styleAndPreferences || 0) * stylePrefs.score;
  if (budget.isApplicable && normalizedWeights.budgetFeasibility) {
    aggregate += normalizedWeights.budgetFeasibility * (budget.score || 0);
  }

  const unadjustedSoftScore = Math.max(0, Math.min(100, Math.round(aggregate)));

  // 6. Hard-Constraint Primacy Enforcement
  // An invalid candidate MUST NOT rank above any valid candidate.
  // Rankable score is zeroed for hard-failing candidates.
  const rankableScore = isValid ? unadjustedSoftScore : 0;
  const overall = isValid ? unadjustedSoftScore : 0;

  // 7. Assemble Explanations
  const explanations = [];
  if (!isValid) {
    explanations.push(`DISQUALIFIED: Fails ${violations.length} hard constraint(s): ${violations.slice(0, 3).join('; ')}`);
  } else {
    explanations.push(`Candidate achieves an overall quality score of ${unadjustedSoftScore}/100.`);
    if (reqSatisfaction.score >= 95) explanations.push('Full fulfillment of requested room program and amenities.');
    if (circulation.score >= 90) explanations.push(`High circulation efficiency (${(circulation.carpetRatio * 100).toFixed(1)}% carpet ratio).`);
    if (daylight.score >= 90) explanations.push(`Superb natural daylight exposure (${(daylight.daylightExposureRate * 100).toFixed(0)}% habitable rooms touch exterior walls).`);
    if (adjSeparation.score >= 90) explanations.push('Strong functional adjacency and acoustic separation.');
    if (spaceUtil.score >= 90) explanations.push(`Optimal plinth envelope utilization (${(spaceUtil.utilizationRatio * 100).toFixed(0)}%).`);
  }

  return {
    // Primary scores
    overall,
    overallScore: unadjustedSoftScore,
    rankableScore,
    softScoreUnadjusted: unadjustedSoftScore,

    // Status & Validity
    isValid,
    eligibleForRanking: isValid,
    resultType,
    candidateStatus,
    hardConstraintFailure: !isValid,
    hardViolations: violations,

    // Criterion Breakdown
    breakdown: {
      requirementSatisfaction: reqSatisfaction,
      circulationEfficiency: circulation,
      adjacencySeparation: adjSeparation,
      daylightVentilation: daylight,
      spaceUtilization: spaceUtil,
      roomProportions: proportions,
      structuralAndVertical: structural,
      parkingAndAccess: parkingAccess,
      styleAndPreferences: stylePrefs,
      budgetFeasibility: budget,
      vaastuCompliance: vaastu
    },

    // Legacy backward-compatibility aliases
    circulation: circulation.score,
    daylightVentilation: daylight.score,
    vaastuCompliance: vaastu.score,
    structuralEfficiency: structural.score,

    weights: normalizedWeights,
    explanations,
    disclaimer: SCORING_DISCLAIMER
  };
}

// =============================================================================
// CANDIDATE RANKING & EVALUATION ENGINE
// =============================================================================

/**
 * Deterministically ranks multiple candidate layouts.
 * 
 * Rules:
 * 1. Valid candidates always rank ahead of invalid candidates.
 * 2. Valid candidates sorted by rankableScore descending.
 * 3. Tie-breaking among valid candidates:
 *    a. Requirement satisfaction score
 *    b. Circulation efficiency score
 *    c. Space utilization score
 *    d. Room proportions score
 *    e. Stable candidate ID (localeCompare)
 * 4. Invalid candidates ranked at bottom by violation count, then stable ID.
 * 
 * @param {Array<Object>} candidates - Array of candidate layout objects
 * @param {Object} [specs] - User requirements and plot specs
 * @param {Object} [options] - Configurable weights, sorting options
 * @returns {Object} Deterministic ranking report
 */
export function rankCandidates(candidates, specs = {}, options = {}) {
  if (!Array.isArray(candidates) || candidates.length === 0) {
    return {
      success: true,
      totalEvaluated: 0,
      validCount: 0,
      invalidCount: 0,
      rankedCandidates: [],
      topCandidate: null,
      topCandidateId: null,
      rankingSummary: 'No candidates provided for evaluation.',
      disclaimer: SCORING_DISCLAIMER
    };
  }

  // 1. Score every candidate
  const evaluatedList = candidates.map((cand, idx) => {
    const candidateId = cand?.candidateId || cand?.id || `candidate_${idx + 1}`;
    const scores = (cand?.scores && !options.forceRescore)
      ? cand.scores
      : scoreDesignQuality(cand, specs, options);

    return {
      candidateId,
      candidate: cand,
      scores,
      isValid: Boolean(scores.isValid),
      eligibleForRanking: Boolean(scores.eligibleForRanking),
      rankableScore: scores.rankableScore || 0,
      softScore: scores.overallScore || 0,
      resultType: scores.resultType || 'UNKNOWN'
    };
  });

  // 2. Partition into valid and invalid lists
  const validList = evaluatedList.filter(item => item.isValid && item.eligibleForRanking);
  const invalidList = evaluatedList.filter(item => !item.isValid || !item.eligibleForRanking);

  // 3. Deterministically sort valid candidates
  validList.sort((a, b) => {
    // Primary: rankableScore descending
    if (b.rankableScore !== a.rankableScore) {
      return b.rankableScore - a.rankableScore;
    }

    // Tie-breaker 1: Requirement satisfaction score
    const reqA = a.scores.breakdown?.requirementSatisfaction?.score || 0;
    const reqB = b.scores.breakdown?.requirementSatisfaction?.score || 0;
    if (reqB !== reqA) return reqB - reqA;

    // Tie-breaker 2: Circulation efficiency score
    const circA = a.scores.breakdown?.circulationEfficiency?.score || 0;
    const circB = b.scores.breakdown?.circulationEfficiency?.score || 0;
    if (circB !== circA) return circB - circA;

    // Tie-breaker 3: Space utilization score
    const utilA = a.scores.breakdown?.spaceUtilization?.score || 0;
    const utilB = b.scores.breakdown?.spaceUtilization?.score || 0;
    if (utilB !== utilA) return utilB - utilA;

    // Tie-breaker 4: Room proportions score
    const propA = a.scores.breakdown?.roomProportions?.score || 0;
    const propB = b.scores.breakdown?.roomProportions?.score || 0;
    if (propB !== propA) return propB - propA;

    // Tie-breaker 5: Deterministic stable ID (never random seeds!)
    return String(a.candidateId).localeCompare(String(b.candidateId));
  });

  // 4. Deterministically sort invalid candidates (at the bottom)
  invalidList.sort((a, b) => {
    // Fewer violations ranks higher among invalid candidates
    const violsA = a.scores.hardViolations?.length || 999;
    const violsB = b.scores.hardViolations?.length || 999;
    if (violsA !== violsB) return violsA - violsB;

    return String(a.candidateId).localeCompare(String(b.candidateId));
  });

  // 5. Assign sequential ranks & explanations
  const rankedCandidates = [];
  let currentRank = 1;

  // Process valid candidates
  validList.forEach((item, idx) => {
    const nextItem = validList[idx + 1];
    let explanation = `Rank ${currentRank}: Score ${item.rankableScore}/100.`;

    if (idx === 0) {
      explanation += ' Top-ranked design satisfying all hard constraints and scoring highest across multi-criteria evaluation.';
    } else {
      const prevItem = validList[idx - 1];
      const delta = prevItem.rankableScore - item.rankableScore;
      if (delta > 0) {
        explanation += ` Trailing Rank ${currentRank - 1} by -${delta} pts.`;
      } else {
        explanation += ` Tied on overall score with Rank ${currentRank - 1}; differentiated via architectural tie-breakers.`;
      }
    }

    const deltaVsNext = nextItem ? {
      nextCandidateId: nextItem.candidateId,
      deltaOverall: item.rankableScore - nextItem.rankableScore,
      keyDifferentiators: findKeyDifferentiators(item.scores, nextItem.scores)
    } : null;

    rankedCandidates.push({
      rank: currentRank++,
      candidateId: item.candidateId,
      candidate: item.candidate,
      isValid: true,
      eligibleForRanking: true,
      rankableScore: item.rankableScore,
      overallScore: item.softScore,
      scores: item.scores,
      explanation,
      deltaVsNext,
      isDisqualified: false
    });
  });

  // Process invalid candidates
  invalidList.forEach((item) => {
    const violations = item.scores.hardViolations || [];
    const explanation = `Rank ${currentRank} (DISQUALIFIED): Excluded from architectural ranking due to ${violations.length} hard constraint violation(s): ${violations.slice(0, 2).join('; ')}`;

    rankedCandidates.push({
      rank: currentRank++,
      candidateId: item.candidateId,
      candidate: item.candidate,
      isValid: false,
      eligibleForRanking: false,
      rankableScore: 0,
      overallScore: item.softScore,
      scores: item.scores,
      explanation,
      deltaVsNext: null,
      isDisqualified: true,
      disqualificationReasons: violations
    });
  });

  const top = rankedCandidates.find(c => c.isValid) || null;
  const rankingSummary = top 
    ? `Successfully ranked ${validList.length} valid candidate(s). Top candidate "${top.candidateId}" achieved ${top.rankableScore}/100.`
    : `Zero candidates satisfied hard constraints; all ${candidates.length} candidate(s) are disqualified.`;

  return {
    success: true,
    totalEvaluated: candidates.length,
    validCount: validList.length,
    invalidCount: invalidList.length,
    rankedCandidates,
    topCandidate: top ? top.candidate : null,
    topCandidateId: top ? top.candidateId : null,
    rankingSummary,
    disclaimer: SCORING_DISCLAIMER
  };
}

/**
 * Identifies key metric deltas between two scored candidates.
 */
function findKeyDifferentiators(scoresA, scoresB) {
  const diffs = [];
  const bA = scoresA.breakdown || {};
  const bB = scoresB.breakdown || {};

  const criteriaKeys = [
    ['circulationEfficiency', 'Circulation Efficiency'],
    ['daylightVentilation', 'Daylight Exposure'],
    ['spaceUtilization', 'Plinth Utilization'],
    ['roomProportions', 'Room Proportions'],
    ['requirementSatisfaction', 'Program Satisfaction'],
    ['adjacencySeparation', 'Adjacency Satisfaction']
  ];

  for (const [key, label] of criteriaKeys) {
    const sA = bA[key]?.score || 0;
    const sB = bB[key]?.score || 0;
    const delta = sA - sB;
    if (Math.abs(delta) >= 5) {
      diffs.push(`${label} (${delta > 0 ? '+' : ''}${delta} pts)`);
    }
  }

  return diffs;
}

/**
 * Performs a side-by-side head-to-head architectural comparison between two candidates.
 */
export function compareTwoCandidates(candidateA, candidateB, specs = {}, options = {}) {
  const scoreA = scoreDesignQuality(candidateA, specs, options);
  const scoreB = scoreDesignQuality(candidateB, specs, options);

  const idA = candidateA?.candidateId || candidateA?.id || 'Candidate A';
  const idB = candidateB?.candidateId || candidateB?.id || 'Candidate B';

  const differentiators = findKeyDifferentiators(scoreA, scoreB);

  let verdict = '';
  if (scoreA.isValid && !scoreB.isValid) {
    verdict = `${idA} wins decisively: ${idA} is valid, while ${idB} is disqualified on hard constraints.`;
  } else if (!scoreA.isValid && scoreB.isValid) {
    verdict = `${idB} wins decisively: ${idB} is valid, while ${idA} is disqualified on hard constraints.`;
  } else if (!scoreA.isValid && !scoreB.isValid) {
    verdict = 'Both candidates fail hard constraints and are ineligible for production acceptance.';
  } else if (scoreA.rankableScore > scoreB.rankableScore) {
    verdict = `${idA} (${scoreA.rankableScore}/100) outranks ${idB} (${scoreB.rankableScore}/100) by +${scoreA.rankableScore - scoreB.rankableScore} pts.`;
  } else if (scoreB.rankableScore > scoreA.rankableScore) {
    verdict = `${idB} (${scoreB.rankableScore}/100) outranks ${idA} (${scoreA.rankableScore}/100) by +${scoreB.rankableScore - scoreA.rankableScore} pts.`;
  } else {
    verdict = `${idA} and ${idB} are tied on overall score (${scoreA.rankableScore}/100).`;
  }

  return {
    candidateA: { id: idA, scores: scoreA },
    candidateB: { id: idB, scores: scoreB },
    verdict,
    keyDifferentiators: differentiators,
    disclaimer: SCORING_DISCLAIMER
  };
}
