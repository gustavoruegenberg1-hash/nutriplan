import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FoodsService } from './foods.service';
import { DatabaseService } from '../../database/database.service';
import { NutritionCalculatorService } from '../nutrition/nutrition-calculator.service';
import { NotFoundException } from '@nestjs/common';

describe('FoodsService (Catálogo de Alimentos TACO)', () => {
  let db: DatabaseService;
  let calc: NutritionCalculatorService;
  let foodsService: FoodsService;

  beforeEach(() => {
    db = DatabaseService.createInMemory();
    calc = new NutritionCalculatorService();
    foodsService = new FoodsService(db, calc);
  });

  afterEach(() => {
    db.onModuleDestroy();
  });

  it('TEST-FOOD-001: deve listar alimentos com paginação a partir da base TACO semeada', async () => {
    const res = await foodsService.searchFoods({ limit: 10, offset: 0 });
    expect(res.items.length).toBe(10);
    expect(res.total).toBeGreaterThanOrEqual(700);
  });

  it('TEST-FOOD-002: deve filtrar alimentos por termo de busca textual (ex: "arroz")', async () => {
    const res = await foodsService.searchFoods({ query: 'arroz' });
    expect(res.items.length).toBeGreaterThan(0);
    expect(res.items.every((f) => f.name.toLowerCase().includes('arroz'))).toBe(true);
  });

  it('TEST-FOOD-003: deve filtrar alimentos por categoria oficial', async () => {
    const categories = await foodsService.getCategories();
    expect(categories.length).toBeGreaterThan(0);

    const firstCat = categories[0];
    const res = await foodsService.searchFoods({ category: firstCat });
    expect(res.items.length).toBeGreaterThan(0);
    expect(res.items.every((f) => f.category === firstCat)).toBe(true);
  });

  it('TEST-FOOD-004: deve recuperar alimento por ID e lançar NotFoundException para id inválido', async () => {
    const list = await foodsService.searchFoods({ limit: 1 });
    const firstFood = list.items[0];

    const found = await foodsService.getFoodById(firstFood.id);
    expect(found.id).toBe(firstFood.id);
    expect(found.caloriesPer100g).toBe(firstFood.caloriesPer100g);

    await expect(foodsService.getFoodById('id-inexistente-xyz')).rejects.toThrow(NotFoundException);
  });

  it('TEST-FOOD-005: deve calcular porção proporcional em gramas (RN10)', async () => {
    const list = await foodsService.searchFoods({ limit: 1 });
    const food = list.items[0];

    const portion = await foodsService.calculatePortion(food.id, 200);
    expect(portion.portionGrams).toBe(200);
    // Para 200g, o valor nutricional é exatamente o dobro de 100g
    expect(portion.nutrients.calories).toBe(Math.round(food.caloriesPer100g * 2));
    expect(portion.nutrients.protein).toBe(Math.round(food.proteinPer100g * 2 * 10) / 10);
  });
});
