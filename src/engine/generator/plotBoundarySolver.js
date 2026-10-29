/**
 * LabourConnect Design Engine - Plot Boundary & Setback Solver
 * 
 * Derives valid buildable envelope from site geometry and standard building codes.
 * Backed by decimal-safe dimensionalCalculator.
 */

import { calculateBuildableEnvelope } from '../geometry/dimensionalCalculator.js';

export function solvePlotBoundary(plotWidth, plotLength, facingDirection = 'East') {
  const W = Number(plotWidth);
  const L = Number(plotLength);

  let setbacks;
  if (W <= 22) {
    // Narrow plot setbacks
    setbacks = { front: 3.5, rear: 2.5, left: 1.5, right: 1.5 };
  } else if (W <= 40) {
    // Medium residential plot
    setbacks = { front: 5.0, rear: 4.0, left: 3.0, right: 3.0 };
  } else {
    // Large executive / villa plot
    setbacks = { front: 7.0, rear: 5.0, left: 4.0, right: 4.0 };
  }

  // Calculate decimal-safe envelope with validation
  const envelopeResult = calculateBuildableEnvelope(W, L, setbacks, {
    minHabitableWidth: 8.0,
    minHabitableLength: 10.0
  });

  if (!envelopeResult.success) {
    throw new Error(`Plot boundary calculation error: ${envelopeResult.errors.join('; ')}`);
  }

  const { buildableEnvelope, boundaryPoints, buildablePoints } = envelopeResult;

  return {
    plotWidth: W,
    plotLength: L,
    plotAreaSqft: W * L,
    facingDirection,
    setbacks,
    buildableEnvelope,
    boundaryPoints,
    buildablePoints
  };
}
