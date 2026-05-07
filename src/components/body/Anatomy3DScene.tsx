import React, { Suspense, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Canvas, ThreeEvent } from '@react-three/fiber/native';
import { useGLTF, OrbitControls, Bounds } from '@react-three/drei/native';
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

  // Update emissive on selection change without re-traversing materials.
  useEffect(() => {
    gltf.scene.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mat = (obj as THREE.Mesh).material as THREE.MeshStandardMaterial;
        if (selected) {
          mat.emissive.copy(HIGHLIGHT_COLOR);
          mat.emissiveIntensity = SELECTED_EMISSIVE_INTENSITY;
        } else {
          mat.emissive.setHex(0x000000);
          mat.emissiveIntensity = 0;
        }
      }
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

export function Anatomy3DScene({ onMuscleSelect }: Anatomy3DSceneProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    onMuscleSelect?.(id);
  };

  const selectedMuscle = selectedId
    ? muscles.find((m) => m.id === selectedId)
    : null;

  return (
    <View style={styles.container}>
      <View style={styles.canvasWrapper}>
        <GLBErrorBoundary>
          <Canvas camera={{ position: [0, 0, 250], fov: 35 }} style={styles.canvas}>
            <ambientLight intensity={0.55} />
            <directionalLight position={[100, 100, 100]} intensity={1.2} />
            <directionalLight
              position={[-80, 40, -100]}
              intensity={0.4}
              color="#a8c8ff"
            />
            <Suspense fallback={null}>
              <Bounds fit clip observe margin={1.4}>
                {ANATOMY_3D_AVAILABLE_IDS.map((id) => (
                  <MuscleGroup
                    key={id}
                    muscleId={id}
                    asset={ANATOMY_3D_MODELS[id]}
                    selected={selectedId === id}
                    onSelect={handleSelect}
                  />
                ))}
              </Bounds>
            </Suspense>
            <OrbitControls enablePan={false} />
          </Canvas>
          <LoadingIndicator />
        </GLBErrorBoundary>
      </View>

      <View style={styles.footer}>
        {selectedMuscle ? (
          <>
            <Text style={styles.footerName}>{selectedMuscle.name_es}</Text>
            <Text style={styles.footerLatin}>{selectedMuscle.name_latin}</Text>
          </>
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
    minHeight: 56,
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
  footerHint: {
    ...typography.body.small,
    color: colors.text.muted,
    fontStyle: 'italic',
  },
});
