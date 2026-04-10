import React from 'react';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme';

interface GradientDividerProps {
  color?: string;
}

export function GradientDivider({ color = colors.accent.glow }: GradientDividerProps) {
  return (
    <LinearGradient
      colors={['transparent', color, 'transparent']}
      start={{ x: 0, y: 0.5 }}
      end={{ x: 1, y: 0.5 }}
      style={styles.divider}
    />
  );
}

const styles = StyleSheet.create({
  divider: {
    height: 1,
    width: '100%',
  },
});
