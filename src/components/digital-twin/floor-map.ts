export type Vec3=[number,number,number];
export interface Bounds {min:Vec3;max:Vec3}
export interface FloorDefinition {label:string;status:'READY_FOR_ISOLATION'|'PARTIAL'|'BLOCKED';memberKeys:string[];hideAboveKeys:string[];focusBounds:Bounds;focusTarget?:Vec3;confidence?:string;readinessReason?:string}
export interface FloorObjectMetadata {source_key:string;source_object:string;facility_group:string;membershipType:'SINGLE_FLOOR'|'MULTI_FLOOR'|'BUILDING_GLOBAL'|'UNRESOLVED';floors:string[];sourceLevels:string[];bounds:Bounds}
export interface FloorMap {schemaVersion:number;status:string;model:{file:string;sha256:string;bytes:number;sourceMeshNodes:number};coordinateSystem:{source:string;gltf:string;focusBounds:string};buildings:{office:{floors:Record<string,FloorDefinition>;globalKeys:string[];multiFloorKeys:string[]}};objects:Record<string,FloorObjectMetadata>;unresolved:{source_key:string;sourceLevels:string[]}[]}
export interface NavigationFloor extends FloorDefinition {id:string;limited:boolean}
let cached:Promise<unknown>|undefined;
export function loadFloorMap(){return cached??=fetch('/models/south-dagon-facility-floor-map.json').then(r=>{if(!r.ok)throw Error('Sidecar request failed');return r.json()});}
export function validateFloorMap(raw:unknown,model:{sha256:string;bytes:number;meshNodes:number},keys:Set<string>):NavigationFloor[]{
 const m=raw as FloorMap;
 const check=(ok:unknown,message:string)=>{if(!ok)throw Error('Floor metadata: '+message)};
 check(m?.schemaVersion===1,'unsupported schema');
 check(m.model?.file==='south-dagon-facility-final.glb'&&m.model.sha256===model.sha256&&m.model.bytes===model.bytes&&m.model.sourceMeshNodes===model.meshNodes,'model compatibility mismatch');
 check(m.coordinateSystem?.source==='Blender Z-up'&&m.coordinateSystem.gltf==='Y-up'&&m.coordinateSystem.focusBounds==='Native glTF / Three.js world coordinates, metres','coordinate declaration mismatch');
 const vector=(v:unknown):v is Vec3=>Array.isArray(v)&&v.length===3&&v.every(Number.isFinite);
 const bounds=(b:Bounds)=>check(b&&vector(b.min)&&vector(b.max)&&b.min.every((n,i)=>n<=b.max[i]),'invalid bounds');
 const keyList=(list:string[])=>{check(Array.isArray(list),'missing key list');check(new Set(list).size===list.length,'duplicate keys');for(const k of list)check(keys.has(k),'missing key '+k)};
 const office=m.buildings?.office;check(office&&m.objects&&Array.isArray(m.unresolved),'missing Office data');
 keyList(office.globalKeys);keyList(office.multiFloorKeys);
 for(const [key,obj] of Object.entries(m.objects)){check(key===obj.source_key&&keys.has(key),'object key mismatch '+key);bounds(obj.bounds);}
 keyList(m.unresolved.map(o=>o.source_key));
 const protectedKeys=new Set([...office.globalKeys,...office.multiFloorKeys,...m.unresolved.map(o=>o.source_key),...Object.entries(m.objects).filter(([,o])=>o.membershipType!=='SINGLE_FLOOR').map(([k])=>k)]);
 const order=['GF','G2','1F','2F','3F','4F','RF'];
 const result=order.map((id,index)=>{
  const f=office.floors[id];check(f&&['PARTIAL','BLOCKED','READY_FOR_ISOLATION'].includes(f.status),'missing/invalid floor '+id);
  bounds(f.focusBounds);if(f.focusTarget)check(vector(f.focusTarget)&&f.focusTarget.every((v,i)=>v>=f.focusBounds.min[i]&&v<=f.focusBounds.max[i]),'invalid focus target');
  keyList(f.memberKeys);keyList(f.hideAboveKeys);
  for(const k of f.memberKeys)check(m.objects[k]?.membershipType==='SINGLE_FLOOR'&&m.objects[k].floors.includes(id),'membership conflict '+k);
  const lower=new Set(order.slice(0,index+1).flatMap(l=>office.floors[l]?.memberKeys||[]));
  for(const k of f.hideAboveKeys)check(!protectedKeys.has(k)&&!lower.has(k)&&m.objects[k]?.membershipType==='SINGLE_FLOOR','unsafe hide key '+k);
  return {...f,id:id==='GF'?'G1':id,label:id==='GF'?'Ground Level I':f.label,limited:f.status==='BLOCKED',hideAboveKeys:f.status==='BLOCKED'?[]:f.hideAboveKeys};
 });
 return result;
}
