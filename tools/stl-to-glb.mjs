#!/usr/bin/env node
// Convert one or more STL files into a single GLB ready for @react-three/fiber/native.
// Reuses three.js (already installed) so no extra deps and no Blender needed.
//
// Usage:
//   Single STL:
//     node tools/stl-to-glb.mjs --out=<output.glb> [--color=0xC2412B] <input.stl>
//   Multiple STLs merged into one GLB:
//     node tools/stl-to-glb.mjs --out=<output.glb> [--color=0xC2412B] <a.stl> <b.stl> ...
//
// The merged scene is centered on the combined bounding box origin so the
// resulting GLB is camera-friendly without further offset tweaks.

import * as fs from 'node:fs';
import * as path from 'node:path';

// FileReader polyfill — three's GLTFExporter uses it, but Node doesn't ship one.
// Node 18+ has global Blob with arrayBuffer(); we just bridge the event-based API.
if (typeof globalThis.FileReader === 'undefined') {
  globalThis.FileReader = class FileReader {
    constructor() {
      this.result = null;
      this.onloadend = null;
      this.onerror = null;
    }
    readAsArrayBuffer(blob) {
      blob
        .arrayBuffer()
        .then((buf) => {
          this.result = buf;
          this.onloadend?.({ target: this });
        })
        .catch((err) => {
          this.onerror?.({ target: this, error: err });
        });
    }
    readAsDataURL(blob) {
      blob
        .arrayBuffer()
        .then((buf) => {
          this.result = `data:${blob.type || 'application/octet-stream'};base64,${Buffer.from(buf).toString('base64')}`;
          this.onloadend?.({ target: this });
        })
        .catch((err) => {
          this.onerror?.({ target: this, error: err });
        });
    }
  };
}

import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';

// ── Parse args
const args = process.argv.slice(2);
const opts = { out: null, color: '0xC2412B', inputs: [] };
for (const arg of args) {
  if (arg.startsWith('--out=')) opts.out = arg.slice('--out='.length);
  else if (arg.startsWith('--color=')) opts.color = arg.slice('--color='.length);
  else opts.inputs.push(arg);
}
if (!opts.out || opts.inputs.length === 0) {
  console.error(
    'Usage: node tools/stl-to-glb.mjs --out=<output.glb> [--color=0xHEX] <input1.stl> [input2.stl ...]'
  );
  process.exit(1);
}

const colorInt = Number(opts.color);

function loadSTLAsMesh(stlPath, material) {
  const stlBuffer = fs.readFileSync(stlPath);
  const arrayBuffer = stlBuffer.buffer.slice(
    stlBuffer.byteOffset,
    stlBuffer.byteOffset + stlBuffer.byteLength
  );
  const geometry = new STLLoader().parse(arrayBuffer);
  geometry.computeVertexNormals();
  return new THREE.Mesh(geometry, material);
}

function main() {
  const material = new THREE.MeshStandardMaterial({
    color: colorInt,
    roughness: 0.55,
    metalness: 0.05,
  });

  const scene = new THREE.Scene();
  let totalVerts = 0;
  for (const inputPath of opts.inputs) {
    const mesh = loadSTLAsMesh(inputPath, material);
    scene.add(mesh);
    totalVerts += mesh.geometry.attributes.position.count;
  }

  // Center the combined scene on the origin so the camera doesn't need an offset.
  // GLTFExporter doesn't preserve the scene-root transform reliably, so we BAKE
  // the centering offset directly into each mesh's geometry. Without this, the
  // GLB ends up with meshes at their original anatomical absolute coordinates
  // (e.g. ~Z=37) and r3f sees them outside the camera frustum by default.
  const box = new THREE.Box3().setFromObject(scene);
  const center = box.getCenter(new THREE.Vector3());
  scene.traverse((obj) => {
    if (obj instanceof THREE.Mesh) {
      obj.geometry.translate(-center.x, -center.y, -center.z);
    }
  });

  const exporter = new GLTFExporter();
  exporter.parse(
    scene,
    (result) => {
      if (!(result instanceof ArrayBuffer)) {
        console.error('GLTFExporter did not return a binary ArrayBuffer.');
        process.exit(1);
      }
      fs.mkdirSync(path.dirname(opts.out), { recursive: true });
      fs.writeFileSync(opts.out, Buffer.from(result));
      const stat = fs.statSync(opts.out);
      console.log(
        `OK ${path.basename(opts.out)} ${stat.size} bytes ` +
          `(${opts.inputs.length} mesh, ${totalVerts} verts)`
      );
    },
    (err) => {
      console.error('GLTFExporter error:', err);
      process.exit(1);
    },
    { binary: true }
  );
}

main();
