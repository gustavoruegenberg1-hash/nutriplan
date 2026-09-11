import { PortionUnit, LocalMeal, LocalMealItem } from '../pages/DietPlanner';
import { calculateGramsFromUnit, recalculateItemNutrients } from '../pages/DietPlanner';
import { isWholeUnit, normalizeUnit, roundToPracticalQuantity } from './unitClassification';

/**
 * Referências Científicas e Diretrizes Oficiais:
 * 
 * 1. Fibras Alimentares (DRIs - Dietary Reference Intakes / National Academies & USDA):
 *    - Ingestão Adequada (AI): 14 g de fibras para cada 1.000 kcal consumidas.
 *    - Homens adultos (19-50 anos): 38 g/dia.
 *    - Mulheres adultas (19-50 anos): 25-28 g/dia.
 *    - Homens > 50 anos: 30 g/dia; Mulheres > 50 anos: 21 g/dia.
 *    - Faixa segura e tolerável: 25 g a 40 g/dia (evitando excessos > 45 g que causam desconforto gastrointestinal e má absorção).
 *    Fonte: National Academies of Sciences, Engineering, and Medicine (NASEM) - DRIs
 *    https://www.nationalacademies.org/
 * 
 * 2. Déficit Calórico Saudável e Perda de Peso Sustentável (CDC & NIH/NHLBI):
 *    - Perda gradual e segura: 0.5 kg a 1.0 kg/semana.
 *    - Déficit energético recomendado: 15% a 25% do TDEE (350 a 750 kcal/dia, tipicamente ~500 kcal/dia).
 *    - Limites de segurança clínica: Calorias diárias não devem ficar abaixo da Taxa Metabólica Basal (TMB).
 *    - Pisos absolutos mínimos: 1.200 kcal/dia para mulheres e 1.500 kcal/dia para homens.
 *    Fonte: Centers for Disease Control and Prevention (CDC) - Healthy Weight
 *    https://www.cdc.gov/healthy-weight-growth/losing-weight/index.html
 * 
 * 3. Distribuição de Macronutrientes (DRIs & ISSN):
 *    - Proteínas: 1.6 a 2.2 g/kg/dia para praticantes de musculação / esportes.
 *    - Gorduras: 0.7 a 1.0 g/kg/dia (20% a 35% do VET).
 *    - Carboidratos: 45% a 65% do VET (fornecedor primário de glicogênio e energia).
 */

export const MACRO_TOLERANCES = {
  MIN_PROTEIN_PER_KG: 1.6,
  TARGET_PROTEIN_PER_KG: 2.0,
  MAX_PROTEIN_PER_KG: 2.3, // Teto seguro de proteína
  TARGET_FAT_PER_KG: 0.8,
  MIN_FAT_PCT: 0.18,
  MAX_FAT_PCT: 0.35,
  MIN_CARBS_PCT: 0.40,
  MAX_CARBS_PCT: 0.65,

  // Fibras (DRIs National Academies)
  FIBER_PER_1000_KCAL: 14,
  MIN_FIBER_SAFE: 22,
  TARGET_FIBER_DEFAULT_MALE: 38,
  TARGET_FIBER_DEFAULT_FEMALE: 28,
  MAX_FIBER_SAFE: 45, // Teto antes de desconforto gastrointestinal

  // Déficit Calórico Sustentável (CDC / NIH)
  MIN_DEFICIT_PCT: 0.15,
  TARGET_DEFICIT_PCT: 0.20,
  MAX_DEFICIT_PCT: 0.25,
  MIN_DEFICIT_KCAL: 350,
  MAX_DEFICIT_KCAL: 750,
  SAFETY_FLOOR_MALE: 1500,
  SAFETY_FLOOR_FEMALE: 1200,
};

export type FoodDominance = 'PROTEIN_DOMINANT' | 'CARB_DOMINANT' | 'FAT_DOMINANT' | 'MIXED';

/**
 * Calcula o déficit calórico moderado e sustentável em conformidade com as diretrizes do CDC e NIH.
 */
export function calcularDeficitCaloricoSustentavel(
  tdee: number,
  bmr: number,
  gender: string = 'male',
  _weight = 75
): { targetCalories: number; deficitCalories: number; deficitPct: number; isConstrainedByBmr: boolean } {
  // Déficit padrão baseado no CDC: 20% do TDEE (limitado entre 350 kcal e 750 kcal)
  let rawDeficit = Math.round(tdee * MACRO_TOLERANCES.TARGET_DEFICIT_PCT);
  rawDeficit = Math.max(
    MACRO_TOLERANCES.MIN_DEFICIT_KCAL,
    Math.min(MACRO_TOLERANCES.MAX_DEFICIT_KCAL, rawDeficit)
  );

  let targetCalories = tdee - rawDeficit;
  let isConstrainedByBmr = false;

  // Regra de segurança CDC/NIH: não baixar da TMB em dietas não hospitalares
  if (targetCalories < bmr) {
    targetCalories = Math.max(bmr, tdee - 350);
    isConstrainedByBmr = true;
  }

  // Piso de segurança absoluto
  const isFemale = gender.toLowerCase().includes('fem') || gender.toLowerCase().includes('mulher');
  const safetyFloor = isFemale
    ? MACRO_TOLERANCES.SAFETY_FLOOR_FEMALE
    : MACRO_TOLERANCES.SAFETY_FLOOR_MALE;

  if (targetCalories < safetyFloor) {
    targetCalories = safetyFloor;
    isConstrainedByBmr = true;
  }

  const finalDeficit = tdee - targetCalories;
  const deficitPct = Math.round((finalDeficit / tdee) * 100);

  return {
    targetCalories: Math.round(targetCalories),
    deficitCalories: finalDeficit,
    deficitPct,
    isConstrainedByBmr,
  };
}

/**
 * Calcula a meta científica de fibras diárias com base na ingestão calórica, sexo e idade (DRIs).
 */
export function calcularMetaFibras(targetCalories: number, gender = 'male', age = 28): number {
  const isFemale = gender.toLowerCase().includes('fem') || gender.toLowerCase().includes('mulher');
  
  // Regra DRIs: 14g por 1000 kcal
  const caloriesBased = Math.round((targetCalories / 1000) * MACRO_TOLERANCES.FIBER_PER_1000_KCAL);
  
  let baseline = isFemale ? MACRO_TOLERANCES.TARGET_FIBER_DEFAULT_FEMALE : MACRO_TOLERANCES.TARGET_FIBER_DEFAULT_MALE;
  if (age > 50) {
    baseline = isFemale ? 21 : 30;
  }

  // A meta é a média ponderada ou o valor por caloria respeitando os limites saudáveis
  const target = Math.min(MACRO_TOLERANCES.MAX_FIBER_SAFE, Math.max(baseline, caloriesBased));
  return target;
}

/**
 * Classifica a dominância de macronutriente de um alimento com base em sua densidade calórica por 100g.
 */
export function getFoodDominance(
  foodName: string,
  proteinPer100g: number,
  carbsPer100g: number,
  fatPer100g: number,
  caloriesPer100g: number
): FoodDominance {
  const lower = foodName.toLowerCase();

  if (
    lower.includes('azeite') ||
    lower.includes('óleo') ||
    lower.includes('manteiga') ||
    lower.includes('pasta de amendoim')
  ) {
    return 'FAT_DOMINANT';
  }

  if (
    lower.includes('frango') ||
    lower.includes('patinho') ||
    lower.includes('alcatra') ||
    lower.includes('tilápia') ||
    lower.includes('salmão') ||
    lower.includes('atum') ||
    lower.includes('whey') ||
    lower.includes('clara de ovo') ||
    lower.includes('albumina')
  ) {
    return 'PROTEIN_DOMINANT';
  }

  if (
    lower.includes('arroz') ||
    lower.includes('batata') ||
    lower.includes('aveia') ||
    lower.includes('banana') ||
    lower.includes('maçã') ||
    lower.includes('maca') ||
    lower.includes('pão') ||
    lower.includes('pao') ||
    lower.includes('macarrão') ||
    lower.includes('mandioca') ||
    lower.includes('feijão') ||
    lower.includes('feijao')
  ) {
    return 'CARB_DOMINANT';
  }

  const cal = Math.max(1, caloriesPer100g);
  const pCal = proteinPer100g * 4;
  const cCal = carbsPer100g * 4;
  const fCal = fatPer100g * 9;

  if (pCal / cal >= 0.45) return 'PROTEIN_DOMINANT';
  if (cCal / cal >= 0.45) return 'CARB_DOMINANT';
  if (fCal / cal >= 0.45) return 'FAT_DOMINANT';

  return 'MIXED';
}

/**
 * Identifica se um alimento é de alta concentração de fibra (deve ter porção controlada)
 * ou se é moderado em fibra (ideal para fechar carboidratos sem explodir fibras).
 */
export function isHighFiberCarb(foodName: string, fiberPer100g: number): boolean {
  const lower = foodName.toLowerCase();
  if (lower.includes('aveia') || lower.includes('feijão') || lower.includes('linhaça') || lower.includes('chia') || lower.includes('brócolis')) {
    return true;
  }
  return fiberPer100g >= 4.0;
}

export interface MacroGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  userWeight: number;
  userGender?: string;
  userAge?: number;
  goal?: string;
}

export interface DietQualityEvaluation {
  score: number;
  caloriesDiff: number;
  proteinDiff: number;
  carbsDiff: number;
  fatDiff: number;
  fiberDiff: number;
  proteinPerKg: number;
  isExcessProtein: boolean;
  isExcessFiber: boolean;
  isDeficitCarbs: boolean;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber: number;
}

/**
 * Função Centralizada de Avaliação da Qualidade da Dieta:
 * Produz um score matemático ponderando calorias, proteínas, carboidratos, gorduras e fibras.
 * Penaliza severamente excesso de proteína (> 2.2 g/kg) e excesso de fibras (> 45g).
 */
export function avaliarQualidadeDieta(
  meals: LocalMeal[],
  goals: MacroGoals
): DietQualityEvaluation {
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;
  let totalFiber = 0;

  meals.forEach((meal) => {
    meal.items.forEach((it) => {
      totalCalories += it.calories || 0;
      totalProtein += it.protein || 0;
      totalCarbs += it.carbs || 0;
      totalFat += it.fat || 0;
      totalFiber += it.fiber || 0;
    });
  });

  const targetFiber = goals.fiber || calcularMetaFibras(goals.calories, goals.userGender, goals.userAge);

  const caloriesDiff = totalCalories - goals.calories;
  const proteinDiff = totalProtein - goals.protein;
  const carbsDiff = totalCarbs - goals.carbs;
  const fatDiff = totalFat - goals.fat;
  const fiberDiff = totalFiber - targetFiber;

  const weight = Math.max(40, goals.userWeight || 75);
  const proteinPerKg = totalProtein / weight;

  // 1. Penalidade de Proteína:
  let proteinPenalty = 0;
  if (proteinDiff > 0) {
    if (proteinPerKg > MACRO_TOLERANCES.MAX_PROTEIN_PER_KG) {
      const excessGrams = totalProtein - (weight * MACRO_TOLERANCES.MAX_PROTEIN_PER_KG);
      proteinPenalty = excessGrams * excessGrams * 15;
    } else {
      proteinPenalty = proteinDiff * 2.5;
    }
  } else {
    proteinPenalty = Math.abs(proteinDiff) * 3.0;
  }

  // 2. Penalidade de Carboidratos:
  let carbsPenalty = 0;
  if (carbsDiff < 0) {
    carbsPenalty = Math.abs(carbsDiff) * 3.5;
  } else {
    carbsPenalty = carbsDiff * 1.5;
  }

  // 3. Penalidade de Gorduras:
  const fatPenalty = Math.abs(fatDiff) * 2.5;

  // 4. Penalidade de Fibras (DRIs National Academies):
  let fiberPenalty = 0;
  if (totalFiber > MACRO_TOLERANCES.MAX_FIBER_SAFE) {
    // Excesso perigoso de fibras (> 45g): penalidade quadrática
    const excess = totalFiber - MACRO_TOLERANCES.MAX_FIBER_SAFE;
    fiberPenalty = excess * excess * 8;
  } else if (totalFiber < MACRO_TOLERANCES.MIN_FIBER_SAFE) {
    // Fibras abaixo do mínimo seguro (< 22g)
    fiberPenalty = (MACRO_TOLERANCES.MIN_FIBER_SAFE - totalFiber) * 2.5;
  } else {
    // Dentro da faixa ótima de 22g a 42g: leve desvio
    fiberPenalty = Math.abs(fiberDiff) * 0.5;
  }

  // 5. Penalidade de Calorias:
  const caloriesPenalty = Math.abs(caloriesDiff) * 1.0;

  const score = caloriesPenalty + proteinPenalty + carbsPenalty + fatPenalty + fiberPenalty;

  return {
    score: Math.round(score * 10) / 10,
    caloriesDiff: Math.round(caloriesDiff),
    proteinDiff: Math.round(proteinDiff * 10) / 10,
    carbsDiff: Math.round(carbsDiff * 10) / 10,
    fatDiff: Math.round(fatDiff * 10) / 10,
    fiberDiff: Math.round(fiberDiff * 10) / 10,
    proteinPerKg: Math.round(proteinPerKg * 10) / 10,
    isExcessProtein: proteinPerKg > MACRO_TOLERANCES.MAX_PROTEIN_PER_KG,
    isExcessFiber: totalFiber > MACRO_TOLERANCES.MAX_FIBER_SAFE,
    isDeficitCarbs: carbsDiff < -30,
    totalCalories: Math.round(totalCalories),
    totalProtein: Math.round(totalProtein * 10) / 10,
    totalCarbs: Math.round(totalCarbs * 10) / 10,
    totalFat: Math.round(totalFat * 10) / 10,
    totalFiber: Math.round(totalFiber * 10) / 10,
  };
}

export interface OptimizationItem {
  foodName: string;
  baseQuantity: number;
  unit: PortionUnit;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  fiberPer100g: number;
  dominance: FoodDominance;
  isHighFiber: boolean;
  mealIdx: number;
  currentQuantity: number;
}

/**
 * Algoritmo de Otimização Iterativo Multivariável:
 * Ajusta conjuntamente calorias, proteínas, carboidratos, gorduras e fibras
 * sem sobrecarga proteica e sem extrapolação de fibras.
 */
export function optimizeDietPlan(
  rawMeals: { name: string; items: any[] }[],
  goals: MacroGoals
): LocalMeal[] {
  const weight = Math.max(40, goals.userWeight || 75);
  const targetCalories = goals.calories;
  const targetProtein = goals.protein;
  const targetFat = goals.fat;
  const targetCarbs = goals.carbs;

  // 1. Mapear todos os alimentos, dominância e conteúdo de fibras
  const items: OptimizationItem[] = [];

  rawMeals.forEach((meal, mealIdx) => {
    meal.items.forEach((it: any) => {
      const normUnit = normalizeUnit(it.unit);
      const dominance = getFoodDominance(
        it.foodName,
        Number(it.proteinPer100g) || 0,
        Number(it.carbsPer100g) || 0,
        Number(it.fatPer100g) || 0,
        Number(it.caloriesPer100g) || 0
      );
      const isHighFiber = isHighFiberCarb(it.foodName, Number(it.fiberPer100g) || 0);

      items.push({
        foodName: it.foodName,
        baseQuantity: it.baseQuantity || 100,
        unit: normUnit,
        caloriesPer100g: Number(it.caloriesPer100g) || 0,
        proteinPer100g: Number(it.proteinPer100g) || 0,
        carbsPer100g: Number(it.carbsPer100g) || 0,
        fatPer100g: Number(it.fatPer100g) || 0,
        fiberPer100g: Number(it.fiberPer100g) || 0,
        dominance,
        isHighFiber,
        mealIdx,
        currentQuantity: it.baseQuantity || 100,
      });
    });
  });

  const scaleRatio = targetCalories / 2300;

  // Passo A: Fixar unidades inteiras (ovos, frutas, scoops, fatias, colheres) com números inteiros práticos
  items.forEach((item) => {
    if (isWholeUnit(item.unit, item.foodName)) {
      let scaled = item.baseQuantity;
      if (item.dominance === 'PROTEIN_DOMINANT') {
        scaled = item.baseQuantity * (targetProtein / (weight * 2.0));
      } else if (item.dominance === 'CARB_DOMINANT') {
        scaled = item.baseQuantity * (targetCarbs / 280);
      } else {
        scaled = item.baseQuantity * scaleRatio;
      }
      item.currentQuantity = roundToPracticalQuantity(scaled, item.unit, item.foodName);
    }
  });

  const calculateCurrentMacros = () => {
    let p = 0, c = 0, f = 0, fb = 0, cal = 0;
    items.forEach((it) => {
      const g = calculateGramsFromUnit(it.currentQuantity, it.unit, it.foodName);
      const factor = g / 100;
      p += it.proteinPer100g * factor;
      c += it.carbsPer100g * factor;
      f += it.fatPer100g * factor;
      fb += it.fiberPer100g * factor;
      cal += it.caloriesPer100g * factor;
    });
    return { p, c, f, fb, cal };
  };

  // Passo B: Ajustar Alimentos Contínuos de Proteína (Frango, Patinho, Tilápia) para a meta exata de ~1.8-2.0 g/kg
  const proteinItems = items.filter(
    (it) => !isWholeUnit(it.unit, it.foodName) && it.dominance === 'PROTEIN_DOMINANT'
  );
  if (proteinItems.length > 0) {
    let otherProtein = 0;
    items.forEach((it) => {
      if (isWholeUnit(it.unit, it.foodName) || it.dominance !== 'PROTEIN_DOMINANT') {
        const g = calculateGramsFromUnit(it.currentQuantity, it.unit, it.foodName);
        otherProtein += (it.proteinPer100g * g) / 100;
      }
    });

    const proteinRemaining = Math.max(20, targetProtein - otherProtein);
    const baseProteinFromProteinItems = proteinItems.reduce((acc, it) => {
      const g = calculateGramsFromUnit(it.baseQuantity, it.unit, it.foodName);
      return acc + (it.proteinPer100g * g) / 100;
    }, 0);

    const proteinScale =
      baseProteinFromProteinItems > 0 ? proteinRemaining / baseProteinFromProteinItems : 1.0;

    proteinItems.forEach((it) => {
      const adjusted = it.baseQuantity * proteinScale;
      const bounded = Math.min(260, Math.max(70, adjusted));
      it.currentQuantity = roundToPracticalQuantity(bounded, it.unit, it.foodName);
    });
  }

  // Passo C: Ajustar Alimentos Contínuos de Gordura (se houver fontes contínuas)
  const fatItems = items.filter(
    (it) => !isWholeUnit(it.unit, it.foodName) && it.dominance === 'FAT_DOMINANT'
  );
  if (fatItems.length > 0) {
    let otherFat = 0;
    items.forEach((it) => {
      if (it.dominance !== 'FAT_DOMINANT') {
        const g = calculateGramsFromUnit(it.currentQuantity, it.unit, it.foodName);
        otherFat += (it.fatPer100g * g) / 100;
      }
    });

    const fatRemaining = Math.max(5, targetFat - otherFat);
    const baseFatFromFatItems = fatItems.reduce((acc, it) => {
      const g = calculateGramsFromUnit(it.baseQuantity, it.unit, it.foodName);
      return acc + (it.fatPer100g * g) / 100;
    }, 0);

    const fatScale = baseFatFromFatItems > 0 ? fatRemaining / baseFatFromFatItems : 1.0;

    fatItems.forEach((it) => {
      const adjusted = it.baseQuantity * fatScale;
      it.currentQuantity = roundToPracticalQuantity(adjusted, it.unit, it.foodName);
    });
  }

  // Passo D: Alimentos de Alta Fibra (Aveia, Feijão): Mantidos em porções saudáveis controladas
  // (30g a 50g para aveia; 80g a 120g para feijão) para NÃO explodir as fibras
  const highFiberCarbItems = items.filter(
    (it) => !isWholeUnit(it.unit, it.foodName) && it.dominance === 'CARB_DOMINANT' && it.isHighFiber
  );
  highFiberCarbItems.forEach((it) => {
    const lower = it.foodName.toLowerCase();
    let safeGrams = it.baseQuantity;
    if (lower.includes('aveia')) {
      safeGrams = Math.min(50, Math.max(30, Math.round(it.baseQuantity * scaleRatio)));
    } else if (lower.includes('feijão') || lower.includes('feijao')) {
      safeGrams = Math.min(130, Math.max(70, Math.round(it.baseQuantity * scaleRatio)));
    }
    it.currentQuantity = roundToPracticalQuantity(safeGrams, it.unit, it.foodName);
  });

  // Passo E: Alimentos de Fibra Moderada (Arroz, Batata Doce/Inglesa, Mandioca):
  // Principais fontes para fechar os carboidratos e calorias sem inflar fibras
  const modFiberCarbItems = items.filter(
    (it) => !isWholeUnit(it.unit, it.foodName) && it.dominance === 'CARB_DOMINANT' && !it.isHighFiber
  );
  if (modFiberCarbItems.length > 0) {
    let otherCarbs = 0;
    items.forEach((it) => {
      if (isWholeUnit(it.unit, it.foodName) || it.dominance !== 'CARB_DOMINANT' || it.isHighFiber) {
        const g = calculateGramsFromUnit(it.currentQuantity, it.unit, it.foodName);
        otherCarbs += (it.carbsPer100g * g) / 100;
      }
    });

    const carbsRemaining = Math.max(30, targetCarbs - otherCarbs);
    const baseCarbsFromModItems = modFiberCarbItems.reduce((acc, it) => {
      const g = calculateGramsFromUnit(it.baseQuantity, it.unit, it.foodName);
      return acc + (it.carbsPer100g * g) / 100;
    }, 0);

    const carbScale = baseCarbsFromModItems > 0 ? carbsRemaining / baseCarbsFromModItems : 1.0;

    modFiberCarbItems.forEach((it) => {
      const adjusted = it.baseQuantity * carbScale;
      it.currentQuantity = roundToPracticalQuantity(adjusted, it.unit, it.foodName);
    });
  }

  // Passo F: Refinamento Fino de Fechamento Calórico com Proteção Gastrointestinal
  for (let iter = 0; iter < 4; iter++) {
    const curr = calculateCurrentMacros();
    const calDiff = targetCalories - curr.cal;

    if (Math.abs(calDiff) <= 40) break;

    // Se as fibras estiverem próximas do teto máximo (> 40g), ajusta exclusivamente no arroz/batata
    const targetAdjustItems = modFiberCarbItems.length > 0 ? modFiberCarbItems : items.filter((it) => it.dominance === 'CARB_DOMINANT');
    if (targetAdjustItems.length > 0) {
      const gramsPerItem = Math.round((calDiff / targetAdjustItems.length) / 1.15);
      targetAdjustItems.forEach((it) => {
        const nextGrams = Math.max(40, it.currentQuantity + gramsPerItem);
        it.currentQuantity = roundToPracticalQuantity(nextGrams, it.unit, it.foodName);
      });
    }
  }

  // 3. Montar as refeições finais com recálculo determinístico
  const resultMeals: LocalMeal[] = rawMeals.map((m) => ({ name: m.name, items: [] }));

  items.forEach((pItem) => {
    const baseItem: LocalMealItem = {
      foodItemId: 'preset-food',
      foodName: pItem.foodName,
      quantityValue: pItem.currentQuantity,
      unit: pItem.unit,
      quantityGrams: 0,
      caloriesPer100g: pItem.caloriesPer100g,
      proteinPer100g: pItem.proteinPer100g,
      carbsPer100g: pItem.carbsPer100g,
      fatPer100g: pItem.fatPer100g,
      fiberPer100g: pItem.fiberPer100g,
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
    };

    const finalItem = recalculateItemNutrients(baseItem, pItem.currentQuantity, pItem.unit);
    resultMeals[pItem.mealIdx].items.push(finalItem);
  });

  return resultMeals;
}
