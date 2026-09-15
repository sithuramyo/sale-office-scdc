// Phase21A evidence audit. Presentation visibility is not floor ownership.
export const PRESENTATION_ONLY_OCCLUDERS = [
 {key:'asset_01756',source:'OFFICE_ROOF_ACCESS_TOP',floors:['G1','G2','1F','2F','3F','4F'],reason:'Phase21A UAT-06: unresolved overhead roof cap; hide for interior inspection only.'},
 {key:'asset_01792',source:'OFFICE_ROOF_UPPER_CAP',floors:['G1','G2','1F','2F','3F','4F'],reason:'Phase21A UAT-06: unresolved upper cap; not assigned to RF or another floor.'},
 {key:'asset_01755',source:'OFFICE_LOW_WING_TERRACE',floors:['G1'],reason:'Phase21A G1 overhead review: low-wing terrace obscures ground inspection; ownership remains unresolved.'},
 {key:'asset_01392',source:'OFFICE_ENTRANCE_CANOPY',floors:['G1'],reason:'Phase21A G1 overhead review: canopy obscures entrance inspection; remains building-global.'},
] as const;
// Ground II slab/2 verandahs are direct G2 members, not presentation exceptions.
