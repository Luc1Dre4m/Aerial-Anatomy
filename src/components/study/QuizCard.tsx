import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Muscle } from '../../utils/types';
import { REGION_LABELS } from '../../data/muscles';
import { colors, typography, spacing } from '../../theme';

interface QuizCardProps {
  muscle: Muscle;
  options: Muscle[];
  selectedId: string | null;
  onSelect: (muscleId: string) => void;
}

export function QuizCard({ muscle, options, selectedId, onSelect }: QuizCardProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as 'es' | 'en';
  const regionLabel = REGION_LABELS[muscle.region][lang];
  const isAnswered = selectedId !== null;
  const isCorrect = selectedId === muscle.id;

  return (
    <View style={styles.container}>
      {/* Question */}
      <View style={styles.questionCard}>
        <Text style={styles.prompt}>{t('study.quizPrompt')}</Text>
        <Text style={styles.latin}>{muscle.name_latin}</Text>
        <View style={styles.hintRow}>
          <Text style={styles.hint}>{regionLabel}</Text>
          <Text style={styles.hint}>•</Text>
          <Text style={styles.hint}>
            {muscle.depth === 'superficial'
              ? t('muscles.superficial')
              : t('muscles.deep')}
          </Text>
        </View>
      </View>

      {/* Options */}
      <View style={styles.options}>
        {options.map((opt) => {
          const optName = lang === 'es' ? opt.name_es : opt.name_en;
          const isThis = opt.id === selectedId;
          const isAnswer = opt.id === muscle.id;

          const optStyles = [
            styles.option,
            isAnswered && isAnswer && styles.optionCorrect,
            isAnswered && isThis && !isCorrect && styles.optionWrong,
            isAnswered && !isAnswer && !isThis && styles.optionDisabled,
          ];
          const textStyles = [
            styles.optionText,
            isAnswered && isAnswer && styles.optionTextCorrect,
            isAnswered && isThis && !isCorrect && styles.optionTextWrong,
          ];

          return (
            <TouchableOpacity
              key={opt.id}
              style={optStyles}
              onPress={() => !isAnswered && onSelect(opt.id)}
              disabled={isAnswered}
            >
              <Text style={textStyles}>{optName}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Feedback */}
      {isAnswered && (
        <View style={[styles.feedback, { backgroundColor: isCorrect ? `${colors.success}20` : `${colors.error}20` }]}>
          <Text style={[styles.feedbackText, { color: isCorrect ? colors.success : colors.error }]}>
            {isCorrect ? t('study.correct') : t('study.incorrect')}
          </Text>
          {!isCorrect && (
            <Text style={styles.feedbackAnswer}>
              {t('study.theAnswerWas')} {lang === 'es' ? muscle.name_es : muscle.name_en}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
  questionCard: {
    backgroundColor: colors.bg.secondary,
    borderRadius: 16,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  prompt: {
    ...typography.label.regular,
    color: colors.accent.primary,
    fontSize: 12,
  },
  latin: {
    ...typography.heading.h2,
    fontFamily: typography.heading.fontFamily,
    color: colors.accent.light,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  hintRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  hint: {
    ...typography.body.small,
    color: colors.text.muted,
  },
  options: {
    gap: spacing.sm,
  },
  option: {
    backgroundColor: colors.bg.secondary,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    minHeight: 48,
    justifyContent: 'center',
  },
  optionText: {
    ...typography.body.regular,
    color: colors.text.primary,
    fontWeight: '500',
  },
  optionCorrect: {
    borderColor: colors.success,
    backgroundColor: `${colors.success}15`,
  },
  optionTextCorrect: {
    color: colors.success,
    fontWeight: '700',
  },
  optionWrong: {
    borderColor: colors.error,
    backgroundColor: `${colors.error}15`,
  },
  optionTextWrong: {
    color: colors.error,
  },
  optionDisabled: {
    opacity: 0.5,
  },
  feedback: {
    borderRadius: 10,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.xs,
  },
  feedbackText: {
    ...typography.heading.h3,
    fontFamily: typography.heading.fontFamily,
  },
  feedbackAnswer: {
    ...typography.body.regular,
    color: colors.text.secondary,
  },
});
