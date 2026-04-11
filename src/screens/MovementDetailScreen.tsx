import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useRoute, useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { getMovementById } from '../data/movements';
import { getMuscleById } from '../data/muscles';
import { getDisciplineById } from '../data/disciplines';
import { AuthorCredit } from '../components/ui/AuthorCredit';
import { SafetyNote } from '../components/ui/SafetyNote';
import { MuscleTag } from '../components/ui/MuscleTag';
import { LevelBadge } from '../components/ui/LevelBadge';
import { ActivationSequence } from '../components/movements/ActivationSequence';
import { RiskEvaluator } from '../components/movements/RiskEvaluator';
import { StickFigure } from '../components/movements/StickFigure';
import { InstructorNotes } from '../components/movements/InstructorNotes';
import { ProgressionTree } from '../components/movements/ProgressionTree';
import { MovementExecution } from '../components/movements/MovementExecution';
import { getSpottingForMovement } from '../data/spottingGuide';
import { MuscleRole } from '../utils/types';
import { useAppStore } from '../store/useAppStore';
import { GradientDivider } from '../components/ui/GradientDivider';
import { AnimatedTitle } from '../components/ui/AnimatedTitle';
import { NotFoundView } from '../components/ui/NotFoundView';
import { colors, typography, spacing } from '../theme';

const ROLE_COLORS: Record<MuscleRole, string> = {
  agonista: colors.muscle.agonista,
  sinergista: colors.muscle.sinergista,
  estabilizador: colors.muscle.estabilizador,
  antagonista: colors.muscle.antagonista,
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: spacing.sm }}>
      <Text style={{ ...typography.label.regular, color: colors.accent.primary, fontSize: 12 }}>
        {title}
      </Text>
      {children}
    </View>
  );
}

export function MovementDetailScreen() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as 'es' | 'en';
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const movement = getMovementById(route.params?.movementId);
  const isFavorite = useAppStore((s) => s.favoriteMovements.includes(route.params?.movementId ?? ''));
  const toggleFavorite = useAppStore((s) => s.toggleFavoriteMovement);

  if (!movement) return <NotFoundView />;

  const name = lang === 'es' ? movement.name_es : movement.name_en;
  const description = lang === 'es' ? movement.description_es : movement.description_en;
  const safetyNote = lang === 'es' ? movement.safety_note_es : movement.safety_note_en;

  const musclesByRole = {
    agonista: movement.muscles.filter((m) => m.role === 'agonista'),
    sinergista: movement.muscles.filter((m) => m.role === 'sinergista'),
    estabilizador: movement.muscles.filter((m) => m.role === 'estabilizador'),
    antagonista: movement.muscles.filter((m) => m.role === 'antagonista'),
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} accessibilityRole="button" accessibilityLabel={t('common.goBack')}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.accent.primary} />
        </TouchableOpacity>
        <View style={styles.topBarRight}>
          <LevelBadge level={movement.level} />
          <TouchableOpacity onPress={() => toggleFavorite(movement.id)} style={styles.favBtn} accessibilityRole="button" accessibilityLabel={t('common.toggleFavorite')}>
            <MaterialCommunityIcons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={22}
              color={isFavorite ? colors.muscle.agonista : colors.text.muted}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <StickFigure movementId={movement.id} size={80} />
        <AnimatedTitle text={name} style={styles.name} />

        {/* Disciplines */}
        <View style={styles.discRow}>
          {movement.disciplines.map((dId) => {
            const disc = getDisciplineById(dId);
            if (!disc) return null;
            return (
              <View key={dId} style={[styles.discChip, { backgroundColor: disc.color }]}>
                <Text style={styles.discChipText}>
                  {lang === 'es' ? disc.name_es : disc.name_en}
                </Text>
              </View>
            );
          })}
          <View style={styles.categoryChip}>
            <Text style={styles.categoryText}>{t(`categories.${movement.category}`)}</Text>
          </View>
        </View>

        {/* SAFETY NOTE — Prominente, NUNCA secundaria */}
        <SafetyNote type={movement.safety_icon} text={safetyNote} />

        {/* Risk Assessment */}
        <RiskEvaluator movement={movement} />

        <Text style={styles.description}>{description}</Text>

        {/* Execution Phases — Step by step visualization */}
        {movement.execution_phases && movement.execution_phases.length > 0 && (
          <>
            <GradientDivider />
            <MovementExecution
              phases={movement.execution_phases}
              movementId={movement.id}
              onMusclePress={(muscleId) => navigation.navigate('MuscleDetail', { muscleId })}
            />
          </>
        )}

        <GradientDivider />

        {/* Muscles by Role */}
        <Section title={t('movements.musclesInvolved')}>
          {(Object.keys(musclesByRole) as MuscleRole[]).map((role) => {
            const roleMuscles = musclesByRole[role];
            if (roleMuscles.length === 0) return null;
            return (
              <View key={role} style={styles.roleSection}>
                <View style={styles.roleHeader}>
                  <View style={[styles.roleDot, { backgroundColor: ROLE_COLORS[role] }]} />
                  <Text style={[styles.roleLabel, { color: ROLE_COLORS[role] }]}>
                    {t(`roles.${role}`)} ({roleMuscles.length})
                  </Text>
                </View>
                <View style={styles.tagsRow}>
                  {roleMuscles.map((mm) => {
                    const muscle = getMuscleById(mm.muscle_id);
                    if (!muscle) return null;
                    const muscleName = lang === 'es' ? muscle.name_es : muscle.name_en;
                    return (
                      <MuscleTag
                        key={mm.muscle_id}
                        name={muscleName}
                        role={mm.role}
                        onPress={() => navigation.navigate('MuscleDetail', { muscleId: mm.muscle_id })}
                      />
                    );
                  })}
                </View>
              </View>
            );
          })}
        </Section>

        <GradientDivider />

        {/* Activation Sequence — Animated */}
        <Section title={t('movements.activationSequence')}>
          <ActivationSequence
            muscles={movement.muscles}
            onMusclePress={(muscleId) => navigation.navigate('MuscleDetail', { muscleId })}
          />
        </Section>

        {/* Prerequisites */}
        {movement.prerequisite_movements.length > 0 && (
          <>
            <GradientDivider />
            <Section title={t('movements.prerequisites')}>
              {movement.prerequisite_movements.map((preId) => {
                const pre = getMovementById(preId);
                if (!pre) return null;
                return (
                  <TouchableOpacity
                    key={preId}
                    style={styles.prereqItem}
                    onPress={() => navigation.push('MovementDetail', { movementId: preId })}
                  >
                    <Text style={styles.prereqName}>
                      {lang === 'es' ? pre.name_es : pre.name_en}
                    </Text>
                    <MaterialCommunityIcons name="chevron-right" size={18} color={colors.text.muted} />
                  </TouchableOpacity>
                );
              })}
            </Section>
          </>
        )}

        {/* Variations */}
        {movement.variations.length > 0 && (
          <>
            <GradientDivider />
            <Section title={t('movements.variations')}>
              {movement.variations.map((v, i) => (
                <View key={`var-${i}-${v.name_en}`} style={styles.variationItem}>
                  <Text style={styles.variationName}>
                    {lang === 'es' ? v.name_es : v.name_en}
                  </Text>
                  <Text style={styles.variationDiff}>
                    {lang === 'es' ? v.difference_es : v.difference_en}
                  </Text>
                </View>
              ))}
            </Section>
          </>
        )}

        {/* Progression Tree */}
        <ProgressionTree
          movementId={movement.id}
          onMovementPress={(id) => navigation.push('MovementDetail', { movementId: id })}
        />

        <GradientDivider />

        {/* Spotting Guide (instructor only) */}
        {(() => {
          const spotting = getSpottingForMovement(movement.id);
          const subscription = useAppStore.getState().subscription;
          if (!spotting || subscription === 'free') return null;
          return (
            <>
              <GradientDivider />
              <Section title={t('spotting.title')}>
                <View style={{ backgroundColor: colors.bg.secondary, borderRadius: 12, borderWidth: 1, borderColor: colors.glass.border, padding: spacing.lg, gap: spacing.md }}>
                  <Text style={{ ...typography.body.regular, color: colors.text.primary, lineHeight: 22 }}>
                    {lang === 'es' ? spotting.technique_es : spotting.technique_en}
                  </Text>
                  <View style={{ gap: spacing.xs }}>
                    <Text style={{ ...typography.body.small, color: colors.accent.primary, fontWeight: '700' }}>
                      {t('spotting.spotterPosition')}
                    </Text>
                    <Text style={{ ...typography.body.small, color: colors.text.secondary }}>
                      {lang === 'es' ? spotting.spotter_position_es : spotting.spotter_position_en}
                    </Text>
                  </View>
                  <View style={{ gap: spacing.xs }}>
                    <Text style={{ ...typography.body.small, color: colors.accent.primary, fontWeight: '700' }}>
                      {t('spotting.handPlacement')}
                    </Text>
                    <Text style={{ ...typography.body.small, color: colors.text.secondary }}>
                      {lang === 'es' ? spotting.hand_placement_es : spotting.hand_placement_en}
                    </Text>
                  </View>
                  <View style={{ gap: spacing.xs }}>
                    <Text style={{ ...typography.body.small, color: colors.safety.warning, fontWeight: '700' }}>
                      {t('spotting.precautions')}
                    </Text>
                    {(lang === 'es' ? spotting.risks_es : spotting.risks_en).map((risk, i) => (
                      <View key={`risk-${i}`} style={{ flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' }}>
                        <MaterialCommunityIcons name="alert-circle-outline" size={14} color={colors.safety.warning} style={{ marginTop: 2 }} />
                        <Text style={{ ...typography.body.small, color: colors.text.secondary, flex: 1 }}>{risk}</Text>
                      </View>
                    ))}
                  </View>
                  <View style={{ gap: spacing.xs }}>
                    <Text style={{ ...typography.body.small, color: colors.accent.muted, fontWeight: '700' }}>
                      {t('spotting.verbalCues')}
                    </Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs }}>
                      {(lang === 'es' ? spotting.verbal_cues_es : spotting.verbal_cues_en).map((cue, i) => (
                        <View key={`cue-${i}`} style={{ backgroundColor: colors.bg.tertiary, borderRadius: 8, paddingHorizontal: spacing.sm, paddingVertical: 4 }}>
                          <Text style={{ ...typography.body.small, color: colors.text.primary, fontSize: 11 }}>"{cue}"</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              </Section>
            </>
          );
        })()}

        {/* Instructor Notes */}
        <InstructorNotes movementId={movement.id} />

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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  backBtn: {
    minHeight: 44,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  favBtn: {
    minHeight: 44,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
    gap: spacing.lg,
  },
  name: {
    ...typography.heading.h1,
    fontFamily: typography.heading.fontFamily,
    color: colors.accent.light,
  },
  discRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  discChip: {
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  discChipText: {
    ...typography.body.small,
    color: colors.bg.primary,
    fontWeight: '700',
  },
  categoryChip: {
    borderWidth: 1,
    borderColor: colors.glass.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  categoryText: {
    ...typography.body.small,
    color: colors.text.muted,
  },
  description: {
    ...typography.body.large,
    color: colors.text.primary,
    lineHeight: 26,
  },
  roleSection: {
    gap: spacing.sm,
  },
  roleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  roleDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  roleLabel: {
    ...typography.body.regular,
    fontWeight: '700',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingLeft: spacing.xl,
  },
  prereqItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.bg.secondary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.glass.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 44,
  },
  prereqName: {
    ...typography.body.regular,
    color: colors.text.primary,
  },
  variationItem: {
    backgroundColor: colors.bg.secondary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.glass.border,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  variationName: {
    ...typography.body.regular,
    color: colors.accent.light,
    fontWeight: '600',
  },
  variationDiff: {
    ...typography.body.small,
    color: colors.text.secondary,
  },
});
