import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { BiomechanicalChain } from '../../utils/types';
import { getMuscleById } from '../../data/muscles';
import { AnimatedPressable } from '../ui/AnimatedPressable';
import { colors, typography, spacing, shadows } from '../../theme';

interface ChainCardProps {
  chain: BiomechanicalChain;
  onPress: () => void;
}

export function ChainCard({ chain, onPress }: ChainCardProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as 'es' | 'en';
  const name = lang === 'es' ? chain.name_es : chain.name_en;
  const isExclusive = chain.type === 'suspension';

  return (
    <AnimatedPressable onPress={onPress} style={styles.card}>
      {isExclusive && (
        <View style={[styles.exclusiveBadge, { backgroundColor: chain.color }]}>
          <Text style={styles.exclusiveText}>
            {t('chains.exclusiveBadge')}
          </Text>
        </View>
      )}

      <View style={styles.header}>
        <View style={[styles.colorBar, { backgroundColor: chain.color }]} />
        <Text style={[styles.name, { color: chain.color }]}>{name}</Text>
      </View>

      <View style={styles.flowPreview}>
        {chain.muscles_ordered.slice(0, 5).map((cm, idx) => {
          const muscle = getMuscleById(cm.muscle_id);
          if (!muscle) return null;
          const muscleName = lang === 'es' ? muscle.name_es : muscle.name_en;
          return (
            <React.Fragment key={cm.muscle_id}>
              {idx > 0 && <Text style={[styles.arrow, { color: chain.color }]}> → </Text>}
              <Text style={styles.muscleName} numberOfLines={1}>
                {muscleName}
              </Text>
            </React.Fragment>
          );
        })}
        {chain.muscles_ordered.length > 5 && (
          <Text style={styles.more}> +{chain.muscles_ordered.length - 5}</Text>
        )}
      </View>

      <Text style={styles.count}>
        {t('chains.muscleCount', { count: chain.muscles_ordered.length })} · {t('chains.movementCount', { count: chain.related_movements.length })}
      </Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bg.secondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
    overflow: 'hidden',
    ...shadows.md,
  },
  exclusiveBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    borderBottomLeftRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  exclusiveText: {
    ...typography.label.regular,
    color: colors.bg.primary,
    fontSize: 9,
    fontWeight: '800',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  colorBar: {
    width: 4,
    height: 28,
    borderRadius: 2,
  },
  name: {
    ...typography.heading.h3,
    fontFamily: typography.heading.fontFamily,
    flex: 1,
  },
  flowPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  arrow: {
    fontSize: 12,
    fontWeight: '700',
  },
  muscleName: {
    ...typography.body.small,
    color: colors.text.secondary,
  },
  more: {
    ...typography.body.small,
    color: colors.text.muted,
  },
  count: {
    ...typography.body.small,
    color: colors.text.muted,
  },
});
