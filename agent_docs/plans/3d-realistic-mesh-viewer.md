# Plan: 3D Realista con Modelos Mesh (reemplazo total del viewer actual)

## Context

El viewer 3D actual en `Anatomy3DScene.tsx` usa **planos PNG texturizados back-to-back** + raycasting con UV mapping. Tiene tres problemas:

1. **No renderiza en device** (pantalla negra, hipótesis: `Asset.fromModule().downloadAsync()` se cuelga). Bloqueante actual.
2. **Calidad visual limitada**: textura plana sin profundidad, sin lighting real, sin contracción muscular.
3. **No escala** a features futuras: capas anatómicas (esqueleto/músculos), animaciones, glow del músculo seleccionado son hacks sobre planos en lugar de mesh real.

**Decisión del usuario** (sesión 2026-05-06): apuntar a un 3D **mucho más realista** sin pretender ser idéntico a Anatomy Learning. Reemplazar el viewer actual por uno mesh-based con modelos open-source CC.

**Origen de modelos elegido**: BodyParts3D (mirror Kevin-Mattheus-Moerman/BodyParts3D) — 1,523 modelos por código FMA, formato STL, licencia CC BY-SA 2.1 Japan.

**Migración**: reemplazo total del viewer actual.

## Riesgos a validar antes del plan grande

Hay **dos riesgos técnicos no validados** que pueden invalidar todo el approach:

### Riesgo 1 — Carga de GLB en mobile

`expo-three` tiene issues conocidos cargando GLB en device (no en simulador):
- [Issue #182](https://github.com/expo/expo-three/issues/182), [#184](https://github.com/expo/expo-three/issues/184), [#273](https://github.com/expo/expo-three/issues/273).
- Error típico: `FileReader.readAsArrayBuffer is not implemented`.
- Workaround: configurar `metro.config.js` para reconocer `.glb` como asset.

`@react-three/fiber/native` en 2026 está activamente mantenido y reportadamente resuelve estos issues, pero hasta no probarlo en el Android específico de Álvaro, no es certeza.

### Riesgo 2 — Bug del 3D actual puede ser sistémico

El 3D actual no renderiza en device. Si el problema es del approach (texturas via `Asset.fromModule`), el nuevo viewer mesh-based lo resuelve. Si es problema de `expo-gl` mismo en este device (driver, GLES version, etc), el nuevo viewer también va a fallar.

## Plan en 6 fases

### Fase 0 — PoC de validación (1-2 días) **ANTES de comprometer el plan grande**

El objetivo: validar que **podemos cargar y renderizar UN modelo GLB en el device de Álvaro** antes de invertir 4-6 semanas. Si esto falla, replanteamos stack.

**Tareas**:

1. **Bajar UN modelo de BodyParts3D** — el más simple posible (e.g. `FMA13335.stl` = pectoralis major).
2. **Convertir STL → GLB** en Blender:
   - Importar STL.
   - Aplicar material básico (color rojo carne, sin texturas).
   - Exportar como GLB con Draco compression.
   - Resultado esperado: archivo de 100-500 KB.
3. **Instalar `@react-three/fiber/native`** + `@react-three/drei` + `expo-gl` (ya tenemos) en el proyecto.
4. **Configurar `metro.config.js`** para `.glb` como asset.
5. **Crear `Anatomy3DPoCScene.tsx`** mínimo:
   - `<Canvas>` de R3F native.
   - `useGLTF()` para cargar el modelo.
   - `<primitive object={scene} />` para renderizarlo.
   - Una `<ambientLight>` y `<directionalLight>` para iluminar.
   - `<OrbitControls>` para rotar.
6. **Wire al `CuerpoScreen`** detrás de un feature flag `EXPO_PUBLIC_3D_POC=true` (no reemplazar el viewer actual todavía).
7. **Build EAS development** (otro APK) — porque `@react-three/fiber/native` requiere recompilación nativa.
8. **Probar en device**: ¿se ve el modelo? ¿se puede rotar? ¿FPS razonable?

**Criterios de éxito del PoC**:
- ✓ Modelo se carga sin error.
- ✓ Renderiza correctamente (no pantalla negra).
- ✓ Gestos básicos (rotar) funcionan.
- ✓ FPS >30 en el device.

**Si el PoC falla**:
- Diagnosticar con logs en `useGLTF` y eventos de R3F.
- Si es problema de `expo-gl` en device: probar fallback con Skia (SkSL shaders) o WebView con Three.js full.
- Si es problema de Metro config: ajustar.
- **NO ejecutar las fases 1-5** hasta que el PoC pase.

### Fase 1 — Investigación y selección de modelos (2-3 días)

Después del PoC exitoso.

**Tareas**:

1. **Mapear nuestros 33 músculos a códigos FMA**: para cada músculo en `src/data/muscles.ts`, encontrar el FMA code correspondiente. Usar la lista de BodyParts3D y referencia FMA (https://bioportal.bioontology.org/ontologies/FMA).

   Ejemplo: `pectoral_mayor` → FMA13335, `dorsal_ancho` → FMA13357, etc.

2. **Listar modelos secundarios necesarios**:
   - Esqueleto básico (cráneo, columna, pelvis, costillas, huesos largos): ~25 FMA codes.
   - Posiblemente: piel (silhouette), órganos (no críticos para artes aéreas).

3. **Bajar selectivamente** los STL de los FMA codes mapeados (no los 1,523 — solo ~60 archivos).

4. **Output**: documento `agent_docs/refs/anatomy-models-fma-mapping.md` con tabla muscleId ↔ FMA code ↔ nombre anatómico.

### Fase 2 — Migración del stack a R3F native (1-2 días)

Refactor del approach del 3D viewer:

1. **Dependencias**:
   - Mantener `expo-gl`, `expo-three`, `three` (R3F los usa por debajo).
   - Agregar `@react-three/fiber@~8.X.X`, `@react-three/drei@~9.X.X`.
2. **Configurar `metro.config.js`** — agregar `glb`, `gltf`, `bin` a assetExts.
3. **Refactor `Anatomy3DViewer.tsx`** para usar el nuevo `Anatomy3DScene` declarativo.
4. **Test build EAS**: confirmar que compila y no rompe el resto de la app.

### Fase 3 — Conversión y optimización de assets (3-5 días)

Trabajo offline en Blender:

1. **Conversión batch STL → GLB**:
   - Script en Blender Python (`bpy`) que itera sobre los STL bajados, los importa, aplica material según músculo (color del role agonista/sinergista/etc), exporta GLB con Draco.
   - Optimización: reducir polígonos si modelo > 50k tris (decimate modifier).
2. **Naming convention**: `assets/3d-models/<bodyPart>/<muscleId>.glb` (e.g. `assets/3d-models/torso/pectoral_mayor.glb`).
3. **Atribución**: incluir `assets/3d-models/LICENSE.md` con CC BY-SA 2.1 Japan + crédito a BodyParts3D + DBCLS.
4. **Decisión Git LFS o no**: ~60 archivos × 1-3 MB = 60-180 MB total. Probable que vayan a Git LFS o CDN (TODO.md ya menciona considerar Git LFS para PNGs >500KB; misma decisión acá).
5. **Output**: assets versionados, mapping JSON `src/data/anatomy3DAssets.ts` con `muscleId → assetPath`.

### Fase 4 — Integración + features core (5-7 días)

Construir el viewer real:

1. **`Anatomy3DScene.tsx` reescrito** con R3F:
   ```tsx
   <Canvas>
     <ambientLight />
     <directionalLight />
     {muscles.map(m => <Muscle key={m.id} model={m.modelPath} highlighted={...} />)}
     <OrbitControls />
   </Canvas>
   ```
2. **Picking**: raycasting via `onPointerDown` en cada `<Muscle>` (R3F maneja eventos por mesh nativo). Mucho más limpio que el approach UV actual.
3. **Highlight del músculo seleccionado**:
   - Material override: `MeshStandardMaterial` con `emissive` color dorado para músculo seleccionado.
   - Multi-selección via `highlightedMuscles: string[]` prop.
   - Pulse animation con `useFrame` modulando `emissiveIntensity`.
4. **Capas anatómicas toggleables**:
   - Toggle UI (botones piel / músculos / esqueleto / completo).
   - Mostrar/ocultar grupos de Object3D por capa.
5. **Gestos**: heredar lo aprendido del viewer actual (pan, pinch, double-tap, single-tap), implementado via `OrbitControls` de drei + listeners custom donde haga falta.
6. **Atribución CC BY-SA en `AboutScreen`**: card adicional para BodyParts3D + DBCLS + Z-Anatomy si lo usamos.

### Fase 5 — Optimización + polish (3 días)

1. **Lazy loading por región**: cargar modelos de la región visible (e.g. solo brazos cuando estás explorando brazos), no todos de una.
2. **LOD**: si performance lo demanda, usar `LOD` de Three para mostrar mesh simplificado a distancia / al rotar rápido.
3. **Performance testing en gama media** (e.g. Pixel 5a, Redmi Note 11): >30 FPS objetivo.
4. **Limpiar `Anatomy3DPoCScene.tsx`** del PoC.
5. **Borrar el viewer viejo** (`Anatomy3DScene.tsx` con planos PNG) — anotar en `dead_code.md` antes de eliminar (regla de CLAUDE.md).

## Estimación total

- Fase 0 (PoC): **1-2 días**.
- Fases 1-5: **15-20 días** de trabajo full-time.
- **Para Álvaro a tiempo parcial: 4-6 semanas calendario.**

## Archivos que se crean/modifican

### Nuevos
- `agent_docs/refs/anatomy-models-fma-mapping.md` — mapping muscleId ↔ FMA.
- `agent_docs/plans/3d-realistic-mesh-viewer.md` — este documento.
- `src/components/body/Anatomy3DPoCScene.tsx` — PoC, eliminado tras Fase 5.
- `src/components/body/Anatomy3DSceneR3F.tsx` — viewer nuevo (renombrar a `Anatomy3DScene` al final).
- `src/data/anatomy3DAssets.ts` — registry de modelos.
- `assets/3d-models/<region>/<muscleId>.glb` — modelos GLB convertidos.
- `assets/3d-models/LICENSE.md` — atribución CC BY-SA.
- `metro.config.js` — agregar `glb`/`gltf` a assetExts.
- `tools/blender/convert_stl_to_glb.py` — script Blender para conversión batch.

### Modificados
- `package.json` — `@react-three/fiber`, `@react-three/drei`.
- `src/components/body/Anatomy3DViewer.tsx` — usa el nuevo Scene.
- `src/screens/AboutScreen.tsx` — atribución CC BY-SA 2.1 Japan + BodyParts3D.
- `agent_docs/followups/dead_code.md` — anotar `Anatomy3DScene.tsx` original como huérfano post-Fase 5.

### Eliminados (en Fase 5)
- `src/components/body/Anatomy3DScene.tsx` (versión actual con planos PNG).

## Verificación / criterios de éxito

### Fase 0 (PoC)
- ✓ Modelo GLB carga en device sin error.
- ✓ FPS >30 al rotar.
- ✓ No errors `FileReader.readAsArrayBuffer is not implemented`.

### Fases 1-5 (final)
- ✓ Vista 3D muestra figura humana mesh-based con materiales por músculo.
- ✓ Tap en músculo → highlight + tooltip 2D con info correcta.
- ✓ Multi-selección visual funciona.
- ✓ Toggle entre capas (piel / músculos / esqueleto) funciona.
- ✓ Gestos pan/pinch/double-tap fluidos.
- ✓ Performance: >30 FPS en device de gama media.
- ✓ Atribución CC BY-SA visible en AboutScreen.
- ✓ APK no excede 80 MB total (sin contar modelos en CDN si vamos por ahí).

## Si algo falla

- **PoC falla**: diagnosticar en device. Alternativas en orden:
  1. Probar `react-three-fiber/native` en su versión más reciente (puede haber fix entre la del setup y latest).
  2. WebView con Three.js full y bridge JS↔Native via postMessage.
  3. Aceptar limitaciones de `expo-three` y usar approach mixto (planos PNG + mesh simple por músculo seleccionado).
- **Performance pobre**: bajar polycount de modelos (Blender decimate al 50%), implementar LOD agresivo, considerar feature flag para devices viejos que mantenga viewer planos.
- **Tamaño APK explota**: Git LFS o CDN propio para modelos. Lazy download al primer uso.

## Dependencias entre fases

- Fase 0 bloquea TODAS las siguientes.
- Fase 1 puede ejecutarse en paralelo con Fase 2.
- Fase 3 requiere Fase 1 (necesitamos los STL para convertir).
- Fase 4 requiere Fase 2 + Fase 3.
- Fase 5 requiere Fase 4.

## Open questions (responder antes de Fase 1)

1. **Atribución share-alike CC BY-SA**: requiere que las modificaciones a los modelos también se publiquen bajo CC BY-SA. ¿Te parece OK publicar los GLB convertidos en una rama del repo bajo CC BY-SA, manteniendo el código de la app bajo otra licencia?
2. **Git LFS o CDN**: ~60-180 MB de modelos. Hoy el repo es chico (working tree <50 MB sin node_modules). ¿Te parece migrar a Git LFS desde ya, o servir modelos desde CDN (Supabase Storage, Cloudflare R2, etc.)?
3. **Mapeo FMA**: ¿podemos invertir 1 día yo + tu validación en mapear los 33 músculos a códigos FMA? Necesitaría tu confirmación porque algunos músculos pueden no tener FMA code 1:1.

## Próximo paso inmediato (después de aprobar este plan)

1. Crear la nueva sesión con foco en **Fase 0 (PoC)**.
2. Bajar 1 modelo de BodyParts3D (e.g. FMA13335 = pectoralis major).
3. Convertir a GLB en Blender (10 min).
4. Instalar R3F native.
5. Build EAS.
6. Probar en device.
7. Reportar resultado.
