import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { G, Path, Circle, Line, Defs, LinearGradient, Stop } from 'react-native-svg';
import { getPoseForKey, PoseJoints } from '../../data/poses';
import { colors } from '../../theme';

interface PosedFigureProps {
  poseKey: string;
  size?: number;
  highlightedMuscles?: { muscle_id: string; intensity: number }[];
  discipline?: string;
}

// Segment lengths (proportional to viewbox 0 0 100 150)
const HEAD_R = 6;
const NECK_LEN = 6;
const TORSO_LEN = 28;
const UPPER_ARM_LEN = 16;
const FOREARM_LEN = 14;
const UPPER_LEG_LEN = 20;
const LOWER_LEG_LEN = 18;
const SHOULDER_W = 12;
const HIP_W = 8;

// Convert angle to radians
const toRad = (deg: number) => (deg * Math.PI) / 180;

// Calculate endpoint from start + angle + length
function endpoint(x: number, y: number, angleDeg: number, length: number): [number, number] {
  const rad = toRad(angleDeg);
  return [x + Math.sin(rad) * length, y + Math.cos(rad) * length];
}

function computeJoints(pose: PoseJoints) {
  const cx = 50;
  const cy = 30;

  // Body rotation applies to everything
  const bodyRot = pose.bodyAngle;
  const tilt = pose.torsoTilt;

  // Head center (top of figure)
  const headCx = cx;
  const headCy = cy - HEAD_R;

  // Neck base
  const neckAngle = bodyRot + tilt;
  const [neckBx, neckBy] = endpoint(headCx, headCy + HEAD_R, neckAngle, NECK_LEN);

  // Shoulders
  const shoulderAngle = neckAngle + 90;
  const [lShoulderX, lShoulderY] = endpoint(neckBx, neckBy, shoulderAngle + 180, SHOULDER_W);
  const [rShoulderX, rShoulderY] = endpoint(neckBx, neckBy, shoulderAngle, SHOULDER_W);

  // Torso end (hip center)
  const [hipCx, hipCy] = endpoint(neckBx, neckBy, neckAngle, TORSO_LEN);

  // Left arm
  const lArmAngle = bodyRot + 180 - pose.leftShoulderAngle;
  const [lElbowX, lElbowY] = endpoint(lShoulderX, lShoulderY, lArmAngle, UPPER_ARM_LEN);
  const lForearmAngle = lArmAngle + pose.leftElbowAngle;
  const [lHandX, lHandY] = endpoint(lElbowX, lElbowY, lForearmAngle, FOREARM_LEN);

  // Right arm
  const rArmAngle = bodyRot + 180 - pose.rightShoulderAngle;
  const [rElbowX, rElbowY] = endpoint(rShoulderX, rShoulderY, rArmAngle, UPPER_ARM_LEN);
  const rForearmAngle = rArmAngle - pose.rightElbowAngle;
  const [rHandX, rHandY] = endpoint(rElbowX, rElbowY, rForearmAngle, FOREARM_LEN);

  // Hips
  const hipAngle = neckAngle + 90;
  const [lHipX, lHipY] = endpoint(hipCx, hipCy, hipAngle + 180, HIP_W);
  const [rHipX, rHipY] = endpoint(hipCx, hipCy, hipAngle, HIP_W);

  // Left leg
  const lLegAngle = neckAngle + pose.leftHipAngle;
  const [lKneeX, lKneeY] = endpoint(lHipX, lHipY, lLegAngle, UPPER_LEG_LEN);
  const lShinAngle = lLegAngle + pose.leftKneeAngle;
  const [lFootX, lFootY] = endpoint(lKneeX, lKneeY, lShinAngle, LOWER_LEG_LEN);

  // Right leg
  const rLegAngle = neckAngle + pose.rightHipAngle;
  const [rKneeX, rKneeY] = endpoint(rHipX, rHipY, rLegAngle, UPPER_LEG_LEN);
  const rShinAngle = rLegAngle - pose.rightKneeAngle;
  const [rFootX, rFootY] = endpoint(rKneeX, rKneeY, rShinAngle, LOWER_LEG_LEN);

  return {
    head: { cx: headCx, cy: headCy },
    neck: { x1: headCx, y1: headCy + HEAD_R, x2: neckBx, y2: neckBy },
    torso: { x1: neckBx, y1: neckBy, x2: hipCx, y2: hipCy },
    lShoulder: { x: lShoulderX, y: lShoulderY },
    rShoulder: { x: rShoulderX, y: rShoulderY },
    lUpperArm: { x1: lShoulderX, y1: lShoulderY, x2: lElbowX, y2: lElbowY },
    lForearm: { x1: lElbowX, y1: lElbowY, x2: lHandX, y2: lHandY },
    rUpperArm: { x1: rShoulderX, y1: rShoulderY, x2: rElbowX, y2: rElbowY },
    rForearm: { x1: rElbowX, y1: rElbowY, x2: rHandX, y2: rHandY },
    lUpperLeg: { x1: lHipX, y1: lHipY, x2: lKneeX, y2: lKneeY },
    lLowerLeg: { x1: lKneeX, y1: lKneeY, x2: lFootX, y2: lFootY },
    rUpperLeg: { x1: rHipX, y1: rHipY, x2: rKneeX, y2: rKneeY },
    rLowerLeg: { x1: rKneeX, y1: rKneeY, x2: rFootX, y2: rFootY },
    hands: { left: { x: lHandX, y: lHandY }, right: { x: rHandX, y: rHandY } },
    feet: { left: { x: lFootX, y: lFootY }, right: { x: rFootX, y: rFootY } },
  };
}

// Build a limb path with thickness (capsule shape)
function limbPath(x1: number, y1: number, x2: number, y2: number, width: number): string {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len === 0) return '';
  const nx = (-dy / len) * width;
  const ny = (dx / len) * width;
  return `M${x1 + nx},${y1 + ny} L${x2 + nx},${y2 + ny} L${x2 - nx},${y2 - ny} L${x1 - nx},${y1 - ny} Z`;
}

const BODY_COLOR = colors.figure.body;
const BODY_HIGHLIGHT = colors.figure.highlight;
const BODY_OUTLINE = colors.figure.outline;
const JOINT_COLOR = colors.figure.joint;
const APPARATUS_COLOR = colors.accent.muted;

export function PosedFigure({ poseKey, size = 100, highlightedMuscles, discipline }: PosedFigureProps) {
  const pose = getPoseForKey(poseKey);
  const joints = computeJoints(pose);

  // Determine which body segments get highlighted
  const highlightArms = highlightedMuscles?.some(m =>
    ['m_biceps', 'm_triceps', 'm_deltoides', 'm_braquial'].includes(m.muscle_id)
  );
  const highlightCore = highlightedMuscles?.some(m =>
    ['m_recto_abdominal', 'm_oblicuo_externo'].includes(m.muscle_id)
  );
  const highlightBack = highlightedMuscles?.some(m =>
    ['m_dorsal_ancho', 'm_trapecio', 'm_romboides'].includes(m.muscle_id)
  );
  const highlightLegs = highlightedMuscles?.some(m =>
    ['m_cuadriceps', 'm_isquiotibiales', 'm_gluteo_mayor', 'm_aductores'].includes(m.muscle_id)
  );

  const armColor = highlightArms ? BODY_HIGHLIGHT : BODY_COLOR;
  const torsoColor = (highlightCore || highlightBack) ? BODY_HIGHLIGHT : BODY_COLOR;
  const legColor = highlightLegs ? BODY_HIGHLIGHT : BODY_COLOR;

  return (
    <View style={[styles.container, { width: size, height: size * 1.5 }]}>
      <Svg width="100%" height="100%" viewBox="0 0 100 150">
        <Defs>
          <LinearGradient id="fig-body" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#7A6A8A" stopOpacity="1" />
            <Stop offset="1" stopColor="#3A2A4A" stopOpacity="1" />
          </LinearGradient>
        </Defs>

        {/* Apparatus line */}
        {pose.apparatusType && pose.apparatusType !== 'none' && (
          <G>
            {pose.apparatusAttach === 'hands' && (
              <>
                <Line x1={joints.hands.left.x} y1={0} x2={joints.hands.left.x} y2={joints.hands.left.y}
                  stroke={APPARATUS_COLOR} strokeWidth={1.2} strokeDasharray="3,2" />
                <Line x1={joints.hands.right.x} y1={0} x2={joints.hands.right.x} y2={joints.hands.right.y}
                  stroke={APPARATUS_COLOR} strokeWidth={1.2} strokeDasharray="3,2" />
              </>
            )}
            {pose.apparatusAttach === 'waist' && (
              <Line x1={joints.torso.x2} y1={0} x2={joints.torso.x2} y2={joints.torso.y2}
                stroke={APPARATUS_COLOR} strokeWidth={1.2} strokeDasharray="3,2" />
            )}
          </G>
        )}

        {/* Torso — thick capsule */}
        <Path
          d={limbPath(joints.torso.x1, joints.torso.y1, joints.torso.x2, joints.torso.y2, 5)}
          fill={torsoColor}
          stroke={BODY_OUTLINE}
          strokeWidth={0.5}
        />

        {/* Shoulder line */}
        <Path
          d={limbPath(joints.lShoulder.x, joints.lShoulder.y, joints.rShoulder.x, joints.rShoulder.y, 2.5)}
          fill={torsoColor}
          stroke={BODY_OUTLINE}
          strokeWidth={0.4}
        />

        {/* Left arm segments */}
        <Path d={limbPath(joints.lUpperArm.x1, joints.lUpperArm.y1, joints.lUpperArm.x2, joints.lUpperArm.y2, 2.5)}
          fill={armColor} stroke={BODY_OUTLINE} strokeWidth={0.4} />
        <Path d={limbPath(joints.lForearm.x1, joints.lForearm.y1, joints.lForearm.x2, joints.lForearm.y2, 2)}
          fill={armColor} stroke={BODY_OUTLINE} strokeWidth={0.4} />

        {/* Right arm segments */}
        <Path d={limbPath(joints.rUpperArm.x1, joints.rUpperArm.y1, joints.rUpperArm.x2, joints.rUpperArm.y2, 2.5)}
          fill={armColor} stroke={BODY_OUTLINE} strokeWidth={0.4} />
        <Path d={limbPath(joints.rForearm.x1, joints.rForearm.y1, joints.rForearm.x2, joints.rForearm.y2, 2)}
          fill={armColor} stroke={BODY_OUTLINE} strokeWidth={0.4} />

        {/* Left leg segments */}
        <Path d={limbPath(joints.lUpperLeg.x1, joints.lUpperLeg.y1, joints.lUpperLeg.x2, joints.lUpperLeg.y2, 3)}
          fill={legColor} stroke={BODY_OUTLINE} strokeWidth={0.4} />
        <Path d={limbPath(joints.lLowerLeg.x1, joints.lLowerLeg.y1, joints.lLowerLeg.x2, joints.lLowerLeg.y2, 2.5)}
          fill={legColor} stroke={BODY_OUTLINE} strokeWidth={0.4} />

        {/* Right leg segments */}
        <Path d={limbPath(joints.rUpperLeg.x1, joints.rUpperLeg.y1, joints.rUpperLeg.x2, joints.rUpperLeg.y2, 3)}
          fill={legColor} stroke={BODY_OUTLINE} strokeWidth={0.4} />
        <Path d={limbPath(joints.rLowerLeg.x1, joints.rLowerLeg.y1, joints.rLowerLeg.x2, joints.rLowerLeg.y2, 2.5)}
          fill={legColor} stroke={BODY_OUTLINE} strokeWidth={0.4} />

        {/* Joint circles */}
        <Circle cx={joints.lUpperArm.x2} cy={joints.lUpperArm.y2} r={2} fill={JOINT_COLOR} stroke={BODY_OUTLINE} strokeWidth={0.3} />
        <Circle cx={joints.rUpperArm.x2} cy={joints.rUpperArm.y2} r={2} fill={JOINT_COLOR} stroke={BODY_OUTLINE} strokeWidth={0.3} />
        <Circle cx={joints.lUpperLeg.x2} cy={joints.lUpperLeg.y2} r={2.5} fill={JOINT_COLOR} stroke={BODY_OUTLINE} strokeWidth={0.3} />
        <Circle cx={joints.rUpperLeg.x2} cy={joints.rUpperLeg.y2} r={2.5} fill={JOINT_COLOR} stroke={BODY_OUTLINE} strokeWidth={0.3} />

        {/* Hands */}
        <Circle cx={joints.hands.left.x} cy={joints.hands.left.y} r={1.8} fill={armColor} stroke={BODY_OUTLINE} strokeWidth={0.3} />
        <Circle cx={joints.hands.right.x} cy={joints.hands.right.y} r={1.8} fill={armColor} stroke={BODY_OUTLINE} strokeWidth={0.3} />

        {/* Feet */}
        <Circle cx={joints.feet.left.x} cy={joints.feet.left.y} r={2} fill={legColor} stroke={BODY_OUTLINE} strokeWidth={0.3} />
        <Circle cx={joints.feet.right.x} cy={joints.feet.right.y} r={2} fill={legColor} stroke={BODY_OUTLINE} strokeWidth={0.3} />

        {/* Head */}
        <Circle
          cx={joints.head.cx}
          cy={joints.head.cy}
          r={HEAD_R}
          fill="url(#fig-body)"
          stroke={BODY_OUTLINE}
          strokeWidth={0.5}
        />

        {/* Neck */}
        <Path
          d={limbPath(joints.neck.x1, joints.neck.y1, joints.neck.x2, joints.neck.y2, 2)}
          fill={torsoColor}
          stroke={BODY_OUTLINE}
          strokeWidth={0.4}
        />

        {/* Muscle highlight overlays */}
        {highlightArms && (
          <>
            <Path d={limbPath(joints.lUpperArm.x1, joints.lUpperArm.y1, joints.lUpperArm.x2, joints.lUpperArm.y2, 2.5)}
              fill={colors.accent.primary} fillOpacity={0.3} />
            <Path d={limbPath(joints.rUpperArm.x1, joints.rUpperArm.y1, joints.rUpperArm.x2, joints.rUpperArm.y2, 2.5)}
              fill={colors.accent.primary} fillOpacity={0.3} />
          </>
        )}
        {(highlightCore || highlightBack) && (
          <Path d={limbPath(joints.torso.x1, joints.torso.y1, joints.torso.x2, joints.torso.y2, 5)}
            fill={colors.accent.primary} fillOpacity={0.25} />
        )}
        {highlightLegs && (
          <>
            <Path d={limbPath(joints.lUpperLeg.x1, joints.lUpperLeg.y1, joints.lUpperLeg.x2, joints.lUpperLeg.y2, 3)}
              fill={colors.accent.primary} fillOpacity={0.3} />
            <Path d={limbPath(joints.rUpperLeg.x1, joints.rUpperLeg.y1, joints.rUpperLeg.x2, joints.rUpperLeg.y2, 3)}
              fill={colors.accent.primary} fillOpacity={0.3} />
          </>
        )}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
  },
});
