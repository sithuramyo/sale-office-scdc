# 3D Facility Model Accuracy Improvement Plan

## Objective

Improve the existing **Three.js / web-based 3D model of the Sales Office, Warehouse, and Distribution Centre** so that the geometry, proportions, site layout, and architectural details match the provided original architectural references as closely as possible.

The goal is **not photorealism**.

The priority is:

> **Accurate architecture + accurate site layout + clean minimal interactive 3D visualization**

The existing frontend architecture and interactive functionality should be preserved wherever possible. Do not introduce a backend or database for this work.

---

# 1. Reference Priority

Use the supplied references in the following priority order.

## Priority 1 — Site / Architectural Plan

Use the site-plan drawing as the primary source for:

- Site boundary
- Building footprints
- Warehouse footprint
- Sales office position
- Loading/unloading area
- Main entrance
- Guardhouse
- Road orientation
- Building setbacks
- Relative distances
- Vehicle circulation areas
- Transformer/generator area
- Overall site proportions

**Do not estimate these dimensions from perspective-rendered images when the plan provides the information.**

The plan must become the ground truth for the horizontal layout.

---

## Priority 2 — Original Architectural Renders

Use the original aerial and street-view renders to determine:

- Building height
- Floor proportions
- Façade appearance
- Window positions
- External staircase
- Roof structures
- Warehouse roof
- Loading bays
- Office podium
- Materials
- Color relationships
- Landscaping
- Architectural details

---

## Priority 3 — Existing 3D Website

The current website should be treated as the implementation starting point, **not the architectural source of truth**.

Preserve useful existing functionality such as:

- Orbit controls
- Zoom
- Reset camera
- Screenshot/image controls
- Fullscreen
- Compass
- Location labels
- View presets
- Auto orbit
- Responsive layout

Do not rebuild working UI functionality unnecessarily.

---

# 2. Core Principle

Do not attempt to make the current model look more realistic before correcting its geometry.

Development order:

```text
Reference Analysis
        ↓
Site Geometry
        ↓
Building Geometry
        ↓
Architectural Details
        ↓
Camera Matching
        ↓
Materials
        ↓
Lighting
        ↓
Environment
        ↓
Interactive Facility Features
```

The model should still look correct even when rendered with simple flat materials.

---

# 3. Coordinate System

Create a consistent world-coordinate convention.

Recommended:

```text
X = East / West
Y = Height
Z = North / South
```

Use meters as the conceptual unit wherever possible.

Example:

```ts
1 Three.js unit = 1 meter
```

Avoid arbitrary scaling for individual objects.

All major structures should share the same site coordinate system.

---

# 4. Rebuild the Site Footprint

The current site appears too rectangular and simplified compared with the architectural plan.

Reconstruct the site using the plan.

Required elements:

- Actual irregular site boundary
- Main road
- Internal road
- Sales office footprint
- Warehouse footprint
- Loading/unloading area
- Main entrance
- Gate
- Guardhouse
- Boundary walls
- Parking areas
- Vehicle circulation
- Transformer/generator location
- Relevant pedestrian areas

Represent the site boundary as a polygon rather than assuming a rectangle.

Example conceptual structure:

```ts
const siteBoundary = [
  { x: ..., z: ... },
  { x: ..., z: ... },
  { x: ..., z: ... },
  ...
];
```

Use `THREE.Shape` / `ShapeGeometry` or equivalent geometry generation.

---

# 5. Sales Office — High Priority Rebuild

The Sales Office currently has the largest architectural mismatch.

Do not represent it as one simple rectangular tower.

Break it into architectural components.

Suggested hierarchy:

```text
SalesOffice
│
├── MainTower
├── GroundFloorPodium
├── EntranceVolume
├── Roof
│   ├── RoofStructure
│   ├── WaterTanks
│   └── UtilityElements
│
├── ExternalStaircase
│   ├── StairFlight01
│   ├── Landing01
│   ├── StairFlight02
│   ├── Landing02
│   └── ...
│
├── Windows
├── Doors
├── Railings
├── Columns
└── AccentFacade
```

---

# 6. Correct Sales Office Proportions

Compare the current tower against the original references.

Correct:

- Width
- Depth
- Overall height
- Floor-to-floor height
- Number of visible floors
- Ground-floor height
- Roof/parapet height
- Podium size
- Relationship between podium and tower

Do not simply stretch the existing mesh.

Modify/rebuild the geometry so that the proportions remain architecturally coherent.

---

# 7. Ground-Floor Podium

The original building contains a substantial projecting lower-level/podium structure.

The current model underrepresents this feature.

Add:

- Projecting ground-floor volume
- Roof/terrace above podium
- Entrance area
- Supporting columns where visible
- Façade openings
- Relevant railings
- Landscaping beside the podium

The tower should visually sit **on/with the podium architecture**, rather than appearing as a plain tower directly emerging from the site.

---

# 8. External Staircase

The external staircase is a major visual landmark and must receive special attention.

Current simplified/repetitive stairs should be replaced with a structurally believable staircase.

Model:

- Stair flights
- Floor landings
- Intermediate landings if visible
- Support structure
- Guard rails
- Handrails
- Vertical supports
- Connections to each floor
- Correct width
- Correct projection from building

Create reusable components/functions if appropriate.

Example:

```ts
createStairFlight(...)
createLanding(...)
createRailing(...)
```

Avoid creating dozens of manually duplicated meshes when procedural generation is practical.

---

# 9. Sales Office Windows

Do not use one uniform window grid across every façade.

Match the reference images.

Windows should vary according to:

- Façade
- Floor
- Staircase side
- Front/rear orientation
- Ground-floor architecture

Create reusable window components using instancing where practical.

Example:

```text
Window
├── Frame
├── Glass
└── Recess / Trim
```

Keep geometry lightweight.

---

# 10. Façade Accent

The original building includes a distinctive yellow/orange vertical façade element.

Correct its:

- Width
- Height
- Position
- Depth
- Relationship to adjacent walls

Do not simply retain the existing strip if its proportions do not match the reference.

---

# 11. Sales Office Roof

Improve the roof according to the aerial reference.

Include visible major features such as:

- Parapet
- Rooftop utility room/structure
- Water tanks
- Relevant equipment
- Roof level changes

These can remain low-poly but should have correct placement and scale.

---

# 12. Warehouse Geometry

The warehouse's basic concept is already recognizable.

Preserve useful existing geometry where possible, but correct:

- Length
- Width
- Height
- Roof pitch
- Ridge position
- Eaves
- Wall proportions
- Relationship to the Sales Office
- Site placement

The site plan should determine its footprint.

The rendered references should determine vertical proportions.

---

# 13. Warehouse Loading Bays

The original warehouse has clearly visible loading/shutter areas.

These are important visual identifiers.

Add:

- Roller shutters
- Loading doors
- Dock openings
- Lower wall/base treatment
- Repeated structural bays
- Canopies where applicable

Create these parametrically if they repeat.

Example:

```ts
const loadingBays = [
  { position: ... },
  { position: ... },
  ...
];
```

---

# 14. Warehouse Wall Detailing

Avoid representing the warehouse as one completely plain green box.

Use lightweight details to communicate industrial construction:

- Vertical metal cladding
- Structural divisions
- Roof seams
- Door openings
- Ventilation/opening details where visible
- Base wall treatment

Do not create excessive geometry for every corrugation.

Prefer:

- Normal maps
- Bump maps
- Repeating textures

or subtle procedural/instanced geometry where appropriate.

---

# 15. Office-to-Warehouse Relationship

Correct the relative:

- Distance
- Orientation
- Connection
- Clearance
- Staircase position
- Loading access
- Vehicle circulation

The two buildings should not merely be positioned until they "look approximately right."

Their positions should originate from the site plan.

---

# 16. Main Entrance

Rebuild the entrance area based on the references.

Include:

- Main gate
- Guardhouse/security booth
- Boundary wall opening
- Vehicle entrance
- Exit if applicable
- Pedestrian entrance where visible

The **Main Entrance** hotspot should point to the actual entrance architecture.

---

# 17. Boundary Wall

The existing boundary should follow the real site polygon.

Correct:

- Wall alignment
- Wall height
- Corner positions
- Entrance interruptions
- Road-facing boundary
- Rear/side boundaries

Avoid forcing the boundary into a rectangular shape.

---

# 18. Road Geometry

The road should follow the site plan.

Correct:

- Road direction
- Site frontage angle
- Road width
- Curb
- Sidewalk where appropriate
- Road markings

The road should not be placed horizontally only because it looks visually convenient from the default camera.

---

# 19. Loading / Unloading Area

The plan explicitly identifies the loading/unloading area.

Represent it as a meaningful part of the facility.

Include:

- Large paved circulation area
- Warehouse loading side
- Truck approach
- Turning space
- Loading positions where known

Later this area may support interactive logistics visualization, so keep it as a separately identifiable scene group.

Example:

```text
Site
├── SalesOffice
├── Warehouse
├── LoadingArea
├── Parking
├── MainEntrance
└── UtilityArea
```

---

# 20. Parking

Use the plan/reference imagery to position parking correctly.

Add lightweight:

- Parking lines
- Vehicle placeholders
- Accessible/assigned spaces only if known
- Drive lanes

Cars should be used for scale, not decoration.

Avoid excessive random vehicle placement.

---

# 21. Landscaping

Landscaping is secondary to architectural accuracy.

After the geometry is corrected, position major trees and planted areas approximately according to the references.

Use low-poly vegetation consistent with the existing visual style.

Avoid random scattering.

Prefer deterministic configuration:

```ts
const trees = [
  { x: ..., z: ..., scale: ... },
  ...
];
```

---

# 22. Materials

Maintain a clean architectural visualization style.

Suggested material groups:

```text
OfficeWall
OfficeAccent
OfficeConcrete
WindowGlass
MetalRailing
WarehouseGreen
WarehouseRoof
Asphalt
Concrete
BoundaryWall
Grass
Road
```

Use physically based materials where reasonable:

```ts
THREE.MeshStandardMaterial
```

Avoid unnecessary high-resolution textures.

---

# 23. Warehouse Color

The warehouse should maintain the dark green industrial appearance visible in the original references.

However, avoid making it so dark that geometry disappears.

Use lighting/material roughness to reveal:

- Roof planes
- Wall divisions
- Loading doors
- Eaves
- Structural depth

---

# 24. Lighting

The current model appears relatively flat/dark.

After geometry correction, improve lighting.

Recommended starting architecture:

```text
Hemisphere / ambient environment
          +
Directional sunlight
          +
Soft shadows
```

Enable shadows selectively.

```ts
renderer.shadowMap.enabled = true;
```

Do not enable expensive shadow casting on every tiny mesh.

Prioritize:

- Buildings
- Major trees
- Vehicles
- Ground

---

# 25. Sky / Background

The current dark-blue environment works for a digital-twin style, so do not replace it automatically.

Provide a clean architectural environment.

Possible modes:

```text
Digital Twin
Daylight
```

If only one mode is implemented initially, use a neutral daylight environment that makes the architecture clearly readable.

Do not make environment realism more important than model readability.

---

# 26. Camera Matching

Create camera presets that correspond to useful architectural viewpoints.

Required presets:

```text
Aerial
Street
Loading Area
Top View
```

Add/reference additional presets internally:

```text
Original Aerial Reference
Original Street Reference
Office Front
Office Staircase
Warehouse Overview
Site Overview
```

For reference-matching cameras, tune:

- Camera position
- Target
- FOV
- Near/far clipping
- Orbit target

The purpose is to make it possible to compare the web model against the original architectural render from approximately the same perspective.

---

# 27. Camera Configuration

Store camera presets as data rather than scattering hard-coded positions throughout components.

Example:

```ts
const CAMERA_PRESETS = {
  aerial: {
    position: [x, y, z],
    target: [x, y, z],
    fov: 40,
  },

  street: {
    position: [x, y, z],
    target: [x, y, z],
    fov: 45,
  },

  loading: {
    position: [x, y, z],
    target: [x, y, z],
    fov: 45,
  },

  top: {
    position: [x, y, z],
    target: [x, y, z],
    fov: 35,
  },
};
```

Animate transitions between camera presets rather than instantly jumping where practical.

---

# 28. Preserve Current UI

The existing minimal interface is useful.

Preserve the visual direction of:

- Location cards
- Numbered labels
- Bottom camera selector
- Auto Orbit
- Right-side toolbar
- Compass

Do not redesign the entire application as part of the geometry correction.

---

# 29. Hotspots

Current hotspots include:

```text
01 Sales Office
02 Warehouse
03 Main Entrance
```

Keep them, but attach them to meaningful world-space anchors.

Example:

```ts
const hotspots = [
  {
    id: "01",
    name: "Sales Office",
    position: [...]
  },
  {
    id: "02",
    name: "Warehouse",
    position: [...]
  },
  {
    id: "03",
    name: "Main Entrance",
    position: [...]
  }
];
```

Hotspots should remain correctly positioned regardless of camera movement.

---

# 30. Future-Proof Scene Architecture

The model will eventually act as an interactive facility/digital-twin interface.

Structure the code so later features can attach to locations.

Potential future layers:

```text
Facility
│
├── Architecture
│
├── Network
│   ├── Access Points
│   ├── Switches
│   └── Network Links
│
├── CCTV
│   ├── Cameras
│   └── Coverage
│
├── Security
│
├── Fire Safety
│
├── IoT
│
└── Logistics
```

Do **not** implement these systems now unless they already exist.

Only ensure the new architecture does not make future overlays difficult.

---

# 31. Scene Grouping

Use clear scene hierarchy.

Recommended:

```text
FacilityScene
│
├── Site
│   ├── Ground
│   ├── Roads
│   ├── Boundary
│   ├── Parking
│   ├── LoadingArea
│   └── Landscaping
│
├── SalesOffice
│   ├── Structure
│   ├── Windows
│   ├── Staircase
│   ├── Roof
│   └── Details
│
├── Warehouse
│   ├── Structure
│   ├── Roof
│   ├── LoadingBays
│   └── Details
│
├── Entrance
│
├── Utilities
│
└── Hotspots
```

Avoid one giant component containing the entire model.

---

# 32. Recommended Component Structure

Adapt to the existing project rather than blindly replacing it.

Example:

```text
components/
└── facility/
    ├── FacilityScene.tsx
    ├── Site.tsx
    ├── SalesOffice.tsx
    ├── Warehouse.tsx
    ├── MainEntrance.tsx
    ├── Boundary.tsx
    ├── Roads.tsx
    ├── LoadingArea.tsx
    ├── Parking.tsx
    ├── Landscaping.tsx
    │
    ├── office/
    │   ├── OfficeTower.tsx
    │   ├── OfficePodium.tsx
    │   ├── ExternalStaircase.tsx
    │   ├── OfficeWindows.tsx
    │   └── OfficeRoof.tsx
    │
    ├── warehouse/
    │   ├── WarehouseStructure.tsx
    │   ├── WarehouseRoof.tsx
    │   └── LoadingBays.tsx
    │
    └── shared/
        ├── Window.tsx
        ├── Door.tsx
        ├── Railing.tsx
        ├── Tree.tsx
        └── Vehicle.tsx
```

If the project uses plain Three.js rather than React Three Fiber, preserve the project's existing architectural approach and apply the same modular principles.

---

# 33. Configuration-Driven Geometry

Where possible, store measurements separately from rendering logic.

Example:

```ts
export const facilityConfig = {
  office: {
    width: 0,
    depth: 0,
    floorHeight: 0,
    floors: 0,
  },

  warehouse: {
    width: 0,
    length: 0,
    wallHeight: 0,
    roofHeight: 0,
  },

  site: {
    boundary: [],
  },
};
```

Replace `0` values with measurements derived from the references.

This makes future corrections much easier.

---

# 34. Performance Requirements

Architectural accuracy must not destroy browser performance.

Use:

- Instanced meshes for repeated windows
- Instanced meshes for repeated warehouse details
- Shared geometries
- Shared materials
- Texture reuse
- Low-poly vegetation
- Level of detail where necessary

Avoid:

- Thousands of independent draw calls
- Extremely high-poly stairs
- Modeling individual warehouse corrugations unnecessarily
- Huge texture files
- Duplicated materials

Target smooth interaction on normal desktop hardware.

---

# 35. Responsive Behavior

Preserve responsive support.

Ensure:

- Canvas fills available viewport
- Toolbar remains usable
- Bottom camera navigation does not overflow
- Hotspot cards scale/reposition appropriately
- Fullscreen works
- Touch orbit controls remain usable
- Mobile UI does not obscure the entire facility

Do not compromise desktop visualization simply to force all controls onto small screens; use adaptive UI where necessary.

---

# 36. Development Phases

## Phase 1 — Reference Alignment

Before modifying visual details:

- Analyze site plan
- Determine site orientation
- Establish coordinate system
- Establish approximate scale
- Identify major dimensions
- Identify office footprint
- Identify warehouse footprint
- Identify entrance
- Identify loading area

Deliverable:

**Correct site skeleton**

---

## Phase 2 — Site Reconstruction

Build:

- Ground polygon
- Boundary
- Main road
- Internal paved areas
- Entrance
- Loading area
- Parking

Deliverable:

**Accurate site layout**

---

## Phase 3 — Sales Office Reconstruction

Build/correct:

- Tower
- Podium
- Ground level
- Roof
- Accent façade
- Windows
- External staircase

Deliverable:

**Architecturally recognizable Sales Office**

---

## Phase 4 — Warehouse Reconstruction

Build/correct:

- Footprint
- Walls
- Roof
- Loading bays
- Openings
- Industrial façade details

Deliverable:

**Architecturally recognizable Warehouse**

---

## Phase 5 — Supporting Site Elements

Add:

- Guardhouse
- Gate
- Boundary details
- Utilities
- Parking
- Vehicles
- Landscaping

Deliverable:

**Complete facility**

---

## Phase 6 — Camera Matching

Configure:

- Aerial
- Street
- Loading
- Top
- Original-reference comparison views

Deliverable:

**Model can be visually compared against original renders**

---

## Phase 7 — Visual Polish

Improve:

- Materials
- Lighting
- Shadows
- Glass
- Asphalt
- Warehouse cladding
- Environment

Deliverable:

**Clean professional architectural visualization**

---

## Phase 8 — Optimization

Review:

- Draw calls
- Geometry count
- Texture memory
- Shadow performance
- Initial load
- Mobile behavior

Deliverable:

**Production-ready interactive scene**

---

# 37. Validation Method

Do not validate accuracy only by looking at the default orbit camera.

Use reference-image comparison.

For each original rendered viewpoint:

```text
Original Reference
        VS
Three.js Reference Camera
```

Compare:

- Building silhouette
- Building width
- Building height
- Warehouse roofline
- Office/warehouse spacing
- Staircase position
- Window placement
- Ground-floor profile
- Road direction
- Entrance position

Geometry should be corrected before adjusting the camera simply to hide mismatches.

---

# 38. Accuracy Checklist

Before declaring the reconstruction complete:

### Site

- [ ] Site boundary matches plan
- [ ] Site orientation matches plan
- [ ] Road orientation matches plan
- [ ] Entrance is correctly positioned
- [ ] Warehouse footprint matches plan
- [ ] Office footprint matches plan
- [ ] Loading area is correctly represented
- [ ] Parking/circulation is reasonable
- [ ] Boundary wall follows actual site

### Sales Office

- [ ] Width/depth corrected
- [ ] Height corrected
- [ ] Floor count correct
- [ ] Podium represented
- [ ] Ground-floor architecture represented
- [ ] Window pattern corrected
- [ ] Accent façade corrected
- [ ] External staircase accurately represented
- [ ] Roof structure represented
- [ ] Rooftop tanks/equipment represented

### Warehouse

- [ ] Length corrected
- [ ] Width corrected
- [ ] Height corrected
- [ ] Roof pitch corrected
- [ ] Roof ridge correct
- [ ] Loading bays represented
- [ ] Doors/openings represented
- [ ] Wall divisions represented
- [ ] Office relationship corrected

### Environment

- [ ] Guardhouse represented
- [ ] Gate represented
- [ ] Roads represented
- [ ] Parking represented
- [ ] Major landscaping represented
- [ ] Vehicles used appropriately for scale

### UI

- [ ] Sales Office hotspot works
- [ ] Warehouse hotspot works
- [ ] Main Entrance hotspot works
- [ ] Aerial camera works
- [ ] Street camera works
- [ ] Loading Area camera works
- [ ] Top View works
- [ ] Auto Orbit works
- [ ] Reset camera works
- [ ] Fullscreen works
- [ ] Responsive behavior preserved

---

# 39. Important Restrictions

## Do not:

- Add a backend.
- Add a database.
- Redesign the entire UI.
- Replace the current working controls without reason.
- Prioritize photorealism over geometry.
- Guess site layout when the plan provides evidence.
- Model the Sales Office as one simple box.
- Model the Warehouse as one plain green box.
- Make the plot rectangular merely for convenience.
- Add arbitrary architectural features not visible in references.
- Add random trees/cars solely to make the scene look busy.
- Introduce unnecessary dependencies.
- Sacrifice performance for tiny details.

---

# 40. Expected Final Result

The final website should visually communicate the **actual facility design**, while maintaining the clean interactive style of the existing application.

Target:

```text
Architectural Reference
          +
Accurate Site Plan
          ↓
Accurate 3D Geometry
          +
Minimal Materials
          +
Interactive Three.js UI
          ↓
Facility Digital Twin Foundation
```

A person familiar with the actual Sales Office and Warehouse should be able to immediately recognize:

1. The correct site shape.
2. The correct Sales Office.
3. The correct Warehouse.
4. The external staircase.
5. The loading area.
6. The entrance.
7. The relationship between all major structures.

---

# 41. Implementation Instruction for Coding Agent

Before writing code:

1. Inspect the existing project structure.
2. Identify the current Three.js / React Three Fiber implementation.
3. Identify reusable geometry and UI.
4. Do not remove working functionality unnecessarily.
5. Compare the existing geometry against all supplied architectural references.
6. Establish a single facility coordinate system.
7. Correct the site first.
8. Correct the Sales Office second.
9. Correct the Warehouse third.
10. Add architectural details only after proportions are correct.
11. Validate using camera positions that approximate the supplied original renders.
12. Refactor repeated geometry into reusable/configuration-driven components.
13. Keep the implementation frontend-only.

When exact dimensions cannot be determined from the available references, use a clearly documented approximation based on the strongest available visual/plan evidence.

Do not silently invent measurements.

Add comments such as:

```ts
// Approximate measurement derived from architectural reference.
// Replace with confirmed CAD measurement when available.
```

for values that are estimated.

The objective is to progressively move the existing model from a **conceptual approximation** toward an **accurate, maintainable interactive representation of the real facility**.
