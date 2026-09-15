import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
const source=process.argv[2]||'D:/Projects/south-dagon-facility-codex/analysis/phase18.2-unified-assets.json';
const bytes=fs.readFileSync(source),canonical=JSON.parse(bytes);
assert.equal(canonical.assets.length,147);
const counts={},markers={};
const convert=p=>p===null?null:{x:p.x,y:p.z,z:p.y===null?null:-p.y};
const assets=canonical.assets.map(a=>{
 assert.equal(a.lifecycle,'DESIGN');assert.equal(a.actualPosition,null);assert.equal(a.mountHeight,null);
 assert.equal(a.installationStatus,'UNVERIFIED');assert.equal(a.telemetryStatus,'NOT_INTEGRATED');
 const {evidenceSnapshot,...r}=a;
 // Source coordinates remain native DXF. Only registered/visual world fields change frame.
 r.registeredPosition=convert(a.registeredPosition);r.actualPosition=convert(a.actualPosition);r.visualPosition=convert(a.visualPosition);
 r.registeredFootprint=a.registeredFootprint?.map(convert)??null;
 const eligible=a.displayPolicy.review3dEligible&&r.visualPosition!==null&&Object.values(r.visualPosition).every(v=>typeof v==='number'&&Number.isFinite(v));
 if(a.visualPosition)assert.equal(a.positionEvidence.visualZ,'VISUALIZATION_ONLY');
 if(a.registrationStatus==='UNREGISTERED'){assert.equal(r.registeredPosition,null);assert.equal(r.visualPosition,null);}
 counts[a.assetType]=(counts[a.assetType]||0)+1;markers[a.assetType]=(markers[a.assetType]||0)+Number(eligible);
 return r;
});
assert.equal(new Set(assets.map(a=>a.id)).size,147);
assert.deepEqual(counts,{CCTV:95,DATA_POINT:24,NETWORK_RACK:2,WIFI_AP:26});
assert.deepEqual(markers,{CCTV:38,DATA_POINT:0,NETWORK_RACK:0,WIFI_AP:24});
for(const handle of ['3BD02','3BD06','3BC19','3BC14','3BC15'])assert.equal(assets.find(a=>a.sourceHandle===handle).visualPosition,null);
const payload={schemaVersion:'19.0',canonicalSha256:crypto.createHash('sha256').update(bytes).digest('hex'),coordinateSystem:'THREE_WORLD_Y_UP_METRES',sourceCoordinateSystem:canonical.coordinateSystem,orientationCoordinateSystem:'BLENDER_Z_UP; retained evidence only, not applied to markers',counts,markers,assets};
const out=path.resolve('src/data/design-assets.json');fs.writeFileSync(out,JSON.stringify(payload));
console.log(JSON.stringify({output:out,bytes:fs.statSync(out).size,counts,markers}));
