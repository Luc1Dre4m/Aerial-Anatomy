import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { getMuscleById } from '../../data/muscles';
import { colors, typography, spacing } from '../../theme';

interface ActiveMuscle {
  muscle_id: string;
  intensity: number;
}

interface ActiveMusclesListProps {
  muscles: ActiveMuscle[];
  onMusclePress?: (muscleId: string) => void;
}

export const ActiveMusclesList = React.memo(function ActiveMusclesList({
  muscles,
  onMusclePress,
}: ActiveMusclesListProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as 'es' | 'en';

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{t('execution.activeMuscles')}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
        {muscles.map((am) => {
          const muscle = getMuscleById(am.muscle_id);
          if (!muscle) return null;
          const name = lang === 'es' ? muscle.name_es : muscle.name_en;
          return (
            <TouchableOpacity
              key={am.muscle_id}
              style={styles.chip}
              onPress={() => onMusclePress?.(am.muscle_id)}
            >
              <View style={styles.intensityBar}>
                {[1, 2, 3, 4, 5].map((level) => (
                  <View
                    key={level}
                    style={[
                      styles.intensityDot,
                      level <= am.intensity && styles.intensityDotActive,
                    ]}
                  />
                ))}
              </View>
              <Text style={styles.chipText} numberOfLines={1}>{name}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  label: {
    ...typography.body.small,
    color: colors.text.muted,
    fontWeight: '600',
  },
  scroll: {
    flexGrow: 0,
  },
  chip: {
    backgroundColor: colors.bg.tertiary,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginRight: spacing.sm,
    gap: 2,
    minHeight: 40,
    justifyContent: 'center',
  },
  intensityBar: {
    flexDirection: 'row',
    gap: 2,
  },
  intensityDot: {
    width: 6,
    height: 3,
    borderRadius: 1,
    backgroundColor: colors.bg.surface,
  },
  intensityDotActive: {
    backgroundColor: colors.accent.primary,
  },
  chipText: {
    ...typography.body.small,
    color: colors.text.primary,
    fontSize: 11,
  },
});
