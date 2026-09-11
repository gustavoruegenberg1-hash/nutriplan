export class MacroNutrients {
  constructor(
    public readonly calories: number,
    public readonly protein: number,
    public readonly carbs: number,
    public readonly fat: number,
    public readonly fiber: number,
  ) {}

  add(other: MacroNutrients): MacroNutrients {
    return new MacroNutrients(
      this.calories + other.calories,
      this.protein + other.protein,
      this.carbs + other.carbs,
      this.fat + other.fat,
      this.fiber + other.fiber,
    );
  }

  scale(factor: number): MacroNutrients {
    return new MacroNutrients(
      this.calories * factor,
      this.protein * factor,
      this.carbs * factor,
      this.fat * factor,
      this.fiber * factor,
    );
  }

  static zero(): MacroNutrients {
    return new MacroNutrients(0, 0, 0, 0, 0);
  }

  static fromFood(foodItem: any, quantityGrams: number): MacroNutrients {
    const factor = quantityGrams / 100;
    return new MacroNutrients(
      (foodItem.caloriesPer100g || 0) * factor,
      (foodItem.proteinPer100g || 0) * factor,
      (foodItem.carbsPer100g || 0) * factor,
      (foodItem.fatPer100g || 0) * factor,
      (foodItem.fiberPer100g || 0) * factor,
    );
  }
}
