import type {FacilityAssetDefinition,FacilityAssetRuntimeState} from '@/types/facility-assets';
import raw from './design-assets.json';
import type {DesignAsset} from '@/types/design-asset';
const types={CCTV:'cctv',WIFI_AP:'wifi_ap',DATA_POINT:'data_point',NETWORK_RACK:'network_rack'} as const;
const buildings:Record<string,string>={OFFICE:'office',WAREHOUSE:'warehouse',GATE_1:'gate1',GATE_2:'gate2',SITE:'site'};
// Canonical policy is checked here as well as during generation. No XY/footprint fallback.
export const FACILITY_ASSETS:readonly FacilityAssetDefinition[]=(raw.assets as unknown as DesignAsset[]).map(a=>{
 const p=a.visualPosition;
 const eligible=a.displayPolicy.review3dEligible&&p!==null&&[p.x,p.y,p.z].every(v=>typeof v==='number'&&Number.isFinite(v));
 const buildingId=buildings[a.building];
 return {id:a.id,type:types[a.assetType],label:a.displayName,facilityId:'south-dagon',buildingId,
 floorId:a.floor,roomId:a.roomId??undefined,parentId:a.roomId||`${buildingId}/${a.floor}`,
 position:eligible?[p!.x,p!.y as number,p!.z]:null,evidence:a};
});
export const FACILITY_RUNTIME:readonly FacilityAssetRuntimeState[]=[];
// Synthetic navigation test points, never installed-device locations.
export const DEMO_ASSETS:readonly FacilityAssetDefinition[]=[
 {id:'demo-office-2f',type:'wifi_ap',label:'DEMO · Floor marker',buildingId:'office',floorId:'2F',position:[136,12.3,-17],demo:true,metadata:{purpose:'Synthetic interaction test',band:'Example only'}},
 {id:'demo-office-g1',type:'sensor',label:'DEMO · Ground I marker',buildingId:'office',floorId:'G1',position:[138,1.6,-19],demo:true},
 {id:'demo-office-g2',type:'access_control',label:'DEMO · Ground II marker',buildingId:'office',floorId:'G2',position:[139,4.7,-16],demo:true},
 {id:'demo-site',type:'cctv',label:'DEMO · Outdoor marker',areaId:'site',position:[157,2,-15],demo:true,metadata:{purpose:'Synthetic outdoor test'}},
 {id:'demo-warehouse',type:'network',label:'DEMO · Warehouse marker',buildingId:'warehouse',position:[80,5,-25],demo:true},
 {id:'demo-office-global',type:'it_equipment',label:'DEMO · Building marker',buildingId:'office',position:[130,8,-20],demo:true}
];
export const DEMO_MODE=process.env.NODE_ENV==='development'&&process.env.NEXT_PUBLIC_SHOW_DEMO_ASSETS==='true';
