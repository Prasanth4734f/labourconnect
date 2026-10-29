# Canonical Design Schema Specification: LabourConnect AI Engine

**Project:** LabourConnect AI Engine  
**Schema Version:** `2.0.0`  
**Task ID:** S1-T03  
**Checkpoint:** LC-S1-CP-0004  
**Date:** 2026-10-20  
**Status:** Complete  

---

## 1. Objective and Architecture Role

The **Canonical Design Model** is the formal, versioned JSON data contract that serves as the **Single Source of Truth** for the entire LabourConnect AI Engine.

```
                      CANONICAL DESIGN MODEL (JSON Schema v2.0.0)
                                         │
        ┌────────────────────────────────┼────────────────────────────────┐
        ▼                                ▼                                ▼
  2D CAD GENERATOR              PROCEDURAL 3D MESH              DETERMINISTIC BOQ
  (Top plan, elevations,        (Slabs, walls, stairs,          (Concrete m³, steel tons,
   sections, room dimensions)    columns, fenestrations)         masonry sqft, live rates)
        │                                │                                │
        ▼                                ▼                                ▼
  Architectural2dAllAnglesViewer  Procedural3dGenerator / WebGL   DeterministicBoqEngine
```

No downstream renderer, 3D visualizer, or bill-of-quantities estimator may introduce its own independent geometric coordinates or hardcoded spatial templates. Any change to a room or wall in the Canonical Design Model immediately and consistently updates all 2D drawings, 3D geometry, and quantity takeoff figures.

---

## 2. Coordinate System and Units Convention

### A. Coordinate System
- **Origin `(0, 0, 0)`:** Front-Left corner of the plot at ground level (facing the property from the approach road).
- **X-Axis (Width / Frontage):** Horizontal axis across the plot frontage from Left to Right ($0 \le X \le \text{plotWidth}$).
- **Y-Axis (Length / Depth):** Horizontal depth axis from Front boundary toward the Rear boundary ($0 \le Y \le \text{plotLength}$).
- **Z-Axis (Elevation / Height):** Vertical height axis extending upwards:
  - Ground level: $Z = 0.0$ ft
  - Plinth platform top: $Z = +1.5$ ft (finished floor level of Ground Floor)
  - Ground floor ceiling / First floor slab: $Z = +12.0$ ft ($10.5$ ft clear ceiling height)
  - First floor ceiling / Terrace slab: $Z = +22.5$ ft
  - Parapet / Mumty top: $Z = +26.0$ to $+31.0$ ft

### B. Units of Measurement
- **Primary Spatial Units:** **Imperial Feet (decimal ft)**.  
  *Rationale:* Indian residential real estate, plot transactions, architectural drawings, and room programming are universally specified in feet and inches (e.g. 30×40 ft plot, 14×16 ft master bedroom, 2400 sq.ft built-up area). Keeping feet as the primary coordinate unit ensures zero rounding noise when displaying CAD dimensions to clients.
- **Secondary Metric Conversion:** **SI Metres (m)**.  
  *Ratio:* $1\text{ ft} = 0.3048\text{ m}$; $1\text{ sq.ft} = 0.092903\text{ m}^2$.  
  The schema provides automated metric conversion in `site.dimensionsMetres` for structural engineering calculations (IS 456 concrete and steel volumetric takeoffs).

---

## 3. Schema Structure (Top-Level Fields)

```json
{
  "schemaVersion": "2.0.0",
  "id": "des-1729415840-a9b2c",
  "code": "LC-10482",
  "title": "Modern Contemporary 3BHK (OPEN CONTEMPORARY)",
  "designLevel": "Validated preliminary design",
  "version": "v1.0",
  "createdAt": "2026-10-20T12:34:00.000Z",
  "updatedAt": "2026-10-20T12:34:00.000Z",
  "seed": 1729415840133,
  "provenance": {
    "source": "LabourConnect AI Design Engine v2.0",
    "baseDesignId": null,
    "modificationPrompt": null
  },
  "inputs": { ... },
  "site": { ... },
  "metrics": { ... },
  "floors": [ ... ],
  "structuralGrid": { ... },
  "geometry3d": { ... },
  "walkthroughTrajectory": { ... },
  "boqEstimate": { ... },
  "evaluation": { ... }
}
```

---

## 4. Entity Definitions (Detailed Specification)

### 1. `inputs`: Architectural Requirements
Captures the validated user parameters:
- `plotWidth` (number, ft): Frontage dimension.
- `plotLength` (number, ft): Depth dimension.
- `dimensionUnit` (string): `"feet"` or `"metres"`.
- `floorsCount` (integer, $\ge 1$): Number of habitable floors.
- `bhkCount` (integer, $\ge 1$): Number of bedrooms.
- `bathroomsCount` (integer, $\ge 1$): Number of bathrooms.
- `archStyle` (string): `"modern"` | `"minimalist"` | `"luxury_villa"` | `"traditional_duplex"` | `"eco_friendly"`.
- `facingDirection` (string): `"North"` | `"South"` | `"East"` | `"West"` | `"North-East"` | `"South-East"`.
- `homeBudgetInr` (number): Target construction budget in Indian Rupees.
- `amenities` (object): Flags for `hasPooja`, `hasParking`, `hasBalcony`, `hasCourtyard`, `hasSolarPergola`, `kitchenType`.
- `userPrompt` (string): Original raw prompt text.

### 2. `site`: Boundary & Buildable Envelope
- `plotWidth`, `plotLength`, `plotAreaSqft`: Total land parcel dimensions.
- `orientation`: Street facing cardinal direction.
- `setbacks`: `{ front: number, rear: number, left: number, right: number }` (minimum clearances from boundary).
- `buildableEnvelope`:
  - `x`: Left setback offset ($X_{\min}$).
  - `y`: Front setback offset ($Y_{\min}$).
  - `width`: $\text{plotWidth} - (\text{left} + \text{right})$.
  - `length`: $\text{plotLength} - (\text{front} + \text{rear})$.
  - `areaSqft`: $\text{width} \times \text{length}$.

### 3. `metrics`: Area Takeoff & Municipal Ratios
- `plotAreaSqft`: Gross site area.
- `builtUpAreaSqft`: Gross floor area across all levels including wall allowances (~15%).
- `carpetAreaSqft`: Net internal usable room area.
- `groundCoverageSqft`: Footprint of Ground Floor enclosed spaces.
- `groundCoverageRatio`: $\text{groundCoverage} / \text{plotArea}$ ($\le 0.70$ typically).
- `fsiAchieved`: Floor Space Index ($\text{builtUpArea} / \text{plotArea}$).
- `roomCountTotal`: Total habitable spaces.

### 4. `floors`: Multi-Level Spatial Structure
Array of floor objects:
- `floorIndex` (integer): `0` = Ground Floor, `1` = First Floor, `2` = Terrace Level.
- `name` (string): e.g. `"Ground Floor (Level 0)"`.
- `elevationZ` (number, ft): Height above ground datum.
- `floorHeight` (number, ft): Clear vertical height (default `10.5` ft).
- `rooms` (array of Room entities):
  - `id` (string, stable): e.g. `"g_living"`, `"g_kitchen"`, `"f_master_suite"`.
  - `name` (string): Human-readable title, e.g. `"Master Bedroom Suite"`.
  - `type` (string): Enum from `ROOM_TYPES` (`living`, `dining`, `kitchen`, `master_bedroom`, `bedroom`, `bathroom`, `pooja`, `portico`, `balcony`, `courtyard`, `foyer`, `stairwell`, `utility`, `terrace`).
  - `zone` (string): Enum from `ZONES` (`public`, `semi_private`, `private`, `service`, `outdoor`).
  - `bounds` (object): `{ x: number, y: number, width: number, length: number }`.
  - `polygon` (array of vertices): `[{ x, y }, { x+w, y }, { x+w, y+l }, { x, y+l }]`.
  - `areaSqft` (number): Usable floor area.
  - `finish` (string): Material specification, e.g. `"Italian Botticino Marble (800×1600mm)"`.
  - `doors` (array): `[{ id, x, y, width, wall: 'north'|'south'|'east'|'west', swing }]`.
  - `windows` (array): `[{ id, x, y, width, sillHeight, lintelHeight }]`.
- `walls` (array of Wall entities):
  - `id` (string): e.g. `"wall_ext_north_fl0"`.
  - `start`: `{ x: number, y: number }`.
  - `end`: `{ x: number, y: number }`.
  - `thickness`: `0.75` ft (9-inch exterior) or `0.375` ft (4.5-inch interior partition).
  - `height`: `10.0` ft (or `3.5` ft for terrace parapets).
  - `type`: `"exterior"` | `"interior"` | `"parapet"`.
  - `material`: e.g. `"AAC Lightweight Blockwork + Double Plaster"`.

### 5. `structuralGrid`: Column & Beam Framing
- `columns`: Array of `{ id, x, y, width: 0.75, length: 1.25, spec: "RCC 230×380mm (4-T16 + 2-T12)" }`.
- `beams`: Array of `{ id, start: {x,y}, end: {x,y}, depth: 1.25, width: 0.75 }`.
- `columnCount`, `beamCount`.

### 6. `geometry3d`: Procedural 3D Geometry
Derived directly from the room and floor geometry for WebGL / Three.js rendering:
- `slabs`: Extruded plinth, intermediate RCC floor slabs, and terrace roof slabs.
- `walls`: 3D extruded wall prisms with cutouts for openings.
- `openings`: Door portals and window fenestration frames.
- `stairs`: Individual 3D tread steps and riser blocks aligned across floors.
- `columns`: Extruded 3D vertical pillars.
- `bounds3d`: Overall bounding box `{ min: {x,y,z}, max: {x,y,z} }`.

### 7. `walkthroughTrajectory`: Continuous Camera Path
- `waypoints`: Sequenced array of camera positions `{ index, name, floor, position: {x,y,z}, lookAt: {x,y,z}, durationSeconds }`. Eye-level is set to $Z = \text{elevationZ} + 5.5$ ft.

### 8. `evaluation`: Validation & Uniqueness
- `isValid` (boolean): `true` only if all geometric constraints are satisfied.
- `constraintViolations` (array of strings): Hard errors preventing construction.
- `warnings` (array of strings): Non-fatal recommendations.
- `scores`: `{ overall, circulation, daylightVentilation, vaastuCompliance, structuralEfficiency }`.
- `fingerprint` (string): Structural centroid and topology hash for duplicate rejection.

---

## 5. Validation Contract & Error Handling

```
Validation Status = {
  isValid: boolean,
  errors: string[],            // Hard failures (e.g. plot too small, rooms colliding)
  warnings: string[],          // Non-fatal notices (e.g. budget slightly tight)
  checksPerformed: string[]    // Audit trail of tests evaluated
}
```

- **Hard Failures (`isValid: false`):**
  - Plot dimensions $\le 0$ or buildable envelope width/length $\le 0$.
  - Spatial collision: Two rooms on the same floor intersect with overlap area $> 1.5$ sq.ft.
  - Boundary escape: Any room bounding box extends beyond `site.buildableEnvelope`.
  - Vertical misalignment: Stairwell on upper floor shifts $> 0.5$ ft from Ground floor stairwell.
- **Warnings (`isValid: true`):**
  - Minimum room dimension $< 9.0$ ft for habitable bedroom.
  - Secondary bedroom natural ventilation access suboptimal.
  - Target construction budget tight for selected specification.
