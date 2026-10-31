/**
 * LabourConnect Design Engine - Topological Room Relationship Graph Solver
 * 
 * S2-T03: Represents, solves, and validates topological relationships between rooms.
 * 
 * Relationship Types:
 * - REQUIRED_ADJACENCY: Hard constraint (rooms must share an edge or direct portal)
 * - PREFERRED_ADJACENCY: Soft preference (rooms should be clustered or nearby)
 * - REQUIRED_SEPARATION: Hard constraint (rooms must not be directly adjacent)
 * - ACCESS_RELATIONSHIP: Circulation path (direct door, archway, corridor, slider)
 * - VERTICAL_CONNECTION: Multi-floor continuity (stairwell core, mumty, lightwell)
 * 
 * Distinguishes Hard Constraints from Soft Preferences.
 * Detects contradictory relationships, duplicate edges, self-loops, and impossible topologies.
 */


/**
 * Standard spatial archetypes for procedural exploration
 */
export const SPATIAL_ARCHETYPES = {
  OPEN_CONTEMPORARY: 'open_contemporary',
  COURTYARD_CENTRIC: 'courtyard_centric',
  LINEAR_SPINE: 'linear_spine',
  VILLA_PAVILION: 'villa_pavilion',
  L_SHAPE_COURT: 'l_shape_court',
  SPLIT_WING_ZONED: 'split_wing_zoned'
};

/**
 * Supported room relationship types
 */
export const RELATIONSHIP_TYPES = {
  REQUIRED_ADJACENCY: 'REQUIRED_ADJACENCY',
  PREFERRED_ADJACENCY: 'PREFERRED_ADJACENCY',
  REQUIRED_SEPARATION: 'REQUIRED_SEPARATION',
  ACCESS_RELATIONSHIP: 'ACCESS_RELATIONSHIP',
  VERTICAL_CONNECTION: 'VERTICAL_CONNECTION'
};

/**
 * Constraint nature: Hard constraint vs Soft preference
 */
export const RELATIONSHIP_NATURE = {
  HARD_CONSTRAINT: 'HARD_CONSTRAINT',
  SOFT_PREFERENCE: 'SOFT_PREFERENCE'
};

/**
 * Physical access and circulation portal types
 */
export const ACCESS_PORTAL_TYPES = {
  DOOR: 'door',
  DOUBLE_DOOR: 'double_door',
  ARCH: 'arch',
  OPEN_SPAN: 'open_span',
  WIDE_PORTAL: 'wide_portal',
  GLASS_SLIDER: 'glass_slider',
  CORRIDOR: 'corridor',
  STAIR_FLIGHT: 'stair_flight',
  LANDING: 'landing',
  ENTRY: 'entry',
  CARVED_DOOR: 'carved_door',
  JALI_DOOR: 'jali_door',
  SLIDING_SHUTTER: 'sliding_shutter',
  FLOATING_STEPS: 'floating_steps'
};

/**
 * Selects an architectural spatial archetype based on plot geometry and user amenities
 */
export function selectSpatialArchetype(specs = {}, variationIndex = 0) {
  const plotWidth = Number(specs.plotWidth) || 30;
  const plotLength = Number(specs.plotLength) || 40;
  const amenities = specs.amenities || {};
  const ratio = plotLength / Math.max(plotWidth, 1);

  if (amenities.hasCourtyard) {
    return SPATIAL_ARCHETYPES.COURTYARD_CENTRIC;
  }

  if (ratio >= 2.0 || plotWidth <= 22) {
    return SPATIAL_ARCHETYPES.LINEAR_SPINE;
  }

  // Large or wide plots (plotWidth >= 35) can accommodate grand courtyard or pavilion massings
  if (plotWidth >= 35) {
    const wideArchetypes = [
      SPATIAL_ARCHETYPES.COURTYARD_CENTRIC,
      SPATIAL_ARCHETYPES.VILLA_PAVILION,
      SPATIAL_ARCHETYPES.L_SHAPE_COURT,
      SPATIAL_ARCHETYPES.SPLIT_WING_ZONED,
      SPATIAL_ARCHETYPES.OPEN_CONTEMPORARY
    ];
    return wideArchetypes[variationIndex % wideArchetypes.length];
  }

  // Compact plots (plotWidth < 35) alternate across archetypes suited for compact plinths
  const compactArchetypes = [
    SPATIAL_ARCHETYPES.OPEN_CONTEMPORARY,
    SPATIAL_ARCHETYPES.LINEAR_SPINE
  ];

  return compactArchetypes[variationIndex % compactArchetypes.length];
}

/**
 * Creates a normalized room relationship edge
 * 
 * @param {string} source - Source room ID
 * @param {string} target - Target room ID
 * @param {string} type - Relationship type from RELATIONSHIP_TYPES
 * @param {Object} [options] - Additional attributes (portalType, nature, weight, notes)
 * @returns {Object} Standardized relationship edge
 */
export function createRelationshipEdge(source, target, type, options = {}) {
  const nature = options.nature || getDefaultNatureForType(type);
  const portalType = options.portalType || options.accessType || getDefaultPortalForType(type);

  return {
    source: String(source || '').trim(),
    target: String(target || '').trim(),
    type: String(type || '').trim(),
    nature,
    isHardConstraint: nature === RELATIONSHIP_NATURE.HARD_CONSTRAINT,
    portalType,
    weight: typeof options.weight === 'number' ? options.weight : 1.0,
    bidirectional: options.bidirectional !== undefined ? Boolean(options.bidirectional) : true,
    metadata: options.metadata || {}
  };
}

/**
 * Returns default constraint nature for a given relationship type
 */
export function getDefaultNatureForType(type) {
  switch (type) {
    case RELATIONSHIP_TYPES.REQUIRED_ADJACENCY:
    case RELATIONSHIP_TYPES.REQUIRED_SEPARATION:
    case RELATIONSHIP_TYPES.VERTICAL_CONNECTION:
      return RELATIONSHIP_NATURE.HARD_CONSTRAINT;
    case RELATIONSHIP_TYPES.PREFERRED_ADJACENCY:
      return RELATIONSHIP_NATURE.SOFT_PREFERENCE;
    case RELATIONSHIP_TYPES.ACCESS_RELATIONSHIP:
      return RELATIONSHIP_NATURE.HARD_CONSTRAINT;
    default:
      return RELATIONSHIP_NATURE.SOFT_PREFERENCE;
  }
}

/**
 * Returns default portal type for access relationships
 */
function getDefaultPortalForType(type) {
  if (type === RELATIONSHIP_TYPES.VERTICAL_CONNECTION) return ACCESS_PORTAL_TYPES.STAIR_FLIGHT;
  if (type === RELATIONSHIP_TYPES.ACCESS_RELATIONSHIP) return ACCESS_PORTAL_TYPES.DOOR;
  return null;
}

/**
 * Validates a list of relationship edges against room definitions and architectural consistency rules.
 * 
 * Detects:
 * - Missing or invalid room identifiers
 * - Self-loops (room related to itself)
 * - Unknown relationship types
 * - References to nonexistent room IDs
 * - Direct contradictions: REQUIRED_ADJACENCY vs REQUIRED_SEPARATION on same pair
 * - Access contradiction: ACCESS_RELATIONSHIP vs REQUIRED_SEPARATION on same pair
 * - Preference contradiction: PREFERRED_ADJACENCY vs REQUIRED_SEPARATION on same pair
 * - Vertical connection contradiction: connecting rooms on the same floor level
 * 
 * @param {Array} edges - Array of relationship edge objects
 * @param {Array|Map} [rooms] - List or Map of defined room records with stable IDs
 * @returns {Object} Structured validation outcome
 */
export function validateRoomRelationships(edges, rooms = []) {
  const errors = [];
  const warnings = [];
  const contradictions = [];
  const missingRooms = [];

  // Build room map for existence and floor verification
  const roomMap = new Map();
  if (Array.isArray(rooms)) {
    rooms.forEach(r => {
      if (r && r.id) roomMap.set(r.id, r);
    });
  } else if (rooms instanceof Map) {
    rooms.forEach((val, key) => roomMap.set(key, val));
  }

  if (!Array.isArray(edges)) {
    return {
      valid: false,
      isFeasible: false,
      errors: ['Invalid edges argument: expected an array of relationship edges.'],
      warnings: [],
      contradictions: [],
      missingRooms: [],
      validEdges: []
    };
  }

  const validTypes = new Set(Object.values(RELATIONSHIP_TYPES));
  const seenPairTypes = new Map(); // pairKey -> Set(types)
  const validEdges = [];

  edges.forEach((edge, index) => {
    if (!edge || typeof edge !== 'object') {
      errors.push(`Edge at index ${index} is malformed or null.`);
      return;
    }

    const source = edge.source ? String(edge.source).trim() : '';
    const target = edge.target ? String(edge.target).trim() : '';
    const type = edge.type ? String(edge.type).trim() : '';

    // 1. Missing identifiers
    if (!source || !target) {
      errors.push(`Edge at index ${index} has missing endpoint: source="${source}", target="${target}".`);
      return;
    }

    // 2. Self-loop
    if (source === target) {
      contradictions.push(`Self-referencing relationship detected on room "${source}". A room cannot be adjacent or separated from itself.`);
      errors.push(`Invalid self-loop on room "${source}" for relationship ${type}.`);
      return;
    }

    // 3. Unknown relationship type
    if (!validTypes.has(type)) {
      errors.push(`Unknown relationship type "${type}" between "${source}" and "${target}".`);
      return;
    }

    // 4. Room existence verification (if room definitions provided)
    if (roomMap.size > 0) {
      if (!roomMap.has(source)) {
        if (!missingRooms.includes(source)) missingRooms.push(source);
        errors.push(`Relationship references nonexistent source room "${source}".`);
      }
      if (!roomMap.has(target)) {
        if (!missingRooms.includes(target)) missingRooms.push(target);
        errors.push(`Relationship references nonexistent target room "${target}".`);
      }
    }

    // 5. Vertical connection floor check
    if (type === RELATIONSHIP_TYPES.VERTICAL_CONNECTION && roomMap.has(source) && roomMap.has(target)) {
      const sourceRoom = roomMap.get(source);
      const targetRoom = roomMap.get(target);
      const sourceFloor = sourceRoom.floorIndex ?? sourceRoom.floor;
      const targetFloor = targetRoom.floorIndex ?? targetRoom.floor;

      if (sourceFloor !== undefined && targetFloor !== undefined && sourceFloor === targetFloor) {
        contradictions.push(
          `Vertical connection contradiction: rooms "${source}" and "${target}" are on the same floor level (${sourceFloor}). Vertical connections must link different floors.`
        );
        errors.push(`Impossible vertical connection between "${source}" and "${target}" on floor ${sourceFloor}.`);
      }
    }

    // 6. Contradiction detection between pairs
    // Undirected normalized pair key
    const pairKey = [source, target].sort().join('::');
    if (!seenPairTypes.has(pairKey)) {
      seenPairTypes.set(pairKey, new Set());
    }
    const existingTypes = seenPairTypes.get(pairKey);

    // Contradiction: REQUIRED_ADJACENCY vs REQUIRED_SEPARATION
    if (
      (type === RELATIONSHIP_TYPES.REQUIRED_ADJACENCY && existingTypes.has(RELATIONSHIP_TYPES.REQUIRED_SEPARATION)) ||
      (type === RELATIONSHIP_TYPES.REQUIRED_SEPARATION && existingTypes.has(RELATIONSHIP_TYPES.REQUIRED_ADJACENCY))
    ) {
      const desc = `Direct contradiction: rooms "${source}" and "${target}" have both REQUIRED_ADJACENCY and REQUIRED_SEPARATION specified.`;
      if (!contradictions.includes(desc)) contradictions.push(desc);
      errors.push(desc);
    }

    // Contradiction: ACCESS_RELATIONSHIP vs REQUIRED_SEPARATION
    if (
      (type === RELATIONSHIP_TYPES.ACCESS_RELATIONSHIP && existingTypes.has(RELATIONSHIP_TYPES.REQUIRED_SEPARATION)) ||
      (type === RELATIONSHIP_TYPES.REQUIRED_SEPARATION && existingTypes.has(RELATIONSHIP_TYPES.ACCESS_RELATIONSHIP))
    ) {
      const desc = `Access contradiction: rooms "${source}" and "${target}" have both ACCESS_RELATIONSHIP and REQUIRED_SEPARATION specified.`;
      if (!contradictions.includes(desc)) contradictions.push(desc);
      errors.push(desc);
    }

    // Conflict / Warning: PREFERRED_ADJACENCY vs REQUIRED_SEPARATION
    if (
      (type === RELATIONSHIP_TYPES.PREFERRED_ADJACENCY && existingTypes.has(RELATIONSHIP_TYPES.REQUIRED_SEPARATION)) ||
      (type === RELATIONSHIP_TYPES.REQUIRED_SEPARATION && existingTypes.has(RELATIONSHIP_TYPES.PREFERRED_ADJACENCY))
    ) {
      const desc = `Soft-hard conflict: rooms "${source}" and "${target}" have both PREFERRED_ADJACENCY and REQUIRED_SEPARATION specified. Hard separation takes precedence.`;
      if (!warnings.includes(desc)) warnings.push(desc);
    }

    // Duplicate detection: same type already recorded
    if (existingTypes.has(type)) {
      warnings.push(`Duplicate relationship "${type}" between "${source}" and "${target}" was deduplicated.`);
    } else {
      existingTypes.add(type);
      validEdges.push(edge);
    }
  });

  const valid = errors.length === 0 && contradictions.length === 0;

  return {
    valid,
    isFeasible: valid,
    errors,
    warnings,
    contradictions,
    missingRooms,
    validEdges
  };
}

/**
 * Solves and constructs the complete multi-floor or single-floor topological room relationship graph.
 * 
 * @param {Array|Object} roomProgramOrRooms - List of room records or structured floorPrograms report
 * @param {Object} [options] - Configuration options (archetype, customEdges, floorIndex)
 * @returns {Object} Solved relationship graph with nodes, edges, hard constraints, and validation
 */
export function solveRoomRelationshipGraph(roomProgramOrRooms, options = {}) {
  const archetype = options.archetype || SPATIAL_ARCHETYPES.OPEN_CONTEMPORARY;
  const targetFloor = options.floorIndex !== undefined ? options.floorIndex : null;

  // Flatten rooms from either array of rooms or floorPrograms structure
  const allRooms = [];
  if (Array.isArray(roomProgramOrRooms)) {
    if (roomProgramOrRooms.length > 0 && Array.isArray(roomProgramOrRooms[0].rooms)) {
      // Array of floorPrograms
      roomProgramOrRooms.forEach(fp => {
        if (targetFloor === null || fp.floorIndex === targetFloor) {
          allRooms.push(...fp.rooms);
        }
      });
    } else {
      // Direct array of room records
      roomProgramOrRooms.forEach(r => {
        if (targetFloor === null || (r.floorIndex ?? r.floor ?? 0) === targetFloor) {
          allRooms.push(r);
        }
      });
    }
  } else if (roomProgramOrRooms && Array.isArray(roomProgramOrRooms.floorPrograms)) {
    // Report object from generateRoomProgram
    roomProgramOrRooms.floorPrograms.forEach(fp => {
      if (targetFloor === null || fp.floorIndex === targetFloor) {
        allRooms.push(...fp.rooms);
      }
    });
  }

  const roomMap = new Map();
  allRooms.forEach(r => {
    if (r && r.id) roomMap.set(r.id, r);
  });

  // Assemble Edges
  const rawEdges = [];

  // 1. Process room-declared hard constraints & soft preferences from roomProgrammer.js
  allRooms.forEach(room => {
    const rId = room.id;
    const _hard = room.hardConstraints || {};
    const soft = room.softPreferences || {};

    // Soft Preferred Adjacencies
    if (Array.isArray(soft.preferredAdjacencies)) {
      soft.preferredAdjacencies.forEach(adjTarget => {
        const targetId = resolveTargetRoomId(adjTarget, allRooms, room);
        if (targetId && targetId !== rId) {
          rawEdges.push(createRelationshipEdge(rId, targetId, RELATIONSHIP_TYPES.PREFERRED_ADJACENCY, {
            nature: RELATIONSHIP_NATURE.SOFT_PREFERENCE,
            weight: 0.8
          }));
        }
      });
    }

    // Hard Required Separations
    if (Array.isArray(soft.preferredSeparations)) {
      soft.preferredSeparations.forEach(sepTarget => {
        const targetId = resolveTargetRoomId(sepTarget, allRooms, room);
        if (targetId && targetId !== rId) {
          rawEdges.push(createRelationshipEdge(rId, targetId, RELATIONSHIP_TYPES.REQUIRED_SEPARATION, {
            nature: RELATIONSHIP_NATURE.HARD_CONSTRAINT,
            weight: 1.0
          }));
        }
      });
    }
  });

  // 2. Add Architectural Archetype Circulation & Adjacency Edges
  const archetypeEdges = generateArchetypeEdges(allRooms, archetype, targetFloor);
  rawEdges.push(...archetypeEdges);

  // 3. Add Custom / User-supplied Edges
  if (Array.isArray(options.customEdges)) {
    rawEdges.push(...options.customEdges);
  }

  // 4. Validate All Relationships
  const validation = validateRoomRelationships(rawEdges, roomMap);

  // 5. Structure Graph Output
  const nodes = allRooms.map(r => ({
    id: r.id,
    name: r.name,
    type: r.type,
    zone: r.zone,
    floorIndex: r.floorIndex ?? r.floor ?? 0,
    floorName: r.floorName || `Floor ${r.floorIndex ?? 0}`,
    requiresExterior: Boolean(r.requiresExterior),
    accessRequirements: r.accessRequirements || null
  }));

  const edges = validation.validEdges;

  // Build Adjacency Map for quick lookups
  const adjacencyList = {};
  nodes.forEach(n => { adjacencyList[n.id] = []; });
  edges.forEach(e => {
    if (adjacencyList[e.source] && !adjacencyList[e.source].includes(e.target)) {
      adjacencyList[e.source].push(e.target);
    }
    if (e.bidirectional && adjacencyList[e.target] && !adjacencyList[e.target].includes(e.source)) {
      adjacencyList[e.target].push(e.source);
    }
  });

  const hardConstraints = edges.filter(e => e.nature === RELATIONSHIP_NATURE.HARD_CONSTRAINT);
  const softPreferences = edges.filter(e => e.nature === RELATIONSHIP_NATURE.SOFT_PREFERENCE);
  const verticalConnections = edges.filter(e => e.type === RELATIONSHIP_TYPES.VERTICAL_CONNECTION);

  return {
    archetype,
    targetFloor,
    nodes,
    edges,
    hardConstraints,
    softPreferences,
    verticalConnections,
    adjacencyList,
    circulationSpine: generateCirculationSpine(nodes, edges),
    validation,
    // Explicit disclosure: graph feasibility does not guarantee physical 2D non-overlap
    geometricFeasibilityClaimed: false
  };
}

/**
 * Backward-compatible adjacency graph generator
 * 
 * Consumed by layoutGenerator.js and similarityEngine.js.
 * Guarantees exact shape: { archetype, floorIndex, edges, circulationSpine }
 */
export function buildAdjacencyGraph(rooms, archetype = SPATIAL_ARCHETYPES.OPEN_CONTEMPORARY, floorIndex = 0) {
  const result = solveRoomRelationshipGraph(rooms, { archetype, floorIndex });

  // Map to legacy edges shape for complete backward compatibility
  const legacyEdges = result.edges.map(e => ({
    source: e.source,
    target: e.target,
    type: e.portalType || e.type || 'door',
    nature: e.nature,
    relationshipType: e.type
  }));

  return {
    archetype,
    floorIndex,
    edges: legacyEdges,
    circulationSpine: result.circulationSpine,
    nodes: result.nodes,
    hardConstraints: result.hardConstraints,
    softPreferences: result.softPreferences,
    verticalConnections: result.verticalConnections,
    validation: result.validation
  };
}

/**
 * Helper to resolve room ID from type or partial name
 */
function resolveTargetRoomId(targetSpec, allRooms, sourceRoom) {
  if (!targetSpec) return null;

  // Direct match to ID
  const directMatch = allRooms.find(r => r.id === targetSpec);
  if (directMatch) return directMatch.id;

  // Prefer match on same floor
  const sourceFloor = sourceRoom?.floorIndex ?? sourceRoom?.floor ?? 0;
  const sameFloorMatch = allRooms.find(r => (r.type === targetSpec) && ((r.floorIndex ?? r.floor ?? 0) === sourceFloor));
  if (sameFloorMatch) return sameFloorMatch.id;

  // Fallback to any room matching type
  const typeMatch = allRooms.find(r => r.type === targetSpec);
  return typeMatch ? typeMatch.id : null;
}

/**
 * Generates topological circulation edges according to spatial archetypes
 */
function generateArchetypeEdges(rooms, archetype, targetFloor) {
  const edges = [];
  const roomMap = new Map();
  rooms.forEach(r => roomMap.set(r.id, r));

  const addEdge = (src, tgt, type, portalType) => {
    // Normalization: resolve stairwell_core to floor-scoped ID if needed
    const resolvedSrc = resolveStairCoreId(src, roomMap);
    const resolvedTgt = resolveStairCoreId(tgt, roomMap);

    if (roomMap.has(resolvedSrc) && roomMap.has(resolvedTgt)) {
      edges.push(createRelationshipEdge(resolvedSrc, resolvedTgt, type, { portalType }));
    }
  };

  // -------------------------------------------------------------------------
  // Ground Floor Archetype Topologies
  // -------------------------------------------------------------------------
  if (targetFloor === null || targetFloor === 0) {
    if (archetype === SPATIAL_ARCHETYPES.COURTYARD_CENTRIC && roomMap.has('g_courtyard')) {
      addEdge('g_portico', 'g_foyer', RELATIONSHIP_TYPES.ACCESS_RELATIONSHIP, ACCESS_PORTAL_TYPES.ENTRY);
      addEdge('g_foyer', 'g_living', RELATIONSHIP_TYPES.REQUIRED_ADJACENCY, ACCESS_PORTAL_TYPES.ARCH);
      addEdge('g_living', 'g_courtyard', RELATIONSHIP_TYPES.REQUIRED_ADJACENCY, ACCESS_PORTAL_TYPES.GLASS_SLIDER);
      addEdge('g_courtyard', 'g_dining', RELATIONSHIP_TYPES.REQUIRED_ADJACENCY, ACCESS_PORTAL_TYPES.ARCH);
      addEdge('g_dining', 'g_kitchen', RELATIONSHIP_TYPES.REQUIRED_ADJACENCY, ACCESS_PORTAL_TYPES.DOOR);
      addEdge('g_dining', 'g_pooja', RELATIONSHIP_TYPES.PREFERRED_ADJACENCY, ACCESS_PORTAL_TYPES.CARVED_DOOR);
      addEdge('g_courtyard', 'g_stairwell_core', RELATIONSHIP_TYPES.ACCESS_RELATIONSHIP, ACCESS_PORTAL_TYPES.CORRIDOR);
      addEdge('g_courtyard', 'g_bed_guest', RELATIONSHIP_TYPES.ACCESS_RELATIONSHIP, ACCESS_PORTAL_TYPES.DOOR);
      addEdge('g_bed_guest', 'g_bath_common', RELATIONSHIP_TYPES.ACCESS_RELATIONSHIP, ACCESS_PORTAL_TYPES.DOOR);
    } else if (archetype === SPATIAL_ARCHETYPES.LINEAR_SPINE) {
      addEdge('g_portico', 'g_foyer', RELATIONSHIP_TYPES.ACCESS_RELATIONSHIP, ACCESS_PORTAL_TYPES.ENTRY);
      addEdge('g_foyer', 'g_living', RELATIONSHIP_TYPES.REQUIRED_ADJACENCY, ACCESS_PORTAL_TYPES.DOOR);
      addEdge('g_living', 'g_dining', RELATIONSHIP_TYPES.REQUIRED_ADJACENCY, ACCESS_PORTAL_TYPES.OPEN_SPAN);
      addEdge('g_dining', 'g_kitchen', RELATIONSHIP_TYPES.REQUIRED_ADJACENCY, ACCESS_PORTAL_TYPES.DOOR);
      addEdge('g_dining', 'g_stairwell_core', RELATIONSHIP_TYPES.ACCESS_RELATIONSHIP, ACCESS_PORTAL_TYPES.CORRIDOR);
      addEdge('g_dining', 'g_bed_guest', RELATIONSHIP_TYPES.ACCESS_RELATIONSHIP, ACCESS_PORTAL_TYPES.DOOR);
      addEdge('g_bed_guest', 'g_bath_common', RELATIONSHIP_TYPES.ACCESS_RELATIONSHIP, ACCESS_PORTAL_TYPES.DOOR);
      if (roomMap.has('g_pooja')) addEdge('g_living', 'g_pooja', RELATIONSHIP_TYPES.PREFERRED_ADJACENCY, ACCESS_PORTAL_TYPES.DOOR);
    } else {
      // OPEN_CONTEMPORARY or VILLA_PAVILION
      addEdge('g_portico', 'g_foyer', RELATIONSHIP_TYPES.ACCESS_RELATIONSHIP, ACCESS_PORTAL_TYPES.ENTRY);
      addEdge('g_foyer', 'g_living', RELATIONSHIP_TYPES.REQUIRED_ADJACENCY, ACCESS_PORTAL_TYPES.DOUBLE_DOOR);
      addEdge('g_living', 'g_dining', RELATIONSHIP_TYPES.REQUIRED_ADJACENCY, ACCESS_PORTAL_TYPES.WIDE_PORTAL);
      addEdge('g_dining', 'g_kitchen', RELATIONSHIP_TYPES.REQUIRED_ADJACENCY, ACCESS_PORTAL_TYPES.SLIDING_SHUTTER);
      if (roomMap.has('g_pooja')) addEdge('g_dining', 'g_pooja', RELATIONSHIP_TYPES.PREFERRED_ADJACENCY, ACCESS_PORTAL_TYPES.JALI_DOOR);
      addEdge('g_living', 'g_stairwell_core', RELATIONSHIP_TYPES.ACCESS_RELATIONSHIP, ACCESS_PORTAL_TYPES.FLOATING_STEPS);
      addEdge('g_dining', 'g_bed_guest', RELATIONSHIP_TYPES.ACCESS_RELATIONSHIP, ACCESS_PORTAL_TYPES.CORRIDOR);
      addEdge('g_bed_guest', 'g_bath_common', RELATIONSHIP_TYPES.ACCESS_RELATIONSHIP, ACCESS_PORTAL_TYPES.DOOR);
    }
  }

  // -------------------------------------------------------------------------
  // First Floor Archetype Topologies
  // -------------------------------------------------------------------------
  if (targetFloor === null || targetFloor === 1) {
    addEdge('f_stairwell_core', 'f_family_lounge', RELATIONSHIP_TYPES.ACCESS_RELATIONSHIP, ACCESS_PORTAL_TYPES.LANDING);
    addEdge('f_family_lounge', 'f_master_suite', RELATIONSHIP_TYPES.REQUIRED_ADJACENCY, ACCESS_PORTAL_TYPES.DOOR);
    addEdge('f_master_suite', 'f_master_bath', RELATIONSHIP_TYPES.REQUIRED_ADJACENCY, ACCESS_PORTAL_TYPES.DOOR);
    addEdge('f_family_lounge', 'f_balcony', RELATIONSHIP_TYPES.ACCESS_RELATIONSHIP, ACCESS_PORTAL_TYPES.GLASS_SLIDER);

    if (roomMap.has('f_bed_2')) {
      addEdge('f_family_lounge', 'f_bed_2', RELATIONSHIP_TYPES.ACCESS_RELATIONSHIP, ACCESS_PORTAL_TYPES.DOOR);
      if (roomMap.has('f_bath_2')) addEdge('f_bed_2', 'f_bath_2', RELATIONSHIP_TYPES.ACCESS_RELATIONSHIP, ACCESS_PORTAL_TYPES.DOOR);
    }
    if (roomMap.has('f_bed_3')) {
      addEdge('f_family_lounge', 'f_bed_3', RELATIONSHIP_TYPES.ACCESS_RELATIONSHIP, ACCESS_PORTAL_TYPES.DOOR);
      if (roomMap.has('f_bath_3')) addEdge('f_bed_3', 'f_bath_3', RELATIONSHIP_TYPES.ACCESS_RELATIONSHIP, ACCESS_PORTAL_TYPES.DOOR);
    }
  }

  // -------------------------------------------------------------------------
  // Multi-Floor Vertical Connections
  // -------------------------------------------------------------------------
  if (targetFloor === null) {
    if (roomMap.has('g_stairwell_core') && roomMap.has('f_stairwell_core')) {
      addEdge('g_stairwell_core', 'f_stairwell_core', RELATIONSHIP_TYPES.VERTICAL_CONNECTION, ACCESS_PORTAL_TYPES.STAIR_FLIGHT);
    }
    if (roomMap.has('f_stairwell_core') && roomMap.has('t_mumty')) {
      addEdge('f_stairwell_core', 't_mumty', RELATIONSHIP_TYPES.VERTICAL_CONNECTION, ACCESS_PORTAL_TYPES.STAIR_FLIGHT);
    }
    if (roomMap.has('t_mumty') && roomMap.has('t_open_deck')) {
      addEdge('t_mumty', 't_open_deck', RELATIONSHIP_TYPES.ACCESS_RELATIONSHIP, ACCESS_PORTAL_TYPES.DOOR);
    }
  }

  return edges;
}

/**
 * Resolves legacy 'stairwell_core' string to floor-specific ID
 */
function resolveStairCoreId(id, roomMap) {
  if (id === 'stairwell_core') {
    if (roomMap.has('g_stairwell_core')) return 'g_stairwell_core';
    if (roomMap.has('f_stairwell_core')) return 'f_stairwell_core';
  }
  return id;
}

/**
 * Extracts the primary circulation spine sequence of rooms
 */
function generateCirculationSpine(nodes, _edges) {
  const spineCandidates = [
    'g_portico',
    'g_foyer',
    'g_living',
    'g_dining',
    'g_stairwell_core',
    'f_stairwell_core',
    'f_family_lounge',
    't_mumty'
  ];

  const nodeIds = new Set(nodes.map(n => n.id));
  return spineCandidates.filter(id => nodeIds.has(id));
}
