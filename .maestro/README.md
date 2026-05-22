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

| Acción | Selector | Por qué |
|---|---|---|
| Skip onboarding | text=`Bienvenida` | Heading del primer slide — sigue acoplado a ES |
| CuerpoTab | id=`CuerpoTab` | `tabBarButtonTestID` en BottomTabNavigator — locale-independent |
| Header de Cuerpo | text=`Mapa Corporal` | screens.cuerpo.title — acoplado a ES |
| MusculosTab | id=`MusculosTab` | `tabBarButtonTestID` — locale-independent |
| Card de músculo | id=`MuscleCard:m_deltoides` | `testID` en MuscleCard — locale-independent, id estable del registro |
| Header MuscleDetail | text=`Origen` | section heading — acoplado a ES |
| MovimientosTab | id=`MovimientosTab` | `tabBarButtonTestID` — locale-independent |
| Card de movimiento | id regex=`MovementCard:.*` | `testID` en MovementCard — primer match visible |
| Header MovementDetail | text matching fase | fase Setup/Vuelo/etc — depende del movimiento, acoplado a ES |

Tabs y cards ahora son inmunes a cambios de idioma o de copy. Lo que
sigue acoplado a ES: onboarding y headers de pantalla — ver siguiente
sección.

## Adaptar a EN

Tras la migración a `testID`, solo quedan acoplados al idioma:

| ES | EN |
|---|---|
| Bienvenida | Welcome |
| Continuar | Continue |
| Mapa Corporal | Body Map |
| Origen | Origin |

Para correr el flow en un device EN, reemplazar esos strings en el
YAML. Las tabs y cards funcionan en cualquier idioma sin tocar nada.

Próximo paso para terminar de desacoplar: agregar `testID` a los
headers de `CuerpoScreen` y `MuscleDetailScreen`, y a los botones de
onboarding (`OnboardingScreen`).

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
- [ ] Agregar `testID` a headers (`CuerpoScreen`, `MuscleDetailScreen`)
      y a OnboardingScreen para cerrar el desacople de idioma.
- [ ] Extender el flow con: tap en una cadena biomecánica (CadenasTab,
      premium), verificar paywall si no premium.
- [ ] Workflow GitHub Actions.
