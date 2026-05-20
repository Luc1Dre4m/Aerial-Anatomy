import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { muscles } from '../../data/muscles';
import { colors, spacing, typography } from '../../theme';

interface MuscleInfoCardProps {
  muscleId: string;
  onClose: () => void;
  onViewDetail: (muscleId: string) => void;
}

// Memoized so re-renders of CuerpoScreen (driven by other state changes) don't
// cause the card's expensive layout pass to re-run when the muscleId hasn't
// actually changed. Without this, every parent re-render rebuilds the
// ScrollView + 5+ Text nodes, contributing to perceptible "pick lag".
export const MuscleInfoCard = React.memo(function MuscleInfoCardImpl({
  muscleId,
  onClose,
  onViewDetail,
}: MuscleInfoCardProps) {
  const muscle = muscles.find((m) => m.id === muscleId);
  if (!muscle) return null;

  return (
    <View style={styles.card}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.name}>{muscle.name_es}</Text>
        <Text style={styles.latin}>{muscle.name_latin}</Text>

        <Text style={styles.sectionLabel}>Función</Text>
        <Text style={styles.body}>{muscle.primary_function_es}</Text>

        <Text style={styles.sectionLabel}>Descripción</Text>
        <Text style={styles.body}>{muscle.description_es}</Text>

        <Text style={styles.sectionLabel}>Origen → Inserción</Text>
        <Text style={styles.body}>
          {muscle.origin_es}
          {'\n→ '}
          {muscle.insertion_es}
        </Text>

        {muscle.innervation && (
          <>
            <Text style={styles.sectionLabel}>Inervación</Text>
            <Text style={styles.body}>{muscle.innervation}</Text>
          </>
        )}
      </ScrollView>

      <View style={styles.actions}>
        <Pressable
          style={styles.dismissButton}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Cerrar panel"
        >
          <Text style={styles.dismissButtonText}>Cerrar</Text>
        </Pressable>
        <Pressable
          style={styles.detailButton}
          onPress={() => onViewDetail(muscle.id)}
          accessibilityRole="button"
          accessibilityLabel={`Ver detalle completo de ${muscle.name_es}`}
        >
          <Text style={styles.detailButtonText}>Ver detalle →</Text>
        </Pressable>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    // No outer margin: the parent slot in CuerpoScreen provides horizontal
    // padding. Adding margin here would compound and shrink the card.
    backgroundColor: colors.bg.secondary,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(212, 168, 67, 0.25)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flex: 1,
  },
  scroll: {
    flexShrink: 1,
  },
  name: {
    ...typography.heading.h3,
    fontFamily: typography.heading.fontFamily,
    color: colors.accent.light,
  },
  latin: {
    ...typography.body.small,
    fontStyle: 'italic',
    color: colors.text.muted,
    marginBottom: spacing.sm,
  },
  sectionLabel: {
    ...typography.body.small,
    color: colors.accent.primary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: spacing.sm,
  },
  body: {
    ...typography.body.small,
    color: colors.text.primary,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  dismissButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dismissButtonText: {
    ...typography.body.regular,
    color: colors.text.muted,
    fontWeight: '500',
  },
  detailButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    backgroundColor: colors.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailButtonText: {
    ...typography.body.regular,
    color: colors.bg.primary,
    fontWeight: '600',
  },
});
