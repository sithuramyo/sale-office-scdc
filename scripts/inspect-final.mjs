import fs from 'node:fs';import crypto from 'node:crypto';import {Matrix4,Vector3,Quaternion,Box3} from 'three';
const b=fs.readFileSync('public/models/south-dagon-facility-final.glb'),g=JSON.parse(b.subarray(20,20+b.readUInt32LE(12))),nodes=[];
function walk(i,parent=new Matrix4(),parentIndex=null){const n=g.nodes[i],local=n.matrix?new Matrix4().fromArray(n.matrix):new Matrix4().compose(new Vector3(...(n.translation||[0,0,0])),new Quaternion(...(n.rotation||[0,0,0,1])),new Vector3(...(n.scale||[1,1,1]))),world=parent.clone().multiply(local),box=new Box3();if(n.mesh!==undefined)for(const p of g.meshes[n.mesh].primitives){const a=g.accessors[p.attributes.POSITION];box.union(new Box3(new Vector3(...a.min),new Vector3(...a.max)).applyMatrix4(world));}
nodes.push({index:i,name:n.name,type:n.mesh!==undefined?'Mesh':'Group',meshName:n.mesh!==undefined?g.meshes[n.mesh].name:null,parent:parentIndex,children:n.children||[],...n.extras,position:new Vector3().setFromMatrixPosition(world).toArray(),matrix:world.toArray(),bounds:box.isEmpty()?null:{min:box.min.toArray(),max:box.max.toArray()}});
for(const child of n.children||[])walk(child,world,i);}
g.scenes[g.scene||0].nodes.forEach(i=>walk(i));
const assets=nodes.filter(n=>n.source_key),keys=fn=>assets.filter(fn).map(n=>n.source_key),entities=[];
function entity(id,label,subtitle,type,fn){entities.push({id,label,subtitle,type,parentId:'facility',sourceKeys:keys(fn)});}
entity('office','Sales Office','Office building','building',n=>n.facility_group==='02_OFFICE');
entity('warehouse','Warehouse','Distribution centre','building',n=>n.facility_group==='03_WAREHOUSE');
entity('auxiliary','Front auxiliary','Function unconfirmed','building',n=>n.facility_group==='04_AUXILIARY');
entity('gate1','Gate 1','Site access','area',n=>/^SITE_GATE1_(POST|LEAF)/.test(n.source_object));
entity('gate2','Gate 2','Site access','area',n=>/^SITE_GATE2_(POST|LEAF)/.test(n.source_object));
entity('parking','Parking','Vehicle area','area',n=>/^SITE_ARCH_PARKING_BAY_|^SITE_PARKING_CIRCULATION$/.test(n.source_object));
entity('loading','Loading area','Provisional source area','area',n=>/^SITE_LOADING_(APPROACH|HARDSCAPE)_PROVISIONAL$/.test(n.source_object));
const buildings=new Set(entities.filter(e=>e.type==='building').flatMap(e=>e.sourceKeys)),roads=new Set(keys(n=>/^(SITE_PUBLIC_ROAD_SURFACE|SITE_ROAD_KERB_|P7_CONTEXT_ROAD_)/.test(n.source_object))),landscape=new Set(keys(n=>/^P7_TREE_|^P7_.*(PLANT|SHRUB)/.test(n.source_object)));
const layers={buildings:[...buildings],roads:[...roads],landscape:[...landscape],site:keys(n=>!buildings.has(n.source_key)&&!roads.has(n.source_key)&&!landscape.has(n.source_key))};
const manifest={sha256:crypto.createHash('sha256').update(b).digest('hex'),bytes:b.length,meshNodes:assets.length,floorKeys:[...new Set(assets.flatMap(n=>Object.keys(n).filter(k=>/floor|level/i.test(k))))],entities,floors:[],layers};
fs.mkdirSync('docs',{recursive:true});fs.mkdirSync('src/config',{recursive:true});fs.writeFileSync('src/config/model-manifest.json',JSON.stringify(manifest));fs.writeFileSync('docs/final-scene-index.json',JSON.stringify({manifest,nodes},null,2));console.log(JSON.stringify({...manifest,layers:undefined,entities:entities.map(e=>({id:e.id,count:e.sourceKeys.length}))},null,2));
