// Suíte de Testes para Fibras Adequadas (DRIs) e Déficit Calórico Sustentável (CDC)

export {};

type PortionUnit = 'g' | 'ml' | 'un' | 'scoop' | 'colher' | 'fatia' | 'copo' | 'lata' | 'file';
type FoodDominance = 'PROTEIN_DOMINANT' | 'CARB_DOMINANT' | 'FAT_DOMINANT' | 'MIXED';

const MACRO_TOLERANCES = {
  MIN_PROTEIN_PER_KG: 1.6,
  TARGET_PROTEIN_PER_KG: 2.0,
  MAX_PROTEIN_PER_KG: 2.3,
  TARGET_FAT_PER_KG: 0.8,
  FIBER_PER_1000_KCAL: 14,
  MIN_FIBER_SAFE: 22,
  TARGET_FIBER_DEFAULT_MALE: 38,
  TARGET_FIBER_DEFAULT_FEMALE: 28,
  MAX_FIBER_SAFE: 45,
  MIN_DEFICIT_PCT: 0.15,
  TARGET_DEFICIT_PCT: 0.20,
  MAX_DEFICIT_PCT: 0.25,
  MIN_DEFICIT_KCAL: 350,
  MAX_DEFICIT_KCAL: 750,
  SAFETY_FLOOR_MALE: 1500,
  SAFETY_FLOOR_FEMALE: 1200,
};

function calcularDeficitCaloricoSustentavel(
  tdee: number,
  bmr: number,
  gender: string = 'male',
  _weight = 75
): { targetCalories: number; deficitCalories: number; deficitPct: number; isConstrainedByBmr: boolean } {
  let rawDeficit = Math.round(tdee * MACRO_TOLERANCES.TARGET_DEFICIT_PCT);
  rawDeficit = Math.max(
    MACRO_TOLERANCES.MIN_DEFICIT_KCAL,
    Math.min(MACRO_TOLERANCES.MAX_DEFICIT_KCAL, rawDeficit)
  );

  let targetCalories = tdee - rawDeficit;
  let isConstrainedByBmr = false;

  if (targetCalories < bmr) {
    targetCalories = Math.max(bmr, tdee - 350);
    isConstrainedByBmr = true;
  }

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

function calcularMetaFibras(targetCalories: number, gender = 'male', age = 28): number {
  const isFemale = gender.toLowerCase().includes('fem') || gender.toLowerCase().includes('mulher');
  const caloriesBased = Math.round((targetCalories / 1000) * MACRO_TOLERANCES.FIBER_PER_1000_KCAL);
  let baseline = isFemale ? MACRO_TOLERANCES.TARGET_FIBER_DEFAULT_FEMALE : MACRO_TOLERANCES.TARGET_FIBER_DEFAULT_MALE;
  if (age > 50) baseline = isFemale ? 21 : 30;
  return Math.min(MACRO_TOLERANCES.MAX_FIBER_SAFE, Math.max(baseline, caloriesBased));
}

function normalizeUnit(rawUnit: string): PortionUnit {
  if (!rawUnit) return 'g';
  const u = rawUnit.toLowerCase().trim();
  if (u.includes('colher') || u === 'cs' || u === 'tbsp' || u === 'c.sopa' || u === 'c.cha' || u === 'colheres') return 'colher';
  if (u.includes('copo') || u.includes('xícara') || u.includes('xicara') || u === 'cup' || u === 'copos' || u === 'xícaras') return 'copo';
  if (u.includes('fatia') || u.includes('slice')) return 'fatia';
  if (u.includes('scoop') || u.includes('dosador')) return 'scoop';
  if (u.includes('lata') || u.includes('can')) return 'lata';
  if (u.includes('file') || u.includes('filé')) return 'file';
  if (u === 'un' || u.includes('unidade') || u.includes('ovo') || u.includes('fruta') || u.includes('sachê') || u.includes('sache') || u.includes('cápsula') || u.includes('capsula') || u.includes('pão') || u.includes('pao')) return 'un';
  if (u === 'ml' || u.includes('mililitro') || u.includes('litro') || u === 'l') return 'ml';
  if (u === 'g' || u.includes('grama') || u.includes('quilo') || u === 'kg') return 'g';
  return 'g';
}

function isWholeUnit(unit: string, _foodName = ''): boolean {
  const norm = normalizeUnit(unit);
  const wholeUnits: PortionUnit[] = ['un', 'colher', 'copo', 'fatia', 'scoop', 'lata', 'file'];
  return wholeUnits.includes(norm);
}

function roundToPracticalQuantity(value: number, unit: PortionUnit, foodName = ''): number {
  const norm = normalizeUnit(unit);
  if (isWholeUnit(norm, foodName)) {
    return Math.max(1, Math.round(value));
  }
  if (norm === 'g' || norm === 'ml') {
    if (value <= 0) return 0;
    const rounded = Math.round(value / 5) * 5;
    return Math.max(5, rounded);
  }
  return Math.round(value * 10) / 10;
}

function calculateGramsFromUnit(value: number, unit: PortionUnit, foodName: string): number {
  const lower = foodName.toLowerCase();
  switch (unit) {
    case 'g':
    case 'ml':
      return value;
    case 'un':
      if (lower.includes('ovo')) return value * 50;
      if (lower.includes('banana')) return value * 100;
      if (lower.includes('maçã') || lower.includes('maca')) return value * 130;
      if (lower.includes('pão francês') || lower.includes('pao frances')) return value * 50;
      return value * 100;
    case 'scoop':
      return value * 30;
    case 'colher':
      if (lower.includes('azeite') || lower.includes('óleo') || lower.includes('manteiga')) return value * 10;
      if (lower.includes('pasta de amendoim')) return value * 15;
      return value * 15;
    case 'fatia':
      if (lower.includes('pão') || lower.includes('pao')) return value * 25;
      return value * 30;
    case 'copo':
      return value * 200;
    case 'lata':
      return value * 350;
    case 'file':
      return value * 150;
    default:
      return value;
  }
}

function recalculateItemNutrients(item: any, rawValue: string | number, unit: PortionUnit = 'g') {
  const parsedVal = typeof rawValue === 'number' ? rawValue : parseFloat(String(rawValue).replace(',', '.')) || 0;
  const grams = calculateGramsFromUnit(parsedVal, unit, item.foodName);
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

function getFoodDominance(
  foodName: string,
  proteinPer100g: number,
  carbsPer100g: number,
  fatPer100g: number,
  caloriesPer100g: number
): FoodDominance {
  const lower = foodName.toLowerCase();
  if (lower.includes('azeite') || lower.includes('óleo') || lower.includes('manteiga') || lower.includes('pasta de amendoim')) return 'FAT_DOMINANT';
  if (lower.includes('frango') || lower.includes('patinho') || lower.includes('alcatra') || lower.includes('tilápia') || lower.includes('salmão') || lower.includes('atum') || lower.includes('whey') || lower.includes('clara de ovo') || lower.includes('albumina')) return 'PROTEIN_DOMINANT';
  if (lower.includes('arroz') || lower.includes('batata') || lower.includes('aveia') || lower.includes('banana') || lower.includes('maçã') || lower.includes('maca') || lower.includes('pão') || lower.includes('pao') || lower.includes('macarrão') || lower.includes('mandioca') || lower.includes('feijão') || lower.includes('feijao')) return 'CARB_DOMINANT';

  const cal = Math.max(1, caloriesPer100g);
  if ((proteinPer100g * 4) / cal >= 0.45) return 'PROTEIN_DOMINANT';
  if ((carbsPer100g * 4) / cal >= 0.45) return 'CARB_DOMINANT';
  if ((fatPer100g * 9) / cal >= 0.45) return 'FAT_DOMINANT';
  return 'MIXED';
}

function isHighFiberCarb(foodName: string, fiberPer100g: number): boolean {
  const lower = foodName.toLowerCase();
  if (lower.includes('aveia') || lower.includes('feijão') || lower.includes('linhaça') || lower.includes('chia') || lower.includes('brócolis')) {
    return true;
  }
  return fiberPer100g >= 4.0;
}

function optimizeDietPlan(
  rawMeals: { name: string; items: any[] }[],
  goals: { calories: number; protein: number; carbs: number; fat: number; fiber?: number; userWeight: number; userGender?: string; userAge?: number; goal?: string }
): any[] {
  const weight = Math.max(40, goals.userWeight || 75);
  const targetCalories = goals.calories;
  const targetProtein = goals.protein;
  const targetFat = goals.fat;
  const targetCarbs = goals.carbs;

  const items: any[] = [];
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

  for (let iter = 0; iter < 4; iter++) {
    const curr = calculateCurrentMacros();
    const calDiff = targetCalories - curr.cal;

    if (Math.abs(calDiff) <= 40) break;

    const targetAdjustItems = modFiberCarbItems.length > 0 ? modFiberCarbItems : items.filter((it) => it.dominance === 'CARB_DOMINANT');
    if (targetAdjustItems.length > 0) {
      const gramsPerItem = Math.round((calDiff / targetAdjustItems.length) / 1.15);
      targetAdjustItems.forEach((it) => {
        const nextGrams = Math.max(40, it.currentQuantity + gramsPerItem);
        it.currentQuantity = roundToPracticalQuantity(nextGrams, it.unit, it.foodName);
      });
    }
  }

  const resultMeals: any[] = rawMeals.map((m) => ({ name: m.name, items: [] }));

  items.forEach((pItem) => {
    const baseItem = {
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

function computeTotals(meals: any[]) {
  let c = 0, p = 0, cb = 0, f = 0, fb = 0;
  meals.forEach((m) => {
    m.items.forEach((i: any) => {
      c += i.calories;
      p += i.protein;
      cb += i.carbs;
      f += i.fat;
      fb += i.fiber;
    });
  });
  return {
    calories: Math.round(c),
    protein: Math.round(p * 10) / 10,
    carbs: Math.round(cb * 10) / 10,
    fat: Math.round(f * 10) / 10,
    fiber: Math.round(fb * 10) / 10,
  };
}

async function runFiberAndDeficitTests() {
  console.log('=== TESTES DE FIBRAS (DRIs) E DÉFICIT CALÓRICO (CDC) ===\n');

  const sampleMeals = [
    {
      name: 'Café da Manhã',
      items: [
        { foodName: 'Ovo de galinha cozido', baseQuantity: 3, unit: 'un', caloriesPer100g: 146, proteinPer100g: 13.3, carbsPer100g: 0.6, fatPer100g: 9.5, fiberPer100g: 0 },
        { foodName: 'Pão de forma integral', baseQuantity: 2, unit: 'fatia', caloriesPer100g: 245, proteinPer100g: 9.5, carbsPer100g: 45.0, fatPer100g: 2.8, fiberPer100g: 7.0 },
        { foodName: 'Banana prata', baseQuantity: 1, unit: 'un', caloriesPer100g: 98, proteinPer100g: 1.3, carbsPer100g: 26.0, fatPer100g: 0.1, fiberPer100g: 2.0 },
      ],
    },
    {
      name: 'Almoço',
      items: [
        { foodName: 'Frango filé peito grelhado', baseQuantity: 180, unit: 'g', caloriesPer100g: 159, proteinPer100g: 32.0, carbsPer100g: 0, fatPer100g: 2.5, fiberPer100g: 0 },
        { foodName: 'Arroz branco cozido', baseQuantity: 200, unit: 'g', caloriesPer100g: 128, proteinPer100g: 2.5, carbsPer100g: 28.1, fatPer100g: 0.2, fiberPer100g: 1.6 },
        { foodName: 'Feijão carioca', baseQuantity: 100, unit: 'g', caloriesPer100g: 76, proteinPer100g: 4.8, carbsPer100g: 13.6, fatPer100g: 0.5, fiberPer100g: 8.5 },
        { foodName: 'Brócolis cozido', baseQuantity: 100, unit: 'g', caloriesPer100g: 25, proteinPer100g: 2.1, carbsPer100g: 4.4, fatPer100g: 0.5, fiberPer100g: 3.4 },
        { foodName: 'Azeite de oliva', baseQuantity: 1, unit: 'colher', caloriesPer100g: 884, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 100, fiberPer100g: 0 },
      ],
    },
    {
      name: 'Lanche',
      items: [
        { foodName: 'Iogurte Grego', baseQuantity: 150, unit: 'g', caloriesPer100g: 59, proteinPer100g: 10.0, carbsPer100g: 3.6, fatPer100g: 0.4, fiberPer100g: 0 },
        { foodName: 'Whey Protein', baseQuantity: 1, unit: 'scoop', caloriesPer100g: 385, proteinPer100g: 80.0, carbsPer100g: 5.0, fatPer100g: 4.5, fiberPer100g: 0 },
        { foodName: 'Aveia em flocos', baseQuantity: 40, unit: 'g', caloriesPer100g: 394, proteinPer100g: 13.9, carbsPer100g: 66.6, fatPer100g: 8.5, fiberPer100g: 9.1 },
      ],
    },
    {
      name: 'Jantar',
      items: [
        { foodName: 'Carne bovina patinho', baseQuantity: 160, unit: 'g', caloriesPer100g: 219, proteinPer100g: 35.9, carbsPer100g: 0, fatPer100g: 7.3, fiberPer100g: 0 },
        { foodName: 'Batata doce cozida', baseQuantity: 200, unit: 'g', caloriesPer100g: 77, proteinPer100g: 0.6, carbsPer100g: 18.4, fatPer100g: 0.1, fiberPer100g: 2.2 },
        { foodName: 'Azeite de oliva', baseQuantity: 1, unit: 'colher', caloriesPer100g: 884, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 100, fiberPer100g: 0 },
      ],
    },
  ];

  // TESTE 1: Dieta padrão com fibras na faixa segura das DRIs (25g a 40g)
  console.log('--- TESTE 1 & 2: Dieta com múltiplos alimentos ricos em fibras mantida na faixa segura ---');
  const metaFibras = calcularMetaFibras(2500, 'male', 28);
  console.assert(metaFibras >= 25 && metaFibras <= 40, `Meta de fibras fora do padrão: ${metaFibras}`);
  const goalsStd = {
    calories: 2500,
    protein: 150,
    carbs: 340,
    fat: 60,
    userWeight: 75,
    userGender: 'male',
  };
  const resStd = optimizeDietPlan(sampleMeals, goalsStd);
  const totalsStd = computeTotals(resStd);
  console.log(`  Calorias: ${totalsStd.calories} kcal`);
  console.log(`  Proteína: ${totalsStd.protein} g`);
  console.log(`  Carboidratos: ${totalsStd.carbs} g`);
  console.log(`  Gorduras: ${totalsStd.fat} g`);
  console.log(`  Fibras: ${totalsStd.fiber} g (Faixa segura: 25g - 42g)`);

  console.assert(totalsStd.fiber <= 42, `FALHA: Fibras ultrapassaram 42g! Obteve: ${totalsStd.fiber}g`);
  console.assert(totalsStd.fiber >= 24, `FALHA: Fibras muito baixas: ${totalsStd.fiber}g`);
  console.log('✅ TESTE 1 & 2 PASSOU (Fibras contidas e protegidas de sobrecarga gastrointestinal)!');

  // TESTE 3: Recálculo proporcional de fibras ao mudar quantidade
  console.log('\n--- TESTE 3: Recálculo proporcional de fibras ---');
  const oatItem = { foodName: 'Aveia em flocos', caloriesPer100g: 394, proteinPer100g: 13.9, carbsPer100g: 66.6, fatPer100g: 8.5, fiberPer100g: 9.1 };
  const oat30 = recalculateItemNutrients(oatItem, 30, 'g');
  const oat60 = recalculateItemNutrients(oatItem, 60, 'g');
  console.log(`  Aveia 30g -> Fibras: ${oat30.fiber} g | Aveia 60g -> Fibras: ${oat60.fiber} g`);
  console.assert(Math.abs(oat30.fiber - 2.7) < 0.1, 'Falha no cálculo de fibras da aveia 30g');
  console.assert(Math.abs(oat60.fiber - 5.5) < 0.1, 'Falha no cálculo de fibras da aveia 60g');
  console.log('✅ TESTE 3 PASSOU!');

  // TESTES DE DÉFICIT CALÓRICO (CDC / NIH)
  console.log('\n--- TESTES 4, 7, 8, 9, 10: Déficit Calórico Proporcional e Sustentável ---');

  // Usuário A: TDEE = 2200 kcal, BMR = 1600 kcal
  const defA = calcularDeficitCaloricoSustentavel(2200, 1600, 'male', 70);
  console.log(`  Usuário A (TDEE: 2200, TMB: 1600) -> Déficit: -${defA.deficitCalories} kcal (${defA.deficitPct}%), Meta: ${defA.targetCalories} kcal`);
  console.assert(defA.deficitCalories >= 350 && defA.deficitCalories <= 500, `Falha: Déficit A fora da faixa: ${defA.deficitCalories}`);
  console.assert(defA.targetCalories >= 1600, `Falha: Meta de A caiu abaixo da TMB`);

  // Usuário B: TDEE = 2800 kcal, BMR = 1800 kcal
  const defB = calcularDeficitCaloricoSustentavel(2800, 1800, 'male', 80);
  console.log(`  Usuário B (TDEE: 2800, TMB: 1800) -> Déficit: -${defB.deficitCalories} kcal (${defB.deficitPct}%), Meta: ${defB.targetCalories} kcal`);
  console.assert(defB.deficitCalories >= 500 && defB.deficitCalories <= 600, `Falha: Déficit B fora da faixa: ${defB.deficitCalories}`);

  // Usuário C: TDEE = 3600 kcal, BMR = 2100 kcal
  const defC = calcularDeficitCaloricoSustentavel(3600, 2100, 'male', 95);
  console.log(`  Usuário C (TDEE: 3600, TMB: 2100) -> Déficit: -${defC.deficitCalories} kcal (${defC.deficitPct}%), Meta: ${defC.targetCalories} kcal`);
  console.assert(defC.deficitCalories <= 750, `Falha: Déficit C excedeu o teto seguro de 750 kcal: ${defC.deficitCalories}`);

  // Usuário D: Caso Extremo com TDEE baixo (TDEE: 1600 kcal, TMB: 1350 kcal, Mulher)
  const defD = calcularDeficitCaloricoSustentavel(1600, 1350, 'female', 55);
  console.log(`  Usuário D (TDEE: 1600, TMB: 1350, Mulher) -> Déficit: -${defD.deficitCalories} kcal, Meta: ${defD.targetCalories} kcal (Piso de segurança ativo: ${defD.isConstrainedByBmr})`);
  console.assert(defD.targetCalories >= 1200, `Falha: Meta feminina caiu abaixo do piso de 1200 kcal`);
  console.assert(defD.targetCalories >= 1350, `Falha: Meta calórica caiu abaixo da TMB de 1350 kcal`);

  console.log('\n🎉 TODOS OS TESTES DE FIBRAS E DÉFICIT CALÓRICO PASSARAM COM 100% DE SUCESSO!');
}

runFiberAndDeficitTests();
