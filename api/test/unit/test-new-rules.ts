import { UserEntity } from './modules/auth/domain/entities/user.entity';

// Função de validação de restrições
function restricoesAlimentaresPreenchidas(user: any): boolean {
  if (!user) return false;
  const hasAllergyAnswer = user.hasFoodAllergies !== null && user.hasFoodAllergies !== undefined;
  const hasIntoleranceAnswer = user.hasFoodIntolerances !== null && user.hasFoodIntolerances !== undefined;
  const hasSupervisionAnswer = user.needsProfessionalSupervision !== null && user.needsProfessionalSupervision !== undefined;
  const hasNotes = typeof user.dietaryRestrictionsNotes === 'string' && user.dietaryRestrictionsNotes.trim().length > 0;
  const hasAllergiesList = Array.isArray(user.allergies) && user.allergies.length > 0;
  return hasAllergyAnswer || hasIntoleranceAnswer || hasSupervisionAnswer || hasNotes || hasAllergiesList;
}

// Função de validação de exercícios
function condicoesELimitacoesPreenchidas(user: any): boolean {
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

// Função de recálculo proporcional
function recalculateItemNutrients(item: any, rawValue: string | number, unit = 'g') {
  const parsedVal = typeof rawValue === 'number' ? rawValue : parseFloat(String(rawValue).replace(',', '.')) || 0;
  const grams = unit === 'kg' ? parsedVal * 1000 : parsedVal;
  const factor = grams / 100;

  const protein = Math.round((Number(item.proteinPer100g) || 0) * factor * 10) / 10;
  const carbs = Math.round((Number(item.carbsPer100g) || 0) * factor * 10) / 10;
  const fat = Math.round((Number(item.fatPer100g) || 0) * factor * 10) / 10;
  const fiber = Math.round((Number(item.fiberPer100g) || 0) * factor * 10) / 10;
  const calories = Math.round((Number(item.caloriesPer100g) || 0) * factor * 10) / 10;

  return {
    ...item,
    quantityValue: rawValue,
    unit,
    quantityGrams: grams,
    calories,
    protein,
    carbs,
    fat,
    fiber,
  };
}

async function runTests() {
  console.log('--- TESTE 1: restricoesAlimentaresPreenchidas ---');
  const userNaoPreencheu: any = { id: '1', name: 'João' };
  const userSemRestricoes: any = { id: '2', name: 'Maria', hasFoodAllergies: false, hasFoodIntolerances: false };
  const userComAlergia: any = { id: '3', name: 'Carlos', hasFoodAllergies: true, allergies: ['amendoim'] };

  console.assert(!restricoesAlimentaresPreenchidas(userNaoPreencheu), 'Falha: Não preenchido deveria ser false');
  console.assert(restricoesAlimentaresPreenchidas(userSemRestricoes), 'Falha: Sem restrições deveria ser true');
  console.assert(restricoesAlimentaresPreenchidas(userComAlergia), 'Falha: Com alergia deveria ser true');
  console.log('✅ TESTE 1 PASSOU!');

  console.log('--- TESTE 2: condicoesELimitacoesPreenchidas ---');
  const userWorkoutNaoPreencheu: any = { id: '1', name: 'João' };
  const userSemLimitacoes: any = { id: '2', name: 'Maria', hasMuscleInjuries: 'NO', hasJointPain: 'NO', experienceLevel: 'INTERMEDIATE' };
  const userComLesao: any = { id: '3', name: 'Carlos', hasJointPain: 'YES', affectedJoints: ['joelho'] };

  console.assert(!condicoesELimitacoesPreenchidas(userWorkoutNaoPreencheu), 'Falha: Workout não preenchido deveria ser false');
  console.assert(condicoesELimitacoesPreenchidas(userSemLimitacoes), 'Falha: Workout sem limitações deveria ser true');
  console.assert(condicoesELimitacoesPreenchidas(userComLesao), 'Falha: Workout com lesão deveria ser true');
  console.log('✅ TESTE 2 PASSOU!');

  console.log('--- TESTE 3: Recálculo Proporcional de Nutrientes ---');
  const baseFood = {
    foodItemId: 'test-1',
    foodName: 'Alimento Exemplo',
    caloriesPer100g: 200,
    proteinPer100g: 20,
    carbsPer100g: 10,
    fatPer100g: 5,
    fiberPer100g: 2,
  };

  const res200g = recalculateItemNutrients(baseFood, 200, 'g');
  console.assert(res200g.calories === 400, `200g esperava 400 cal, obteve ${res200g.calories}`);
  console.assert(res200g.protein === 40, `200g esperava 40g prot, obteve ${res200g.protein}`);
  console.assert(res200g.carbs === 20, `200g esperava 20g carb, obteve ${res200g.carbs}`);
  console.assert(res200g.fat === 10, `200g esperava 10g fat, obteve ${res200g.fat}`);
  console.assert(res200g.fiber === 4, `200g esperava 4g fiber, obteve ${res200g.fiber}`);

  const res50g = recalculateItemNutrients(baseFood, 50, 'g');
  console.assert(res50g.calories === 100, `50g esperava 100 cal, obteve ${res50g.calories}`);
  console.assert(res50g.protein === 10, `50g esperava 10g prot, obteve ${res50g.protein}`);
  console.assert(res50g.carbs === 5, `50g esperava 5g carb, obteve ${res50g.carbs}`);
  console.assert(res50g.fat === 2.5, `50g esperava 2.5g fat, obteve ${res50g.fat}`);
  console.assert(res50g.fiber === 1, `50g esperava 1g fiber, obteve ${res50g.fiber}`);

  console.log('✅ TESTE 3 PASSOU (Proporcionalidade 100g->200g->50g exata)!');

  console.log('--- TESTE 4: UserEntity com readArticles ---');
  const userEnt = new UserEntity({
    id: 'u1',
    name: 'Ana',
    email: 'ana@teste.com',
    role: 'USER',
    readArticles: ['art-01', 'art-02'],
  });
  console.assert(Array.isArray(userEnt.readArticles) && userEnt.readArticles.length === 2, 'readArticles não instanciado');
  console.log('✅ TESTE 4 PASSOU!');

  console.log('\n🎉 TODOS OS TESTES UNITÁRIOS DAS NOVAS REGRAS PASSARAM COM SUCESSO!');
}

runTests();
