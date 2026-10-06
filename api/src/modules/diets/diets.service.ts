import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Logger } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { NutritionCalculatorService, ProportionalNutrients, MacroTargets, BiologicalGender, NutritionalGoal } from '../nutrition/nutrition-calculator.service';
import { CreateDietDto, CreateMealDto, AddMealFoodDto, UpdateMealFoodDto, GenerateDietDto } from './dto/diet.dtos';
import { randomUUID } from 'node:crypto';

export interface CalculatedMealFood {
  id: string;
  foodId: string;
  name: string;
  category: string;
  quantityGrams: number;
  orderIndex: number;
  nutrients: ProportionalNutrients;
  warnings?: string[];
}

export interface CalculatedMeal {
  id: string;
  name: string;
  orderIndex: number;
  targetTime: string | null;
  items: CalculatedMealFood[];
  totals: ProportionalNutrients;
}

export interface CalculatedDiet {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  isActive: boolean;
  meals: CalculatedMeal[];
  totals: ProportionalNutrients;
  targetComparison?: {
    targets: MacroTargets;
    differences: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    };
    percentageMet: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    };
    isWithinTolerance?: boolean;
    tolerances?: any;
    validationSummary?: string;
    alerts: string[];
  };
  warnings: string[];
  legalDisclaimer: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class DietsService {
  private readonly logger = new Logger(DietsService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly calc: NutritionCalculatorService,
  ) {}

  private readonly LEGAL_DISCLAIMER =
    'Este sistema fornece estimativas e ferramentas de organização de dieta e treino. As informações não substituem avaliação, diagnóstico ou acompanhamento de profissional habilitado.';

  async listUserDiets(userId: string): Promise<Array<{ id: string; name: string; description: string | null; isActive: boolean; createdAt: string }>> {
    const rows = this.db.query(
      'SELECT id, name, description, is_active, created_at FROM diets WHERE user_id = ? ORDER BY is_active DESC, created_at DESC',
      [userId]
    );
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      isActive: Boolean(r.is_active),
      createdAt: r.created_at,
    }));
  }

  async createDiet(userId: string, dto: CreateDietDto): Promise<CalculatedDiet> {
    const id = randomUUID();
    const now = new Date().toISOString();

    this.db.transaction(() => {
      // Se marcada como ativa, desmarca as outras
      if (dto.isActive) {
        this.db.run('UPDATE diets SET is_active = 0 WHERE user_id = ?', [userId]);
      }

      this.db.run(
        `INSERT INTO diets (id, user_id, name, description, is_active, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id, userId, dto.name.trim(), dto.description || null, dto.isActive ? 1 : 0, now, now]
      );

      // Cria refeições padrão iniciais (Café, Almoço, Lanche, Jantar)
      const defaultMeals = ['Café da Manhã', 'Almoço', 'Lanche da Tarde', 'Jantar'];
      defaultMeals.forEach((mealName, idx) => {
        this.db.run(
          `INSERT INTO meals (id, diet_id, name, order_index, created_at)
           VALUES (?, ?, ?, ?, ?)`,
          [randomUUID(), id, mealName, idx, now]
        );
      });
    });

    return this.getDietById(userId, id);
  }

  async getDietById(userId: string, dietId: string): Promise<CalculatedDiet> {
    const diet = this.db.queryOne<{
      id: string;
      user_id: string;
      name: string;
      description: string | null;
      is_active: number;
      created_at: string;
      updated_at: string;
    }>('SELECT * FROM diets WHERE id = ?', [dietId]);

    if (!diet) {
      throw new NotFoundException('Dieta não encontrada.');
    }

    // RN01 / RN03: Um usuário só pode acessar suas próprias dietas
    if (diet.user_id !== userId) {
      throw new ForbiddenException('Acesso negado: esta dieta não pertence ao seu usuário.');
    }

    // Busca restrições do usuário para cruzamento
    const userRestrictions = this.db.query<{ name: string; category: string }>(
      `SELECT r.name, r.category FROM user_restrictions ur
       INNER JOIN restrictions r ON ur.restriction_id = r.id
       WHERE ur.user_id = ?`,
      [userId]
    );

    // Busca refeições
    const meals = this.db.query<{
      id: string;
      name: string;
      order_index: number;
      target_time: string | null;
    }>('SELECT * FROM meals WHERE diet_id = ? ORDER BY order_index ASC', [dietId]);

    const dietWarnings: string[] = [];
    const calculatedMeals: CalculatedMeal[] = [];

    const dailyTotals: ProportionalNutrients = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sodium: 0,
    };

    for (const meal of meals) {
      const mealFoods = this.db.query<{
        id: string;
        food_id: string;
        quantity_grams: number;
        order_index: number;
        food_name: string;
        category: string;
        calories_per_100g: number;
        protein_per_100g: number;
        carbs_per_100g: number;
        fat_per_100g: number;
        fiber_per_100g: number;
        sodium_mg_per_100g: number | null;
      }>(
        `SELECT mf.id, mf.food_id, mf.quantity_grams, mf.order_index,
                f.name as food_name, f.category, f.calories_per_100g, f.protein_per_100g,
                f.carbs_per_100g, f.fat_per_100g, f.fiber_per_100g, f.sodium_mg_per_100g
         FROM meal_foods mf
         INNER JOIN foods f ON mf.food_id = f.id
         WHERE mf.meal_id = ?
         ORDER BY mf.order_index ASC`,
        [meal.id]
      );

      const mealTotals: ProportionalNutrients = {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        sodium: 0,
      };

      const calculatedItems: CalculatedMealFood[] = [];

      for (const item of mealFoods) {
        const itemNutrients = this.calc.calculateProportions(
          {
            caloriesPer100g: item.calories_per_100g,
            proteinPer100g: item.protein_per_100g,
            carbsPer100g: item.carbs_per_100g,
            fatPer100g: item.fat_per_100g,
            fiberPer100g: item.fiber_per_100g,
            sodiumMgPer100g: item.sodium_mg_per_100g,
          },
          item.quantity_grams
        );

        // Checagem de restrições (RN12 / RN17)
        const check = this.calc.checkRestrictions(
          { name: item.food_name, category: item.category },
          userRestrictions
        );

        if (check.hasConflict) {
          dietWarnings.push(...check.warnings);
        }

        mealTotals.calories += itemNutrients.calories;
        mealTotals.protein += itemNutrients.protein;
        mealTotals.carbs += itemNutrients.carbs;
        mealTotals.fat += itemNutrients.fat;
        mealTotals.fiber += itemNutrients.fiber;
        mealTotals.sodium += itemNutrients.sodium;

        calculatedItems.push({
          id: item.id,
          foodId: item.food_id,
          name: item.food_name,
          category: item.category,
          quantityGrams: item.quantity_grams,
          orderIndex: item.order_index,
          nutrients: itemNutrients,
          warnings: check.warnings,
        });
      }

      // Arredonda totais da refeição
      const round1 = (v: number) => Math.round(v * 10) / 10;
      mealTotals.calories = Math.round(mealTotals.calories);
      mealTotals.protein = round1(mealTotals.protein);
      mealTotals.carbs = round1(mealTotals.carbs);
      mealTotals.fat = round1(mealTotals.fat);
      mealTotals.fiber = round1(mealTotals.fiber);
      mealTotals.sodium = round1(mealTotals.sodium);

      dailyTotals.calories += mealTotals.calories;
      dailyTotals.protein += mealTotals.protein;
      dailyTotals.carbs += mealTotals.carbs;
      dailyTotals.fat += mealTotals.fat;
      dailyTotals.fiber += mealTotals.fiber;
      dailyTotals.sodium += mealTotals.sodium;

      calculatedMeals.push({
        id: meal.id,
        name: meal.name,
        orderIndex: meal.order_index,
        targetTime: meal.target_time,
        items: calculatedItems,
        totals: mealTotals,
      });
    }

    const round1 = (v: number) => Math.round(v * 10) / 10;
    dailyTotals.calories = Math.round(dailyTotals.calories);
    dailyTotals.protein = round1(dailyTotals.protein);
    dailyTotals.carbs = round1(dailyTotals.carbs);
    dailyTotals.fat = round1(dailyTotals.fat);
    dailyTotals.fiber = round1(dailyTotals.fiber);
    dailyTotals.sodium = round1(dailyTotals.sodium);

    // Comparativo com meta do perfil (RN13 / RN18)
    const profile = this.db.queryOne<{
      weight: number | null;
      height: number | null;
      age: number | null;
      gender: string | null;
      goal: string;
      tdee: number | null;
    }>('SELECT weight, height, age, gender, goal, tdee FROM profiles WHERE user_id = ?', [userId]);

    let targetComparison: any = undefined;
    if (profile && profile.weight && profile.tdee && profile.gender) {
      const targets = this.calc.calculateTargets(
        profile.tdee,
        profile.goal as NutritionalGoal,
        profile.weight,
        profile.gender as BiologicalGender
      );

      const diffKcal = dailyTotals.calories - targets.calories;
      const diffP = round1(dailyTotals.protein - targets.proteinGrams);
      const diffC = round1(dailyTotals.carbs - targets.carbsGrams);
      const diffF = round1(dailyTotals.fat - targets.fatGrams);

      const pctKcal = Math.round((dailyTotals.calories / targets.calories) * 100);
      const pctP = Math.round((dailyTotals.protein / targets.proteinGrams) * 100);
      const pctC = Math.round((dailyTotals.carbs / targets.carbsGrams) * 100);
      const pctF = Math.round((dailyTotals.fat / targets.fatGrams) * 100);

      const alerts: string[] = [];
      if (pctKcal < 85) alerts.push(`Dieta ${targets.calories - dailyTotals.calories} kcal abaixo da sua meta diária.`);
      if (pctKcal > 115) alerts.push(`Dieta ${dailyTotals.calories - targets.calories} kcal acima da sua meta diária.`);
      if (pctP < 80) alerts.push('Densidade proteica abaixo do recomendado para seu peso corporal.');

      const isWithinTolerance =
        Math.abs(diffKcal) / (targets.calories || 1) <= 0.05 &&
        Math.abs(diffP) / (targets.proteinGrams || 1) <= 0.05 &&
        Math.abs(diffC) / (targets.carbsGrams || 1) <= 0.08 &&
        Math.abs(diffF) / (targets.fatGrams || 1) <= 0.08;

      targetComparison = {
        targets: {
          ...targets,
          labels: {
            calories: 'Meta Calórica Diária',
            protein: 'Meta de Proteínas',
            carbs: 'Meta de Carboidratos',
            fat: 'Meta de Gorduras',
            fiber: 'Meta de Fibras',
          },
        },
        differences: { calories: diffKcal, protein: diffP, carbs: diffC, fat: diffF },
        percentageMet: { calories: pctKcal, protein: pctP, carbs: pctC, fat: pctF },
        isWithinTolerance,
        tolerances: {
          caloriesPct: 5,
          proteinPct: 5,
          carbsPct: 8,
          fatPct: 8,
          description: 'Tolerância aceitável: Calorias ±5%, Proteínas ±5%, Carboidratos ±8%, Gorduras ±8%',
        },
        validationSummary: `Validação real: ${diffKcal >= 0 ? '+' : ''}${diffKcal} kcal | Proteínas: ${diffP >= 0 ? '+' : ''}${diffP}g | Carboidratos: ${diffC >= 0 ? '+' : ''}${diffC}g | Gorduras: ${diffF >= 0 ? '+' : ''}${diffF}g`,
        alerts,
      };
    }

    return {
      id: diet.id,
      userId: diet.user_id,
      name: diet.name,
      description: diet.description,
      isActive: Boolean(diet.is_active),
      meals: calculatedMeals,
      totals: dailyTotals,
      targetComparison,
      warnings: Array.from(new Set(dietWarnings)),
      legalDisclaimer: this.LEGAL_DISCLAIMER,
      createdAt: diet.created_at,
      updatedAt: diet.updated_at,
    };
  }

  async addMeal(userId: string, dietId: string, dto: CreateMealDto) {
    const diet = await this.getDietById(userId, dietId);
    const mealId = randomUUID();
    const now = new Date().toISOString();

    const maxOrder = this.db.queryOne<{ max_order: number | null }>(
      'SELECT MAX(order_index) as max_order FROM meals WHERE diet_id = ?',
      [diet.id]
    );
    const nextOrder = (maxOrder?.max_order ?? -1) + 1;

    this.db.run(
      `INSERT INTO meals (id, diet_id, name, order_index, target_time, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [mealId, diet.id, dto.name.trim(), dto.orderIndex ?? nextOrder, dto.targetTime || null, now]
    );

    return this.getDietById(userId, dietId);
  }

  async removeMeal(userId: string, dietId: string, mealId: string) {
    const diet = await this.getDietById(userId, dietId);
    this.db.run('DELETE FROM meals WHERE id = ? AND diet_id = ?', [mealId, diet.id]);
    return this.getDietById(userId, dietId);
  }

  async addFoodToMeal(userId: string, dietId: string, mealId: string, dto: AddMealFoodDto) {
    // RN05 / RN14: Quantidade maior que zero
    if (!dto.quantityGrams || dto.quantityGrams <= 0) {
      throw new BadRequestException('A quantidade de alimento deve ser estritamente maior que zero.');
    }

    const diet = await this.getDietById(userId, dietId);

    // Verifica refeição
    const meal = this.db.queryOne('SELECT id FROM meals WHERE id = ? AND diet_id = ?', [mealId, diet.id]);
    if (!meal) {
      throw new NotFoundException('Refeição não encontrada nesta dieta.');
    }

    // RN04: Alimento deve existir na base
    const food = this.db.queryOne('SELECT id FROM foods WHERE id = ?', [dto.foodId]);
    if (!food) {
      throw new NotFoundException('Alimento não encontrado na base nutricional.');
    }

    const id = randomUUID();
    const now = new Date().toISOString();

    const maxOrder = this.db.queryOne<{ max_order: number | null }>(
      'SELECT MAX(order_index) as max_order FROM meal_foods WHERE meal_id = ?',
      [mealId]
    );
    const nextOrder = (maxOrder?.max_order ?? -1) + 1;

    this.db.run(
      `INSERT INTO meal_foods (id, meal_id, food_id, quantity_grams, order_index, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, mealId, dto.foodId, dto.quantityGrams, dto.orderIndex ?? nextOrder, now]
    );

    this.db.run('UPDATE diets SET updated_at = ? WHERE id = ?', [now, dietId]);

    return this.getDietById(userId, dietId);
  }

  async updateMealFood(userId: string, dietId: string, mealId: string, mealFoodId: string, dto: UpdateMealFoodDto) {
    if (!dto.quantityGrams || dto.quantityGrams <= 0) {
      throw new BadRequestException('A quantidade de alimento deve ser estritamente maior que zero.');
    }

    await this.getDietById(userId, dietId);

    const mealFood = this.db.queryOne('SELECT id FROM meal_foods WHERE id = ? AND meal_id = ?', [mealFoodId, mealId]);
    if (!mealFood) {
      throw new NotFoundException('Item de alimento não encontrado na refeição.');
    }

    const now = new Date().toISOString();
    this.db.run('UPDATE meal_foods SET quantity_grams = ? WHERE id = ?', [dto.quantityGrams, mealFoodId]);
    this.db.run('UPDATE diets SET updated_at = ? WHERE id = ?', [now, dietId]);

    return this.getDietById(userId, dietId);
  }

  async removeMealFood(userId: string, dietId: string, mealId: string, mealFoodId: string) {
    await this.getDietById(userId, dietId);

    this.db.run('DELETE FROM meal_foods WHERE id = ? AND meal_id = ?', [mealFoodId, mealId]);
    this.db.run('UPDATE diets SET updated_at = ? WHERE id = ?', [new Date().toISOString(), dietId]);

    return this.getDietById(userId, dietId);
  }

  async deleteDiet(userId: string, dietId: string) {
    await this.getDietById(userId, dietId);
    this.db.run('DELETE FROM diets WHERE id = ? AND user_id = ?', [dietId, userId]);
    return { success: true, message: 'Dieta excluída com sucesso.' };
  }

  /**
   * Seção 13: Gerador Assistido de Proposta de Dieta Editável com Otimização de Metas
   */
  async generateSuggestion(userId: string, dto: GenerateDietDto): Promise<CalculatedDiet> {
    const profile = this.db.queryOne<{
      weight: number | null;
      height: number | null;
      age: number | null;
      gender: string | null;
      goal: string;
      tdee: number | null;
    }>('SELECT * FROM profiles WHERE user_id = ?', [userId]);

    let targetCalories = dto.customCalories || 2000;
    let targetProtein = 140;
    let targetCarbs = 230;
    let targetFat = 55;
    let targetFiber = 28;

    if (profile && profile.tdee && profile.weight && profile.gender) {
      const targets = this.calc.calculateTargets(
        profile.tdee,
        (dto.goal || profile.goal) as NutritionalGoal,
        profile.weight,
        profile.gender as BiologicalGender
      );
      targetCalories = targets.calories;
      targetProtein = targets.proteinGrams;
      targetCarbs = targets.carbsGrams;
      targetFat = targets.fatGrams;
      targetFiber = targets.fiberGrams;
    }

    if (dto.customCalories && dto.customCalories > 0) {
      const scale = dto.customCalories / (targetCalories || 2000);
      targetCalories = dto.customCalories;
      targetProtein = Math.round(targetProtein * scale);
      targetCarbs = Math.round(targetCarbs * scale);
      targetFat = Math.round(targetFat * scale);
      targetFiber = Math.round(targetFiber * scale);
    }

    interface FoodMacroRow {
      id: string;
      name: string;
      calPer100g: number;
      protPer100g: number;
      carbPer100g: number;
      fatPer100g: number;
      fiberPer100g: number;
    }

    const findFoodByTerms = (terms: string[]): FoodMacroRow | null => {
      for (const term of terms) {
        const row = this.db.queryOne<any>(
          `SELECT id, name, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g
           FROM foods
           WHERE LOWER(name) LIKE ? AND is_active = 1
           ORDER BY is_verified DESC
           LIMIT 1`,
          [`%${term.toLowerCase()}%`]
        );
        if (row) {
          return {
            id: row.id,
            name: row.name,
            calPer100g: Number(row.calories_per_100g) || 0,
            protPer100g: Number(row.protein_per_100g) || 0,
            carbPer100g: Number(row.carbs_per_100g) || 0,
            fatPer100g: Number(row.fat_per_100g) || 0,
            fiberPer100g: Number(row.fiber_per_100g) || 0,
          };
        }
      }
      return null;
    };

    const ovo = findFoodByTerms(['ovo de galinha inteiro cozido', 'ovo de galinha inteiro', 'ovo cozido', 'ovo']);
    const aveia = findFoodByTerms(['aveia em flocos', 'aveia']);
    const banana = findFoodByTerms(['banana prata crua', 'banana prata', 'banana']);
    const arroz = findFoodByTerms(['arroz tipo 1 cozido', 'arroz integral cozido', 'arroz cozido', 'arroz']);
    const feijao = findFoodByTerms(['feijão carioca cozido', 'feijão preto cozido', 'feijão cozido', 'feijão', 'feijao']);
    const frango = findFoodByTerms(['frango peito sem pele cozido', 'frango peito sem pele grelhado', 'frango peito', 'filé de peito', 'frango']);
    const azeite = findFoodByTerms(['azeite de oliva extra virgem', 'azeite de oliva', 'azeite']);
    const maca = findFoodByTerms(['maçã fuji com casca', 'maçã gala com casca', 'maçã']);
    const whey = findFoodByTerms(['queijo minas frescal', 'leite desnatado', 'whey', 'leite']);

    interface MealItemPlan {
      mealName: string;
      mealOrder: number;
      food: FoodMacroRow;
      role: 'CHICKEN_PROTEIN' | 'RICE_CARB' | 'OIL_FAT' | 'STAPLE';
      grams: number;
      minGrams: number;
      maxGrams: number;
    }

    const mealsCount = dto.mealsCount && [3, 4, 5, 6].includes(Number(dto.mealsCount)) ? Number(dto.mealsCount) : 4;
    const planItems: MealItemPlan[] = [];

    if (mealsCount === 3) {
      if (ovo) planItems.push({ mealName: 'Café da Manhã', mealOrder: 0, food: ovo, role: 'STAPLE', grams: 100, minGrams: 50, maxGrams: 150 });
      if (aveia) planItems.push({ mealName: 'Café da Manhã', mealOrder: 0, food: aveia, role: 'RICE_CARB', grams: 40, minGrams: 20, maxGrams: 100 });
      if (banana) planItems.push({ mealName: 'Café da Manhã', mealOrder: 0, food: banana, role: 'STAPLE', grams: 90, minGrams: 60, maxGrams: 120 });

      if (arroz) planItems.push({ mealName: 'Almoço', mealOrder: 1, food: arroz, role: 'RICE_CARB', grams: 150, minGrams: 60, maxGrams: 420 });
      if (feijao) planItems.push({ mealName: 'Almoço', mealOrder: 1, food: feijao, role: 'STAPLE', grams: 100, minGrams: 50, maxGrams: 150 });
      if (frango) planItems.push({ mealName: 'Almoço', mealOrder: 1, food: frango, role: 'CHICKEN_PROTEIN', grams: 140, minGrams: 60, maxGrams: 280 });
      if (azeite) planItems.push({ mealName: 'Almoço', mealOrder: 1, food: azeite, role: 'OIL_FAT', grams: 10, minGrams: 3, maxGrams: 25 });

      if (arroz) planItems.push({ mealName: 'Jantar', mealOrder: 2, food: arroz, role: 'RICE_CARB', grams: 140, minGrams: 60, maxGrams: 420 });
      if (frango) planItems.push({ mealName: 'Jantar', mealOrder: 2, food: frango, role: 'CHICKEN_PROTEIN', grams: 140, minGrams: 60, maxGrams: 280 });
      if (maca) planItems.push({ mealName: 'Jantar', mealOrder: 2, food: maca, role: 'STAPLE', grams: 110, minGrams: 70, maxGrams: 150 });
      if (azeite) planItems.push({ mealName: 'Jantar', mealOrder: 2, food: azeite, role: 'OIL_FAT', grams: 10, minGrams: 3, maxGrams: 25 });
    } else if (mealsCount === 5) {
      if (ovo) planItems.push({ mealName: 'Café da Manhã', mealOrder: 0, food: ovo, role: 'STAPLE', grams: 100, minGrams: 50, maxGrams: 150 });
      if (aveia) planItems.push({ mealName: 'Café da Manhã', mealOrder: 0, food: aveia, role: 'RICE_CARB', grams: 40, minGrams: 20, maxGrams: 100 });

      if (banana) planItems.push({ mealName: 'Lanche da Manhã', mealOrder: 1, food: banana, role: 'STAPLE', grams: 90, minGrams: 50, maxGrams: 130 });
      if (whey) planItems.push({ mealName: 'Lanche da Manhã', mealOrder: 1, food: whey, role: 'STAPLE', grams: 25, minGrams: 20, maxGrams: 40 });
      if (aveia) planItems.push({ mealName: 'Lanche da Manhã', mealOrder: 1, food: aveia, role: 'RICE_CARB', grams: 30, minGrams: 15, maxGrams: 80 });

      if (arroz) planItems.push({ mealName: 'Almoço', mealOrder: 2, food: arroz, role: 'RICE_CARB', grams: 150, minGrams: 60, maxGrams: 420 });
      if (feijao) planItems.push({ mealName: 'Almoço', mealOrder: 2, food: feijao, role: 'STAPLE', grams: 90, minGrams: 50, maxGrams: 150 });
      if (frango) planItems.push({ mealName: 'Almoço', mealOrder: 2, food: frango, role: 'CHICKEN_PROTEIN', grams: 120, minGrams: 50, maxGrams: 260 });
      if (azeite) planItems.push({ mealName: 'Almoço', mealOrder: 2, food: azeite, role: 'OIL_FAT', grams: 10, minGrams: 3, maxGrams: 25 });

      if (maca) planItems.push({ mealName: 'Lanche da Tarde', mealOrder: 3, food: maca, role: 'STAPLE', grams: 110, minGrams: 70, maxGrams: 140 });
      if (aveia) planItems.push({ mealName: 'Lanche da Tarde', mealOrder: 3, food: aveia, role: 'RICE_CARB', grams: 30, minGrams: 15, maxGrams: 80 });

      if (arroz) planItems.push({ mealName: 'Jantar', mealOrder: 4, food: arroz, role: 'RICE_CARB', grams: 140, minGrams: 60, maxGrams: 420 });
      if (frango) planItems.push({ mealName: 'Jantar', mealOrder: 4, food: frango, role: 'CHICKEN_PROTEIN', grams: 120, minGrams: 50, maxGrams: 260 });
      if (azeite) planItems.push({ mealName: 'Jantar', mealOrder: 4, food: azeite, role: 'OIL_FAT', grams: 8, minGrams: 3, maxGrams: 25 });
    } else if (mealsCount === 6) {
      if (ovo) planItems.push({ mealName: 'Café da Manhã', mealOrder: 0, food: ovo, role: 'STAPLE', grams: 100, minGrams: 50, maxGrams: 150 });
      if (aveia) planItems.push({ mealName: 'Café da Manhã', mealOrder: 0, food: aveia, role: 'RICE_CARB', grams: 35, minGrams: 15, maxGrams: 90 });

      if (banana) planItems.push({ mealName: 'Lanche da Manhã', mealOrder: 1, food: banana, role: 'STAPLE', grams: 80, minGrams: 50, maxGrams: 120 });
      if (aveia) planItems.push({ mealName: 'Lanche da Manhã', mealOrder: 1, food: aveia, role: 'RICE_CARB', grams: 30, minGrams: 15, maxGrams: 80 });

      if (arroz) planItems.push({ mealName: 'Almoço', mealOrder: 2, food: arroz, role: 'RICE_CARB', grams: 140, minGrams: 60, maxGrams: 420 });
      if (feijao) planItems.push({ mealName: 'Almoço', mealOrder: 2, food: feijao, role: 'STAPLE', grams: 80, minGrams: 50, maxGrams: 140 });
      if (frango) planItems.push({ mealName: 'Almoço', mealOrder: 2, food: frango, role: 'CHICKEN_PROTEIN', grams: 110, minGrams: 50, maxGrams: 250 });
      if (azeite) planItems.push({ mealName: 'Almoço', mealOrder: 2, food: azeite, role: 'OIL_FAT', grams: 8, minGrams: 3, maxGrams: 22 });

      if (maca) planItems.push({ mealName: 'Lanche da Tarde', mealOrder: 3, food: maca, role: 'STAPLE', grams: 110, minGrams: 70, maxGrams: 140 });
      if (whey) planItems.push({ mealName: 'Lanche da Tarde', mealOrder: 3, food: whey, role: 'STAPLE', grams: 25, minGrams: 15, maxGrams: 40 });

      if (arroz) planItems.push({ mealName: 'Jantar', mealOrder: 4, food: arroz, role: 'RICE_CARB', grams: 130, minGrams: 60, maxGrams: 420 });
      if (frango) planItems.push({ mealName: 'Jantar', mealOrder: 4, food: frango, role: 'CHICKEN_PROTEIN', grams: 110, minGrams: 50, maxGrams: 250 });
      if (azeite) planItems.push({ mealName: 'Jantar', mealOrder: 4, food: azeite, role: 'OIL_FAT', grams: 8, minGrams: 3, maxGrams: 22 });

      if (ovo) planItems.push({ mealName: 'Ceia', mealOrder: 5, food: ovo, role: 'STAPLE', grams: 60, minGrams: 50, maxGrams: 100 });
      if (azeite) planItems.push({ mealName: 'Ceia', mealOrder: 5, food: azeite, role: 'OIL_FAT', grams: 5, minGrams: 2, maxGrams: 15 });
    } else {
      // Padrão 4 refeições
      if (ovo) planItems.push({ mealName: 'Café da Manhã', mealOrder: 0, food: ovo, role: 'STAPLE', grams: 100, minGrams: 50, maxGrams: 150 });
      if (aveia) planItems.push({ mealName: 'Café da Manhã', mealOrder: 0, food: aveia, role: 'RICE_CARB', grams: 40, minGrams: 20, maxGrams: 100 });
      if (banana) planItems.push({ mealName: 'Café da Manhã', mealOrder: 0, food: banana, role: 'STAPLE', grams: 80, minGrams: 50, maxGrams: 120 });

      if (arroz) planItems.push({ mealName: 'Almoço', mealOrder: 1, food: arroz, role: 'RICE_CARB', grams: 150, minGrams: 60, maxGrams: 420 });
      if (feijao) planItems.push({ mealName: 'Almoço', mealOrder: 1, food: feijao, role: 'STAPLE', grams: 90, minGrams: 50, maxGrams: 150 });
      if (frango) planItems.push({ mealName: 'Almoço', mealOrder: 1, food: frango, role: 'CHICKEN_PROTEIN', grams: 130, minGrams: 50, maxGrams: 260 });
      if (azeite) planItems.push({ mealName: 'Almoço', mealOrder: 1, food: azeite, role: 'OIL_FAT', grams: 10, minGrams: 3, maxGrams: 25 });

      if (maca) planItems.push({ mealName: 'Lanche da Tarde', mealOrder: 2, food: maca, role: 'STAPLE', grams: 110, minGrams: 70, maxGrams: 140 });
      if (whey) planItems.push({ mealName: 'Lanche da Tarde', mealOrder: 2, food: whey, role: 'STAPLE', grams: 25, minGrams: 15, maxGrams: 40 });
      if (aveia) planItems.push({ mealName: 'Lanche da Tarde', mealOrder: 2, food: aveia, role: 'RICE_CARB', grams: 30, minGrams: 15, maxGrams: 80 });

      if (arroz) planItems.push({ mealName: 'Jantar', mealOrder: 3, food: arroz, role: 'RICE_CARB', grams: 140, minGrams: 60, maxGrams: 420 });
      if (feijao) planItems.push({ mealName: 'Jantar', mealOrder: 3, food: feijao, role: 'STAPLE', grams: 80, minGrams: 40, maxGrams: 140 });
      if (frango) planItems.push({ mealName: 'Jantar', mealOrder: 3, food: frango, role: 'CHICKEN_PROTEIN', grams: 130, minGrams: 50, maxGrams: 260 });
      if (azeite) planItems.push({ mealName: 'Jantar', mealOrder: 3, food: azeite, role: 'OIL_FAT', grams: 8, minGrams: 3, maxGrams: 25 });
    }

    const calcCurrentNutrients = () => {
      let cals = 0;
      let p = 0;
      let c = 0;
      let f = 0;
      for (const it of planItems) {
        const factor = it.grams / 100;
        cals += it.food.calPer100g * factor;
        p += it.food.protPer100g * factor;
        c += it.food.carbPer100g * factor;
        f += it.food.fatPer100g * factor;
      }
      return { cals, p, c, f };
    };

    // ALGORITMO DE OTIMIZAÇÃO MULTIDIMENSIONAL DE MACRONUTRIENTES
    // Minimiza simultaneamente as diferenças de Calorias, Proteínas, Carboidratos e Gorduras
    for (let iter = 0; iter < 25; iter++) {
      const cur = calcCurrentNutrients();
      const errP = targetProtein - cur.p;
      const errC = targetCarbs - cur.c;
      const errF = targetFat - cur.f;
      const errCal = targetCalories - cur.cals;

      // Tolerâncias aceitáveis: Calorias <= 5%, Proteínas <= 5%, Carboidratos <= 8%, Gorduras <= 8%
      if (
        Math.abs(errCal) / (targetCalories || 1) <= 0.05 &&
        Math.abs(errP) / (targetProtein || 1) <= 0.05 &&
        Math.abs(errC) / (targetCarbs || 1) <= 0.08 &&
        Math.abs(errF) / (targetFat || 1) <= 0.08
      ) {
        break;
      }

      // 1. Ajuste de Proteínas (Frango)
      const protSlots = planItems.filter((it) => it.role === 'CHICKEN_PROTEIN');
      if (protSlots.length > 0 && Math.abs(errP) > 1.5) {
        const avgDensity = protSlots.reduce((acc, it) => acc + it.food.protPer100g / 100, 0) / protSlots.length;
        const totalAdj = errP / (avgDensity || 0.31);
        const eachAdj = totalAdj / protSlots.length;
        for (const slot of protSlots) {
          slot.grams = Math.max(slot.minGrams, Math.min(slot.maxGrams, slot.grams + eachAdj));
        }
      }

      // 2. Ajuste de Gorduras (Azeite)
      const fatSlots = planItems.filter((it) => it.role === 'OIL_FAT');
      if (fatSlots.length > 0 && Math.abs(errF) > 1.0) {
        const avgDensity = fatSlots.reduce((acc, it) => acc + it.food.fatPer100g / 100, 0) / fatSlots.length;
        const totalAdj = errF / (avgDensity || 0.99);
        const eachAdj = totalAdj / fatSlots.length;
        for (const slot of fatSlots) {
          slot.grams = Math.max(slot.minGrams, Math.min(slot.maxGrams, slot.grams + eachAdj));
        }
      }

      // 3. Ajuste de Carboidratos (Arroz e Aveia)
      const carbSlots = planItems.filter((it) => it.role === 'RICE_CARB');
      if (carbSlots.length > 0 && Math.abs(errC) > 2.0) {
        const avgDensity = carbSlots.reduce((acc, it) => acc + it.food.carbPer100g / 100, 0) / carbSlots.length;
        const totalAdj = errC / (avgDensity || 0.28);
        const eachAdj = totalAdj / carbSlots.length;
        for (const slot of carbSlots) {
          slot.grams = Math.max(slot.minGrams, Math.min(slot.maxGrams, slot.grams + eachAdj));
        }
      }
    }

    // Arredonda as quantidades para gramagens práticas e legíveis para o usuário
    for (const item of planItems) {
      if (item.role === 'OIL_FAT') {
        item.grams = Math.max(item.minGrams, Math.round(item.grams));
      } else {
        item.grams = Math.max(item.minGrams, Math.round(item.grams / 5) * 5);
      }
    }

    const dietName = `Sugestão NutriPlan — ${dto.goal || profile?.goal || 'Equilibrada'}`;
    const dietId = randomUUID();
    const now = new Date().toISOString();

    // Persiste a dieta e refeições no SQLite em transação atômica
    this.db.transaction(() => {
      this.db.run('UPDATE diets SET is_active = 0 WHERE user_id = ?', [userId]);

      this.db.run(
        `INSERT INTO diets (id, user_id, name, description, is_active, created_at, updated_at)
         VALUES (?, ?, ?, 'Sugestão assistida baseada em metas. 100% editável.', 1, ?, ?)`,
        [dietId, userId, dietName, now, now]
      );

      // Agrupa os itens por refeição
      const mealNames = Array.from(new Set(planItems.map((it) => it.mealName)));
      mealNames.forEach((mName, mIdx) => {
        const mId = randomUUID();
        this.db.run(
          `INSERT INTO meals (id, diet_id, name, order_index, created_at) VALUES (?, ?, ?, ?, ?)`,
          [mId, dietId, mName, mIdx, now]
        );

        const itemsForMeal = planItems.filter((it) => it.mealName === mName);
        itemsForMeal.forEach((it, itIdx) => {
          this.db.run(
            `INSERT INTO meal_foods (id, meal_id, food_id, quantity_grams, order_index, created_at)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [randomUUID(), mId, it.food.id, it.grams, itIdx, now]
          );
        });
      });
    });

    // VALIDAÇÃO OBRIGATÓRIA FINAL:
    // Recalcula diretamente a partir dos registros e quantidades REALMENTE salvos no banco SQLite
    const savedRows = this.db.query<{
      quantity_grams: number;
      calories_per_100g: number;
      protein_per_100g: number;
      carbs_per_100g: number;
      fat_per_100g: number;
      fiber_per_100g: number;
    }>(
      `SELECT mf.quantity_grams, f.calories_per_100g, f.protein_per_100g, f.carbs_per_100g, f.fat_per_100g, f.fiber_per_100g
       FROM meal_foods mf
       JOIN meals m ON mf.meal_id = m.id
       JOIN foods f ON mf.food_id = f.id
       WHERE m.diet_id = ?`,
      [dietId]
    );

    let verifiedCalories = 0;
    let verifiedProtein = 0;
    let verifiedCarbs = 0;
    let verifiedFat = 0;
    let verifiedFiber = 0;

    for (const r of savedRows) {
      const f = r.quantity_grams / 100;
      verifiedCalories += r.calories_per_100g * f;
      verifiedProtein += r.protein_per_100g * f;
      verifiedCarbs += r.carbs_per_100g * f;
      verifiedFat += r.fat_per_100g * f;
      verifiedFiber += r.fiber_per_100g * f;
    }

    const round1 = (v: number) => Math.round(v * 10) / 10;
    const diffKcal = Math.round(verifiedCalories) - targetCalories;
    const diffP = round1(verifiedProtein - targetProtein);
    const diffC = round1(verifiedCarbs - targetCarbs);
    const diffF = round1(verifiedFat - targetFat);

    const isWithinTol =
      Math.abs(diffKcal) / (targetCalories || 1) <= 0.05 &&
      Math.abs(diffP) / (targetProtein || 1) <= 0.05 &&
      Math.abs(diffC) / (targetCarbs || 1) <= 0.08 &&
      Math.abs(diffF) / (targetFat || 1) <= 0.08;

    this.logger.log(
      `[Validação de Dieta Automática] Meta: ${targetCalories} kcal, ${targetProtein}g P, ${targetCarbs}g C, ${targetFat}g F | Salvo: ${Math.round(verifiedCalories)} kcal, ${round1(verifiedProtein)}g P, ${round1(verifiedCarbs)}g C, ${round1(verifiedFat)}g F | Diferenças: ${diffKcal} kcal, ${diffP}g P, ${diffC}g C, ${diffF}g F | Tolerância atendida: ${isWithinTol}`
    );

    return this.getDietById(userId, dietId);
  }
}
