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
| Skip onboarding | text=`Bienvenida` | Heading del primer slide |
| CuerpoTab | text=`Cuerpo` | tabBarLabel desde i18n `tabs.cuerpo` |
| Header de Cuerpo | text=`Mapa Corporal` | screens.cuerpo.title |
| MusculosTab | text=`Músculos` | tabs.musculos |
| Card de músculo | text=`Deltoides` | nombre real en la lista, siempre presente |
| Header MuscleDetail | text=`Origen` | section heading de MuscleDetailScreen |
| MovimientosTab | text=`Movimientos` | tabs.movimientos |
| Header MovementDetail | text matching fase | fase Setup/Vuelo/etc — depende del movimiento |

Si la app cambia esos strings, el flow rompe — actualizar en
`smoke.yaml` y en esta tabla.

## Adaptar a EN

El flow está escrito en español. Para EN reemplazar:

| ES | EN |
|---|---|
| Cuerpo | Body |
| Mapa Corporal | Body Map |
| Músculos | Muscles |
| Movimientos | Movements |
| Deltoides | Deltoid |
| Origen | Origin |

Mejor opción a futuro: agregar `testID` props a las tabs y cards clave,
y matchear por id (`id: 'CuerpoTab'`) en vez de text. Eso evita el
acople con el idioma de la UI.

## CI / GitHub Actions

Pendiente. Maestro tiene plugin oficial:
<https://maestro.mobile.dev/cli/ci-cd-overview> — agregaría un job que
levanta un emulator Android headless y corre el smoke. Tiempo
estimado: ~10 min por run, sólo en PRs a main.

## Roadmap

- [ ] Primera corrida local (Android emulator). Pegar output exitoso en
      `agent_docs/followups/pending.md` Sprint A2 #7.
- [ ] Agregar `testID` a las cards de músculos/movimientos para
      desacoplar del idioma.
- [ ] Extender el flow con: tap en una cadena biomecánica (CadenasTab,
      premium), verificar paywall si no premium.
- [ ] Workflow GitHub Actions.
