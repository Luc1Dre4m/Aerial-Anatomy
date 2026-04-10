export type MuscleRegion =
  | 'hombros'
  | 'espalda'
  | 'core'
  | 'brazos'
  | 'munecas_manos'
  | 'cadera'
  | 'rodillas'
  | 'tobillos_pies'
  | 'cuello';

export type MuscleRole = 'agonista' | 'sinergista' | 'estabilizador' | 'antagonista';

export type MovementLevel = 'fundamentals' | 'basico' | 'intermedio' | 'avanzado' | 'elite';

export type MovementCategory =
  | 'suspension'
  | 'subida'
  | 'inversion'
  | 'flexibilidad'
  | 'fuerza'
  | 'transicion'
  | 'caida'
  | 'giro';

export type ChainType = 'anterior' | 'posterior' | 'lateral' | 'espiral' | 'suspension';

export interface Muscle {
  id: string;
  name_es: string;
  name_en: string;
  name_latin: string;
  region: MuscleRegion;
  sub_region?: string;
  depth: 'superficial' | 'profundo';
  svg_path_front?: string;
  svg_path_back?: string;
  description_es: string;
  description_en: string;
  primary_function_es: string;
  primary_function_en: string;
  origin_es: string;
  origin_en: string;
  insertion_es: string;
  insertion_en: string;
  innervation: string;
  common_injuries_es: string[];
  common_injuries_en: string[];
  activation_cues_es: string[];
  activation_cues_en: string[];
  image_url?: string;
}

export interface Discipline {
  id: string;
  name_es: string;
  name_en: string;
  description_es: string;
  description_en: string;
  apparatus_es: string;
  apparatus_en: string;
  icon: string;
  color: string;
  difficulty_range: [number, number];
}

export interface PrerequisiteMuscle {
  muscle_id: string;
  minimum_strength: 1 | 2 | 3 | 4 | 5;
  description_es: string;
  description_en: string;
}

export interface Variation {
  name_es: string;
  name_en: string;
  discipline: string;
  difference_es: string;
  difference_en: string;
}

export interface ExecutionPhase {
  phase_number: number;
  name_es: string;
  name_en: string;
  description_es: string;
  description_en: string;
  duration_seconds?: number;
  breathing: 'inhale' | 'exhale' | 'hold' | 'natural';
  active_muscles: { muscle_id: string; intensity: 1 | 2 | 3 | 4 | 5 }[];
  stick_figure_key: string;
  cues_es: string[];
  cues_en: string[];
}

export interface MovementMuscle {
  muscle_id: string;
  role: MuscleRole;
  intensity: 1 | 2 | 3 | 4 | 5;
  activation_order: number;
  phase?: 'concentrica' | 'excentrica' | 'isometrica';
  note_es?: string;
  note_en?: string;
}

export interface Movement {
  id: string;
  name_es: string;
  name_en: string;
  disciplines: string[];
  level: MovementLevel;
  category: MovementCategory;
  stick_figure_svg: string;
  description_es: string;
  description_en: string;
  safety_note_es: string;
  safety_note_en: string;
  safety_icon: 'warning' | 'info' | 'critical';
  prerequisite_movements: string[];
  prerequisite_muscles: PrerequisiteMuscle[];
  variations: Variation[];
  muscles: MovementMuscle[];
  execution_phases?: ExecutionPhase[];
  primary_chain: string;
  related_chains: string[];
}

export interface ChainMuscle {
  muscle_id: string;
  position_in_chain: number;
  connection_type: 'origen-insercion' | 'fascia' | 'funcional';
  force_direction: string;
}

export interface BiomechanicalChain {
  id: string;
  name_es: string;
  name_en: string;
  type: ChainType;
  description_es: string;
  description_en: string;
  muscles_ordered: ChainMuscle[];
  svg_flow_path: string;
  color: string;
  relevance_es: string;
  relevance_en: string;
  related_movements: string[];
}

export interface StudySession {
  date: string;
  muscles_studied: string[];
  movements_studied: string[];
  quiz_score?: number;
  duration_minutes: number;
}

export interface TrainingEntry {
  date: string;
  movements_practiced: string[];
  notes: string;
  muscles_worked: string[];
  fatigue_zones: string[];
  compensation_suggestions: string[];
}

export interface MotionSession {
  id: string;
  date: string;
  movementId: string;
  overallScore: number;
  phaseScores: number[];
  duration: number;
}

export interface UserProfile {
  id: string;
  display_name: string;
  role: 'student' | 'instructor' | 'health_pro';
  disciplines: string[];
  level: MovementLevel;
  subscription: 'free' | 'premium' | 'instructor';
  favorite_muscles: string[];
  favorite_movements: string[];
  study_history: StudySession[];
  training_log: TrainingEntry[];
  language: 'es' | 'en';
  created_at: string;
}
