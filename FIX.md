TASK: Correct the existing 3D Sales Office + Warehouse scene to match the supplied reference images more accurately.

IMPORTANT:
Do NOT redesign the project from scratch.
Keep the existing website, UI, labels, interaction, camera controls, and overall clean visual style.
The main problem is the SITE ORIENTATION, BUILDING ORIENTATION, and SPATIAL LAYOUT.

REFERENCE PRIORITY:
Use the three supplied original architectural renders as the source of truth for:
1. Site orientation
2. Building placement
3. Building proportions
4. Relationship between Sales Office and Warehouse
5. Main entrance position
6. Road and circulation direction

The current 3D website is only a simplified implementation and should NOT be used as the source of truth for geometry.

==================================================
1. FIX THE SITE ORIENTATION — HIGHEST PRIORITY
==================================================

The current model incorrectly emphasizes the WIDTH of the property.

The actual facility should be organized primarily along the LENGTH / DEPTH of the property.

The Main Entrance, Sales Office, and Warehouse must visually follow the same longitudinal site direction.

Think of the site as:

FRONT / MAIN ROAD
        |
        |  Main Entrance
        v
   [ Sales Office ]
        |
        |===============================>
        |       SITE LENGTH / DEPTH
        |
   [ Warehouse extending along site ]

Do NOT arrange the major buildings as if the site composition primarily runs left-to-right across its width.

The viewer must immediately understand that the property extends deeply away from the main road.

==================================================
2. ROTATE / REPOSITION THE SALES OFFICE
==================================================

Correct the Sales Office orientation to match the architectural references.

The office is a tall, relatively narrow multi-storey rectangular building.

Its long axis should follow the site's longitudinal direction rather than being incorrectly aligned across the site's width.

From the main-road/front-side perspective, the narrower end/face of the office should be more visually prominent, while the building extends deeper into the property.

Do not simply rotate the camera to fake this correction.
Actually correct the building geometry/rotation and its position on the site.

==================================================
3. CORRECT SALES OFFICE ARCHITECTURE
==================================================

Make the office closer to the reference:

- Approximately six-storey rectangular office block
- Brown / gray exterior façade
- White/light trim
- Regular rectangular windows
- Large exposed external zig-zag staircase on the warehouse-facing side
- Stair landings visible at each floor
- Lower podium / projecting ground-floor structure
- Small rooftop service structure
- Rooftop cylindrical water tanks
- Preserve the tall, narrow proportions of the original building

The external staircase is an important identifying feature and should be clearly modeled.

==================================================
4. FIX WAREHOUSE POSITION AND SCALE
==================================================

The warehouse should NOT look like an independent building simply placed behind the office.

It should feel physically and operationally connected to the office area.

Position the long green warehouse immediately adjacent to the appropriate side/rear area of the Sales Office, matching the references.

The warehouse should:

- Extend significantly along the LENGTH/DEPTH of the site
- Have a long industrial rectangular footprint
- Use dark green / teal metal cladding
- Have a pitched industrial roof
- Include large loading / roller-shutter openings
- Have a much lower height than the Sales Office
- Visually continue far behind/beside the office

The warehouse footprint should feel substantially larger than the office footprint.

==================================================
5. OFFICE + WAREHOUSE RELATIONSHIP
==================================================

This relationship is critical.

The original architecture shows the office and warehouse as parts of one integrated facility.

The external staircase side of the office should be close to the warehouse/loading-side structure.

Avoid creating a large unrealistic separation between them.

The result should visually read as:

TALL OFFICE BLOCK
      ||
      || close architectural/operational relationship
      ||
LONG LOW WAREHOUSE ==============================>

not:

OFFICE        huge empty space        WAREHOUSE

==================================================
6. MAIN ENTRANCE AND GUARDHOUSE
==================================================

Reposition the Main Entrance according to the longitudinal site layout.

The entrance should connect the external/main road to the internal driveway.

Include the small guard/security structure near the entrance.

The driveway should naturally guide vehicles from:

Main Road
   ↓
Main Entrance / Guardhouse
   ↓
Office circulation area
   ↓
Warehouse / operational areas

Do not make the entrance composition dominate the full width of the site.

==================================================
7. SITE AND ROAD LAYOUT
==================================================

Make the site more consistent with the reference architecture:

- Large paved/asphalt operational surfaces
- Perimeter boundary wall
- Main road outside the site
- Internal vehicle circulation
- Parking near the Sales Office
- Warehouse loading/service circulation
- Guardhouse near entrance
- Landscaping mainly around boundaries and selected office areas

Reduce excessive evenly-spaced decorative trees.

This is an industrial Sales Office + Warehouse facility, so the site should prioritize operational space over decorative landscaping.

==================================================
8. CAMERA / DEFAULT WEBSITE VIEW
==================================================

After correcting the actual geometry, update the default camera.

Use a high three-quarter/isometric perspective similar to the original aerial reference.

The default view should clearly communicate:

MAIN ROAD / ENTRANCE
        ↓
SALES OFFICE
        ↓ / alongside
LONG WAREHOUSE
        ↓
SITE DEPTH

The user should immediately understand the site's LENGTH.

Do not use camera rotation as a substitute for correcting incorrectly rotated geometry.

==================================================
9. KEEP EXISTING WEBSITE FEATURES
==================================================

Preserve:

- Existing minimal UI
- "01 Sales office"
- "02 Warehouse"
- "03 Main entrance"
- Hover/click interactions
- Camera/navigation behavior
- Existing frontend architecture
- Current clean visual presentation

Only modify the 3D scene/model implementation where necessary.

==================================================
10. IMPLEMENTATION APPROACH
==================================================

Before editing code:

1. Inspect the current Three.js / React Three Fiber scene structure.
2. Identify the coordinate system:
   - Which axis currently represents site width?
   - Which axis represents site length/depth?
3. Identify the parent groups for:
   - Site
   - Sales Office
   - Warehouse
   - Entrance
   - Roads
   - Parking
   - Landscaping
4. Correct rotations and positions at the parent/group level where possible.
5. Then adjust individual geometry and architectural details.
6. Reposition labels/interaction anchors after geometry changes.
7. Finally adjust the camera to frame the corrected site.

Do not hard-code random offsets until the overall coordinate system and site orientation are understood.

==================================================
ACCEPTANCE CRITERIA
==================================================

The implementation is complete when:

- The site's long axis is visually obvious.
- Main Entrance, Sales Office and Warehouse follow the correct site direction.
- Sales Office orientation resembles the original references.
- Warehouse extends deeply along the property.
- Office and warehouse appear closely connected.
- External staircase is clearly visible.
- Entrance and guardhouse are correctly positioned relative to the road.
- Site feels like an industrial facility rather than a generic office campus.
- Default aerial view resembles the composition of the supplied architectural renders.
- Existing website UI and interactions continue to work.

Most importantly:

DO NOT optimize the scene to match the current screenshot.

Optimize the scene to match the ORIGINAL ARCHITECTURAL REFERENCE IMAGES.
The current screenshot represents the implementation that needs correction.