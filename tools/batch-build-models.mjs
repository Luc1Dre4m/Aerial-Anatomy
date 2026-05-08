#!/usr/bin/env node
// Batch download + STL→GLB conversion for all muscles in
// tools/anatomy-models-curated.json. Skips muscles whose target GLB already
// exists unless --force is passed. STL cache lives at tools/.cache/stl/.
//
// Usage:
//   node tools/batch-build-models.mjs              # build missing only
//   node tools/batch-build-models.mjs --force      # rebuild all
//   node tools/batch-build-models.mjs m_deltoides  # build only this id

import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

// FileReader polyfill — three's GLTFExporter uses it.
if (typeof globalThis.FileReader === 'undefined') {
  globalThis.FileReader = class FileReader {
    constructor() { this.result = null; this.onloadend = null; this.onerror = null; }
    readAsArrayBuffer(blob) {
      blob.arrayBuffer().then((b) => { this.result = b; this.onloadend?.({ target: this }); })
        .catch((e) => this.onerror?.({ target: this, error: e }));
    }
    readAsDataURL(blob) {
      blob.arrayBuffer().then((b) => {
        this.result = `data:${blob.type || 'application/octet-stream'};base64,${Buffer.from(b).toString('base64')}`;
        this.onloadend?.({ target: this });
      }).catch((e) => this.onerror?.({ target: this, error: e }));
    }
  };
}

import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');
const CACHE_DIR = path.join(__dirname, '.cache', 'stl');
const OUTPUT_DIR = path.join(PROJECT_ROOT, 'assets', '3d-models');
const CURATED_PATH = path.join(__dirname, 'anatomy-models-curated.json');
const STL_BASE_URL =
  'https://raw.githubusercontent.com/Kevin-Mattheus-Moerman/BodyParts3D/main/assets/BodyParts3D_data/stl';

const argv = process.argv.slice(2);
const force = argv.includes('--force');
const idFilter = argv.find((a) => !a.startsWith('--'));

fs.mkdirSync(CACHE_DIR, { recursive: true });
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const curated = JSON.parse(fs.readFileSync(CURATED_PATH, 'utf8')).models;

async function downloadSTL(fma) {
  const cachePath = path.join(CACHE_DIR, `${fma}.stl`);
  if (fs.existsSync(cachePath)) return cachePath;
  const url = `${STL_BASE_URL}/${fma}.stl`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${fma} HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(cachePath, buf);
  return cachePath;
}

function loadSTLAsMesh(stlPath, material) {
  const stlBuffer = fs.readFileSync(stlPath);
  const arrayBuffer = stlBuffer.buffer.slice(
    stlBuffer.byteOffset,
    stlBuffer.byteOffset + stlBuffer.byteLength
  );
  const geometry = new STLLoader().parse(arrayBuffer);
  geometry.computeVertexNormals();
  return new THREE.Mesh(geometry, material);
  // NOTE: a meshoptimizer-based decimation pass was attempted (see git log)
  // but BodyParts3D meshes resist aggressive collapse — meshopt's simplify
  // plateaus at ~5% reduction even across 4 passes with permissive error.
  // True low-poly anatomy needs purpose-built models (Quad Remesher, manual
  // retopo, or licensed assets). Lag on rotation is currently bounded by
  // raw polycount; mitigations live in the viewer (smaller registry, fewer
  // simultaneous models) rather than this build step.
}

function exportGLB(scene) {
  const exporter = new GLTFExporter();
  return new Promise((resolve, reject) => {
    exporter.parse(
      scene,
      (result) => {
        if (result instanceof ArrayBuffer) resolve(Buffer.from(result));
        else reject(new Error('GLTFExporter returned non-binary result'));
      },
      reject,
      { binary: true }
    );
  });
}

async function buildMuscle(muscleId, def) {
  const outputPath = path.join(OUTPUT_DIR, `${muscleId}.glb`);
  if (!force && fs.existsSync(outputPath)) {
    console.log(`SKIP ${muscleId} — already built (${fs.statSync(outputPath).size}B)`);
    return;
  }

  const colorInt = Number(def.color);
  const material = new THREE.MeshStandardMaterial({
    color: colorInt,
    roughness: 0.55,
    metalness: 0.05,
  });

  const stlPaths = [];
  for (const fma of def.fma) {
    process.stdout.write(`  ${fma}…`);
    try {
      const stlPath = await downloadSTL(fma);
      stlPaths.push(stlPath);
      process.stdout.write(` ✓\n`);
    } catch (err) {
      process.stdout.write(` ✖ ${err.message}\n`);
      throw err;
    }
  }

  const scene = new THREE.Scene();
  // userData.muscleId on the parent group lets the runtime picker map back
  // to a known muscle even when the GLB merges multiple sub-parts.
  scene.userData.muscleId = muscleId;
  let totalVerts = 0;
  for (const stlPath of stlPaths) {
    const mesh = loadSTLAsMesh(stlPath, material);
    mesh.userData.muscleId = muscleId;
    scene.add(mesh);
    totalVerts += mesh.geometry.attributes.position.count;
  }

  // NOTE: we deliberately do NOT center the geometries here. BodyParts3D ships
  // them in absolute anatomical coordinates (~mm relative to a body origin),
  // so loading every muscle's GLB into the same scene at runtime puts each one
  // in its real anatomical position automatically. The runtime viewer applies
  // a single <Bounds> wrapper to frame the combined body, then the user can
  // tap any muscle for picking.

  const buf = await exportGLB(scene);
  fs.writeFileSync(outputPath, buf);
  console.log(`OK ${muscleId} → ${path.basename(outputPath)} ${buf.length}B (${stlPaths.length} parts, ${totalVerts} verts)`);
}

async function main() {
  const ids = idFilter ? [idFilter] : Object.keys(curated);
  if (idFilter && !curated[idFilter]) {
    console.error(`Muscle id "${idFilter}" not in curated mapping`);
    process.exit(1);
  }
  for (const id of ids) {
    const def = curated[id];
    console.log(`\n→ ${id} — ${def.label_es}`);
    try {
      await buildMuscle(id, def);
    } catch (err) {
      console.error(`✖ ${id} FAILED: ${err.message}`);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
