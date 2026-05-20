import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Canvas, ThreeEvent, useFrame, useThree } from '@react-three/fiber/native';
import { useGLTF, OrbitControls } from '@react-three/drei/native';
import type { GLTF } from 'three-stdlib';
import * as THREE from 'three';
import * as Haptics from 'expo-haptics';

// Picking strategy: AABB raycast at the per-mesh level (used by R3F's event
// system on every pointer-move event for hover detection) PLUS a
// triangle-exact refinement that runs ONLY inside the click handler.
//
// Per-frame cost: O(1) AABB tests during rotate / hover. No lag.
// Per-click cost: ~100 ms in the worst case to walk the 1-3 muscles whose
// bbox the ray crosses and test their actual triangles. Acceptable.
//
// This is the right balance: smooth rotation + precise picking. BVH (which
// would be even faster) is out because building the BVH for a 200k-tri
// muscle blocks the JS thread for seconds.
const tmpBox = new THREE.Box3();
const tmpVec = new THREE.Vector3();
// Capture three.js's prototype Mesh.raycast (triangle-exact) at module load
// time, BEFORE we override per-mesh raycast with aabbRaycast. We invoke
// this directly in click refinement to run a real triangle test.
const defaultMeshRaycast = THREE.Mesh.prototype.raycast;
function aabbRaycast(
  this: THREE.Mesh,
  raycaster: THREE.Raycaster,
  intersects: THREE.Intersection[]
) {
  if (!this.geometry.boundingBox) this.geometry.computeBoundingBox();
  this.updateMatrixWorld();
  tmpBox.copy(this.geometry.boundingBox!).applyMatrix4(this.matrixWorld);
  const hit = raycaster.ray.intersectBox(tmpBox, tmpVec);
  if (hit) {
    intersects.push({
      distance: raycaster.ray.origin.distanceTo(hit),
      point: hit.clone(),
      object: this,
    });
  }
}

/**
 * Triangle-exact refinement. Walks the AABB intersections (already sorted by
 * R3F by distance) and runs the stock three.js triangle raycast on each.
 * Returns the muscleId of the first muscle whose triangles actually
 * intersect the ray. Falls back to the topmost AABB hit if no triangle
 * touches.
 *
 * This is called only from inside handleClick — never during pointermove
 * events — so it doesn't impact rotation FPS.
 */
function refineClickToMuscleId(
  event: ThreeEvent<MouseEvent>,
  aabbFallbackId: string
): string {
  const raycaster = new THREE.Raycaster();
  raycaster.ray.copy(event.ray);
  for (const hit of event.intersections) {
    const triHits: THREE.Intersection[] = [];
    defaultMeshRaycast.call(hit.object as THREE.Mesh, raycaster, triHits);
    if (triHits.length === 0) continue;
    let obj: THREE.Object3D | null = hit.object;
    while (obj) {
      const id = (obj.userData as { muscleId?: string } | undefined)?.muscleId;
      if (id) return id;
      obj = obj.parent;
    }
  }
  return aabbFallbackId;
}
import {
  ANATOMY_3D_MODELS,
  ANATOMY_3D_AVAILABLE_IDS,
} from '../../data/anatomy3DAssets';
import { colors, spacing, typography } from '../../theme';

interface Anatomy3DSceneProps {
  highlightedMuscles?: string[];
  // Selected muscle id is now controlled from above (CuerpoScreen). The
  // info panel UI moved out of this component into MuscleInfoCard which is
  // rendered in the parent's "secondary slot" (in place of MuscleOfTheDay)
  // so it doesn't overlap the canvas anymore.
  selectedMuscleId?: string | null;
  onMuscleSelect?: (muscleId: string) => void;
}

const HIGHLIGHT_COLOR = new THREE.Color(0xd4a843); // theme accent gold
const BASE_COLOR = new THREE.Color(0xc2412b); // anatomical muscle red
const SELECTED_EMISSIVE_INTENSITY = 0.6;
// Match the canvas background so the fog blends meshes into the bg color
// rather than fading them to a different shade.
const FOG_COLOR = colors.bg.primary;

/**
 * One muscle group rendered into the shared scene at its native anatomical
 * coordinates (preserved from BodyParts3D). Each mesh is tagged with its
 * muscleId so the picker can map a tap to a known muscle. Materials are
 * cloned per-instance so highlighting one muscle doesn't affect others.
 */
// Wrapped in React.memo so changing `selectedId` in the parent only triggers
// re-renders for the two muscles whose `selected` prop actually flipped (the
// previously-selected and the newly-selected one), instead of re-rendering
// all 13 groups. That saves 11 wasted gltf.scene.traverse passes per pick
// and visibly speeds up the selection response.
const MuscleGroup = React.memo(function MuscleGroupImpl({
  muscleId,
  asset,
  selected,
  highlightColor,
  onSelect,
  onLoaded,
}: {
  muscleId: string;
  asset: number;
  selected: boolean;
  highlightColor?: THREE.Color;
  onSelect: (id: string) => void;
  onLoaded: (id: string) => void;
}) {
  // useGLTF accepts RN asset module IDs at runtime even though its types want a string.
  console.log('[3D] MuscleGroup render start', muscleId, 'asset:', asset);
  const gltf = useGLTF(asset as unknown as string) as unknown as GLTF;
  const groupRef = useRef<THREE.Group | null>(null);

  // Replace each mesh's material with a fresh MeshLambertMaterial. Lambert is
  // ~half the per-pixel cost of the original MeshStandardMaterial coming out
  // of GLTFLoader and good enough for matte muscle tissue (no PBR metalness
  // is meaningful here). Doing this once per muscle keeps the highlight
  // emissive scoped to its own group.
  useEffect(() => {
    let meshCount = 0;
    gltf.scene.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        mesh.userData.muscleId = muscleId;
        const lambert = new THREE.MeshLambertMaterial({
          color: BASE_COLOR.clone(),
          emissive: new THREE.Color(0x000000),
          emissiveIntensity: 0,
        });
        mesh.material = lambert;
        // Replace this mesh's raycast with the AABB version (no precompute,
        // no JS thread block). See top-of-file for the rationale.
        mesh.raycast = aabbRaycast;
        meshCount++;
      }
    });
    console.log('[3D] MuscleGroup gltf ready', muscleId, 'meshes:', meshCount);
    onLoaded(muscleId);
  }, [gltf, muscleId, onLoaded]);

  // Update emissive only on the meshes of THIS group when its `selected`
  // prop flips. Chain mode passes `highlightColor`; individual selection
  // falls back to the gold accent.
  useEffect(() => {
    const tint = highlightColor ?? HIGHLIGHT_COLOR;
    gltf.scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh) return;
      const mat = mesh.material as THREE.MeshLambertMaterial;
      if (selected) {
        mat.emissive.copy(tint);
        mat.emissiveIntensity = SELECTED_EMISSIVE_INTENSITY;
      } else {
        mat.emissive.setHex(0x000000);
        mat.emissiveIntensity = 0;
      }
      // No `mat.needsUpdate = true` here: emissive color/intensity are
      // shader uniforms, not anything that requires a program recompile.
      // Setting needsUpdate triggered a 50-200 ms shader rebuild on every
      // selection change, which made the highlight glow "tarde en aparecer".
    });
  }, [selected, highlightColor, gltf]);

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    // AABB-only pick. We previously added an async triangle-exact refinement
    // for cases where 2+ bboxes overlap, but the triangle iteration is
    // synchronous (~100-200 ms on a 200k-tri muscle) and blocked the JS
    // thread once the setTimeout fired — if the user started rotating right
    // after a click, that freeze interrupted the rotation ("se pega").
    // Smooth rotation matters more than overlap-zone precision; AABB-only
    // is the right tradeoff until we add a proper BVH (async build).
    //
    // Haptic feedback en la selección: selectionAsync es el tap suave
    // estándar de iOS — en Android se traduce a un click sutil del motor.
    // Fire-and-forget: si haptics no está disponible (web, simulador sin
    // permiso), el catch silencioso evita romper el flujo de pick.
    Haptics.selectionAsync().catch(() => undefined);
    onSelect(muscleId);
  };

  return (
    <group ref={groupRef} onClick={handleClick}>
      <primitive object={gltf.scene} />
    </group>
  );
});

class GLBErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    console.error('[3D] GLBErrorBoundary caught', error?.message, error);
    return { error };
  }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[3D] GLBErrorBoundary componentDidCatch', error?.message, info?.componentStack);
  }
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

// Silhouette is calibrated to 1700 mm total height centered at origin, so the
// body fills the portrait viewport tightly. At fov=35° a 2700 mm camera
// distance gives a vertical frustum of ~1700 mm — body just fits with a few
// mm of margin. Range expanded so the user can zoom into a single muscle
// (close approach) and pull out for an overview without hitting clamps.
const INITIAL_CAM_DISTANCE = 2700;
const MIN_CAM_DISTANCE = 400;
const MAX_CAM_DISTANCE = 7000;
// Body lives at the world origin. Trying BODY_OFFSET_X != 0 again pulled
// the rendered body to the LEFT of canvas center (some rendering-pipeline
// bias we don't fully understand), opposite of what we expected. Back to 0.
const BODY_OFFSET_X = 0;

// Body shift factor for visual centering via setViewOffset. 0.20 was the
// value that centered the body on the user's device. Pick precision is now
// handled by the hybrid AABB + triangle raycaster below, so we can afford
// the larger visual shift without sacrificing tap accuracy.
const HORIZONTAL_SHIFT_FACTOR: number = 0.20;

/**
 * Minimal per-frame enforcer: only the two things R3F-native doesn't seem to
 * apply correctly on its own. NOT touching position / up / lookAt anymore so
 * OrbitControls is free to rotate the camera.
 *
 *  1) `fov` + projection matrix — drei's `<PerspectiveCamera makeDefault>` and
 *     the Canvas's `camera={{ fov }}` prop both turned out to leave the
 *     rendered camera with the default fov=75°, halving the apparent body
 *     size. Forcing fov=35 and calling updateProjectionMatrix() each frame
 *     guarantees the projection reflects the configured fov.
 *  2) `gl.setViewport(0, 0, drawingBufferWidth, drawingBufferHeight)` — the
 *     viewport in expo-gl was being set to a sub-rectangle of the canvas
 *     drawing buffer (the bottom-left ~54%), which caused the body to
 *     render in the lower-left corner with the rest of the canvas blank.
 *     Forcing the viewport to span the full drawing buffer fixes the
 *     centering. drawingBufferWidth/Height (not size × my-set-dpr) is
 *     authoritative — the device's native pixel ratio (≈2.75 on a Xiaomi)
 *     can differ from the renderer's setPixelRatio value.
 */
// Factor de damping del lerp por frame. ~0.15 → 90% de recorrido en ~14
// frames a 60fps ≈ 230 ms, el "200 ms cubic-out" que Tomás pidió en la
// junta directiva del 2026-05-15. Subirlo (ej. 0.25) hace la transición
// más rápida pero menos cinemática.
const VIEW_OFFSET_EASE = 0.15;

function CameraEnforcer({
  muscleCenterRef,
}: {
  muscleCenterRef: React.MutableRefObject<THREE.Vector3 | null>;
}) {
  const loggedRef = useRef(false);
  // Estado animado del setViewOffset: lerpea hacia un target cada frame en
  // lugar de saltarse instantáneamente. Hace que seleccionar un músculo se
  // sienta como "la cámara desliza al músculo al centro" en vez de un cut.
  const currentOffsetRef = useRef({ dx: 0, dy: 0 });
  useFrame(({ camera, gl, size }) => {
    const cam = camera as THREE.PerspectiveCamera;
    if (typeof cam.fov !== 'number') return; // not a perspective camera

    if (cam.fov !== 35 || cam.near !== 1 || cam.far !== 8000) {
      cam.fov = 35;
      cam.near = 1;
      cam.far = 8000;
    }

    // 1) Calcular target offset para este frame.
    //
    // Paradigma unificado: el setViewOffset usa siempre fullWidth = W*(1+HSF)
    // y fullHeight = H. Cuando no hay selección, offsetX = offsetY = 0 → el
    // frustum se ensancha hacia la derecha → el body (en origen) aparece a
    // ~60% del canvas (calibrado). Cuando hay un músculo seleccionado,
    // calculamos el offset que lo lleve al canvas center DENTRO de ese
    // frustum ensanchado, así el zoom-in implícito del body-shift se
    // preserva entre modos y la transición es continua.
    let targetDx = 0;
    let targetDy = 0;
    const muscleCenter = muscleCenterRef.current;
    if (muscleCenter) {
      // Proyectar SIN viewOffset → posición natural del músculo en pantalla.
      cam.clearViewOffset();
      cam.updateProjectionMatrix();
      tmpVec.copy(muscleCenter).project(cam);
      const screenX = ((tmpVec.x + 1) / 2) * size.width;
      const screenY = ((1 - tmpVec.y) / 2) * size.height;
      // Derivación: con setViewOffset(W*(1+HSF), H, ox, 0, W, H), un punto
      // a NDC.x_ref = N proyecta a NDC.x_new = (1+HSF)*N + HSF - 2*ox/W.
      // Resolviendo ox para NDC.x_new = 0 (canvas center):
      //   ox = W * ((1+HSF)*N + HSF) / 2 = (1+HSF)*screenX - W/2
      // Para Y (sin shift): oy = screenY - H/2.
      targetDx = (1 + HORIZONTAL_SHIFT_FACTOR) * screenX - size.width / 2;
      targetDy = screenY - size.height / 2;
    }

    // 2) Lerp suave hacia el target. El damping constante por frame produce
    // una curva exponencial que se siente como cubic-out (rápido al inicio,
    // lento al final).
    currentOffsetRef.current.dx +=
      (targetDx - currentOffsetRef.current.dx) * VIEW_OFFSET_EASE;
    currentOffsetRef.current.dy +=
      (targetDy - currentOffsetRef.current.dy) * VIEW_OFFSET_EASE;

    // 3) Aplicar el setViewOffset unificado.
    const fullW = size.width * (1 + HORIZONTAL_SHIFT_FACTOR);
    cam.setViewOffset(
      fullW,
      size.height,
      currentOffsetRef.current.dx,
      currentOffsetRef.current.dy,
      size.width,
      size.height
    );
    cam.updateProjectionMatrix();

    type GLLike = {
      drawingBufferWidth?: number;
      drawingBufferHeight?: number;
      getPixelRatio?: () => number;
    };
    const glAny = gl as unknown as GLLike;
    const bufW = glAny.drawingBufferWidth ?? (size.width * (glAny.getPixelRatio?.() ?? 1));
    const bufH = glAny.drawingBufferHeight ?? (size.height * (glAny.getPixelRatio?.() ?? 1));
    gl.setViewport(0, 0, bufW, bufH);

    if (!loggedRef.current) {
      loggedRef.current = true;
      console.log('[3D] CameraEnforcer first frame — fov', cam.fov,
        'pos', cam.position.x.toFixed(0), cam.position.y.toFixed(0), cam.position.z.toFixed(0),
        'size', size.width, 'x', size.height,
        'buf', bufW, 'x', bufH,
        'pixelRatio', glAny.getPixelRatio?.() ?? 'n/a');
    }
  });
  return null;
}

/**
 * Per-frame: clamp OrbitControls' min/max distance to the desired value.
 * OrbitControls' update() then snaps spherical.radius to that range using
 * its own dolly path — same code path as built-in zoom — so it composes
 * cleanly with the rotation it's also doing.
 *
 * We disabled `enableZoom` (multi-touch crashes on RN), so this controller
 * is the only thing that changes the radius. Reads a regular React state
 * value (not SharedValue): zoom changes come from button taps now, no
 * gesture-handler in the loop.
 */
function CameraDistanceController({
  desiredDistance,
  controlsRef,
}: {
  desiredDistance: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  controlsRef: React.MutableRefObject<any>;
}) {
  useFrame(() => {
    const controls = controlsRef.current;
    if (!controls) return;
    if (controls.minDistance !== desiredDistance || controls.maxDistance !== desiredDistance) {
      controls.minDistance = desiredDistance;
      controls.maxDistance = desiredDistance;
    }
  });
  return null;
}

/**
 * Exposes the live R3F scene to a parent-held ref so a useEffect outside
 * the Canvas can traverse it (e.g. to find the bbox center of a muscle
 * when it gets selected, then move the orbit target to that point).
 */
function SceneRefBridge({
  sceneRef,
}: {
  sceneRef: React.MutableRefObject<THREE.Scene | null>;
}) {
  const scene = useThree((s) => s.scene);
  useEffect(() => {
    sceneRef.current = scene;
  }, [scene, sceneRef]);
  return null;
}

// ---- Body silhouette ----
// A translucent flesh-toned envelope that wraps the colored anatomical
// muscles. The look matches the muscle palette (warm reddish brown matching
// the BASE_COLOR muscle tissue) instead of clashing with a neutral grey, so
// the silhouette reads as "outer flesh layer" rather than "geometric primitive".
// raycast=null means taps still hit the muscle meshes underneath.
//
// Coordinates follow BodyParts3D's convention as preserved by `CenteredBody`:
// X = lateral, Y = anteroposterior (-Y = anterior, towards the camera when
// it sits at [0, -INITIAL_CAM_DISTANCE, 0]), Z = vertical (head=+Z, feet=-Z).
// All values in millimetres, calibrated against a ~1700 mm reference height.
const SKIN_COLOR = '#a0524a';        // pale flesh / warm muscle pink-brown
const SKIN_EMISSIVE = '#3a1a14';     // very dark warm tone — internal glow hint
const SKIN_OPACITY = 0.20;           // dialled down so muscles read as the focus
const ignoreRaycast = () => null;

function BodySilhouette() {
  // Single shared material instance — every silhouette mesh references the
  // same MeshLambertMaterial so we don't pay per-segment uniform uploads.
  const skinMat = React.useMemo(() => new THREE.MeshLambertMaterial({
    color: new THREE.Color(SKIN_COLOR),
    emissive: new THREE.Color(SKIN_EMISSIVE),
    emissiveIntensity: 0.45,
    transparent: true,
    opacity: SKIN_OPACITY,
    // Disable depthWrite so the silhouette doesn't occlude the muscles inside
    // (transparent surfaces shouldn't write to the depth buffer anyway).
    depthWrite: false,
    // Render the back faces too so the silhouette feels volumetric when seen
    // from any angle (otherwise the back of the torso "pops out" when you
    // orbit past 90°).
    side: THREE.DoubleSide,
  }), []);

  // Cleanup the material on unmount to avoid GPU leaks across re-mounts.
  useEffect(() => () => skinMat.dispose(), [skinMat]);

  // Capsule's default long axis is +Y. We rotate +90° around X so it lies
  // along anatomical Z (the long axis of an extended limb).
  const limbRotation: [number, number, number] = [Math.PI / 2, 0, 0];

  // Continuous tapered limbs without separate joint spheres — each limb is
  // a single cylinder running floor-to-ceiling so the eye reads it as one
  // smooth piece instead of "bones-and-balls". Anatomical detail is conveyed
  // through subtle width modulation (deltoid bulge, calf swell) rather than
  // through stacked primitives.
  //
  // Total height target: 1700 mm, centered around Z=0. Top of head = +850,
  // bottom of feet = -850. CenteredBody parks the muscle bbox at the origin
  // too, so the silhouette and the muscles share the same anatomical frame.
  return (
    <group>
      {/* ---- Head (single elongated ellipsoid, no separate jaw / nose) ---- */}
      <mesh position={[0, 0, 720]} scale={[0.85, 1.1, 1]} material={skinMat} raycast={ignoreRaycast}>
        <sphereGeometry args={[110, 36, 28]} />
      </mesh>

      {/* ---- Neck — short tapered cylinder, blends head into chest ---- */}
      <mesh position={[0, 0, 580]} rotation={limbRotation} material={skinMat} raycast={ignoreRaycast}>
        <cylinderGeometry args={[55, 80, 90, 28]} />
      </mesh>

      {/* ---- Torso — 4 closely overlapping ellipsoids that blend into a
          continuous hourglass: shoulders → ribcage → waist → pelvis ---- */}
      {/* Shoulders / upper chest — note: the wide X scale here is what
          creates the deltoid bulge, no separate shoulder sphere needed. */}
      <mesh position={[0, 0, 430]} scale={[1.55, 0.55, 0.6]} material={skinMat} raycast={ignoreRaycast}>
        <sphereGeometry args={[200, 36, 28]} />
      </mesh>
      {/* Lower ribcage */}
      <mesh position={[0, 5, 240]} scale={[1.05, 0.55, 0.85]} material={skinMat} raycast={ignoreRaycast}>
        <sphereGeometry args={[195, 36, 28]} />
      </mesh>
      {/* Waist — pinched */}
      <mesh position={[0, 0, 50]} scale={[0.9, 0.5, 0.85]} material={skinMat} raycast={ignoreRaycast}>
        <sphereGeometry args={[175, 32, 24]} />
      </mesh>
      {/* Pelvis — wider again */}
      <mesh position={[0, 0, -160]} scale={[1.1, 0.55, 0.9]} material={skinMat} raycast={ignoreRaycast}>
        <sphereGeometry args={[195, 36, 28]} />
      </mesh>

      {/* ---- Arms: ONE continuous tapered cylinder per side covering
          shoulder → wrist (no elbow sphere). 700 mm long, R=70 at the
          shoulder (deltoid), R=32 at the wrist. ---- */}
      <mesh position={[-225, 0, 100]} rotation={limbRotation} material={skinMat} raycast={ignoreRaycast}>
        <cylinderGeometry args={[70, 32, 720, 28, 4]} />
      </mesh>
      <mesh position={[225, 0, 100]} rotation={limbRotation} material={skinMat} raycast={ignoreRaycast}>
        <cylinderGeometry args={[70, 32, 720, 28, 4]} />
      </mesh>

      {/* ---- Hands — flattened ellipsoids, blended onto the wrist end ---- */}
      <mesh position={[-225, 0, -300]} scale={[1.1, 0.5, 1.5]} material={skinMat} raycast={ignoreRaycast}>
        <sphereGeometry args={[55, 28, 22]} />
      </mesh>
      <mesh position={[225, 0, -300]} scale={[1.1, 0.5, 1.5]} material={skinMat} raycast={ignoreRaycast}>
        <sphereGeometry args={[55, 28, 22]} />
      </mesh>

      {/* ---- Legs: ONE continuous tapered cylinder per side covering
          hip → ankle (no knee sphere). 700 mm long, R=100 at the hip
          (gluteal/quad mass), R=42 at the ankle. ---- */}
      <mesh position={[-115, 0, -540]} rotation={limbRotation} material={skinMat} raycast={ignoreRaycast}>
        <cylinderGeometry args={[100, 42, 700, 28, 4]} />
      </mesh>
      <mesh position={[115, 0, -540]} rotation={limbRotation} material={skinMat} raycast={ignoreRaycast}>
        <cylinderGeometry args={[100, 42, 700, 28, 4]} />
      </mesh>

      {/* ---- Calf swell — small ovoid pushed back (+Y) and overlapping the
          mid-leg, suggesting gastrocnemius bulk without breaking the leg
          into a separate piece. ---- */}
      <mesh position={[-115, 25, -680]} scale={[0.85, 0.9, 1.3]} material={skinMat} raycast={ignoreRaycast}>
        <sphereGeometry args={[55, 24, 18]} />
      </mesh>
      <mesh position={[115, 25, -680]} scale={[0.85, 0.9, 1.3]} material={skinMat} raycast={ignoreRaycast}>
        <sphereGeometry args={[55, 24, 18]} />
      </mesh>

      {/* ---- Feet — elongated forward (-Y), flat. Slightly overlap the
          ankle end of the leg so there's no visible seam. ---- */}
      <mesh position={[-115, -75, -870]} scale={[1, 1.9, 0.4]} material={skinMat} raycast={ignoreRaycast}>
        <sphereGeometry args={[58, 28, 22]} />
      </mesh>
      <mesh position={[115, -75, -870]} scale={[1, 1.9, 0.4]} material={skinMat} raycast={ignoreRaycast}>
        <sphereGeometry args={[58, 28, 22]} />
      </mesh>
    </group>
  );
}

/**
 * Wraps every muscle group and shifts the wrapper's position so the combined
 * bounding box is centered at world [0, 0, 0]. Without this, OrbitControls
 * orbits around the absolute anatomical origin (which sits ~1 km away from
 * the meshes in BodyParts3D's coordinate system), causing the body to swing
 * around a point outside itself when the user drags.
 */
function CenteredBody({
  children,
  recenterKey,
  offset = [0, 0, 0],
}: {
  children: React.ReactNode;
  recenterKey: number;
  offset?: [number, number, number];
}) {
  const innerRef = useRef<THREE.Group | null>(null);
  // Capture offset in a ref so the useEffect doesn't depend on the array
  // identity (which would re-run the centering needlessly on every render).
  const offsetRef = useRef(offset);
  offsetRef.current = offset;

  useEffect(() => {
    // Defer the bbox calculation by one animation frame. Without this,
    // freshly-mounted GLTF children may not have their world matrices fully
    // propagated yet (the parent useEffect runs in the same React commit
    // cycle as the child mount), and setFromObject ends up reading stale
    // local coords. The frame delay guarantees Three has stamped the world
    // transforms first.
    let raf: number | null = null;
    raf = requestAnimationFrame(() => {
      const group = innerRef.current;
      if (!group) {
        console.log('[3D] CenteredBody: no group ref yet');
        return;
      }
      group.position.set(0, 0, 0);
      group.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(group);
      if (box.isEmpty()) {
        console.log('[3D] CenteredBody: bbox empty, key=', recenterKey);
        return;
      }
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      const [ox, oy, oz] = offsetRef.current;
      console.log('[3D] CenteredBody: bbox size', size.x.toFixed(0), size.y.toFixed(0), size.z.toFixed(0),
        'center', center.x.toFixed(0), center.y.toFixed(0), center.z.toFixed(0),
        'offset', ox, oy, oz);
      // Land the bbox center at world (ox, oy, oz) instead of (0,0,0).
      // group.position = offset - center.
      group.position.set(ox - center.x, oy - center.y, oz - center.z);
    });
    return () => {
      if (raf !== null) cancelAnimationFrame(raf);
    };
  }, [recenterKey]);

  return <group ref={innerRef}>{children}</group>;
}


export function Anatomy3DScene({
  selectedMuscleId,
  onMuscleSelect,
}: Anatomy3DSceneProps) {
  console.log('[3D] Anatomy3DScene render, available ids:', ANATOMY_3D_AVAILABLE_IDS.length);
  useEffect(() => {
    console.log('[3D] Anatomy3DScene mounted');
    return () => console.log('[3D] Anatomy3DScene unmounted');
  }, []);

  // Warm useGLTF's LRU cache lazily, on mount — calling preload at the top
  // level of the module has crashed the JS engine on cold start (whole app
  // turning gray), likely because the renderer/expo-gl runtime isn't fully
  // initialized yet when the module is evaluated. Doing it here defers the
  // work until the user actually opens the 3D screen and lets the
  // ErrorBoundary catch any failure.
  useEffect(() => {
    try {
      ANATOMY_3D_AVAILABLE_IDS.forEach((id) => {
        useGLTF.preload(ANATOMY_3D_MODELS[id] as unknown as string);
      });
    } catch (err) {
      console.error('[3D] preload failed', err);
    }
  }, []);

  // selectedId lives as INTERNAL state again — having it controlled by the
  // parent prop made the Canvas sub-tree re-render on every external
  // change, and on a real device that left the canvas blank after a
  // selection (and the body never returned after close). Now the parent
  // is informed via onMuscleSelect callback, and only "clear" transitions
  // (selectedMuscleId going to null) are synced down via a useEffect, so
  // the user's Cerrar button can still remove the 3D highlight.
  const [selectedId, setSelectedId] = useState<string | null>(null);
  useEffect(() => {
    if (selectedMuscleId === null || selectedMuscleId === undefined) {
      setSelectedId((current) => (current === null ? current : null));
    }
  }, [selectedMuscleId]);
  const [loadedCount, setLoadedCount] = useState(0);
  // Bumped each time we want CenteredBody to recompute its centering offset
  // (debounced as muscle GLBs settle in).
  const [recenterTick, setRecenterTick] = useState(0);
  const recenterTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cameraResetDoneRef = useRef(false);
  // OrbitControls handle. We hold a ref so the post-load reset hard can
  // poke target/position/up directly.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const controlsRef = useRef<any>(null);
  // After OrbitControls mounts, neutralize its multi-touch case by setting
  // touches.TWO to undefined. With enableZoom=false + enablePan=false the
  // 2-finger switch was already a no-op in theory, but on RN something in
  // the touch pipeline still got stuck ("se pega" / crashes). With TWO
  // undefined, OrbitControls' onTouchStart doesn't enter ANY case for 2
  // fingers and the touch state machine stays inert.
  useEffect(() => {
    const id = setInterval(() => {
      const c = controlsRef.current;
      if (c && c.touches) {
        c.touches.TWO = undefined;
        clearInterval(id);
      }
    }, 50);
    return () => clearInterval(id);
  }, []);
  // Live R3F scene, populated by <SceneRefBridge> from inside the Canvas.
  // Used by the "follow selection" effect below.
  const sceneRef = useRef<THREE.Scene | null>(null);

  // Zoom is now driven by + / − UI buttons (pinch was incompatible with
  // expo-gl's GLView swallowing touches before our gesture-handler saw them).
  // CameraDistanceController reads this state and clamps OrbitControls'
  // min/max distance accordingly each frame.
  const [desiredDistance, setDesiredDistance] = useState(INITIAL_CAM_DISTANCE);
  const ZOOM_IN_RATIO = 0.85;
  const ZOOM_OUT_RATIO = 1.18;
  const handleZoomIn = useCallback(() => {
    setDesiredDistance((d) => Math.max(MIN_CAM_DISTANCE, d * ZOOM_IN_RATIO));
  }, []);
  const handleZoomOut = useCallback(() => {
    setDesiredDistance((d) => Math.min(MAX_CAM_DISTANCE, d * ZOOM_OUT_RATIO));
  }, []);

  // Memoized so React.memo on MuscleGroup actually skips re-renders for the
  // 11 muscles whose `selected` prop didn't flip. Without useCallback, the
  // arrow function had a fresh identity each render → React.memo's shallow
  // eq saw "onSelect changed" → all 13 muscles re-rendered on every pick,
  // negating the memo entirely.
  const handleSelect = useCallback((id: string) => {
    // Synchronous: setSelectedId for the local 3D highlight, and
    // onMuscleSelect to bubble up so CuerpoScreen swaps MOTD → InfoCard.
    setSelectedId(id);
    onMuscleSelect?.(id);
  }, [onMuscleSelect]);

  // El pivote del orbit SIEMPRE queda en BODY_OFFSET_X (body center). Para
  // que un músculo seleccionado APAREZCA centrado en pantalla, calculamos
  // su world center una vez y lo guardamos en este ref. CameraEnforcer lo
  // lee cada frame y aplica setViewOffset para llevarlo al canvas center
  // sin tocar position/target/lookAt — la rotación queda perfectamente
  // anclada al cuerpo y el cuerpo nunca se "descuadra" desde su pivote.
  const muscleCenterRef = useRef<THREE.Vector3 | null>(null);
  useEffect(() => {
    const scene = sceneRef.current;
    if (!selectedId || !scene) {
      muscleCenterRef.current = null;
      return;
    }
    let foundMesh: THREE.Mesh | null = null;
    scene.traverse((obj) => {
      if (foundMesh) return;
      const m = obj as THREE.Mesh;
      if (
        m.isMesh &&
        (m.userData as { muscleId?: string })?.muscleId === selectedId
      ) {
        foundMesh = m;
      }
    });
    if (!foundMesh) {
      muscleCenterRef.current = null;
      return;
    }
    const box = new THREE.Box3().setFromObject(foundMesh);
    if (box.isEmpty()) {
      muscleCenterRef.current = null;
      return;
    }
    muscleCenterRef.current = box.getCenter(new THREE.Vector3());
    // recenterTick es dep: si CenteredBody re-recentra mientras hay un
    // músculo seleccionado, recomputamos el world center con las nuevas
    // coords del cuerpo.
  }, [selectedId, recenterTick]);


  // Each MuscleGroup calls this once it has finished cloning its meshes'
  // materials. We coalesce per-muscle loads into a single recenter every
  // 200 ms so the body settles to its true center as the last few GLBs
  // pop in, without re-running setFromObject 20 times in a row.
  const handleMuscleLoaded = useCallback((_id: string) => {
    setLoadedCount((n) => n + 1);
    if (recenterTimerRef.current) clearTimeout(recenterTimerRef.current);
    recenterTimerRef.current = setTimeout(() => {
      setRecenterTick((t) => t + 1);
    }, 200);
  }, []);

  useEffect(() => () => {
    if (recenterTimerRef.current) clearTimeout(recenterTimerRef.current);
  }, []);

  const ready = loadedCount > 0;
  const totalMuscles = ANATOMY_3D_AVAILABLE_IDS.length;

  // Force a final recenter once the last muscle finishes loading. The
  // debounced timer in handleMuscleLoaded should already cover this, but
  // belt-and-suspenders. Also reset OrbitControls + camera so any stray
  // touches during loading don't leave the body off-center.
  useEffect(() => {
    if (totalMuscles > 0 && loadedCount === totalMuscles) {
      console.log('[3D] all muscles loaded, forcing final recenter');
      setRecenterTick((t) => t + 1);
      if (!cameraResetDoneRef.current && controlsRef.current) {
        cameraResetDoneRef.current = true;
        const controls = controlsRef.current;
        controls.target.set(BODY_OFFSET_X, 0, 0);
        controls.object.position.set(BODY_OFFSET_X, -INITIAL_CAM_DISTANCE, 0);
        controls.object.up.set(0, 0, 1);
        controls.object.lookAt(BODY_OFFSET_X, 0, 0);
        controls.update();
        setDesiredDistance(INITIAL_CAM_DISTANCE);
        console.log('[3D] camera reset to front view');
      }
    }
  }, [loadedCount, totalMuscles]);

  // The info panel UI used to live here as an absolute overlay; it now lives
  // in CuerpoScreen as a MuscleInfoCard rendered in place of MuscleOfTheDay.
  // Inside the canvas we still toggle the gesture hint based on whether
  // anything is selected.
  const hasSelection = selectedId !== null;

  return (
    <View style={styles.container}>
      <View
        style={styles.canvasWrapper}
        onLayout={(e) => {
          const { width, height } = e.nativeEvent.layout;
          console.log('[3D] canvasWrapper onLayout', width, 'x', height);
        }}
        // Intercept multi-touch (≥2 fingers). Capture variants below only
        // fire when no responder is active yet — they're useful if a touch
        // STARTS with 2 fingers. But the common case is "one finger down
        // (canvas claims responder, starts rotating), then second finger
        // added". For that case we need onMoveShouldSetResponder, which can
        // STEAL the responder from the canvas mid-gesture and freeze its
        // touch state machine before OrbitControls' multi-touch path runs.
        onStartShouldSetResponderCapture={(e) =>
          e.nativeEvent.touches.length >= 2
        }
        onMoveShouldSetResponderCapture={(e) =>
          e.nativeEvent.touches.length >= 2
        }
        onMoveShouldSetResponder={(e) =>
          e.nativeEvent.touches.length >= 2
        }
        // Once we own the responder, eat the events as no-ops and let it
        // release naturally when the user lifts. We don't request to keep
        // it on termination — RN can recycle freely.
        onResponderTerminationRequest={() => true}
        onResponderMove={() => undefined}
        onResponderRelease={() => undefined}
        onResponderTerminate={() => undefined}
      >
        <GLBErrorBoundary>
            <Canvas
              style={styles.canvas}
              // Configure the default camera via Canvas's `camera` prop instead
              // of <PerspectiveCamera makeDefault>. drei's makeDefault swap
              // turned out to leave the default camera (with R3F's standard
              // fov=75, position=(0,0,5)) actually rendering the scene on
              // R3F-native, so the body looked ~3× too small. Configuring on
              // Canvas guarantees the camera's fov/position/up land on the
              // camera that's actually used to render.
              camera={{
                position: [BODY_OFFSET_X, -INITIAL_CAM_DISTANCE, 0],
                up: [0, 0, 1],
                fov: 35,
                near: 1,
                far: 8000,
              }}
              onCreated={({ size, camera, gl }) => {
                // @react-three/fiber/native doesn't expose `dpr` as a prop the
                // way the web Canvas does. We set it on the renderer manually
                // here to halve the fillrate cost on high-DPI Android screens.
                const targetPixelRatio = Math.min(
                  (gl as unknown as { getPixelRatio?: () => number }).getPixelRatio?.() ?? 1,
                  1.5
                );
                (gl as unknown as { setPixelRatio: (n: number) => void })
                  .setPixelRatio(targetPixelRatio);
                // Force the camera to look at the origin once it's been
                // configured — Canvas's camera prop doesn't auto-lookAt.
                camera.lookAt(0, 0, 0);
                camera.updateProjectionMatrix();
                console.log('[3D] Canvas onCreated, size', size.width, 'x', size.height,
                  'cam type', camera.type,
                  'cam fov', (camera as THREE.PerspectiveCamera).fov,
                  'cam pos', camera.position.x.toFixed(0), camera.position.y.toFixed(0), camera.position.z.toFixed(0),
                  'pixelRatio', targetPixelRatio);
              }}
            >
            {/* Soft depth-fade so distant verts blend into the background
                instead of stamping hard silhouettes against the navy bg.
                Calibrated for camera distance 2700 mm; near = body front,
                far = comfortably past the back of the body bbox. */}
            <fog attach="fog" args={[FOG_COLOR, 2500, 4500]} />
            <CameraEnforcer muscleCenterRef={muscleCenterRef} />
            <ambientLight intensity={0.55} />
            <directionalLight position={[100, 100, 100]} intensity={1.2} />
            <directionalLight
              position={[-80, 40, -100]}
              intensity={0.4}
              color="#a8c8ff"
            />
            {/* Silhouette intentionally disabled per user feedback — they
                preferred the unobstructed muscle-only view (matching the
                pre-silhouette look). The BodySilhouette component is kept
                for future re-enablement. */}
            {/* <BodySilhouette /> */}
            {/* Body shifted in X so it appears centered horizontally in the
                portrait canvas. The orbit target below uses the same offset,
                so rotating spins the body in place (orbit pivot ON the body)
                rather than swinging it around an empty origin. */}
            <CenteredBody recenterKey={recenterTick} offset={[BODY_OFFSET_X, 0, 0]}>
              {/* The raw BodyParts3D muscle bbox is ~1484 mm tall (no head,
                  no full-length forearms). Our procedural silhouette is the
                  standard ~1700 mm human, so without scaling, the muscles
                  look too small inside the silhouette envelope. Uniform
                  1.15× scale brings them up to ~1707 mm, filling the
                  silhouette correctly. */}
              <group scale={[1.15, 1.15, 1.15]}>
                {ANATOMY_3D_AVAILABLE_IDS.map((id) => (
                  // Per-muscle Suspense lets each GLB pop into the scene as
                  // soon as it resolves, instead of waiting for the slowest
                  // one. The user sees the body progressively assemble.
                  <Suspense key={id} fallback={null}>
                    <MuscleGroup
                      muscleId={id}
                      asset={ANATOMY_3D_MODELS[id]}
                      selected={selectedId === id}
                      onSelect={handleSelect}
                      onLoaded={handleMuscleLoaded}
                    />
                  </Suspense>
                ))}
              </group>
            </CenteredBody>
            {/*
              OrbitControls handles ROTATION ONLY. enableZoom MUST be false
              — the built-in two-finger dolly (handleTouchMoveDolly) crashes
              with "Cannot read property 'x' of undefined" on react-native.
              Zoom is now driven by the + / − UI buttons via
              CameraDistanceController. enablePan=false because panning the
              orbit makes no sense for an anatomical body view.
            */}
            <OrbitControls
              ref={controlsRef}
              enablePan={false}
              enableZoom={false}
              enableDamping={false}
              rotateSpeed={1.0}
              target={[BODY_OFFSET_X, 0, 0]}
            />
            <CameraDistanceController
              desiredDistance={desiredDistance}
              controlsRef={controlsRef}
            />
            <SceneRefBridge sceneRef={sceneRef} />
            </Canvas>
            {loadedCount < totalMuscles && (
              <View style={styles.loadingOverlay} pointerEvents="none">
                <Text style={styles.loadingText}>
                  {loadedCount === 0
                    ? 'Inicializando 3D…'
                    : `Cargando músculos… ${loadedCount}/${totalMuscles}`}
                </Text>
              </View>
            )}
            {ready && !hasSelection && (
              <View style={styles.gestureHint} pointerEvents="none">
                <Text style={styles.gestureHintText}>
                  Toca un músculo · Arrastra para rotar
                </Text>
              </View>
            )}
            {ready && (
              <View style={styles.zoomControls} pointerEvents="box-none">
                <Pressable
                  style={styles.zoomButton}
                  onPress={handleZoomIn}
                  accessibilityRole="button"
                  accessibilityLabel="Acercar"
                  hitSlop={8}
                >
                  <Text style={styles.zoomButtonText}>+</Text>
                </Pressable>
                <Pressable
                  style={styles.zoomButton}
                  onPress={handleZoomOut}
                  accessibilityRole="button"
                  accessibilityLabel="Alejar"
                  hitSlop={8}
                >
                  <Text style={styles.zoomButtonText}>−</Text>
                </Pressable>
              </View>
            )}
          </GLBErrorBoundary>
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
  // Subtle in-canvas tip (no card, no border) shown when nothing is selected.
  gestureHint: {
    position: 'absolute',
    bottom: spacing.sm,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  gestureHintText: {
    ...typography.body.small,
    color: colors.text.muted,
    fontSize: 11,
    opacity: 0.7,
  },
  // Floating + / − zoom buttons in the bottom-right of the canvas. Replace
  // the pinch gesture (incompatible with expo-gl GLView swallowing touches).
  zoomControls: {
    position: 'absolute',
    right: spacing.md,
    bottom: spacing.lg,
    flexDirection: 'column',
    gap: spacing.sm,
  },
  zoomButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(28, 28, 46, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(212, 168, 67, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomButtonText: {
    ...typography.heading.h3,
    color: colors.accent.light,
    fontSize: 24,
    lineHeight: 28,
    fontWeight: '600',
  },
});
