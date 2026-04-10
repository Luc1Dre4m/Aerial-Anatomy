import { MuscleRegion } from '../utils/types';

export interface PreventionExercise {
  id: string;
  type: 'warmup' | 'strengthening' | 'stretch';
  name_es: string;
  name_en: string;
  description_es: string;
  description_en: string;
  sets?: string;
  reps?: string;
  hold?: string;
}

export interface ZonePrevention {
  region: MuscleRegion;
  exercises: PreventionExercise[];
  frequency_es: string;
  frequency_en: string;
}

export const injuryPreventionData: ZonePrevention[] = [
  {
    region: 'hombros',
    frequency_es: '3-4 veces por semana, antes y despues de entrenar',
    frequency_en: '3-4 times per week, before and after training',
    exercises: [
      {
        id: 'ip_h1',
        type: 'warmup',
        name_es: 'Circulos de hombro progresivos',
        name_en: 'Progressive shoulder circles',
        description_es: 'Circulos pequenos a grandes, adelante y atras. Aumentar rango gradualmente.',
        description_en: 'Small to large circles, forward and backward. Gradually increase range.',
        sets: '2', reps: '10 cada direccion',
      },
      {
        id: 'ip_h2',
        type: 'warmup',
        name_es: 'Rotacion externa con banda',
        name_en: 'External rotation with band',
        description_es: 'Codo a 90 grados, rotar antebrazo hacia afuera contra resistencia de banda.',
        description_en: 'Elbow at 90 degrees, rotate forearm outward against band resistance.',
        sets: '3', reps: '12-15',
      },
      {
        id: 'ip_h3',
        type: 'strengthening',
        name_es: 'Face pulls',
        name_en: 'Face pulls',
        description_es: 'Con banda elastica, tirar hacia la cara manteniendo codos altos. Fortalecer manguito rotador y romboides.',
        description_en: 'With resistance band, pull towards face keeping elbows high. Strengthens rotator cuff and rhomboids.',
        sets: '3', reps: '15',
      },
      {
        id: 'ip_h4',
        type: 'strengthening',
        name_es: 'Retraccion escapular colgado',
        name_en: 'Hanging scapular retraction',
        description_es: 'Colgado pasivo, activar escapulas sin flexionar codos. Fundamental para hombros sanos en aereos.',
        description_en: 'Passive hang, activate scapulae without bending elbows. Fundamental for healthy shoulders in aerials.',
        sets: '3', reps: '8-10',
      },
      {
        id: 'ip_h5',
        type: 'stretch',
        name_es: 'Estiramiento de pectoral en pared',
        name_en: 'Wall pec stretch',
        description_es: 'Antebrazo contra pared, girar torso hacia el lado opuesto. Mantener respiracion profunda.',
        description_en: 'Forearm against wall, rotate torso to opposite side. Maintain deep breathing.',
        hold: '30-45 seg cada lado',
      },
    ],
  },
  {
    region: 'munecas_manos',
    frequency_es: 'Antes de cada sesion de aereos',
    frequency_en: 'Before every aerial session',
    exercises: [
      {
        id: 'ip_w1',
        type: 'warmup',
        name_es: 'Circulos de muneca',
        name_en: 'Wrist circles',
        description_es: 'Rotar munecas en ambas direcciones con punos cerrados.',
        description_en: 'Rotate wrists in both directions with fists closed.',
        sets: '2', reps: '10 cada direccion',
      },
      {
        id: 'ip_w2',
        type: 'strengthening',
        name_es: 'Flexion/extension con peso ligero',
        name_en: 'Wrist curls with light weight',
        description_es: 'Con mancuerna ligera, flexionar y extender muneca. Previene tendinitis de agarre.',
        description_en: 'With light dumbbell, flex and extend wrist. Prevents grip tendinitis.',
        sets: '3', reps: '15',
      },
      {
        id: 'ip_w3',
        type: 'stretch',
        name_es: 'Extension de flexores en suelo',
        name_en: 'Flexor stretch on floor',
        description_es: 'Palmas en suelo con dedos hacia rodillas, presionar suavemente.',
        description_en: 'Palms on floor with fingers pointing toward knees, press gently.',
        hold: '20-30 seg',
      },
    ],
  },
  {
    region: 'core',
    frequency_es: '4-5 veces por semana',
    frequency_en: '4-5 times per week',
    exercises: [
      {
        id: 'ip_c1',
        type: 'warmup',
        name_es: 'Dead bug',
        name_en: 'Dead bug',
        description_es: 'Supino, brazo y pierna opuestos se extienden manteniendo zona lumbar pegada al suelo.',
        description_en: 'Supine, opposite arm and leg extend while keeping lower back pressed to floor.',
        sets: '3', reps: '8 cada lado',
      },
      {
        id: 'ip_c2',
        type: 'strengthening',
        name_es: 'Hollow body hold',
        name_en: 'Hollow body hold',
        description_es: 'Posicion fundamental para aereos. Zona lumbar pegada al suelo, brazos y piernas extendidos.',
        description_en: 'Fundamental position for aerials. Lower back pressed to floor, arms and legs extended.',
        sets: '3', hold: '20-30 seg',
      },
      {
        id: 'ip_c3',
        type: 'strengthening',
        name_es: 'Pallof press',
        name_en: 'Pallof press',
        description_es: 'Anti-rotacion con banda. Excelente para estabilidad de core en giros y transiciones.',
        description_en: 'Anti-rotation with band. Excellent for core stability in spins and transitions.',
        sets: '3', reps: '10 cada lado',
      },
      {
        id: 'ip_c4',
        type: 'stretch',
        name_es: 'Cobra y nino',
        name_en: 'Cobra and child\'s pose',
        description_es: 'Alternar entre cobra (extension) y postura del nino (flexion) para movilidad espinal.',
        description_en: 'Alternate between cobra (extension) and child\'s pose (flexion) for spinal mobility.',
        hold: '20 seg cada posicion, 4 ciclos',
      },
    ],
  },
  {
    region: 'espalda',
    frequency_es: '3 veces por semana minimo',
    frequency_en: 'At least 3 times per week',
    exercises: [
      {
        id: 'ip_b1',
        type: 'warmup',
        name_es: 'Cat-cow',
        name_en: 'Cat-cow',
        description_es: 'En cuadrupedia, alternar flexion y extension espinal con la respiracion.',
        description_en: 'On all fours, alternate spinal flexion and extension with breathing.',
        sets: '2', reps: '10 ciclos',
      },
      {
        id: 'ip_b2',
        type: 'strengthening',
        name_es: 'Superman holds',
        name_en: 'Superman holds',
        description_es: 'Boca abajo, elevar brazos y piernas simultaneamente. Fortalecer erectores espinales.',
        description_en: 'Prone, lift arms and legs simultaneously. Strengthens erector spinae.',
        sets: '3', hold: '15-20 seg',
      },
      {
        id: 'ip_b3',
        type: 'stretch',
        name_es: 'Rotacion toracica',
        name_en: 'Thoracic rotation',
        description_es: 'De rodillas, mano detras de la cabeza, rotar el torso abriendo el codo al cielo.',
        description_en: 'Kneeling, hand behind head, rotate torso opening elbow to ceiling.',
        hold: '15 seg cada lado, 3 reps',
      },
    ],
  },
  {
    region: 'cadera',
    frequency_es: '3-4 veces por semana',
    frequency_en: '3-4 times per week',
    exercises: [
      {
        id: 'ip_hip1',
        type: 'warmup',
        name_es: 'Circulos de cadera',
        name_en: 'Hip circles',
        description_es: 'De pie, circulos amplios con la cadera. Movilizar articulacion coxofemoral.',
        description_en: 'Standing, wide hip circles. Mobilize coxofemoral joint.',
        sets: '2', reps: '10 cada direccion',
      },
      {
        id: 'ip_hip2',
        type: 'strengthening',
        name_es: 'Puente de gluteos',
        name_en: 'Glute bridge',
        description_es: 'Supino, elevar cadera activando gluteos. Progresion: una pierna.',
        description_en: 'Supine, raise hips activating glutes. Progression: single leg.',
        sets: '3', reps: '12-15',
      },
      {
        id: 'ip_hip3',
        type: 'stretch',
        name_es: 'Pigeon pose',
        name_en: 'Pigeon pose',
        description_es: 'Estiramiento profundo de rotadores externos de cadera. Esencial para splits y straddles.',
        description_en: 'Deep stretch for external hip rotators. Essential for splits and straddles.',
        hold: '45-60 seg cada lado',
      },
    ],
  },
  {
    region: 'rodillas',
    frequency_es: '3 veces por semana',
    frequency_en: '3 times per week',
    exercises: [
      {
        id: 'ip_k1',
        type: 'strengthening',
        name_es: 'Sentadilla a caja',
        name_en: 'Box squat',
        description_es: 'Sentadilla controlada hasta una caja/silla. Enfocarse en alineacion de rodillas sobre pies.',
        description_en: 'Controlled squat to box/chair. Focus on knee-over-foot alignment.',
        sets: '3', reps: '10-12',
      },
      {
        id: 'ip_k2',
        type: 'stretch',
        name_es: 'Estiramiento de cuadriceps de pie',
        name_en: 'Standing quad stretch',
        description_es: 'De pie, llevar talon al gluteo manteniendo rodillas juntas.',
        description_en: 'Standing, bring heel to glute keeping knees together.',
        hold: '30 seg cada pierna',
      },
    ],
  },
];

export function getPreventionForRegion(region: MuscleRegion): ZonePrevention | undefined {
  return injuryPreventionData.find((z) => z.region === region);
}
