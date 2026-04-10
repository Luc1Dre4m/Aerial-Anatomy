import React, { useState, useRef, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, Pressable, Animated, PanResponder, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LanguageToggle, AuthorCredit, GlobalSearch } from '../components/ui';
import { MuscleOfTheDay } from '../components/ui/MuscleOfTheDay';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';
import { BodyMap } from '../components/body/BodyMap';
import { MuscleTooltip } from '../components/body/MuscleTooltip';
import { Anatomy3DViewer } from '../components/body/Anatomy3DViewer';
import { ViewModeToggle } from '../components/body/ViewModeToggle';
import { getMusclesByRegion, REGION_LABELS } from '../data/muscles';
import { MuscleRegion } from '../utils/types';
import { AnimatedTitle } from '../components/ui/AnimatedTitle';
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

  // Swipe gesture for 3D flip
  const panResponder = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return Math.abs(gestureState.dx) > 20 && Math.abs(gestureState.dy) < 40;
    },
    onPanResponderRelease: (_, gestureState) => {
      if (Math.abs(gestureState.dx) > 50) {
        // Swipe detected — flip
        const target = bodyViewRef.current === 'front' ? 'back' : 'front';
        flipTo(target);
      }
    },
  }), [flipTo]);

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

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <LanguageToggle />
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

      <View style={styles.bodyContainer} {...(viewMode === '2d' ? panResponder.panHandlers : {})}>
        {viewMode === '3d' ? (
          <ErrorBoundary>
            <Anatomy3DViewer
              highlightedMuscles={tooltipMuscleId ? [tooltipMuscleId] : []}
              onMuscleSelect={(muscleId) => {
                setSelectedRegion(null);
                setTooltipMuscleId(muscleId);
              }}
            />
          </ErrorBoundary>
        ) : (
          <>
            {/* Front face */}
            <Animated.View style={[
              styles.bodyFace,
              { opacity: frontOpacity, transform: [{ perspective: 800 }, { rotateY: frontRotateY }] },
            ]}>
              <BodyMap
                view="front"
                highlightedRegion={bodyView === 'front' ? selectedRegion : null}
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
            </Animated.View>

            {/* Back face */}
            <Animated.View style={[
              styles.bodyFace,
              { opacity: backOpacity, transform: [{ perspective: 800 }, { rotateY: backRotateY }] },
            ]}>
              <BodyMap
                view="back"
                highlightedRegion={bodyView === 'back' ? selectedRegion : null}
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
          <View style={styles.muscleList}>
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
          </View>
        </View>
      ) : (
        <View style={styles.hint}>
          <Text style={styles.hintText}>{t('body.tapToExplore')}</Text>
          <View style={styles.motdContainer}>
            <MuscleOfTheDay onPress={(id) => navigation.navigate('MuscleDetail', { muscleId: id })} />
          </View>
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
  viewToggle: {
    flexDirection: 'row',
    alignSelf: 'center',
    backgroundColor: colors.bg.secondary,
    borderRadius: 8,
    padding: 2,
    gap: 2,
  },
  viewBtn: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: 6,
    minHeight: 36,
    justifyContent: 'center',
  },
  viewBtnActive: {
    backgroundColor: colors.accent.primary,
  },
  viewBtnText: {
    ...typography.body.small,
    color: colors.text.muted,
    fontWeight: '600',
  },
  viewBtnTextActive: {
    color: colors.bg.primary,
  },
  bodyContainer: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
  },
  bodyFace: {
    ...StyleSheet.absoluteFillObject,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
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
});
