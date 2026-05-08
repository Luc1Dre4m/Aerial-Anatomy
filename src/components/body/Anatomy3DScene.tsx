import React, { Suspense, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Canvas, ThreeEvent, useFrame } from '@react-three/fiber/native';
import { useGLTF, OrbitControls, PerspectiveCamera } from '@react-three/drei/native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import type { GLTF } from 'three-stdlib';
import * as THREE from 'three';
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

const HIGHLIGHT_COLOR = new THREE.Color(0xd4a843); // theme accent gold
const BASE_COLOR = new THREE.Color(0xc2412b); // anatomical muscle red
const SELECTED_EMISSIVE_INTENSITY = 0.6;

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
  onSelect,
}: {
  muscleId: string;
  asset: number;
  selected: boolean;
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
  // prop flips. We avoid touching other groups, so swapping selection from
  // muscle A to muscle B touches just A's and B's materials, not all six.
  useEffect(() => {
    gltf.scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh) return;
      const mat = mesh.material as THREE.MeshStandardMaterial;
      if (selected) {
        mat.emissive.copy(HIGHLIGHT_COLOR);
        mat.emissiveIntensity = SELECTED_EMISSIVE_INTENSITY;
      } else {
        mat.emissive.setHex(0x000000);
        mat.emissiveIntensity = 0;
      }
      mat.needsUpdate = true;
    });
  }, [selected, gltf]);

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


export function Anatomy3DScene({ onMuscleSelect }: Anatomy3DSceneProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  // Bumped each time we want CenteredBody to recompute its centering offset
  // (after all GLBs have settled).
  const [recenterTick, setRecenterTick] = useState(0);

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
    onMuscleSelect?.(id);
  };

  const selectedMuscle = selectedId
    ? muscles.find((m) => m.id === selectedId)
    : null;

  return (
    <View style={styles.container}>
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
                {ANATOMY_3D_AVAILABLE_IDS.map((id) => (
                  <MuscleGroup
                    key={id}
                    muscleId={id}
                    asset={ANATOMY_3D_MODELS[id]}
                    selected={selectedId === id}
                    onSelect={handleSelect}
                  />
                ))}
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
        {selectedMuscle ? (
          <ScrollView showsVerticalScrollIndicator={false}>
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
        ) : (
          <Text style={styles.footerHint}>Toca un músculo para seleccionarlo</Text>
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
    maxHeight: 280,
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
