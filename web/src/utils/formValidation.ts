import { User } from '../types';

/**
 * Verifica se o usuário preencheu o formulário de restrições alimentares.
 * Diferencia explicitamente 'formulário não preenchido' de 'preenchido e sem restrições'.
 */
export function restricoesAlimentaresPreenchidas(user: User | null | undefined): boolean {
  if (!user) return false;

  const hasAllergyAnswer = user.hasFoodAllergies !== null && user.hasFoodAllergies !== undefined;
  const hasIntoleranceAnswer = user.hasFoodIntolerances !== null && user.hasFoodIntolerances !== undefined;
  const hasSupervisionAnswer = user.needsProfessionalSupervision !== null && user.needsProfessionalSupervision !== undefined;
  const hasNotes = typeof user.dietaryRestrictionsNotes === 'string' && user.dietaryRestrictionsNotes.trim().length > 0;
  const hasAllergiesList = Array.isArray(user.allergies) && user.allergies.length > 0;

  return hasAllergyAnswer || hasIntoleranceAnswer || hasSupervisionAnswer || hasNotes || hasAllergiesList;
}

/**
 * Verifica se o usuário preencheu o formulário de condições e limitações para exercícios.
 * Diferencia explicitamente 'formulário não preenchido' de 'preenchido e sem limitações'.
 */
export function condicoesELimitacoesPreenchidas(user: User | null | undefined): boolean {
  if (!user) return false;

  const hasExpLevel = user.experienceLevel !== null && user.experienceLevel !== undefined;
  const hasTrainingFreq = user.trainingFrequencyDays !== null && user.trainingFrequencyDays !== undefined && user.trainingFrequencyDays > 0;
  const hasWeightExp = user.weightTrainingExperience !== null && user.weightTrainingExperience !== undefined;
  const hasDisabilities = user.hasPhysicalDisabilities !== null && user.hasPhysicalDisabilities !== undefined;
  const hasMuscleInjuries = user.hasMuscleInjuries !== null && user.hasMuscleInjuries !== undefined;
  const hasJointPain = user.hasJointPain !== null && user.hasJointPain !== undefined;
  const hasExercisePain = user.hasExercisePain !== null && user.hasExercisePain !== undefined;
  const hasEquip = Array.isArray(user.availableEquipment) && user.availableEquipment.length > 0;
  const hasAvoidList = Array.isArray(user.exercisesToAvoid) && user.exercisesToAvoid.length > 0;
  const hasDifficultMovements = Array.isArray(user.difficultMovements) && user.difficultMovements.length > 0;

  return (
    hasExpLevel ||
    hasTrainingFreq ||
    hasWeightExp ||
    hasDisabilities ||
    hasMuscleInjuries ||
    hasJointPain ||
    hasExercisePain ||
    hasEquip ||
    hasAvoidList ||
    hasDifficultMovements
  );
}
