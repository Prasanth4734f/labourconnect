# Repository Audit: LabourConnect AI Engine

**Project:** LabourConnect AI Engine  
**Task ID:** S1-T01  
**Checkpoint:** LC-S1-CP-0002  
**Date:** 2026-10-20  
**Status:** Complete  

---

## 1. Executive Summary

This repository audit analyzes the current LabourConnect application structure, frameworks, entry points, design generation workflows, data models, authentication mechanisms, and testing setups. It establishes baseline facts and classifies components into standardized maturity states to ensure Sprint 1 integration preserves existing working features without duplicate scaffolds.

### Classification Legend
- **CONFIRMED:** Existing, functional, and verified by direct inspection or execution.
- **PARTIALLY_IMPLEMENTED:** Partially built or disconnected from the active pipeline.
- **MISSING:** Not present in the repository.
- **UNVERIFIED:** Present but unvalidated.

---

## 2. Frameworks, Runtimes, and Entry Points

### Frontend Framework & Version
- **Framework:** React 19 (`19.2.8`), React DOM (`19.2.8`)
- **Build Tool / Bundler:** Vite 8 (`8.3.0`)
- **Key Frontend Dependencies:** `lucide-react` (`^1.51.0`), `canvas-confetti` (`^1.9.4`), `@vitejs/plugin-react` (`^6.1.1`), `oxlint` (`^1.81.0`)
- **Configuration File:** `buildmate-app/package.json`
- **Classification:** `CONFIRMED`

### Backend Framework & Version
- **Backend Service:** None. The repository currently contains zero backend services (no Express, FastAPI, Django, Flask, etc.).
- **Classification:** `MISSING`

### Frontend Application Entry Points
- **HTML Document Root:** `buildmate-app/index.html` (mounts `<div id="root">`)
- **JavaScript Bootstrap:** `buildmate-app/src/main.jsx` (initializes React 19 root and renders `<App />`)
- **Root Screen Orchestrator:** `buildmate-app/src/App.jsx` (coordinates top-level state, navigation tabs, role authorization, and modals)
- **Classification:** `CONFIRMED`

### Backend Application Entry Points
- **Backend Entry File:** None.
- **Classification:** `MISSING`

---

## 3. Architectural Design Workflow

### Navigation & Screen Hierarchy
```
User Navigation (HomeScreen / Header)
         ↓
  Active Nav: 'ai-studio' or 'design'
         ↓
  AiHouseDesignScreen.jsx (src/components/ai-studio/)
         ├── Workspace A: "Design My Home" (Architectural Engine)
         └── Workspace B: "Interior Design" (Interior Reimaginer)
```

### Prompt Submission to Generation Pipeline
1. **User Input:** User enters natural-language prompt or adjusts structured controls (plot dimensions, floors, BHK, facing direction, budget, amenities).
2. **Interactive Analysis:** `handlePromptChange` in `AiHouseDesignScreen.jsx` calls `analyzeArchitecturalPrompt()` from `src/utils/promptArchitectureAnalyzer.js` to extract parameters and update UI controls.
3. **Feasibility Gate:** `handleAnalyseRequirements` calls `interpretRequirements()` from `src/engine/interpreter/requirementInterpreter.js`. If plot dimensions are physically impossible (e.g. plot < 15×20 ft or BHK cannot fit envelope), it halts with structured errors.
4. **Generation Execution:** `handleGenerateHomeDesign` invokes `executeGenerationPipeline()`:
   - Calls `designEngine.generateVariations(rawInputs)` in `src/engine/index.js`.
   - The engine generates candidate layouts via `generateLayout()`, checks boundary containment via `validateLayoutConstraints()`, checks duplicate similarity via `checkDuplicateAgainstHistory()`, and produces a Canonical Design JSON.
   - The frontend wraps the result with `enrichEngineDesign()`.
5. **Output Display Tabs:**
   - **`[2D Design (All Angles)]`:** Renders `Architectural2dAllAnglesViewer.jsx` displaying Top Plan, Front Elevation, Side Elevation, Rear Elevation, and Cross-Section.
   - **`[3D Design]`:** Renders `Interactive3dEngine.jsx` with solar daylight slider and material selection.
   - **`[4K Walkthrough]`:** Renders `CinematicWalkthroughStudio.jsx`.
- **Classification:** `CONFIRMED`

---

## 4. Architectural Feature Implementations

### API Routes & Network Layer
- **Status:** There are zero HTTP endpoints, REST routes, GraphQL queries, or WebSocket connections in the repository. No `fetch` or `axios` calls exist in `src/`. All calculations and layout logic run synchronously/asynchronously inside the browser runtime.
- **Classification:** `MISSING` (Client-Side In-Memory Execution)

### 2D Floor-Plan Generation Implementation
- **Canonical Algorithmic Generator:** `buildmate-app/src/engine/generator/layoutGenerator.js` implements a 3-band functional division algorithm (Front: Portico/Foyer, Mid: Lounge/Dining/Pooja/Courtyard, Rear: Kitchen/Bedroom/Bath) with vertical stairwell alignment across floors. (`CONFIRMED`)
- **2D Technical CAD Viewer:** `buildmate-app/src/components/ai-studio/Architectural2dAllAnglesViewer.jsx` dynamically inspects `design.floors[...].rooms` and renders vector floor plans with room labels, dimensions, structural columns, and elevation projections. (`CONFIRMED`)
- **Legacy Procedural Generator:** `buildmate-app/src/data/houseDesignGenerator.js` generates static room schedules and pairs them with fixed images. (`PARTIALLY_IMPLEMENTED`)
- **Realistic Top-Down Renderer:** `buildmate-app/src/components/ai-studio/RealisticFloorPlanRenderer.jsx` uses hardcoded SVG layout templates for BHK >= 3. (`PARTIALLY_IMPLEMENTED`)

### 3D Modeling and Rendering Implementation
- **Procedural 3D Geometry Pipeline:** `buildmate-app/src/engine/geometry/procedural3dGenerator.js` procedurally builds 3D bounding geometry (slabs, extruded walls, fenestration openings, stair flights, column pillars) strictly derived from the canonical design JSON. (`CONFIRMED`)
- **Interactive 3D Visualizer:** `buildmate-app/src/components/ai-studio/Interactive3dEngine.jsx` provides orbit rotation, zoom, and daylight simulation, but renders hardcoded SVG `<polygon>` coordinates disconnected from the canonical 3D geometry. (`PARTIALLY_IMPLEMENTED`)
- **Walkthrough Viewer:** `buildmate-app/src/components/ai-studio/CinematicWalkthroughStudio.jsx` displays a slideshow of static Unsplash photos rather than traversing the planned waypoints. (`PARTIALLY_IMPLEMENTED`)
- **Three.js / WebGL / Blender Cycles Pipeline:** Not integrated. Blender is not found in system PATH. (`MISSING`)

---

## 5. Database, Storage, and Security

### Database Models & Asset Storage
- **Database:** None. No relational or document database is configured.
- **Data Persistence:** Transient in-memory state via React hooks (`useState`) and singleton instance history (`designEngine.history`).
- **File Storage:** Static public assets in `buildmate-app/public/generated-designs/`. No private object storage (S3/MinIO) configured.
- **Classification:** `MISSING`

### Authentication & Authorization Boundaries
- **RBAC Matrix:** `buildmate-app/src/utils/rbac.js` defines platform roles (`Customer`, `Engineer`, `Contractor`, `Supplier`, `Equipment`, `BankLoan`, `Admin`) with permissions and nav profiles.
- **Auth UI:** `buildmate-app/src/components/auth/AuthModal.jsx` allows role switching for testing different portal experiences.
- **Backend Security:** No backend token/JWT verification exists because no backend exists.
- **Classification:** `CONFIRMED` (Client-Side Mock RBAC)

---

## 6. Testing, Tooling, and Deployment

### Automated Tests
- **Test File:** `buildmate-app/src/engine/__tests__/engineCore.test.js`
- **Execution:** Node.js standalone test runner (`node src/engine/__tests__/engineCore.test.js`).
- **Verified Results:** 25 Passed, 0 Failed.
- **Coverage:** Feasibility validation, multi-variation generation, structural similarity (< 82%), boundary containment, 2D/3D parity, continuous walkthrough waypoints, version revision, and deterministic BOQ estimation.
- **Classification:** `CONFIRMED`

### Deployment & Packaging Configuration
- **Web Build:** `npm run build` runs `vite build`, outputting to `buildmate-app/dist/`.
- **Mobile Packaging:** `buildmate-app/capacitor.config.json` configures Capacitor for Android packaging (`appId: "com.labourconnect.app"`).
- **Classification:** `CONFIRMED`

---

## 7. Reusable Components vs Duplications & Risks

### Reusable Components to Preserve
1. `src/components/ai-studio/AiHouseDesignScreen.jsx`: Core UI container, parameter controls, layer toggles, version history.
2. `src/components/ai-studio/Architectural2dAllAnglesViewer.jsx`: Multi-angle 2D CAD viewer that cleanly renders canonical design rooms.
3. `src/engine/schema/canonicalDesignSchema.js`: Canonical Schema v2.0 contract.
4. `src/engine/interpreter/requirementInterpreter.js`: Deterministic prompt interpreter and feasibility checker.
5. `src/engine/evaluation/constraintValidator.js`: Containment, overlap, and vertical alignment validator.
6. `src/engine/evaluation/similarityEngine.js`: Graph and centroid similarity duplicate rejector.
7. `src/engine/estimation/deterministicBoqEngine.js`: Physical quantity takeoff calculator.
8. Domain Modals: `VaastuReportModal.jsx`, `BoqLiveIndianRatesModal.jsx`, `StructuralMepModal.jsx`, `MunicipalComplianceModal.jsx`.

### Overlapping / Duplicate Services
- **Prompt Analysis:** `src/utils/promptArchitectureAnalyzer.js` and `src/engine/interpreter/requirementInterpreter.js` perform overlapping regex prompt extraction.
- **AI Design Screens:** `AiHouseDesignScreen.jsx` is the active screen; `LandToArchitectureStudio.jsx` and `AiDesignScreen.jsx` are earlier duplicate prototypes.
- **2D Viewers:** `Architectural2dAllAnglesViewer.jsx`, `Realistic2dDesignStudio.jsx`, and `CadBlueprintCanvas.jsx` contain overlapping 2D plan rendering code.
- **3D Viewers:** `Interactive3dEngine.jsx` and `Elevation3DViewer.jsx` (the latter is a thin 11-line wrapper around the former).

### Technical Debt and Architectural Risks
1. **Rendering Disconnect:** The 3D viewer and walkthrough viewer do not consume the canonical design model; they render hardcoded SVG polygons and stock photos.
2. **3-Band Heuristic Limitation:** The current layout generator uses a fixed 3-band functional division. While effective for simple rectangular plots, it cannot handle complex L-shaped, narrow-frontage, or non-orthogonal site boundaries.
3. **Absence of Backend Queue:** If intensive combinatorial solving or raytraced 3D rendering is added in later sprints, client-side execution could block the main UI thread.
