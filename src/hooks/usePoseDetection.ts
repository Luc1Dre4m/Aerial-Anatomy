/**
 * Custom hook wrapping MediaPipe pose detection.
 *
 * Manages Vision Camera frame processing, debounces landmark
 * updates for UI performance (~10fps), and maps detected
 * landmarks to the app's muscle database.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { PoseLandmark, DetectedMuscle, mapLandmarksToMuscles, LANDMARK_NAMES } from '../services/poseDetection';

interface UsePoseDetectionResult {
  landmarks: PoseLandmark[];
  detectedMuscles: DetectedMuscle[];
  isDetecting: boolean;
  error: string | null;
  processFrame: (rawLandmarks: Array<{ x: number; y: number; z: number; visibility: number }>) => void;
  reset: () => void;
}

const UPDATE_INTERVAL_MS = 100; // ~10fps UI updates

export function usePoseDetection(): UsePoseDetectionResult {
  const [landmarks, setLandmarks] = useState<PoseLandmark[]>([]);
  const [detectedMuscles, setDetectedMuscles] = useState<DetectedMuscle[]>([]);
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastUpdateRef = useRef(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const processFrame = useCallback(
    (rawLandmarks: Array<{ x: number; y: number; z: number; visibility: number }>) => {
      if (!mountedRef.current) return;

      const now = Date.now();
      if (now - lastUpdateRef.current < UPDATE_INTERVAL_MS) return;
      lastUpdateRef.current = now;

      try {
        if (!rawLandmarks || rawLandmarks.length < 33) {
          if (isDetecting) {
            setIsDetecting(false);
            setLandmarks([]);
            setDetectedMuscles([]);
          }
          return;
        }

        // Convert raw landmarks to typed PoseLandmark[]
        const typedLandmarks: PoseLandmark[] = rawLandmarks.map((raw, i) => ({
          x: raw.x,
          y: raw.y,
          z: raw.z,
          visibility: raw.visibility,
          name: LANDMARK_NAMES[i] ?? `landmark_${i}`,
        }));

        // Map to muscles
        const muscles = mapLandmarksToMuscles(typedLandmarks);

        setLandmarks(typedLandmarks);
        setDetectedMuscles(muscles);
        setIsDetecting(true);
        setError(null);
      } catch (err) {
        if (__DEV__) console.error('[usePoseDetection] Frame error:', err);
        setError('pose.detecting');
      }
    },
    [isDetecting]
  );

  const reset = useCallback(() => {
    setLandmarks([]);
    setDetectedMuscles([]);
    setIsDetecting(false);
    setError(null);
  }, []);

  return {
    landmarks,
    detectedMuscles,
    isDetecting,
    error,
    processFrame,
    reset,
  };
}
