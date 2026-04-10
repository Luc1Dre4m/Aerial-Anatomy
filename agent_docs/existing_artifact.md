# Artefacto Existente - Analisis y Base

## URL del Artefacto Original
https://claude.ai/public/artifacts/ee373cb2-ce29-4aaa-aefc-735f4840a434

## Tecnologia
- React (JSX) como artefacto de Claude
- Componente unico auto-contenido
- SVG inline para modelo corporal
- Estado con React hooks (useState, etc.)
- Sin dependencias externas (solo React base)

## Lo que YA existe (conservar y expandir):

### Tab 1: MAPA CORPORAL
- Modelo SVG del cuerpo humano estilizado (geometrico/minimalista)
- Toggle: VISTA FRONTAL / VISTA POSTERIOR
- Zonas del cuerpo son clicables
- Al tocar una zona: panel lateral muestra informacion del musculo
- Texto: "Toca una zona del cuerpo para ver el musculo"

### Tab 2: MUSCULOS
- Barra de busqueda: "Buscar musculo..."
- Filtros por region: TODOS, HOMBROS, ESPALDA, CORE, BRAZOS, MUNECAS Y MANOS, CADERA, RODILLAS, TOBILLOS Y PIES, CUELLO
- Contador de resultados: "33 resultados"
- Lista de musculos con formato:
  ```
  ● Deltoides / Deltoid
  Musculus deltoideus

  ● Manguito rotador / Rotator Cuff
  Supraspinatus / Infraspinatus / Teres minor / Subscapularis
  ```
- Circulos de color por region (rojo para hombros, azul para espalda, etc.)

### Tab 3: MOVIMIENTOS
- Grid de 2 columnas con cards
- Cada card tiene:
  - Stick figure SVG en la posicion del movimiento (lineas blancas sobre fondo oscuro)
  - Barra horizontal representando el aparato (aro, trapecio)
  - Nombre del movimiento en espanol
  - Tags de musculos principales (maximo 2 visibles + "+3" para el resto)
- Al hacer click en una card: vista de detalle con:
  - Boton "<- Volver"
  - Nombre completo del movimiento
  - Stick figure mas grande con anotaciones (flechas indicando "deprimir escapulas")
  - Seccion "MUSCULOS INVOLUCRADOS" con tags: Manguito rotador, Trapecio inferior, Serrato anterior, Dorsal ancho, Flexores de dedos
  - Parrafo descriptivo de la tecnica
  - Nota tecnica con icono de bombilla: "Practicar la depresion escapular en el suelo antes de colgar. Hombros subidos = lesion."

### Movimientos incluidos en el artefacto:
1. Colgada de manos / Suspension pasiva
2. Subida en lira
3. Inversion controlada
4. Split frontal en lira
5. Arabesque aereo
6. Body position (posicion de L)

### Elementos UI del artefacto:
- Header: "HERRAMIENTA DE ESTUDIO" (label) + "Anatomia para Artes Aereas" (titulo en italica serif) + "Rubi Lueiza Fuentes" (autora)
- Toggle de idioma: ES | EN (esquina superior derecha)
- Tabs de navegacion con indicador dorado bajo el tab activo
- Tema: fondo oscuro (#1A1A2E aprox), acentos dorados (#D4A843 aprox)
- Tipografia: serif italica para titulo principal, monoespaciada/sans-serif para contenido
- Footer: "© Rubi Lueiza Fuentes - Instructorado de Artes Aereas Circenses"
- Cards con bordes sutiles y fondo ligeramente mas claro que el bg

## Brechas a cerrar para app movil:

1. **Modelo corporal**: Evolucionar de geometrico basico a SVG anatomico con regiones musculares definidas por path (no rectangulos).
2. **De 6 a 50 movimientos**: Expandir el catalogo cubriendo todas las disciplinas.
3. **Roles musculares**: Los tags actuales no indican si el musculo es agonista/sinergista/etc. Agregar codigo de color.
4. **Cadenas biomecanicas**: No existen en el artefacto. Agregar como Tab/seccion nueva.
5. **Animacion de secuencia**: Los musculos se muestran estaticos. Agregar animacion de orden de activacion.
6. **Navegacion**: De 3 tabs a 5 tabs (agregar Cadenas y Estudiar).
7. **Offline**: El artefacto es web. La app necesita DB local.
8. **Sistema de usuarios**: No existe. Agregar auth, favoritos, progreso.
9. **Paywall**: No existe. Implementar con RevenueCat.
10. **Stick figures**: Mejorar calidad y agregar variantes por disciplina.

## Estilo de stick figures a conservar:
- Lineas blancas/doradas sobre fondo oscuro
- Estilo minimalista geometrico
- Aparato visible (aro como circulo, trapecio como barra horizontal)
- Flechas de anotacion para cues de activacion
- Proporcion humana reconocible pero estilizada
