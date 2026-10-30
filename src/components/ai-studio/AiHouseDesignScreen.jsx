import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Layers,
  Box,
  Square,
  Video,
  Eye,
  Upload,
  Camera,
  Download,
  Share2,
  CheckCircle2,
  Compass,
  Building2,
  Ruler,
  Sun,
  Moon,
  Sunrise,
  Sunset,
  Play,
  Pause,
  RotateCcw,
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck,
  Check,
  ArrowRight,
  Info,
  Maximize2,
  Flame,
  Zap,
  Home,
  FileCheck,
  Edit3,
  X,
  Plus,
  RefreshCw,
  Sliders,
  DollarSign,
  Palette,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  Trash2,
  ImageIcon,
  Grid,
  FileText
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  generateHouseDesignVariation,
  ARCHITECTURAL_STYLES,
  REFERENCE_3D_ISOMETRICS,
  REFERENCE_ELEVATIONS
} from '../../data/houseDesignGenerator';
import { analyzeArchitecturalPrompt } from '../../utils/promptArchitectureAnalyzer';
import Realistic2dDesignStudio from './Realistic2dDesignStudio';
import Architectural2dAllAnglesViewer from './Architectural2dAllAnglesViewer';
import Interactive3dEngine from './Interactive3dEngine';
import CinematicWalkthroughStudio from './CinematicWalkthroughStudio';
import Visuals5dStudio from './Visuals5dStudio';
import StructuralMepModal from './StructuralMepModal';
import BoqLiveIndianRatesModal from './BoqLiveIndianRatesModal';
import VaastuReportModal from './VaastuReportModal';
import { interpretRequirements } from '../../engine/interpreter/requirementInterpreter';
import { designEngine } from '../../engine/index';
import MunicipalComplianceModal from '../compliance/MunicipalComplianceModal';
import ExportDocumentationModal from './ExportDocumentationModal';

export default function AiHouseDesignScreen({
  onPostProject,
  onNavigate,
  currentUserRole = 'Customer',
  onOpenAuthModal
}) {
  // =========================================================================
  // WORKSPACE SELECTOR: 'home' (Design My Home) vs 'interior' (Interior Design)
  // =========================================================================
  const [activeWorkspace, setActiveWorkspace] = useState('home');

  // =========================================================================
  // WORKSPACE A: DESIGN MY HOME STATE
  // =========================================================================
  const [homePrompt, setHomePrompt] = useState(
    'I want a modern two-storey 3BHK house on a 40x60 ft plot, with a pooja room, open kitchen, balcony, car parking, and a contemporary exterior. My budget is ₹45 lakh.'
  );
  const [plotWidth, setPlotWidth] = useState(40);
  const [plotLength, setPlotLength] = useState(60);
  const [dimensionUnit, setDimensionUnit] = useState('feet'); // 'feet' | 'metres'
  const [floorsCount, setFloorsCount] = useState(2);
  const [bhkCount, setBhkCount] = useState(3);
  const [bathroomsCount, setBathroomsCount] = useState(3);
  const [archStyle, setArchStyle] = useState('modern');
  const [facingDirection, setFacingDirection] = useState('East');
  const [homeBudgetInr, setHomeBudgetInr] = useState(4500000);
  const [showAdditionalReqs, setShowAdditionalReqs] = useState(false);

  // Additional options
  const [hasPooja, setHasPooja] = useState(true);
  const [hasParking, setHasParking] = useState(true);
  const [hasBalcony, setHasBalcony] = useState(true);
  const [hasCourtyard, setHasCourtyard] = useState(false);
  const [hasSolarPergola, setHasSolarPergola] = useState(true);
  const [kitchenType, setKitchenType] = useState('open_modular');

  // Requirement Analysis & Pipeline State
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [isRequirementConfirmed, setIsRequirementConfirmed] = useState(false);
  const [validatedSpecs, setValidatedSpecs] = useState(null);
  const [extractedAnalysis, setExtractedAnalysis] = useState(() => analyzeArchitecturalPrompt(homePrompt));

  // Modals State
  const [isStructuralModalOpen, setIsStructuralModalOpen] = useState(false);
  const [isBoqModalOpen, setIsBoqModalOpen] = useState(false);
  const [isVaastuModalOpen, setIsVaastuModalOpen] = useState(false);
  const [isMunicipalModalOpen, setIsMunicipalModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Feasibility & Engineering Warnings
  const [feasibilityErrors, setFeasibilityErrors] = useState(null);
  const [feasibilityWarnings, setFeasibilityWarnings] = useState([]);

  // Generative Variations Backend State
  const [isGeneratingHome, setIsGeneratingHome] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [hasGeneratedHome, setHasGeneratedHome] = useState(false);
  const [generatedVariations, setGeneratedVariations] = useState([]);
  const [activeVariationIdx, setActiveVariationIdx] = useState(0);
  const [activeHomeResultTab, setActiveHomeResultTab] = useState('2d_design'); // ONLY: '2d_design', '3d_design', 'walkthrough'

  // Persistent generation session run counter ensuring non-repeating house designs across consecutive generations
  const sessionGenerationRunCountRef = useRef(
    (() => {
      try {
        const stored = sessionStorage.getItem('lc_architect_generation_count');
        return stored ? parseInt(stored, 10) : 0;
      } catch {
        return 0;
      }
    })()
  );

  // 2D CAD Interactive State
  const [activeCadFloor, setActiveCadFloor] = useState('ground');
  const [cadZoom, setCadZoom] = useState(1);
  const [isMeasureRulerActive, setIsMeasureRulerActive] = useState(false);
  const [measureClicks, setMeasureClicks] = useState([]);
  const [rulerDistance, setRulerDistance] = useState(null);
  const [showColumnsLayer, setShowColumnsLayer] = useState(true);
  const [showDimensionsLayer, setShowDimensionsLayer] = useState(true);
  const [showGridLayer, setShowGridLayer] = useState(true);
  const [selectedCadRoom, setSelectedCadRoom] = useState(null);

  // 3D Model & Solar State
  const [lightingMood, setLightingMood] = useState('day'); // 'sunrise', 'day', 'golden', 'night'
  const [facadeCladding, setFacadeCladding] = useState('travertine');
  const [active3dHotspot, setActive3dHotspot] = useState(null);

  // Walkthrough State
  const [isPlayingWalkthrough, setIsPlayingWalkthrough] = useState(true);
  const [walkthroughScene, setWalkthroughScene] = useState('exterior_approach');

  // Modification State
  const [modificationPrompt, setModificationPrompt] = useState('');
  const [isProcessingMod, setIsProcessingMod] = useState(false);
  const [versionHistory, setVersionHistory] = useState([
    { version: 'v1.0', note: 'Initial architectural generation from parameters', timestamp: 'Just now' }
  ]);

  // =========================================================================
  // WORKSPACE B: INTERIOR DESIGN STATE
  // =========================================================================
  const [interiorRoomType, setInteriorRoomType] = useState('living');
  const [uploadedRoomPhoto, setUploadedRoomPhoto] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [uploadError, setUploadError] = useState(null);
  const [interiorPrompt, setInteriorPrompt] = useState(
    'Transform this living room into a rich, modern luxury space. Use warm ambient lighting, elegant wall panels, a premium looking sofa, a stylish TV unit, neutral colours, and subtle gold accents. Preserve the existing room layout where possible.'
  );
  const [interiorStyle, setInteriorStyle] = useState('rich_modern');
  const [interiorBudgetInr, setInteriorBudgetInr] = useState(200000);
  const [isGeneratingInterior, setIsGeneratingInterior] = useState(false);
  const [hasGeneratedInterior, setHasGeneratedInterior] = useState(false);
  const [comparisonSlider, setComparisonSlider] = useState(50);
  const [activeInteriorTab, setActiveInteriorTab] = useState('preview');
  const fileInputRef = useRef(null);

  // =========================================================================
  // COMPUTED VALUES
  // =========================================================================
  const currentDesign = generatedVariations[activeVariationIdx] || null;

  const plotSqft = dimensionUnit === 'feet'
    ? plotWidth * plotLength
    : Math.round(plotWidth * plotLength * 10.7639);

  const builtUpSqft = Math.round(
    plotSqft * (floorsCount === 1 ? 0.70 : floorsCount === 2 ? 1.40 : 2.05)
  );


  const sampleRoomPresets = [
    {
      id: 'living_raw',
      type: 'living',
      title: 'Bare Concrete Living Room',
      img: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'bedroom_raw',
      type: 'bedroom',
      title: 'Unfurnished Bedroom Shell',
      img: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'kitchen_raw',
      type: 'kitchen',
      title: 'Raw Masonry Kitchen Space',
      img: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80'
    }
  ];

  // =========================================================================
  // HANDLERS: WORKSPACE A (DESIGN MY HOME)
  // =========================================================================
  const handlePromptChange = (newText) => {
    setHomePrompt(newText);
    const analysis = analyzeArchitecturalPrompt(newText);
    setExtractedAnalysis(analysis);

    // If explicitly specified in prompt, automatically update structured controls:
    if (analysis.bhk.isExplicit) setBhkCount(analysis.bhk.value);
    if (analysis.floors.isExplicit) setFloorsCount(analysis.floors.value);
    if (analysis.bathrooms?.isExplicit) setBathroomsCount(analysis.bathrooms.value);
    if (analysis.plot.isExplicit) {
      setPlotWidth(analysis.plot.width);
      setPlotLength(analysis.plot.length);
    }
    if (analysis.style.isExplicit) setArchStyle(analysis.style.value);
    if (analysis.facing.isExplicit) setFacingDirection(analysis.facing.value);
    if (analysis.budget.isExplicit) setHomeBudgetInr(analysis.budget.value);
    if (analysis.amenities.hasPooja.isExplicit) setHasPooja(analysis.amenities.hasPooja.value);
    if (analysis.amenities.hasParking.isExplicit) setHasParking(analysis.amenities.hasParking.value);
    if (analysis.amenities.hasBalcony.isExplicit) setHasBalcony(analysis.amenities.hasBalcony.value);
    if (analysis.amenities.hasCourtyard.isExplicit) setHasCourtyard(analysis.amenities.hasCourtyard.value);
    if (analysis.amenities.hasSolar.isExplicit) setHasSolarPergola(analysis.amenities.hasSolar.value);

    // Reset confirmation so user confirms updated parameters
    setIsRequirementConfirmed(false);
  };

  const handleAnalyseRequirements = () => {
    if (!homePrompt.trim()) {
      alert('Please provide a brief description of your dream home.');
      return;
    }

    setIsAnalysing(true);

    setTimeout(() => {
      setIsAnalysing(false);
      // Run algorithmic requirement interpretation and constraint validation
      const interp = interpretRequirements({
        userPrompt: homePrompt,
        plotWidth,
        plotLength,
        dimensionUnit,
        floorsCount,
        bhkCount,
        bathroomsCount,
        archStyle,
        facingDirection,
        homeBudgetInr,
        hasPooja,
        hasParking,
        hasBalcony,
        hasCourtyard,
        hasSolarPergola,
        kitchenType
      });

      if (!interp.success || !interp.isFeasible) {
        setFeasibilityErrors({
          errors: interp.errors || ['Plot dimensions or constraints are physically infeasible.'],
          clarifications: interp.clarificationNeeded || ['Adjust plot dimensions or floor count.']
        });
        setIsRequirementConfirmed(false);
        return;
      }

      setFeasibilityErrors(null);
      setFeasibilityWarnings(interp.warnings || []);

      const specs = {
        ...interp.specs,
        plotDimensions: `${interp.specs.plotWidth} × ${interp.specs.plotLength} ${dimensionUnit}`,
        plotAreaSqft: interp.specs.plotAreaSqft,
        builtUpAreaSqft: builtUpSqft,
        floors: interp.specs.floorsCount,
        bedrooms: interp.specs.bhkCount,
        bathrooms: interp.specs.bathroomsCount,
        style: interp.specs.archStyle.charAt(0).toUpperCase() + interp.specs.archStyle.slice(1).replace('_', ' '),
        facing: interp.specs.facingDirection,
        budget: interp.specs.homeBudgetInr,
        parking: hasParking ? 'Covered Portico & EV Ready' : 'None',
        balcony: hasBalcony ? 'Cantilever Glass Balcony' : 'None',
        pooja: hasPooja ? 'Dedicated Ishanya Pooja Sanctum' : 'None',
        courtyard: hasCourtyard ? 'Central Sky Courtyard (Brahmasthanam)' : 'None',
        solar: hasSolarPergola ? '5.2 kWp Rooftop Solar Pergola' : 'None'
      };

      setValidatedSpecs(specs);
      // Synchronize structured input controls directly from interpreted specification
      if (interp.specs.plotWidth) setPlotWidth(interp.specs.plotWidth);
      if (interp.specs.plotLength) setPlotLength(interp.specs.plotLength);
      if (interp.specs.bhkCount) setBhkCount(interp.specs.bhkCount);
      if (interp.specs.bathroomsCount) setBathroomsCount(interp.specs.bathroomsCount);
      if (interp.specs.floorsCount) setFloorsCount(interp.specs.floorsCount);
      if (interp.specs.archStyle) setArchStyle(interp.specs.archStyle);
      if (interp.specs.facingDirection) setFacingDirection(interp.specs.facingDirection);
      if (interp.specs.homeBudgetInr) setHomeBudgetInr(interp.specs.homeBudgetInr);
      if (interp.specs.amenities?.hasPooja !== undefined) setHasPooja(interp.specs.amenities.hasPooja);
      if (interp.specs.amenities?.hasParking !== undefined) setHasParking(interp.specs.amenities.hasParking);
      if (interp.specs.amenities?.hasBalcony !== undefined) setHasBalcony(interp.specs.amenities.hasBalcony);
      if (interp.specs.amenities?.hasCourtyard !== undefined) setHasCourtyard(interp.specs.amenities.hasCourtyard);
      if (interp.specs.amenities?.hasSolarPergola !== undefined) setHasSolarPergola(interp.specs.amenities.hasSolarPergola);

      setIsRequirementConfirmed(true);
      confetti({ particleCount: 35, spread: 45 });
    }, 450);
  };

  const enrichEngineDesign = (canonicalDesign, varIndex = 0) => {
    const legacyFallback = generateHouseDesignVariation(
      {
        plotWidth,
        plotLength,
        dimensionUnit,
        floorsCount,
        bhkCount,
        bathroomsCount,
        archStyle,
        facingDirection,
        homeBudgetInr,
        hasPooja,
        hasParking,
        hasBalcony,
        hasCourtyard,
        hasSolarPergola,
        kitchenType,
        userPrompt: homePrompt
      },
      varIndex
    );

    const resolvedTitle = canonicalDesign?.title && !canonicalDesign.title.startsWith('Variation #')
      ? `Variation #${varIndex + 1}: ${canonicalDesign.title}`
      : (canonicalDesign?.title || legacyFallback.title);

    return {
      ...legacyFallback,
      ...canonicalDesign,
      id: canonicalDesign?.id || legacyFallback.id,
      code: canonicalDesign?.code || legacyFallback.code,
      title: resolvedTitle,
      variationIndex: canonicalDesign?.variationIndex !== undefined ? canonicalDesign.variationIndex : varIndex,
      metrics: {
        ...legacyFallback.metrics,
        ...(canonicalDesign?.metrics || {})
      },
      floors: canonicalDesign?.floors || legacyFallback.floors,
      geometry3d: canonicalDesign?.geometry3d,
      walkthroughTrajectory: canonicalDesign?.walkthroughTrajectory,
      boqEstimate: canonicalDesign?.boqEstimate,
      evaluation: canonicalDesign?.evaluation,
      isoModel: legacyFallback.isoModel,
      elevationModel: legacyFallback.elevationModel,
      roomSchedule: legacyFallback.roomSchedule,
      boqBreakdown: legacyFallback.boqBreakdown,
      vaastuReport: legacyFallback.vaastuReport,
      structuralGrid: canonicalDesign?.structuralGrid || legacyFallback.structuralGrid
    };
  };

  const executeGenerationPipeline = (variationIndex = 0, isAdditional = false) => {
    setIsGeneratingHome(true);
    setGenerationStep(1);

    const stepInterval = setInterval(() => {
      setGenerationStep((prev) => {
        if (prev >= 5) {
          clearInterval(stepInterval);
          return 5;
        }
        return prev + 1;
      });
    }, 220);

    setTimeout(() => {
      clearInterval(stepInterval);
      const rawInputs = {
        plotWidth: validatedSpecs?.plotWidth || plotWidth,
        plotLength: validatedSpecs?.plotLength || plotLength,
        dimensionUnit,
        floorsCount: validatedSpecs?.floorsCount || floorsCount,
        bhkCount: validatedSpecs?.bhkCount || bhkCount,
        bathroomsCount: validatedSpecs?.bathroomsCount || bathroomsCount,
        archStyle: validatedSpecs?.archStyle || archStyle,
        facingDirection: validatedSpecs?.facingDirection || facingDirection,
        homeBudgetInr: validatedSpecs?.homeBudgetInr || homeBudgetInr,
        hasPooja: validatedSpecs?.amenities?.hasPooja !== undefined ? validatedSpecs.amenities.hasPooja : hasPooja,
        hasParking: validatedSpecs?.amenities?.hasParking !== undefined ? validatedSpecs.amenities.hasParking : hasParking,
        hasBalcony: validatedSpecs?.amenities?.hasBalcony !== undefined ? validatedSpecs.amenities.hasBalcony : hasBalcony,
        hasCourtyard: validatedSpecs?.amenities?.hasCourtyard !== undefined ? validatedSpecs.amenities.hasCourtyard : hasCourtyard,
        hasSolarPergola: validatedSpecs?.amenities?.hasSolarPergola !== undefined ? validatedSpecs.amenities.hasSolarPergola : hasSolarPergola,
        kitchenType,
        userPrompt: homePrompt
      };

      const runIndex = sessionGenerationRunCountRef.current;
      const runOffset = isAdditional
        ? (generatedVariations.length + (runIndex * 4))
        : (runIndex * 2);

      const uniqueSeed = Date.now() + (runIndex * 31337) + Math.floor(Math.random() * 100000);

      // Call LabourConnectDesignEngine for authentic algorithmic layout generation
      const engineOutcome = designEngine.generateVariations(
        rawInputs,
        isAdditional ? 1 : 2,
        isAdditional ? generatedVariations : [],
        {
          baseVariationIndex: runOffset,
          seed: uniqueSeed
        }
      );

      if (engineOutcome.success && engineOutcome.variations?.length > 0) {
        if (isAdditional) {
          const newIdx = engineOutcome.variations[0].variationIndex !== undefined
            ? engineOutcome.variations[0].variationIndex
            : runOffset;
          const newVar = enrichEngineDesign(engineOutcome.variations[0], newIdx);
          setGeneratedVariations((prev) => [...prev, newVar]);
          setActiveVariationIdx(generatedVariations.length);
        } else {
          const var1Idx = engineOutcome.variations[0].variationIndex !== undefined
            ? engineOutcome.variations[0].variationIndex
            : runOffset;
          const var2Idx = engineOutcome.variations[1]?.variationIndex !== undefined
            ? engineOutcome.variations[1].variationIndex
            : (runOffset + 1);

          const var1 = enrichEngineDesign(engineOutcome.variations[0], var1Idx);
          const var2 = enrichEngineDesign(engineOutcome.variations[1] || engineOutcome.variations[0], var2Idx);
          setGeneratedVariations([var1, var2]);
          setActiveVariationIdx(0);
        }
      } else {
        // Fallback to procedural generator with full visual consistency
        const newVar = generateHouseDesignVariation(rawInputs, runOffset);
        if (isAdditional) {
          setGeneratedVariations((prev) => [...prev, newVar]);
          setActiveVariationIdx(generatedVariations.length);
        } else {
          const var2 = generateHouseDesignVariation({ ...rawInputs, archStyle: archStyle === 'modern' ? 'luxury_villa' : 'modern', hasCourtyard: !hasCourtyard }, runOffset + 1);
          setGeneratedVariations([newVar, var2]);
          setActiveVariationIdx(0);
        }
      }

      setIsGeneratingHome(false);
      setHasGeneratedHome(true);
      setActiveHomeResultTab('2d_design');
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    }, 1200);
  };

  const handleGenerateHomeDesign = () => {
    sessionGenerationRunCountRef.current += 1;
    try {
      sessionStorage.setItem('lc_architect_generation_count', String(sessionGenerationRunCountRef.current));
    } catch {}
    executeGenerationPipeline(0, false);
  };

  const handleGenerateAnotherVariation = () => {
    sessionGenerationRunCountRef.current += 1;
    try {
      sessionStorage.setItem('lc_architect_generation_count', String(sessionGenerationRunCountRef.current));
    } catch {}
    executeGenerationPipeline(generatedVariations.length, true);
  };

  const handleApplyModification = () => {
    if (!modificationPrompt.trim()) return;
    setIsProcessingMod(true);

    setTimeout(() => {
      setIsProcessingMod(false);
      const nextVer = `v1.${versionHistory.length}`;

      // Use LabourConnectDesignEngine to perform architectural modification
      const modOutcome = designEngine.modifyDesign(currentDesign, modificationPrompt);
      let updatedVar;
      if (modOutcome?.success && modOutcome.design) {
        updatedVar = enrichEngineDesign(modOutcome.design, generatedVariations.length + 1);
        updatedVar.version = nextVer;
      } else {
        updatedVar = generateHouseDesignVariation(
          {
            plotWidth,
            plotLength,
            dimensionUnit,
            floorsCount,
            bhkCount,
            bathroomsCount,
            archStyle,
            facingDirection,
            homeBudgetInr,
            hasPooja,
            hasParking,
            hasBalcony,
            hasCourtyard,
            hasSolarPergola,
            kitchenType,
            userPrompt: `${homePrompt} | Modification: ${modificationPrompt}`
          },
          generatedVariations.length + 1
        );
        updatedVar.version = nextVer;
      }

      setGeneratedVariations((prev) => [updatedVar, ...prev]);
      setActiveVariationIdx(0);
      setVersionHistory([
        {
          version: nextVer,
          note: modificationPrompt,
          timestamp: 'Just now'
        },
        ...versionHistory
      ]);
      setModificationPrompt('');
      confetti({ particleCount: 50, spread: 60 });
    }, 900);
  };

  const handleSaveHomeToProject = () => {
    const current = currentDesign || generateHouseDesignVariation({ plotWidth, plotLength, floorsCount, bhkCount, homeBudgetInr });
    const newProject = {
      id: `proj-${Date.now()}`,
      title: `${archStyle.toUpperCase().replace('_', ' ')} ${bhkCount}BHK Villa (${current.code})`,
      subtitle: `${floorsCount} Floors • ${facingDirection} Facing • ${builtUpSqft} sq.ft Built-up`,
      status: 'Design Finalized',
      phase: 'Planning & Approvals',
      budget: homeBudgetInr,
      spent: 0,
      completion: 15,
      role: 'Owner',
      address: `${plotWidth}x${plotLength} ft Plot, Sector 4, Metro Green City`,
      plotSpecs: {
        dimensions: `${plotWidth} × ${plotLength} ${dimensionUnit}`,
        plotArea: `${plotSqft} sq.ft`,
        builtUpArea: `${builtUpSqft} sq.ft`,
        carpetArea: `${current.metrics.carpetAreaSqft} sq.ft`,
        floors: floorsCount,
        bhk: bhkCount,
        facing: facingDirection,
        budgetEstimated: `₹${(homeBudgetInr / 100000).toFixed(1)} Lakhs`,
        isoPreview: current.isoModel.image,
        cadFloors: current.roomSchedule
      }
    };

    if (onPostProject) {
      onPostProject(newProject);
    }
    confetti({ particleCount: 90, spread: 80 });
    alert(`🎉 Project "${newProject.title}" has been saved with full 2D blueprints, 3D cutaway models, and BOQ estimates!`);
    if (onNavigate) {
      onNavigate('projects');
    }
  };

  const handleSaveInteriorToProject = () => {
    confetti({ particleCount: 60, spread: 70 });
    alert('🎉 Interior Design Package saved with itemized cost estimate and vendor specifications!');
    if (onNavigate) {
      onNavigate('projects');
    }
  };

  const handleCadCanvasClick = (e) => {
    if (!isMeasureRulerActive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);

    const newClicks = [...measureClicks, { x, y }];
    setMeasureClicks(newClicks);

    if (newClicks.length === 2) {
      const dx = newClicks[1].x - newClicks[0].x;
      const dy = newClicks[1].y - newClicks[0].y;
      const pixelDist = Math.sqrt(dx * dx + dy * dy);
      const scaleFeetPerPixel = plotLength / 380;
      const distFt = (pixelDist * scaleFeetPerPixel).toFixed(1);
      const distM = (distFt * 0.3048).toFixed(2);
      setRulerDistance({ distFt, distM });
    }
  };

  // =========================================================================
  // HANDLERS: WORKSPACE B (INTERIOR DESIGN)
  // =========================================================================
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setUploadError('Please select a valid JPG, PNG, or WebP image.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File size exceeds 10MB limit. Please choose a smaller photo.');
      return;
    }

    setUploadError(null);
    setUploadedFileName(file.name);
    const url = URL.createObjectURL(file);
    setUploadedRoomPhoto(url);
  };

  const handleGenerateInterior = () => {
    if (!uploadedRoomPhoto) {
      alert('Please upload a room photograph or select a sample room shell to begin.');
      return;
    }

    setIsGeneratingInterior(true);
    setTimeout(() => {
      setIsGeneratingInterior(false);
      setHasGeneratedInterior(true);
      setActiveInteriorTab('preview');
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
    }, 1200);
  };

  const getInteriorConceptImage = (isAfter = true) => {
    if (!isAfter && uploadedRoomPhoto) return uploadedRoomPhoto;
    if (!isAfter) {
      return 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80';
    }

    switch (interiorRoomType) {
      case 'bedroom':
        return 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1200&q=80';
      case 'kitchen':
        return 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80';
      case 'bathroom':
        return 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80';
      case 'balcony':
        return 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80';
      case 'living':
      default:
        return 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80';
    }
  };

  const calculateInteriorBudgetBreakdown = () => {
    const total = interiorBudgetInr;
    return [
      { category: 'Furniture & Seating', amount: Math.round(total * 0.40), percent: 40, color: '#b45309', items: 'Italian Sectional Sofa, Coffee Table, TV Console' },
      { category: 'Wall Paneling & Finishes', amount: Math.round(total * 0.20), percent: 20, color: '#0284c7', items: 'Fluted Teak Louvers, Venetian Stucco Plaster' },
      { category: 'Lighting & False Ceiling', amount: Math.round(total * 0.15), percent: 15, color: '#059669', items: 'Gyproc False Ceiling with 3000K Warm Cove LED' },
      { category: 'Curtains, Rugs & Decor', amount: Math.round(total * 0.13), percent: 13, color: '#6366f1', items: 'Sheer Linen Drapes, Geometric Rug, Planters' },
      { category: 'Contingency & Installation', amount: Math.round(total * 0.12), percent: 12, color: '#64748b', items: 'Site Carpentry, Painting & Final Deep Cleaning' }
    ];
  };

  return (
    <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '8px 0 60px', display: 'flex', flexDirection: 'column', gap: '20px', color: '#26332A' }}>
      {/* =========================================================================
          TOP PERSISTENT WORKSPACE SELECTOR: [ Design My Home ] [ Interior Design ]
      ========================================================================= */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E1E7DF',
          padding: '18px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '14px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.25rem', color: '#718B73' }}>✨</span>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#26332A', margin: 0, letterSpacing: '-0.02em' }}>
            AI Design Studio
          </h1>
        </div>

        {/* Centered Large Spaced Segmented Control */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '16px',
            background: '#FAFAF7',
            padding: '6px 10px',
            borderRadius: '14px',
            border: '1px solid #E1E7DF',
            width: '100%',
            maxWidth: '680px'
          }}
        >
          <button
            onClick={() => setActiveWorkspace('home')}
            style={{
              flex: 1,
              padding: '14px 32px',
              borderRadius: '10px',
              border: activeWorkspace === 'home' ? '1px solid #718B73' : '1px solid transparent',
              background: activeWorkspace === 'home' ? '#718B73' : '#FFFFFF',
              color: activeWorkspace === 'home' ? '#FFFFFF' : '#68736A',
              fontWeight: activeWorkspace === 'home' ? 800 : 600,
              fontSize: '0.92rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              boxShadow: activeWorkspace === 'home' ? '0 4px 12px rgba(113, 139, 115, 0.25)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <Home size={18} />
            <span>Design My Home</span>
          </button>

          <button
            onClick={() => setActiveWorkspace('interior')}
            style={{
              flex: 1,
              padding: '14px 32px',
              borderRadius: '10px',
              border: activeWorkspace === 'interior' ? '1px solid #718B73' : '1px solid transparent',
              background: activeWorkspace === 'interior' ? '#718B73' : '#FFFFFF',
              color: activeWorkspace === 'interior' ? '#FFFFFF' : '#68736A',
              fontWeight: activeWorkspace === 'interior' ? 800 : 600,
              fontSize: '0.92rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              boxShadow: activeWorkspace === 'interior' ? '0 4px 12px rgba(113, 139, 115, 0.25)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <Palette size={18} />
            <span>Interior Design</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          WORKSPACE A: DESIGN MY HOME (Full House 2D / 3D / Walkthrough / BOQ)
      ========================================================================= */}
      {activeWorkspace === 'home' && (
        <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '22px', alignItems: 'start' }}>
          {/* ----------------------------------------------------
              LEFT PANEL: REQUIREMENTS & NATURAL LANGUAGE PROMPT
          ---------------------------------------------------- */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* 1. Natural Language Prompt */}
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E1E7DF',
                padding: '18px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '0.825rem', fontWeight: 700, color: '#718B73', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={14} />
                  <span>Describe your dream home</span>
                </label>
                <span style={{ fontSize: '0.7rem', color: '#68736A' }}>Prompt Input</span>
              </div>

              <textarea
                id="prompt-input"
                data-testid="prompt-input"
                value={homePrompt}
                onChange={(e) => handlePromptChange(e.target.value)}
                placeholder="I want a modern two-storey 3BHK house on a 40x60 ft plot, with a pooja room, open kitchen, balcony, car parking, and a contemporary exterior. My budget is ₹45 lakh."
                rows={3}
                style={{
                  width: '100%',
                  background: '#FAFAF7',
                  border: '1px solid #E1E7DF',
                  borderRadius: '10px',
                  padding: '12px',
                  color: '#26332A',
                  fontSize: '0.825rem',
                  lineHeight: '1.45',
                  resize: 'none',
                  outline: 'none',
                  fontFamily: 'inherit'
                }}
              />

              {/* Extracted Specifications & Unmentioned Optional Fields */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', background: '#FAFAF7', padding: '10px', borderRadius: '10px', border: '1px solid #E1E7DF' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#26332A', textTransform: 'uppercase' }}>
                    Extracted from Prompt:
                  </span>
                  <span style={{ fontSize: '0.65rem', color: '#718B73', fontWeight: 700 }}>
                    Auto-Synchronized
                  </span>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {/* BHK */}
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    padding: '2px 7px',
                    borderRadius: '6px',
                    background: extractedAnalysis?.bhk?.isExplicit ? '#EAF0E8' : '#F1F5F9',
                    color: extractedAnalysis?.bhk?.isExplicit ? '#3D8056' : '#64748B',
                    border: extractedAnalysis?.bhk?.isExplicit ? '1px solid #718B73' : '1px solid #CBD5E1'
                  }}>
                    {extractedAnalysis?.bhk?.isExplicit ? '✓ ' : '○ '}{bhkCount} BHK {extractedAnalysis?.bhk?.isExplicit ? '' : '(Optional)'}
                  </span>

                  {/* Floors */}
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    padding: '2px 7px',
                    borderRadius: '6px',
                    background: extractedAnalysis?.floors?.isExplicit ? '#EAF0E8' : '#F1F5F9',
                    color: extractedAnalysis?.floors?.isExplicit ? '#3D8056' : '#64748B',
                    border: extractedAnalysis?.floors?.isExplicit ? '1px solid #718B73' : '1px solid #CBD5E1'
                  }}>
                    {extractedAnalysis?.floors?.isExplicit ? '✓ ' : '○ '}{floorsCount === 1 ? '1 Floor' : floorsCount === 2 ? '2 Floors (Duplex)' : `${floorsCount} Floors`} {extractedAnalysis?.floors?.isExplicit ? '' : '(Optional)'}
                  </span>

                  {/* Plot */}
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    padding: '2px 7px',
                    borderRadius: '6px',
                    background: extractedAnalysis?.plot?.isExplicit ? '#EAF0E8' : '#F1F5F9',
                    color: extractedAnalysis?.plot?.isExplicit ? '#3D8056' : '#64748B',
                    border: extractedAnalysis?.plot?.isExplicit ? '1px solid #718B73' : '1px solid #CBD5E1'
                  }}>
                    {extractedAnalysis?.plot?.isExplicit ? '✓ ' : '○ '}{plotWidth}×{plotLength} ft {extractedAnalysis?.plot?.isExplicit ? '' : '(Optional)'}
                  </span>

                  {/* Style */}
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    padding: '2px 7px',
                    borderRadius: '6px',
                    background: extractedAnalysis?.style?.isExplicit ? '#EAF0E8' : '#F1F5F9',
                    color: extractedAnalysis?.style?.isExplicit ? '#3D8056' : '#64748B',
                    border: extractedAnalysis?.style?.isExplicit ? '1px solid #718B73' : '1px solid #CBD5E1'
                  }}>
                    {extractedAnalysis?.style?.isExplicit ? '✓ ' : '○ '}{archStyle.charAt(0).toUpperCase() + archStyle.slice(1).replace('_', ' ')} {extractedAnalysis?.style?.isExplicit ? '' : '(Optional)'}
                  </span>

                  {/* Facing */}
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    padding: '2px 7px',
                    borderRadius: '6px',
                    background: extractedAnalysis?.facing?.isExplicit ? '#EAF0E8' : '#F1F5F9',
                    color: extractedAnalysis?.facing?.isExplicit ? '#3D8056' : '#64748B',
                    border: extractedAnalysis?.facing?.isExplicit ? '1px solid #718B73' : '1px solid #CBD5E1'
                  }}>
                    {extractedAnalysis?.facing?.isExplicit ? '✓ ' : '○ '}{facingDirection} Facing {extractedAnalysis?.facing?.isExplicit ? '' : '(Optional)'}
                  </span>

                  {/* Budget */}
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    padding: '2px 7px',
                    borderRadius: '6px',
                    background: extractedAnalysis?.budget?.isExplicit ? '#EAF0E8' : '#F1F5F9',
                    color: extractedAnalysis?.budget?.isExplicit ? '#3D8056' : '#64748B',
                    border: extractedAnalysis?.budget?.isExplicit ? '1px solid #718B73' : '1px solid #CBD5E1'
                  }}>
                    {extractedAnalysis?.budget?.isExplicit ? '✓ ' : '○ '}₹{(homeBudgetInr / 100000).toFixed(1)}L {extractedAnalysis?.budget?.isExplicit ? '' : '(Optional)'}
                  </span>
                </div>

                <span style={{ fontSize: '0.62rem', color: '#8A958C', fontStyle: 'italic', marginTop: '2px' }}>
                  Green = extracted from prompt. Grey = optional / defaulted (adjust anytime below).
                </span>
              </div>
            </div>

            {/* 2. Structured Dimensions & Core Specs */}
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E1E7DF',
                padding: '18px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
              }}
            >
              {/* Plot Dimensions */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#26332A' }}>
                    Plot Dimensions ({dimensionUnit}):
                  </label>
                  <div style={{ display: 'flex', gap: '4px', background: '#FAFAF7', padding: '2px', borderRadius: '6px', border: '1px solid #E1E7DF' }}>
                    {['feet', 'metres'].map((u) => (
                      <button
                        key={u}
                        onClick={() => setDimensionUnit(u)}
                        style={{
                          padding: '2px 6px',
                          borderRadius: '4px',
                          border: 'none',
                          background: dimensionUnit === u ? '#718B73' : 'transparent',
                          color: dimensionUnit === u ? '#FFFFFF' : '#68736A',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        {u === 'feet' ? 'ft' : 'm'}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: '#68736A' }}>Width (Frontage)</span>
                    <input
                      type="number"
                      value={plotWidth}
                      onChange={(e) => setPlotWidth(Math.max(10, Number(e.target.value)))}
                      style={{
                        width: '100%',
                        background: '#FAFAF7',
                        border: '1px solid #E1E7DF',
                        borderRadius: '8px',
                        padding: '8px',
                        color: '#26332A',
                        fontSize: '0.85rem',
                        fontWeight: 700
                      }}
                    />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: '#68736A' }}>Length (Depth)</span>
                    <input
                      type="number"
                      value={plotLength}
                      onChange={(e) => setPlotLength(Math.max(15, Number(e.target.value)))}
                      style={{
                        width: '100%',
                        background: '#FAFAF7',
                        border: '1px solid #E1E7DF',
                        borderRadius: '8px',
                        padding: '8px',
                        color: '#26332A',
                        fontSize: '0.85rem',
                        fontWeight: 700
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginTop: '6px', fontSize: '0.7rem', color: '#718B73', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Plot Area: <strong>{plotSqft.toLocaleString('en-IN')} sq.ft</strong></span>
                  <span>Est Built-up: <strong>~{builtUpSqft.toLocaleString('en-IN')} sq.ft</strong></span>
                </div>
              </div>

              {/* BHK & Floors Count */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#26332A', display: 'block', marginBottom: '4px' }}>
                    Bedrooms (BHK):
                  </label>
                  <select
                    value={bhkCount}
                    onChange={(e) => setBhkCount(Number(e.target.value))}
                    style={{
                      width: '100%',
                      background: '#FAFAF7',
                      border: '1px solid #E1E7DF',
                      borderRadius: '8px',
                      padding: '8px',
                      color: '#26332A',
                      fontSize: '0.8rem',
                      fontWeight: 600
                    }}
                  >
                    <option value={1}>1 BHK Studio</option>
                    <option value={2}>2 BHK Compact</option>
                    <option value={3}>3 BHK Standard</option>
                    <option value={4}>4 BHK Luxury</option>
                    <option value={5}>5 BHK Mansion</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#26332A', display: 'block', marginBottom: '4px' }}>
                    Floors / Storeys:
                  </label>
                  <select
                    value={floorsCount}
                    onChange={(e) => setFloorsCount(Number(e.target.value))}
                    style={{
                      width: '100%',
                      background: '#FAFAF7',
                      border: '1px solid #E1E7DF',
                      borderRadius: '8px',
                      padding: '8px',
                      color: '#26332A',
                      fontSize: '0.8rem',
                      fontWeight: 600
                    }}
                  >
                    <option value={1}>G (Single Storey)</option>
                    <option value={2}>G + 1 (2 Floors / Duplex)</option>
                    <option value={3}>G + 2 (3 Floors / Triplex)</option>
                    <option value={4}>G + 3 (4 Floors)</option>
                    <option value={5}>G + 4 (5-Storey Residential)</option>
                    <option value={6}>G + 5 (6-Storey Residential)</option>
                    <option value={7}>G + 6 (7-Storey Residential)</option>
                    <option value={8}>G + 7 (8-Storey Residential)</option>
                  </select>
                </div>
              </div>

              {/* Architectural Style & Facing */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#26332A', display: 'block', marginBottom: '4px' }}>
                    Architectural Style:
                  </label>
                  <select
                    value={archStyle}
                    onChange={(e) => setArchStyle(e.target.value)}
                    style={{
                      width: '100%',
                      background: '#FAFAF7',
                      border: '1px solid #E1E7DF',
                      borderRadius: '8px',
                      padding: '8px',
                      color: '#26332A',
                      fontSize: '0.8rem',
                      fontWeight: 600
                    }}
                  >
                    {ARCHITECTURAL_STYLES.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#26332A', display: 'block', marginBottom: '4px' }}>
                    Plot Facing:
                  </label>
                  <select
                    value={facingDirection}
                    onChange={(e) => setFacingDirection(e.target.value)}
                    style={{
                      width: '100%',
                      background: '#FAFAF7',
                      border: '1px solid #E1E7DF',
                      borderRadius: '8px',
                      padding: '8px',
                      color: '#26332A',
                      fontSize: '0.8rem',
                      fontWeight: 600
                    }}
                  >
                    <option value="East">East (Agni/Surya)</option>
                    <option value="North">North (Kuber)</option>
                    <option value="West">West (Varuna)</option>
                    <option value="South">South (Yama)</option>
                  </select>
                </div>
              </div>

              {/* Budget Range Starting from ₹1,00,000 */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#26332A' }}>
                    Construction Budget:
                  </label>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#718B73' }}>
                    {homeBudgetInr < 1000000 ? `₹${(homeBudgetInr / 100000).toFixed(1)} Lakh (${homeBudgetInr.toLocaleString('en-IN')})` : `₹${(homeBudgetInr / 100000).toFixed(1)} Lakhs`}
                  </span>
                </div>
                <input
                  type="range"
                  min={100000}
                  max={20000000}
                  step={50000}
                  value={homeBudgetInr}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setHomeBudgetInr(val);
                    if (val <= 300000) {
                      setBhkCount(1);
                      setPlotWidth(15);
                      setPlotLength(20);
                    }
                  }}
                  style={{ width: '100%', accentColor: '#718B73' }}
                />
                {/* 1-Click Budget Tier Buttons */}
                <div style={{ display: 'flex', gap: '4px', marginTop: '6px', flexWrap: 'wrap' }}>
                  {[
                    { label: '₹1.0L (Micro 1RK)', val: 100000, bhk: 1, w: 15, l: 20 },
                    { label: '₹3.5L (1BHK)', val: 350000, bhk: 1, w: 20, l: 30 },
                    { label: '₹8.0L (2BHK)', val: 800000, bhk: 2, w: 30, l: 30 },
                    { label: '₹25.0L (3BHK)', val: 2500000, bhk: 3, w: 30, l: 40 },
                    { label: '₹65.0L (Villa)', val: 6500000, bhk: 4, w: 40, l: 60 }
                  ].map(t => (
                    <button
                      key={t.val}
                      type="button"
                      onClick={() => {
                        setHomeBudgetInr(t.val);
                        setBhkCount(t.bhk);
                        setPlotWidth(t.w);
                        setPlotLength(t.l);
                      }}
                      style={{
                        background: homeBudgetInr === t.val ? '#718B73' : '#FAFAF7',
                        color: homeBudgetInr === t.val ? '#FFFFFF' : '#68736A',
                        border: '1px solid #E1E7DF',
                        borderRadius: '6px',
                        padding: '3px 7px',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Additional Options Collapsible */}
              <div style={{ borderTop: '1px solid #E1E7DF', paddingTop: '10px' }}>
                <button
                  onClick={() => setShowAdditionalReqs(!showAdditionalReqs)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#718B73',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: 0
                  }}
                >
                  <span>Special Rooms & Amenities</span>
                  <span>{showAdditionalReqs ? '▲' : '▼'}</span>
                </button>

                {showAdditionalReqs && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: '#26332A', cursor: 'pointer' }}>
                      <input type="checkbox" checked={hasPooja} onChange={(e) => setHasPooja(e.target.checked)} style={{ accentColor: '#718B73' }} />
                      <span>Dedicated Pooja Room (Ishanya / North-East)</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: '#26332A', cursor: 'pointer' }}>
                      <input type="checkbox" checked={hasParking} onChange={(e) => setHasParking(e.target.checked)} style={{ accentColor: '#718B73' }} />
                      <span>Covered Car Parking & EV Bay</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: '#26332A', cursor: 'pointer' }}>
                      <input type="checkbox" checked={hasBalcony} onChange={(e) => setHasBalcony(e.target.checked)} style={{ accentColor: '#718B73' }} />
                      <span>Cantilever Glass Balcony</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: '#26332A', cursor: 'pointer' }}>
                      <input type="checkbox" checked={hasCourtyard} onChange={(e) => setHasCourtyard(e.target.checked)} style={{ accentColor: '#718B73' }} />
                      <span>Central Open Courtyard (Thotti / Skylight)</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: '#26332A', cursor: 'pointer' }}>
                      <input type="checkbox" checked={hasSolarPergola} onChange={(e) => setHasSolarPergola(e.target.checked)} style={{ accentColor: '#718B73' }} />
                      <span>5.2 kW Solar Rooftop Pergola Canopy</span>
                    </label>
                  </div>
                )}
              </div>

              {/* Primary Action 1: Analyse Requirements */}
              <button
                id="btn-analyse-requirements"
                data-testid="btn-analyse-requirements"
                onClick={handleAnalyseRequirements}
                disabled={isAnalysing}
                style={{
                  background: '#718B73',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '9px',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  cursor: isAnalysing ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 2px 8px rgba(113, 139, 115, 0.25)'
                }}
              >
                <span>{isAnalysing ? 'Validating Plot Parameters...' : 'Analyse Requirements'}</span>
                <span>→</span>
              </button>
            </div>

            {/* Architectural Infeasibility Alert Card */}
            {feasibilityErrors && (
              <div
                style={{
                  background: '#FEF2F2',
                  borderRadius: '16px',
                  border: '1px solid #FCA5A5',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  boxShadow: '0 2px 8px rgba(220, 38, 38, 0.08)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#DC2626', fontWeight: 800, fontSize: '0.85rem' }}>
                  <AlertTriangle size={18} />
                  <span>ARCHITECTURAL INFEASIBILITY DETECTED</span>
                </div>
                {feasibilityErrors.errors?.map((err, i) => (
                  <div key={i} style={{ fontSize: '0.76rem', color: '#B91C1C', lineHeight: 1.4 }}>
                    • {err}
                  </div>
                ))}
                {feasibilityErrors.clarifications?.length > 0 && (
                  <div style={{ borderTop: '1px solid #FECACA', paddingTop: '8px', fontSize: '0.74rem', color: '#7F1D1D' }}>
                    <strong style={{ color: '#991B1B' }}>Recommendation:</strong> {feasibilityErrors.clarifications.join(' ')}
                  </div>
                )}
              </div>
            )}

            {/* Requirement Confirmation Card (Step 2) */}
            {isRequirementConfirmed && validatedSpecs && (
              <div
                style={{
                  background: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px solid #E1E7DF',
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  boxShadow: '0 2px 8px rgba(61, 128, 86, 0.05)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#3D8056', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={16} />
                    <span>SPECIFICATIONS CONFIRMED</span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '0.75rem', color: '#68736A' }}>
                  <div>Plot: <strong style={{ color: '#26332A' }}>{validatedSpecs.plotDimensions}</strong></div>
                  <div>Floors: <strong style={{ color: '#26332A' }}>{validatedSpecs.floors}</strong></div>
                  <div>Bedrooms: <strong style={{ color: '#26332A' }}>{validatedSpecs.bedrooms}</strong></div>
                  <div>Bathrooms: <strong style={{ color: '#26332A' }}>{validatedSpecs.bathrooms}</strong></div>
                  <div>Style: <strong style={{ color: '#26332A' }}>{validatedSpecs.style}</strong></div>
                  <div>Facing: <strong style={{ color: '#26332A' }}>{validatedSpecs.facing}</strong></div>
                  <div>Parking: <strong style={{ color: '#26332A' }}>{hasParking ? 'Yes' : 'No'}</strong></div>
                  <div>Balcony: <strong style={{ color: '#26332A' }}>{hasBalcony ? 'Yes' : 'No'}</strong></div>
                </div>

                {feasibilityWarnings.length > 0 && (
                  <div style={{ background: '#FFFBEB', border: '1px solid #FCD34D', borderRadius: '8px', padding: '8px 10px', fontSize: '0.72rem', color: '#92400E' }}>
                    ⚠️ {feasibilityWarnings.join(' ')}
                  </div>
                )}

                <div style={{ borderTop: '1px solid #E1E7DF', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem' }}>
                    <span style={{ color: '#68736A' }}>🏛️ Core Building Construction:</span>
                    <strong style={{ color: '#26332A' }}>₹{Math.round(homeBudgetInr * 0.68).toLocaleString('en-IN')}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem' }}>
                    <span style={{ color: '#68736A' }}>🛋️ Infrastructure & Interior Fit-Out:</span>
                    <strong style={{ color: '#26332A' }}>₹{Math.round(homeBudgetInr * 0.32).toLocaleString('en-IN')}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed #E1E7DF', paddingTop: '4px', marginTop: '2px' }}>
                    <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#334155' }}>Total Estimated Budget:</span>
                    <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#718B73' }}>₹{homeBudgetInr.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  <button
                    onClick={() => setIsRequirementConfirmed(false)}
                    style={{
                      flex: 1,
                      background: '#FAFAF7',
                      border: '1px solid #E1E7DF',
                      color: '#68736A',
                      padding: '8px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Edit
                  </button>
                  <button
                    id="btn-generate-design"
                    data-testid="btn-generate-design"
                    onClick={handleGenerateHomeDesign}
                    disabled={isGeneratingHome}
                    style={{
                      flex: 1.5,
                      background: '#718B73',
                      border: 'none',
                      color: '#FFFFFF',
                      padding: '8px',
                      borderRadius: '6px',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      cursor: isGeneratingHome ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {isGeneratingHome ? '✨ Generating...' : '✨ Generate Design'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ----------------------------------------------------
              RIGHT PANEL: RESULTS WORKSPACE (2D / 3D / Walkthrough / BOQ)
          ---------------------------------------------------- */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Loading / Pipeline indicator */}
            {isGeneratingHome && (
              <div
                style={{
                  background: '#FFFFFF',
                  borderRadius: '18px',
                  border: '1px solid #E1E7DF',
                  padding: '36px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '16px',
                  boxShadow: '0 4px 16px rgba(113, 139, 115, 0.1)'
                }}
              >
                <div style={{ fontSize: '2.4rem', animation: 'spin 2s linear infinite' }}>✨</div>
                <div style={{ textAlign: 'center' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#26332A', marginBottom: '6px' }}>
                    AI Architectural Engine Running
                  </h3>
                  <p style={{ fontSize: '0.825rem', color: '#718B73', fontWeight: 600 }}>
                    {generationStep === 1 && '1/5: Synthesizing plot zoning & municipal setback constraints...'}
                    {generationStep === 2 && '2/5: Optimizing room circulation & Vaastu Shastra alignment...'}
                    {generationStep === 3 && '3/5: Calculating structural RCC column-beam load distribution...'}
                    {generationStep === 4 && '4/5: Rendering 3D Isometric cutaway textures & natural light...'}
                    {generationStep >= 5 && '5/5: Compiling 2D CAD blueprint & itemized Bill of Quantities...'}
                  </p>
                </div>

                <div style={{ width: '320px', height: '6px', background: '#EAF0E8', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${(generationStep / 5) * 100}%`, height: '100%', background: '#718B73', transition: 'width 0.25s ease' }} />
                </div>
              </div>
            )}

            {!hasGeneratedHome && !isGeneratingHome ? (
              activeHomeResultTab === '5d_visuals' ? (
                <Visuals5dStudio
                  design={null}
                  onBackToDesign={() => setActiveHomeResultTab('2d_design')}
                />
              ) : (
                <div
                  style={{
                    background: '#FFFFFF',
                  borderRadius: '18px',
                  border: '1px solid #E1E7DF',
                  padding: '40px 24px',
                  minHeight: '520px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  gap: '16px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                }}
              >
                <div
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '20px',
                    background: '#EAF0E8',
                    border: '1px solid #E1E7DF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2rem'
                  }}
                >
                  📐
                </div>
                <div style={{ maxWidth: '440px' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#26332A', marginBottom: '6px' }}>
                    Generate Realistic 3D Cutaways & 2D CAD Plans
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: '#68736A', lineHeight: '1.5' }}>
                    Enter your plot size, BHK, and style on the left, then click <strong>"Analyse Requirements"</strong> and <strong>"Generate Design"</strong>. Our engine creates photorealistic 3D cutaway isometric models, 2D floor plans, structural grids, and exact BOQ estimates.
                  </p>
                </div>
                <button
                  id="btn-sample-villa"
                  data-testid="btn-sample-villa"
                  onClick={() => {
                    handleAnalyseRequirements();
                    setTimeout(() => handleGenerateHomeDesign(), 600);
                  }}
                  style={{
                    background: '#718B73',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    fontSize: '0.825rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(113, 139, 115, 0.25)'
                  }}
                >
                  ✨ Generate Sample 3BHK Villa Plan →
                </button>
              </div>
              )
            ) : null}

            {hasGeneratedHome && !isGeneratingHome && currentDesign && (
              <div
                style={{
                  background: '#FFFFFF',
                  borderRadius: '18px',
                  border: '1px solid #E1E7DF',
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                }}
              >
                {/* VARIATIONS CAROUSEL BAR (Every generate click creates new variations) */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: '#FAFAF7',
                    padding: '8px 12px',
                    borderRadius: '12px',
                    border: '1px solid #E1E7DF',
                    flexWrap: 'wrap',
                    gap: '10px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#68736A' }}>VARIATIONS:</span>
                    {generatedVariations.map((v, idx) => (
                      <button
                        key={v.id}
                        onClick={() => setActiveVariationIdx(idx)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '8px',
                          border: activeVariationIdx === idx ? '1px solid #718B73' : '1px solid #E1E7DF',
                          background: activeVariationIdx === idx ? '#718B73' : '#FFFFFF',
                          color: activeVariationIdx === idx ? '#FFFFFF' : '#26332A',
                          fontWeight: activeVariationIdx === idx ? 800 : 600,
                          fontSize: '0.74rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        <span>{v.title}</span>
                      </button>
                    ))}

                    <button
                      id="btn-generate-variation"
                      data-testid="btn-generate-variation"
                      onClick={handleGenerateAnotherVariation}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        border: '1px dashed #718B73',
                        background: '#EAF0E8',
                        color: '#718B73',
                        fontWeight: 800,
                        fontSize: '0.74rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      <Plus size={13} />
                      <span>Generate New Variation 🎲</span>
                    </button>

                    <button
                      id="btn-regenerate-design"
                      data-testid="btn-regenerate-design"
                      onClick={handleGenerateAnotherVariation}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '8px',
                        border: '1px solid #0284c7',
                        background: '#0284c7',
                        color: '#ffffff',
                        fontWeight: 800,
                        fontSize: '0.74rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        whiteSpace: 'nowrap',
                        boxShadow: '0 2px 8px rgba(2, 132, 199, 0.3)'
                      }}
                      title="Regenerate a distinct valid design keeping all prompt constraints intact"
                    >
                      <RefreshCw size={13} />
                      <span>Regenerate Design 🔄</span>
                    </button>
                  </div>

                  {/* Save to project action */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#718B73', background: '#EAF0E8', padding: '4px 8px', borderRadius: '6px' }}>
                      {currentDesign.code}
                    </span>
                    <button
                      onClick={handleSaveHomeToProject}
                      style={{
                        background: '#718B73',
                        color: '#FFFFFF',
                        border: 'none',
                        padding: '6px 14px',
                        borderRadius: '8px',
                        fontWeight: 800,
                        fontSize: '0.76rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 2px 6px rgba(113, 139, 115, 0.25)'
                      }}
                    >
                      <CheckCircle2 size={13} />
                      Save to Projects
                    </button>

                    <button
                      onClick={() => setIsExportModalOpen(true)}
                      style={{
                        background: '#26332A',
                        color: '#FFFFFF',
                        border: 'none',
                        padding: '6px 14px',
                        borderRadius: '8px',
                        fontWeight: 800,
                        fontSize: '0.76rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 2px 6px rgba(38, 51, 42, 0.25)'
                      }}
                    >
                      <Download size={13} />
                      Export & Documentation
                    </button>
                  </div>
                </div>

                {/* Main Results View Tabs: ONLY [ 2D Design (All Angles) ] [ 3D Design ] [ 4K Walkthrough ] */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', gap: '6px', background: '#FAFAF7', padding: '4px', borderRadius: '10px', border: '1px solid #E1E7DF', flexWrap: 'wrap' }}>
                    {[
                      { id: '2d_design', label: '2D Design (All Angles)', icon: <Square size={14} /> },
                      { id: '3d_design', label: '3D Design', icon: <Box size={14} /> },
                      { id: 'walkthrough', label: '4K Walkthrough', icon: <Video size={14} /> },
                      { id: '5d_visuals', label: '5D Visuals', icon: <Layers size={14} /> }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        id={`tab-${tab.id}`}
                        data-testid={`tab-${tab.id}`}
                        onClick={() => setActiveHomeResultTab(tab.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '7px 14px',
                          borderRadius: '8px',
                          border: 'none',
                          background: activeHomeResultTab === tab.id ? '#718B73' : 'transparent',
                          color: activeHomeResultTab === tab.id ? '#FFFFFF' : '#68736A',
                          fontWeight: activeHomeResultTab === tab.id ? 800 : 600,
                          fontSize: '0.78rem',
                          cursor: 'pointer',
                          boxShadow: activeHomeResultTab === tab.id ? '0 1px 4px rgba(113, 139, 115, 0.3)' : 'none',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {tab.icon}
                        <span>{tab.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Micro Specs Tag */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.72rem', background: '#FAFAF7', border: '1px solid #E1E7DF', color: '#68736A', padding: '5px 10px', borderRadius: '6px', fontWeight: 700 }}>
                      Plot: {plotWidth}×{plotLength} ft • {bhkCount} BHK • {floorsCount} Flr • {facingDirection}
                    </span>
                  </div>
                </div>

                {/* ----------------------------------------------------
                    1. 2D DESIGN IN ALL ANGLES (Top Plan, Front, Side, Rear, Section)
                ---------------------------------------------------- */}
                {activeHomeResultTab === '2d_design' && (
                  <Architectural2dAllAnglesViewer
                    design={currentDesign}
                    plotWidth={plotWidth}
                    plotLength={plotLength}
                    floors={floorsCount}
                    bhk={bhkCount}
                    archStyle={archStyle}
                    facing={facingDirection}
                    budgetInr={homeBudgetInr}
                    prompt={homePrompt}
                  />
                )}

                {/* ----------------------------------------------------
                    2. 3D DESIGN (ADVANCED REALISTIC 3D ORBIT VIEWER & TOUCH LIGHTING)
                ---------------------------------------------------- */}
                {activeHomeResultTab === '3d_design' && (
                  <Interactive3dEngine
                    design={currentDesign}
                    budgetInr={homeBudgetInr}
                    bhk={bhkCount}
                    floors={floorsCount}
                    plotWidth={plotWidth}
                    plotLength={plotLength}
                    style={archStyle}
                    facing={facingDirection}
                    prompt={homePrompt}
                    onDesignChange={(customizedDesign) => {
                      if (!customizedDesign) return;
                      setGeneratedVariations((prev) => {
                        const nextVars = [...prev];
                        nextVars[activeVariationIdx] = {
                          ...nextVars[activeVariationIdx],
                          ...customizedDesign,
                          furnishings: customizedDesign.furnishings,
                          landscape: customizedDesign.landscape,
                          customMaterials: customizedDesign.customMaterials,
                          customizations: customizedDesign.customizations,
                          projectBudget: customizedDesign.projectBudget,
                          boqEstimate: customizedDesign.boqEstimate
                        };
                        return nextVars;
                      });
                    }}
                  />
                )}

                {/* ----------------------------------------------------
                    3. 4K WALKTHROUGH (GATE TO GARDEN TO ENTIRE HOME)
                ---------------------------------------------------- */}
                {activeHomeResultTab === 'walkthrough' && (
                  <CinematicWalkthroughStudio
                    design={currentDesign}
                    budgetInr={homeBudgetInr}
                    bhk={bhkCount}
                    plotWidth={plotWidth}
                    plotLength={plotLength}
                    style={archStyle}
                    facing={facingDirection}
                    prompt={homePrompt}
                  />
                )}

                {/* ----------------------------------------------------
                    4. 5D VISUALS (PREMIUM ISOMETRIC CUTAWAYS, TEXTURES & FURNITURE)
                ---------------------------------------------------- */}
                {activeHomeResultTab === '5d_visuals' && (
                  <Visuals5dStudio
                    design={currentDesign}
                    onBackToDesign={() => setActiveHomeResultTab('2d_design')}
                    onSaveToProject={(des) => {
                      if (onPostProject) {
                        onPostProject({
                          title: currentVariation?.title || `${bhkCount} BHK 5D Architectural Design`,
                          specs: { bhk: bhkCount, floors: floorsCount, plotWidth, plotLength, style: archStyle },
                          budget: homeBudgetInr,
                          design: des
                        });
                      }
                    }}
                  />
                )}

                {/* ----------------------------------------------------
                    INSTANT ARCHITECTURAL MODIFICATIONS AI
                ---------------------------------------------------- */}
                <div
                  style={{
                    borderTop: '1px solid #E1E7DF',
                    paddingTop: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#26332A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Edit3 size={13} color="#718B73" />
                    <span>Apply Instant Architectural Modifications to This Layout:</span>
                  </label>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      placeholder="e.g., 'Make the master bedroom 2ft wider', 'Shift kitchen to South-East', 'Add a second balcony on east side'..."
                      value={modificationPrompt}
                      onChange={(e) => setModificationPrompt(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleApplyModification()}
                      style={{
                        flex: 1,
                        background: '#FAFAF7',
                        border: '1px solid #E1E7DF',
                        borderRadius: '8px',
                        padding: '10px 12px',
                        color: '#26332A',
                        fontSize: '0.8rem',
                        outline: 'none'
                      }}
                    />
                    <button
                      onClick={handleApplyModification}
                      disabled={isProcessingMod}
                      style={{
                        background: '#718B73',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '0 18px',
                        fontWeight: 800,
                        fontSize: '0.78rem',
                        cursor: isProcessingMod ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <span>{isProcessingMod ? 'Modifying...' : 'Apply AI Edit'}</span>
                    </button>
                  </div>
                </div>

                {/* ----------------------------------------------------
                    BOTTOM-RIGHT ALIGNED BUTTONS:
                    [ 🔄 Regenerate ] [ 📐 Structural & MEP ] [ 💰 $BOQ & Live Rates ] [ 🧭 Vaastu Report ]
                ---------------------------------------------------- */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    gap: '8px',
                    flexWrap: 'wrap',
                    paddingTop: '4px'
                  }}
                >
                  {/* Small button that symbolizes regenerate */}
                  <button
                    onClick={handleGenerateAnotherVariation}
                    title="Generate New Variation"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '7px 11px',
                      borderRadius: '8px',
                      border: '1px solid #718B73',
                      background: '#EAF0E8',
                      color: '#718B73',
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      boxShadow: '0 1px 4px rgba(113, 139, 115, 0.15)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <RefreshCw size={12} />
                    <span>Regenerate</span>
                  </button>

                  {/* Structural & MEP */}
                  <button
                    onClick={() => setIsStructuralModalOpen(true)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '7px 13px',
                      borderRadius: '8px',
                      border: '1px solid #E1E7DF',
                      background: '#FAFAF7',
                      color: '#26332A',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <Grid size={13} color="#718B73" />
                    <span>Structural & MEP</span>
                  </button>

                  {/* $BOQ & Live Rates */}
                  <button
                    onClick={() => setIsBoqModalOpen(true)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '7px 13px',
                      borderRadius: '8px',
                      border: '1px solid #E1E7DF',
                      background: '#FAFAF7',
                      color: '#26332A',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <DollarSign size={13} color="#3D8056" />
                    <span>$BOQ & Live Rates</span>
                  </button>

                  {/* Vaastu Report */}
                  <button
                    onClick={() => setIsVaastuModalOpen(true)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '7px 13px',
                      borderRadius: '8px',
                      border: '1px solid #E1E7DF',
                      background: '#FAFAF7',
                      color: '#26332A',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <Compass size={13} color="#ea580c" />
                    <span>Vaastu Report</span>
                  </button>

                  {/* Municipal Bye-Laws & Permissible FAR */}
                  <button
                    onClick={() => setIsMunicipalModalOpen(true)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '7px 13px',
                      borderRadius: '8px',
                      border: '1px solid #bae6fd',
                      background: '#f0f9ff',
                      color: '#0369a1',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 1px 4px rgba(3, 105, 161, 0.1)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <ShieldCheck size={13} color="#0284c7" />
                    <span>Municipal Bye-Laws & FAR</span>
                  </button>

                  {/* Export & Documentation Center */}
                  <button
                    onClick={() => setIsExportModalOpen(true)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '7px 14px',
                      borderRadius: '8px',
                      border: '1px solid #718B73',
                      background: '#EAF0E8',
                      color: '#26332A',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      boxShadow: '0 1px 4px rgba(113, 139, 115, 0.15)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <Download size={13} color="#718B73" />
                    <span>📦 Export Center (CAD, 3D, PDF)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          WORKSPACE B: INTERIOR DESIGN (Upload Photo & Style Transfer)
      ========================================================================= */}
      {activeWorkspace === 'interior' && (
        <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '22px', alignItems: 'start' }}>
          {/* Left Panel: Upload & Style Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Step 1: Upload Photo or Select Sample */}
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E1E7DF',
                padding: '18px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '0.825rem', fontWeight: 700, color: '#718B73', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Camera size={14} />
                  <span>1. Upload Room Photograph</span>
                </label>
                <span style={{ fontSize: '0.7rem', color: '#68736A' }}>JPG, PNG &lt; 10MB</span>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoUpload}
                accept="image/png, image/jpeg, image/webp"
                style={{ display: 'none' }}
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: '2px dashed #718B73',
                  borderRadius: '12px',
                  padding: '20px',
                  textAlign: 'center',
                  background: '#FAFAF7',
                  cursor: 'pointer'
                }}
              >
                {uploadedRoomPhoto ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <img src={uploadedRoomPhoto} alt="Uploaded Room" style={{ width: '100%', maxHeight: '140px', objectFit: 'cover', borderRadius: '8px' }} />
                    <span style={{ fontSize: '0.72rem', color: '#3D8056', fontWeight: 700 }}>✓ {uploadedFileName || 'Photo Loaded'} (Click to change)</span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <Upload size={24} color="#718B73" />
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#26332A' }}>Click to upload empty/unfurnished room</span>
                    <span style={{ fontSize: '0.7rem', color: '#68736A' }}>AI will preserve walls and furnish decor</span>
                  </div>
                )}
              </div>

              {/* Sample Shells */}
              <div>
                <span style={{ fontSize: '0.7rem', color: '#68736A', display: 'block', marginBottom: '6px' }}>Or test with a sample room:</span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                  {sampleRoomPresets.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => {
                        setUploadedRoomPhoto(r.img);
                        setUploadedFileName(r.title);
                        setInteriorRoomType(r.type);
                      }}
                      style={{
                        padding: '4px',
                        background: '#FAFAF7',
                        border: '1px solid #E1E7DF',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        textAlign: 'center'
                      }}
                    >
                      <img src={r.img} alt={r.title} style={{ width: '100%', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                      <span style={{ fontSize: '0.65rem', color: '#26332A', display: 'block', marginTop: '2px' }}>{r.type}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Step 2: Interior Style & Prompt */}
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E1E7DF',
                padding: '18px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
              }}
            >
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#26332A', display: 'block', marginBottom: '4px' }}>
                  Target Room Type:
                </label>
                <select
                  value={interiorRoomType}
                  onChange={(e) => setInteriorRoomType(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#FAFAF7',
                    border: '1px solid #E1E7DF',
                    borderRadius: '8px',
                    padding: '8px',
                    color: '#26332A',
                    fontSize: '0.8rem',
                    fontWeight: 600
                  }}
                >
                  <option value="living">Living Lounge & Foyer</option>
                  <option value="bedroom">Master Bedroom Suite</option>
                  <option value="kitchen">Modular Kitchen Space</option>
                  <option value="bathroom">Luxury Bathroom</option>
                  <option value="balcony">Balcony & Sit-out</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#26332A', display: 'block', marginBottom: '4px' }}>
                  Interior Design Style:
                </label>
                <select
                  value={interiorStyle}
                  onChange={(e) => setInteriorStyle(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#FAFAF7',
                    border: '1px solid #E1E7DF',
                    borderRadius: '8px',
                    padding: '8px',
                    color: '#26332A',
                    fontSize: '0.8rem',
                    fontWeight: 600
                  }}
                >
                  <option value="rich_modern">Rich Modern Luxury (Ambient Gold & Teak)</option>
                  <option value="minimalist_japandi">Japandi Minimalist (Muted Wood & Stone)</option>
                  <option value="scandinavian">Warm Scandinavian (Oak & Linen)</option>
                  <option value="classic_royal">Classic Royal Indian (Carved Wood & Marble)</option>
                </select>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#26332A' }}>
                    Interior Furnishing Budget:
                  </label>
                  <span style={{ fontSize: '0.825rem', fontWeight: 800, color: '#718B73' }}>
                    ₹{(interiorBudgetInr / 100000).toFixed(1)} Lakhs
                  </span>
                </div>
                <input
                  type="range"
                  min={50000}
                  max={1500000}
                  step={25000}
                  value={interiorBudgetInr}
                  onChange={(e) => setInteriorBudgetInr(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#718B73' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#26332A', display: 'block', marginBottom: '4px' }}>
                  Custom Interior Prompt:
                </label>
                <textarea
                  value={interiorPrompt}
                  onChange={(e) => setInteriorPrompt(e.target.value)}
                  rows={3}
                  style={{
                    width: '100%',
                    background: '#FAFAF7',
                    border: '1px solid #E1E7DF',
                    borderRadius: '8px',
                    padding: '10px',
                    color: '#26332A',
                    fontSize: '0.78rem',
                    resize: 'none',
                    outline: 'none'
                  }}
                />
              </div>

              <button
                onClick={handleGenerateInterior}
                disabled={isGeneratingInterior}
                style={{
                  background: '#718B73',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '9px',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  cursor: isGeneratingInterior ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 2px 8px rgba(113, 139, 115, 0.25)'
                }}
              >
                <span>{isGeneratingInterior ? 'Transforming Space...' : '✨ Generate Interior Concept'}</span>
              </button>
            </div>
          </div>

          {/* Right Panel: Before / After Comparison & BOQ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {!hasGeneratedInterior ? (
              <div
                style={{
                  background: '#FFFFFF',
                  borderRadius: '18px',
                  border: '1px solid #E1E7DF',
                  padding: '40px 24px',
                  minHeight: '480px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  gap: '16px'
                }}
              >
                <div style={{ fontSize: '2.5rem' }}>🛋️</div>
                <div style={{ maxWidth: '400px' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#26332A', marginBottom: '6px' }}>
                    See Your Raw Room Transformed
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: '#68736A' }}>
                    Upload an empty room photo or select a sample shell on the left to generate an interactive Before/After comparison and itemized interior budget.
                  </p>
                </div>
              </div>
            ) : (
              <div
                style={{
                  background: '#FFFFFF',
                  borderRadius: '18px',
                  border: '1px solid #E1E7DF',
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}
              >
                {/* Tabs */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '6px', background: '#FAFAF7', padding: '4px', borderRadius: '10px', border: '1px solid #E1E7DF' }}>
                    <button
                      onClick={() => setActiveInteriorTab('preview')}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '7px',
                        border: 'none',
                        background: activeInteriorTab === 'preview' ? '#718B73' : 'transparent',
                        color: activeInteriorTab === 'preview' ? '#FFFFFF' : '#68736A',
                        fontWeight: activeInteriorTab === 'preview' ? 800 : 600,
                        fontSize: '0.78rem',
                        cursor: 'pointer'
                      }}
                    >
                      Before / After Comparison
                    </button>
                    <button
                      onClick={() => setActiveInteriorTab('estimate')}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '7px',
                        border: 'none',
                        background: activeInteriorTab === 'estimate' ? '#718B73' : 'transparent',
                        color: activeInteriorTab === 'estimate' ? '#FFFFFF' : '#68736A',
                        fontWeight: activeInteriorTab === 'estimate' ? 800 : 600,
                        fontSize: '0.78rem',
                        cursor: 'pointer'
                      }}
                    >
                      Interior Cost Estimate & Vendors
                    </button>
                  </div>

                  <button
                    onClick={handleSaveInteriorToProject}
                    style={{
                      background: '#718B73',
                      color: '#FFFFFF',
                      border: 'none',
                      padding: '7px 14px',
                      borderRadius: '8px',
                      fontWeight: 800,
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <CheckCircle2 size={14} />
                    Save Interior Plan
                  </button>
                </div>

                {activeInteriorTab === 'preview' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div
                      style={{
                        position: 'relative',
                        height: '420px',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        background: '#FAFAF7',
                        border: '1px solid #E1E7DF'
                      }}
                    >
                      {/* After Image */}
                      <img
                        src={getInteriorConceptImage(true)}
                        alt="Interior Transformed"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />

                      {/* Before Image with Clip Path */}
                      <div
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          bottom: 0,
                          width: `${comparisonSlider}%`,
                          overflow: 'hidden',
                          borderRight: '3px solid #FFFFFF'
                        }}
                      >
                        <img
                          src={getInteriorConceptImage(false)}
                          alt="Interior Raw"
                          style={{ width: '100%', minWidth: '700px', height: '100%', objectFit: 'cover' }}
                        />
                      </div>

                      {/* Slider Control */}
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={comparisonSlider}
                        onChange={(e) => setComparisonSlider(Number(e.target.value))}
                        style={{
                          position: 'absolute',
                          bottom: '16px',
                          left: '20px',
                          right: '20px',
                          accentColor: '#718B73',
                          zIndex: 10
                        }}
                      />
                    </div>
                  </div>
                )}

                {activeInteriorTab === 'estimate' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {calculateInteriorBudgetBreakdown().map((cat, idx) => (
                      <div
                        key={idx}
                        style={{
                          background: '#FAFAF7',
                          border: '1px solid #E1E7DF',
                          padding: '12px 16px',
                          borderRadius: '10px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '0.825rem', fontWeight: 800, color: '#26332A' }}>{cat.category}</div>
                          <div style={{ fontSize: '0.72rem', color: '#68736A' }}>{cat.items}</div>
                        </div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 800, color: '#718B73' }}>
                          ₹{cat.amount.toLocaleString('en-IN')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          PRODUCTION MODALS: STRUCTURAL & MEP, $BOQ WITH LIVE RATES, VAASTU REPORT
      ========================================================================= */}
      <StructuralMepModal
        isOpen={isStructuralModalOpen}
        onClose={() => setIsStructuralModalOpen(false)}
        design={currentDesign}
      />

      <BoqLiveIndianRatesModal
        isOpen={isBoqModalOpen}
        onClose={() => setIsBoqModalOpen(false)}
        design={currentDesign}
        builtUpSqft={builtUpSqft}
        floors={floorsCount}
      />

      <VaastuReportModal
        isOpen={isVaastuModalOpen}
        onClose={() => setIsVaastuModalOpen(false)}
        design={currentDesign}
        facing={facingDirection}
        hasPooja={hasPooja}
      />

      <MunicipalComplianceModal
        isOpen={isMunicipalModalOpen}
        onClose={() => setIsMunicipalModalOpen(false)}
        plotWidth={plotWidth}
        plotLength={plotLength}
        builtUpArea={builtUpSqft}
        floors={floorsCount}
      />

      <ExportDocumentationModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        canonicalDesign={currentDesign}
      />
    </div>
  );
}
