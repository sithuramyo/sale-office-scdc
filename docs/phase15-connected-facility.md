# Phase 15 — Connected Facility Foundation

Status: COMPLETE (validation results in work/phase15-validation and work/v1-validation).

Production inventory is empty. No real device positions were supplied. The GLB and floor sidecar remain byte-identical:
- GLB SHA-256: 99f91fa537421bd548ab5a29cb944175b27142e1f7798e02ff40a633f4cd63f5
- Sidecar SHA-256: c47f2bed9194873def0cc1a98f5943f7865f8aae4993284a63451c9eec3cf04d

## Add approved assets
Add definitions to src/data/facility-assets.ts. Asset JSON coordinates = Three.js / glTF Y-up world metres. No Blender conversion, model transforms, reparenting or baked devices.

The shared FacilityAssetDefinition reuses SpatialEntity identity/location/metadata fields and adds asset type, position, optional rotation, enabled/demo flags, room and area IDs. Floor IDs use G1/G2/1F/2F/3F/4F/RF. A floor requires a building; outdoor assets can omit both and specify an area. Parent IDs support Facility → Building → Floor → Room/Area → Asset. Positions must be finite; IDs must be unique.

Appearance and technology layer are configured once in src/config/asset-types.ts. All nine types use FacilityAssetMarker, one projected hover tooltip and FacilityAssetDetail. Metadata is rendered dynamically as escaped text. Markers are constant-size screen overlays anchored to native world points; they are not architectural objects. Rotation is reserved for future directional visualization.

## Static versus operational data
FacilityAssetRuntimeState is separate from definitions. No supplied runtime state means unknown. AssetRegistry.applyRuntime accepts a validated replacement snapshot and rebuilds status buckets without changing spatial data. A future API adapter must notify React when providing a new snapshot; no backend, polling or telemetry source is implemented here.

One initialization builds assetById, assetsByType, assetsByBuilding, assetsByFloor, assetsByStatus and assetsByLayer. Visible candidates are calculated only when layer/building/floor context changes. Animation updates cached marker elements and the single tooltip position; no React pointer-frame updates or full inventory filtering per frame.

## Visibility and context
Enabled AND technology layer AND building context AND floor context AND demo policy. Overview permits all active assets. Building focus permits that building plus outdoor/site assets. Floor focus preserves site and building-global assets but excludes other floors of that building. Asset ownership comes only from asset data, independent of partial geometry membership.

Asset selection has its own state and preserves building/floor/cutaway. Restore retains a selected asset if it remains in context. Changing floors clears selection; disabling a selected asset's layer clears its detail. Counts show actual registered, enabled real assets; development demo counts are separate.

## Demo testing
Start development with NEXT_PUBLIC_SHOW_DEMO_ASSETS=true. Six explicit synthetic records exercise indoor, ground and outdoor flows. Every record has demo:true, a DEMO label, marker badge, detail warning and persistent banner. Layers remain off initially.

Production additionally requires NODE_ENV=development to enable demo mode, so even a production build made with the public demo flag true excludes the demo registry. Normal production shows 0 assets. No real CCTV, AP or other equipment has been placed.

## Validation commands
- node scripts/check-assets.cjs
- node scripts/check-phase15.cjs (development demo flag enabled)
- node scripts/check-phase14.cjs
- node scripts/check-v1.cjs
- node scripts/check-floor-policy.cjs
- node scripts/check-production.cjs (production port 3002)
- node node_modules/typescript/bin/tsc --noEmit
- node node_modules/next/dist/bin/next build --webpack

## Limits
No real inventory, live API, CSV/Excel import, coverage cones, heatmaps or topology. Screen overlays are visible through architecture and use viewport/frustum visibility rather than wall occlusion. Room/area labels are data identifiers until an approved semantic location directory is supplied. Existing architectural and partial-floor uncertainties are unchanged.

Final validation: asset policy PASS; Phase 15 desktop/mobile browser PASS; Phase 14 browser PASS; V1 regression PASS; floor policy PASS; TypeScript PASS; production build PASS; production demo exclusion PASS with every technology layer enabled. Protected asset hashes MATCH.
