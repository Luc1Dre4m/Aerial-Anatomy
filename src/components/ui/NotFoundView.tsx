import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { colors, typography, spacing } from '../../theme';

export function NotFoundView() {
  const { t } = useTranslation();
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        <MaterialCommunityIcons name="alert-circle-outline" size={64} color={colors.text.muted} />
        <Text style={styles.title}>{t('common.notFound')}</Text>
        <Text style={styles.message}>{t('common.notFoundMessage')}</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel={t('common.goBack')}
        >
          <MaterialCommunityIcons name="arrow-left" size={20} color={colors.bg.primary} />
          <Text style={styles.buttonText}>{t('common.goBack')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  title: {
    ...typography.heading.h2,
    fontFamily: typography.heading.fontFamily,
    color: colors.accent.light,
    textAlign: 'center',
  },
  message: {
    ...typography.body.regular,
    color: colors.text.muted,
    textAlign: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.accent.primary,
    borderRadius: 8,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    marginTop: spacing.lg,
    minHeight: 44,
  },
  buttonText: {
    ...typography.body.regular,
    color: colors.bg.primary,
    fontWeight: '700',
  },
});
