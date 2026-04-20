import { movements, getMovementById, getMovementsByDiscipline, getMovementsByLevel } from '../movements';
import { getMuscleById } from '../muscles';

describe('movements database', () => {
  test('has at least 50 movements', () => {
    expect(movements.length).toBeGreaterThanOrEqual(50);
  });

  test('every movement has required bilingual fields', () => {
    for (const mv of movements) {
      expect(mv.id).toBeTruthy();
      expect(mv.name_es).toBeTruthy();
      expect(mv.name_en).toBeTruthy();
      expect(mv.disciplines.length).toBeGreaterThan(0);
      expect(mv.level).toBeTruthy();
    }
  });

  test('movement IDs are unique', () => {
    const ids = movements.map((mv) => mv.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test('every muscle reference in movements exists in muscles database', () => {
    for (const mv of movements) {
      for (const mm of mv.muscles) {
        const muscle = getMuscleById(mm.muscle_id);
        expect(muscle).toBeDefined();
      }
    }
  });

  test('every muscle role is valid', () => {
    const validRoles = ['agonista', 'sinergista', 'estabilizador', 'antagonista'];
    for (const mv of movements) {
      for (const mm of mv.muscles) {
        expect(validRoles).toContain(mm.role);
      }
    }
  });
});

describe('getMovementById', () => {
  test('returns a movement by ID', () => {
    const first = movements[0];
    const result = getMovementById(first.id);
    expect(result).toBeDefined();
    expect(result!.id).toBe(first.id);
  });

  test('returns undefined for unknown ID', () => {
    expect(getMovementById('mv_nonexistent')).toBeUndefined();
  });
});

describe('getMovementsByDiscipline', () => {
  test('filters movements by discipline', () => {
    const result = getMovementsByDiscipline('tela');
    expect(result.length).toBeGreaterThan(0);
    for (const mv of result) {
      expect(mv.disciplines).toContain('tela');
    }
  });
});

describe('getMovementsByLevel', () => {
  test('filters movements by level', () => {
    const result = getMovementsByLevel('fundamentals');
    expect(result.length).toBeGreaterThan(0);
    for (const mv of result) {
      expect(mv.level).toBe('fundamentals');
    }
  });
});
