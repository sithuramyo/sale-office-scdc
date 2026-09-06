import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { buildModel, DIMENSIONS, FLOORS, SITE } from './build-model';

const VIEWS = {
  aerial: { position: [-140, 150, 200], target: [0, 3, SITE.centerZ], title: 'The entire site' },
  front: { position: [-56, 28, 116], target: [0, 10, 30], title: 'From the street' },
  loading: { position: [-131, 67, -15], target: [-17, 4, -64], title: 'The loading yard' },
  top: { position: [0, 430, SITE.centerZ+.01], target: [0, 0, SITE.centerZ], title: 'Site from above' },
  office: { position: [-56, 41, 98], target: [DIMENSIONS.office.x, 12, DIMENSIONS.office.z], title: 'The sales office' },
  warehouse: { position: [-109, 98, 78], target: [DIMENSIONS.warehouse.x, 5, DIMENSIONS.warehouse.z], title: 'Storage & distribution' },
  site: { position: [-58, 47, 112], target: [SITE.entranceX, 2, 48], title: 'Arrival & access' },
};
export function createSiteScene(container, callbacks) {
  const scene=new THREE.Scene();
  scene.background=new THREE.Color('#e9ede7');
  scene.fog=new THREE.Fog('#e9ede7',270,550);
  const camera=new THREE.PerspectiveCamera(38,1,.2,900);
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,preserveDrawingBuffer:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.65));
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.3;
  container.appendChild(renderer.domElement);
  renderer.domElement.setAttribute('aria-hidden','true');
  const hemi=new THREE.HemisphereLight('#f8fbff','#81917b',2.7);scene.add(hemi);
  const sun=new THREE.DirectionalLight('#fff1d8',3.3);sun.position.set(-80,140,90);
  sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);
  Object.assign(sun.shadow.camera,{left:-175,right:175,top:185,bottom:-185,near:1,far:420});
  sun.shadow.bias=-.00025;sun.shadow.normalBias=.06;sun.target.position.set(0,0,SITE.centerZ);scene.add(sun,sun.target);
  const fill=new THREE.DirectionalLight('#c1daea',1.1);fill.position.set(80,65,-50);scene.add(fill);
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(2000,2000),new THREE.MeshStandardMaterial({color:'#dfe5d8',roughness:1}));
  ground.rotation.x=-Math.PI/2;ground.position.y=-.7;ground.receiveShadow=true;scene.add(ground);
  const model=buildModel();scene.add(model.root);
  const controls=new OrbitControls(camera,renderer.domElement);
  controls.enableDamping=true;controls.dampingFactor=.08;controls.minDistance=20;controls.maxDistance=500;
  controls.maxPolarAngle=Math.PI/2-.035;controls.minPolarAngle=.002;
  controls.panSpeed=.7;controls.rotateSpeed=.65;controls.zoomSpeed=.85;
  controls.autoRotateSpeed=.45;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let animationId=0,disposed=false,tween=null,evening=false,wireframe=false;
  let width=1,height=1,lastFrame=0,lastLabelUpdate=0,needsRender=true;
  const floorMat=new THREE.MeshBasicMaterial({color:'#dcb75b',transparent:true,opacity:.23,depthWrite:false});
  const floorMarker=new THREE.Mesh(new THREE.BoxGeometry(DIMENSIONS.office.width+.8,1,DIMENSIONS.office.depth+.8),floorMat);
  floorMarker.visible=false;scene.add(floorMarker);
  const edges=new THREE.LineSegments(new THREE.EdgesGeometry(floorMarker.geometry),new THREE.LineBasicMaterial({color:'#e0ab28',transparent:true,opacity:.85}));
  floorMarker.add(edges);
  const anchors={
    office:new THREE.Vector3(DIMENSIONS.office.x,31.5,DIMENSIONS.office.z),
    warehouse:new THREE.Vector3(DIMENSIONS.warehouse.x,15.4,DIMENSIONS.warehouse.z),
    site:new THREE.Vector3(SITE.entranceX,5.5,SITE.gateZ),
  };
  function resize() {
    width=container.clientWidth;height=container.clientHeight;
    if(width<1||height<1)return;
    camera.aspect=width/height;
    camera.fov=width<600?48:38;
    camera.updateProjectionMatrix();renderer.setSize(width,height);needsRender=true;
  }
  const observer=new ResizeObserver(resize);observer.observe(container);resize();
  function setView(name,immediate=false) {
    const view=VIEWS[name]||VIEWS.aerial;
    const position=new THREE.Vector3(...view.position),target=new THREE.Vector3(...view.target);
    if(width<600&&name==='aerial')position.sub(target).multiplyScalar(1.08).add(target);
    controls.autoRotate=false;
    callbacks.onOrbitStop?.();
    if(immediate||reduced){camera.position.copy(position);controls.target.copy(target);tween=null;controls.update();}
    else tween={start:performance.now(),from:camera.position.clone(),fromTarget:controls.target.clone(),to:position,toTarget:target};
    callbacks.onView?.(name,view.title);needsRender=true;
  }
  controls.addEventListener('start',()=>{tween=null;controls.autoRotate=false;callbacks.onOrbitStop?.();needsRender=true;});
  controls.addEventListener('change',()=>{needsRender=true;});
  setView('aerial',true);
  const raycaster=new THREE.Raycaster();
  const pointer=new THREE.Vector2();let press=null;
  function down(e){press={x:e.clientX,y:e.clientY};}
  function up(e) {
    if(e.button!==0||!press||Math.hypot(e.clientX-press.x,e.clientY-press.y)>5)return;
    const rect=renderer.domElement.getBoundingClientRect();
    pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);
    raycaster.setFromCamera(pointer,camera);
    const hit=raycaster.intersectObjects([model.office,model.warehouse,model.site],true)[0];
    if(hit?.object.userData.part)callbacks.onSelect?.(hit.object.userData.part);
    press=null;
  }
  renderer.domElement.addEventListener('pointerdown',down);
  renderer.domElement.addEventListener('pointerup',up);
  const onLost=e=>{e.preventDefault();callbacks.onError?.('The graphics context was interrupted. Reload this page to restore the 3D view.');};
  renderer.domElement.addEventListener('webglcontextlost',onLost);
  function zoom(factor) {
    tween=null;
    const delta=camera.position.clone().sub(controls.target);
    const length=THREE.MathUtils.clamp(delta.length()*factor,controls.minDistance,controls.maxDistance);
    camera.position.copy(controls.target).add(delta.setLength(length));controls.update();needsRender=true;
  }
  function keydown(e) {
    if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','=','-','0'].includes(e.key))e.preventDefault();else return;
    if(e.key==='+'||e.key==='=')return zoom(.88);
    if(e.key==='-')return zoom(1.12);
    if(e.key==='0')return setView('aerial');
    tween=null;controls.autoRotate=false;callbacks.onOrbitStop?.();
    const offset=camera.position.clone().sub(controls.target),spherical=new THREE.Spherical().setFromVector3(offset);
    if(e.key==='ArrowLeft')spherical.theta-=.12;
    if(e.key==='ArrowRight')spherical.theta+=.12;
    if(e.key==='ArrowUp')spherical.phi=Math.max(.01,spherical.phi-.1);
    if(e.key==='ArrowDown')spherical.phi=Math.min(Math.PI/2-.04,spherical.phi+.1);
    camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(spherical));controls.update();needsRender=true;
  }
  container.addEventListener('keydown',keydown);
  function updateLabels(now) {
    if(now-lastLabelUpdate<45)return;lastLabelUpdate=now;
    const labels={};
    for(const [key,anchor] of Object.entries(anchors)) {
      const p=anchor.clone().project(camera);
      labels[key]={x:(p.x*.5+.5)*width,y:(-.5*p.y+.5)*height,visible:p.z<1&&p.z>-1&&Math.abs(p.x)<.91&&Math.abs(p.y)<.82};
    }
    callbacks.onLabels?.(labels);
    const offset=camera.position.clone().sub(controls.target);
    callbacks.onCompass?.(Math.atan2(offset.x,offset.z)*180/Math.PI);
  }
  function tick(now) {
    if(disposed)return;
    animationId=requestAnimationFrame(tick);
    if(document.hidden)return;
    const elapsed=(now-lastFrame)/1000;lastFrame=now;
    if(tween) {
      const t=Math.min(1,(now-tween.start)/950),smooth=t*t*(3-2*t);
      camera.position.lerpVectors(tween.from,tween.to,smooth);controls.target.lerpVectors(tween.fromTarget,tween.toTarget,smooth);
      if(t===1)tween=null;needsRender=true;
    }
    controls.update(Math.min(elapsed,.05));
    if(needsRender||controls.autoRotate||tween) {
      renderer.render(scene,camera);updateLabels(now);needsRender=false;
    }
  }
  animationId=requestAnimationFrame(tick);
  function setEvening(value) {
    evening=value;
    ground.material.color.set(value?'#50616a':'#dfe5d8');
    scene.background.set(value?'#263b48':'#e9ede7');scene.fog.color.copy(scene.background);
    hemi.intensity=value?1.25:2.7;sun.intensity=value?1.5:3.3;sun.color.set(value?'#ffb77e':'#fff1d8');
    sun.position.set(value?-140:-80,value?35:140,90);
    fill.intensity=value?.5:1.1;renderer.toneMappingExposure=value?1.05:1.3;
    for(const material of model.materials) {
      if(material===model.materials.find(m=>m.color.getHexString()==='5e7d8b')) {
        material.emissive.set(value?'#e6c181':'#000000');material.emissiveIntensity=value?.4:0;
      }
    }
    needsRender=true;
  }
  function setWireframe(value) {wireframe=value;for(const m of model.materials)m.wireframe=value;needsRender=true;}
  function showFloor(id) {
    const floor=FLOORS.find(f=>f.id===id);floorMarker.visible=Boolean(floor);
    if(floor){floorMarker.scale.y=floor.height;floorMarker.position.set(DIMENSIONS.office.x,floor.y+floor.height/2,DIMENSIONS.office.z);}
    needsRender=true;
  }
  function download(blob,name) {
    const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);
  }
  async function exportGlb() {
    const { GLTFExporter }=await import('three/addons/exporters/GLTFExporter.js');
    const originalWireframe=wireframe;if(wireframe)setWireframe(false);
    try {
      const buffer=await new GLTFExporter().parseAsync(model.root,{binary:true,onlyVisible:true});
      download(new Blob([buffer],{type:'model/gltf-binary'}),'south-dagon-office-scdc-concept.glb');
    } finally {if(originalWireframe)setWireframe(true);}
  }
  function screenshot() {
    renderer.render(scene,camera);
    return new Promise((resolve,reject)=>renderer.domElement.toBlob(blob=>{
      if(!blob)return reject(new Error('Could not create the image.'));
      download(blob,'south-dagon-site-view.png');resolve();
    },'image/png'));
  }
  function dispose() {
    disposed=true;cancelAnimationFrame(animationId);observer.disconnect();controls.dispose();
    container.removeEventListener('keydown',keydown);
    renderer.domElement.removeEventListener('pointerdown',down);renderer.domElement.removeEventListener('pointerup',up);
    renderer.domElement.removeEventListener('webglcontextlost',onLost);
    const geos=new Set(),mats=new Set(),textures=new Set();
    scene.traverse(o=>{if(o.geometry)geos.add(o.geometry);if(o.material)for(const m of Array.isArray(o.material)?o.material:[o.material]){mats.add(m);for(const val of Object.values(m))if(val?.isTexture)textures.add(val);}});
    geos.forEach(g=>g.dispose());mats.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());
    renderer.dispose();renderer.domElement.remove();
  }
  return {setView,zoom,setEvening,setWireframe,showFloor,exportGlb,screenshot,dispose,
    setRotate(value){tween=null;controls.autoRotate=value;needsRender=true;},
    stats(){return {drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles};},
  };
}
