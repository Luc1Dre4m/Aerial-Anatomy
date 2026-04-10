import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { FormScore } from '../../services/motionAnalysis';
import { getMuscleById } from '../../data/muscles';
import { colors, typography, spacing } from '../../theme';

interface FormScoreCardProps {
  score: FormScore;
  movementName: string;
  duration: number;
  onSave?: () => void;
  onDismiss: () => void;
}

function getScoreColor(score: number): string {
  if (score >= 80) return colors.success;
  if (score >= 60) return colors.safety.warning;
  return colors.safety.critical;
}

function getScoreKey(score: number): string {
  if (score >= 80) return 'motion.score.excellent';
  if (score >= 60) return 'motion.score.good';
  if (score >= 40) return 'motion.score.needsWork';
  return 'motion.score.poor';
}

export function FormScoreCard({
  score,
  movementName,
  duration,
  onSave,
  onDismiss,
}: FormScoreCardProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as 'es' | 'en';
  const overallColor = getScoreColor(score.overall);
  const durationSec = Math.round(duration / 1000);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{movementName}</Text>

      {/* Overall score ring */}
      <View style={[styles.scoreRing, { borderColor: overallColor }]}>
        <Text style={[styles.scoreNumber, { color: overallColor }]}>{score.overall}</Text>
        <Text style={styles.scoreLabel}>{t(getScoreKey(score.overall))}</Text>
      </View>

      {/* Duration */}
      <View style={styles.durationRow}>
        <MaterialCommunityIcons name="timer-outline" size={16} color={colors.text.muted} />
        <Text style={styles.durationText}>{durationSec}s</Text>
      </View>

      {/* Phase breakdown */}
      {score.phaseScores.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('motion.phaseProgress')}</Text>
          {score.phaseScores.map((ps) => {
            const phaseColor = getScoreColor(ps.score);
            return (
              <View key={ps.phase} style={styles.phaseRow}>
                <Text style={styles.phaseLabel}>
                  {t('motion.phase')} {ps.phase + 1}
                </Text>
                <View style={styles.phaseBarBg}>
                  <View
                    style={[
                      styles.phaseBarFill,
                      { width: `${ps.score}%`, backgroundColor: phaseColor },
                    ]}
                  />
                </View>
                <Text style={[styles.phaseScore, { color: phaseColor }]}>{ps.score}%</Text>
              </View>
            );
          })}
        </View>
      )}

      {/* Muscle scores */}
      {score.muscleScores.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('pose.activeMuscles')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.muscleChips}>
              {score.muscleScores.map((ms) => {
                const muscle = getMuscleById(ms.muscle_id);
                const msColor = getScoreColor(ms.score);
                return (
                  <View key={ms.muscle_id} style={[styles.muscleChip, { borderColor: msColor }]}>
                    <Text style={styles.muscleName} numberOfLines={1}>
                      {muscle
                        ? lang === 'es' ? muscle.name_es : muscle.name_en
                        : ms.muscle_id}
                    </Text>
                    <Text style={[styles.muscleScore, { color: msColor }]}>{ms.score}%</Text>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        {onSave && (
          <TouchableOpacity style={styles.saveBtn} onPress={onSave}>
            <MaterialCommunityIcons name="content-save" size={18} color={colors.bg.primary} />
            <Text style={styles.saveBtnText}>{t('training.save')}</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.dismissBtn} onPress={onDismiss}>
          <Text style={styles.dismissBtnText}>{t('study.mode')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bg.secondary,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    gap: spacing.lg,
    alignItems: 'center',
  },
  title: {
    ...typography.heading.h3,
    fontFamily: typography.heading.fontFamily,
    color: colors.accent.light,
    textAlign: 'center',
  },
  scoreRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  scoreNumber: {
    ...typography.heading.h1,
    fontFamily: typography.heading.fontFamily,
    fontSize: 36,
  },
  scoreLabel: {
    ...typography.body.small,
    color: colors.text.muted,
    fontSize: 11,
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  durationText: {
    ...typography.body.small,
    color: colors.text.muted,
  },
  section: {
    width: '100%',
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.label.regular,
    color: colors.accent.primary,
    fontSize: 12,
  },
  phaseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  phaseLabel: {
    ...typography.body.small,
    color: colors.text.muted,
    width: 55,
    fontSize: 11,
  },
  phaseBarBg: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.bg.tertiary,
    overflow: 'hidden',
  },
  phaseBarFill: {
    height: 6,
    borderRadius: 3,
  },
  phaseScore: {
    ...typography.body.small,
    fontWeight: '700',
    fontSize: 12,
    width: 38,
    textAlign: 'right',
  },
  muscleChips: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  muscleChip: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    gap: 2,
    backgroundColor: colors.bg.primary,
  },
  muscleName: {
    ...typography.body.small,
    color: colors.text.primary,
    fontSize: 11,
  },
  muscleScore: {
    ...typography.body.small,
    fontWeight: '700',
    fontSize: 12,
  },
  actions: {
    width: '100%',
    gap: spacing.sm,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.accent.primary,
    borderRadius: 12,
    paddingVertical: spacing.md,
    minHeight: 48,
  },
  saveBtnText: {
    color: colors.bg.primary,
    fontWeight: '700',
    fontSize: 16,
  },
  dismissBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: spacing.md,
    alignItems: 'center',
    minHeight: 48,
  },
  dismissBtnText: {
    ...typography.body.regular,
    color: colors.text.muted,
    fontWeight: '600',
  },
});
