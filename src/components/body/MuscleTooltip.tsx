import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, BackHandler, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { getMuscleById } from '../../data/muscles';
import { colors, typography, spacing } from '../../theme';

interface MuscleTooltipProps {
  muscleId: string;
  onViewDetail: (muscleId: string) => void;
  onClose: () => void;
}

export function MuscleTooltip({ muscleId, onViewDetail, onClose }: MuscleTooltipProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as 'es' | 'en';
  const muscle = getMuscleById(muscleId);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });
    return () => sub.remove();
  }, [onClose]);

  if (!muscle) return null;

  const name = lang === 'es' ? muscle.name_es : muscle.name_en;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn} accessibilityRole="button" accessibilityLabel={t('common.close') ?? 'Close'}>
          <MaterialCommunityIcons name="close" size={16} color={colors.text.muted} />
        </TouchableOpacity>

        <Text style={styles.name}>{name}</Text>
        <Text style={styles.latin}>{muscle.name_latin}</Text>

        <View style={styles.metaRow}>
          <View style={styles.depthBadge}>
            <MaterialCommunityIcons
              name={muscle.depth === 'superficial' ? 'layers-outline' : 'layers'}
              size={14}
              color={colors.accent.primary}
            />
            <Text style={styles.depthText}>
              {muscle.depth === 'superficial'
                ? t('muscles.superficial')
                : t('muscles.deep')}
            </Text>
          </View>
          <Text style={styles.region}>{t(`regions.${muscle.region}`)}</Text>
        </View>

        <TouchableOpacity
          style={styles.detailBtn}
          onPress={() => onViewDetail(muscleId)}
          accessibilityRole="button"
          accessibilityLabel={`${t('muscles.viewDetail')} ${name}`}
        >
          <Text style={styles.detailBtnText}>{t('muscles.viewDetail')}</Text>
          <MaterialCommunityIcons name="chevron-right" size={16} color={colors.bg.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.bg.secondary,
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.accent.primary + '40',
    gap: spacing.xs,
    shadowColor: colors.accent.primary,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  closeBtn: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    ...typography.heading.h3,
    fontFamily: typography.heading.fontFamily,
    color: colors.accent.light,
    paddingRight: 44,
  },
  latin: {
    ...typography.body.small,
    color: colors.accent.muted,
    fontStyle: 'italic',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  depthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.bg.tertiary,
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  depthText: {
    ...typography.body.small,
    color: colors.text.secondary,
    fontSize: 11,
  },
  region: {
    ...typography.body.small,
    color: colors.text.muted,
  },
  detailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent.primary,
    borderRadius: 10,
    paddingVertical: spacing.sm,
    marginTop: spacing.sm,
    gap: 4,
    minHeight: 40,
  },
  detailBtnText: {
    color: colors.bg.primary,
    fontWeight: '700',
    fontSize: 14,
  },
});
