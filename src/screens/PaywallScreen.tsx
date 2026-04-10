import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { PurchasesPackage, PurchasesOffering } from 'react-native-purchases';
import {
  getOfferings,
  purchasePackage,
  restorePurchases,
  isRevenueCatConfigured,
} from '../services/revenueCat';
import { useAppStore } from '../store/useAppStore';
import { colors, typography, spacing } from '../theme';

type PlanTab = 'premium' | 'instructor';

const PREMIUM_FEATURES = [
  { icon: 'arm-flex' as const, key: 'paywall.allMuscles' },
  { icon: 'yoga' as const, key: 'paywall.allMovements' },
  { icon: 'play-circle' as const, key: 'paywall.animations' },
  { icon: 'cards-outline' as const, key: 'paywall.studyTools' },
  { icon: 'fire' as const, key: 'paywall.preTraining' },
  { icon: 'shield-check' as const, key: 'paywall.riskEvaluator' },
  { icon: 'wifi-off' as const, key: 'paywall.offlineMode' },
];

const INSTRUCTOR_EXTRA_FEATURES = [
  { icon: 'file-pdf-box' as const, key: 'paywall.pdfGenerator' },
  { icon: 'cast-education' as const, key: 'paywall.liveMode' },
  { icon: 'share-variant' as const, key: 'paywall.shareableNotes' },
  { icon: 'check-decagram' as const, key: 'paywall.verifiedBadge' },
  { icon: 'star' as const, key: 'paywall.earlyAccess' },
];

export function PaywallScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const setSubscription = useAppStore((s) => s.setSubscription);
  const currentSub = useAppStore((s) => s.subscription);

  const [tab, setTab] = useState<PlanTab>('premium');
  const [offering, setOffering] = useState<PurchasesOffering | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'monthly' | 'annual'>('annual');

  const configured = isRevenueCatConfigured();

  useEffect(() => {
    async function load() {
      if (configured) {
        const off = await getOfferings();
        setOffering(off);
      }
      setLoading(false);
    }
    load();
  }, [configured]);

  const findPackage = useCallback(
    (identifier: string): PurchasesPackage | undefined => {
      return offering?.availablePackages.find((p) => p.identifier === identifier);
    },
    [offering]
  );

  const handlePurchase = useCallback(
    async (packageId: string) => {
      if (!configured) {
        if (__DEV__) {
          // Demo mode — simulate purchase (dev only)
          const tier = tab === 'instructor' ? 'instructor' : 'premium';
          setSubscription(tier);
          Alert.alert(
            t('paywall.successTitle'),
            t('paywall.successDesc'),
            [{ text: 'OK', onPress: () => navigation.goBack() }]
          );
        } else {
          Alert.alert(t('paywall.unavailableTitle'), t('paywall.unavailableDesc'));
        }
        return;
      }

      const pkg = findPackage(packageId);
      if (!pkg) return;

      setPurchasing(true);
      const result = await purchasePackage(pkg);
      setPurchasing(false);

      if (result.success) {
        setSubscription(result.tier);
        Alert.alert(
          t('paywall.successTitle'),
          t('paywall.successDesc'),
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    },
    [configured, tab, findPackage, setSubscription, navigation, t]
  );

  const handleRestore = useCallback(async () => {
    if (!configured) {
      Alert.alert(t('paywall.restoreNone'));
      return;
    }

    setPurchasing(true);
    const result = await restorePurchases();
    setPurchasing(false);

    if (result.success && result.tier !== 'free') {
      setSubscription(result.tier);
      Alert.alert(
        t('paywall.restoreSuccess'),
        '',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } else {
      Alert.alert(t('paywall.restoreNone'));
    }
  }, [configured, setSubscription, navigation, t]);

  const isPremium = currentSub === 'premium' || currentSub === 'instructor';
  const isInstructor = currentSub === 'instructor';

  // Price display (from RevenueCat or fallback)
  const getPriceText = (period: 'monthly' | 'annual', plan: PlanTab) => {
    if (plan === 'premium') {
      return period === 'monthly' ? '$1.99/mes' : '$14.99/ano';
    }
    return period === 'monthly' ? '$4.99/mes' : '$39.99/ano';
  };

  const getPackageId = (period: 'monthly' | 'annual', plan: PlanTab) => {
    if (plan === 'premium') {
      return period === 'monthly' ? 'rc_premium_monthly_199' : 'rc_premium_annual_1499';
    }
    return period === 'monthly' ? 'rc_instructor_monthly_499' : 'rc_instructor_annual_3999';
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <MaterialCommunityIcons name="close" size={24} color={colors.text.muted} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Crown + Title */}
        <View style={styles.heroSection}>
          <Text style={styles.crown}>👑</Text>
          <Text style={styles.heroTitle}>{t('paywall.title')}</Text>
          <Text style={styles.heroDesc}>{t('paywall.description')}</Text>
        </View>

        {/* Plan Tabs */}
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tab, tab === 'premium' && styles.tabActive]}
            onPress={() => setTab('premium')}
          >
            <Text style={[styles.tabText, tab === 'premium' && styles.tabTextActive]}>
              Premium
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, tab === 'instructor' && styles.tabActive]}
            onPress={() => setTab('instructor')}
          >
            <Text style={[styles.tabText, tab === 'instructor' && styles.tabTextActive]}>
              {t('premium.instructorTitle')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Features List */}
        <View style={styles.featuresCard}>
          {PREMIUM_FEATURES.map((f) => (
            <View key={f.key} style={styles.featureRow}>
              <MaterialCommunityIcons name={f.icon} size={20} color={colors.accent.primary} />
              <Text style={styles.featureText}>{t(f.key)}</Text>
              <MaterialCommunityIcons name="check" size={18} color={colors.success} />
            </View>
          ))}

          {tab === 'instructor' && (
            <>
              <View style={styles.featureDivider} />
              <Text style={styles.extraLabel}>{t('paywall.instructorExtras')}</Text>
              {INSTRUCTOR_EXTRA_FEATURES.map((f) => (
                <View key={f.key} style={styles.featureRow}>
                  <MaterialCommunityIcons name={f.icon} size={20} color={colors.accent.light} />
                  <Text style={styles.featureText}>{t(f.key)}</Text>
                  <MaterialCommunityIcons name="check" size={18} color={colors.success} />
                </View>
              ))}
            </>
          )}
        </View>

        {/* Period Selection */}
        <View style={styles.periodRow}>
          <TouchableOpacity
            style={[styles.periodCard, selectedPeriod === 'annual' && styles.periodCardActive]}
            onPress={() => setSelectedPeriod('annual')}
          >
            {selectedPeriod === 'annual' && (
              <View style={styles.saveBadge}>
                <Text style={styles.saveBadgeText}>{t('premium.save')}</Text>
              </View>
            )}
            <Text style={styles.periodLabel}>{t('paywall.annual')}</Text>
            <Text style={[styles.periodPrice, selectedPeriod === 'annual' && styles.periodPriceActive]}>
              {getPriceText('annual', tab)}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.periodCard, selectedPeriod === 'monthly' && styles.periodCardActive]}
            onPress={() => setSelectedPeriod('monthly')}
          >
            <Text style={styles.periodLabel}>{t('paywall.monthly')}</Text>
            <Text style={[styles.periodPrice, selectedPeriod === 'monthly' && styles.periodPriceActive]}>
              {getPriceText('monthly', tab)}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Already subscribed message */}
        {((tab === 'premium' && isPremium) || (tab === 'instructor' && isInstructor)) ? (
          <View style={styles.subscribedBox}>
            <MaterialCommunityIcons name="check-circle" size={24} color={colors.success} />
            <Text style={styles.subscribedText}>{t('paywall.alreadySubscribed')}</Text>
          </View>
        ) : (
          <>
            {/* CTA Button */}
            <TouchableOpacity
              style={styles.ctaBtn}
              onPress={() => handlePurchase(getPackageId(selectedPeriod, tab))}
              disabled={purchasing}
              activeOpacity={0.7}
            >
              {purchasing ? (
                <ActivityIndicator color={colors.bg.primary} />
              ) : (
                <Text style={styles.ctaText}>{t('premium.trial')}</Text>
              )}
            </TouchableOpacity>

            {/* Restore */}
            <TouchableOpacity style={styles.restoreBtn} onPress={handleRestore} disabled={purchasing}>
              <Text style={styles.restoreText}>{t('premium.restore')}</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Disclaimer */}
        <Text style={styles.disclaimer}>{t('paywall.disclaimer')}</Text>
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
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  closeBtn: {
    minHeight: 44,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
    gap: spacing.lg,
  },
  heroSection: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  crown: {
    fontSize: 56,
  },
  heroTitle: {
    ...typography.heading.h1,
    fontFamily: typography.heading.fontFamily,
    color: colors.accent.light,
    textAlign: 'center',
  },
  heroDesc: {
    ...typography.body.regular,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: colors.bg.secondary,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 10,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: colors.accent.primary,
  },
  tabText: {
    ...typography.body.regular,
    color: colors.text.muted,
    fontWeight: '600',
  },
  tabTextActive: {
    color: colors.bg.primary,
    fontWeight: '700',
  },
  featuresCard: {
    backgroundColor: colors.bg.secondary,
    borderRadius: 16,
    padding: spacing.lg,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  featureText: {
    ...typography.body.regular,
    color: colors.text.primary,
    flex: 1,
  },
  featureDivider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: spacing.xs,
  },
  extraLabel: {
    ...typography.label.regular,
    color: colors.accent.light,
    fontSize: 11,
    fontWeight: '700',
  },
  periodRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  periodCard: {
    flex: 1,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 14,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.xs,
  },
  periodCardActive: {
    borderColor: colors.accent.primary,
    backgroundColor: `${colors.accent.primary}10`,
  },
  periodLabel: {
    ...typography.body.small,
    color: colors.text.muted,
    fontWeight: '600',
  },
  periodPrice: {
    ...typography.heading.h2,
    fontFamily: typography.heading.fontFamily,
    color: colors.text.secondary,
  },
  periodPriceActive: {
    color: colors.accent.light,
  },
  saveBadge: {
    position: 'absolute',
    top: -10,
    backgroundColor: colors.success,
    borderRadius: 10,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  saveBadgeText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '800',
  },
  subscribedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: `${colors.success}15`,
    borderRadius: 12,
    padding: spacing.lg,
  },
  subscribedText: {
    ...typography.body.regular,
    color: colors.success,
    fontWeight: '600',
  },
  ctaBtn: {
    backgroundColor: colors.accent.primary,
    borderRadius: 14,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 54,
  },
  ctaText: {
    ...typography.body.large,
    color: colors.bg.primary,
    fontWeight: '800',
  },
  restoreBtn: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    minHeight: 44,
    justifyContent: 'center',
  },
  restoreText: {
    ...typography.body.small,
    color: colors.text.muted,
    textDecorationLine: 'underline',
  },
  disclaimer: {
    ...typography.body.small,
    color: colors.text.muted,
    textAlign: 'center',
    fontSize: 10,
    lineHeight: 16,
    paddingHorizontal: spacing.lg,
  },
});
