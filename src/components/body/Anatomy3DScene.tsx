import React, { useCallback, useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { GLView, ExpoWebGLRenderingContext } from 'expo-gl';
import { Renderer, TextureLoader } from 'expo-three';
import * as THREE from 'three';
import { Asset } from 'expo-asset';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { findMuscleAtPoint } from '../../data/muscleZones';
import { BodyView } from './bodyConstants';
import { colors } from '../../theme';

interface Anatomy3DSceneProps {
  onMuscleSelect?: (muscleId: string) => void;
}

// eslint-disable-next-line @typescript-eslint/no-var-requires
const FRONT_ASSET = require('../../../assets/anatomy/muscle_front.png');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const BACK_ASSET = require('../../../assets/anatomy/muscle_back.png');

const INITIAL_CAM_Z = 7;
const MIN_CAM_Z = 4;
const MAX_CAM_Z = 12;
const X_TILT_CLAMP = 0.35;
// Body 2D viewBox is 300x460 with image (PNG ratio ~0.714) centered via 'contain'.
// Plane keeps PNG aspect (3 x 4.2) → picking compensates the 20-unit top/bottom margin
// so a 3D tap maps to the same MUSCLE_ZONES coordinate space as the 2D viewer.
const PLANE_VBOX_H = 420;
const VBOX_Y_MARGIN = 20;

export function Anatomy3DScene({ onMuscleSelect }: Anatomy3DSceneProps) {
  const rotY = useRef(0);
  const rotX = useRef(0);
  const camZ = useRef(INITIAL_CAM_Z);
  const savedRotY = useRef(0);
  const savedRotX = useRef(0);
  const savedCamZ = useRef(INITIAL_CAM_Z);

  const groupRef = useRef<THREE.Group | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const frontPlaneRef = useRef<THREE.Mesh | null>(null);
  const backPlaneRef = useRef<THREE.Mesh | null>(null);
  const viewSize = useRef({ width: 0, height: 0 });
  const rafRef = useRef<number | null>(null);

  const updateRot = useCallback((dtx: number, dty: number) => {
    rotY.current = savedRotY.current + dtx;
    rotX.current = Math.max(
      -X_TILT_CLAMP,
      Math.min(X_TILT_CLAMP, savedRotX.current + dty),
    );
  }, []);

  const endRot = useCallback(() => {
    savedRotY.current = rotY.current;
    savedRotX.current = rotX.current;
  }, []);

  const updateZoom = useCallback((scale: number) => {
    camZ.current = Math.max(MIN_CAM_Z, Math.min(MAX_CAM_Z, savedCamZ.current / scale));
  }, []);

  const endZoom = useCallback(() => {
    savedCamZ.current = camZ.current;
  }, []);

  const resetView = useCallback(() => {
    rotY.current = 0;
    rotX.current = 0;
    camZ.current = INITIAL_CAM_Z;
    savedRotY.current = 0;
    savedRotX.current = 0;
    savedCamZ.current = INITIAL_CAM_Z;
  }, []);

  const handleTap = useCallback((x: number, y: number) => {
    const cam = cameraRef.current;
    const scene = sceneRef.current;
    const front = frontPlaneRef.current;
    const back = backPlaneRef.current;
    const { width, height } = viewSize.current;
    if (!cam || !scene || !front || !back || !onMuscleSelect || !width || !height) return;

    const ndc = new THREE.Vector2(
      (x / width) * 2 - 1,
      -((y / height) * 2 - 1),
    );
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(ndc, cam);
    const intersects = raycaster.intersectObjects([front, back], false);
    if (intersects.length === 0) return;

    const camDir = new THREE.Vector3();
    cam.getWorldDirection(camDir);

    const visible = intersects.find((h) => {
      if (!h.face) return false;
      const worldNormal = h.face.normal
        .clone()
        .applyQuaternion(h.object.getWorldQuaternion(new THREE.Quaternion()));
      return worldNormal.dot(camDir) < 0;
    });
    if (!visible || !visible.uv) return;

    const isFront = visible.object === front;
    const u = visible.uv.x;
    const v = visible.uv.y;
    const vx = (isFront ? u : 1 - u) * 300;
    const vy = VBOX_Y_MARGIN + (1 - v) * PLANE_VBOX_H;
    const view: BodyView = isFront ? 'front' : 'back';
    const muscleId = findMuscleAtPoint(view, vx, vy);
    if (muscleId) onMuscleSelect(muscleId);
  }, [onMuscleSelect]);

  const pan = Gesture.Pan()
    .maxPointers(1)
    .onUpdate((e) => {
      'worklet';
      runOnJS(updateRot)(e.translationX * 0.008, e.translationY * 0.008);
    })
    .onEnd(() => {
      'worklet';
      runOnJS(endRot)();
    });

  const pinch = Gesture.Pinch()
    .onUpdate((e) => {
      'worklet';
      runOnJS(updateZoom)(e.scale);
    })
    .onEnd(() => {
      'worklet';
      runOnJS(endZoom)();
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .maxDelay(250)
    .onEnd(() => {
      'worklet';
      runOnJS(resetView)();
    });

  const singleTap = Gesture.Tap()
    .numberOfTaps(1)
    .maxDuration(300)
    .onEnd((e) => {
      'worklet';
      runOnJS(handleTap)(e.x, e.y);
    });

  const composed = Gesture.Exclusive(
    doubleTap,
    Gesture.Simultaneous(pan, pinch),
    singleTap,
  );

  const onContextCreate = async (gl: ExpoWebGLRenderingContext) => {
    const width = gl.drawingBufferWidth;
    const height = gl.drawingBufferHeight;
    if (!viewSize.current.width || !viewSize.current.height) {
      viewSize.current = { width, height };
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(colors.bg.primary);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, INITIAL_CAM_Z);

    scene.add(new THREE.AmbientLight(0xffffff, 0.85));
    const dir = new THREE.DirectionalLight(0xfdf0c2, 0.45);
    dir.position.set(3, 5, 6);
    scene.add(dir);
    const rim = new THREE.DirectionalLight(0x8b6bd9, 0.25);
    rim.position.set(-4, 2, -3);
    scene.add(rim);

    const loader = new TextureLoader();
    const loadTexture = async (mod: number): Promise<THREE.Texture> => {
      const asset = Asset.fromModule(mod);
      await asset.downloadAsync();
      const uri = asset.localUri || asset.uri;
      const tex = await new Promise<THREE.Texture>((resolve, reject) => {
        loader.load(uri, resolve, undefined, reject);
      });
      tex.generateMipmaps = true;
      tex.minFilter = THREE.LinearMipMapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      return tex;
    };

    const [frontTex, backTex] = await Promise.all([
      loadTexture(FRONT_ASSET),
      loadTexture(BACK_ASSET),
    ]);

    const geom = new THREE.PlaneGeometry(3, 4.2);
    const frontMat = new THREE.MeshBasicMaterial({
      map: frontTex,
      transparent: true,
      alphaTest: 0.05,
      side: THREE.DoubleSide,
    });
    const backMat = new THREE.MeshBasicMaterial({
      map: backTex,
      transparent: true,
      alphaTest: 0.05,
      side: THREE.DoubleSide,
    });

    const front = new THREE.Mesh(geom, frontMat);
    const back = new THREE.Mesh(geom, backMat);
    back.rotation.y = Math.PI;
    front.renderOrder = 1;
    back.renderOrder = 1;

    const group = new THREE.Group();
    group.add(front);
    group.add(back);
    scene.add(group);

    const renderer = new Renderer({ gl });
    renderer.setSize(width, height);
    renderer.setClearColor(new THREE.Color(colors.bg.primary), 1);
    renderer.setPixelRatio(1);

    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;
    groupRef.current = group;
    frontPlaneRef.current = front;
    backPlaneRef.current = back;

    const tick = () => {
      const g = groupRef.current;
      const c = cameraRef.current;
      const r = rendererRef.current;
      const s = sceneRef.current;
      if (!g || !c || !r || !s) return;
      g.rotation.y = rotY.current;
      g.rotation.x = rotX.current;
      c.position.z = camZ.current;
      r.render(s, c);
      gl.endFrameEXP();
      rafRef.current = requestAnimationFrame(tick);
    };
    tick();
  };

  useEffect(() => {
    return () => {
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      sceneRef.current = null;
      cameraRef.current = null;
      rendererRef.current = null;
      groupRef.current = null;
      frontPlaneRef.current = null;
      backPlaneRef.current = null;
    };
  }, []);

  return (
    <GestureDetector gesture={composed}>
      <View
        style={styles.container}
        collapsable={false}
        onLayout={(e) => {
          viewSize.current = {
            width: e.nativeEvent.layout.width,
            height: e.nativeEvent.layout.height,
          };
        }}
      >
        <GLView style={styles.gl} onContextCreate={onContextCreate} />
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.bg.primary,
  },
  gl: { flex: 1 },
});
