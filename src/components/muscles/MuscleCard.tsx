import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Muscle } from '../../utils/types';
import { REGION_LABELS } from '../../data/muscles';
import { AnimatedPressable } from '../ui/AnimatedPressable';
import { colors, typography, spacing, shadows } from '../../theme';

interface MuscleCardProps {
  muscle: Muscle;
  onPress: () => void;
}

export function MuscleCard({ muscle, onPress }: MuscleCardProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as 'es' | 'en';

  const name = lang === 'es' ? muscle.name_es : muscle.name_en;
  const regionLabel = REGION_LABELS[muscle.region][lang];
  const description = lang === 'es' ? muscle.description_es : muscle.description_en;

  return (
    <AnimatedPressable onPress={onPress} style={styles.card}>
      <View style={styles.glassOverlay} />
      <View style={styles.header}>
        <Text style={styles.name} numberOfLines={1}>{name}</Text>
        <View style={styles.regionBadge}>
          <Text style={styles.regionText}>{regionLabel}</Text>
        </View>
      </View>
      <Text style={styles.latin} numberOfLines={1}>{muscle.name_latin}</Text>
      <Text style={styles.description} numberOfLines={2}>{description}</Text>
      <View style={styles.footer}>
        <View style={[styles.depthDot, { backgroundColor: muscle.depth === 'superficial' ? colors.accent.primary : colors.text.muted }]} />
        <Text style={styles.depthText}>
          {muscle.depth === 'superficial'
            ? t('muscles.superficial')
            : t('muscles.deep')}
        </Text>
      </View>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  name: {
    ...typography.heading.h3,
    fontFamily: typography.heading.fontFamily,
    color: colors.accent.light,
    flex: 1,
  },
  regionBadge: {
    backgroundColor: colors.bg.tertiary,
    borderRadius: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  regionText: {
    ...typography.label.regular,
    color: colors.text.muted,
    fontSize: 9,
  },
  latin: {
    ...typography.body.small,
    color: colors.accent.muted,
    fontStyle: 'italic',
  },
  description: {
    ...typography.body.regular,
    color: colors.text.secondary,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  depthDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  depthText: {
    ...typography.body.small,
    color: colors.text.muted,
  },
});
