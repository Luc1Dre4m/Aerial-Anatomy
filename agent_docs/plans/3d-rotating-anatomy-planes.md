# 3D Anatomy Viewer via Rotating Textured Planes (B2)

## Context

El tab "3D" del mapa corporal hoy muestra solo un placeholder WebView con el logo de BioDigital porque la integración requiere credenciales de API externa y el usuario prefirió no registrarse. Objetivo: reemplazar el viewer por una escena real 3D que se sienta profesional, reutilizando los assets anatómicos que ya tenemos (`assets/anatomy/muscle_front.png`, `muscle_back.png`).

La idea es montar las dos PNG como texturas en dos `PlaneGeometry` orientados back-to-back y dejar que el usuario rote, zoom y toque músculos. El truco: como la mayoría de los modelos 3D anatómicos libres (a) pesan 20-80 MB, (b) no tienen meshes nombrados por músculo — sacarle picking real cuesta más de lo que aporta. Con planos texturizados podemos reusar `MUSCLE_ZONES` directamente via raycasting → UV → viewBox coords → `findMuscleAtPoint`. Todo el trabajo de calibración de zonas se hereda.

## Decisiones

- **Libs**: `expo-gl` + `expo-three` + `three`. `expo-gl` ya debe instalarse (no está). Los tres son standard en el stack Expo.
- **Escena**: cámara perspective apuntando al origen, `AmbientLight` (0.6) + `DirectionalLight` dorada (0.35) sutil para un glow tipo estudio.
- **Geometría**: dos `PlaneGeometry(3, 4.2)` (matching body aspect 300/420), back-to-back. Material `MeshBasicMaterial` con texture map — sin phong porque los PNG ya tienen sombreado propio. `transparent: true` + `alphaTest: 0.1` para respetar el fondo transparente de las PNG.
- **Gestos**: `Gesture.Pan` rota el grupo en Y (drag horizontal) y X (drag vertical clamp ±20°). `Gesture.Pinch` mueve la cámara en Z entre 4 y 12 unidades. Double-tap resetea. Gestos via `react-native-gesture-handler` que ya está instalado.
- **Picking**: `Gesture.Tap().maxDeltaX(5).maxDeltaY(5)` → convierte coord a NDC → `Raycaster.setFromCamera` → intersecta con los dos planes. Si intersecta, toma el `uv` del hit, lo convierte a coordenadas de viewBox 300×420, y llama a `findMuscleAtPoint(view, x, y)` del `muscleZones.ts` existente. Si hay match, dispara `onMuscleSelect(muscleId)`.
- **Iluminación del músculo seleccionado**: para v1, NO lo resaltamos dentro de la escena 3D. El tooltip 2D que aparece al seleccionar ya da el feedback. Un "glow 3D" requeriría mesh dinámico y no lo necesitamos para sentir que funciona.
- **Background**: `new THREE.Color(colors.bg.primary)`. La vignette 2D no aplica aquí; podemos agregar un `RadialGradient` CSS-like atrás via un plane de fondo grande con shader simple si hace falta, pero lo dejamos para un follow-up.
- **Fallback**: si `expo-gl` falla al inicializar (device muy viejo o emulador sin GL), ErrorBoundary cae al placeholder actual. No borramos el WebView demo, lo reusamos como fallback.

## Archivos

### Nuevos

1. **[src/components/body/Anatomy3DScene.tsx](src/components/body/Anatomy3DScene.tsx)** — NEW. Monta `<GLView>` de `expo-gl`, inicializa three.js scene/camera/renderer vía `expo-three`'s `Renderer`, carga las texturas via `Asset.fromModule(...)+ createTextureAsync`. Expone props `onMuscleSelect(muscleId)`. Maneja gestos internamente.

### Modificados

2. **[src/components/body/Anatomy3DViewer.tsx](src/components/body/Anatomy3DViewer.tsx)** — rewrite del cuerpo del componente. Renderiza `<Anatomy3DScene>` dentro de un `<View>` con background primary. Mantiene la prop signature igual (`highlightedMuscles`, `onMuscleSelect`) para no romper `CuerpoScreen`. El código de BioDigital WebView se elimina (servicio `biodigital.ts` queda huérfano → va a `dead_code.md`).

3. **[package.json](package.json)** — NUEVAS deps: `expo-gl`, `expo-three`, `three`, `@types/three`. Via `npx expo install` (regla de CLAUDE.md: ok para dependencies, no para `version`).

4. **[agent_docs/followups/dead_code.md](agent_docs/followups/dead_code.md)** — anotar `src/services/biodigital.ts` y el demo HTML como huérfano post-refactor (procedimiento grep → eliminar en commit separado).

5. **[agent_docs/followups/pending.md](agent_docs/followups/pending.md)** — agregar "Glow del musculo seleccionado dentro de la escena 3D", "Probar picking en zonas calibradas fino" y "Atribución CC BY-SA 3.0 de los PNG anatómicos ahora también aplica al viewer 3D".

## Pick → coord conversion

Asumiendo el plane frontal ubicado en Z positivo mirando +Z, con `PlaneGeometry(3, 4.2)` centrado en origen:

- `uv` del hit: `(u, v)` en `[0,1]`, donde `v=0` es bottom y `v=1` es top.
- viewBox: `x = u * 300`, `y = (1 - v) * 420` (invertimos v porque viewBox crece hacia abajo).
- Si el plane tapeado es el back (detectamos por `intersect.object === backPlane`), el eje X también se espeja: `x = (1 - u) * 300`.
- Luego `findMuscleAtPoint('front' | 'back', x, y)`.

## Gesture wiring detail

```tsx
const rotY = useSharedValue(0);
const rotX = useSharedValue(0);
const camZ = useSharedValue(7);

const pan = Gesture.Pan().onUpdate((e) => {
  rotY.value = savedRotY.value + e.translationX * 0.008;
  rotX.value = clamp(savedRotX.value + e.translationY * 0.008, -0.35, 0.35);
});
// En el render loop (requestAnimationFrame dentro del onContextCreate):
//   group.rotation.y = rotY.value;
//   group.rotation.x = rotX.value;
//   camera.position.z = camZ.value;
```

## Orden de ejecución (3 commits atómicos)

1. **`chore(deps): add expo-gl, expo-three, three for 3D viewer`** — npx expo install.
2. **`3d(viewer): rotating anatomy planes with picking`** — Anatomy3DScene nuevo + Anatomy3DViewer reescrito.
3. **`chore(followups): mark biodigital service as orphan`** — anotar dead_code y pending.

## Verificación

- [ ] `tsc --noEmit` limpio tras cada commit.
- [ ] Build EAS preview con la nueva impl compila sin errores nativos.
- [ ] En device: el tab 3D muestra la figura rotando al arrastrar, pinch hace zoom entre 4 y 12 unidades, double-tap resetea.
- [ ] Al tocar un músculo mapeado en `MUSCLE_ZONES`, aparece el tooltip 2D correcto.
- [ ] Al rotar a 180°, la cara posterior se muestra y el picking funciona con los IDs de músculos posteriores (trapecio, dorsal, glúteos, etc.).
- [ ] No warnings nuevos en Metro.
- [ ] Fallback: si `GLView` da error, ErrorBoundary muestra mensaje legible.

## Riesgos

- **`expo-gl` requiere native module**. El dev client y preview existentes NO lo tienen instalado → otro rebuild EAS.
- **Picking con dos planes back-to-back**: si el ray atraviesa ambos, `intersectObjects` devuelve los dos. Hay que filtrar por `side` (el plane cuyo normal apunta a la cámara) usando `intersect.face.normal.dot(cameraDir)`.
- **Performance**: texturas de 1143×1600 como `MeshBasicMaterial.map`. En móvil puede estar ajustado. Mitigación: `texture.generateMipmaps = true` + `minFilter = LinearMipMapLinearFilter`.
- **Transparencia y orden de render**: los planes con alpha deben tener `renderOrder` explícito y `depthWrite: false` para evitar artefactos al rotar.
- **Gesture conflict**: el tab 3D usa ZoomableBody hoy? No — solo el 2D. Los gestos del Anatomy3DScene corren aislados.

## Fuera de scope

- Glow del músculo seleccionado dentro de la escena (follow-up).
- Modelo GLB real (descartado por tamaño APK y falta de meshes nombrados).
- Cambiar la lógica de ChainOverlay (sigue siendo 2D).
- Atribución CC BY-SA en About (ya existía como pending, solo recordamos).
