import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { BiomechanicalChain } from '../../utils/types';
import { getMuscleById } from '../../data/muscles';
import { colors, typography, spacing } from '../../theme';

interface ChainFlowViewProps {
  chain: BiomechanicalChain;
}

export const ChainFlowView = React.memo(function ChainFlowView({ chain }: ChainFlowViewProps) {
  const { i18n } = useTranslation();
  const lang = i18n.language as 'es' | 'en';

  return (
    <View style={styles.container}>
      {chain.muscles_ordered.map((cm, idx) => {
        const muscle = getMuscleById(cm.muscle_id);
        if (!muscle) return null;
        const name = lang === 'es' ? muscle.name_es : muscle.name_en;
        const isLast = idx === chain.muscles_ordered.length - 1;

        return (
          <View key={cm.muscle_id} style={styles.item}>
            {/* Node */}
            <View style={styles.nodeRow}>
              <View style={styles.nodeCol}>
                <View style={[styles.node, { backgroundColor: chain.color }]}>
                  <Text style={styles.nodeNumber}>{cm.position_in_chain}</Text>
                </View>
                {!isLast && <View style={[styles.line, { backgroundColor: chain.color }]} />}
              </View>

              <View style={styles.info}>
                <Text style={styles.muscleName}>{name}</Text>
                <Text style={styles.latin}>{muscle.name_latin}</Text>
                <View style={styles.metaRow}>
                  <View style={[styles.connectionBadge, { borderColor: `${chain.color}80` }]}>
                    <Text style={[styles.connectionText, { color: chain.color }]}>
                      {cm.connection_type}
                    </Text>
                  </View>
                  <Text style={styles.force}>
                    {cm.force_direction.replace(/_/g, ' ')}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    gap: 0,
  },
  item: {},
  nodeRow: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  nodeCol: {
    alignItems: 'center',
    width: 36,
  },
  node: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeNumber: {
    ...typography.body.regular,
    color: colors.bg.primary,
    fontWeight: '800',
  },
  line: {
    width: 2,
    height: 40,
    opacity: 0.4,
  },
  info: {
    flex: 1,
    paddingBottom: spacing.lg,
    gap: 2,
  },
  muscleName: {
    ...typography.body.regular,
    color: colors.text.primary,
    fontWeight: '600',
  },
  latin: {
    ...typography.body.small,
    color: colors.accent.muted,
    fontStyle: 'italic',
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  connectionBadge: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 1,
  },
  connectionText: {
    fontSize: 9,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  force: {
    ...typography.body.small,
    color: colors.text.muted,
    fontSize: 10,
  },
});
