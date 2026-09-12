const {chromium}=require('C:/Users/sithuramyo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('fs'),assert=require('node:assert/strict'),crypto=require('crypto');
const sidecar=JSON.parse(fs.readFileSync('public/models/south-dagon-facility-floor-map.json'));
(async()=>{
 fs.mkdirSync('work/phase14-validation',{recursive:true});
 assert.deepEqual(fs.readFileSync('public/models/south-dagon-facility-floor-map.json'),fs.readFileSync('D:/Projects/south-dagon-facility-codex/exports/south-dagon-facility-floor-map.json'));
 assert.equal(crypto.createHash('sha256').update(fs.readFileSync('public/models/south-dagon-facility-final.glb')).digest('hex'),sidecar.model.sha256);
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
 const page=await browser.newPage({viewport:{width:1600,height:1000},reducedMotion:'reduce'}),errors=[],requests=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/models\//.test(r.url()))requests.push(r.url())});
 await page.goto('http://localhost:3000',{waitUntil:'domcontentloaded',timeout:120000});await page.waitForFunction(()=>window.facilityDebug?.floors()?.floors.length===7,null,{timeout:120000});
 const baseline=await page.evaluate(()=>window.facilityDebug.inspect());
 await page.getByRole('button',{name:'Explore facility'}).click();await page.locator('[data-entity=office]').click();
 const loads=requests.length;
 const results=[];
 for(const id of ['G1','G2','1F','2F','3F','4F','RF']){
  await page.locator('[data-floor="'+id+'"]').click();await page.waitForTimeout(200);
  const rows=await page.evaluate(()=>window.facilityDebug.inspect()),info=await page.evaluate(()=>window.facilityDebug.floors()),state=await page.evaluate(()=>window.facilityDebug.state());
  const f=info.floors.find(f=>f.id===id),expected=id==='G1'||id==='G2'?[]:sidecar.buildings.office.floors[id].hideAboveKeys;
  assert.deepEqual(rows.filter(a=>!a.visible).map(a=>a.id).sort(),[...expected].sort());
  assert.equal(state.selectedBuilding,'office');assert.equal(state.viewerMode,'FLOOR_FOCUS');
  assert.ok((await page.evaluate(()=>window.facilityDebug.target())).every((v,i)=>Math.abs(v-(f.focusTarget||f.focusBounds.min.map((n,j)=>(n+f.focusBounds.max[j])/2))[i])<1e-8));
  for(const [k,o]of Object.entries(sidecar.objects))if(o.membershipType!=='SINGLE_FLOOR')assert.equal(rows.find(r=>r.id===k).visible,true);
  assert.match(await page.locator('.floor-context').innerText(),id==='G1'||id==='G2'?/Limited Mapping/:/Partial Cutaway/);
  await page.screenshot({path:'work/phase14-validation/'+id+'.png'});results.push({floor:id,hidden:expected.length,target:await page.evaluate(()=>window.facilityDebug.target())});
 }
 assert.equal(requests.length,loads);assert.equal(requests.filter(u=>u.endsWith('floor-map.json')).length,1);
 await page.locator('[data-floor="2F"]').click();
 await page.getByRole('button',{name:'Layers',exact:true}).click();await page.locator('[data-layer=site]').uncheck();await page.locator('[data-layer=buildings]').uncheck();
 await page.getByRole('button',{name:'Close layers'}).click();await page.getByRole('button',{name:'Restore Building'}).click();
 let rows=await page.evaluate(()=>window.facilityDebug.inspect());assert.ok(rows.filter(a=>a.layer==='site'||a.layer==='buildings').every(a=>!a.visible));
 assert.equal((await page.evaluate(()=>window.facilityDebug.state())).selectedFloor,null);
 await page.getByRole('button',{name:'Reset View',exact:true}).click();
 rows=await page.evaluate(()=>window.facilityDebug.inspect());assert.deepEqual(rows.map(a=>({id:a.id,matrix:a.matrix,visible:a.visible})),baseline.map(a=>({id:a.id,matrix:a.matrix,visible:a.visible})));
 await page.setViewportSize({width:390,height:844});await page.getByRole('button',{name:'Explore facility'}).click();await page.locator('[data-entity=office]').click();
 for(const id of ['G1','G2','1F','2F','3F','4F','RF'])await page.locator('[data-floor="'+id+'"]').click();
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await page.screenshot({path:'work/phase14-validation/mobile.png'});
 assert.deepEqual(errors,[]);
 const failures=[];
 for(const [name,mutate]of [
 ['hash',m=>m.model.sha256='invalid'],['schema',m=>m.schemaVersion=99],['coordinates',m=>m.coordinateSystem.gltf='Z-up'],
 ['missing member',m=>m.buildings.office.floors['1F'].memberKeys[0]='missing'],
 ['missing hide',m=>m.buildings.office.floors['1F'].hideAboveKeys[0]='missing'],
 ['duplicate',m=>m.buildings.office.floors['1F'].memberKeys.push(m.buildings.office.floors['1F'].memberKeys[0])],
 ['protected hide',m=>m.buildings.office.floors['1F'].hideAboveKeys.push(m.buildings.office.globalKeys[0])]
 ]){
  const altered=structuredClone(sidecar);mutate(altered);
  await page.route('**/models/south-dagon-facility-floor-map.json',r=>r.fulfill({json:altered}));
  await page.reload({waitUntil:'domcontentloaded',timeout:120000});await page.waitForFunction(()=>window.facilityDebug?.floors()?.error,null,{timeout:60000});
  await page.getByRole('button',{name:'Explore facility'}).click();await page.locator('[data-entity=office]').click();
  assert.equal(await page.locator('[data-floor]:disabled').count(),7);assert.equal(await page.locator('.floor-explorer [role=alert]').innerText(),'Floor mapping incompatible');
  assert.ok((await page.evaluate(()=>window.facilityDebug.inspect())).every(a=>a.visible));failures.push(name);
  await page.unroute('**/models/south-dagon-facility-floor-map.json');
 }
 fs.writeFileSync('work/phase14-validation/results.json',JSON.stringify({result:'PASS',hash:'MATCH',sidecarByteCopy:'PASS',results,compatibilityRejections:failures,errors},null,2));
 console.log('Phase 14 PASS',results);
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
