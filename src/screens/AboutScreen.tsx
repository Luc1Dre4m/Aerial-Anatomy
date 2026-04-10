import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing } from '../theme';

export function AboutScreen() {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{t('about.title')}</Text>

        {/* App info */}
        <View style={styles.card}>
          <Text style={styles.appName}>{t('app.title')}</Text>
          <Text style={styles.appDesc}>{t('about.description')}</Text>
          <Text style={styles.version}>{t('about.version')} 1.0.0</Text>
        </View>

        {/* Author */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t('about.author')}</Text>
          <Text style={styles.authorName}>{t('author.credit')}</Text>
        </View>

        {/* Health Disclaimer */}
        <View style={[styles.card, styles.disclaimerCard]}>
          <Text style={styles.disclaimerIcon}>⚕️</Text>
          <Text style={styles.disclaimerTitle}>{t('about.disclaimer')}</Text>
          <Text style={styles.disclaimerText}>{t('about.disclaimerText')}</Text>
        </View>

        {/* Credits */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t('about.credits')}</Text>
          <Text style={styles.creditLine}>React Native + Expo</Text>
          <Text style={styles.creditLine}>React Navigation</Text>
          <Text style={styles.creditLine}>react-native-svg</Text>
          <Text style={styles.creditLine}>react-native-reanimated</Text>
          <Text style={styles.creditLine}>Playfair Display (Google Fonts)</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxl,
    gap: spacing.lg,
  },
  title: {
    ...typography.heading.h1,
    fontFamily: typography.heading.fontFamily,
    color: colors.accent.light,
  },
  card: {
    backgroundColor: colors.bg.secondary,
    borderRadius: 12,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  appName: {
    ...typography.heading.h2,
    fontFamily: typography.heading.fontFamily,
    color: colors.accent.light,
  },
  appDesc: {
    ...typography.body.regular,
    color: colors.text.secondary,
    lineHeight: 22,
  },
  version: {
    ...typography.body.small,
    color: colors.text.muted,
  },
  sectionTitle: {
    ...typography.label.regular,
    color: colors.accent.primary,
    fontSize: 12,
  },
  authorName: {
    ...typography.body.large,
    color: colors.text.primary,
    fontWeight: '600',
  },
  disclaimerCard: {
    borderWidth: 1,
    borderColor: colors.safety.warning,
    backgroundColor: `${colors.safety.warning}08`,
  },
  disclaimerIcon: {
    fontSize: 24,
  },
  disclaimerTitle: {
    ...typography.heading.h3,
    fontFamily: typography.heading.fontFamily,
    color: colors.safety.warning,
  },
  disclaimerText: {
    ...typography.body.regular,
    color: colors.text.secondary,
    lineHeight: 22,
  },
  creditLine: {
    ...typography.body.small,
    color: colors.text.muted,
  },
});
