import React, { useState, useRef, useCallback, Suspense } from 'react';
import { View, Text, TouchableOpacity, Pressable, Animated, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LanguageToggle, AuthorCredit, GlobalSearch, StreakBadge } from '../components/ui';
import { MuscleOfTheDay } from '../components/ui/MuscleOfTheDay';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';
import { BodyMap } from '../components/body/BodyMap';
import { ZoomableBody } from '../components/body/ZoomableBody';
import { MuscleTooltip } from '../components/body/MuscleTooltip';
import { Anatomy3DViewer } from '../components/body/Anatomy3DViewer';
import { Anatomy3DPoCScene } from '../components/body/Anatomy3DPoCScene';

// Feature flag: switch the 3D tab between the legacy planar viewer and the
// new mesh-based PoC built on @react-three/fiber/native. Defaults to legacy.
const USE_3D_POC = process.env.EXPO_PUBLIC_3D_POC === 'true';
import { ViewModeToggle } from '../components/body/ViewModeToggle';

const Anatomy3DViewer = React.lazy(() =>
  import('../components/body/Anatomy3DViewer').then((m) => ({ default: m.Anatomy3DViewer })),
);
import { getMusclesByRegion, REGION_LABELS } from '../data/muscles';
import { MuscleRegion } from '../utils/types';
import { AnimatedTitle } from '../components/ui/AnimatedTitle';
import { useProgress } from '../hooks/useProgress';
import { useAppStore } from '../store/useAppStore';
import { getMuscleById } from '../data/muscles';
import { colors, typography, spacing } from '../theme';

export function CuerpoScreen() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as 'es' | 'en';
  const navigation = useNavigation<any>();
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
  const [bodyView, setBodyView] = useState<'front' | 'back'>('front');
  const [selectedRegion, setSelectedRegion] = useState<MuscleRegion | null>(null);
  const [tooltipMuscleId, setTooltipMuscleId] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const lastPressTime = useRef(0);

  // 3D flip animation
  const flipAnim = useRef(new Animated.Value(0)).current; // 0 = front, 1 = back
  const isFlipping = useRef(false);
  const bodyViewRef = useRef<'front' | 'back'>('front');

  const flipTo = useCallback((target: 'front' | 'back') => {
    if (isFlipping.current || bodyViewRef.current === target) return;
    isFlipping.current = true;
    const toValue = target === 'back' ? 1 : 0;

    // Phase 1: rotate to 90deg (edge-on)
    Animated.timing(flipAnim, {
      toValue: bodyViewRef.current === 'front' ? 0.5 : 0.5,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      // Swap the view at the midpoint
      setBodyView(target);
      bodyViewRef.current = target;
      setSelectedRegion(null);
      setTooltipMuscleId(null);

      // Phase 2: rotate from 90deg to final
      flipAnim.setValue(0.5);
      Animated.timing(flipAnim, {
        toValue,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        isFlipping.current = false;
      });
    });
  }, [flipAnim]);

  const handleFling = useCallback(() => {
    const target = bodyViewRef.current === 'front' ? 'back' : 'front';
    flipTo(target);
  }, [flipTo]);

  // Interpolate flip animation for 3D rotation effect
  const frontRotateY = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['0deg', '90deg', '180deg'],
  });
  const frontOpacity = flipAnim.interpolate({
    inputRange: [0, 0.49, 0.5, 1],
    outputRange: [1, 1, 0, 0],
  });
  const backRotateY = flipAnim.interpolate({
    inputRange: [0, 0.5, 0.51, 1],
    outputRange: ['180deg', '90deg', '90deg', '0deg'],
  });
  const backOpacity = flipAnim.interpolate({
    inputRange: [0, 0.5, 0.51, 1],
    outputRange: [0, 0, 1, 1],
  });

  const regionMuscles = selectedRegion ? getMusclesByRegion(selectedRegion) : [];
  const { totalVisited, totalMuscles, overallRatio } = useProgress();
  const recentMuscles = useAppStore((s) => s.recentMuscles);

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
        <AnimatedTitle text={t('screens.cuerpo.title')} style={styles.title} />
      </View>

      <ViewModeToggle
        viewMode={viewMode}
        onChangeMode={setViewMode}
        bodyView={bodyView}
        onChangeBodyView={(target) => flipTo(target)}
      />

      <View style={styles.bodyContainer}>
        {viewMode === '3d' ? (
          <ErrorBoundary>
            {USE_3D_POC ? (
              <Anatomy3DPoCScene />
            ) : (
              <Anatomy3DViewer
                highlightedMuscles={tooltipMuscleId ? [tooltipMuscleId] : []}
                onMuscleSelect={(muscleId) => {
                  setSelectedRegion(null);
                  setTooltipMuscleId(muscleId);
                }}
              />
            )}
          </ErrorBoundary>
        ) : (
          <>
            {/* Front face */}
            <Animated.View style={[
              styles.bodyFace,
              { opacity: frontOpacity, transform: [{ perspective: 800 }, { rotateY: frontRotateY }] },
            ]}>
              <ZoomableBody onFlingHorizontal={handleFling}>
                <BodyMap
                  view="front"
                  highlightedRegion={bodyView === 'front' ? selectedRegion : null}
                  selectedMuscleId={bodyView === 'front' ? tooltipMuscleId : null}
                  onRegionPress={(region) => {
                    if (bodyView !== 'front') return;
                    setTooltipMuscleId(null);
                    setSelectedRegion(region === selectedRegion ? null : region);
                  }}
                  onMusclePress={(muscleId) => {
                    if (bodyView !== 'front') return;
                    const now = Date.now();
                    if (now - lastPressTime.current < 300) return;
                    lastPressTime.current = now;
                    setSelectedRegion(null);
                    setTooltipMuscleId(muscleId);
                  }}
                />
              </ZoomableBody>
            </Animated.View>

            {/* Back face */}
            <Animated.View style={[
              styles.bodyFace,
              { opacity: backOpacity, transform: [{ perspective: 800 }, { rotateY: backRotateY }] },
            ]}>
              <ZoomableBody onFlingHorizontal={handleFling}>
                <BodyMap
                  view="back"
                  highlightedRegion={bodyView === 'back' ? selectedRegion : null}
                  selectedMuscleId={bodyView === 'back' ? tooltipMuscleId : null}
                  onRegionPress={(region) => {
                    if (bodyView !== 'back') return;
                    setTooltipMuscleId(null);
                    setSelectedRegion(region === selectedRegion ? null : region);
                  }}
                  onMusclePress={(muscleId) => {
                    if (bodyView !== 'back') return;
                    const now = Date.now();
                    if (now - lastPressTime.current < 300) return;
                    lastPressTime.current = now;
                    setSelectedRegion(null);
                    setTooltipMuscleId(muscleId);
                  }}
                />
              </ZoomableBody>
            </Animated.View>

            <View style={styles.swipeHint}>
              <MaterialCommunityIcons name="gesture-swipe-horizontal" size={16} color={colors.text.muted} />
              <Text style={styles.swipeHintText}>
                {t('body.swipeToRotate')}
              </Text>
            </View>
          </>
        )}
      </View>

      {tooltipMuscleId && (
        <>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setTooltipMuscleId(null)}
          />
          <MuscleTooltip
            muscleId={tooltipMuscleId}
            onViewDetail={(id) => {
              setTooltipMuscleId(null);
              navigation.navigate('MuscleDetail', { muscleId: id });
            }}
            onClose={() => setTooltipMuscleId(null)}
          />
        </>
      )}

      {selectedRegion ? (
        <View style={styles.regionPanel}>
          <Text style={styles.regionTitle}>{REGION_LABELS[selectedRegion][lang]}</Text>
          <Text style={styles.regionCount}>
            {t('muscles.count', { count: regionMuscles.length })}
          </Text>
          <ScrollView style={styles.muscleList} showsVerticalScrollIndicator={false} nestedScrollEnabled>
            {regionMuscles.map((m) => (
              <TouchableOpacity
                key={m.id}
                style={styles.muscleItem}
                onPress={() => navigation.navigate('MuscleDetail', { muscleId: m.id })}
              >
                <Text style={styles.muscleName}>
                  {lang === 'es' ? m.name_es : m.name_en}
                </Text>
                <Text style={styles.muscleLatin}>{m.name_latin}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      ) : (
        <View style={styles.hint}>
          <Text style={styles.hintText}>{t('body.tapToExplore')}</Text>
          <View style={styles.motdContainer}>
            <MuscleOfTheDay onPress={(id) => navigation.navigate('MuscleDetail', { muscleId: id })} />
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
      )}

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
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
  },
  bodyFace: {
    ...StyleSheet.absoluteFillObject,
    backfaceVisibility: 'hidden',
  },
  swipeHint: {
    position: 'absolute',
    bottom: 4,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    opacity: 0.5,
  },
  swipeHintText: {
    fontSize: 11,
    color: colors.text.muted,
  },
  regionPanel: {
    backgroundColor: colors.bg.secondary,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: spacing.xl,
    gap: spacing.sm,
    maxHeight: 200,
  },
  regionTitle: {
    ...typography.heading.h3,
    fontFamily: typography.heading.fontFamily,
    color: colors.accent.light,
  },
  regionCount: {
    ...typography.body.small,
    color: colors.text.muted,
  },
  muscleList: {
    maxHeight: 200,
    gap: spacing.sm,
  },
  muscleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.bg.tertiary,
    borderRadius: 8,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 44,
  },
  muscleName: {
    ...typography.body.regular,
    color: colors.text.primary,
    fontWeight: '600',
  },
  muscleLatin: {
    ...typography.body.small,
    color: colors.accent.muted,
    fontStyle: 'italic',
  },
  hint: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  hintText: {
    ...typography.body.regular,
    color: colors.text.muted,
    textAlign: 'center',
  },
  motdContainer: {
    width: '100%',
    marginTop: spacing.md,
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
