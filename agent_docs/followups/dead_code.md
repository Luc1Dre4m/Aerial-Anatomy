# Dead Code

Archivos sin callers activos tras refactors recientes. Antes de eliminar: `grep` exhaustivo confirmando que no hay imports y que ningun test/storybook los referencia.

## ~~Huerfanos del refactor de body map realista~~ — RESUELTO

Los archivos `bodyPaths.ts`, `BodyDefs.tsx` y `MuscleLayer.tsx` fueron reintegrados en `AnatomicalBody.tsx` en commit `be7f64e` (bodymap(render): integrate muscle paths and computational art style). Ya NO son orphaned.

## ~~Huerfanos del refactor de 3D viewer (commit `cebb190`)~~ — RESUELTO

`src/services/biodigital.ts`, `src/data/biodigitalMapping.ts` y `EXPO_PUBLIC_BIODIGITAL_API_KEY` en `.env.example` fueron eliminados. Grep previo confirmo 0 callers externos.

## ~~Huerfanos tras simplificar CuerpoScreen a solo-3D~~ — RESUELTO (Sprint A2 #7, junta 2026-05-15)

Eliminados tras grep exhaustivo sin callers fuera de los mismos archivos:

- `src/components/body/ViewModeToggle.tsx` ✓ borrado
- `src/components/body/MuscleTooltip.tsx` ✓ borrado
- `src/components/body/ZoomableBody.tsx` ✓ borrado
- `src/components/body/BodyMap.tsx` ✓ borrado (no lo usaba ChainDetailScreen — usa `AnatomicalBody` directamente vía `ChainOverlay`)
- `getMusclesByRegion` en `src/data/muscles.ts` ✓ borrado (función helper sin callers)

`REGION_LABELS` se mantiene — usado por 9+ archivos (MusculosScreen, MuscleDetailScreen, MuscleOfTheDay, FlashCard, QuizCard, SpacedFlashCard, BodyQuiz, MuscleCard, InjuryPrevention).

`AnatomicalBody.tsx`, `MuscleLayer.tsx`, `BodyDefs.tsx` se mantienen — usados por `BodyQuiz` (study) y `ChainOverlay` (chains).
