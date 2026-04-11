# Dead Code

Archivos sin callers activos tras refactors recientes. Antes de eliminar: `grep` exhaustivo confirmando que no hay imports y que ningun test/storybook los referencia.

## Huerfanos del refactor de body map realista (commit `62f4f55`)

Tras migrar `AnatomicalBody` a `<Image>` + overlay SVG (commit `62f4f55` — "Realistic anatomy imagery + yoga-silhouette figures + premium unlocked"), estos archivos quedaron sin uso. Ultimo commit que los tocaba: `d7be0fb` (implementacion inicial).

- [ ] `src/data/bodyPaths.ts` — paths SVG sinteticos del cuerpo (silhouette front/back + musculos deep/surface). Reemplazado por `assets/anatomy/muscle_front.png` + `muscle_back.png`. Verificar con grep y eliminar.
- [ ] `src/components/body/BodyDefs.tsx` — gradientes/defs SVG compartidos para los paths. Ya no se importa. Verificar con grep y eliminar.
- [ ] `src/components/body/MuscleLayer.tsx` — componente que renderizaba un path de musculo individual con estados highlighted/dimmed. Reemplazado por las `<Ellipse>` tappeables con overlay de color. Verificar con grep y eliminar.

### Procedimiento

1. `grep -r "bodyPaths\|BodyDefs\|MuscleLayer\b" src/` — confirmar 0 matches fuera de los propios archivos.
2. Eliminar en un commit separado con mensaje `chore(cleanup): remove synthetic body path components`.
3. Correr `tsc --noEmit` post-eliminacion.
