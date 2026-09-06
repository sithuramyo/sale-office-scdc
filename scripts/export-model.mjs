import { mkdir, writeFile } from 'node:fs/promises';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { buildModel } from '../src/lib/build-model.js';

globalThis.FileReader = class FileReader {
  result = null;
  onloadend = null;
  onerror = null;
  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then(value => { this.result = value; this.onloadend?.(); }).catch(error => this.onerror?.(error));
  }
  readAsDataURL(blob) {
    blob.arrayBuffer().then(value => { this.result = 'data:' + blob.type + ';base64,' + Buffer.from(value).toString('base64'); this.onloadend?.(); }).catch(error => this.onerror?.(error));
  }
};
const model = buildModel();
const result = await new GLTFExporter().parseAsync(model.root, { binary: true });
const bytes = Buffer.from(result);
if (bytes.readUInt32LE(0) !== 0x46546c67 || bytes.readUInt32LE(4) !== 2 || bytes.readUInt32LE(8) !== bytes.length) throw new Error('Invalid GLB header');
const jsonSize=bytes.readUInt32LE(12);
const document=JSON.parse(bytes.subarray(20,20+jsonSize).toString('utf8').trim());
if (!document.meshes?.length || !document.scenes?.length) throw new Error('No geometry in exported model');
for (const accessor of document.accessors || []) {
  for (const value of [...(accessor.min || []), ...(accessor.max || [])]) {
    if (!Number.isFinite(value)) throw new Error('Non-finite geometry bounds');
  }
}
await mkdir(new URL('../public/models/', import.meta.url), { recursive: true });
await writeFile(new URL('../public/models/south-dagon-office-scdc-concept.glb', import.meta.url), bytes);
console.log('Exported valid GLB 2.0: ' + bytes.length.toLocaleString() + ' bytes, ' + document.meshes.length + ' meshes.');
