import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Muscle } from '../../utils/types';
import { REGION_LABELS } from '../../data/muscles';
import { colors, typography, spacing, shadows } from '../../theme';

interface FlashCardProps {
  muscle: Muscle;
}

export function FlashCard({ muscle }: FlashCardProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as 'es' | 'en';
  const [flipped, setFlipped] = useState(false);

  const name = lang === 'es' ? muscle.name_es : muscle.name_en;
  const otherName = lang === 'es' ? muscle.name_en : muscle.name_es;
  const func = lang === 'es' ? muscle.primary_function_es : muscle.primary_function_en;
  const regionLabel = REGION_LABELS[muscle.region][lang];

  return (
    <TouchableOpacity
      onPress={() => setFlipped(!flipped)}
      style={[styles.card, flipped && styles.cardFlipped]}
      activeOpacity={0.9}
      accessibilityRole="button"
      accessibilityLabel={t('study.flipToReveal')}
    >
      {!flipped ? (
        // FRONT - Question
        <View style={styles.face}>
          <Text style={styles.label}>{t('study.whatIs')}</Text>
          <Text style={styles.latin}>{muscle.name_latin}</Text>
          <View style={styles.hintRow}>
            <View style={styles.hintChip}>
              <Text style={styles.hintText}>{regionLabel}</Text>
            </View>
            <View style={styles.hintChip}>
              <Text style={styles.hintText}>
                {muscle.depth === 'superficial'
                  ? t('muscles.superficial')
                  : t('muscles.deep')}
              </Text>
            </View>
          </View>
          <Text style={styles.tapHint}>{t('study.flipToReveal')}</Text>
        </View>
      ) : (
        // BACK - Answer
        <View style={styles.face}>
          <Text style={styles.answerName}>{name}</Text>
          <Text style={styles.answerOther}>{otherName}</Text>
          <Text style={styles.answerLatin}>{muscle.name_latin}</Text>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('study.region')}</Text>
            <Text style={styles.infoValue}>{regionLabel}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('study.mainFunction')}</Text>
            <Text style={styles.infoValue}>{func}</Text>
          </View>

          <Text style={styles.tapHint}>{t('study.flipToReveal')}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bg.secondary,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 320,
    justifyContent: 'center',
    ...shadows.lg,
  },
  cardFlipped: {
    backgroundColor: colors.bg.tertiary,
    borderColor: colors.accent.muted,
  },
  face: {
    padding: spacing.xl,
    gap: spacing.lg,
    alignItems: 'center',
  },
  label: {
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
  },
  hintChip: {
    backgroundColor: colors.bg.tertiary,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  hintText: {
    ...typography.body.small,
    color: colors.text.muted,
  },
  tapHint: {
    ...typography.body.small,
    color: colors.text.muted,
    marginTop: spacing.md,
    opacity: 0.6,
  },
  answerName: {
    ...typography.heading.h1,
    fontFamily: typography.heading.fontFamily,
    color: colors.accent.light,
    textAlign: 'center',
  },
  answerOther: {
    ...typography.heading.h3,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: -spacing.sm,
  },
  answerLatin: {
    ...typography.body.regular,
    color: colors.accent.muted,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  divider: {
    width: '60%',
    height: 1,
    backgroundColor: colors.divider,
  },
  infoRow: {
    width: '100%',
    gap: spacing.xs,
  },
  infoLabel: {
    ...typography.label.regular,
    color: colors.accent.muted,
    fontSize: 10,
  },
  infoValue: {
    ...typography.body.regular,
    color: colors.text.secondary,
  },
});
