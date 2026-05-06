import React, { Suspense } from 'react';
import { View, StyleSheet } from 'react-native';
import { Canvas } from '@react-three/fiber/native';
import { useGLTF, OrbitControls } from '@react-three/drei/native';
import type { GLTF } from 'three-stdlib';
import { colors } from '../../theme';

// PoC test model — Khronos DamagedHelmet, the industry-standard glTF sample.
// Used only to validate that @react-three/fiber/native + Expo can load and
// render a GLB on device. Real anatomy models come in Fase 1 of the plan.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const POC_MODEL = require('../../../assets/3d-models/poc-helmet.glb');

function Model() {
  const gltf = useGLTF(POC_MODEL) as unknown as GLTF;
  return <primitive object={gltf.scene} />;
}

export function Anatomy3DPoCScene() {
  return (
    <View style={styles.container}>
      <Canvas
        camera={{ position: [0, 0, 3], fov: 45 }}
        style={styles.canvas}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} />
        <Suspense fallback={null}>
          <Model />
        </Suspense>
        <OrbitControls enablePan={false} />
      </Canvas>
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
});
