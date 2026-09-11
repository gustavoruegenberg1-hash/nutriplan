import { describe, it, expect } from 'vitest';
import { MacroCalculatorService } from './macro-calculator.service';

describe('MacroCalculatorService', () => {
  const service = new MacroCalculatorService();

  it('calculateBMR male', () => {
    const bmr = service.calculateBMR(80, 180, 30, 'male');
    expect(bmr).toBe(10*80 + 6.25*180 - 5*30 + 5);
  });

  it('calculateBMR female', () => {
    const bmr = service.calculateBMR(65, 165, 25, 'female');
    expect(bmr).toBe(10*65 + 6.25*165 - 5*25 - 161);
  });

  it('calculateTDEE', () => {
    expect(service.calculateTDEE(2000, 1.2)).toBe(2400);
  });

  it('suggestMacroSplit lose', () => {
    const split = service.suggestMacroSplit(2500, 'lose'); // target 2000 kcal for 75kg
    // protein: 75kg * 2.0 = 150g (600 kcal)
    // fat: 75kg * 0.8 = 60g (540 kcal)
    // carbs: (2000 - 1140) / 4 = 215g (860 kcal)
    expect(split.targetCalories).toBe(2000);
    expect(split.protein).toBe(150);
    expect(split.carbs).toBe(215);
    expect(split.fat).toBe(60);
    expect(split.fiber).toBe(38);
  });
});
