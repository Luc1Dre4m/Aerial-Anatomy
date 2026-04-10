import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing } from '../../theme';

interface SkeletonLoaderProps {
  variant?: 'card' | 'detail' | 'list-item';
  count?: number;
  style?: ViewStyle;
}

function SkeletonBlock({ width, height, style }: { width: number | string; height: number; style?: ViewStyle }) {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 1000, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [shimmer]);

  const opacity = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.6],
  });

  return (
    <Animated.View
      style={[
        styles.block,
        { width: width as any, height, opacity },
        style,
      ]}
    />
  );
}

function CardSkeleton() {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <SkeletonBlock width="65%" height={18} />
        <SkeletonBlock width={60} height={22} style={{ borderRadius: 6 }} />
      </View>
      <SkeletonBlock width="40%" height={12} />
      <SkeletonBlock width="90%" height={12} />
      <View style={styles.cardFooter}>
        <SkeletonBlock width={80} height={12} />
        <SkeletonBlock width={60} height={12} />
      </View>
    </View>
  );
}

function ListItemSkeleton() {
  return (
    <View style={styles.listItem}>
      <SkeletonBlock width={40} height={40} style={{ borderRadius: 8 }} />
      <View style={styles.listItemText}>
        <SkeletonBlock width="70%" height={14} />
        <SkeletonBlock width="45%" height={11} />
      </View>
    </View>
  );
}

function DetailSkeleton() {
  return (
    <View style={styles.detail}>
      <SkeletonBlock width="80%" height={24} />
      <SkeletonBlock width="50%" height={14} />
      <SkeletonBlock width="100%" height={1} style={{ marginVertical: spacing.md }} />
      <SkeletonBlock width="100%" height={60} style={{ borderRadius: 10 }} />
      <SkeletonBlock width="100%" height={60} style={{ borderRadius: 10 }} />
      <SkeletonBlock width="60%" height={14} />
    </View>
  );
}

export function SkeletonLoader({ variant = 'card', count = 3, style }: SkeletonLoaderProps) {
  const items = Array.from({ length: count }, (_, i) => i);

  const Component = variant === 'detail' ? DetailSkeleton : variant === 'list-item' ? ListItemSkeleton : CardSkeleton;

  return (
    <View style={[styles.container, style]}>
      {items.map((i) => (
        <Component key={i} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  block: {
    backgroundColor: colors.bg.tertiary,
    borderRadius: 4,
  },
  card: {
    backgroundColor: colors.bg.secondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.glass.border,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.bg.secondary,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.glass.border,
    padding: spacing.md,
  },
  listItemText: {
    flex: 1,
    gap: spacing.xs,
  },
  detail: {
    gap: spacing.md,
    padding: spacing.lg,
  },
});
