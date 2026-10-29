# Sprint 2 Acceptance Criteria: Original Layout Generation and 2D Floor Plans

**Project:** LabourConnect AI Engine  
**Sprint:** SPRINT 2  
**Status:** COMPLETE — ALL 25 CRITERIA VERIFIED (100% Pass Rate across 14 Suites / 952 Assertions)  
**Final Checkpoint:** LC-S2-CP-0013  

---

## 1. Sprint 2 Definition of Done (DoD) Checklist

| Item | Criterion | Verification Method | Status |
|---|---|---|---|
| **AC-01** | Sprint 1 components are verified and reused correctly | Baseline test execution & integration check | **VERIFIED (S2-T00)** |
| **AC-02** | Structured requirements feed the generator | Requirements contract verification in S2-T01 | **VERIFIED (S2-T01)** |
| **AC-03** | Room programs are generated and validated | Floor-by-floor schedule test in S2-T02 | **VERIFIED (S2-T02)** |
| **AC-04** | Room relationships are represented (hard vs soft) | Adjacency graph solver test in S2-T03 | **VERIFIED (S2-T03)** |
| **AC-05** | Original layout-generation logic is implemented | Procedural layout generation test in S2-T04 | **VERIFIED (S2-T04)** |
| **AC-06** | Candidates contain real geometric placement data | Inspect bounds, walls, and polygons in S2-T04 | **VERIFIED (S2-T04)** |
| **AC-07** | Hard constraints are enforced (containment, collision, egress) | Geometric validator integration in S2-T05/T06 | **VERIFIED (S2-T05)** |
| **AC-08** | Soft preferences are evaluated separately | Score engine independence check in S2-T05/T07 | **VERIFIED (S2-T05)** |
| **AC-09** | Invalid candidates are rejected | Validation failure injection test in S2-T06 | **VERIFIED (S2-T06)** |
| **AC-10** | Candidate scoring is documented | Multi-objective scoring test in S2-T07 | **VERIFIED (S2-T07)** |
| **AC-11** | Near-duplicate detection is implemented and tested | Multi-signal similarity & diversity test in S2-T08 | **VERIFIED (S2-T08)** |
| **AC-12** | Infeasible requests return honest errors | Impossible constraint test in S2-T04/T10 | **VERIFIED (S2-T04/T05/T10)** |
| **AC-13** | Production generation does not silently use a fixed gallery | Audit generation path in S2-T04/T10 | **VERIFIED (S2-T04/T10)** |
| **AC-14** | 2D plans derive from canonical design model | Plan geometry vs canonical model check in S2-T09/T10 | **VERIFIED (S2-T09/T10)** |
| **AC-15** | Plan dimensions match underlying geometry | Coordinate-to-display accuracy test in S2-T09/T10 | **VERIFIED (S2-T09/T10)** |
| **AC-16** | Meaningful diversity tests are executed (Tests A–K) | Diversity test suite execution in S2-T10 | **VERIFIED (S2-T10)** |
| **AC-17** | Sprint 1 regression tests are executed | 130 regression tests passing via `npm test` | **VERIFIED (S2-T00/S2-T10)** |
| **AC-18** | Relevant integration tests are executed | Pipeline test in S2-T10 (`endToEndWorkflow.test.js`) | **VERIFIED (S2-T10)** |
| **AC-19** | Application build is verified | `npm run build` passing with zero errors (1,959 modules) | **VERIFIED (S2-T00/S2-T10)** |
| **AC-20** | File registry is accurate using standardized statuses | Continuous check of `FILE_REGISTRY.md` | **VERIFIED (S2-T10)** |
| **AC-21** | Task history is preserved and append-only | Continuous log entries in `TASK_LOG.md` | **VERIFIED (S2-T10)** |
| **AC-22** | Checkpoints are sequential and saved (`LC-S2-CP-XXXX`) | Sequential checkpoint enforcement (`LC-S2-CP-0011`) | **VERIFIED (S2-T10)** |
| **AC-23** | `RESUME_HERE.md` identifies actual project state | Synchronized at checkpoint `LC-S2-CP-0011` | **VERIFIED (S2-T10)** |
| **AC-24** | Known limitations and blockers are documented | Recorded in `MASTER_PROGRESS.md` & `SPRINT_2_ACCEPTANCE.md` | **VERIFIED (S2-T10)** |
| **AC-25** | Sprint 2 acceptance criteria are reviewed as an integrated unit | Comprehensive final review in consolidated S2-T10 | **VERIFIED (S2-T10)** |

---

## 2. Task-Level Acceptance Criteria

### S2-T00 (Verify Sprint 1 Before Starting)
- [x] Actual repository state inspected.
- [x] Sprint 1 components verified and functional.
- [x] 130 regression tests executed and 100% passing.
- [x] Existing user modifications preserved.
- [x] Sprint 2 planning documents initialized (`SPRINT_2_PLAN.md`, `SPRINT_2_ACCEPTANCE.md`).
- [x] Checkpoint `LC-S2-CP-0001` recorded.

### S2-T01 (Structured Layout Requirements)
- [x] Requirements contract defined connecting parser to layout generator.
- [x] Explicit values distinguished from defaults.
- [x] Units explicit and preserved.
- [x] Tests verify contract enforcement.

### S2-T02 (Room Program Generation)
- [x] Floor-by-floor room schedule produced.
- [x] Stable room IDs assigned per floor.
- [x] Hard constraints and soft preferences separated.
- [x] Tests verify room scheduling across varied BHK counts.

### S2-T03 (Room Relationship Graph)
- [x] Adjacency, separation, access, and vertical connections represented.
- [x] Hard adjacencies separated from soft preferences.
- [x] Tests verify graph topology for multiple archetypes.

### S2-T04 (Original Layout Generator)
- [x] Procedural geometric room placement generated from requirements.
- [x] Real coordinates, bounds, walls, and openings emitted.
- [x] Zero reliance on static hardcoded image galleries in generation.
- [x] Tests verify layout generation across different plot sizes.

### S2-T05 (Constraint Handling and Optimization)
- [x] Boundary containment, zero overlaps, and egress clearances enforced.
- [x] Soft objectives (circulation, daylighting, efficiency) evaluated.
- [x] Infeasible cases return honest errors.
- [x] Tests verify hard vs soft constraint handling.

### S2-T06 (Geometric Validation Integration)
- [x] 10-check `geometricValidator.js` integrated into generation loop.
- [x] Every candidate validated before acceptance.
- [x] Invalid candidates rejected.
- [x] Tests verify validation integration (120 assertions across 13 required scenarios).

### S2-T07 (Candidate Quality Scoring)
- [x] Multi-objective scoring evaluates aspect ratio, circulation, daylighting.
- [x] Invalid candidates cannot outrank valid candidates.
- [x] Deterministic reproducibility verified.
- [x] Tests verify scoring behavior (95 assertions across 12 required scenarios).

### S2-T08 (Near-Duplicate Detection)
- [x] Multi-signal similarity engine evaluates program, topological graph, spatial layout, and multi-floor alignment.
- [x] Insignificant coordinate shifts (< 0.3 ft) and superficial metadata changes strictly detected as duplicates.
- [x] Near-duplicates rejected against generation history while legitimate alternatives are retained.
- [x] Configurable thresholds, commutative determinism, and candidate ranking integration verified.
- [x] Tests verify all 20 required scenarios (68 assertions in `similarityEngine.test.js`).

### S2-T09 (2D Floor-Plan Generation)
- [x] Dimensionally consistent 2D technical drawings derived from canonical model.
- [x] Room boundaries, labels, and dimensions match geometry.
- [x] Existing UI viewers preserved (`AiHouseDesignScreen.jsx`, `Architectural2dAllAnglesViewer.jsx`).
- [x] Tests verify 2D geometric fidelity (82 assertions in `floorPlanGenerator.test.js`).

### S2-T10 (Consolidated End-to-End Workflow, Diversity Verification & Sprint 2 Sign-Off)
- [x] **Sub-Task 1 (Original S2-T10 Scope):** Coherent generation workflow: prompt ➔ requirements ➔ program ➔ graph ➔ layout ➔ validate ➔ score ➔ dedup ➔ canonical design model ➔ 2D CAD floor plan (JSON & SVG) ➔ UI integration.
- [x] **Sub-Task 1 (Original S2-T10 Scope):** Results contain complete metadata, evaluation scores, validation reports, and attached drawing suites.
- [x] **Sub-Task 1 (Original S2-T10 Scope):** Tests verify end-to-end execution (21 assertions in Part 1 of `endToEndWorkflow.test.js`).
- [x] **Sub-Task 2 (Original S2-T11 Scope):** Representative 10-scenario matrix executed and verified (1BHK, 2BHK, Narrow 18x60, Wide 50x30, Luxury 4BHK 50x70, Multi-floor, Parking/Pooja, Disabled amenities, Restrictive impossible plot rejection, Contradictory prompt rejection).
- [x] **Sub-Task 2 (Original S2-T11 Scope):** Diversity Tests A through K executed and documented (25 assertions in Part 3 of `endToEndWorkflow.test.js`).
- [x] **Sub-Task 2 (Original S2-T11 Scope):** Material differences verified across different prompts (same prompt candidates yield < 0.82 similarity; seeded runs yield 100% deterministic reproducibility).
- [x] **Sub-Task 2 (Original S2-T11 Scope):** All Sprint 1 regression tests (130 assertions) and Sprint 2 suites (735 assertions) continue passing with zero regressions (14 suites, 865 total assertions, 100% pass rate).
- [x] **Sub-Task 3 (Original S2-T12 Scope):** 2D CAD drawing outputs visually and geometrically inspected (cut wall weights, opening subtraction, door swings, window sills, staircase treads/arrows, 4-tier dimension chains, title block, NBC 2016 reference, licensing disclaimer).
- [x] **Sub-Task 3 (Original S2-T12 Scope):** All 25 Sprint 2 acceptance criteria (AC-01 through AC-25) evaluated and verified as an integrated unit.
- [x] **Sub-Task 3 (Original S2-T12 Scope):** Tracking records synchronized across `SPRINT_2_PLAN.md`, `SPRINT_2_ACCEPTANCE.md`, `MASTER_PROGRESS.md`, `RESUME_HERE.md`, `TASK_LOG.md`, `TEST_STATUS.md`, `FILE_REGISTRY.md`, `DECISIONS.md`, and `CHANGELOG.md`.
- [x] **Sub-Task 3 (Original S2-T12 Scope):** Production build verified passing with zero errors (`npm run build`).
- [x] **Sub-Task 3 (Original S2-T12 Scope):** Sprint 2 Final Completion Review signed off at Checkpoint `LC-S2-CP-0011`. Sprint 3 remains pending explicit user authorization.

### S2-CP-01 (Sprint 2 Audit Corrective Pass)
- [x] Finding 1 (Pooja Room Exclusion): Structured flags `amenities.hasPooja` and top-level `hasPooja` strictly take precedence over prompt text. Negative phrasing variations ("no pooja", "without pooja", "no mandir", "without mandir", "do not include a pooja room", "don't include a pooja room", "exclude the pooja room") are parsed. Disabled requests never generate a room with `type === 'pooja'`. Positive requests continue to function in feasible designs.
- [x] Finding 2 (Contradictory Floor-Count Detection): Hyphenated single-floor variants ("single-floor", "single-storey") and structured `floorsCount: 1` combined with duplex/multi-floor requests are detected as contradictions. Valid single-floor and duplex requests succeed without false positives.
- [x] Finding 3 (Qualified CAD Compliance Claim): Unqualified `NBC 2016 COMPLIANT` claim replaced with qualified `NBC 2016 SPACE STANDARDS ALIGNED | SCALE 1:100 | NOT FOR DIRECT CONSTRUCTION WITHOUT LICENSED STAMP`.
- [x] Finding 4 (Tracking Mirror Synchronization): Both `buildmate-app/project-docs/development-tracking/` and parent mirror `project-docs/development-tracking/` fully reconciled and synchronized at Checkpoint `LC-S2-CP-0012`.
- [x] All 14 test suites passing (911 assertions, 100% pass rate). Production build clean (1,959 modules in 619ms). Sprint 2 is fully accepted with all audit gaps resolved.

