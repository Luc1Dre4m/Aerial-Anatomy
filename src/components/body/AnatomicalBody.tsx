import React, { useMemo } from 'react';
import Svg, { G, Path, Ellipse } from 'react-native-svg';
import { MuscleRegion } from '../../utils/types';
import {
  BODY_SILHOUETTE_FRONT,
  BODY_SILHOUETTE_BACK,
  getMusclePathsByView,
  MusclePathDef,
} from '../../data/bodyPaths';
import { BODY_ZONES, REGION_ZONE_COLOR, BODY_VIEWBOX } from './bodyConstants';
import { BodyDefs } from './BodyDefs';
import { MuscleLayer } from './MuscleLayer';

interface AnatomicalBodyProps {
  view: 'front' | 'back';
  highlightedRegion?: MuscleRegion | null;
  highlightedMuscleIds?: string[];
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
  onRegionPress,
  onMusclePress,
  highlightColor,
  bodyOpacity = 1,
  showInteractionZones = true,
  regionColorOverrides,
}: AnatomicalBodyProps) {
  const musclePaths = useMemo(() => getMusclePathsByView(view), [view]);
  const silhouette = view === 'front' ? BODY_SILHOUETTE_FRONT : BODY_SILHOUETTE_BACK;

  const hasHighlight = highlightedRegion != null || (highlightedMuscleIds != null && highlightedMuscleIds.length > 0);

  // Separate deep and surface muscles
  const deepMuscles = useMemo(
    () => musclePaths.filter((m) => m.depth === 'profundo'),
    [musclePaths],
  );
  const surfaceMuscles = useMemo(
    () => musclePaths.filter((m) => m.depth === 'superficial'),
    [musclePaths],
  );

  function isHighlighted(mp: MusclePathDef): boolean {
    if (highlightedMuscleIds && highlightedMuscleIds.length > 0) {
      return highlightedMuscleIds.includes(mp.id);
    }
    if (highlightedRegion) {
      return mp.region === highlightedRegion;
    }
    return false;
  }

  function getHighlightColor(mp: MusclePathDef): string {
    if (highlightColor) return highlightColor;
    return REGION_ZONE_COLOR[mp.region];
  }

  return (
    <Svg width="100%" height="100%" viewBox={BODY_VIEWBOX}>
      <BodyDefs />

      {/* Layer 1: Body silhouette */}
      <G opacity={bodyOpacity}>
        <Path
          d={silhouette}
          fill="url(#silhouette-fill)"
          stroke="#4A4A6A"
          strokeWidth={0.8}
          strokeOpacity={0.4}
        />
      </G>

      {/* Layer 2: Deep muscles */}
      <G opacity={bodyOpacity}>
        {deepMuscles.map((mp) => (
          <MuscleLayer
            key={`${mp.id}-${mp.side}`}
            pathDef={mp}
            view={view}
            highlighted={isHighlighted(mp)}
            highlightColor={getHighlightColor(mp)}
            dimmed={hasHighlight && !isHighlighted(mp)}
            onPress={onMusclePress ? () => onMusclePress(mp.id) : undefined}
          />
        ))}
      </G>

      {/* Layer 3: Surface muscles */}
      <G opacity={bodyOpacity}>
        {surfaceMuscles.map((mp) => (
          <MuscleLayer
            key={`${mp.id}-${mp.side}`}
            pathDef={mp}
            view={view}
            highlighted={isHighlighted(mp)}
            highlightColor={getHighlightColor(mp)}
            dimmed={hasHighlight && !isHighlighted(mp)}
            onPress={onMusclePress ? () => onMusclePress(mp.id) : undefined}
          />
        ))}
      </G>

      {/* Layer 5: Interaction zones — invisible tappable ellipses */}
      {showInteractionZones && onRegionPress && (
        <G>
          {BODY_ZONES.map((zone, index) => {
            const pos = view === 'front' ? zone.front : zone.back;
            const override = regionColorOverrides?.[`${zone.region}-${index}`];

            return (
              <Ellipse
                key={`zone-${zone.region}-${index}`}
                cx={pos.cx}
                cy={pos.cy}
                rx={pos.rx}
                ry={pos.ry}
                fill={override ? override.fill : 'transparent'}
                fillOpacity={override ? override.opacity : 0}
                stroke={override ? override.fill : 'transparent'}
                strokeWidth={override ? 2 : 0}
                strokeOpacity={override ? 0.8 : 0}
                onPress={() => onRegionPress(zone.region)}
              />
            );
          })}
        </G>
      )}
    </Svg>
  );
}

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
    idsEqual &&
    prev.regionColorOverrides === next.regionColorOverrides
  );
});
