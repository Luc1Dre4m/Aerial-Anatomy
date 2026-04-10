# Modelo de Datos - Aerial Anatomy

## Entidades y Relaciones

```
Disciplina 1───N Movimiento N───M Musculo
                    │                │
                    │                │
                    N                N
              ActivacionMuscular  CadenaBiomecanicaMusculo
                    │                │
                    1                1
                    │                │
              (rol + orden)    CadenaBiomecanica
```

## Schemas TypeScript

```typescript
// ── MUSCULO ──
interface Muscle {
  id: string;                          // "m_dorsal_ancho"
  name_es: string;                     // "Dorsal ancho"
  name_en: string;                     // "Latissimus Dorsi"
  name_latin: string;                  // "Musculus latissimus dorsi"
  region: MuscleRegion;                // "espalda"
  sub_region?: string;                 // "espalda_media"
  depth: 'superficial' | 'profundo';
  svg_path_front?: string;             // Path SVG para vista frontal
  svg_path_back?: string;              // Path SVG para vista posterior
  description_es: string;              // Descripcion funcional
  description_en: string;
  primary_function_es: string;         // "Extension, aduccion y rotacion interna del hombro"
  primary_function_en: string;
  origin_es: string;                   // Origen anatomico
  origin_en: string;
  insertion_es: string;                // Insercion anatomica
  insertion_en: string;
  innervation: string;                 // "Nervio toracodorsal (C6-C8)"
  common_injuries_es: string[];        // Lesiones comunes en aereos
  common_injuries_en: string[];
  activation_cues_es: string[];        // "Imagina meter las escapulas en los bolsillos traseros"
  activation_cues_en: string[];
  image_url?: string;
}

type MuscleRegion =
  | 'hombros'     // Deltoides, manguito rotador
  | 'espalda'     // Dorsal, trapecio, romboides, erector
  | 'core'        // Recto abdominal, transverso, oblicuos
  | 'brazos'      // Biceps, triceps, braquial
  | 'munecas_manos' // Flexores/extensores de dedos y muneca
  | 'cadera'      // Gluteos, iliopsoas, piriforme
  | 'rodillas'    // Cuadriceps, isquiotibiales
  | 'tobillos_pies' // Gemelos, tibial, peroneos
  | 'cuello';     // Esternocleidomastoideo, escalenos

// ── DISCIPLINA ──
interface Discipline {
  id: string;                          // "tela"
  name_es: string;                     // "Tela Aerea"
  name_en: string;                     // "Aerial Silks"
  description_es: string;
  description_en: string;
  apparatus_es: string;                // "Tela de licra o seda de 8-10m"
  apparatus_en: string;
  icon: string;                        // Nombre del icono o SVG path
  color: string;                       // Color de acento para la disciplina
  difficulty_range: [number, number];  // [1, 5] min-max de sus movimientos
}

// Disciplinas soportadas:
// tela, aro_lira, trapecio_fijo, cuerda_lisa, straps, trapecio_volante

// ── MOVIMIENTO ──
interface Movement {
  id: string;                          // "mv_colgada_manos"
  name_es: string;                     // "Colgada de manos / Suspension pasiva"
  name_en: string;                     // "Dead Hang / Passive Suspension"
  disciplines: string[];               // ["tela", "aro_lira", "trapecio_fijo", "cuerda_lisa"]
  level: MovementLevel;
  category: MovementCategory;
  stick_figure_svg: string;            // SVG del stick figure en la posicion
  description_es: string;              // Descripcion tecnica completa
  description_en: string;
  safety_note_es: string;              // "La suspension correcta NO es colgar relajado..."
  safety_note_en: string;
  safety_icon: 'warning' | 'info' | 'critical';
  prerequisite_movements: string[];    // IDs de movimientos previos necesarios
  prerequisite_muscles: PrerequisiteMuscle[];
  variations: Variation[];
  muscles: MovementMuscle[];           // Musculos con rol y orden
  primary_chain: string;               // ID de la cadena biomecanica principal
  related_chains: string[];            // IDs de cadenas secundarias
}

type MovementLevel = 'fundamentals' | 'basico' | 'intermedio' | 'avanzado' | 'elite';
type MovementCategory =
  | 'suspension'     // Colgadas, hangs
  | 'subida'         // Climbs
  | 'inversion'      // Inversiones
  | 'flexibilidad'   // Splits, bridges en el aire
  | 'fuerza'         // Planchas, levers
  | 'transicion'     // Cambios entre figuras
  | 'caida'          // Drops (controlados)
  | 'giro';          // Spins

interface PrerequisiteMuscle {
  muscle_id: string;
  minimum_strength: 1 | 2 | 3 | 4 | 5;  // 1=basico, 5=elite
  description_es: string;                  // "Capacidad de deprimir escapulas activamente"
  description_en: string;
}

interface Variation {
  name_es: string;
  name_en: string;
  discipline: string;
  difference_es: string;   // "En aro, el agarre es lateral y activa mas oblicuos"
  difference_en: string;
}

// ── ACTIVACION MUSCULAR ──
interface MovementMuscle {
  muscle_id: string;
  role: MuscleRole;
  intensity: 1 | 2 | 3 | 4 | 5;     // 1=leve, 5=maxima
  activation_order: number;            // Secuencia: 1=primero en activarse
  phase?: string;                      // "concentrica" | "excentrica" | "isometrica"
  note_es?: string;                    // "Mantener activacion durante toda la suspension"
  note_en?: string;
}

type MuscleRole = 'agonista' | 'sinergista' | 'estabilizador' | 'antagonista';

// Colores por rol (para UI):
// agonista     → #E74C3C (rojo)
// sinergista   → #F39C12 (naranja)
// estabilizador → #3498DB (azul)
// antagonista  → #95A5A6 (gris)

// ── CADENA BIOMECANICA ──
interface BiomechanicalChain {
  id: string;                          // "chain_suspension"
  name_es: string;                     // "Cadena de Suspension Aerea"
  name_en: string;                     // "Aerial Suspension Chain"
  type: ChainType;
  description_es: string;
  description_en: string;
  muscles_ordered: ChainMuscle[];      // Musculos en orden de la cadena
  svg_flow_path: string;               // SVG path de las flechas de flujo
  color: string;                       // Color de la cadena para visualizacion
  relevance_es: string;                // Por que importa en aereos
  relevance_en: string;
  related_movements: string[];         // IDs de movimientos que usan esta cadena
}

type ChainType =
  | 'anterior'    // Cadena frontal
  | 'posterior'   // Cadena dorsal
  | 'lateral'     // Cadena lateral
  | 'espiral'     // Cadena cruzada/oblicua
  | 'suspension'; // UNICA DE AEREOS: dedos → muneca → biceps → deltoides → trapecio → core

interface ChainMuscle {
  muscle_id: string;
  position_in_chain: number;           // 1 = inicio de la cadena
  connection_type: 'origen-insercion' | 'fascia' | 'funcional';
  force_direction: string;             // "traccion_inferior", "estabilizacion_lateral"
}

// ── USUARIO ──
interface UserProfile {
  id: string;
  display_name: string;
  role: 'student' | 'instructor' | 'health_pro';
  disciplines: string[];               // Disciplinas que practica
  level: MovementLevel;
  subscription: 'free' | 'premium' | 'instructor';
  favorite_muscles: string[];
  favorite_movements: string[];
  study_history: StudySession[];
  training_log: TrainingEntry[];
  language: 'es' | 'en';
  created_at: string;
}

interface StudySession {
  date: string;
  muscles_studied: string[];
  movements_studied: string[];
  quiz_score?: number;
  duration_minutes: number;
}

interface TrainingEntry {
  date: string;
  movements_practiced: string[];
  notes: string;
  muscles_worked: string[];          // Auto-calculado
  fatigue_zones: string[];           // Zonas mas solicitadas (auto)
  compensation_suggestions: string[]; // Sugerencias de compensacion (auto)
}
```

## Reglas de Integridad

1. Todo `muscle_id` en MovementMuscle debe existir en la tabla de Muscles.
2. Todo movimiento debe tener al menos 1 agonista y 1 nota de seguridad.
3. Las cadenas biomecanicas deben tener al menos 3 musculos ordenados.
4. Los prerequisite_movements deben ser de nivel igual o inferior al movimiento.
5. El activation_order en MovementMuscle debe ser secuencial sin saltos (1,2,3...).
6. Toda Variation debe referenciar una disciplina valida.
