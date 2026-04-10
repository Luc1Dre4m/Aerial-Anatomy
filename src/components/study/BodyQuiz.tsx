import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { muscles, REGION_LABELS } from '../../data/muscles';
import { MuscleRegion } from '../../utils/types';
import { AnatomicalBody } from '../body/AnatomicalBody';
import { BODY_ZONES } from '../body/bodyConstants';
import { colors, typography, spacing } from '../../theme';

const QUIZ_COUNT = 8;

function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

interface BodyQuizProps {
  onFinish: (score: number, total: number) => void;
}

export function BodyQuiz({ onFinish }: BodyQuizProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as 'es' | 'en';

  const quizMuscles = useMemo(() => shuffle(muscles).slice(0, QUIZ_COUNT), []);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedRegion, setSelectedRegion] = useState<MuscleRegion | null>(null);
  const [showResult, setShowResult] = useState(false);

  const currentMuscle = quizMuscles[questionIndex];
  const isCorrect = selectedRegion === currentMuscle?.region;
  const isFinished = questionIndex >= QUIZ_COUNT;

  const handleRegionPress = useCallback((region: MuscleRegion) => {
    if (showResult || isFinished) return;
    setSelectedRegion(region);
    setShowResult(true);
    if (region === currentMuscle?.region) {
      setScore((s) => s + 1);
    }
  }, [showResult, isFinished, currentMuscle]);

  const handleNext = useCallback(() => {
    if (questionIndex >= QUIZ_COUNT - 1) {
      onFinish(score, QUIZ_COUNT);
      setQuestionIndex(QUIZ_COUNT);
    } else {
      setQuestionIndex((i) => i + 1);
      setSelectedRegion(null);
      setShowResult(false);
    }
  }, [questionIndex, score, onFinish]);

  if (isFinished || !currentMuscle) return null;

  const muscleName = lang === 'es' ? currentMuscle.name_es : currentMuscle.name_en;
  const correctRegionLabel = REGION_LABELS[currentMuscle.region][lang];

  return (
    <View style={styles.container}>
      <View style={styles.questionBox}>
        <Text style={styles.prompt}>{t('study.bodyQuizPrompt')}</Text>
        <Text style={styles.muscleName}>{muscleName}</Text>
        <Text style={styles.latin}>{currentMuscle.name_latin}</Text>
        <Text style={styles.counter}>
          {questionIndex + 1} / {QUIZ_COUNT}
        </Text>
      </View>

      <View style={styles.bodyContainer}>
        <AnatomicalBody
          view="front"
          highlightedRegion={showResult ? currentMuscle.region : undefined}
          onRegionPress={handleRegionPress}
          regionColorOverrides={showResult ? (() => {
            const overrides: Record<string, { fill: string; opacity: number }> = {};
            BODY_ZONES.forEach((zone, index) => {
              const key = `${zone.region}-${index}`;
              if (zone.region === currentMuscle.region) {
                overrides[key] = { fill: colors.success, opacity: 0.5 };
              } else if (zone.region === selectedRegion) {
                overrides[key] = { fill: colors.error, opacity: 0.4 };
              }
            });
            return overrides;
          })() : undefined}
        />
      </View>

      {showResult && (
        <View style={[styles.feedback, { backgroundColor: isCorrect ? `${colors.success}20` : `${colors.error}20` }]}>
          <Text style={[styles.feedbackText, { color: isCorrect ? colors.success : colors.error }]}>
            {isCorrect ? t('study.correct') : t('study.incorrect')}
          </Text>
          {!isCorrect && (
            <Text style={styles.feedbackDetail}>
              {t('study.bodyQuizAnswer', { region: correctRegionLabel })}
            </Text>
          )}
        </View>
      )}

      {showResult && (
        <TouchableOpacity style={styles.nextBtn} onPress={handleNext} activeOpacity={0.7}>
          <Text style={styles.nextBtnText}>
            {questionIndex < QUIZ_COUNT - 1 ? t('study.next') : t('study.finish')}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  questionBox: {
    backgroundColor: colors.bg.secondary,
    borderRadius: 12,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  prompt: {
    ...typography.label.regular,
    color: colors.accent.primary,
    fontSize: 11,
  },
  muscleName: {
    ...typography.heading.h2,
    fontFamily: typography.heading.fontFamily,
    color: colors.accent.light,
    textAlign: 'center',
  },
  latin: {
    ...typography.body.small,
    color: colors.accent.muted,
    fontStyle: 'italic',
  },
  counter: {
    ...typography.body.small,
    color: colors.text.muted,
    marginTop: spacing.xs,
  },
  bodyContainer: {
    width: '100%',
    aspectRatio: 300 / 460,
    maxHeight: 340,
    alignSelf: 'center',
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
  feedbackDetail: {
    ...typography.body.regular,
    color: colors.text.secondary,
  },
  nextBtn: {
    backgroundColor: colors.accent.primary,
    borderRadius: 10,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  nextBtnText: {
    ...typography.body.regular,
    color: colors.bg.primary,
    fontWeight: '700',
  },
});
