import React, { useState, useCallback, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LanguageToggle, AuthorCredit, GlobalSearch, StreakBadge } from '../components/ui';
import { MuscleOfTheDay } from '../components/ui/MuscleOfTheDay';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';
import { Anatomy3DViewer } from '../components/body/Anatomy3DViewer';
import { MuscleInfoCard } from '../components/body/MuscleInfoCard';
import { Anatomy3DTutorial } from '../components/body/Anatomy3DTutorial';
import { AnimatedTitle } from '../components/ui/AnimatedTitle';
import { useAppStore } from '../store/useAppStore';
import { getMuscleById } from '../data/muscles';
import { useProgress } from '../hooks/useProgress';
import { colors, typography, spacing } from '../theme';

export function CuerpoScreen() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as 'es' | 'en';
  const navigation = useNavigation<any>();
  const [selectedMuscleId, setSelectedMuscleId] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  // Progress + recent chips come from origin/main (StreakBadge sprint).
  // They live in the same slot as MOTD, shown when no muscle is selected.
  const recentMuscles = useAppStore((s) => s.recentMuscles);
  const { totalVisited, totalMuscles, overallRatio } = useProgress();
  // Tutorial overlay 3D — Sprint A2 #4 (junta directiva 2026-05-15, Tomás).
  // El flag vive en el store persistido; una vez marcado, no vuelve a aparecer.
  // Sólo mostrar cuando onboarding ya terminó (evita stack de overlays al
  // primer arranque) y no hay GlobalSearch abierto.
  const tutorial3DComplete = useAppStore((s) => s.tutorial3DComplete);
  const onboardingComplete = useAppStore((s) => s.onboardingComplete);
  const completeTutorial3D = useAppStore((s) => s.completeTutorial3D);
  const showTutorial =
    onboardingComplete && !tutorial3DComplete && !showSearch;
  // We keep the LAST muscle id in a ref so the MuscleInfoCard component
  // stays mounted (with the previous content) even when the user closes
  // the panel. The card is just hidden via opacity, so the next pick is a
  // cheap prop-update + visibility flip instead of a full mount + layout.
  const lastSelectedRef = useRef<string | null>(null);
  if (selectedMuscleId !== null) {
    lastSelectedRef.current = selectedMuscleId;
  }
  const cardMuscleId = lastSelectedRef.current;

  // Stable callback so the memoized Anatomy3DViewer doesn't see a new identity
  // on every render — important to avoid Canvas/MuscleGroups re-mounts.
  const handleMuscle3DSelect = useCallback((muscleId: string) => {
    setSelectedMuscleId(muscleId);
  }, []);

  const handleCloseInfo = useCallback(() => {
    setSelectedMuscleId(null);
  }, []);

  const handleViewDetail = useCallback(
    (muscleId: string) => {
      navigation.navigate('MuscleDetail', { muscleId });
    },
    [navigation]
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <LanguageToggle />
            <StreakBadge compact />
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.aboutBtn}
              onPress={() => setShowSearch(true)}
              accessibilityRole="button"
              accessibilityLabel={t('search.placeholder')}
            >
              <MaterialCommunityIcons name="magnify" size={22} color={colors.text.muted} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.aboutBtn}
              onPress={() => navigation.navigate('About')}
              accessibilityRole="button"
              accessibilityLabel={t('about.title')}
            >
              <MaterialCommunityIcons name="information-outline" size={22} color={colors.text.muted} />
            </TouchableOpacity>
          </View>
        </View>
        <AnimatedTitle text={t('screens.cuerpo.title')} style={styles.title} testID="CuerpoScreen:Header" />
      </View>

      <View style={styles.bodyContainer}>
        <ErrorBoundary>
          <Anatomy3DViewer
            highlightedMuscles={selectedMuscleId ? [selectedMuscleId] : []}
            selectedMuscleId={selectedMuscleId}
            onMuscleSelect={handleMuscle3DSelect}
          />
        </ErrorBoundary>
      </View>

      {/*
        Fixed-height slot. Holds either MuscleInfoCard (when something is
        selected) or MuscleOfTheDay (default). Height is fixed so the
        bodyContainer above does NOT resize when the user selects/deselects
        — that resize was making the Canvas blank out (R3F + expo-gl can't
        seem to recover from a runtime resize cleanly).
      */}
      <View style={styles.secondarySlot}>
        {/*
          Both MOTD and MuscleInfoCard live here as overlapping absolute
          children, with the inactive one hidden via opacity 0 + pointer-
          events 'none'. That keeps both mounted across selection toggles —
          the first pick still pays the mount cost, but every subsequent
          pick is just a prop change + opacity flip, which feels instant.
        */}
        <View
          style={[styles.slotChild, selectedMuscleId !== null && styles.hidden]}
          pointerEvents={selectedMuscleId !== null ? 'none' : 'auto'}
        >
          <View style={styles.motdWrapper}>
            <MuscleOfTheDay onPress={handleViewDetail} />
          </View>
          {totalVisited > 0 && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${Math.round(overallRatio * 100)}%` }]} />
              </View>
              <Text style={styles.progressText}>
                {t('body.explored', { visited: totalVisited, total: totalMuscles })}
              </Text>
            </View>
          )}
          {recentMuscles.length > 0 && (
            <View style={styles.recentSection}>
              <Text style={styles.recentTitle}>{t('body.recent')}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recentScroll}>
                {recentMuscles.slice(0, 6).map((id) => {
                  const m = getMuscleById(id);
                  if (!m) return null;
                  return (
                    <TouchableOpacity
                      key={id}
                      style={styles.recentChip}
                      onPress={() => navigation.navigate('MuscleDetail', { muscleId: id })}
                    >
                      <Text style={styles.recentChipText}>
                        {lang === 'es' ? m.name_es : m.name_en}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}
        </View>
        {cardMuscleId !== null && (
          <View
            style={[styles.slotChild, selectedMuscleId === null && styles.hidden]}
            pointerEvents={selectedMuscleId === null ? 'none' : 'auto'}
          >
            <MuscleInfoCard
              muscleId={cardMuscleId}
              onClose={handleCloseInfo}
              onViewDetail={handleViewDetail}
            />
          </View>
        )}
      </View>

      <AuthorCredit />

      {showSearch && (
        <GlobalSearch
          onSelectMuscle={(id) => {
            setShowSearch(false);
            navigation.navigate('MuscleDetail', { muscleId: id });
          }}
          onSelectMovement={(id) => {
            setShowSearch(false);
            navigation.navigate('MovementDetail', { movementId: id });
          }}
          onClose={() => setShowSearch(false)}
        />
      )}

      {showTutorial && <Anatomy3DTutorial onFinish={completeTutorial3D} />}
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
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 0,
  },
  aboutBtn: {
    minHeight: 44,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typography.heading.h1,
    fontFamily: typography.heading.fontFamily,
    color: colors.accent.light,
    marginBottom: spacing.sm,
  },
  bodyContainer: {
    flex: 1,
  },
  // Fixed height keeps the bodyContainer's vertical extent stable when the
  // contents of this slot switch between MOTD card and the muscle info card.
  // 220 DIPs leaves more room for the canvas above; the InfoCard's ScrollView
  // makes long content reachable even at this height. Padding is on
  // `slotChild` instead of here so absolute children share the same offsets.
  secondarySlot: {
    height: 220,
    position: 'relative',
  },
  motdWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  // Both MOTD and InfoCard are absolute-positioned siblings within the slot
  // so they overlap without affecting each other's layout. Only one is
  // visible at a time via `hidden`.
  slotChild: {
    ...StyleSheet.absoluteFillObject,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  hidden: {
    opacity: 0,
  },
  progressContainer: {
    width: '100%',
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.bg.tertiary,
    overflow: 'hidden' as const,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: colors.accent.primary,
  },
  progressText: {
    ...typography.body.small,
    color: colors.text.muted,
    textAlign: 'center' as const,
    fontSize: 11,
  },
  recentSection: {
    width: '100%',
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  recentTitle: {
    ...typography.label.regular,
    color: colors.accent.primary,
    fontSize: 10,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
  },
  recentScroll: {
    gap: spacing.sm,
  },
  recentChip: {
    backgroundColor: colors.bg.tertiary,
    borderRadius: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  recentChipText: {
    ...typography.body.small,
    color: colors.text.secondary,
    fontSize: 12,
  },
});
