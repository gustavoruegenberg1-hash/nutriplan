import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
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
    alerts: string[];
  };
  warnings: string[];
  legalDisclaimer: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class DietsService {
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

      targetComparison = {
        targets,
        differences: { calories: diffKcal, protein: diffP, carbs: diffC, fat: diffF },
        percentageMet: { calories: pctKcal, protein: pctP, carbs: pctC, fat: pctF },
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
   * Seção 13: Gerador Assistido de Proposta de Dieta Editável
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
    if (profile && profile.tdee && profile.weight && profile.gender) {
      const targets = this.calc.calculateTargets(
        profile.tdee,
        (dto.goal || profile.goal) as NutritionalGoal,
        profile.weight,
        profile.gender as BiologicalGender
      );
      targetCalories = targets.calories;
    }

    // Busca alimentos padrão da TACO para montar a proposta
    const findFoodByName = (name: string) =>
      this.db.queryOne<{ id: string }>('SELECT id FROM foods WHERE LOWER(name) LIKE ? LIMIT 1', [`%${name.toLowerCase()}%`]);

    const ovo = findFoodByName('ovo') || findFoodByName('clara');
    const aveia = findFoodByName('aveia');
    const banana = findFoodByName('banana');
    const arroz = findFoodByName('arroz');
    const feijao = findFoodByName('feijão') || findFoodByName('feijao');
    const frango = findFoodByName('frango') || findFoodByName('patinho');
    const azeite = findFoodByName('azeite');
    const maca = findFoodByName('maçã') || findFoodByName('maca');
    const whey = findFoodByName('whey') || findFoodByName('leite');

    const dietName = `Sugestão NutriPlan — ${dto.goal || profile?.goal || 'Equilibrada'}`;
    const dietId = randomUUID();
    const now = new Date().toISOString();

    this.db.transaction(() => {
      this.db.run(
        `INSERT INTO diets (id, user_id, name, description, is_active, created_at, updated_at)
         VALUES (?, ?, ?, 'Sugestão assistida baseada em metas. 100% editável.', 0, ?, ?)`,
        [dietId, userId, dietName, now, now]
      );

      // Café da manhã
      const m1 = randomUUID();
      this.db.run(`INSERT INTO meals (id, diet_id, name, order_index, created_at) VALUES (?, ?, 'Café da Manhã', 0, ?)`, [m1, dietId, now]);
      if (ovo) this.db.run(`INSERT INTO meal_foods (id, meal_id, food_id, quantity_grams, order_index, created_at) VALUES (?, ?, ?, 100, 0, ?)`, [randomUUID(), m1, ovo.id, now]);
      if (aveia) this.db.run(`INSERT INTO meal_foods (id, meal_id, food_id, quantity_grams, order_index, created_at) VALUES (?, ?, ?, 40, 1, ?)`, [randomUUID(), m1, aveia.id, now]);
      if (banana) this.db.run(`INSERT INTO meal_foods (id, meal_id, food_id, quantity_grams, order_index, created_at) VALUES (?, ?, ?, 80, 2, ?)`, [randomUUID(), m1, banana.id, now]);

      // Almoço
      const m2 = randomUUID();
      this.db.run(`INSERT INTO meals (id, diet_id, name, order_index, created_at) VALUES (?, ?, 'Almoço', 1, ?)`, [m2, dietId, now]);
      if (arroz) this.db.run(`INSERT INTO meal_foods (id, meal_id, food_id, quantity_grams, order_index, created_at) VALUES (?, ?, ?, 150, 0, ?)`, [randomUUID(), m2, arroz.id, now]);
      if (feijao) this.db.run(`INSERT INTO meal_foods (id, meal_id, food_id, quantity_grams, order_index, created_at) VALUES (?, ?, ?, 100, 1, ?)`, [randomUUID(), m2, feijao.id, now]);
      if (frango) this.db.run(`INSERT INTO meal_foods (id, meal_id, food_id, quantity_grams, order_index, created_at) VALUES (?, ?, ?, 130, 2, ?)`, [randomUUID(), m2, frango.id, now]);
      if (azeite) this.db.run(`INSERT INTO meal_foods (id, meal_id, food_id, quantity_grams, order_index, created_at) VALUES (?, ?, ?, 10, 3, ?)`, [randomUUID(), m2, azeite.id, now]);

      // Lanche
      const m3 = randomUUID();
      this.db.run(`INSERT INTO meals (id, diet_id, name, order_index, created_at) VALUES (?, ?, 'Lanche da Tarde', 2, ?)`, [m3, dietId, now]);
      if (maca) this.db.run(`INSERT INTO meal_foods (id, meal_id, food_id, quantity_grams, order_index, created_at) VALUES (?, ?, ?, 120, 0, ?)`, [randomUUID(), m3, maca.id, now]);
      if (whey) this.db.run(`INSERT INTO meal_foods (id, meal_id, food_id, quantity_grams, order_index, created_at) VALUES (?, ?, ?, 30, 1, ?)`, [randomUUID(), m3, whey.id, now]);

      // Jantar
      const m4 = randomUUID();
      this.db.run(`INSERT INTO meals (id, diet_id, name, order_index, created_at) VALUES (?, ?, 'Jantar', 3, ?)`, [m4, dietId, now]);
      if (arroz) this.db.run(`INSERT INTO meal_foods (id, meal_id, food_id, quantity_grams, order_index, created_at) VALUES (?, ?, ?, 120, 0, ?)`, [randomUUID(), m4, arroz.id, now]);
      if (frango) this.db.run(`INSERT INTO meal_foods (id, meal_id, food_id, quantity_grams, order_index, created_at) VALUES (?, ?, ?, 130, 1, ?)`, [randomUUID(), m4, frango.id, now]);
    });

    return this.getDietById(userId, dietId);
  }
}
