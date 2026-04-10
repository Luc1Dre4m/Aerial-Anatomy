import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { colors, typography, spacing, shadows } from '../../theme';

interface PremiumBannerProps {
  feature?: string;
  onUpgrade?: () => void;
}

export function PremiumBanner({ feature, onUpgrade }: PremiumBannerProps) {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();

  const handlePress = () => {
    if (onUpgrade) {
      onUpgrade();
    } else {
      navigation.navigate('Paywall');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>👑</Text>
      <View style={styles.content}>
        <Text style={styles.title}>{t('premium.unlockTitle')}</Text>
        {feature && <Text style={styles.feature}>{feature}</Text>}
      </View>
      <TouchableOpacity style={styles.btn} onPress={handlePress} activeOpacity={0.7}>
        <Text style={styles.btnText}>{t('premium.upgrade')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: `${colors.accent.primary}10`,
    borderWidth: 1,
    borderColor: colors.accent.muted,
    borderRadius: 12,
    padding: spacing.lg,
    ...shadows.md,
  },
  icon: {
    fontSize: 24,
  },
  content: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...typography.body.regular,
    color: colors.accent.primary,
    fontWeight: '700',
  },
  feature: {
    ...typography.body.small,
    color: colors.text.muted,
  },
  btn: {
    backgroundColor: colors.accent.primary,
    borderRadius: 8,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    minHeight: 36,
    justifyContent: 'center',
  },
  btnText: {
    ...typography.body.small,
    color: colors.bg.primary,
    fontWeight: '700',
  },
});
