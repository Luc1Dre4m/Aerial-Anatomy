/**
 * Mapping of movement categories to expected joint angles per phase.
 *
 * Used by motionAnalysis.ts to determine which phase the user
 * is in and generate form corrections. Angles are in degrees.
 */

export interface PhaseAngleExpectation {
  /** Minimum shoulder depression (0-1 normalized) */
  shoulderDepressionMin?: number;
  /** Expected elbow angle range [min, max] */
  elbowAngle?: [number, number];
  /** Expected knee angle range [min, max] */
  kneeAngle?: [number, number];
  /** Expected hip angle range [min, max] */
  hipAngle?: [number, number];
  /** Is the body expected to be inverted? */
  inverted?: boolean;
}

/**
 * Default angle expectations by movement category.
 * These serve as baseline when no movement-specific data exists.
 */
export const CATEGORY_DEFAULTS: Record<string, PhaseAngleExpectation[]> = {
  suspension: [
    // Phase 1: Grip & hang
    { shoulderDepressionMin: 0.3, elbowAngle: [160, 180], hipAngle: [160, 180] },
    // Phase 2: Engage / pull
    { shoulderDepressionMin: 0.5, elbowAngle: [90, 160], hipAngle: [150, 180] },
    // Phase 3: Hold / peak
    { shoulderDepressionMin: 0.6, elbowAngle: [60, 120], hipAngle: [140, 180] },
    // Phase 4: Control descent
    { shoulderDepressionMin: 0.4, elbowAngle: [100, 170], hipAngle: [150, 180] },
  ],
  inversion: [
    // Phase 1: Preparation
    { shoulderDepressionMin: 0.2, inverted: false, hipAngle: [160, 180] },
    // Phase 2: Entry
    { shoulderDepressionMin: 0.4, inverted: false, hipAngle: [60, 140] },
    // Phase 3: Inverted
    { shoulderDepressionMin: 0.5, inverted: true, hipAngle: [150, 180] },
    // Phase 4: Exit
    { shoulderDepressionMin: 0.3, inverted: false, hipAngle: [90, 160] },
  ],
  fuerza: [
    // Phase 1: Start position
    { shoulderDepressionMin: 0.3, elbowAngle: [150, 180] },
    // Phase 2: Concentric
    { shoulderDepressionMin: 0.5, elbowAngle: [60, 150] },
    // Phase 3: Peak contraction
    { shoulderDepressionMin: 0.6, elbowAngle: [40, 90] },
    // Phase 4: Eccentric return
    { shoulderDepressionMin: 0.4, elbowAngle: [90, 170] },
  ],
  flexibilidad: [
    // Phase 1: Neutral
    { hipAngle: [160, 180], kneeAngle: [160, 180] },
    // Phase 2: Enter stretch
    { hipAngle: [90, 160], kneeAngle: [150, 180] },
    // Phase 3: Deep stretch
    { hipAngle: [40, 100], kneeAngle: [160, 180] },
    // Phase 4: Release
    { hipAngle: [120, 180], kneeAngle: [160, 180] },
  ],
  transicion: [
    // Phase 1: Start
    { shoulderDepressionMin: 0.3 },
    // Phase 2: Movement
    { shoulderDepressionMin: 0.4 },
    // Phase 3: End
    { shoulderDepressionMin: 0.3 },
  ],
};

/**
 * Look up the angle expectations for a movement's phase.
 * Falls back to category defaults, then to an empty object.
 */
export function getPhaseExpectations(
  category: string,
  phaseIndex: number
): PhaseAngleExpectation {
  const defaults = CATEGORY_DEFAULTS[category];
  if (!defaults) return {};

  // Clamp phase index to available phases
  const idx = Math.min(phaseIndex, defaults.length - 1);
  return defaults[idx] ?? {};
}

/**
 * Check if a measured angle falls within the expected range.
 * Returns a score from 0-1 indicating how well it matches.
 */
export function scoreAngle(
  measured: number,
  expected: [number, number] | undefined
): number {
  if (!expected) return 1; // No expectation = perfect score

  const [min, max] = expected;
  if (measured >= min && measured <= max) return 1;

  // Calculate how far off we are
  const distance = measured < min ? min - measured : measured - max;
  const range = max - min;
  const tolerance = Math.max(range * 0.5, 15); // At least 15 degrees tolerance

  return Math.max(0, 1 - distance / tolerance);
}
