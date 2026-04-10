import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { DetectedMuscle } from '../../services/poseDetection';
import { getMuscleById } from '../../data/muscles';
import { colors, typography, spacing } from '../../theme';

interface DetectedMusclesListProps {
  muscles: DetectedMuscle[];
  onMusclePress?: (muscleId: string) => void;
}

export const DetectedMusclesList = React.memo(function DetectedMusclesList({
  muscles,
  onMusclePress,
}: DetectedMusclesListProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as 'es' | 'en';

  if (muscles.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{t('pose.noPersonDetected')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('pose.activeMuscles')}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {muscles.map((dm) => {
          const muscle = getMuscleById(dm.muscle_id);
          if (!muscle) return null;

          const name = lang === 'es' ? muscle.name_es : muscle.name_en;
          const confidence = Math.round(dm.confidence * 100);

          return (
            <TouchableOpacity
              key={dm.muscle_id}
              style={styles.chip}
              onPress={() => onMusclePress?.(dm.muscle_id)}
              activeOpacity={0.7}
            >
              <Text style={styles.chipName} numberOfLines={1}>{name}</Text>
              <View style={styles.confidenceBar}>
                <View
                  style={[
                    styles.confidenceFill,
                    { width: `${confidence}%` },
                  ]}
                />
              </View>
              <Text style={styles.chipConfidence}>{confidence}%</Text>
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
  title: {
    ...typography.body.small,
    color: colors.accent.primary,
    fontWeight: '700',
    paddingHorizontal: spacing.lg,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  chip: {
    backgroundColor: colors.bg.secondary,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: 4,
    minWidth: 100,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipName: {
    ...typography.body.small,
    color: colors.text.primary,
    fontWeight: '600',
    fontSize: 12,
  },
  confidenceBar: {
    height: 3,
    backgroundColor: colors.bg.tertiary,
    borderRadius: 2,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    backgroundColor: colors.accent.primary,
    borderRadius: 2,
  },
  chipConfidence: {
    fontSize: 10,
    color: colors.text.muted,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.body.regular,
    color: colors.text.muted,
  },
});
