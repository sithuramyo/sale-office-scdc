import {ASSET_TYPES} from '@/config/asset-types';
import type {FacilityAssetDefinition as Asset,FacilityAssetRuntimeState,AssetStatus} from '@/types/facility-assets';
export interface AssetContext {activeLayers:Record<string,boolean>;buildingId:string|null;floorId:string|null;demoMode:boolean}
export function buildAssetRegistry(items:readonly Asset[],runtime:readonly FacilityAssetRuntimeState[]=[]){
 const assetById=new Map<string,Asset>(),assetsByType=new Map<string,Asset[]>(),assetsByBuilding=new Map<string,Asset[]>(),assetsByFloor=new Map<string,Asset[]>(),assetsByStatus=new Map<AssetStatus,Asset[]>(),assetsByLayer=new Map<string,Asset[]>(),runtimeById=new Map<string,FacilityAssetRuntimeState>();
 const add=(map:Map<string,Asset[]>,key:string,a:Asset)=>{const list=map.get(key)||[];list.push(a);map.set(key,list)};
 for(const a of items){
 if(!a.id||assetById.has(a.id)||!ASSET_TYPES[a.type]||a.position.length!==3||!a.position.every(Number.isFinite)||a.floorId&&!a.buildingId)throw Error('Invalid or duplicate spatial asset: '+a.id);
 assetById.set(a.id,a);add(assetsByType,a.type,a);add(assetsByBuilding,a.buildingId||'site',a);if(a.floorId)add(assetsByFloor,(a.buildingId||'')+'/'+a.floorId,a);add(assetsByLayer,ASSET_TYPES[a.type].layer,a);
 }
 const applyRuntime=(states:readonly FacilityAssetRuntimeState[])=>{
 const next=new Map<string,FacilityAssetRuntimeState>();
 for(const state of states){if(!assetById.has(state.assetId)||next.has(state.assetId)||!['online','warning','offline','unknown'].includes(state.status))throw Error('Invalid runtime asset: '+state.assetId);next.set(state.assetId,state);}
 runtimeById.clear();next.forEach((v,k)=>runtimeById.set(k,v));assetsByStatus.clear();assetById.forEach(a=>add(assetsByStatus,runtimeById.get(a.id)?.status||'unknown',a));
 };
 applyRuntime(runtime);
 return {assetById,assetsByType,assetsByBuilding,assetsByFloor,assetsByStatus,assetsByLayer,runtimeById,applyRuntime};
}
export type AssetRegistry=ReturnType<typeof buildAssetRegistry>;
export function assetVisible(a:Asset,c:AssetContext){
 return a.enabled!==false&&!!c.activeLayers[ASSET_TYPES[a.type].layer]&&(!a.demo||c.demoMode)&&(!c.buildingId||!a.buildingId||a.buildingId===c.buildingId)&&(!c.floorId||!a.floorId||a.buildingId!==c.buildingId||a.floorId===c.floorId);
}
export function visibleAssets(r:AssetRegistry,c:AssetContext){
 // Recomputed on context/layer changes only, using active layer buckets.
 return Object.entries(c.activeLayers).filter(([,on])=>on).flatMap(([layer])=>r.assetsByLayer.get(layer)||[]).filter(a=>assetVisible(a,c));
}
