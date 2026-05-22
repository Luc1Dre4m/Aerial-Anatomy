import React, { useEffect } from 'react';
import { TextStyle, StyleProp } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

interface AnimatedTitleProps {
  text: string;
  style?: StyleProp<TextStyle>;
  testID?: string;
}

export function AnimatedTitle({ text, style, testID }: AnimatedTitleProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(15);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 400 });
    translateY.value = withTiming(0, { duration: 400 });
  }, [opacity, translateY]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.Text style={[style, animStyle]} testID={testID}>
      {text}
    </Animated.Text>
  );
}
