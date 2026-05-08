import React, { Suspense, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Canvas, ThreeEvent, useFrame } from '@react-three/fiber/native';
import { useGLTF, OrbitControls, PerspectiveCamera } from '@react-three/drei/native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import type { GLTF } from 'three-stdlib';
import * as THREE from 'three';
import {
  ANATOMY_3D_MODELS,
  ANATOMY_3D_AVAILABLE_IDS,
  hasAnatomy3DModel,
} from '../../data/anatomy3DAssets';
import { muscles } from '../../data/muscles';
import { chains } from '../../data/chains';
import { colors, spacing, typography } from '../../theme';

interface Anatomy3DSceneProps {
  highlightedMuscles?: string[];
  onMuscleSelect?: (muscleId: string) => void;
  onViewDetail?: (muscleId: string) => void;
}

const HIGHLIGHT_COLOR = new THREE.Color(0xd4a843); // theme accent gold
const BASE_COLOR = new THREE.Color(0xc2412b); // anatomical muscle red
const SELECTED_EMISSIVE_INTENSITY = 0.6;

const CHAIN_COLORS: Record<string, THREE.Color> = {
  chain_anterior: new THREE.Color(0xe74c3c),
  chain_posterior: new THREE.Color(0x3498db),
  chain_lateral: new THREE.Color(0xf39c12),
  chain_espiral: new THREE.Color(0x9b59b6),
};

/**
 * One muscle group rendered into the shared scene at its native anatomical
 * coordinates (preserved from BodyParts3D). Each mesh is tagged with its
 * muscleId so the picker can map a tap to a known muscle. Materials are
 * cloned per-instance so highlighting one muscle doesn't affect others.
 */
function MuscleGroup({
  muscleId,
  asset,
  selected,
  highlightColor,
  onSelect,
}: {
  muscleId: string;
  asset: number;
  selected: boolean;
  highlightColor?: THREE.Color;
  onSelect: (id: string) => void;
}) {
  // useGLTF accepts RN asset module IDs at runtime even though its types want a string.
  const gltf = useGLTF(asset as unknown as string) as unknown as GLTF;
  const groupRef = useRef<THREE.Group | null>(null);

  // Tag every mesh with the muscleId on first mount and replace shared
  // materials with per-instance clones we can tint without bleeding into
  // other muscles' meshes.
  useEffect(() => {
    gltf.scene.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        mesh.userData.muscleId = muscleId;
        const original = mesh.material as THREE.MeshStandardMaterial;
        const clone = original.clone();
        clone.color.copy(BASE_COLOR);
        clone.emissive = new THREE.Color(0x000000);
        clone.emissiveIntensity = 0;
        mesh.material = clone;
      }
    });
  }, [gltf, muscleId]);

  // Update emissive only on the meshes of THIS group when its `selected`
  // prop flips. Chain mode passes `highlightColor`; individual selection
  // falls back to the gold accent. We avoid touching other groups, so
  // swapping selection touches just the affected materials.
  useEffect(() => {
    const tint = highlightColor ?? HIGHLIGHT_COLOR;
    gltf.scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh) return;
      const mat = mesh.material as THREE.MeshStandardMaterial;
      if (selected) {
        mat.emissive.copy(tint);
        mat.emissiveIntensity = SELECTED_EMISSIVE_INTENSITY;
      } else {
        mat.emissive.setHex(0x000000);
        mat.emissiveIntensity = 0;
      }
      mat.needsUpdate = true;
    });
  }, [selected, highlightColor, gltf]);

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    onSelect(muscleId);
  };

  return (
    <group ref={groupRef} onClick={handleClick}>
      <primitive object={gltf.scene} />
    </group>
  );
}

function LoadingIndicator() {
  return (
    <View style={styles.loadingOverlay} pointerEvents="none">
      <Text style={styles.loadingText}>Cargando modelos 3D…</Text>
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

function ReadySignal({ onReady }: { onReady: () => void }) {
  useEffect(() => {
    onReady();
  }, [onReady]);
  return null;
}

const MIN_CAM_DISTANCE = 400;
const MAX_CAM_DISTANCE = 3000;

/**
 * Reads a desired camera distance (from the origin, where the body is
 * centered) and applies it on every frame. The pinch handler outside the
 * Canvas updates the ref, so this stays cheap (no extra renders) and works
 * alongside OrbitControls' rotation handling.
 */
function CameraDistanceController({
  desiredDistanceRef,
}: {
  desiredDistanceRef: React.MutableRefObject<number>;
}) {
  useFrame(({ camera }) => {
    const target = new THREE.Vector3(0, 0, 0);
    const offset = camera.position.clone().sub(target);
    const currentDistance = offset.length();
    const desired = desiredDistanceRef.current;
    if (Math.abs(currentDistance - desired) > 0.5) {
      offset.setLength(desired);
      camera.position.copy(target).add(offset);
    }
  });
  return null;
}

/**
 * Wraps every muscle group and shifts the wrapper's position so the combined
 * bounding box is centered at world [0, 0, 0]. Without this, OrbitControls
 * orbits around the absolute anatomical origin (which sits ~1 km away from
 * the meshes in BodyParts3D's coordinate system), causing the body to swing
 * around a point outside itself when the user drags.
 */
function CenteredBody({ children, recenterKey }: { children: React.ReactNode; recenterKey: number }) {
  const innerRef = useRef<THREE.Group | null>(null);
  useEffect(() => {
    const group = innerRef.current;
    if (!group) return;
    group.position.set(0, 0, 0);
    group.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(group);
    if (box.isEmpty()) return;
    const center = box.getCenter(new THREE.Vector3());
    group.position.sub(center);
  }, [recenterKey]);

  return <group ref={innerRef}>{children}</group>;
}


export function Anatomy3DScene({ onMuscleSelect, onViewDetail }: Anatomy3DSceneProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedChainId, setSelectedChainId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  // Bumped each time we want CenteredBody to recompute its centering offset
  // (after all GLBs have settled).
  const [recenterTick, setRecenterTick] = useState(0);

  // Resolve which muscle ids are highlighted (chain takes priority over
  // individual selection; selecting a muscle clears the chain).
  const activeChain = selectedChainId
    ? chains.find((c) => c.id === selectedChainId) ?? null
    : null;
  const chainMuscleIds = new Set(
    activeChain?.muscles_ordered
      .map((m) => m.muscle_id)
      .filter((id) => hasAnatomy3DModel(id)) ?? []
  );
  const chainHighlightColor =
    selectedChainId && CHAIN_COLORS[selectedChainId]
      ? CHAIN_COLORS[selectedChainId]
      : undefined;

  // Camera distance is updated by the pinch handler (outside the Canvas) and
  // applied on every frame by CameraDistanceController. Using a ref instead
  // of state keeps the gesture path off React's render cycle.
  const desiredDistanceRef = useRef(1200);
  const pinchBaselineRef = useRef(1200);

  const updateDistance = (next: number) => {
    desiredDistanceRef.current = Math.max(
      MIN_CAM_DISTANCE,
      Math.min(MAX_CAM_DISTANCE, next)
    );
  };

  const commitDistance = () => {
    pinchBaselineRef.current = desiredDistanceRef.current;
  };

  const pinch = Gesture.Pinch()
    .onUpdate((e) => {
      'worklet';
      runOnJS(updateDistance)(pinchBaselineRef.current / e.scale);
    })
    .onEnd(() => {
      'worklet';
      runOnJS(commitDistance)();
    });

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setSelectedChainId(null); // tapping a muscle exits chain mode
    onMuscleSelect?.(id);
  };

  const handleChainSelect = (chainId: string) => {
    if (selectedChainId === chainId) {
      // Tapping the active chain again clears it.
      setSelectedChainId(null);
    } else {
      setSelectedChainId(chainId);
      setSelectedId(null);
    }
  };

  const selectedMuscle = selectedId
    ? muscles.find((m) => m.id === selectedId)
    : null;

  return (
    <View style={styles.container}>
      {/* Chain selector — chips for biomechanical chains. Tap to highlight
          all member muscles of a chain at once with the chain's signature
          color; tap again to clear. */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chainChipsRow}
      >
        {chains.map((c) => {
          const active = selectedChainId === c.id;
          const tint = CHAIN_COLORS[c.id] ?? HIGHLIGHT_COLOR;
          const tintHex = `#${tint.getHexString()}`;
          return (
            <Pressable
              key={c.id}
              onPress={() => handleChainSelect(c.id)}
              style={[
                styles.chainChip,
                active && { backgroundColor: tintHex, borderColor: tintHex },
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
            >
              <Text
                style={[
                  styles.chainChipText,
                  active && styles.chainChipTextActive,
                ]}
              >
                {c.name_es}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <GestureDetector gesture={pinch}>
        <View style={styles.canvasWrapper}>
          <GLBErrorBoundary>
            <Canvas style={styles.canvas}>
            {/*
              Camera fixed at a known distance on -Y looking at origin, with
              up=+Z so BodyParts3D's anatomical Z (superior axis) maps to
              screen vertical. No <Bounds> here — its auto-fit was fighting
              with OrbitControls and the user-set up vector. CenteredBody
              already pins the body to the origin, so a fixed 1200 mm offset
              gives a stable starting frame.
            */}
            <PerspectiveCamera
              makeDefault
              position={[0, -1200, 0]}
              up={[0, 0, 1]}
              fov={35}
              near={1}
              far={5000}
            />
            <CameraDistanceController desiredDistanceRef={desiredDistanceRef} />
            <ambientLight intensity={0.55} />
            <directionalLight position={[100, 100, 100]} intensity={1.2} />
            <directionalLight
              position={[-80, 40, -100]}
              intensity={0.4}
              color="#a8c8ff"
            />
            <Suspense fallback={null}>
              <CenteredBody recenterKey={recenterTick}>
                {ANATOMY_3D_AVAILABLE_IDS.map((id) => {
                  const isInChain = chainMuscleIds.has(id);
                  const isSelected = selectedChainId
                    ? isInChain
                    : selectedId === id;
                  return (
                    <MuscleGroup
                      key={id}
                      muscleId={id}
                      asset={ANATOMY_3D_MODELS[id]}
                      selected={isSelected}
                      highlightColor={isInChain ? chainHighlightColor : undefined}
                      onSelect={handleSelect}
                    />
                  );
                })}
              </CenteredBody>
              <ReadySignal
                onReady={() => {
                  setReady(true);
                  setRecenterTick((t) => t + 1);
                }}
              />
            </Suspense>
            {/*
              OrbitControls only — CameraControls turned out to use DOM APIs
              (domElement.setAttribute) that don't exist in react-native and
              crash the canvas. Zoom is disabled here because OrbitControls'
              two-finger dolly handler in react-native has a known bug
              ("Cannot read property 'x' of undefined") on touch start.
              Pinch zoom will need a custom gesture-handler implementation.
            */}
            <OrbitControls
              enablePan={false}
              enableZoom={false}
              enableDamping={false}
              rotateSpeed={1.0}
              target={[0, 0, 0]}
            />
            </Canvas>
            {!ready && <LoadingIndicator />}
          </GLBErrorBoundary>
        </View>
      </GestureDetector>

      <View style={styles.footer}>
        {activeChain ? (
          <ScrollView style={styles.footerScroll} showsVerticalScrollIndicator={false}>
            <Text style={styles.footerName}>{activeChain.name_es}</Text>
            <Text style={styles.footerLatin}>{activeChain.name_en}</Text>
            <Text style={styles.footerSection}>Descripción</Text>
            <Text style={styles.footerBody}>{activeChain.description_es}</Text>
            <Text style={styles.footerSection}>Relevancia para artes aéreas</Text>
            <Text style={styles.footerBody}>{activeChain.relevance_es}</Text>
            <Text style={styles.footerSection}>
              Músculos en la cadena ({activeChain.muscles_ordered.length})
            </Text>
            {activeChain.muscles_ordered.map((m) => {
              const muscle = muscles.find((mm) => mm.id === m.muscle_id);
              if (!muscle) return null;
              const has3D = hasAnatomy3DModel(m.muscle_id);
              return (
                <Text key={m.muscle_id} style={styles.footerBody}>
                  {m.position_in_chain}. {muscle.name_es}
                  {has3D ? '' : ' (sin modelo 3D)'}
                </Text>
              );
            })}
          </ScrollView>
        ) : selectedMuscle ? (
          <>
            <ScrollView style={styles.footerScroll} showsVerticalScrollIndicator={false}>
              <Text style={styles.footerName}>{selectedMuscle.name_es}</Text>
              <Text style={styles.footerLatin}>{selectedMuscle.name_latin}</Text>
              <Text style={styles.footerSection}>Función</Text>
              <Text style={styles.footerBody}>{selectedMuscle.primary_function_es}</Text>
              <Text style={styles.footerSection}>Descripción</Text>
              <Text style={styles.footerBody}>{selectedMuscle.description_es}</Text>
              <Text style={styles.footerSection}>Origen → Inserción</Text>
              <Text style={styles.footerBody}>
                {selectedMuscle.origin_es}
                {'\n→ '}
                {selectedMuscle.insertion_es}
              </Text>
              {selectedMuscle.innervation && (
                <>
                  <Text style={styles.footerSection}>Inervación</Text>
                  <Text style={styles.footerBody}>{selectedMuscle.innervation}</Text>
                </>
              )}
            </ScrollView>
            {onViewDetail && (
              <Pressable
                style={styles.detailButton}
                onPress={() => onViewDetail(selectedMuscle.id)}
                accessibilityRole="button"
                accessibilityLabel={`Ver detalle completo de ${selectedMuscle.name_es}`}
              >
                <Text style={styles.detailButtonText}>Ver detalle completo →</Text>
              </Pressable>
            )}
          </>
        ) : (
          <Text style={styles.footerHint}>
            Toca un músculo para seleccionarlo o elegí una cadena arriba
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  chainChipsRow: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
    gap: spacing.xs,
    flexGrow: 0,
  },
  chainChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    backgroundColor: colors.bg.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chainChipText: {
    ...typography.body.small,
    color: colors.text.muted,
    fontSize: 12,
  },
  chainChipTextActive: {
    color: '#000000',
    fontWeight: '700',
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
    minHeight: 56,
    maxHeight: 320,
  },
  footerScroll: {
    flexShrink: 1,
  },
  detailButton: {
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    backgroundColor: colors.accent.primary,
    alignItems: 'center',
  },
  detailButtonText: {
    ...typography.body.regular,
    color: colors.bg.primary,
    fontWeight: '600',
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
    marginBottom: spacing.sm,
  },
  footerSection: {
    ...typography.body.small,
    color: colors.accent.primary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: spacing.sm,
  },
  footerBody: {
    ...typography.body.small,
    color: colors.text.primary,
    marginTop: 2,
  },
  footerHint: {
    ...typography.body.small,
    color: colors.text.muted,
    fontStyle: 'italic',
  },
});
