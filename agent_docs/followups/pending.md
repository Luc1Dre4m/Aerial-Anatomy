# Pending Follow-ups

Deuda tecnica conocida que no amerita bloquear el trabajo en curso pero debe cerrarse pronto.

- [x] **Atribucion CC BY-SA 3.0** de Wikimedia visible en `AboutScreen`. Card con fuente (Wikimedia Commons), link a licencia CC BY-SA 3.0, nota de modificaciones. Cubre tanto el body map 2D como el viewer 3D.
- [x] **Refactor del unlock de premium**: pasar de hardcoded en `useAppStore` a flag `EXPO_PUBLIC_DEV_PREMIUM`. Cerrado en commit `fix(store): gate premium unlock behind EXPO_PUBLIC_DEV_PREMIUM flag`.
- [ ] **Calibracion de zonas del BodyMap + alignment de muscle paths**: las 14 region zones y 33 muscle zones son aproximaciones iniciales. Ademas, los Bezier paths de `bodyPaths.ts` (viewBox 300x460) pueden no alinear perfectamente con los PNGs (ratio diferente). Calibrar visualmente con `showInteractionZones` + screenshots. Commits con prefijo `bodymap(calib):`.
- [ ] **Glow del musculo seleccionado en la escena 3D**: hoy solo el tooltip 2D da feedback al tocar en `Anatomy3DScene`. Evaluar una mesh overlay semitransparente o un shader que resalte el area UV del musculo picked.
- [ ] **Calibracion del picking 3D**: verificar que las zonas `MUSCLE_ZONES` (viewBox 300x420) se mapean correctamente a los UV del plane rotado. Probar tocando cada musculo en la vista frontal y posterior.
- [x] **Atribucion CC BY-SA 3.0 de los PNGs tambien en el viewer 3D**: cubierto por la card general de atribucion en AboutScreen.
- [ ] **Decidir si los PNGs anatomicos van a Git LFS**: `muscle_front.png` (~929KB) y `muscle_back.png` (~862KB) estan committeados al repo (~1.8MB total). El CLAUDE.md indica proponer Git LFS o CDN para binarios >500KB. Opciones: (a) migrar ambos a LFS, (b) servirlos desde un CDN con fallback local, (c) aceptar el tamaño si el repo sigue chico.
