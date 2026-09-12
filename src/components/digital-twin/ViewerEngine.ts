import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {loadFloorMap,validateFloorMap,type NavigationFloor} from './floor-map';
import {MODEL_URL} from '@/config/facility';
import type {Manifest,ViewerState,SpatialEntity} from '@/types/facility';
type Asset={id:string;object:T.Object3D;meshes:T.Mesh[];box:T.Box3;source:string;group:string;layer:string;originalVisible:boolean};
import {composedVisibility} from './visibility';

type Hooks={progress:(n:number)=>void;ready:()=>void;error:(message?:string)=>void;hover:(id:string|null)=>void;select:(id:string)=>void};
export class ViewerEngine{
 scene=new T.Scene();camera=new T.PerspectiveCamera(42,1,.25,5000);renderer:T.WebGLRenderer;controls:OrbitControls;
 objectById=new Map<string,Asset>();objectsByFacilityGroup=new Map<string,Asset[]>();objectsBySourceObject=new Map<string,Asset[]>();objectsByBuilding=new Map<string,Asset[]>();objectsByFloor=new Map<string,Asset[]>();boundsByObject=new Map<string,T.Box3>();
 entities=new Map<string,SpatialEntity>();entityBounds=new Map<string,T.Box3>();overview=new T.Box3();root:T.Group|null=null;
 floors=new Map<string,NavigationFloor>();floorError:string|null=null;resolvedFloorMembers=new Map<string,Asset[]>();resolvedFloorHideAbove=new Map<string,Asset[]>();private floorHidden=new Set<Asset>();private duplicateKeys:string[]=[];
 private candidates:T.Mesh[]=[];private entityMeshes=new Map<string,T.Mesh[]>();private entityByMesh=new Map<string,string>();private originals=new Map<T.Mesh,T.Material|T.Material[]>();private highlightCopies=new Map<T.Material,T.Material>();private highlighted=new Set<T.Mesh>();
 private ray=new T.Raycaster();private mouse=new T.Vector2();private hit:T.Vector3|null=null;private hovered:string|null=null;private lastHover=0;private down=[0,0];private disposed=false;private abort=new AbortController();private state:ViewerState|null=null;private reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
 private tween:{start:number;from:T.Vector3;to:T.Vector3;fromTarget:T.Vector3;target:T.Vector3}|null=null;
 private sun=new T.DirectionalLight(0xfff7ed,2.6);private hemi=new T.HemisphereLight(0xeaf3ff,0x7b8375,1.8);private resize:ResizeObserver;
 constructor(private host:HTMLElement,private tooltip:HTMLElement,private compass:HTMLElement,private manifest:Manifest,private hooks:Hooks){
 this.renderer=new T.WebGLRenderer({antialias:true,logarithmicDepthBuffer:true,powerPreference:'high-performance'});this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));this.renderer.toneMapping=T.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.05;this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.autoUpdate=false;this.renderer.shadowMap.type=T.PCFSoftShadowMap;
 this.host.append(this.renderer.domElement);this.renderer.domElement.tabIndex=0;this.renderer.domElement.setAttribute('aria-label','Interactive facility. Orbit with drag; zoom with scroll. Building selector is available for keyboard users.');
 this.scene.background=new T.Color('#bacbd4');this.scene.fog=new T.Fog('#bacbd4',650,2200);this.scene.add(this.hemi,this.sun);this.sun.castShadow=true;this.sun.shadow.mapSize.set(2048,2048);this.sun.shadow.bias=-.0005;this.sun.shadow.normalBias=.25;
 this.controls=new OrbitControls(this.camera,this.renderer.domElement);this.controls.enableDamping=true;this.controls.dampingFactor=.075;this.controls.minDistance=5;this.controls.maxDistance=450;this.controls.maxPolarAngle=Math.PI*.49;this.controls.panSpeed=.65;this.controls.addEventListener('start',this.cancelTween);
 this.resize=new ResizeObserver(()=>{const w=host.clientWidth,h=host.clientHeight;this.camera.aspect=w/h;this.camera.updateProjectionMatrix();this.renderer.setSize(w,h);});this.resize.observe(host);
 const c=this.renderer.domElement;c.addEventListener('pointerdown',this.pointerDown);c.addEventListener('pointerup',this.pointerUp);c.addEventListener('pointermove',this.pointerMove);c.addEventListener('pointerleave',this.pointerLeave);c.addEventListener('webglcontextlost',this.contextLost);
 this.renderer.setAnimationLoop(this.frame);void this.load();
 }
 private async load(){try{
 const floorData=loadFloorMap().then(value=>({value,error:null}),error=>({value:null,error}));
 const response=await fetch(MODEL_URL,{signal:this.abort.signal});if(!response.ok)throw Error('model');const total=Number(response.headers.get('content-length'))||this.manifest.bytes;const reader=response.body?.getReader();let data:ArrayBuffer;
 if(reader){const chunks:Uint8Array[]=[];let size=0;while(true){const {done,value}=await reader.read();if(done)break;chunks.push(value);size+=value.length;this.hooks.progress(Math.min(95,size/total*95));}const all=new Uint8Array(size);let offset=0;chunks.forEach(c=>{all.set(c,offset);offset+=c.length;});data=all.buffer;}else data=await response.arrayBuffer();
 const digest=await crypto.subtle.digest('SHA-256',data);const hash=Array.from(new Uint8Array(digest),n=>n.toString(16).padStart(2,'0')).join('');if(hash!==this.manifest.sha256)throw Error('model mismatch');
 const gltf=await new GLTFLoader().parseAsync(data,'');if(this.disposed){this.disposeRoot(gltf.scene);return;}this.root=gltf.scene;this.scene.add(this.root);this.root.updateMatrixWorld(true);
 const layerByKey=new Map<string,string>();Object.entries(this.manifest.layers).forEach(([layer,keys])=>keys.forEach(k=>layerByKey.set(k,layer)));
 this.root.traverse(o=>{if(!o.userData.source_key)return;const a:Asset={id:o.userData.source_key,source:o.userData.source_object,group:o.userData.facility_group,object:o,box:new T.Box3().setFromObject(o,true),meshes:[],layer:layerByKey.get(o.userData.source_key)||'site',originalVisible:o.visible};
 o.traverse(child=>{if(child instanceof T.Mesh){a.meshes.push(child);child.receiveShadow=true;child.castShadow=a.layer==='buildings';this.originals.set(child,child.material);}});
 if(this.objectById.has(a.id))this.duplicateKeys.push(a.id);this.objectById.set(a.id,a);this.boundsByObject.set(a.id,a.box);for(const [map,key] of [[this.objectsByFacilityGroup,a.group],[this.objectsBySourceObject,a.source]] as const){const bucket=map.get(key)||[];bucket.push(a);map.set(key,bucket);}
 });
 if(this.objectById.size!==this.manifest.meshNodes&&!this.duplicateKeys.length)throw Error('object count');
 this.manifest.entities.forEach(e=>{if(!e.sourceKeys.length)return;this.entities.set(e.id,e);const assets=e.sourceKeys.map(k=>this.objectById.get(k)).filter((a):a is Asset=>!!a);const bounds=new T.Box3();const meshes=assets.flatMap(a=>a.meshes);assets.forEach(a=>bounds.union(a.box));meshes.forEach(m=>this.entityByMesh.set(m.uuid,e.id));this.entityMeshes.set(e.id,meshes);this.entityBounds.set(e.id,bounds);if(e.type==='building')this.objectsByBuilding.set(e.id,assets);this.overview.union(bounds);});
 const metadata=await floorData;if(this.disposed)return;
 try{if(metadata.error)throw metadata.error;if(this.duplicateKeys.length)throw Error('Duplicate GLB source keys: '+this.duplicateKeys.join(','));
 for(const f of validateFloorMap(metadata.value,{sha256:hash,bytes:data.byteLength,meshNodes:this.manifest.meshNodes},new Set(this.objectById.keys()))){
 this.floors.set(f.id,f);const members=f.memberKeys.map(k=>this.objectById.get(k)!);this.resolvedFloorMembers.set(f.id,members);this.objectsByFloor.set(f.id,members);this.resolvedFloorHideAbove.set(f.id,f.hideAboveKeys.map(k=>this.objectById.get(k)!));
 }}catch(e){this.floorError='Floor mapping incompatible';if(process.env.NODE_ENV==='development')console.error(e);}
 this.overview.expandByScalar(8);const center=this.overview.getCenter(new T.Vector3());this.sun.position.copy(center).add(new T.Vector3(100,170,-100));this.sun.target.position.copy(center);this.scene.add(this.sun.target);Object.assign(this.sun.shadow.camera,{left:-150,right:150,top:150,bottom:-150,near:1,far:600});this.sun.shadow.camera.updateProjectionMatrix();
 this.camera.position.copy(center).add(new T.Vector3(260,180,-240));this.controls.target.copy(center);this.rebuildCandidates();this.focus('overview');this.hooks.progress(100);this.hooks.ready();
 }catch(e){if(!this.disposed && !(e instanceof DOMException&&e.name==='AbortError'))this.hooks.error(e instanceof Error&&e.message==='model mismatch'?'Model compatibility mismatch':undefined);}}
 apply(state:ViewerState){const previous=this.state;this.state=state;if(!this.root)return;
 const fullUpdate=!previous||state.activeLayers!==previous.activeLayers||state.isolated!==previous.isolated||(state.isolated&&state.selectedEntity!==previous.selectedEntity);
 const floorChanged=state.selectedFloor!==previous?.selectedFloor;
 if(fullUpdate||floorChanged){
 const nextHidden=new Set(this.resolvedFloorHideAbove.get(state.selectedFloor||'')||[]);
 const changed=fullUpdate?this.objectById.values():new Set([...this.floorHidden,...nextHidden]);
 this.floorHidden=nextHidden;const isolated=state.isolated?new Set(this.entities.get(state.selectedEntity||'')?.sourceKeys||[]):null;
 for(const a of changed)a.object.visible=composedVisibility(a.originalVisible,state.activeLayers[a.layer]!==false,!nextHidden.has(a),!isolated||isolated.has(a.id));
 this.renderer.shadowMap.needsUpdate=true;this.clearHover();
 }
 if(state.selectedEntity!==previous?.selectedEntity || floorChanged){if(state.selectedFloor){const f=this.floors.get(state.selectedFloor);if(f)this.focusBox(new T.Box3(new T.Vector3(...f.focusBounds.min),new T.Vector3(...f.focusBounds.max)),new T.Vector3(.3,1,-.3),f.focusTarget?new T.Vector3(...f.focusTarget):undefined);}else this.focus(state.selectedEntity||'overview');this.highlight();}
 if(state.dayNightMode!==previous?.dayNightMode){const night=state.dayNightMode==='night';this.scene.background=new T.Color(night?'#101a2b':'#bacbd4');this.scene.fog=new T.Fog(night?'#101a2b':'#bacbd4',650,2200);this.hemi.intensity=night?.55:1.8;this.sun.intensity=night?.7:2.6;this.sun.color.set(night?'#8bbaff':'#fff7ed');this.renderer.toneMappingExposure=night?.85:1.05;}
 }
 focus(id:string){if(!this.root)return;if(id==='front'){const box=this.entityBounds.get('office');if(box)this.focusBox(box,new T.Vector3(1,.18,-1));}else if(id==='aerial')this.focusBox(this.overview,new T.Vector3(.35,1,-.4));else this.focusBox(this.entityBounds.get(id)||this.overview,new T.Vector3(1,.7,-1));}
 private focusBox(box:T.Box3,direction:T.Vector3,focusTarget?:T.Vector3){const target=focusTarget||box.getCenter(new T.Vector3()),size=box.getSize(new T.Vector3());const distance=Math.max(10,size.length()/(2*Math.tan(T.MathUtils.degToRad(this.camera.fov/2)))*.95/Math.min(1,this.camera.aspect));const to=target.clone().add(direction.normalize().multiplyScalar(Math.min(430,distance)));
 if(this.reduce){this.camera.position.copy(to);this.controls.target.copy(target);}else this.tween={start:performance.now(),from:this.camera.position.clone(),to,fromTarget:this.controls.target.clone(),target};}
 private cancelTween=()=>{this.tween=null;};
 private rebuildCandidates(){this.renderer.shadowMap.needsUpdate=true;this.candidates=[...this.objectById.values()].flatMap(a=>a.meshes);}
 private pick(e:PointerEvent){const r=this.host.getBoundingClientRect();this.mouse.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);this.ray.setFromCamera(this.mouse,this.camera);const hit=this.ray.intersectObjects(this.candidates,false).find(h=>{for(let o:T.Object3D|null=h.object;o;o=o.parent)if(!o.visible)return false;return true;});return hit&&this.entityByMesh.has(hit.object.uuid)?{id:this.entityByMesh.get(hit.object.uuid)!,point:hit.point}:null;}
 private pointerDown=(e:PointerEvent)=>{this.down=[e.clientX,e.clientY];};
 private pointerUp=(e:PointerEvent)=>{if(e.button!==0||Math.hypot(e.clientX-this.down[0],e.clientY-this.down[1])>5)return;const hit=this.pick(e);if(hit&&!(this.state?.selectedFloor&&hit.id==='office'))this.hooks.select(hit.id);};
 private pointerMove=(e:PointerEvent)=>{if(this.state?.selectedFloor){this.clearHover();return;}if(e.buttons||performance.now()-this.lastHover<100)return;this.lastHover=performance.now();const h=this.pick(e);this.hit=h?.point||null;const id=h?.id||null;if(id!==this.hovered){this.hovered=id;this.hooks.hover(id);this.highlight();}this.tooltip.hidden=!id;if(id){const en=this.entities.get(id)!;this.tooltip.querySelector('strong')!.textContent=en.label;this.tooltip.querySelector('small')!.textContent=en.subtitle;}this.renderer.domElement.style.cursor=id?'pointer':'grab';};
 private pointerLeave=()=>this.clearHover();
 private clearHover(){this.hovered=null;this.hit=null;this.tooltip.hidden=true;this.hooks.hover(null);this.highlight();}
 private highlight(){this.highlighted.forEach(m=>m.material=this.originals.get(m)!);this.highlighted.clear();const meshes=this.state?.selectedFloor?(this.resolvedFloorMembers.get(this.state.selectedFloor)||[]).flatMap(a=>a.meshes):[...new Set([this.state?.selectedEntity,this.hovered])].flatMap(id=>id?this.entityMeshes.get(id)||[]:[]);for(const m of meshes){const copy=(original:T.Material)=>{let c=this.highlightCopies.get(original);if(!c){c=original.clone();if(c instanceof T.MeshStandardMaterial){c.emissive.set('#4b8b9b');c.emissiveIntensity=.12;}this.highlightCopies.set(original,c);}return c;};const original=this.originals.get(m)!;m.material=Array.isArray(original)?original.map(copy):copy(original);this.highlighted.add(m);}}
 private contextLost=(e:Event)=>{e.preventDefault();this.hooks.error();};
 private frame=()=>{if(this.disposed)return;if(this.tween){const t=Math.min(1,(performance.now()-this.tween.start)/1100),s=t*t*(3-2*t);this.camera.position.lerpVectors(this.tween.from,this.tween.to,s);this.controls.target.lerpVectors(this.tween.fromTarget,this.tween.target,s);if(t===1)this.tween=null;}
 this.controls.update();if(this.root){const min=this.overview.min,max=this.overview.max;const before=this.controls.target.clone();this.controls.target.x=T.MathUtils.clamp(before.x,min.x-35,max.x+35);this.controls.target.z=T.MathUtils.clamp(before.z,min.z-35,max.z+35);this.controls.target.y=T.MathUtils.clamp(before.y,0,max.y+10);this.camera.position.add(this.controls.target.clone().sub(before));this.camera.position.y=Math.max(.6,this.camera.position.y);}
 this.compass.style.transform='rotate('+(-this.controls.getAzimuthalAngle())+'rad)';
 if(this.hit&&this.hovered){const p=this.hit.clone().project(this.camera);this.tooltip.style.transform='translate('+Math.max(8,Math.min(this.host.clientWidth-205,(p.x*.5+.5)*this.host.clientWidth+14))+'px,'+Math.max(85,Math.min(this.host.clientHeight-90,(-p.y*.5+.5)*this.host.clientHeight-45))+'px)';}
 this.renderer.render(this.scene,this.camera);};
 project(position:[number,number,number]){const p=new T.Vector3(...position).project(this.camera);return {x:(p.x*.5+.5)*this.host.clientWidth,y:(-p.y*.5+.5)*this.host.clientHeight,visible:p.z>=-1&&p.z<=1&&Math.abs(p.x)<=1&&Math.abs(p.y)<=1};}
 inspect(){return [...this.objectById.values()].map(a=>({id:a.id,name:a.object.name,type:a.object.type,parent:a.object.parent?.name,children:a.object.children.length,source_object:a.source,facility_group:a.group,worldPosition:a.object.getWorldPosition(new T.Vector3()).toArray(),bounds:{min:a.box.min.toArray(),max:a.box.max.toArray()},matrix:a.object.matrixWorld.toArray(),visible:a.object.visible,originalVisible:a.originalVisible,layer:a.layer}));}
 floorInfo(){return {error:this.floorError,floors:[...this.floors.values()],hidden:[...this.floorHidden].map(a=>a.id)};}
 private disposeRoot(root:T.Object3D){const geometries=new Set<T.BufferGeometry>(),materials=new Set<T.Material>();root.traverse(o=>{if(o instanceof T.Mesh){geometries.add(o.geometry);(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>materials.add(m));}});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());}
 dispose(){this.disposed=true;this.abort.abort();this.renderer.setAnimationLoop(null);this.resize.disconnect();this.controls.dispose();this.highlighted.forEach(m=>m.material=this.originals.get(m)!);this.highlightCopies.forEach(m=>m.dispose());if(this.root)this.disposeRoot(this.root);this.renderer.dispose();this.renderer.domElement.remove();}
}
