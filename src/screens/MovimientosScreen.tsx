import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LanguageToggle, PremiumBanner } from '../components/ui';
import { EmptySearchState } from '../components/ui/EmptySearchState';
import { AuthorCredit } from '../components/ui/AuthorCredit';
import { FREE_MOVEMENT_IDS } from '../services/paywall';
import { useIsPremium } from '../hooks/useFeatureFlags';
import { MovementCard } from '../components/movements/MovementCard';
import { movements } from '../data/movements';
import { disciplines } from '../data/disciplines';
import { MovementLevel } from '../utils/types';
import { colors, typography, spacing } from '../theme';

const LEVELS: (MovementLevel | 'all')[] = ['all', 'fundamentals', 'basico', 'intermedio', 'avanzado', 'elite'];

export function MovimientosScreen() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as 'es' | 'en';
  const navigation = useNavigation<any>();
  const isPremium = useIsPremium();
  const [search, setSearch] = useState('');
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<MovementLevel | 'all'>('all');

  const filtered = useMemo(() => {
    let result = movements;
    if (selectedDiscipline !== 'all') {
      result = result.filter((m) => m.disciplines.includes(selectedDiscipline));
    }
    if (selectedLevel !== 'all') {
      result = result.filter((m) => m.level === selectedLevel);
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (m) =>
          m.name_es.toLowerCase().includes(q) ||
          m.name_en.toLowerCase().includes(q)
      );
    }
    // Gate: free users only see limited movements
    if (!isPremium) {
      result = result.filter((m) => FREE_MOVEMENT_IDS.includes(m.id));
    }
    return result;
  }, [search, selectedDiscipline, selectedLevel, isPremium]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <LanguageToggle />
          <TouchableOpacity
            style={styles.preTrainBtn}
            onPress={() => navigation.navigate('PreTraining')}
          >
            <MaterialCommunityIcons name="fire" size={18} color={colors.accent.primary} />
            <Text style={styles.preTrainText}>{t('preTraining.title')}</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.title}>{t('screens.movimientos.title')}</Text>

        <TextInput
          style={styles.searchInput}
          placeholder={t('movements.search')}
          placeholderTextColor={colors.text.muted}
          value={search}
          onChangeText={setSearch}
          autoCorrect={false}
        />

        {/* Discipline filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersScroll}
          contentContainerStyle={styles.filtersContent}
        >
          <TouchableOpacity
            onPress={() => setSelectedDiscipline('all')}
            style={[styles.filterChip, selectedDiscipline === 'all' && styles.filterChipGoldActive]}
          >
            <Text style={[styles.filterText, selectedDiscipline === 'all' && styles.filterTextDark]}>
              {t('movements.allDisciplines')}
            </Text>
          </TouchableOpacity>
          {disciplines.map((d) => {
            const isActive = selectedDiscipline === d.id;
            return (
              <TouchableOpacity
                key={d.id}
                onPress={() => setSelectedDiscipline(d.id)}
                style={[
                  styles.filterChip,
                  { borderColor: d.color },
                  isActive && { backgroundColor: d.color },
                ]}
              >
                <Text style={[styles.filterText, { color: isActive ? colors.bg.primary : d.color }]}>
                  {lang === 'es' ? d.name_es.split(' ')[0] : d.name_en.split(' ')[0]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Level filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersScroll}
          contentContainerStyle={styles.filtersContent}
        >
          {LEVELS.map((level) => {
            const isActive = level === selectedLevel;
            const label = level === 'all' ? t('movements.allLevels') : t(`levels.${level}`);
            return (
              <TouchableOpacity
                key={level}
                onPress={() => setSelectedLevel(level)}
                style={[styles.levelChip, isActive && styles.levelChipActive]}
              >
                <Text style={[styles.levelText, isActive && styles.levelTextActive]}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <Text style={styles.count}>
          {t('movements.count', { count: filtered.length })}
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
            <MovementCard
              movement={item}
              onPress={() => navigation.navigate('MovementDetail', { movementId: item.id })}
            />
          </View>
        )}
        ListFooterComponent={
          <>
            {!isPremium && (
              <View style={styles.cardWrapper}>
                <PremiumBanner feature={t('paywall.allMovements')} />
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  preTrainBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: `${colors.accent.primary}10`,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.accent.muted,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 36,
  },
  preTrainText: {
    ...typography.body.small,
    color: colors.accent.primary,
    fontWeight: '600',
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
  filterChipGoldActive: {
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
    fontWeight: '600',
  },
  filterTextDark: {
    color: colors.bg.primary,
    fontWeight: '700',
  },
  levelChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    minHeight: 30,
    justifyContent: 'center',
  },
  levelChipActive: {
    backgroundColor: colors.bg.tertiary,
    borderColor: colors.accent.muted,
  },
  levelText: {
    ...typography.body.small,
    color: colors.text.muted,
    fontSize: 11,
  },
  levelTextActive: {
    color: colors.accent.light,
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
