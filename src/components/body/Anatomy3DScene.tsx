import React, { Suspense, useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Canvas } from '@react-three/fiber/native';
import { useGLTF, OrbitControls, Bounds } from '@react-three/drei/native';
import type { GLTF } from 'three-stdlib';
import {
  ANATOMY_3D_MODELS,
  ANATOMY_3D_AVAILABLE_IDS,
} from '../../data/anatomy3DAssets';
import { muscles } from '../../data/muscles';
import { colors, spacing, typography } from '../../theme';

interface Anatomy3DSceneProps {
  highlightedMuscles?: string[];
  onMuscleSelect?: (muscleId: string) => void;
}

function MuscleModel({ asset }: { asset: number }) {
  // useGLTF's types expect a string Path, but @react-three/drei/native accepts
  // RN asset module IDs (numbers from require()) at runtime. Cast through
  // unknown to satisfy TypeScript while preserving the documented native API.
  const gltf = useGLTF(asset as unknown as string) as unknown as GLTF;
  return <primitive object={gltf.scene} />;
}

function LoadingIndicator() {
  return (
    <View style={styles.loadingOverlay} pointerEvents="none">
      <Text style={styles.loadingText}>Cargando modelo 3D…</Text>
    </View>
  );
}

class GLBErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(error: Error) { console.error('[Anatomy3DScene]', error); }
  render() {
    if (this.state.error) {
      return (
        <View style={styles.loadingOverlay} pointerEvents="none">
          <Text style={[styles.loadingText, { color: '#ff6b6b' }]}>
            Error: {this.state.error.message}
          </Text>
        </View>
      );
    }
    return this.props.children;
  }
}

function pickInitialId(highlighted: string[] | undefined): string {
  if (highlighted) {
    const matched = highlighted.find((id) => ANATOMY_3D_AVAILABLE_IDS.includes(id));
    if (matched) return matched;
  }
  return ANATOMY_3D_AVAILABLE_IDS[0];
}

export function Anatomy3DScene({
  highlightedMuscles,
  onMuscleSelect,
}: Anatomy3DSceneProps) {
  const [activeId, setActiveId] = useState<string>(() =>
    pickInitialId(highlightedMuscles)
  );

  // If the parent updates highlightedMuscles to a 3D-available id, follow it.
  useEffect(() => {
    const target = highlightedMuscles?.find((id) =>
      ANATOMY_3D_AVAILABLE_IDS.includes(id)
    );
    if (target && target !== activeId) setActiveId(target);
    // activeId intentionally excluded — we only sync on highlightedMuscles change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlightedMuscles]);

  const activeMuscle = muscles.find((m) => m.id === activeId);
  const asset = ANATOMY_3D_MODELS[activeId];

  const handleSelect = (id: string) => {
    setActiveId(id);
    onMuscleSelect?.(id);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsRow}
      >
        {ANATOMY_3D_AVAILABLE_IDS.map((id) => {
          const m = muscles.find((mm) => mm.id === id);
          if (!m) return null;
          const active = id === activeId;
          return (
            <Pressable
              key={id}
              onPress={() => handleSelect(id)}
              style={[styles.chip, active && styles.chipActive]}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {m.name_es}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.canvasWrapper}>
        <GLBErrorBoundary>
          <Canvas camera={{ position: [0, 0, 4], fov: 45 }} style={styles.canvas}>
            <ambientLight intensity={0.55} />
            <directionalLight position={[5, 5, 5]} intensity={1.2} />
            <directionalLight
              position={[-3, 2, -4]}
              intensity={0.4}
              color="#a8c8ff"
            />
            <Suspense fallback={null}>
              <Bounds fit clip observe margin={1.4} key={activeId}>
                <MuscleModel asset={asset} />
              </Bounds>
            </Suspense>
            <OrbitControls enablePan={false} />
          </Canvas>
          <LoadingIndicator />
        </GLBErrorBoundary>
      </View>

      {activeMuscle && (
        <View style={styles.footer}>
          <Text style={styles.footerName}>{activeMuscle.name_es}</Text>
          <Text style={styles.footerLatin}>{activeMuscle.name_latin}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  chipsRow: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    backgroundColor: colors.bg.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.accent.primary,
    borderColor: colors.accent.primary,
  },
  chipText: {
    ...typography.body.small,
    color: colors.text.muted,
  },
  chipTextActive: {
    color: colors.bg.primary,
    fontWeight: '600',
  },
  canvasWrapper: {
    flex: 1,
    position: 'relative',
  },
  canvas: {
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: -1,
  },
  loadingText: {
    color: colors.accent.light,
    fontSize: 14,
  },
  footer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerName: {
    ...typography.heading.h3,
    fontFamily: typography.heading.fontFamily,
    color: colors.accent.light,
  },
  footerLatin: {
    ...typography.body.small,
    fontStyle: 'italic',
    color: colors.text.muted,
  },
});
