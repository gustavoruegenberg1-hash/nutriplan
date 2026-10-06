import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { NutritionCalculatorService, ProportionalNutrients } from '../nutrition/nutrition-calculator.service';

export interface FoodEntity {
  id: string;
  legacyId: string | null;
  name: string;
  category: string;
  subCategory: string | null;
  source: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  fiberPer100g: number;
  sodiumMgPer100g: number | null;
  micronutrients: any;
  tags: string[];
  isActive: boolean;
  isVerified: boolean;
}

export interface FoodSearchFilters {
  query?: string;
  category?: string;
  tag?: string;
  limit?: number;
  offset?: number;
}

@Injectable()
export class FoodsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly calc: NutritionCalculatorService,
  ) {}

  async searchFoods(filters: FoodSearchFilters): Promise<{ items: FoodEntity[]; total: number }> {
    const limit = Math.min(Math.max(filters.limit || 40, 1), 200);
    const offset = Math.max(filters.offset || 0, 0);

    const conditions: string[] = ['is_active = 1'];
    const params: any[] = [];

    if (filters.query && filters.query.trim()) {
      const q = `%${filters.query.trim().toLowerCase()}%`;
      conditions.push("(LOWER(name) LIKE ? OR LOWER(category) LIKE ? OR LOWER(COALESCE(sub_category, '')) LIKE ?)");
      params.push(q, q, q);
    }

    if (filters.category && filters.category.trim() && filters.category !== 'ALL') {
      conditions.push('category = ?');
      params.push(filters.category.trim());
    }

    if (filters.tag && filters.tag.trim()) {
      conditions.push('tags_json LIKE ?');
      params.push(`%"${filters.tag.trim()}"%`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countRes = this.db.queryOne<{ count: number }>(
      `SELECT COUNT(*) as count FROM foods ${whereClause}`,
      params
    );
    const total = countRes ? countRes.count : 0;

    const rows = this.db.query(
      `SELECT * FROM foods ${whereClause} ORDER BY name ASC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const items = rows.map((r) => this.mapRowToEntity(r));
    return { items, total };
  }

  async getFoodById(id: string): Promise<FoodEntity> {
    const row = this.db.queryOne('SELECT * FROM foods WHERE id = ? OR legacy_id = ?', [id, id]);
    if (!row) {
      throw new NotFoundException(`Alimento com id "${id}" não encontrado na base nutricional.`);
    }
    return this.mapRowToEntity(row);
  }

  async getCategories(): Promise<string[]> {
    const rows = this.db.query<{ category: string }>(
      'SELECT DISTINCT category FROM foods WHERE is_active = 1 ORDER BY category ASC'
    );
    return rows.map((r) => r.category);
  }

  async calculatePortion(id: string, quantityGrams: number): Promise<{
    food: FoodEntity;
    portionGrams: number;
    nutrients: ProportionalNutrients;
  }> {
    const food = await this.getFoodById(id);
    const nutrients = this.calc.calculateProportions(food, quantityGrams);

    return {
      food,
      portionGrams: quantityGrams,
      nutrients,
    };
  }

  private mapRowToEntity(row: any): FoodEntity {
    let micronutrients = null;
    let tags: string[] = [];

    if (row.micronutrients_json) {
      try {
        micronutrients = JSON.parse(row.micronutrients_json);
      } catch {}
    }

    if (row.tags_json) {
      try {
        tags = JSON.parse(row.tags_json);
      } catch {}
    }

    return {
      id: row.id,
      legacyId: row.legacy_id,
      name: row.name,
      category: row.category,
      subCategory: row.sub_category,
      source: row.source,
      caloriesPer100g: row.calories_per_100g,
      proteinPer100g: row.protein_per_100g,
      carbsPer100g: row.carbs_per_100g,
      fatPer100g: row.fat_per_100g,
      fiberPer100g: row.fiber_per_100g,
      sodiumMgPer100g: row.sodium_mg_per_100g,
      micronutrients,
      tags,
      isActive: Boolean(row.is_active),
      isVerified: Boolean(row.is_verified),
    };
  }
}
