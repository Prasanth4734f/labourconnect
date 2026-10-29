/**
 * LabourConnect Design Engine - Dimensional Calculation Foundation
 * 
 * Provides decimal-safe, mathematically rigorous plot area, unit conversion,
 * setback validation, and buildable envelope calculations.
 * 
 * Complies with S1-T04 specification:
 * - Explicit unit conventions (Imperial Feet and SI Metres).
 * - Decimal precision and rounding controls.
 * - Rejection of non-numeric, zero, and negative dimensions.
 * - Rejection of impossible setbacks (no silent clamp/correction).
 */

export const UNIT_FACTORS = {
  // 1 ft = 0.3048 m (Exact international standard)
  FEET_TO_METRES: 0.3048,
  METRES_TO_FEET: 3.280839895013123,
  // 1 sq.ft = 0.3048^2 = 0.09290304 m² (Exact)
  SQFT_TO_SQM: 0.09290304,
  SQM_TO_SQFT: 10.763910416709722,
  // 1 Indian Cent = 435.6 sq.ft
  CENT_TO_SQFT: 435.6,
  SQFT_TO_CENT: 1 / 435.6
};

/**
 * Standard rounding helper to prevent IEEE-754 floating-point drift
 */
export function roundToPrecision(value, decimals = 2) {
  if (typeof value !== 'number' || isNaN(value)) return 0;
  const factor = Math.pow(10, decimals);
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

/**
 * Validates whether a value is a valid strictly positive finite number
 */
export function isValidPositiveDimension(value) {
  return typeof value === 'number' && isFinite(value) && value > 0;
}

/**
 * Validates whether a value is a valid non-negative finite number (allowing zero)
 */
export function isValidNonNegativeDimension(value) {
  return typeof value === 'number' && isFinite(value) && value >= 0;
}

/**
 * Converts length or area between units with decimal precision
 */
export function convertUnits(value, fromUnit, toUnit, isArea = false) {
  if (typeof value !== 'number' || !isFinite(value)) {
    throw new Error(`Invalid numeric value for unit conversion: ${value}`);
  }

  const from = (fromUnit || '').toLowerCase();
  const to = (toUnit || '').toLowerCase();

  if (from === to) return roundToPrecision(value, 4);

  let converted;
  if (!isArea) {
    // Length conversion
    if ((from === 'feet' || from === 'ft') && (to === 'metres' || to === 'meters' || to === 'm')) {
      converted = value * UNIT_FACTORS.FEET_TO_METRES;
    } else if ((to === 'feet' || to === 'ft') && (from === 'metres' || from === 'meters' || from === 'm')) {
      converted = value * UNIT_FACTORS.METRES_TO_FEET;
    } else {
      throw new Error(`Unsupported length unit conversion from "${fromUnit}" to "${toUnit}".`);
    }
  } else {
    // Area conversion
    if ((from === 'sqft' || from === 'feet') && (to === 'sqm' || to === 'metres' || to === 'm')) {
      converted = value * UNIT_FACTORS.SQFT_TO_SQM;
    } else if ((to === 'sqft' || to === 'feet') && (from === 'sqm' || from === 'metres' || from === 'm')) {
      converted = value * UNIT_FACTORS.SQM_TO_SQFT;
    } else if (from === 'cents' && (to === 'sqft' || to === 'feet')) {
      converted = value * UNIT_FACTORS.CENT_TO_SQFT;
    } else {
      throw new Error(`Unsupported area unit conversion from "${fromUnit}" to "${toUnit}".`);
    }
  }

  return roundToPrecision(converted, 4);
}

/**
 * Calculates gross plot area with rigorous input validation
 */
export function calculatePlotArea(width, length, unit = 'feet') {
  const errors = [];

  if (!isValidPositiveDimension(width)) {
    errors.push(`Invalid plot width: expected positive number, received ${width}`);
  }
  if (!isValidPositiveDimension(length)) {
    errors.push(`Invalid plot length: expected positive number, received ${length}`);
  }

  if (errors.length > 0) {
    return {
      success: false,
      errors,
      plotArea: 0,
      plotAreaSqft: 0,
      plotAreaSqm: 0
    };
  }

  const area = roundToPrecision(width * length, 2);
  const isMetres = unit === 'metres' || unit === 'meters' || unit === 'm';

  const areaSqft = isMetres ? roundToPrecision(area * UNIT_FACTORS.SQM_TO_SQFT, 2) : area;
  const areaSqm = isMetres ? area : roundToPrecision(area * UNIT_FACTORS.SQFT_TO_SQM, 2);

  return {
    success: true,
    plotWidth: width,
    plotLength: length,
    unit: isMetres ? 'metres' : 'feet',
    plotArea: area,
    plotAreaSqft: areaSqft,
    plotAreaSqm: areaSqm
  };
}

/**
 * Calculates buildable envelope from plot boundaries and setbacks.
 * 
 * Rejects invalid dimensions and impossible setbacks.
 * NEVER silently clamps or invents arbitrary buildable widths.
 */
export function calculateBuildableEnvelope(plotWidth, plotLength, setbacks = {}, options = {}) {
  const errors = [];

  // 1. Validate Plot Dimensions
  if (!isValidPositiveDimension(plotWidth)) {
    errors.push(`Invalid plot width: ${plotWidth}. Width must be a strictly positive number.`);
  }
  if (!isValidPositiveDimension(plotLength)) {
    errors.push(`Invalid plot length: ${plotLength}. Length must be a strictly positive number.`);
  }

  if (errors.length > 0) {
    return { success: false, errors, isFeasible: false };
  }

  // 2. Validate Setback Values (must be non-negative)
  const left = setbacks.left !== undefined ? setbacks.left : 3.0;
  const right = setbacks.right !== undefined ? setbacks.right : 3.0;
  const front = setbacks.front !== undefined ? setbacks.front : 5.0;
  const rear = setbacks.rear !== undefined ? setbacks.rear : 4.0;

  if (!isValidNonNegativeDimension(left)) errors.push(`Invalid left setback: ${left}`);
  if (!isValidNonNegativeDimension(right)) errors.push(`Invalid right setback: ${right}`);
  if (!isValidNonNegativeDimension(front)) errors.push(`Invalid front setback: ${front}`);
  if (!isValidNonNegativeDimension(rear)) errors.push(`Invalid rear setback: ${rear}`);

  if (errors.length > 0) {
    return { success: false, errors, isFeasible: false };
  }

  // 3. Compute Buildable Dimensions
  const totalHorizontalSetback = roundToPrecision(left + right, 2);
  const totalVerticalSetback = roundToPrecision(front + rear, 2);

  const buildableWidth = roundToPrecision(plotWidth - totalHorizontalSetback, 2);
  const buildableLength = roundToPrecision(plotLength - totalVerticalSetback, 2);

  // 4. Feasibility & Impossible Setback Checks (DO NOT SILENTLY REPAIR)
  if (buildableWidth <= 0) {
    errors.push(
      `Setbacks consume entire plot width: Left (${left} ft) + Right (${right} ft) = ${totalHorizontalSetback} ft exceeds or equals Plot Width (${plotWidth} ft). Buildable width is ${buildableWidth} ft.`
    );
  }

  if (buildableLength <= 0) {
    errors.push(
      `Setbacks consume entire plot length: Front (${front} ft) + Rear (${rear} ft) = ${totalVerticalSetback} ft exceeds or equals Plot Length (${plotLength} ft). Buildable length is ${buildableLength} ft.`
    );
  }

  // Minimum habitable building corridor width check (standard residential building codes require at least 8 ft clear width)
  const minHabitableWidth = options.minHabitableWidth || 8.0;
  const minHabitableLength = options.minHabitableLength || 8.0;

  const warnings = [];
  if (buildableWidth > 0 && buildableWidth < minHabitableWidth) {
    warnings.push(
      `Buildable width of ${buildableWidth} ft is narrower than recommended minimum habitable width of ${minHabitableWidth} ft.`
    );
  }
  if (buildableLength > 0 && buildableLength < minHabitableLength) {
    warnings.push(
      `Buildable length of ${buildableLength} ft is shorter than recommended minimum habitable length of ${minHabitableLength} ft.`
    );
  }

  if (errors.length > 0) {
    return {
      success: false,
      isFeasible: false,
      errors,
      warnings,
      buildableEnvelope: null
    };
  }

  const buildableAreaSqft = roundToPrecision(buildableWidth * buildableLength, 2);
  const plotAreaSqft = roundToPrecision(plotWidth * plotLength, 2);
  const groundCoverageRatio = roundToPrecision(buildableAreaSqft / plotAreaSqft, 4);

  return {
    success: true,
    isFeasible: true,
    errors: [],
    warnings,
    plotWidth,
    plotLength,
    plotAreaSqft,
    setbacks: {
      left,
      right,
      front,
      rear
    },
    buildableEnvelope: {
      x: roundToPrecision(left, 2),
      y: roundToPrecision(front, 2),
      width: buildableWidth,
      length: buildableLength,
      areaSqft: buildableAreaSqft
    },
    metrics: {
      plotAreaSqft,
      buildableAreaSqft,
      groundCoverageRatio,
      groundCoveragePercentage: `${roundToPrecision(groundCoverageRatio * 100, 1)}%`
    },
    boundaryPoints: [
      { x: 0, y: 0 },
      { x: plotWidth, y: 0 },
      { x: plotWidth, y: plotLength },
      { x: 0, y: plotLength }
    ],
    buildablePoints: [
      { x: left, y: front },
      { x: left + buildableWidth, y: front },
      { x: left + buildableWidth, y: front + buildableLength },
      { x: left, y: front + buildableLength }
    ]
  };
}
