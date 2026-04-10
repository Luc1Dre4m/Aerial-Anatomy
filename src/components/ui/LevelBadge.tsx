import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { MovementLevel } from '../../utils/types';
import { colors, typography, spacing } from '../../theme';

interface LevelBadgeProps {
  level: MovementLevel;
}

const LEVEL_COLORS: Record<MovementLevel, string> = {
  fundamentals: colors.level.fundamentals,
  basico: colors.level.basico,
  intermedio: colors.level.intermedio,
  avanzado: colors.level.avanzado,
  elite: colors.level.elite,
};

const LEVEL_KEYS: Record<MovementLevel, string> = {
  fundamentals: 'levels.fundamentals',
  basico: 'levels.basico',
  intermedio: 'levels.intermedio',
  avanzado: 'levels.avanzado',
  elite: 'levels.elite',
};

export function LevelBadge({ level }: LevelBadgeProps) {
  const { t } = useTranslation();
  const color = LEVEL_COLORS[level];

  return (
    <View style={[styles.badge, { borderColor: color }]}>
      <Text style={[styles.text, { color }]}>{t(LEVEL_KEYS[level])}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  text: {
    ...typography.label.regular,
    fontSize: 10,
  },
});
