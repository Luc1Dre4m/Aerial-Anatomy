import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAppStore } from '../../store/useAppStore';
import { colors, typography, spacing } from '../../theme';

export function LanguageToggle() {
  const language = useAppStore((s) => s.language);
  const setLanguage = useAppStore((s) => s.setLanguage);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => setLanguage('es')}
        accessibilityRole="button"
        accessibilityLabel="Español"
      >
        <Text
          style={[
            styles.label,
            language === 'es' ? styles.active : styles.inactive,
          ]}
        >
          ES
        </Text>
        {language === 'es' && <View style={styles.underline} />}
      </TouchableOpacity>

      <View style={styles.separator} />

      <TouchableOpacity
        style={styles.button}
        onPress={() => setLanguage('en')}
        accessibilityRole="button"
        accessibilityLabel="English"
      >
        <Text
          style={[
            styles.label,
            language === 'en' ? styles.active : styles.inactive,
          ]}
        >
          EN
        </Text>
        {language === 'en' && <View style={styles.underline} />}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
  },
  button: {
    minHeight: 44,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...typography.label.regular,
    fontSize: 14,
  },
  active: {
    color: colors.accent.primary,
  },
  inactive: {
    color: colors.text.muted,
  },
  underline: {
    height: 2,
    width: 24,
    backgroundColor: colors.accent.primary,
    marginTop: 2,
    borderRadius: 1,
  },
  separator: {
    width: 1,
    height: 16,
    backgroundColor: colors.border,
    marginHorizontal: spacing.xs,
  },
});
