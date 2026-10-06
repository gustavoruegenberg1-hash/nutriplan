import { describe, it, expect } from 'vitest';
import { NutritionCalculatorService } from './nutrition-calculator.service';
import { BadRequestException } from '@nestjs/common';

describe('NutritionCalculatorService (Cálculo Nutricional Científico)', () => {
  const calc = new NutritionCalculatorService();

  it('TEST-NUTR-001: deve calcular a TMB exata de um homem segundo Mifflin-St Jeor (RN06)', () => {
    // 80kg, 180cm, 30 anos, MALE: 10*80 + 6.25*180 - 5*30 + 5 = 800 + 1125 - 150 + 5 = 1780 kcal
    const bmr = calc.calculateBMR(80, 180, 30, 'MALE');
    expect(bmr).toBe(1780);
  });

  it('TEST-NUTR-002: deve calcular a TMB exata de uma mulher segundo Mifflin-St Jeor (RN06)', () => {
    // 60kg, 165cm, 25 anos, FEMALE: 10*60 + 6.25*165 - 5*25 - 161 = 600 + 1031.25 - 125 - 161 = 1345.25 -> 1345.3 kcal
    const bmr = calc.calculateBMR(60, 165, 25, 'FEMALE');
    expect(bmr).toBe(1345.3);
  });

  it('TEST-NUTR-003: deve rejeitar parâmetros antropométricos inválidos ou extremos', () => {
    expect(() => calc.calculateBMR(10, 180, 30, 'MALE')).toThrow(BadRequestException);
    expect(() => calc.calculateBMR(80, 30, 30, 'MALE')).toThrow(BadRequestException);
    expect(() => calc.calculateBMR(80, 180, 5, 'MALE')).toThrow(BadRequestException);
  });

  it('TEST-NUTR-004: deve calcular o TDEE aplicando multiplicadores de atividade física (RN07)', () => {
    const bmr = 1780;
    expect(calc.calculateTDEE(bmr, 'SEDENTARY')).toBe(Math.round(1780 * 1.2));
    expect(calc.calculateTDEE(bmr, 'LIGHTLY_ACTIVE')).toBe(Math.round(1780 * 1.375));
    expect(calc.calculateTDEE(bmr, 'MODERATELY_ACTIVE')).toBe(Math.round(1780 * 1.55));
    expect(calc.calculateTDEE(bmr, 'VERY_ACTIVE')).toBe(Math.round(1780 * 1.725));
    expect(calc.calculateTDEE(bmr, 'EXTRA_ACTIVE')).toBe(Math.round(1780 * 1.9));
  });

  it('TEST-NUTR-005: deve calcular meta calórica e distribuição de macronutrientes por objetivo (RN08, RN09)', () => {
    const tdee = 2500;
    const weight = 80;

    // Emagrecimento: déficit de 500 kcal -> 2000 kcal
    const cut = calc.calculateTargets(tdee, 'LOSE_WEIGHT', weight, 'MALE');
    expect(cut.calories).toBe(2000);
    // Proteína: 2.0 * 80 = 160g (640 kcal)
    expect(cut.proteinGrams).toBe(160);
    // Gordura: 0.9 * 80 = 72g (648 kcal)
    expect(cut.fatGrams).toBe(72);
    // Restante em carbo: (2000 - (640 + 648)) / 4 = 712 / 4 = 178g
    expect(cut.carbsGrams).toBe(178);

    // Hipertrofia: superávit de 350 kcal -> 2850 kcal
    const bulk = calc.calculateTargets(tdee, 'GAIN_WEIGHT', weight, 'MALE');
    expect(bulk.calories).toBe(2850);
  });

  it('TEST-NUTR-006: deve calcular proporcionalmente os nutrientes com base em 100g de referência (RN10)', () => {
    const alimentoTaco = {
      name: 'Peito de Frango Grelhado',
      caloriesPer100g: 159,
      proteinPer100g: 32.0,
      carbsPer100g: 0,
      fatPer100g: 2.5,
      fiberPer100g: 0,
      sodiumMgPer100g: 50,
    };

    // Para 150g (fator 1.5):
    // Calorias: 159 * 1.5 = 238.5 -> 239 kcal
    // Proteína: 32 * 1.5 = 48.0g
    // Gordura: 2.5 * 1.5 = 3.75 -> 3.8g
    const prop = calc.calculateProportions(alimentoTaco, 150);
    expect(prop.calories).toBe(239);
    expect(prop.protein).toBe(48.0);
    expect(prop.carbs).toBe(0);
    expect(prop.fat).toBe(3.8);
    expect(prop.sodium).toBe(75.0);
  });

  it('TEST-NUTR-007: deve rejeitar porção menor ou igual a zero (RN14)', () => {
    const food = { caloriesPer100g: 100, proteinPer100g: 10, carbsPer100g: 10, fatPer100g: 2, fiberPer100g: 1 };
    expect(() => calc.calculateProportions(food, 0)).toThrow(BadRequestException);
    expect(() => calc.calculateProportions(food, -50)).toThrow(BadRequestException);
  });

  it('TEST-NUTR-008: deve identificar incompatibilidades de restrições alimentares (RN17)', () => {
    const queijo = { name: 'Queijo Minas Frescal', category: 'Leite e derivados' };
    const pãoTrigo = { name: 'Pão de Forma Tradicional', category: 'Cereais e derivados' };
    const bife = { name: 'Contrafilé bovino grelhado', category: 'Carnes e derivados' };

    const restrictions = [
      { name: 'Intolerância a Lactose', category: 'INTOLERANCE' },
      { name: 'Dieta Vegetariana', category: 'PREFERENCE' },
    ];

    const resQueijo = calc.checkRestrictions(queijo, restrictions);
    expect(resQueijo.hasConflict).toBe(true);
    expect(resQueijo.warnings.some((w) => w.includes('lactose'))).toBe(true);

    const resBife = calc.checkRestrictions(bife, restrictions);
    expect(resBife.hasConflict).toBe(true);
    expect(resBife.warnings.some((w) => w.includes('origem animal'))).toBe(true);
  });
});
