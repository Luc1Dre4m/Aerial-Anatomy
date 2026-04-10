# Base de Datos de Movimientos - Aerial Anatomy

## Estructura

Los movimientos estan organizados por DISCIPLINA > NIVEL > CATEGORIA.
Cada movimiento sigue el schema `Movement` de `data_model.md`.

---

## MOVIMIENTOS FUNDAMENTALS (Todas las disciplinas)

Estos son pre-requisitos universales antes de cualquier disciplina especifica.

### 1. Colgada de manos / Suspension pasiva
- **EN**: Dead Hang / Passive Suspension
- **Disciplinas**: tela, aro_lira, trapecio_fijo, cuerda_lisa, straps
- **Nivel**: fundamentals
- **Categoria**: suspension
- **Agonistas**: Flexores de dedos, Dorsal ancho
- **Sinergistas**: Biceps, Braquial
- **Estabilizadores**: Manguito rotador, Trapecio inferior, Serrato anterior
- **Antagonistas**: Pectoral, Triceps
- **Cadena principal**: Suspension Aerea
- **Nota seguridad**: "La suspension correcta NO es colgar relajado. Requiere depresion escapular activa, leve activacion del core y munecas neutras. Hombros subidos = lesion."
- **Cue**: "Hombros lejos de orejas. Escapulas en bolsillos traseros."
- **Orden activacion**: Dedos(1) > Muneca(2) > Manguito(3) > Trapecio inferior(4) > Dorsal(5) > Core(6)

### 2. Depresion escapular activa
- **EN**: Active Scapular Depression
- **Disciplinas**: todas
- **Nivel**: fundamentals
- **Categoria**: fuerza
- **Agonistas**: Trapecio inferior, Serrato anterior
- **Sinergistas**: Dorsal ancho
- **Estabilizadores**: Manguito rotador, Core
- **Nota seguridad**: "Este es EL movimiento mas importante en aereos. Si no puedes deprimir escapulas, NO estas listo para figuras mas avanzadas."
- **Cue**: "Sin flexionar codos, empuja los hombros hacia abajo. El torso sube ligeramente."

### 3. Activacion de core en suspension
- **EN**: Core Engagement in Hang
- **Disciplinas**: todas
- **Nivel**: fundamentals
- **Categoria**: fuerza
- **Agonistas**: Transverso, Recto abdominal
- **Sinergistas**: Oblicuos, Multifidos
- **Estabilizadores**: Iliopsoas, Diafragma
- **Nota seguridad**: "Core activo ANTES de cualquier movimiento. El core previene hiperextension lumbar durante suspensiones."
- **Cue**: "Ombligo a la columna. Costillas hacia abajo. Respira normalmente."

---

## TELA AEREA (Aerial Silks)

### Nivel Basico
4. **Subida basica en tela** (Basic Climb) - subida
5. **Foot lock** (Foot Lock) - suspension
6. **Hip key** (Hip Key) - inversion
7. **Envoltura basica de cintura** (Basic Waist Wrap) - suspension

### Nivel Intermedio
8. **Subida rusa** (Russian Climb) - subida
9. **Inversion controlada en tela** (Controlled Inversion) - inversion
10. **Star / Estrella** (Star) - flexibilidad
11. **Splits en tela** (Silk Splits) - flexibilidad
12. **Cross-back straddle** (Cross-back Straddle) - inversion

### Nivel Avanzado
13. **Caida de angel** (Angel Drop) - caida
14. **Belay / S-wrap drop** (Belay Drop) - caida
15. **Meathook en tela** (Silk Meathook) - fuerza

---

## ARO / LIRA (Aerial Hoop / Lyra)

### Nivel Basico
16. **Subida en lira** (Hoop Mount) - subida
17. **Sentada basica** (Basic Sit) - suspension
18. **Man in the moon** (Man in the Moon) - suspension

### Nivel Intermedio
19. **Split frontal en lira** (Front Split on Hoop) - flexibilidad
20. **Arabesque aereo** (Aerial Arabesque) - flexibilidad
21. **Body position (L)** (L-Position) - fuerza
22. **Gazelle** (Gazelle) - flexibilidad
23. **Bird's nest** (Bird's Nest) - inversion

### Nivel Avanzado
24. **Plancha en lira** (Hoop Planche) - fuerza
25. **One-arm hang en lira** (One-arm Hoop Hang) - fuerza
26. **Spin combinations** (Spin Combos) - giro

---

## TRAPECIO FIJO (Static Trapeze)

### Nivel Basico
27. **Colgada de trapecio** (Trapeze Hang) - suspension
28. **Sentada en barra** (Bar Sit) - suspension
29. **Rodillas en barra** (Knee Hang) - inversion

### Nivel Intermedio
30. **Subida de hombro** (Shoulder Mount) - subida
31. **Meathook** (Meathook) - fuerza
32. **Amazon / Amazona** (Amazon) - flexibilidad
33. **Mermaid / Sirena** (Mermaid) - flexibilidad

### Nivel Avanzado
34. **Plancha de trapecio** (Trapeze Planche) - fuerza
35. **One-arm balance** (One-arm Balance) - fuerza
36. **Ankle hang** (Ankle Hang) - inversion

---

## CUERDA LISA (Aerial Rope)

### Nivel Basico
37. **Subida basica en cuerda** (Basic Rope Climb) - subida
38. **Foot lock en cuerda** (Rope Foot Lock) - suspension
39. **S-wrap** (S-wrap) - suspension

### Nivel Intermedio
40. **Subida invertida** (Inverted Climb) - subida
41. **Crucifijo** (Crucifix) - fuerza
42. **Splits en cuerda** (Rope Splits) - flexibilidad

---

## STRAPS (Aerial Straps)

### Nivel Basico
43. **Hang en straps** (Straps Hang) - suspension
44. **Skin the cat** (Skin the Cat) - inversion

### Nivel Intermedio
45. **Iron cross basico** (Basic Iron Cross) - fuerza
46. **Front lever** (Front Lever) - fuerza
47. **Back lever** (Back Lever) - fuerza

### Nivel Avanzado
48. **Full iron cross** (Iron Cross) - fuerza
49. **Maltese** (Maltese) - fuerza
50. **Victorian** (Victorian) - fuerza

---

## Notas de Implementacion

- En el MVP (Fase 1), implementar los 20 primeros movimientos.
- Fase 2: completar los 50 movimientos.
- Fase 3: agregar variantes de cada movimiento por disciplina.
- Cada movimiento necesita un stick figure SVG. Usar el estilo del artefacto existente: lineas blancas/doradas sobre fondo oscuro, estilo minimalista.
- Los drops (caidas) requieren disclaimer adicional: "Las caidas controladas son movimientos de nivel avanzado que REQUIEREN supervision directa de un instructor certificado. NUNCA intentar sin spotter."
