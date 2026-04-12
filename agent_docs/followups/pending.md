# Pending Follow-ups

Deuda tecnica conocida que no amerita bloquear el trabajo en curso pero debe cerrarse pronto.

- [ ] **Atribucion CC BY-SA 3.0** de Wikimedia para `assets/anatomy/muscle_front.png` y `muscle_back.png` visible en `AboutScreen`. Regla 9 del CLAUDE.md. Incluir: fuente (Wikimedia Commons), autores originales, link a la licencia, nota de modificaciones (recolor morado + fondo oscuro).
- [x] **Refactor del unlock de premium**: pasar de hardcoded en `useAppStore` a flag `EXPO_PUBLIC_DEV_PREMIUM`. Cerrado en commit `fix(store): gate premium unlock behind EXPO_PUBLIC_DEV_PREMIUM flag`.
- [ ] **Calibracion fina de las 14 zonas del BodyMap**: coordenadas de `BODY_ZONES` en `src/components/body/bodyConstants.ts` son aproximaciones iniciales. Seguir el workflow de calibracion del CLAUDE.md (activar `showInteractionZones` + `regionColorOverrides`, screenshot, ajustar, commit con prefijo `bodymap(calib):`).
- [ ] **Glow del musculo seleccionado en la escena 3D**: hoy solo el tooltip 2D da feedback al tocar en `Anatomy3DScene`. Evaluar una mesh overlay semitransparente o un shader que resalte el area UV del musculo picked.
- [ ] **Calibracion del picking 3D**: verificar que las zonas `MUSCLE_ZONES` (viewBox 300x420) se mapean correctamente a los UV del plane rotado. Probar tocando cada musculo en la vista frontal y posterior.
- [ ] **Atribucion CC BY-SA 3.0 de los PNGs tambien en el viewer 3D**: el texto de `AboutScreen` debe cubrir el uso en `Anatomy3DScene`, no solo el 2D.
- [ ] **Decidir si los PNGs anatomicos van a Git LFS**: `muscle_front.png` (~929KB) y `muscle_back.png` (~862KB) estan committeados al repo (~1.8MB total). El CLAUDE.md indica proponer Git LFS o CDN para binarios >500KB. Opciones: (a) migrar ambos a LFS, (b) servirlos desde un CDN con fallback local, (c) aceptar el tamaño si el repo sigue chico.
