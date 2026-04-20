import { muscles, getMusclesByRegion, REGION_LABELS } from '../data/muscles';
import { MuscleRegion } from './types';

export interface RegionProgress {
  region: MuscleRegion;
  label: { es: string; en: string };
  total: number;
  visited: number;
  ratio: number;
}

export interface ProgressSummary {
  regions: RegionProgress[];
  totalMuscles: number;
  totalVisited: number;
  overallRatio: number;
}

/**
 * Compute exploration progress given a list of visited muscle IDs.
 * Pure function, no store dependency — safe to unit test.
 */
export function computeProgress(visitedMuscles: string[]): ProgressSummary {
  const regionKeys = Object.keys(REGION_LABELS) as MuscleRegion[];
  const regions = regionKeys.map((region) => {
    const regionMuscles = getMusclesByRegion(region);
    const total = regionMuscles.length;
    const visited = regionMuscles.filter((m) => visitedMuscles.includes(m.id)).length;
    return {
      region,
      label: REGION_LABELS[region],
      total,
      visited,
      ratio: total > 0 ? visited / total : 0,
    };
  });

  const totalMuscles = muscles.length;
  const uniqueValidIds = new Set(visitedMuscles.filter((id) => muscles.some((m) => m.id === id)));
  const totalVisited = uniqueValidIds.size;
  const overallRatio = totalMuscles > 0 ? totalVisited / totalMuscles : 0;

  return { regions, totalMuscles, totalVisited, overallRatio };
}
