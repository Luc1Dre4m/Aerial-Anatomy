#!/usr/bin/env node
// Convert a binary or ASCII STL file to a GLB ready for @react-three/fiber/native.
// Reuses three.js (already installed) so no extra deps and no Blender needed.
//
// Usage:
//   node tools/stl-to-glb.mjs <input.stl> <output.glb> [hexColor]
//
// Example:
//   node tools/stl-to-glb.mjs /tmp/fma34690.stl assets/3d-models/pectoral_mayor.glb 0xC2412B

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

const [, , inputPath, outputPath, hexColor = '0xC2412B'] = process.argv;

if (!inputPath || !outputPath) {
  console.error('Usage: node tools/stl-to-glb.mjs <input.stl> <output.glb> [hexColor]');
  process.exit(1);
}

const colorInt = typeof hexColor === 'string' ? Number(hexColor) : hexColor;

function main() {
  const stlBuffer = fs.readFileSync(inputPath);
  const arrayBuffer = stlBuffer.buffer.slice(
    stlBuffer.byteOffset,
    stlBuffer.byteOffset + stlBuffer.byteLength
  );

  const loader = new STLLoader();
  const geometry = loader.parse(arrayBuffer);
  geometry.computeVertexNormals();
  geometry.center();

  const material = new THREE.MeshStandardMaterial({
    color: colorInt,
    roughness: 0.55,
    metalness: 0.05,
  });

  const mesh = new THREE.Mesh(geometry, material);

  const scene = new THREE.Scene();
  scene.add(mesh);

  const exporter = new GLTFExporter();
  exporter.parse(
    scene,
    (result) => {
      if (!(result instanceof ArrayBuffer)) {
        console.error('GLTFExporter did not return a binary ArrayBuffer.');
        process.exit(1);
      }
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
      fs.writeFileSync(outputPath, Buffer.from(result));
      const stat = fs.statSync(outputPath);
      console.log(
        `OK ${path.basename(outputPath)} ${stat.size} bytes ` +
          `(geometry: ${geometry.attributes.position.count} verts)`
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
