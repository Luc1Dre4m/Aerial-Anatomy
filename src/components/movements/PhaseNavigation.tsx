import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { colors, typography, spacing } from '../../theme';

interface PhaseNavigationProps {
  currentPhase: number;
  totalPhases: number;
  onPrevious: () => void;
  onNext: () => void;
}

export const PhaseNavigation = React.memo(function PhaseNavigation({
  currentPhase,
  totalPhases,
  onPrevious,
  onNext,
}: PhaseNavigationProps) {
  const { t } = useTranslation();
  const isFirst = currentPhase === 0;
  const isLast = currentPhase === totalPhases - 1;

  return (
    <View style={styles.navRow}>
      <TouchableOpacity
        onPress={onPrevious}
        disabled={isFirst}
        style={[styles.navBtn, isFirst && styles.navBtnDisabled]}
      >
        <MaterialCommunityIcons name="chevron-left" size={24} color={isFirst ? colors.text.muted : colors.accent.primary} />
        <Text style={[styles.navText, isFirst && styles.navTextDisabled]}>
          {t('study.previous')}
        </Text>
      </TouchableOpacity>
      <Text style={styles.counter}>
        {currentPhase + 1} / {totalPhases}
      </Text>
      <TouchableOpacity
        onPress={onNext}
        disabled={isLast}
        style={[styles.navBtn, isLast && styles.navBtnDisabled]}
      >
        <Text style={[styles.navText, isLast && styles.navTextDisabled]}>
          {t('study.next')}
        </Text>
        <MaterialCommunityIcons name="chevron-right" size={24} color={isLast ? colors.text.muted : colors.accent.primary} />
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    gap: 2,
  },
  navBtnDisabled: {
    opacity: 0.4,
  },
  navText: {
    ...typography.body.small,
    color: colors.accent.primary,
    fontWeight: '600',
  },
  navTextDisabled: {
    color: colors.text.muted,
  },
  counter: {
    ...typography.body.small,
    color: colors.text.muted,
  },
});
