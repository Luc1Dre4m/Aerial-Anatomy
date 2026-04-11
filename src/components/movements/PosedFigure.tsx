import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { G, Path, Circle, Line, Defs, LinearGradient, RadialGradient, Stop } from 'react-native-svg';
import { getPoseForKey, PoseJoints } from '../../data/poses';
import { colors } from '../../theme';

interface PosedFigureProps {
  poseKey: string;
  size?: number;
  highlightedMuscles?: { muscle_id: string; intensity: number }[];
  discipline?: string;
  showBackground?: boolean;
}

// Proportions (viewbox 100x150) — slightly beefier than stick figure
const HEAD_R = 7;
const NECK_LEN = 5;
const TORSO_LEN = 30;
const UPPER_ARM_LEN = 17;
const FOREARM_LEN = 15;
const UPPER_LEG_LEN = 22;
const LOWER_LEG_LEN = 20;
const SHOULDER_W = 11;
const HIP_W = 8;

const toRad = (deg: number) => (deg * Math.PI) / 180;

function endpoint(x: number, y: number, angleDeg: number, length: number): [number, number] {
  const rad = toRad(angleDeg);
  return [x + Math.sin(rad) * length, y + Math.cos(rad) * length];
}

function computeJoints(pose: PoseJoints) {
  const cx = 50;
  const cy = 28;

  const bodyRot = pose.bodyAngle;
  const tilt = pose.torsoTilt;

  const headCx = cx;
  const headCy = cy - HEAD_R;

  const neckAngle = bodyRot + tilt;
  const [neckBx, neckBy] = endpoint(headCx, headCy + HEAD_R, neckAngle, NECK_LEN);

  const shoulderAngle = neckAngle + 90;
  const [lShoulderX, lShoulderY] = endpoint(neckBx, neckBy, shoulderAngle + 180, SHOULDER_W);
  const [rShoulderX, rShoulderY] = endpoint(neckBx, neckBy, shoulderAngle, SHOULDER_W);

  const [hipCx, hipCy] = endpoint(neckBx, neckBy, neckAngle, TORSO_LEN);

  const lArmAngle = bodyRot + 180 - pose.leftShoulderAngle;
  const [lElbowX, lElbowY] = endpoint(lShoulderX, lShoulderY, lArmAngle, UPPER_ARM_LEN);
  const lForearmAngle = lArmAngle + pose.leftElbowAngle;
  const [lHandX, lHandY] = endpoint(lElbowX, lElbowY, lForearmAngle, FOREARM_LEN);

  const rArmAngle = bodyRot + 180 - pose.rightShoulderAngle;
  const [rElbowX, rElbowY] = endpoint(rShoulderX, rShoulderY, rArmAngle, UPPER_ARM_LEN);
  const rForearmAngle = rArmAngle - pose.rightElbowAngle;
  const [rHandX, rHandY] = endpoint(rElbowX, rElbowY, rForearmAngle, FOREARM_LEN);

  const hipAngle = neckAngle + 90;
  const [lHipX, lHipY] = endpoint(hipCx, hipCy, hipAngle + 180, HIP_W);
  const [rHipX, rHipY] = endpoint(hipCx, hipCy, hipAngle, HIP_W);

  const lLegAngle = neckAngle + pose.leftHipAngle;
  const [lKneeX, lKneeY] = endpoint(lHipX, lHipY, lLegAngle, UPPER_LEG_LEN);
  const lShinAngle = lLegAngle + pose.leftKneeAngle;
  const [lFootX, lFootY] = endpoint(lKneeX, lKneeY, lShinAngle, LOWER_LEG_LEN);

  const rLegAngle = neckAngle + pose.rightHipAngle;
  const [rKneeX, rKneeY] = endpoint(rHipX, rHipY, rLegAngle, UPPER_LEG_LEN);
  const rShinAngle = rLegAngle - pose.rightKneeAngle;
  const [rFootX, rFootY] = endpoint(rKneeX, rKneeY, rShinAngle, LOWER_LEG_LEN);

  return {
    head: { cx: headCx, cy: headCy },
    neck: { x1: headCx, y1: headCy + HEAD_R, x2: neckBx, y2: neckBy },
    torsoTop: { x: neckBx, y: neckBy },
    torsoBottom: { x: hipCx, y: hipCy },
    lShoulder: { x: lShoulderX, y: lShoulderY },
    rShoulder: { x: rShoulderX, y: rShoulderY },
    lHip: { x: lHipX, y: lHipY },
    rHip: { x: rHipX, y: rHipY },
    lElbow: { x: lElbowX, y: lElbowY },
    rElbow: { x: rElbowX, y: rElbowY },
    lHand: { x: lHandX, y: lHandY },
    rHand: { x: rHandX, y: rHandY },
    lKnee: { x: lKneeX, y: lKneeY },
    rKnee: { x: rKneeX, y: rKneeY },
    lFoot: { x: lFootX, y: lFootY },
    rFoot: { x: rFootX, y: rFootY },
  };
}

// Smooth torso silhouette from shoulders down to hips (rounded quad)
function torsoSilhouette(
  lShoulder: { x: number; y: number },
  rShoulder: { x: number; y: number },
  lHip: { x: number; y: number },
  rHip: { x: number; y: number },
): string {
  // Midpoint for waist taper
  const waistLx = lShoulder.x + (lHip.x - lShoulder.x) * 0.55;
  const waistLy = lShoulder.y + (lHip.y - lShoulder.y) * 0.55;
  const waistRx = rShoulder.x + (rHip.x - rShoulder.x) * 0.55;
  const waistRy = rShoulder.y + (rHip.y - rShoulder.y) * 0.55;
  return `M${lShoulder.x},${lShoulder.y} Q${waistLx - 1},${waistLy} ${lHip.x},${lHip.y} L${rHip.x},${rHip.y} Q${waistRx + 1},${waistRy} ${rShoulder.x},${rShoulder.y} Z`;
}

export function PosedFigure({ poseKey, size = 100, highlightedMuscles, showBackground = true }: PosedFigureProps) {
  const pose = getPoseForKey(poseKey);
  const j = computeJoints(pose);

  const highlightArms = highlightedMuscles?.some((m) =>
    ['m_biceps', 'm_triceps', 'm_deltoides', 'm_braquial'].includes(m.muscle_id),
  );
  const highlightCore = highlightedMuscles?.some((m) =>
    ['m_recto_abdominal', 'm_oblicuo_externo'].includes(m.muscle_id),
  );
  const highlightBack = highlightedMuscles?.some((m) =>
    ['m_dorsal_ancho', 'm_trapecio', 'm_romboides'].includes(m.muscle_id),
  );
  const highlightLegs = highlightedMuscles?.some((m) =>
    ['m_cuadriceps', 'm_isquiotibiales', 'm_gluteo_mayor', 'm_aductores'].includes(m.muscle_id),
  );

  const highlightOverlay = colors.accent.primary;

  const LIMB_COLOR = 'url(#fig-limb-grad)';
  const TORSO_COLOR = 'url(#fig-torso-grad)';
  const HEAD_COLOR = 'url(#fig-head-grad)';
  const OUTLINE = 'rgba(13, 13, 26, 0.45)';
  const APPARATUS = 'rgba(155, 109, 255, 0.55)';

  return (
    <View style={[styles.container, { width: size, height: size * 1.5 }]}>
      <Svg width="100%" height="100%" viewBox="0 0 100 150">
        <Defs>
          <RadialGradient id="fig-bg" cx="50%" cy="50%" rx="55%" ry="55%">
            <Stop offset="0" stopColor="#2E2448" stopOpacity="0.9" />
            <Stop offset="1" stopColor="#141024" stopOpacity="0" />
          </RadialGradient>
          <LinearGradient id="fig-limb-grad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#A88AE0" stopOpacity="1" />
            <Stop offset="1" stopColor="#5A3F8A" stopOpacity="1" />
          </LinearGradient>
          <LinearGradient id="fig-torso-grad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#B89AEE" stopOpacity="1" />
            <Stop offset="1" stopColor="#52387E" stopOpacity="1" />
          </LinearGradient>
          <RadialGradient id="fig-head-grad" cx="40%" cy="35%" rx="70%" ry="70%">
            <Stop offset="0" stopColor="#D4BFF5" stopOpacity="1" />
            <Stop offset="1" stopColor="#5A3F8A" stopOpacity="1" />
          </RadialGradient>
        </Defs>

        {/* Soft background halo */}
        {showBackground && (
          <Circle cx={50} cy={75} r={55} fill="url(#fig-bg)" />
        )}

        {/* Apparatus lines */}
        {pose.apparatusType && pose.apparatusType !== 'none' && (
          <G>
            {pose.apparatusAttach === 'hands' && (
              <>
                <Line
                  x1={j.lHand.x} y1={0} x2={j.lHand.x} y2={j.lHand.y}
                  stroke={APPARATUS} strokeWidth={2} strokeLinecap="round" strokeDasharray="4,3"
                />
                <Line
                  x1={j.rHand.x} y1={0} x2={j.rHand.x} y2={j.rHand.y}
                  stroke={APPARATUS} strokeWidth={2} strokeLinecap="round" strokeDasharray="4,3"
                />
              </>
            )}
            {pose.apparatusAttach === 'waist' && (
              <Line
                x1={j.torsoBottom.x} y1={0} x2={j.torsoBottom.x} y2={j.torsoBottom.y}
                stroke={APPARATUS} strokeWidth={2} strokeLinecap="round" strokeDasharray="4,3"
              />
            )}
          </G>
        )}

        {/* Legs — behind torso */}
        <G stroke={LIMB_COLOR} strokeLinecap="round" strokeLinejoin="round" fill="none">
          <Line x1={j.lHip.x} y1={j.lHip.y} x2={j.lKnee.x} y2={j.lKnee.y} strokeWidth={7} />
          <Line x1={j.lKnee.x} y1={j.lKnee.y} x2={j.lFoot.x} y2={j.lFoot.y} strokeWidth={6} />
          <Line x1={j.rHip.x} y1={j.rHip.y} x2={j.rKnee.x} y2={j.rKnee.y} strokeWidth={7} />
          <Line x1={j.rKnee.x} y1={j.rKnee.y} x2={j.rFoot.x} y2={j.rFoot.y} strokeWidth={6} />
        </G>

        {/* Torso silhouette — smooth rounded quad */}
        <Path
          d={torsoSilhouette(j.lShoulder, j.rShoulder, j.lHip, j.rHip)}
          fill={TORSO_COLOR}
          stroke={OUTLINE}
          strokeWidth={0.8}
          strokeLinejoin="round"
        />

        {/* Arms — rounded stroked lines */}
        <G stroke={LIMB_COLOR} strokeLinecap="round" strokeLinejoin="round" fill="none">
          <Line x1={j.lShoulder.x} y1={j.lShoulder.y} x2={j.lElbow.x} y2={j.lElbow.y} strokeWidth={6} />
          <Line x1={j.lElbow.x} y1={j.lElbow.y} x2={j.lHand.x} y2={j.lHand.y} strokeWidth={5} />
          <Line x1={j.rShoulder.x} y1={j.rShoulder.y} x2={j.rElbow.x} y2={j.rElbow.y} strokeWidth={6} />
          <Line x1={j.rElbow.x} y1={j.rElbow.y} x2={j.rHand.x} y2={j.rHand.y} strokeWidth={5} />
        </G>

        {/* Neck */}
        <Line
          x1={j.neck.x1} y1={j.neck.y1} x2={j.neck.x2} y2={j.neck.y2}
          stroke={TORSO_COLOR} strokeWidth={5} strokeLinecap="round"
        />

        {/* Head */}
        <Circle
          cx={j.head.cx}
          cy={j.head.cy}
          r={HEAD_R}
          fill={HEAD_COLOR}
          stroke={OUTLINE}
          strokeWidth={0.8}
        />

        {/* Hands */}
        <Circle cx={j.lHand.x} cy={j.lHand.y} r={2.5} fill={LIMB_COLOR} />
        <Circle cx={j.rHand.x} cy={j.rHand.y} r={2.5} fill={LIMB_COLOR} />

        {/* Feet */}
        <Circle cx={j.lFoot.x} cy={j.lFoot.y} r={3} fill={LIMB_COLOR} />
        <Circle cx={j.rFoot.x} cy={j.rFoot.y} r={3} fill={LIMB_COLOR} />

        {/* Muscle highlight overlays */}
        {highlightArms && (
          <G stroke={highlightOverlay} strokeLinecap="round" fill="none" opacity={0.55}>
            <Line x1={j.lShoulder.x} y1={j.lShoulder.y} x2={j.lElbow.x} y2={j.lElbow.y} strokeWidth={7} />
            <Line x1={j.lElbow.x} y1={j.lElbow.y} x2={j.lHand.x} y2={j.lHand.y} strokeWidth={6} />
            <Line x1={j.rShoulder.x} y1={j.rShoulder.y} x2={j.rElbow.x} y2={j.rElbow.y} strokeWidth={7} />
            <Line x1={j.rElbow.x} y1={j.rElbow.y} x2={j.rHand.x} y2={j.rHand.y} strokeWidth={6} />
          </G>
        )}
        {(highlightCore || highlightBack) && (
          <Path
            d={torsoSilhouette(j.lShoulder, j.rShoulder, j.lHip, j.rHip)}
            fill={highlightOverlay}
            fillOpacity={0.35}
          />
        )}
        {highlightLegs && (
          <G stroke={highlightOverlay} strokeLinecap="round" fill="none" opacity={0.55}>
            <Line x1={j.lHip.x} y1={j.lHip.y} x2={j.lKnee.x} y2={j.lKnee.y} strokeWidth={8} />
            <Line x1={j.lKnee.x} y1={j.lKnee.y} x2={j.lFoot.x} y2={j.lFoot.y} strokeWidth={7} />
            <Line x1={j.rHip.x} y1={j.rHip.y} x2={j.rKnee.x} y2={j.rKnee.y} strokeWidth={8} />
            <Line x1={j.rKnee.x} y1={j.rKnee.y} x2={j.rFoot.x} y2={j.rFoot.y} strokeWidth={7} />
          </G>
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
