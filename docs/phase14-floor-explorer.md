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

Final checks: TypeScript PASS; production build PASS; Phase 14 browser integration PASS; visibility/hash policy PASS; existing V1 browser regression PASS; production browser smoke PASS (no debug API or inspector).
