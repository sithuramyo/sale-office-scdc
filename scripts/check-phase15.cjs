const {chromium}=require('C:/Users/sithuramyo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('fs'),assert=require('node:assert/strict'),crypto=require('crypto');
(async()=>{
 fs.mkdirSync('work/phase15-validation',{recursive:true});
 assert.equal(crypto.createHash('sha256').update(fs.readFileSync('public/models/south-dagon-facility-final.glb')).digest('hex'),'99f91fa537421bd548ab5a29cb944175b27142e1f7798e02ff40a633f4cd63f5');
 assert.equal(crypto.createHash('sha256').update(fs.readFileSync('public/models/south-dagon-facility-floor-map.json')).digest('hex'),'c47f2bed9194873def0cc1a98f5943f7865f8aae4993284a63451c9eec3cf04d');
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
 const p=await browser.newPage({viewport:{width:1600,height:1000},reducedMotion:'reduce'}),errors=[],models=[];
 p.on('pageerror',e=>errors.push(e.message));p.on('request',r=>{if(r.url().endsWith('.glb'))models.push(r.url())});
 await p.goto('http://localhost:3000',{waitUntil:'domcontentloaded',timeout:120000});await p.waitForFunction(()=>window.facilityDebug?.assets()?.demoMode,null,{timeout:120000});
 assert.equal(await p.locator('.asset-marker').count(),0);
 await p.getByRole('button',{name:'Explore facility'}).click();await p.locator('[data-entity=office]').click();await p.locator('[data-floor="2F"]').click();await p.waitForTimeout(300);
 const cutaway=await p.evaluate(()=>window.facilityDebug.floors().hidden),loads=models.length;
 await p.getByRole('button',{name:'Layers',exact:true}).click();
 for(const layer of ['wifi','sensor','access','cctv','network','it'])await p.locator('[data-layer='+layer+']').check();
 await p.getByRole('button',{name:'Close layers'}).click();
 const marker=p.locator('[data-asset-id="demo-office-2f"]');await marker.hover();
 await p.locator('.asset-tooltip').waitFor({state:'visible'});assert.match(await p.locator('.asset-tooltip').innerText(),/unknown/);assert.match(await p.locator('.asset-tooltip').innerText(),/office \/ 2F/);
 await marker.click();assert.match(await p.getByRole('region',{name:'Asset detail'}).innerText(),/Synthetic test location/);
 assert.match(await p.getByRole('region',{name:'Asset detail'}).innerText(),/band/);
 assert.equal((await p.evaluate(()=>window.facilityDebug.state())).selectedFloor,'2F');assert.equal((await p.evaluate(()=>window.facilityDebug.state())).selectedAsset,'demo-office-2f');
 assert.deepEqual(await p.evaluate(()=>window.facilityDebug.floors().hidden),cutaway);
 await p.screenshot({path:'work/phase15-validation/asset-detail.png'});
 await p.getByRole('button',{name:'Restore Building'}).click();
 assert.equal((await p.evaluate(()=>window.facilityDebug.state())).selectedAsset,'demo-office-2f');assert.equal(await p.evaluate(()=>window.facilityDebug.floors().hidden.length),0);assert.equal(models.length,loads);
 for(const [floor,expected]of [['G1','demo-office-g1'],['G2','demo-office-g2'],['2F','demo-office-2f']]){
 await p.locator('[data-floor="'+floor+'"]').click();
 const visible=await p.evaluate(()=>window.facilityDebug.assets().visible);assert.ok(visible.includes(expected));assert.ok(!visible.includes('demo-warehouse'));assert.ok(visible.includes('demo-site'));
 if(floor!=='2F')assert.ok(!visible.includes('demo-office-2f'));
 }
 await p.getByRole('button',{name:'Explore facility'}).click();await p.locator('[data-entity=warehouse]').click();
 assert.deepEqual((await p.evaluate(()=>window.facilityDebug.assets().visible)).sort(),['demo-site','demo-warehouse']);
 await p.locator('[data-preset=overview]').click();assert.equal((await p.evaluate(()=>window.facilityDebug.assets().visible)).length,6);
 await p.getByRole('button',{name:'Explore facility'}).click();await p.locator('[data-entity=office]').click();await p.locator('[data-floor="2F"]').click();
 await p.setViewportSize({width:390,height:844});await p.waitForTimeout(300);await marker.click();await p.screenshot({path:'work/phase15-validation/mobile.png'});assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 await p.getByRole('button',{name:'Layers',exact:true}).click();await p.locator('[data-layer=wifi]').uncheck();await p.getByRole('button',{name:'Close layers'}).click();assert.equal(await marker.count(),0);assert.equal(await p.getByRole('region',{name:'Asset detail'}).count(),0);
 assert.deepEqual(errors,[]);fs.writeFileSync('work/phase15-validation/browser-results.json',JSON.stringify({result:'PASS',hash:'MATCH',sidecar:'UNCHANGED',errors,models,selectionPreservesFloor:true,restorePreservesAsset:true},null,2));
 console.log('Phase 15 browser PASS');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
