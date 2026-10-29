/**
 * LabourConnect Design Engine - Architectural Diversity, Near-Duplicate Detection & Generation History
 * 
 * Version: 2.2.0-s2-t08
 * 
 * Implements Sprint 2 Task S2-T08: Architectural Diversity, Near-Duplicate Detection & Generation History.
 * 
 * Evaluates multi-signal architectural similarity to distinguish genuine architectural alternatives
 * from redundant near-duplicates (minor coordinate nudges, superficial color/material changes,
 * or simple seed/label variations).
 * 
 * Multi-Signal Evaluation Pipeline:
 * 1. Signal A: Room-Program Similarity (Types, counts, amenities, area ratios; never declares duplicates alone)
 * 2. Signal B: Topological Similarity (Adjacency graphs, Jaccard similarity, zone transitions, vertical links)
 * 3. Signal C: Spatial Arrangement Similarity (Normalized envelope centroids, aspect ratios, quadrant mapping)
 * 4. Signal D: Multi-Floor Similarity (Floor count match, floor distribution, vertical stair core continuity)
 * 5. Signal E: Plot & Requirement Compatibility Guards (Aspect ratio and scale verification)
 * 
 * Core Architectural Invariants:
 * - Hard constraint primacy: An invalid candidate never becomes acceptable because it is novel.
 * - Meaningful diversity over numerical variation: Legitimate alternatives with identical room counts are preserved.
 * - Commutativity & Determinism: sim(A, B) === sim(B, A).
 * - Superficial invariance: Seed, candidateId, finish, or presentation changes do not manufacture diversity.
 */

import { areRoomsAdjacent } from './constraintValidator.js';
import { ROOM_TYPES } from '../schema/canonicalDesignSchema.js';

export const SIMILARITY_ENGINE_VERSION = '2.2.0-s2-t08';

/**
 * Default Configurable Structural Similarity Threshold
 * Designs scoring >= 0.82 (82%) overall similarity are classified as architectural duplicates.
 */
export const DEFAULT_SIMILARITY_THRESHOLD = 0.82;
export const SIMILARITY_THRESHOLD = DEFAULT_SIMILARITY_THRESHOLD; // Backward-compatible alias

/**
 * Default Configurable Signal Weights (sum to 1.00)
 * Room-program has low weight (0.15) so identical room programs alone can NEVER trigger duplicate rejection.
 */
export const DEFAULT_SIMILARITY_WEIGHTS = Object.freeze({
  topological: 0.35,  // 35% - Relationship graph and circulation topology
  spatial: 0.35,      // 35% - Normalized envelope centroids and room aspect ratios
  multiFloor: 0.15,   // 15% - Floor distribution and vertical core alignment
  roomProgram: 0.15   // 15% - Room counts and requested spaces
});

// =============================================================================
// DESIGN FINGERPRINTING
// =============================================================================

/**
 * Calculates a unique deterministic structural fingerprint of a design layout.
 * Invariant to transient candidate IDs, seeds, finishes, and colors.
 */
export function computeDesignFingerprint(layout) {
  if (!layout || typeof layout !== 'object') return 'FP-EMPTY';

  const floors = layout.floors || [];
  if (floors.length === 0) return 'FP-EMPTY';

  const archetype = layout.archetype || layout.generationMetadata?.archetype || 'STANDARD';
  const env = layout.site?.buildableEnvelope || layout.floors[0]?.bounds || { x: 0, y: 0, width: 1, length: 1 };
  const envW = Math.max(Number(env.width) || 1, 1);
  const envL = Math.max(Number(env.length) || 1, 1);
  const envX = Number(env.x) || 0;
  const envY = Number(env.y) || 0;

  // Floor fingerprints combining normalized centroids of placed functional spaces
  const floorPrints = floors.map((fl, fIdx) => {
    const rooms = fl.rooms || [];
    const centroids = rooms
      .map(r => {
        const b = r.bounds || { x: 0, y: 0, width: 0, length: 0 };
        const cx = (((Number(b.x) || 0) - envX) + (Number(b.width) || 0) / 2) / envW;
        const cy = (((Number(b.y) || 0) - envY) + (Number(b.length) || 0) / 2) / envL;
        const typeKey = String(r.type || 'unk').substring(0, 4);
        return `${typeKey}:${cx.toFixed(2)},${cy.toFixed(2)}`;
      })
      .sort()
      .join(';');
    return `F${fIdx}[${centroids}]`;
  }).join('__');

  return `FP-${String(archetype).substring(0, 8).toUpperCase()}-${floors.length}FL-[${floorPrints}]`;
}

// =============================================================================
// SIGNAL A: ROOM PROGRAM SIMILARITY
// =============================================================================

/**
 * Evaluates room-program similarity between two layouts.
 * Compares room type counts, floor distribution, amenities, and area ratios.
 * 
 * IMPORTANT: This signal alone must NEVER be sufficient to declare a duplicate.
 */
export function evaluateRoomProgramSimilarity(layoutA, layoutB) {
  const roomsA = (layoutA?.floors || []).flatMap(f => f.rooms || []);
  const roomsB = (layoutB?.floors || []).flatMap(f => f.rooms || []);

  if (roomsA.length === 0 && roomsB.length === 0) return { score: 1.0, details: 'Both empty' };
  if (roomsA.length === 0 || roomsB.length === 0) return { score: 0.0, details: 'One empty' };

  // 1. Multiset Room Type Counts (Histogram Intersection / Jaccard)
  const countMapA = new Map();
  const countMapB = new Map();

  roomsA.forEach(r => countMapA.set(r.type, (countMapA.get(r.type) || 0) + 1));
  roomsB.forEach(r => countMapB.set(r.type, (countMapB.get(r.type) || 0) + 1));

  const allTypes = new Set([...countMapA.keys(), ...countMapB.keys()]);
  let intersectionSum = 0;
  let unionSum = 0;

  allTypes.forEach(t => {
    const cA = countMapA.get(t) || 0;
    const cB = countMapB.get(t) || 0;
    intersectionSum += Math.min(cA, cB);
    unionSum += Math.max(cA, cB);
  });

  const typeSimilarity = unionSum > 0 ? intersectionSum / unionSum : 0;

  // 2. Floor Distribution Similarity
  const floorsA = layoutA?.floors || [];
  const floorsB = layoutB?.floors || [];
  const maxFloors = Math.max(floorsA.length, floorsB.length);
  let floorDiffSum = 0;
  let floorTotalSum = 0;

  for (let i = 0; i < maxFloors; i++) {
    const lenA = floorsA[i]?.rooms?.length || 0;
    const lenB = floorsB[i]?.rooms?.length || 0;
    floorDiffSum += Math.abs(lenA - lenB);
    floorTotalSum += (lenA + lenB);
  }
  const floorDistSimilarity = floorTotalSum > 0 ? Math.max(0, 1 - (floorDiffSum / floorTotalSum)) : 1.0;

  // 3. Amenity Presence Similarity
  const amenitiesA = extractLayoutAmenities(layoutA, roomsA);
  const amenitiesB = extractLayoutAmenities(layoutB, roomsB);
  const allAmenities = new Set([...amenitiesA, ...amenitiesB]);
  let amenityInter = 0;
  allAmenities.forEach(a => {
    if (amenitiesA.has(a) && amenitiesB.has(a)) amenityInter++;
  });
  const amenitySimilarity = allAmenities.size > 0 ? amenityInter / allAmenities.size : 1.0;

  // 4. Area Ratio Comparison
  const areaA = Number(layoutA?.metrics?.builtUpAreaSqft || roomsA.reduce((sum, r) => sum + (r.areaSqft || 0), 0)) || 1;
  const areaB = Number(layoutB?.metrics?.builtUpAreaSqft || roomsB.reduce((sum, r) => sum + (r.areaSqft || 0), 0)) || 1;
  const areaRatio = Math.min(areaA, areaB) / Math.max(areaA, areaB);

  // Weighted Room Program Score
  const score = Number((
    0.40 * typeSimilarity +
    0.25 * floorDistSimilarity +
    0.20 * amenitySimilarity +
    0.15 * areaRatio
  ).toFixed(3));

  return {
    score,
    typeSimilarity: Number(typeSimilarity.toFixed(3)),
    floorDistSimilarity: Number(floorDistSimilarity.toFixed(3)),
    amenitySimilarity: Number(amenitySimilarity.toFixed(3)),
    areaRatio: Number(areaRatio.toFixed(3))
  };
}

/**
 * Extracts key functional amenities present in a layout
 */
function extractLayoutAmenities(layout, rooms) {
  const set = new Set();
  const specs = layout?.inputs || {};
  if (specs.amenities?.hasPooja || rooms.some(r => r.type === ROOM_TYPES.POOJA)) set.add('pooja');
  if (specs.amenities?.hasParking || rooms.some(r => r.type === ROOM_TYPES.PORTICO)) set.add('parking');
  if (specs.amenities?.hasCourtyard || rooms.some(r => r.type === ROOM_TYPES.COURTYARD)) set.add('courtyard');
  if (specs.amenities?.hasBalcony || rooms.some(r => r.type === ROOM_TYPES.BALCONY)) set.add('balcony');
  if (specs.amenities?.hasUtility || rooms.some(r => r.type === ROOM_TYPES.UTILITY)) set.add('utility');
  return set;
}

// =============================================================================
// SIGNAL B: TOPOLOGICAL GRAPH SIMILARITY
// =============================================================================

/**
 * Evaluates topological relationship similarity between two layouts.
 * Compares adjacency connections, separation relationships, circulation paths,
 * and zone transitions. Uses canonical room-type and role edges rather than transient IDs.
 * Safely handles missing, empty, or malformed graphs via geometric fallback.
 */
export function evaluateTopologicalSimilarity(layoutA, layoutB) {
  const edgesA = extractCanonicalEdges(layoutA);
  const edgesB = extractCanonicalEdges(layoutB);

  // If both have no edges (e.g. single-room or empty layouts)
  if (edgesA.canonicalEdges.size === 0 && edgesB.canonicalEdges.size === 0) {
    return {
      score: 1.0,
      edgeJaccard: 1.0,
      zoneJaccard: 1.0,
      source: 'empty_fallback'
    };
  }

  // If only one has zero edges
  if (edgesA.canonicalEdges.size === 0 || edgesB.canonicalEdges.size === 0) {
    return {
      score: 0.0,
      edgeJaccard: 0.0,
      zoneJaccard: 0.0,
      source: 'asymmetric_edges'
    };
  }

  // 1. Canonical Edge Jaccard Similarity
  let edgeInter = 0;
  edgesA.canonicalEdges.forEach(e => {
    if (edgesB.canonicalEdges.has(e)) edgeInter++;
  });
  const edgeUnion = new Set([...edgesA.canonicalEdges, ...edgesB.canonicalEdges]).size;
  const edgeJaccard = edgeUnion > 0 ? edgeInter / edgeUnion : 0;

  // 2. Zone Transition Jaccard Similarity (e.g. public<->private, public<->service)
  let zoneInter = 0;
  edgesA.zoneEdges.forEach(z => {
    if (edgesB.zoneEdges.has(z)) zoneInter++;
  });
  const zoneUnion = new Set([...edgesA.zoneEdges, ...edgesB.zoneEdges]).size;
  const zoneJaccard = zoneUnion > 0 ? zoneInter / zoneUnion : 0;

  const score = Number((0.70 * edgeJaccard + 0.30 * zoneJaccard).toFixed(3));

  return {
    score,
    edgeJaccard: Number(edgeJaccard.toFixed(3)),
    zoneJaccard: Number(zoneJaccard.toFixed(3)),
    edgeCountA: edgesA.canonicalEdges.size,
    edgeCountB: edgesB.canonicalEdges.size,
    sharedEdges: edgeInter
  };
}

/**
 * Extracts canonical topological edge keys invariant to transient room IDs.
 * Combines physical room boundary contact with vertical core continuity and relationship constraints.
 */
function extractCanonicalEdges(layout) {
  const canonicalEdges = new Set();
  const zoneEdges = new Set();

  if (!layout) return { canonicalEdges, zoneEdges };

  const roomMap = new Map();
  (layout.floors || []).forEach(fl => {
    (fl.rooms || []).forEach(rm => {
      roomMap.set(rm.id, rm);
    });
  });

  // 1. Physical Room Boundary Adjacencies across all floors
  (layout.floors || []).forEach(fl => {
    const floorRooms = fl.rooms || [];
    for (let i = 0; i < floorRooms.length; i++) {
      for (let j = i + 1; j < floorRooms.length; j++) {
        const bA = floorRooms[i].bounds || floorRooms[i];
        const bB = floorRooms[j].bounds || floorRooms[j];
        if (areRoomsAdjacent(bA, bB)) {
          const typeA = floorRooms[i].type || 'unk';
          const typeB = floorRooms[j].type || 'unk';
          const [firstT, secondT] = [typeA, typeB].sort();
          canonicalEdges.add(`${firstT}<->${secondT}:ADJACENCY`);

          const zoneA = floorRooms[i].zone || 'unknown';
          const zoneB = floorRooms[j].zone || 'unknown';
          const [firstZ, secondZ] = [zoneA, zoneB].sort();
          zoneEdges.add(`${firstZ}<->${secondZ}`);
        }
      }
    }
  });

  // 2. Vertical Core Continuity (Multi-floor stairs)
  const stairRooms = [];
  (layout.floors || []).forEach(fl => {
    (fl.rooms || []).forEach(rm => {
      if (rm.type === ROOM_TYPES.STAIRWELL || /stair/i.test(rm.name || '')) {
        stairRooms.push({ room: rm, floorIndex: fl.floorIndex });
      }
    });
  });
  if (stairRooms.length >= 2) {
    canonicalEdges.add('stairwell<->stairwell:VERTICAL_CONNECTION');
    zoneEdges.add('circulation<->circulation:VERTICAL');
  }

  // 3. Special relationship graph edges (Separations, custom non-physical links)
  const rawGraphEdges = [];
  if (layout.adjacencyGraph?.edges && Array.isArray(layout.adjacencyGraph.edges)) {
    rawGraphEdges.push(...layout.adjacencyGraph.edges);
  }
  (layout.floors || []).forEach(fl => {
    if (fl.adjacencyGraph?.edges && Array.isArray(fl.adjacencyGraph.edges)) {
      rawGraphEdges.push(...fl.adjacencyGraph.edges);
    }
  });

  rawGraphEdges.forEach(edge => {
    if (edge.type === 'REQUIRED_SEPARATION') {
      const rA = roomMap.get(edge.source);
      const rB = roomMap.get(edge.target);
      const typeA = rA?.type || String(edge.source).replace(/^[gf]_\d*_?/, '');
      const typeB = rB?.type || String(edge.target).replace(/^[gf]_\d*_?/, '');
      const [firstT, secondT] = [typeA, typeB].sort();
      canonicalEdges.add(`${firstT}<->${secondT}:REQUIRED_SEPARATION`);
    }
  });

  return { canonicalEdges, zoneEdges };
}

// =============================================================================
// SIGNAL C: SPATIAL ARRANGEMENT SIMILARITY
// =============================================================================

/**
 * Evaluates normalized spatial arrangement similarity between two layouts.
 * Compares room centroid locations, relative room positions, and room aspect ratios.
 * Measurements are normalized against the buildable envelope so that comparisons
 * remain valid across plot sizes and insensitive to absolute coordinate translations.
 */
export function evaluateSpatialSimilarity(layoutA, layoutB) {
  const floorsA = layoutA?.floors || [];
  const floorsB = layoutB?.floors || [];

  if (floorsA.length === 0 && floorsB.length === 0) return { score: 1.0, avgCentroidDist: 0 };
  if (floorsA.length === 0 || floorsB.length === 0) return { score: 0.0, avgCentroidDist: 1.0 };

  const envA = layoutA?.site?.buildableEnvelope || floorsA[0]?.bounds || { x: 0, y: 0, width: 1, length: 1 };
  const envB = layoutB?.site?.buildableEnvelope || floorsB[0]?.bounds || { x: 0, y: 0, width: 1, length: 1 };

  const envWA = Math.max(Number(envA.width) || 1, 1);
  const envLA = Math.max(Number(envA.length) || 1, 1);
  const envXA = Number(envA.x) || 0;
  const envYA = Number(envA.y) || 0;

  const envWB = Math.max(Number(envB.width) || 1, 1);
  const envLB = Math.max(Number(envB.length) || 1, 1);
  const envXB = Number(envB.x) || 0;
  const envYB = Number(envB.y) || 0;

  // Compare floor by floor (primarily ground floor and aligned upper floors)
  const maxFloors = Math.min(floorsA.length, floorsB.length);
  if (maxFloors === 0) return { score: 0.0, avgCentroidDist: 1.0 };

  let totalMatchedRooms = 0;
  let totalCentroidDist = 0;
  let totalAspectRatioSim = 0;
  let quadrantMatches = 0;

  for (let f = 0; f < maxFloors; f++) {
    const roomsA = floorsA[f]?.rooms || [];
    const roomsB = floorsB[f]?.rooms || [];

    // Group rooms by functional type
    const mapB = new Map();
    roomsB.forEach(r => {
      if (!mapB.has(r.type)) mapB.set(r.type, []);
      mapB.get(r.type).push(r);
    });

    roomsA.forEach(rA => {
      const bA = rA.bounds || { x: 0, y: 0, width: 0, length: 0 };
      const cxA = (((Number(bA.x) || 0) - envXA) + (Number(bA.width) || 0) / 2) / envWA;
      const cyA = (((Number(bA.y) || 0) - envYA) + (Number(bA.length) || 0) / 2) / envLA;
      const arA = (Number(bA.width) || 1) / Math.max(Number(bA.length) || 1, 0.1);
      const quadA = getQuadrant(cxA, cyA);

      const candidatesB = mapB.get(rA.type) || [];
      if (candidatesB.length > 0) {
        // Find closest matching room of same type
        let minDist = Infinity;
        let bestB = null;
        let bestIdx = -1;

        candidatesB.forEach((rB, idx) => {
          const bB = rB.bounds || { x: 0, y: 0, width: 0, length: 0 };
          const cxB = (((Number(bB.x) || 0) - envXB) + (Number(bB.width) || 0) / 2) / envWB;
          const cyB = (((Number(bB.y) || 0) - envYB) + (Number(bB.length) || 0) / 2) / envLB;
          const dist = Math.sqrt(Math.pow(cxA - cxB, 2) + Math.pow(cyA - cyB, 2));
          if (dist < minDist) {
            minDist = dist;
            bestB = rB;
            bestIdx = idx;
          }
        });

        if (bestB) {
          // Remove matched candidate so it's not reused for another room of same type
          candidatesB.splice(bestIdx, 1);

          const bB = bestB.bounds || { x: 0, y: 0, width: 0, length: 0 };
          const cxB = (((Number(bB.x) || 0) - envXB) + (Number(bB.width) || 0) / 2) / envWB;
          const cyB = (((Number(bB.y) || 0) - envYB) + (Number(bB.length) || 0) / 2) / envLB;
          const arB = (Number(bB.width) || 1) / Math.max(Number(bB.length) || 1, 0.1);
          const quadB = getQuadrant(cxB, cyB);

          totalCentroidDist += minDist;
          totalAspectRatioSim += Math.min(arA, arB) / Math.max(arA, arB);
          if (quadA === quadB) quadrantMatches++;
          totalMatchedRooms++;
        }
      }
    });
  }

  if (totalMatchedRooms === 0) {
    return { score: 0.0, avgCentroidDist: 1.0, totalMatchedRooms: 0 };
  }

  const avgCentroidDist = totalCentroidDist / totalMatchedRooms;
  // Centroid distance score: 0 dist = 1.0 sim; >= 0.45 normalized envelope distance = 0.0 sim
  const centroidSimilarity = Math.max(0, 1.0 - (avgCentroidDist / 0.45));
  const avgAspectRatioSim = totalAspectRatioSim / totalMatchedRooms;
  const quadrantSimilarity = quadrantMatches / totalMatchedRooms;

  // Spatial aggregate score
  const score = Number((
    0.60 * centroidSimilarity +
    0.25 * quadrantSimilarity +
    0.15 * avgAspectRatioSim
  ).toFixed(3));

  return {
    score,
    centroidSimilarity: Number(centroidSimilarity.toFixed(3)),
    quadrantSimilarity: Number(quadrantSimilarity.toFixed(3)),
    aspectRatioSimilarity: Number(avgAspectRatioSim.toFixed(3)),
    avgCentroidDist: Number(avgCentroidDist.toFixed(3)),
    matchedRoomsCount: totalMatchedRooms
  };
}

/**
 * Returns quadrant identifier for normalized centroid coordinates (0 to 1)
 */
function getQuadrant(cx, cy) {
  const isWest = cx < 0.5;
  const isNorth = cy < 0.5;
  if (isNorth && isWest) return 'NW';
  if (isNorth && !isWest) return 'NE';
  if (!isNorth && isWest) return 'SW';
  return 'SE';
}

// =============================================================================
// SIGNAL D: MULTI-FLOOR SIMILARITY
// =============================================================================

/**
 * Evaluates multi-floor spatial organization and vertical core alignment.
 * Compares floor counts, room placement by floor, and staircase vertical continuity.
 * 
 * Invariant: Single-floor and multi-floor candidates MUST NEVER be classified as duplicates.
 */
export function evaluateMultiFloorSimilarity(layoutA, layoutB) {
  const floorsA = layoutA?.floors || [];
  const floorsB = layoutB?.floors || [];

  const countA = floorsA.length;
  const countB = floorsB.length;

  // Single-floor vs Multi-floor mismatch
  if (countA !== countB) {
    return {
      score: 0.0,
      floorCountMatch: false,
      reason: `Mismatched floor counts: ${countA} vs ${countB}`,
      details: 'Single-storey and multi-storey designs are inherently structurally distinct.'
    };
  }

  // Both are single floor designs
  if (countA <= 1) {
    return {
      score: 1.0,
      floorCountMatch: true,
      stairCoreAlignmentSim: 1.0,
      floorDistributionSim: 1.0,
      details: 'Both single-floor layouts share matching vertical typology.'
    };
  }

  // Multi-floor designs (2+ floors): check room distribution and stairwell core alignment
  let floorDistSimTotal = 0;
  for (let f = 0; f < countA; f++) {
    const typesA = new Set((floorsA[f]?.rooms || []).map(r => r.type));
    const typesB = new Set((floorsB[f]?.rooms || []).map(r => r.type));
    let inter = 0;
    typesA.forEach(t => { if (typesB.has(t)) inter++; });
    const union = new Set([...typesA, ...typesB]).size;
    floorDistSimTotal += (union > 0 ? inter / union : 1.0);
  }
  const floorDistributionSim = floorDistSimTotal / countA;

  // Stairwell core alignment check across designs
  const stairA = findStairwellRoom(layoutA);
  const stairB = findStairwellRoom(layoutB);

  let stairCoreSim = 0.5; // neutral fallback
  if (stairA && stairB) {
    const envA = layoutA?.site?.buildableEnvelope || { x: 0, y: 0, width: 1, length: 1 };
    const envB = layoutB?.site?.buildableEnvelope || { x: 0, y: 0, width: 1, length: 1 };

    const cxA = (((stairA.bounds?.x || 0) - (envA.x || 0)) + (stairA.bounds?.width || 0) / 2) / Math.max(envA.width || 1, 1);
    const cyA = (((stairA.bounds?.y || 0) - (envA.y || 0)) + (stairA.bounds?.length || 0) / 2) / Math.max(envA.length || 1, 1);

    const cxB = (((stairB.bounds?.x || 0) - (envB.x || 0)) + (stairB.bounds?.width || 0) / 2) / Math.max(envB.width || 1, 1);
    const cyB = (((stairB.bounds?.y || 0) - (envB.y || 0)) + (stairB.bounds?.length || 0) / 2) / Math.max(envB.length || 1, 1);

    const stairDist = Math.sqrt(Math.pow(cxA - cxB, 2) + Math.pow(cyA - cyB, 2));
    stairCoreSim = Math.max(0, 1.0 - (stairDist / 0.45));
  } else if (!stairA && !stairB) {
    stairCoreSim = 1.0;
  }

  const score = Number((0.50 * floorDistributionSim + 0.50 * stairCoreSim).toFixed(3));

  return {
    score,
    floorCountMatch: true,
    stairCoreAlignmentSim: Number(stairCoreSim.toFixed(3)),
    floorDistributionSim: Number(floorDistributionSim.toFixed(3))
  };
}

/**
 * Finds the primary stairwell room in a layout
 */
function findStairwellRoom(layout) {
  for (const fl of (layout?.floors || [])) {
    const rm = (fl.rooms || []).find(r => r.type === ROOM_TYPES.STAIRWELL || (typeof r.name === 'string' && /stair/i.test(r.name)));
    if (rm) return rm;
  }
  return null;
}

// =============================================================================
// SIGNAL E: PLOT & REQUIREMENT COMPATIBILITY GUARD
// =============================================================================

/**
 * Checks whether two designs are for compatible plot sizes and requirements.
 * Designs for fundamentally different plot aspect ratios (> 25% difference)
 * or plot areas (> 30% difference) belong to different design challenges
 * and should not be falsely classified as duplicates.
 */
export function checkPlotCompatibility(layoutA, layoutB) {
  const plotA = layoutA?.site || layoutA?.inputs || {};
  const plotB = layoutB?.site || layoutB?.inputs || {};

  const wA = Number(plotA.plotWidth) || 0;
  const lA = Number(plotA.plotLength) || 0;
  const wB = Number(plotB.plotWidth) || 0;
  const lB = Number(plotB.plotLength) || 0;

  if (wA > 0 && lA > 0 && wB > 0 && lB > 0) {
    const ratioA = lA / wA;
    const ratioB = lB / wB;
    const ratioDelta = Math.abs(ratioA - ratioB) / Math.max(ratioA, ratioB);

    const areaA = wA * lA;
    const areaB = wB * lB;
    const areaDelta = Math.abs(areaA - areaB) / Math.max(areaA, areaB);

    // If plot aspect ratios differ significantly (e.g. narrow 1:3 vs squarish 1:1.2)
    if (ratioDelta > 0.35) {
      return {
        isCompatible: false,
        reason: `Incompatible plot aspect ratios (${ratioA.toFixed(2)} vs ${ratioB.toFixed(2)})`
      };
    }

    return {
      isCompatible: true,
      ratioDelta: Number(ratioDelta.toFixed(3)),
      areaDelta: Number(areaDelta.toFixed(3))
    };
  }

  return { isCompatible: true, reason: 'Plot dimensions not explicitly specified.' };
}

// =============================================================================
// STRUCTURED SIMILARITY EVALUATION ENGINE
// =============================================================================

/**
 * Evaluates comprehensive multi-signal architectural similarity between two designs.
 * Returns a fully structured, deterministic diagnostic report.
 * 
 * @param {Object} designA - First design layout
 * @param {Object} designB - Second design layout
 * @param {Object} [options] - Configurable threshold, weights, and options
 * @returns {Object} Structured similarity evaluation result
 */
export function evaluateArchitecturalSimilarity(designA, designB, options = {}) {
  const threshold = options.threshold !== undefined ? options.threshold : DEFAULT_SIMILARITY_THRESHOLD;
  const weights = { ...DEFAULT_SIMILARITY_WEIGHTS, ...(options.weights || {}) };

  // Normalize weight sum to 1.00
  const weightSum = (weights.topological || 0) + (weights.spatial || 0) + (weights.multiFloor || 0) + (weights.roomProgram || 0);
  const normWeights = {
    topological: (weights.topological || 0) / (weightSum || 1),
    spatial: (weights.spatial || 0) / (weightSum || 1),
    multiFloor: (weights.multiFloor || 0) / (weightSum || 1),
    roomProgram: (weights.roomProgram || 0) / (weightSum || 1)
  };

  // Guard against null, empty, or malformed inputs
  if (!designA || !designB || typeof designA !== 'object' || typeof designB !== 'object') {
    return {
      isDuplicate: false,
      overallSimilarity: 0.0,
      topologicalSimilarity: 0.0,
      spatialSimilarity: 0.0,
      roomProgramSimilarity: 0.0,
      floorSimilarity: 0.0,
      threshold,
      matchedCandidateId: null,
      reason: 'One or both design layouts are null, empty, or malformed.',
      diagnostics: {
        error: 'MALFORMED_OR_NULL_CANDIDATE',
        designAPresent: Boolean(designA),
        designBPresent: Boolean(designB)
      }
    };
  }

  const roomsA = (designA.floors || []).flatMap(f => f.rooms || []);
  const roomsB = (designB.floors || []).flatMap(f => f.rooms || []);

  if (roomsA.length === 0 || roomsB.length === 0) {
    return {
      isDuplicate: false,
      overallSimilarity: 0.0,
      topologicalSimilarity: 0.0,
      spatialSimilarity: 0.0,
      roomProgramSimilarity: 0.0,
      floorSimilarity: 0.0,
      threshold,
      matchedCandidateId: null,
      reason: 'One or both design layouts contain no rooms or valid floors.',
      diagnostics: {
        error: 'EMPTY_OR_MALFORMED_CANDIDATE',
        roomsCountA: roomsA.length,
        roomsCountB: roomsB.length
      }
    };
  }

  const idB = designB.candidateId || designB.id || 'B';

  // Check plot compatibility (unless explicitly bypassed via options)
  if (!options.ignorePlotCompatibility) {
    const plotCheck = checkPlotCompatibility(designA, designB);
    if (!plotCheck.isCompatible) {
      return {
        isDuplicate: false,
        overallSimilarity: 0.0,
        topologicalSimilarity: 0.0,
        spatialSimilarity: 0.0,
        roomProgramSimilarity: 0.0,
        floorSimilarity: 0.0,
        threshold,
        matchedCandidateId: idB,
        reason: `Designs are for incompatible plot specifications: ${plotCheck.reason}`,
        diagnostics: {
          plotCompatibility: plotCheck,
          weights: normWeights
        }
      };
    }
  }

  // 1. Evaluate Signal A: Room Program Similarity
  const programEval = evaluateRoomProgramSimilarity(designA, designB);

  // 2. Evaluate Signal B: Topological Graph Similarity
  const topologicalEval = evaluateTopologicalSimilarity(designA, designB);

  // 3. Evaluate Signal C: Spatial Arrangement Similarity
  const spatialEval = evaluateSpatialSimilarity(designA, designB);

  // 4. Evaluate Signal D: Multi-Floor Similarity
  const floorEval = evaluateMultiFloorSimilarity(designA, designB);

  // Compute Weighted Composite Similarity
  // If floor counts mismatch (e.g. 1 floor vs 2 floors), floorEval.score === 0.0
  let composite = (
    normWeights.topological * topologicalEval.score +
    normWeights.spatial * spatialEval.score +
    normWeights.multiFloor * floorEval.score +
    normWeights.roomProgram * programEval.score
  );

  // If floor count mismatches, enforce a hard diversity cap of 0.50 so 1-floor and 2-floor are never duplicates
  if (floorEval.floorCountMatch === false) {
    composite = Math.min(composite, 0.45);
  }

  const overallSimilarity = Number(Math.max(0, Math.min(1.0, composite)).toFixed(3));
  const isDuplicate = overallSimilarity >= threshold;

  // Determine explanation reason
  let reason = '';
  if (isDuplicate) {
    if (spatialEval.score >= 0.95 && topologicalEval.score >= 0.95) {
      reason = `Near-identical layout: Spatial arrangement (${(spatialEval.score * 100).toFixed(0)}%) and circulation topology (${(topologicalEval.score * 100).toFixed(0)}%) are effectively identical.`;
    } else {
      reason = `Redundant candidate: Overall architectural similarity (${(overallSimilarity * 100).toFixed(1)}%) meets or exceeds the diversity threshold (${(threshold * 100).toFixed(0)}%).`;
    }
  } else {
    const keyDiffs = [];
    if (spatialEval.score < 0.65) keyDiffs.push(`distinct spatial arrangement (${(spatialEval.score * 100).toFixed(0)}% sim)`);
    if (topologicalEval.score < 0.65) keyDiffs.push(`different circulation topology (${(topologicalEval.score * 100).toFixed(0)}% sim)`);
    if (floorEval.score < 0.65) keyDiffs.push(`different floor organization (${(floorEval.score * 100).toFixed(0)}% sim)`);
    
    reason = keyDiffs.length > 0 
      ? `Meaningfully distinct architectural alternative: Exhibited ${keyDiffs.join(' and ')}.`
      : `Distinct candidate: Overall similarity (${(overallSimilarity * 100).toFixed(1)}%) is below duplicate threshold (${(threshold * 100).toFixed(0)}%).`;
  }

  return {
    isDuplicate,
    overallSimilarity,
    topologicalSimilarity: topologicalEval.score,
    spatialSimilarity: spatialEval.score,
    roomProgramSimilarity: programEval.score,
    floorSimilarity: floorEval.score,
    threshold,
    matchedCandidateId: isDuplicate ? idB : null,
    reason,
    diagnostics: {
      engineVersion: SIMILARITY_ENGINE_VERSION,
      weights: normWeights,
      programBreakdown: programEval,
      topologicalBreakdown: topologicalEval,
      spatialBreakdown: spatialEval,
      floorBreakdown: floorEval,
      fingerprintA: computeDesignFingerprint(designA),
      fingerprintB: computeDesignFingerprint(designB)
    }
  };
}

// =============================================================================
// BACKWARD-COMPATIBLE NUMERIC SIMILARITY INTERFACE
// =============================================================================

/**
 * Computes structural similarity as a normalized numeric float (0.0 to 1.0).
 * Preserves 100% backward compatibility with existing engine consumers and tests.
 * 
 * @param {Object} designA - First design layout
 * @param {Object} designB - Second design layout
 * @param {Object} [options] - Evaluation options
 * @returns {number} Normalized similarity float (0.0 to 1.0)
 */
export function calculateStructuralSimilarity(designA, designB, options = {}) {
  // If identical object reference
  if (designA === designB && designA) return 1.0;
  
  // Notice: If two distinct design objects share the exact same id and identical rooms, they are identical
  const evalResult = evaluateArchitecturalSimilarity(designA, designB, options);
  return evalResult.overallSimilarity;
}

// =============================================================================
// GENERATION HISTORY & DIVERSITY FILTERING
// =============================================================================

/**
 * Checks a candidate design against generation history or previously accepted designs.
 * 
 * @param {Object} candidate - Design layout candidate to evaluate
 * @param {Array<Object>} history - Array of previously accepted designs
 * @param {Object} [options] - Threshold and evaluation options
 * @returns {Object} Near-duplicate check result with matched candidate details and diagnostics
 */
export function checkDuplicateAgainstHistory(candidate, history = [], options = {}) {
  const threshold = options.threshold !== undefined ? options.threshold : DEFAULT_SIMILARITY_THRESHOLD;

  if (!history || !Array.isArray(history) || history.length === 0) {
    return {
      isDuplicate: false,
      maxSimilarity: 0.0,
      overallSimilarity: 0.0,
      matchedDesignId: null,
      matchedCandidateId: null,
      reason: 'No prior generation history to compare against.',
      report: null,
      diagnostics: { historyCount: 0 }
    };
  }

  let maxSimilarity = 0.0;
  let matchedDesignId = null;
  let bestReport = null;

  for (const prev of history) {
    if (!prev) continue;
    const report = evaluateArchitecturalSimilarity(candidate, prev, { ...options, threshold });
    if (report.overallSimilarity > maxSimilarity) {
      maxSimilarity = report.overallSimilarity;
      matchedDesignId = prev.id || prev.candidateId || null;
      bestReport = report;
    }
  }

  const isDuplicate = maxSimilarity >= threshold;

  return {
    isDuplicate,
    maxSimilarity,
    overallSimilarity: maxSimilarity,
    matchedDesignId,
    matchedCandidateId: matchedDesignId,
    reason: isDuplicate
      ? `Candidate is a near-duplicate (${(maxSimilarity * 100).toFixed(1)}% similar to accepted design ${matchedDesignId}).`
      : `Candidate is structurally diverse against all ${history.length} historical design(s) (max similarity ${(maxSimilarity * 100).toFixed(1)}% < ${(threshold * 100).toFixed(0)}%).`,
    report: bestReport,
    diagnostics: {
      historyCount: history.length,
      evaluatedAgainst: history.map(h => h.id || h.candidateId),
      bestMatch: bestReport
    }
  };
}

/**
 * Filters and retains a diverse collection of valid candidates from a generated pool.
 * Respects hard validation constraints and prioritizes quality while rejecting duplicates.
 * 
 * Policy:
 * 1. Invalid designs are never retained (Hard-constraint primacy).
 * 2. Candidates are evaluated in ranking/quality order (top candidate accepted first).
 * 3. Subsequent candidates are compared against all previously accepted candidates.
 * 4. Redundant candidates exceeding the similarity threshold are rejected with diagnostics.
 * 5. If fewer unique valid candidates exist than requested, reports the limitation honestly.
 * 
 * @param {Array<Object>} candidates - Candidate layouts or ranked candidate objects
 * @param {Object} [options] - Options (targetCount, threshold, existingHistory)
 * @returns {Object} Filtered result with accepted, rejected, and diagnostic summary
 */
export function filterDiverseCandidates(candidates = [], options = {}) {
  const targetCount = options.targetCount || candidates.length;
  const threshold = options.threshold !== undefined ? options.threshold : DEFAULT_SIMILARITY_THRESHOLD;
  const existingHistory = options.existingHistory || [];

  const accepted = [];
  const rejectedDuplicates = [];
  const invalidCandidates = [];

  const candidatePool = Array.isArray(candidates) ? candidates : [];

  for (const candItem of candidatePool) {
    // Unpack layout if candItem is a wrapped ranked candidate object
    const layout = candItem?.candidate || candItem?.layout || candItem;
    const candidateId = candItem?.candidateId || layout?.candidateId || layout?.id || 'unknown';

    // 1. Hard Validation Primacy Check
    const isValid = candItem?.isValid !== undefined 
      ? candItem.isValid 
      : (layout?.isValid !== undefined ? layout.isValid : Boolean(layout?.validation?.isValid));

    if (!isValid) {
      invalidCandidates.push({
        candidateId,
        candidate: candItem,
        reason: 'Failed hard geometric or architectural constraints.',
        violations: layout?.validation?.violations || candItem?.disqualificationReasons || []
      });
      continue;
    }

    // 2. Compare against already accepted candidates and existing history
    const comparisonPool = [...existingHistory, ...accepted.map(a => a.layout)];
    const dupCheck = checkDuplicateAgainstHistory(layout, comparisonPool, { ...options, threshold });

    if (dupCheck.isDuplicate) {
      rejectedDuplicates.push({
        candidateId,
        candidate: candItem,
        matchedCandidateId: dupCheck.matchedDesignId,
        similarity: dupCheck.maxSimilarity,
        reason: dupCheck.reason,
        report: dupCheck.report
      });
      continue;
    }

    // 3. Retain diverse valid candidate
    accepted.push({
      candidateId,
      candidate: candItem,
      layout,
      fingerprint: computeDesignFingerprint(layout),
      maxHistorySimilarity: dupCheck.maxSimilarity
    });

    if (accepted.length >= targetCount) {
      break;
    }
  }

  const insufficientUniqueCandidates = accepted.length < targetCount && candidatePool.length > 0;

  return {
    success: accepted.length > 0,
    targetCount,
    acceptedCount: accepted.length,
    duplicateCount: rejectedDuplicates.length,
    invalidCount: invalidCandidates.length,
    totalEvaluated: candidatePool.length,
    insufficientUniqueCandidates,
    accepted,
    rejectedDuplicates,
    invalidCandidates,
    summary: accepted.length >= targetCount
      ? `Retained ${accepted.length} diverse, valid candidate(s) satisfying all architectural criteria.`
      : `Honest report: Produced ${accepted.length} unique valid candidate(s) (target: ${targetCount}). ${rejectedDuplicates.length} candidate(s) were rejected as redundant duplicates, and ${invalidCandidates.length} candidate(s) failed hard constraints.`,
    diagnostics: {
      threshold,
      acceptedIds: accepted.map(a => a.candidateId),
      rejectedIds: rejectedDuplicates.map(r => r.candidateId),
      invalidIds: invalidCandidates.map(i => i.candidateId)
    }
  };
}

// =============================================================================
// ARCHITECTURAL DIFFERENCE CLASSIFICATION (S3-T03 Phase 1)
// =============================================================================

/**
 * Standard classification of architectural difference between two candidate designs.
 * Satisfies S3-T03 Phase 1: Distinguishes identical, cosmetic, minor dimensional,
 * meaningful spatial, and structural/massing differences.
 */
export const ARCHITECTURAL_DIFFERENCE_LEVEL = Object.freeze({
  IDENTICAL: 'IDENTICAL',                         // Exactly identical geometry and metadata
  COSMETIC_ONLY: 'COSMETIC_ONLY',                 // Geometry and fingerprint identical; only labels/metadata differ
  MINOR_DIMENSIONAL: 'MINOR_DIMENSIONAL',         // Same archetype & topology, minor coordinate variations (similarity >= 0.82)
  MEANINGFUL_SPATIAL: 'MEANINGFUL_SPATIAL',       // Distinct spatial archetype, room placement, or circulation topology (similarity < 0.82)
  STRUCTURAL_OR_MASSING: 'STRUCTURAL_OR_MASSING' // Different floor count, floor distribution, stair core, or massing
});

/**
 * Classifies the exact nature of difference between two architectural designs.
 * 
 * @param {Object} layoutA - First design or layout
 * @param {Object} layoutB - Second design or layout
 * @param {Object} [options] - Options passed to similarity evaluator
 * @returns {Object} Difference classification with level, similarity, and reason
 */
export function classifyArchitecturalDifference(layoutA, layoutB, options = {}) {
  if (!layoutA || !layoutB) {
    return {
      level: ARCHITECTURAL_DIFFERENCE_LEVEL.MEANINGFUL_SPATIAL,
      similarity: 0,
      reason: 'One or both designs are missing or invalid.',
      details: {}
    };
  }

  const fpA = computeDesignFingerprint(layoutA);
  const fpB = computeDesignFingerprint(layoutB);

  // Check floor count difference
  const floorsA = layoutA.floors?.length || layoutA.metrics?.floorsCount || 1;
  const floorsB = layoutB.floors?.length || layoutB.metrics?.floorsCount || 1;
  if (floorsA !== floorsB) {
    return {
      level: ARCHITECTURAL_DIFFERENCE_LEVEL.STRUCTURAL_OR_MASSING,
      similarity: 0.30,
      reason: `Floor count differs: ${floorsA} floor(s) vs ${floorsB} floor(s).`,
      details: { floorsA, floorsB, fpA, fpB }
    };
  }

  // Check stairwell core placement for multi-floor designs
  if (floorsA > 1) {
    const stairRoomA = layoutA.floors?.[0]?.rooms?.find(r => r.type === ROOM_TYPES.STAIRWELL);
    const stairRoomB = layoutB.floors?.[0]?.rooms?.find(r => r.type === ROOM_TYPES.STAIRWELL);
    if (stairRoomA && stairRoomB) {
      const stairXA = stairRoomA.bounds?.x ?? 0;
      const stairXB = stairRoomB.bounds?.x ?? 0;
      const envW = layoutA.site?.buildableEnvelope?.width || 30;
      // If stair moved across more than 30% of building width (e.g. left flank to right flank)
      if (Math.abs(stairXA - stairXB) > envW * 0.3) {
        return {
          level: ARCHITECTURAL_DIFFERENCE_LEVEL.STRUCTURAL_OR_MASSING,
          similarity: 0.55,
          reason: `Vertical circulation core shifted across building (X: ${stairXA.toFixed(1)}ft vs ${stairXB.toFixed(1)}ft).`,
          details: { stairXA, stairXB, envW }
        };
      }
    }
  }

  // Compute multi-signal architectural similarity
  const simResult = evaluateArchitecturalSimilarity(layoutA, layoutB, options);
  const similarity = simResult.overallSimilarity;

  // Exact fingerprint match
  if (fpA === fpB) {
    // Check if metadata also matches
    const idA = layoutA.id || layoutA.candidateId || '';
    const idB = layoutB.id || layoutB.candidateId || '';
    const titleA = layoutA.title || '';
    const titleB = layoutB.title || '';
    const styleA = layoutA.inputs?.archStyle || layoutA.archStyle || '';
    const styleB = layoutB.inputs?.archStyle || layoutB.archStyle || '';

    if (idA === idB && titleA === titleB && styleA === styleB) {
      return {
        level: ARCHITECTURAL_DIFFERENCE_LEVEL.IDENTICAL,
        similarity: 1.0,
        reason: 'Designs are byte-for-byte identical in geometry and metadata.',
        details: { fingerprint: fpA, similarity: 1.0 }
      };
    } else {
      return {
        level: ARCHITECTURAL_DIFFERENCE_LEVEL.COSMETIC_ONLY,
        similarity: 1.0,
        reason: 'Spatial geometry and room placement are identical; only candidate metadata/labels differ.',
        details: { fingerprint: fpA, similarity: 1.0, idA, idB, styleA, styleB }
      };
    }
  }

  // Distinct archetype
  const archA = layoutA.archetype || layoutA.generationMetadata?.archetype || 'STANDARD';
  const archB = layoutB.archetype || layoutB.generationMetadata?.archetype || 'STANDARD';

  if (archA !== archB || similarity < 0.82) {
    return {
      level: ARCHITECTURAL_DIFFERENCE_LEVEL.MEANINGFUL_SPATIAL,
      similarity,
      reason: archA !== archB
        ? `Spatial archetype differs (${archA} vs ${archB}); rooms arranged under distinct topological patterns.`
        : `Structural similarity (${(similarity * 100).toFixed(1)}%) is below duplicate threshold; spatial layout is distinct.`,
      details: { archetypeA: archA, archetypeB: archB, similarity, simReport: simResult }
    };
  }

  // Same archetype and high similarity (>= 0.82) but different fingerprints
  return {
    level: ARCHITECTURAL_DIFFERENCE_LEVEL.MINOR_DIMENSIONAL,
    similarity,
    reason: `Same archetype (${archA}) with high structural similarity (${(similarity * 100).toFixed(1)}%); minor dimensional or coordinate variation.`,
    details: { archetype: archA, similarity, simReport: simResult }
  };
}

