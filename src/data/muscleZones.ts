import { BodyView } from '../components/body/bodyConstants';

export interface EllipseZone {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
}

export interface MuscleZoneDef {
  muscleId: string;
  label?: string;
  front?: EllipseZone;
  back?: EllipseZone;
  frontPair?: [EllipseZone, EllipseZone];
  backPair?: [EllipseZone, EllipseZone];
}

export const MUSCLE_ZONES: MuscleZoneDef[] = [
  {
    muscleId: 'm_deltoides',
    frontPair: [
      { cx: 108, cy: 102, rx: 14, ry: 12 },
      { cx: 192, cy: 102, rx: 14, ry: 12 },
    ],
    backPair: [
      { cx: 108, cy: 105, rx: 14, ry: 12 },
      { cx: 192, cy: 105, rx: 14, ry: 12 },
    ],
  },
  {
    muscleId: 'm_pectoral_mayor',
    frontPair: [
      { cx: 128, cy: 128, rx: 18, ry: 14 },
      { cx: 172, cy: 128, rx: 18, ry: 14 },
    ],
  },
  {
    muscleId: 'm_biceps',
    frontPair: [
      { cx: 88, cy: 148, rx: 10, ry: 18 },
      { cx: 212, cy: 148, rx: 10, ry: 18 },
    ],
  },
  {
    muscleId: 'm_braquiorradial',
    frontPair: [
      { cx: 75, cy: 200, rx: 9, ry: 22 },
      { cx: 225, cy: 200, rx: 9, ry: 22 },
    ],
  },
  {
    muscleId: 'm_recto_abdominal',
    front: { cx: 150, cy: 175, rx: 14, ry: 30 },
  },
  {
    muscleId: 'm_oblicuo_externo',
    frontPair: [
      { cx: 128, cy: 185, rx: 10, ry: 26 },
      { cx: 172, cy: 185, rx: 10, ry: 26 },
    ],
  },
  {
    muscleId: 'm_serrato_anterior',
    frontPair: [
      { cx: 125, cy: 150, rx: 8, ry: 12 },
      { cx: 175, cy: 150, rx: 8, ry: 12 },
    ],
  },
  {
    muscleId: 'm_cuadriceps',
    frontPair: [
      { cx: 132, cy: 285, rx: 14, ry: 30 },
      { cx: 168, cy: 285, rx: 14, ry: 30 },
    ],
  },
  {
    muscleId: 'm_tibial_anterior',
    frontPair: [
      { cx: 128, cy: 365, rx: 10, ry: 22 },
      { cx: 172, cy: 365, rx: 10, ry: 22 },
    ],
  },
  {
    muscleId: 'm_trapecio',
    back: { cx: 150, cy: 100, rx: 34, ry: 16 },
  },
  {
    muscleId: 'm_infraespinoso',
    backPair: [
      { cx: 125, cy: 130, rx: 12, ry: 12 },
      { cx: 175, cy: 130, rx: 12, ry: 12 },
    ],
  },
  {
    muscleId: 'm_dorsal_ancho',
    backPair: [
      { cx: 128, cy: 160, rx: 18, ry: 22 },
      { cx: 172, cy: 160, rx: 18, ry: 22 },
    ],
  },
  {
    muscleId: 'm_triceps',
    backPair: [
      { cx: 88, cy: 148, rx: 10, ry: 18 },
      { cx: 212, cy: 148, rx: 10, ry: 18 },
    ],
  },
  {
    muscleId: 'm_erector_espinal',
    back: { cx: 150, cy: 195, rx: 8, ry: 28 },
  },
  {
    muscleId: 'm_gluteo_mayor',
    backPair: [
      { cx: 132, cy: 255, rx: 16, ry: 18 },
      { cx: 168, cy: 255, rx: 16, ry: 18 },
    ],
  },
  {
    muscleId: 'm_isquiotibiales',
    backPair: [
      { cx: 132, cy: 305, rx: 14, ry: 30 },
      { cx: 168, cy: 305, rx: 14, ry: 30 },
    ],
  },
  {
    muscleId: 'm_gemelos',
    backPair: [
      { cx: 130, cy: 360, rx: 11, ry: 25 },
      { cx: 170, cy: 360, rx: 11, ry: 25 },
    ],
  },
];

export interface ResolvedMuscleZone {
  muscleId: string;
  ellipse: EllipseZone;
}

export function getMuscleZonesForView(view: BodyView): ResolvedMuscleZone[] {
  const out: ResolvedMuscleZone[] = [];
  for (const z of MUSCLE_ZONES) {
    if (view === 'front') {
      if (z.front) out.push({ muscleId: z.muscleId, ellipse: z.front });
      if (z.frontPair) {
        out.push({ muscleId: z.muscleId, ellipse: z.frontPair[0] });
        out.push({ muscleId: z.muscleId, ellipse: z.frontPair[1] });
      }
    } else {
      if (z.back) out.push({ muscleId: z.muscleId, ellipse: z.back });
      if (z.backPair) {
        out.push({ muscleId: z.muscleId, ellipse: z.backPair[0] });
        out.push({ muscleId: z.muscleId, ellipse: z.backPair[1] });
      }
    }
  }
  return out;
}

export function findMuscleAtPoint(
  view: BodyView,
  x: number,
  y: number,
): string | null {
  const zones = getMuscleZonesForView(view);
  for (const z of zones) {
    const dx = (x - z.ellipse.cx) / z.ellipse.rx;
    const dy = (y - z.ellipse.cy) / z.ellipse.ry;
    if (dx * dx + dy * dy <= 1) return z.muscleId;
  }
  return null;
}
