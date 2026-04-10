/**
 * MediaPipe pose detection service.
 *
 * Uses react-native-mediapipe-posedetection for 33-landmark
 * body tracking via device camera. Maps detected landmarks
 * to the app's muscle database for real-time muscle identification.
 */

import { Camera } from 'react-native-vision-camera';

// ── Types ──

export interface PoseLandmark {
  x: number;
  y: number;
  z: number;
  visibility: number;
  name: string;
}

export interface PoseResult {
  landmarks: PoseLandmark[];
  timestamp: number;
}

export type DetectedMuscle = {
  muscle_id: string;
  confidence: number;
  landmark_indices: number[];
};

// ── MediaPipe landmark names (33 points) ──

export const LANDMARK_NAMES = [
  'nose', 'left_eye_inner', 'left_eye', 'left_eye_outer',
  'right_eye_inner', 'right_eye', 'right_eye_outer',
  'left_ear', 'right_ear',
  'mouth_left', 'mouth_right',
  'left_shoulder', 'right_shoulder',
  'left_elbow', 'right_elbow',
  'left_wrist', 'right_wrist',
  'left_pinky', 'right_pinky',
  'left_index', 'right_index',
  'left_thumb', 'right_thumb',
  'left_hip', 'right_hip',
  'left_knee', 'right_knee',
  'left_ankle', 'right_ankle',
  'left_heel', 'right_heel',
  'left_foot_index', 'right_foot_index',
] as const;

// ── Landmark-to-muscle mapping ──
// Maps MediaPipe landmark indices to app muscle IDs.
// When landmarks in a group are detected with high visibility,
// the associated muscles are considered "active".

export const LANDMARK_TO_MUSCLE_MAP: Record<string, string[]> = {
  // Shoulders (landmarks 11, 12)
  'shoulder': ['m_deltoides', 'm_manguito_rotador', 'm_trapecio'],
  // Upper arms (landmarks 11-13, 12-14)
  'upper_arm': ['m_biceps', 'm_triceps', 'm_deltoides'],
  // Forearms (landmarks 13-15, 14-16)
  'forearm': ['m_flexores_antebrazo', 'm_extensores_muneca'],
  // Wrists (landmarks 15-22)
  'wrist': ['m_flexores_antebrazo'],
  // Torso (landmarks 11, 12, 23, 24)
  'torso_front': ['m_recto_abdominal', 'm_oblicuo_externo', 'm_transverso', 'm_pectoral_mayor'],
  'torso_back': ['m_dorsal_ancho', 'm_trapecio', 'm_romboides', 'm_erector_espinal'],
  // Hips (landmarks 23, 24)
  'hip': ['m_gluteo_mayor', 'm_gluteo_medio', 'm_iliopsoas'],
  // Thighs (landmarks 23-25, 24-26)
  'thigh': ['m_cuadriceps', 'm_isquiotibiales', 'm_aductores'],
  // Lower legs (landmarks 25-27, 26-28)
  'lower_leg': ['m_gemelos', 'm_tibial_anterior'],
};

// ── Landmark group definitions ──
// Each group specifies which landmark indices define a body segment

const LANDMARK_GROUPS: Record<string, number[]> = {
  shoulder: [11, 12],
  upper_arm: [11, 12, 13, 14],
  forearm: [13, 14, 15, 16],
  wrist: [15, 16, 17, 18, 19, 20, 21, 22],
  torso_front: [11, 12, 23, 24],
  torso_back: [11, 12, 23, 24],
  hip: [23, 24],
  thigh: [23, 24, 25, 26],
  lower_leg: [25, 26, 27, 28],
};

let isInitialized = false;

/**
 * Initialize pose detection. Checks camera permissions.
 */
export async function initPoseDetection(): Promise<boolean> {
  try {
    const permission = await Camera.requestCameraPermission();
    isInitialized = permission === 'granted';

    if (__DEV__) {
      console.log(`[PoseDetection] Camera permission: ${permission}`);
    }

    return isInitialized;
  } catch (error) {
    if (__DEV__) console.error('[PoseDetection] Init error:', error);
    return false;
  }
}

/**
 * Check if pose detection is initialized and camera is available.
 */
export function isPoseDetectionReady(): boolean {
  return isInitialized;
}

/**
 * Map detected landmarks to active muscles.
 * Analyzes landmark visibility and position to determine
 * which muscle groups are being engaged.
 */
export function mapLandmarksToMuscles(landmarks: PoseLandmark[]): DetectedMuscle[] {
  if (landmarks.length < 33) return [];

  const detectedMuscles: DetectedMuscle[] = [];
  const seenMuscles = new Set<string>();

  for (const [groupName, indices] of Object.entries(LANDMARK_GROUPS)) {
    // Calculate average visibility for this group
    const groupLandmarks = indices.map((i) => landmarks[i]).filter(Boolean);
    const avgVisibility =
      groupLandmarks.reduce((sum, l) => sum + l.visibility, 0) / groupLandmarks.length;

    // Only consider groups with sufficient visibility
    if (avgVisibility < 0.5) continue;

    const muscleIds = LANDMARK_TO_MUSCLE_MAP[groupName];
    if (!muscleIds) continue;

    for (const muscleId of muscleIds) {
      if (seenMuscles.has(muscleId)) continue;
      seenMuscles.add(muscleId);

      detectedMuscles.push({
        muscle_id: muscleId,
        confidence: avgVisibility,
        landmark_indices: indices,
      });
    }
  }

  return detectedMuscles.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Get the skeleton connection pairs for drawing overlay lines.
 * Each pair is [fromIndex, toIndex] in the 33-landmark model.
 */
export function getSkeletonConnections(): [number, number][] {
  return [
    // Face
    [0, 1], [1, 2], [2, 3], [0, 4], [4, 5], [5, 6],
    [3, 7], [6, 8], [9, 10],
    // Torso
    [11, 12], [11, 23], [12, 24], [23, 24],
    // Left arm
    [11, 13], [13, 15], [15, 17], [15, 19], [15, 21],
    // Right arm
    [12, 14], [14, 16], [16, 18], [16, 20], [16, 22],
    // Left leg
    [23, 25], [25, 27], [27, 29], [27, 31],
    // Right leg
    [24, 26], [26, 28], [28, 30], [28, 32],
  ];
}
