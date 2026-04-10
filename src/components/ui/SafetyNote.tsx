import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing } from '../../theme';

interface SafetyNoteProps {
  type: 'warning' | 'critical' | 'info';
  text: string;
}

const TYPE_COLORS = {
  warning: colors.safety.warning,
  critical: colors.safety.critical,
  info: colors.safety.info,
};

const TYPE_ICONS = {
  warning: '\u26A0\uFE0F',
  critical: '\u26D4',
  info: '\u2139\uFE0F',
};

export function SafetyNote({ type, text }: SafetyNoteProps) {
  const { t } = useTranslation();
  const accentColor = TYPE_COLORS[type];

  return (
    <View style={[styles.container, { borderLeftColor: accentColor }]}>
      <View style={styles.header}>
        <Text style={styles.icon}>{TYPE_ICONS[type]}</Text>
        <Text style={[styles.label, { color: accentColor }]}>
          {t('safety.title')}
        </Text>
      </View>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: `${colors.accent.primary}15`,
    borderLeftWidth: 3,
    borderRadius: 8,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  icon: {
    fontSize: 16,
  },
  label: {
    ...typography.label.regular,
    fontSize: 12,
  },
  text: {
    ...typography.body.regular,
    color: colors.text.primary,
    lineHeight: 22,
  },
});
