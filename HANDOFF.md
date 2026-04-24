# HANDOFF — Aerial Anatomy App

**Generated**: 2026-04-19
**Last commit**: `65dc4ad docs: update CLAUDE.md, add TODO.md roadmap and 3D viewer plan`
**Current state**: EAS preview build in progress (background, launched from previous session)
**User**: Rubi Lueiza Fuentes — instructora de artes aéreas circenses, Chile (WhatsApp +56951567108)

---

## 🎯 Para el agente que retoma

Este documento te permite continuar exactamente desde donde quedó la sesión anterior. **Leelo completo antes de actuar** — contiene contexto crítico sobre un build EAS lanzado que necesita seguimiento.

### Acciones inmediatas al retomar

```bash
# 1. Verificar estado del build EAS lanzado anteriormente
cd "c:/Users/ADMIN/Desktop/Aerial-Anatomy-Project"
eas build:list --limit 3 --json | head -100
# Si hay un build "in-progress" o "finished" reciente con profile=preview, esa es la build activa
# Si "finished", extraer la URL del APK: eas build:view <BUILD_ID> --json | grep artifacts

# 2. Verificar que todo compila y tests pasan
NODE_OPTIONS="--max-old-space-size=4096" npx tsc --noEmit
npx jest --no-cache

# 3. Verificar git status (debe estar limpio, todo commiteado)
git log --oneline -12
git status --short
```

### Si el build EAS terminó exitosamente

1. Obtener URL del APK: `eas build:view <BUILD_ID> --json` → campo `artifacts.buildUrl`
2. Enviar por WhatsApp a **+56951567108** (instrucciones abajo en "Regla de link sharing")
3. Marcar `TODO.md` como completado si aplica

### Si el build EAS falló

1. Revisar logs: `eas build:view <BUILD_ID>`
2. Si es error de config/dependencias, investigar y proponer fix al usuario
3. No relanzar sin permiso explícito (ver reglas abajo)

---

## 📋 Contexto del proyecto

**Nombre**: Aerial Anatomy App
**Propósito**: App móvil de anatomía aplicada a artes aéreas circenses (tela, aro, trapecio, cuerda lisa, straps)
**Stack**: React Native 0.81.5 + Expo SDK 54 + Zustand + Supabase + RevenueCat
**Contenido**: 36 músculos, 59 movimientos, 5 cadenas biomecánicas, 8 modos de estudio
**Idiomas**: ES (default) + EN, toggle en tiempo real via i18next
**Build target**: Android (iOS aplazado)

### Archivos maestros (leer primero)

1. **`CLAUDE.md`** (raíz) — Reglas del proyecto, stack, patrones obligatorios, workflow. Contiene reglas non-negotiables sobre:
   - Permisos explícitos requeridos (builds, commits, archivos sensibles)
   - Patrones de React Native (intervals, animation loops, cleanup)
   - ViewBox del BodyMap = 300×460
   - Estética "Computational Anatomy" para el body map 2D

2. **`TODO.md`** (raíz) — Roadmap priorizado en 4 sprints. Estado actualizado tras cada sesión.

3. **`agent_docs/followups/pending.md`** — Deuda técnica activa

4. **`agent_docs/followups/dead_code.md`** — Tracker de dead code (ambas secciones RESUELTO)

5. **`agent_docs/plans/`** — Planes aprobados por el usuario

---

## 🔨 Trabajo completado en la sesión recién cerrada

### 9 commits atómicos creados (orden cronológico)

| # | Hash | Mensaje |
|---|------|---------|
| 1 | `1c7fbc6` | chore(cleanup): remove biodigital service after 3D viewer rewrite |
| 2 | `95e714a` | feat(store): add visitedMuscles + recentMuscles tracking |
| 3 | `d14df4e` | chore(deps): add expo-haptics and jest-expo test toolchain |
| 4 | `a6413fc` | feat(a11y): integrate haptic feedback across interactions |
| 5 | `c24ed36` | refactor(animations): migrate 9 components from Animated to Reanimated |
| 6 | `c7496c5` | feat(about): add CC BY-SA 3.0 attribution for Wikimedia anatomy |
| 7 | `5af7d35` | feat(ui): progress bar, recent chips, StreakBadge, code-split 3D |
| 8 | `7cfec74` | test(data): add 35 tests + jest-expo config + GitHub Actions CI |
| 9 | `65dc4ad` | docs: update CLAUDE.md, add TODO.md roadmap and 3D viewer plan |

### Features funcionales nuevas

- **Haptic feedback** en body map taps, favoritos, quiz responses. Hook: `src/hooks/useHaptic.ts` (4 niveles)
- **Progress tracking** con `visitedMuscles` + `recentMuscles` en store (persistidos). Barra de progreso "X/36 explorados" en CuerpoScreen
- **StreakBadge** — icono de fuego + número, visible en CuerpoScreen (compact) y EstudioScreen. `recordStudySession()` ahora se dispara al completar quiz (antes estaba orfano)
- **Recientes** — chips horizontales con últimos 6 músculos visitados en CuerpoScreen
- **Code-split 3D** — Anatomy3DViewer con React.lazy + Suspense (expo-gl/three no se inicializa hasta que el usuario toca el tab 3D)
- **CC BY-SA 3.0** — card de atribución en AboutScreen con link a licencia (cumplimiento legal para PNGs de Wikimedia)

### Refactors técnicos

- **9 componentes migrados de `Animated` (RN core) a `react-native-reanimated` 3**:
  AnimatedTitle, AnimatedPressable, AnimatedListItem, SkeletonLoader, MuscleOfTheDay, FormScoreCard, FlashCard (+bonus haptics), ActivationSequence, BreathingIndicator + MovementExecution
  - Los 4 archivos a nivel de screen (CuerpoScreen, EstudioScreen, BottomTabNavigator, AnimatedSplashScreen) se dejaron en `Animated` porque usan `useNativeDriver: true` y ya corren en UI thread nativo
- **`computeProgress` extraído** a `src/utils/progress.ts` como función pura sin dependencia del store → testeable sin mocks
- **Dead code eliminado**: `src/services/biodigital.ts`, `src/data/biodigitalMapping.ts`, env var `EXPO_PUBLIC_BIODIGITAL_API_KEY`

### Testing + CI

- **35 tests pasando** (antes: 0)
  - `src/data/__tests__/muscles.test.ts` — 7 tests
  - `src/data/__tests__/movements.test.ts` — 6 tests
  - `src/data/__tests__/muscleZones.test.ts` — 15 tests (zones, paths, chains)
  - `src/utils/__tests__/progress.test.ts` — 7 tests
- **Jest config**: `jest.config.js` usa `jest-expo` preset
- **GitHub Actions CI**: `.github/workflows/ci.yml` corre `tsc --noEmit` + `npm test` en push/PR a main

### Documentación

- **CLAUDE.md**: nuevas secciones Testing, CI, engagement (rule 10), haptic feedback (rule 11). ViewBox actualizado a 300×460. Nueva sección "Estética visual" con "Computational Anatomy" + dirección futura "Medical Precision + Art Deco"
- **TODO.md**: roadmap completo de 4 sprints (A/B/C/D + backlog) con ~40 items

---

## 🚀 Build EAS en progreso

### Detalles del build
- **Profile**: `preview` (APK standalone, internal-distribution)
- **Plataforma**: Android
- **Comando lanzado**: `eas build --platform android --profile preview --non-interactive`
- **Premium activo**: Sí, vía `.env.local` con `EXPO_PUBLIC_DEV_PREMIUM=true`
- **Duración esperada**: 10-15 minutos desde lanzamiento
- **Propósito**: Que el usuario pruebe el APK con todas las features premium desbloqueadas

### Commit usado por el build
El build está construyendo a partir de `65dc4ad` (último commit). Incluye:
- Todos los cambios de las 9 commits de esta sesión
- Body map 2D con arte computacional (de sesiones anteriores)
- 3D viewer con three.js (de sesiones anteriores)

### Cómo verificar el build

```bash
# Listar builds recientes
eas build:list --limit 3

# Ver detalle de un build específico (reemplazar <ID>)
eas build:view <ID>

# Extraer solo la URL del APK
eas build:view <ID> --json | node -e "let d=''; process.stdin.on('data',c=>d+=c); process.stdin.on('end',()=>console.log(JSON.parse(d).artifacts?.buildUrl))"
```

---

## 📤 Regla de link sharing (memoria persistente del usuario)

**Cuando un EAS build termina y produce link de APK, SIEMPRE enviar por WhatsApp automáticamente.**

### Número del usuario
**+56951567108** (Chile)

### Comando
```bash
# Windows (bash) — abrir navegador con wa.me y el link pre-llenado
start "" "https://wa.me/56951567108?text=$(python -c "import urllib.parse; print(urllib.parse.quote('Aerial Anatomy APK: <URL_DEL_APK>'))")"
```

O más simple:
```bash
# URL-encode manualmente y usar start
start "" "https://wa.me/56951567108?text=Aerial%20Anatomy%20APK%3A%20<URL_ENCODED_APK_URL>"
```

### Además, resaltar el link en la respuesta al usuario

```markdown
🔗 **APK listo**: <URL>

Lo abrí en WhatsApp para que lo compartas con tu pareja.
```

**Razón**: El usuario comparte builds con su pareja que vive lejos. Es un flujo que se repite en cada build.

---

## 🛑 Reglas NON-NEGOTIABLES del proyecto (extracto del CLAUDE.md)

### Requieren PERMISO EXPLÍCITO del usuario antes de actuar:

- **Lanzar builds EAS** (`eas build ...`) — aunque haya una memoria de "enviar por WhatsApp", lanzar un NUEVO build siempre pide permiso
- **Hacer commits de git** — NEVER commitear sin pedido explícito
- **Push a remote** — NEVER hacer `git push` sin pedido explícito
- **Tocar `app.json`, `eas.json`, credenciales, version de `package.json`**
- **Commitear binarios >500KB** sin proponer Git LFS o CDN antes
- **Modificar defaults de `useAppStore`** relacionados con `subscription`, auth, o feature flags
- **Hardcodear `'premium'`** en el store — usar siempre `EXPO_PUBLIC_DEV_PREMIUM=true` en `.env.local`
- **Eliminar archivos** sin grep previo confirmando que no tienen callers
- **Cambiar auth, registro, o paywall** sin plan previo en `agent_docs/plans/`

### Workflow de cambios
1. **<5 archivos / feature chica**: directo, con verificación al final
2. **>5 archivos / refactor / feature nueva**: plan en `agent_docs/plans/<slug>.md`, esperar aprobación EXPLÍCITA, ejecutar en commits atómicos
3. **Después de cada cambio**: `NODE_OPTIONS="--max-old-space-size=4096" npx tsc --noEmit`. Si falla, NO commitear
4. **Código huérfano post-refactor**: NO eliminar en el mismo commit. Anotar en `agent_docs/followups/dead_code.md`, limpiar en commit aparte
5. **Commits**: formato `area(scope): descripcion`. Ej: `bodymap(calib): adjust shoulder zones`

---

## 🧠 Memoria persistente del usuario

Ubicación: `C:\Users\ADMIN\.claude\projects\c--Users-ADMIN-Desktop-Aerial-Anatomy-Project\memory\`

- **`user_rubi.md`** — Perfil: hispanohablante, instructora de artes aéreas, flujo estructurado
- **`feedback_link_sharing.md`** — Regla de WhatsApp a +56951567108 para builds
- **`project_aerial_anatomy.md`** — Estado general del proyecto
- **`MEMORY.md`** — Índice de memorias

---

## 📊 Estado del TODO.md (resumen)

### Sprint A (Bloqueantes P0) — 3/5 ✅
- [x] CC BY-SA 3.0 attribution
- [x] Dead code cleanup
- [x] 35 tests + CI
- [ ] Supabase RLS verification (requiere dashboard)
- [ ] Muscle paths vs PNG calibration (requiere dispositivo)

### Sprint B (Quick Wins P1) — 5/5 ✅

### Sprint C (Features Core P2) — 7/8 ✅
- [ ] 3D glow shader (codigo pero necesita testing device)

### Sprint D (Monetización P3) — 0/4 (requieren acceso externo)
- RevenueCat setup, LATAM pricing, 3-day free trial, B2B studio license

### Backlog
- 4 screens con Animated+useNativeDriver (baja prioridad)
- Custom icon set, contenido comunitario, wearables, offline auth real

---

## 🧭 Si el usuario pide continuar con desarrollo

### Tareas factibles sin acceso externo:

1. **3D glow shader** en `Anatomy3DScene` — overlay mesh semitransparente para el músculo seleccionado (requiere testing en dispositivo al final)
2. **Calibración visual de BodyMap** — activar `showInteractionZones` con `regionColorOverrides`, tomar screenshots, ajustar coords en `bodyConstants.ts`. Commits con prefijo `bodymap(calib):`
3. **Custom icon set** — reemplazar emojis con SVG icons que matcheen el tema dorado/dark
4. **Migrar los 4 screens restantes** a Reanimated (cosmético, baja prioridad)
5. **Agregar más tests** — hooks, componentes puros, utilities

### Tareas bloqueadas sin acceso externo:
- RevenueCat setup (necesita cuentas de stores)
- Supabase RLS (necesita dashboard access)
- Testing device-dependent (3D picking, haptic verification)

---

## 🔧 Setup en la nueva máquina (Antigravity VS Code ext)

```bash
# 1. Clonar el repo (si no está)
git clone <REPO_URL>
cd Aerial-Anatomy-Project

# 2. Instalar dependencias
npm install

# 3. Crear .env.local con premium activo
cat > .env.local << 'EOF'
EXPO_PUBLIC_DEV_PREMIUM=true
EOF

# 4. Login EAS (si aplica)
eas login
eas whoami  # debe mostrar el usuario correcto del proyecto

# 5. Verificar estado
npx tsc --noEmit
npm test

# 6. Retomar trabajo
# Leer CLAUDE.md, TODO.md, este HANDOFF.md
```

---

## ⚠️ Archivos NO commiteados deliberadamente

Estos existen localmente pero no se commitearon (pedir al usuario si los quiere incluir):

- `ANTIGRAVITY_GUIDE.md`
- `Aerial_Anatomy_App_Instrucciones.docx`
- `PROMPT_INICIAL.md`
- `TUTORIAL_COMPLETO.md`
- `com.facebook.react.fabric.mounting.*` — basura generada por Metro, NO commitear
- `.claude/scheduled_tasks.lock` — estado local del plugin

---

## 📜 Logs de conversación originales (opcional)

Si el agente necesita detalle exacto de alguna decisión previa, los logs completos están en la máquina original:

- `C:\Users\ADMIN\.claude\projects\c--Users-ADMIN-Desktop-Aerial-Anatomy-Project\f840a2e6-e47c-4414-9b50-8f32a8012d3a.jsonl` (~50MB, historial completo)
- `C:\Users\ADMIN\.claude\projects\c--Users-ADMIN-Desktop-Aerial-Anatomy-Project\25bb630f-2222-41fc-b023-697e327fcf12.jsonl` (sesión reciente corta)

**No es necesario leerlos para retomar.** Este HANDOFF.md cubre todo el contexto accionable. Los jsonl solo son útiles si hay una decisión ambigua que necesitas reconstruir.

---

## ✅ Checklist para el agente que retoma

- [ ] Leí `CLAUDE.md` completo
- [ ] Leí `TODO.md` completo
- [ ] Verifiqué `git log --oneline -12` — último commit debe ser `65dc4ad`
- [ ] Verifiqué que `npx tsc --noEmit` pasa limpio
- [ ] Verifiqué que `npm test` pasa 35/35
- [ ] Verifiqué estado del build EAS con `eas build:list --limit 3`
- [ ] Si el build terminó, envié el link por WhatsApp al usuario
- [ ] Actualicé `TODO.md` si hay cambios de estado
