import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useAppStore } from '../../store/useAppStore';
import { colors, typography, spacing } from '../../theme';

interface StreakBadgeProps {
  /** Compact horizontal layout (for inline placement) */
  compact?: boolean;
}

export function StreakBadge({ compact = false }: StreakBadgeProps) {
  const streak = useAppStore((s) => s.studyStreak);
  const lastStudyDate = useAppStore((s) => s.lastStudyDate);

  if (streak === 0 || !lastStudyDate) return null;

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().split('T')[0];
  const isActive = lastStudyDate === today || lastStudyDate === yesterday;
  const iconColor = isActive ? colors.accent.primary : colors.text.muted;

  return (
    <View style={[styles.badge, compact && styles.compact]}>
      <MaterialCommunityIcons name="fire" size={compact ? 14 : 16} color={iconColor} />
      <Text style={[styles.text, { color: iconColor }]}>
        {streak}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.bg.tertiary,
    borderRadius: 12,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  compact: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  text: {
    ...typography.body.small,
    fontWeight: '700',
    fontSize: 12,
  },
});
