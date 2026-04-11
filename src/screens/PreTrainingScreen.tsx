import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { movements, getMovementById } from '../data/movements';
import { getMuscleById } from '../data/muscles';
import { MuscleRole } from '../utils/types';
import { colors, typography, spacing } from '../theme';

const ROLE_COLORS: Record<MuscleRole, string> = {
  agonista: colors.muscle.agonista,
  sinergista: colors.muscle.sinergista,
  estabilizador: colors.muscle.estabilizador,
  antagonista: colors.muscle.antagonista,
};

/**
 * Pre-Training Mode: select movements you plan to practice,
 * and get a personalized warm-up based on the muscles involved.
 */
export function PreTrainingScreen() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as 'es' | 'en';
  const navigation = useNavigation<any>();
  const [selectedMvIds, setSelectedMvIds] = useState<Set<string>>(new Set());
  const [showWarmup, setShowWarmup] = useState(false);

  const toggleMovement = (id: string) => {
    setSelectedMvIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setShowWarmup(false);
  };

  // Aggregate muscles from selected movements
  const warmupData = useMemo(() => {
    const muscleMap = new Map<string, { maxIntensity: number; roles: Set<MuscleRole>; count: number }>();

    selectedMvIds.forEach((mvId) => {
      const mv = getMovementById(mvId);
      if (!mv) return;
      mv.muscles.forEach((mm) => {
        const existing = muscleMap.get(mm.muscle_id);
        if (existing) {
          existing.maxIntensity = Math.max(existing.maxIntensity, mm.intensity);
          existing.roles.add(mm.role);
          existing.count++;
        } else {
          muscleMap.set(mm.muscle_id, {
            maxIntensity: mm.intensity,
            roles: new Set([mm.role]),
            count: 1,
          });
        }
      });
    });

    // Sort by frequency * intensity (most used muscles first)
    const sorted = Array.from(muscleMap.entries())
      .map(([muscleId, data]) => ({
        muscleId,
        ...data,
        priority: data.count * data.maxIntensity,
      }))
      .sort((a, b) => b.priority - a.priority);

    // Top muscles that need warm-up
    const warmupMuscles = sorted.filter((m) => m.maxIntensity >= 3).slice(0, 8);
    const stretchMuscles = sorted.filter((m) => m.roles.has('antagonista') || m.maxIntensity <= 2).slice(0, 4);

    return { warmupMuscles, stretchMuscles, totalMuscles: sorted.length };
  }, [selectedMvIds]);

  // Available movements grouped by level
  const fundamentals = movements.filter((m) => m.level === 'fundamentals');
  const basico = movements.filter((m) => m.level === 'basico');
  const intermedio = movements.filter((m) => m.level === 'intermedio');
  const avanzado = movements.filter((m) => m.level === 'avanzado');

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.accent.primary} />
        </TouchableOpacity>
        <Text style={styles.counter}>
          {t('preTraining.selected', { count: selectedMvIds.size })}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {!showWarmup ? (
          <>
            <Text style={styles.title}>{t('preTraining.title')}</Text>
            <Text style={styles.desc}>{t('preTraining.selectDesc')}</Text>

            {[
              { label: t('levels.fundamentals'), items: fundamentals },
              { label: t('levels.basico'), items: basico },
              { label: t('levels.intermedio'), items: intermedio },
              { label: t('levels.avanzado'), items: avanzado },
            ].map(({ label, items }) => items.length > 0 ? (
              <View key={label} style={styles.levelSection}>
                <Text style={styles.levelLabel}>{label} ({items.length})</Text>
                <View style={styles.movementGrid}>
                  {items.map((mv) => {
                    const isSelected = selectedMvIds.has(mv.id);
                    return (
                      <TouchableOpacity
                        key={mv.id}
                        style={[styles.movementChip, isSelected && styles.movementChipSelected]}
                        onPress={() => toggleMovement(mv.id)}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.movementChipText, isSelected && styles.movementChipTextSelected]}>
                          {lang === 'es' ? mv.name_es : mv.name_en}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ) : null)}

            {selectedMvIds.size > 0 && (
              <TouchableOpacity
                style={styles.generateBtn}
                onPress={() => setShowWarmup(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.generateBtnText}>{t('preTraining.generate')}</Text>
              </TouchableOpacity>
            )}
          </>
        ) : (
          <>
            <Text style={styles.title}>{t('preTraining.warmupTitle')}</Text>
            <Text style={styles.desc}>
              {t('preTraining.warmupDesc', { count: warmupData.totalMuscles })}
            </Text>

            {/* Warm-up targets */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('preTraining.activateFirst')}</Text>
              {warmupData.warmupMuscles.map((wm) => {
                const muscle = getMuscleById(wm.muscleId);
                if (!muscle) return null;
                const cues = lang === 'es' ? muscle.activation_cues_es : muscle.activation_cues_en;
                return (
                  <View key={wm.muscleId} style={styles.warmupItem}>
                    <View style={styles.warmupHeader}>
                      <Text style={styles.warmupName}>
                        {lang === 'es' ? muscle.name_es : muscle.name_en}
                      </Text>
                      <Text style={styles.warmupIntensity}>
                        {'●'.repeat(wm.maxIntensity)}{'○'.repeat(5 - wm.maxIntensity)}
                      </Text>
                    </View>
                    {cues.length > 0 && (
                      <Text style={styles.warmupCue}>💡 {cues[0]}</Text>
                    )}
                  </View>
                );
              })}
            </View>

            {warmupData.stretchMuscles.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t('preTraining.stretchAfter')}</Text>
                {warmupData.stretchMuscles.map((sm) => {
                  const muscle = getMuscleById(sm.muscleId);
                  if (!muscle) return null;
                  return (
                    <View key={sm.muscleId} style={styles.stretchItem}>
                      <Text style={styles.stretchName}>
                        {lang === 'es' ? muscle.name_es : muscle.name_en}
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}

            <TouchableOpacity
              style={styles.backToSelectBtn}
              onPress={() => setShowWarmup(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.backToSelectText}>{t('preTraining.changeSelection')}</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  backBtn: {
    minHeight: 44,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counter: {
    ...typography.body.small,
    color: colors.text.muted,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
    gap: spacing.lg,
  },
  title: {
    ...typography.heading.h1,
    fontFamily: typography.heading.fontFamily,
    color: colors.accent.light,
  },
  desc: {
    ...typography.body.regular,
    color: colors.text.secondary,
  },
  levelSection: {
    gap: spacing.sm,
  },
  levelLabel: {
    ...typography.label.regular,
    color: colors.accent.primary,
    fontSize: 12,
  },
  movementGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  movementChip: {
    backgroundColor: colors.bg.secondary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 36,
    justifyContent: 'center',
  },
  movementChipSelected: {
    borderColor: colors.accent.primary,
    backgroundColor: `${colors.accent.primary}15`,
  },
  movementChipText: {
    ...typography.body.small,
    color: colors.text.muted,
  },
  movementChipTextSelected: {
    color: colors.accent.primary,
    fontWeight: '600',
  },
  generateBtn: {
    backgroundColor: colors.accent.primary,
    borderRadius: 12,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
  },
  generateBtnText: {
    ...typography.body.regular,
    color: colors.bg.primary,
    fontWeight: '700',
    fontSize: 16,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.label.regular,
    color: colors.accent.primary,
    fontSize: 12,
  },
  warmupItem: {
    backgroundColor: colors.bg.secondary,
    borderRadius: 10,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  warmupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  warmupName: {
    ...typography.body.regular,
    color: colors.text.primary,
    fontWeight: '600',
  },
  warmupIntensity: {
    fontSize: 8,
    color: colors.accent.primary,
    letterSpacing: 1,
  },
  warmupCue: {
    ...typography.body.small,
    color: colors.text.muted,
    fontStyle: 'italic',
  },
  stretchItem: {
    backgroundColor: colors.bg.secondary,
    borderRadius: 8,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 40,
    justifyContent: 'center',
  },
  stretchName: {
    ...typography.body.regular,
    color: colors.text.secondary,
  },
  backToSelectBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  backToSelectText: {
    ...typography.body.regular,
    color: colors.text.muted,
    fontWeight: '600',
  },
});
