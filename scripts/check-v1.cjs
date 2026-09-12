const {chromium}=require('C:/Users/sithuramyo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('fs'),assert=require('node:assert/strict');
(async()=>{
fs.mkdirSync('work/v1-validation',{recursive:true});assert.deepEqual(fs.readFileSync('public/models/south-dagon-facility-final.glb'),fs.readFileSync('D:/Projects/south-dagon-facility-codex/exports/south-dagon-facility-final.glb'));
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--ignore-gpu-blocklist']});
const page=await browser.newPage({viewport:{width:1600,height:1000}});let errors=[],requests=[];
page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(r.url().includes('.glb'))requests.push(r.url());});
await page.goto('http://localhost:3000',{waitUntil:'domcontentloaded',timeout:120000});
await page.waitForFunction(()=>window.facilityDebug?.inspect()?.length===2875,{timeout:120000});await page.waitForTimeout(2000);
assert.ok(requests.some(u=>u.endsWith('/models/south-dagon-facility-final.glb')));assert.ok(!requests.some(u=>u.includes('concept')));
assert.deepEqual(await page.evaluate(()=>window.facilityDebug.root()),[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);
const baseline=await page.evaluate(()=>window.facilityDebug.inspect().map(a=>({id:a.id,matrix:a.matrix})));
await page.screenshot({path:'work/v1-validation/overview.png'});
await page.mouse.move(620,610);await page.waitForTimeout(250);assert.equal(await page.locator('.world-tooltip').isVisible(),true);
await page.screenshot({path:'work/v1-validation/tooltip.png'});
await page.mouse.click(620,610);await page.waitForTimeout(1300);assert.equal((await page.evaluate(()=>window.facilityDebug.state())).selectedEntity,'office');
await page.mouse.move(20,20);assert.equal(await page.locator('.world-tooltip').isVisible(),false);
await page.getByRole('button',{name:'Reset View',exact:true}).click();await page.waitForTimeout(1200);

await page.getByRole('button',{name:'Explore facility'}).click();await page.locator('[data-entity=office]').click();await page.waitForTimeout(1500);
assert.equal(await page.locator('.floor-explorer').isVisible(),true);
await page.locator('[data-floor="2F"]').click();assert.equal((await page.evaluate(()=>window.facilityDebug.state())).selectedFloor,'2F');assert.match(await page.locator('.floor-context').innerText(),/Partial Cutaway/);
assert.equal(await page.evaluate(()=>window.facilityDebug.inspect().filter(a=>!a.visible).length),516);
await page.screenshot({path:'work/v1-validation/office.png'});
await page.getByRole('button',{name:'Isolate',exact:true}).click();assert.ok(await page.evaluate(()=>window.facilityDebug.inspect().filter(a=>!a.visible).length)>0);
const loadsBeforeRestore=requests.length;await page.getByRole('button',{name:'Restore Building'}).click();assert.equal(requests.length,loadsBeforeRestore);assert.equal(await page.evaluate(()=>window.facilityDebug.inspect().filter(a=>!a.visible).length),0);assert.equal((await page.evaluate(()=>window.facilityDebug.state())).selectedFloor,null);
await page.getByRole('button',{name:'Close details'}).click();assert.equal(await page.locator('.detail-drawer').count(),0);
for(const id of ['warehouse','auxiliary','gate1','gate2','parking','loading']){await page.getByRole('button',{name:'Explore facility'}).click();await page.locator('[data-entity='+id+']').click();await page.waitForTimeout(1200);assert.equal((await page.evaluate(()=>window.facilityDebug.state())).selectedEntity,id);}
await page.getByRole('button',{name:'Layers',exact:true}).click();await page.locator('[data-layer=buildings]').uncheck();assert.ok(await page.evaluate(()=>window.facilityDebug.inspect().filter(a=>!a.visible).length)>0);await page.getByRole('button',{name:'Reset View',exact:true}).click();assert.equal(await page.evaluate(()=>window.facilityDebug.inspect().filter(a=>!a.visible).length),0);
await page.getByRole('button',{name:'Night mode'}).click();assert.equal((await page.evaluate(()=>window.facilityDebug.state())).dayNightMode,'night');await page.getByRole('button',{name:'Day mode'}).click();
await page.getByRole('button',{name:'Fullscreen',exact:true}).click();assert.equal(await page.evaluate(()=>!!document.fullscreenElement),true);await page.getByRole('button',{name:'Exit fullscreen'}).click();
await page.locator('[data-preset=front]').click();await page.waitForTimeout(1500);await page.getByRole('button',{name:'Reset View',exact:true}).click();await page.waitForTimeout(1500);
await page.mouse.move(800,550);await page.mouse.down();await page.mouse.move(900,580,{steps:10});await page.mouse.up();await page.mouse.wheel(0,-100);await page.waitForTimeout(500);
assert.deepEqual(await page.evaluate(()=>window.facilityDebug.inspect().map(a=>({id:a.id,matrix:a.matrix}))),baseline);
await page.setViewportSize({width:768,height:1024});await page.getByRole('button',{name:'Explore facility'}).click();await page.locator('[data-entity=office]').click();await page.waitForTimeout(1400);await page.screenshot({path:'work/v1-validation/tablet.png'});
await page.setViewportSize({width:390,height:844});await page.waitForTimeout(800);await page.screenshot({path:'work/v1-validation/mobile.png'});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
assert.deepEqual(errors,[]);
await page.route('**/models/south-dagon-facility-final.glb',r=>r.fulfill({status:404,body:''}));
await page.reload();await page.getByRole('button',{name:'Try again'}).waitFor({timeout:30000});
await page.unroute('**/models/south-dagon-facility-final.glb');await page.getByRole('button',{name:'Try again'}).click();
await page.waitForFunction(()=>window.facilityDebug?.inspect()?.length===2875,{timeout:60000});

fs.writeFileSync('work/v1-validation/runtime-results.json',JSON.stringify({result:'PASS',requests,errors,meshes:baseline.length,transformPreservation:'ALL ASSETS PASS',floorIsolation:'PARTIAL CUTAWAY'},null,2));
console.log('Runtime PASS: identity, transforms, selections, partial cutaway, restore, layers, camera, orbit, fullscreen, responsive.');
await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
