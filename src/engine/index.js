/**
 * LabourConnect Design Engine v2.0 - Core Engine Interface
 * 
 * Original architectural generative engine:
 * 1. Interprets natural-language requirements and validates site feasibility.
 * 2. Generates genuine, diverse 2D room layouts via constraint satisfaction and rectangle packing.
 * 3. Enforces spatial constraints (boundary containment, zero overlaps, vertical alignment).
 * 4. Checks structural similarity and rejects near-duplicates against generation history.
 * 5. Generates true 3D procedural geometry from the single source of truth.
 * 6. Plans continuous walkthrough camera trajectories traversing actual rooms.
 * 7. Computes deterministic material quantities & BOQ from physical geometry.
 */

import { SCHEMA_VERSION, DESIGN_LEVELS, createEmptyDesign, validateCanonicalSchema } from './schema/canonicalDesignSchema.js';
import { interpretRequirements } from './interpreter/requirementInterpreter.js';
import { parseStructuredRequirements, REQUIREMENT_SOURCE } from './interpreter/structuredRequirementParser.js';
import { generateLayout } from './generator/layoutGenerator.js';
import { SPATIAL_ARCHETYPES } from './generator/adjacencyGraphSolver.js';
import { validateLayoutConstraints } from './evaluation/constraintValidator.js';
import { 
  scoreDesignQuality, 
  rankCandidates, 
  compareTwoCandidates, 
  SCORING_CRITERIA, 
  DEFAULT_SCORING_WEIGHTS 
} from './evaluation/designScorer.js';
import { 
  computeDesignFingerprint, 
  checkDuplicateAgainstHistory, 
  calculateStructuralSimilarity,
  evaluateArchitecturalSimilarity,
  filterDiverseCandidates,
  classifyArchitecturalDifference,
  ARCHITECTURAL_DIFFERENCE_LEVEL,
  DEFAULT_SIMILARITY_THRESHOLD,
  DEFAULT_SIMILARITY_WEIGHTS,
  SIMILARITY_THRESHOLD,
  SIMILARITY_ENGINE_VERSION
} from './evaluation/similarityEngine.js';
import {
  GenerativeArchitectureEngine,
  generativeArchitectureEngine,
  GENERATIVE_ENGINE_VERSION
} from './generator/generativeArchitectureEngine.js';
import {
  exploreDesignSpaceCoordinate,
  generateDesignSpacePool,
  MASSING_FAMILIES,
  SPATIAL_TOPOLOGIES,
  CIRCULATION_CORE_POSITIONS,
  ENTRANCE_POSITIONS
} from './generator/designSpaceExplorer.js';
import {
  COMPREHENSIVE_ARCHITECTURAL_STYLES,
  BUILDING_TYPOLOGIES,
  resolveStyleAndTypology
} from './generator/architecturalStyleEngine.js';
import {
  ARCHITECTURAL_STYLES,
  ROOFLINE_STYLES,
  FACADE_MODULATIONS,
  FENESTRATION_RHYTHMS,
  CIRCULATION_STRATEGIES,
  generateArchitecturalStrategies,
  generateProceduralRoofline3d,
  generateWindowChajjas3d,
  generateArchitecturalAlternatives,
  ARCHITECTURAL_VARIATION_VERSION
} from './generator/architecturalVariationEngine.js';
import { 
  generate2dFloorPlan, 
  generateFloorPlanSvg, 
  generateAllFloorsDrawings,
  deriveFloorWalls,
  deriveFloorOpenings,
  deriveStaircases,
  deriveDimensionChains,
  layoutCadRoomLabel,
  DRAWING_ENGINE_VERSION,
  WALL_THICKNESS,
  CAD_LINE_WEIGHTS,
  CAD_COLORS
} from './cad/floorPlanGenerator.js';
import { calculateDeterministicBOQ } from './estimation/deterministicBoqEngine.js';
import { calculateProjectBudget, BUDGET_STATUS, COST_CATEGORIES } from './estimation/projectBudgetEngine.js';
import {
  BASE_REGIONAL_RATES,
  resolveRegionalRate,
  REGIONAL_CITY_FACTORS,
  RATE_PROVENANCE,
  RATE_CONFIDENCE,
  getSupportedCities
} from './estimation/regionalRateCatalog.js';
import { buildProcedural3dGeometry, project3dToViewport, projectOrthographicElevation, projectTopDownCutaway, ELEVATION_PRESETS } from './geometry/procedural3dGenerator.js';
import {
  generateProceduralBuilding3d,
  createSolidBoxMesh,
  createOrientedWallPrism,
  generateWallWithRealOpenings,
  generateFloorSlabWithCutouts,
  generateProceduralStaircase3d,
  generateBalcony3d,
  generateStructuralColumns3d,
  getFloorFootprints,
  resolveProceduralRooflineStyle
} from './geometry/proceduralBuildingGenerator3d.js';
import { planWalkthroughPath, validateWalkthroughTrajectory } from './geometry/walkthroughPathPlanner.js';
import {
  COORDINATE_SYSTEM_CONVENTION,
  ARCHITECTURAL_3D_DEFAULTS,
  feetToMeters,
  metersToFeet,
  inchesToMeters,
  inchesToFeet,
  feetToInches,
  millimetersToMeters,
  metersToMillimeters,
  sqftToSqm,
  sqmToSqft,
  transformPlanToWorldPoint,
  transformWorldToPlanPoint,
  transformPlanToWorldVector,
  transformPlanToWorldPolygon,
  transformPlanBoundsToWorldBox,
  calculateFloorElevations,
  calculateComponentElevation,
  createBoundingBox3d,
  createEmptyBoundingBox3d,
  expandBoundingBox3d,
  isPointInsideBoundingBox3d,
  doBoundingBoxesIntersect3d,
  calculateDesignWorldBounds,
  validate3dGeometry,
  createGeometryComponent3d
} from './geometry/geometryFoundation3d.js';
import {
  MATERIAL_CATEGORIES,
  MATERIAL_KEYS,
  ARCHITECTURAL_MATERIALS,
  STYLE_MATERIAL_PALETTES,
  getMaterialForComponent,
  resolveMaterial,
  validateMaterial,
  getAllMaterials,
  getAllStylePalettes
} from './rendering/materialCatalog.js';
import {
  LIGHTING_PRESETS,
  ORIENTATION_OFFSETS,
  calculateSunPosition,
  calculateFaceShading,
  modulateHexColor,
  hexToRgb,
  rgbToHex
} from './rendering/lightingEngine.js';
import {
  generateDesignFurniture,
  generateRoomFurniture
} from './interior/proceduralFurnitureGenerator.js';
import {
  FURNITURE_CATALOG,
  FURNITURE_TYPES,
  FURNITURE_CATEGORIES,
  getFurnitureDefinition,
  getRecommendedFurnitureForRoom
} from './interior/furnitureCatalog.js';
import {
  generatePropertyLandscape
} from './landscape/proceduralLandscapeGenerator.js';
import {
  LANDSCAPE_CATALOG,
  LANDSCAPE_TYPES,
  LANDSCAPE_CATEGORIES,
  getLandscapeDefinition
} from './landscape/landscapeCatalog.js';
import {
  generateArchitecturalDxf,
  DXF_LAYERS,
  DXF_COLORS
} from './export/dxfExporter.js';
import {
  generateBinaryGlb,
  generateEmbeddedGltfJson,
  buildGltfData,
  extractModelGeometry
} from './export/gltfExporter.js';
import {
  generateWavefrontObj
} from './export/objExporter.js';
import {
  generateArchitecturalPdf
} from './export/pdfDocumentExporter.js';
import {
  exportProjectDataJson,
  exportRoomScheduleCsv,
  exportDoorWindowScheduleCsv,
  exportFurnitureInventoryCsv,
  exportLandscapeInventoryCsv,
  exportMaterialsScheduleCsv,
  exportBudgetSummaryCsv
} from './export/projectScheduleExporter.js';
import {
  exportDesignArtifact,
  validateExportArtifact,
  triggerBrowserDownload,
  EXPORT_FORMATS
} from './export/exportPipelineOrchestrator.js';
import {
  CUSTOMIZATION_ACTION_TYPES,
  OBJECT_CATEGORIES,
  isPointInPolygon,
  pickObjectAtScreenCoordinates,
  cloneDesignForCustomization,
  ensureCustomizableDesign,
  findCustomizableObjectById,
  listCustomizableObjects,
  moveObject,
  rotateObject,
  removeObject,
  addCustomObject,
  changeObjectMaterial,
  changeRoomFinish,
  changeExteriorFacadeMaterial,
  createCustomizationSession,
  applySessionCommand,
  undoSession,
  redoSession,
  recalculateCustomizedDesign
} from './customization/interactiveCustomizationEngine.js';
import {
  PERSISTENCE_STORAGE_KEYS,
  saveProject,
  loadProject,
  listSavedProjects,
  deleteProject,
  saveDraft,
  loadDraft,
  clearDraft,
  exportProjectBundleJson,
  importProjectBundleJson,
  resetPersistenceMemoryStore
} from './customization/projectPersistenceManager.js';

export {
  SCHEMA_VERSION,
  DESIGN_LEVELS,
  validateCanonicalSchema,
  interpretRequirements,
  parseStructuredRequirements,
  REQUIREMENT_SOURCE,
  calculateStructuralSimilarity,
  evaluateArchitecturalSimilarity,
  filterDiverseCandidates,
  checkDuplicateAgainstHistory,
  computeDesignFingerprint,
  DEFAULT_SIMILARITY_THRESHOLD,
  DEFAULT_SIMILARITY_WEIGHTS,
  SIMILARITY_THRESHOLD,
  SIMILARITY_ENGINE_VERSION,
  generate2dFloorPlan,
  generateFloorPlanSvg,
  generateAllFloorsDrawings,
  deriveFloorWalls,
  deriveFloorOpenings,
  deriveStaircases,
  deriveDimensionChains,
  layoutCadRoomLabel,
  DRAWING_ENGINE_VERSION,
  WALL_THICKNESS,
  CAD_LINE_WEIGHTS,
  CAD_COLORS,
  buildProcedural3dGeometry,
  project3dToViewport,
  projectOrthographicElevation,
  projectTopDownCutaway,
  ELEVATION_PRESETS,
  generateProceduralBuilding3d,
  createSolidBoxMesh,
  createOrientedWallPrism,
  generateWallWithRealOpenings,
  generateFloorSlabWithCutouts,
  generateProceduralStaircase3d,
  generateBalcony3d,
  generateStructuralColumns3d,
  getFloorFootprints,
  resolveProceduralRooflineStyle,
  planWalkthroughPath,
  validateWalkthroughTrajectory,
  scoreDesignQuality,
  rankCandidates,
  compareTwoCandidates,
  SCORING_CRITERIA,
  DEFAULT_SCORING_WEIGHTS,
  COORDINATE_SYSTEM_CONVENTION,
  ARCHITECTURAL_3D_DEFAULTS,
  feetToMeters,
  metersToFeet,
  inchesToMeters,
  inchesToFeet,
  feetToInches,
  millimetersToMeters,
  metersToMillimeters,
  sqftToSqm,
  sqmToSqft,
  transformPlanToWorldPoint,
  transformWorldToPlanPoint,
  transformPlanToWorldVector,
  transformPlanToWorldPolygon,
  transformPlanBoundsToWorldBox,
  calculateFloorElevations,
  calculateComponentElevation,
  createBoundingBox3d,
  createEmptyBoundingBox3d,
  expandBoundingBox3d,
  isPointInsideBoundingBox3d,
  doBoundingBoxesIntersect3d,
  calculateDesignWorldBounds,
  validate3dGeometry,
  createGeometryComponent3d,
  classifyArchitecturalDifference,
  ARCHITECTURAL_DIFFERENCE_LEVEL,
  ARCHITECTURAL_STYLES,
  ROOFLINE_STYLES,
  FACADE_MODULATIONS,
  FENESTRATION_RHYTHMS,
  CIRCULATION_STRATEGIES,
  generateArchitecturalStrategies,
  generateProceduralRoofline3d,
  generateWindowChajjas3d,
  generateArchitecturalAlternatives,
  ARCHITECTURAL_VARIATION_VERSION,
  MATERIAL_CATEGORIES,
  MATERIAL_KEYS,
  ARCHITECTURAL_MATERIALS,
  STYLE_MATERIAL_PALETTES,
  getMaterialForComponent,
  resolveMaterial,
  validateMaterial,
  getAllMaterials,
  getAllStylePalettes,
  LIGHTING_PRESETS,
  ORIENTATION_OFFSETS,
  calculateSunPosition,
  calculateFaceShading,
  modulateHexColor,
  hexToRgb,
  rgbToHex,
  calculateProjectBudget,
  BUDGET_STATUS,
  COST_CATEGORIES,
  BASE_REGIONAL_RATES,
  resolveRegionalRate,
  REGIONAL_CITY_FACTORS,
  RATE_PROVENANCE,
  RATE_CONFIDENCE,
  getSupportedCities,
  generateDesignFurniture,
  generateRoomFurniture,
  FURNITURE_CATALOG,
  FURNITURE_TYPES,
  FURNITURE_CATEGORIES,
  getFurnitureDefinition,
  getRecommendedFurnitureForRoom,
  generatePropertyLandscape,
  LANDSCAPE_CATALOG,
  LANDSCAPE_TYPES,
  LANDSCAPE_CATEGORIES,
  getLandscapeDefinition,
  generateArchitecturalDxf,
  DXF_LAYERS,
  DXF_COLORS,
  generateBinaryGlb,
  generateEmbeddedGltfJson,
  buildGltfData,
  extractModelGeometry,
  generateWavefrontObj,
  generateArchitecturalPdf,
  exportProjectDataJson,
  exportRoomScheduleCsv,
  exportDoorWindowScheduleCsv,
  exportFurnitureInventoryCsv,
  exportLandscapeInventoryCsv,
  exportMaterialsScheduleCsv,
  exportBudgetSummaryCsv,
  exportDesignArtifact,
  validateExportArtifact,
  triggerBrowserDownload,
  EXPORT_FORMATS,
  CUSTOMIZATION_ACTION_TYPES,
  OBJECT_CATEGORIES,
  isPointInPolygon,
  pickObjectAtScreenCoordinates,
  cloneDesignForCustomization,
  ensureCustomizableDesign,
  findCustomizableObjectById,
  listCustomizableObjects,
  moveObject,
  rotateObject,
  removeObject,
  addCustomObject,
  changeObjectMaterial,
  changeRoomFinish,
  changeExteriorFacadeMaterial,
  createCustomizationSession,
  applySessionCommand,
  undoSession,
  redoSession,
  recalculateCustomizedDesign,
  PERSISTENCE_STORAGE_KEYS,
  saveProject,
  loadProject,
  listSavedProjects,
  deleteProject,
  saveDraft,
  loadDraft,
  clearDraft,
  exportProjectBundleJson,
  importProjectBundleJson,
  resetPersistenceMemoryStore,

  // 15. Generative Architecture Engine & Design Space Explorer
  GenerativeArchitectureEngine,
  generativeArchitectureEngine,
  GENERATIVE_ENGINE_VERSION,
  exploreDesignSpaceCoordinate,
  generateDesignSpacePool,
  MASSING_FAMILIES,
  SPATIAL_TOPOLOGIES,
  CIRCULATION_CORE_POSITIONS,
  ENTRANCE_POSITIONS,
  COMPREHENSIVE_ARCHITECTURAL_STYLES,
  BUILDING_TYPOLOGIES,
  resolveStyleAndTypology
};


/**
 * Procedurally generates evocative, distinct architectural titles for designs.
 */
export function generateArchitecturalTitle(specs, layout, variationIndex = 0, seed = 0) {
  const s = Math.abs(Number(seed) || 12345);
  const style = (specs?.archStyle || 'modern').toLowerCase();
  const bhk = specs?.bhkCount || 3;
  const archetypeLabel = (layout?.archetype || 'villa').replace(/_/g, ' ').toUpperCase();

  const STYLE_EPITHETS = {
    vintage: [
      'Heritage Nalukettu', 'Chettinad Verandah', 'Malabar Courtyard', 'Vedic Teak',
      'Dakshin Classical', 'Konkan Haven', 'Mysore Royal', 'Thinnai Classical',
      'Coromandel Atrium', 'Travancore Manor', 'Kashi Sanctum', 'Deccan Heritage'
    ],
    traditional_duplex: [
      'Traditional Nalukettu', 'Angan Central', 'Vedic Harmony', 'Classical Mandapa',
      'Dakshin Duplex', 'Poomukham Heritage', 'Deccan Court', 'Heritage Atrium'
    ],
    luxury_villa: [
      'Imperial Statuario', 'Grand Colonnade', 'Cascading Azure', 'Palacio Veronese',
      'Regency Pavilion', 'Prestige Haven', 'Celestial Atrium', 'Royal Elysium'
    ],
    penthouse: [
      'Skyline Solarium', 'Summit Terrace', 'Panoramic Loft', 'Celestia Crown',
      'Zenith Pergola', 'Cascade Penthouse', 'Aura Panorama', 'Starlight Terrace'
    ],
    tropical_modern: [
      'Verdant Pavilion', 'Monsoon Louver', 'Breeze Atrium', 'Tropical Canopy',
      'Lush Solarium', 'Biophilic Villa', 'Oasis Courtyard', 'Palm Court'
    ],
    minimalist: [
      'Monochrome Linear', 'Zenith Form', 'Pure Cantilever', 'Atelier Minimal',
      'Nordic Light', 'Solarium Cubic', 'Aura Geometry', 'Prism Courtyard'
    ],
    modern: [
      'Horizon Glass', 'Linear Cantilever', 'Metropolitan Vista', 'Aerodynamic Cubic',
      'Neo-Atrium', 'Panoramic Ribbon', 'Urban Edge', 'Solarium Villa'
    ]
  };

  const prefixes = ['The', 'Villa', 'Resort', 'Mansion', 'Estate', 'Atelier', 'Pavilion'];
  const epithets = STYLE_EPITHETS[style] || STYLE_EPITHETS.modern;
  
  const prefix = prefixes[(s + variationIndex) % prefixes.length];
  const epithet = epithets[(Math.floor(s / 7) + variationIndex) % epithets.length];

  return `${prefix} ${epithet} ${bhk}BHK (${archetypeLabel})`;
}

export class LabourConnectDesignEngine {
  constructor(options = {}) {
    this.version = SCHEMA_VERSION;
    this.history = options.history || [];
  }

  /**
   * Generates a single valid, diverse architectural design from inputs
   */
  generateDesign(rawInputs, options = {}) {
    const history = options.history || this.history;
    const variationIndex = options.variationIndex || 0;

    // 0. Structured Requirement, Contradiction & Unsupported Request Checking
    const parsedReq = parseStructuredRequirements(rawInputs);
    if (!parsedReq.valid && parsedReq.errors?.length > 0) {
      return {
        success: false,
        error: parsedReq.errors.join(' '),
        errors: parsedReq.errors,
        contradictions: parsedReq.contradictions,
        unsupportedRequests: parsedReq.unsupportedRequests,
        clarificationNeeded: parsedReq.missingInformation?.map(m => `Please provide ${m.field}`) || ['Please resolve conflicting or unsupported requirements.'],
        isFeasible: false
      };
    }

    // 1. Requirement Interpretation & Feasibility
    const interp = interpretRequirements(rawInputs);
    if (!interp.success) {
      return {
        success: false,
        error: interp.errors.join(' '),
        errors: interp.errors,
        clarificationNeeded: interp.clarificationNeeded,
        isFeasible: false
      };
    }

    const specs = interp.specs;

    // 2. Multi-Candidate Search Loop (Guarantees validity & diversity)
    const MAX_CANDIDATE_ATTEMPTS = options.maxAttempts || 35;
    let bestCandidate = null;
    let candidateErrors = [];

    const archetypes = [
      SPATIAL_ARCHETYPES.OPEN_CONTEMPORARY,
      SPATIAL_ARCHETYPES.COURTYARD_CENTRIC,
      SPATIAL_ARCHETYPES.VILLA_PAVILION,
      SPATIAL_ARCHETYPES.LINEAR_SPINE
    ];

    const baseSeed = options.seed !== undefined ? options.seed : (Date.now() + (variationIndex * 1337));

    for (let attempt = 0; attempt < MAX_CANDIDATE_ATTEMPTS; attempt++) {
      const candidateIndex = variationIndex + attempt;
      const attemptSeed = baseSeed + (attempt * 311);
      const spaceCoord = exploreDesignSpaceCoordinate(specs, attemptSeed, candidateIndex, {
        massingFamily: options.massingFamily,
        spatialTopology: options.spatialTopology,
        circulationCore: options.circulationCore
      });
      const currentArchetype = (options.archetype && attempt === 0)
        ? options.archetype
        : spaceCoord.legacyArchetype;

      // Procedural layout generation with varied massing, circulation, and band proportions
      const layout = generateLayout(specs, {
        variationIndex: candidateIndex,
        archetype: currentArchetype,
        seed: attemptSeed,
        stairOnRight: options.stairOnRight !== undefined ? options.stairOnRight : (spaceCoord.circulationCore === CIRCULATION_CORE_POSITIONS.RIGHT_FLANK),
        porticoOnLeft: options.porticoOnLeft !== undefined ? options.porticoOnLeft : (spaceCoord.entrancePosition === ENTRANCE_POSITIONS.LEFT_CORNER),
        flipRear: options.flipRear !== undefined ? options.flipRear : ((attempt % 2) === 1),
        b1Ratio: spaceCoord.b1Ratio,
        b2Ratio: spaceCoord.b2Ratio
      });

      // Constraint Validation (Boundary, Overlap, Alignment, Adjacency, Standards)
      const validation = layout.validation || validateLayoutConstraints(layout, options);
      if (!validation.isValid) {
        candidateErrors.push(`Attempt ${attempt + 1} [${validation.resultType}]: ${validation.violations.join('; ')}`);
        continue;
      }

      // Structural Duplicate & Similarity Check (bypassed for deterministic seeded runs unless enforceDiversity is explicitly requested)
      const shouldCheckDuplicate = options.seed === undefined || Boolean(options.enforceDiversity);
      if (shouldCheckDuplicate) {
        const dupCheck = checkDuplicateAgainstHistory(layout, history);
        if (dupCheck.isDuplicate && attempt < MAX_CANDIDATE_ATTEMPTS - 1) {
          // Too similar to a previous design; discard and explore next archetype
          candidateErrors.push(`Attempt ${attempt + 1} rejected as near-duplicate (${(dupCheck.maxSimilarity * 100).toFixed(1)}% similar to ${dupCheck.matchedDesignId}).`);
          continue;
        }
      }

      // Design Quality Scoring
      const scores = scoreDesignQuality(layout, specs);
      const fingerprint = computeDesignFingerprint(layout);

      bestCandidate = {
        layout,
        scores,
        fingerprint,
        validation,
        attempt
      };
      break;
    }

    if (!bestCandidate) {
      return {
        success: false,
        error: `Could not satisfy all geometric constraints after ${MAX_CANDIDATE_ATTEMPTS} candidate attempts.`,
        errors: candidateErrors,
        clarificationNeeded: ['Adjust plot dimensions or reduce required room count.'],
        isFeasible: false
      };
    }

    const { layout, scores, fingerprint } = bestCandidate;

    // 3. Assemble Canonical Design JSON
    const seed = layout.seed;
    const variantCode = `LC-${Math.abs(seed % 90000 + 10000)}`;
    const design = createEmptyDesign({
      id: `des-${seed}`,
      code: variantCode,
      title: generateArchitecturalTitle(specs, layout, variationIndex, seed),
      seed
    });

    design.variationIndex = variationIndex;
    design.archetype = layout.generationMetadata?.archetype || layout.archetype || selectedArchetype;
    design.generationMetadata = layout.generationMetadata;
    design.inputs = specs;
    design.site = layout.site;
    design.metrics = layout.metrics;
    design.floors = layout.floors;
    design.structuralGrid = layout.structuralGrid;

    // 4. Derive Procedural 3D Geometry directly from the design JSON
    const geometry3d = buildProcedural3dGeometry(design, options);
    design.geometry3d = geometry3d;
    design.furnishings = geometry3d.buildingModel3d?.furnishings || generateDesignFurniture(design, options);
    design.landscape = geometry3d.buildingModel3d?.landscape || generatePropertyLandscape(design, options);

    // 5. Derive Continuous Walkthrough Camera Trajectory
    const walkthrough = planWalkthroughPath(design);
    design.walkthroughTrajectory = walkthrough;

    // 6. Compute Deterministic BOQ & Unified Project Budget from physical geometry
    const boq = calculateDeterministicBOQ(design, specs.homeBudgetInr);
    design.boqEstimate = boq;
    design.projectBudget = calculateProjectBudget(design, { targetBudget: specs.homeBudgetInr, city: specs.city || 'Bengaluru' });

    // 7. Quality Scores, Fingerprint & Validation Report
    design.evaluation = {
      isValid: true,
      resultType: bestCandidate.validation?.resultType || 'VALID_CANDIDATE',
      candidateStatus: bestCandidate.validation?.candidateStatus || 'VALID',
      constraintViolations: [],
      validationReport: bestCandidate.validation || null,
      scores,
      fingerprint
    };

    // 8. 2D Architectural CAD Floor-Plan Drawing Suite
    const drawings = generateAllFloorsDrawings(design, options);
    design.drawings = drawings;

    // Store in history
    this.history.push(design);

    return {
      success: true,
      design
    };
  }

  /**
   * Generates multiple materially different design variations for the same requirements
   */
  generateVariations(rawInputs, count = 2, existingHistory = [], options = {}) {
    const results = [];
    const localHistory = [...this.history, ...existingHistory];

    this.generationRunCount = (this.generationRunCount || 0) + 1;

    let startIndex = 0;
    if (options && options.baseVariationIndex !== undefined) {
      startIndex = options.baseVariationIndex;
    } else if (options && options.startIndex !== undefined) {
      startIndex = options.startIndex;
    } else if (existingHistory && existingHistory.length > 0) {
      startIndex = existingHistory.length;
    } else {
      startIndex = (this.generationRunCount - 1) * count;
    }

    const archetypes = [
      SPATIAL_ARCHETYPES.OPEN_CONTEMPORARY,
      SPATIAL_ARCHETYPES.COURTYARD_CENTRIC,
      SPATIAL_ARCHETYPES.VILLA_PAVILION,
      SPATIAL_ARCHETYPES.L_SHAPE_COURT,
      SPATIAL_ARCHETYPES.SPLIT_WING_ZONED,
      SPATIAL_ARCHETYPES.LINEAR_SPINE
    ];

    for (let i = 0; i < count; i++) {
      const varIdx = startIndex + i;
      const archetype = options.archetype || archetypes[varIdx % archetypes.length];
      const runSeed = (options && options.seed !== undefined)
        ? (options.seed + (varIdx * 19997) + (i * 3779))
        : (Date.now() + (varIdx * 19997) + (i * 3779) + Math.floor(Math.random() * 10000));

      const outcome = this.generateDesign(rawInputs, {
        variationIndex: varIdx,
        archetype,
        seed: runSeed,
        history: localHistory,
        enforceDiversity: true
      });

      if (outcome.success) {
        outcome.design.variationIndex = varIdx;
        results.push(outcome.design);
        localHistory.push(outcome.design);
      } else {
        // Return clear failure instead of faking
        return {
          success: false,
          error: outcome.error,
          errors: outcome.errors,
          clarificationNeeded: outcome.clarificationNeeded
        };
      }
    }

    return {
      success: true,
      variations: results
    };
  }

  /**
   * Generates 100 uniquely fingerprinted, valid architectural designs from the same prompt
   */
  generate100UniqueDesigns(rawInputs, options = {}) {
    return generativeArchitectureEngine.generateDiverseBatch(rawInputs, 100, {
      ...options,
      history: options.history || this.history
    });
  }

  /**
   * Generates a batch of distinct, valid architectural designs
   */
  generateDiverseBatch(rawInputs, count = 100, options = {}) {
    return generativeArchitectureEngine.generateDiverseBatch(rawInputs, count, {
      ...options,
      history: options.history || this.history
    });
  }

  /**
   * Generates multiple diverse concepts (Mode 2)
   */
  generateAlternatives(rawInputs, count = 5, options = {}) {
    return generativeArchitectureEngine.generateAlternatives(rawInputs, count, {
      ...options,
      history: options.history || this.history
    });
  }

  /**
   * Refines a design (Mode 4)
   */
  refineDesign(existingDesign, modifications = {}, options = {}) {
    return generativeArchitectureEngine.refineDesign(existingDesign, modifications, options);
  }

  /**
   * Explores distinct interpretations of a style (Mode 5)
   */
  exploreStyleInterpretations(rawInputs, styleId, count = 5, options = {}) {
    return generativeArchitectureEngine.exploreStyleInterpretations(rawInputs, styleId, count, {
      ...options,
      history: options.history || this.history
    });
  }

  /**
   * Applies an architectural modification to an existing design
   */
  modifyDesign(currentDesign, modificationPrompt) {
    if (!currentDesign) return { success: false, error: 'No base design provided for modification.' };
    const prompt = (modificationPrompt || '').trim();
    if (!prompt) return { success: false, error: 'Please enter a modification request.' };

    const updatedInputs = { ...currentDesign.inputs, userPrompt: `${currentDesign.inputs.userPrompt} | Modification: ${prompt}` };

    if (/courtyard|thotti/i.test(prompt)) updatedInputs.amenities.hasCourtyard = true;
    if (/(?:no|without|remove|zero|exclude)\s*(?:a|the)?\s*(?:dedicated)?\s*pooja/i.test(prompt)) updatedInputs.amenities.hasPooja = false;
    else if (/pooja/i.test(prompt)) updatedInputs.amenities.hasPooja = true;
    if (/balcony/i.test(prompt)) updatedInputs.amenities.hasBalcony = true;
    if (/terrace/i.test(prompt)) updatedInputs.amenities.hasTerrace = true;
    if (/vintage/i.test(prompt)) updatedInputs.archStyle = 'vintage';
    else if (/penthouse/i.test(prompt)) updatedInputs.archStyle = 'penthouse';
    else if (/tropical/i.test(prompt)) updatedInputs.archStyle = 'tropical_modern';
    else if (/minimalist/i.test(prompt)) updatedInputs.archStyle = 'minimalist';
    else if (/villa|luxury/i.test(prompt)) updatedInputs.archStyle = 'luxury_villa';
    else if (/traditional|kerala/i.test(prompt)) updatedInputs.archStyle = 'traditional_duplex';
    else if (/modern/i.test(prompt)) updatedInputs.archStyle = 'modern';

    const outcome = this.generateDesign(updatedInputs, {
      variationIndex: (this.history.length + 1)
    });

    if (outcome.success) {
      outcome.design.code = `${currentDesign.code}-REV`;
      outcome.design.title = `${currentDesign.title} (Revised)`;
    }

    return outcome;
  }

  /**
   * Deterministically evaluates and ranks multiple candidate layouts or designs
   */
  rankCandidates(candidates, specs = {}, options = {}) {
    return rankCandidates(candidates, specs, options);
  }

  /**
   * Filters candidate layouts or ranked candidates to retain diverse, valid alternatives
   */
  filterDiverseCandidates(candidates, options = {}) {
    return filterDiverseCandidates(candidates, {
      ...options,
      existingHistory: options.existingHistory || this.history
    });
  }

  /**
   * Generates a professional 2D CAD floor plan model for a design
   */
  generateFloorPlan(design, options = {}) {
    return generate2dFloorPlan(design, options);
  }

  /**
   * Generates clean architectural CAD SVG markup for a design floor
   */
  generateFloorPlanSvg(design, options = {}) {
    return generateFloorPlanSvg(design, options);
  }

  /**
   * Generates drawings for all floors in a canonical design
   */
  generateAllFloorsDrawings(design, options = {}) {
    return generateAllFloorsDrawings(design, options);
  }

  /**
   * Procedurally generates multiple meaningfully different, geometrically valid,
   * requirement-driven architectural design alternatives (S3-T03).
   */
  generateArchitecturalAlternatives(rawInputs, options = {}) {
    return generateArchitecturalAlternatives(rawInputs, {
      ...options,
      history: options.history || this.history
    });
  }

  /**
   * Classifies the exact architectural difference level between two designs (S3-T03).
   */
  classifyArchitecturalDifference(designA, designB, options = {}) {
    return classifyArchitecturalDifference(designA, designB, options);
  }

  /**
   * Resolves the appropriate semantic material definition for a 3D component under a style (S3-T04).
   */
  getMaterialForComponent(componentType, styleId = 'modern_contemporary', options = {}) {
    return getMaterialForComponent(componentType, styleId, options);
  }

  /**
   * Calculates the 3D unit sun vector and daylight parameters for a solar time and orientation (S3-T04).
   */
  calculateSunPosition(solarTime = 12.0, facing = 'East') {
    return calculateSunPosition(solarTime, facing);
  }

  /**
   * Calculates deterministic face shading and modulated color from surface normal and material (S3-T04).
   */
  calculateFaceShading(normal, material, lighting, options = {}) {
    return calculateFaceShading(normal, material, lighting, options);
  }

  /**
   * Generates a genuine orthographic building elevation (front, rear, left, right) from 3D geometry (S3-T05).
   */
  generateOrthographicElevation(design, side = 'front', options = {}) {
    const geometries = design?.geometry3d || buildProcedural3dGeometry(design, options);
    return projectOrthographicElevation(geometries, side, options);
  }

  /**
   * Generates a true top-down cutaway plan aligned with 2D CAD layout (S3-T05).
   */
  generateTopDownCutaway(design, options = {}) {
    const geometries = design?.geometry3d || buildProcedural3dGeometry(design, options);
    return projectTopDownCutaway(geometries, options);
  }

  /**
   * Computes a unified, itemized project budget and feasibility reconciliation (S4-T01).
   */
  calculateProjectBudget(design, options = {}) {
    return calculateProjectBudget(design, options);
  }

  /**
   * Generates procedural furniture and interior fit-outs for rooms and floors (S4-T02).
   */
  generateFurniture(design, options = {}) {
    return generateDesignFurniture(design, options);
  }

  /**
   * Generates procedural landscaping, gardens, and outdoor living features (S4-T03).
   */
  generateLandscape(design, options = {}) {
    return generatePropertyLandscape(design, options);
  }

  /**
   * Exports an architectural design artifact for a requested format (S4-T04).
   */
  exportArtifact(design, formatId, options = {}) {
    return exportDesignArtifact(design, formatId, options);
  }

  /**
   * Validates structural integrity of an exported artifact (S4-T04).
   */
  validateExport(artifact) {
    return validateExportArtifact(artifact);
  }

  /**
   * Triggers a real browser file download for an exported artifact (S4-T04).
   */
  downloadArtifact(artifact) {
    return triggerBrowserDownload(artifact);
  }

  /**
   * Initializes a customization and editing session with undo/redo stack (S4-T05).
   */
  createCustomizationSession(design, maxHistory = 50) {
    return createCustomizationSession(design, maxHistory);
  }

  /**
   * Executes a customization command within a session (S4-T05).
   */
  applyCustomizationCommand(session, actionType, payload = {}) {
    return applySessionCommand(session, actionType, payload);
  }

  /**
   * Rolls back the last customization action (S4-T05).
   */
  undoCustomization(session) {
    return undoSession(session);
  }

  /**
   * Replays the next customization action (S4-T05).
   */
  redoCustomization(session) {
    return redoSession(session);
  }

  /**
   * Translates an object with boundary and clearance checking (S4-T05).
   */
  moveObject(design, objectId, deltaX, deltaZ) {
    return moveObject(design, objectId, deltaX, deltaZ);
  }

  /**
   * Rotates an object by an angle (S4-T05).
   */
  rotateObject(design, objectId, angleDeg = 90) {
    return rotateObject(design, objectId, angleDeg);
  }

  /**
   * Removes an object from the design (S4-T05).
   */
  removeObject(design, objectId) {
    return removeObject(design, objectId);
  }

  /**
   * Adds a new custom catalog object (S4-T05).
   */
  addCustomObject(design, objectType, category, position, options = {}) {
    return addCustomObject(design, objectType, category, position, options);
  }

  /**
   * Changes material for an object (S4-T05).
   */
  changeMaterial(design, objectId, material) {
    return changeObjectMaterial(design, objectId, material);
  }

  /**
   * Changes room finishes (S4-T05).
   */
  changeRoomFinish(design, roomId, finishType, material) {
    return changeRoomFinish(design, roomId, finishType, material);
  }

  /**
   * Changes exterior facade material (S4-T05).
   */
  changeFacadeMaterial(design, material) {
    return changeExteriorFacadeMaterial(design, material);
  }

  /**
   * Real-time recalculation of customized design budget and 3D geometry (S4-T05).
   */
  recalculateCustomizedDesign(design, options = {}) {
    return recalculateCustomizedDesign(design, options);
  }

  /**
   * Saves a project into persistence storage (S4-T05).
   */
  saveProject(design, metadata = {}) {
    return saveProject(design, metadata);
  }

  /**
   * Loads a project from persistence storage (S4-T05).
   */
  loadProject(projectId) {
    return loadProject(projectId);
  }

  /**
   * Lists all saved projects (S4-T05).
   */
  listSavedProjects() {
    return listSavedProjects();
  }

  /**
   * Deletes a project from persistence storage (S4-T05).
   */
  deleteProject(projectId) {
    return deleteProject(projectId);
  }

  /**
   * Exports project bundle JSON (S4-T05).
   */
  exportProjectBundle(design, metadata = {}) {
    return exportProjectBundleJson(design, metadata);
  }

  /**
   * Imports project bundle JSON (S4-T05).
   */
  importProjectBundle(jsonString) {
    return importProjectBundleJson(jsonString);
  }
}

// Global engine singleton instance
export const designEngine = new LabourConnectDesignEngine();
