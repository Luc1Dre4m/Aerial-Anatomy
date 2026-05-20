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
// eslint-disable-next-line @typescript-eslint/no-var-requires
const M_PIRIFORME = require('../../assets/3d-models/m_piriforme.glb');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const M_TIBIAL_ANTERIOR = require('../../assets/3d-models/m_tibial_anterior.glb');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const M_ESTERNOCLEIDOMASTOIDEO = require('../../assets/3d-models/m_esternocleidomastoideo.glb');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const M_BRAQUIAL = require('../../assets/3d-models/m_braquial.glb');
// m_braquiorradial (10 MB) excluded for now to keep bundle size in check.
// Re-enable once Fase 4 perf optimizations confirm we have headroom.
// const M_BRAQUIORRADIAL = require('../../assets/3d-models/m_braquiorradial.glb');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const M_GLUTEO_MEDIO = require('../../assets/3d-models/m_gluteo_medio.glb');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const M_GEMELOS = require('../../assets/3d-models/m_gemelos.glb');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const M_INFRAESPINOSO = require('../../assets/3d-models/m_infraespinoso.glb');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const M_ROMBOIDES = require('../../assets/3d-models/m_romboides.glb');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const M_MULTIFIDOS = require('../../assets/3d-models/m_multifidos.glb');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const M_TRAPECIO_INFERIOR = require('../../assets/3d-models/m_trapecio_inferior.glb');

// 17 músculos activos en el viewer (~106 MB GLBs raw). Tamaños actualizados
// post-decimación con gltfpack -si 0.3 + sub-meshes preservados (Plan v6).
// Curated FMA mapping para los 35 vive en tools/anatomy-models-curated.json.
//
// Bundle warning (junta directiva 2026-05-15, Renata): assets/3d-models/
// pesa ~400 MB en disco; aún con sólo 17 en runtime, el AAB excede el límite
// de 150 MB de Google Play. Sprint A2 #1 prioriza migrar GLBs a CDN/Asset
// Delivery + decimación más agresiva (-si 0.15). Hasta entonces NO se puede
// publicar. Subir el conteo de músculos activos arriba de ~20 va a empezar
// a bajar FPS en devices low-end y aumentar el riesgo de OOM al preload.
export const ANATOMY_3D_MODELS: Record<string, number> = {
  // Hombro / brazo
  m_pectoral_mayor: M_PECTORAL_MAYOR,         // 4.6 MB
  m_deltoides: M_DELTOIDES,                   // 9.3 MB
  m_trapecio: M_TRAPECIO,                     // 14 MB
  m_trapecio_inferior: M_TRAPECIO_INFERIOR,   // 6.3 MB — crítico aerial (depresión escapular)
  m_romboides: M_ROMBOIDES,                   // 5.6 MB — crítico aerial (retracción escapular)
  m_manguito_rotador: M_MANGUITO_ROTADOR,     // 8.1 MB — crítico aerial
  m_infraespinoso: M_INFRAESPINOSO,           // 2.9 MB
  m_biceps: M_BICEPS,                         // 5.6 MB
  m_triceps: M_TRICEPS,                       // 9.3 MB
  m_braquial: M_BRAQUIAL,                     // 3.2 MB — flexión codo (complementa biceps)
  // Core
  m_diafragma: M_DIAFRAGMA,                   // 9.6 MB — respiración aerial
  // Cadera / pierna
  m_iliopsoas: M_ILIOPSOAS,                   // 9.1 MB — flexión cadera
  m_gluteo_mayor: M_GLUTEO_MAYOR,             // 3.1 MB
  m_gluteo_medio: M_GLUTEO_MEDIO,             // 4.7 MB — estabilizador cadera (invertidas)
  m_piriforme: M_PIRIFORME,                   // 1.2 MB
  m_soleo: M_SOLEO,                           // 6.3 MB — tobillos aerial
  m_tibial_anterior: M_TIBIAL_ANTERIOR,       // 3.2 MB
};

export const ANATOMY_3D_AVAILABLE_IDS: readonly string[] = Object.keys(ANATOMY_3D_MODELS);

export function hasAnatomy3DModel(muscleId: string): boolean {
  return muscleId in ANATOMY_3D_MODELS;
}
