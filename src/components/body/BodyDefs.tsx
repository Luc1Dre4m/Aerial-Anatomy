import React from 'react';
import { Defs, LinearGradient, RadialGradient, Stop } from 'react-native-svg';
import { REGION_ZONE_COLOR } from './bodyConstants';
import { MuscleRegion } from '../../utils/types';

const REGIONS: MuscleRegion[] = [
  'hombros', 'espalda', 'core', 'brazos', 'munecas_manos',
  'cadera', 'rodillas', 'tobillos_pies', 'cuello',
];

function BodyDefsInner() {
  return (
    <Defs>
      {/* Muscle fill gradients — violet anatomical tones */}
      <LinearGradient id="muscle-vertical" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0" stopColor="#5A4A6A" stopOpacity="1" />
        <Stop offset="0.5" stopColor="#3A2A4A" stopOpacity="1" />
        <Stop offset="1" stopColor="#1C1228" stopOpacity="1" />
      </LinearGradient>

      <LinearGradient id="muscle-horizontal" x1="0" y1="0" x2="1" y2="0">
        <Stop offset="0" stopColor="#5A4A6A" stopOpacity="1" />
        <Stop offset="0.5" stopColor="#3A2A4A" stopOpacity="1" />
        <Stop offset="1" stopColor="#1C1228" stopOpacity="1" />
      </LinearGradient>

      <LinearGradient id="muscle-diagonal-tl" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0" stopColor="#6A5A7A" stopOpacity="1" />
        <Stop offset="0.4" stopColor="#4A3A5A" stopOpacity="1" />
        <Stop offset="1" stopColor="#1C1228" stopOpacity="1" />
      </LinearGradient>

      <LinearGradient id="muscle-diagonal-tr" x1="1" y1="0" x2="0" y2="1">
        <Stop offset="0" stopColor="#6A5A7A" stopOpacity="1" />
        <Stop offset="0.4" stopColor="#4A3A5A" stopOpacity="1" />
        <Stop offset="1" stopColor="#1C1228" stopOpacity="1" />
      </LinearGradient>

      {/* Convex muscle gradient — for rounded muscles like biceps, deltoids */}
      <RadialGradient id="muscle-convex" cx="0.4" cy="0.35" r="0.7">
        <Stop offset="0" stopColor="#7A6A8A" stopOpacity="1" />
        <Stop offset="0.5" stopColor="#4A3A5A" stopOpacity="1" />
        <Stop offset="1" stopColor="#2A1A3A" stopOpacity="1" />
      </RadialGradient>

      {/* Deep muscle fill — flat muted violet */}
      <LinearGradient id="muscle-deep" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0" stopColor="#302040" stopOpacity="1" />
        <Stop offset="1" stopColor="#201030" stopOpacity="1" />
      </LinearGradient>

      {/* Silhouette gradient — subtle body tone on dark bg */}
      <LinearGradient id="silhouette-fill" x1="0.5" y1="0" x2="0.5" y2="1">
        <Stop offset="0" stopColor="#2A2A44" stopOpacity="0.6" />
        <Stop offset="0.5" stopColor="#1A1A2E" stopOpacity="0.8" />
        <Stop offset="1" stopColor="#12122A" stopOpacity="0.6" />
      </LinearGradient>

      {/* Region highlight gradients — one per MuscleRegion */}
      {REGIONS.map((region) => {
        const color = REGION_ZONE_COLOR[region];
        return (
          <RadialGradient key={region} id={`highlight-${region}`} cx="0.5" cy="0.5" r="0.6">
            <Stop offset="0" stopColor={color} stopOpacity="0.5" />
            <Stop offset="0.7" stopColor={color} stopOpacity="0.2" />
            <Stop offset="1" stopColor={color} stopOpacity="0" />
          </RadialGradient>
        );
      })}
    </Defs>
  );
}

export const BodyDefs = React.memo(BodyDefsInner, () => true);
