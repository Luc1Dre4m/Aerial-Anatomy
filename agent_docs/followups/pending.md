# Pending Follow-ups

Deuda tecnica conocida que no amerita bloquear el trabajo en curso pero debe cerrarse pronto.

- [x] **Atribucion CC BY-SA 3.0** de Wikimedia visible en `AboutScreen`. Card con fuente (Wikimedia Commons), link a licencia CC BY-SA 3.0, nota de modificaciones. Cubre tanto el body map 2D como el viewer 3D.
- [x] **Refactor del unlock de premium**: pasar de hardcoded en `useAppStore` a flag `EXPO_PUBLIC_DEV_PREMIUM`. Cerrado en commit `fix(store): gate premium unlock behind EXPO_PUBLIC_DEV_PREMIUM flag`.
- [ ] **Calibracion de zonas del BodyMap + alignment de muscle paths**: las 14 region zones y 33 muscle zones son aproximaciones iniciales. Ademas, los Bezier paths de `bodyPaths.ts` (viewBox 300x460) pueden no alinear perfectamente con los PNGs (ratio diferente). Calibrar visualmente con `showInteractionZones` + screenshots. Commits con prefijo `bodymap(calib):`.
- [ ] **Glow del musculo seleccionado en la escena 3D**: hoy solo el tooltip 2D da feedback al tocar en `Anatomy3DScene`. Evaluar una mesh overlay semitransparente o un shader que resalte el area UV del musculo picked.
- [ ] **Calibracion del picking 3D**: verificar que las zonas `MUSCLE_ZONES` (viewBox 300x420) se mapean correctamente a los UV del plane rotado. Probar tocando cada musculo en la vista frontal y posterior.
- [x] **Atribucion CC BY-SA 3.0 de los PNGs tambien en el viewer 3D**: cubierto por la card general de atribucion en AboutScreen.
- [ ] **Decidir si los PNGs anatomicos van a Git LFS**: `muscle_front.png` (~929KB) y `muscle_back.png` (~862KB) estan committeados al repo (~1.8MB total). El CLAUDE.md indica proponer Git LFS o CDN para binarios >500KB. Opciones: (a) migrar ambos a LFS, (b) servirlos desde un CDN con fallback local, (c) aceptar el tamaño si el repo sigue chico.

## Sprint A2 (junta 2026-05-15) — follow-ups parciales

### #6 — Sentry: enchufar provider real

El shim `src/services/crashReporter.ts` está activo: centraliza errores via `captureException`, está wired en `App.tsx` (init) y `ErrorBoundary.componentDidCatch`, y trackea user via `setUser` en el auth callback. **Sin provider remoto** — hoy hace console-log y nada más.

Para enchufar Sentry:

1. Instalar SDK: `npx expo install @sentry/react-native` (o `sentry-expo` si Expo Go).
2. Agregar a `app.json` el plugin Sentry (si SDK lo requiere).
3. Crear proyecto en sentry.io, copiar la DSN.
4. Agregar `EXPO_PUBLIC_SENTRY_DSN=https://...@sentry.io/...` a `.env.local` (dev) y a EAS secrets (prod).
5. Reescribir `src/services/crashReporter.ts` reemplazando los `console.log` por `Sentry.captureException`, `Sentry.captureMessage`, `Sentry.setUser`. La API surface ya está congelada — los callers no se tocan.
6. Probar tirando un error en dev (`throw new Error('test')` dentro de un screen) y confirmar que aparece en el dashboard.

Free tier de Sentry cubre 5k events/mes — suficiente para volumen esperado del lanzamiento. Considerar `tracesSampleRate: 0.1` para performance monitoring (10% de transactions) si se incluye.

### #7 — Smoke test E2E con Maestro

**Draft commiteado** (2026-05-20): el flow YAML vive en [.maestro/smoke.yaml](../../.maestro/smoke.yaml) y las instrucciones de instalación/ejecución en [.maestro/README.md](../../.maestro/README.md). El flow NO toca el viewer 3D (los canvases `expo-gl` no exponen elementos accesibles a Maestro).

Pendiente:

1. Instalar Maestro CLI local (instrucciones en `.maestro/README.md`).
2. Levantar emulator Android (`npx expo run:android`) — recordar `.env.local` con `EXPO_PUBLIC_DEV_PREMIUM=true` para evitar el paywall en el flow.
3. Primera corrida: `maestro test .maestro/smoke.yaml`. Pegar el output en este doc para dejar baseline.
4. Si algún selector text-based falla por idioma del device → switchear a `testID` (cambios incrementales en cards/tabs).
5. Workflow GitHub Actions más adelante (Maestro Cloud o emulator headless en CI).

Tiempo restante estimado: ~30-45 min entre install + primera corrida + ajuste de selectores. Cobertura conseguida: ~80% de regresiones de release.

## Warnings de `expo-doctor` (no bloqueantes, 2026-05-20)

Tras el rebase + push, `npx expo-doctor` reporta 3 warnings:

1. **Peer deps faltantes**: `expo-asset`, `expo-file-system` (requeridos por `expo-three`); `react-native-worklets` (por `react-native-reanimated`). Fix: `npx expo install expo-asset expo-file-system react-native-worklets`. Bajo riesgo, pero validar que las versions queden alineadas con SDK 54 antes de commitear el lockfile churn.

2. **Duplicate react**: `react@19.1.0` top-level + `react@17.0.2` dentro de `expo-three/node_modules`. expo-three trae su react anidado. Si rompe en builds nativos → agregar override en `package.json` (`"overrides": { "react": "19.1.0" }`) o evaluar reemplazo de expo-three (Plan v6/v7 ya usa R3F directo, posible que se pueda eliminar expo-three del root).

3. **Version mismatches con SDK 54**: `@types/jest 30 vs ~29.5.14`, `jest-expo 55 vs ~54.0.17`. Fix: `npx expo install --check` y commitear el resultado. Tests pasan hoy 35/35 con las versions actuales, así que no es urgente.
