import React from 'react';
import Svg, { Circle, Line } from 'react-native-svg';
import { PoseLandmark, getSkeletonConnections } from '../../services/poseDetection';
import { colors } from '../../theme';

interface PoseOverlayProps {
  landmarks: PoseLandmark[];
  width: number;
  height: number;
  activeMuscleIds?: string[];
}

// Colors for different body parts
const LANDMARK_COLORS: Record<number, string> = {
  // Face
  0: colors.text.muted, 1: colors.text.muted, 2: colors.text.muted,
  3: colors.text.muted, 4: colors.text.muted, 5: colors.text.muted,
  6: colors.text.muted, 7: colors.text.muted, 8: colors.text.muted,
  9: colors.text.muted, 10: colors.text.muted,
  // Shoulders
  11: colors.muscle.agonista, 12: colors.muscle.agonista,
  // Arms
  13: colors.muscle.sinergista, 14: colors.muscle.sinergista,
  15: colors.muscle.sinergista, 16: colors.muscle.sinergista,
  // Hands
  17: colors.accent.primary, 18: colors.accent.primary,
  19: colors.accent.primary, 20: colors.accent.primary,
  21: colors.accent.primary, 22: colors.accent.primary,
  // Hips
  23: colors.muscle.estabilizador, 24: colors.muscle.estabilizador,
  // Legs
  25: colors.muscle.estabilizador, 26: colors.muscle.estabilizador,
  27: colors.muscle.estabilizador, 28: colors.muscle.estabilizador,
  // Feet
  29: colors.accent.muted, 30: colors.accent.muted,
  31: colors.accent.muted, 32: colors.accent.muted,
};

export const PoseOverlay = React.memo(function PoseOverlay({
  landmarks,
  width,
  height,
}: PoseOverlayProps) {
  if (landmarks.length < 33) return null;

  const connections = getSkeletonConnections();

  return (
    <Svg width={width} height={height} style={{ position: 'absolute' }}>
      {/* Draw skeleton lines */}
      {connections.map(([from, to], idx) => {
        const a = landmarks[from];
        const b = landmarks[to];
        if (!a || !b || a.visibility < 0.3 || b.visibility < 0.3) return null;

        return (
          <Line
            key={`line-${idx}`}
            x1={a.x * width}
            y1={a.y * height}
            x2={b.x * width}
            y2={b.y * height}
            stroke={colors.accent.primary}
            strokeWidth={2}
            strokeOpacity={0.7}
          />
        );
      })}

      {/* Draw landmark dots */}
      {landmarks.map((lm, idx) => {
        if (lm.visibility < 0.3) return null;
        const color = LANDMARK_COLORS[idx] ?? colors.text.muted;
        const radius = idx <= 10 ? 3 : 5; // Smaller dots for face

        return (
          <Circle
            key={`dot-${idx}`}
            cx={lm.x * width}
            cy={lm.y * height}
            r={radius}
            fill={color}
            strokeWidth={1}
            stroke={colors.bg.primary}
          />
        );
      })}
    </Svg>
  );
});
