# Dead Code

Archivos sin callers activos tras refactors recientes. Antes de eliminar: `grep` exhaustivo confirmando que no hay imports y que ningun test/storybook los referencia.

## ~~Huerfanos del refactor de body map realista~~ — RESUELTO

Los archivos `bodyPaths.ts`, `BodyDefs.tsx` y `MuscleLayer.tsx` fueron reintegrados en `AnatomicalBody.tsx` en commit `be7f64e` (bodymap(render): integrate muscle paths and computational art style). Ya NO son orphaned.

## ~~Huerfanos del refactor de 3D viewer (commit `cebb190`)~~ — RESUELTO

`src/services/biodigital.ts`, `src/data/biodigitalMapping.ts` y `EXPO_PUBLIC_BIODIGITAL_API_KEY` en `.env.example` fueron eliminados. Grep previo confirmo 0 callers externos.
