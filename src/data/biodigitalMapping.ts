/**
 * Mapping between app muscle IDs and BioDigital Human anatomy terms.
 * Used by the 3D Anatomy Viewer to highlight the correct structures.
 */

/** Map from app muscle ID to BioDigital Human anatomy term */
export const MUSCLE_TO_BIODIGITAL: Record<string, string> = {
  m_deltoides: 'Deltoid',
  m_manguito_rotador: 'Rotator Cuff',
  m_trapecio: 'Trapezius',
  m_trapecio_inferior: 'Lower Trapezius',
  m_serrato_anterior: 'Serratus Anterior',
  m_dorsal_ancho: 'Latissimus Dorsi',
  m_romboides: 'Rhomboids',
  m_erector_espinal: 'Erector Spinae',
  m_infraespinoso: 'Infraspinatus',
  m_recto_abdominal: 'Rectus Abdominis',
  m_transverso: 'Transversus Abdominis',
  m_oblicuo_externo: 'External Oblique',
  m_oblicuo_interno: 'Internal Oblique',
  m_diafragma: 'Diaphragm',
  m_multifidos: 'Multifidus',
  m_biceps: 'Biceps Brachii',
  m_triceps: 'Triceps Brachii',
  m_braquial: 'Brachialis',
  m_braquiorradial: 'Brachioradialis',
  m_flexores_dedos: 'Flexor Digitorum',
  m_extensores_muneca: 'Wrist Extensors',
  m_flexores_muneca: 'Wrist Flexors',
  m_gluteo_mayor: 'Gluteus Maximus',
  m_gluteo_medio: 'Gluteus Medius',
  m_iliopsoas: 'Iliopsoas',
  m_piriforme: 'Piriformis',
  m_aductores: 'Adductors',
  m_cuadriceps: 'Quadriceps',
  m_isquiotibiales: 'Hamstrings',
  m_gemelos: 'Gastrocnemius',
  m_soleo: 'Soleus',
  m_tibial_anterior: 'Tibialis Anterior',
  m_esternocleidomastoideo: 'Sternocleidomastoid',
  m_escalenos: 'Scalenes',
  m_pectoral_mayor: 'Pectoralis Major',
  m_flexores_antebrazo: 'Forearm Flexors',
};

/** Reverse mapping: BioDigital term → app muscle ID */
export const BIODIGITAL_TO_MUSCLE: Record<string, string> = Object.fromEntries(
  Object.entries(MUSCLE_TO_BIODIGITAL).map(([k, v]) => [v, k])
);

/**
 * Convert an array of app muscle IDs to BioDigital terms.
 * Silently skips unmapped IDs.
 */
export function muscleIdsToBioDigital(muscleIds: string[]): string[] {
  return muscleIds
    .map((id) => MUSCLE_TO_BIODIGITAL[id])
    .filter(Boolean);
}

/**
 * Convert a BioDigital anatomy term to an app muscle ID.
 * Returns null if not mapped.
 */
export function biodigitalToMuscleId(biodigitalName: string): string | null {
  return BIODIGITAL_TO_MUSCLE[biodigitalName] ?? null;
}
