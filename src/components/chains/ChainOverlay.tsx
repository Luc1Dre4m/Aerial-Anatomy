import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { BiomechanicalChain } from '../../utils/types';
import { getMuscleById } from '../../data/muscles';
import { AnatomicalBody } from '../body/AnatomicalBody';
import { colors, typography, spacing } from '../../theme';

const STEP_DELAY = 500;

interface ChainOverlayProps {
  chain: BiomechanicalChain;
}

export function ChainOverlay({ chain }: ChainOverlayProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as 'es' | 'en';
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeCount, setActiveCount] = useState(chain.muscles_ordered.length);

  const chainMuscleData = useMemo(() => chain.muscles_ordered.map((cm) => {
    const muscle = getMuscleById(cm.muscle_id);
    return muscle ? { chainMuscle: cm, muscle } : null;
  }).filter(Boolean) as {
    chainMuscle: (typeof chain.muscles_ordered)[0];
    muscle: NonNullable<ReturnType<typeof getMuscleById>>;
  }[], [chain.muscles_ordered]);

  // Muscle IDs that are currently active in the animation
  const activeMuscleIds = useMemo(() => {
    return chainMuscleData.slice(0, activeCount).map((cz) => cz.muscle.id);
  }, [chainMuscleData, activeCount]);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const playAnimation = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setActiveCount(0);
    setIsPlaying(true);

    let step = 0;
    intervalRef.current = setInterval(() => {
      step++;
      setActiveCount(step);
      if (step >= chainMuscleData.length) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = null;
        setIsPlaying(false);
      }
    }, STEP_DELAY);
  }, [chainMuscleData.length]);

  const showAll = useCallback(() => {
    setActiveCount(chainMuscleData.length);
    setIsPlaying(false);
  }, [chainMuscleData.length]);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.playBtn, { borderColor: chain.color }, isPlaying && { backgroundColor: `${chain.color}15` }]}
        onPress={isPlaying ? showAll : playAnimation}
        activeOpacity={0.7}
      >
        <Text style={[styles.playBtnText, { color: chain.color }]}>
          {isPlaying ? '⏹' : '▶'} {isPlaying ? t('study.finish') : t('chains.muscleFlow')}
        </Text>
      </TouchableOpacity>

      <View style={styles.bodyContainer}>
        <AnatomicalBody
          view="front"
          bodyOpacity={0.5}
          highlightedMuscleIds={activeMuscleIds}
          highlightColor={chain.color}
          showInteractionZones={false}
        />
      </View>

      <View style={styles.legend}>
        {chainMuscleData.map((cz, idx) => {
          const muscleName = lang === 'es' ? cz.muscle.name_es : cz.muscle.name_en;
          const isActive = idx < activeCount;
          return (
            <View key={cz.chainMuscle.muscle_id} style={[styles.legendItem, !isActive && styles.legendItemInactive]}>
              <View style={[styles.legendDot, { backgroundColor: isActive ? chain.color : colors.text.muted }]}>
                <Text style={styles.legendDotText}>{idx + 1}</Text>
              </View>
              <Text style={[styles.legendName, isActive && { color: chain.color }]}>{muscleName}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.md },
  playBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    backgroundColor: colors.bg.tertiary, borderRadius: 10, borderWidth: 1,
    paddingVertical: spacing.md, paddingHorizontal: spacing.lg, minHeight: 44,
  },
  playBtnText: { ...typography.body.regular, fontWeight: '600' },
  bodyContainer: {
    width: '100%', aspectRatio: 300 / 460, maxHeight: 360,
    alignSelf: 'center', backgroundColor: colors.bg.primary, borderRadius: 16, overflow: 'hidden',
  },
  legend: { gap: spacing.xs },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: 2 },
  legendItemInactive: { opacity: 0.4 },
  legendDot: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  legendDotText: { ...typography.body.small, color: colors.bg.primary, fontWeight: '700', fontSize: 10 },
  legendName: { ...typography.body.regular, color: colors.text.secondary },
});
