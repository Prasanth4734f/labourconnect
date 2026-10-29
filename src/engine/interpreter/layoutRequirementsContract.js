/**
 * LabourConnect Design Engine - Structured Layout Requirements Contract
 * 
 * Formal specification conforming to S2-T01:
 * - Compiles parsed user requirements into a normalized, validated contract for layout generation.
 * - Integrates dimensional calculation foundation (plot area, setbacks, buildable envelope).
 * - Distinguishes EXPLICIT, INFERRED, DEFAULT, and MISSING requirements.
 * - Accounts for walls, circulation, and access allowances (15% circulation factor).
 * - Detects geometric and spatial infeasibility (e.g. room area exceeds total buildable envelope).
 * - Reports missing information, contradictions, and unsupported requests clearly.
 * - Single source of truth feeding the Room Program (S2-T02) and Adjacency Graph (S2-T03).
 */

import { parseStructuredRequirements, REQUIREMENT_SOURCE } from './structuredRequirementParser.js';
import { calculatePlotArea, calculateBuildableEnvelope, convertUnits } from '../geometry/dimensionalCalculator.js';
import { ROOM_TYPES } from '../schema/canonicalDesignSchema.js';

export const CIRCULATION_WALL_FACTOR = 1.15; // 15% allowance for walls and internal circulation

/**
 * Standard minimum architectural space standards (in decimal feet)
 */
export const ARCHITECTURAL_SPACE_STANDARDS = {
  [ROOM_TYPES.PORTICO]: { minWidth: 9.0, minLength: 12.0, minArea: 110, targetRatio: 0.85, requiresExterior: true },
  [ROOM_TYPES.FOYER]: { minWidth: 5.0, minLength: 6.0, minArea: 35, targetRatio: 1.2, requiresExterior: true },
  [ROOM_TYPES.LIVING]: { minWidth: 11.0, minLength: 12.0, minArea: 140, targetRatio: 1.25, requiresExterior: true },
  [ROOM_TYPES.DINING]: { minWidth: 9.0, minLength: 10.0, minArea: 95, targetRatio: 1.1, requiresExterior: false },
  [ROOM_TYPES.KITCHEN]: { minWidth: 7.0, minLength: 8.0, minArea: 65, targetRatio: 1.15, requiresExterior: true },
  [ROOM_TYPES.POOJA]: { minWidth: 4.0, minLength: 4.0, minArea: 20, targetRatio: 1.0, requiresExterior: false },
  [ROOM_TYPES.COURTYARD]: { minWidth: 7.0, minLength: 7.0, minArea: 50, targetRatio: 1.0, requiresExterior: true },
  [ROOM_TYPES.STAIRWELL]: { minWidth: 6.5, minLength: 10.0, minArea: 75, targetRatio: 1.6, requiresExterior: false },
  [ROOM_TYPES.MASTER_BEDROOM]: { minWidth: 10.5, minLength: 12.0, minArea: 135, targetRatio: 1.15, requiresExterior: true },
  [ROOM_TYPES.BEDROOM]: { minWidth: 9.5, minLength: 10.5, minArea: 105, targetRatio: 1.15, requiresExterior: true },
  [ROOM_TYPES.BATHROOM]: { minWidth: 4.5, minLength: 6.0, minArea: 30, targetRatio: 1.3, requiresExterior: true },
  [ROOM_TYPES.BALCONY]: { minWidth: 4.0, minLength: 8.0, minArea: 40, targetRatio: 2.0, requiresExterior: true },
  [ROOM_TYPES.TERRACE]: { minWidth: 10.0, minLength: 12.0, minArea: 150, targetRatio: 1.4, requiresExterior: true }
};

/**
 * Compiles raw prompt or structured inputs into a validated Structured Layout Requirements specification
 */
export function compileLayoutRequirements(rawInput, options = {}) {
  // 1. Run deterministic structured requirements parser
  const parsed = parseStructuredRequirements(rawInput, options);

  const errors = [...parsed.errors];
  const warnings = [...parsed.warnings];
  const contradictions = [...parsed.contradictions];
  const missingInformation = [...parsed.missingInformation];
  const unsupportedRequests = [...parsed.unsupportedRequests];

  if (!parsed.valid && missingInformation.length > 0 && !options.allowDefaultPlot) {
    return {
      success: false,
      isValid: false,
      isFeasible: false,
      requirements: null,
      missingInformation,
      contradictions,
      unsupportedRequests,
      errors,
      warnings
    };
  }

  const req = parsed.requirements;
  const provenance = parsed.provenance;

  // 2. Unit Normalization & Dimensional Calculations
  const inputUnits = req.inputUnits || 'feet';
  let plotWidthFt = req.plotWidth;
  let plotLengthFt = req.plotLength;

  if (inputUnits === 'metres') {
    plotWidthFt = convertUnits(req.plotWidth, 'metres', 'feet');
    plotLengthFt = convertUnits(req.plotLength, 'metres', 'feet');
  }

  // Ensure length >= width convention
  if (plotWidthFt && plotLengthFt && plotWidthFt > plotLengthFt) {
    const temp = plotWidthFt;
    plotWidthFt = plotLengthFt;
    plotLengthFt = temp;
  }

  // Calculate Plot Area
  const plotAreaRes = calculatePlotArea(plotWidthFt, plotLengthFt, 'feet');
  if (!plotAreaRes.success) {
    errors.push(...plotAreaRes.errors);
  }

  // Determine Configured Setbacks (aligned with plotBoundarySolver building code tiers)
  let defaultSetbacks;
  if (options.setbacks) {
    defaultSetbacks = options.setbacks;
  } else if (plotWidthFt <= 22) {
    defaultSetbacks = { front: 3.5, rear: 2.5, left: 1.5, right: 1.5 };
  } else if (plotWidthFt <= 40) {
    defaultSetbacks = { front: 5.0, rear: 4.0, left: 3.0, right: 3.0 };
  } else {
    defaultSetbacks = { front: 7.0, rear: 5.0, left: 4.0, right: 4.0 };
  }

  // Solve Buildable Envelope
  const envRes = calculateBuildableEnvelope(plotWidthFt, plotLengthFt, defaultSetbacks);
  if (!envRes.success) {
    errors.push(...envRes.errors);
    return {
      success: false,
      isValid: false,
      isFeasible: false,
      requirements: null,
      missingInformation,
      contradictions,
      unsupportedRequests,
      errors,
      warnings
    };
  }

  const buildableEnv = envRes.buildableEnvelope;
  const floorsCount = req.floorsCount || 1;
  const maxFloorBuildableSqft = buildableEnv.areaSqft;
  const maxTotalBuildableSqft = maxFloorBuildableSqft * floorsCount;

  const isCompactPlot = buildableEnv.areaSqft <= 760 || plotWidthFt <= 24 || (rawInput?.userPrompt || '').toLowerCase().includes('compact');

  // 3. Assemble Room Requirements List
  const roomRequirements = [];
  let _totalMinCarpetRequired = 0;

  // Parking / Portico
  // If parking was only a DEFAULT (not explicitly requested), verify if single-floor plinth can afford a portico
  const canAffordDefaultParking = floorsCount > 1 || (buildableEnv.areaSqft >= 950);
  const includeParking = req.parking && (provenance.parking === REQUIREMENT_SOURCE.EXPLICIT || canAffordDefaultParking);

  if (includeParking) {
    const std = ARCHITECTURAL_SPACE_STANDARDS[ROOM_TYPES.PORTICO];
    roomRequirements.push({
      type: ROOM_TYPES.PORTICO,
      name: 'Car Porch & Portico',
      count: 1,
      minWidth: std.minWidth,
      minLength: std.minLength,
      minArea: std.minArea,
      maxArea: std.minArea * 1.8,
      requiresExterior: true,
      floorPreference: 0,
      requiredAdjacencies: [],
      preferredAdjacencies: [ROOM_TYPES.FOYER],
      provenance: provenance.parking
    });
    _totalMinCarpetRequired += std.minArea;
  }

  // Entrance Foyer
  const foyerStd = ARCHITECTURAL_SPACE_STANDARDS[ROOM_TYPES.FOYER];
  const foyerMinArea = isCompactPlot ? 25 : foyerStd.minArea;
  const foyerMinWidth = isCompactPlot ? 4.5 : foyerStd.minWidth;
  const foyerMinLength = isCompactPlot ? 5.0 : foyerStd.minLength;
  roomRequirements.push({
    type: ROOM_TYPES.FOYER,
    name: 'Entrance Foyer & Verandah',
    count: 1,
    minWidth: foyerMinWidth,
    minLength: foyerMinLength,
    minArea: foyerMinArea,
    maxArea: foyerMinArea * 2.0,
    requiresExterior: true,
    floorPreference: 0,
    requiredAdjacencies: [],
    preferredAdjacencies: [ROOM_TYPES.LIVING],
    provenance: REQUIREMENT_SOURCE.DEFAULT
  });
  _totalMinCarpetRequired += foyerMinArea;

  // Living Room
  if (req.livingRoom) {
    const std = ARCHITECTURAL_SPACE_STANDARDS[ROOM_TYPES.LIVING];
    const livingMinArea = isCompactPlot ? 110 : std.minArea;
    const livingMinWidth = isCompactPlot ? 10.0 : std.minWidth;
    const livingMinLength = isCompactPlot ? 10.5 : std.minLength;
    roomRequirements.push({
      type: ROOM_TYPES.LIVING,
      name: 'Living Room Lounge',
      count: 1,
      minWidth: livingMinWidth,
      minLength: livingMinLength,
      minArea: livingMinArea,
      maxArea: livingMinArea * 2.2,
      requiresExterior: true,
      floorPreference: 0,
      requiredAdjacencies: [],
      preferredAdjacencies: [ROOM_TYPES.FOYER, ROOM_TYPES.DINING],
      provenance: provenance.livingRoom
    });
    _totalMinCarpetRequired += livingMinArea;
  }

  // Dining Room
  const diningStd = ARCHITECTURAL_SPACE_STANDARDS[ROOM_TYPES.DINING];
  const diningMinArea = isCompactPlot ? 65 : diningStd.minArea;
  const diningMinWidth = isCompactPlot ? 7.5 : diningStd.minWidth;
  const diningMinLength = isCompactPlot ? 8.5 : diningStd.minLength;
  roomRequirements.push({
    type: ROOM_TYPES.DINING,
    name: 'Dining Area',
    count: 1,
    minWidth: diningMinWidth,
    minLength: diningMinLength,
    minArea: diningMinArea,
    maxArea: diningMinArea * 2.0,
    requiresExterior: false,
    floorPreference: 0,
    requiredAdjacencies: [],
    preferredAdjacencies: [ROOM_TYPES.LIVING, ROOM_TYPES.KITCHEN],
    provenance: REQUIREMENT_SOURCE.DEFAULT
  });
  _totalMinCarpetRequired += diningMinArea;

  // Kitchen
  if (req.kitchen) {
    const std = ARCHITECTURAL_SPACE_STANDARDS[ROOM_TYPES.KITCHEN];
    const kitchenMinArea = isCompactPlot ? 50 : std.minArea;
    const kitchenMinWidth = isCompactPlot ? 6.0 : std.minWidth;
    const kitchenMinLength = isCompactPlot ? 7.5 : std.minLength;
    roomRequirements.push({
      type: ROOM_TYPES.KITCHEN,
      name: 'Modular Kitchen',
      count: 1,
      minWidth: kitchenMinWidth,
      minLength: kitchenMinLength,
      minArea: kitchenMinArea,
      maxArea: kitchenMinArea * 1.9,
      requiresExterior: true,
      floorPreference: 0,
      requiredAdjacencies: [],
      preferredAdjacencies: [ROOM_TYPES.DINING],
      provenance: provenance.kitchen
    });
    _totalMinCarpetRequired += kitchenMinArea;
  }

  // Pooja Room (if requested in constraints, req.pooja, or options, respecting explicit false)
  const isPoojaDisabled = req.pooja === false || options.hasPooja === false;
  const hasPooja = !isPoojaDisabled && (
    req.pooja === true ||
    Boolean(options.hasPooja) ||
    req.userConstraints.some(c => c.toLowerCase().includes('pooja'))
  );
  if (hasPooja) {
    const std = ARCHITECTURAL_SPACE_STANDARDS[ROOM_TYPES.POOJA];
    roomRequirements.push({
      type: ROOM_TYPES.POOJA,
      name: 'Pooja Sanctum',
      count: 1,
      minWidth: std.minWidth,
      minLength: std.minLength,
      minArea: std.minArea,
      maxArea: std.minArea * 2.0,
      requiresExterior: false,
      floorPreference: 0,
      requiredAdjacencies: [],
      preferredAdjacencies: [ROOM_TYPES.DINING, ROOM_TYPES.LIVING],
      provenance: REQUIREMENT_SOURCE.EXPLICIT
    });
    _totalMinCarpetRequired += std.minArea;
  }

  // Central Courtyard (if requested)
  const hasCourtyard = req.userConstraints.some(c => c.toLowerCase().includes('courtyard')) || options.hasCourtyard;
  if (hasCourtyard) {
    const std = ARCHITECTURAL_SPACE_STANDARDS[ROOM_TYPES.COURTYARD];
    roomRequirements.push({
      type: ROOM_TYPES.COURTYARD,
      name: 'Central Courtyard',
      count: 1,
      minWidth: std.minWidth,
      minLength: std.minLength,
      minArea: std.minArea,
      maxArea: std.minArea * 2.2,
      requiresExterior: true,
      floorPreference: 0,
      requiredAdjacencies: [],
      preferredAdjacencies: [ROOM_TYPES.LIVING, ROOM_TYPES.DINING],
      provenance: REQUIREMENT_SOURCE.EXPLICIT
    });
    _totalMinCarpetRequired += std.minArea;
  }

  // Stairwell (if multi-floor)
  if (floorsCount > 1) {
    const std = ARCHITECTURAL_SPACE_STANDARDS[ROOM_TYPES.STAIRWELL];
    roomRequirements.push({
      type: ROOM_TYPES.STAIRWELL,
      name: 'Staircase Core',
      count: floorsCount,
      minWidth: std.minWidth,
      minLength: std.minLength,
      minArea: std.minArea,
      maxArea: std.minArea * 1.5,
      requiresExterior: false,
      floorPreference: 'all',
      requiredAdjacencies: [],
      preferredAdjacencies: [ROOM_TYPES.LIVING, ROOM_TYPES.DINING],
      provenance: REQUIREMENT_SOURCE.INFERRED
    });
    // Stairwell area occupies space on each floor
    _totalMinCarpetRequired += std.minArea * floorsCount;
  }

  // Bedrooms
  const numBhk = req.requiredBedrooms || 3;
  const masterStd = ARCHITECTURAL_SPACE_STANDARDS[ROOM_TYPES.MASTER_BEDROOM];
  const regBedStd = ARCHITECTURAL_SPACE_STANDARDS[ROOM_TYPES.BEDROOM];

  const masterMinArea = isCompactPlot ? 110 : masterStd.minArea;
  const masterMinWidth = isCompactPlot ? 10.0 : masterStd.minWidth;
  const masterMinLength = isCompactPlot ? 10.5 : masterStd.minLength;

  // 1 Master Bedroom
  roomRequirements.push({
    type: ROOM_TYPES.MASTER_BEDROOM,
    name: 'Master Bedroom Suite',
    count: 1,
    minWidth: masterMinWidth,
    minLength: masterMinLength,
    minArea: masterMinArea,
    maxArea: masterMinArea * 2.0,
    requiresExterior: true,
    floorPreference: floorsCount > 1 ? 1 : 0,
    requiredAdjacencies: [ROOM_TYPES.BATHROOM],
    preferredAdjacencies: [],
    provenance: provenance.requiredBedrooms
  });
  _totalMinCarpetRequired += masterMinArea;

  // Remaining Bedrooms
  if (numBhk > 1) {
    const otherBeds = numBhk - 1;
    const regBedMinArea = isCompactPlot ? 85 : regBedStd.minArea;
    const regBedMinWidth = isCompactPlot ? 8.5 : regBedStd.minWidth;
    const regBedMinLength = isCompactPlot ? 9.5 : regBedStd.minLength;
    roomRequirements.push({
      type: ROOM_TYPES.BEDROOM,
      name: 'Secondary Bedroom',
      count: otherBeds,
      minWidth: regBedMinWidth,
      minLength: regBedMinLength,
      minArea: regBedMinArea,
      maxArea: regBedMinArea * 1.8,
      requiresExterior: true,
      floorPreference: 'any',
      requiredAdjacencies: [],
      preferredAdjacencies: [],
      provenance: provenance.requiredBedrooms
    });
    _totalMinCarpetRequired += regBedMinArea * otherBeds;
  }

  // Bathrooms
  const numBaths = req.requiredBathrooms || (floorsCount === 1 && numBhk <= 2 ? 1 : (numBhk <= 2 ? 1 : 2));
  const bathStd = ARCHITECTURAL_SPACE_STANDARDS[ROOM_TYPES.BATHROOM];
  roomRequirements.push({
    type: ROOM_TYPES.BATHROOM,
    name: 'Bathroom',
    count: numBaths,
    minWidth: bathStd.minWidth,
    minLength: bathStd.minLength,
    minArea: bathStd.minArea,
    maxArea: bathStd.minArea * 2.0,
    requiresExterior: true,
    floorPreference: 'any',
    requiredAdjacencies: [],
    preferredAdjacencies: [],
    provenance: provenance.requiredBathrooms
  });
  _totalMinCarpetRequired += bathStd.minArea * numBaths;

  // Balcony (if multi-floor and requested)
  if (req.balcony && floorsCount > 1) {
    const std = ARCHITECTURAL_SPACE_STANDARDS[ROOM_TYPES.BALCONY];
    roomRequirements.push({
      type: ROOM_TYPES.BALCONY,
      name: 'Upper Balcony Deck',
      count: 1,
      minWidth: std.minWidth,
      minLength: std.minLength,
      minArea: std.minArea,
      maxArea: std.minArea * 2.5,
      requiresExterior: true,
      floorPreference: 1,
      requiredAdjacencies: [],
      preferredAdjacencies: [ROOM_TYPES.LIVING, ROOM_TYPES.MASTER_BEDROOM],
      provenance: provenance.balcony
    });
    _totalMinCarpetRequired += std.minArea;
  }

  // 4. Feasibility Check: Total Required Gross Built-Up vs Buildable Area
  // Enclosed habitable & service spaces require 15% circulation & wall thickness; outdoor/semi-open spaces (portico, balcony, courtyard) do not
  const enclosedCarpet = roomRequirements
    .filter(r => r.type !== ROOM_TYPES.PORTICO && r.type !== ROOM_TYPES.BALCONY && r.type !== ROOM_TYPES.COURTYARD && r.type !== ROOM_TYPES.TERRACE)
    .reduce((sum, r) => sum + (r.minArea * r.count), 0);
  const outdoorCarpet = roomRequirements
    .filter(r => r.type === ROOM_TYPES.PORTICO || r.type === ROOM_TYPES.BALCONY || r.type === ROOM_TYPES.COURTYARD || r.type === ROOM_TYPES.TERRACE)
    .reduce((sum, r) => sum + (r.minArea * r.count), 0);
  const totalMinBuiltUpRequired = Math.round(enclosedCarpet * CIRCULATION_WALL_FACTOR) + outdoorCarpet;
  const isFeasible = totalMinBuiltUpRequired <= maxTotalBuildableSqft;

  if (!isFeasible) {
    errors.push(
      `Spatial infeasibility: Requested ${numBhk}BHK program requires at least ${totalMinBuiltUpRequired} sq.ft gross built-up area (including ${Math.round(enclosedCarpet * 0.15)} sq.ft circulation/walls), but total buildable envelope across ${floorsCount} floor(s) is only ${Math.round(maxTotalBuildableSqft)} sq.ft (${Math.round(maxFloorBuildableSqft)} sq.ft/floor).`
    );
  }

  const isValid = errors.length === 0 && contradictions.length === 0 && unsupportedRequests.length === 0;

  return {
    success: isValid && isFeasible,
    isValid,
    isFeasible,
    requirements: {
      site: {
        plotWidth: plotWidthFt,
        plotLength: plotLengthFt,
        inputUnits,
        plotAreaSqft: plotAreaRes.plotAreaSqft,
        plotBoundary: { x: 0, y: 0, width: plotWidthFt, length: plotLengthFt },
        setbacks: defaultSetbacks,
        buildableEnvelope: buildableEnv,
        groundCoverageRatio: envRes.metrics.groundCoverageRatio,
        facingDirection: req.facingDirection || 'East'
      },
      building: {
        bhkCount: numBhk,
        bathroomsCount: numBaths,
        floorsCount,
        archStyle: req.archStyle || 'modern',
        maxFloorBuildableSqft,
        maxTotalBuildableSqft,
        estimatedBuiltUpRequiredSqft: totalMinBuiltUpRequired
      },
      rooms: roomRequirements,
      features: {
        livingRoom: req.livingRoom,
        kitchen: req.kitchen,
        parking: includeParking,
        balcony: req.balcony,
        courtyard: hasCourtyard,
        pooja: hasPooja
      },
      userConstraints: req.userConstraints,
      provenanceMap: provenance
    },
    missingInformation,
    contradictions,
    unsupportedRequests,
    errors,
    warnings
  };
}
