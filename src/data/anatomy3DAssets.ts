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
// eslint-disable-next-line @typescript-eslint/no-var-requires
const M_OBLICUO_EXTERNO = require('../../assets/3d-models/m_oblicuo_externo.glb');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const M_GLUTEO_MAYOR = require('../../assets/3d-models/m_gluteo_mayor.glb');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const M_CUADRICEPS = require('../../assets/3d-models/m_cuadriceps.glb');

export const ANATOMY_3D_MODELS: Record<string, number> = {
  m_pectoral_mayor: M_PECTORAL_MAYOR,
  m_dorsal_ancho: M_DORSAL_ANCHO,
  m_deltoides: M_DELTOIDES,
  m_trapecio: M_TRAPECIO,
  m_biceps: M_BICEPS,
  m_triceps: M_TRICEPS,
  m_recto_abdominal: M_RECTO_ABDOMINAL,
  m_oblicuo_externo: M_OBLICUO_EXTERNO,
  m_gluteo_mayor: M_GLUTEO_MAYOR,
  m_cuadriceps: M_CUADRICEPS,
};

export const ANATOMY_3D_AVAILABLE_IDS: readonly string[] = Object.keys(ANATOMY_3D_MODELS);

export function hasAnatomy3DModel(muscleId: string): boolean {
  return muscleId in ANATOMY_3D_MODELS;
}
