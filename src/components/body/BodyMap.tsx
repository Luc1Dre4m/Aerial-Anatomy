import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MuscleRegion } from '../../utils/types';
import { AnatomicalBody } from './AnatomicalBody';

interface BodyMapProps {
  view: 'front' | 'back';
  highlightedRegion?: MuscleRegion | null;
  onRegionPress: (region: MuscleRegion) => void;
  onMusclePress?: (muscleId: string) => void;
}

export function BodyMap({ view, highlightedRegion, onRegionPress, onMusclePress }: BodyMapProps) {
  return (
    <View style={styles.container}>
      <AnatomicalBody
        view={view}
        highlightedRegion={highlightedRegion}
        onRegionPress={onRegionPress}
        onMusclePress={onMusclePress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 300 / 460,
    maxHeight: 420,
    alignSelf: 'center',
  },
});
