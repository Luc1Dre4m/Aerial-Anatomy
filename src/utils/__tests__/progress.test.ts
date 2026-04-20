import { computeProgress } from '../progress';
import { muscles } from '../../data/muscles';

describe('computeProgress', () => {
  test('returns zero progress for empty visited list', () => {
    const result = computeProgress([]);
    expect(result.totalVisited).toBe(0);
    expect(result.overallRatio).toBe(0);
    for (const r of result.regions) {
      expect(r.visited).toBe(0);
      expect(r.ratio).toBe(0);
    }
  });

  test('returns full progress when all muscles visited', () => {
    const allIds = muscles.map((m) => m.id);
    const result = computeProgress(allIds);
    expect(result.totalVisited).toBe(muscles.length);
    expect(result.overallRatio).toBe(1);
    for (const r of result.regions) {
      expect(r.visited).toBe(r.total);
      expect(r.ratio).toBe(1);
    }
  });

  test('computes partial progress correctly', () => {
    const firstMuscle = muscles[0];
    const result = computeProgress([firstMuscle.id]);
    expect(result.totalVisited).toBe(1);
    expect(result.overallRatio).toBeCloseTo(1 / muscles.length);
    const region = result.regions.find((r) => r.region === firstMuscle.region);
    expect(region?.visited).toBe(1);
  });

  test('ignores invalid muscle IDs', () => {
    const result = computeProgress(['m_nonexistent', 'm_another_fake']);
    expect(result.totalVisited).toBe(0);
    expect(result.overallRatio).toBe(0);
  });

  test('returns totalMuscles equal to muscles database size', () => {
    const result = computeProgress([]);
    expect(result.totalMuscles).toBe(muscles.length);
  });

  test('regions array covers all MuscleRegion keys', () => {
    const result = computeProgress([]);
    const uniqueRegions = new Set(muscles.map((m) => m.region));
    expect(result.regions.length).toBeGreaterThanOrEqual(uniqueRegions.size);
    for (const r of result.regions) {
      expect(r.label.es).toBeTruthy();
      expect(r.label.en).toBeTruthy();
    }
  });

  test('does not double-count duplicate visited IDs', () => {
    const firstMuscle = muscles[0];
    const result = computeProgress([firstMuscle.id, firstMuscle.id, firstMuscle.id]);
    expect(result.totalVisited).toBe(1);
    const region = result.regions.find((r) => r.region === firstMuscle.region);
    expect(region?.visited).toBe(1);
  });
});
