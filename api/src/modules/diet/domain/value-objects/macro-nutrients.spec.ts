import { describe, it, expect } from 'vitest';
import { MacroNutrients } from './macro-nutrients';

describe('MacroNutrients', () => {
  it('should add two macro nutrients', () => {
    const m1 = new MacroNutrients(100, 10, 10, 5, 2);
    const m2 = new MacroNutrients(200, 20, 20, 10, 4);
    const result = m1.add(m2);
    expect(result.calories).toBe(300);
    expect(result.protein).toBe(30);
  });

  it('should scale macros', () => {
    const m1 = new MacroNutrients(100, 10, 10, 5, 2);
    const result = m1.scale(1.5);
    expect(result.calories).toBe(150);
    expect(result.protein).toBe(15);
  });

  it('should return zero', () => {
    const zero = MacroNutrients.zero();
    expect(zero.calories).toBe(0);
  });

  it('should create from food', () => {
    const food = {
      caloriesPer100g: 100,
      proteinPer100g: 10,
    };
    const macros = MacroNutrients.fromFood(food, 150);
    expect(macros.calories).toBe(150);
    expect(macros.protein).toBe(15);
  });
});
