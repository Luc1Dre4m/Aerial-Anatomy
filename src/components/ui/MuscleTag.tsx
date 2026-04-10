import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MuscleRole } from '../../utils/types';
import { colors, typography, spacing } from '../../theme';

interface MuscleTagProps {
  name: string;
  role: MuscleRole;
  onPress?: () => void;
}

const ROLE_COLORS: Record<MuscleRole, string> = {
  agonista: colors.muscle.agonista,
  sinergista: colors.muscle.sinergista,
  estabilizador: colors.muscle.estabilizador,
  antagonista: colors.muscle.antagonista,
};

export function MuscleTag({ name, role, onPress }: MuscleTagProps) {
  const content = (
    <View style={styles.container}>
      <View style={[styles.dot, { backgroundColor: ROLE_COLORS[role] }]} />
      <Text style={[styles.text, { color: ROLE_COLORS[role] }]}>{name}</Text>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} style={styles.touchable} accessibilityRole="button" accessibilityLabel={name}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  touchable: {
    minHeight: 44,
    justifyContent: 'center',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg.secondary,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  text: {
    ...typography.body.small,
    fontWeight: '600',
  },
});
