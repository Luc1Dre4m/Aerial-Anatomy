# Design System - Aerial Anatomy

## Paleta de Colores

```typescript
export const colors = {
  // Backgrounds
  bg: {
    primary: '#1A1A2E',     // Fondo principal (oscuro profundo)
    secondary: '#2C2C44',   // Cards, elevaciones
    tertiary: '#3D3D5C',    // Hover states, inputs
    surface: '#16162A',     // Fondo de tabs, modales
  },

  // Acentos dorados (identidad de marca)
  gold: {
    primary: '#D4A843',     // Acento principal, titulos activos
    secondary: '#C49B3C',   // Acentos secundarios
    light: '#F5E6C4',       // Texto principal sobre fondo oscuro
    muted: '#8B7A4A',      // Texto deshabilitado dorado
    glow: '#D4A84330',     // Sombra/glow dorado (con alpha)
  },

  // Texto
  text: {
    primary: '#F5E6C4',     // Texto principal (dorado claro)
    secondary: '#B8A88A',   // Texto secundario
    muted: '#7A7A8E',      // Texto terciario/placeholder
    white: '#FFFFFF',       // Titulos sobre headers oscuros
  },

  // Roles musculares (CRITICO - no cambiar)
  muscle: {
    agonista: '#E74C3C',     // Rojo - motor principal
    sinergista: '#F39C12',   // Naranja - asistente
    estabilizador: '#3498DB', // Azul - estabilizador
    antagonista: '#95A5A6',  // Gris - antagonista
  },

  // Cadenas biomecanicas
  chain: {
    anterior: '#E74C3C',    // Rojo
    posterior: '#3498DB',    // Azul
    lateral: '#F39C12',     // Naranja
    espiral: '#9B59B6',     // Purpura
    suspension: '#D4A843',  // Dorado (signature)
  },

  // Disciplinas
  discipline: {
    tela: '#E74C3C',        // Rojo
    aro_lira: '#D4A843',    // Dorado
    trapecio: '#3498DB',    // Azul
    cuerda: '#2ECC71',      // Verde
    straps: '#9B59B6',      // Purpura
    volante: '#E67E22',     // Naranja
  },

  // Niveles
  level: {
    fundamentals: '#95A5A6', // Gris
    basico: '#2ECC71',       // Verde
    intermedio: '#F39C12',   // Naranja
    avanzado: '#E74C3C',     // Rojo
    elite: '#9B59B6',        // Purpura
  },

  // Seguridad
  safety: {
    warning: '#F39C12',
    critical: '#E74C3C',
    info: '#3498DB',
  },

  // Utilidades
  border: '#3D3D5C',
  divider: '#2C2C44',
  success: '#2ECC71',
  error: '#E74C3C',
};
```

## Tipografia

```typescript
export const typography = {
  // Titulos principales: Serif elegante
  heading: {
    fontFamily: 'Playfair Display', // Fallback: Georgia, serif
    h1: { fontSize: 28, lineHeight: 36, fontWeight: '700', letterSpacing: 0.5 },
    h2: { fontSize: 22, lineHeight: 28, fontWeight: '600' },
    h3: { fontSize: 18, lineHeight: 24, fontWeight: '600' },
  },

  // Cuerpo: Sans-serif limpio
  body: {
    fontFamily: 'System', // SF Pro (iOS) / Roboto (Android)
    large: { fontSize: 16, lineHeight: 24 },
    regular: { fontSize: 14, lineHeight: 20 },
    small: { fontSize: 12, lineHeight: 16 },
  },

  // Datos tecnicos/anatomicos: Monoespaciado
  mono: {
    fontFamily: 'JetBrains Mono', // Fallback: Courier, monospace
    regular: { fontSize: 13, lineHeight: 18 },
    small: { fontSize: 11, lineHeight: 14 },
  },

  // Labels y tags
  label: {
    fontFamily: 'System',
    regular: { fontSize: 11, lineHeight: 14, fontWeight: '600', letterSpacing: 1.5, textTransform: 'uppercase' },
  },
};
```

## Spacing

```typescript
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};
```

## Componentes UI

### MuscleTag
Tag que muestra el nombre del musculo con color segun su rol.
```
[●  Dorsal ancho]   ← circulo de color del rol + nombre
```
Props: `muscle_id`, `role`, `onPress`

### MovementCard
Card con stick figure + nombre + tags de musculos principales + nivel badge.
```
┌─────────────────────┐
│    [stick figure]    │
│                      │
│  Subida en lira      │
│  ● Dorsal  ● Biceps  │
│  [INTERMEDIO]        │
└─────────────────────┘
```
Props: `movement`, `onPress`

### BodyMap
SVG interactivo del cuerpo humano. Vista frontal/posterior.
Cada zona muscular es clicable y se ilumina con el color del rol.
Props: `view: 'front' | 'back'`, `highlightedMuscles: {id, role}[]`, `onMusclePress`

### ChainFlowView
Visualizacion de una cadena biomecanica con linea de flujo animada.
Muestra los musculos conectados con flechas y se animan secuencialmente.
Props: `chain`, `animated: boolean`, `onMusclePress`

### SafetyNote
Card destacada con icono de alerta y texto de seguridad.
Fondo: gold con alpha baja. Borde izquierdo dorado.
```
┌─────────────────────────────────────┐
│ ⚠  Nota tecnica                     │
│ Practicar la depresion escapular    │
│ en el suelo antes de colgar.        │
│ Hombros subidos = lesion.           │
└─────────────────────────────────────┘
```
Props: `type: 'warning' | 'critical' | 'info'`, `text_key` (i18n key)

### LevelBadge
Badge con color del nivel y texto.
Props: `level: MovementLevel`

### DisciplineChip
Chip con icono y color de la disciplina.
Props: `discipline: string`, `selected: boolean`, `onPress`

### ActivationSequence
Componente animado que muestra el orden de activacion muscular.
Timeline vertical con musculos que se "encienden" secuencialmente.
Props: `muscles: MovementMuscle[]`, `playing: boolean`, `speed`

## Principios de Diseno

1. **Oscuridad con destellos dorados**: El fondo oscuro evoca el backstage circense. Los detalles dorados evocan elegancia y precision.
2. **Interaccion tactil primero**: Todo lo que parece tocable debe ser tocable. Zonas de toque minimo 44x44pt.
3. **Informacion progresiva**: No abrumar. Mostrar resumen > tap para detalle > tap para profundidad.
4. **Anatomia es visual**: Preferir SVGs y animaciones sobre texto largo. La imagen del cuerpo es el centro de la experiencia.
5. **Seguridad es prominente**: Las notas de seguridad nunca son secundarias. Son las primeras cosas que el ojo debe captar.
