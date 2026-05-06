# Anatomy Learning — Análisis Estructural como Referencia

> Fecha: 2026-04-28
> Versión analizada: Anatomy Learning v3.1.499 (Premium, APK cracked).
> Método: decompilado estático con JADX 1.5.5 (CLI, sin extracción de assets propietarios).
> Propósito: identificar patrones de UX/feature aplicables a Aerial Anatomy SIN copiar código ni assets.

---

## 1. Disclaimer legal y ético

- **El APK analizado es una versión Premium-cracked** (descargada de un sitio de APKs piratas, no de Play Store oficial). Esto se evidencia por:
  - Presencia de `libpairipcore.so` y `libtryroom.so` (libs típicas de protección Pairip de Google Play, removida/bypaseada en cracks).
  - El package name `com.AnatomyLearning.Anatomy3DViewer3` activa la `pairip.application.Application` que en versión legítima validaría licencia de Play Store.
- **No copiamos ningún asset propietario** (modelos 3D, texturas, audio, datos curados) desde Anatomy Learning a Aerial Anatomy. La EULA de la app y la propiedad intelectual de Visible Body / Anatomy Learning Studio prohíben distribución y uso derivado.
- **No copiamos código fuente** decompilado del IL2CPP. El reverse engineering profundo (Il2CppDumper, IDA) no se realizó.
- Lo que sí extraemos: **patterns de UX y decisiones técnicas** observables al nivel del manifest / estructura de assets / strings públicos — información que es educativa y replicable con código y assets propios.

---

## 2. Stack técnico identificado

### Framework: **Unity 3D**

Confirmaciones directas en `AndroidManifest.xml`:

- Activity principal: `com.unity3d.player.UnityPlayerActivity` (launcher activity).
- Metadata Unity: `unity.splash-mode`, `unity.splash-enable`, `unity.launch-fullscreen`, `unity.render-outside-safearea`, `unity.auto-report-fully-drawn`.
- Theme: `@style/UnityThemeSelector`.
- Hardware accelerated: `false` (Unity maneja su propio render context vía OpenGL ES / Vulkan).

### Runtime: **IL2CPP** (Intermediate Language to C++)

Native libs en `lib/arm64-v8a/`:

| Lib | Tamaño | Rol |
|---|---|---|
| `libil2cpp.so` | 49 MB | Código C# de la app compilado a C++ → ARM64 nativo. Imposible decompilar sin Il2CppDumper. |
| `libunity.so` | 17 MB | Runtime de Unity Engine. |
| `libFirebaseCppApp.so` | 138 MB | Firebase nativo (Crashlytics + Analytics + RemoteConfig). Pesado pero estándar. |
| `libmain.so` | 68 KB | Entry point de Unity activity. |
| `libpairipcore.so` | 525 KB | Protección Google Play License (cracked en este APK). |
| `libtryroom.so` | 926 KB | Probable componente del crack. |

**Solo soporta arm64-v8a** — no incluye armeabi-v7a ni x86. Esto es por qué BlueStacks/Nox (típicamente x86) no la corren bien y por qué Álvaro tuvo problemas.

### Servicios Unity activos

Vistos en `assets/UnityServicesProjectConfiguration.json`:

- `com.unity.services.core` v1.14.0
- `com.unity.services.analytics` v6.0.2
- `com.unity.purchasing` v4.12.0 (in-app purchases para Premium)

### Otros plugins Android

Manifest declara queries de `android.intent.action.SEND` y `SEND_MULTIPLE` → la app implementa native sharing (compartir capturas o info de músculos a otras apps).

### API levels

- `compileSdkVersion="35"` (Android 15).
- `minSdkVersion="24"` (Android 7.0 Nougat, 2016+).
- `targetSdkVersion="35"`.

App relativamente moderna, mantenida.

### Render

`uses-feature android:glEsVersion="0x30000"` → OpenGL ES 3.0 mínimo.
`uses-feature android.hardware.vulkan.version` (no required) → soporta Vulkan en devices que lo tienen.

---

## 3. Estructura de assets

### Asset bundle principal: `assets/bin/Data/data.unity3d`

- **Tamaño: 118 MB** (la mayor parte del APK).
- Formato: Unity Asset Bundle binario propietario.
- Contiene: scenes, prefabs, modelos 3D, texturas, materiales, shaders, animaciones, audio.
- Imposible de inspeccionar sin **AssetStudio** o **UABEA** — herramientas que técnicamente pueden extraer pero **violan la EULA de Unity y de la app**. No las usamos.

### Asset bundles secundarios

`assets/` contiene 22 archivos con nombres ofuscados (hashes pseudo-random tipo `2ArMo4yU1zprrann`), de ~100-220 KB cada uno. Total ~3.5 MB.

Estos son típicamente **bundles cargados on-demand** — probablemente cada uno corresponde a un sistema anatómico, una región, o un pack de quizz. La app los descarga/carga al pedirlos para no inflar el bundle inicial.

### `Managed/` solo tiene metadata

Como la app usa IL2CPP, los DLLs .NET no están presentes — solo `Metadata/` y `Resources/` (referencias para reflection runtime). El código real está en `libil2cpp.so`.

### Resources Android

`res/layout/` solo contiene layouts genéricos de Android (notifications, native sharing dialogs). **No hay layouts custom de la app** porque todo el UI corre dentro del Canvas de Unity.

`res/values/strings.xml` solo tiene strings de SDK (Google Play services, common errors). El contenido visible al usuario (nombres de músculos, descripciones, quizes) está dentro del `data.unity3d` — Unity localiza en runtime.

---

## 4. Implicaciones para Aerial Anatomy

### 4.1 Brecha técnica

Anatomy Learning corre sobre **Unity** con **modelos 3D detallados** (118 MB de assets), shaders custom, y posiblemente animaciones esqueléticas profesionales. Aerial Anatomy corre sobre **React Native + expo-three** con **PNGs 2D + Bezier paths SVG** (~1.8 MB de assets).

La diferencia de stack significa que **NO podemos replicar 1:1 la calidad visual** ni el realismo anatómico de Anatomy Learning desde RN+expo-three. Las limitaciones técnicas concretas:

- expo-three es Three.js minimalista corriendo sobre WebGL via expo-gl. **Sin shaders custom complejos, sin physics, sin lighting avanzado, sin skeleton animation suave.**
- Modelos GLB en RN-Expo cargan pero se pone pesado a partir de ~5 MB → no podemos meter 118 MB de modelos sin matar la app.
- Memoria: los devices de gama media pueden quedar sin RAM cargando muchos modelos detallados.

**Si el objetivo es matchear la calidad gráfica de Anatomy Learning**, la única vía es **migrar a Unity** o usar un WebView con Three.js full-featured que cargue modelos via streaming. Ambas son decisiones de stack mayor — fuera del alcance de Aerial Anatomy actual.

### 4.2 Lo que SÍ podemos rescatar

Patterns de UX y decisiones de producto que son agnósticas al engine:

#### A. **Selección de músculo con highlight visual**
- En 3D probablemente Anatomy Learning hace shader-based highlight (emisive + outline). Replicable en expo-three con un overlay plane o ShaderMaterial.
- Ya está en nuestro roadmap (Fase 3 — glow del músculo seleccionado).

#### B. **Capas anatómicas (toggleable)**
- Anatomy Learning probablemente permite toggle entre piel / músculos superficiales / músculos profundos / esqueleto. Es un pattern UX clásico.
- Para Aerial Anatomy: podemos tener toggle entre vista actual (músculos pintados) y vista esquelética simplificada con paths Bezier nuevos.

#### C. **Información detallada por estructura**
- Pattern: tap en músculo → panel desliza con info (origen, inserción, función, inervación, aparente en imagen).
- Aerial Anatomy ya hace esto en `MuscleDetailScreen.tsx`. Vale validar campos contra los que Anatomy Learning usa.

#### D. **Búsqueda + navegación entre estructuras relacionadas**
- Pattern: ver músculo → "ver músculos antagonistas / sinergistas" → navegación entre estructuras conectadas.
- Aerial Anatomy ya tiene `relatedMuscles` en data model. Puede expandirse con "ver en cadena biomecánica".

#### E. **On-demand asset loading**
- Anatomy Learning tiene 22 bundles separados pequeños — sugiere que carga modelos solo cuando los pedís (por sistema o por región). Inspiración para nuestra arquitectura: si en el futuro tenemos modelos 3D más pesados, cargarlos por región (no todo de una).

#### F. **Bilingual / localization in runtime**
- Anatomy Learning maneja localización dentro del bundle Unity, no en strings.xml. Interesante pero ya tenemos i18n en RN — no es problema por ahora.

### 4.3 Lo que NO vamos a tomar

- **Modelos 3D** propietarios (no extraemos del `data.unity3d`).
- **Datos curados** específicos (quizá tienen una taxonomía de Visible Body que pagaron por licenciar).
- **Iconografía / branding** propio.
- **Approach Unity** completo (no migramos stack).

---

## 5. Recomendaciones priorizadas para Aerial Anatomy

### Alta prioridad (alineadas con roadmap actual)

1. **Glow del músculo seleccionado en 3D** — ya planeado (TODO.md sprint C). Anatomy Learning lo tiene; valida que es un pattern UX establecido. Implementar en próximo plan dedicado.

2. **Diagnosticar el problema actual del 3D vacío** — bloqueante. Sin esto no podemos validar nada del 3D. Es la Fase A del plan operacional.

3. **Validación de campos de info por músculo** — comparar el `MuscleDetailScreen` actual con los campos típicos de apps anatómicas profesionales (origen, inserción, acción, inervación, irrigación). Si nos falta alguno → enriquecer data model. Útil incluso sin Anatomy Learning como referencia.

### Media prioridad

4. **Toggle de capas anatómicas**: posibilidad de mostrar solo skeleton (Bezier paths simplificados) vs músculos + skeleton. Investigación de feasibilidad antes de planificar.

5. **Animación de movimientos**: si Anatomy Learning tiene animaciones esqueléticas suaves, validar que con `react-native-reanimated` + interpolación de poses (que ya tenemos via `PHASE_POSE_MAP`) podemos ofrecer una experiencia comparable en términos de UX, aunque la calidad visual sea inferior.

### Baja prioridad / fuera de scope

6. **Migración a Unity**: si el objetivo de Aerial Anatomy se vuelve calidad visual de tier-1 (estilo Anatomy Learning / Visible Body), reconsiderar stack. Hoy no es necesario — el público (instructoras de artes aéreas) no busca realismo médico, busca aprender qué músculos se activan en cada movimiento. Computational anatomy aesthetic actual es apropiada.

---

## 6. Próximos pasos sugeridos

1. **Cerrar Fase A**: diagnosticar y arreglar el 3D vacío en el dev client (bloqueante — sin esto nada del 3D anda).
2. **Plan dedicado para Fase 3 (glow)**: una vez el 3D funcione, escribir `agent_docs/plans/3d-muscle-glow.md` con approach concreto (Bezier paths → ShapeGeometry, multi-selección, pulse animation con shared values).
3. **Auditar `MuscleDetailScreen` y data model**: comparar contra checklist típico de apps anatómicas (origen / inserción / acción / inervación / antagonistas / sinergistas / región / nivel difficulty). Anotar gaps en `agent_docs/followups/pending.md`.
4. **Decisión consciente sobre alcance del 3D**: aceptar que el 3D de Aerial Anatomy NO va a competir con Anatomy Learning en realismo, pero sí en **valor pedagógico específico para artes aéreas** (que Anatomy Learning no cubre).

---

## 7. Cleanup pendiente

El directorio decompilado `C:\dev\tmp\anatomy-learning-decompiled\` (~330 MB) **no debe quedar permanente**. Ocupa espacio y contiene material que no debería distribuirse.

Recomendación: borrar después de que Álvaro confirme haber leído este reporte y no necesitar más inspección.

Comando: `rm -rf C:/dev/tmp/anatomy-learning-decompiled` (vía bash) o `Remove-Item -Recurse -Force` en PowerShell.

El APK original en `C:\Users\alsal\Downloads\Anatomy Learning v3.1.499 (Premium).apk` es decisión de Álvaro qué hacer (legal/ético: borrar y bajar versión free oficial desde Play Store).
