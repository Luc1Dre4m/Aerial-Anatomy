import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing } from '../../theme';

interface PhaseProgressBarProps {
  currentPhase: number;
  totalPhases: number;
  phaseNames?: string[];
}

export function PhaseProgressBar({
  currentPhase,
  totalPhases,
  phaseNames,
}: PhaseProgressBarProps) {
  const { t } = useTranslation();

  if (totalPhases <= 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {t('motion.phase')} {currentPhase + 1}/{totalPhases}
      </Text>

      {/* Segmented bar */}
      <View style={styles.barContainer}>
        {Array.from({ length: totalPhases }, (_, i) => (
          <View
            key={i}
            style={[
              styles.segment,
              i < currentPhase && styles.segmentCompleted,
              i === currentPhase && styles.segmentActive,
              i > currentPhase && styles.segmentPending,
              i === 0 && styles.segmentFirst,
              i === totalPhases - 1 && styles.segmentLast,
            ]}
          />
        ))}
      </View>

      {/* Phase name */}
      {phaseNames && phaseNames[currentPhase] && (
        <Text style={styles.phaseName} numberOfLines={1}>
          {phaseNames[currentPhase]}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  label: {
    ...typography.body.small,
    color: colors.text.muted,
    fontSize: 11,
    fontWeight: '600',
  },
  barContainer: {
    flexDirection: 'row',
    gap: 2,
    height: 6,
  },
  segment: {
    flex: 1,
    borderRadius: 1,
  },
  segmentFirst: {
    borderTopLeftRadius: 3,
    borderBottomLeftRadius: 3,
  },
  segmentLast: {
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3,
  },
  segmentCompleted: {
    backgroundColor: colors.accent.primary + '60',
  },
  segmentActive: {
    backgroundColor: colors.accent.primary,
  },
  segmentPending: {
    backgroundColor: colors.bg.tertiary,
  },
  phaseName: {
    ...typography.body.small,
    color: colors.text.secondary,
    fontSize: 12,
  },
});
