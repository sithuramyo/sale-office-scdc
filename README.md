# South Dagon Facility — Digital Twin V1

## Run
`pnpm install`, then `pnpm dev` in `D:\Projects\sale-office-scdc`.
Development: http://127.0.0.1:3000.
Production: `pnpm build`, then `pnpm start`.
Node.js 20.9+; installed stack: Next.js 16.3.4, React 19.2.8, Three.js 0.180.0, TypeScript 5.9.3.
This is a fresh frontend. The old runtime viewer, scene generator, object mappings, UI and stylesheet have been replaced. The old GLB remains on disk but has no active runtime reference or fallback. pnpm-lock.yaml is the dependency lockfile.

## Authoritative model
Runtime: `/models/south-dagon-facility-final.glb`.
The requested source path under `south-dagon-facility\exports` did not exist. The user explicitly approved using `D:\Projects\south-dagon-facility-codex\exports\south-dagon-facility-final.glb` instead.
The copied asset is byte-identical. SHA-256: `99f91fa537421bd548ab5a29cb944175b27142e1f7798e02ff40a633f4cd63f5`.
Size: 11,004,656 bytes. Source mesh nodes: 2,875. Total scene nodes: 2,880.
All source geometry, hierarchy, matrices, native scale and orientation remain intact. Native glTF is Y-up; its vertical Y range corresponds to Blender Z. The compass indicates model −Z, not unverified survey north.

## Fresh implementation
- `src/components/digital-twin/DigitalTwin.tsx`: contextual React shell, loading/retry, floor selector, drawers, layers, camera controls.
- `ViewerEngine.ts`: model loading/hash validation, one-time registries, cached bounds, raycast selection, camera interpolation, reversible visibility and material highlighting, day/night lighting, resource disposal.
- `FacilityHotspots.tsx`: data-driven future spatial markers; V1 data is empty.
- `src/state/facility-store.ts`: centralized viewer modes, entity/floor selection, layers, camera preset, drawer and lighting state.
- `src/types/facility.ts`: Facility → Building → Floor → Room/Area → Device contracts.
- `src/config/facility.ts`: four built-environment layers, empty future system layers, final model URL.
- `src/config/model-manifest.json`: inspected, exact source-key membership for interaction entities.
- `src/components/ui/`: reusable icon controls and UI tooltips.
- `src/app/`: fresh Next.js page, layout, styling and icon.
- `scripts/inspect-final.mjs`: reproducible GLB scene inspection.
- `docs/final-scene-index.json`: complete node names, mesh names, hierarchy, extras, positions, bounds and world matrices. Not served publicly.
- `scripts/check-v1.cjs`: Playwright desktop/tablet/mobile interaction checks; uses this machine's Codex Playwright runtime.

## Evidence-backed entity registry
| Entity | Source assets | Evidence |
|---|---:|---|
| Sales Office | 1,878 | `02_OFFICE` |
| Warehouse / distribution centre | 256 | `03_WAREHOUSE` |
| Front auxiliary group | 15 | `04_AUXILIARY`; function unconfirmed |
| Gate 1 | 50 | Actual `SITE_GATE1_POST*` / `SITE_GATE1_LEAF*` source names |
| Gate 2 | 36 | Actual `SITE_GATE2_POST*` / `SITE_GATE2_LEAF*` source names |
| Parking | 98 | Actual `SITE_ARCH_PARKING_BAY_*` / `SITE_PARKING_CIRCULATION` |
| Loading area | 2 | Actual `SITE_LOADING_*_PROVISIONAL`; remains provisional |

The export contains only `source_key`, `source_object`, and `facility_group` extras. Five flat group roots contain the assets. Some gate leaves are in the export Landscape group; the semantic gate registry uses exact source identifiers without reparenting them. Site/road/landscape UI layers are exact source-key lists generated from inspected names. Six office rooftop equipment objects remain in the source Site category; this limitation is preserved and documented.

## Floor Explorer
**FLOOR ISOLATION BLOCKED BY MODEL METADATA**

RF / 4F / 3F / 2F / 1F / GF selection state is implemented. Selecting a label displays its state and the mapping limitation. It does not falsely claim an identified spatial floor or move the camera to an invented elevation. The cutaway action is disabled. Building isolation and Restore Building work without reloading the model.

The GLB has no floor/level/room metadata or floor hierarchy. Names include two ground-level slabs and four numbered slabs; this is insufficient to assign complete wall, facade, stair, roof and interior membership to the six requested labels. Objects spanning levels must not be split by centroid height.

For the next approved export or hash-bound sidecar, supply:
1. `building` (e.g. office), `floor` (GF/1F/2F/3F/4F/RF), and explicit mapping of the two ground levels.
2. `category`: wall/window/door/slab/stair/roof/facade, retaining `source_object` and stable `source_key`.
3. Complete, reviewed member source keys per floor.
4. Explicit handling of multi-floor facade/columns/stairs/shafts and roof equipment.
5. Reviewed `hideAboveKeys` per floor and native glTF `focusBounds`.
6. Optional room/area IDs and parentage.

The manifest's floor contract supports supplied member sets, cached bounds, smooth focus and reversible hiding of approved upper objects. No geometry slicing or speculative floor assignment is used now. Restore clears floor state and isolation and refocuses the building.

## Interaction and presentation
Only contextual overlays are shown after selection; the model remains full-screen. Initial detail/layer/navigation panels are closed. Hover has one reusable projected tooltip; UI icons have short tooltips. Presets: Overview, Front, Office, Warehouse, Aerial, Gate 1, Gate 2, Parking, Loading Area. Focus is based on inspected bounds.

Damping, limited pan, bounded zoom, above-ground camera clamp, fullscreen, reset, day/night environment and responsive bottom sheet are implemented. No fake live status, metrics, devices, backend, auth, database or APIs are added. The status indicates model loading, not facility operational health.

## Performance
One-time registries: objects by ID, source, group, building, floor and bounds. No full-model traversal or per-object bounds calculation in the render loop. Raycast candidates are cached and rebuilt on visibility changes; hover is throttled and React updates only when the logical hovered entity changes. Materials are cloned lazily per unique highlighted material, not per mesh. DPR is capped at 1.5. Static 2048 shadow maps refresh on visibility changes. The render loop updates camera/controls and two DOM indicators. Models, controls, GPU resources and pending load requests are disposed on unmount.

## Validation
Typecheck and production Next.js build passed. There is no lint configuration or lint script in the supplied project.
Browser checks confirm final model loading, no legacy fallback, all 2,875 world transforms unchanged, entity selection, floor state and safe fallback, reversible isolation/Restore, layers, presets, orbit/zoom, fullscreen, and desktop/tablet/mobile layout.
Additional checks cover direct 3D hover/click, tooltip disappearance, and loading failure/retry.
Evidence: `work/v1-validation/`. Production has no scene-inspector UI; development exposes it for diagnostics only.

## Remaining limitations
Floor isolation and semantic interior/room inspection await verified mapping. Auxiliary function, provisional loading/site interpretations, and existing architectural unknowns remain unchanged. Survey north is not established. Performance varies by GPU and browser. No device data or live integration exists in V1.

Three.js references: [GLTFLoader](https://threejs.org/docs/pages/GLTFLoader.html), [OrbitControls](https://threejs.org/docs/pages/OrbitControls.html).

Final production runtime: PASS at http://127.0.0.1:3002. Development inspector and debug API are absent in production. See work/v1-validation/production-results.json. Use HTTPS for deployed runtime hash validation.
