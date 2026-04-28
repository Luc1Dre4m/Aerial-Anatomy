# TODO — Aerial Anatomy App

Roadmap priorizado resultado de la auditoria integral (junta directiva 2026-04-15).
Actualizar conforme se completen items. Formato: `- [x]` completado, `- [ ]` pendiente.

---

## Sprint A — Bloqueantes para Produccion (P0)

Sin estos items NO se puede hacer release. Deben completarse primero.

- [x] **Atribucion CC BY-SA 3.0 en AboutScreen** — Card con fuente (Wikimedia Commons), link a licencia, nota de modificaciones. Cubre 2D y 3D.
- [x] **Cleanup dead code: biodigital** — Eliminados `biodigital.ts`, `biodigitalMapping.ts`, y `EXPO_PUBLIC_BIODIGITAL_API_KEY` de `.env.example`.
- [x] **Tests minimos para data layer** — 28 tests en 3 archivos: muscles, movements, muscleZones+bodyPaths+chains. `npm test` pasa.
- [ ] **Seguridad: verificar Supabase RLS** — Confirmar que Row Level Security esta habilitado en todas las tablas. Verificar que `.env` esta en `.gitignore`. Revisar `src/services/supabase.ts`. Requiere acceso al dashboard de Supabase.
- [ ] **Calibracion muscle paths vs PNG** — Los Bezier paths (viewBox 300x460, ratio 0.652) pueden no alinear con los PNGs (ratio 0.714). Verificar visualmente con `showInteractionZones` en dispositivo.

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
- [ ] **Glow del musculo seleccionado en 3D** — Mesh overlay semitransparente o shader para `Anatomy3DScene`. Requiere testing en dispositivo.
- [ ] **Calibracion del picking 3D** — Verificar mapeo MUSCLE_ZONES (viewBox 300x460) a UV del plane rotado.
- [ ] **Decidir PNGs en Git LFS** — `muscle_front.png` (~929KB) + `muscle_back.png` (~862KB) = ~1.8MB. Opciones: LFS, CDN, o aceptar.

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
