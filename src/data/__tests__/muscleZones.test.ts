import { MUSCLE_ZONES, getMuscleZonesForView } from '../muscleZones';
import { getMuscleById } from '../muscles';
import { getMusclePathsByView, getMusclePathsByRegion, MUSCLE_PATHS } from '../bodyPaths';
import { getChainById } from '../chains';
import { chains } from '../chains';

describe('muscleZones', () => {
  test('all muscle zone references point to existing muscles', () => {
    for (const zone of MUSCLE_ZONES) {
      const muscle = getMuscleById(zone.muscleId);
      expect(muscle).toBeDefined();
    }
  });

  test('getMuscleZonesForView returns zones for front view', () => {
    const frontZones = getMuscleZonesForView('front');
    expect(frontZones.length).toBeGreaterThan(0);
    for (const z of frontZones) {
      expect(z.ellipse.cx).toBeGreaterThan(0);
      expect(z.ellipse.cy).toBeGreaterThan(0);
    }
  });

  test('getMuscleZonesForView returns zones for back view', () => {
    const backZones = getMuscleZonesForView('back');
    expect(backZones.length).toBeGreaterThan(0);
  });
});

describe('bodyPaths', () => {
  test('MUSCLE_PATHS has entries', () => {
    expect(MUSCLE_PATHS.length).toBeGreaterThan(0);
  });

  test('getMusclePathsByView returns paths for front view', () => {
    const paths = getMusclePathsByView('front');
    expect(paths.length).toBeGreaterThan(0);
    for (const p of paths) {
      expect(p.id).toBeTruthy();
      expect(p.front?.path).toBeTruthy();
    }
  });

  test('getMusclePathsByView returns paths for back view', () => {
    const paths = getMusclePathsByView('back');
    expect(paths.length).toBeGreaterThan(0);
  });

  test('getMusclePathsByRegion filters correctly', () => {
    const shoulderPaths = getMusclePathsByRegion('hombros', 'front');
    for (const p of shoulderPaths) {
      const muscle = getMuscleById(p.id);
      expect(muscle?.region).toBe('hombros');
    }
  });
});

describe('chains', () => {
  test('has at least 4 chains', () => {
    expect(chains.length).toBeGreaterThanOrEqual(4);
  });

  test('chain IDs are unique', () => {
    const ids = chains.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test('getChainById returns existing chain', () => {
    const first = chains[0];
    const result = getChainById(first.id);
    expect(result).toBeDefined();
    expect(result!.id).toBe(first.id);
  });

  test('every muscle in chains exists in muscles database', () => {
    for (const chain of chains) {
      for (const cm of chain.muscles_ordered) {
        const muscle = getMuscleById(cm.muscle_id);
        expect(muscle).toBeDefined();
      }
    }
  });
});
