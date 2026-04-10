import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, Image, Pressable } from 'react-native';
import { colors } from '../theme';

interface AnimatedSplashScreenProps {
  onFinish: () => void;
}

export function AnimatedSplashScreen({ onFinish }: AnimatedSplashScreenProps) {
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Sequence of animations
    Animated.sequence([
      // 1. Logo fade-in + scale
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      // 2. Glow pulse
      Animated.timing(glowOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      // 3. Title fade-in
      Animated.timing(titleOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      // 4. Subtitle fade-in
      Animated.timing(subtitleOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-dismiss after 2.5s
    const timer = setTimeout(onFinish, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Pressable style={styles.container} onPress={onFinish}>
      {/* Glow behind logo */}
      <Animated.View style={[styles.glow, { opacity: glowOpacity }]} />

      {/* Logo */}
      <Animated.View style={[
        styles.logoContainer,
        { opacity: logoOpacity, transform: [{ scale: logoScale }] },
      ]}>
        <Image
          source={require('../../assets/icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Title */}
      <Animated.View style={{ opacity: titleOpacity }}>
        <Text style={styles.title}>AERIAL ANATOMY</Text>
      </Animated.View>

      {/* Subtitle */}
      <Animated.View style={{ opacity: subtitleOpacity }}>
        <Text style={styles.subtitle}>ARTE  ·  ESTUDIO  ·  CONEXIÓN</Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#9B6DFF',
    opacity: 0.12,
  },
  logoContainer: {
    marginBottom: 24,
  },
  logo: {
    width: 140,
    height: 140,
  },
  title: {
    fontSize: 28,
    fontWeight: '300',
    color: '#E8E0F0',
    letterSpacing: 8,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9B6DFF',
    letterSpacing: 4,
  },
});
