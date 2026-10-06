import { Injectable, BadRequestException } from '@nestjs/common';

export type BiologicalGender = 'MALE' | 'FEMALE' | 'male' | 'female';
export type ActivityLevel =
  | 'SEDENTARY'
  | 'LIGHTLY_ACTIVE'
  | 'MODERATELY_ACTIVE'
  | 'VERY_ACTIVE'
  | 'EXTRA_ACTIVE'
  | 'sedentary'
  | 'lightly_active'
  | 'moderately_active'
  | 'very_active'
  | 'extra_active';

export type NutritionalGoal =
  | 'LOSE_WEIGHT'
  | 'MAINTAIN'
  | 'GAIN_WEIGHT'
  | 'lose_weight'
  | 'maintain'
  | 'gain_weight';

export interface MacroTargets {
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  fiberGrams: number;
}

export interface ProportionalNutrients {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sodium: number;
}

export interface FoodNutrientSource {
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  fiberPer100g: number;
  sodiumMgPer100g?: number | null;
  category?: string;
  tags?: string[];
  name?: string;
}

@Injectable()
export class NutritionCalculatorService {
  /**
   * RN06: Cálculo de Taxa Metabólica Basal (Equação de Mifflin-St Jeor)
   */
  calculateBMR(weightKg: number, heightCm: number, ageYears: number, gender: BiologicalGender): number {
    if (!weightKg || weightKg < 20 || weightKg > 350) {
      throw new BadRequestException('Peso deve estar entre 20 e 350 kg.');
    }
    if (!heightCm || heightCm < 50 || heightCm > 250) {
      throw new BadRequestException('Altura deve estar entre 50 e 250 cm.');
    }
    if (!ageYears || ageYears < 10 || ageYears > 120) {
      throw new BadRequestException('Idade deve estar entre 10 e 120 anos.');
    }

    const normGender = gender.toUpperCase();
    const base = 10 * weightKg + 6.25 * heightCm - 5 * ageYears;

    const bmr = normGender === 'MALE' ? base + 5 : base - 161;
    return Math.round(bmr * 10) / 10;
  }

  /**
   * RN07: Gasto Energético Diário Total (TDEE = BMR * Fator de Atividade)
   */
  calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
    if (bmr <= 0) throw new BadRequestException('BMR inválido.');

    const normLevel = activityLevel.toUpperCase();
    const multipliers: Record<string, number> = {
      SEDENTARY: 1.2,
      LIGHTLY_ACTIVE: 1.375,
      MODERATELY_ACTIVE: 1.55,
      VERY_ACTIVE: 1.725,
      EXTRA_ACTIVE: 1.9,
    };

    const factor = multipliers[normLevel] || 1.2;
    return Math.round(bmr * factor);
  }

  /**
   * RN08 e RN09: Meta Calórica e Distribuição Científica de Macronutrientes
   */
  calculateTargets(
    tdee: number,
    goal: NutritionalGoal,
    weightKg: number,
    gender: BiologicalGender
  ): MacroTargets {
    const normGoal = goal.toUpperCase();
    const normGender = gender.toUpperCase();

    let targetCalories = tdee;
    if (normGoal === 'LOSE_WEIGHT') {
      targetCalories = tdee - 500;
      // Piso mínimo seguro
      const minCalories = normGender === 'MALE' ? 1500 : 1200;
      if (targetCalories < minCalories) {
        targetCalories = minCalories;
      }
    } else if (normGoal === 'GAIN_WEIGHT') {
      targetCalories = tdee + 350;
    }

    targetCalories = Math.round(targetCalories);

    // Proteína: 2.0g/kg
    const proteinGrams = Math.round(weightKg * 2.0);
    const proteinCalories = proteinGrams * 4;

    // Gordura: 0.9g/kg
    const fatGrams = Math.round(weightKg * 0.9);
    const fatCalories = fatGrams * 9;

    // Carboidratos: calorias restantes
    const remainingCalories = Math.max(targetCalories - (proteinCalories + fatCalories), 0);
    const carbsGrams = Math.round(remainingCalories / 4);

    // Fibras: ~14g por 1000 kcal
    const fiberGrams = Math.round((targetCalories / 1000) * 14);

    return {
      calories: targetCalories,
      proteinGrams,
      carbsGrams,
      fatGrams,
      fiberGrams,
    };
  }

  /**
   * RN10: Cálculo Proporcional Exato de Nutrientes baseado na porção em gramas
   */
  calculateProportions(food: FoodNutrientSource, quantityGrams: number): ProportionalNutrients {
    if (quantityGrams <= 0) {
      throw new BadRequestException('A quantidade em gramas deve ser estritamente maior que zero.');
    }

    const factor = quantityGrams / 100;
    const round1 = (val: number) => Math.round(val * 10) / 10;
    const round0 = (val: number) => Math.round(val);

    return {
      calories: round0((food.caloriesPer100g || 0) * factor),
      protein: round1((food.proteinPer100g || 0) * factor),
      carbs: round1((food.carbsPer100g || 0) * factor),
      fat: round1((food.fatPer100g || 0) * factor),
      fiber: round1((food.fiberPer100g || 0) * factor),
      sodium: round1((food.sodiumMgPer100g || 0) * factor),
    };
  }

  /**
   * RN17: Verificação de Incompatibilidade de Restrição Alimentar
   */
  checkRestrictions(
    food: { name: string; category?: string; tags?: string[] },
    userRestrictions: Array<{ name: string; category: string }>
  ): { hasConflict: boolean; warnings: string[] } {
    const warnings: string[] = [];
    const foodNameLower = (food.name || '').toLowerCase();
    const categoryLower = (food.category || '').toLowerCase();

    for (const r of userRestrictions) {
      const resName = r.name.toLowerCase();

      if (resName.includes('lactose')) {
        if (
          categoryLower.includes('leite') ||
          foodNameLower.includes('queijo') ||
          foodNameLower.includes('iogurte') ||
          foodNameLower.includes('requeijão') ||
          foodNameLower.includes('leite')
        ) {
          if (!foodNameLower.includes('sem lactose') && !foodNameLower.includes('zero lactose')) {
            warnings.push(`Contém lactose: "${food.name}" pode desencadear sintomas.`);
          }
        }
      }

      if (resName.includes('glúten') || resName.includes('celíaco')) {
        if (
          foodNameLower.includes('trigo') ||
          foodNameLower.includes('pão') ||
          foodNameLower.includes('cevada') ||
          foodNameLower.includes('centeio') ||
          foodNameLower.includes('macarrão') ||
          foodNameLower.includes('biscoito')
        ) {
          if (!foodNameLower.includes('sem glúten')) {
            warnings.push(`Contém glúten: "${food.name}" incompatível com intolerância a glúten.`);
          }
        }
      }

      if (resName.includes('frutos do mar')) {
        if (
          categoryLower.includes('pescados') ||
          foodNameLower.includes('camarão') ||
          foodNameLower.includes('lula') ||
          foodNameLower.includes('polvo') ||
          foodNameLower.includes('ostra') ||
          foodNameLower.includes('peixe')
        ) {
          warnings.push(`Alerta de alergia: "${food.name}" contém pescado / frutos do mar.`);
        }
      }

      if (resName.includes('vegano') || resName.includes('vegana') || resName.includes('vegetariano') || resName.includes('vegetariana')) {
        if (
          categoryLower.includes('carnes') ||
          categoryLower.includes('pescados') ||
          foodNameLower.includes('carne') ||
          foodNameLower.includes('frango') ||
          foodNameLower.includes('bovino') ||
          foodNameLower.includes('suíno') ||
          foodNameLower.includes('peixe')
        ) {
          warnings.push(`Restrição alimentar: "${food.name}" é de origem animal.`);
        } else if (
          (resName.includes('vegano') || resName.includes('vegana')) &&
          (categoryLower.includes('leite') || categoryLower.includes('ovos') || foodNameLower.includes('mel'))
        ) {
          warnings.push(`Restrição vegana: "${food.name}" contém derivados de origem animal.`);
        }
      }
    }

    return {
      hasConflict: warnings.length > 0,
      warnings,
    };
  }
}
