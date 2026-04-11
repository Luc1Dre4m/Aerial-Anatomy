import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MuscleRegion } from '../../utils/types';
import { AnatomicalBody } from './AnatomicalBody';

interface BodyMapProps {
  view: 'front' | 'back';
  highlightedRegion?: MuscleRegion | null;
  selectedMuscleId?: string | null;
  onRegionPress: (region: MuscleRegion) => void;
  onMusclePress?: (muscleId: string) => void;
}

export function BodyMap({
  view,
  highlightedRegion,
  selectedMuscleId,
  onRegionPress,
  onMusclePress,
}: BodyMapProps) {
  return (
    <View style={styles.container}>
      <AnatomicalBody
        view={view}
        highlightedRegion={highlightedRegion}
        selectedMuscleId={selectedMuscleId}
        onRegionPress={onRegionPress}
        onMusclePress={onMusclePress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    aspectRatio: 300 / 420,
    alignSelf: 'center',
  },
});
