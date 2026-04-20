# Aerial Anatomy App

App movil de anatomia aplicada a artes aereas circenses. Visualiza musculos, cadenas biomecanicas y movimientos de todas las disciplinas aereas.

## Stack

- **Framework**: React Native + Expo SDK 54+
- **Body map**: imagenes PNG anatomicas (Wikimedia, CC BY-SA 3.0) con overlay SVG de zonas tappeables via `react-native-svg`
- **Animaciones**: `react-native-reanimated` 3+, `lottie-react-native`
- **Listas**: `@shopify/flash-list` v2
- **DB local (offline-first)**: WatermelonDB
- **Backend**: Supabase (Postgres + Auth + Realtime)
- **Pagos**: RevenueCat
- **Navegacion**: React Navigation 7
- **State**: Zustand con persistencia
- **i18n**: `react-i18next` (ES/EN obligatorio)
- **Build**: EAS Build

## Arquitectura

```
src/
  components/{body,muscles,movements,chains,study,pose,ui}/
  screens/  navigation/  data/  hooks/  store/  utils/  i18n/  theme/  services/
assets/anatomy/         # PNGs anatomicos CC BY-SA 3.0
agent_docs/
  plans/                # Planes aprobados antes de cambios grandes
  followups/            # Deuda tecnica pendiente
```

## Reglas criticas de producto

1. **Bilingue obligatorio**: TODO texto visible existe en ES y EN via claves i18n. Nunca strings hardcoded, nunca precios hardcoded en un idioma.
2. **Nomenclatura anatomica triple**: musculo en espanol + ingles + latin.
3. **Roles musculares**: cada musculo en un movimiento tiene rol `agonista | sinergista | estabilizador | antagonista`.
4. **Offline-first**: data anatomica funciona sin conexion. Solo sync, auth y analytics requieren red.
5. **Tema oscuro con dorados**: bg `#1A1A2E`, cards `#2C2C44`, acentos `#D4A843`/`#C49B3C`, texto `#F5E6C4`. Titulos serif, body sans-serif.
6. **60fps target**. Lazy load. FlashList. Imagenes optimizadas.
7. **Nota de seguridad obligatoria** en cada movimiento.
8. **Credito de autora**: "Rubi Lueiza Fuentes - Instructorado de Artes Aereas Circenses" en About y footer.
9. **Atribucion CC BY-SA 3.0** para `assets/anatomy/` visible en `AboutScreen`.
10. **Engagement minimo**: cada pantalla principal debe tener al menos un call-to-action que invite al usuario a explorar mas.
11. **Haptic feedback**: usar `expo-haptics` en interacciones de seleccion (body map, listas, quiz). Impact light para browse, medium para seleccion, success para completar.

## Patrones obligatorios de React Native

Estos patrones existen porque ya hubo bugs por no seguirlos. No son negociables.

### Intervals — siempre con useRef + cleanup

```tsx
const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);
const play = useCallback(() => {
  if (intervalRef.current) clearInterval(intervalRef.current);
  intervalRef.current = setInterval(() => { /* ... */ }, 100);
}, [deps]);
```

### Animation loops — guardar instancia y stop en cleanup

```tsx
useEffect(() => {
  const anim = Animated.loop(/* ... */);
  anim.start();
  return () => anim.stop();
}, []);
```

### Listeners de Animated.Value — removeListener + setValue(0) en cleanup/reset

### Cards en listas — `React.memo` por defecto, comparator custom si props son objetos

### State updates dependientes del valor previo — siempre forma funcional

```tsx
setX((prev) => { const next = new Map(prev); next.set(id, val); return next; });
```

## Versiones y gotchas

- **FlashList v2**: NO `estimatedItemSize` (removido). Usar `keyboardDismissMode="on-drag"` y `keyboardShouldPersistTaps="handled"` en pantallas con search.
- **i18next**: `compatibilityJSON: 'v4'` obligatorio.
- **react-native-svg sobre Image**: contenedor `<View>` con `position: relative`, `<Image>` con `StyleSheet.absoluteFill` + `resizeMode="contain"`, `<Svg>` encima con `StyleSheet.absoluteFill` + `pointerEvents="box-none"`.
- **Zustand persist**: cambios en defaults NO migran usuarios existentes. Usar `onRehydrateStorage` con extrema cautela.

## Workflow de cambios

1. **<5 archivos / una feature chica**: directo, con verificacion al final.
2. **>5 archivos / refactor / feature nueva**: plan en `agent_docs/plans/<slug>.md`, esperar aprobacion explicita en chat, ejecutar en commits atomicos.
3. **Despues de cada cambio**: `NODE_OPTIONS="--max-old-space-size=4096" npx tsc --noEmit`. Si falla, no se commitea.
4. **Codigo huerfano** post-refactor: NO eliminar en el mismo commit. Anotar en `agent_docs/followups/dead_code.md`, limpiar en commit aparte.
5. **Commits**: formato `area(scope): descripcion`. Ej: `bodymap(calib): adjust shoulder zones`.

## Lo que Claude NO debe hacer sin permiso explicito en el chat

- **Modificar defaults de `useAppStore`** relacionados con `subscription`, auth, o feature flags. Para premium en dev: `EXPO_PUBLIC_DEV_PREMIUM=true` desde `.env.local`. NUNCA hardcodear `'premium'` ni promover usuarios en `onRehydrateStorage`.
- **Lanzar builds EAS** (`eas build ...`).
- **Commitear binarios >500KB** sin proponer Git LFS o CDN antes.
- **Tocar `app.json`, `eas.json`, credenciales, version de `package.json`**.
- **Eliminar archivos** sin grep previo confirmando que no tienen callers.
- **Cambiar auth, registro, o paywall** sin plan previo.
- **Modificar migraciones de Zustand persist**.

## Testing

- Tests obligatorios para funciones de data layer (`src/data/`).
- Antes de PR: `npm test` debe pasar.
- Minimo: unit tests para helpers de busqueda y filtrado (`getMuscleById`, `getMovementById`, `getChainById`, `getMuscleZonesForView`, `getMusclePathsByView`).
- Archivos de test en `src/data/__tests__/`.

## CI

- GitHub Action en `.github/workflows/ci.yml` corre `tsc --noEmit` + `npm test` en cada push.
- No se mergea si CI falla.

## Workflow de calibracion del BodyMap

ViewBox `0 0 300 460`. Coordenadas de `BODY_ZONES` en `src/components/body/bodyConstants.ts` se calibran visualmente.

Para recalibrar: activar `showInteractionZones` con `regionColorOverrides` pintando cada zona distinta, screenshot, ajustar `cx/cy/rx/ry`. Cada ajuste en commit separado con prefijo `bodymap(calib):`.

Archivos clave que deben mantenerse sincronizados:
- `src/components/body/AnatomicalBody.tsx` — render Image + Svg overlay + muscle paths + tech overlay
- `src/components/body/bodyConstants.ts` — BODY_ZONES, BODY_VIEWBOX (300x460)
- `src/components/body/BodyMap.tsx` — aspectRatio del contenedor (300/460)
- `src/components/chains/ChainOverlay.tsx` — usa el mismo aspectRatio (300/460)
- `src/data/bodyPaths.ts` — Bezier paths de musculos, silhouettes, detail strokes
- `src/components/body/BodyDefs.tsx` — gradientes SVG (muscle-vertical, muscle-convex, etc.)
- `src/components/body/MuscleLayer.tsx` — renderizado individual de path con gradient + highlight

## Estetica visual

### Body Map 2D — "Computational Anatomy"
Estilo de arte computacional: precision geometrica + data-viz aesthetics + tono medico profesional. Capas de renderizado (fondo a frente): PNG base (0.5 opacity) → silhouette path → muscle paths con gradient fills → tech overlay (dot grid + scan lines) → region/muscle zones → glow pulse → label callout → vignette. **No modificar el estilo sin plan previo — es el diferenciador visual de la app.**

### Figuras humanas en movimientos
Todas las figuras humanas pasan por `src/components/movements/PosedFigure.tsx` (estetica yoga-app: limbs como strokes redondeados con gradiente morado, torso Path con Bezier, head con radial gradient). `StickFigure` es un delegate fino. **Ningun componente nuevo debe dibujar figuras humanas con su propio sistema.**

Poses en `src/data/poses.ts` via `PoseJoints`. Para movimiento nuevo, agregar key a `PHASE_POSE_MAP`.

### Direccion de marca — "Medical Precision + Art Deco"
Evolucion futura del tema visual: mantener oscuro+dorado como base, incorporar bordes decorativos sutiles, tipografia serif mas expresiva en titulos anatomicos, iconos custom con lineas geometricas, spring animations para transiciones.

## Comandos

```bash
npx expo start
npx expo run:ios
npx expo run:android
npm test
NODE_OPTIONS="--max-old-space-size=4096" npx tsc --noEmit    # OBLIGATORIO antes de commit
eas build --platform android --profile preview               # REQUIERE permiso explicito
```

## Definition of Done

1. `tsc --noEmit` limpio.
2. `npm test` pasa (si existen tests para el area tocada).
3. App arranca en dev sin warnings nuevos.
4. UI tocada → descripcion visual o screenshot.
5. Logica tocada → caso de prueba manual descrito.
6. Commit message en formato `area(scope): descripcion`.
7. Deuda tecnica anotada en `agent_docs/followups/`.
8. Si tocaste algo de "permiso explicito", confirmaste antes.

## Docs de referencia

Lee el doc correspondiente antes de trabajar en un area:

- `agent_docs/data_model.md`
- `agent_docs/muscles_database.md`
- `agent_docs/movements_database.md`
- `agent_docs/biomechanical_chains.md`
- `agent_docs/ui_design_system.md`
- `agent_docs/expert_guidelines.md`
- `agent_docs/feature_roadmap.md`
- `agent_docs/monetization.md`
- `agent_docs/followups/` — deuda tecnica
- `agent_docs/plans/` — planes aprobados
