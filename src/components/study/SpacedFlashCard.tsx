import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Muscle } from '../../utils/types';
import { REGION_LABELS } from '../../data/muscles';
import { colors, typography, spacing } from '../../theme';

interface SpacedFlashCardProps {
  muscle: Muscle;
  onRate: (quality: 0 | 1 | 2 | 3) => void;
}

const RATING_BUTTONS: { quality: 0 | 1 | 2 | 3; labelKey: string; color: string }[] = [
  { quality: 0, labelKey: 'study.rateAgain', color: colors.error },
  { quality: 1, labelKey: 'study.rateHard', color: colors.safety.warning },
  { quality: 2, labelKey: 'study.rateGood', color: colors.success },
  { quality: 3, labelKey: 'study.rateEasy', color: colors.accent.primary },
];

export function SpacedFlashCard({ muscle, onRate }: SpacedFlashCardProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as 'es' | 'en';
  const [revealed, setRevealed] = useState(false);

  const name = lang === 'es' ? muscle.name_es : muscle.name_en;
  const otherName = lang === 'es' ? muscle.name_en : muscle.name_es;
  const func = lang === 'es' ? muscle.primary_function_es : muscle.primary_function_en;
  const regionLabel = REGION_LABELS[muscle.region][lang];

  const handleRate = (quality: 0 | 1 | 2 | 3) => {
    setRevealed(false);
    onRate(quality);
  };

  return (
    <View style={styles.container}>
      {/* Question */}
      <TouchableOpacity
        style={[styles.card, revealed && styles.cardRevealed]}
        onPress={() => !revealed && setRevealed(true)}
        activeOpacity={0.9}
        disabled={revealed}
      >
        {!revealed ? (
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
          <View style={styles.face}>
            <Text style={styles.answerName}>{name}</Text>
            <Text style={styles.answerOther}>{otherName}</Text>
            <Text style={styles.answerLatin}>{muscle.name_latin}</Text>
            <View style={styles.divider} />
            <Text style={styles.funcLabel}>{t('study.mainFunction')}</Text>
            <Text style={styles.funcText}>{func}</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Rating buttons */}
      {revealed && (
        <View style={styles.ratingRow}>
          {RATING_BUTTONS.map(({ quality, labelKey, color }) => (
            <TouchableOpacity
              key={quality}
              style={[styles.ratingBtn, { borderColor: color }]}
              onPress={() => handleRate(quality)}
              activeOpacity={0.7}
            >
              <Text style={[styles.ratingText, { color }]}>{t(labelKey)}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
  card: {
    backgroundColor: colors.bg.secondary,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 280,
    justifyContent: 'center',
  },
  cardRevealed: {
    backgroundColor: colors.bg.tertiary,
    borderColor: colors.accent.muted,
  },
  face: {
    padding: spacing.xl,
    gap: spacing.md,
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
  },
  divider: {
    width: '60%',
    height: 1,
    backgroundColor: colors.divider,
  },
  funcLabel: {
    ...typography.label.regular,
    color: colors.accent.muted,
    fontSize: 10,
  },
  funcText: {
    ...typography.body.regular,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  ratingRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  ratingBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 10,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    backgroundColor: colors.bg.secondary,
  },
  ratingText: {
    ...typography.body.small,
    fontWeight: '700',
  },
});
