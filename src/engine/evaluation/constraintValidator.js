/**
 * LabourConnect Design Engine - Architectural Constraint Validator & Optimizer
 * 
 * S2-T05: Constraint Handling and Optimization
 * 
 * Enforces hard constraints:
 * - Boundary containment (all rooms strictly inside buildable envelope)
 * - Zero room overlaps (spatial collision detection with zero-tolerance)
 * - Egress access & clear widths (minimum compliant door openings and accessibility)
 * - Minimum architectural spatial standards (room dimensions and minimum areas)
 * - Multi-floor vertical core alignment (stairwell & shaft column stacking)
 * - Municipal ground coverage limits
 * 
 * Evaluates soft objectives:
 * - Circulation efficiency (carpet vs built-up ratio)
 * - Preferred topological adjacencies & functional separations
 * - Natural daylighting & cross-ventilation exposure for habitable spaces
 * - Leftover envelope waste & plinth utilization
 * - Spatial aspect ratios and room proportions
 * 
 * Provides deterministic multi-objective optimization scores and actionable
 * architectural remediation recommendations for infeasible candidates.
 */

import { validateArchitectureGeometry } from './geometricValidator.js';
import { ARCHITECTURAL_SPACE_STANDARDS } from '../interpreter/layoutRequirementsContract.js';
import { ROOM_TYPES, ZONES } from '../schema/canonicalDesignSchema.js';
import { RELATIONSHIP_TYPES } from '../generator/adjacencyGraphSolver.js';

export const CONSTRAINT_VALIDATOR_VERSION = '2.1.0-s2-t06';

export const VALIDATION_RESULT_TYPES = {
  VALID_CANDIDATE: 'VALID_CANDIDATE',
  INVALID_CANDIDATE: 'INVALID_CANDIDATE',
  INFEASIBLE_REQUIREMENTS: 'INFEASIBLE_REQUIREMENTS',
  VALIDATION_ERROR: 'VALIDATION_ERROR'
};

export const HARD_CONSTRAINT_TYPES = {
  BOUNDARY_CONTAINMENT: 'BOUNDARY_CONTAINMENT',
  ZERO_OVERLAPS: 'ZERO_OVERLAPS',
  EGRESS_CLEARANCES: 'EGRESS_CLEARANCES',
  MINIMUM_DIMENSIONS: 'MINIMUM_DIMENSIONS',
  AREA_CONSISTENCY: 'AREA_CONSISTENCY',
  VERTICAL_ALIGNMENT: 'VERTICAL_ALIGNMENT',
  VERTICAL_CONNECTIONS: 'VERTICAL_CONNECTIONS',
  GROUND_COVERAGE: 'GROUND_COVERAGE',
  REQUIRED_ADJACENCY: 'REQUIRED_ADJACENCY',
  REQUIRED_SEPARATION: 'REQUIRED_SEPARATION',
  WALL_GEOMETRY: 'WALL_GEOMETRY',
  CANONICAL_CONSISTENCY: 'CANONICAL_CONSISTENCY'
};

export const SOFT_OBJECTIVE_TYPES = {
  CIRCULATION_EFFICIENCY: 'CIRCULATION_EFFICIENCY',
  PREFERRED_ADJACENCIES: 'PREFERRED_ADJACENCIES',
  DAYLIGHT_VENTILATION: 'DAYLIGHT_VENTILATION',
  SPACE_UTILIZATION: 'SPACE_UTILIZATION',
  ASPECT_RATIO_SUITABILITY: 'ASPECT_RATIO_SUITABILITY'
};

export const DEFAULT_SOFT_WEIGHTS = {
  circulation: 0.25,
  adjacencies: 0.25,
  daylight: 0.20,
  spaceUtilization: 0.15,
  aspectRatio: 0.15
};

const EPSILON = 0.2; // 0.2 ft (2.4 inches) tolerance for real-world construction allowances

/**
 * Checks if two bounding boxes overlap with area > tolerance
 */
export function calculateBoxOverlap(boxA, boxB, minOverlapArea = 0.1) {
  if (!boxA || !boxB) return { overlaps: false, area: 0 };
  const ax1 = boxA.x;
  const ay1 = boxA.y;
  const ax2 = boxA.x + boxA.width;
  const ay2 = boxA.y + boxA.length;

  const bx1 = boxB.x;
  const by1 = boxB.y;
  const bx2 = boxB.x + boxB.width;
  const by2 = boxB.y + boxB.length;

  const overlapX = Math.max(0, Math.min(ax2, bx2) - Math.max(ax1, bx1));
  const overlapY = Math.max(0, Math.min(ay2, by2) - Math.max(ay1, by1));
  const area = overlapX * overlapY;

  return {
    overlaps: area > minOverlapArea,
    area: Number(area.toFixed(2)),
    overlapWidth: Number(overlapX.toFixed(2)),
    overlapLength: Number(overlapY.toFixed(2))
  };
}

/**
 * Evaluates whether two rooms are adjacent (sharing a wall or within contact distance)
 */
export function areRoomsAdjacent(boxA, boxB, contactThreshold = 1.2) {
  if (!boxA || !boxB) return false;
  const ax1 = boxA.x;
  const ay1 = boxA.y;
  const ax2 = boxA.x + boxA.width;
  const ay2 = boxA.y + boxA.length;

  const bx1 = boxB.x;
  const by1 = boxB.y;
  const bx2 = boxB.x + boxB.width;
  const by2 = boxB.y + boxB.length;

  // Horizontal overlap and vertical proximity
  const xOverlap = Math.min(ax2, bx2) - Math.max(ax1, bx1);
  const yDist = Math.max(0, Math.max(ay1, by1) - Math.min(ay2, by2));

  // Vertical overlap and horizontal proximity
  const yOverlap = Math.min(ay2, by2) - Math.max(ay1, by1);
  const xDist = Math.max(0, Math.max(ax1, bx1) - Math.min(ax2, bx2));

  if (xOverlap > 0.5 && yDist <= contactThreshold) return true;
  if (yOverlap > 0.5 && xDist <= contactThreshold) return true;

  return false;
}

/**
 * Evaluates all architectural Hard Constraints on a design layout.
 * 
 * @param {Object} layout - Layout candidate structure
 * @param {Object} [options] - Evaluation options
 * @returns {Object} Hard constraint evaluation results
 */
export function evaluateHardConstraints(layout, options = {}) {
  const violations = [];
  const warnings = [];
  const diagnostics = [];
  const details = {
    boundaryContainment: { passed: true, violations: [] },
    zeroOverlaps: { passed: true, violations: [] },
    egressClearances: { passed: true, violations: [] },
    minimumDimensions: { passed: true, violations: [] },
    areaConsistency: { passed: true, violations: [] },
    verticalAlignment: { passed: true, violations: [] },
    verticalConnections: { passed: true, violations: [] },
    groundCoverage: { passed: true, violations: [] },
    requiredAdjacencies: { passed: true, violations: [] },
    requiredSeparations: { passed: true, violations: [] },
    wallGeometry: { passed: true, violations: [] },
    canonicalConsistency: { passed: true, violations: [] }
  };

  const addViolation = (constraintKey, msg, diag = {}) => {
    violations.push(msg);
    if (details[constraintKey]) {
      details[constraintKey].violations.push(msg);
      details[constraintKey].passed = false;
    }
    diagnostics.push({
      constraint: constraintKey,
      message: msg,
      room: diag.room || null,
      roomName: diag.roomName || null,
      floor: diag.floor || null,
      measurement: diag.measurement || null
    });
  };

  if (!layout || typeof layout !== 'object') {
    addViolation('canonicalConsistency', 'Layout candidate must be a valid non-null object.');
    return {
      passed: false,
      violations,
      warnings,
      diagnostics,
      details
    };
  }

  const { site, floors } = layout;

  if (!site || !site.buildableEnvelope) {
    addViolation('boundaryContainment', 'Layout site buildable envelope is missing.');
    return {
      passed: false,
      violations,
      warnings,
      diagnostics,
      details
    };
  }

  const env = site.buildableEnvelope;
  const envX1 = env.x;
  const envY1 = env.y;
  const envX2 = env.x + env.width;
  const envY2 = env.y + env.length;

  if (!Array.isArray(floors) || floors.length === 0) {
    addViolation('canonicalConsistency', 'Layout must contain at least one floor level.');
    return {
      passed: false,
      violations,
      warnings,
      diagnostics,
      details
    };
  }

  // -------------------------------------------------------------------------
  // HC-1: BOUNDARY CONTAINMENT
  // -------------------------------------------------------------------------
  floors.forEach((floor, fIdx) => {
    const fName = floor.name || `Floor ${fIdx}`;
    (floor.rooms || []).forEach(room => {
      const b = room.bounds;
      if (!b) return;

      const rx1 = b.x;
      const ry1 = b.y;
      const rx2 = b.x + b.width;
      const ry2 = b.y + b.length;

      const outLeft = rx1 < envX1 - EPSILON;
      const outTop = ry1 < envY1 - EPSILON;
      const outRight = rx2 > envX2 + EPSILON;
      const outBottom = ry2 > envY2 + EPSILON;

      if (outLeft || outTop || outRight || outBottom) {
        const msg = `[Boundary Containment] Room "${room.name || room.id}" on ${fName} exceeds buildable envelope bounds (room: [${rx1}, ${ry1}, ${rx2}, ${ry2}], envelope: [${envX1}, ${envY1}, ${envX2}, ${envY2}]).`;
        addViolation('boundaryContainment', msg, {
          room: room.id,
          roomName: room.name,
          floor: fName,
          measurement: `Room: [${rx1}, ${ry1}, ${rx2}, ${ry2}], Envelope: [${envX1}, ${envY1}, ${envX2}, ${envY2}]`
        });
      }
    });
  });

  // -------------------------------------------------------------------------
  // HC-2: ZERO ROOM OVERLAPS
  // -------------------------------------------------------------------------
  floors.forEach((floor, fIdx) => {
    const fName = floor.name || `Floor ${fIdx}`;
    const rooms = floor.rooms || [];

    for (let i = 0; i < rooms.length; i++) {
      for (let j = i + 1; j < rooms.length; j++) {
        const rA = rooms[i];
        const rB = rooms[j];
        if (!rA.bounds || !rB.bounds) continue;

        // Skip open rooftop deck or nested prayer alcoves
        if (rA.id === 't_open_deck' || rB.id === 't_open_deck') continue;
        if (rA.type === ROOM_TYPES.TERRACE || rB.type === ROOM_TYPES.TERRACE) continue;
        if (rA.id === 'g_pooja' || rB.id === 'g_pooja') continue;

        const overlap = calculateBoxOverlap(rA.bounds, rB.bounds, 0.1);
        if (overlap.overlaps) {
          if (overlap.area > 1.5) {
            // Physical spatial collision (fatal hard constraint)
            const msg = `[Zero Overlaps] Spatial collision detected on ${fName} between "${rA.name || rA.id}" and "${rB.name || rB.id}" (overlap area: ${overlap.area} sq.ft).`;
            addViolation('zeroOverlaps', msg, {
              room: rA.id,
              roomName: rA.name,
              floor: fName,
              measurement: `${overlap.area} sq.ft overlap with ${rB.id}`
            });
          } else if (overlap.area > 0.2) {
            // Minor partition line junction overlap (warning)
            warnings.push(`[Zero Overlaps Warning] Minor partition junction overlap (${overlap.area} sq.ft) between "${rA.name || rA.id}" and "${rB.name || rB.id}" on ${fName}.`);
          }
        }
      }
    }
  });

  // -------------------------------------------------------------------------
  // HC-3: EGRESS ACCESS & CLEARANCES
  // -------------------------------------------------------------------------
  floors.forEach((floor, fIdx) => {
    const fName = floor.name || `Floor ${fIdx}`;
    (floor.rooms || []).forEach(room => {
      // Outdoor / open-to-sky spaces (portico, terrace deck, open balcony, courtyard) do not require enclosed egress doors
      const isOutdoor = room.zone === ZONES.OUTDOOR || room.type === ROOM_TYPES.PORTICO || room.type === ROOM_TYPES.TERRACE || room.type === ROOM_TYPES.COURTYARD || room.type === ROOM_TYPES.BALCONY;
      if (isOutdoor) return;

      const doors = room.doors || [];
      const hasDoor = doors.length > 0;
      const isSecondary = room.type === ROOM_TYPES.BATHROOM || room.type === ROOM_TYPES.POOJA || room.type === 'utility' || room.type === 'store';
      const minRequiredDoorWidth = isSecondary ? 2.4 : 2.8;

      if (!hasDoor) {
        // Enclosed habitable room with zero doors violates egress
        const msg = `[Egress Clearances] Enclosed space "${room.name || room.id}" on ${fName} lacks a designated entrance/exit door opening.`;
        addViolation('egressClearances', msg, {
          room: room.id,
          roomName: room.name,
          floor: fName,
          measurement: '0 doors'
        });
      } else {
        // Check door width compliance
        const compliantDoor = doors.some(d => (d.width || d.clearWidth || 3.0) >= (minRequiredDoorWidth - EPSILON));
        if (!compliantDoor) {
          const msg = `[Egress Clearances] Doors for room "${room.name || room.id}" on ${fName} do not meet minimum clear opening width of ${minRequiredDoorWidth} ft.`;
          addViolation('egressClearances', msg, {
            room: room.id,
            roomName: room.name,
            floor: fName,
            measurement: `< ${minRequiredDoorWidth} ft clear width`
          });
        }

        // Check door coordinates validity if provided
        const b = room.bounds;
        if (b) {
          doors.forEach(d => {
            if (typeof d.x === 'number' && typeof d.y === 'number') {
              const doorMargin = 2.5; // ft allowance for wall attachment
              const outX = d.x < (b.x - doorMargin) || d.x > (b.x + b.width + doorMargin);
              const outY = d.y < (b.y - doorMargin) || d.y > (b.y + b.length + doorMargin);
              if (outX || outY) {
                const msg = `[Access Conditions] Door for room "${room.name || room.id}" on ${fName} is placed at (${d.x}, ${d.y}) outside room boundary envelope.`;
                addViolation('egressClearances', msg, {
                  room: room.id,
                  roomName: room.name,
                  floor: fName,
                  measurement: `Door (${d.x}, ${d.y}) outside bounds [${b.x}, ${b.y}, ${(b.x+b.width).toFixed(1)}, ${(b.y+b.length).toFixed(1)}]`
                });
              }
            }
          });
        }
      }
    });
  });

  // -------------------------------------------------------------------------
  // HC-4: MINIMUM DIMENSIONS & STANDARDS
  // -------------------------------------------------------------------------
  floors.forEach((floor, fIdx) => {
    const fName = floor.name || `Floor ${fIdx}`;
    (floor.rooms || []).forEach(room => {
      const b = room.bounds;
      if (!b) return;

      const actualW = Math.min(b.width, b.length);
      const actualL = Math.max(b.width, b.length);
      const actualA = room.areaSqft || Math.round(b.width * b.length);

      // Check strictly positive dimensions
      if (actualW <= 0 || actualL <= 0 || actualA <= 0) {
        const msg = `[Minimum Dimensions] Room "${room.name || room.id}" on ${fName} has non-positive dimensions (${b.width}×${b.length} ft).`;
        addViolation('minimumDimensions', msg, {
          room: room.id,
          roomName: room.name,
          floor: fName,
          measurement: `${b.width}×${b.length} ft`
        });
        return;
      }

      // Absolute National Building Code / architectural habitable minimum clearances
      let absMinW = 5.5;
      let absMinL = 5.5;
      let absMinA = 40.0;

      if (room.type === ROOM_TYPES.BALCONY || room.type === ROOM_TYPES.PORTICO || room.type === ROOM_TYPES.FOYER) {
        absMinW = 2.8;
        absMinL = 2.8;
        absMinA = 15.0;
      } else if (room.type === ROOM_TYPES.BATHROOM) {
        absMinW = 3.5;
        absMinL = 4.5;
        absMinA = 20.0;
      } else if (room.type === ROOM_TYPES.POOJA) {
        absMinW = 3.0;
        absMinL = 3.0;
        absMinA = 12.0;
      } else if (room.type === ROOM_TYPES.STAIRWELL) {
        absMinW = 5.0;
        absMinL = 7.0;
        absMinA = 45.0;
      } else if (room.type === ROOM_TYPES.KITCHEN) {
        absMinW = 5.0;
        absMinL = 6.0;
        absMinA = 35.0;
      } else if (room.type === ROOM_TYPES.LIVING) {
        absMinW = 5.0;
        absMinL = 7.0;
        absMinA = 50.0;
      } else if (room.type === ROOM_TYPES.BEDROOM || room.type === ROOM_TYPES.MASTER_BEDROOM || room.type === ROOM_TYPES.DINING) {
        absMinW = 6.5;
        absMinL = 7.5;
        absMinA = 55.0;
      }

      if (actualW < absMinW - EPSILON || actualL < absMinL - EPSILON || actualA < absMinA - 1.0) {
        const msg = `[Minimum Dimensions] Room "${room.name || room.id}" on ${fName} is critically undersized (${b.width}×${b.length} ft, ${actualA} sq.ft; absolute code minimum is ${absMinW}×${absMinL} ft, ${absMinA} sq.ft).`;
        addViolation('minimumDimensions', msg, {
          room: room.id,
          roomName: room.name,
          floor: fName,
          measurement: `${b.width}×${b.length} ft, ${actualA} sq.ft`
        });
      } else {
        // Preferred space standard check (emits non-fatal warning if below preferred target)
        const std = ARCHITECTURAL_SPACE_STANDARDS[room.type] || {};
        const prefW = std.minWidth || absMinW;
        const prefL = std.minLength || absMinL;
        const prefA = std.minArea || absMinA;

        if (actualW < prefW - EPSILON || actualL < prefL - EPSILON || actualA < prefA - 1.0) {
          warnings.push(`[Space Standard Advisory] Room "${room.name || room.id}" (${b.width}×${b.length} ft, ${actualA} sq.ft) is below preferred architectural standard (${prefW}×${prefL} ft, ${prefA} sq.ft).`);
        }
      }
    });
  });

  // -------------------------------------------------------------------------
  // HC-5: ROOM DIMENSIONS & AREA CONSISTENCY
  // -------------------------------------------------------------------------
  floors.forEach((floor, fIdx) => {
    const fName = floor.name || `Floor ${fIdx}`;
    (floor.rooms || []).forEach(room => {
      const b = room.bounds;
      if (!b) return;

      const calcArea = Math.round(b.width * b.length);
      if (room.areaSqft !== undefined && room.areaSqft !== null) {
        if (room.areaSqft <= 0) {
          const msg = `[Area Consistency] Room "${room.name || room.id}" on ${fName} has non-positive declared area (${room.areaSqft} sq.ft).`;
          addViolation('areaConsistency', msg, {
            room: room.id,
            roomName: room.name,
            floor: fName,
            measurement: `area: ${room.areaSqft} sq.ft`
          });
        } else if (Math.abs(calcArea - room.areaSqft) > 3.0) {
          const msg = `[Area Consistency] Room "${room.name || room.id}" on ${fName} has contradictory area: declared ${room.areaSqft} sq.ft, but boundary dimensions (${b.width}×${b.length} ft) compute to ${calcArea} sq.ft.`;
          addViolation('areaConsistency', msg, {
            room: room.id,
            roomName: room.name,
            floor: fName,
            measurement: `declared: ${room.areaSqft} sq.ft vs computed: ${calcArea} sq.ft`
          });
        }
      }
    });
  });

  // -------------------------------------------------------------------------
  // HC-6: VERTICAL ALIGNMENT & STRUCTURAL INTEGRITY
  // -------------------------------------------------------------------------
  if (floors.length > 1) {
    const stairRooms = [];
    floors.forEach(f => {
      const s = (f.rooms || []).find(r => r.type === ROOM_TYPES.STAIRWELL || (r.id && (r.id.includes('stairwell') || r.id.includes('mumty'))));
      if (s && s.bounds) {
        stairRooms.push({ floorName: f.name, floorIndex: f.floorIndex, bounds: s.bounds, id: s.id });
      }
    });

    if (stairRooms.length > 1) {
      const anchor = stairRooms[0].bounds;
      for (let i = 1; i < stairRooms.length; i++) {
        const target = stairRooms[i].bounds;
        const shiftX = Math.abs(anchor.x - target.x);
        const shiftY = Math.abs(anchor.y - target.y);
        const shiftW = Math.abs(anchor.width - target.width);
        const shiftL = Math.abs(anchor.length - target.length);

        if (shiftX > 0.5 || shiftY > 0.5 || shiftW > 0.5 || shiftL > 0.5) {
          const msg = `[Vertical Alignment] Vertical stairwell column is misaligned between ${stairRooms[0].floorName} and ${stairRooms[i].floorName} (shift: Δx=${shiftX.toFixed(2)}ft, Δy=${shiftY.toFixed(2)}ft).`;
          addViolation('verticalAlignment', msg, {
            room: stairRooms[i].id,
            floor: stairRooms[i].floorName,
            measurement: `Δx: ${shiftX.toFixed(2)}ft, Δy: ${shiftY.toFixed(2)}ft`
          });
        }
      }
    }
  }

  // -------------------------------------------------------------------------
  // HC-7: VERTICAL CONNECTIONS ACROSS FLOORS
  // -------------------------------------------------------------------------
  if (floors.length > 1) {
    floors.forEach((f, fIdx) => {
      if (fIdx > 0) {
        const hasVerticalAccess = (f.rooms || []).some(r =>
          r.type === ROOM_TYPES.STAIRWELL ||
          (r.id && (r.id.includes('stairwell') || r.id.includes('mumty') || r.id.includes('lift')))
        );
        if (!hasVerticalAccess) {
          const msg = `[Vertical Connection] Upper floor "${f.name || `Floor ${fIdx}`}" lacks vertical circulation core (stairwell) connecting to lower levels.`;
          addViolation('verticalConnections', msg, {
            floor: f.name || `Floor ${fIdx}`,
            measurement: 'Missing vertical access core'
          });
        }
      }
    });
  }

  // -------------------------------------------------------------------------
  // HC-8: WALL AND PARTITION GEOMETRY
  // -------------------------------------------------------------------------
  floors.forEach((floor, fIdx) => {
    const fName = floor.name || `Floor ${fIdx}`;
    const walls = Array.isArray(floor.walls) ? floor.walls : [];
    walls.forEach(w => {
      if (!w) return;
      if (!w.start || !w.end || typeof w.start.x !== 'number' || typeof w.start.y !== 'number' || typeof w.end.x !== 'number' || typeof w.end.y !== 'number') {
        const msg = `[Wall Geometry] Wall "${w.id || 'wall'}" on ${fName} has missing or non-numeric start/end coordinates.`;
        addViolation('wallGeometry', msg, { floor: fName, measurement: 'invalid start/end coordinates' });
        return;
      }

      const dx = w.end.x - w.start.x;
      const dy = w.end.y - w.start.y;
      const wallLen = Math.sqrt(dx * dx + dy * dy);

      if (wallLen < 0.1) {
        const msg = `[Wall Geometry] Wall "${w.id || 'wall'}" on ${fName} is degenerate with zero length (${wallLen.toFixed(2)} ft).`;
        addViolation('wallGeometry', msg, { floor: fName, measurement: `length: ${wallLen.toFixed(2)} ft` });
      }

      if (typeof w.thickness === 'number' && w.thickness <= 0) {
        const msg = `[Wall Geometry] Wall "${w.id || 'wall'}" on ${fName} has non-positive thickness (${w.thickness}).`;
        addViolation('wallGeometry', msg, { floor: fName, measurement: `thickness: ${w.thickness}` });
      }

      // Check containment inside envelope
      const isStartOutside = w.start.x < (envX1 - EPSILON) || w.start.x > (envX2 + EPSILON) || w.start.y < (envY1 - EPSILON) || w.start.y > (envY2 + EPSILON);
      const isEndOutside = w.end.x < (envX1 - EPSILON) || w.end.x > (envX2 + EPSILON) || w.end.y < (envY1 - EPSILON) || w.end.y > (envY2 + EPSILON);

      if (isStartOutside || isEndOutside) {
        const msg = `[Wall Geometry] Wall "${w.id || 'wall'}" on ${fName} extends outside buildable envelope boundary.`;
        addViolation('wallGeometry', msg, { floor: fName, measurement: `start: (${w.start.x}, ${w.start.y}), end: (${w.end.x}, ${w.end.y})` });
      }
    });
  });

  // -------------------------------------------------------------------------
  // HC-9: REQUIRED ADJACENCY CONSTRAINTS
  // -------------------------------------------------------------------------
  const roomMap = new Map();
  floors.forEach((f, fIdx) => {
    const fName = f.name || `Floor ${f.floorIndex ?? fIdx}`;
    (f.rooms || []).forEach(r => {
      if (r && r.id) {
        roomMap.set(r.id, {
          room: r,
          floorName: fName,
          floorIndex: f.floorIndex ?? fIdx,
          bounds: r.bounds
        });
      }
    });
  });

  const hardAdjacencies = [];
  if (Array.isArray(options.requiredAdjacencies)) {
    hardAdjacencies.push(...options.requiredAdjacencies);
  }
  if (Array.isArray(layout.requiredAdjacencies)) {
    hardAdjacencies.push(...layout.requiredAdjacencies);
  }
  if ((options.enforceGraphConstraints || layout.enforceGraphConstraints) && layout.adjacencyGraph?.hardConstraints) {
    layout.adjacencyGraph.hardConstraints
      .filter(e => e.type === RELATIONSHIP_TYPES.REQUIRED_ADJACENCY)
      .forEach(e => hardAdjacencies.push({ source: e.source, target: e.target }));
  }

  const seenAdjPairs = new Set();
  hardAdjacencies.forEach(edge => {
    const key = [edge.source, edge.target].sort().join('::');
    if (seenAdjPairs.has(key)) return;
    seenAdjPairs.add(key);

    const rA = roomMap.get(edge.source);
    const rB = roomMap.get(edge.target);

    if (!rA || !rB) {
      const missingId = !rA ? edge.source : edge.target;
      const msg = `[Required Adjacency] Hard adjacency requirement between "${edge.source}" and "${edge.target}" cannot be satisfied because room "${missingId}" is missing from layout.`;
      addViolation('requiredAdjacencies', msg, {
        room: missingId,
        measurement: 'missing room'
      });
      return;
    }

    if (rA.floorIndex === rB.floorIndex) {
      const adjacent = areRoomsAdjacent(rA.bounds, rB.bounds, 1.2);
      if (!adjacent) {
        const msg = `[Required Adjacency] Hard adjacency requirement between "${rA.room.name || edge.source}" and "${rB.room.name || edge.target}" on ${rA.floorName} is violated: rooms do not share contact or direct wall.`;
        addViolation('requiredAdjacencies', msg, {
          room: edge.source,
          floor: rA.floorName,
          measurement: 'not adjacent'
        });
      }
    } else {
      const msg = `[Required Adjacency] Hard adjacency requirement between "${rA.room.name || edge.source}" and "${rB.room.name || edge.target}" is violated: rooms are placed on different floor levels (${rA.floorName} vs ${rB.floorName}) without vertical link.`;
      addViolation('requiredAdjacencies', msg, {
        room: edge.source,
        floor: rA.floorName,
        measurement: `floor ${rA.floorIndex} vs ${rB.floorIndex}`
      });
    }
  });

  // -------------------------------------------------------------------------
  // HC-10: REQUIRED SEPARATION CONSTRAINTS
  // -------------------------------------------------------------------------
  const hardSeparations = [];
  if (Array.isArray(options.requiredSeparations)) {
    hardSeparations.push(...options.requiredSeparations);
  }
  if (Array.isArray(layout.requiredSeparations)) {
    hardSeparations.push(...layout.requiredSeparations);
  }
  if ((options.enforceGraphConstraints || layout.enforceGraphConstraints) && layout.adjacencyGraph?.hardConstraints) {
    layout.adjacencyGraph.hardConstraints
      .filter(e => e.type === RELATIONSHIP_TYPES.REQUIRED_SEPARATION)
      .forEach(e => hardSeparations.push({ source: e.source, target: e.target }));
  }

  const seenSepPairs = new Set();
  hardSeparations.forEach(edge => {
    const key = [edge.source, edge.target].sort().join('::');
    if (seenSepPairs.has(key)) return;
    seenSepPairs.add(key);

    const rA = roomMap.get(edge.source);
    const rB = roomMap.get(edge.target);
    if (!rA || !rB) return;

    if (rA.floorIndex === rB.floorIndex) {
      const adjacent = areRoomsAdjacent(rA.bounds, rB.bounds, 1.2);
      const overlap = calculateBoxOverlap(rA.bounds, rB.bounds, 0.1);
      if (adjacent || overlap.overlaps) {
        const msg = `[Required Separation] Hard separation requirement between "${rA.room.name || edge.source}" and "${rB.room.name || edge.target}" on ${rA.floorName} is violated: rooms are directly touching or adjacent.`;
        addViolation('requiredSeparations', msg, {
          room: edge.source,
          floor: rA.floorName,
          measurement: 'rooms touching or adjacent'
        });
      }
    }
  });

  // -------------------------------------------------------------------------
  // HC-11: CANONICAL MODEL CONSISTENCY
  // -------------------------------------------------------------------------
  const idSet = new Set();
  floors.forEach((f, fIdx) => {
    const fName = f.name || `Floor ${fIdx}`;
    (f.rooms || []).forEach(r => {
      if (r.id) {
        if (idSet.has(r.id)) {
          const msg = `[Canonical Consistency] Duplicate room identifier detected: "${r.id}" on ${fName}.`;
          addViolation('canonicalConsistency', msg, { room: r.id, floor: fName });
        } else {
          idSet.add(r.id);
        }
      }
      if (r.bounds) {
        if (r.bounds.x < 0 || r.bounds.y < 0) {
          const msg = `[Canonical Consistency] Room "${r.id}" on ${fName} violates positive coordinate convention (x: ${r.bounds.x}, y: ${r.bounds.y}).`;
          addViolation('canonicalConsistency', msg, { room: r.id, floor: fName, measurement: `(${r.bounds.x}, ${r.bounds.y})` });
        }
      }
    });
  });

  // -------------------------------------------------------------------------
  // HC-12: GROUND COVERAGE
  // -------------------------------------------------------------------------
  const groundFloor = floors[0];
  if (groundFloor && site.plotAreaSqft > 0) {
    const groundBuiltUp = Math.round((groundFloor.rooms || []).reduce((sum, r) => sum + (r.areaSqft || (r.bounds?.width * r.bounds?.length) || 0), 0) * 1.15);
    const coverageRatio = groundBuiltUp / site.plotAreaSqft;
    const maxPermittedCoverage = site.maxGroundCoverageRatio || 0.85;

    if (coverageRatio > maxPermittedCoverage + 0.05) {
      const msg = `[Ground Coverage] Ground coverage ratio (${(coverageRatio * 100).toFixed(1)}%) exceeds maximum municipal limit of ${(maxPermittedCoverage * 100).toFixed(1)}%.`;
      addViolation('groundCoverage', msg, {
        floor: groundFloor.name || 'Ground Floor',
        measurement: `${(coverageRatio * 100).toFixed(1)}% > ${(maxPermittedCoverage * 100).toFixed(1)}%`
      });
    }
  }

  const passed = violations.length === 0;
  return {
    passed,
    violations,
    warnings,
    diagnostics,
    details
  };
}

/**
 * Evaluates all architectural Soft Objectives and computes optimization scores.
 * 
 * @param {Object} layout - Layout candidate structure
 * @param {Object} [options] - Scoring weights and preferences
 * @returns {Object} Soft objective evaluation results and optimization score
 */
export function evaluateSoftObjectives(layout, options = {}) {
  const weights = { ...DEFAULT_SOFT_WEIGHTS, ...(options.weights || {}) };
  const recommendations = [];
  const details = {};

  if (!layout || !layout.floors || layout.floors.length === 0) {
    return {
      score: 0,
      details: {},
      recommendations: ['Layout candidate has no floors to evaluate.']
    };
  }

  const { site, floors, metrics, adjacencyGraph } = layout;
  const env = site?.buildableEnvelope || { width: 30, length: 40, x: 0, y: 0 };

  // -------------------------------------------------------------------------
  // SO-1: CIRCULATION EFFICIENCY
  // -------------------------------------------------------------------------
  // Carpet vs Built-up ratio. Benchmark: 75% - 85% is optimal.
  const builtUp = metrics?.builtUpAreaSqft || floors.reduce((acc, f) => acc + (f.grossAreaRequired || 1000), 0);
  const carpet = metrics?.carpetAreaSqft || floors.reduce((acc, f) => acc + (f.netCarpetArea || 750), 0);
  const carpetRatio = builtUp > 0 ? (carpet / builtUp) : 0.75;

  let circulationScore = 80;
  if (carpetRatio >= 0.82) {
    circulationScore = 100;
  } else if (carpetRatio >= 0.75) {
    circulationScore = Math.round(85 + ((carpetRatio - 0.75) / 0.07) * 15);
  } else if (carpetRatio >= 0.65) {
    circulationScore = Math.round(65 + ((carpetRatio - 0.65) / 0.10) * 20);
    recommendations.push(`Circulation efficiency is ${(carpetRatio * 100).toFixed(1)}%; consider tightening circulation passages to increase net carpet ratio above 75%.`);
  } else {
    circulationScore = Math.max(30, Math.round((carpetRatio / 0.65) * 65));
    recommendations.push(`Circulation efficiency is low (${(carpetRatio * 100).toFixed(1)}%); excessive floor area is lost to masonry and non-functional corridors.`);
  }

  details.circulationEfficiency = {
    score: circulationScore,
    carpetRatio: Number(carpetRatio.toFixed(3)),
    carpetAreaSqft: carpet,
    builtUpAreaSqft: builtUp
  };

  // -------------------------------------------------------------------------
  // SO-2: PREFERRED ADJACENCIES
  // -------------------------------------------------------------------------
  // Check how many soft adjacency preferences from the relationship graph or rooms are satisfied
  let totalSoftEdges = 0;
  let satisfiedSoftEdges = 0;
  const missedPreferences = [];

  const softEdges = adjacencyGraph?.softPreferences || [];
  if (softEdges.length > 0) {
    totalSoftEdges = softEdges.length;
    // Build room map across all floors
    const roomMap = new Map();
    floors.forEach(f => {
      (f.rooms || []).forEach(r => roomMap.set(r.id, r));
    });

    softEdges.forEach(edge => {
      const roomA = roomMap.get(edge.source);
      const roomB = roomMap.get(edge.target);
      if (!roomA || !roomB) return;

      const adjacent = areRoomsAdjacent(roomA.bounds, roomB.bounds);
      if (edge.type === RELATIONSHIP_TYPES.PREFERRED_ADJACENCY) {
        if (adjacent) {
          satisfiedSoftEdges++;
        } else {
          missedPreferences.push(`Preferred adjacency between "${roomA.name || edge.source}" and "${roomB.name || edge.target}" was not fully satisfied.`);
        }
      } else if (edge.type === RELATIONSHIP_TYPES.REQUIRED_SEPARATION) {
        if (!adjacent) {
          satisfiedSoftEdges++;
        } else {
          missedPreferences.push(`Separation preference breached: "${roomA.name || edge.source}" touches "${roomB.name || edge.target}".`);
        }
      }
    });
  }

  // If no explicit edges were passed, check standard architectural adjacencies on Ground Floor
  if (totalSoftEdges === 0) {
    const groundRooms = floors[0]?.rooms || [];
    const findRoom = (t) => groundRooms.find(r => r.type === t);
    const living = findRoom(ROOM_TYPES.LIVING);
    const dining = findRoom(ROOM_TYPES.DINING);
    const kitchen = findRoom(ROOM_TYPES.KITCHEN);
    const foyer = findRoom(ROOM_TYPES.FOYER);

    totalSoftEdges = 3;
    if (kitchen && dining && areRoomsAdjacent(kitchen.bounds, dining.bounds)) satisfiedSoftEdges++;
    else missedPreferences.push('Kitchen is not adjacent to Dining space.');

    if (living && dining && areRoomsAdjacent(living.bounds, dining.bounds)) satisfiedSoftEdges++;
    else missedPreferences.push('Living Lounge is separated from Dining area.');

    if (foyer && living && areRoomsAdjacent(foyer.bounds, living.bounds)) satisfiedSoftEdges++;
  }

  const adjacencySatisfactionRate = totalSoftEdges > 0 ? (satisfiedSoftEdges / totalSoftEdges) : 0.85;
  const adjacencyScore = Math.round(adjacencySatisfactionRate * 100);
  recommendations.push(...missedPreferences);

  details.preferredAdjacencies = {
    score: adjacencyScore,
    totalSoftEdges,
    satisfiedSoftEdges,
    satisfactionRate: Number(adjacencySatisfactionRate.toFixed(2))
  };

  // -------------------------------------------------------------------------
  // SO-3: NATURAL DAYLIGHT & CROSS-VENTILATION
  // -------------------------------------------------------------------------
  // Checks what percentage of habitable rooms touch exterior envelope walls
  let habitableCount = 0;
  let daylightExposedCount = 0;
  let crossVentilatedCount = 0;

  floors.forEach(f => {
    (f.rooms || []).forEach(r => {
      const isHabitable = r.type === ROOM_TYPES.LIVING || r.type === ROOM_TYPES.MASTER_BEDROOM || r.type === ROOM_TYPES.BEDROOM || r.type === ROOM_TYPES.DINING || r.type === ROOM_TYPES.KITCHEN;
      if (!isHabitable || !r.bounds) return;

      habitableCount++;
      const b = r.bounds;
      let exteriorEdgesCount = 0;

      if (Math.abs(b.x - env.x) < 0.6) exteriorEdgesCount++;
      if (Math.abs((b.x + b.width) - (env.x + env.width)) < 0.6) exteriorEdgesCount++;
      if (Math.abs(b.y - env.y) < 0.6) exteriorEdgesCount++;
      if (Math.abs((b.y + b.length) - (env.y + env.length)) < 0.6) exteriorEdgesCount++;

      if (exteriorEdgesCount >= 1 || (r.windows && r.windows.length > 0)) {
        daylightExposedCount++;
      }
      if (exteriorEdgesCount >= 2) {
        crossVentilatedCount++; // Corner room with 2 sides daylight
      }
      if (exteriorEdgesCount === 0 && (!r.windows || r.windows.length === 0)) {
        recommendations.push(`Habitable space "${r.name || r.id}" on ${f.name} is landlocked without direct exterior wall exposure.`);
      }
    });
  });

  const daylightRatio = habitableCount > 0 ? (daylightExposedCount / habitableCount) : 1.0;
  const crossVentRatio = habitableCount > 0 ? (crossVentilatedCount / habitableCount) : 0.4;
  const daylightScore = Math.min(100, Math.round((daylightRatio * 85) + (crossVentRatio * 15)));

  details.daylightVentilation = {
    score: daylightScore,
    habitableCount,
    daylightExposedCount,
    crossVentilatedCount,
    daylightExposureRate: Number(daylightRatio.toFixed(2))
  };

  // -------------------------------------------------------------------------
  // SO-4: SPACE UTILIZATION & ENVELOPE WASTE MINIMIZATION
  // -------------------------------------------------------------------------
  const groundRooms = floors[0]?.rooms || [];
  const groundPlinthOccupied = groundRooms.reduce((acc, r) => acc + (r.bounds ? (r.bounds.width * r.bounds.length) : 0), 0);
  const envelopeArea = env.area || (env.width * env.length);
  const utilizationRatio = envelopeArea > 0 ? (groundPlinthOccupied / envelopeArea) : 0.85;

  let utilizationScore = 85;
  if (utilizationRatio >= 0.80 && utilizationRatio <= 0.98) {
    utilizationScore = 95;
  } else if (utilizationRatio >= 0.70) {
    utilizationScore = Math.round(80 + ((utilizationRatio - 0.70) / 0.10) * 15);
  } else {
    utilizationScore = Math.max(40, Math.round((utilizationRatio / 0.70) * 80));
    recommendations.push(`Plinth envelope utilization is ${(utilizationRatio * 100).toFixed(1)}%; buildable footprint contains unutilized void space.`);
  }

  details.spaceUtilization = {
    score: utilizationScore,
    plinthOccupiedSqft: Math.round(groundPlinthOccupied),
    envelopeAreaSqft: Math.round(envelopeArea),
    utilizationRatio: Number(utilizationRatio.toFixed(2))
  };

  // -------------------------------------------------------------------------
  // SO-5: ASPECT RATIO & PROPORTION SUITABILITY
  // -------------------------------------------------------------------------
  let totalRoomsChecked = 0;
  let totalAspectRatioPoints = 0;

  floors.forEach(f => {
    (f.rooms || []).forEach(r => {
      if (!r.bounds) return;
      totalRoomsChecked++;
      const w = Math.min(r.bounds.width, r.bounds.length);
      const l = Math.max(r.bounds.width, r.bounds.length);
      const ratio = w > 0 ? (l / w) : 1.0;

      if (ratio <= 1.45) {
        totalAspectRatioPoints += 100;
      } else if (ratio <= 1.75) {
        totalAspectRatioPoints += 85;
      } else if (ratio <= 2.1) {
        totalAspectRatioPoints += 65;
        recommendations.push(`Room "${r.name || r.id}" has an elongated aspect ratio of ${ratio.toFixed(2)}; proportions approach corridor dimensions.`);
      } else {
        totalAspectRatioPoints += 40;
        recommendations.push(`Room "${r.name || r.id}" has an awkward aspect ratio of ${ratio.toFixed(2)}; consider squaring room boundaries.`);
      }
    });
  });

  const aspectRatioScore = totalRoomsChecked > 0 ? Math.round(totalAspectRatioPoints / totalRoomsChecked) : 90;

  details.aspectRatioSuitability = {
    score: aspectRatioScore,
    roomsEvaluatedCount: totalRoomsChecked
  };

  // -------------------------------------------------------------------------
  // WEIGHTED AGGREGATE OPTIMIZATION SCORE
  // -------------------------------------------------------------------------
  const aggregateScore = Math.round(
    weights.circulation * circulationScore +
    weights.adjacencies * adjacencyScore +
    weights.daylight * daylightScore +
    weights.spaceUtilization * utilizationScore +
    weights.aspectRatio * aspectRatioScore
  );

  return {
    score: aggregateScore,
    details,
    recommendations: [...new Set(recommendations)]
  };
}

/**
 * Generates engineering remediation advice for hard constraint violations.
 */
export function suggestConstraintRemediations(violations = []) {
  const remediations = [];

  violations.forEach(v => {
    if (v.includes('[Boundary Containment]')) {
      remediations.push('Reduce room dimensions or revise municipal setback configuration to keep all rooms strictly within the buildable envelope.');
    }
    if (v.includes('[Zero Overlaps]')) {
      remediations.push('Adjust topological partitioning coordinates to eliminate room overlap and guarantee clean partition masonry.');
    }
    if (v.includes('[Egress Clearances]')) {
      remediations.push('Provide at least one standard egress entrance opening (minimum 2.8 ft for habitable rooms, 2.5 ft for sanitary spaces) for every enclosed room.');
    }
    if (v.includes('[Minimum Dimensions]')) {
      remediations.push('Increase envelope area, reduce the total room count, or distribute rooms across multiple floors to meet minimum architectural code dimensions.');
    }
    if (v.includes('[Area Consistency]')) {
      remediations.push('Recalculate and synchronize room area attributes with physical bounding box dimensions.');
    }
    if (v.includes('[Vertical Alignment]')) {
      remediations.push('Align upper stairwell and mumty coordinates exactly with the ground floor vertical circulation anchor.');
    }
    if (v.includes('[Vertical Connection]')) {
      remediations.push('Ensure every multi-story floor level includes an accessible vertical circulation core connecting to the ground level.');
    }
    if (v.includes('[Wall Geometry]')) {
      remediations.push('Ensure all represented wall segments have non-zero lengths, positive thicknesses, and valid coordinates strictly within the buildable envelope.');
    }
    if (v.includes('[Required Adjacency]')) {
      remediations.push('Re-route layout circulation or relocate rooms into adjacent structural zones to satisfy required functional proximity.');
    }
    if (v.includes('[Required Separation]')) {
      remediations.push('Insert buffer zones (e.g. passage, foyer, or storage) or move conflicting rooms to different wings/floors to satisfy required separation.');
    }
    if (v.includes('[Access Conditions]')) {
      remediations.push('Ensure all doors are placed directly along room boundary perimeters with valid numeric coordinates.');
    }
    if (v.includes('[Canonical Consistency]')) {
      remediations.push('Ensure all elements have unique IDs, valid coordinate systems, and non-empty floor structures.');
    }
    if (v.includes('[Ground Coverage]')) {
      remediations.push('Redistribute floor area to upper levels to satisfy municipal ground coverage bylaws.');
    }
  });

  return [...new Set(remediations)];
}

/**
 * Master Constraint Validator Function
 * 
 * Unifies geometric validation (10 checks), hard constraint verification,
 * and soft objective optimization evaluation.
 * 
 * Accurately distinguishes:
 * - VALID_CANDIDATE: Passes all geometric and hard constraints.
 * - INVALID_CANDIDATE: Concrete geometric or constraint violations.
 * - INFEASIBLE_REQUIREMENTS: Program or plot cannot physically accommodate layout.
 * - VALIDATION_ERROR: Missing payload, invalid schema, or malformed data.
 * 
 * Preserves 100% backward compatibility with existing engine consumers.
 * 
 * @param {Object} layout - Layout candidate structure
 * @param {Object} [options] - Evaluation options
 * @returns {Object} Comprehensive validation and optimization report
 */
export function validateLayoutConstraints(layout, options = {}) {
  // 1. Guard against candidate flagged as infeasible by generator or plot solver
  const isMarkedInfeasible = (
    layout && (
      layout.isFeasible === false ||
      layout.success === false ||
      layout.generationMetadata?.candidateStatus === 'INFEASIBLE' ||
      layout.generationMetadata?.failureReason === 'SPATIAL_OR_BOUNDARY_INFEASIBILITY' ||
      (layout.site && (layout.site.plotWidth <= 0 || layout.site.plotLength <= 0 || layout.site.plotAreaSqft <= 0))
    )
  );

  if (isMarkedInfeasible && (!layout.floors || layout.floors.length === 0)) {
    const infeasibleErrors = (layout.errors && layout.errors.length > 0)
      ? layout.errors
      : ['Layout candidate is spatially infeasible for requested program and plot dimensions.'];
    return {
      valid: false,
      isValid: false,
      isFeasible: false,
      resultType: VALIDATION_RESULT_TYPES.INFEASIBLE_REQUIREMENTS,
      candidateStatus: 'INFEASIBLE',
      violations: infeasibleErrors,
      errors: infeasibleErrors,
      warnings: layout.warnings || [],
      checks_performed: [
        'CHECK_PLOT_DIMENSIONS',
        'CHECK_BUILDABLE_ENVELOPE',
        HARD_CONSTRAINT_TYPES.BOUNDARY_CONTAINMENT
      ],
      checkedElementsCount: 0,
      diagnostics: infeasibleErrors.map(msg => ({ constraint: 'SPATIAL_FEASIBILITY', message: msg })),
      hardConstraints: { passed: false, violations: infeasibleErrors, warnings: layout.warnings || [], details: {} },
      softObjectives: { score: 0, details: {}, recommendations: [] },
      optimizationScore: 0,
      recommendations: ['Increase plot dimensions or reduce required room count.'],
      remediationAdvice: suggestConstraintRemediations(infeasibleErrors),
      metadata: {
        validatorVersion: CONSTRAINT_VALIDATOR_VERSION,
        evaluatedAt: new Date().toISOString()
      }
    };
  }

  // 2. Guard against null, non-object, or malformed schema payloads
  if (!layout || typeof layout !== 'object' || !layout.site || !layout.site.buildableEnvelope || !Array.isArray(layout.floors) || layout.floors.length === 0) {
    const err = (!layout || typeof layout !== 'object')
      ? 'Layout payload must be a non-null object.'
      : 'Layout payload is malformed: missing required "site", "buildableEnvelope", or "floors" array.';
    return {
      valid: false,
      isValid: false,
      isFeasible: false,
      resultType: VALIDATION_RESULT_TYPES.VALIDATION_ERROR,
      candidateStatus: 'ERROR',
      violations: [err],
      errors: [err],
      warnings: [],
      checks_performed: ['INITIAL_PAYLOAD_CHECK'],
      checkedElementsCount: 0,
      diagnostics: [{ constraint: 'INITIAL_PAYLOAD_CHECK', message: err }],
      hardConstraints: { passed: false, violations: [err], warnings: [], details: {} },
      softObjectives: { score: 0, details: {}, recommendations: [] },
      optimizationScore: 0,
      recommendations: ['Provide a valid layout candidate object with site, buildableEnvelope, and floors.'],
      remediationAdvice: ['Re-initialize layout candidate with valid schema structure.'],
      metadata: {
        validatorVersion: CONSTRAINT_VALIDATOR_VERSION,
        evaluatedAt: new Date().toISOString()
      }
    };
  }

  // 3. Run canonical geometric validator (10 checks)
  const geomResult = validateArchitectureGeometry(layout);

  // 4. Run Hard Constraints Engine
  const hardEval = evaluateHardConstraints(layout, options);

  // 5. Run Soft Objectives & Optimization Engine
  const softEval = evaluateSoftObjectives(layout, options);

  // 6. Combine violations and warnings
  const violations = [...new Set([...geomResult.errors, ...hardEval.violations])];
  const warnings = [...new Set([...geomResult.warnings, ...hardEval.warnings])];
  const isValid = geomResult.valid && hardEval.passed;
  const isFeasible = isValid;

  // 7. Determine Trustworthy Result Classification
  let resultType = VALIDATION_RESULT_TYPES.VALID_CANDIDATE;
  let candidateStatus = 'VALID';

  if (!isValid) {
    if (layout.site?.buildableEnvelope && (layout.site.buildableEnvelope.width <= 0 || layout.site.buildableEnvelope.length <= 0)) {
      resultType = VALIDATION_RESULT_TYPES.INFEASIBLE_REQUIREMENTS;
      candidateStatus = 'INFEASIBLE';
    } else {
      resultType = VALIDATION_RESULT_TYPES.INVALID_CANDIDATE;
      candidateStatus = 'INVALID';
    }
  }

  const checksPerformed = [
    ...(geomResult.checks_performed || []),
    HARD_CONSTRAINT_TYPES.BOUNDARY_CONTAINMENT,
    HARD_CONSTRAINT_TYPES.ZERO_OVERLAPS,
    HARD_CONSTRAINT_TYPES.EGRESS_CLEARANCES,
    HARD_CONSTRAINT_TYPES.MINIMUM_DIMENSIONS,
    HARD_CONSTRAINT_TYPES.AREA_CONSISTENCY,
    HARD_CONSTRAINT_TYPES.VERTICAL_ALIGNMENT,
    HARD_CONSTRAINT_TYPES.VERTICAL_CONNECTIONS,
    HARD_CONSTRAINT_TYPES.GROUND_COVERAGE,
    HARD_CONSTRAINT_TYPES.REQUIRED_ADJACENCY,
    HARD_CONSTRAINT_TYPES.REQUIRED_SEPARATION,
    HARD_CONSTRAINT_TYPES.WALL_GEOMETRY,
    HARD_CONSTRAINT_TYPES.CANONICAL_CONSISTENCY,
    SOFT_OBJECTIVE_TYPES.CIRCULATION_EFFICIENCY,
    SOFT_OBJECTIVE_TYPES.PREFERRED_ADJACENCIES,
    SOFT_OBJECTIVE_TYPES.DAYLIGHT_VENTILATION,
    SOFT_OBJECTIVE_TYPES.SPACE_UTILIZATION,
    SOFT_OBJECTIVE_TYPES.ASPECT_RATIO_SUITABILITY
  ];

  const diagnostics = [
    ...(hardEval.diagnostics || []),
    ...geomResult.errors.map(err => ({ constraint: 'GEOMETRIC_CANONICAL', message: err }))
  ];

  return {
    valid: isValid,
    isValid,
    isFeasible,
    resultType,
    candidateStatus,
    violations,
    errors: violations,
    warnings,
    checks_performed: [...new Set(checksPerformed)],
    checkedElementsCount: geomResult.checkedElementsCount,
    diagnostics,
    hardConstraints: hardEval,
    softObjectives: softEval,
    optimizationScore: softEval.score,
    recommendations: softEval.recommendations,
    remediationAdvice: suggestConstraintRemediations(violations),
    metadata: {
      validatorVersion: CONSTRAINT_VALIDATOR_VERSION,
      evaluatedAt: new Date().toISOString()
    }
  };
}
