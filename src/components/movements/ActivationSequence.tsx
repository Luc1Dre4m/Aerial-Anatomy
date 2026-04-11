import React, { useEffect, useCallback, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { MovementMuscle, MuscleRole } from '../../utils/types';
import { getMuscleById } from '../../data/muscles';
import { colors, typography, spacing } from '../../theme';

const ROLE_COLORS: Record<MuscleRole, string> = {
  agonista: colors.muscle.agonista,
  sinergista: colors.muscle.sinergista,
  estabilizador: colors.muscle.estabilizador,
  antagonista: colors.muscle.antagonista,
};

const STEP_DURATION = 600;
const STEP_DELAY = 400;

interface ActivationSequenceProps {
  muscles: MovementMuscle[];
  onMusclePress?: (muscleId: string) => void;
}

const SequenceStep = React.memo(function SequenceStep({
  mm,
  index,
  activeIndex,
  onPress,
}: {
  mm: MovementMuscle;
  index: number;
  activeIndex: number;
  onPress?: (muscleId: string) => void;
}) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as 'es' | 'en';
  const muscle = getMuscleById(mm.muscle_id);

  const isActive = index <= activeIndex;
  const isCurrent = index === activeIndex;

  const opacity = useRef(new Animated.Value(0.3)).current;
  const scale = useRef(new Animated.Value(0.95)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const enterAnim = Animated.parallel([
      Animated.timing(opacity, {
        toValue: isActive ? 1 : 0.3,
        duration: STEP_DURATION,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: isActive ? 1 : 0.95,
        useNativeDriver: true,
      }),
    ]);
    enterAnim.start();

    let loopAnim: Animated.CompositeAnimation | undefined;
    if (isCurrent) {
      loopAnim = Animated.loop(
        Animated.sequence([
          Animated.timing(glowOpacity, { toValue: 0.6, duration: 800, useNativeDriver: true }),
          Animated.timing(glowOpacity, { toValue: 0.2, duration: 800, useNativeDriver: true }),
        ])
      );
      loopAnim.start();
    } else {
      glowOpacity.setValue(0);
    }

    return () => {
      enterAnim.stop();
      loopAnim?.stop();
    };
  }, [isActive, isCurrent]);

  if (!muscle) return null;

  const muscleName = lang === 'es' ? muscle.name_es : muscle.name_en;
  const note = lang === 'es' ? mm.note_es : mm.note_en;
  const roleColor = ROLE_COLORS[mm.role];

  return (
    <Animated.View style={[styles.stepContainer, { opacity, transform: [{ scale }] }]}>
      <TouchableOpacity
        style={styles.stepTouchable}
        onPress={() => onPress?.(mm.muscle_id)}
        activeOpacity={0.7}
        disabled={!onPress}
      >
        {index > 0 && <View style={[styles.connectorLine, { backgroundColor: roleColor }]} />}

        <View style={styles.orderWrapper}>
          {isCurrent && (
            <Animated.View style={[styles.orderGlow, { backgroundColor: roleColor, opacity: glowOpacity }]} />
          )}
          <View style={[styles.orderCircle, { borderColor: roleColor }]}>
            <Text style={[styles.orderText, { color: roleColor }]}>
              {mm.activation_order}
            </Text>
          </View>
        </View>

        <View style={styles.stepContent}>
          <Text style={[styles.stepName, { color: isCurrent ? roleColor : colors.text.primary }]}>
            {muscleName}
          </Text>
          <View style={styles.stepMeta}>
            {mm.phase && (
              <Text style={styles.stepPhase}>{t(`phases.${mm.phase}`)}</Text>
            )}
            <Text style={[styles.stepIntensity, { color: roleColor }]}>
              {'●'.repeat(mm.intensity)}
              {'○'.repeat(5 - mm.intensity)}
            </Text>
          </View>
          {note && <Text style={styles.stepNote}>{note}</Text>}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

export function ActivationSequence({ muscles, onMusclePress }: ActivationSequenceProps) {
  const { t } = useTranslation();
  const sorted = [...muscles].sort((a, b) => a.activation_order - b.activation_order);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const playAnimation = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setActiveIndex(-1);
    setIsPlaying(true);

    let step = 0;
    intervalRef.current = setInterval(() => {
      if (step < sorted.length) {
        setActiveIndex(step);
        step++;
      } else {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = null;
        setIsPlaying(false);
      }
    }, STEP_DELAY + STEP_DURATION / 2);
  }, [sorted.length]);

  const showAll = useCallback(() => {
    setActiveIndex(sorted.length - 1);
    setIsPlaying(false);
  }, [sorted.length]);

  useEffect(() => {
    setActiveIndex(sorted.length - 1);
  }, [sorted.length]);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.playBtn, isPlaying && styles.playBtnActive]}
        onPress={isPlaying ? showAll : playAnimation}
        activeOpacity={0.7}
      >
        <Text style={styles.playBtnText}>
          {isPlaying ? '⏹' : '▶'} {isPlaying ? t('study.finish') : t('movements.activationSequence')}
        </Text>
      </TouchableOpacity>

      <View style={styles.stepsContainer}>
        {sorted.map((mm, idx) => (
          <SequenceStep
            key={`${mm.muscle_id}-${idx}`}
            mm={mm}
            index={idx}
            activeIndex={activeIndex}
            onPress={onMusclePress}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.md },
  playBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.bg.tertiary,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.accent.muted,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    minHeight: 44,
  },
  playBtnActive: {
    borderColor: colors.accent.primary,
    backgroundColor: `${colors.accent.primary}15`,
  },
  playBtnText: {
    ...typography.body.regular,
    color: colors.accent.primary,
    fontWeight: '600',
  },
  stepsContainer: { gap: 0 },
  stepContainer: { marginLeft: spacing.sm },
  stepTouchable: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
  },
  connectorLine: {
    position: 'absolute',
    left: 14,
    top: -spacing.sm,
    width: 2,
    height: spacing.sm + spacing.sm,
    opacity: 0.3,
  },
  orderWrapper: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderGlow: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  orderCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    backgroundColor: colors.bg.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderText: { ...typography.body.small, fontWeight: '700' },
  stepContent: { flex: 1, gap: 2 },
  stepName: { ...typography.body.regular, fontWeight: '600' },
  stepMeta: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  stepPhase: { ...typography.body.small, color: colors.text.muted, fontSize: 10 },
  stepIntensity: { fontSize: 8, letterSpacing: 1 },
  stepNote: { ...typography.body.small, color: colors.text.muted, fontStyle: 'italic' },
});
