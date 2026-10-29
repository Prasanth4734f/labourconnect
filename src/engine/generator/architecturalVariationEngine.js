/**
 * LabourConnect Design Engine - Architectural Design Intelligence & Variation Engine
 * 
 * S3-T03: Requirement-Driven Architectural Design Intelligence & Variation
 * 
 * Produces meaningfully different, geometrically valid, requirement-driven
 * architectural design alternatives based on:
 * - Architectural constraints and municipal setbacks
 * - Plot geometry and aspect ratio
 * - Spatial relationships and circulation topology
 * - Architectural styles (Modern, Minimalist, Luxury Villa, Traditional Kerala, Eco-Friendly)
 * - Procedurally controlled rooflines (flat terrace, sloping mangalore tile, pergola, stepped parapet)
 * - Facade depth modulations and exterior sunshades (chajjas)
 * - Deterministic BOQ cost awareness and explainable scoring
 * - Multi-signal near-duplicate rejection and candidate diversity reporting
 * 
 * Core Architectural Invariant:
 * Zero superficial randomization. Every design alternative represents genuine
 * spatial, topological, circulation, or massing decisions that preserve 100% of the
 * user's explicit hard constraints.
 */

import { SPATIAL_ARCHETYPES } from './adjacencyGraphSolver.js';
import { generateLayout } from './layoutGenerator.js';
import { validateLayoutConstraints } from '../evaluation/constraintValidator.js';
import { scoreDesignQuality, rankCandidates } from '../evaluation/designScorer.js';
import { 
  filterDiverseCandidates, 
  computeDesignFingerprint,
  classifyArchitecturalDifference,
  ARCHITECTURAL_DIFFERENCE_LEVEL
} from '../evaluation/similarityEngine.js';
import { parseStructuredRequirements } from '../interpreter/structuredRequirementParser.js';
import { interpretRequirements } from '../interpreter/requirementInterpreter.js';
import { createEmptyDesign } from '../schema/canonicalDesignSchema.js';
import { generateAllFloorsDrawings } from '../cad/floorPlanGenerator.js';
import { buildProcedural3dGeometry } from '../geometry/procedural3dGenerator.js';
import { planWalkthroughPath } from '../geometry/walkthroughPathPlanner.js';
import { calculateDeterministicBOQ } from '../estimation/deterministicBoqEngine.js';
import { 
  generateProceduralRoofline3d, 
  generateWindowChajjas3d 
} from '../geometry/proceduralBuildingGenerator3d.js';

export {
  generateProceduralRoofline3d,
  generateWindowChajjas3d
};

export const ARCHITECTURAL_VARIATION_VERSION = '3.0.0-s3-t03';

// =============================================================================
// 1. ARCHITECTURAL STYLES & SPECIFICATIONS
// =============================================================================

export const ROOFLINE_STYLES = Object.freeze({
  FLAT_TERRACE: 'flat_terrace',           // Weather-proof screed terrace with parapet
  PARAPET_PROFILE: 'parapet_profile',     // Continuous monolithic parapet with coping cap
  SLOPING_PITCHED: 'sloping_pitched',     // Dual-pitch sloping timber rafters & mangalore tile eaves
  PERGOLA_TERRACE: 'pergola_terrace',     // Shaded open-air timber/steel pergola trellis
  STEPPED_PARAPET: 'stepped_parapet'      // Sculpted parapet with raised architectural corner piers
});

export const FACADE_MODULATIONS = Object.freeze({
  FLUSH: 'flush',                         // Smooth coplanar exterior walls
  PROJECTING_CHAJJAS: 'projecting_chajjas', // Cantilevered RCC window weather-shades (1.5 ft projection)
  ARCHITECTURAL_FINS: 'architectural_fins', // Vertical solar shading fins framing exterior openings
  RECESSED_BALCONIES: 'recessed_balconies'  // Deep-set shaded loggias and balconies
});

export const FENESTRATION_RHYTHMS = Object.freeze({
  PANORAMIC_RIBBON: 'panoramic_ribbon',   // Wide horizontal window bands
  BALANCED_PUNCHED: 'balanced_punched',   // Regular rhythmic punched openings
  FLOOR_TO_CEILING_SLIDER: 'floor_to_ceiling_slider', // Tall sliding glass apertures
  TRADITIONAL_DIVIDED: 'traditional_divided', // Vertical windows with mullions & transoms
  PASSIVE_VENTILATED: 'passive_ventilated' // Clerestory ventilators and louvered panels
});

export const CIRCULATION_STRATEGIES = Object.freeze({
  RIGHT_FLANK_CORE: 'right_flank_core',   // Staircase aligned along the right building flank
  LEFT_FLANK_CORE: 'left_flank_core',     // Staircase aligned along the left building flank
  CENTRAL_SPINE: 'central_spine'          // Central circulation corridor / spine
});

export const ARCHITECTURAL_STYLES = Object.freeze({
  MODERN_CONTEMPORARY: {
    id: 'modern_contemporary',
    name: 'Modern Contemporary',
    defaultArchetype: SPATIAL_ARCHETYPES.OPEN_CONTEMPORARY,
    roofline: ROOFLINE_STYLES.PERGOLA_TERRACE,
    facadeModulation: FACADE_MODULATIONS.PROJECTING_CHAJJAS,
    fenestrationRhythm: FENESTRATION_RHYTHMS.PANORAMIC_RIBBON,
    porticoStyle: 'CANTILEVERED_SLAB',
    description: 'Clean horizontal lines, open floor plan, panoramic fenestration, cantilevered portico, and rooftop pergola deck.',
    finishPalette: {
      exteriorWall: '#f8fafc',
      windowFrame: '#1e293b',
      roofEaves: '#475569',
      portico: '#0f172a'
    }
  },
  MINIMALIST: {
    id: 'minimalist',
    name: 'Minimalist Architecture',
    defaultArchetype: SPATIAL_ARCHETYPES.LINEAR_SPINE,
    roofline: ROOFLINE_STYLES.PARAPET_PROFILE,
    facadeModulation: FACADE_MODULATIONS.FLUSH,
    fenestrationRhythm: FENESTRATION_RHYTHMS.BALANCED_PUNCHED,
    porticoStyle: 'FLUSH_PORTAL',
    description: 'Pure geometric cuboid massing, recessed apertures, flush monolithic parapets, and zero extraneous ornamentation.',
    finishPalette: {
      exteriorWall: '#f1f5f9',
      windowFrame: '#0f172a',
      roofEaves: '#94a3b8',
      portico: '#1e293b'
    }
  },
  LUXURY_VILLA: {
    id: 'luxury_villa',
    name: 'Luxury Villa',
    defaultArchetype: SPATIAL_ARCHETYPES.VILLA_PAVILION,
    roofline: ROOFLINE_STYLES.STEPPED_PARAPET,
    facadeModulation: FACADE_MODULATIONS.ARCHITECTURAL_FINS,
    fenestrationRhythm: FENESTRATION_RHYTHMS.FLOOR_TO_CEILING_SLIDER,
    porticoStyle: 'GRAND_PORTICO',
    description: 'Sculpted stepped massing, double-height grand foyer, floor-to-ceiling glass sliders, architectural solar fins, and spacious balconies.',
    finishPalette: {
      exteriorWall: '#f8fafc',
      windowFrame: '#0f172a',
      roofEaves: '#334155',
      portico: '#0f172a'
    }
  },
  TRADITIONAL_KERALA: {
    id: 'traditional_kerala',
    name: 'Traditional Kerala Architecture',
    defaultArchetype: SPATIAL_ARCHETYPES.COURTYARD_CENTRIC,
    roofline: ROOFLINE_STYLES.SLOPING_PITCHED,
    facadeModulation: FACADE_MODULATIONS.PROJECTING_CHAJJAS,
    fenestrationRhythm: FENESTRATION_RHYTHMS.TRADITIONAL_DIVIDED,
    porticoStyle: 'POOMUKHAM_VERANDAH',
    description: 'Sloping mangalore tile eaves with generous overhangs, central thotti courtyard, carved teak timber rafters, and poomukham verandah.',
    finishPalette: {
      exteriorWall: '#fef08a',
      windowFrame: '#78350f',
      roofEaves: '#b45309',
      portico: '#92400e'
    }
  },
  ECO_FRIENDLY: {
    id: 'eco_friendly',
    name: 'Eco-Friendly Biophilic',
    defaultArchetype: SPATIAL_ARCHETYPES.COURTYARD_CENTRIC,
    roofline: ROOFLINE_STYLES.PERGOLA_TERRACE,
    facadeModulation: FACADE_MODULATIONS.PROJECTING_CHAJJAS,
    fenestrationRhythm: FENESTRATION_RHYTHMS.PASSIVE_VENTILATED,
    porticoStyle: 'GREEN_TRELLIS',
    description: 'Passive solar shading, deep window chajjas, central cross-ventilation lightwell, solar pergola terrace, and biophilic outdoor connections.',
    finishPalette: {
      exteriorWall: '#f4fbf7',
      windowFrame: '#14532d',
      roofEaves: '#15803d',
      portico: '#166534'
    }
  }
});

// =============================================================================
// 2. ARCHITECTURAL STRATEGY GENERATION
// =============================================================================

/**
 * Deterministically derives a list of mutually distinct, architecturally valid
 * strategy configurations for the given plot specifications and constraints.
 * 
 * @param {Object} specs - Normalized layout requirements
 * @param {Object} [options] - Options { count, baseSeed }
 * @returns {Array<Object>} List of distinct architectural strategy configurations
 */
export function generateArchitecturalStrategies(specs = {}, options = {}) {
  const count = Math.max(1, Math.min(6, options.count || 3));
  const plotW = Number(specs.plotWidth) || 30;
  const plotL = Number(specs.plotLength) || 40;
  const ratio = plotL / Math.max(plotW, 1);
  const floorsCount = Number(specs.floorsCount) || 1;
  const requestedStyle = (specs.archStyle || 'modern').toLowerCase();

  // Resolve base architectural style
  let baseStyleKey = 'MODERN_CONTEMPORARY';
  if (requestedStyle.includes('traditional') || requestedStyle.includes('kerala')) {
    baseStyleKey = 'TRADITIONAL_KERALA';
  } else if (requestedStyle.includes('minimalist')) {
    baseStyleKey = 'MINIMALIST';
  } else if (requestedStyle.includes('villa') || requestedStyle.includes('luxury')) {
    baseStyleKey = 'LUXURY_VILLA';
  } else if (requestedStyle.includes('eco') || requestedStyle.includes('biophilic') || requestedStyle.includes('green')) {
    baseStyleKey = 'ECO_FRIENDLY';
  }

  const primaryStyle = ARCHITECTURAL_STYLES[baseStyleKey];

  // Permitted spatial archetypes based on plot geometry
  const candidateArchetypes = [];

  if (specs.amenities?.hasCourtyard || requestedStyle.includes('traditional') || requestedStyle.includes('eco')) {
    candidateArchetypes.push(SPATIAL_ARCHETYPES.COURTYARD_CENTRIC);
  }

  if (ratio >= 1.8 || plotW <= 24) {
    candidateArchetypes.push(SPATIAL_ARCHETYPES.LINEAR_SPINE);
  }

  candidateArchetypes.push(SPATIAL_ARCHETYPES.OPEN_CONTEMPORARY);

  if (plotW >= 32 && (specs.bhkCount >= 3 || requestedStyle.includes('villa'))) {
    candidateArchetypes.push(SPATIAL_ARCHETYPES.VILLA_PAVILION);
  }

  // Ensure minimum 3 unique archetypes are available for diversity
  const fallbackArchetypes = [
    SPATIAL_ARCHETYPES.OPEN_CONTEMPORARY,
    SPATIAL_ARCHETYPES.COURTYARD_CENTRIC,
    SPATIAL_ARCHETYPES.LINEAR_SPINE,
    SPATIAL_ARCHETYPES.VILLA_PAVILION
  ];

  fallbackArchetypes.forEach(arch => {
    if (!candidateArchetypes.includes(arch)) {
      candidateArchetypes.push(arch);
    }
  });

  const strategies = [];

  for (let i = 0; i < count; i++) {
    const archetype = candidateArchetypes[i % candidateArchetypes.length];
    const stairOnRight = (i === 0 || i === 2 || i === 4);
    const porticoOnLeft = (i === 1 || i === 2 || i === 5);

    // Diversify rooflines and facade modulations across alternatives
    let roofline = primaryStyle.roofline;
    let facadeModulation = primaryStyle.facadeModulation;

    if (i === 1) {
      // Alternative 2: explore alternate roofline/massing
      if (primaryStyle.id !== 'traditional_kerala') {
        if (roofline === ROOFLINE_STYLES.PERGOLA_TERRACE) {
          roofline = ROOFLINE_STYLES.FLAT_TERRACE;
        } else if (roofline === ROOFLINE_STYLES.SLOPING_PITCHED) {
          roofline = ROOFLINE_STYLES.PERGOLA_TERRACE;
        } else {
          roofline = ROOFLINE_STYLES.STEPPED_PARAPET;
        }
      }
    } else if (i === 2) {
      // Alternative 3: explore architectural fins / recessed modulations if style permits
      if (primaryStyle.id !== 'traditional_kerala') {
        facadeModulation = FACADE_MODULATIONS.ARCHITECTURAL_FINS;
      }
    }

    const strategyId = `strat_${archetype}_${stairOnRight ? 'right' : 'left'}_stair_v${i + 1}`;

    strategies.push({
      strategyId,
      strategyIndex: i,
      name: `Alternative ${i + 1}: ${archetype.replace('_', ' ').toUpperCase()} (${stairOnRight ? 'Right Flank' : 'Left Flank'} Core)`,
      archetype,
      style: primaryStyle,
      rooflineStyle: roofline,
      facadeModulation,
      fenestrationRhythm: primaryStyle.fenestrationRhythm,
      circulationStrategy: stairOnRight ? CIRCULATION_STRATEGIES.RIGHT_FLANK_CORE : CIRCULATION_STRATEGIES.LEFT_FLANK_CORE,
      stairOnRight,
      porticoOnLeft,
      floorsCount,
      description: `Spatial archetype: ${archetype}. Circulation core: ${stairOnRight ? 'Right flank' : 'Left flank'}. Roofline: ${roofline.replace('_', ' ')}. Facade: ${facadeModulation.replace('_', ' ')}.`
    });
  }

  return strategies;
}

// =============================================================================
// 3. 3D PROCEDURAL ROOFLINES & EXTERIOR SUNSHADES
// Implemented and re-exported from ../geometry/proceduralBuildingGenerator3d.js
// =============================================================================

// =============================================================================
// 4. END-TO-END REQUIREMENT-DRIVEN ARCHITECTURAL ALTERNATIVES PIPELINE
// =============================================================================

/**
 * Procedurally generates multiple meaningfully different, geometrically valid,
 * requirement-driven architectural design alternatives.
 * 
 * Pipeline:
 * User Requirements -> Structured Normalization -> Architectural Strategy Exploration
 * -> Candidate Layout Generation -> Constraint Validation -> Similarity Deduplication
 * -> Design Quality & Cost Scoring -> Canonical Candidate Enrichment (2D + 3D).
 * 
 * @param {Object|string} rawInputs - Raw user prompt or structured requirements object
 * @param {Object} [options] - Options { targetAlternatives, seed, history, maxSearchAttempts }
 * @returns {Object} Comprehensive alternatives result with canonical designs and diversity report
 */
export function generateArchitecturalAlternatives(rawInputs, options = {}) {
  const targetCount = Math.max(1, Math.min(5, options.targetAlternatives || options.count || 3));
  const baseSeed = options.seed !== undefined ? options.seed : Date.now();
  const existingHistory = options.history || [];

  // 1. Structured Requirement Checking & Contradiction Detection
  const parsedReq = parseStructuredRequirements(rawInputs);
  if (!parsedReq.valid && parsedReq.errors?.length > 0) {
    return {
      success: false,
      isFeasible: false,
      alternatives: [],
      error: parsedReq.errors.join(' '),
      errors: parsedReq.errors,
      contradictions: parsedReq.contradictions || [],
      unsupportedRequests: parsedReq.unsupportedRequests || [],
      clarificationNeeded: parsedReq.missingInformation?.map(m => `Please provide ${m.field}`) || ['Please resolve conflicting or unsupported requirements.'],
      diversityReport: null
    };
  }

  // 2. Requirement Normalization & Feasibility Check
  const interp = interpretRequirements(rawInputs);
  if (!interp.success) {
    return {
      success: false,
      isFeasible: false,
      alternatives: [],
      error: interp.errors.join(' '),
      errors: interp.errors,
      clarificationNeeded: interp.clarificationNeeded || ['Adjust requirements or plot geometry.'],
      diversityReport: null
    };
  }

  const specs = interp.specs;

  // 3. Physical Boundary Feasibility Check
  const plotW = Number(specs.plotWidth) || 0;
  const plotL = Number(specs.plotLength) || 0;
  if (plotW <= 0 || plotL <= 0 || (plotW * plotL) < 250) {
    return {
      success: false,
      isFeasible: false,
      alternatives: [],
      error: `Plot area of ${plotW * plotL} sq.ft (${plotW}ft × ${plotL}ft) is insufficient to support an architectural residence.`,
      errors: [`Plot dimensions (${plotW}ft × ${plotL}ft) cannot accommodate minimum habitable spaces and municipal setbacks.`],
      clarificationNeeded: ['Provide plot dimensions of at least 20ft × 30ft (600 sq.ft).'],
      diversityReport: null
    };
  }

  // 4. Derive Distinct Architectural Strategies
  const strategies = generateArchitecturalStrategies(specs, {
    count: Math.max(targetCount * 2, 4),
    baseSeed
  });

  const candidatePool = [];
  const candidateErrors = [];

  // 5. Generate Candidate Layouts across Distinct Strategies
  strategies.forEach((strat, stratIdx) => {
    const attemptSeed = baseSeed + (stratIdx * 7919);

    const layout = generateLayout(specs, {
      variationIndex: stratIdx,
      archetype: strat.archetype,
      seed: attemptSeed,
      stairOnRight: strat.stairOnRight,
      porticoOnLeft: strat.porticoOnLeft
    });

    if (!layout || !layout.success) {
      candidateErrors.push(`Strategy ${strat.name}: ${layout?.errors?.join('; ') || 'Infeasible layout'}`);
      return;
    }

    // Validate Constraints
    const validation = layout.validation || validateLayoutConstraints(layout, options);
    if (!validation.isValid) {
      candidateErrors.push(`Strategy ${strat.name} failed constraints: ${validation.violations?.join('; ')}`);
      return;
    }

    // Attach strategy metadata
    layout.strategy = strat;
    candidatePool.push(layout);
  });

  if (candidatePool.length === 0) {
    return {
      success: false,
      isFeasible: false,
      alternatives: [],
      error: `Could not produce any geometrically valid design alternatives satisfying all hard constraints.`,
      errors: candidateErrors,
      clarificationNeeded: ['Increase plot size, decrease required room count, or adjust municipal setbacks.'],
      diversityReport: null
    };
  }

  // 6. Multi-Signal Near-Duplicate Filtering & Diversity Selection
  const diversityResult = filterDiverseCandidates(candidatePool, {
    targetCount,
    existingHistory,
    threshold: 0.82 // Strict 82% architectural diversity threshold
  });

  const acceptedCandidates = diversityResult.accepted.map(a => a.layout);

  if (acceptedCandidates.length === 0) {
    return {
      success: false,
      isFeasible: false,
      alternatives: [],
      error: 'All generated candidates were rejected as near-duplicates or failed diversity criteria.',
      errors: candidateErrors,
      clarificationNeeded: ['Try different architectural style or plot aspect ratio.'],
      diversityReport: diversityResult
    };
  }

  // 7. Score & Rank Accepted Candidates
  const ranked = rankCandidates(acceptedCandidates, specs, options);

  // 8. Enrich Top Alternatives into Complete Canonical Designs (v2.0.0)
  const candidateItems = ranked?.rankedCandidates?.filter(item => item.isValid) || [];
  const canonicalAlternatives = candidateItems.map((item, idx) => {
    const layout = item.candidate;
    const strat = layout.strategy || strategies[idx % strategies.length];
    const seed = layout.seed;
    const variantCode = `LC-${Math.abs(seed % 90000 + 10000)}`;

    const design = createEmptyDesign({
      id: `des-${seed}-${idx + 1}`,
      code: variantCode,
      title: `${strat.style.name} ${specs.bhkCount}BHK (${strat.archetype.replace('_', ' ').toUpperCase()})`,
      seed
    });

    design.inputs = {
      ...specs,
      archStyle: strat.style.id,
      rooflineStyle: strat.rooflineStyle,
      facadeModulation: strat.facadeModulation,
      circulationStrategy: strat.circulationStrategy
    };
    design.site = layout.site;
    design.metrics = layout.metrics;
    design.floors = layout.floors;
    design.structuralGrid = layout.structuralGrid;
    design.strategy = strat;

    // A. 2D CAD Drawings
    design.drawings = generateAllFloorsDrawings(design, options);

    // B. Procedural 3D Building Geometry with Style Rooflines & Chajjas
    const geometry3d = buildProcedural3dGeometry(design, {
      style: strat.style.id,
      rooflineStyle: strat.rooflineStyle,
      facadeModulation: strat.facadeModulation
    });

    design.geometry3d = geometry3d;

    // C. Walkthrough Camera Trajectory
    design.walkthroughTrajectory = planWalkthroughPath(design);

    // D. Deterministic BOQ from Physical Geometry & Materials
    const boq = calculateDeterministicBOQ(design, specs.homeBudgetInr);
    design.boqEstimate = boq;

    // E. Evaluation Report & Scores
    const scores = scoreDesignQuality(layout, specs);
    design.evaluation = {
      isValid: true,
      resultType: 'VALID_ALTERNATIVE',
      candidateStatus: 'VALID',
      constraintViolations: [],
      scores,
      boqCostInr: boq.totalCostInr,
      budgetFeasibilityScore: scores.criteriaScores?.budgetFeasibility || 85,
      fingerprint: computeDesignFingerprint(layout),
      strategy: strat
    };

    return design;
  });

  // 9. Generate Pairwise Architectural Difference Matrix
  const pairwiseDifferences = [];
  for (let i = 0; i < canonicalAlternatives.length; i++) {
    for (let j = i + 1; j < canonicalAlternatives.length; j++) {
      const designA = canonicalAlternatives[i];
      const designB = canonicalAlternatives[j];
      const diff = classifyArchitecturalDifference(designA, designB);

      pairwiseDifferences.push({
        pair: `${designA.code} vs ${designB.code}`,
        designAId: designA.id,
        designBId: designB.id,
        differenceLevel: diff.level,
        structuralSimilarity: diff.similarity,
        isMeaningfullyDifferent: diff.level === ARCHITECTURAL_DIFFERENCE_LEVEL.MEANINGFUL_SPATIAL ||
                                diff.level === ARCHITECTURAL_DIFFERENCE_LEVEL.STRUCTURAL_OR_MASSING,
        reason: diff.reason,
        costDeltaInr: Math.abs(designA.boqEstimate.totalCostInr - designB.boqEstimate.totalCostInr)
      });
    }
  }

  // 10. Assemble Candidate Diversity Report
  const diversityReport = {
    totalEvaluated: candidatePool.length,
    acceptedCount: canonicalAlternatives.length,
    duplicateCount: diversityResult.duplicateCount,
    targetCount,
    isDiverse: pairwiseDifferences.every(p => p.isMeaningfullyDifferent || p.structuralSimilarity < 0.82),
    pairwiseDifferences,
    acceptedSummaries: canonicalAlternatives.map(alt => ({
      id: alt.id,
      code: alt.code,
      title: alt.title,
      archetype: alt.strategy.archetype,
      stairLocation: alt.strategy.circulationStrategy,
      rooflineStyle: alt.strategy.rooflineStyle,
      builtUpAreaSqft: alt.metrics.builtUpAreaSqft,
      estimatedCostInr: alt.boqEstimate.totalCostInr,
      compositeScore: alt.evaluation.scores.overallScore,
      fingerprint: alt.evaluation.fingerprint
    }))
  };

  return {
    success: true,
    isFeasible: true,
    count: canonicalAlternatives.length,
    alternatives: canonicalAlternatives,
    diversityReport
  };
}
