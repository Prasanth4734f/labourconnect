/**
 * LabourConnect Design Engine - 3D Geometry Foundation & Coordinate Architecture
 * 
 * Version: 3.1.0-s3-t01
 * 
 * Implements Sprint 3 Task S3-T01: 3D Engine Audit & Geometry Foundation.
 * 
 * Key Architectural Roles:
 * 1. Single Source of Truth: Converts Canonical Design Model (v2.0.0) coordinates
 *    into a deterministic, inspectable 3D world coordinate system.
 * 2. Deterministic Coordinate Mapping:
 *    - World X: Width / Frontage (Left -> Right across plot)
 *    - World Y: Elevation / Height (Ground -> Sky)
 *    - World Z: Depth / Length (Front road boundary -> Rear plot boundary)
 * 3. Decimal-Safe Unit Conversion: Imperial Feet <-> SI Metres, Inches, Millimetres.
 * 4. Floor Elevation & Stacking: Exact vertical datum heights, clear heights, slabs, and parapets.
 * 5. Spatial Boundary Operations: 3D AABB bounding boxes, containment, intersections, volumes.
 * 6. Input Validation & Diagnostics: Rejection of NaN, infinite, negative, or degenerate geometry.
 * 7. Pure & Non-Mutating: Never mutates the canonical source design JSON.
 */

import { UNIT_FACTORS, roundToPrecision } from './dimensionalCalculator.js';

// =============================================================================
// 1. ARCHITECTURAL 3D CONSTANTS & COORDINATE CONVENTIONS
// =============================================================================

export const COORDINATE_SYSTEM_CONVENTION = Object.freeze({
  NAME: 'Right-Handed Architectural World System (Y-Up, Z-Depth)',
  WORLD_X: 'Horizontal Width (Left -> Right, 0 to plotWidth)',
  WORLD_Y: 'Vertical Elevation (Grade Datum 0.0 -> Sky, Y-Up)',
  WORLD_Z: 'Horizontal Depth (Front Road Boundary -> Rear Boundary, 0 to plotLength)',
  ORIGIN_DESCRIPTION: 'Front-Left corner of site parcel at grade datum level (0, 0, 0)',
  DEFAULT_UNIT: 'feet',
  SECONDARY_UNIT: 'meters'
});

export const ARCHITECTURAL_3D_DEFAULTS = Object.freeze({
  // Vertical Elevations (Imperial Feet)
  PLINTH_HEIGHT_FT: 1.5,             // Finished Floor Level (FFL) above grade
  CLEAR_CEILING_HEIGHT_FT: 10.0,     // Clear floor-to-ceiling habitable room height
  FLOOR_SLAB_THICKNESS_FT: 0.5,      // 6-inch RCC structural floor slab (0.1524 m)
  FLOOR_TO_FLOOR_HEIGHT_FT: 10.5,    // Clear height (10.0) + slab thickness (0.5)
  PARAPET_WALL_HEIGHT_FT: 3.5,       // Rooftop safety parapet wall
  MUMTY_HEIGHT_FT: 8.5,              // Staircase head-room enclosure at terrace

  // Fenestrations (Imperial Feet)
  DOOR_HEIGHT_FT: 7.0,               // Standard architectural door height
  WINDOW_SILL_HEIGHT_FT: 2.5,        // Standard window sill elevation above floor slab
  WINDOW_HEIGHT_FT: 4.5,             // Standard window height (lintel at 7.0 ft)
  LINTEL_HEIGHT_FT: 7.0,             // Universal door/window lintel beam level

  // Wall Thicknesses (Imperial Feet)
  WALL_THICKNESS_EXTERIOR_FT: 0.75,  // 9 inches (230mm) load-bearing exterior wall
  WALL_THICKNESS_INTERIOR_FT: 0.375, // 4.5 inches (115mm) partition wall

  // Staircase Standards (NBC 2016)
  STAIR_RISER_TARGET_INCHES: 7.0,    // Target riser ~7" (0.583 ft / 0.178 m)
  STAIR_TREAD_TARGET_INCHES: 10.0,   // Target tread ~10" (0.833 ft / 0.254 m)
  STAIR_WIDTH_MIN_FT: 3.0,           // Minimum residential stair flight width

  // Tolerances
  TOLERANCE_EPSILON_FT: 0.001,       // 0.001 ft (~0.3mm) geometric identity tolerance
  PRECISION_DECIMALS: 4              // Decimal calculation precision
});

export const COORDINATE_SYSTEM_CONTRACT = COORDINATE_SYSTEM_CONVENTION;

export const ARCHITECTURAL_DEFAULTS_3D = Object.freeze({
  PLINTH_HEIGHT: ARCHITECTURAL_3D_DEFAULTS.PLINTH_HEIGHT_FT,
  CLEAR_CEILING_HEIGHT: ARCHITECTURAL_3D_DEFAULTS.CLEAR_CEILING_HEIGHT_FT,
  SLAB_THICKNESS: ARCHITECTURAL_3D_DEFAULTS.FLOOR_SLAB_THICKNESS_FT,
  FLOOR_TO_FLOOR_HEIGHT: ARCHITECTURAL_3D_DEFAULTS.FLOOR_TO_FLOOR_HEIGHT_FT,
  PARAPET_HEIGHT: ARCHITECTURAL_3D_DEFAULTS.PARAPET_WALL_HEIGHT_FT,
  DOOR_HEIGHT: ARCHITECTURAL_3D_DEFAULTS.DOOR_HEIGHT_FT,
  DOOR_WIDTH: 3.0,
  WINDOW_SILL_HEIGHT: ARCHITECTURAL_3D_DEFAULTS.WINDOW_SILL_HEIGHT_FT,
  WINDOW_HEIGHT: ARCHITECTURAL_3D_DEFAULTS.WINDOW_HEIGHT_FT,
  WINDOW_WIDTH: 4.0,
  LINTEL_HEIGHT: ARCHITECTURAL_3D_DEFAULTS.LINTEL_HEIGHT_FT,
  WALL_THICKNESS_EXTERIOR: ARCHITECTURAL_3D_DEFAULTS.WALL_THICKNESS_EXTERIOR_FT,
  WALL_THICKNESS_INTERIOR: ARCHITECTURAL_3D_DEFAULTS.WALL_THICKNESS_INTERIOR_FT,
  BALCONY_RAILING_HEIGHT: 3.5,
  COLUMN_WIDTH: 0.75,
  COLUMN_LENGTH: 1.0,
  ...ARCHITECTURAL_3D_DEFAULTS
});

// =============================================================================
// 2. CENTRALIZED UNIT CONVERSION UTILITIES
// =============================================================================

/**
 * Validates that a numeric input is finite and not NaN.
 */
function assertFiniteNumber(value, paramName = 'value') {
  if (typeof value !== 'number' || !isFinite(value) || isNaN(value)) {
    throw new TypeError(`Expected finite number for ${paramName}, received: ${value}`);
  }
}

/**
 * Converts Imperial Feet to SI Metres.
 * Exact conversion ratio: 1 ft = 0.3048 m
 */
export function feetToMeters(feet, decimals = ARCHITECTURAL_3D_DEFAULTS.PRECISION_DECIMALS) {
  assertFiniteNumber(feet, 'feet');
  return roundToPrecision(feet * UNIT_FACTORS.FEET_TO_METRES, decimals);
}

/**
 * Converts SI Metres to Imperial Feet.
 * 1 m = 3.280839895013123 ft
 */
export function metersToFeet(meters, decimals = ARCHITECTURAL_3D_DEFAULTS.PRECISION_DECIMALS) {
  assertFiniteNumber(meters, 'meters');
  return roundToPrecision(meters * UNIT_FACTORS.METRES_TO_FEET, decimals);
}

/**
 * Converts Inches to Imperial Feet.
 * 1 ft = 12 inches
 */
export function inchesToFeet(inches, decimals = ARCHITECTURAL_3D_DEFAULTS.PRECISION_DECIMALS) {
  assertFiniteNumber(inches, 'inches');
  return roundToPrecision(inches / 12, decimals);
}

/**
 * Converts Imperial Feet to Inches.
 */
export function feetToInches(feet, decimals = ARCHITECTURAL_3D_DEFAULTS.PRECISION_DECIMALS) {
  assertFiniteNumber(feet, 'feet');
  return roundToPrecision(feet * 12, decimals);
}

/**
 * Converts Inches to SI Metres.
 * 1 inch = 0.0254 m
 */
export function inchesToMeters(inches, decimals = ARCHITECTURAL_3D_DEFAULTS.PRECISION_DECIMALS) {
  assertFiniteNumber(inches, 'inches');
  return roundToPrecision(inches * 0.0254, decimals);
}

/**
 * Converts Millimetres to SI Metres.
 * 1 mm = 0.001 m
 */
export function millimetersToMeters(mm, decimals = ARCHITECTURAL_3D_DEFAULTS.PRECISION_DECIMALS) {
  assertFiniteNumber(mm, 'mm');
  return roundToPrecision(mm * 0.001, decimals);
}

/**
 * Converts SI Metres to Millimetres.
 */
export function metersToMillimeters(meters, decimals = ARCHITECTURAL_3D_DEFAULTS.PRECISION_DECIMALS) {
  assertFiniteNumber(meters, 'meters');
  return roundToPrecision(meters * 1000, decimals);
}

/**
 * Converts Square Feet to Square Metres.
 * 1 sq.ft = 0.09290304 m²
 */
export function sqftToSqm(sqft, decimals = ARCHITECTURAL_3D_DEFAULTS.PRECISION_DECIMALS) {
  assertFiniteNumber(sqft, 'sqft');
  return roundToPrecision(sqft * UNIT_FACTORS.SQFT_TO_SQM, decimals);
}

/**
 * Converts Square Metres to Square Feet.
 */
export function sqmToSqft(sqm, decimals = ARCHITECTURAL_3D_DEFAULTS.PRECISION_DECIMALS) {
  assertFiniteNumber(sqm, 'sqm');
  return roundToPrecision(sqm * UNIT_FACTORS.SQM_TO_SQFT, decimals);
}

// =============================================================================
// 3. DETERMINISTIC COORDINATE TRANSFORMATION (PLAN <-> WORLD)
// =============================================================================

/**
 * Transforms a 2D plan point into a 3D world coordinate.
 * 
 * Mapping:
 *   World X = Plan X (Width across frontage)
 *   World Y = Elevation Y (Vertical height above grade)
 *   World Z = Plan Y (Depth from road into plot)
 * 
 * @param {Object} planPoint - { x: number, y: number }
 * @param {number} [elevationY=0] - Vertical elevation above grade datum in feet
 * @param {Object} [options] - Optional transformation configuration
 * @returns {Object} 3D world point { x: number, y: number, z: number }
 */
export function transformPlanToWorldPoint(planPoint, elevationY = 0, options = {}) {
  if (!planPoint || typeof planPoint !== 'object') {
    throw new TypeError('Expected non-null object for planPoint { x, y }');
  }
  assertFiniteNumber(planPoint.x, 'planPoint.x');
  assertFiniteNumber(planPoint.y, 'planPoint.y');
  assertFiniteNumber(elevationY, 'elevationY');

  const decimals = options.decimals ?? ARCHITECTURAL_3D_DEFAULTS.PRECISION_DECIMALS;
  const unit = (options.targetUnit || 'feet').toLowerCase();

  let wx = planPoint.x;
  let wy = elevationY;
  let wz = planPoint.y;

  if (unit === 'meters' || unit === 'metres' || unit === 'm') {
    wx = feetToMeters(wx, decimals);
    wy = feetToMeters(wy, decimals);
    wz = feetToMeters(wz, decimals);
  } else {
    wx = roundToPrecision(wx, decimals);
    wy = roundToPrecision(wy, decimals);
    wz = roundToPrecision(wz, decimals);
  }

  return { x: wx, y: wy, z: wz };
}

/**
 * Transforms a 3D world point back into a 2D plan point.
 * 
 * Mapping:
 *   Plan X = World X
 *   Plan Y = World Z
 * 
 * @param {Object} worldPoint - { x: number, y: number, z: number }
 * @param {Object} [options] - Optional transformation configuration
 * @returns {Object} 2D plan point { x: number, y: number }
 */
export function transformWorldToPlanPoint(worldPoint, options = {}) {
  if (!worldPoint || typeof worldPoint !== 'object') {
    throw new TypeError('Expected non-null object for worldPoint { x, y, z }');
  }
  assertFiniteNumber(worldPoint.x, 'worldPoint.x');
  assertFiniteNumber(worldPoint.z, 'worldPoint.z');

  const decimals = options.decimals ?? ARCHITECTURAL_3D_DEFAULTS.PRECISION_DECIMALS;
  const sourceUnit = (options.sourceUnit || 'feet').toLowerCase();

  let px = worldPoint.x;
  let py = worldPoint.z;

  if (sourceUnit === 'meters' || sourceUnit === 'metres' || sourceUnit === 'm') {
    px = metersToFeet(px, decimals);
    py = metersToFeet(py, decimals);
  } else {
    px = roundToPrecision(px, decimals);
    py = roundToPrecision(py, decimals);
  }

  return { x: px, y: py };
}

/**
 * Transforms a 2D planar direction vector into a 3D horizontal world vector.
 * 
 * Mapping: { dx, dy } -> { x: dx, y: 0, z: dy }
 */
export function transformPlanToWorldVector(planVector) {
  if (!planVector || typeof planVector !== 'object') {
    throw new TypeError('Expected non-null object for planVector { dx, dy } or { x, y }');
  }
  const dx = planVector.dx !== undefined ? planVector.dx : planVector.x;
  const dy = planVector.dy !== undefined ? planVector.dy : planVector.y;
  assertFiniteNumber(dx, 'vector x/dx');
  assertFiniteNumber(dy, 'vector y/dy');

  return {
    x: roundToPrecision(dx, ARCHITECTURAL_3D_DEFAULTS.PRECISION_DECIMALS),
    y: 0,
    z: roundToPrecision(dy, ARCHITECTURAL_3D_DEFAULTS.PRECISION_DECIMALS)
  };
}

/**
 * Transforms a 2D plan polygon into a horizontal 3D world polygon at specified elevation.
 * 
 * @param {Array<Object>} polygon - Array of { x, y } vertices
 * @param {number} [elevationY=0] - Elevation in feet
 * @returns {Array<Object>} Array of { x, y, z } vertices
 */
export function transformPlanToWorldPolygon(polygon, elevationY = 0, options = {}) {
  if (!Array.isArray(polygon) || polygon.length < 3) {
    throw new Error(`Polygon must have at least 3 vertices, received: ${polygon?.length || 0}`);
  }
  return polygon.map((pt, idx) => {
    try {
      return transformPlanToWorldPoint(pt, elevationY, options);
    } catch (err) {
      throw new Error(`Invalid vertex at index ${idx}: ${err.message}`);
    }
  });
}

/**
 * Transforms a 2D bounding box { x, y, width, length } into a 3D AABB bounding box.
 * 
 * @param {Object} bounds - { x, y, width, length }
 * @param {number} [elevationY=0] - Bottom elevation
 * @param {number} [height=0] - Vertical height
 * @param {Object} [options] - Options
 * @returns {Object} 3D Bounding Box { min, max, width, height, depth, center, volume }
 */
export function transformPlanBoundsToWorldBox(bounds, elevationY = 0, height = 0, options = {}) {
  if (!bounds || typeof bounds !== 'object') {
    throw new TypeError('Expected non-null object for bounds { x, y, width, length }');
  }
  assertFiniteNumber(bounds.x, 'bounds.x');
  assertFiniteNumber(bounds.y, 'bounds.y');
  assertFiniteNumber(bounds.width, 'bounds.width');
  assertFiniteNumber(bounds.length, 'bounds.length');
  assertFiniteNumber(elevationY, 'elevationY');
  assertFiniteNumber(height, 'height');

  if (bounds.width < 0 || bounds.length < 0) {
    throw new RangeError(`Bounding dimensions must be non-negative, received width: ${bounds.width}, length: ${bounds.length}`);
  }
  if (height < 0) {
    throw new RangeError(`Box height must be non-negative, received: ${height}`);
  }

  const pMin = transformPlanToWorldPoint({ x: bounds.x, y: bounds.y }, elevationY, options);
  const pMax = transformPlanToWorldPoint(
    { x: bounds.x + bounds.width, y: bounds.y + bounds.length },
    elevationY + height,
    options
  );

  return createBoundingBox3d(pMin, pMax);
}

// =============================================================================
// 4. FLOOR ELEVATIONS & VERTICAL STACKING CONTRACT
// =============================================================================

/**
 * Calculates deterministic vertical elevations and stacking for all floors in a canonical design.
 * 
 * Enforces architectural vertical zoning:
 * - Grade Datum: Y = 0.0 ft
 * - Plinth (Level 0): Y = +1.5 ft (FFL of Ground Floor)
 * - Intermediate Floor Slabs: 0.5 ft thickness
 * - Clear Habitable Ceiling: 10.0 ft
 * - Floor-to-Floor Interval: 10.5 ft
 * - Terrace Parapet: 3.5 ft top
 * 
 * @param {Array<Object>} floors - Floors array from canonical model
 * @param {Object} [options] - Stacking options (e.g. usePlinth: boolean)
 * @returns {Object} Structured floor elevation schedule { floorElevations, totalBuildingHeightFt, groundFloorElevationFt }
 */
export function calculateFloorElevations(floors, options = {}) {
  if (!Array.isArray(floors) || floors.length === 0) {
    return {
      valid: false,
      errors: ['At least one floor level is required.'],
      floorElevations: [],
      totalBuildingHeightFt: 0
    };
  }

  const includePlinth = options.includePlinth !== undefined ? options.includePlinth : true;
  const plinthHeight = includePlinth ? ARCHITECTURAL_3D_DEFAULTS.PLINTH_HEIGHT_FT : 0.0;
  const defaultFloorHeight = ARCHITECTURAL_3D_DEFAULTS.FLOOR_TO_FLOOR_HEIGHT_FT;
  const slabThickness = ARCHITECTURAL_3D_DEFAULTS.FLOOR_SLAB_THICKNESS_FT;

  const floorElevations = [];
  let currentElevation = plinthHeight;

  // Sort copy of floors by floorIndex ascending
  const sortedFloors = [...floors].sort((a, b) => (a.floorIndex || 0) - (b.floorIndex || 0));

  sortedFloors.forEach((fl, idx) => {
    const floorIndex = fl.floorIndex !== undefined ? fl.floorIndex : idx;
    const isTerrace = Boolean(fl.isTerrace) ||
      (fl.name || '').toLowerCase().includes('terrace') ||
      (sortedFloors.length === 3 && floorIndex === 2);
    
    // Floor-to-floor height: clear ceiling height + structural slab thickness (default 10.5 ft)
    const floorHeight = (fl.floorHeight && fl.floorHeight >= defaultFloorHeight) ? fl.floorHeight : defaultFloorHeight;
    const clearCeilingHeight = isTerrace ? ARCHITECTURAL_3D_DEFAULTS.PARAPET_WALL_HEIGHT_FT : Math.max(0, floorHeight - slabThickness);

    // Monotonic floor stacking: each upper floor must sit on top of the lower floor's slab
    const baseElevation = (idx === 0) 
      ? plinthHeight 
      : (fl.elevationZ !== undefined && fl.elevationZ >= currentElevation - 0.05 ? fl.elevationZ : currentElevation);

    const ceilingElevation = baseElevation + clearCeilingHeight;
    const nextFloorSlabElevation = isTerrace ? ceilingElevation : baseElevation + floorHeight;

    floorElevations.push({
      floorIndex,
      name: fl.name || `Floor Level ${floorIndex}`,
      baseElevationY: roundToPrecision(baseElevation, 4),
      slabThicknessFt: slabThickness,
      clearCeilingHeightFt: roundToPrecision(clearCeilingHeight, 4),
      floorHeightFt: roundToPrecision(floorHeight, 4),
      ceilingElevationY: roundToPrecision(ceilingElevation, 4),
      topElevationY: roundToPrecision(nextFloorSlabElevation, 4),
      isTerrace,
      isGround: floorIndex === 0
    });

    currentElevation = nextFloorSlabElevation;
  });

  const topFloor = floorElevations[floorElevations.length - 1];
  const totalBuildingHeightFt = topFloor ? topFloor.topElevationY : 0;

  return {
    valid: true,
    floorElevations,
    groundFloorElevationFt: plinthHeight,
    totalBuildingHeightFt,
    slabThicknessFt: slabThickness
  };
}

/**
 * Calculates vertical placement for architectural components relative to a floor slab.
 * 
 * @param {number} floorBaseElevationY - Elevation of floor slab in feet
 * @param {string} componentType - Component type e.g. 'door', 'window', 'slab', 'parapet', 'stairs'
 * @param {Object} [options] - Custom dimension overrides
 * @returns {Object} Component elevation bounds { minY, maxY, height, sillY, lintelY }
 */
export function calculateComponentElevation(floorBaseElevationY, componentType, options = {}) {
  assertFiniteNumber(floorBaseElevationY, 'floorBaseElevationY');
  const type = (componentType || '').toLowerCase();

  switch (type) {
    case 'door': {
      const height = options.height || ARCHITECTURAL_3D_DEFAULTS.DOOR_HEIGHT_FT;
      return {
        minY: floorBaseElevationY,
        maxY: roundToPrecision(floorBaseElevationY + height, 4),
        height,
        sillY: floorBaseElevationY,
        lintelY: roundToPrecision(floorBaseElevationY + height, 4)
      };
    }
    case 'window': {
      const sillHeight = options.sillHeight || ARCHITECTURAL_3D_DEFAULTS.WINDOW_SILL_HEIGHT_FT;
      const height = options.height || ARCHITECTURAL_3D_DEFAULTS.WINDOW_HEIGHT_FT;
      const sillY = floorBaseElevationY + sillHeight;
      const lintelY = sillY + height;
      return {
        minY: roundToPrecision(sillY, 4),
        maxY: roundToPrecision(lintelY, 4),
        height,
        sillY: roundToPrecision(sillY, 4),
        lintelY: roundToPrecision(lintelY, 4)
      };
    }
    case 'slab': {
      const thickness = options.thickness || ARCHITECTURAL_3D_DEFAULTS.FLOOR_SLAB_THICKNESS_FT;
      return {
        minY: roundToPrecision(floorBaseElevationY - thickness, 4),
        maxY: floorBaseElevationY,
        height: thickness,
        thickness
      };
    }
    case 'parapet': {
      const height = options.height || ARCHITECTURAL_3D_DEFAULTS.PARAPET_WALL_HEIGHT_FT;
      return {
        minY: floorBaseElevationY,
        maxY: roundToPrecision(floorBaseElevationY + height, 4),
        height
      };
    }
    case 'wall':
    default: {
      const height = options.height || ARCHITECTURAL_3D_DEFAULTS.CLEAR_CEILING_HEIGHT_FT;
      return {
        minY: floorBaseElevationY,
        maxY: roundToPrecision(floorBaseElevationY + height, 4),
        height
      };
    }
  }
}

// =============================================================================
// 5. 3D SPATIAL BOUNDS & AABB OPERATIONS
// =============================================================================

/**
 * Creates a validated 3D Axis-Aligned Bounding Box (AABB).
 * 
 * @param {Object} min - { x, y, z }
 * @param {Object} max - { x, y, z }
 * @returns {Object} 3D Box { min, max, width, height, depth, center, volume }
 */
export function createBoundingBox3d(min, max) {
  if (!min || !max || typeof min !== 'object' || typeof max !== 'object') {
    throw new TypeError('Expected objects for min and max { x, y, z }');
  }
  assertFiniteNumber(min.x, 'min.x');
  assertFiniteNumber(min.y, 'min.y');
  assertFiniteNumber(min.z, 'min.z');
  assertFiniteNumber(max.x, 'max.x');
  assertFiniteNumber(max.y, 'max.y');
  assertFiniteNumber(max.z, 'max.z');

  const xMin = Math.min(min.x, max.x);
  const xMax = Math.max(min.x, max.x);
  const yMin = Math.min(min.y, max.y);
  const yMax = Math.max(min.y, max.y);
  const zMin = Math.min(min.z, max.z);
  const zMax = Math.max(min.z, max.z);

  const width = roundToPrecision(xMax - xMin, ARCHITECTURAL_3D_DEFAULTS.PRECISION_DECIMALS);
  const height = roundToPrecision(yMax - yMin, ARCHITECTURAL_3D_DEFAULTS.PRECISION_DECIMALS);
  const depth = roundToPrecision(zMax - zMin, ARCHITECTURAL_3D_DEFAULTS.PRECISION_DECIMALS);

  return {
    min: { x: roundToPrecision(xMin, 4), y: roundToPrecision(yMin, 4), z: roundToPrecision(zMin, 4) },
    max: { x: roundToPrecision(xMax, 4), y: roundToPrecision(yMax, 4), z: roundToPrecision(zMax, 4) },
    width,
    height,
    depth,
    center: {
      x: roundToPrecision((xMin + xMax) / 2, 4),
      y: roundToPrecision((yMin + yMax) / 2, 4),
      z: roundToPrecision((zMin + zMax) / 2, 4)
    },
    volume: roundToPrecision(width * height * depth, 4)
  };
}

/**
 * Creates an empty bounding box initialized to inverted infinities for accumulation.
 */
export function createEmptyBoundingBox3d() {
  return {
    min: { x: Infinity, y: Infinity, z: Infinity },
    max: { x: -Infinity, y: -Infinity, z: -Infinity },
    width: 0,
    height: 0,
    depth: 0,
    center: { x: 0, y: 0, z: 0 },
    volume: 0,
    isEmpty: true
  };
}

/**
 * Expands a 3D bounding box to include a 3D point or another 3D bounding box.
 * 
 * @param {Object} box - Target 3D box
 * @param {Object} item - { x, y, z } point OR { min, max } box
 * @returns {Object} New expanded 3D Box
 */
export function expandBoundingBox3d(box, item) {
  if (!box || typeof box !== 'object') {
    throw new TypeError('Expected non-null box for expandBoundingBox3d');
  }
  if (!item || typeof item !== 'object') {
    return { ...box };
  }

  let xMin = box.min ? box.min.x : Infinity;
  let yMin = box.min ? box.min.y : Infinity;
  let zMin = box.min ? box.min.z : Infinity;
  let xMax = box.max ? box.max.x : -Infinity;
  let yMax = box.max ? box.max.y : -Infinity;
  let zMax = box.max ? box.max.z : -Infinity;

  if (item.min && item.max) {
    // Expanding by another box
    xMin = Math.min(xMin, item.min.x);
    yMin = Math.min(yMin, item.min.y);
    zMin = Math.min(zMin, item.min.z);
    xMax = Math.max(xMax, item.max.x);
    yMax = Math.max(yMax, item.max.y);
    zMax = Math.max(zMax, item.max.z);
  } else if (item.x !== undefined && item.y !== undefined && item.z !== undefined) {
    // Expanding by a point
    assertFiniteNumber(item.x, 'point.x');
    assertFiniteNumber(item.y, 'point.y');
    assertFiniteNumber(item.z, 'point.z');
    xMin = Math.min(xMin, item.x);
    yMin = Math.min(yMin, item.y);
    zMin = Math.min(zMin, item.z);
    xMax = Math.max(xMax, item.x);
    yMax = Math.max(yMax, item.y);
    zMax = Math.max(zMax, item.z);
  } else {
    throw new TypeError('Item must be a 3D point {x,y,z} or a 3D box {min,max}');
  }

  return createBoundingBox3d({ x: xMin, y: yMin, z: zMin }, { x: xMax, y: yMax, z: zMax });
}

/**
 * Tests whether a 3D point is inside or on the boundary of an AABB box.
 */
export function isPointInsideBoundingBox3d(box, point, tolerance = ARCHITECTURAL_3D_DEFAULTS.TOLERANCE_EPSILON_FT) {
  if (!box || !point) return false;
  return (
    point.x >= box.min.x - tolerance &&
    point.x <= box.max.x + tolerance &&
    point.y >= box.min.y - tolerance &&
    point.y <= box.max.y + tolerance &&
    point.z >= box.min.z - tolerance &&
    point.z <= box.max.z + tolerance
  );
}

/**
 * Tests whether two 3D AABB boxes intersect.
 */
export function doBoundingBoxesIntersect3d(boxA, boxB, tolerance = ARCHITECTURAL_3D_DEFAULTS.TOLERANCE_EPSILON_FT) {
  if (!boxA || !boxB) return false;
  return (
    boxA.min.x <= boxB.max.x + tolerance &&
    boxA.max.x >= boxB.min.x - tolerance &&
    boxA.min.y <= boxB.max.y + tolerance &&
    boxA.max.y >= boxB.min.y - tolerance &&
    boxA.min.z <= boxB.max.z + tolerance &&
    boxA.max.z >= boxB.min.z - tolerance
  );
}

/**
 * Computes the 3D world bounding box for an entire Canonical Design Model.
 * 
 * Incorporates:
 * - Plot boundary footprint (Grade Y = 0)
 * - Buildable site envelope
 * - All rooms across all floors stacked with vertical heights
 * - Slabs and parapet
 * 
 * @param {Object} canonicalDesign - Canonical design model JSON
 * @returns {Object} Comprehensive 3D Bounds { siteBounds, buildingBounds, floorBounds }
 */
export function calculateDesignWorldBounds(canonicalDesign) {
  if (!canonicalDesign || typeof canonicalDesign !== 'object') {
    throw new TypeError('Expected canonicalDesign object');
  }

  const { site, floors } = canonicalDesign;
  if (!site) {
    throw new Error('Design is missing site definition');
  }

  const env = site.buildableEnvelope || { x: 0, y: 0, width: site.plotWidth || 30, length: site.plotLength || 40 };
  const elevations = calculateFloorElevations(floors || []);

  // 1. Site Parcel World Bounds (Ground level: Y = 0 to 0.1 ft)
  const siteBounds = transformPlanBoundsToWorldBox(
    { x: 0, y: 0, width: site.plotWidth, length: site.plotLength },
    0,
    0.1
  );

  // 2. Building Envelope World Bounds across all floors
  const totalHeight = elevations.totalBuildingHeightFt || 10.5;
  const buildingBounds = transformPlanBoundsToWorldBox(
    env,
    0, // From grade datum
    totalHeight
  );

  // 3. Per-floor World Bounds
  const floorBounds = (elevations.floorElevations || []).map((flElev) => {
    return {
      floorIndex: flElev.floorIndex,
      name: flElev.name,
      box: transformPlanBoundsToWorldBox(
        env,
        flElev.baseElevationY,
        flElev.clearCeilingHeightFt
      )
    };
  });

  return {
    siteBounds,
    buildingBounds,
    floorBounds,
    totalHeightFt: totalHeight,
    plotDimensionsFt: { width: site.plotWidth, length: site.plotLength }
  };
}

// =============================================================================
// 6. GEOMETRY INPUT VALIDATION & INTEGRITY CHECKING
// =============================================================================

/**
 * Validates a 3D geometry structure for geometric and numeric integrity.
 * 
 * Checks:
 * - All coordinates are finite numbers (no NaN, no +/- Infinity)
 * - Box dimensions are non-negative
 * - Min coordinates <= Max coordinates
 * 
 * @param {Object} geom - Point, Box, or Polygon
 * @param {string} type - 'point', 'box', 'polygon', 'floorStack'
 * @returns {Object} Validation report { valid: boolean, errors: string[] }
 */
export function validate3dGeometry(geom, type = 'point') {
  const errors = [];

  if (!geom || typeof geom !== 'object') {
    return { valid: false, errors: [`Invalid 3D geometry: expected non-null object, received ${geom}`] };
  }

  switch (type.toLowerCase()) {
    case 'point': {
      if (typeof geom.x !== 'number' || !isFinite(geom.x)) errors.push(`Point X must be finite number, received: ${geom.x}`);
      if (typeof geom.y !== 'number' || !isFinite(geom.y)) errors.push(`Point Y must be finite number, received: ${geom.y}`);
      if (typeof geom.z !== 'number' || !isFinite(geom.z)) errors.push(`Point Z must be finite number, received: ${geom.z}`);
      break;
    }
    case 'box': {
      if (!geom.min || !geom.max) {
        errors.push('Box must define both min and max coordinates.');
      } else {
        ['x', 'y', 'z'].forEach(axis => {
          if (typeof geom.min[axis] !== 'number' || !isFinite(geom.min[axis])) {
            errors.push(`Box min.${axis} must be finite number, received: ${geom.min[axis]}`);
          }
          if (typeof geom.max[axis] !== 'number' || !isFinite(geom.max[axis])) {
            errors.push(`Box max.${axis} must be finite number, received: ${geom.max[axis]}`);
          }
          if (geom.min[axis] > geom.max[axis] + ARCHITECTURAL_3D_DEFAULTS.TOLERANCE_EPSILON_FT) {
            errors.push(`Box inverted along axis ${axis}: min.${axis} (${geom.min[axis]}) > max.${axis} (${geom.max[axis]})`);
          }
        });
      }
      break;
    }
    case 'polygon': {
      if (!Array.isArray(geom) || geom.length < 3) {
        errors.push(`3D polygon must have at least 3 vertices, received: ${geom?.length || 0}`);
      } else {
        geom.forEach((v, idx) => {
          ['x', 'y', 'z'].forEach(axis => {
            if (typeof v[axis] !== 'number' || !isFinite(v[axis])) {
              errors.push(`Vertex ${idx} ${axis} must be finite number, received: ${v[axis]}`);
            }
          });
        });
      }
      break;
    }
    case 'floorstack': {
      if (!Array.isArray(geom) || geom.length === 0) {
        errors.push('Floor elevation stack must contain at least one floor record.');
      } else {
        for (let i = 0; i < geom.length; i++) {
          const fl = geom[i];
          if (typeof fl.baseElevationY !== 'number' || !isFinite(fl.baseElevationY)) {
            errors.push(`Floor ${i} missing finite baseElevationY.`);
          }
          if (i > 0) {
            const prev = geom[i - 1];
            if (fl.baseElevationY < prev.baseElevationY) {
              errors.push(`Floor ${i} base elevation (${fl.baseElevationY}) is lower than previous floor (${prev.baseElevationY}).`);
            }
          }
        }
      }
      break;
    }
    default:
      errors.push(`Unknown geometry validation type: ${type}`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// =============================================================================
// 7. COMPONENT METADATA MODEL CONTRACT (READY FOR S3-T02)
// =============================================================================

/**
 * Standard metadata wrapper for procedural 3D building components.
 * To be populated by Task S3-T02 (Procedural Building Generation).
 */
export function createGeometryComponent3d({
  id,
  type,
  designId = null,
  floorIndex = 0,
  roomRef = null,
  wallRef = null,
  worldBounds = null,
  materialSpec = null,
  properties = {}
}) {
  if (!id || typeof id !== 'string') throw new TypeError('Component id is required.');
  if (!type || typeof type !== 'string') throw new TypeError('Component type is required.');

  return {
    id,
    type,
    designId,
    floorIndex,
    roomRef,
    wallRef,
    worldBounds,
    materialSpec: materialSpec || 'default_architectural_finish',
    properties,
    createdAt: new Date().toISOString()
  };
}
