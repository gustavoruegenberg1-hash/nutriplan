/**
 * Testes UnitÃ¡rios de LÃ³gica, Fisiologia e SeguranÃ§a do NutriPlan
 */
import { checkFoodAllergens, getAllergyBannerInfo } from '../../src/utils/allergySafety';
import { verificarCompatibilidade } from '../../src/utils/workoutSafety';
import { User } from '../../src/types';

declare const process: any;

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`âœ… PASS: ${message}`);
    passed++;
  } else {
    console.error(`âŒ FAIL: ${message}`);
    failed++;
  }
}

console.log('====================================================');
console.log('ðŸ§ª INICIANDO TESTES DO NUTRIPLAN: SEGURANÃ‡A & CIÃŠNCIA');
console.log('====================================================\n');

// 1. Testes de DetecÃ§Ã£o de AlergÃªnicos
console.log('--- 1. TESTES DE SEGURANÃ‡A ALIMENTAR & ALERGÃŠNICOS ---');

const testAllergies1 = ['Amendoim', 'Leite'];
const res1 = checkFoodAllergens('Pasta de amendoim integral 100%', testAllergies1);
assert(res1.isAllergen && res1.matchedAllergens.includes('Amendoim'), 'Detecta alÃ©rgeno em Pasta de Amendoim');

const res2 = checkFoodAllergens('Iogurte Grego desnatado', testAllergies1);
assert(res2.isAllergen && res2.matchedAllergens.includes('Leite'), 'Detecta derivado lÃ¡cteo (Iogurte) para alÃ©rgico a leite');

const res3 = checkFoodAllergens('FilÃ© de frango grelhado', testAllergies1);
assert(!res3.isAllergen, 'NÃ£o aponta falso positivo em FilÃ© de Frango para alÃ©rgico a amendoim/leite');

const testAllergiesOvos = ['Ovos'];
const resOvo = checkFoodAllergens('Ovo de galinha inteiro cozido', testAllergiesOvos);
assert(resOvo.isAllergen, 'Detecta alÃ©rgeno em Ovo de galinha');

// Teste de Estado "InformaÃ§Ã£o nÃ£o informada"
const bannerNoInfo = getAllergyBannerInfo({ hasFoodAllergies: null });
assert(bannerNoInfo.status === 'NO_INFO', 'Trata ausÃªncia de resposta como "InformaÃ§Ã£o nÃ£o informada"');

const bannerHasAllergies = getAllergyBannerInfo({ hasFoodAllergies: true, allergies: ['Amendoim'] });
assert(bannerHasAllergies.status === 'HAS_ALLERGIES', 'Detecta proteÃ§Ã£o ativa quando hÃ¡ alergias declaradas');

// 2. Testes de Compatibilidade de ExercÃ­cios
console.log('\n--- 2. TESTES DE COMPATIBILIDADE & SEGURANÃ‡A BIOMECÃ‚NICA EM TREINO ---');

const userHealthy: User = {
  id: 'u1',
  email: 'test@example.com',
  name: 'UsuÃ¡rio SaudÃ¡vel',
  weight: 75,
  height: 178,
  age: 28,
  gender: 'male',
  activityLevel: 'moderately_active',
  goal: 'gain_weight',
  role: 'USER',
  hasPhysicalDisabilities: 'NO',
  hasMuscleInjuries: 'NO',
  hasJointPain: 'NO',
  hasExercisePain: 'NO',
  availableEquipment: ['FULL_GYM'],
};

const compHealthy = verificarCompatibilidade(userHealthy, { name: 'Supino Reto com Barra', muscleGroup: 'CHEST' });
assert(compHealthy.isCompatible && compHealthy.level === 'NONE', 'UsuÃ¡rio sem lesÃµes tem compatibilidade total no supino');

// UsuÃ¡rio com lesÃ£o no ombro
const userShoulderInjury: User = {
  ...userHealthy,
  hasMuscleInjuries: 'YES',
  affectedMuscles: ['SHOULDERS'],
};

const compShoulder = verificarCompatibilidade(userShoulderInjury, {
  name: 'Desenvolvimento de Ombros com Halteres',
  muscleGroup: 'SHOULDERS',
});
assert(compShoulder.level === 'SPECIAL_ATTENTION', 'Emite ðŸ”´ AtenÃ§Ã£o Especial para lesÃ£o muscular direta em ombros');

// UsuÃ¡rio com dor articular no joelho
const userKneePain: User = {
  ...userHealthy,
  hasJointPain: 'YES',
  affectedJoints: ['Joelho direito'],
};

const compKnee = verificarCompatibilidade(userKneePain, {
  name: 'Agachamento Livre com Barra',
  muscleGroup: 'QUADRICEPS',
});
assert(compKnee.level === 'ATTENTION', 'Emite ðŸŸ¡ AtenÃ§Ã£o para articulaÃ§Ã£o de joelho com histÃ³rico de dor no agachamento');

// UsuÃ¡rio com exercÃ­cio explicitamente evitado
const userAvoidExercise: User = {
  ...userHealthy,
  exercisesToAvoid: ['Supino Reto com Barra'],
};

const compAvoid = verificarCompatibilidade(userAvoidExercise, {
  name: 'Supino Reto com Barra',
  muscleGroup: 'CHEST',
});
assert(compAvoid.level === 'AVOID' && !compAvoid.isCompatible, 'Bloqueia exercÃ­cio da lista de evitar do usuÃ¡rio');

// UsuÃ¡rio apenas com halteres treinando em casa
const userHomeGym: User = {
  ...userHealthy,
  availableEquipment: ['DUMBBELLS', 'BODYWEIGHT'],
};

const compMachine = verificarCompatibilidade(userHomeGym, {
  name: 'Puxada Alta Frontal no Pulley',
  muscleGroup: 'BACK',
  equipment: 'MACHINES',
});
assert(compMachine.level === 'EQUIPMENT_MISSING' && !compMachine.isCompatible, 'Identifica falta de máquina para quem só tem halteres');

console.log('\n====================================================');
console.log(`ðŸ“Š RESULTADO FINAL: ${passed} PASSOU / ${failed} FALHOU`);
console.log('====================================================');

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}

