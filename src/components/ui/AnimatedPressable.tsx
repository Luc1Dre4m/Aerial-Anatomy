import React, { useRef, useCallback } from 'react';
import { Animated, TouchableOpacity, TouchableOpacityProps, GestureResponderEvent } from 'react-native';

interface AnimatedPressableProps extends TouchableOpacityProps {
  scaleValue?: number;
}

export function AnimatedPressable({ scaleValue = 0.97, style, children, onPressIn, onPressOut, ...props }: AnimatedPressableProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback((e: GestureResponderEvent) => {
    Animated.spring(scale, {
      toValue: scaleValue,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
    onPressIn?.(e);
  }, [scaleValue, onPressIn]);

  const handlePressOut = useCallback((e: GestureResponderEvent) => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 40,
      bounciness: 6,
    }).start();
    onPressOut?.(e);
  }, [onPressOut]);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      {...props}
    >
      <Animated.View style={[style, { transform: [{ scale }] }]}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
}
