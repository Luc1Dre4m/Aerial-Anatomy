#!/usr/bin/env node
// Map our muscles from src/data/muscles.ts to BodyParts3D FMA codes.
// Strategy:
//   1. Parse id + name_latin from muscles.ts.
//   2. For each latin name, extract anatomical keywords (drop "M.", "/", paren notes).
//   3. Translate Latin -> English variants used by BodyParts3D (FMA list is in English).
//   4. For each keyword, scan parts_list_e.txt for matching FMA entries.
//   5. Emit a markdown table with all candidates so a human can pick the right ones.
//
// Usage:
//   node tools/fma-mapping.mjs <musclesPath> <partsListPath> <outputMd>

import * as fs from 'node:fs';

const [, , musclesPath, partsListPath, outputMd] = process.argv;
if (!musclesPath || !partsListPath || !outputMd) {
  console.error('Usage: node tools/fma-mapping.mjs <musclesPath> <partsListPath> <outputMd>');
  process.exit(1);
}

const muscleSrc = fs.readFileSync(musclesPath, 'utf8');
const partsList = fs.readFileSync(partsListPath, 'utf8').split('\n').filter(Boolean);

// ── Latin → English keyword translation table (covers terms used in muscles.ts).
const LATIN_TO_EN = {
  deltoideus: 'deltoid',
  trapezius: 'trapezius',
  'serratus anterior': 'serratus anterior',
  'latissimus dorsi': 'latissimus dorsi',
  rhomboideus: 'rhomboid',
  // erector spinae anatomically = iliocostalis + longissimus + spinalis components
  'erector spinae': 'iliocostalis|longissimus|spinalis',
  infraspinatus: 'infraspinatus',
  supraspinatus: 'supraspinatus',
  'teres minor': 'teres minor',
  subscapularis: 'subscapularis',
  'rectus abdominis': 'rectus abdominis',
  'transversus abdominis': 'transversus abdominis',
  'obliquus externus abdominis': 'external oblique',
  'obliquus internus abdominis': 'internal oblique',
  diaphragma: 'diaphragm',
  multifidus: 'multifidus',
  'biceps brachii': 'biceps brachii',
  'triceps brachii': 'triceps brachii',
  brachialis: 'brachialis',
  brachioradialis: 'brachioradialis',
  'flexor digitorum': 'flexor digitorum',
  'extensor carpi': 'extensor carpi',
  'flexor carpi': 'flexor carpi',
  'gluteus maximus': 'gluteus maximus',
  'gluteus medius': 'gluteus medius',
  iliacus: 'iliacus',
  'psoas major': 'psoas major',
  iliopsoas: 'iliopsoas',
  piriformis: 'piriformis',
  'adductor longus': 'adductor longus',
  'adductor brevis': 'adductor brevis',
  'adductor magnus': 'adductor magnus',
  // quadriceps = rectus femoris + 3 vastii (lateralis / medialis / intermedius)
  'quadriceps femoris': 'quadriceps|rectus femoris|vastus',
  'rectus femoris': 'rectus femoris',
  'vastus lateralis': 'vastus lateralis',
  'vastus medialis': 'vastus medialis',
  'vastus intermedius': 'vastus intermedius',
  'biceps femoris': 'biceps femoris',
  semitendinosus: 'semitendinosus',
  semimembranosus: 'semimembranosus',
  gastrocnemius: 'gastrocnemius',
  soleus: 'soleus',
  'tibialis anterior': 'tibialis anterior',
  sternocleidomastoideus: 'sternocleidomastoid',
  'scalenus anterior': 'scalene anterior',
  'scalenus medius': 'scalene medius',
  'scalenus posterior': 'scalene posterior',
  'pectoralis major': 'pectoralis major',
  // forearm flexors aggregated: most superficial+deep flexors of the anterior compartment
  'flexores antebrachii': 'flexor digitorum|flexor pollicis|palmaris longus|pronator teres|flexor carpi',
};

// ── Parse muscles.ts → array of {id, name_es, name_latin}
function parseMuscles(src) {
  const blocks = src.split(/{\s*\n/).slice(1);
  const out = [];
  for (const block of blocks) {
    const id = block.match(/id:\s*'([^']+)'/)?.[1];
    const es = block.match(/name_es:\s*'([^']+)'/)?.[1];
    const latin = block.match(/name_latin:\s*'([^']+)'/)?.[1];
    if (id && es && latin) out.push({ id, name_es: es, name_latin: latin });
  }
  return out;
}

// ── Pull keyword phrases from a Latin string.
// Strips "M.", "Mm.", parenthetical notes, slashes, splits multi-muscle names.
function extractKeywords(latin) {
  const cleaned = latin
    .replace(/^Mm?\.\s*/i, '')
    .replace(/\(([^)]+)\)/g, ' $1 ')
    .replace(/\bfibras?\s+\w+/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  const candidates = cleaned
    .split(/\s*\/\s*|\s*\+\s*/)
    .map((c) => c.replace(/^M\.\s*/i, '').trim())
    .filter(Boolean);

  // For multi-word terms like "rectus abdominis" we want to keep that as a unit.
  // Translate via LATIN_TO_EN; if not found, use the cleaned candidate as-is.
  const keywords = [];
  for (const c of candidates) {
    const lc = c.toLowerCase();
    if (LATIN_TO_EN[lc]) {
      keywords.push(LATIN_TO_EN[lc]);
    } else {
      // Try partial match: any LATIN_TO_EN key contained in candidate
      const partial = Object.entries(LATIN_TO_EN).find(([k]) => lc.includes(k));
      if (partial) {
        keywords.push(partial[1]);
      } else {
        keywords.push(lc); // last resort, use raw
      }
    }
  }
  return keywords;
}

function findMatches(keyword) {
  const re = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
  return partsList.filter((line) => re.test(line));
}

const muscles = parseMuscles(muscleSrc);

// ── Emit markdown
let md = '';
md += `# Mapeo FMA — Músculos Aerial Anatomy ↔ BodyParts3D\n\n`;
md += `Total músculos: ${muscles.length}. Generado por \`tools/fma-mapping.mjs\` el ${new Date().toISOString().slice(0, 10)}.\n\n`;
md += `Fuente: \`assets/BodyParts3D_data/parts_list_e.txt\` del repo Kevin-Mattheus-Moerman/BodyParts3D.\n\n`;
md += `**Cómo usar este documento**: para cada músculo, validar los FMA codes elegidos. La mayoría de músculos requieren múltiples piezas (lateralizadas right/left + sub-partes anatómicas). Los STL de cada FMA elegido se descargarán y combinarán en un solo GLB por músculo.\n\n`;
md += `---\n\n`;

const summary = [];

for (const m of muscles) {
  const kws = extractKeywords(m.name_latin);
  md += `## \`${m.id}\` — ${m.name_es}\n\n`;
  md += `- **Latin**: \`${m.name_latin}\`\n`;
  md += `- **Keywords**: ${kws.map((k) => `\`${k}\``).join(', ')}\n\n`;

  const allMatches = new Set();
  for (const kw of kws) {
    // A keyword may be a pipe-separated list (e.g. "iliocostalis|longissimus|spinalis").
    for (const sub of kw.split('|')) {
      const matches = findMatches(sub.trim());
      for (const m2 of matches) allMatches.add(m2);
    }
  }

  if (allMatches.size === 0) {
    md += `> ⚠ **Sin matches** en parts_list. Necesita búsqueda manual.\n\n`;
    summary.push({ id: m.id, status: '❌ sin match', count: 0 });
  } else {
    md += `<details><summary>${allMatches.size} matches</summary>\n\n`;
    md += `| FMA code | Nombre |\n|---|---|\n`;
    const sorted = [...allMatches].sort();
    for (const line of sorted) {
      const [fma, name] = line.split('\t');
      if (fma && name) md += `| \`${fma}\` | ${name} |\n`;
    }
    md += `\n</details>\n\n`;
    summary.push({ id: m.id, status: `✅ ${allMatches.size}`, count: allMatches.size });
  }
}

// Summary table at top
const summaryTable =
  `| Músculo | Matches |\n|---|---|\n` +
  summary.map((s) => `| \`${s.id}\` | ${s.status} |`).join('\n') +
  '\n\n---\n\n';

md = md.replace('---\n\n', summaryTable);

fs.writeFileSync(outputMd, md);
console.log(`OK ${outputMd}`);
console.log(`  ${summary.length} músculos procesados`);
console.log(`  ${summary.filter((s) => s.count === 0).length} sin match (review manual)`);
console.log(
  `  ${summary.reduce((acc, s) => acc + s.count, 0)} total FMA candidates encontrados`
);
