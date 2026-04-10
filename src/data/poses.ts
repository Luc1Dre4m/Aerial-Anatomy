/**
 * Pose definitions for articulated body figures.
 * Each pose defines joint angles for the body segments.
 * Angles are in degrees from the "resting" position.
 */

export interface PoseJoints {
  // Body orientation
  bodyAngle: number;       // 0 = upright, 180 = inverted, 90 = horizontal
  torsoTilt: number;       // forward/back lean (-30 to 30)

  // Left arm
  leftShoulderAngle: number;   // 0 = down, 180 = up
  leftElbowAngle: number;     // 0 = straight, 150 = fully bent

  // Right arm
  rightShoulderAngle: number;
  rightElbowAngle: number;

  // Left leg
  leftHipAngle: number;       // 0 = straight down, 90 = horizontal forward
  leftKneeAngle: number;      // 0 = straight, 150 = fully bent

  // Right leg
  rightHipAngle: number;
  rightKneeAngle: number;

  // Apparatus line (optional)
  apparatusType?: 'silk' | 'trapeze' | 'hoop' | 'rope' | 'straps' | 'none';
  apparatusAttach?: 'hands' | 'waist' | 'feet' | 'knee';
}

export const BASE_POSES: Record<string, PoseJoints> = {
  // Standing neutral
  standing: {
    bodyAngle: 0, torsoTilt: 0,
    leftShoulderAngle: 10, leftElbowAngle: 10,
    rightShoulderAngle: 10, rightElbowAngle: 10,
    leftHipAngle: 5, leftKneeAngle: 0,
    rightHipAngle: 5, rightKneeAngle: 0,
    apparatusType: 'none',
  },

  // Hanging from hands (dead hang)
  hanging: {
    bodyAngle: 0, torsoTilt: 0,
    leftShoulderAngle: 175, leftElbowAngle: 0,
    rightShoulderAngle: 175, rightElbowAngle: 0,
    leftHipAngle: 5, leftKneeAngle: 0,
    rightHipAngle: 5, rightKneeAngle: 0,
    apparatusType: 'silk', apparatusAttach: 'hands',
  },

  // Active hang (scapulae depressed)
  active_hang: {
    bodyAngle: 0, torsoTilt: 0,
    leftShoulderAngle: 170, leftElbowAngle: 10,
    rightShoulderAngle: 170, rightElbowAngle: 10,
    leftHipAngle: 5, leftKneeAngle: 0,
    rightHipAngle: 5, rightKneeAngle: 0,
    apparatusType: 'silk', apparatusAttach: 'hands',
  },

  // Inverted (upside down, legs up)
  inverted: {
    bodyAngle: 180, torsoTilt: 0,
    leftShoulderAngle: 175, leftElbowAngle: 10,
    rightShoulderAngle: 175, rightElbowAngle: 10,
    leftHipAngle: 5, leftKneeAngle: 0,
    rightHipAngle: 5, rightKneeAngle: 0,
    apparatusType: 'silk', apparatusAttach: 'hands',
  },

  // Pike (body folded at hips)
  pike: {
    bodyAngle: 0, torsoTilt: 0,
    leftShoulderAngle: 175, leftElbowAngle: 10,
    rightShoulderAngle: 175, rightElbowAngle: 10,
    leftHipAngle: 90, leftKneeAngle: 0,
    rightHipAngle: 90, rightKneeAngle: 0,
    apparatusType: 'silk', apparatusAttach: 'hands',
  },

  // Tuck (knees pulled to chest)
  tuck: {
    bodyAngle: 0, torsoTilt: 10,
    leftShoulderAngle: 175, leftElbowAngle: 10,
    rightShoulderAngle: 175, rightElbowAngle: 10,
    leftHipAngle: 120, leftKneeAngle: 140,
    rightHipAngle: 120, rightKneeAngle: 140,
    apparatusType: 'silk', apparatusAttach: 'hands',
  },

  // Star (spread eagle)
  star: {
    bodyAngle: 0, torsoTilt: 0,
    leftShoulderAngle: 135, leftElbowAngle: 0,
    rightShoulderAngle: 135, rightElbowAngle: 0,
    leftHipAngle: 45, leftKneeAngle: 0,
    rightHipAngle: -45, rightKneeAngle: 0,
    apparatusType: 'silk', apparatusAttach: 'hands',
  },

  // Split (front split in the air)
  split: {
    bodyAngle: 0, torsoTilt: 0,
    leftShoulderAngle: 175, leftElbowAngle: 0,
    rightShoulderAngle: 175, rightElbowAngle: 0,
    leftHipAngle: 90, leftKneeAngle: 0,
    rightHipAngle: -90, rightKneeAngle: 0,
    apparatusType: 'silk', apparatusAttach: 'hands',
  },

  // L-sit
  l_sit: {
    bodyAngle: 0, torsoTilt: -5,
    leftShoulderAngle: 170, leftElbowAngle: 0,
    rightShoulderAngle: 170, rightElbowAngle: 0,
    leftHipAngle: 90, leftKneeAngle: 0,
    rightHipAngle: 90, rightKneeAngle: 0,
    apparatusType: 'silk', apparatusAttach: 'hands',
  },

  // Climb (one hand high, one low, foot wrapped)
  climb: {
    bodyAngle: 0, torsoTilt: 0,
    leftShoulderAngle: 175, leftElbowAngle: 40,
    rightShoulderAngle: 130, rightElbowAngle: 90,
    leftHipAngle: 30, leftKneeAngle: 0,
    rightHipAngle: 70, rightKneeAngle: 110,
    apparatusType: 'silk', apparatusAttach: 'hands',
  },

  // Iron cross
  cross: {
    bodyAngle: 0, torsoTilt: 0,
    leftShoulderAngle: 90, leftElbowAngle: 0,
    rightShoulderAngle: 90, rightElbowAngle: 0,
    leftHipAngle: 5, leftKneeAngle: 0,
    rightHipAngle: 5, rightKneeAngle: 0,
    apparatusType: 'straps', apparatusAttach: 'hands',
  },

  // Straddle (legs wide to sides)
  straddle: {
    bodyAngle: 0, torsoTilt: 0,
    leftShoulderAngle: 175, leftElbowAngle: 0,
    rightShoulderAngle: 175, rightElbowAngle: 0,
    leftHipAngle: 60, leftKneeAngle: 0,
    rightHipAngle: -60, rightKneeAngle: 0,
    apparatusType: 'silk', apparatusAttach: 'hands',
  },

  // Bridge / backbend
  bridge: {
    bodyAngle: 0, torsoTilt: -30,
    leftShoulderAngle: 160, leftElbowAngle: 0,
    rightShoulderAngle: 160, rightElbowAngle: 0,
    leftHipAngle: -20, leftKneeAngle: 0,
    rightHipAngle: -20, rightKneeAngle: 0,
    apparatusType: 'silk', apparatusAttach: 'waist',
  },

  // Front lever (horizontal, facing up)
  front_lever: {
    bodyAngle: 90, torsoTilt: 0,
    leftShoulderAngle: 175, leftElbowAngle: 0,
    rightShoulderAngle: 175, rightElbowAngle: 0,
    leftHipAngle: 0, leftKneeAngle: 0,
    rightHipAngle: 0, rightKneeAngle: 0,
    apparatusType: 'silk', apparatusAttach: 'hands',
  },
};

/**
 * Maps stick_figure_key from ExecutionPhase to a base pose.
 * Falls back to 'standing' if no match found.
 */
export const PHASE_POSE_MAP: Record<string, string> = {
  // Colgada de manos phases
  mv_colgada_manos: 'hanging',
  mv_colgada_manos_phase_1: 'standing',
  mv_colgada_manos_phase_2: 'hanging',
  mv_colgada_manos_phase_3: 'active_hang',
  mv_colgada_manos_phase_4: 'standing',

  // Inversion controlada phases
  mv_inversion_controlada: 'inverted',
  mv_inversion_controlada_phase_1: 'hanging',
  mv_inversion_controlada_phase_2: 'tuck',
  mv_inversion_controlada_phase_3: 'inverted',
  mv_inversion_controlada_phase_4: 'hanging',

  // Subida basica tela
  mv_subida_basica_tela: 'climb',
  mv_subida_basica_tela_phase_1: 'hanging',
  mv_subida_basica_tela_phase_2: 'climb',
  mv_subida_basica_tela_phase_3: 'climb',
  mv_subida_basica_tela_phase_4: 'hanging',

  // Depresion escapular
  mv_depresion_escapular: 'active_hang',
  mv_depresion_escapular_phase_1: 'hanging',
  mv_depresion_escapular_phase_2: 'active_hang',
  mv_depresion_escapular_phase_3: 'hanging',

  // General movements
  mv_star: 'star',
  mv_iron_cross_basico: 'cross',
  mv_front_lever: 'front_lever',
  mv_pike: 'pike',
  mv_straddle: 'straddle',
  mv_split: 'split',
};

export function getPoseForKey(key: string): PoseJoints {
  const poseName = PHASE_POSE_MAP[key];
  if (poseName && BASE_POSES[poseName]) return BASE_POSES[poseName];
  return BASE_POSES.standing;
}
