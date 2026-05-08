#!/usr/bin/env node
// Decimate every GLB in assets/3d-models/ using meshoptimizer's simplify().
// Targets ~25% of original triangle count: usually invisible at the distance
// the user views the body, but slashes per-frame GPU cost so on-device
// rotation stays smooth.
//
// Usage:
//   node tools/decimate-models.mjs                  # decimate all to .decimated.glb
//   node tools/decimate-models.mjs --in-place       # overwrite the source GLBs
//   node tools/decimate-models.mjs m_pectoral_mayor # only one muscle
//
// Output filenames mirror inputs unless --in-place is set.

import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { NodeIO } from '@gltf-transform/core';
import { simplify, weld } from '@gltf-transform/functions';
import { MeshoptSimplifier } from 'meshoptimizer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');
const MODELS_DIR = path.join(PROJECT_ROOT, 'assets', '3d-models');

const argv = process.argv.slice(2);
const inPlace = argv.includes('--in-place');
const idFilter = argv.find((a) => !a.startsWith('--'));

const TARGET_RATIO = 0.25; // keep 25% of triangles
// Permissive error budget — anatomical models are smooth blobs, dropping
// fine detail is invisible at the camera distance the user actually sees.
// A tight threshold (e.g. 0.001) made simplify() refuse most reductions and
// the GLB grew because of weld() metadata overhead.
const ERROR_THRESHOLD = 0.5;

await MeshoptSimplifier.ready;

const io = new NodeIO();

const files = fs
  .readdirSync(MODELS_DIR)
  .filter((f) => f.endsWith('.glb'))
  .filter((f) => !f.includes('.decimated.'))
  .filter((f) => (idFilter ? f.startsWith(idFilter) : true));

if (files.length === 0) {
  console.error('No GLB files matched filter:', idFilter ?? '(all)');
  process.exit(1);
}

let totalBefore = 0;
let totalAfter = 0;
for (const file of files) {
  const inPath = path.join(MODELS_DIR, file);
  const outPath = inPlace ? inPath : path.join(MODELS_DIR, file.replace(/\.glb$/, '.decimated.glb'));
  const beforeBytes = fs.statSync(inPath).size;
  totalBefore += beforeBytes;

  process.stdout.write(`→ ${file} (${(beforeBytes / 1024 / 1024).toFixed(1)} MB)…`);

  const document = await io.read(inPath);
  // weld merges duplicate vertices — required so simplifier sees real adjacency.
  await document.transform(
    weld({ tolerance: 0.0001 }),
    simplify({ simplifier: MeshoptSimplifier, ratio: TARGET_RATIO, error: ERROR_THRESHOLD })
  );
  await io.write(outPath, document);

  const afterBytes = fs.statSync(outPath).size;
  totalAfter += afterBytes;
  const reduction = ((1 - afterBytes / beforeBytes) * 100).toFixed(1);
  process.stdout.write(` → ${(afterBytes / 1024 / 1024).toFixed(1)} MB (-${reduction}%)\n`);
}

console.log(
  `\nTotal: ${(totalBefore / 1024 / 1024).toFixed(1)} MB → ${(
    totalAfter / 1024 / 1024
  ).toFixed(1)} MB (-${((1 - totalAfter / totalBefore) * 100).toFixed(1)}%)`
);
