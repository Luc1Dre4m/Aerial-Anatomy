/**
 * Paywall feature flags system.
 * In production, this would integrate with RevenueCat.
 * For now, reads subscription tier from Zustand store.
 */

export type SubscriptionTier = 'free' | 'premium' | 'instructor';

export interface FeatureFlags {
  musclesLimit: number;
  movementsLimit: number;
  chainAnimation: boolean;
  activationSequence: boolean;
  preTraining: boolean;
  studySystem: boolean;
  offlineMode: boolean;
  riskEvaluator: boolean;
  personalNotes: boolean;
  dailyQuizLimit: number;
  liveMode: boolean;
  pdfGenerator: boolean;
  shareableNotes: boolean;
  earlyAccess: boolean;
  verifiedBadge: boolean;
  customCollections: boolean;
}

const FREE_FLAGS: FeatureFlags = {
  musclesLimit: 10,
  movementsLimit: 5,
  chainAnimation: false,
  activationSequence: false,
  preTraining: false,
  studySystem: false,
  offlineMode: false,
  riskEvaluator: false,
  personalNotes: false,
  dailyQuizLimit: 1,
  liveMode: false,
  pdfGenerator: false,
  shareableNotes: false,
  earlyAccess: false,
  verifiedBadge: false,
  customCollections: false,
};

const PREMIUM_FLAGS: FeatureFlags = {
  musclesLimit: Infinity,
  movementsLimit: Infinity,
  chainAnimation: true,
  activationSequence: true,
  preTraining: true,
  studySystem: true,
  offlineMode: true,
  riskEvaluator: true,
  personalNotes: true,
  dailyQuizLimit: Infinity,
  liveMode: false,
  pdfGenerator: false,
  shareableNotes: false,
  earlyAccess: false,
  verifiedBadge: false,
  customCollections: false,
};

const INSTRUCTOR_FLAGS: FeatureFlags = {
  ...PREMIUM_FLAGS,
  liveMode: true,
  pdfGenerator: true,
  shareableNotes: true,
  earlyAccess: true,
  verifiedBadge: true,
  customCollections: true,
};

export function getFeatureFlags(tier: SubscriptionTier): FeatureFlags {
  switch (tier) {
    case 'instructor':
      return INSTRUCTOR_FLAGS;
    case 'premium':
      return PREMIUM_FLAGS;
    default:
      return FREE_FLAGS;
  }
}

// Free-tier muscle IDs (10 principales)
export const FREE_MUSCLE_IDS = [
  'm_deltoides',
  'm_dorsal_ancho',
  'm_recto_abdominal',
  'm_transverso',
  'm_biceps',
  'm_gluteo_mayor',
  'm_manguito_rotador',
  'm_trapecio',
  'm_isquiotibiales',
  'm_cuadriceps',
];

// Free-tier movement IDs (5 fundamentals)
export const FREE_MOVEMENT_IDS = [
  'mv_colgada_manos',
  'mv_depresion_escapular',
  'mv_core_suspension',
  'mv_foot_lock',
  'mv_subida_basica_tela',
];

// RevenueCat offering IDs (for future integration)
export const RC_OFFERINGS = {
  premium_monthly: 'rc_premium_monthly_199',
  premium_annual: 'rc_premium_annual_1499',
  instructor_monthly: 'rc_instructor_monthly_499',
  instructor_annual: 'rc_instructor_annual_3999',
} as const;

export const RC_ENTITLEMENTS = {
  premium: 'premium_access',
  instructor: 'instructor_access',
} as const;
