# Design Repetition Audit: LabourConnect AI Engine

**Project:** LabourConnect AI Engine  
**Task ID:** S1-T02  
**Checkpoint:** LC-S1-CP-0003  
**Date:** 2026-10-20  
**Status:** Complete  

---

## 1. Investigation Objective

Determine with verifiable code evidence the exact mechanism causing the application to return a limited set of repeated, predefined architectural designs across materially different user prompts.

---

## 2. Complete Prompt-to-Output Flow

Tracing a user prompt from input to rendered pixels reveals the following deterministic execution chain:

```
Step 1: User enters prompt in HomeScreen or AiHouseDesignScreen
         ↓
Step 2: handlePromptChange (AiHouseDesignScreen.jsx: L212)
         └── Calls analyzeArchitecturalPrompt(text) in promptArchitectureAnalyzer.js
         └── Sets state: bhkCount, floorsCount, plotWidth, plotLength, archStyle, facingDirection
         ↓
Step 3: handleAnalyseRequirements (AiHouseDesignScreen.jsx: L237)
         └── Calls interpretRequirements(inputs) in requirementInterpreter.js
         └── Checks feasibility (halts if plot dimensions are impossible)
         ↓
Step 4: executeGenerationPipeline (AiHouseDesignScreen.jsx: L350)
         └── Calls designEngine.generateVariations(rawInputs) in src/engine/index.js
         └── layoutGenerator.js generates procedural rooms
         └── constraintValidator.js validates containment & non-overlap
         └── similarityEngine.js validates uniqueness against history (< 82% similarity)
         └── procedural3dGenerator.js generates procedural 3D slabs, walls, columns
         ↓
Step 5: enrichEngineDesign (AiHouseDesignScreen.jsx: L303)  <-- THE PRIMARY REPETITION INJECTION
         └── Calls generateHouseDesignVariation(inputs, varIndex) in houseDesignGenerator.js
         └── OVERWRITES/INJECTS legacyFallback.isoModel (5 fixed images)
         └── OVERWRITES/INJECTS legacyFallback.elevationModel (2 fixed images)
         └── OVERWRITES/INJECTS legacyFallback.roomSchedule
         ↓
Step 6: UI Renderers Mount
         ├── 2D Tab: Architectural2dAllAnglesViewer.jsx (reads design.floors)
         ├── 3D Tab: Interactive3dEngine.jsx (ignores design; draws hardcoded SVG polygons)
         └── Walkthrough Tab: CinematicWalkthroughStudio.jsx (ignores design; shows Unsplash photos)
```

---

## 3. Four Verified Root Causes

The investigation confirms that design repetition is **not caused by caching or external network failures**. It is caused by **four explicit, hardcoded mechanisms in the frontend codebase**:

### Root Cause 1: Fixed Reference Asset Gallery
**File:** `buildmate-app/src/data/houseDesignGenerator.js` (Lines 14–111)  
The system maintains a fixed JavaScript array `REFERENCE_3D_ISOMETRICS` containing only **5 static images**:
1. `/generated-designs/iso_cutaway_3bhk_modern.png` (`iso-3bhk-modern`)
2. `/generated-designs/narrow_plot_15x40_dim.png` (`iso-narrow-15x40`)
3. `/generated-designs/iso_villa_carporch.png` (`iso-villa-carporch`)
4. `/generated-designs/iso_compact_duplex.png` (`iso-compact-duplex`)
5. `/generated-designs/topdown_luxury_arch.png` (`topdown-luxury-arch`)

And `REFERENCE_ELEVATIONS` contains only **2 static images**:
1. `/generated-designs/elevation_travertine_villa.jpg` (`elev-travertine`)
2. `/generated-designs/elevation_timber_minimalist.jpg` (`elev-timber-minimalist`)

These image files are physically stored as static files in `buildmate-app/public/generated-designs/`.

### Root Cause 2: Modulo Index Selection
**File:** `buildmate-app/src/data/houseDesignGenerator.js` (Lines 148–160)  
The selection of which image to display is computed by a modulo formula over the 5 items:
```javascript
const plotRatio = plotLength / Math.max(plotWidth, 1);
let isoIndex = (variationIndex + Math.floor(plotRatio)) % REFERENCE_3D_ISOMETRICS.length;
if (plotWidth <= 20) {
  isoIndex = 1; // Narrow 15x40 reference
} else if (hasParking && (isoIndex === 1)) {
  isoIndex = 2; // Villa with car porch
}
const isoModel = REFERENCE_3D_ISOMETRICS[isoIndex] || REFERENCE_3D_ISOMETRICS[0];
const elevIndex = (variationIndex + (archStyle === 'minimalist' ? 1 : 0)) % REFERENCE_ELEVATIONS.length;
const elevationModel = REFERENCE_ELEVATIONS[elevIndex] || REFERENCE_ELEVATIONS[0];
```
- Any plot with width $\le 20$ ft always receives Image 1 (`narrow_plot_15x40_dim.png`).
- Any plot with parking where `isoIndex === 1` always receives Image 2 (`iso_villa_carporch.png`).
- Any other combination cycles through Images 0, 3, or 4 based on aspect ratio modulo 5.
- Therefore, thousands of distinct prompts collapse into at most 5 visual isometric outputs.

### Root Cause 3: Frontend Overwrite via `enrichEngineDesign()`
**File:** `buildmate-app/src/components/ai-studio/AiHouseDesignScreen.jsx` (Lines 303–348)  
Even though `LabourConnectDesignEngine` generates an authentic algorithmic layout with genuine geometric coordinates, the frontend wrapper immediately overwrites or pairs it with legacy static templates:
```javascript
const enrichEngineDesign = (canonicalDesign, varIndex = 0) => {
  const legacyFallback = generateHouseDesignVariation(..., varIndex);
  return {
    ...legacyFallback,
    ...canonicalDesign,
    isoModel: legacyFallback.isoModel,          // Forces static 5-item gallery
    elevationModel: legacyFallback.elevationModel,  // Forces static 2-item gallery
    roomSchedule: legacyFallback.roomSchedule,    // Injects static room schedule
    boqBreakdown: legacyFallback.boqBreakdown,
    vaastuReport: legacyFallback.vaastuReport
  };
};
```
Furthermore, if `designEngine.generateVariations()` returns an error or empty result, line 405 explicitly falls back:
```javascript
const newVar = generateHouseDesignVariation(rawInputs, variationIndex);
```
silently reverting to the static demo template without informing the user.

### Root Cause 4: Disconnected Visualizer Viewers
1. **Interactive 3D Engine (`Interactive3dEngine.jsx`, Lines 638–750):**  
   The 3D viewer does not accept `design={currentDesign}`. It only receives scalar props (`budgetInr`, `bhk`, `floors`, `plotWidth`, `plotLength`) and draws hardcoded SVG `<polygon>` coordinates. If `budgetInr <= 300000`, it draws an SVG representing a 1RK micro-home; otherwise, it draws an identical luxury villa facade for every prompt.
2. **Cinematic Walkthrough (`CinematicWalkthroughStudio.jsx`, Lines 43–110):**  
   The walkthrough viewer plays a slideshow of 6 static Unsplash stock photos (`https://images.unsplash.com/...`), completely disconnected from generated room plans or waypoints.
3. **Realistic Floor Plan Renderer (`RealisticFloorPlanRenderer.jsx`, Lines 155–230):**  
   Contains a hardcoded set of 7 rooms with static percentage dimensions (`houseW * 0.32`, `houseH * 0.44`) that produce identical layouts for any request with `bhk >= 3`.

---

## 4. Origin of the Repetition

| Architectural Layer | Contributing to Repetition? | Evidence |
|---|---|---|
| **Frontend UI Layer** | **YES (Primary)** | `enrichEngineDesign()` injects static images; `Interactive3dEngine` renders hardcoded SVG; `CinematicWalkthroughStudio` renders static photos. |
| **Data Layer** | **YES (Primary)** | `houseDesignGenerator.js` defines static 5-item gallery and modulo selector. |
| **Algorithmic Engine (`src/engine/`)** | **PARTIAL** | `layoutGenerator.js` generates distinct rooms, but only has 2 functional variation archetypes (stair/portico left vs right). |
| **Backend Service Layer** | **NO** | No backend exists; no caching or stale server responses. |
| **Database / Storage Layer** | **NO** | No database exists. |
| **External AI API** | **NO** | No external hosted AI APIs are called. |

---

## 5. Smallest Appropriate Future Fix (Recommended for Sprint 2 & 3)

1. **Sever Legacy Fallback Overwrite:**  
   In `AiHouseDesignScreen.jsx`, decouple `enrichEngineDesign()` from `generateHouseDesignVariation()`. Allow the Canonical Design JSON to pass directly to viewers without injecting `isoModel` or `elevationModel`.
2. **Standardize on `Architectural2dAllAnglesViewer.jsx`:**  
   The multi-angle 2D CAD viewer already correctly reads `design.floors[...].rooms` and renders dynamic vector floor plans and elevations.
3. **Bind 3D Viewer to Canonical Geometry:**  
   Pass `design.geometry3d` (generated by `procedural3dGenerator.js`) into a procedural 3D viewer (or WebGL canvas) so the 3D model reflects the actual rooms, walls, and slabs.
4. **Bind Walkthrough to Trajectory Waypoints:**  
   Pass `design.walkthroughTrajectory.waypoints` into `CinematicWalkthroughStudio.jsx` so the camera traverses the generated room sequence.
5. **Clear Separation of Demo Mode:**  
   Retain the 5 static cutaway illustrations as an explicit "Reference Gallery / Design Inspiration" tab, but strictly prevent the engine from returning them as generated results.
