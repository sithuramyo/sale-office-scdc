import assert from 'node:assert/strict';
import * as THREE from 'three';
import { buildModel, DIMENSIONS, FLOORS, LAYOUT, SITE } from '../src/lib/build-model.js';

const model=buildModel();
model.root.updateMatrixWorld(true);
const office=new THREE.Box3().setFromObject(model.office);
const warehouse=new THREE.Box3().setFromObject(model.warehouse);
const parking=new THREE.Box3().setFromObject(model.parking);
const o=DIMENSIONS.office,w=DIMENSIONS.warehouse;

assert.ok(o.depth>o.width*2, 'Office must present its narrow end to the road');
assert.ok(w.depth>w.frontWidth*3, 'Warehouse must extend along site depth');
assert.ok(SITE.front-SITE.back>(SITE.frontRight-SITE.frontLeft)*1.8, 'Site must read lengthwise');
assert.equal(o.x,SITE.entranceX, 'Main arrival must lead toward the office');
assert.ok(office.max.z<SITE.gateZ, 'Arrival forecourt must remain clear');
assert.ok(warehouse.max.z>office.min.z+5, 'Warehouse must meet the rear office area');
assert.ok(warehouse.max.z<o.z, 'Warehouse must begin at the rear part of the office');
assert.ok(warehouse.min.z<office.min.z-100, 'Warehouse must continue deep behind the office');
assert.ok(parking.min.z>warehouse.max.z+3, 'Parking must stay in the front yard');
assert.ok(office.max.y>warehouse.max.y*2, 'Office must dominate warehouse height');

// Check the actual merged vertices after parent transforms, not just input dimensions.
let checkedVertices=0;
const point=new THREE.Vector3();
for(const group of [model.office,model.warehouse,model.parking]) {
  group.traverse(mesh=>{
    if(!mesh.isMesh)return;
    const positions=mesh.geometry.attributes.position;
    for(let i=0;i<positions.count;i++) {
      point.fromBufferAttribute(positions,i).applyMatrix4(mesh.matrixWorld);
      assert.ok(point.toArray().every(Number.isFinite));
      assert.ok(point.z>SITE.back&&point.z<SITE.front, 'Geometry outside site depth');
      const t=(point.z-SITE.back)/(SITE.front-SITE.back);
      const left=THREE.MathUtils.lerp(SITE.rearLeft,SITE.frontLeft,t);
      const right=THREE.MathUtils.lerp(SITE.rearRight,SITE.frontRight,t);
      assert.ok(point.x>left&&point.x<right, 'Geometry outside side boundaries');
      if(group===model.warehouse&&point.z>=office.min.z) {
        assert.ok(point.x>office.max.x+1, 'Warehouse must clear the office and exposed stair');
      }
      checkedVertices++;
    }
  });
}

const raycaster=new THREE.Raycaster();
function hit(origin,direction,group) {
  raycaster.set(new THREE.Vector3(...origin),new THREE.Vector3(...direction));
  return raycaster.intersectObject(group,true)[0];
}
const stairEdge=o.x+o.width/2+LAYOUT.stairProjection;
const stairZ=o.z-o.depth/2+LAYOUT.stairRearInset;
const wallHit=hit([stairEdge,4,stairZ],[1,0,0],model.warehouse);
assert.ok(wallHit&&wallHit.distance>1.8&&wallHit.distance<2.5, 'Stair must be close to the warehouse wall');
assert.equal(hit([o.x,12,office.max.z+5],[0,0,-1],model.office)?.object.userData.part,'office');
assert.equal(hit([w.x,30,w.z],[0,-1,0],model.warehouse)?.object.userData.part,'warehouse');
assert.equal(hit([SITE.entranceX,4,SITE.gateZ-3],[0,-1,0],model.site)?.object.userData.part,'site');
for(const floor of FLOORS) {
  // A downward ray at each exposed upper flight must hit its own stair tread.
  const x=o.x+o.width/2+1.65+.73,z=stairZ;
  const treadY=floor.y+floor.height*.75;
  const tread=hit([x,treadY+.3,z],[0,-1,0],model.office);
  assert.ok(tread&&Math.abs(tread.point.y-treadY)<.25, `Missing exposed stair flight at ${floor.name}`);
}
console.log(`Layout passed: ${checkedVertices.toLocaleString()} vertices, ${FLOORS.length} stair flights, picking, boundary clearance, and ${wallHit.distance.toFixed(2)} m stair-to-warehouse gap.`);
