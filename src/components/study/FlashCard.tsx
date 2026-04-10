import React, { useState, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
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
  const flipAnim = useRef(new Animated.Value(0)).current;

  const name = lang === 'es' ? muscle.name_es : muscle.name_en;
  const otherName = lang === 'es' ? muscle.name_en : muscle.name_es;
  const func = lang === 'es' ? muscle.primary_function_es : muscle.primary_function_en;
  const regionLabel = REGION_LABELS[muscle.region][lang];

  const handleFlip = useCallback(() => {
    const toValue = flipped ? 0 : 1;
    setFlipped(!flipped);
    Animated.timing(flipAnim, {
      toValue,
      duration: 400,
      useNativeDriver: false,
    }).start();
  }, [flipped, flipAnim]);

  const frontRotateY = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['0deg', '90deg', '180deg'],
  });
  const frontOpacity = flipAnim.interpolate({
    inputRange: [0, 0.49, 0.5, 1],
    outputRange: [1, 1, 0, 0],
  });
  const backRotateY = flipAnim.interpolate({
    inputRange: [0, 0.5, 0.51, 1],
    outputRange: ['180deg', '90deg', '90deg', '0deg'],
  });
  const backOpacity = flipAnim.interpolate({
    inputRange: [0, 0.5, 0.51, 1],
    outputRange: [0, 0, 1, 1],
  });

  return (
    <TouchableOpacity
      onPress={handleFlip}
      style={styles.cardContainer}
      activeOpacity={0.95}
      accessibilityRole="button"
      accessibilityLabel={t('study.flipToReveal')}
    >
      {/* Front face */}
      <Animated.View
        style={[
          styles.card,
          {
            opacity: frontOpacity,
            transform: [{ perspective: 1000 }, { rotateY: frontRotateY }],
          },
        ]}
      >
        <View style={styles.glassOverlay} />
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
      </Animated.View>

      {/* Back face */}
      <Animated.View
        style={[
          styles.card,
          styles.cardBack,
          StyleSheet.absoluteFillObject,
          {
            opacity: backOpacity,
            transform: [{ perspective: 1000 }, { rotateY: backRotateY }],
          },
        ]}
      >
        <View style={styles.glassOverlay} />
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
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    height: 320,
  },
  card: {
    backgroundColor: colors.bg.secondary,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.glass.border,
    minHeight: 320,
    justifyContent: 'center',
    overflow: 'hidden',
    ...shadows.lg,
    backfaceVisibility: 'hidden',
  },
  cardBack: {
    backgroundColor: colors.bg.tertiary,
    borderColor: colors.accent.muted,
  },
  glassOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.glass.light,
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
