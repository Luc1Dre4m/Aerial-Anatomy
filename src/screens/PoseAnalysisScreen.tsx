import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Dimensions, ScrollView, BackHandler, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import { useAppStore } from '../store/useAppStore';
import { getFeatureFlags } from '../services/paywall';
import { initPoseDetection } from '../services/poseDetection';
import { analyzeMovementPhase, calculateFormScore, PhaseAnalysis, FormScore } from '../services/motionAnalysis';
import { usePoseDetection } from '../hooks/usePoseDetection';
import { PoseOverlay } from '../components/pose/PoseOverlay';
import { DetectedMusclesList } from '../components/pose/DetectedMusclesList';
import { CameraPermissionView } from '../components/pose/CameraPermissionView';
import { MotionFeedbackOverlay } from '../components/pose/MotionFeedbackOverlay';
import { FormScoreCard } from '../components/pose/FormScoreCard';
import { PremiumBanner } from '../components/ui/PremiumBanner';
import { movements } from '../data/movements';
import { Movement } from '../utils/types';
import { colors, typography, spacing } from '../theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CAMERA_HEIGHT = SCREEN_HEIGHT * 0.6;

type AnalysisMode = 'detect' | 'selectMovement' | 'recording' | 'countdown' | 'results';

export function PoseAnalysisScreen() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as 'es' | 'en';
  const navigation = useNavigation<any>();
  const subscription = useAppStore((s) => s.subscription);
  const addMotionSession = useAppStore((s) => s.addMotionSession);
  const flags = getFeatureFlags(subscription);

  const [permissionStatus, setPermissionStatus] = useState<'pending' | 'granted' | 'denied'>('pending');
  const [isActive, setIsActive] = useState(true);
  const cameraRef = useRef<Camera>(null);
  const device = useCameraDevice('front');

  const { landmarks, detectedMuscles, isDetecting, processFrame, reset } = usePoseDetection();

  // Motion analysis state
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>('detect');
  const [selectedMovement, setSelectedMovement] = useState<Movement | null>(null);
  const [countdown, setCountdown] = useState(3);
  const [currentAnalysis, setCurrentAnalysis] = useState<PhaseAnalysis | null>(null);
  const [phaseHistory, setPhaseHistory] = useState<PhaseAnalysis[]>([]);
  const [formScore, setFormScore] = useState<FormScore | null>(null);
  const [recordingStart, setRecordingStart] = useState(0);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearIntervals = useCallback(() => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  }, []);

  useEffect(() => {
    checkPermission();
    return () => {
      setIsActive(false);
      reset();
      clearIntervals();
    };
  }, []);

  // Deactivate camera when not needed (saves battery/CPU)
  useEffect(() => {
    setIsActive(analysisMode === 'detect' || analysisMode === 'recording');
  }, [analysisMode]);

  // BackHandler for Android hardware back in overlay modes
  useEffect(() => {
    if (analysisMode !== 'selectMovement' && analysisMode !== 'countdown') return;

    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      clearIntervals();
      setAnalysisMode('detect');
      setSelectedMovement(null);
      return true;
    });
    return () => sub.remove();
  }, [analysisMode, clearIntervals]);

  const checkPermission = useCallback(async () => {
    const granted = await initPoseDetection();
    setPermissionStatus(granted ? 'granted' : 'denied');
  }, []);

  // Start motion analysis flow
  const handleStartAnalysis = useCallback(() => {
    if (flags.motionAnalysis) {
      setAnalysisMode('selectMovement');
    } else {
      navigation.navigate('Paywall');
    }
  }, [flags.motionAnalysis, navigation]);

  const handleSelectMovement = useCallback((mv: Movement) => {
    clearIntervals();
    setSelectedMovement(mv);
    setCountdown(3);
    setAnalysisMode('countdown');
    setPhaseHistory([]);

    // Countdown timer
    let count = 3;
    countdownRef.current = setInterval(() => {
      count -= 1;
      setCountdown(count);
      if (count <= 0) {
        if (countdownRef.current) clearInterval(countdownRef.current);
        countdownRef.current = null;
        setAnalysisMode('recording');
        setRecordingStart(Date.now());
      }
    }, 1000);
  }, [clearIntervals]);

  // Run analysis during recording
  useEffect(() => {
    if (analysisMode !== 'recording' || !selectedMovement || landmarks.length < 33) return;

    const analysis = analyzeMovementPhase(landmarks, selectedMovement);
    if (analysis) {
      setCurrentAnalysis(analysis);
      setPhaseHistory((prev) => [...prev, analysis]);
    }
  }, [analysisMode, landmarks, selectedMovement]);

  const handleStopRecording = useCallback(() => {
    if (selectedMovement && phaseHistory.length > 0) {
      const score = calculateFormScore(phaseHistory, selectedMovement);
      setFormScore(score);
      setAnalysisMode('results');
    } else {
      setAnalysisMode('detect');
    }
  }, [selectedMovement, phaseHistory]);

  const handleSaveSession = useCallback(() => {
    if (!selectedMovement || !formScore) return;

    addMotionSession({
      id: `ms_${Date.now()}`,
      date: new Date().toISOString(),
      movementId: selectedMovement.id,
      overallScore: formScore.overall,
      phaseScores: formScore.phaseScores.map((ps) => ps.score),
      duration: Date.now() - recordingStart,
    });

    setAnalysisMode('detect');
    setSelectedMovement(null);
    setFormScore(null);
    setPhaseHistory([]);
    setCurrentAnalysis(null);
  }, [selectedMovement, formScore, recordingStart, addMotionSession]);

  const handleDismissResults = useCallback(() => {
    setAnalysisMode('detect');
    setSelectedMovement(null);
    setFormScore(null);
    setPhaseHistory([]);
    setCurrentAnalysis(null);
  }, []);

  // Premium gate
  if (!flags.poseDetection) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('features.poseDetectionTitle')}</Text>
          <View style={styles.backBtn} />
        </View>
        <View style={styles.premiumContainer}>
          <PremiumBanner />
        </View>
      </SafeAreaView>
    );
  }

  // Camera permission not granted
  if (permissionStatus !== 'granted') {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('features.poseDetectionTitle')}</Text>
          <View style={styles.backBtn} />
        </View>
        <CameraPermissionView
          onRequestPermission={checkPermission}
          denied={permissionStatus === 'denied'}
        />
      </SafeAreaView>
    );
  }

  // No camera device
  if (!device) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('features.poseDetectionTitle')}</Text>
          <View style={styles.backBtn} />
        </View>
        <View style={styles.noCameraContainer}>
          <MaterialCommunityIcons name="camera-off" size={48} color={colors.text.muted} />
          <Text style={styles.noCameraText}>No camera available</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Results view
  if (analysisMode === 'results' && formScore && selectedMovement) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleDismissResults} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('motion.formScore')}</Text>
          <View style={styles.backBtn} />
        </View>
        <ScrollView contentContainerStyle={styles.resultsScroll}>
          <FormScoreCard
            score={formScore}
            movementName={lang === 'es' ? selectedMovement.name_es : selectedMovement.name_en}
            duration={Date.now() - recordingStart}
            onSave={handleSaveSession}
            onDismiss={handleDismissResults}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Movement selection
  if (analysisMode === 'selectMovement') {
    const analysisMovements = movements.filter(
      (m) => m.execution_phases && m.execution_phases.length > 0
    );

    return (
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => setAnalysisMode('detect')}
            style={styles.backBtn}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('motion.selectMovement')}</Text>
          <View style={styles.backBtn} />
        </View>
        <ScrollView contentContainerStyle={styles.movementList}>
          {analysisMovements.map((mv) => (
            <TouchableOpacity
              key={mv.id}
              style={styles.movementItem}
              onPress={() => handleSelectMovement(mv)}
              activeOpacity={0.7}
            >
              <View style={styles.movementInfo}>
                <Text style={styles.movementName}>
                  {lang === 'es' ? mv.name_es : mv.name_en}
                </Text>
                <Text style={styles.movementMeta}>
                  {t(`levels.${mv.level}`)} • {mv.execution_phases?.length ?? 0} {t('motion.phase').toLowerCase()}s
                </Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color={colors.text.muted} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('features.poseDetectionTitle')}</Text>
        <View style={styles.backBtn} />
      </View>

      {/* Camera View */}
      <View style={styles.cameraContainer}>
        <Camera
          ref={cameraRef}
          style={styles.camera}
          device={device}
          isActive={isActive}
          photo={false}
          video={false}
        />

        {/* Pose overlay */}
        <PoseOverlay
          landmarks={landmarks}
          width={SCREEN_WIDTH}
          height={CAMERA_HEIGHT}
        />

        {/* Countdown overlay */}
        {analysisMode === 'countdown' && (
          <View style={styles.countdownOverlay}>
            <Text style={styles.countdownNumber}>{countdown}</Text>
            <Text style={styles.countdownLabel}>
              {lang === 'es' ? selectedMovement?.name_es : selectedMovement?.name_en}
            </Text>
          </View>
        )}

        {/* Motion feedback overlay during recording */}
        {analysisMode === 'recording' && selectedMovement && (
          <MotionFeedbackOverlay
            analysis={currentAnalysis}
            totalPhases={selectedMovement.execution_phases?.length ?? 0}
            phaseNames={
              selectedMovement.execution_phases?.map((p) =>
                lang === 'es' ? p.description_es : p.description_en
              ) ?? []
            }
          />
        )}

        {/* Status indicator */}
        <View style={styles.statusBar}>
          <View style={[styles.statusDot, isDetecting ? styles.statusActive : styles.statusInactive]} />
          <Text style={styles.statusText}>
            {analysisMode === 'recording'
              ? t('motion.analyzing')
              : isDetecting ? t('pose.detecting') : t('pose.noPersonDetected')}
          </Text>
        </View>
      </View>

      {/* Bottom panel */}
      <View style={styles.bottomPanel}>
        {analysisMode === 'recording' ? (
          /* Recording controls */
          <View style={styles.actions}>
            <TouchableOpacity style={styles.stopBtn} onPress={handleStopRecording}>
              <MaterialCommunityIcons name="stop-circle" size={20} color={colors.bg.primary} />
              <Text style={styles.stopBtnText}>{t('motion.stopRecording', 'Detener')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <DetectedMusclesList
              muscles={detectedMuscles}
              onMusclePress={(id) => navigation.navigate('MuscleDetail', { muscleId: id })}
            />
            <View style={styles.actions}>
              <TouchableOpacity style={styles.analysisBtn} onPress={handleStartAnalysis}>
                <MaterialCommunityIcons name="run-fast" size={20} color={colors.bg.primary} />
                <Text style={styles.analysisBtnText}>{t('pose.startAnalysis')}</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  backBtn: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typography.heading.h3,
    fontFamily: typography.heading.fontFamily,
    color: colors.accent.light,
  },
  premiumContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  cameraContainer: {
    width: SCREEN_WIDTH,
    height: CAMERA_HEIGHT,
    backgroundColor: colors.bg.surface,
    overflow: 'hidden',
  },
  camera: {
    width: '100%',
    height: '100%',
  },
  statusBar: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.bg.primary + 'CC',
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusActive: {
    backgroundColor: colors.success,
  },
  statusInactive: {
    backgroundColor: colors.text.muted,
  },
  statusText: {
    ...typography.body.small,
    color: colors.text.primary,
    fontSize: 11,
  },
  bottomPanel: {
    flex: 1,
    backgroundColor: colors.bg.primary,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  actions: {
    paddingHorizontal: spacing.lg,
  },
  analysisBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.accent.primary,
    borderRadius: 12,
    paddingVertical: spacing.md,
    minHeight: 48,
  },
  analysisBtnText: {
    color: colors.bg.primary,
    fontWeight: '700',
    fontSize: 16,
  },
  stopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.safety.critical,
    borderRadius: 12,
    paddingVertical: spacing.md,
    minHeight: 48,
  },
  stopBtnText: {
    color: colors.bg.primary,
    fontWeight: '700',
    fontSize: 16,
  },
  noCameraContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  noCameraText: {
    ...typography.body.regular,
    color: colors.text.muted,
  },
  countdownOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.bg.primary + 'CC',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  countdownNumber: {
    ...typography.heading.h1,
    fontFamily: typography.heading.fontFamily,
    color: colors.accent.primary,
    fontSize: 80,
  },
  countdownLabel: {
    ...typography.heading.h3,
    fontFamily: typography.heading.fontFamily,
    color: colors.accent.light,
  },
  movementList: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
    gap: spacing.sm,
  },
  movementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg.secondary,
    borderRadius: 12,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
    minHeight: 56,
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
  movementMeta: {
    ...typography.body.small,
    color: colors.text.muted,
    fontSize: 11,
  },
  resultsScroll: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
});
