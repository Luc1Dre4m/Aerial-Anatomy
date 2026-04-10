import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { PhaseAnalysis, CorrectionItem } from '../../services/motionAnalysis';
import { PhaseProgressBar } from './PhaseProgressBar';
import { colors, typography, spacing } from '../../theme';

interface MotionFeedbackOverlayProps {
  analysis: PhaseAnalysis | null;
  totalPhases: number;
  phaseNames: string[];
}

const SEVERITY_CONFIG: Record<string, { bg: string; icon: string; color: string }> = {
  info: { bg: colors.safety.info + '30', icon: 'information', color: colors.safety.info },
  warning: { bg: colors.safety.warning + '30', icon: 'alert', color: colors.safety.warning },
  critical: { bg: colors.safety.critical + '30', icon: 'alert-circle', color: colors.safety.critical },
};

const BREATHING_CONFIG: Record<string, { icon: string; color: string }> = {
  inhale: { icon: 'arrow-down-bold', color: colors.breathing.inhale },
  exhale: { icon: 'arrow-up-bold', color: colors.breathing.exhale },
  hold: { icon: 'pause-circle', color: colors.breathing.hold },
  natural: { icon: 'waves', color: colors.breathing.natural },
};

function CorrectionBadge({ correction }: { correction: CorrectionItem }) {
  const { t } = useTranslation();
  const config = SEVERITY_CONFIG[correction.severity] ?? SEVERITY_CONFIG.info;

  return (
    <View style={[styles.correctionBadge, { backgroundColor: config.bg }]}>
      <MaterialCommunityIcons
        name={config.icon as any}
        size={14}
        color={config.color}
      />
      <Text style={[styles.correctionText, { color: config.color }]} numberOfLines={1}>
        {t(correction.message_key)}
      </Text>
    </View>
  );
}

export function MotionFeedbackOverlay({
  analysis,
  totalPhases,
  phaseNames,
}: MotionFeedbackOverlayProps) {
  const { t } = useTranslation();

  if (!analysis) return null;

  const breathing = BREATHING_CONFIG[analysis.breathingExpected] ?? BREATHING_CONFIG.natural;

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Phase progress */}
      <View style={styles.phaseSection}>
        <PhaseProgressBar
          currentPhase={analysis.currentPhase}
          totalPhases={totalPhases}
          phaseNames={phaseNames}
        />
      </View>

      {/* Breathing indicator */}
      <View style={styles.breathingRow}>
        <MaterialCommunityIcons
          name={breathing.icon as any}
          size={18}
          color={breathing.color}
        />
        <Text style={[styles.breathingText, { color: breathing.color }]}>
          {t(`motion.breathing.${analysis.breathingExpected}`, analysis.breathingExpected)}
        </Text>
      </View>

      {/* Confidence */}
      <View style={styles.confidenceRow}>
        <Text style={styles.confidenceLabel}>{t('motion.formScore')}</Text>
        <Text style={styles.confidenceValue}>
          {Math.round(analysis.confidence * 100)}%
        </Text>
      </View>

      {/* Corrections */}
      {analysis.corrections.length > 0 && (
        <View style={styles.corrections}>
          {analysis.corrections.slice(0, 3).map((c, i) => (
            <CorrectionBadge key={`${c.muscle_id}-${i}`} correction={c} />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  phaseSection: {
    backgroundColor: colors.bg.primary + 'DD',
    borderRadius: 12,
    padding: spacing.md,
  },
  breathingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.bg.primary + 'CC',
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    alignSelf: 'flex-start',
  },
  breathingText: {
    ...typography.body.small,
    fontWeight: '600',
    fontSize: 12,
  },
  confidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.bg.primary + 'CC',
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  confidenceLabel: {
    ...typography.body.small,
    color: colors.text.muted,
    fontSize: 11,
  },
  confidenceValue: {
    ...typography.heading.h3,
    fontFamily: typography.heading.fontFamily,
    color: colors.accent.light,
    fontSize: 16,
  },
  corrections: {
    gap: spacing.xs,
  },
  correctionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  correctionText: {
    ...typography.body.small,
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
});
