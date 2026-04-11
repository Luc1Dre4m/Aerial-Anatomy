import React, { ReactNode, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector, Directions } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';

interface ZoomableBodyProps {
  children: ReactNode;
  minScale?: number;
  maxScale?: number;
  onFlingHorizontal?: (direction: 'left' | 'right') => void;
  onScaleChange?: (scale: number) => void;
}

export function ZoomableBody({
  children,
  minScale = 1,
  maxScale = 3.5,
  onFlingHorizontal,
  onScaleChange,
}: ZoomableBodyProps) {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const notify = useCallback((s: number) => {
    onScaleChange?.(s);
  }, [onScaleChange]);

  const pinch = Gesture.Pinch()
    .onUpdate((e) => {
      const next = Math.min(Math.max(savedScale.value * e.scale, minScale), maxScale);
      scale.value = next;
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      if (scale.value <= minScale + 0.001) {
        translateX.value = withTiming(0);
        translateY.value = withTiming(0);
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
      }
      runOnJS(notify)(scale.value);
    });

  const pan = Gesture.Pan()
    .averageTouches(true)
    .minPointers(1)
    .maxPointers(2)
    .onUpdate((e) => {
      if (scale.value <= minScale + 0.001) return;
      translateX.value = savedTranslateX.value + e.translationX;
      translateY.value = savedTranslateY.value + e.translationY;
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .maxDelay(250)
    .onEnd(() => {
      scale.value = withTiming(1);
      savedScale.value = 1;
      translateX.value = withTiming(0);
      translateY.value = withTiming(0);
      savedTranslateX.value = 0;
      savedTranslateY.value = 0;
      runOnJS(notify)(1);
    });

  const flingLeft = Gesture.Fling()
    .direction(Directions.LEFT)
    .onEnd(() => {
      if (scale.value > minScale + 0.001) return;
      if (onFlingHorizontal) runOnJS(onFlingHorizontal)('left');
    });

  const flingRight = Gesture.Fling()
    .direction(Directions.RIGHT)
    .onEnd(() => {
      if (scale.value > minScale + 0.001) return;
      if (onFlingHorizontal) runOnJS(onFlingHorizontal)('right');
    });

  const composed = Gesture.Simultaneous(
    Gesture.Race(flingLeft, flingRight, pan),
    pinch,
    doubleTap,
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <GestureDetector gesture={composed}>
      <View style={styles.container} collapsable={false}>
        <Animated.View style={[styles.inner, animatedStyle]}>
          {children}
        </Animated.View>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  inner: {
    flex: 1,
  },
});
