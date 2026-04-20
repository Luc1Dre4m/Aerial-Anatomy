import React, { useCallback } from 'react';
import { TouchableOpacity, TouchableOpacityProps, GestureResponderEvent } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

interface AnimatedPressableProps extends TouchableOpacityProps {
  scaleValue?: number;
}

export function AnimatedPressable({ scaleValue = 0.97, style, children, onPressIn, onPressOut, ...props }: AnimatedPressableProps) {
  const scale = useSharedValue(1);

  const handlePressIn = useCallback((e: GestureResponderEvent) => {
    scale.value = withSpring(scaleValue, { damping: 14, stiffness: 250 });
    onPressIn?.(e);
  }, [scale, scaleValue, onPressIn]);

  const handlePressOut = useCallback((e: GestureResponderEvent) => {
    scale.value = withSpring(1, { damping: 10, stiffness: 180 });
    onPressOut?.(e);
  }, [scale, onPressOut]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      {...props}
    >
      <Animated.View style={[style, animStyle]}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
}
