import React from 'react';
import { G, Path } from 'react-native-svg';
import { MusclePathDef } from '../../data/bodyPaths';

interface MuscleLayerProps {
  pathDef: MusclePathDef;
  view: 'front' | 'back';
  highlighted: boolean;
  highlightColor?: string;
  dimmed: boolean;
  onPress?: () => void;
}

function getGradientId(pathDef: MusclePathDef): string {
  if (pathDef.depth === 'profundo') return 'url(#muscle-deep)';

  const convex = ['m_biceps', 'm_deltoides', 'm_triceps', 'm_gemelos', 'm_gluteo_mayor'];
  if (convex.includes(pathDef.id)) return 'url(#muscle-convex)';

  if (pathDef.side === 'left') return 'url(#muscle-diagonal-tl)';
  if (pathDef.side === 'right') return 'url(#muscle-diagonal-tr)';
  return 'url(#muscle-vertical)';
}

function MuscleLayerInner({ pathDef, view, highlighted, highlightColor, dimmed, onPress }: MuscleLayerProps) {
  const data = view === 'front' ? pathDef.front : pathDef.back;
  if (!data) return null;

  const baseOpacity = pathDef.depth === 'profundo' ? 0.35 : 0.85;
  const opacity = highlighted ? 1.0 : dimmed ? 0.3 : baseOpacity;
  const fill = getGradientId(pathDef);

  return (
    <G opacity={opacity}>
      {/* Main muscle shape — onPress on Path directly for reliable Android touch */}
      <Path
        d={data.path}
        fill={fill}
        stroke="#0D0D1A"
        strokeWidth={0.5}
        strokeOpacity={0.6}
        onPress={onPress}
      />

      {/* Definition lines — anatomical detail strokes */}
      {data.detailPaths?.map((dp, i) => (
        <Path
          key={i}
          d={dp}
          fill="none"
          stroke="#0D0D1A"
          strokeWidth={0.4}
          strokeOpacity={0.4}
        />
      ))}

      {/* Highlight glow overlay */}
      {highlighted && highlightColor && (
        <Path
          d={data.path}
          fill={highlightColor}
          fillOpacity={0.35}
          stroke={highlightColor}
          strokeWidth={1.5}
          strokeOpacity={0.6}
        />
      )}
    </G>
  );
}

export const MuscleLayer = React.memo(MuscleLayerInner);
