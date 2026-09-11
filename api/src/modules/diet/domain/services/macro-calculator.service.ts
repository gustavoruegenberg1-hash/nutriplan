import { MacroNutrients } from '../value-objects/macro-nutrients';

export class MacroCalculatorService {
  calculateMealMacros(items: any[], foods: Map<string, any>): MacroNutrients {
    let total = MacroNutrients.zero();
    for (const item of items) {
      const food = foods.get(item.foodItemId);
      if (food) {
        total = total.add(MacroNutrients.fromFood(food, item.quantityGrams));
      }
    }
    return total;
  }

  calculateDayMacros(meals: any[]): MacroNutrients {
    let total = MacroNutrients.zero();
    for (const meal of meals) {
      // Assuming meal.items have foodItem populated
      for (const item of meal.items || []) {
        if (item.foodItem) {
          total = total.add(MacroNutrients.fromFood(item.foodItem, item.quantityGrams));
        }
      }
    }
    return total;
  }

  calculatePlanMacros(days: any[]): MacroNutrients {
    let total = MacroNutrients.zero();
    for (const day of days) {
      total = total.add(this.calculateDayMacros(day.meals));
    }
    return total;
  }

  calculateBMR(weightKg: number, heightCm: number, ageYears: number, gender: 'male' | 'female'): number {
    let bmr = 10 * weightKg + 6.25 * heightCm - 5 * ageYears;
    return gender === 'male' ? bmr + 5 : bmr - 161;
  }

  calculateTDEE(bmr: number, activityLevel: number): number {
    return bmr * activityLevel;
  }

  suggestMacroSplit(
    tdee: number,
    goal: 'lose' | 'maintain' | 'gain',
    weightKg = 75,
    gender: 'male' | 'female' = 'male',
    bmr?: number
  ): { protein: number; carbs: number; fat: number; fiber: number; targetCalories: number } {
    let targetCalories = tdee;
    if (goal === 'lose') {
      const rawDeficit = Math.round(tdee * 0.20);
      const boundedDeficit = Math.max(350, Math.min(750, rawDeficit));
      targetCalories = tdee - boundedDeficit;
      if (bmr && targetCalories < bmr) {
        targetCalories = Math.max(bmr, tdee - 350);
      }
    } else if (goal === 'gain') {
      targetCalories += Math.min(500, Math.max(250, Math.round(tdee * 0.12)));
    }

    const proteinGrams = Math.round(weightKg * 2.0);
    const fatGrams = Math.round(weightKg * 0.8);
    const remainingCals = Math.max(0, targetCalories - (proteinGrams * 4 + fatGrams * 9));
    const carbsGrams = Math.round(remainingCals / 4);
    const fiberGrams = Math.min(45, Math.max(gender === 'male' ? 38 : 28, Math.round((targetCalories / 1000) * 14)));

    return {
      targetCalories,
      protein: proteinGrams,
      carbs: carbsGrams,
      fat: fatGrams,
      fiber: fiberGrams,
    };
  }
}
