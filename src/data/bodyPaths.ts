/**
 * Anatomical SVG paths for the human body visualization.
 * ViewBox: 0 0 300 460 — all coordinates are within this space.
 * Style: Atlas anatomico clasico — smooth Bezier curves, organic shapes.
 * Mirrored muscles are generated from left-side paths via mirrorPath().
 */
import { MuscleRegion } from '../utils/types';

// ─── Mirror utility ───────────────────────────────────────────────
// Reflects SVG path coordinates across the vertical axis at x=150

function mirrorPath(d: string, axisX: number = 150): string {
  return d.replace(
    /([MLHVCSQTAZ])\s*([-\d.,\s]*)/gi,
    (_, cmd: string, args: string) => {
      const upper = cmd.toUpperCase();
      // Absolute commands that have x coordinates to mirror
      if ('MLCSQT'.includes(upper) && upper === cmd) {
        const nums = args.trim().split(/[\s,]+/).map(Number);
        const mirrored: number[] = [];
        for (let i = 0; i < nums.length; i++) {
          // x coords are at even indices (0, 2, 4...)
          mirrored.push(i % 2 === 0 ? 2 * axisX - nums[i] : nums[i]);
        }
        return `${cmd}${mirrored.join(',')}`;
      }
      if (upper === 'H' && upper === cmd) {
        const x = parseFloat(args.trim());
        return `H${2 * axisX - x}`;
      }
      return `${cmd}${args}`;
    }
  );
}

// ─── Types ────────────────────────────────────────────────────────

export interface MusclePathDef {
  id: string;
  region: MuscleRegion;
  depth: 'superficial' | 'profundo';
  side: 'left' | 'right' | 'center';
  front?: { path: string; detailPaths?: string[] };
  back?: { path: string; detailPaths?: string[] };
}

// ─── Body Silhouettes ─────────────────────────────────────────────

export const BODY_SILHOUETTE_FRONT =
  // Head — smaller, proportion 1:7.5
  'M150,18 C163,18 174,29 174,44 C174,59 163,68 150,68 C137,68 126,59 126,44 C126,29 137,18 150,18 Z ' +
  // Neck — longer, elegant
  'M143,68 L143,86 C143,88 145,90 150,90 C155,90 157,88 157,86 L157,68 ' +
  // Torso — longer, defined waist, wider shoulders, narrower abdomen
  'M104,92 C92,96 85,108 83,126 L80,168 C86,188 88,204 88,222 ' +
  'C90,232 92,240 96,246 L106,256 L118,268 C130,276 142,280 150,282 ' +
  'C158,280 170,276 182,268 L194,256 L204,246 ' +
  'C208,240 210,232 212,222 C212,204 214,188 220,168 L217,126 C215,108 208,96 196,92 Z ' +
  // Left arm — longer, defined joints
  'M83,126 C72,134 66,150 62,170 L57,204 C54,222 53,240 54,254 ' +
  'L56,266 C57,274 58,280 60,284 C62,288 64,290 66,288 ' +
  'L68,282 C70,274 72,262 74,248 L78,220 C80,204 82,186 83,170 ' +
  'C84,156 84,140 83,126 Z ' +
  // Right arm
  'M217,126 C228,134 234,150 238,170 L243,204 C246,222 247,240 246,254 ' +
  'L244,266 C243,274 242,280 240,284 C238,288 236,290 234,288 ' +
  'L232,282 C230,274 228,262 226,248 L222,220 C220,204 218,186 217,170 ' +
  'C216,156 216,140 217,126 Z ' +
  // Left leg — longer, slender, defined knee
  'M118,268 C114,282 112,300 113,320 L114,348 C115,362 115,374 114,386 ' +
  'L112,410 C111,424 110,438 110,448 C110,452 112,456 116,456 ' +
  'L120,454 C124,452 126,448 126,444 L126,428 C127,414 127,398 127,382 ' +
  'L128,354 C128,336 126,314 124,296 C122,284 120,274 118,268 Z ' +
  // Right leg
  'M182,268 C186,282 188,300 187,320 L186,348 C185,362 185,374 186,386 ' +
  'L188,410 C189,424 190,438 190,448 C190,452 188,456 184,456 ' +
  'L180,454 C176,452 174,448 174,444 L174,428 C173,414 173,398 173,382 ' +
  'L172,354 C172,336 174,314 176,296 C178,284 180,274 182,268 Z';

export const BODY_SILHOUETTE_BACK =
  // Head
  'M150,18 C163,18 174,29 174,44 C174,59 163,68 150,68 C137,68 126,59 126,44 C126,29 137,18 150,18 Z ' +
  // Neck
  'M143,68 L143,86 C143,88 145,90 150,90 C155,90 157,88 157,86 L157,68 ' +
  // Torso — wider scapulae area, narrower waist
  'M102,92 C90,96 83,108 81,126 L80,168 C86,188 88,204 88,222 ' +
  'C90,232 92,240 96,246 L106,256 L118,268 C130,276 142,280 150,282 ' +
  'C158,280 170,276 182,268 L194,256 L204,246 ' +
  'C208,240 210,232 212,222 C212,204 214,188 220,168 L219,126 C217,108 210,96 198,92 Z ' +
  // Left arm
  'M81,126 C70,134 64,150 60,170 L55,204 C52,222 51,240 52,254 ' +
  'L54,266 C55,274 56,280 58,284 C60,288 62,290 64,288 ' +
  'L66,282 C68,274 70,262 72,248 L76,220 C78,204 80,186 81,170 ' +
  'C82,156 82,140 81,126 Z ' +
  // Right arm
  'M219,126 C230,134 236,150 240,170 L245,204 C248,222 249,240 248,254 ' +
  'L246,266 C245,274 244,280 242,284 C240,288 238,290 236,288 ' +
  'L234,282 C232,274 230,262 228,248 L224,220 C222,204 220,186 219,170 ' +
  'C218,156 218,140 219,126 Z ' +
  // Left leg
  'M118,268 C114,282 112,300 113,320 L114,348 C115,362 115,374 114,386 ' +
  'L112,410 C111,424 110,438 110,448 C110,452 112,456 116,456 ' +
  'L120,454 C124,452 126,448 126,444 L126,428 C127,414 127,398 127,382 ' +
  'L128,354 C128,336 126,314 124,296 C122,284 120,274 118,268 Z ' +
  // Right leg
  'M182,268 C186,282 188,300 187,320 L186,348 C185,362 185,374 186,386 ' +
  'L188,410 C189,424 190,438 190,448 C190,452 188,456 184,456 ' +
  'L180,454 C176,452 174,448 174,444 L174,428 C173,414 173,398 173,382 ' +
  'L172,354 C172,336 174,314 176,296 C178,284 180,274 182,268 Z';

// ─── FRONT VIEW Muscle Paths (left side) ──────────────────────────

const FRONT_LEFT = {
  // Deltoides — cap shape over left shoulder
  deltoid: 'M104,96 C96,100 89,108 85,120 C83,128 83,136 87,140 L94,136 C100,130 104,122 106,114 C108,106 106,100 104,96 Z',

  // Pectoral Mayor — fan shape, clavicular origin to sternal insertion
  pectoral: 'M108,100 C114,98 126,96 140,98 L148,100 L148,136 C146,150 140,160 132,164 C124,168 116,166 110,160 C104,154 98,146 96,136 C94,128 96,118 100,110 C104,104 108,100 108,100 Z',

  // Biceps — anterior upper arm
  biceps: 'M82,136 C80,144 78,154 76,166 C74,178 74,188 76,194 C78,198 82,200 84,196 C86,190 88,180 88,168 C88,156 86,146 82,136 Z',

  // Braquial — lateral to biceps, deeper
  brachialis: 'M88,140 C90,148 92,158 92,170 C92,180 90,188 86,194 L82,192 C80,186 78,176 78,164 C78,152 80,144 84,138 L88,140 Z',

  // Flexores del antebrazo
  forearmFlexors: 'M74,198 C72,208 70,220 68,232 C66,244 64,254 64,262 C64,266 66,268 68,266 C70,262 72,252 74,240 C76,228 78,216 78,206 L74,198 Z',

  // Recto Abdominal (centro, no se espeja) — 6-pack
  rectusAbdominis: 'M142,148 L142,258 C142,264 144,268 150,268 C156,268 158,264 158,258 L158,148 C158,142 156,138 150,138 C144,138 142,142 142,148 Z',

  // Oblicuo Externo — lateral torso
  oblique: 'M114,160 C112,172 108,188 104,204 C100,218 98,232 100,242 C102,250 104,256 108,260 L114,264 C118,266 124,268 132,268 L140,266 L140,156 C134,158 126,160 118,160 L114,160 Z',

  // Serrato Anterior — visible laterally on ribs
  serratus: 'M96,144 C94,150 92,156 90,164 L88,174 C86,180 88,184 92,182 C96,180 100,176 102,170 C104,164 104,158 102,152 L98,146 L96,144 Z',

  // Cuadriceps — rectus femoris + vastus group
  quadriceps: 'M118,270 C116,282 114,298 114,316 C114,334 116,350 120,362 C124,372 128,378 132,376 C136,374 138,366 138,354 C138,338 136,318 134,298 C132,286 130,278 126,274 L118,270 Z',

  // Aductores — inner thigh
  adductors: 'M132,272 C136,284 140,300 142,318 C144,336 144,350 142,358 C140,364 138,366 136,362 C134,356 132,344 130,328 C128,312 126,296 124,282 L132,272 Z',

  // Tibial Anterior — shin
  tibialAnterior: 'M120,366 C118,378 116,392 116,406 C116,418 116,430 118,438 C120,442 122,444 124,440 C126,434 126,422 126,410 C126,398 126,386 124,374 L120,366 Z',

  // Esternocleidomastoideo — neck
  sternocleidomastoid: 'M143,70 C140,74 138,78 138,82 C138,86 140,88 143,88 L146,86 C148,82 148,78 146,74 L143,70 Z',

  // Trapecio visible frontalmente — upper part visible above shoulders
  trapeziusFront: 'M144,70 C140,72 136,76 132,82 L120,92 C126,90 134,88 142,88 L150,88 L158,88 C166,88 174,90 180,92 L168,82 C164,76 160,72 156,70 L150,68 L144,70 Z',
};

// ─── BACK VIEW Muscle Paths (left side) ───────────────────────────

const BACK_LEFT = {
  // Trapecio completo — diamond shape from neck to mid-back
  trapezius: 'M150,70 C140,72 128,78 118,88 C108,98 104,110 104,120 L106,130 C110,138 118,142 128,140 C138,138 146,132 150,124 L150,70 Z',

  // Dorsal Ancho — wide wing shape
  latissimus: 'M104,134 C100,144 96,160 94,178 C92,196 92,214 96,228 C100,240 106,248 114,252 L126,256 C132,258 136,256 138,250 C140,242 138,230 134,216 C130,202 126,186 124,172 C122,158 118,148 112,142 L104,134 Z',

  // Romboides — between spine and scapula
  rhomboid: 'M136,94 C132,98 128,104 126,112 C124,120 124,128 128,134 L134,136 C138,132 140,126 140,118 C140,110 140,104 138,98 L136,94 Z',

  // Infraespinoso — on scapula
  infraspinatus: 'M106,102 C102,108 100,116 100,124 C100,132 104,138 110,140 L120,138 C126,134 130,128 130,120 C130,112 128,106 124,102 L116,100 L106,102 Z',

  // Erector Espinal — two columns along spine
  erectorSpinae: 'M142,92 L142,250 C142,256 144,258 148,258 C150,258 150,92 150,92 L142,92 Z',

  // Deltoides posterior — back of shoulder cap
  posteriorDeltoid: 'M102,92 C94,96 88,104 85,116 C83,124 83,132 87,136 L93,134 C97,128 101,120 103,112 C105,104 105,98 102,92 Z',

  // Triceps — posterior upper arm
  triceps: 'M84,136 C82,144 80,156 78,168 C76,180 76,190 78,198 C80,202 84,204 86,200 C88,194 90,184 90,172 C90,160 88,148 84,136 Z',

  // Extensores de muneca — forearm posterior
  wristExtensors: 'M76,202 C74,212 72,224 70,236 C68,248 66,256 66,262 C66,266 68,268 70,266 C72,262 74,252 76,240 C78,228 80,216 80,208 L76,202 Z',

  // Gluteo Mayor — large hip shape
  gluteusMaximus: 'M114,252 C110,260 106,270 106,280 C106,290 110,298 116,302 C122,306 130,306 136,302 C140,298 142,292 142,284 C142,276 140,268 136,260 L130,254 L114,252 Z',

  // Gluteo Medio — above glute max
  gluteusMedius: 'M106,240 C102,246 100,252 102,258 C104,264 110,268 116,268 L126,264 C130,260 132,254 130,248 C128,242 124,238 118,238 L106,240 Z',

  // Isquiotibiales — posterior thigh
  hamstrings: 'M118,304 C116,318 114,334 114,352 C114,368 116,382 120,392 C124,400 128,402 132,398 C136,392 138,380 138,364 C138,348 136,330 134,314 L126,304 L118,304 Z',

  // Gemelos — calf muscle
  gastrocnemius: 'M118,394 C116,406 114,418 116,430 C118,440 120,446 124,448 C128,450 132,446 134,438 C136,428 136,416 134,404 L130,396 L118,394 Z',

  // Trapecio inferior — lower portion
  lowerTrapezius: 'M150,124 C146,130 140,136 134,140 C128,144 124,146 120,150 L126,160 C132,158 140,154 146,148 C150,144 150,124 150,124 Z',
};

// ─── Generate mirrored (right side) paths ─────────────────────────

function buildMusclePaths(): MusclePathDef[] {
  const paths: MusclePathDef[] = [];

  // Helper to add left + mirrored right
  function addPair(
    id: string,
    region: MuscleRegion,
    depth: 'superficial' | 'profundo',
    frontPath?: string,
    backPath?: string,
    frontDetail?: string[],
    backDetail?: string[],
  ) {
    // Left
    paths.push({
      id, region, depth, side: 'left',
      front: frontPath ? { path: frontPath, detailPaths: frontDetail } : undefined,
      back: backPath ? { path: backPath, detailPaths: backDetail } : undefined,
    });
    // Right (mirrored)
    paths.push({
      id, region, depth, side: 'right',
      front: frontPath ? { path: mirrorPath(frontPath), detailPaths: frontDetail?.map(mirrorPath) } : undefined,
      back: backPath ? { path: mirrorPath(backPath), detailPaths: backDetail?.map(mirrorPath) } : undefined,
    });
  }

  // Helper for center muscles (no mirror)
  function addCenter(
    id: string,
    region: MuscleRegion,
    depth: 'superficial' | 'profundo',
    frontPath?: string,
    backPath?: string,
    frontDetail?: string[],
    backDetail?: string[],
  ) {
    paths.push({
      id, region, depth, side: 'center',
      front: frontPath ? { path: frontPath, detailPaths: frontDetail } : undefined,
      back: backPath ? { path: backPath, detailPaths: backDetail } : undefined,
    });
  }

  // ── FRONT + BACK paired muscles ──

  addPair('m_deltoides', 'hombros', 'superficial',
    FRONT_LEFT.deltoid, BACK_LEFT.posteriorDeltoid);

  addPair('m_pectoral_mayor', 'core', 'superficial',
    FRONT_LEFT.pectoral, undefined);

  addPair('m_biceps', 'brazos', 'superficial',
    FRONT_LEFT.biceps, undefined);

  addPair('m_braquial', 'brazos', 'profundo',
    FRONT_LEFT.brachialis, undefined);

  addPair('m_flexores_antebrazo', 'brazos', 'superficial',
    FRONT_LEFT.forearmFlexors, undefined);

  addPair('m_oblicuo_externo', 'core', 'superficial',
    FRONT_LEFT.oblique, undefined);

  addPair('m_serrato_anterior', 'espalda', 'superficial',
    FRONT_LEFT.serratus, undefined);

  addPair('m_cuadriceps', 'rodillas', 'superficial',
    FRONT_LEFT.quadriceps, undefined);

  addPair('m_aductores', 'cadera', 'profundo',
    FRONT_LEFT.adductors, undefined);

  addPair('m_tibial_anterior', 'tobillos_pies', 'superficial',
    FRONT_LEFT.tibialAnterior, undefined);

  addPair('m_esternocleidomastoideo', 'cuello', 'superficial',
    FRONT_LEFT.sternocleidomastoid, undefined);

  // Back-only paired muscles
  addPair('m_dorsal_ancho', 'espalda', 'superficial',
    undefined, BACK_LEFT.latissimus);

  addPair('m_romboides', 'espalda', 'profundo',
    undefined, BACK_LEFT.rhomboid);

  addPair('m_infraespinoso', 'espalda', 'profundo',
    undefined, BACK_LEFT.infraspinatus);

  addPair('m_triceps', 'brazos', 'superficial',
    undefined, BACK_LEFT.triceps);

  addPair('m_extensores_muneca', 'munecas_manos', 'superficial',
    undefined, BACK_LEFT.wristExtensors);

  addPair('m_gluteo_mayor', 'cadera', 'superficial',
    undefined, BACK_LEFT.gluteusMaximus);

  addPair('m_gluteo_medio', 'cadera', 'superficial',
    undefined, BACK_LEFT.gluteusMedius);

  addPair('m_isquiotibiales', 'rodillas', 'superficial',
    undefined, BACK_LEFT.hamstrings);

  addPair('m_gemelos', 'tobillos_pies', 'superficial',
    undefined, BACK_LEFT.gastrocnemius);

  // ── CENTER muscles (no mirror) ──

  addCenter('m_recto_abdominal', 'core', 'superficial',
    FRONT_LEFT.rectusAbdominis, undefined,
    // Detail paths: tendinous intersections (6-pack lines)
    [
      'M143,160 L157,160', // line 1
      'M143,180 L157,180', // line 2
      'M143,200 L157,200', // line 3
      'M143,222 L157,222', // line 4
      'M150,138 L150,268', // linea alba
    ]);

  addCenter('m_trapecio_front', 'espalda', 'superficial',
    FRONT_LEFT.trapeziusFront, undefined);

  // Back center muscles
  addCenter('m_trapecio', 'espalda', 'superficial',
    undefined, BACK_LEFT.trapezius + ' ' + mirrorPath(BACK_LEFT.trapezius));

  addCenter('m_trapecio_inferior', 'espalda', 'superficial',
    undefined, BACK_LEFT.lowerTrapezius + ' ' + mirrorPath(BACK_LEFT.lowerTrapezius));

  addCenter('m_erector_espinal', 'espalda', 'profundo',
    undefined, BACK_LEFT.erectorSpinae + ' ' + mirrorPath(BACK_LEFT.erectorSpinae),
    undefined,
    // Detail: vertebral reference lines
    ['M150,92 L150,258']);

  return paths;
}

export const MUSCLE_PATHS: MusclePathDef[] = buildMusclePaths();

// ─── Lookup helpers ───────────────────────────────────────────────

export function getMusclePathsByView(view: 'front' | 'back'): MusclePathDef[] {
  return MUSCLE_PATHS.filter((mp) => (view === 'front' ? mp.front : mp.back));
}

export function getMusclePathsByRegion(region: MuscleRegion, view: 'front' | 'back'): MusclePathDef[] {
  return MUSCLE_PATHS.filter(
    (mp) => mp.region === region && (view === 'front' ? mp.front : mp.back),
  );
}
