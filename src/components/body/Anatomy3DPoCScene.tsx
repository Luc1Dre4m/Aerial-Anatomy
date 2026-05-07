import React, { Suspense } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Canvas } from '@react-three/fiber/native';
import { useGLTF, OrbitControls } from '@react-three/drei/native';
import type { GLTF } from 'three-stdlib';
import { colors } from '../../theme';

// First real anatomy model: clavicular part of the right pectoralis major
// (FMA34690 from BodyParts3D, CC BY-SA 2.1 Japan). Converted from binary STL
// to GLB via tools/stl-to-glb.mjs. Single muscle part used for Fase 1 validation;
// composite multi-part muscles come in a later commit.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const POC_MODEL = require('../../../assets/3d-models/m_pectoral_mayor_clavicular_right.glb');

function MuscleModel() {
  const gltf = useGLTF(POC_MODEL) as unknown as GLTF;
  return <primitive object={gltf.scene} scale={0.03} />;
}

export function Anatomy3DPoCScene() {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>3D PoC — Pectoral mayor (clavicular, R) · BodyParts3D CC BY-SA 2.1 JP</Text>
      <Canvas
        camera={{ position: [0, 0, 4], fov: 45 }}
        style={styles.canvas}
      >
        <ambientLight intensity={0.55} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} />
        <directionalLight position={[-3, 2, -4]} intensity={0.4} color="#a8c8ff" />
        <Suspense fallback={null}>
          <MuscleModel />
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
  label: {
    position: 'absolute',
    top: 12,
    left: 12,
    color: colors.accent.light,
    fontSize: 12,
    zIndex: 10,
  },
});
