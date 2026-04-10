import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Line, G } from 'react-native-svg';
import { colors } from '../../theme';

interface StickFigureProps {
  movementId: string;
  size?: number;
}

const FIGURES: Record<string, React.ReactNode> = {
  mv_colgada_manos: (
    <G>
      <Line x1={40} y1={10} x2={50} y2={30} stroke={colors.accent.muted} strokeWidth={2} />
      <Line x1={60} y1={10} x2={50} y2={30} stroke={colors.accent.muted} strokeWidth={2} />
      <Circle cx={50} cy={38} r={7} stroke={colors.accent.primary} strokeWidth={2} fill="transparent" />
      <Line x1={50} y1={45} x2={50} y2={90} stroke={colors.accent.primary} strokeWidth={2} />
      <Line x1={50} y1={90} x2={40} y2={120} stroke={colors.accent.primary} strokeWidth={2} />
      <Line x1={50} y1={90} x2={60} y2={120} stroke={colors.accent.primary} strokeWidth={2} />
      <Line x1={40} y1={10} x2={60} y2={10} stroke={colors.accent.muted} strokeWidth={1.5} strokeDasharray="3,3" />
    </G>
  ),
  mv_inversion_controlada: (
    <G>
      <Line x1={40} y1={10} x2={50} y2={25} stroke={colors.accent.muted} strokeWidth={2} />
      <Line x1={60} y1={10} x2={50} y2={25} stroke={colors.accent.muted} strokeWidth={2} />
      <Line x1={50} y1={25} x2={50} y2={70} stroke={colors.accent.primary} strokeWidth={2} />
      <Line x1={50} y1={70} x2={40} y2={50} stroke={colors.accent.primary} strokeWidth={2} />
      <Line x1={50} y1={70} x2={60} y2={50} stroke={colors.accent.primary} strokeWidth={2} />
      <Circle cx={50} cy={110} r={7} stroke={colors.accent.primary} strokeWidth={2} fill="transparent" />
      <Line x1={50} y1={70} x2={50} y2={103} stroke={colors.accent.primary} strokeWidth={2} />
    </G>
  ),
  mv_subida_basica_tela: (
    <G>
      <Line x1={50} y1={5} x2={50} y2={150} stroke={colors.accent.muted} strokeWidth={1.5} strokeDasharray="3,3" />
      <Circle cx={50} cy={55} r={7} stroke={colors.accent.primary} strokeWidth={2} fill="transparent" />
      <Line x1={50} y1={30} x2={45} y2={48} stroke={colors.accent.primary} strokeWidth={2} />
      <Line x1={50} y1={40} x2={55} y2={48} stroke={colors.accent.primary} strokeWidth={2} />
      <Line x1={50} y1={62} x2={50} y2={95} stroke={colors.accent.primary} strokeWidth={2} />
      <Line x1={50} y1={95} x2={42} y2={120} stroke={colors.accent.primary} strokeWidth={2} />
      <Line x1={50} y1={95} x2={55} y2={115} stroke={colors.accent.primary} strokeWidth={2} />
      <Path d="M55,115 Q52,120 50,125" stroke={colors.accent.primary} strokeWidth={2} fill="transparent" />
    </G>
  ),
  mv_star: (
    <G>
      <Line x1={50} y1={5} x2={50} y2={40} stroke={colors.accent.muted} strokeWidth={1.5} strokeDasharray="3,3" />
      <Circle cx={50} cy={48} r={7} stroke={colors.accent.primary} strokeWidth={2} fill="transparent" />
      <Line x1={50} y1={55} x2={50} y2={85} stroke={colors.accent.primary} strokeWidth={2} />
      <Line x1={50} y1={60} x2={25} y2={45} stroke={colors.accent.primary} strokeWidth={2} />
      <Line x1={50} y1={60} x2={75} y2={45} stroke={colors.accent.primary} strokeWidth={2} />
      <Line x1={50} y1={85} x2={25} y2={115} stroke={colors.accent.primary} strokeWidth={2} />
      <Line x1={50} y1={85} x2={75} y2={115} stroke={colors.accent.primary} strokeWidth={2} />
    </G>
  ),
  mv_iron_cross_basico: (
    <G>
      <Line x1={40} y1={10} x2={50} y2={30} stroke={colors.accent.muted} strokeWidth={1.5} strokeDasharray="3,3" />
      <Line x1={60} y1={10} x2={50} y2={30} stroke={colors.accent.muted} strokeWidth={1.5} strokeDasharray="3,3" />
      <Circle cx={50} cy={38} r={7} stroke={colors.accent.primary} strokeWidth={2} fill="transparent" />
      <Line x1={50} y1={45} x2={50} y2={90} stroke={colors.accent.primary} strokeWidth={2} />
      <Line x1={50} y1={55} x2={15} y2={55} stroke={colors.accent.primary} strokeWidth={2} />
      <Line x1={50} y1={55} x2={85} y2={55} stroke={colors.accent.primary} strokeWidth={2} />
      <Line x1={50} y1={90} x2={42} y2={125} stroke={colors.accent.primary} strokeWidth={2} />
      <Line x1={50} y1={90} x2={58} y2={125} stroke={colors.accent.primary} strokeWidth={2} />
    </G>
  ),
  mv_front_lever: (
    <G>
      <Line x1={30} y1={10} x2={35} y2={50} stroke={colors.accent.muted} strokeWidth={1.5} strokeDasharray="3,3" />
      <Line x1={70} y1={10} x2={65} y2={50} stroke={colors.accent.muted} strokeWidth={1.5} strokeDasharray="3,3" />
      <Circle cx={50} cy={57} r={7} stroke={colors.accent.primary} strokeWidth={2} fill="transparent" />
      <Line x1={35} y1={50} x2={43} y2={57} stroke={colors.accent.primary} strokeWidth={2} />
      <Line x1={65} y1={50} x2={57} y2={57} stroke={colors.accent.primary} strokeWidth={2} />
      <Line x1={50} y1={64} x2={50} y2={80} stroke={colors.accent.primary} strokeWidth={2} />
      <Line x1={50} y1={80} x2={80} y2={80} stroke={colors.accent.primary} strokeWidth={2} />
    </G>
  ),
};

const DEFAULT_FIGURE = (
  <G>
    <Circle cx={50} cy={45} r={7} stroke={colors.accent.muted} strokeWidth={1.5} fill="transparent" />
    <Line x1={50} y1={52} x2={50} y2={90} stroke={colors.accent.muted} strokeWidth={1.5} />
    <Line x1={50} y1={65} x2={35} y2={55} stroke={colors.accent.muted} strokeWidth={1.5} />
    <Line x1={50} y1={65} x2={65} y2={55} stroke={colors.accent.muted} strokeWidth={1.5} />
    <Line x1={50} y1={90} x2={38} y2={115} stroke={colors.accent.muted} strokeWidth={1.5} />
    <Line x1={50} y1={90} x2={62} y2={115} stroke={colors.accent.muted} strokeWidth={1.5} />
  </G>
);

export function StickFigure({ movementId, size = 100 }: StickFigureProps) {
  const figure = FIGURES[movementId] ?? DEFAULT_FIGURE;

  return (
    <View style={[styles.container, { width: size, height: size * 1.5 }]}>
      <Svg width="100%" height="100%" viewBox="0 0 100 150">
        {figure}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
  },
});
