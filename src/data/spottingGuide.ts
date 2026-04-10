/**
 * Spotting and assistance techniques for aerial movements.
 * Based on instructor training materials (SPOT methodology).
 * Visible only for instructor-tier users.
 */

export interface SpottingTechnique {
  movementId: string;
  technique_es: string;
  technique_en: string;
  spotter_position_es: string;
  spotter_position_en: string;
  hand_placement_es: string;
  hand_placement_en: string;
  risks_es: string[];
  risks_en: string[];
  verbal_cues_es: string[];
  verbal_cues_en: string[];
}

export const spottingGuide: SpottingTechnique[] = [
  {
    movementId: 'mv_inversion_controlada',
    technique_es: 'Asistencia de inversión: una mano en la espalda baja, otra en la cadera. Guiar el movimiento sin empujar.',
    technique_en: 'Inversion assistance: one hand on lower back, the other on the hip. Guide the movement without pushing.',
    spotter_position_es: 'De pie al lado del alumno, ligeramente detrás.',
    spotter_position_en: 'Standing beside the student, slightly behind.',
    hand_placement_es: 'Mano dominante en sacro, mano libre en cadera lateral.',
    hand_placement_en: 'Dominant hand on sacrum, free hand on lateral hip.',
    risks_es: [
      'No empujar al alumno — solo guiar',
      'Estar listo para sostener si pierde el agarre',
      'Nunca soltar hasta que el alumno confirme estabilidad',
    ],
    risks_en: [
      'Do not push the student — only guide',
      'Be ready to support if they lose grip',
      'Never release until the student confirms stability',
    ],
    verbal_cues_es: ['Activa el core', 'Eleva caderas', 'Mantén el agarre', 'Extiende piernas'],
    verbal_cues_en: ['Activate core', 'Lift hips', 'Maintain grip', 'Extend legs'],
  },
  {
    movementId: 'mv_subida_basica_tela',
    technique_es: 'Asistir desde abajo, sosteniendo el pie del alumno para facilitar el primer lock. No tocar la tela.',
    technique_en: 'Assist from below, supporting the student\'s foot to facilitate the first lock. Do not touch the fabric.',
    spotter_position_es: 'Debajo y ligeramente al frente del alumno.',
    spotter_position_en: 'Below and slightly in front of the student.',
    hand_placement_es: 'Ambas manos bajo el pie que hace el lock.',
    hand_placement_en: 'Both hands under the locking foot.',
    risks_es: [
      'No interferir con el wrapping de la tela',
      'Alejarse una vez completado el lock',
      'Vigilar que el lock sea correcto antes de soltar',
    ],
    risks_en: [
      'Do not interfere with fabric wrapping',
      'Step away once the lock is completed',
      'Verify the lock is correct before releasing',
    ],
    verbal_cues_es: ['Pisa la tela', 'Enrolla el pie', 'Ahora sube', 'Brazos largos'],
    verbal_cues_en: ['Step on the fabric', 'Wrap the foot', 'Now climb', 'Long arms'],
  },
  {
    movementId: 'mv_colgada_manos',
    technique_es: 'Posición base de observación. Verificar postura de hombros y agarre. Asistir solo si el alumno muestra fatiga de agarre.',
    technique_en: 'Base observation position. Verify shoulder posture and grip. Assist only if the student shows grip fatigue.',
    spotter_position_es: 'De pie frente al alumno a un brazo de distancia.',
    spotter_position_en: 'Standing facing the student at arm\'s length.',
    hand_placement_es: 'Sin contacto. Manos listas a la altura de la cadera del alumno.',
    hand_placement_en: 'No contact. Hands ready at student hip height.',
    risks_es: [
      'Estar listo para atrapar si suelta el agarre',
      'Observar señales de fatiga en antebrazos',
      'Limitar tiempo de colgada para principiantes (max 30s)',
    ],
    risks_en: [
      'Be ready to catch if they lose grip',
      'Watch for forearm fatigue signals',
      'Limit hang time for beginners (max 30s)',
    ],
    verbal_cues_es: ['Hombros abajo', 'Activa escapulas', 'Respira', 'Si te cansas, avísame'],
    verbal_cues_en: ['Shoulders down', 'Activate scapulae', 'Breathe', 'Tell me if you get tired'],
  },
  {
    movementId: 'mv_subida_lira',
    technique_es: 'Asistir sosteniendo la cadera del alumno durante el montaje. Estabilizar el aro si es necesario.',
    technique_en: 'Assist by supporting the student\'s hips during mounting. Stabilize the hoop if necessary.',
    spotter_position_es: 'Detrás del alumno, con acceso a la cadera.',
    spotter_position_en: 'Behind the student, with access to the hips.',
    hand_placement_es: 'Ambas manos en las crestas ilíacas (huesos de la cadera).',
    hand_placement_en: 'Both hands on the iliac crests (hip bones).',
    risks_es: [
      'El aro puede balancearse — estabilizarlo con el cuerpo si es necesario',
      'El alumno puede resbalar al montar — estar listo para sostener',
      'Verificar altura correcta del aro antes de comenzar',
    ],
    risks_en: [
      'The hoop may swing — stabilize it with your body if necessary',
      'The student may slip while mounting — be ready to support',
      'Verify correct hoop height before starting',
    ],
    verbal_cues_es: ['Agarra arriba', 'Impulsa con las piernas', 'Codo adentro', 'Sienta'],
    verbal_cues_en: ['Grab above', 'Push with legs', 'Elbow in', 'Sit'],
  },
  {
    movementId: 'mv_sentada_basica',
    technique_es: 'Observación activa. Verificar que el alumno tiene al menos una mano en el aro al sentarse por primera vez.',
    technique_en: 'Active observation. Verify the student has at least one hand on the hoop when sitting for the first time.',
    spotter_position_es: 'Al lado del aro, ligeramente detrás.',
    spotter_position_en: 'Beside the hoop, slightly behind.',
    hand_placement_es: 'Una mano lista en la espalda baja del alumno.',
    hand_placement_en: 'One hand ready on the student\'s lower back.',
    risks_es: [
      'El alumno puede inclinarse demasiado y caer hacia adelante',
      'Verificar que la sentada sea estable antes de soltar el soporte',
    ],
    risks_en: [
      'The student may lean too far and fall forward',
      'Verify the seat is stable before releasing support',
    ],
    verbal_cues_es: ['Siéntate centrada', 'Mantén una mano arriba', 'Core activo'],
    verbal_cues_en: ['Sit centered', 'Keep one hand up', 'Core active'],
  },
  {
    movementId: 'mv_rollup_lira',
    technique_es: 'Asistir el enrollamiento controlando la velocidad con una mano en la espalda y otra en la cadera.',
    technique_en: 'Assist the roll-up by controlling speed with one hand on the back and the other on the hip.',
    spotter_position_es: 'Al lado del aro, a la altura del torso del alumno.',
    spotter_position_en: 'Beside the hoop, at the student\'s torso height.',
    hand_placement_es: 'Mano en espalda media, otra en cadera o muslo.',
    hand_placement_en: 'Hand on mid-back, other on hip or thigh.',
    risks_es: [
      'El alumno puede perder el agarre al invertirse',
      'Controlar que no vaya demasiado rápido',
      'Estar preparado para detener el movimiento en cualquier momento',
    ],
    risks_en: [
      'The student may lose grip when inverting',
      'Control that they don\'t go too fast',
      'Be prepared to stop the movement at any point',
    ],
    verbal_cues_es: ['Despacio', 'Agarra fuerte', 'Core firme', 'Voy a soltar cuando estés lista'],
    verbal_cues_en: ['Slowly', 'Grip tight', 'Core firm', 'I will release when you are ready'],
  },
];

export function getSpottingForMovement(movementId: string): SpottingTechnique | undefined {
  return spottingGuide.find((s) => s.movementId === movementId);
}
