import { useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { computeProgress, ProgressSummary, RegionProgress } from '../utils/progress';

export type { RegionProgress, ProgressSummary };

/**
 * Hook that returns exploration progress per muscle region.
 */
export function useProgress(): ProgressSummary {
  const visitedMuscles = useAppStore((s) => s.visitedMuscles);
  return useMemo(() => computeProgress(visitedMuscles), [visitedMuscles]);
}
