/**
 * Motion analysis service.
 *
 * Compares detected pose landmarks against expected body positions
 * for each ExecutionPhase of a movement. Provides real-time form
 * feedback and scoring.
 */

import { Movement, ExecutionPhase, MotionSession } from '../utils/types';
import { PoseLandmark } from './poseDetection';

// ── Types ──

export type CorrectionSeverity = 'info' | 'warning' | 'critical';

export interface CorrectionItem {
  muscle_id: string;
  message_key: string;
  severity: CorrectionSeverity;
}

export interface PhaseAnalysis {
  currentPhase: number;
  confidence: number;
  corrections: CorrectionItem[];
  breathingExpected: 'inhale' | 'exhale' | 'hold' | 'natural';
}

export type { MotionSession };

export interface FormScore {
  overall: number;
  phaseScores: { phase: number; score: number; corrections: CorrectionItem[] }[];
  muscleScores: { muscle_id: string; score: number }[];
}

// ── Angle calculations ──

/**
 * Calculate angle at point B formed by points A-B-C.
 * Returns angle in degrees (0-180).
 */
export function calculateAngle(
  a: PoseLandmark,
  b: PoseLandmark,
  c: PoseLandmark
): number {
  const radians =
    Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs((radians * 180) / Math.PI);
  if (angle > 180) angle = 360 - angle;
  return angle;
}

/**
 * Calculate distance between two landmarks.
 */
export function calculateDistance(a: PoseLandmark, b: PoseLandmark): number {
  return Math.sqrt(
    Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2) + Math.pow(a.z - b.z, 2)
  );
}

/**
 * Detect if the body is inverted (upside down).
 * Compares hip Y position with shoulder Y position.
 */
export function isInverted(landmarks: PoseLandmark[]): boolean {
  if (landmarks.length < 25) return false;

  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];
  const leftHip = landmarks[23];
  const rightHip = landmarks[24];

  const shoulderY = (leftShoulder.y + rightShoulder.y) / 2;
  const hipY = (leftHip.y + rightHip.y) / 2;

  // In screen coordinates, Y increases downward.
  // If hips are above shoulders (lower Y), body is inverted.
  return hipY < shoulderY;
}

/**
 * Measure shoulder depression — key metric for aerial arts.
 * Higher values indicate better scapular depression (engaged lats).
 * Returns 0-1 normalized value.
 */
export function getShoulderDepression(landmarks: PoseLandmark[]): number {
  if (landmarks.length < 13) return 0;

  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];
  const leftEar = landmarks[7];
  const rightEar = landmarks[8];

  // Distance between ears and shoulders indicates depression
  const leftDist = Math.abs(leftEar.y - leftShoulder.y);
  const rightDist = Math.abs(rightEar.y - rightShoulder.y);
  const avgDist = (leftDist + rightDist) / 2;

  // Normalize: typical range 0.05-0.2 in relative coords
  return Math.min(1, Math.max(0, (avgDist - 0.05) / 0.15));
}

/**
 * Get the elbow angle (arm bend) for a specific side.
 */
export function getElbowAngle(
  landmarks: PoseLandmark[],
  side: 'left' | 'right'
): number {
  if (landmarks.length < 17) return 0;

  if (side === 'left') {
    return calculateAngle(landmarks[11], landmarks[13], landmarks[15]);
  }
  return calculateAngle(landmarks[12], landmarks[14], landmarks[16]);
}

/**
 * Get the knee angle for a specific side.
 */
export function getKneeAngle(
  landmarks: PoseLandmark[],
  side: 'left' | 'right'
): number {
  if (landmarks.length < 29) return 0;

  if (side === 'left') {
    return calculateAngle(landmarks[23], landmarks[25], landmarks[27]);
  }
  return calculateAngle(landmarks[24], landmarks[26], landmarks[28]);
}

/**
 * Get the hip angle (torso-thigh bend) for a specific side.
 */
export function getHipAngle(
  landmarks: PoseLandmark[],
  side: 'left' | 'right'
): number {
  if (landmarks.length < 27) return 0;

  if (side === 'left') {
    return calculateAngle(landmarks[11], landmarks[23], landmarks[25]);
  }
  return calculateAngle(landmarks[12], landmarks[24], landmarks[26]);
}

// ── Phase analysis ──

/**
 * Analyze the current movement phase based on detected landmarks.
 * Compares body position against expected positions in execution_phases.
 */
export function analyzeMovementPhase(
  landmarks: PoseLandmark[],
  movement: Movement
): PhaseAnalysis | null {
  if (!movement.execution_phases || movement.execution_phases.length === 0) {
    return null;
  }

  const phases = movement.execution_phases;
  const corrections: CorrectionItem[] = [];

  // Determine current phase by analyzing body position
  const inverted = isInverted(landmarks);
  const shoulderDep = getShoulderDepression(landmarks);
  const leftElbow = getElbowAngle(landmarks, 'left');
  const rightElbow = getElbowAngle(landmarks, 'right');
  const leftHip = getHipAngle(landmarks, 'left');
  const rightHip = getHipAngle(landmarks, 'right');

  // Simple phase detection: score each phase and pick the best match
  let bestPhase = 0;
  let bestScore = 0;

  for (let i = 0; i < phases.length; i++) {
    const phase = phases[i];
    let score = 0;
    let checks = 0;

    // Check if inversion state matches phase expectations
    const phaseCategory = movement.category;
    if (phaseCategory === 'inversion') {
      // Later phases of inversions should be inverted
      if (i >= phases.length / 2 && inverted) score += 1;
      if (i < phases.length / 2 && !inverted) score += 1;
      checks += 1;
    }

    // Check shoulder engagement for suspension/strength movements
    if (phaseCategory === 'suspension' || phaseCategory === 'fuerza') {
      if (shoulderDep > 0.3) score += 1;
      checks += 1;
    }

    // Check active muscles — if high-intensity muscles correspond to engaged body parts
    for (const am of phase.active_muscles) {
      if (am.intensity >= 4) {
        checks += 1;
        // Simple presence check — in a real system this would use
        // the landmark positions more precisely
        score += 0.5;
      }
    }

    const normalizedScore = checks > 0 ? score / checks : 0;
    if (normalizedScore > bestScore) {
      bestScore = normalizedScore;
      bestPhase = i;
    }
  }

  const currentPhaseData = phases[bestPhase];

  // Generate corrections based on detected issues
  if (shoulderDep < 0.2 && movement.category === 'suspension') {
    corrections.push({
      muscle_id: 'm_trapecio',
      message_key: 'motion.corrections.shoulderElevation',
      severity: 'warning',
    });
  }

  const elbowAsymmetry = Math.abs(leftElbow - rightElbow);
  if (elbowAsymmetry > 20) {
    corrections.push({
      muscle_id: 'm_biceps',
      message_key: 'motion.corrections.asymmetry',
      severity: 'info',
    });
  }

  const hipAsymmetry = Math.abs(leftHip - rightHip);
  if (hipAsymmetry > 15) {
    corrections.push({
      muscle_id: 'm_oblicuo_externo',
      message_key: 'motion.corrections.asymmetry',
      severity: 'info',
    });
  }

  return {
    currentPhase: bestPhase,
    confidence: bestScore,
    corrections,
    breathingExpected: currentPhaseData.breathing,
  };
}

/**
 * Calculate a form score for a completed movement recording.
 */
export function calculateFormScore(
  phaseAnalyses: PhaseAnalysis[],
  movement: Movement
): FormScore {
  if (phaseAnalyses.length === 0 || !movement.execution_phases) {
    return { overall: 0, phaseScores: [], muscleScores: [] };
  }

  const phaseScores = phaseAnalyses.map((analysis, i) => {
    // Base score from confidence
    let score = analysis.confidence * 100;

    // Deduct for corrections
    for (const correction of analysis.corrections) {
      if (correction.severity === 'critical') score -= 20;
      else if (correction.severity === 'warning') score -= 10;
      else score -= 5;
    }

    return {
      phase: i,
      score: Math.max(0, Math.min(100, score)),
      corrections: analysis.corrections,
    };
  });

  // Aggregate muscle scores
  const muscleScoreMap: Record<string, { total: number; count: number }> = {};
  for (const ps of phaseScores) {
    const phase = movement.execution_phases![ps.phase];
    if (!phase) continue;
    for (const am of phase.active_muscles) {
      if (!muscleScoreMap[am.muscle_id]) {
        muscleScoreMap[am.muscle_id] = { total: 0, count: 0 };
      }
      muscleScoreMap[am.muscle_id].total += ps.score;
      muscleScoreMap[am.muscle_id].count += 1;
    }
  }

  const muscleScores = Object.entries(muscleScoreMap).map(([muscle_id, data]) => ({
    muscle_id,
    score: Math.round(data.total / data.count),
  }));

  const overall = phaseScores.length > 0
    ? Math.round(
        phaseScores.reduce((sum, ps) => sum + ps.score, 0) / phaseScores.length
      )
    : 0;

  return { overall, phaseScores, muscleScores };
}
