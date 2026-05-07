import React, { Suspense } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Canvas } from '@react-three/fiber/native';
import { useGLTF, OrbitControls, Bounds } from '@react-three/drei/native';
import type { GLTF } from 'three-stdlib';
import { colors } from '../../theme';

// Composite pectoralis major: all 6 lateralized parts (clavicular/sternocostal/
// abdominal × right/left) merged into a single GLB by tools/stl-to-glb.mjs.
// FMA codes: 34690, 34691, 79979, 79980, 45874, 45875 from BodyParts3D
// (CC BY-SA 2.1 Japan). Geometry centered at origin in the conversion script.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const POC_MODEL = require('../../../assets/3d-models/m_pectoral_mayor.glb');

function MuscleModel() {
  const gltf = useGLTF(POC_MODEL) as unknown as GLTF;
  return <primitive object={gltf.scene} />;
}

function LoadingIndicator() {
  return (
    <View style={styles.loadingOverlay}>
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
  componentDidCatch(error: Error) { console.error('[Anatomy3DPoC]', error); }
  render() {
    if (this.state.error) {
      return (
        <View style={styles.loadingOverlay}>
          <Text style={[styles.loadingText, { color: '#ff6b6b' }]}>
            Error: {this.state.error.message}
          </Text>
        </View>
      );
    }
    return this.props.children;
  }
}

export function Anatomy3DPoCScene() {
  const [loaded, setLoaded] = React.useState(false);
  return (
    <View style={styles.container}>
      <Text style={styles.label}>3D PoC — Pectoral mayor (entero) · BodyParts3D CC BY-SA 2.1 JP</Text>
      <GLBErrorBoundary>
        <Canvas
          camera={{ position: [0, 0, 4], fov: 45 }}
          style={styles.canvas}
          onCreated={() => setLoaded(true)}
        >
          <ambientLight intensity={0.55} />
          <directionalLight position={[5, 5, 5]} intensity={1.2} />
          <directionalLight position={[-3, 2, -4]} intensity={0.4} color="#a8c8ff" />
          <Suspense fallback={null}>
            <Bounds fit clip observe margin={1.4}>
              <MuscleModel />
            </Bounds>
          </Suspense>
          <OrbitControls enablePan={false} />
        </Canvas>
      </GLBErrorBoundary>
      {!loaded && <LoadingIndicator />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  canvas: {
    flex: 1,
  },
  label: {
    position: 'absolute',
    top: 12,
    left: 12,
    color: colors.accent.light,
    fontSize: 12,
    zIndex: 10,
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
});
