import React, { useEffect, useMemo } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import Svg, {
  G,
  Ellipse,
  Path,
  Defs,
  RadialGradient,
  Stop,
  Rect,
  Line,
  Pattern,
  Circle,
  Text as SvgText,
} from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withRepeat,
  withTiming,
  cancelAnimation,
} from 'react-native-reanimated';
import { MuscleRegion } from '../../utils/types';
import { getMuscleById } from '../../data/muscles';
import {
  BODY_ZONES,
  REGION_ZONE_COLOR,
  BODY_VIEWBOX,
  BODY_WIDTH,
  BODY_HEIGHT,
} from './bodyConstants';
import { getMuscleZonesForView } from '../../data/muscleZones';
import { getMusclePathsByView, BODY_SILHOUETTE_FRONT, BODY_SILHOUETTE_BACK } from '../../data/bodyPaths';
import { BodyDefs } from './BodyDefs';
import { MuscleLayer } from './MuscleLayer';
import { colors } from '../../theme';

const ANATOMY_FRONT = require('../../../assets/anatomy/muscle_front.png');
const ANATOMY_BACK = require('../../../assets/anatomy/muscle_back.png');

const AnimatedEllipse = Animated.createAnimatedComponent(Ellipse);

// Number of scan lines across the height
const SCAN_LINE_COUNT = Math.floor(BODY_HEIGHT / 5);

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

  const muscleZones = useMemo(() => getMuscleZonesForView(view), [view]);
  const musclePaths = useMemo(() => getMusclePathsByView(view), [view]);

  const pulse = useSharedValue(0.45);
  useEffect(() => {
    if (selectedMuscleId) {
      pulse.value = withRepeat(withTiming(0.9, { duration: 900 }), -1, true);
    } else {
      cancelAnimation(pulse);
      pulse.value = withTiming(0.45, { duration: 200 });
    }
    return () => {
      cancelAnimation(pulse);
    };
  }, [selectedMuscleId, pulse]);

  const pulseProps = useAnimatedProps(() => ({
    opacity: pulse.value,
  }));

  // Find selected muscle zone center for label callout
  const selectedZone = useMemo(() => {
    if (!selectedMuscleId) return null;
    const zone = muscleZones.find((mz) => mz.muscleId === selectedMuscleId);
    if (!zone) return null;
    const muscle = getMuscleById(selectedMuscleId);
    return { ...zone, name: muscle?.name_es ?? selectedMuscleId };
  }, [selectedMuscleId, muscleZones]);

  // Determine if a muscle path should be highlighted/dimmed
  const getPathState = (pathId: string) => {
    if (selectedMuscleId) {
      return {
        highlighted: pathId === selectedMuscleId,
        dimmed: pathId !== selectedMuscleId,
      };
    }
    if (hasHighlight) {
      const pathMuscle = getMuscleById(pathId);
      const pathRegion = pathMuscle?.region;
      const isHighlighted = pathRegion === highlightedRegion || (pathRegion ? highlightedRegionsFromIds.has(pathRegion) : false);
      return { highlighted: isHighlighted, dimmed: !isHighlighted };
    }
    return { highlighted: false, dimmed: false };
  };

  const silhouettePath = view === 'front' ? BODY_SILHOUETTE_FRONT : BODY_SILHOUETTE_BACK;

  return (
    <View style={styles.container}>
      <Image
        source={view === 'front' ? ANATOMY_FRONT : ANATOMY_BACK}
        style={[StyleSheet.absoluteFill, { opacity: bodyOpacity * 0.5 }]}
        resizeMode="contain"
      />
      <Svg
        style={StyleSheet.absoluteFill}
        viewBox={BODY_VIEWBOX}
        pointerEvents={onRegionPress || onMusclePress ? 'box-none' : 'none'}
      >
        <Defs>
          {/* Tech overlay patterns */}
          <Pattern id="dotGrid" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
            <Circle cx="4" cy="4" r="0.4" fill={colors.accent.primary} fillOpacity="0.15" />
          </Pattern>
          <Pattern id="scanLines" x="0" y="0" width={BODY_WIDTH.toString()} height="5" patternUnits="userSpaceOnUse">
            <Line x1="0" y1="4.5" x2={BODY_WIDTH.toString()} y2="4.5" stroke={colors.accent.primary} strokeWidth="0.3" strokeOpacity="0.06" />
          </Pattern>

          <RadialGradient id="vignette" cx="50%" cy="50%" r="70%" fx="50%" fy="50%">
            <Stop offset="55%" stopColor="#000" stopOpacity="0" />
            <Stop offset="100%" stopColor="#000" stopOpacity="0.65" />
          </RadialGradient>
          <RadialGradient id="glow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <Stop offset="0%" stopColor="#D4A843" stopOpacity="0.9" />
            <Stop offset="60%" stopColor="#D4A843" stopOpacity="0.35" />
            <Stop offset="100%" stopColor="#D4A843" stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="sheen" cx="50%" cy="18%" r="80%" fx="50%" fy="18%">
            <Stop offset="0%" stopColor="#FFF" stopOpacity="0.06" />
            <Stop offset="100%" stopColor="#FFF" stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {/* Gradient definitions for muscle fills */}
        <BodyDefs />

        {/* Silhouette — subtle body shape base */}
        <Path
          d={silhouettePath}
          fill="url(#silhouette-fill)"
          stroke={colors.accent.primary}
          strokeWidth={0.3}
          strokeOpacity={0.12}
          pointerEvents="none"
        />

        {/* Muscle paths layer — gradient-filled anatomical contours */}
        <G pointerEvents="none">
          {musclePaths.map((mp) => {
            const state = getPathState(mp.id);
            return (
              <MuscleLayer
                key={`${mp.id}-${mp.side}`}
                pathDef={mp}
                view={view}
                highlighted={state.highlighted}
                highlightColor={state.highlighted ? '#D4A843' : undefined}
                dimmed={state.dimmed}
              />
            );
          })}
        </G>

        {/* Tech overlay — dot grid */}
        <Rect
          x={0} y={0}
          width={BODY_WIDTH} height={BODY_HEIGHT}
          fill="url(#dotGrid)"
          pointerEvents="none"
          opacity={0.3}
        />

        {/* Tech overlay — scan lines */}
        <Rect
          x={0} y={0}
          width={BODY_WIDTH} height={BODY_HEIGHT}
          fill="url(#scanLines)"
          pointerEvents="none"
        />

        {/* Sheen — subtle highlight on top of figure */}
        <Rect
          x={0} y={0}
          width={BODY_WIDTH} height={BODY_HEIGHT}
          fill="url(#sheen)"
          pointerEvents="none"
        />

        {/* Region zones layer — fallback tap targets */}
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
              fillOpacity = 0.2;
              stroke = regionColor;
              strokeOpacity = 0.7;
              strokeWidth = 1.5;
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

        {/* Muscle zones layer — priority hit targets */}
        <G>
          {muscleZones.map((mz, idx) => {
            const isSelected = selectedMuscleId === mz.muscleId;
            const tappable = showInteractionZones && !!onMusclePress;
            return (
              <Ellipse
                key={`mz-${mz.muscleId}-${idx}`}
                cx={mz.ellipse.cx}
                cy={mz.ellipse.cy}
                rx={mz.ellipse.rx}
                ry={mz.ellipse.ry}
                fill={isSelected ? '#D4A843' : 'transparent'}
                fillOpacity={isSelected ? 0.18 : 0}
                stroke={isSelected ? '#F5E6C4' : 'transparent'}
                strokeWidth={isSelected ? 1.2 : 0}
                strokeOpacity={isSelected ? 0.8 : 0}
                onPress={tappable ? () => onMusclePress!(mz.muscleId) : undefined}
              />
            );
          })}
        </G>

        {/* Pulse glow on selected muscle */}
        {selectedMuscleId && (
          <G pointerEvents="none">
            {muscleZones
              .filter((mz) => mz.muscleId === selectedMuscleId)
              .map((mz, idx) => (
                <AnimatedEllipse
                  key={`glow-${mz.muscleId}-${idx}`}
                  cx={mz.ellipse.cx}
                  cy={mz.ellipse.cy}
                  rx={mz.ellipse.rx * 1.9}
                  ry={mz.ellipse.ry * 1.9}
                  fill="url(#glow)"
                  animatedProps={pulseProps}
                />
              ))}
          </G>
        )}

        {/* Label callout with leader line */}
        {selectedZone && (
          <G pointerEvents="none">
            {(() => {
              const cx = selectedZone.ellipse.cx;
              const cy = selectedZone.ellipse.cy;
              // Anchor label to the left or right of center
              const anchorX = cx < BODY_WIDTH / 2 ? 18 : BODY_WIDTH - 18;
              const anchorY = Math.max(20, Math.min(BODY_HEIGHT - 20, cy));
              return (
                <>
                  <Line
                    x1={cx} y1={cy}
                    x2={anchorX} y2={anchorY}
                    stroke="#D4A843"
                    strokeWidth={0.6}
                    strokeOpacity={0.7}
                    strokeDasharray="2,2"
                  />
                  <Circle cx={cx} cy={cy} r={2} fill="#D4A843" fillOpacity={0.9} />
                  <Circle cx={anchorX} cy={anchorY} r={1.5} fill="#D4A843" fillOpacity={0.8} />
                  <SvgText
                    x={anchorX}
                    y={anchorY - 6}
                    fill="#F5E6C4"
                    fontSize={7}
                    fontWeight="600"
                    textAnchor={cx < BODY_WIDTH / 2 ? 'start' : 'end'}
                    opacity={0.9}
                  >
                    {selectedZone.name}
                  </SvgText>
                </>
              );
            })()}
          </G>
        )}

        {/* Measurement tick marks along left edge */}
        <G pointerEvents="none" opacity={0.08}>
          {Array.from({ length: Math.floor(BODY_HEIGHT / 20) }, (_, i) => {
            const y = i * 20;
            const long = i % 5 === 0;
            return (
              <Line
                key={`tick-${i}`}
                x1={0} y1={y}
                x2={long ? 8 : 4} y2={y}
                stroke={colors.accent.primary}
                strokeWidth={0.5}
              />
            );
          })}
        </G>

        {/* Vignette overlay — frames the figure */}
        <Rect
          x={0} y={0}
          width={BODY_WIDTH} height={BODY_HEIGHT}
          fill="url(#vignette)"
          pointerEvents="none"
        />
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
    prev.selectedMuscleId === next.selectedMuscleId &&
    prev.bodyOpacity === next.bodyOpacity &&
    prev.highlightColor === next.highlightColor &&
    prev.showInteractionZones === next.showInteractionZones &&
    idsEqual &&
    prev.regionColorOverrides === next.regionColorOverrides
  );
});
