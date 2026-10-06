import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DietsService } from './diets.service';
import { DatabaseService } from '../../database/database.service';
import { NutritionCalculatorService } from '../nutrition/nutrition-calculator.service';
import { AuthService } from '../auth/auth.service';
import { ProfileService } from '../profile/profile.service';
import { ForbiddenException, BadRequestException, NotFoundException } from '@nestjs/common';

describe('DietsService (Montagem de Dieta, Recálculo e Isolamento Multiusuário)', () => {
  let db: DatabaseService;
  let calc: NutritionCalculatorService;
  let authService: AuthService;
  let profileService: ProfileService;
  let dietsService: DietsService;
  let userAId: string;
  let userBId: string;
  let sampleFoodId: string;

  beforeEach(async () => {
    db = DatabaseService.createInMemory();
    calc = new NutritionCalculatorService();
    authService = new AuthService(db);
    profileService = new ProfileService(db, calc);
    dietsService = new DietsService(db, calc);

    const userA = await authService.register({
      name: 'Atleta A',
      email: 'atleta.a@nutriplan.com',
      password: 'SenhaForte123',
    });
    userAId = userA.user.id;

    const userB = await authService.register({
      name: 'Atleta B',
      email: 'atleta.b@nutriplan.com',
      password: 'SenhaForte123',
    });
    userBId = userB.user.id;

    // Pega um alimento da TACO semeada
    const food = db.queryOne<{ id: string }>('SELECT id FROM foods LIMIT 1');
    sampleFoodId = food!.id;
  });

  afterEach(() => {
    db.onModuleDestroy();
  });

  it('TEST-DIET-001: deve criar uma nova dieta com refeições padrão e totais zerados', async () => {
    const diet = await dietsService.createDiet(userAId, {
      name: 'Plano Cutting 2026',
      description: 'Dieta hipocalórica para perda de gordura',
      isActive: true,
    });

    expect(diet).toBeDefined();
    expect(diet.name).toBe('Plano Cutting 2026');
    expect(diet.meals.length).toBe(4); // Café, Almoço, Lanche, Jantar
    expect(diet.totals.calories).toBe(0);
    expect(diet.totals.protein).toBe(0);
  });

  it('TEST-DIET-002: deve adicionar alimento à refeição e recalcular instantaneamente os nutrientes (RN06, RN10, RN16)', async () => {
    const diet = await dietsService.createDiet(userAId, { name: 'Dieta Hipertrofia' });
    const firstMeal = diet.meals[0];

    const foodInfo = db.queryOne<{ calories_per_100g: number; protein_per_100g: number }>(
      'SELECT calories_per_100g, protein_per_100g FROM foods WHERE id = ?',
      [sampleFoodId]
    );

    const updatedDiet = await dietsService.addFoodToMeal(userAId, diet.id, firstMeal.id, {
      foodId: sampleFoodId,
      quantityGrams: 200,
    });

    const meal = updatedDiet.meals.find((m) => m.id === firstMeal.id);
    expect(meal?.items.length).toBe(1);
    expect(meal?.items[0].quantityGrams).toBe(200);

    const expectedCalories = Math.round(foodInfo!.calories_per_100g * 2);
    expect(meal?.totals.calories).toBe(expectedCalories);
    expect(updatedDiet.totals.calories).toBe(expectedCalories);
  });

  it('TEST-DIET-003: deve recalcular totais ao alterar quantidade em gramas (RN08, RN16)', async () => {
    const diet = await dietsService.createDiet(userAId, { name: 'Dieta Teste Qtd' });
    const firstMeal = diet.meals[0];

    const d1 = await dietsService.addFoodToMeal(userAId, diet.id, firstMeal.id, {
      foodId: sampleFoodId,
      quantityGrams: 100,
    });

    const item = d1.meals[0].items[0];
    const initialCalories = item.nutrients.calories;

    const d2 = await dietsService.updateMealFood(userAId, diet.id, firstMeal.id, item.id, {
      quantityGrams: 250,
    });

    const updatedItem = d2.meals[0].items[0];
    expect(updatedItem.quantityGrams).toBe(250);
    expect(updatedItem.nutrients.calories).toBe(Math.round(initialCalories * 2.5));
    expect(d2.totals.calories).toBe(Math.round(initialCalories * 2.5));
  });

  it('TEST-DIET-004: deve subtrair perfeitamente os totais ao remover alimento (RN09, RN16)', async () => {
    const diet = await dietsService.createDiet(userAId, { name: 'Dieta Remoção' });
    const meal = diet.meals[0];

    const d1 = await dietsService.addFoodToMeal(userAId, diet.id, meal.id, {
      foodId: sampleFoodId,
      quantityGrams: 150,
    });
    expect(d1.totals.calories).toBeGreaterThan(0);

    const itemId = d1.meals[0].items[0].id;
    const d2 = await dietsService.removeMealFood(userAId, diet.id, meal.id, itemId);

    expect(d2.meals[0].items.length).toBe(0);
    expect(d2.totals.calories).toBe(0);
    expect(d2.totals.protein).toBe(0);
  });

  it('TEST-DIET-005: deve rejeitar porção igual a zero ou negativa (RN05, RN14)', async () => {
    const diet = await dietsService.createDiet(userAId, { name: 'Dieta Zero Qtd' });
    const meal = diet.meals[0];

    await expect(
      dietsService.addFoodToMeal(userAId, diet.id, meal.id, { foodId: sampleFoodId, quantityGrams: 0 })
    ).rejects.toThrow(BadRequestException);

    await expect(
      dietsService.addFoodToMeal(userAId, diet.id, meal.id, { foodId: sampleFoodId, quantityGrams: -50 })
    ).rejects.toThrow(BadRequestException);
  });

  it('TEST-SEC-003: deve impedir que Usuário B acesse ou altere dieta do Usuário A (RN01, RN03)', async () => {
    const dietA = await dietsService.createDiet(userAId, { name: 'Dieta Privada do Usuário A' });

    // Usuário B tenta consultar
    await expect(dietsService.getDietById(userBId, dietA.id)).rejects.toThrow(ForbiddenException);

    // Usuário B tenta adicionar alimento à dieta do Usuário A
    await expect(
      dietsService.addFoodToMeal(userBId, dietA.id, dietA.meals[0].id, {
        foodId: sampleFoodId,
        quantityGrams: 100,
      })
    ).rejects.toThrow(ForbiddenException);

    // Usuário B tenta excluir dieta do Usuário A
    await expect(dietsService.deleteDiet(userBId, dietA.id)).rejects.toThrow(ForbiddenException);
  });

  it('TEST-DIET-007: deve emitir alertas quando alimento violar restrições cadastradas (RN12, RN17)', async () => {
    // Cadastra intolerância a lactose para o Usuário A
    const lactoseRes = db.queryOne<{ id: string }>('SELECT id FROM restrictions WHERE id = ?', ['res-lactose']);
    await profileService.updateProfile(userAId, { restrictionIds: [lactoseRes!.id] });

    // Encontra um queijo ou leite na TACO
    const queijo = db.queryOne<{ id: string }>("SELECT id FROM foods WHERE LOWER(name) LIKE '%queijo%' LIMIT 1");
    if (queijo) {
      const diet = await dietsService.createDiet(userAId, { name: 'Dieta com Alerta' });
      const res = await dietsService.addFoodToMeal(userAId, diet.id, diet.meals[0].id, {
        foodId: queijo.id,
        quantityGrams: 50,
      });

      expect(res.warnings.length).toBeGreaterThan(0);
      expect(res.warnings.some((w) => w.includes('lactose'))).toBe(true);
    }
  });

  it('TEST-DIET-009: deve gerar proposta de dieta assistida editável e torná-la ativa (Seção 13)', async () => {
    await profileService.updateProfile(userAId, {
      age: 25,
      gender: 'MALE',
      weight: 75,
      height: 175,
      activityLevel: 'MODERATELY_ACTIVE',
      goal: 'LOSE_WEIGHT',
    });

    const suggestion = await dietsService.generateSuggestion(userAId, { goal: 'LOSE_WEIGHT' });
    expect(suggestion).toBeDefined();
    expect(suggestion.isActive).toBe(true);
    expect(suggestion.meals.length).toBe(4);
    expect(suggestion.totals.calories).toBeGreaterThan(1000);
    expect(suggestion.legalDisclaimer).toBeDefined();
  });

  it('TEST-DIET-010: deve gerar proposta de dieta com número dinâmico de refeições (ex: 5 refeições)', async () => {
    const suggestion5 = await dietsService.generateSuggestion(userAId, {
      goal: 'GAIN_WEIGHT',
      mealsCount: 5,
    });
    expect(suggestion5).toBeDefined();
    expect(suggestion5.isActive).toBe(true);
    expect(suggestion5.meals.length).toBe(5);
    expect(suggestion5.meals.map((m) => m.name)).toEqual([
      'Café da Manhã',
      'Lanche da Manhã',
      'Almoço',
      'Lanche da Tarde',
      'Jantar',
    ]);
  });
});
