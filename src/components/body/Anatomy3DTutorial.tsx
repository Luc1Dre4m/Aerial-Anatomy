import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, shadows } from '../../theme';

interface Anatomy3DTutorialProps {
  onFinish: () => void;
}

interface Step {
  iconName: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  titleKey: string;
  bodyKey: string;
}

const STEPS: ReadonlyArray<Step> = [
  { iconName: 'rotate-3d-variant', titleKey: 'tutorial3D.step1Title', bodyKey: 'tutorial3D.step1Body' },
  { iconName: 'gesture-tap', titleKey: 'tutorial3D.step2Title', bodyKey: 'tutorial3D.step2Body' },
  { iconName: 'magnify-plus-outline', titleKey: 'tutorial3D.step3Title', bodyKey: 'tutorial3D.step3Body' },
];

export function Anatomy3DTutorial({ onFinish }: Anatomy3DTutorialProps) {
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);
  const isLast = index === STEPS.length - 1;
  const step = STEPS[index];

  const handleNext = useCallback(() => {
    Haptics.selectionAsync().catch(() => undefined);
    if (isLast) onFinish();
    else setIndex((i) => i + 1);
  }, [isLast, onFinish]);

  const handleSkip = useCallback(() => {
    Haptics.selectionAsync().catch(() => undefined);
    onFinish();
  }, [onFinish]);

  return (
    <View style={styles.backdrop} pointerEvents="box-none">
      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <MaterialCommunityIcons
            name={step.iconName}
            size={36}
            color={colors.accent.primary}
          />
        </View>
        <Text style={styles.counter}>
          {t('tutorial3D.stepCounter', { current: index + 1, total: STEPS.length })}
        </Text>
        <Text style={styles.title}>{t(step.titleKey)}</Text>
        <Text style={styles.body}>{t(step.bodyKey)}</Text>

        <View style={styles.dots}>
          {STEPS.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === index && styles.dotActive]}
            />
          ))}
        </View>

        <View style={styles.actions}>
          {!isLast && (
            <Pressable
              style={styles.skipBtn}
              onPress={handleSkip}
              accessibilityRole="button"
              accessibilityLabel={t('tutorial3D.skip')}
              hitSlop={8}
            >
              <Text style={styles.skipText}>{t('tutorial3D.skip')}</Text>
            </Pressable>
          )}
          <Pressable
            style={[styles.primaryBtn, isLast && styles.primaryBtnFull]}
            onPress={handleNext}
            accessibilityRole="button"
            accessibilityLabel={isLast ? t('tutorial3D.done') : t('tutorial3D.next')}
            hitSlop={8}
          >
            <Text style={styles.primaryBtnText}>
              {isLast ? t('tutorial3D.done') : t('tutorial3D.next')}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(13, 13, 26, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    zIndex: 100,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.bg.secondary,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.accent.muted,
    padding: spacing.xl,
    alignItems: 'center',
    ...shadows.md,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: `${colors.accent.primary}1A`,
    borderWidth: 1,
    borderColor: colors.accent.muted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  counter: {
    ...typography.label.regular,
    color: colors.text.muted,
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.heading.h2,
    fontFamily: typography.heading.fontFamily,
    color: colors.accent.light,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  body: {
    ...typography.body.regular,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  dots: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.bg.tertiary,
  },
  dotActive: {
    backgroundColor: colors.accent.primary,
    width: 20,
  },
  actions: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    gap: spacing.sm,
  },
  skipBtn: {
    flex: 1,
    minHeight: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipText: {
    ...typography.body.regular,
    color: colors.text.muted,
    fontWeight: '600',
  },
  primaryBtn: {
    flex: 1,
    minHeight: 44,
    borderRadius: 10,
    backgroundColor: colors.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnFull: {
    flex: 1,
  },
  primaryBtnText: {
    ...typography.body.regular,
    color: colors.bg.primary,
    fontWeight: '700',
  },
});
