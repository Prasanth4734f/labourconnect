# Sprint 2 Plan: Original Layout Generation and 2D Floor Plans

**Project:** LabourConnect AI Engine  
**Sprint:** SPRINT 2  
**Mode:** Incremental, Inch-by-Inch Implementation  
**Starting Checkpoint:** LC-S2-CP-0001  
**Status:** IN PROGRESS  

---

## 1. Sprint Objective
Build the proprietary, algorithmic architectural layout generation engine, room relationship topology solver, constraint-driven spatial packer, multi-candidate quality scorer, near-duplicate uniqueness detector, and dimensionally consistent 2D floor-plan generation pipeline that directly derives from the Canonical Design Model without external hosted AI APIs and without fixed-template galleries.

---

## 2. Task Sequence and Dependencies

```
[S2-T00: Verify Sprint 1 Before Starting] (LC-S2-CP-0001)
         ↓
[S2-T01: Structured Layout Requirements] (LC-S2-CP-0002)
         ↓
[S2-T02: Room Program Generation] (LC-S2-CP-0003)
         ↓
[S2-T03: Room Relationship Graph] (LC-S2-CP-0004)
         ↓
[S2-T04: Original Layout Generator] (LC-S2-CP-0005)
         ↓
[S2-T05: Constraint Handling & Optimization] (LC-S2-CP-0006)
         ↓
[S2-T06: Geometric Validation Integration] (LC-S2-CP-0007)
         ↓
[S2-T07: Candidate Quality Scoring] (LC-S2-CP-0008)
         ↓
[S2-T08: Near-Duplicate Detection] (LC-S2-CP-0009)
         ↓
[S2-T09: 2D Floor-Plan Generation] (LC-S2-CP-0010)
         ↓
[S2-T10: Consolidated End-to-End Workflow, Diversity Verification & Sprint 2 Sign-Off] (LC-S2-CP-0011)
  ├── Sub-Task 1: Unified End-to-End Generation Workflow (incorporating original S2-T10)
  ├── Sub-Task 2: Architectural Diversity & Regression Verification (incorporating original S2-T11)
  └── Sub-Task 3: Final Sprint 2 Review & Sign-Off (incorporating original S2-T12)
```

---

## 3. Detailed Task Definitions

### Task S2-T00: Verify Sprint 1 Before Starting
- **ID:** S2-T00
- **Checkpoint:** LC-S2-CP-0001
- **Focus:** Verify repository state, execute 130 Sprint 1 regression tests, confirm baseline, initialize Sprint 2 records (`SPRINT_2_PLAN.md`, `SPRINT_2_ACCEPTANCE.md`).
- **Dependencies:** Sprint 1 Complete.

### Task S2-T01: Structured Layout Requirements
- **ID:** S2-T01
- **Checkpoint:** LC-S2-CP-0002
- **Focus:** Define requirements contract for the layout generator, mapping parsed prompt requirements into formal architectural input specs (plot boundary, buildable envelope, setbacks, room counts, required and preferred relationships).
- **Dependencies:** S2-T00.

### Task S2-T02: Room Program Generation
- **ID:** S2-T02
- **Checkpoint:** LC-S2-CP-0003
- **Focus:** Convert structured layout requirements into floor-by-floor architectural room schedules with stable IDs, minimum/preferred dimensions, target areas, access requirements, and hard vs soft constraint tags.
- **Dependencies:** S2-T01.

### Task S2-T03: Room Relationship Graph
- **ID:** S2-T03
- **Checkpoint:** LC-S2-CP-0004
- **Focus:** Implement topological adjacency graph solver representing hard requirements (`REQUIRED_ADJACENCY`, `REQUIRED_SEPARATION`, `ACCESS_RELATIONSHIP`, `VERTICAL_CONNECTION`) and soft preferences (`PREFERRED_ADJACENCY`).
- **Dependencies:** S2-T02.

### Task S2-T04: Original Layout Generator
- **ID:** S2-T04
- **Checkpoint:** LC-S2-CP-0005
- **Focus:** Implement genuine procedural/algorithmic 2D layout generator creating actual geometric room placements within buildable boundary using rectangular decomposition and adjacency heuristics without fixed static templates.
- **Dependencies:** S2-T03.

### Task S2-T05: Constraint Handling and Optimization
- **ID:** S2-T05
- **Checkpoint:** LC-S2-CP-0006
- **Focus:** Enforce hard constraints (boundary containment, zero room overlaps, egress access, minimum dimensions) and evaluate soft objectives (circulation efficiency, preferred adjacencies, daylight access, minimal leftover waste).
- **Dependencies:** S2-T04.

### Task S2-T06: Geometric Validation Integration
- **ID:** S2-T06
- **Checkpoint:** LC-S2-CP-0007
- **Focus:** Integrate Sprint 1 10-check `geometricValidator.js` into generator pipeline to validate every candidate design and cleanly separate hard failures from non-fatal warnings.
- **Dependencies:** S2-T05.

### Task S2-T07: Candidate Quality Scoring
- **ID:** S2-T07
- **Checkpoint:** LC-S2-CP-0008
- **Focus:** Implement multi-objective design quality scoring engine ranking valid candidates deterministically by aspect ratio, circulation, daylighting, and spatial efficiency.
- **Dependencies:** S2-T06.

### Task S2-T08: Near-Duplicate Detection
- **ID:** S2-T08
- **Checkpoint:** LC-S2-CP-0009
- **Focus:** Implement topological graph Jaccard and spatial centroid fingerprinting engine to detect near-duplicates against history and reject redundant designs.
- **Dependencies:** S2-T07.

### Task S2-T09: 2D Floor-Plan Generation
- **ID:** S2-T09
- **Checkpoint:** LC-S2-CP-0010
- **Focus:** Generate dimensionally consistent 2D floor plans (SVG/Canvas) derived strictly from the Canonical Design Model, preserving existing UI viewers (`AiHouseDesignScreen.jsx`, `Architectural2dAllAnglesViewer.jsx`).
- **Dependencies:** S2-T08.

### Task S2-T10: Consolidated Final Sprint 2 Task: Workflow, Diversity & Sign-Off
- **ID:** S2-T10 (Consolidated S2-T10, S2-T11, and S2-T12)
- **Checkpoint:** LC-S2-CP-0011
- **Focus:** Consolidate the entire remaining Sprint 2 scope into a single unified major task without dropping or diluting any sub-requirements:
  - **Sub-Task 1 (Original S2-T10 Scope):** Unify the connected end-to-end generation pipeline: Natural-language requirements ➔ Structured requirement interpretation ➔ Room-program generation ➔ Room relationship graph ➔ Procedural layout generation ➔ Constraint handling & optimization ➔ Geometric validation ➔ Candidate scoring & ranking ➔ Similarity detection & diversity selection ➔ Canonical design model ➔ Professional 2D CAD floor plan generation (SVG/JSON) ➔ Application UI integration. Attach drawings directly to canonical design models.
  - **Sub-Task 2 (Original S2-T11 Scope):** Execute and verify the complete 10-scenario representative test matrix (Compact 1BHK, Compact 2BHK, Narrow 18x60, Wide 50x30, Premium 4BHK 50x70, Multi-floor house, Parking & Pooja, Disabled amenities, Restrictive impossible plot rejection, Contradictory prompt rejection). Execute diversity Tests A through K (distinct plots, room programs, vertical stair cores, infeasibility, candidate diversity <0.82 similarity, deterministic reproducibility, 2D consistency, 3D alignment, deterministic BOQ takeoff, walkthrough trajectory, near-duplicate rejection).
  - **Sub-Task 3 (Original S2-T12 Scope):** Perform thorough output-quality inspection of 2D CAD drawings (wall thicknesses, opening subtraction, door swings, window sills, stairs, 4-tier dimensions, title block, NBC 2016 note, licensing disclaimer). Review all 25 Sprint 2 acceptance criteria (AC-01 through AC-25) in `SPRINT_2_ACCEPTANCE.md`. Synchronize all tracking documents and formally close Sprint 2 at Checkpoint `LC-S2-CP-0011`.
- **Dependencies:** S2-T09.

### Task S2-CP-01: Sprint 2 Audit Corrective Pass
- **ID:** S2-CP-01
- **Checkpoint:** LC-S2-CP-0012
- **Focus:** Resolve the 4 audit findings identified in the independent Sprint 2 audit: (1) Pooja-room exclusion precedence & end-to-end exclusion; (2) Contradictory floor-count detection (hyphenated single-floor & structured floorsCount: 1 vs duplex); (3) Qualified CAD compliance wording (`NBC 2016 SPACE STANDARDS ALIGNED`); (4) Safe tracking mirror synchronization.
- **Dependencies:** S2-T10.
- **Status:** COMPLETE (911 assertions passing across 14 suites, 100% pass rate)
