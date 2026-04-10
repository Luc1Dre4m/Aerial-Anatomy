import { movements } from '../data/movements';
import { getMuscleById } from '../data/muscles';
import { getChainById } from '../data/chains';

export function validateAllData(): void {
  let errorCount = 0;

  // Validate movements
  movements.forEach((mv) => {
    // Check muscle references
    mv.muscles.forEach((m) => {
      if (!getMuscleById(m.muscle_id)) {
        console.warn(`[DataValidation] Movement "${mv.id}" references missing muscle: ${m.muscle_id}`);
        errorCount++;
      }
    });

    // Check execution_phases muscle references
    mv.execution_phases?.forEach((phase) => {
      phase.active_muscles.forEach((am) => {
        if (!getMuscleById(am.muscle_id)) {
          console.warn(`[DataValidation] Movement "${mv.id}" phase ${phase.phase_number} references missing muscle: ${am.muscle_id}`);
          errorCount++;
        }
      });
    });

    // Check prerequisite movements
    mv.prerequisite_movements.forEach((prereqId) => {
      if (!movements.find((m) => m.id === prereqId)) {
        console.warn(`[DataValidation] Movement "${mv.id}" references missing prerequisite: ${prereqId}`);
        errorCount++;
      }
    });

    // Check chains
    if (!getChainById(mv.primary_chain)) {
      console.warn(`[DataValidation] Movement "${mv.id}" references missing primary chain: ${mv.primary_chain}`);
      errorCount++;
    }

    mv.related_chains.forEach((chainId) => {
      if (!getChainById(chainId)) {
        console.warn(`[DataValidation] Movement "${mv.id}" references missing related chain: ${chainId}`);
        errorCount++;
      }
    });
  });

  if (errorCount === 0) {
    console.log('[DataValidation] All data references are valid.');
  } else {
    console.warn(`[DataValidation] Found ${errorCount} broken reference(s).`);
  }
}
