# Sprint 3 Plan: Procedural 3D & Consistent Rendering

**Project:** LabourConnect AI Engine  
**Sprint:** SPRINT 3  
**Mode:** Incremental, Inch-by-Inch Implementation  
**Starting Checkpoint:** LC-S3-CP-0001  
**Status:** IN PROGRESS  

---

## 1. Sprint Objective
Build the foundational architecture, procedural 3D building geometry generator, architectural styling & variation engine, materials & lighting simulation, and multi-view rendering pipeline capable of transforming LabourConnect's Canonical Design Model (JSON Schema v2.0.0) into dimensionally accurate, vertically aligned, inspectable, and photorealistic 3D residential architecture without relying on external hosted AI-generation APIs and without static building image templates.

---

## 2. Approved Task Sequence and Dependencies

```
[S3-T01: 3D Engine Audit & Geometry Foundation] (LC-S3-CP-0001)
         ↓
[S3-T02: Complete Procedural Building Generation] (LC-S3-CP-0002)
         ↓
[S3-T03: Architectural Design Intelligence & Variation] (LC-S3-CP-0003)
         ↓
[S3-T04: Professional Materials, Lighting & Rendering] (LC-S3-CP-0004)
         ↓
[S3-T05: Multi-View Integration & 3D Quality Assurance] (LC-S3-CP-0005)
```

---

## 3. Detailed Task Definitions

### Task S3-T01: 3D Engine Audit & Geometry Foundation
- **ID:** S3-T01
- **Checkpoint:** LC-S3-CP-0001
- **Focus:** Conduct deep repository and architecture audit; establish authoritative 3D coordinate convention (Right-Handed, Y-Up, Z-Depth); implement centralized decimal-safe unit conversion (feet, metres, inches, mm); establish floor elevation and vertical stacking rules; create 3D spatial boundary and AABB operations; implement geometry input validation and error diagnostics; build comprehensive automated test suite.
- **Dependencies:** Sprint 2 Accepted (LC-S2-CP-0014).

### Task S3-T02: Complete Procedural Building Generation
- **ID:** S3-T02
- **Checkpoint:** LC-S3-CP-0002
- **Focus:** Procedural generation of complete physical 3D building components strictly derived from the Canonical Design Model: foundation plinth slabs, multi-floor intermediate RCC slabs, exterior and interior walls with clean opening subtraction, doors with frames and leaves, windows with glass and sills, continuous staircases aligned across floors, balconies with safety railings, structural column grids, and roof/parapet structures.
- **Dependencies:** S3-T01.

### Task S3-T03: Architectural Design Intelligence & Variation
- **ID:** S3-T03
- **Checkpoint:** LC-S3-CP-0003
- **Focus:** Architectural style parameters (Modern Contemporary, Minimalist, Luxury Villa, Traditional Kerala/Duplex, Eco-Friendly); procedurally controlled rooflines (flat terrace, sloping mangalore tile, double-height parapets); fenestration rhythms; facade depth modulations; exterior projections and sunshades (chajjas).
- **Dependencies:** S3-T02.

### Task S3-T04: Professional Materials, Lighting & Rendering
- **ID:** S3-T04
- **Checkpoint:** LC-S3-CP-0004
- **Focus:** Physically motivated architectural material definitions (travertine stone, exposed concrete, teak veneer, tinted acoustic glass, vitrified tile, granite plinth); solar daylight simulation across time-of-day (Dawn, Noon, Golden Hour, Dusk, Night); ambient and directional lighting; depth-sorted polygon projection / WebGL render pipeline.
- **Dependencies:** S3-T03.

### Task S3-T05: Multi-View Integration & 3D Quality Assurance
- **ID:** S3-T05
- **Checkpoint:** LC-S3-CP-0005
- **Focus:** Synchronized multi-angle viewing (front orthographic elevation, rear/side elevations, 360° orbit perspective, dollhouse cutaway, continuous walkthrough camera trajectory); UI integration with AI Studio tabs; end-to-end 3D quality inspection and acceptance evaluation across all Sprint 3 criteria.
- **Dependencies:** S3-T04.
