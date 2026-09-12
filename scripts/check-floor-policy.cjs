const fs=require('fs'),vm=require('vm'),ts=require('typescript'),assert=require('node:assert/strict');
function load(path){const module={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports:module.exports,module,fetch:()=>{throw Error('no network')}});return module.exports;}
const {composedVisibility}=load('src/components/digital-twin/visibility.ts');
for(const original of [false,true])for(const layer of [false,true])for(const floor of [false,true])for(const isolation of [false,true]){
 assert.equal(composedVisibility(original,layer,floor,isolation),[original,layer,floor,isolation].every(Boolean));
}
assert.equal(composedVisibility(false,true,true),false,'Restore must not show initially hidden objects');
const {validateFloorMap}=load('src/components/digital-twin/floor-map.ts');
const m=JSON.parse(fs.readFileSync('public/models/south-dagon-facility-floor-map.json'));
const manifest=JSON.parse(fs.readFileSync('src/config/model-manifest.json'));
const keys=new Set(Object.values(manifest.layers).flat());
assert.equal(validateFloorMap(m,manifest,keys).length,7);
assert.throws(()=>validateFloorMap(m,{...manifest,sha256:'different runtime hash'},keys));
console.log('Visibility policy and runtime hash validation PASS');
