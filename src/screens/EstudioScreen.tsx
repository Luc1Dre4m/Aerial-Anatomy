import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { LanguageToggle } from '../components/ui';
import { AuthorCredit } from '../components/ui/AuthorCredit';
import { FlashCard } from '../components/study/FlashCard';
import { QuizCard } from '../components/study/QuizCard';
import { SpacedFlashCard } from '../components/study/SpacedFlashCard';
import { BodyQuiz } from '../components/study/BodyQuiz';
import { useSpacedRepetition } from '../hooks/useSpacedRepetition';
import { muscles, getMuscleById } from '../data/muscles';
import { getMovementById } from '../data/movements';
import { useAppStore } from '../store/useAppStore';
import { Muscle } from '../utils/types';
import { colors, typography, spacing } from '../theme';

type StudyMode = 'menu' | 'flashcards' | 'quiz' | 'results' | 'spaced' | 'favorites' | 'bodyQuiz';

function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function generateOptions(correct: Muscle, allMuscles: Muscle[]): Muscle[] {
  const others = allMuscles.filter((m) => m.id !== correct.id);
  const wrongOptions = shuffle(others).slice(0, 3);
  return shuffle([correct, ...wrongOptions]);
}

const QUIZ_COUNT = 10;

export function EstudioScreen() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as 'es' | 'en';
  const navigation = useNavigation<any>();
  const favMuscles = useAppStore((s) => s.favoriteMuscles);
  const favMovements = useAppStore((s) => s.favoriteMovements);

  const [mode, setMode] = useState<StudyMode>('menu');
  const [cardIndex, setCardIndex] = useState(0);
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [quizTotal, setQuizTotal] = useState(QUIZ_COUNT);

  const sr = useSpacedRepetition(muscles);
  const shuffledMuscles = useMemo(() => shuffle(muscles), [mode]);
  const quizMuscles = useMemo(() => shuffledMuscles.slice(0, QUIZ_COUNT), [shuffledMuscles]);
  const quizOptions = useMemo(
    () => quizMuscles.map((m) => generateOptions(m, muscles)),
    [quizMuscles]
  );

  const currentFlashcard = shuffledMuscles[cardIndex];
  const currentQuizMuscle = quizMuscles[quizIndex];
  const currentOptions = quizOptions[quizIndex];

  const handleQuizSelect = useCallback((muscleId: string) => {
    setSelectedAnswer(muscleId);
    if (muscleId === currentQuizMuscle?.id) {
      setScore((s) => s + 1);
    }
  }, [currentQuizMuscle]);

  const handleQuizNext = useCallback(() => {
    if (quizIndex < QUIZ_COUNT - 1) {
      setQuizIndex((i) => i + 1);
      setSelectedAnswer(null);
    } else {
      setQuizTotal(QUIZ_COUNT);
      setMode('results');
    }
  }, [quizIndex]);

  const handleRestart = useCallback(() => {
    setMode('menu');
    setCardIndex(0);
    setQuizIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setQuizTotal(QUIZ_COUNT);
  }, []);

  const scorePercent = quizTotal > 0 ? Math.round((score / quizTotal) * 100) : 0;

  // ── MENU ──
  if (mode === 'menu') {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <ScrollView contentContainerStyle={styles.menuContent} showsVerticalScrollIndicator={false}>
          <LanguageToggle />
          <Text style={styles.title}>{t('study.title')}</Text>
          <Text style={styles.subtitle}>{t('screens.estudio.description')}</Text>

          <View style={styles.modeCards}>
            <TouchableOpacity
              style={styles.modeCard}
              onPress={() => setMode('flashcards')}
              activeOpacity={0.7}
            >
              <Text style={styles.modeIcon}>🃏</Text>
              <Text style={styles.modeTitle}>{t('study.flashcards')}</Text>
              <Text style={styles.modeDesc}>
                {t('study.musclesToReview', { count: muscles.length })}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modeCard}
              onPress={() => { setScore(0); setQuizIndex(0); setSelectedAnswer(null); setMode('quiz'); }}
              activeOpacity={0.7}
            >
              <Text style={styles.modeIcon}>🧠</Text>
              <Text style={styles.modeTitle}>{t('study.quiz')}</Text>
              <Text style={styles.modeDesc}>
                {t('study.randomQuestions', { count: QUIZ_COUNT })}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modeCard}
              onPress={() => setMode('spaced')}
              activeOpacity={0.7}
            >
              <Text style={styles.modeIcon}>📊</Text>
              <Text style={styles.modeTitle}>{t('study.spacedRepetition')}</Text>
              <Text style={styles.modeDesc}>
                {t('study.dueCards', { count: sr.dueCount })}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modeCard}
              onPress={() => setMode('favorites')}
              activeOpacity={0.7}
            >
              <Text style={styles.modeIcon}>❤️</Text>
              <Text style={styles.modeTitle}>{t('favorites.title')}</Text>
              <Text style={styles.modeDesc}>
                {t('study.saved', { count: favMuscles.length + favMovements.length })}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modeCard}
              onPress={() => setMode('bodyQuiz')}
              activeOpacity={0.7}
            >
              <Text style={styles.modeIcon}>🫀</Text>
              <Text style={styles.modeTitle}>{t('study.bodyQuiz')}</Text>
              <Text style={styles.modeDesc}>
                {t('study.locateMuscles')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modeCard}
              onPress={() => navigation.navigate('TrainingLog')}
              activeOpacity={0.7}
            >
              <Text style={styles.modeIcon}>📓</Text>
              <Text style={styles.modeTitle}>{t('training.log')}</Text>
              <Text style={styles.modeDesc}>
                {t('study.logSessions')}
              </Text>
            </TouchableOpacity>
          </View>

          <AuthorCredit />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── FLASHCARDS ──
  if (mode === 'flashcards' && currentFlashcard) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={handleRestart} style={styles.backBtn}>
            <Text style={styles.backText}>← {t('study.mode')}</Text>
          </TouchableOpacity>
          <Text style={styles.counter}>
            {t('study.cardOf', { current: cardIndex + 1, total: muscles.length })}
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.cardContent} showsVerticalScrollIndicator={false}>
          <FlashCard muscle={currentFlashcard} />

          <View style={styles.navRow}>
            <TouchableOpacity
              style={[styles.navBtn, cardIndex === 0 && styles.navBtnDisabled]}
              onPress={() => { if (cardIndex > 0) setCardIndex(cardIndex - 1); }}
              disabled={cardIndex === 0}
            >
              <Text style={[styles.navBtnText, cardIndex === 0 && styles.navBtnTextDisabled]}>
                {t('study.previous')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.navBtn, styles.navBtnPrimary]}
              onPress={() => setCardIndex((cardIndex + 1) % muscles.length)}
            >
              <Text style={styles.navBtnTextPrimary}>{t('study.next')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── QUIZ ──
  if (mode === 'quiz' && currentQuizMuscle && currentOptions) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={handleRestart} style={styles.backBtn}>
            <Text style={styles.backText}>← {t('study.mode')}</Text>
          </TouchableOpacity>
          <Text style={styles.counter}>
            {t('study.cardOf', { current: quizIndex + 1, total: QUIZ_COUNT })}
          </Text>
        </View>

        {/* Progress bar */}
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${((quizIndex + 1) / QUIZ_COUNT) * 100}%` }]} />
        </View>

        <ScrollView contentContainerStyle={styles.cardContent} showsVerticalScrollIndicator={false}>
          <QuizCard
            muscle={currentQuizMuscle}
            options={currentOptions}
            selectedId={selectedAnswer}
            onSelect={handleQuizSelect}
          />

          {selectedAnswer !== null && (
            <TouchableOpacity style={[styles.navBtn, styles.navBtnPrimary, styles.fullWidth]} onPress={handleQuizNext}>
              <Text style={styles.navBtnTextPrimary}>
                {quizIndex < QUIZ_COUNT - 1 ? t('study.next') : t('study.finish')}
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── RESULTS ──
  if (mode === 'results') {
    const message = scorePercent >= 80
      ? t('study.excellent')
      : scorePercent >= 50
        ? t('study.good')
        : t('study.needsPractice');

    return (
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <ScrollView contentContainerStyle={styles.resultsContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.resultsTitle}>{t('study.results')}</Text>

          <View style={styles.scoreCircle}>
            <Text style={styles.scoreNumber}>{scorePercent}%</Text>
            <Text style={styles.scoreLabel}>
              {t('study.questionsOf', { correct: score, total: quizTotal })}
            </Text>
          </View>

          <Text style={styles.resultsMessage}>{message}</Text>

          <View style={styles.resultsButtons}>
            <TouchableOpacity
              style={[styles.navBtn, styles.navBtnPrimary, styles.fullWidth]}
              onPress={() => { setScore(0); setQuizIndex(0); setSelectedAnswer(null); setMode('quiz'); }}
            >
              <Text style={styles.navBtnTextPrimary}>{t('study.restart')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.navBtn, styles.fullWidth]}
              onPress={handleRestart}
            >
              <Text style={styles.navBtnText}>{t('study.mode')}</Text>
            </TouchableOpacity>
          </View>

          <AuthorCredit />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── FAVORITES ──
  if (mode === 'favorites') {
    const favMuscleData = favMuscles.map((id) => getMuscleById(id)).filter(Boolean);
    const favMovementData = favMovements.map((id) => getMovementById(id)).filter(Boolean);
    const hasFavorites = favMuscleData.length > 0 || favMovementData.length > 0;

    return (
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={handleRestart} style={styles.backBtn}>
            <Text style={styles.backText}>← {t('study.mode')}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.cardContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.favTitle}>{t('favorites.title')}</Text>

          {!hasFavorites ? (
            <View style={styles.emptyFav}>
              <Text style={styles.emptyFavIcon}>❤️</Text>
              <Text style={styles.emptyFavText}>{t('favorites.noFavorites')}</Text>
              <Text style={styles.emptyFavHint}>{t('favorites.addHint')}</Text>
            </View>
          ) : (
            <>
              {favMuscleData.length > 0 && (
                <View style={styles.favSection}>
                  <Text style={styles.favSectionTitle}>
                    {t('screens.musculos.title')} ({favMuscleData.length})
                  </Text>
                  {favMuscleData.map((muscle) => {
                    if (!muscle) return null;
                    return (
                      <TouchableOpacity
                        key={muscle.id}
                        style={styles.favItem}
                        onPress={() => navigation.navigate('MuscleDetail', { muscleId: muscle.id })}
                      >
                        <Text style={styles.favItemName}>
                          {lang === 'es' ? muscle.name_es : muscle.name_en}
                        </Text>
                        <Text style={styles.favItemSub}>{muscle.name_latin}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {favMovementData.length > 0 && (
                <View style={styles.favSection}>
                  <Text style={styles.favSectionTitle}>
                    {t('screens.movimientos.title')} ({favMovementData.length})
                  </Text>
                  {favMovementData.map((mv) => {
                    if (!mv) return null;
                    return (
                      <TouchableOpacity
                        key={mv.id}
                        style={styles.favItem}
                        onPress={() => navigation.navigate('MovementDetail', { movementId: mv.id })}
                      >
                        <Text style={styles.favItemName}>
                          {lang === 'es' ? mv.name_es : mv.name_en}
                        </Text>
                        <Text style={styles.favItemSub}>{t(`levels.${mv.level}`)}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── BODY QUIZ ──
  if (mode === 'bodyQuiz') {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={handleRestart} style={styles.backBtn}>
            <Text style={styles.backText}>← {t('study.mode')}</Text>
          </TouchableOpacity>
          <Text style={styles.counter}>{t('study.bodyQuiz')}</Text>
        </View>

        <ScrollView contentContainerStyle={styles.cardContent} showsVerticalScrollIndicator={false}>
          <BodyQuiz
            onFinish={(finalScore, total) => {
              setScore(finalScore);
              setQuizTotal(total);
              setMode('results');
            }}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── SPACED REPETITION ──
  if (mode === 'spaced') {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={handleRestart} style={styles.backBtn}>
            <Text style={styles.backText}>← {t('study.mode')}</Text>
          </TouchableOpacity>
          <Text style={styles.counter}>
            {t('study.reviewed', { count: sr.totalReviewed })} • {t('study.dueCards', { count: sr.dueCount })}
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.cardContent} showsVerticalScrollIndicator={false}>
          {sr.isComplete ? (
            <View style={styles.completeContainer}>
              <Text style={styles.completeIcon}>✅</Text>
              <Text style={styles.completeTitle}>{t('study.sessionComplete')}</Text>
              <Text style={styles.completeDesc}>{t('study.sessionCompleteDesc')}</Text>
              <View style={styles.statsRow}>
                <View style={[styles.statBadge, { borderColor: colors.error }]}>
                  <Text style={[styles.statNum, { color: colors.error }]}>{sr.stats.again}</Text>
                  <Text style={styles.statLabel}>{t('study.rateAgain')}</Text>
                </View>
                <View style={[styles.statBadge, { borderColor: colors.safety.warning }]}>
                  <Text style={[styles.statNum, { color: colors.safety.warning }]}>{sr.stats.hard}</Text>
                  <Text style={styles.statLabel}>{t('study.rateHard')}</Text>
                </View>
                <View style={[styles.statBadge, { borderColor: colors.success }]}>
                  <Text style={[styles.statNum, { color: colors.success }]}>{sr.stats.good}</Text>
                  <Text style={styles.statLabel}>{t('study.rateGood')}</Text>
                </View>
                <View style={[styles.statBadge, { borderColor: colors.accent.primary }]}>
                  <Text style={[styles.statNum, { color: colors.accent.primary }]}>{sr.stats.easy}</Text>
                  <Text style={styles.statLabel}>{t('study.rateEasy')}</Text>
                </View>
              </View>
              <TouchableOpacity style={[styles.navBtn, styles.fullWidth]} onPress={handleRestart}>
                <Text style={styles.navBtnText}>{t('study.mode')}</Text>
              </TouchableOpacity>
            </View>
          ) : sr.currentCard ? (
            <SpacedFlashCard
              key={sr.currentCard.id}
              muscle={sr.currentCard}
              onRate={sr.rateCard}
            />
          ) : null}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  menuContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxxl,
    gap: spacing.lg,
    flexGrow: 1,
  },
  title: {
    ...typography.heading.h1,
    fontFamily: typography.heading.fontFamily,
    color: colors.accent.light,
  },
  subtitle: {
    ...typography.body.large,
    color: colors.text.secondary,
  },
  modeCards: {
    gap: spacing.lg,
    marginTop: spacing.md,
  },
  modeCard: {
    backgroundColor: colors.bg.secondary,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
  },
  modeIcon: {
    fontSize: 40,
  },
  modeTitle: {
    ...typography.heading.h2,
    fontFamily: typography.heading.fontFamily,
    color: colors.accent.light,
  },
  modeDesc: {
    ...typography.body.regular,
    color: colors.text.muted,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  backBtn: {
    minHeight: 44,
    justifyContent: 'center',
  },
  backText: {
    ...typography.body.regular,
    color: colors.accent.primary,
    fontWeight: '600',
  },
  counter: {
    ...typography.body.small,
    color: colors.text.muted,
  },
  progressBar: {
    height: 3,
    backgroundColor: colors.bg.secondary,
    marginHorizontal: spacing.xl,
    borderRadius: 2,
  },
  progressFill: {
    height: 3,
    backgroundColor: colors.accent.primary,
    borderRadius: 2,
  },
  cardContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
    gap: spacing.xl,
  },
  navRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  navBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  navBtnDisabled: {
    opacity: 0.3,
  },
  navBtnPrimary: {
    backgroundColor: colors.accent.primary,
    borderColor: colors.accent.primary,
  },
  navBtnText: {
    ...typography.body.regular,
    color: colors.text.muted,
    fontWeight: '600',
  },
  navBtnTextDisabled: {
    color: colors.text.muted,
  },
  navBtnTextPrimary: {
    ...typography.body.regular,
    color: colors.bg.primary,
    fontWeight: '700',
  },
  fullWidth: {
    flex: undefined,
    width: '100%',
  },
  resultsContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.xxxl,
    gap: spacing.xl,
    alignItems: 'center',
    flexGrow: 1,
  },
  resultsTitle: {
    ...typography.heading.h1,
    fontFamily: typography.heading.fontFamily,
    color: colors.accent.light,
  },
  scoreCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 4,
    borderColor: colors.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  scoreNumber: {
    ...typography.heading.h1,
    fontFamily: typography.heading.fontFamily,
    color: colors.accent.light,
    fontSize: 40,
  },
  scoreLabel: {
    ...typography.body.small,
    color: colors.text.muted,
  },
  resultsMessage: {
    ...typography.body.large,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 26,
  },
  resultsButtons: {
    width: '100%',
    gap: spacing.md,
  },
  favTitle: {
    ...typography.heading.h1,
    fontFamily: typography.heading.fontFamily,
    color: colors.accent.light,
  },
  emptyFav: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xxxl,
  },
  emptyFavIcon: {
    fontSize: 48,
  },
  emptyFavText: {
    ...typography.heading.h3,
    fontFamily: typography.heading.fontFamily,
    color: colors.text.secondary,
  },
  emptyFavHint: {
    ...typography.body.regular,
    color: colors.text.muted,
    textAlign: 'center',
  },
  favSection: {
    gap: spacing.sm,
  },
  favSectionTitle: {
    ...typography.label.regular,
    color: colors.accent.primary,
    fontSize: 12,
  },
  favItem: {
    backgroundColor: colors.bg.secondary,
    borderRadius: 10,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: 2,
    minHeight: 48,
    justifyContent: 'center',
  },
  favItemName: {
    ...typography.body.regular,
    color: colors.text.primary,
    fontWeight: '600',
  },
  favItemSub: {
    ...typography.body.small,
    color: colors.text.muted,
    fontStyle: 'italic',
  },
  completeContainer: {
    alignItems: 'center',
    gap: spacing.lg,
    paddingTop: spacing.xl,
  },
  completeIcon: {
    fontSize: 48,
  },
  completeTitle: {
    ...typography.heading.h2,
    fontFamily: typography.heading.fontFamily,
    color: colors.accent.light,
    textAlign: 'center',
  },
  completeDesc: {
    ...typography.body.regular,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    width: '100%',
  },
  statBadge: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 10,
    paddingVertical: spacing.md,
    alignItems: 'center',
    gap: 2,
    backgroundColor: colors.bg.secondary,
  },
  statNum: {
    ...typography.heading.h3,
    fontFamily: typography.heading.fontFamily,
  },
  statLabel: {
    ...typography.body.small,
    color: colors.text.muted,
    fontSize: 10,
  },
});
