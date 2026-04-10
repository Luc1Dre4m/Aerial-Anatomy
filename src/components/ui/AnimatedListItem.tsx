import React, { useEffect, useRef } from 'react';
import { Animated, ViewProps } from 'react-native';

interface AnimatedListItemProps extends ViewProps {
  index: number;
  delay?: number;
  children: React.ReactNode;
}

export function AnimatedListItem({ index, delay = 60, style, children }: AnimatedListItemProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    const itemDelay = Math.min(index, 8) * delay;
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }, itemDelay);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View style={[style, { opacity, transform: [{ translateY }] }]}>
      {children}
    </Animated.View>
  );
}
