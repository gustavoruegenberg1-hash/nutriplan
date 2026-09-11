import { MacroNutrients } from '../value-objects/macro-nutrients';

export class MealItemEntity {
  constructor(
    public readonly id: string,
    public readonly foodItemId: string,
    public readonly quantityGrams: number,
    public readonly foodItem?: any,
  ) {}
}

export class MealEntity {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly timeOfDay: string | null,
    public readonly items: MealItemEntity[],
  ) {}
}

export class DayPlanEntity {
  constructor(
    public readonly id: string,
    public readonly dayOfWeek: number,
    public readonly meals: MealEntity[],
  ) {}
}

export class DietPlan {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly name: string,
    public readonly isActive: boolean,
    public readonly days: DayPlanEntity[],
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  getTotalCalories(): number {
    return this.getTotalMacros().calories;
  }

  getTotalMacros(): MacroNutrients {
    let total = MacroNutrients.zero();
    for (const day of this.days) {
      for (const meal of day.meals) {
        for (const item of meal.items) {
          if (item.foodItem) {
            total = total.add(MacroNutrients.fromFood(item.foodItem, item.quantityGrams));
          }
        }
      }
    }
    return total;
  }

  static fromPrisma(prismaPlan: any): DietPlan {
    return new DietPlan(
      prismaPlan.id,
      prismaPlan.userId,
      prismaPlan.name,
      prismaPlan.isActive,
      (prismaPlan.days || []).map((d: any) => new DayPlanEntity(
        d.id,
        d.dayOfWeek,
        (d.meals || []).map((m: any) => new MealEntity(
          m.id,
          m.name,
          m.timeOfDay,
          (m.items || []).map((i: any) => new MealItemEntity(
            i.id,
            i.foodItemId,
            i.quantityGrams,
            i.foodItem
          ))
        ))
      )),
      prismaPlan.createdAt,
      prismaPlan.updatedAt,
    );
  }
}
