# Dead Code

Archivos sin callers activos tras refactors recientes. Antes de eliminar: `grep` exhaustivo confirmando que no hay imports y que ningun test/storybook los referencia.

## ~~Huerfanos del refactor de body map realista~~ — RESUELTO

Los archivos `bodyPaths.ts`, `BodyDefs.tsx` y `MuscleLayer.tsx` fueron reintegrados en `AnatomicalBody.tsx` en commit `be7f64e` (bodymap(render): integrate muscle paths and computational art style). Ya NO son orphaned.

## Huerfanos del refactor de 3D viewer (commit `cebb190`)

Tras reemplazar el placeholder WebView de BioDigital con una escena three.js real (`Anatomy3DScene`), el servicio wrapper y su env var quedaron sin callers.

- [ ] `src/services/biodigital.ts` — wrapper del widget de BioDigital (URLs, injected JS, demo HTML). Ya no se importa desde `Anatomy3DViewer`. Verificar con grep y eliminar.
- [ ] `EXPO_PUBLIC_BIODIGITAL_API_KEY` en `.env.example` — limpiar la entrada una vez eliminado el servicio.

### Procedimiento

1. `grep -r "biodigital\|BioDigital\|BIODIGITAL" src/` — confirmar 0 matches fuera del propio archivo.
2. Eliminar en un commit separado con mensaje `chore(cleanup): remove biodigital service after 3D viewer rewrite`.
3. Correr `tsc --noEmit` post-eliminacion.
