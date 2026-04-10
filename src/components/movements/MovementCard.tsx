import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Movement } from '../../utils/types';
import { LevelBadge } from '../ui/LevelBadge';
import { AnimatedPressable } from '../ui/AnimatedPressable';
import { getDisciplineById } from '../../data/disciplines';
import { colors, typography, spacing, shadows } from '../../theme';

interface MovementCardProps {
  movement: Movement;
  onPress: () => void;
}

export function MovementCard({ movement, onPress }: MovementCardProps) {
  const { i18n } = useTranslation();
  const lang = i18n.language as 'es' | 'en';
  const name = lang === 'es' ? movement.name_es : movement.name_en;

  const agonistCount = movement.muscles.filter((m) => m.role === 'agonista').length;
  const totalMuscles = movement.muscles.length;

  return (
    <AnimatedPressable onPress={onPress} style={styles.card}>
      <View style={styles.glassOverlay} />
      <View style={styles.header}>
        <Text style={styles.name} numberOfLines={2}>{name}</Text>
        <LevelBadge level={movement.level} />
      </View>

      <View style={styles.disciplines}>
        {movement.disciplines.map((dId) => {
          const disc = getDisciplineById(dId);
          if (!disc) return null;
          return (
            <View key={dId} style={[styles.discDot, { backgroundColor: disc.color }]}>
              <Text style={styles.discText}>
                {(lang === 'es' ? disc.name_es : disc.name_en).split(' ')[0]}
              </Text>
            </View>
          );
        })}
      </View>

      <View style={styles.meta}>
        <View style={styles.muscleInfo}>
          <View style={[styles.dot, { backgroundColor: colors.muscle.agonista }]} />
          <Text style={styles.metaText}>{agonistCount} agonistas</Text>
        </View>
        <Text style={styles.metaText}>{totalMuscles} muscles</Text>
      </View>

      {movement.safety_icon === 'critical' && (
        <View style={styles.criticalBadge}>
          <Text style={styles.criticalText}>⚠</Text>
        </View>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bg.secondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.glass.border,
    padding: spacing.lg,
    gap: spacing.sm,
    overflow: 'hidden',
    ...shadows.md,
  },
  glassOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.glass.light,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  name: {
    ...typography.heading.h3,
    fontFamily: typography.heading.fontFamily,
    color: colors.accent.light,
    flex: 1,
  },
  disciplines: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  discDot: {
    borderRadius: 12,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  discText: {
    ...typography.body.small,
    color: colors.bg.primary,
    fontWeight: '600',
    fontSize: 10,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  muscleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  metaText: {
    ...typography.body.small,
    color: colors.text.muted,
  },
  criticalBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
  },
  criticalText: {
    fontSize: 14,
  },
});
