import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { ZonePrevention, PreventionExercise } from '../../data/injuryPrevention';
import { REGION_LABELS } from '../../data/muscles';
import { colors, typography, spacing } from '../../theme';

interface InjuryPreventionProps {
  prevention: ZonePrevention;
}

const TYPE_CONFIG = {
  warmup: { icon: 'fire' as const, color: colors.exercise.warmup },
  strengthening: { icon: 'dumbbell' as const, color: colors.exercise.strengthening },
  stretch: { icon: 'yoga' as const, color: colors.exercise.stretch },
};

export function InjuryPrevention({ prevention }: InjuryPreventionProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as 'es' | 'en';
  const [expanded, setExpanded] = useState(false);

  const regionLabel = REGION_LABELS[prevention.region][lang];
  const frequency = lang === 'es' ? prevention.frequency_es : prevention.frequency_en;

  const grouped = {
    warmup: prevention.exercises.filter((e) => e.type === 'warmup'),
    strengthening: prevention.exercises.filter((e) => e.type === 'strengthening'),
    stretch: prevention.exercises.filter((e) => e.type === 'stretch'),
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <MaterialCommunityIcons name="shield-check" size={18} color={colors.success} />
          <Text style={styles.headerTitle}>{t('injuries.prevention')}</Text>
        </View>
        <MaterialCommunityIcons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={colors.text.muted}
        />
      </TouchableOpacity>

      {expanded && (
        <View style={styles.body}>
          <Text style={styles.zoneLabel}>
            {t('injuries.exercisesForZone', { zone: regionLabel })}
          </Text>

          {(Object.keys(grouped) as Array<keyof typeof grouped>).map((type) => {
            const exercises = grouped[type];
            if (exercises.length === 0) return null;
            const config = TYPE_CONFIG[type];
            return (
              <View key={type} style={styles.typeSection}>
                <View style={styles.typeHeader}>
                  <MaterialCommunityIcons name={config.icon} size={16} color={config.color} />
                  <Text style={[styles.typeLabel, { color: config.color }]}>
                    {t(`injuries.${type}`)}
                  </Text>
                </View>
                {exercises.map((ex) => (
                  <ExerciseCard key={ex.id} exercise={ex} lang={lang} />
                ))}
              </View>
            );
          })}

          <View style={styles.frequencyBox}>
            <MaterialCommunityIcons name="calendar-clock" size={14} color={colors.accent.primary} />
            <Text style={styles.frequencyText}>
              {t('injuries.frequency')}: {frequency}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

function ExerciseCard({ exercise, lang }: { exercise: PreventionExercise; lang: 'es' | 'en' }) {
  const name = lang === 'es' ? exercise.name_es : exercise.name_en;
  const desc = lang === 'es' ? exercise.description_es : exercise.description_en;
  const detail = exercise.sets
    ? `${exercise.sets} x ${exercise.reps || exercise.hold}`
    : exercise.hold || '';

  return (
    <View style={styles.exerciseCard}>
      <Text style={styles.exerciseName}>{name}</Text>
      <Text style={styles.exerciseDesc}>{desc}</Text>
      {detail ? <Text style={styles.exerciseDetail}>{detail}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bg.secondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    minHeight: 48,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerTitle: {
    ...typography.body.regular,
    color: colors.success,
    fontWeight: '700',
  },
  body: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  zoneLabel: {
    ...typography.body.small,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  typeSection: {
    gap: spacing.sm,
  },
  typeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  typeLabel: {
    ...typography.label.regular,
    fontSize: 11,
    fontWeight: '700',
  },
  exerciseCard: {
    backgroundColor: colors.bg.primary,
    borderRadius: 8,
    padding: spacing.md,
    gap: spacing.xs,
    marginLeft: spacing.xl,
  },
  exerciseName: {
    ...typography.body.small,
    color: colors.accent.light,
    fontWeight: '600',
  },
  exerciseDesc: {
    ...typography.body.small,
    color: colors.text.muted,
    lineHeight: 18,
  },
  exerciseDetail: {
    ...typography.body.small,
    color: colors.accent.primary,
    fontWeight: '600',
    fontSize: 10,
  },
  frequencyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: `${colors.accent.primary}10`,
    borderRadius: 8,
    padding: spacing.md,
  },
  frequencyText: {
    ...typography.body.small,
    color: colors.accent.primary,
    fontSize: 11,
  },
});
