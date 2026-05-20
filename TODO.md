# TODO — Aerial Anatomy App

Roadmap priorizado de la app. Resultados consolidados de dos auditorías:
- Junta directiva 2026-04-15 (original — sprints A-D + backlog).
- Junta directiva 2026-05-15 (re-auditoría — ver `agent_docs/junta_2026_05_14.md`). Confirma que el 3D viewer ya es "feature complete v1"; foco siguiente: release readiness + monetización. Top-7 prioridades en Sprint A2.

Actualizar conforme se completen items. Formato: `- [x]` completado, `- [ ]` pendiente.

---

## Sprint A — Bloqueantes para Produccion (P0)

Sin estos items NO se puede hacer release. Deben completarse primero.

- [x] **Atribucion CC BY-SA 3.0 en AboutScreen** — Card con fuente (Wikimedia Commons), link a licencia, nota de modificaciones. Cubre 2D y 3D.
- [x] **Cleanup dead code: biodigital** — Eliminados `biodigital.ts`, `biodigitalMapping.ts`, y `EXPO_PUBLIC_BIODIGITAL_API_KEY` de `.env.example`.
- [x] **Tests minimos para data layer** — 28 tests en 3 archivos: muscles, movements, muscleZones+bodyPaths+chains. `npm test` pasa.
- [ ] **Seguridad: verificar Supabase RLS** — Confirmar que Row Level Security esta habilitado en todas las tablas. Verificar que `.env` esta en `.gitignore`. Revisar `src/services/supabase.ts`. Requiere acceso al dashboard de Supabase.
- [ ] **Calibracion muscle paths vs PNG** — Los Bezier paths (viewBox 300x460, ratio 0.652) pueden no alinear con los PNGs (ratio 0.714). Verificar visualmente con `showInteractionZones` en dispositivo. **Nota junta 2026-05-15 (Camila)**: si el bodymap 2D se deprecia formalmente con la migración al 3D, esto pasa a obsoleto. Decidir antes de cerrarlo.

---

## Sprint A2 — Release Readiness (Junta 2026-05-15, Top-7)

Salida de la re-auditoría del 2026-05-15. Asume el 3D ya es feature-complete v1; el siguiente foco es shipearlo. Detalle completo en `agent_docs/junta_2026_05_14.md`.

- [ ] **🚨 Reducir bundle de 3D (400 MB → <40 MB)** — `assets/3d-models/` pesa 399 MB. Hoy NO se puede publicar (Google Play AAB cap 150 MB). Plan combinado: (a) decimación más agresiva (`gltfpack -si 0.10`) → ~30% del tamaño actual, (b) GLBs en CDN o Play Asset Delivery, descargados al primer abrir CuerpoTab y cacheados con `expo-file-system`. **Bloqueante de release** (owner-voice: Renata).
- [ ] **EAS Build preview + test iOS via TestFlight** — `eas build --profile preview` para Android e iOS. iOS especialmente sin verificar (R3F-native + expo-gl difiere bastante entre plataformas). Esfuerzo: 1-2 días (owner-voice: Mauricio).
- [ ] **Tutorial overlay 3D + haptics + easing setViewOffset** — Onboarding del viewer 3D (3 pasos skippables: rotar, tappear, zoom buttons). `Haptics.selectionAsync()` en `handleClick` de `MuscleGroup`. Interpolar `dx/dy` del setViewOffset con cubic-out ~200 ms para que el "swing" se sienta cinematográfico, no abrupto (owner-voice: Tomás).
- [ ] **RevenueCat sandbox + paywall enforcement real** — Configurar proyecto, crear offerings ($1.99/$14.99/$4.99/$39.99), conectar entitlements a Zustand, gate free-vs-premium en `MuscleDetailScreen` / `MovementDetailScreen` con soft paywall (blur + CTA). Sin esto no hay revenue (owner-voice: Sofía). Reemplaza/expande Sprint D "RevenueCat setup completo".
- [ ] **Crash reporting (Sentry) + safeguard DEV_PREMIUM** — Sentry SDK Expo en free tier. En `useAppStore`, runtime throw si `EXPO_PUBLIC_DEV_PREMIUM === 'true'` y `__DEV__ === false`. Impide shippear con dev-mode activo (owner-voice: Mauricio).
- [ ] **Limpieza dead code 2D + smoke test E2E (Maestro)** — Eliminar (con grep previo): `ViewModeToggle.tsx`, `MuscleTooltip.tsx`, `ZoomableBody.tsx`, `BodyMap.tsx`, `MuscleLayer.tsx`, `BodyDefs.tsx`, `getMusclesByRegion`, `REGION_LABELS`. Agregar 1 smoke test E2E con Maestro: arranque → CuerpoTab carga → tap muscle → InfoCard → MovimientosTab → 1 movement → detalle. Cubre ~80% de regresiones de release (owner-voice: Renata + Mauricio).
- [ ] **Definir D-day de release tentativa** — Sin deadline el scope crece indefinidamente. Proponer fecha realista (ej: 2026-07-15 para Chile + Argentina staged launch). Sirve para cerrar scope y decir "no" a features no críticas (owner-voice: Camila).

---

## Sprint B — Quick Wins (P1)

- [x] **Haptic feedback** — `expo-haptics` instalado. Hook `src/hooks/useHaptic.ts` con 4 niveles (light, medium, success, selection). Integrado en `AnatomicalBody.tsx` (tap zones), `MuscleDetailScreen.tsx` y `MovementDetailScreen.tsx` (favoritos).
- [x] **Musculo del dia** — Ya existia como `MuscleOfTheDay` component con glow animation. Integrado en CuerpoScreen.
- [x] **Skeleton loading states** — Ya existia como `SkeletonLoader` con 3 variantes (card, list-item, detail). Exportado en barrel.
- [x] **CI basico con GitHub Actions** — `.github/workflows/ci.yml` corre `tsc --noEmit` + `npm test` en push y PR a main.
- [x] **Atribucion CC BY-SA 3.0 en viewer 3D** — Cubierto por la card general en AboutScreen.

---

## Sprint C — Features Core (P2)

- [x] **Onboarding flow** — Ya existia: `OnboardingScreen.tsx` con 3 pasos (idioma, disciplinas, nivel). Flag `onboardingComplete` en Zustand.
- [x] **Busqueda global** — Ya existia: `GlobalSearch.tsx` con busqueda sobre musculos + movimientos. Integrado en CuerpoScreen header.
- [x] **Favoritos** — Ya existia en store: `favoriteMuscles`, `favoriteMovements`, `toggleFavoriteMuscle`, `toggleFavoriteMovement`. UI integrada en detail screens.
- [x] **Recientes y visitados** — Agregados `visitedMuscles`, `recentMuscles`, `markMuscleVisited`, `addRecentMuscle` al store. Persistidos en AsyncStorage. Se disparan al abrir MuscleDetailScreen.
- [x] **Progress tracking visual** — Hook `useProgress.ts` calcula progreso por region. Barra de progreso en CuerpoScreen ("X/36 musculos explorados"). Aparece despues de la primera visita.
- [x] **Glow del musculo seleccionado en 3D** — Resuelto al migrar a R3F mesh-based viewer: `MuscleGroup` aplica `MeshLambertMaterial` con `emissive` + `emissiveIntensity` al músculo seleccionado. Sin shader custom, sin overlay; el highlight es instantáneo (sin `needsUpdate`).
- [x] **Calibracion del picking 3D** — Resuelto al migrar a viewer mesh-based. Ahora cada muscle GLB tiene 4-8 sub-meshes con AABB raycast individual (Plan v6: `tools/batch-build-models.mjs` + gltfpack `-km`). Pick es por bbox real del músculo, sin mapeo UV. Plan v7 (2026-05-14) además mantiene el pivote fijo y centra el músculo en pantalla via setViewOffset dinámico.
- [ ] **Decidir PNGs en Git LFS** — `muscle_front.png` (~929KB) + `muscle_back.png` (~862KB) = ~1.8MB. Opciones: LFS, CDN, o aceptar. **Nota junta 2026-05-15**: si el bodymap 2D se deprecia formalmente, estos PNGs salen del repo entero. Decisión depende de Sprint A2 item "limpieza dead code 2D".

---

## Sprint D — Monetizacion y Mercado (P3)

Requiere acceso a cuentas de stores y configuracion externa.

- [ ] **RevenueCat setup completo** — Configurar proyecto en RevenueCat, crear offerings (3 tiers: $1.99/$9.99/$39.99), conectar con Play Store/App Store, testear sandbox purchases.
- [ ] **LATAM pricing localization** — Precios regionalizados para Argentina, Colombia, Mexico en RevenueCat/stores.
- [ ] **3-day free trial flow** — Trial de 3 dias para tier premium. UI de countdown y conversion.
- [ ] **B2B Studio License** — Modelo $99-299/mes para estudios de artes aereas. Sistema de invites/codigos, dashboard admin en Supabase.

---

## Backlog — Mejoras Tecnicas y Futuras

- [ ] **Unificar animation drivers restantes** — Quedan 9 archivos con `Animated` de RN core: AnimatedTitle, AnimatedPressable, AnimatedListItem, SkeletonLoader, ActivationSequence, FlashCard, MovementExecution, BreathingIndicator, FormScoreCard. MuscleOfTheDay ya migrado.
- [x] **Code splitting** — Anatomy3DViewer con `React.lazy` + `Suspense` en CuerpoScreen. El bundle de three.js/expo-gl solo se carga al cambiar a tab 3D.
- [ ] **Custom icon set** — Reemplazar emojis con iconos SVG custom que matcheen el tema dorado. `assets/icons/`, componente `Icon.tsx`.
- [ ] **Contenido comunitario** — Sistema de submissions de movimientos por instructores. Backend en Supabase con review flow.
- [ ] **Integracion wearables** — Datos de accelerometer correlacionados con musculos activados. Largo plazo.
- [ ] **Modo offline real para auth** — Asegurar que Zustand persist cubre user state completo. Queue de sync para reconexion.

---

## Completados

- [x] **Body map 2D: fix display** — Eliminado doble-padding en CuerpoScreen. Commit `3071169`.
- [x] **Body map 2D: arte computacional** — Integrados muscle paths, BodyDefs, MuscleLayer, tech overlay, label callout. Commit `be7f64e`.
- [x] **ViewBox update 300x460** — bodyConstants, BodyMap, ChainOverlay actualizados. Commit `3071169`.
- [x] **Dead code: bodyPaths/BodyDefs/MuscleLayer** — Reintegrados, removidos de orphan list. Commit `513b528`.
- [x] **3D viewer: rewrite con three.js** — Reemplazado placeholder BioDigital con escena three.js real.
- [x] **Fix EAS build: expo-file-system override** — npm overrides para forzar expo-file-system 19.x. Commit `07878dd`.
- [x] **Refactor unlock premium** — Flag `EXPO_PUBLIC_DEV_PREMIUM` en vez de hardcoded.
- [x] **CLAUDE.md actualizado** — Secciones Testing, CI, haptics, engagement, estetica visual, direccion de marca.
- [x] **Recientes en CuerpoScreen** — Chips horizontales con ultimos 6 musculos visitados. Store con `recentMuscles` + `visitedMuscles` persistidos.
- [x] **Progress bar en CuerpoScreen** — Barra de progreso "X/36 musculos explorados" con `useProgress` hook.
- [x] **MuscleOfTheDay migrado a Reanimated** — Glow pulse ahora usa `withRepeat`/`withSequence` en UI thread.
- [x] **Haptics en quiz** — `hapticSuccess` en respuesta correcta, `hapticLight` en incorrecta (EstudioScreen).
- [x] **Code splitting 3D** — `React.lazy` + `Suspense` para Anatomy3DViewer. ActivityIndicator como fallback.

### Desde junta 2026-04-15 hasta junta 2026-05-15

- [x] **3D viewer: migración a R3F mesh-based** — Reemplazo del 2D-textured-plane PoC por escena R3F nativa con OrbitControls, GLB pipeline (`tools/batch-build-models.mjs` + `tools/decimate-with-gltfpack.mjs`). Commits `74ba42b`, `1a2ffdb`, `b88ef49`.
- [x] **3D: 35 músculos modelados** — BodyParts3D STLs → GLBs decimados con sub-meshes preservados. `tools/anatomy-models-curated.json` expandido de 10 a 36 entradas FMA. Commit `29d606b`.
- [x] **3D: picking AABB sub-mesh** — Materiales únicos por FMA + `gltfpack -km` preservan sub-meshes. Cada AABB raycast es O(1), pick por bbox real del músculo. Plan v6.
- [x] **3D: zoom por botones + / −** — Pinch incompatible con expo-gl (GLView traga los touches). Botones flotantes en esquina inferior-derecha del canvas. Plan v4.
- [x] **3D: multi-touch sin crash** — Patch `controls.touches.TWO = undefined` + responder system `onMoveShouldSetResponder` para ≥2 dedos. Soluciona crash de OrbitControls `handleTouchMoveDolly`.
- [x] **3D: centrado canvas via setViewOffset estático** — `HORIZONTAL_SHIFT_FACTOR = 0.20` aplica `setViewOffset` cada frame, body al centro del canvas. Plan v5.
- [x] **3D: pivote SIEMPRE en body center** — Plan v7 (2026-05-14). Removido el `controls.target.copy(muscleCenter)` que descuadraba el cuerpo al seleccionar. Ahora `muscleCenterRef` + setViewOffset dinámico en `CameraEnforcer` centran el músculo en pantalla sin tocar el pivote.
- [x] **3D: chain selector con multi-muscle highlight** — Selección de cadena biomecánica resalta todos los músculos de la cadena con su color en simultáneo. Commit `5bebfd3`.
- [x] **3D: "Ver detalle completo" bridge** — Footer del 3D enlaza a `MuscleDetailScreen` para vista expandida. Commit `555a7c4`.
