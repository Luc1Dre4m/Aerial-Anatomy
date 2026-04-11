import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/useAppStore';
import { disciplines } from '../data/disciplines';
import { MovementLevel } from '../utils/types';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { AuthorCredit } from '../components/ui/AuthorCredit';
import { colors, typography, spacing } from '../theme';

const LEVELS: MovementLevel[] = ['fundamentals', 'basico', 'intermedio', 'avanzado', 'elite'];
const TOTAL_STEPS = 3;

export function OnboardingScreen() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as 'es' | 'en';
  const { setLanguage, setUserDisciplines, setUserLevel, completeOnboarding } = useAppStore();

  const [step, setStep] = useState(0);
  const [selectedLang, setSelectedLang] = useState<'es' | 'en'>(lang);
  const [selectedDisciplines, setSelectedDisciplines] = useState<string[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<MovementLevel>('basico');

  const handleLangSelect = (l: 'es' | 'en') => {
    setSelectedLang(l);
    setLanguage(l);
  };

  const toggleDiscipline = (id: string) => {
    setSelectedDisciplines((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id],
    );
  };

  const handleNext = () => {
    if (step < TOTAL_STEPS - 1) {
      setStep(step + 1);
    } else {
      setUserDisciplines(selectedDisciplines);
      setUserLevel(selectedLevel);
      completeOnboarding();
    }
  };

  const handleSkip = () => {
    completeOnboarding();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Progress */}
        <View style={styles.progressRow}>
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <View
              key={i}
              style={[styles.progressDot, i <= step && styles.progressDotActive]}
            />
          ))}
        </View>
        <Text style={styles.stepText}>
          {t('onboarding.step', { current: step + 1, total: TOTAL_STEPS })}
        </Text>

        {/* Step 0: Language */}
        {step === 0 && (
          <View style={styles.stepContent}>
            <Text style={styles.heading}>{t('onboarding.welcome')}</Text>
            <Text style={styles.desc}>{t('onboarding.welcomeDesc')}</Text>
            <Text style={styles.label}>{t('onboarding.chooseLanguage')}</Text>
            <View style={styles.optionsRow}>
              <TouchableOpacity
                style={[styles.langBtn, selectedLang === 'es' && styles.langBtnActive]}
                onPress={() => handleLangSelect('es')}
              >
                <Text style={styles.langFlag}>🇪🇸</Text>
                <Text style={[styles.langText, selectedLang === 'es' && styles.langTextActive]}>
                  Español
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.langBtn, selectedLang === 'en' && styles.langBtnActive]}
                onPress={() => handleLangSelect('en')}
              >
                <Text style={styles.langFlag}>🇬🇧</Text>
                <Text style={[styles.langText, selectedLang === 'en' && styles.langTextActive]}>
                  English
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Step 1: Disciplines */}
        {step === 1 && (
          <View style={styles.stepContent}>
            <Text style={styles.heading}>{t('onboarding.chooseDiscipline')}</Text>
            <Text style={styles.desc}>{t('onboarding.chooseDisciplineDesc')}</Text>
            <View style={styles.grid}>
              {disciplines.map((disc) => {
                const isSelected = selectedDisciplines.includes(disc.id);
                return (
                  <TouchableOpacity
                    key={disc.id}
                    style={[
                      styles.disciplineCard,
                      isSelected && { borderColor: disc.color, backgroundColor: `${disc.color}15` },
                    ]}
                    onPress={() => toggleDiscipline(disc.id)}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons
                      name={disc.icon as any}
                      size={28}
                      color={isSelected ? disc.color : colors.text.muted}
                    />
                    <Text style={[styles.disciplineName, isSelected && { color: disc.color }]}>
                      {lang === 'es' ? disc.name_es : disc.name_en}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Step 2: Level */}
        {step === 2 && (
          <View style={styles.stepContent}>
            <Text style={styles.heading}>{t('onboarding.chooseLevel')}</Text>
            <Text style={styles.desc}>{t('onboarding.chooseLevelDesc')}</Text>
            <View style={styles.levelList}>
              {LEVELS.map((level) => {
                const isSelected = selectedLevel === level;
                return (
                  <TouchableOpacity
                    key={level}
                    style={[styles.levelBtn, isSelected && styles.levelBtnActive]}
                    onPress={() => setSelectedLevel(level)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.levelText, isSelected && styles.levelTextActive]}>
                      {t(`levels.${level}`)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.primaryBtn} onPress={handleNext} activeOpacity={0.7}>
            <Text style={styles.primaryBtnText}>
              {step < TOTAL_STEPS - 1 ? t('onboarding.continue') : t('onboarding.start')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
            <Text style={styles.skipBtnText}>{t('onboarding.skip')}</Text>
          </TouchableOpacity>
        </View>

        <AuthorCredit />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxl,
    gap: spacing.lg,
    flexGrow: 1,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.bg.tertiary,
  },
  progressDotActive: {
    backgroundColor: colors.accent.primary,
    width: 24,
  },
  stepText: {
    ...typography.body.small,
    color: colors.text.muted,
    textAlign: 'center',
  },
  stepContent: {
    gap: spacing.lg,
    flex: 1,
  },
  heading: {
    ...typography.heading.h1,
    fontFamily: typography.heading.fontFamily,
    color: colors.accent.light,
    textAlign: 'center',
  },
  desc: {
    ...typography.body.large,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 26,
  },
  label: {
    ...typography.label.regular,
    color: colors.accent.primary,
    fontSize: 12,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    justifyContent: 'center',
  },
  langBtn: {
    flex: 1,
    maxWidth: 140,
    backgroundColor: colors.bg.secondary,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.border,
    paddingVertical: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
  },
  langBtnActive: {
    borderColor: colors.accent.primary,
    backgroundColor: `${colors.accent.primary}10`,
  },
  langFlag: {
    fontSize: 32,
  },
  langText: {
    ...typography.body.regular,
    color: colors.text.muted,
    fontWeight: '600',
  },
  langTextActive: {
    color: colors.accent.primary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'center',
  },
  disciplineCard: {
    width: '45%',
    backgroundColor: colors.bg.secondary,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
  },
  disciplineName: {
    ...typography.body.regular,
    color: colors.text.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
  levelList: {
    gap: spacing.sm,
  },
  levelBtn: {
    backgroundColor: colors.bg.secondary,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  levelBtnActive: {
    borderColor: colors.accent.primary,
    backgroundColor: `${colors.accent.primary}10`,
  },
  levelText: {
    ...typography.body.regular,
    color: colors.text.muted,
    fontWeight: '600',
  },
  levelTextActive: {
    color: colors.accent.primary,
    fontWeight: '700',
  },
  actions: {
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  primaryBtn: {
    backgroundColor: colors.accent.primary,
    borderRadius: 12,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
  },
  primaryBtnText: {
    ...typography.body.regular,
    color: colors.bg.primary,
    fontWeight: '700',
    fontSize: 16,
  },
  skipBtn: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    minHeight: 44,
    justifyContent: 'center',
  },
  skipBtnText: {
    ...typography.body.regular,
    color: colors.text.muted,
  },
});
