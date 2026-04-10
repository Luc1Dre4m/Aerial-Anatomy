import React from 'react';
import { View, Text, TouchableOpacity, Linking, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { colors, typography, spacing } from '../../theme';

interface CameraPermissionViewProps {
  onRequestPermission: () => void;
  denied?: boolean;
}

export function CameraPermissionView({ onRequestPermission, denied }: CameraPermissionViewProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <MaterialCommunityIcons
        name={denied ? 'camera-off' : 'camera'}
        size={64}
        color={colors.accent.muted}
      />
      <Text style={styles.title}>{t('permissions.cameraTitle')}</Text>
      <Text style={styles.description}>{t('permissions.cameraDescription')}</Text>

      {denied ? (
        <>
          <Text style={styles.deniedText}>{t('permissions.cameraDenied')}</Text>
          <TouchableOpacity
            style={styles.settingsBtn}
            onPress={() => Linking.openSettings()}
          >
            <MaterialCommunityIcons name="cog" size={18} color={colors.bg.primary} />
            <Text style={styles.settingsBtnText}>{t('permissions.openSettings')}</Text>
          </TouchableOpacity>
        </>
      ) : (
        <TouchableOpacity
          style={styles.allowBtn}
          onPress={onRequestPermission}
        >
          <MaterialCommunityIcons name="camera" size={18} color={colors.bg.primary} />
          <Text style={styles.allowBtnText}>{t('permissions.cameraTitle')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
    gap: spacing.lg,
  },
  title: {
    ...typography.heading.h2,
    fontFamily: typography.heading.fontFamily,
    color: colors.accent.light,
    textAlign: 'center',
  },
  description: {
    ...typography.body.regular,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  deniedText: {
    ...typography.body.small,
    color: colors.safety.warning,
    textAlign: 'center',
  },
  allowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.accent.primary,
    borderRadius: 12,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    minHeight: 48,
  },
  allowBtnText: {
    color: colors.bg.primary,
    fontWeight: '700',
    fontSize: 16,
  },
  settingsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.accent.secondary,
    borderRadius: 12,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    minHeight: 48,
  },
  settingsBtnText: {
    color: colors.bg.primary,
    fontWeight: '700',
    fontSize: 16,
  },
});
