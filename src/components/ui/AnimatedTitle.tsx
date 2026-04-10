import React, { useEffect, useRef } from 'react';
import { Animated, TextStyle, StyleProp } from 'react-native';

interface AnimatedTitleProps {
  text: string;
  style?: StyleProp<TextStyle>;
}

export function AnimatedTitle({ text, style }: AnimatedTitleProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(15)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.Text style={[style, { opacity, transform: [{ translateY }] }]}>
      {text}
    </Animated.Text>
  );
}
