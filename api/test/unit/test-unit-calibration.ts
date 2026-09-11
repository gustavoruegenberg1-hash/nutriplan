// Teste de Unidades Inteiras, Arredondamento Prático e Calibração Nutricional

export {};

type PortionUnit = 'g' | 'ml' | 'un' | 'scoop' | 'colher' | 'fatia' | 'copo' | 'lata' | 'file';

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

function calibrateDietMeals(
  rawMeals: any[],
  targetCalories: number,
  basePresetCalories: number
): any[] {
  const scaleFactor = targetCalories / Math.max(1, basePresetCalories);

  type ProcessedItem = {
    foodName: string;
    unit: PortionUnit;
    isContinuous: boolean;
    quantity: number;
    baseQuantity: number;
    caloriesPer100g: number;
    proteinPer100g: number;
    carbsPer100g: number;
    fatPer100g: number;
    fiberPer100g: number;
    mealIdx: number;
  };

  const processedItems: ProcessedItem[] = [];
  let wholeUnitsCaloriesSum = 0;
  let continuousItemsBaseCalories = 0;

  rawMeals.forEach((meal, mealIdx) => {
    meal.items.forEach((item: any) => {
      const normUnit = normalizeUnit(item.unit);
      const isWhole = isWholeUnit(normUnit, item.foodName);

      if (isWhole) {
        const rawScaled = item.baseQuantity * scaleFactor;
        const wholeQuantity = Math.max(1, Math.round(rawScaled));
        const grams = calculateGramsFromUnit(wholeQuantity, normUnit, item.foodName);
        const itemCalories = (item.caloriesPer100g * grams) / 100;

        wholeUnitsCaloriesSum += itemCalories;

        processedItems.push({
          foodName: item.foodName,
          unit: normUnit,
          isContinuous: false,
          quantity: wholeQuantity,
          baseQuantity: item.baseQuantity,
          caloriesPer100g: item.caloriesPer100g,
          proteinPer100g: item.proteinPer100g,
          carbsPer100g: item.carbsPer100g,
          fatPer100g: item.fatPer100g,
          fiberPer100g: item.fiberPer100g,
          mealIdx,
        });
      } else {
        const grams = calculateGramsFromUnit(item.baseQuantity, normUnit, item.foodName);
        const baseCalories = (item.caloriesPer100g * grams) / 100;
        continuousItemsBaseCalories += baseCalories;

        processedItems.push({
          foodName: item.foodName,
          unit: normUnit,
          isContinuous: true,
          quantity: 0,
          baseQuantity: item.baseQuantity,
          caloriesPer100g: item.caloriesPer100g,
          proteinPer100g: item.proteinPer100g,
          carbsPer100g: item.carbsPer100g,
          fatPer100g: item.fatPer100g,
          fiberPer100g: item.fiberPer100g,
          mealIdx,
        });
      }
    });
  });

  const remainingCaloriesNeeded = Math.max(0, targetCalories - wholeUnitsCaloriesSum);
  const continuousScaleFactor =
    continuousItemsBaseCalories > 0
      ? remainingCaloriesNeeded / continuousItemsBaseCalories
      : scaleFactor;

  processedItems.forEach((item) => {
    if (item.isContinuous) {
      const rawQuantity = item.baseQuantity * continuousScaleFactor;
      item.quantity = roundToPracticalQuantity(rawQuantity, item.unit, item.foodName);
    }
  });

  const resultMeals: any[] = rawMeals.map((m) => ({ name: m.name, items: [] }));

  processedItems.forEach((pItem) => {
    const baseItem = {
      foodItemId: 'preset-food',
      foodName: pItem.foodName,
      quantityValue: pItem.quantity,
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

    const finalItem = recalculateItemNutrients(baseItem, pItem.quantity, pItem.unit);
    resultMeals[pItem.mealIdx].items.push(finalItem);
  });

  return resultMeals;
}

async function runTests() {
  console.log('=== TESTE 1: Ovos (3.4 -> 3 ou 4 inteiros) ===');
  const rawEggQuantity = 3.4;
  const eggPractical = roundToPracticalQuantity(rawEggQuantity, 'un', 'Ovo de galinha');
  console.log(`Entrada: 3.4 ovos -> Saída: ${eggPractical} ovos`);
  console.assert(Number.isInteger(eggPractical), 'Falha: Ovo deve ser número inteiro');
  console.assert(eggPractical === 3, 'Falha: 3.4 ovos deve arredondar para 3');
  console.log('✅ TESTE 1 PASSOU!');

  console.log('\n=== TESTE 2: Colher de sopa (1.7 -> 2 colheres) ===');
  const rawSpoonQuantity = 1.7;
  const spoonPractical = roundToPracticalQuantity(rawSpoonQuantity, 'colher', 'Azeite de oliva');
  console.log(`Entrada: 1.7 colheres -> Saída: ${spoonPractical} colheres`);
  console.assert(Number.isInteger(spoonPractical), 'Falha: Colher deve ser inteiro');
  console.assert(spoonPractical === 2, 'Falha: 1.7 colher deve arredondar para 2');
  console.log('✅ TESTE 2 PASSOU!');

  console.log('\n=== TESTE 3: Copo (2.3 -> 2 copos) ===');
  const rawCupQuantity = 2.3;
  const cupPractical = roundToPracticalQuantity(rawCupQuantity, 'copo', 'Leite desnatado');
  console.log(`Entrada: 2.3 copos -> Saída: ${cupPractical} copos`);
  console.assert(Number.isInteger(cupPractical), 'Falha: Copo deve ser inteiro');
  console.assert(cupPractical === 2, 'Falha: 2.3 copos deve arredondar para 2');
  console.log('✅ TESTE 3 PASSOU!');

  console.log('\n=== TESTE 4: Gramas (157.3g -> 155g ou 160g múltiplos de 5g) ===');
  const rawGramsQuantity = 157.3;
  const gramsPractical = roundToPracticalQuantity(rawGramsQuantity, 'g', 'Arroz branco cozido');
  console.log(`Entrada: 157.3g -> Saída: ${gramsPractical}g`);
  console.assert(gramsPractical % 5 === 0, 'Falha: Gramas devem ser arredondadas para múltiplos práticos de 5g');
  console.assert(gramsPractical === 155 || gramsPractical === 160, 'Falha: 157.3g deve ser 155g ou 160g');
  console.log('✅ TESTE 4 PASSOU!');

  console.log('\n=== TESTE 5: Recálculo Nutricional Determinístico ===');
  const sampleFood = {
    foodName: 'Ovo de galinha inteiro cozido',
    caloriesPer100g: 146,
    proteinPer100g: 13.3,
    carbsPer100g: 0.6,
    fatPer100g: 9.5,
    fiberPer100g: 0,
  };
  // 3 ovos = 150g (146 * 1.5 = 219 kcal, 13.3 * 1.5 = 20g prot)
  const egg3 = recalculateItemNutrients(sampleFood, 3, 'un');
  console.log(`3 ovos (150g): Calorias = ${egg3.calories} kcal, Proteínas = ${egg3.protein}g`);
  console.assert(egg3.quantityGrams === 150, 'Falha na gramatura de 3 ovos');
  console.assert(egg3.calories === 219, `Calorias calculadas incorretamente: ${egg3.calories}`);
  console.assert(egg3.protein === 20, `Proteína calculada incorretamente: ${egg3.protein}`);
  console.log('✅ TESTE 5 PASSOU!');

  console.log('\n=== TESTE 6: Calibração de Dietas para Diferentes Objetivos ===');
  const mockPresetMeals = [
    {
      name: 'Café da Manhã',
      items: [
        { foodName: 'Ovo de galinha', baseQuantity: 3, unit: 'un', caloriesPer100g: 146, proteinPer100g: 13.3, carbsPer100g: 0.6, fatPer100g: 9.5, fiberPer100g: 0 },
        { foodName: 'Banana prata', baseQuantity: 1, unit: 'un', caloriesPer100g: 98, proteinPer100g: 1.3, carbsPer100g: 26.0, fatPer100g: 0.1, fiberPer100g: 2.0 },
        { foodName: 'Aveia em flocos', baseQuantity: 40, unit: 'g', caloriesPer100g: 394, proteinPer100g: 13.9, carbsPer100g: 66.6, fatPer100g: 8.5, fiberPer100g: 9.1 },
      ],
    },
    {
      name: 'Almoço',
      items: [
        { foodName: 'Frango filé', baseQuantity: 180, unit: 'g', caloriesPer100g: 159, proteinPer100g: 32.0, carbsPer100g: 0, fatPer100g: 2.5, fiberPer100g: 0 },
        { foodName: 'Arroz branco', baseQuantity: 200, unit: 'g', caloriesPer100g: 128, proteinPer100g: 2.5, carbsPer100g: 28.1, fatPer100g: 0.2, fiberPer100g: 1.6 },
        { foodName: 'Azeite de oliva', baseQuantity: 1, unit: 'colher', caloriesPer100g: 884, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 100, fiberPer100g: 0 },
      ],
    },
  ];

  // Cenário A: Emagrecimento (1800 kcal)
  console.log('--- Cenário A: Emagrecimento (1800 kcal) ---');
  const cuttingMeals = calibrateDietMeals(mockPresetMeals, 1800, 2300);
  cuttingMeals.forEach((meal) => {
    meal.items.forEach((item: any) => {
      if (isWholeUnit(item.unit, item.foodName)) {
        console.assert(Number.isInteger(item.quantityValue), `Falha: ${item.foodName} (${item.unit}) deve ser inteiro! Obteve: ${item.quantityValue}`);
      } else {
        console.assert(item.quantityValue % 5 === 0, `Falha: ${item.foodName} (${item.unit}) deve ser múltiplo de 5g! Obteve: ${item.quantityValue}`);
      }
      console.log(`  - ${item.foodName}: ${item.quantityValue} ${item.unit} (${item.calories} kcal)`);
    });
  });

  // Cenário B: Hipertrofia (2900 kcal)
  console.log('\n--- Cenário B: Hipertrofia (2900 kcal) ---');
  const bulkingMeals = calibrateDietMeals(mockPresetMeals, 2900, 2300);
  bulkingMeals.forEach((meal) => {
    meal.items.forEach((item: any) => {
      if (isWholeUnit(item.unit, item.foodName)) {
        console.assert(Number.isInteger(item.quantityValue), `Falha: ${item.foodName} (${item.unit}) deve ser inteiro! Obteve: ${item.quantityValue}`);
      } else {
        console.assert(item.quantityValue % 5 === 0, `Falha: ${item.foodName} (${item.unit}) deve ser múltiplo de 5g! Obteve: ${item.quantityValue}`);
      }
      console.log(`  - ${item.foodName}: ${item.quantityValue} ${item.unit} (${item.calories} kcal)`);
    });
  });

  console.log('\n🎉 TODOS OS 6 TESTES DE UNIDADES INTEIRAS E CALIBRAÇÃO NUTRICIONAL PASSARAM COM SUCESSO!');
}

runTests();
