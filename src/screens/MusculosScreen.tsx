import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { LanguageToggle, PremiumBanner } from '../components/ui';
import { EmptySearchState } from '../components/ui/EmptySearchState';
import { MuscleCard } from '../components/muscles/MuscleCard';
import { muscles, REGION_LABELS } from '../data/muscles';
import { FREE_MUSCLE_IDS } from '../services/paywall';
import { useIsPremium } from '../hooks/useFeatureFlags';
import { MuscleRegion } from '../utils/types';
import { colors, typography, spacing } from '../theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthorCredit } from '../components/ui/AuthorCredit';

const ALL_REGIONS: (MuscleRegion | 'all')[] = [
  'all', 'hombros', 'espalda', 'core', 'brazos', 'munecas_manos', 'cadera', 'rodillas', 'tobillos_pies', 'cuello',
];

export function MusculosScreen() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as 'es' | 'en';
  const navigation = useNavigation<any>();
  const isPremium = useIsPremium();
  const [search, setSearch] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<MuscleRegion | 'all'>('all');

  const filtered = useMemo(() => {
    let result = muscles;
    if (selectedRegion !== 'all') {
      result = result.filter((m) => m.region === selectedRegion);
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (m) =>
          m.name_es.toLowerCase().includes(q) ||
          m.name_en.toLowerCase().includes(q) ||
          m.name_latin.toLowerCase().includes(q)
      );
    }
    // Gate: free users only see limited muscles
    if (!isPremium) {
      result = result.filter((m) => FREE_MUSCLE_IDS.includes(m.id));
    }
    return result;
  }, [search, selectedRegion, isPremium]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <LanguageToggle />
        <Text style={styles.title}>{t('screens.musculos.title')}</Text>

        <TextInput
          style={styles.searchInput}
          placeholder={t('muscles.search')}
          placeholderTextColor={colors.text.muted}
          value={search}
          onChangeText={setSearch}
          autoCorrect={false}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersScroll}
          contentContainerStyle={styles.filtersContent}
        >
          {ALL_REGIONS.map((region) => {
            const isActive = region === selectedRegion;
            const label =
              region === 'all'
                ? t('muscles.allRegions')
                : REGION_LABELS[region][lang];
            return (
              <TouchableOpacity
                key={region}
                onPress={() => setSelectedRegion(region)}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
              >
                <Text
                  style={[styles.filterText, isActive && styles.filterTextActive]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <Text style={styles.count}>
          {t('muscles.count', { count: filtered.length })}
        </Text>
      </View>

      <FlashList
        data={filtered}
        keyExtractor={(item) => item.id}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<EmptySearchState />}
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <MuscleCard
              muscle={item}
              onPress={() => navigation.navigate('MuscleDetail', { muscleId: item.id })}
            />
          </View>
        )}
        ListFooterComponent={
          <>
            {!isPremium && (
              <View style={styles.cardWrapper}>
                <PremiumBanner feature={t('paywall.allMuscles')} />
              </View>
            )}
            <AuthorCredit />
          </>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    gap: spacing.md,
  },
  title: {
    ...typography.heading.h1,
    fontFamily: typography.heading.fontFamily,
    color: colors.accent.light,
  },
  searchInput: {
    backgroundColor: colors.bg.secondary,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    color: colors.text.primary,
    ...typography.body.regular,
    shadowColor: colors.accent.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  filtersScroll: {
    flexGrow: 0,
  },
  filtersContent: {
    gap: spacing.sm,
    paddingRight: spacing.xl,
  },
  filterChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 36,
    justifyContent: 'center',
  },
  filterChipActive: {
    backgroundColor: colors.accent.primary,
    borderColor: colors.accent.primary,
    shadowColor: colors.accent.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  filterText: {
    ...typography.body.small,
    color: colors.text.muted,
  },
  filterTextActive: {
    color: colors.bg.primary,
    fontWeight: '700',
  },
  count: {
    ...typography.body.small,
    color: colors.text.muted,
    paddingBottom: spacing.sm,
  },
  listContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  cardWrapper: {
    paddingBottom: spacing.md,
  },
});
