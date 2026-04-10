import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing } from '../../theme';

export function AuthorCredit() {
  const { t } = useTranslation();

  return (
    <Text style={styles.credit}>{t('author.credit')}</Text>
  );
}

const styles = StyleSheet.create({
  credit: {
    ...typography.body.small,
    color: colors.text.muted,
    textAlign: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
});
