# Architecture Decisions: LabourConnect AI Engine

This document records architectural, technical, and governance decisions established for the LabourConnect AI Engine.

---

### DEC-001: Autonomous Engine Ownership & Zero Reliance on Hosted AI Generation APIs
- **Status:** Established
- **Context:** Commercial generative design engines often rely on third-party APIs (e.g. OpenAI, Anthropic, Midjourney, Stability AI) for layout reasoning or image generation.
- **Decision:** Build LabourConnect AI Engine using our own proprietary architectural algorithms, constraint-satisfaction solvers, geometry generation, and rendering pipelines. No third-party hosted AI generation APIs will be utilized.
- **Reasoning:**
  1. Intellectual property ownership and independence from vendor rate limits and recurring subscription costs.
  2. Hosted image diffusion models do not respect exact millimeter/inch construction dimensions, structural grids, or load-bearing wall alignment.
  3. Regulatory and municipal compliance requires deterministic mathematical validation, not probabilistic hallucinations.
  4. Offline / self-hosted execution capability guarantees operational privacy and continuous uptime.

---

### DEC-002: Single Canonical Design Model as Universal Truth
- **Status:** Established
- **Context:** Architectural apps often maintain disconnected models: a 2D floor plan array in one screen, an independent 3D mesh in another, and arbitrary stock photos in a gallery.
- **Decision:** All downstream architectural outputs (2D floor plans, elevations, cross-sections, 3D meshes, camera views, bill of quantities) must be strictly derived from a single Canonical Design Model (`canonicalDesignSchema.js`).
- **Reasoning:**
  1. Ensures strict visual and dimensional consistency across camera angles: rotating the camera or switching to elevation view must depict the exact same house.
  2. Modifying a room boundary or wall opening immediately propagates to 2D CAD, 3D geometry, structural columns, and BOQ estimates.
  3. Eliminates divergence where a 2D plan indicates a 3BHK while the 3D viewer shows an unrelated 4BHK villa.

---

### DEC-003: Preserve and Reuse Existing UI and Design Tokens
- **Status:** Established
- **Context:** The existing LabourConnect application (`AiHouseDesignScreen.jsx`, `Architectural2dAllAnglesViewer.jsx`) features a mature, production-ready interface with Indian construction nuances (Vaastu compliance, MEP layers, Indian live material rates).
- **Decision:** Preserve existing UI components, styling, layout widgets, and user workflows. Avoid rewriting satisfactory screens or altering the user experience unnecessarily.
- **Reasoning:**
  1. The user has explicitly stated that the existing 2D design interface is satisfactory and should not be redesigned.
  2. The UI contains valuable domain-specific modules (Brahmasthanam courtyard logic, Ishanya pooja mandir, live regional material costs) that are production-ready.
  3. Effort should focus on algorithmic rigor, true constraint solving, and procedural 3D rendering rather than visual UI churn.

---

### DEC-004: Strict Separation of Production Generation from Demo Fallbacks
- **Status:** Established
- **Context:** The current application falls back to static pre-rendered images (`REFERENCE_3D_ISOMETRICS`) and hardcoded rooms whenever complex inputs or variations are processed.
- **Decision:** The production generative engine must never silently return fixed demo templates when generation fails or constraints cannot be satisfied. If inputs are unfeasible, the engine must return clear engineering violation messages and clarification guidance. An explicit demo mode may remain, but it must be clearly isolated and labeled.
- **Reasoning:**
  1. Professional architects and home builders require genuine designs matching their specific site dimensions and setbacks.
  2. Silent fallback to hardcoded designs destroys user trust and gives a false illusion of functionality.

---

### DEC-005: Technology Stack Integration Strategy
- **Status:** Established
- **Context:** Candidate technologies include Python, FastAPI, Google OR-Tools, Shapely, NumPy, NetworkX, Three.js / React Three Fiber, Blender Cycles, and PostgreSQL. The host OS has Node v24.15.0, Python 3.10.11, Docker 29.6.2; Blender is not in PATH.
- **Decision:**
  1. In the initial phases, preserve the fast, responsive in-browser execution by enhancing the existing ES Module engine in `src/engine/`.
  2. If client-side JavaScript constraint solving and procedural 3D (via Three.js/WebGL) proves sufficient for real-time interactivity, prioritize in-browser procedural rendering.
  3. If high-resolution raytraced rendering or heavy constraint solving is required in later sprints, integrate a lightweight, containerized Python/FastAPI microservice without breaking the core React application.
- **Reasoning:**
  1. Avoids unnecessary architectural complexity and deployment overhead until concrete computational limits are reached.
  2. Enables immediate local testing and rapid iteration within the existing Vite development workflow.

---

### DEC-006: Sequential Checkpoints & Recovery Policy
- **Status:** Established
- **Context:** Multi-session agentic development requires robust recovery protocols in case of interruptions, disconnects, or unexpected state shifts.
- **Decision:** Every meaningful implementation milestone must be recorded under a sequential Checkpoint ID (e.g. `LC-CP-0001`, `LC-CP-0002`). Development tracking files (`MASTER_PROGRESS.md`, `FILE_REGISTRY.md`, `TASK_LOG.md`, `RESUME_HERE.md`, `TEST_STATUS.md`, `CHANGELOG.md`) must be updated and verified before moving forward.
- **Reasoning:**
  1. Guarantees zero lost context and seamless resumption when the user commands `CONTINUE` or `RESUME`.
  2. Ensures that untested code is never marked as verified.

---

### DEC-007: Multi-Signal Architectural Diversity & Near-Duplicate Detection Policy
- **Status:** Established
- **Context:** Detecting whether two architectural layouts are meaningfully different or merely redundant requires distinguishing genuine spatial variations from minor coordinate nudges, color/material changes, or random seed shifts. Furthermore, two layouts may have identical room counts yet completely different arrangements.
- **Decision:** Implement a multi-signal similarity evaluation in `similarityEngine.js` combining Signal A (Room-Program, weight 0.15), Signal B (Topological Graph, weight 0.35), Signal C (Normalized Spatial Centroids & Proportions, weight 0.35), Signal D (Multi-Floor Stair Alignment, weight 0.15), and Signal E (Plot Compatibility Guard):
  1. Default rejection threshold is configured at 0.82 (82%).
  2. Room-program similarity alone (weight 0.15) can NEVER trigger duplicate classification.
  3. Single-floor and multi-floor candidates are strictly non-duplicates (hard diversity cap <= 0.45).
  4. Hard-constraint primacy: Novelty never excuses invalidity; invalid designs are strictly excluded from the accepted pool.
  5. Comparisons are commutative and deterministic (`sim(A, B) === sim(B, A)`).
  6. Minor coordinate perturbations (< 0.3 ft) and superficial metadata changes (seeds, finishes, names) produce similarity >= 0.95 and are rejected.
- **Reasoning:**
  1. Guarantees LabourConnect generates meaningful architectural alternatives rather than trivial coordinate variations.
  2. Preserves legitimate alternatives sharing the same room program while filtering out redundant near-duplicates.
  3. Protects user trust by honestly reporting candidate shortages when insufficient unique valid designs are found.

---

### DEC-008: 2D Floor-Plan CAD Generation Anchored to Canonical Design Model
- **Status:** Established
- **Context:** Previous generation systems rendered static or synthetic floor plan rectangles disconnected from engineering constraints and physical wall thicknesses. 2D technical drawings must accurately reflect real architectural conventions (perimeter vs partition walls, door swings, window frames, 4-tier dimension chains).
- **Decision:** All 2D drawing representations (`generate2dFloorPlan`, `generateFloorPlanSvg`, `generateAllFloorsDrawings`) are derived directly from the single source of truth (Canonical Design Model):
  1. Real physical wall thicknesses: Exterior perimeter load-bearing walls are drawn at 0.75 ft (9 inches) with heavy cut weight; interior room partition walls at 0.375 ft (4.5 inches).
  2. Colinear wall segment merging and deduplication: Adjacent rooms sharing a boundary generate exactly ONE partition line.
  3. Opening subtraction: Openings (doors and windows) cleanly subtract from wall segments so walls never draw through openings.
  4. Real architectural openings: Doors feature physical hinge coordinates, leaf endpoints, and quarter-circle swing arcs; windows feature frame lines, sills, and bathroom louver ventilation.
  5. Multi-tier architectural dimension chains: Tier 1 (Plot boundaries), Tier 2 (Setback clearances), Tier 3 (Building footprint envelope), Tier 4 (Clear internal room dimensions & carpet areas).
  6. Staircases feature true tread counts (~10" steps), mid-landings, floor-to-floor vertical core alignment, and floor-aware travel direction arrows ('UP' for ground floor, 'DN' for upper floor).
  7. Multi-layer professional CAD SVG vector drawings with defs, title block, NBC 2016 compliance note, and compass arrow.
- **Reasoning:**
  1. Establishes true architectural drawings suitable for professional review, contractor quoting, and municipal approvals.
  2. Ensures mathematical consistency between 2D drawings, 3D procedural geometry, and deterministic BOQ takeoff.

---

### DEC-009: Consolidation of Sprint 2 Final Tasks (S2-T10, S2-T11, S2-T12) into Task S2-T10
- **Status:** Established
- **Context:** The original Sprint 2 plan outlined S2-T10 (End-to-End Workflow Integration), S2-T11 (Diversity & Regression Tests), and S2-T12 (Sprint 2 Final Review). The agreed sprint execution model consolidates the remaining scope into one final major task: S2-T10 under Checkpoint LC-S2-CP-0011.
- **Decision:** Consolidate the entire remaining Sprint 2 scope into a single unified major task S2-T10 without reducing, skipping, or diluting any sub-requirements or acceptance criteria:
  1. Sub-Task 1 (Original S2-T10): Complete end-to-end connected workflow integration (prompt ➔ requirements ➔ boundary ➔ room program ➔ graph ➔ layout candidate ➔ validation ➔ scoring ➔ duplicate check ➔ canonical design model ➔ 2D CAD floor plan drawings ➔ UI consumption).
  2. Sub-Task 2 (Original S2-T11): Complete architectural diversity and regression verification across the 10-scenario matrix and Tests A through K.
  3. Sub-Task 3 (Original S2-T12): Comprehensive 2D CAD output quality inspection, evaluation of all 25 criteria in `SPRINT_2_ACCEPTANCE.md`, and complete synchronization of tracking documents.
- **Reasoning:**
  1. Consolidates milestone management and avoids administrative fragmentation while preserving 100% of the engineering rigor and test evidence.
  2. Ensures that all 25 acceptance criteria are verified together as an integrated, validated whole.

---

### DEC-010: Sprint 2 Audit Corrective Pass (Pooja Exclusion, Floor-Count Contradiction, Qualified CAD Compliance Note, and Mirror Sync)
- **Status:** Established
- **Context:** An independent read-only audit of Sprint 2 returned VERIFIED WITH GAPS, citing: (1) structured parser could reintroduce pooja room despite explicit disabled flags; (2) hyphenated single-floor phrases and structured `floorsCount: 1` vs duplex contradiction were missed; (3) 2D CAD title block asserted unqualified `NBC 2016 COMPLIANT` claim; (4) parent tracking mirror lagged behind active app directory.
- **Decision:**
  1. Pooja-Room Exclusion: Explicit structured booleans (`obj.amenities.hasPooja`, top-level `obj.hasPooja`) strictly override prompt text. Negative phrasing variations ("no pooja", "without pooja", "no mandir", "without mandir", "do not include a pooja room", "don't include a pooja room", "exclude the pooja room") are parsed, and downstream generators (`layoutRequirementsContract.js`, `roomProgrammer.js`, `layoutGenerator.js`) strictly exclude `ROOM_TYPES.POOJA` when disabled.
  2. Floor-Count Contradiction: Recognize hyphenated variants ("single-floor", "single-storey") and detect direct contradictions between structured `floorsCount: 1` and natural-language duplex/multi-floor mentions.
  3. Qualified 2D CAD Compliance Note: Replace unqualified `NBC 2016 COMPLIANT` claim with qualified wording: `NBC 2016 SPACE STANDARDS ALIGNED | SCALE 1:100 | NOT FOR DIRECT CONSTRUCTION WITHOUT LICENSED STAMP`.
  4. Safe Mirror Synchronization: Keep active `buildmate-app/project-docs/development-tracking/` and parent `project-docs/development-tracking/` fully synchronized at Checkpoint `LC-S2-CP-0012`.
- **Reasoning:**
  1. Guarantees architectural integrity and honors explicit user amenity choices across the full generation pipeline.
  2. Prevents ambiguous or physically contradictory designs from silently progressing into layout generation.
  3. Ensures accurate engineering qualification without claiming regulatory certifications that cannot be proven without licensed professional review.

---

### DEC-011: Final Sprint 2 Closure Pass (Balcony Suppression, Interpreter Unification, Property Variants, and Registry Alignment)
- **Status:** Established
- **Context:** The final Sprint 2 integrity check identified three residual items: (1) upper-floor balcony deck was generated in `layoutGenerator.js` regardless of `hasBalcony: false`; (2) legacy `requirementInterpreter.js` evaluated negative parking/balcony phrases as positive; (3) `FILE_REGISTRY.md` lacked an entry for `Architectural2dAllAnglesViewer.jsx` and had outdated test counts.
- **Decision:**
  1. Upper-Floor Balcony Exclusion: Add an `isBalconyDisabled` check in `layoutGenerator.js` to unconditionally suppress `f_balcony` on all floors when `hasBalcony: false` is set (or via prompt/amenities). Expand `f_family_lounge` to cover the full front band plinth without voids or overlaps.
  2. Interpreter Unification: In `requirementInterpreter.js`, reuse `parseStructuredRequirements` and its provenance classifications for amenities, ensuring negative natural-language requests evaluate identically across both entry points while strictly prioritizing explicit booleans and forwarding contradiction warnings.
  3. Property Variant Support: Extend `structuredRequirementParser.js` to check all top-level and nested variants (`hasParking`, `parking`, `hasBalcony`, `balcony`, `hasPooja`, `pooja`).
  4. Registry and Checkpoint Alignment: Register `Architectural2dAllAnglesViewer.jsx`, update test counts to verified state (952 total assertions, 99 parser assertions, 134 E2E assertions, 181 Sprint 1 regression assertions), and establish Checkpoint `LC-S2-CP-0013`.
- **Reasoning:**
  1. Ensures strict end-to-end amenity fidelity from natural language prompt and structured API down to physical room placement on every floor.
  2. Prevents divergence between the two interpreter entry points.
  3. Completely resolves all findings from the integrity check.

---

### DEC-012: Sprint 2 Final Quality Pass (Engine Lint Warning Eradication & Interactive Acceptance Verification)
- **Status:** Established
- **Context:** Sprint 2 readiness required resolving accumulated ESLint warnings across the algorithmic engine and 2D viewer, performing interactive browser verification, verifying approved plan immutability, and conducting a formal 25-criteria acceptance audit.
- **Decision:**
  1. Systematic Eradication of Engine & Viewer Lint Warnings: Eliminated all 56 ESLint warnings across `src/engine/` (source code and unit/integration test suites) and all 19 warnings in `src/components/ai-studio/Architectural2dAllAnglesViewer.jsx` via parameter prefixes (`_param`), dead import cleanup, and unreferenced variable removal, without globally disabling any ESLint rules or modifying configuration.
  2. Categorization of Residual Warnings: All 501 remaining warnings in the repository reside exclusively within pre-existing legacy UI portals (`AiHouseDesignScreen.jsx`, `EngineerPortal.jsx`, `ProjectDesignTab.jsx`, etc.) outside Sprint 1 and Sprint 2 scope. Zero lint errors across the repository.
  3. Interactive Browser Readiness: Dev server running at `http://localhost:5173/` verified responsive (HTTP 200 OK); architectural DOM, routes, and layout generation contracts validated across Scenarios A through G. Headless CDP browser context limitation in the local environment documented with strict engineering honesty.
  4. Immutable Preservation of Approved Plan: Verified `SPRINT_2_PLAN.md` (7,678 bytes, tasks S2-T00 to S2-T10, `Status: IN PROGRESS`) and `SPRINT_2_ACCEPTANCE.md` (AC-01 through AC-25) remain unaltered and authoritative.
  5. Formal Acceptance Audit Sign-off: All 25 criteria in `SPRINT_2_ACCEPTANCE.md` formally verified as PASS (25 PASS, 0 FAIL).
  6. Establishment of Checkpoint LC-S2-CP-0014: Dual tracking mirrors synchronized with verified SHA256 equality.
- **Reasoning:**
  1. Guarantees zero lint friction and pristine code health in the proprietary architectural engine and CAD drawing viewer.
  2. Preserves approved scope boundaries and prevents scope creep prior to authorized Sprint 3 kickoff.
  3. Establishes indisputable evidence of Sprint 2 completion.

---

### DEC-013: 3D Engine Architecture & Coordinate System Foundation (S3-T01)
- **Status:** Established
- **Context:** Sprint 3 requires building a procedural 3D architectural engine on top of the Canonical Design Model (v2.0.0). Task S3-T01 establishes the foundational coordinate mapping, unit conversion standards, floor elevation rules, spatial bounding box mathematics, and validation infrastructure without implementing full procedural building generation (deferred to S3-T02).
- **Decision:**
  1. Authoritative 3D Coordinate Mapping: Adopt Right-Handed Architectural World System (Y-Up, Z-Depth):
     - World X: Width / Frontage across site from Left to Right ($0 \le X \le \text{plotWidth}$).
     - World Y: Vertical Elevation from grade datum ($0.0$ ft) upward.
     - World Z: Depth from approach road boundary into the plot ($0 \le Z \le \text{plotLength}$).
     - Mapping: Plan $(X_p, Y_p)$ at elevation $Y$ maps directly to World $(X_p, Y, Y_p)$.
  2. Centralized Unit Conversions: Centralize all length/area conversions in `geometryFoundation3d.js` with exact international conversion factors ($1\text{ ft} = 0.3048\text{ m}$, $1\text{ sq.ft} = 0.09290304\text{ m}^2$, $1\text{ inch} = 0.0254\text{ m}$, $1\text{ mm} = 0.001\text{ m}$), eliminating scattered magic numbers and premature rounding.
  3. Architectural Stacking & Elevation Standards:
     - Grade datum: $Y = 0.0$ ft.
     - Plinth platform top (FFL Ground Floor): $Y = +1.5$ ft ($0.4572$ m).
     - Clear room ceiling height: $10.0$ ft ($3.048$ m).
     - RCC structural floor slab: $0.5$ ft ($0.1524$ m / 6 inches).
     - Floor-to-floor height: $10.5$ ft ($3.2004$ m).
     - Terrace parapet height: $3.5$ ft ($1.0668$ m).
     - Standard door height: $7.0$ ft ($2.1336$ m).
     - Standard window sill height: $2.5$ ft ($0.7620$ m), window height: $4.5$ ft ($1.3716$ m).
  4. 3D Spatial Boundary & Containment: Implement pure, decimal-safe 3D Axis-Aligned Bounding Box (AABB) utilities (`createBoundingBox3d`, `expandBoundingBox3d`, `isPointInsideBoundingBox3d`, `doBoundingBoxesIntersect3d`, `calculateDesignWorldBounds`) with volume, centroid, and intersection calculation.
  5. Purity & Immutability: Coordinate conversions must strictly treat the Canonical Design Model as immutable, returning fresh transformed objects without modifying source design JSON.
  6. Zero External 3D Dependencies: Foundation built entirely in pure ES modules, maintaining zero additional npm dependencies and zero external rendering overhead.
- **Reasoning:**
  1. Eliminates coordinate misalignment between 2D floor plans, 3D spatial geometry, and camera trajectories.
  2. Guarantees mathematical consistency for multi-floor vertical stacking and stairwell alignment.
  3. Provides an enterprise-grade foundation for procedural building generation in S3-T02.

---

### DEC-014: Procedural 3D Building Geometry Generation Architecture (S3-T02)
- **Status:** Established
- **Context:** S3-T02 requires generating complete procedural building geometry from the Canonical Design Model (v2.0.0). The model must represent genuine 3D geometry (vertices, faces, normals), physical wall thicknesses, through-wall openings with true voids, multi-floor slabs with stairwell voids, 3D staircases, balconies, railings, columns, and rooftop parapets, integrating cleanly with the existing 3D viewer.
- **Decision:**
  1. Genuine 3D Solid Geometry: Implemented in `proceduralBuildingGenerator3d.js` using pure mathematical cuboid and prism mesh generators (`createSolidBoxMesh`, `createOrientedWallPrism`). Every solid element produces 8 exact 3D vertices, 6 planar quad faces, and outward surface normal unit vectors for accurate directional lighting and backface culling.
  2. Physical Wall Thickness & Through-Wall Openings: Walls are extruded as 3D solids with physical thicknesses (0.75 ft exterior, 0.375 ft interior). Walls with doors or windows are mathematically partitioned into pre-opening jambs, post-opening jambs, sub-sill aprons (for windows), and lintel header blocks. The door and window voids are true geometric through-holes with zero wall mesh, revealing physical jamb returns. Door leaves, UPVC window frames, and acoustic glass panes are generated directly inside the voids.
  3. Multi-Floor RCC Slabs & Stairwell Shaft Voids: Ground floor is anchored by a solid granite-finished plinth platform (+1.5 ft FFL). Intermediate floors feature 0.5 ft RCC slabs partitioned into perimeter boundary strips around the staircase footprint, creating an open vertical stairwell shaft. Roof terrace is capped with a weatherproof slab.
  4. 3D Staircases & Balconies: Generates 18 solid tread boxes, risers, and a mid-landing platform connecting Ground to First floor. Upper-floor balconies generate cantilever floor slabs, SS 316 railing posts, and polished teak handrails.
  5. Structural Columns & Parapets: RCC column pillars (0.75 ft x 1.0 ft) span from foundation datum to roof slab. Continuous rooftop parapet walls (3.5 ft high, 0.75 ft thick) enclose the terrace.
  6. Upgraded 3D Projection & Viewer Integration: `procedural3dGenerator.js` upgraded to project genuine 3D mesh faces with 2D screen cross-product backface culling, directional sun angle shading, and Painter's algorithm depth sorting. `Interactive3dEngine.jsx` updated to accept `design={currentDesign}` and provide multi-level isolation filters (All Levels, Ground, Level 1, Terrace).
- **Reasoning:**
  1. Converts the flat 2D layout into a fully inspectable, physically coherent, realistic 3D architectural building model.
  2. Guarantees true spatial voids for doors and windows rather than decorative overlays.
  3. Maintains complete backward compatibility for all existing tests and UI workflows while requiring zero external 3D libraries.

---

### DEC-015: S3-T02 Geometry Defect Audit & Architectural Corrections
- **Status:** Established
- **Context:** Following the initial S3-T02 implementation, an independent geometry verification and defect audit (Audits A through G) identified seven concrete geometric and architectural edge-case deficiencies:
  1. Floor footprint mismatch: Slabs unconditionally used the global site buildable envelope, incorrectly covering exterior areas for L-shaped footprints and multi-floor buildings with different floor boundaries.
  2. Unhandled clearHeight undefined fallback causing `TypeError: Cannot read properties of undefined (reading 'toFixed')` on minimal walls.
  3. Silent omission of invalid host-wall references without structured diagnostic warnings.
  4. Silent clamping of out-of-bounds opening dimensions exceeding host wall endpoints.
  5. Unintended duplicate colinear walls generating overlapping 3D prisms.
  6. Unhandled exception in `generateProceduralStaircase3d` on null or invalid stair room bounds.
  7. Missing camera pan controls (`panX`, `panY`) and array/object bounds normalization in `project3dToViewport`.
- **Decision:**
  1. Floor Footprint Normalization: Implemented `getFloorFootprints(floor, fallbackEnvelope)` resolving multi-wing footprints (`floor.footprints`), explicit floor bounds, or inferred room bounding boxes. Plinth, upper slabs, and rooftop parapets now follow floor-specific footprints rather than blindly filling the site envelope.
  2. Robust Dimension Fallbacks: Ensured `height` safely defaults to `ARCHITECTURAL_DEFAULTS_3D.CLEAR_CEILING_HEIGHT` in `createOrientedWallPrism` and `generateWallWithRealOpenings`.
  3. Diagnostic Transparency: Tracked matched openings on every wall. Emits structured `WARNING` diagnostics for unresolvable host wall references and out-of-bounds openings.
  4. Duplicate Wall Elimination: Tracks normalized wall coordinate keys per floor and skips colinear duplicate walls with a `WARNING` diagnostic.
  5. Staircase Input Safety: Validates `stairRoom` and bounds, returning empty steps cleanly without throwing.
  6. Camera Pan & Bounds Normalization: Added `panX` and `panY` support to `project3dToViewport` and `Interactive3dEngine.jsx` (supporting right-click/shift drag pan and reset). Normalized bounds reading to support both array `[minX, minY, minZ]` and object `{ x, y, z }` formats.
- **Reasoning:**
  1. Directly satisfies all acceptance criteria in S3-T02 Audits A through G without breaking existing APIs or changing UI aesthetics.
  2. Hardens the 3D procedural engine against real-world edge cases (L-shaped homes, multi-floor setbacks, invalid user opening specifications).

---

### DEC-016: Architectural Design Intelligence & Requirement-Driven Procedural Variation Architecture (S3-T03)
- **Status:** Established
- **Context:** S3-T03 requires extending LabourConnect AI Engine from generating single 3D representations of canonical building designs to producing multiple meaningfully different, geometrically valid, requirement-driven architectural design alternatives. The variation must be rooted in architectural constraints, spatial relationships, plot geometry, room programs, budget constraints, and building configurations—not superficial visual randomization or static templates.
- **Decision:**
  1. Architectural Difference Classification: Implemented `classifyArchitecturalDifference` in `similarityEngine.js` supporting `ARCHITECTURAL_DIFFERENCE_LEVEL` (`IDENTICAL`, `COSMETIC_ONLY`, `MINOR_DIMENSIONAL`, `MEANINGFUL_SPATIAL`, `STRUCTURAL_OR_MASSING`). Distinguishes exact duplicates (1.0 similarity), metadata/label-only changes, minor coordinate nudges (>= 0.82 similarity), spatial archetype & topology changes (< 0.82 similarity), and structural/massing changes (differing floor counts or vertical core relocations).
  2. Requirement-Driven Strategy Vectors: Implemented `generateArchitecturalStrategies` in `architecturalVariationEngine.js` systematically deriving distinct spatial archetypes (`OPEN_CONTEMPORARY`, `COURTYARD_CENTRIC`, `VILLA_PAVILION`, `LINEAR_SPINE`), circulation core strategies, roofline profiles, and fenestration rhythms from normalized user inputs, plot geometry, aspect ratios, and architectural styles (`MODERN_CONTEMPORARY`, `MINIMALIST`, `LUXURY_VILLA`, `TRADITIONAL_KERALA`, `ECO_FRIENDLY`).
  3. Styled Procedural Rooflines & Weather-shades (Chajjas): Implemented `generateProceduralRoofline3d` in `proceduralBuildingGenerator3d.js` generating 3D sloping pitched roof eaves with mangalore clay tile textures and ridge caps, solar pergola terrace beams, and stepped parapets with raised corner feature piers. Implemented `generateWindowChajjas3d` generating 3D cantilevered concrete weather-shades (1.5 ft projection, 0.25 ft thickness) for tropical passive solar protection.
  4. Decoupled Pooja Placement & Flank Inversions: Enhanced `layoutGenerator.js` to decouple pooja sanctum placement from courtyard logic so requested pooja sanctums are preserved across all archetypes; sized courtyard lightwells to strictly satisfy code minimums (>= 5.5 ft width); diversified stair/portico flanking across 4 orthogonal quadrants and supported flipped rear zones for distinct circulation.
  5. Canonical Model Enrichment: Every accepted alternative preserves 100% compliance with Canonical Design Schema v2.0.0 and enriches the candidate with 2D CAD floor plans (`generateAllFloorsDrawings`), procedural 3D building meshes (`buildProcedural3dGeometry`), continuous walkthrough camera trajectories (`planWalkthroughPath`), deterministic physical BOQ estimates (`calculateDeterministicBOQ`), and explainable quality scores (`scoreDesignQuality`).
  6. Zero External AI/Template Reliance: All design generation is deterministic, reproducible with seeds, explainable, and computed in-engine without hosted AI generation APIs, LLMs, RAG, or static templates.
- **Reasoning:**
  1. Ensures architectural diversity reflects genuine spatial, circulation, and massing differences rather than cosmetic color or seed changes.
  2. Guarantees 100% preservation of hard constraints and municipal plot envelopes across all alternatives.
  3. Seamlessly integrates with existing 2D CAD and 3D procedural rendering pipelines.

---

### DEC-017: Professional Materials, Diurnal Solar Lighting & Tri-Planar Shading Engine (S3-T04)
- **Status:** Established
- **Context:** S3-T04 requires professional, deterministic architectural materials, daylight simulation lighting, and rendering improvements for the existing procedural 3D architectural engine. The system must render buildings with realistic architectural legibility while preserving canonical schema v2.0.0, procedural geometry, 2D floor plans, variation, multi-floor stacking, openings, stairs, balconies, rooflines, and chajjas without hosted AI APIs or static pictures.
- **Decision:**
  1. Centralized Material Definition System: Implemented `src/engine/rendering/materialCatalog.js` providing 33 immutable architectural material definitions (`ARCHITECTURAL_MATERIALS`) across 7 categories (Masonry, Concrete, Wood, Glass, Metal, Tile, Site). Each material specifies baseColor, roughness, metalness, opacity, ambient/diffuse/specular coefficients, shininess, strokeColor, strokeWidth, and surfaceTexture.
  2. Five Canonical Style Palettes: Implemented `STYLE_MATERIAL_PALETTES` mapping all 20 architectural component types (`wall_exterior`, `wall_interior`, `plinth`, `slab_floor`, `slab_terrace`, `slab_balcony`, `window_pane`, `window_frame`, `door_leaf`, `door_frame`, `roofline`, `chajja`, `railing_post`, `railing_handrail`, `railing_panel`, `column`, `parapet`, `stair_tread`, `site_ground`) for each style:
     - Modern Contemporary: Off-white plaster, charcoal UPVC frames, low-E tinted acoustic glass, stainless steel posts.
     - Minimalist: Fair-faced architectural grey render, flush minimalist trim, ultra-clear low-iron glazing.
     - Luxury Villa: Italian travertine lime plaster, dark anodized bronze frames, warm teak woodwork.
     - Traditional Kerala: Warm ochre plaster, authentic terracotta Mangalore clay roof tiles, carved teak woodwork.
     - Eco-Friendly: Breathable mineral limewash, natural teak pergolas, earth-toned terracotta coping.
  3. Continuous Diurnal Solar Lighting Model: Implemented `src/engine/rendering/lightingEngine.js` calculating real-world sun direction vectors and illumination across 24 hours (`calculateSunPosition`). Covers five distinct solar phases (Dawn, Midday, Golden Hour, Twilight, Night) with orientation azimuth offsets (East, North, West, South) producing normalized 3D sun vectors.
  4. Tri-Planar Face Shading & Blinn-Phong Specular Highlights: Implemented `calculateFaceShading` classifying face surface normals into upward horizontal (skylight ambient irradiance + zenith sun), downward horizontal (soffit occlusion shading), and vertical (Lambertian cosine direct sunlight). Incorporates Blinn-Phong specular highlights responding to material shininess, specular coefficient, and metalness, safely clamped within `[0.22, 1.45]` to prevent pure black or blown-out white surfaces.
  5. 3D Viewport Projector & Depth Sorting: Enhanced `project3dToViewport` in `procedural3dGenerator.js` to accept 3D mesh arrays, compute face normal shading using `calculateFaceShading`, apply Painter's algorithm depth sorting, and support camera orientation (azimuth, elevation, panX, panY), solar time, plot orientation, and floor isolation.
  6. Interactive UI Controls: Enhanced `Interactive3dEngine.jsx` to pass `style`, `solarTime`, and `facing` to procedural 3D generation and projection, providing interactive controls for solar time of day, site plot facing, and architectural style palettes.
- **Reasoning:**
---

### DEC-018: Critical 3D House Reconstruction Root-Cause Fixes
- **Status:** Established
- **Context:** Following the S3-T04 release, five critical defects in the 3D procedural house reconstruction pipeline were identified that prevented procedural 3D output from resembling a coherent residential house: inverted camera pitch causing underside domination, broken door and window coordinate matching causing missing fenestration, clobbered exterior facades due to unseparated interior partition rendering under Painter's algorithm, missing rooflines and rooftop parapets, and fixed viewport scaling causing large buildings to exceed viewport bounds.
- **Decision:**
  1. Camera Pitch & Projection Correction: Inverted pitch trigonometric signs in `procedural3dGenerator.js` (`const by2 = bry * cosP + bz1 * sinP; const bz2 = -bry * sinP + bz1 * cosP;`) aligning world Y-up coordinates with SVG screen coordinates (where screen Y increases downward). Verified elevated camera angles (15° to 70°) display upward-facing roof and terrace surfaces while safely culling underside foundation faces. Corrected view vector in `calculateFaceShading`.
  2. Dual Coordinate Openings Matching: Enhanced `generateWallWithRealOpenings` in `proceduralBuildingGenerator3d.js` to support both 2D CAD direct coordinate schemas (`{ x, y, width, wall, label }`) and nested coordinate schemas (`{ position: { x, y } }`). Added orthogonal wall orientation matching (`north`, `south`, `east`, `west`), boundary tolerance matching, run bounds validation, and generated exact through-wall voids with solid jambs, sub-sill aprons, lintel headers, UPVC window frames, acoustic glass panes, and door leaves.
  3. Presentation Mode Separation: Implemented view-mode filtering in `project3dToViewport`:
     - Exterior View (`viewMode: 'exterior'`): Filters out interior partition walls, interior stair treads/risers, and internal structural columns from the rendering pipeline, preventing Painter's algorithm visual clobbering of exterior facades.
     - 3D Dollhouse View (`viewMode: 'dollhouse'`): Cuts away roof slabs, parapets, rooflines, and ceiling caps to reveal interior room programs, partitions, internal doors, and staircases.
     - Floor Isolation View (`selectedFloorIndex`): Isolates individual floor assemblies without drawing unrelated floors.
  4. Deterministic Rooflines & Parapet Decoupling: Implemented `resolveProceduralRooflineStyle` mapping architectural styles to deterministic defaults (`traditional_kerala` -> `sloping_pitched`, `eco_friendly` -> `pergola_terrace`, `luxury_villa` -> `stepped_parapet`, `modern_contemporary`/`minimalist` -> `flat_terrace`). Decoupled rooftop parapet generation from mumty headroom walls using `terraceParapetGenerated` state tracking.
  5. Dynamic Viewport Auto-Framing & Centering: Replaced fixed multiplier `12.0 * zoom` with dynamic bounding box auto-scaling (`autoScale = Math.min(availW / spanX, availH / spanY)`) and auto-centering (`midPx`, `midPy`) with 40px configurable padding, ensuring buildings of any plot dimension fit completely within the viewport without cropping.
- **Reasoning:**
  1. Directly resolves all five root-cause defects verified against code and live browser rendering.
  2. Fully preserves Canonical Design Schema v2.0.0, 2D CAD floor plans, architectural variation, and deterministic BOQ.
  3. Compatible with SVG projection and Painter's algorithm without requiring a GPU depth buffer.

---

### DEC-019: Definitive Architectural Reconstruction Pipeline — Monotonic Stacking, Boundary Extraction, and Open Space Solid Wall Exemption
- **Status:** Established
- **Context:** Following repeated patch attempts, visual 3D building generation continued to suffer from inter-floor vertical penetration (1.0 ft penetration and 129 cross-floor AABB collisions in duplexes), 100% duplicate coincident perimeter/parapet walls on terraces, missing walls for enclosed rooms, inappropriate 10-ft solid walls enclosing open car porch driveways, balcony decks, and terrace decks, and missing roof slabs for single-storey homes.
- **Decision:**
  1. Monotonic Vertical Floor Stacking: Implemented sequential stacking in `geometryFoundation3d.js` starting strictly from plinth level (+1.5 ft FFL), with `floorHeight >= 10.5 ft` (10.0 ft clear ceiling + 0.5 ft slab). Pre-calculated `fl.elevationZ` values from earlier modules that assumed zero-datum are discarded in favor of monotonic stacking, completely eliminating cross-floor penetration.
  2. Architectural Boundary Edge Extraction: Replaced independent perimeter guessing in `layoutGenerator.js` with boundary extraction derived from placed room edges. Shared boundaries between adjacent rooms are merged and deduplicated into a single 0.375-ft interior partition wall. Exterior walls (0.75 ft) are generated only where enclosed rooms meet the exterior perimeter.
  3. Open Outdoor Space Wall Exemption: Car porch driveways, open balcony outer boundaries, and open terrace decks are explicitly exempt from solid exterior masonry walls. On the terrace level, only the enclosed stairhead mumty (`t_mumty`) generates 4 solid walls.
  4. Top-Floor Roof Slabs: For single-storey houses (`floorCount === 1`), a solid RCC roof terrace slab is generated over Ground Floor, providing the structural foundation for flat terrace parapets. For multi-storey buildings with a stair mumty, a mumty headroom roof slab is generated over `t_mumty`.
- **Reasoning:**
  1. Solves the underlying architectural data generation defect rather than patching downstream rendering.
  2. Guarantees deterministic geometry with zero cross-floor volume collisions and zero duplicate walls.
  3. Fully compliant with Canonical Design Schema v2.0.0 and preserves 2D CAD drawings and BOQ calculations.

---

### DEC-020: Multi-View Integration, Real 3D Walkthrough & Quality Assurance Architecture (S3-T05)
- **Status:** Established
- **Context:** S3-T05 requires four genuine orthographic building elevations (Front, Rear, Left, Right) derived from the exact same procedural 3D building geometry; a real geometry-driven 3D walkthrough completely replacing hardcoded Unsplash stock images; top-down cutaway view strictly aligned with the 2D CAD floor plan (1:1 coordinate and dimension match); regression safety preserving 100% of existing tests; and clean production build and lint.
- **Decision:**
  1. True Orthographic Projection Pipeline: Implemented true parallel projection (`p = 1.0`, `bp = 1.0`) in `procedural3dGenerator.js` for architectural elevations and top-down plan views, eliminating perspective convergence distortion. Retained finite camera depth ($z_2$) to maintain deterministic Painter's algorithm depth sorting. Implemented `projectOrthographicElevation` and `projectTopDownCutaway` with dynamic bounding box framing, auto-centering, and consistent coordinate conventions.
  2. Four Standardized Elevation Presets: Established `ELEVATION_PRESETS` (`front` at yaw 0°, `rear` at yaw 180°, `left` at yaw 90°, `right` at yaw 270°) with elevation angle 0° for pure lateral viewing. Ground floor, intermediate slabs, cantilevered balconies, upper floors, rooflines, and parapets are rendered from the same source canonical 3D model.
  3. 100% Geometry-Driven Walkthrough: In `walkthroughPathPlanner.js` and `CinematicWalkthroughStudio.jsx`, completely eradicated all external Unsplash stock images. Replaced with real 3D geometry rendering via `project3dToViewport`, dynamic camera flight paths with through-door portal transition waypoints (`isDoorway: true`) to avoid wall penetration, eye-level camera placement (5.5 ft above floor FFLs), multi-camera flight modes (Cinematic, First-Person, Drone Aerial Orbit), synchronized 2D floor circulation radar minimap, and robust empty state handling.
  4. Top-Down Cutaway 2D/3D Alignment: Top-down cutaway view (`projectTopDownCutaway`) derives directly from the canonical 3D building model with roof cutaway and floor-isolation support, maintaining identical lateral width, longitudinal depth, room positions, and orientations matching the 2D CAD floor plan.
  5. Regression Safety & Test Suite #21: Implemented `src/engine/__tests__/multiViewQualityAssurance.test.js` (27 comprehensive assertions across 4 groups). Preserved all 1,226 existing assertions across 20 suites (total 1,253 assertions across 21 suites, 100% pass) and all 181 Sprint 1 regression assertions.
- **Reasoning:**
  1. Guarantees that all views (2D floor plans, 4 elevations, top-down cutaways, 3D orbit, 3D dollhouse, and walkthroughs) derive deterministically from the single Canonical Design Model.
  2. Permanently removes stock photography from the product, ensuring high engineering integrity and visual realism.
  3. Fulfills all five acceptance criteria of Sprint 3 Task S3-T05 and achieves Checkpoint LC-S3-CP-0006.

---

### DEC-021: Single Authoritative Project Budget Pipeline, Regional Rate Catalog & Feasibility Reconciliation Engine (S4-T01)
- **Status:** Established
- **Context:** S4-T01 requires a unified, single-source project budget engine covering the complete home journey from empty plot to finished residence across 10 discrete cost categories. Prior to this, `deterministicBoqEngine.js`, `BoqEstimator.jsx`, and `BoqLiveIndianRatesModal.jsx` maintained disconnected calculation routines, with the UI relying on arbitrary shortcuts (`plotArea * 1.15`) and static multipliers.
- **Decision:**
  1. Authoritative Budget Engine Pipeline: Built `src/engine/estimation/projectBudgetEngine.js` implementing `calculateProjectBudget(design, options)` as the single source of truth. All UI components (`BoqLiveIndianRatesModal.jsx`, `BoqEstimator.jsx`) and downstream export routines consume this authoritative pipeline. UI-level shortcuts and uncoordinated multipliers are completely eliminated.
  2. 10 Discrete Cost Categories: Formally defined 10 categories with transparent takeoffs and allowances:
     - Cat 1: Site Preparation & External Works
     - Cat 2: Civil Structure (physical concrete, steel, masonry, formwork)
     - Cat 3: Architectural Finishes (plaster, paint, flooring, wall tiles, waterproofing, doors, windows, railings)
     - Cat 4: Electrical & Plumbing (wiring, points, DB, earthing, water supply, drainage, fixtures)
     - Cat 5: Kitchen & Bathroom Fittings (countertops, sinks, sanitaryware, CP fittings)
     - Cat 6: Interior Furnishings (configurable allowance; prepared for S4-T02)
     - Cat 7: Landscaping & Outdoor Living (site grading, turf, exterior lighting; prepared for S4-T03)
     - Cat 8: Professional & Statutory Fees (architectural, structural, municipal approvals)
     - Cat 9: Taxes, Transport & Installation (GST 18% strictly on contractor margin and professional services; transport logistics)
     - Cat 10: Contingency & Price Escalation (5% site contingency + 3% commodity price escalation)
  3. Physical Opening Deductions & Deduplication: Door and window areas are strictly deducted from gross perimeter wall areas to compute true net masonry and plaster quantities. Shared internal partition walls are counted exactly once.
  4. Single-Point Taxation & No Double Contingency: Raw materials already reflect embedded manufacturer excise/GST at delivery; therefore, 18% GST is applied strictly to contractor execution margin and professional consultancy fees. Contingency and price escalation buffers are calculated directly on direct base costs once without compounding.
  5. Regional Indian Rate Catalog & Provenance: Created `src/engine/estimation/regionalRateCatalog.js` covering 10 major metropolitan and Tier-2 economic zones (Bengaluru 1.00, Chennai 0.98, Hyderabad 0.97, Mumbai 1.14, Delhi-NCR 1.03, Pune 1.05, Kolkata 0.94, Kochi 1.02, Ahmedabad 0.96, DEFAULT_NATIONAL 1.00) with Q3 2026 baseline rates and explicit provenance tracking (`SOURCED`, `CONFIGURED`, `ASSUMED_DEFAULT`, `USER_OVERRIDE`, `UNAVAILABLE`).
  6. Target Budget Reconciliation & Feasibility Engine: Evaluates variance as `budgetVariance = targetBudget - totalEstimatedCost`, with explicit status transitions (`WITHIN_BUDGET`, `AT_BUDGET`, `OVER_BUDGET`, `INCOMPLETE_ESTIMATE`, `INVALID_INPUT`). Prevents declaring affordability when required categories are unconfigured.
  7. Value-Engineering Trade-Off Generator: Mathematical differences between real rate alternatives produce defensible cost-saving recommendations without compromising structural safety or fabricating savings percentages.
  8. Backwards Compatibility: `calculateDeterministicBOQ` remains 100% compatible with existing callers, automatically attaching `projectBudget` to its result.
- **Reasoning:**
  1. Establishes mathematical and engineering integrity for all cost estimations across the product.
  2. Protects users from deceptive claims, fabricated live prices, cascading double taxation, and hidden multipliers.
  3. Provides an extensible architectural contract ready for future furniture (S4-T02), landscaping (S4-T03), and interactive customization (S4-T04) modules without requiring engine rewrites.

---

### DEC-022: Procedural Interior Furniture Generation, Boundary-Aware Ergonomics & Multi-View Fit-Out Engine (S4-T02)
- **Status:** Established
- **Context:** S4-T02 requires generating room-aware, recognizable 3D solid furniture and fit-outs that visibly furnish the 3D house without relying on static concept art, flat 2D image sprites, or single hardcoded demonstration houses. Placement must be dimension-aware, strictly respect room boundaries, floor elevation, and doorway circulation clearances, integrate into the canonical 3D model, viewport renderer (with exterior culling and roof cutaways), and flow itemized costs into Budget Category 6.
- **Decision:**
  1. Multi-Component 3D Solid Geometry: Implemented in `src/engine/interior/furniture3dMeshBuilder.js` producing genuine 3D solid meshes (vertices, quad faces, outward surface normal vectors, and outlines). Avoided primitive placeholder cubes; furniture models feature recognizable physical anatomy:
     - Beds: Base frame, mattress, cushioned headboard, and dual pillows.
     - Sofas: Base platform, seat cushions, backrest, and armrests.
     - Tables: Top slab and 4 support legs.
     - Kitchen: Modular counter base with embedded stainless sink, chrome tap, gas hob, and tall refrigerator.
     - Bathrooms: Floating vanity with ceramic basin, EWC toilet with cistern, and transparent glass shower cubicle.
     - Sacred/Pooja: Stepped wooden mandir altar cabinet with traditional pinnacle gopuram top.
     - Study: Writing desk with modesty panel and 5-prong ergonomic swivel chair.
  2. Spatial Ergonomics, Boundaries & Collision Avoidance: Implemented in `src/engine/interior/proceduralFurnitureGenerator.js`:
     - Room boundary check: All furniture vertices and bounding boxes remain strictly inside room walls with a >= 0.15 ft clearance margin.
     - Doorway clearance circle: Guaranteed minimum clearance envelope of >= 2.2 ft in front of all room doors, protecting primary egress and circulation.
     - Non-overlapping AABBs: Placed items test for bounding box collision in the XZ plane. Sinks and hobs are treated as embedded fixtures permitted to install directly on counter bases.
     - Floor elevation positioning: Objects sit directly on top of floor slabs at $Y = \text{floorBaseY} + 0.5\text{ ft}$, completely eliminating floating furniture.
     - Circulation space protection: Circulation spaces (stairwells, corridors, terraces) are protected from bedroom and living room furniture clutter.
     - Graceful degradation: Undersized or compact rooms drop secondary decorative items while preserving primary functional pieces without collision.
  3. Canonical Building & Viewport Integration:
     - Automatically attaches `design.furnishings` and appends all furniture meshes into building `allMeshes`, tracking counts in building stats.
     - Classified under `isInterior` in `procedural3dGenerator.js`: culled in `exterior` presentation mode to keep facades clean, and rendered cleanly in `dollhouse` cutaway, floor isolation, and walkthrough views.
     - Expanded `isRoofFeature` in dollhouse mode to cull top roof slabs and parapets, fully opening up interior rooms to see furniture from above in 3D orbit and cutaway views.
     - Added `showFurniture` state (default `true`) and an interactive `🛋️ Furnished` toggle button in the 3D top dock in `Interactive3dEngine.jsx`.
  4. Unified Budget Engine Takeoff Linkage:
     - Linked Category 6 (Interior Furnishings) in `projectBudgetEngine.js` to consume `design.furnishings.allFurnitureItems`, grouping items by type and indexing unit rates with regional city factors, transitioning the category from provisional allowance to engineer-verified itemized takeoff.
  5. Comprehensive Automated Test Suite #23 (`proceduralFurnitureEngine.test.js`):
     - 20 unit, integration, and budget linkage assertions passing with 100% pass rate. Preserved all 1,281 existing assertions across 22 suites (total 1,301 assertions across 23 suites, 100% pass rate in 0.79s) and 181 Sprint 1 regression assertions.
  6. Code Quality & Performance:
     - 0 oxlint warnings or errors across all 53 engine files.
     - Clean production build in 833ms.
- **Reasoning:**
  1. Guarantees that procedural furniture generation creates real, physically grounded 3D objects that enrich the residential design rather than fake 2D visual overlays.
  2. Ensures that furniture placement respects architectural logic and building circulation.
  3. Establishes a single source of truth connecting 3D rendering and transparent budget itemization.

---

### DEC-023: Procedural Landscape, Garden & Outdoor Living Generation Architecture (S4-T03)
- **Status:** Established
- **Context:** S4-T03 requires generating procedural 3D landscape, garden, and outdoor living features adhering strictly to plot boundaries and building footprint exclusion punching. Prior to this, the 3D viewport displayed only a flat green polygon representing the ground without trees, shrubs, pedestrian paths, driveways, outdoor living furniture, perimeter compound walls, gate openings, or outdoor lighting fixtures. Furthermore, Budget Category 7 (Site Infrastructure, Landscaping & Boundary Wall) remained an unitemized provisional allowance.
- **Decision:**
  1. Procedural 3D Landscape Engine (`src/engine/proceduralLandscapeEngine.js`):
     - Algorithmic site layout generator tailored to plot dimensions and orientation.
     - Plot boundary conformance: Ground surfaces and landscape objects are strictly clipped to plot dimensions $[0, \text{plotWidth}] \times [0, \text{plotLength}]$.
     - Building footprint exclusion punching: The building footprint and plinth boundary are strictly excluded from ground turf and vegetation, ensuring trees, shrubs, and hardscape never penetrate inside building walls.
  2. Multi-Tier Vegetation System:
     - Shade trees with multi-component solid geometry: cylindrical/tapered wooden trunks (`bark_brown`) and multi-tiered conical/spherical foliage canopies (`forest_green`, `foliage_medium`).
     - Flowering and perimeter boundary shrubs (`hedge_green`, `flowering_pink`).
     - Turf lawn ground slab (`turf_green`).
     - Spacing and collision avoidance: Non-overlapping placement between trees, shrubs, and building envelopes.
  3. Hardscaping Architecture:
     - Paved pedestrian walkway connecting front entrance gate to building plinth entrance.
     - Vehicular driveway block paving connecting front street gate to car parking area.
     - Outdoor patio / living terrace equipped with a 4-seater outdoor dining table, outdoor chairs, and decorative planters.
  4. Perimeter Compound Wall, Pillars & Gate:
     - Continuous compound wall extruded along all 4 plot perimeter boundaries with concrete coping.
     - Symmetrical entrance gate pillars with street opening gap.
  5. Outdoor Landscape Lighting:
     - Low-voltage pathway bollards positioned along pedestrian walkways.
     - Pillar lantern fixtures mounted on entrance gate pillars.
  6. Determinism & Non-Mutation:
     - Seeded pseudo-random placement based on project ID and coordinates.
     - Zero mutation of incoming canonical design schema or room objects.
  7. Canonical 3D Pipeline & Viewport Presentation:
     - Integrated into `generateProceduralBuilding3d` and `buildProcedural3dGeometry`, populating `allMeshes` and building stats.
     - Interactive `🌳 Landscape` toggle in `Interactive3dEngine.jsx` allowing instant layer switching.
     - Auto-framing dynamically expands to accommodate site and landscape boundary geometry.
  8. Total Project Budget Category 7 Linkage:
     - Flows itemized landscape hardscape, compound wall, gate, outdoor lighting, and softscape directly into Budget Category 7 (Site Infrastructure, Landscaping & Boundary Wall).
     - Transitions category from provisional allowance to engineer-verified takeoff, cleanly harmonized with Category 1 site prep without double counting.
  9. Comprehensive Automated Test Suite #24 (`proceduralLandscapeEngine.test.js`):
     - 21 unit, integration, and budget linkage assertions passing with 100% pass rate across 7 groups.
  10. Code Quality & Performance:
     - 0 oxlint warnings or errors across all 57 engine files.
     - Clean production build in 1.38s.
- **Reasoning:**
  1. Transforms the 3D visualization from an isolated floating building into a complete, contextualized residential property.
  2. Provides realistic spatial relationships between the house, garden, driveway, and site boundary.
  3. Delivers a complete, transparent, engineer-verified takeoff for Category 7 in the Total Project Budget without duplicate counting.

---

### DEC-024: Export & Documentation Pipeline Architecture (S4-T04)
- **Status:** Established
- **Context:** S4-T04 requires creating an integrated Export & Documentation Center within the AI Architect interface, allowing users to export their generated architectural designs into useful industry-standard or clearly documented interchange formats across four categories: 2D CAD Drawings, 3D Models/BIM, Architectural Drawing Sheets (PDF), and Project Schedules & Data. Prior to this, designs could only be viewed interactively in the browser without genuine downloadable interchange files.
- **Decision:**
  1. Core Pipeline Design & Architecture:
     - Pure functional, client-side export generation executing entirely in-browser without external APIs or heavy dependencies.
     - Strict preservation of the Canonical Design Model as the universal single source of truth; zero mutation or state pollution.
     - Clean modular separation: `dxfExporter.js`, `gltfExporter.js`, `objExporter.js`, `pdfDocumentExporter.js`, `projectScheduleExporter.js`, `exportPipelineOrchestrator.js`.
  2. 2D CAD Drawing Pipeline (`dxfExporter.js`):
     - Produces industry-standard AutoCAD 2000 ASCII DXF (AC1015 format) compatible with AutoCAD, Revit, LibreCAD, and BricsCAD.
     - 15 standard architectural layers (`A-WALL-EXTR`, `A-WALL-INTR`, `A-DOOR`, `A-GLAZ`, `A-ROOF`, `A-STAIR`, `A-COLS`, `A-BALC`, `A-FURN`, `L-TREE`, `L-SHRUB`, `L-PAVE`, `L-WALL`, `C-PROP-BNDY`, `G-ANNO-TEXT`, `G-ANNO-DIMS`).
     - Drawing units set via `$INSUNITS` (code 2 = Feet) and `$MEASUREMENT` (0 = Imperial).
     - Standard CAD entities: `LWPOLYLINE` for walls, boundary, slabs, and furniture; `LINE` and `ARC` for door swings; `TEXT` for room labels and dimensions; `CIRCLE` for landscape trees and lights.
     - Multi-floor elevation drawing support and drawing title block with project metadata and disclaimer.
  3. 3D Model & BIM Pipelines (`gltfExporter.js`, `objExporter.js`):
     - Primary interactive format: Standard glTF 2.0 and self-contained binary GLB container (`.glb`).
     - Binary GLB structure: 12-byte header (magic `0x46546C67`, version 2, length), Chunk 0 JSON (`0x4E4F534A`), Chunk 1 Binary Buffer (`0x004E4942`) with 4-byte padding alignment.
     - Multi-mesh triangulation, vertex positioning, normals, and PBR metallic-roughness material bindings (`pbrMetallicRoughness`).
     - Scene graph grouping dividing model into `Building_Architecture`, `Interior_Furnishings`, and `Site_Landscaping`.
     - Standard glTF metric conversion scaling ($0.3048\text{ m/ft}$) applied deterministically.
     - Companion 3D format: Wavefront OBJ (`.obj`) and Material Template Library (`.mtl`) with vertex positions, vertex normals, object groups (`g`), and material assignments (`usemtl`).
  4. Vector PDF Drawing Package (`pdfDocumentExporter.js`):
     - Pure JavaScript vector PDF-1.4 binary stream generator without external bloated libraries.
     - Standard A4 Landscape format ($842 \times 595\text{ pt}$) with standard architectural border, title block, North rose compass, and graphic scale.
     - 4-page architectural drawing package:
       - Page 1: General Project Information, Site Layout & Plot Boundary Plan.
       - Page 2: Detailed Floor Plans with vector wall lines, openings, room labels, and dimensions.
       - Page 3: Architectural Building Elevations (Front, Rear, Left, Right) and 3D Perspectives.
       - Page 4: Architectural Schedules (Rooms, Doors/Windows) and authoritative 10-category Project Budget Table.
  5. Project Schedules & Machine-Readable Data (`projectScheduleExporter.js`):
     - RFC 4180 compliant CSV exports: `room-schedule.csv`, `door-window-schedule.csv`, `furniture-inventory.csv`, `landscape-inventory.csv`, `materials-schedule.csv`, and `budget-summary.csv`.
     - Complete canonical project data JSON export (`project-data.json`) preserving full design state, coordinates, materials, and quantities.
  6. Export Center UI (`ExportDocumentationModal.jsx`):
     - Integrated into `AiHouseDesignScreen.jsx` with access points in top variation bar and bottom engineering dock.
     - 4 tabbed categories: `2D CAD Drawings`, `3D Models & BIM`, `Drawing Sheets (PDF)`, and `Schedules & Reports`.
     - Live export generation state, size calculation, validation badges, direct file download triggers (`Blob`, `URL.createObjectURL`), and "Download Full Package" batch downloader.
  7. Automated Test Suite #25 (`exportDocumentationPipeline.test.js`):
     - 38 unit, integration, validation, immutability, and determinism assertions passing with 100% pass rate.
  8. Code Quality & Performance:
     - 0 oxlint warnings or errors across all 64 engine files.
     - Clean production build in 1.09s.
- **Reasoning:**
  1. Bridges the generative architectural engine with the professional AEC ecosystem, enabling seamless import into AutoCAD, Revit, Blender, SketchUp, and Excel.
  2. Protects design fidelity by converting the exact canonical model geometry rather than low-resolution screen rasterizations.
  3. Ensures client-side independence, eliminating external cloud rendering costs or backend export bottlenecks.

---

### DEC-025: Interactive Customization, Real-Time Editing & State Persistence Architecture
- **Context:** While S4-T01 to S4-T04 delivered automated generative floor plans, 3D building geometry, interior fit-outs, landscape elements, and comprehensive export capabilities, users required interactive direct manipulation over generated designs. Specifically, users needed to pick objects directly from 3D/2D views, nudge spatial positions with strict boundary clamping, rotate orientations, swap materials and architectural finishes in real-time, add and remove catalog elements, undo/redo modifications, and persist customized project states across browser sessions or export them as JSON bundles.
- **Decision:**
  1. Single Source of Truth Customization Pattern:
     - Customizations mutate the canonical design model deterministically using structured cloning (`ensureCustomizableDesign`), storing modifications directly within `design.furnishings`, `design.landscape`, and `design.customMaterials`.
     - Direct updates are propagated to the 3D procedural generator (`proceduralBuildingGenerator3d.js`) and the 10-category project budget engine (`projectBudgetEngine.js`) synchronously via `recalculateCustomizedDesign`.
  2. Screen-Space Picking & Spatial Constraints:
     - Raycasting via winding-number / ray-casting point-in-polygon algorithm (`isPointInPolygon`).
     - Screen coordinate unprojection picking (`pickObjectAtScreenCoordinates`) sorting candidate meshes by projected depth ($Z$) to select closest foreground elements.
     - Spatial translation (`moveObject`) enforces strict physical boundary clamping: interior furniture items are clamped to parent room interior polygons with a 0.2 ft clearance margin; landscape elements are clamped within the site plot boundary while excluding the building footprint.
  3. Transformation & Material Swapping Operations:
     - Y-axis rotation (`rotateObject`) with angle normalization ($[0^\circ, 360^\circ)$).
     - Catalog addition (`addCustomObject`) and removal (`removeObject`) supporting interior furniture and exterior landscape items.
     - Real-time material overrides (`changeObjectMaterial`, `changeRoomFinish`, `changeExteriorFacadeMaterial`) updating component material keys in `design.customMaterials`.
  4. Command-Pattern Undo / Redo Session:
     - Session management (`createCustomizationSession`, `applySessionCommand`, `undoSession`, `redoSession`) maintaining explicit command history stacks with rollback and rollforward capabilities.
  5. Project State Persistence Manager:
     - Resilient browser storage adapter (`projectPersistenceManager.js`) wrapping `window.localStorage` with an automatic in-memory fallback for SSR or restricted storage environments.
     - Project catalog operations: `saveProject`, `loadProject`, `listSavedProjects`, `deleteProject`.
     - Active working draft operations: `saveDraft`, `loadDraft`, `clearDraft`.
     - Portable RFC 8259 project bundles: `exportProjectBundleJson`, `importProjectBundleJson` with canonical schema v2.0 validation.
  6. User Interface Integration:
     - Full interactive dock (`DesignCustomizationPanel.jsx`) featuring Outliner, Inspector (nudge controls, rotation, material swatches, delete), Catalog Add, Finishes & Facade, Saved Projects, and Live Budget Impact delta badge.
     - Viewport polygon click picking, selection outline highlight, and dock toggle (`✨ Customize & Edit`) in `Interactive3dEngine.jsx`.
     - Synchronized with `AiHouseDesignScreen.jsx` via `onDesignChange` to ensure 2D blueprints, 3D views, BOQ, and export modal remain synchronized.
  7. Automated Test Suite #26 (`interactiveCustomizationPersistence.test.js`):
     - 42 assertions passing across 9 test groups covering picking, translation, rotation, catalog mutation, materials, undo/redo, budget recalculation, persistence, and export pipeline synchronization.
- **Reasoning:**
  1. Closes the architectural lifecycle loop by transitioning the LabourConnect engine from a one-way generator into a bi-directional, interactive Computer-Aided Design (CAD) studio.
  2. Immediate recalculation of Category 6 (Interior Fit-Out) and Category 7 (Site Infrastructure) in the Total Project Budget guarantees continuous economic transparency as clients make aesthetic choices.
  3. Immutability guarantees ensure undo operations return the design model to its exact mathematical state without floating-point drift or orphaned state.


