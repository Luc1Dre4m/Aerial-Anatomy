#!/usr/bin/env node
// Decimate every GLB in assets/3d-models/ using gltfpack (Khronos's GLB
// optimizer/simplifier). gltfpack reduces both triangle count and file size
// (via vertex quantization), which lowers per-frame GPU cost on device and
// makes pinch zoom feel smoother.
//
// Why gltfpack and not the @gltf-transform simplify() pipeline that already
// exists in tools/decimate-models.mjs:
//   That pipeline uses MeshoptSimplifier directly through gltf-transform,
//   and on these BodyParts3D meshes it plateaus at ~5% reduction (or even
//   GROWS the file slightly because of weld() metadata overhead). gltfpack
//   bundles the same simplifier but applies meshopt's mesh optimization
//   passes (vertex quantization, draco-style attribute encoding) on top, so
//   the actual size reduction is real and visible in real-world testing.
//
// Usage:
//   node tools/decimate-with-gltfpack.mjs                  # all GLBs, in-place
//   node tools/decimate-with-gltfpack.mjs --ratio 0.5      # custom triangle ratio
//   node tools/decimate-with-gltfpack.mjs m_pectoral_mayor # one muscle only
//
// In-place writes the result to a sibling temp file then renames over the
// source — safe against partial writes.

import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');
const MODELS_DIR = path.join(PROJECT_ROOT, 'assets', '3d-models');

const argv = process.argv.slice(2);
const ratioFlagIndex = argv.indexOf('--ratio');
const RATIO = ratioFlagIndex >= 0 ? parseFloat(argv[ratioFlagIndex + 1]) : 0.3;
const idFilter = argv.find((a) => !a.startsWith('--') && !/^[0-9.]+$/.test(a));

if (Number.isNaN(RATIO) || RATIO <= 0 || RATIO > 1) {
  console.error('Invalid --ratio value (must be 0 < x ≤ 1). Got:', argv[ratioFlagIndex + 1]);
  process.exit(1);
}

const files = fs
  .readdirSync(MODELS_DIR)
  .filter((f) => f.endsWith('.glb'))
  .filter((f) => !f.includes('.tmp.'))
  .filter((f) => (idFilter ? f.startsWith(idFilter) : true));

if (files.length === 0) {
  console.error('No GLB files matched filter:', idFilter ?? '(all)');
  process.exit(1);
}

console.log(`Decimating ${files.length} GLB(s) with gltfpack -si ${RATIO}\n`);

let totalBefore = 0;
let totalAfter = 0;
let failures = 0;

for (const file of files) {
  const inPath = path.join(MODELS_DIR, file);
  const tmpPath = path.join(MODELS_DIR, file.replace(/\.glb$/, '.tmp.glb'));
  const beforeBytes = fs.statSync(inPath).size;
  totalBefore += beforeBytes;

  process.stdout.write(`→ ${file} (${(beforeBytes / 1024 / 1024).toFixed(1)} MB)`);

  // -si N   simplify to N ratio of triangles (the perf win we want)
  // -kn     keep named nodes / meshes
  // -km     keep named materials and DISABLE material merging. Critical:
  //         without -km, gltfpack consolidates all sub-meshes of a muscle
  //         into one big mesh because they share a material instance, which
  //         gives the runtime AABB picker one huge bbox per muscle (loose
  //         picking). batch-build-models.mjs now assigns a unique-named
  //         material per FMA sub-part so -km preserves the sub-meshes →
  //         multiple tight bboxes per muscle → precise picking.
  // We deliberately do NOT use -cc (meshopt compression) — three.js
  // GLTFLoader requires a registered MeshoptDecoder to read those, and
  // setting that up through drei's useGLTF on RN is fiddly. Without -cc,
  // gltfpack still optimizes vertex/index ordering and quantizes positions
  // into tighter buffers, so file size still shrinks. Per-frame render
  // cost depends on triangle count, not byte size, so dropping -cc has
  // basically zero impact on FPS.
  const result = spawnSync(
    'npx',
    ['gltfpack', '-i', inPath, '-o', tmpPath, '-si', String(RATIO), '-kn', '-km'],
    { encoding: 'utf8', shell: true }
  );

  if (result.status !== 0) {
    process.stdout.write(`  ✗ FAILED\n`);
    if (result.stderr) console.error(result.stderr);
    failures++;
    if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
    continue;
  }

  const afterBytes = fs.statSync(tmpPath).size;
  if (afterBytes >= beforeBytes) {
    process.stdout.write(`  ⚠ skip (no reduction: ${(afterBytes / 1024 / 1024).toFixed(1)} MB)\n`);
    fs.unlinkSync(tmpPath);
    totalAfter += beforeBytes;
    continue;
  }

  // Atomic replace
  fs.renameSync(tmpPath, inPath);
  totalAfter += afterBytes;
  const reduction = ((1 - afterBytes / beforeBytes) * 100).toFixed(1);
  process.stdout.write(`  → ${(afterBytes / 1024 / 1024).toFixed(1)} MB (-${reduction}%)\n`);
}

console.log(
  `\nTotal: ${(totalBefore / 1024 / 1024).toFixed(1)} MB → ${(
    totalAfter / 1024 / 1024
  ).toFixed(1)} MB (-${((1 - totalAfter / totalBefore) * 100).toFixed(1)}%)` +
    (failures > 0 ? `\n${failures} file(s) failed.` : '')
);
