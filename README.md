# South Dagon Facility — Digital Twin V1

## Run
`pnpm install`, then `pnpm dev` in `D:\Projects\sale-office-scdc`.
Development: http://localhost:3000.
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

## Phase 14 Floor Explorer
The hash-bound Phase 13 sidecar is copied byte-for-byte to `public/models/south-dagon-facility-floor-map.json`. The source project and GLB are unchanged.

| Control | Source | Behavior | Hidden assets |
|---|---|---|---:|
| G1 | GF / Ground Level I | Limited Mapping; focus only | 0 |
| G2 | 218 explicit unresolved ground_2 records | Limited Mapping; bounds-derived camera focus only | 0 |
| 1F | PARTIAL | Partial Cutaway | 754 |
| 2F | PARTIAL | Partial Cutaway | 516 |
| 3F | PARTIAL | Partial Cutaway | 278 |
| 4F | PARTIAL | Partial Cutaway | 41 |
| RF | PARTIAL | Roof focus; unresolved stair caps retained | 0 |

G2 receives no fabricated member or hide list. Its camera target is the centre of explicit source-record bounds (Y approximately 4.7 m), not a reassigned floor datum. Ground II remains distinct from 1F. Model datums and architectural uncertainty remain provisional.

The sidecar is fetched once per application lifetime. Schema, exact runtime hash/bytes, filename, source count, native Y-up coordinate declaration, bounds, duplicate/missing keys and protected membership are checked before any floor mapping is installed. Invalid sidecars leave normal building navigation available with disabled floor controls. Development logs provide details. A different GLB hash fails model compatibility without fallback.

`floor-map.ts` adapts metadata to UI navigation; `ViewerEngine.ts` resolves member and hide keys across facility groups once. Floor transitions touch cached prior/new hide references, not the full registry. Raycasts use cached candidates and reject invisible ancestors. Member highlighting reuses material clones. Office clicks/hover do not override floor exploration; explicit navigation to other buildings still works.

Visibility is original object visibility AND user layer visibility AND floor visibility AND optional building isolation. Entering floor exploration clears building isolation. Restore clears the floor mask/highlight and focuses Office without reloading or enabling disabled layers. Six rooftop equipment assets retain their Site layer ownership.

Validation: `node scripts/check-phase14.cjs`, `node scripts/check-floor-policy.cjs`, existing `check-v1.cjs`, `check-production.cjs`, TypeScript and Next production build. Screenshots/results are in `work/phase14-validation/`. Tests cover all seven controls, exact hide lists, camera targets, global/multi/unresolved preservation, restore/layers, unchanged matrices, one sidecar request, no model reload, responsive interaction and malformed metadata rejection.

Remaining limits: no complete floor isolation, no G2 ownership promotion, no room/device semantics, unresolved architecture remains visible. No V2 systems were added.


## Interaction and presentation
Only contextual overlays are shown after selection; the model remains full-screen. Initial detail/layer/navigation panels are closed. Hover has one reusable projected tooltip; UI icons have short tooltips. Presets: Overview, Front, Office, Warehouse, Aerial, Gate 1, Gate 2, Parking, Loading Area. Focus is based on inspected bounds.

Damping, limited pan, bounded zoom, above-ground camera clamp, fullscreen, reset, day/night environment and responsive bottom sheet are implemented. No fake live status, metrics, devices, backend, auth, database or APIs are added. The status indicates model loading, not facility operational health.

## Performance
One-time registries: objects by ID, source, group, building, floor and bounds. No full-model traversal or per-object bounds calculation in the render loop. Raycast candidates are cached; hits with invisible ancestors are rejected; hover is throttled and React updates only when the logical hovered entity changes. Materials are cloned lazily per unique highlighted material, not per mesh. DPR is capped at 1.5. Static 2048 shadow maps refresh on visibility changes. The render loop updates camera/controls and two DOM indicators. Models, controls, GPU resources and pending load requests are disposed on unmount.

## Validation
Typecheck and production Next.js build passed. There is no lint configuration or lint script in the supplied project.
Browser checks confirm final model loading, no legacy fallback, all 2,875 world transforms unchanged, entity selection, partial floor cutaways and compatibility rejection, reversible isolation/Restore, layers, presets, orbit/zoom, fullscreen, and desktop/tablet/mobile layout.
Additional checks cover direct 3D hover/click, tooltip disappearance, and loading failure/retry.
Evidence: `work/v1-validation/`. Production has no scene-inspector UI; development exposes it for diagnostics only.

## Remaining limitations
Complete floor isolation and semantic room inspection await further verified mapping. Auxiliary function, provisional loading/site interpretations, and existing architectural unknowns remain unchanged. Survey north is not established. Performance varies by GPU and browser. No device data or live integration exists in V1.

Three.js references: [GLTFLoader](https://threejs.org/docs/pages/GLTFLoader.html), [OrbitControls](https://threejs.org/docs/pages/OrbitControls.html).

Final production runtime: PASS at http://localhost:3002. Development inspector and debug API are absent in production. See work/v1-validation/production-results.json. Use HTTPS for deployed runtime hash validation.
