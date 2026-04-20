import { muscles, getMuscleById, getMusclesByRegion, REGION_LABELS } from '../muscles';

describe('muscles database', () => {
  test('has at least 30 muscles', () => {
    expect(muscles.length).toBeGreaterThanOrEqual(30);
  });

  test('every muscle has required bilingual fields', () => {
    for (const m of muscles) {
      expect(m.id).toBeTruthy();
      expect(m.name_es).toBeTruthy();
      expect(m.name_en).toBeTruthy();
      expect(m.name_latin).toBeTruthy();
      expect(m.region).toBeTruthy();
      expect(m.description_es).toBeTruthy();
      expect(m.description_en).toBeTruthy();
    }
  });

  test('muscle IDs are unique', () => {
    const ids = muscles.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('getMuscleById', () => {
  test('returns deltoid by ID', () => {
    const m = getMuscleById('m_deltoides');
    expect(m).toBeDefined();
    expect(m!.name_en).toBe('Deltoid');
  });

  test('returns undefined for unknown ID', () => {
    expect(getMuscleById('m_nonexistent')).toBeUndefined();
  });
});

describe('getMusclesByRegion', () => {
  test('returns muscles for hombros region', () => {
    const result = getMusclesByRegion('hombros');
    expect(result.length).toBeGreaterThan(0);
    for (const m of result) {
      expect(m.region).toBe('hombros');
    }
  });

  test('returns empty array for invalid region', () => {
    expect(getMusclesByRegion('nonexistent' as any)).toEqual([]);
  });
});

describe('REGION_LABELS', () => {
  test('every region in muscles has a label', () => {
    const regions = new Set(muscles.map((m) => m.region));
    for (const region of regions) {
      expect(REGION_LABELS[region]).toBeDefined();
      expect(REGION_LABELS[region].es).toBeTruthy();
      expect(REGION_LABELS[region].en).toBeTruthy();
    }
  });
});
