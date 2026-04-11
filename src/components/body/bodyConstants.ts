import { MuscleRegion } from '../../utils/types';
import { colors } from '../../theme';

export const BODY_WIDTH = 300;
export const BODY_HEIGHT = 420;
export const BODY_VIEWBOX = `0 0 ${BODY_WIDTH} ${BODY_HEIGHT}`;

export type BodyView = 'front' | 'back';

export interface ZoneDef {
  region: MuscleRegion;
  front: { cx: number; cy: number; rx: number; ry: number };
  back: { cx: number; cy: number; rx: number; ry: number };
}

export const BODY_ZONES: ZoneDef[] = [
  { region: 'cuello', front: { cx: 150, cy: 58, rx: 16, ry: 12 }, back: { cx: 150, cy: 58, rx: 16, ry: 12 } },
  { region: 'hombros', front: { cx: 105, cy: 95, rx: 22, ry: 16 }, back: { cx: 105, cy: 95, rx: 22, ry: 16 } },
  { region: 'hombros', front: { cx: 195, cy: 95, rx: 22, ry: 16 }, back: { cx: 195, cy: 95, rx: 22, ry: 16 } },
  { region: 'brazos', front: { cx: 78, cy: 155, rx: 16, ry: 32 }, back: { cx: 78, cy: 155, rx: 16, ry: 32 } },
  { region: 'brazos', front: { cx: 222, cy: 155, rx: 16, ry: 32 }, back: { cx: 222, cy: 155, rx: 16, ry: 32 } },
  { region: 'munecas_manos', front: { cx: 55, cy: 235, rx: 12, ry: 20 }, back: { cx: 55, cy: 235, rx: 12, ry: 20 } },
  { region: 'munecas_manos', front: { cx: 245, cy: 235, rx: 12, ry: 20 }, back: { cx: 245, cy: 235, rx: 12, ry: 20 } },
  { region: 'core', front: { cx: 150, cy: 180, rx: 26, ry: 38 }, back: { cx: 150, cy: 180, rx: 26, ry: 38 } },
  { region: 'espalda', front: { cx: 150, cy: 130, rx: 38, ry: 34 }, back: { cx: 150, cy: 130, rx: 38, ry: 34 } },
  { region: 'cadera', front: { cx: 150, cy: 258, rx: 40, ry: 22 }, back: { cx: 150, cy: 258, rx: 40, ry: 22 } },
  { region: 'rodillas', front: { cx: 130, cy: 320, rx: 18, ry: 38 }, back: { cx: 130, cy: 320, rx: 18, ry: 38 } },
  { region: 'rodillas', front: { cx: 170, cy: 320, rx: 18, ry: 38 }, back: { cx: 170, cy: 320, rx: 18, ry: 38 } },
  { region: 'tobillos_pies', front: { cx: 128, cy: 395, rx: 14, ry: 20 }, back: { cx: 128, cy: 395, rx: 14, ry: 20 } },
  { region: 'tobillos_pies', front: { cx: 172, cy: 395, rx: 14, ry: 20 }, back: { cx: 172, cy: 395, rx: 14, ry: 20 } },
];

export const REGION_ZONE_COLOR: Record<MuscleRegion, string> = {
  hombros: colors.discipline.trapecio,
  espalda: colors.chain.posterior,
  core: colors.chain.espiral,
  brazos: colors.muscle.sinergista,
  munecas_manos: colors.accent.primary,
  cadera: colors.discipline.cuerda,
  rodillas: colors.level.intermedio,
  tobillos_pies: colors.level.basico,
  cuello: colors.safety.info,
};
