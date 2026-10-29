# Sprint 1 Plan: Foundation and Architectural Validation

**Project:** LabourConnect AI Engine  
**Sprint:** SPRINT 1  
**Mode:** Incremental, Inch-by-Inch Implementation  
**Starting Checkpoint:** LC-S1-CP-0001  
**Status:** In Progress  

---

## 1. Sprint Objective
Establish the foundational mathematical, dimensional, and architectural validation layer for the LabourConnect AI Engine without modifying the existing satisfactory 2D design interface or introducing external hosted generation APIs.

---

## 2. Task Sequence and Dependencies

```
[S1-T00: Recover State] (LC-S1-CP-0001)
         ↓
[S1-T01: Repository Audit] (LC-S1-CP-0002)
         ↓
[S1-T02: Investigate Repeated Designs] (LC-S1-CP-0003)
         ↓
[S1-T03: Define Canonical Design Model] (LC-S1-CP-0004)
         ↓
[S1-T04: Dimensional Calculation Foundation] (LC-S1-CP-0005)
         ↓
[S1-T05: Basic Geometric Validation] (LC-S1-CP-0006)
         ↓
[S1-T06: Prompt Requirement Structure] (LC-S1-CP-0007)
         ↓
[S1-T07: Automated Testing & Regression Safety] (LC-S1-CP-0008)
         ↓
[S1-T08: Sprint 1 Integration Review] (LC-S1-CP-0009)
```

---

## 3. Detailed Task Definitions

### Task S1-T00: Recover Current Project State
- **ID:** S1-T00
- **Checkpoint:** LC-S1-CP-0001
- **Focus:** Inspect environment, preserve uncommitted user changes, initialize/update persistent development tracking, and verify records.
- **Dependencies:** None.

### Task S1-T01: Repository Audit
- **ID:** S1-T01
- **Checkpoint:** LC-S1-CP-0002
- **Focus:** Deep audit of frontend/backend entry points, design workflows, API routes, data models, auth boundaries, reusable components, and technical debt. Produce `REPOSITORY_AUDIT.md`.
- **Dependencies:** S1-T00.

### Task S1-T02: Investigate Repeated Designs
- **ID:** S1-T02
- **Checkpoint:** LC-S1-CP-0003
- **Focus:** Trace prompt-to-output path, document exact mechanism causing fixed template recurrence, and produce `DESIGN_REPETITION_AUDIT.md`.
- **Dependencies:** S1-T01.

### Task S1-T03: Define the Canonical Design Model
- **ID:** S1-T03
- **Checkpoint:** LC-S1-CP-0004
- **Focus:** Formalize single source of truth architectural schema, unit conventions (metres internal vs feet display), 2D/3D entity contracts, and validation payloads. Produce `CANONICAL_DESIGN_SCHEMA.md`.
- **Dependencies:** S1-T01, S1-T02.

### Task S1-T04: Dimensional Calculation Foundation
- **ID:** S1-T04
- **Checkpoint:** LC-S1-CP-0005
- **Focus:** Implement decimal-safe plot area, setback, and buildable envelope calculation modules with robust tolerance and boundary checking.
- **Dependencies:** S1-T03.

### Task S1-T05: Basic Geometric Validation
- **ID:** S1-T05
- **Checkpoint:** LC-S1-CP-0006
- **Focus:** Implement deterministic containment validation, non-overlap checking, minimum room clearance enforcement, and structured warning/error outputs.
- **Dependencies:** S1-T04.

### Task S1-T06: Prompt Requirement Structure
- **ID:** S1-T06
- **Checkpoint:** LC-S1-CP-0007
- **Focus:** Build deterministic natural-language requirement extractor distinguishing explicit user inputs, inferred values, default assumptions, and missing/contradictory requests.
- **Dependencies:** S1-T03, S1-T05.

### Task S1-T07: Automated Testing and Regression Safety
- **ID:** S1-T07
- **Checkpoint:** LC-S1-CP-0008
- **Focus:** Build and execute comprehensive automated test suite for calculations, validations, prompt contracts, and regression verification of existing features.
- **Dependencies:** S1-T04, S1-T05, S1-T06.

### Task S1-T08: Sprint 1 Integration Review
- **ID:** S1-T08
- **Checkpoint:** LC-S1-CP-0009
- **Focus:** Perform end-to-end integration check across all Sprint 1 deliverables, verify acceptance criteria in `SPRINT_1_ACCEPTANCE.md`, and produce Sprint 1 completion report.
- **Dependencies:** S1-T07.
