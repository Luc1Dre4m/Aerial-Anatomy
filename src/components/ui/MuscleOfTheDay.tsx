import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { muscles, REGION_LABELS } from '../../data/muscles';
import { AnimatedPressable } from './AnimatedPressable';
import { colors, typography, spacing, shadows } from '../../theme';

function getMuscleIndex(): number {
  const now = new Date();
  const daysSinceEpoch = Math.floor(now.getTime() / (1000 * 60 * 60 * 24));
  return daysSinceEpoch % muscles.length;
}

interface MuscleOfTheDayProps {
  onPress: (muscleId: string) => void;
}

export function MuscleOfTheDay({ onPress }: MuscleOfTheDayProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as 'es' | 'en';
  const muscle = muscles[getMuscleIndex()];

  const name = lang === 'es' ? muscle.name_es : muscle.name_en;
  const func = lang === 'es' ? muscle.primary_function_es : muscle.primary_function_en;
  const regionLabel = REGION_LABELS[muscle.region][lang];

  const glowOpacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(glowOpacity, { toValue: 0.7, duration: 1500, useNativeDriver: true }),
        Animated.timing(glowOpacity, { toValue: 0.3, duration: 1500, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <View>
      <Animated.View style={[styles.glow, { opacity: glowOpacity }]} />
      <AnimatedPressable
        style={styles.card}
        onPress={() => onPress(muscle.id)}
      >
        <View style={styles.header}>
          <Text style={styles.badge}>{t('body.muscleOfTheDay')}</Text>
          <Text style={styles.region}>{regionLabel}</Text>
        </View>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.latin}>{muscle.name_latin}</Text>
        <Text style={styles.func} numberOfLines={2}>{func}</Text>
      </AnimatedPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  glow: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 14,
    backgroundColor: colors.accent.glow,
  },
  card: {
    backgroundColor: colors.bg.secondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.accent.muted,
    padding: spacing.lg,
    gap: spacing.xs,
    ...shadows.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    ...typography.label.regular,
    color: colors.accent.primary,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  region: {
    ...typography.body.small,
    color: colors.text.muted,
  },
  name: {
    ...typography.heading.h3,
    fontFamily: typography.heading.fontFamily,
    color: colors.accent.light,
  },
  latin: {
    ...typography.body.small,
    color: colors.accent.muted,
    fontStyle: 'italic',
    marginTop: -2,
  },
  func: {
    ...typography.body.small,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
});
