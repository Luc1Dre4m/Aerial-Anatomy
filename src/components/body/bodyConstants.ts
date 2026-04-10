import { MuscleRegion } from '../../utils/types';
import { colors } from '../../theme';

export const BODY_WIDTH = 300;
export const BODY_HEIGHT = 460;
export const BODY_VIEWBOX = `0 0 ${BODY_WIDTH} ${BODY_HEIGHT}`;

export interface ZoneDef {
  region: MuscleRegion;
  front: { cx: number; cy: number; rx: number; ry: number };
  back: { cx: number; cy: number; rx: number; ry: number };
}

export const BODY_ZONES: ZoneDef[] = [
  { region: 'cuello', front: { cx: 150, cy: 78, rx: 16, ry: 12 }, back: { cx: 150, cy: 78, rx: 16, ry: 12 } },
  { region: 'hombros', front: { cx: 102, cy: 118, rx: 22, ry: 16 }, back: { cx: 100, cy: 118, rx: 22, ry: 16 } },
  { region: 'hombros', front: { cx: 198, cy: 118, rx: 22, ry: 16 }, back: { cx: 200, cy: 118, rx: 22, ry: 16 } },
  { region: 'brazos', front: { cx: 80, cy: 168, rx: 14, ry: 30 }, back: { cx: 78, cy: 168, rx: 14, ry: 30 } },
  { region: 'brazos', front: { cx: 220, cy: 168, rx: 14, ry: 30 }, back: { cx: 222, cy: 168, rx: 14, ry: 30 } },
  { region: 'munecas_manos', front: { cx: 66, cy: 240, rx: 10, ry: 18 }, back: { cx: 64, cy: 240, rx: 10, ry: 18 } },
  { region: 'munecas_manos', front: { cx: 234, cy: 240, rx: 10, ry: 18 }, back: { cx: 236, cy: 240, rx: 10, ry: 18 } },
  { region: 'core', front: { cx: 150, cy: 200, rx: 24, ry: 35 }, back: { cx: 150, cy: 200, rx: 24, ry: 35 } },
  { region: 'espalda', front: { cx: 150, cy: 146, rx: 32, ry: 28 }, back: { cx: 150, cy: 146, rx: 35, ry: 32 } },
  { region: 'cadera', front: { cx: 150, cy: 262, rx: 35, ry: 22 }, back: { cx: 150, cy: 258, rx: 35, ry: 22 } },
  { region: 'rodillas', front: { cx: 128, cy: 330, rx: 18, ry: 40 }, back: { cx: 128, cy: 330, rx: 18, ry: 40 } },
  { region: 'rodillas', front: { cx: 172, cy: 330, rx: 18, ry: 40 }, back: { cx: 172, cy: 330, rx: 18, ry: 40 } },
  { region: 'tobillos_pies', front: { cx: 126, cy: 420, rx: 14, ry: 22 }, back: { cx: 126, cy: 420, rx: 14, ry: 22 } },
  { region: 'tobillos_pies', front: { cx: 174, cy: 420, rx: 14, ry: 22 }, back: { cx: 174, cy: 420, rx: 14, ry: 22 } },
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
