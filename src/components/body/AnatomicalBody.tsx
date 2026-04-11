import React, { useMemo } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import Svg, { G, Ellipse } from 'react-native-svg';
import { MuscleRegion } from '../../utils/types';
import { getMuscleById } from '../../data/muscles';
import { BODY_ZONES, REGION_ZONE_COLOR, BODY_VIEWBOX } from './bodyConstants';

const ANATOMY_FRONT = require('../../../assets/anatomy/muscle_front.png');
const ANATOMY_BACK = require('../../../assets/anatomy/muscle_back.png');

interface AnatomicalBodyProps {
  view: 'front' | 'back';
  highlightedRegion?: MuscleRegion | null;
  highlightedMuscleIds?: string[];
  selectedMuscleId?: string | null;
  onRegionPress?: (region: MuscleRegion) => void;
  onMusclePress?: (muscleId: string) => void;
  highlightColor?: string;
  bodyOpacity?: number;
  showInteractionZones?: boolean;
  regionColorOverrides?: Record<string, { fill: string; opacity: number }>;
}

function AnatomicalBodyInner({
  view,
  highlightedRegion,
  highlightedMuscleIds,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  selectedMuscleId,
  onRegionPress,
  onMusclePress,
  highlightColor,
  bodyOpacity = 1,
  showInteractionZones = true,
  regionColorOverrides,
}: AnatomicalBodyProps) {
  const highlightedRegionsFromIds = useMemo(() => {
    if (!highlightedMuscleIds || highlightedMuscleIds.length === 0) return new Set<MuscleRegion>();
    const set = new Set<MuscleRegion>();
    for (const id of highlightedMuscleIds) {
      const m = getMuscleById(id);
      if (m) set.add(m.region);
    }
    return set;
  }, [highlightedMuscleIds]);

  const hasHighlight = highlightedRegion != null || highlightedRegionsFromIds.size > 0;

  return (
    <View style={styles.container}>
      <Image
        source={view === 'front' ? ANATOMY_FRONT : ANATOMY_BACK}
        style={[StyleSheet.absoluteFill, { opacity: bodyOpacity }]}
        resizeMode="contain"
      />
      <Svg
        style={StyleSheet.absoluteFill}
        viewBox={BODY_VIEWBOX}
        pointerEvents={onRegionPress || onMusclePress ? 'box-none' : 'none'}
      >
        <G>
          {BODY_ZONES.map((zone, index) => {
            const pos = view === 'front' ? zone.front : zone.back;
            const override = regionColorOverrides?.[`${zone.region}-${index}`];

            const isRegionHighlighted =
              highlightedRegion === zone.region || highlightedRegionsFromIds.has(zone.region);
            const regionColor = highlightColor ?? REGION_ZONE_COLOR[zone.region];

            let fill = 'transparent';
            let fillOpacity = 0;
            let stroke = 'transparent';
            let strokeOpacity = 0;
            let strokeWidth = 0;

            if (override) {
              fill = override.fill;
              fillOpacity = override.opacity;
              stroke = override.fill;
              strokeOpacity = 0.8;
              strokeWidth = 2;
            } else if (isRegionHighlighted) {
              fill = regionColor;
              fillOpacity = 0.35;
              stroke = regionColor;
              strokeOpacity = 0.9;
              strokeWidth = 2;
            } else if (hasHighlight) {
              fill = 'transparent';
              fillOpacity = 0;
            }

            const tappable = showInteractionZones && !!onRegionPress;

            return (
              <Ellipse
                key={`zone-${zone.region}-${index}`}
                cx={pos.cx}
                cy={pos.cy}
                rx={pos.rx}
                ry={pos.ry}
                fill={fill}
                fillOpacity={fillOpacity}
                stroke={stroke}
                strokeWidth={strokeWidth}
                strokeOpacity={strokeOpacity}
                onPress={tappable ? () => onRegionPress!(zone.region) : undefined}
              />
            );
          })}
        </G>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
});

export const AnatomicalBody = React.memo(AnatomicalBodyInner, (prev, next) => {
  const idsEqual =
    prev.highlightedMuscleIds === next.highlightedMuscleIds ||
    (prev.highlightedMuscleIds?.length === next.highlightedMuscleIds?.length &&
      (prev.highlightedMuscleIds?.every((id, i) => id === next.highlightedMuscleIds?.[i]) ?? true));

  return (
    prev.view === next.view &&
    prev.highlightedRegion === next.highlightedRegion &&
    prev.bodyOpacity === next.bodyOpacity &&
    prev.highlightColor === next.highlightColor &&
    prev.showInteractionZones === next.showInteractionZones &&
    idsEqual &&
    prev.regionColorOverrides === next.regionColorOverrides
  );
});
