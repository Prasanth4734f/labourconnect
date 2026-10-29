# Sprint 3 Acceptance Criteria: Procedural 3D & Consistent Rendering

**Project:** LabourConnect AI Engine  
**Sprint:** SPRINT 3  
**Status:** IN PROGRESS (S3-T01 Complete & Verified)  
**Current Checkpoint:** LC-S3-CP-0001  

---

## 1. Sprint 3 Definition of Done (DoD) Checklist

| Item | Criterion | Verification Method | Status |
|---|---|---|---|
| **AC-01** | Canonical Design Model remains universal single source of truth | Verify 3D geometry derives strictly from canonical model | **VERIFIED (S3-T01)** |
| **AC-02** | Authoritative 3D coordinate convention defined (Right-Handed, Y-Up, Z-Depth) | Documented and verified in `geometryFoundation3d.js` | **VERIFIED (S3-T01)** |
| **AC-03** | Centralized decimal-safe unit conversion (ft, m, in, mm) implemented | Round-trip tests (<0.001 ft error) in `geometryFoundation3d.test.js` | **VERIFIED (S3-T01)** |
| **AC-04** | Floor elevation and vertical stacking rules established | Single & multi-floor elevation tests in S3-T01 | **VERIFIED (S3-T01)** |
| **AC-05** | 3D spatial boundaries and AABB operations established | Bounding box, containment, intersection tests in S3-T01 | **VERIFIED (S3-T01)** |
| **AC-06** | 3D geometry input validation and diagnostics implemented | Finite number, non-negative, and ordering tests in S3-T01 | **VERIFIED (S3-T01)** |
| **AC-07** | Procedural 3D building generation implemented (slabs, walls, fenestration) | Automated tests in S3-T02 | Planned (S3-T02) |
| **AC-08** | Multi-floor vertical core and stairwell alignment in 3D | Stairwell bounding box alignment check in S3-T02 | Planned (S3-T02) |
| **AC-09** | Architectural styles produce genuine procedural variation | Style parameter tests in S3-T03 | Planned (S3-T03) |
| **AC-10** | Rooflines and facade modulations procedurally controlled | Roof geometry tests in S3-T03 | Planned (S3-T03) |
| **AC-11** | Architectural materials defined and attached to geometry components | Material specification check in S3-T04 | Planned (S3-T04) |
| **AC-12** | Solar daylight simulation across diurnal cycle (Dawn to Night) | Sun position and lighting parameter tests in S3-T04 | Planned (S3-T04) |
| **AC-13** | Multi-angle rendering integration (orthographic, perspective, orbit) | Viewport projection tests in S3-T05 | Planned (S3-T05) |
| **AC-14** | Continuous walkthrough camera path traversals verified | Waypoint and frustum tests in S3-T05 | Planned (S3-T05) |
| **AC-15** | Sprint 1 & Sprint 2 regression tests pass with zero regressions | `npm test` and `npm run test:sprint1` execution | **VERIFIED (S3-T01)** |
| **AC-16** | Production build succeeds cleanly | `npm run build` zero errors | **VERIFIED (S3-T01)** |
| **AC-17** | Code linter clean with zero errors | `npm run lint` zero errors | **VERIFIED (S3-T01)** |
| **AC-18** | Dual tracking mirrors synchronized with verified SHA256 hashes | Mirror synchronization check | **VERIFIED (S3-T01)** |

---

## 2. Task-Level Acceptance Criteria

### S3-T01 (3D Engine Audit & Geometry Foundation)
- [x] Repository and architecture deeply inspected.
- [x] Canonical design schema (v2.0.0) coordinates, dimensions, and data gaps analyzed.
- [x] Authoritative 3D coordinate convention defined (X: width, Y: elevation, Z: depth).
- [x] Centralized decimal-safe unit conversion utilities implemented (`feetToMeters`, `metersToFeet`, `inchesToFeet`, `feetToInches`, `inchesToMeters`, `millimetersToMeters`, `metersToMillimeters`, `sqftToSqm`, `sqmToSqft`).
- [x] Reversible plan-to-world and world-to-plan coordinate transformations implemented.
- [x] Floor elevation and architectural component vertical positioning established.
- [x] 3D spatial boundary operations (AABB, containment, intersection, volume) implemented.
- [x] Geometry input validation and error diagnostics implemented.
- [x] Automated test suite `geometryFoundation3d.test.js` created (80 assertions passing).
- [x] Consolidated test suite passing (15 suites, 1,032 assertions passing).
- [x] Sprint 1 regression suite passing (4 suites, 181 assertions passing).
- [x] Production build passing (1,960 modules transformed cleanly).
- [x] Linter passing with zero errors and zero warnings in engine.
- [x] Checkpoint `LC-S3-CP-0001` recorded.
