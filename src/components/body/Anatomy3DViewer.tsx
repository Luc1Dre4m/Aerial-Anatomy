import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Anatomy3DScene } from './Anatomy3DScene';
import { ErrorBoundary } from '../ui/ErrorBoundary';
import { colors } from '../../theme';

interface Anatomy3DViewerProps {
  highlightedMuscles?: string[];
  onMuscleSelect?: (muscleId: string) => void;
  onViewDetail?: (muscleId: string) => void;
}

export const Anatomy3DViewer = React.memo(function Anatomy3DViewer({
  onMuscleSelect,
  onViewDetail,
}: Anatomy3DViewerProps) {
  return (
    <View style={styles.container}>
      <ErrorBoundary>
        <Anatomy3DScene onMuscleSelect={onMuscleSelect} onViewDetail={onViewDetail} />
      </ErrorBoundary>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.bg.primary,
  },
});
