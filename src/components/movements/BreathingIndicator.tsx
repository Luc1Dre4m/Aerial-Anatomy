import React from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { ExecutionPhase } from '../../utils/types';
import { colors, typography, spacing } from '../../theme';

const BREATHING_ICONS: Record<ExecutionPhase['breathing'], { icon: React.ComponentProps<typeof MaterialCommunityIcons>['name']; color: string; bgColor: string }> = {
  inhale: { icon: 'arrow-down-circle', color: colors.breathing.inhale, bgColor: colors.breathing.inhale + '15' },
  exhale: { icon: 'arrow-up-circle', color: colors.breathing.exhale, bgColor: colors.breathing.exhale + '15' },
  hold: { icon: 'pause-circle', color: colors.breathing.hold, bgColor: colors.breathing.hold + '15' },
  natural: { icon: 'autorenew', color: colors.breathing.natural, bgColor: colors.breathing.natural + '15' },
};

interface BreathingIndicatorProps {
  breathing: ExecutionPhase['breathing'];
  breathingLabel: string;
  phaseLabel: string;
  durationSeconds?: number;
  breathPulse: Animated.Value;
}

export const BreathingIndicator = React.memo(function BreathingIndicator({
  breathing,
  breathingLabel,
  phaseLabel,
  durationSeconds,
  breathPulse,
}: BreathingIndicatorProps) {
  const info = BREATHING_ICONS[breathing];

  return (
    <View style={[styles.container, { backgroundColor: info.bgColor }]}>
      <Animated.View style={{ transform: [{ scale: breathPulse }] }}>
        <MaterialCommunityIcons name={info.icon} size={28} color={info.color} />
      </Animated.View>
      <View>
        <Text style={[styles.label, { color: info.color }]}>{breathingLabel}</Text>
        <Text style={styles.phaseNumber}>{phaseLabel}</Text>
      </View>
      {durationSeconds != null && (
        <Text style={styles.durationBadge}>{durationSeconds}s</Text>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
  },
  phaseNumber: {
    ...typography.body.small,
    color: colors.text.muted,
    fontWeight: '600',
    marginTop: 2,
  },
  durationBadge: {
    marginLeft: 'auto',
    ...typography.body.small,
    color: colors.accent.muted,
    fontWeight: '700',
    backgroundColor: colors.bg.tertiary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: 'hidden',
  },
});
