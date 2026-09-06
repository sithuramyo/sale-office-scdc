import * as THREE from 'three';

// Metres. Office dimensions are read from the 110' x 51' floor-plan grid.
// Warehouse length/front/rear widths follow the dimensioned site plan.
// Heights, façade openings, and site edges remain exterior-study estimates.
export const DIMENSIONS = {
  office: { width: 15.5448, depth: 33.528, x: 0, z: 28, roof: 25.2 },
  warehouse: { frontWidth: 39.9034, rearWidth: 33.9852, depth: 123.7234, x: 0, z: -64, eaves: 9.4, ridge: 12.2 },
};
// Arrival (+Z), office, then warehouse share the site's longitudinal centreline.
export const SITE = { front: 64, back: -140, centerZ: -38, entranceX: 0, gateZ: 63 };
export const FLOORS = [
  { id: 'g', short: 'G', name: 'Ground floor', y: 0.55, height: 3.35, use: 'Reception, office and storage', description: 'Reception and lobby, meeting room, office area, and sales and closure storage.' },
  { id: 'm', short: 'M', name: 'Mezzanine', y: 3.9, height: 3.3, use: 'Storage and staff facilities', description: 'MT and admin storage, with a PG section for changing and lockers.' },
  { id: '1', short: '01', name: 'First floor', y: 7.2, height: 4.5, use: 'Finance, admin and IDT', description: 'Finance and administration offices, IDT office, meeting room, and supporting facilities.' },
  { id: '2', short: '02', name: 'Second floor', y: 11.7, height: 4.5, use: 'Sales and management', description: 'Sales and open office areas, city and regional management offices, and meeting rooms.' },
  { id: '3', short: '03', name: 'Third floor', y: 16.2, height: 4.5, use: 'Marketing and meetings', description: 'Marketing open office, an 11-person meeting room, and two 5-person meeting rooms.' },
  { id: '4', short: '04', name: 'Fourth floor', y: 20.7, height: 4.5, use: 'Canteen and shrine', description: 'Canteen and bar counter, shrine room, and supporting facilities.' },
];
const unitBox = new THREE.BoxGeometry(1, 1, 1);
const unitCylinder = new THREE.CylinderGeometry(1, 1, 1, 12);
const unitSphere = new THREE.IcosahedronGeometry(1, 1);
const materials = {};
function mat(name, color, options = {}) {
  if (!materials[name]) materials[name] = new THREE.MeshStandardMaterial({ color, roughness: 0.85, ...options });
  return materials[name];
}
function mesh(parent, geometry, material, xyz, scale) {
  const m = new THREE.Mesh(geometry, material);
  m.position.set(...xyz); m.scale.set(...scale);
  m.castShadow = true; m.receiveShadow = true; parent.add(m); return m;
}
function box(p, x, y, z, w, h, d, material) { return mesh(p, unitBox, material, [x,y,z], [w,h,d]); }
function cylinder(p, x, y, z, r, h, material) { return mesh(p, unitCylinder, material, [x,y,z], [r,h,r]); }
function beam(p, from, to, width, material) {
  const a = new THREE.Vector3(...from), b = new THREE.Vector3(...to);
  const m = mesh(p, unitBox, material, a.clone().add(b).multiplyScalar(.5).toArray(), [width,a.distanceTo(b),width]);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), b.sub(a).normalize()); return m;
}
function rail(p, from, to, material, height = 1.05) {
  const [x,y,z] = from, [xx,yy,zz] = to;
  beam(p, [x,y+height,z], [xx,yy+height,zz], .055, material);
  beam(p, [x,y+.45,z], [xx,yy+.45,zz], .035, material);
  const count = Math.ceil(Math.hypot(xx-x, zz-z) / .65);
  for (let i=0; i<=count; i++) {
    const t=i/count; beam(p, [x+(xx-x)*t,y+(yy-y)*t,z+(zz-z)*t], [x+(xx-x)*t,y+(yy-y)*t+height,z+(zz-z)*t], .04, material);
  }
}
function windowUnit(p, x,y,z,w,h,angle=0) {
  const group=new THREE.Group();group.position.set(x,y,z);group.rotation.y=angle;p.add(group);
  box(group,0,0,0,w+.19,h+.19,.16,mat('trim','#edece4'));
  box(group,0,0,.1,w,h,.06,mat('glass','#5e7d8b',{roughness:.25,metalness:.24}));
  box(group,0,-h/2-.07,.18,w+.3,.09,.26,mat('trim','#edece4'));
  if(w>1.5) box(group,0,0,.15,.045,h,.07,mat('frame','#d7dbd7'));
}
function plantedTree(p,x,z,size,seed=0) {
  const trunk=mat('trunk','#81745b'), leaf=mat('leaf'+(seed%3),['#74915e','#90a378','#648160'][seed%3]);
  cylinder(p,x,1.25*size+.35,z,.13*size,2.5*size,trunk);
  const clusters=[[0,3.1,0,1.25],[.75,2.6,.2,.95],[-.7,2.8,.25,1.0],[.1,2.7,-.7,1]];
  for(const [dx,dy,dz,r] of clusters) {
    const m=mesh(p,unitSphere,leaf,[x+dx*size,dy*size+.35,z+dz*size],[r*size,r*size*1.05,r*size]);
    m.rotation.set(seed*.4,seed*.65,seed*.25);
  }
}
function slenderPlant(p,x,z) {
  cylinder(p,x,1.55,z,.15,2.1,mat('trunk','#81745b'));
  mesh(p,unitSphere,mat('hedge','#5f845b'),[x,2.05,z],[.5,1.55,.5]);
}
function car(p,x,z,color,angle=0) {
  const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=angle;p.add(g);
  const paint=mat('car'+color,color,{metalness:.25,roughness:.5});
  box(g,0,.88,0,1.9,.7,4.35,paint);
  box(g,0,1.42,-.15,1.68,.55,2.5,mat('vehicleGlass','#415b63',{roughness:.3}));
  box(g,0,1.74,-.3,1.73,.11,1.85,paint);
  for(const a of [-1,1])for(const b of [-1,1]) {
    const w=cylinder(g,a*.94,.58,b*1.35,.4,.2,mat('rubber','#303a39'));w.rotation.z=Math.PI/2;
    const hub=cylinder(g,a*1.055,.58,b*1.35,.19,.02,mat('alloy','#a5b0ab'));hub.rotation.z=Math.PI/2;
  }
  for(const xx of [-.6,.6])box(g,xx,.96,2.19,.45,.18,.04,mat('headlight','#ecead1',{emissive:'#f4deb2',emissiveIntensity:.25}));
}
function truck(p,x,z,angle=0) {
  const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=angle;p.add(g);
  box(g,0,1.03,0,2.45,.3,8.4,mat('rubber','#303a39'));
  box(g,0,2.5,-.65,2.6,2.75,6.5,mat('truckbody','#e2e3d9'));
  box(g,0,1.9,3.6,2.45,2.2,2.1,mat('truckCab','#587b68'));
  box(g,0,2.45,4.67,2.04,.95,.07,mat('vehicleGlass','#415b63',{roughness:.3}));
  box(g,0,1.05,4.74,2.5,.2,.16,mat('frame','#d7dbd7'));
  for(const xx of [-1.25,1.25])for(const zz of [-2.7,-1.4,3.6]) {
    const wh=cylinder(g,xx,.8,zz,.62,.28,mat('rubber','#303a39'));wh.rotation.z=Math.PI/2;
  }
}
function polygonPrism(points,height,y,material,parent) {
  const shape = new THREE.Shape(points.map(([x,z])=>new THREE.Vector2(x,-z)));
  const geo = new THREE.ExtrudeGeometry(shape,{depth:height,bevelEnabled:false});
  geo.rotateX(-Math.PI/2);geo.translate(0,y,0);
  return mesh(parent,geo,material,[0,0,0],[1,1,1]);
}
function roofSurface(p, corners, material) {
  const geometry = new THREE.BufferGeometry();
  const triangle = corners[0].every((v,i)=>v===corners[3][i]);
  geometry.setAttribute('position',new THREE.Float32BufferAttribute((triangle?corners.slice(0,3):corners).flat(),3));
  geometry.setIndex(triangle?[0,1,2]:[0,1,2,0,2,3]);geometry.computeVertexNormals();
  const m = mesh(p,geometry,material,[0,0,0],[1,1,1]);return m;
}
// Collapse static details by material to keep the whole site responsive on mobile.
function combine(group, kind) {
  group.updateMatrixWorld(true);
  const buckets=new Map();
  group.traverse(object=>{
    if(!object.isMesh)return;
    const material=object.material;
    if(!buckets.has(material))buckets.set(material,{positions:[],normals:[],uvs:[],indices:[]});
    const out=buckets.get(material),g=object.geometry,position=g.attributes.position,normal=g.attributes.normal,uv=g.attributes.uv;
    const offset=out.positions.length/3, nmat=new THREE.Matrix3().getNormalMatrix(object.matrixWorld),v=new THREE.Vector3();
    for(let i=0;i<position.count;i++) {
      v.fromBufferAttribute(position,i).applyMatrix4(object.matrixWorld);out.positions.push(v.x,v.y,v.z);
      if(normal)v.fromBufferAttribute(normal,i).applyNormalMatrix(nmat);else v.set(0,1,0);
      out.normals.push(v.x,v.y,v.z);out.uvs.push(uv?uv.getX(i):0,uv?uv.getY(i):0);
    }
    if(g.index)for(let i=0;i<g.index.count;i++)out.indices.push(g.index.getX(i)+offset);
    else for(let i=0;i<position.count;i++)out.indices.push(i+offset);
  });
  group.clear();
  for(const [material,out] of buckets) {
    const g=new THREE.BufferGeometry();
    g.setAttribute('position',new THREE.Float32BufferAttribute(out.positions,3));
    g.setAttribute('normal',new THREE.Float32BufferAttribute(out.normals,3));
    g.setAttribute('uv',new THREE.Float32BufferAttribute(out.uvs,2));
    g.setIndex(out.indices);g.computeBoundingSphere();
    const m=new THREE.Mesh(g,material);m.castShadow=true;m.receiveShadow=true;m.userData.part=kind;group.add(m);
  }
  group.userData.part=kind;
}
export function buildModel() {
  // Each model instance owns its materials, including during React Strict Mode remounts.
  for(const key of Object.keys(materials))delete materials[key];
  const root=new THREE.Group();root.name='South Dagon Sales Office and SCDC - Concept';
  const office=new THREE.Group(),warehouse=new THREE.Group(),site=new THREE.Group(),context=new THREE.Group();
  office.name='Sales office - ground, mezzanine, first through fourth floors';
  warehouse.name='Green warehouse';site.name='Yard and entrance';context.name='Surrounding road and landscape';
  const plaster=mat('plaster','#aaa194'),trim=mat('trim','#edece4'),concrete=mat('concrete','#c8c8b9'),roof=mat('roof','#deded1');
  const ox=DIMENSIONS.office.x,oz=DIMENSIONS.office.z,w=DIMENSIONS.office.width,d=DIMENSIONS.office.depth,top=DIMENSIONS.office.roof;
  const south=oz+d/2,north=oz-d/2,west=ox-w/2,east=ox+w/2;
  box(office,ox,.3,oz,w+1.2,.6,d+1.2,concrete);
  box(office,ox,top/2+.4,oz,w,top,d,plaster);
  // Front-side vertical yellow feature wall and recessed lift/stair glazing.
  box(office,west-.15,top/2+1,oz-9,.32,top+1.25,3.05,mat('yellow','#d5aa2b'));
  box(office,west-.15,top/2+.5,oz-11.5,.18,top+.25,1.7,mat('glass','#5e7d8b',{roughness:.25,metalness:.24}));
  box(office,west-.25,top/2+.7,oz-10.56,.16,top+1,.15,trim);
  // Long façade: square windows and two recessed balcony stacks.
  for(const floor of FLOORS) {
    const cy=floor.y+floor.height*.53;
    for(const z of [-13,-8,-3,2,7,12]) {
      if(z===2||z===7)continue;
      windowUnit(office,west-.07,cy,oz+z,1.5,1.62,-Math.PI/2);
    }
    for(const z of [-12,-7,-2,3,8,13]) windowUnit(office,east+.07,cy,oz+z,1.5,1.62,Math.PI/2);
    for(const x of [-4.3,0,4.3]) windowUnit(office,ox+x,cy,south+.08,1.55,1.65);
    for(const x of [-4.3,0,4.3]) windowUnit(office,ox+x,cy,north-.08,1.55,1.65,Math.PI);
    if(floor.id!=='g') {
      for(const z of [oz-1.3,oz+7.5]) {
        box(office,west-.1,cy,z,.18,2.8,4.1,mat('balconyInset','#626963'));
        box(office,west-.83,floor.y+.15,z,1.6,.22,4.7,trim);
        rail(office,[west-1.52,floor.y+.27,z-2.35],[west-1.52,floor.y+.27,z+2.35],trim);
        box(office,west-.9,floor.y+.75,z-2.4,1.7,1.2,.14,trim);
        box(office,west-.9,floor.y+.75,z+2.4,1.7,1.2,.14,trim);
      }
    }
  }
  // Ground reception annex and shaded glazing.
  box(office,ox,2.12,south+2.1,w+2,3.4,5.6,plaster);
  box(office,ox,3.92,south+2.1,w+2.7,.2,6.3,mat('annexRoof','#555b56'));
  for(const x of [-5,-2.5,0,2.5,5])windowUnit(office,ox+x,2.35,south+4.94,2.1,1.85);
  box(office,ox,1.5,south+5.02,2.15,2.5,.09,mat('glass','#5e7d8b',{roughness:.25,metalness:.24}));
  box(office,ox,.48,south+5.7,5,.25,1.6,trim);
  box(office,ox,.28,south+6.35,5.6,.18,1.6,concrete);
  for(const x of [-7.3,-5.3,5.3,7.3]) {
    box(office,ox+x,.65,south+5.15,1.45,.6,1.7,trim);
    slenderPlant(office,ox+x,south+5.15);
  }
  // External dog-leg fire escape, matching the reference silhouette.
  const sx=east+1.65,sz=oz+11.4,stairW=2.2;
  for(const xx of [sx-1.4,sx+1.4])for(const zz of [sz-3.35,sz+3.35])box(office,xx,12.5,zz,.22,25,.22,trim);
  for(let f=0;f<FLOORS.length;f++) {
    const level=FLOORS[f],bottom=level.y,high=level.y+level.height,mid=(bottom+high)/2;
    for(const yy of [bottom,high]) {
      box(office,sx,yy,sz+3.0,3.1,.2,1.6,trim);
      rail(office,[sx-1.45,yy+.1,sz+3.77],[sx+1.45,yy+.1,sz+3.77],trim);
      if(yy<top-.5)windowUnit(office,east+.1,yy+1.3,sz+3,1.05,2.2,Math.PI/2);
    }
    box(office,sx,mid,sz-3.0,3.1,.2,1.6,trim);
    const count=10;
    for(let n=0;n<count;n++) {
      const t=(n+.5)/count;
      box(office,sx-.73,bottom+(mid-bottom)*t,sz+2.2-4.4*t,1.35,.15,.49,concrete);
      box(office,sx+.73,mid+(high-mid)*t,sz-2.2+4.4*t,1.35,.15,.49,concrete);
    }
    rail(office,[sx-1.43,bottom+.1,sz+2.2],[sx-1.43,mid+.1,sz-2.2],trim);
    rail(office,[sx+1.43,mid+.1,sz-2.2],[sx+1.43,high+.1,sz+2.2],trim);
    rail(office,[sx-1.45,mid+.1,sz-3.77],[sx+1.45,mid+.1,sz-3.77],trim);
  }
  // Roof plan (ELV drawing, page 14): the enclosed lift/stair core is at
  // the entrance end (+Z); the tanks occupy the opposite end of the roof.
  box(office,ox,top+.56,oz,w+.6,.22,d+.6,roof);
  for(const xx of [west-.12,east+.12])box(office,xx,top+1.05,oz,.18,.85,d+.4,trim);
  for(const zz of [north-.12,south+.12])box(office,ox,top+1.05,zz,w+.4,.85,.18,trim);
  box(office,ox-1.3,top+2.25,south-4,7.3,3.5,6.2,plaster);
  box(office,ox-1.3,top+4.06,south-4,7.7,.2,6.6,trim);
  box(office,ox-2,top+4.76,south-5,3,1.3,3.2,roof);
  windowUnit(office,ox-1.3,top+2.3,south-.8,2.6,1.75);
  for(const xx of [ox-2.1,ox,ox+2.1]) {
    cylinder(office,xx,top+1.72,north+4.8,.75,2.1,mat('tank','#8f9390',{metalness:.6,roughness:.36}));
    for(const yy of [top+.85,top+1.25,top+1.85,top+2.45])cylinder(office,xx,yy,north+4.8,.78,.055,mat('tankBand','#acb1aa',{metalness:.5}));
    cylinder(office,xx,top+2.83,north+4.8,.52,.15,mat('tankBand','#acb1aa',{metalness:.5}));
  }
  const wh=DIMENSIONS.warehouse,front=wh.z+wh.depth/2,back=wh.z-wh.depth/2,lf=wh.x-wh.frontWidth/2,rf=wh.x+wh.frontWidth/2,lb=wh.x-wh.rearWidth/2,rb=wh.x+wh.rearWidth/2;
  const green=mat('warehouse','#286b60'),greenRib=mat('ribs','#397d6d'),roofGreen=mat('greenroof','#327b69',{roughness:.66,metalness:.15,side:THREE.DoubleSide});
  const points=[[lf,front],[rf,front],[rb,back],[lb,back]];
  polygonPrism(points,wh.eaves,.4,green,warehouse);
  polygonPrism(points,.65,.35,mat('warehouseBase','#b0b2a4'),warehouse);
  roofSurface(warehouse,[[lf-.7,wh.eaves+.4,front+.7],[wh.x,wh.ridge+.4,front+.7],[wh.x,wh.ridge+.4,back-.7],[lb-.7,wh.eaves+.4,back-.7]],roofGreen);
  roofSurface(warehouse,[[wh.x,wh.ridge+.4,front+.7],[rf+.7,wh.eaves+.4,front+.7],[rb+.7,wh.eaves+.4,back-.7],[wh.x,wh.ridge+.4,back-.7]],roofGreen);
  // Close both roof gables.
  for(const [zz,left,right] of [[front,lf,rf],[back,lb,rb]]) {
    roofSurface(warehouse,[[left,wh.eaves+.35,zz],[right,wh.eaves+.35,zz],[wh.x,wh.ridge+.35,zz],[left,wh.eaves+.35,zz]],green);
  }
  // Standing roof seams and side-wall corrugation.
  for(let zz=back;zz<front;zz+=2) {
    const t=(zz-back)/wh.depth,left=lb+(lf-lb)*t,right=rb+(rf-rb)*t;
    beam(warehouse,[left-.45,wh.eaves+.43,zz],[wh.x,wh.ridge+.47,zz],.045,greenRib);
    beam(warehouse,[wh.x,wh.ridge+.47,zz],[right+.45,wh.eaves+.43,zz],.045,greenRib);
    box(warehouse,left-.035,4.95,zz,.07,8.35,.08,greenRib);
    box(warehouse,right+.035,4.95,zz,.07,8.35,.08,greenRib);
  }
  for(let xx=lf+.4;xx<rf;xx+=.65)box(warehouse,xx,5.1,front+.025,.055,8.25,.075,greenRib);
  // Raised ridge ventilator.
  box(warehouse,wh.x,wh.ridge+.75,wh.z,2.55,.7,wh.depth-8,mat('vent','#234e46'));
  box(warehouse,wh.x,wh.ridge+1.18,wh.z,3.8,.17,wh.depth-7,greenRib);
  // Loading canopy along the west service lane; RUD positions follow the site-plan rhythm.
  const canopyZ=wh.z-10,canopyLength=wh.depth-24;
  box(warehouse,lf-3.0,6.1,canopyZ,6.9,.18,canopyLength,greenRib);
  for(let zz=back+6;zz<front-15;zz+=12) {
    box(warehouse,lf-6.1,3.25,zz,.18,5.7,.18,mat('steel','#bac4bb'));
  }
  const doors=[front-23,front-45,front-68,front-90];
  for(const zz of doors) {
    const t=(zz-back)/wh.depth,left=lb+(lf-lb)*t;
    box(warehouse,left-.12,2.86,zz,.16,5.1,5.3,mat('shutter','#69736e'));
    for(let yy=.5;yy<5.4;yy+=.23)box(warehouse,left-.23,yy,zz,.055,.04,5.18,mat('shutterRib','#85918a'));
    for(const side of [-1,1])box(warehouse,left-.24,2.9,zz+side*2.8,.22,5.55,.18,trim);
    box(warehouse,left-.24,5.62,zz,.22,.22,5.8,trim);
    for(const side of [-1,1])cylinder(warehouse,left-1,1.0,zz+side*3,.13,1.25,mat('safetyYellow','#dbb64c'));
  }
  for(const xx of [lf+5,lf+13,lf+21,lf+29,lf+36])windowUnit(warehouse,xx,2.2,front+.08,2.0,1.45);
  for(let zz=back+9;zz<front;zz+=11)windowUnit(warehouse,rf-.4,2.1,zz,1.8,1.4,Math.PI/2);
  // Extend the estimated site boundary to fit the buildings in sequence at their original sizes.
  polygonPrism([[-49,SITE.front],[45,SITE.front],[37,SITE.back],[-36,SITE.back]],.5,-.25,mat('asphalt','#727d79'),site);
  box(context,-1,-.51,SITE.centerZ,114,.3,228,mat('earth','#c9d0bb'));
  box(context,-1,-.24,72,114,.23,12,mat('road','#85918a'));
  for(let x=-55;x<53;x+=9)box(context,x,-.105,72,4,.012,.15,mat('roadMark','#e4e6d9'));
  for(const [frontX,backX] of [[-48,-35],[44,36]]) {
    const length=Math.hypot(frontX-backX,SITE.front-SITE.back-2);
    for(const [y,h,width,material] of [[.12,.22,1.1,concrete],[1.25,2.2,.25,trim]]) {
      const edge=box(site,(frontX+backX)/2,y,SITE.centerZ,width,h,length,material);
      edge.rotation.y=Math.atan2(frontX-backX,SITE.front-SITE.back-2);
    }
  }
  box(site,.5,1.25,SITE.back+1,71,2.2,.25,trim);
  // Main gate is on the building axis; the west gate serves the loading lane.
  for(const [left,right] of [[-48,-44],[-28,-8],[8,44]])box(site,(left+right)/2,1.25,SITE.gateZ,right-left,2.2,.25,trim);
  for(const x of [-44,-28,-8,8])box(site,x,1.65,SITE.gateZ,.55,3.05,.55,trim);
  for(const x of [-24,12]) {
    box(site,x,1.95,56.5,5.1,3.5,4.6,plaster);
    box(site,x,3.8,56.5,5.9,.2,5.3,trim);
    windowUnit(site,x,2.25,58.88,3.35,1.35);
    box(site,x-3.7,1.5,62,.4,2.1,.4,green);
    box(site,x-11.8,2.0,62,16,.09,.09,mat('barrier','#e7e8db'));
    for(let i=0;i<16;i++)box(site,x-19.3+i,2.0,62.06,.4,.09,.05,mat('red','#b76b53'));
  }
  // Ten bays on either side of the office leave the central arrival forecourt clear.
  for(const x of [-23,25]) {
    box(site,x,.035,31.75,6.1,.03,25.5,mat('parking','#818a81'));
    for(let i=0;i<=10;i++)box(site,x,.065,19+i*2.55,5.7,.02,.08,trim);
    box(site,x+(x<0?2.85:-2.85),.065,31.75,.08,.02,25.5,trim);
    for(const [i,c] of [[1,'#c0c4b8'],[4,'#576a69'],[8,'#d4cdbb']])car(site,x,20.275+i*2.55,c,x<0?Math.PI/2:-Math.PI/2);
  }
  truck(site,lf-12,front-43,Math.PI/2);truck(site,lf-11,front-72,Math.PI/2);
  // Yard guidance, curb planters, and trees are illustrative site details.
  for(let z=SITE.back+16;z<53;z+=13)box(site,-34,.04,z,.12,.015,5,mat('yardLine','#d6cfab'));
  for(const [frontX,backX] of [[-44,-31],[40,32]])for(let z=SITE.back+10;z<50;z+=15) {
    const t=(z-SITE.back)/(SITE.front-SITE.back);
    plantedTree(site,backX+(frontX-backX)*t,z,1.1,Math.abs(z)%3);
  }
  for(const x of [-40,-29,29,40])plantedTree(context,x,82,1.6,Math.abs(x)%3);
  for(let z=SITE.back+11;z<40;z+=26)plantedTree(context,-53,z,1.7,Math.abs(z)%3);
  for(const [x,z] of [[-40,44],[-37,4],[-31,-130],[32,-130],[38,30]]) {
    box(site,x,3.8,z,.13,7.2,.13,mat('lightPost','#667c71'));
    box(site,x,7.45,z,1.2,.18,.55,mat('lamp','#eee7bf',{emissive:'#ffd89b',emissiveIntensity:.7}));
  }
  combine(office,'office');combine(warehouse,'warehouse');combine(site,'site');combine(context,'context');
  root.add(office,warehouse,site,context);
  return { root, office, warehouse, site, context, materials: [...new Set(Object.values(materials))] };
}
