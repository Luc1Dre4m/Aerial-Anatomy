# Maestro E2E — Aerial Anatomy

Smoke test que cubre el camino feliz crítico antes de release: boot →
tabs principales → detalle de músculo → detalle de movimiento. **No** toca
el viewer 3D (los canvases `expo-gl` no exponen elementos accesibles a
Maestro).

Sprint A2 #7 (junta 2026-05-15, Renata + Mauricio).

## Instalar Maestro (Windows)

Maestro corre en Java 8+ y se instala vía PowerShell:

```powershell
Invoke-RestMethod -Uri 'https://get.maestro.mobile.dev' -OutFile install.ps1
.\install.ps1
```

O via Scoop:

```powershell
scoop bucket add extras
scoop install maestro
```

Verificar:

```powershell
maestro --version
```

Si falla por Java, instalar JDK 17:

```powershell
winget install Microsoft.OpenJDK.17
```

## Pre-requisitos para correr

Necesitás **un device o emulator** con la app instalada:

### Opción A — Android Emulator (recomendado para CI local)

```powershell
# Build de development que sí registra en JS bridge
npx expo run:android
```

El comando arriba ya deja la app instalada en el emulator activo.

### Opción B — iOS Simulator (sólo macOS)

```bash
npx expo run:ios
```

### Opción C — Device físico

Para Android: habilitar developer mode + USB debugging, conectar por
USB, autorizar el handshake. Build el APK con `eas build --platform
android --profile development` y arrastrar el `.apk` al device.

## Correr el smoke test

```powershell
cd C:\dev\Aerial-Anatomy-Project
maestro test .maestro/smoke.yaml
```

Maestro abre la app, ejecuta el flow, y reporta pass/fail por step.
Output va a consola; con `--debug-output` se obtiene además
screenshots de cada step en `~/.maestro/tests/<timestamp>/`.

## Selectores que el flow asume

Todos los selectores del flow son **locale-independent** vía `testID` /
`tabBarButtonTestID`. El YAML no contiene strings traducibles del UI.

| Acción | Selector | Definido en |
|---|---|---|
| Detectar onboarding | id=`OnboardingScreen` | SafeAreaView root de OnboardingScreen |
| Skip onboarding (1 tap) | id=`OnboardingSkipBtn` | botón skip de OnboardingScreen |
| CuerpoTab | id=`CuerpoTab` | `tabBarButtonTestID` en BottomTabNavigator |
| Header de Cuerpo | id=`CuerpoScreen:Header` | `testID` en AnimatedTitle de CuerpoScreen |
| MusculosTab | id=`MusculosTab` | `tabBarButtonTestID` en BottomTabNavigator |
| Card de músculo | id=`MuscleCard:m_deltoides` | `testID` en MuscleCard (id estable del registro) |
| Origen section | id=`MuscleDetailScreen:OriginSection` | `testID` en local Section component |
| MovimientosTab | id=`MovimientosTab` | `tabBarButtonTestID` en BottomTabNavigator |
| Card de movimiento | id regex=`MovementCard:.*` | `testID` en MovementCard (primer match visible) |
| Tutorial 3D no visible | id=`Anatomy3DTutorial` | `testID` en el backdrop del overlay |

El YAML ya no contiene ningún `text:` matcher de UI traducible. El flow
es 100% locale-independent.

## Adaptar a EN

**Ya no hace falta** modificar el YAML para correr el flow en un device
con UI en inglés. Tabs, cards, headers y onboarding usan id estables.

## CI / GitHub Actions

Pendiente. Maestro tiene plugin oficial:
<https://maestro.mobile.dev/cli/ci-cd-overview> — agregaría un job que
levanta un emulator Android headless y corre el smoke. Tiempo
estimado: ~10 min por run, sólo en PRs a main.

## Roadmap

- [ ] Primera corrida local (Android emulator). Pegar output exitoso en
      `agent_docs/followups/pending.md` Sprint A2 #7.
- [x] Agregar `testID` a las cards de músculos/movimientos para
      desacoplar del idioma. (2026-05-21: `tabBarButtonTestID` en tabs
      + `testID` en MuscleCard/MovementCard, flow ya usa `id`)
- [x] Agregar `testID` a headers (`CuerpoScreen`, `MuscleDetailScreen`)
      y a OnboardingScreen. (2026-05-21: AnimatedTitle acepta `testID`,
      OnboardingScreen tagged, Section interna de MuscleDetailScreen
      acepta testID, flow EN-ready sin cambios)
- [x] Agregar `testID` al overlay del tutorial 3D. (2026-05-21:
      Anatomy3DTutorial backdrop tagged 'Anatomy3DTutorial', flow
      100% locale-independent)
- [ ] Extender el flow con: tap en una cadena biomecánica (CadenasTab,
      premium), verificar paywall si no premium.
- [ ] Workflow GitHub Actions.
