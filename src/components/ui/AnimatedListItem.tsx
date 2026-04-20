import React, { useEffect } from 'react';
import { ViewProps } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from 'react-native-reanimated';

interface AnimatedListItemProps extends ViewProps {
  index: number;
  delay?: number;
  children: React.ReactNode;
}

export function AnimatedListItem({ index, delay = 60, style, children }: AnimatedListItemProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    const itemDelay = Math.min(index, 8) * delay;
    opacity.value = withDelay(itemDelay, withTiming(1, { duration: 300 }));
    translateY.value = withDelay(itemDelay, withTiming(0, { duration: 300 }));
  }, [index, delay, opacity, translateY]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[style, animStyle]}>
      {children}
    </Animated.View>
  );
}
