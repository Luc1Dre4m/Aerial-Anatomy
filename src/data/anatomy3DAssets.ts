// Registry of 3D anatomical models available in the mesh-based viewer.
// Source: BodyParts3D (Kevin-Mattheus-Moerman mirror), CC BY-SA 2.1 Japan.
// Build pipeline: tools/batch-build-models.mjs (see tools/anatomy-models-curated.json).
//
// Only muscles with a curated FMA mapping appear here. The remaining muscles
// fall back to the 2D viewer or display a "modelo 3D no disponible" hint.

// eslint-disable-next-line @typescript-eslint/no-var-requires
const M_PECTORAL_MAYOR = require('../../assets/3d-models/m_pectoral_mayor.glb');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const M_DORSAL_ANCHO = require('../../assets/3d-models/m_dorsal_ancho.glb');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const M_DELTOIDES = require('../../assets/3d-models/m_deltoides.glb');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const M_TRAPECIO = require('../../assets/3d-models/m_trapecio.glb');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const M_BICEPS = require('../../assets/3d-models/m_biceps.glb');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const M_TRICEPS = require('../../assets/3d-models/m_triceps.glb');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const M_RECTO_ABDOMINAL = require('../../assets/3d-models/m_recto_abdominal.glb');
// m_oblicuo_externo (78.9 MB) is temporarily excluded from the registry: loading
// it together with the other muscles in the body view triggered an Android OOM
// (~200 MB allocation needed to parse). Will be re-enabled after we run a
// decimation pass on the raw mesh.
// const M_OBLICUO_EXTERNO = require('../../assets/3d-models/m_oblicuo_externo.glb');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const M_GLUTEO_MAYOR = require('../../assets/3d-models/m_gluteo_mayor.glb');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const M_CUADRICEPS = require('../../assets/3d-models/m_cuadriceps.glb');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const M_MANGUITO_ROTADOR = require('../../assets/3d-models/m_manguito_rotador.glb');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const M_ILIOPSOAS = require('../../assets/3d-models/m_iliopsoas.glb');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const M_SOLEO = require('../../assets/3d-models/m_soleo.glb');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const M_DIAFRAGMA = require('../../assets/3d-models/m_diafragma.glb');

// 10 muscles enabled (~135 MB raw). Heavier ones (dorsal 32 MB, recto 27 MB,
// cuadriceps 43 MB, oblicuo externo 78 MB, transverso 45 MB, oblicuo interno
// 38 MB, serrato 35 MB, isquiotibiales 31 MB, flexores dedos 30 MB,
// flexores antebrazo 24 MB) are pending decimation — including them on top
// of the current registry pushes the GPU past smooth rotation on mid-tier
// devices. Curated FMA mapping for all 35 lives in
// tools/anatomy-models-curated.json.
export const ANATOMY_3D_MODELS: Record<string, number> = {
  // Hombro / brazo
  m_pectoral_mayor: M_PECTORAL_MAYOR,         // 7.6 MB
  m_deltoides: M_DELTOIDES,                   // 14.8 MB
  m_trapecio: M_TRAPECIO,                     // 20.9 MB
  m_manguito_rotador: M_MANGUITO_ROTADOR,     // 13.3 MB — crítico aerial
  m_biceps: M_BICEPS,                         // 8.8 MB
  m_triceps: M_TRICEPS,                       // 14.6 MB
  // Core
  m_diafragma: M_DIAFRAGMA,                   // 15.2 MB — respiración aerial
  // Cadera / pierna
  m_iliopsoas: M_ILIOPSOAS,                   // 14.5 MB — flexión cadera
  m_gluteo_mayor: M_GLUTEO_MAYOR,             // 4.8 MB
  m_soleo: M_SOLEO,                           // 10 MB — tobillos aerial
};

export const ANATOMY_3D_AVAILABLE_IDS: readonly string[] = Object.keys(ANATOMY_3D_MODELS);

export function hasAnatomy3DModel(muscleId: string): boolean {
  return muscleId in ANATOMY_3D_MODELS;
}
