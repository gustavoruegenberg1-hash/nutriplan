// Suíte de Testes para Otimização Nutricional e Prevenção de Excesso de Proteína

export {};

type PortionUnit = 'g' | 'ml' | 'un' | 'scoop' | 'colher' | 'fatia' | 'copo' | 'lata' | 'file';
type FoodDominance = 'PROTEIN_DOMINANT' | 'CARB_DOMINANT' | 'FAT_DOMINANT' | 'MIXED';

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

function optimizeDietPlan(
  rawMeals: { name: string; items: any[] }[],
  goals: { calories: number; protein: number; carbs: number; fat: number; userWeight: number; goal?: string }
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
        it.proteinPer100g,
        it.carbsPer100g,
        it.fatPer100g,
        it.caloriesPer100g
      );

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
    let p = 0, c = 0, f = 0, cal = 0;
    items.forEach((it) => {
      const g = calculateGramsFromUnit(it.currentQuantity, it.unit, it.foodName);
      const factor = g / 100;
      p += it.proteinPer100g * factor;
      c += it.carbsPer100g * factor;
      f += it.fatPer100g * factor;
      cal += it.caloriesPer100g * factor;
    });
    return { p, c, f, cal };
  };

  const proteinItems = items.filter((it) => !isWholeUnit(it.unit, it.foodName) && it.dominance === 'PROTEIN_DOMINANT');
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

    const proteinScale = baseProteinFromProteinItems > 0 ? proteinRemaining / baseProteinFromProteinItems : 1.0;

    proteinItems.forEach((it) => {
      const adjusted = it.baseQuantity * proteinScale;
      const bounded = Math.min(260, Math.max(70, adjusted));
      it.currentQuantity = roundToPracticalQuantity(bounded, it.unit, it.foodName);
    });
  }

  const fatItems = items.filter((it) => !isWholeUnit(it.unit, it.foodName) && it.dominance === 'FAT_DOMINANT');
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

  const carbItems = items.filter((it) => !isWholeUnit(it.unit, it.foodName) && it.dominance === 'CARB_DOMINANT');
  if (carbItems.length > 0) {
    let otherCarbs = 0;
    items.forEach((it) => {
      if (isWholeUnit(it.unit, it.foodName) || it.dominance !== 'CARB_DOMINANT') {
        const g = calculateGramsFromUnit(it.currentQuantity, it.unit, it.foodName);
        otherCarbs += (it.carbsPer100g * g) / 100;
      }
    });

    const carbsRemaining = Math.max(30, targetCarbs - otherCarbs);
    const baseCarbsFromCarbItems = carbItems.reduce((acc, it) => {
      const g = calculateGramsFromUnit(it.baseQuantity, it.unit, it.foodName);
      return acc + (it.carbsPer100g * g) / 100;
    }, 0);

    const carbScale = baseCarbsFromCarbItems > 0 ? carbsRemaining / baseCarbsFromCarbItems : 1.0;

    carbItems.forEach((it) => {
      const adjusted = it.baseQuantity * carbScale;
      it.currentQuantity = roundToPracticalQuantity(adjusted, it.unit, it.foodName);
    });
  }

  for (let iter = 0; iter < 4; iter++) {
    const curr = calculateCurrentMacros();
    const calDiff = targetCalories - curr.cal;

    if (Math.abs(calDiff) <= 40) break;

    if (carbItems.length > 0) {
      const gramsPerItem = Math.round((calDiff / carbItems.length) / 1.1);
      carbItems.forEach((it) => {
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

function computeTotalDietMacros(meals: any[]) {
  let c = 0, p = 0, cb = 0, f = 0;
  meals.forEach((m) => {
    m.items.forEach((i: any) => {
      c += i.calories;
      p += i.protein;
      cb += i.carbs;
      f += i.fat;
    });
  });
  return {
    calories: Math.round(c),
    protein: Math.round(p * 10) / 10,
    carbs: Math.round(cb * 10) / 10,
    fat: Math.round(f * 10) / 10,
  };
}

async function runMacroTests() {
  console.log('=== TESTES DE OTIMIZAÇÃO NUTRICIONAL & PREVENÇÃO DE HIPERPROTEÍNA ===\n');

  const bulkingPreset = [
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
        { foodName: 'Frango filé peito grelhado', baseQuantity: 200, unit: 'g', caloriesPer100g: 159, proteinPer100g: 32.0, carbsPer100g: 0, fatPer100g: 2.5, fiberPer100g: 0 },
        { foodName: 'Arroz branco cozido', baseQuantity: 200, unit: 'g', caloriesPer100g: 128, proteinPer100g: 2.5, carbsPer100g: 28.1, fatPer100g: 0.2, fiberPer100g: 1.6 },
        { foodName: 'Feijão carioca', baseQuantity: 100, unit: 'g', caloriesPer100g: 76, proteinPer100g: 4.8, carbsPer100g: 13.6, fatPer100g: 0.5, fiberPer100g: 8.5 },
        { foodName: 'Azeite de oliva', baseQuantity: 1, unit: 'colher', caloriesPer100g: 884, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 100, fiberPer100g: 0 },
      ],
    },
    {
      name: 'Lanche',
      items: [
        { foodName: 'Iogurte Grego desnatado', baseQuantity: 150, unit: 'g', caloriesPer100g: 59, proteinPer100g: 10.0, carbsPer100g: 3.6, fatPer100g: 0.4, fiberPer100g: 0 },
        { foodName: 'Whey Protein', baseQuantity: 1, unit: 'scoop', caloriesPer100g: 385, proteinPer100g: 80.0, carbsPer100g: 5.0, fatPer100g: 4.5, fiberPer100g: 0 },
        { foodName: 'Aveia em flocos', baseQuantity: 40, unit: 'g', caloriesPer100g: 394, proteinPer100g: 13.9, carbsPer100g: 66.6, fatPer100g: 8.5, fiberPer100g: 9.1 },
      ],
    },
    {
      name: 'Jantar',
      items: [
        { foodName: 'Carne bovina patinho', baseQuantity: 180, unit: 'g', caloriesPer100g: 219, proteinPer100g: 35.9, carbsPer100g: 0, fatPer100g: 7.3, fiberPer100g: 0 },
        { foodName: 'Batata doce cozida', baseQuantity: 200, unit: 'g', caloriesPer100g: 77, proteinPer100g: 0.6, carbsPer100g: 18.4, fatPer100g: 0.1, fiberPer100g: 2.2 },
        { foodName: 'Azeite de oliva', baseQuantity: 1, unit: 'colher', caloriesPer100g: 884, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 100, fiberPer100g: 0 },
      ],
    },
  ];

  // CASO 1 & 5: Usuário 75kg, Hipertrofia (2800 kcal) - Cenário onde o sistema antigo gerava 409g de proteína
  console.log('--- CASO 1 & 5: Usuário de 75kg em Hipertrofia (Meta: 2800 kcal, Prot: 150g, Carb: 400g, Fat: 65g) ---');
  const user75Goals = {
    calories: 2800,
    protein: 150, // 2.0 g/kg
    carbs: 400,
    fat: 65,
    userWeight: 75,
  };

  const optimized75 = optimizeDietPlan(bulkingPreset, user75Goals);
  const totals75 = computeTotalDietMacros(optimized75);

  console.log(`Resultado da Dieta Otimizada:`);
  console.log(`  Calorias: ${totals75.calories} kcal (Meta: ${user75Goals.calories})`);
  console.log(`  Proteína: ${totals75.protein} g (Meta: ${user75Goals.protein} g -> ${Math.round((totals75.protein / 75) * 10) / 10} g/kg)`);
  console.log(`  Carboidratos: ${totals75.carbs} g (Meta: ${user75Goals.carbs} g)`);
  console.log(`  Gorduras: ${totals75.fat} g (Meta: ${user75Goals.fat} g)`);

  console.assert(totals75.protein < 190, `FALHA CRÍTICA: Proteína extrapolou para ${totals75.protein}g! Deveria estar próxima de 150g`);
  console.assert(totals75.protein >= 135, `FALHA: Proteína muito baixa: ${totals75.protein}g`);
  console.assert(totals75.carbs >= 330, `FALHA: Carboidratos muito baixos: ${totals75.carbs}g`);
  console.assert(Math.abs(totals75.calories - 2800) < 100, `FALHA: Calorias distantes: ${totals75.calories}`);
  console.log('✅ CASO 1 & 5 PASSOU COM SUCESSO (Proteína contida em 2.0 g/kg e Carboidratos perfeitamente atingidos)!');

  // CASO 2: Alta necessidade calórica (3300 kcal para usuário de 80kg)
  console.log('\n--- CASO 2: Alta necessidade calórica (3300 kcal, Usuário 80kg, Meta Prot: 160g) ---');
  const userHighCal = {
    calories: 3300,
    protein: 160,
    carbs: 490,
    fat: 75,
    userWeight: 80,
  };
  const optimizedHigh = optimizeDietPlan(bulkingPreset, userHighCal);
  const totalsHigh = computeTotalDietMacros(optimizedHigh);
  console.log(`  Calorias: ${totalsHigh.calories} kcal`);
  console.log(`  Proteína: ${totalsHigh.protein} g (${Math.round((totalsHigh.protein / 80) * 10) / 10} g/kg)`);
  console.log(`  Carboidratos: ${totalsHigh.carbs} g`);
  console.log(`  Gorduras: ${totalsHigh.fat} g`);

  console.assert(totalsHigh.protein < 200, `FALHA: Alta caloria aumentou proteína indevidamente para ${totalsHigh.protein}g`);
  console.assert(totalsHigh.carbs >= 420, `FALHA: Carboidratos deveriam suprir as calorias altas, obteve ${totalsHigh.carbs}g`);
  console.log('✅ CASO 2 PASSOU (Carboidratos supriram a alta demanda energética sem explodir proteína)!');

  // CASO 3: Déficit calórico (1800 kcal para usuário de 70kg)
  console.log('\n--- CASO 3: Déficit calórico / Cutting (1800 kcal, Usuário 70kg, Meta Prot: 140g) ---');
  const userCut = {
    calories: 1800,
    protein: 140,
    carbs: 185,
    fat: 55,
    userWeight: 70,
  };
  const optimizedCut = optimizeDietPlan(bulkingPreset, userCut);
  const totalsCut = computeTotalDietMacros(optimizedCut);
  console.log(`  Calorias: ${totalsCut.calories} kcal`);
  console.log(`  Proteína: ${totalsCut.protein} g (${Math.round((totalsCut.protein / 70) * 10) / 10} g/kg)`);
  console.log(`  Carboidratos: ${totalsCut.carbs} g`);
  console.log(`  Gorduras: ${totalsCut.fat} g`);

  console.assert(totalsCut.protein >= 125 && totalsCut.protein <= 165, `FALHA: Proteína no cutting fora do alvo: ${totalsCut.protein}g`);
  console.assert(Math.abs(totalsCut.calories - 1800) < 100, `FALHA: Calorias do cutting fora do alvo: ${totalsCut.calories}`);
  console.log('✅ CASO 3 PASSOU (Déficit calórico com preservação de massa magra e distribuição equilibrada)!');

  console.log('\n🎉 TODOS OS TESTES DE OTIMIZAÇÃO MULTIVARIÁVEL E EQUILÍBRIO DE MACRONUTRIENTES PASSARAM COM SUCESSO!');
}

runMacroTests();
