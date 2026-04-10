import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { ExecutionPhase } from '../../utils/types';
import { PosedFigure } from './PosedFigure';
import { PHASE_POSE_MAP } from '../../data/poses';
import { StickFigure } from './StickFigure';
import { BreathingIndicator } from './BreathingIndicator';
import { ActiveMusclesList } from './ActiveMusclesList';
import { PhaseNavigation } from './PhaseNavigation';
import { colors, typography, spacing } from '../../theme';

interface MovementExecutionProps {
  phases: ExecutionPhase[];
  movementId: string;
  onMusclePress?: (muscleId: string) => void;
}

const BREATHING_LABELS: Record<ExecutionPhase['breathing'], { es: string; en: string }> = {
  inhale: { es: 'Inhalar', en: 'Inhale' },
  exhale: { es: 'Exhalar', en: 'Exhale' },
  hold: { es: 'Aguantar', en: 'Hold' },
  natural: { es: 'Natural', en: 'Natural' },
};

export function MovementExecution({ phases, movementId, onMusclePress }: MovementExecutionProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as 'es' | 'en';
  const [currentPhase, setCurrentPhase] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const breathPulse = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const directionRef = useRef<'forward' | 'backward'>('forward');

  const phase = phases[currentPhase];
  const totalDuration = phases.reduce((sum, p) => sum + (p.duration_seconds ?? 5), 0);

  // Pulsing breathing animation
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(breathPulse, { toValue: 1.15, duration: 1000, useNativeDriver: true }),
        Animated.timing(breathPulse, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [breathPulse]);

  const goToPhase = useCallback((index: number) => {
    const dir = index > currentPhase ? 'forward' : 'backward';
    directionRef.current = dir;
    const slideOut = dir === 'forward' ? -30 : 30;
    const slideIn = dir === 'forward' ? 30 : -30;

    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 120, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: slideOut, duration: 120, useNativeDriver: true }),
    ]).start(() => {
      setCurrentPhase(index);
      progressAnim.setValue(0);
      slideAnim.setValue(slideIn);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 180, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 180, useNativeDriver: true }),
      ]).start();
    });
  }, [fadeAnim, slideAnim, progressAnim, currentPhase]);

  // Auto-play logic
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    const duration = (phases[currentPhase]?.duration_seconds ?? 5) * 1000;

    Animated.timing(progressAnim, {
      toValue: 1,
      duration,
      useNativeDriver: false,
    }).start();

    timerRef.current = setTimeout(() => {
      if (currentPhase < phases.length - 1) {
        goToPhase(currentPhase + 1);
      } else {
        setIsPlaying(false);
        progressAnim.setValue(0);
      }
    }, duration);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, currentPhase, phases, goToPhase, progressAnim]);

  const togglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      progressAnim.stopAnimation();
    } else {
      if (currentPhase === phases.length - 1) {
        goToPhase(0);
        setTimeout(() => setIsPlaying(true), 400);
      } else {
        setIsPlaying(true);
      }
    }
  };

  const phaseName = lang === 'es' ? phase.name_es : phase.name_en;
  const phaseDesc = lang === 'es' ? phase.description_es : phase.description_en;
  const cues = lang === 'es' ? phase.cues_es : phase.cues_en;
  const breathLabel = BREATHING_LABELS[phase.breathing][lang];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.sectionLabel}>{t('execution.title')}</Text>
        <TouchableOpacity onPress={togglePlay} style={styles.playBtn}>
          <MaterialCommunityIcons
            name={isPlaying ? 'pause' : 'play'}
            size={20}
            color={colors.accent.primary}
          />
          <Text style={styles.playText}>
            {isPlaying ? t('execution.pause') : t('execution.auto')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Segmented timeline */}
      <View style={styles.timelineContainer}>
        <View style={styles.timelineRow}>
          {phases.map((p, i) => {
            const isActive = i === currentPhase;
            const isDone = i < currentPhase;

            return (
              <TouchableOpacity
                key={p.phase_number}
                onPress={() => { setIsPlaying(false); goToPhase(i); }}
                style={[styles.timelineSegment, { flex: p.duration_seconds ?? 5 }]}
              >
                <View style={styles.segmentTrack}>
                  {isDone ? (
                    <View style={[styles.segmentFill, { width: '100%' }]} />
                  ) : isActive ? (
                    <Animated.View style={[styles.segmentFill, {
                      width: progressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%'],
                      }),
                    }]} />
                  ) : null}
                </View>
                <Text style={[styles.segmentLabel, isActive && styles.segmentLabelActive]}>
                  {i + 1}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <View style={styles.timelineLabels}>
          {phases.map((p, i) => (
            <View key={p.phase_number} style={{ flex: p.duration_seconds ?? 5 }}>
              {i === currentPhase && (
                <Text style={styles.timelinePhaseName} numberOfLines={1}>
                  {lang === 'es' ? p.name_es : p.name_en}
                </Text>
              )}
            </View>
          ))}
        </View>
      </View>

      {/* Phase content with slide animation */}
      <Animated.View style={[
        styles.phaseContent,
        { opacity: fadeAnim, transform: [{ translateX: slideAnim }] },
      ]}>
        <BreathingIndicator
          breathing={phase.breathing}
          breathingLabel={breathLabel}
          phaseLabel={`${t('execution.phase')} ${phase.phase_number} — ${phaseName}`}
          durationSeconds={phase.duration_seconds}
          breathPulse={breathPulse}
        />

        {/* Figure + description */}
        <View style={styles.mainRow}>
          <View style={styles.figureContainer}>
            {PHASE_POSE_MAP[phase.stick_figure_key] ? (
              <PosedFigure
                poseKey={phase.stick_figure_key}
                size={90}
                highlightedMuscles={phase.active_muscles}
              />
            ) : (
              <StickFigure movementId={phase.stick_figure_key} size={90} />
            )}
          </View>
          <View style={styles.descContainer}>
            <Text style={styles.phaseDesc}>{phaseDesc}</Text>
          </View>
        </View>

        <ActiveMusclesList
          muscles={phase.active_muscles}
          onMusclePress={onMusclePress}
        />

        {/* Cues */}
        {cues.length > 0 && (
          <View style={styles.cuesSection}>
            {cues.map((cue, i) => (
              <View key={i} style={styles.cueRow}>
                <MaterialCommunityIcons name="check-circle" size={14} color={colors.accent.primary} />
                <Text style={styles.cueText}>{cue}</Text>
              </View>
            ))}
          </View>
        )}
      </Animated.View>

      <PhaseNavigation
        currentPhase={currentPhase}
        totalPhases={phases.length}
        onPrevious={() => { setIsPlaying(false); goToPhase(Math.max(0, currentPhase - 1)); }}
        onNext={() => { setIsPlaying(false); goToPhase(Math.min(phases.length - 1, currentPhase + 1)); }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bg.secondary,
    borderRadius: 16,
    padding: spacing.lg,
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionLabel: {
    ...typography.label.regular,
    color: colors.accent.primary,
    fontSize: 11,
    letterSpacing: 1.5,
  },
  playBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.bg.tertiary,
    borderRadius: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  playText: {
    ...typography.body.small,
    color: colors.accent.primary,
    fontWeight: '600',
  },
  timelineContainer: {
    gap: 4,
  },
  timelineRow: {
    flexDirection: 'row',
    gap: 3,
  },
  timelineSegment: {
    alignItems: 'center',
    gap: 2,
  },
  segmentTrack: {
    height: 4,
    backgroundColor: colors.bg.tertiary,
    borderRadius: 2,
    overflow: 'hidden',
    width: '100%',
  },
  segmentFill: {
    height: '100%',
    backgroundColor: colors.accent.primary,
    borderRadius: 2,
  },
  segmentLabel: {
    fontSize: 10,
    color: colors.text.muted,
    fontWeight: '700',
  },
  segmentLabelActive: {
    color: colors.accent.primary,
  },
  timelineLabels: {
    flexDirection: 'row',
    gap: 3,
  },
  timelinePhaseName: {
    fontSize: 10,
    color: colors.accent.light,
    textAlign: 'center',
    fontWeight: '600',
  },
  phaseContent: {
    gap: spacing.md,
  },
  mainRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  figureContainer: {
    width: 100,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg.primary,
    borderRadius: 12,
    padding: spacing.xs,
  },
  descContainer: {
    flex: 1,
    gap: spacing.xs,
  },
  phaseDesc: {
    ...typography.body.regular,
    color: colors.text.primary,
    lineHeight: 22,
  },
  cuesSection: {
    gap: spacing.xs,
    paddingLeft: spacing.xs,
  },
  cueRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  cueText: {
    ...typography.body.small,
    color: colors.text.secondary,
    flex: 1,
    lineHeight: 18,
  },
});
