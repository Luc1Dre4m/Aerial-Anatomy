import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { colors, typography, spacing } from '../../theme';

export function EmptySearchState() {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name="magnify" size={48} color={colors.text.muted} />
      <Text style={styles.title}>{t('common.noSearchResults')}</Text>
      <Text style={styles.message}>{t('common.tryDifferentSearch')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxxl,
    gap: spacing.md,
  },
  title: {
    ...typography.heading.h3,
    color: colors.text.muted,
    textAlign: 'center',
  },
  message: {
    ...typography.body.regular,
    color: colors.text.muted,
    textAlign: 'center',
    opacity: 0.7,
  },
});
