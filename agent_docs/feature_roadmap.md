# Feature Roadmap - Aerial Anatomy

## Fase 1: MVP (Meses 1-3)
Conversion del artefacto a app movil funcional.

### P0 - Critico (sin esto no se lanza)
- [ ] Setup React Native + Expo + navegacion (5 tabs)
- [ ] Mapa corporal SVG interactivo (frontal/posterior) con zonas musculares clicables
- [ ] Catalogo de 33+ musculos migrados del artefacto con info completa
- [ ] 20+ movimientos cubriendo tela, aro, trapecio, cuerda (niveles fundamentals a intermedio)
- [ ] Detalle de movimiento con stick figure, musculos con ROL (color), nota de seguridad
- [ ] Codigo de color por rol muscular (rojo/naranja/azul/gris) en toda la app
- [ ] Soporte bilingue ES/EN con i18next
- [ ] Modo offline (WatermelonDB con data pre-cargada)
- [ ] Tema oscuro con dorados (replicar estetica del artefacto)

### P1 - Alto (necesario para lanzamiento solido)
- [ ] Busqueda y filtros (por musculo, movimiento, disciplina, region, nivel)
- [ ] Pantalla de detalle de musculo (desde mapa corporal o desde catalogo)
- [ ] Navegacion bidireccional: musculo <> movimiento
- [ ] Onboarding (seleccion de disciplina, nivel, idioma)
- [ ] Pantalla About con creditos de Rubi Lueiza Fuentes
- [ ] Disclaimer legal y de salud

---

## Fase 2: Diferenciacion (Meses 4-6)
Lo que hace a esta app UNICA en el mundo.

### P0
- [ ] Cadenas biomecanicas: las 5 cadenas con visualizacion de flujo animado sobre el modelo corporal
- [ ] Cadena de Suspension Aerea: presentacion estrella como feature unica

### P1
- [ ] Animacion de secuencia de activacion muscular (musculos se encienden en orden)
- [ ] Modo Pre-Entrenamiento: selecciona figuras > genera calentamiento especifico
- [ ] 50+ movimientos (cobertura completa de todas las disciplinas incluyendo straps)
- [ ] Sistema de estudio: flashcards anatomicas con repeticion espaciada
- [ ] Quiz de identificacion de musculos (tocar el musculo correcto en el SVG)
- [ ] Musculo del dia (push notification con mini-leccion)

### P2
- [ ] Evaluador de riesgo: analiza movimientos practicados > muestra sobresolicitacion
- [ ] Notas personalizadas del instructor por movimiento
- [ ] Favoritos y colecciones personalizadas
- [ ] Paywall con RevenueCat (free/premium/instructor)

---

## Fase 3: Escalamiento (Meses 7-12)
Crecimiento y features avanzadas.

### P1
- [ ] Seccion de prevencion de lesiones con ejercicios por zona
- [ ] Progresiones de figuras: arbol visual de que dominar antes de cada avanzada
- [ ] Diario de entrenamiento inteligente con analisis automatico
- [ ] Red de conocimiento visual (grafo interactivo musculos-movimientos-cadenas)
- [ ] Audio-guias de activacion (10-15s, manos libres)

### P2
- [ ] Comunidad: instructores comparten variantes y tips
- [ ] Modo Instructor en Vivo (proyeccion via AirPlay/Chromecast)
- [ ] Evaluador de preparacion ("quiero hacer meathook, estoy listo?")
- [ ] Generador de PDF de movimientos para instructores

### P3 - Futuro
- [ ] Modelo 3D rotable (Three.js o similar)
- [ ] Realidad Aumentada (proyectar musculos sobre cuerpo real)
- [ ] Integracion con wearables (HR, movimiento)
- [ ] API para escuelas de circo (bulk licenses)

---

## Metricas de exito por fase

| Metrica | Fase 1 (mes 3) | Fase 2 (mes 6) | Fase 3 (mes 12) |
|---------|----------------|-----------------|-------------------|
| Descargas | 1,000 | 3,000 | 10,000 |
| MAU | 400 | 1,500 | 4,000 |
| Conversion free>premium | 8% | 10% | 12% |
| Retencion D30 | 25% | 30% | 35% |
| Rating | 4.5 | 4.6 | 4.7 |
| MRR | $80 | $400 | $1,200 |
