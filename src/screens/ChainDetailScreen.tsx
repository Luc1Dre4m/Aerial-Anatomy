import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useRoute, useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { getChainById } from '../data/chains';
import { getMovementById } from '../data/movements';
import { ChainFlowView } from '../components/chains/ChainFlowView';
import { ChainOverlay } from '../components/chains/ChainOverlay';
import { AuthorCredit } from '../components/ui/AuthorCredit';
import { NotFoundView } from '../components/ui/NotFoundView';
import { colors, typography, spacing } from '../theme';

export function ChainDetailScreen() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as 'es' | 'en';
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const chain = getChainById(route.params?.chainId);

  if (!chain) return <NotFoundView />;

  const name = lang === 'es' ? chain.name_es : chain.name_en;
  const description = lang === 'es' ? chain.description_es : chain.description_en;
  const relevance = lang === 'es' ? chain.relevance_es : chain.relevance_en;
  const isExclusive = chain.type === 'suspension';

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={chain.color} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {isExclusive && (
          <View style={[styles.exclusiveBanner, { backgroundColor: `${chain.color}20`, borderColor: chain.color }]}>
            <Text style={[styles.exclusiveIcon]}>★</Text>
            <Text style={[styles.exclusiveText, { color: chain.color }]}>
              {t('chains.exclusive')}
            </Text>
          </View>
        )}

        <View style={styles.titleRow}>
          <View style={[styles.colorBar, { backgroundColor: chain.color }]} />
          <Text style={[styles.name, { color: chain.color }]}>{name}</Text>
        </View>

        <Text style={styles.description}>{description}</Text>

        {/* Relevance / compensation warning */}
        <View style={[styles.relevanceCard, { borderLeftColor: chain.color }]}>
          <Text style={styles.relevanceLabel}>{t('chains.compensation')}</Text>
          <Text style={styles.relevanceText}>{relevance}</Text>
        </View>

        <View style={styles.divider} />

        {/* Body overlay — animated chain visualization */}
        <ChainOverlay chain={chain} />

        <View style={styles.divider} />

        {/* Muscle Flow */}
        <Text style={styles.sectionTitle}>{t('chains.muscleFlow')}</Text>
        <ChainFlowView chain={chain} />

        <View style={styles.divider} />

        {/* Related Movements */}
        <Text style={styles.sectionTitle}>
          {t('chains.relatedMovements')} ({chain.related_movements.length})
        </Text>
        <View style={styles.movementList}>
          {chain.related_movements.map((mvId) => {
            const mv = getMovementById(mvId);
            if (!mv) return null;
            return (
              <TouchableOpacity
                key={mvId}
                style={styles.movementItem}
                onPress={() => navigation.navigate('MovementDetail', { movementId: mvId })}
              >
                <View style={styles.movementInfo}>
                  <Text style={styles.movementName}>
                    {lang === 'es' ? mv.name_es : mv.name_en}
                  </Text>
                  <Text style={styles.movementLevel}>{t(`levels.${mv.level}`)}</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={18} color={colors.text.muted} />
              </TouchableOpacity>
            );
          })}
        </View>

        <AuthorCredit />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  topBar: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  backBtn: {
    minHeight: 44,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
    gap: spacing.lg,
  },
  exclusiveBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  exclusiveIcon: {
    fontSize: 18,
    color: colors.accent.primary,
  },
  exclusiveText: {
    ...typography.body.regular,
    fontWeight: '700',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  colorBar: {
    width: 5,
    height: 36,
    borderRadius: 3,
  },
  name: {
    ...typography.heading.h1,
    fontFamily: typography.heading.fontFamily,
    flex: 1,
  },
  description: {
    ...typography.body.large,
    color: colors.text.primary,
    lineHeight: 26,
  },
  relevanceCard: {
    backgroundColor: colors.bg.secondary,
    borderLeftWidth: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.glass.border,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  relevanceLabel: {
    ...typography.label.regular,
    color: colors.safety.warning,
    fontSize: 11,
  },
  relevanceText: {
    ...typography.body.regular,
    color: colors.text.secondary,
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
  },
  sectionTitle: {
    ...typography.label.regular,
    color: colors.accent.primary,
    fontSize: 12,
  },
  movementList: {
    gap: spacing.sm,
  },
  movementItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.bg.secondary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.glass.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 44,
  },
  movementInfo: {
    flex: 1,
    gap: 2,
  },
  movementName: {
    ...typography.body.regular,
    color: colors.text.primary,
    fontWeight: '600',
  },
  movementLevel: {
    ...typography.body.small,
    color: colors.text.muted,
  },
});
