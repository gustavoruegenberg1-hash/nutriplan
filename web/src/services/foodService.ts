import { api } from '../api/client';
import type { FoodItem } from '../types';
import { SEED_FOODS } from '../data/seedData';

const FOODS_CACHE_KEY = 'nutriplan_v2_foods_cache';

const POPULAR_KEYWORDS = [
  'arroz',
  'feijao',
  'frango',
  'ovo',
  'aveia',
  'banana',
  'leite',
  'batata doce',
  'azeite',
  'maca',
  'pao',
  'patinho',
  'queijo minas',
  'whey protein',
  'tilapia',
  'iogurte',
  'alface',
  'tomate',
];

const normalizeText = (str: string): string =>
  (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

class FoodService {
  private memoryCache: FoodItem[] = [];

  constructor() {
    this.initCache();
  }

  private initCache() {
    try {
      const saved = localStorage.getItem(FOODS_CACHE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const seedMap = new Map(SEED_FOODS.map((f) => [f.id, f]));
          parsed.forEach((customFood: FoodItem) => {
            if (!seedMap.has(customFood.id)) {
              seedMap.set(customFood.id, customFood);
            }
          });
          this.memoryCache = Array.from(seedMap.values());
          return;
        }
      }
    } catch {
      // Storage indisponível
    }
    this.memoryCache = [...SEED_FOODS];
  }

  private persistCache(foods: FoodItem[]) {
    try {
      this.memoryCache = foods;
      localStorage.setItem(FOODS_CACHE_KEY, JSON.stringify(foods.slice(0, 400)));
    } catch {
      // Storage cheio
    }
  }

  getAllFoods(): FoodItem[] {
    return this.memoryCache.length > 0 ? this.memoryCache : SEED_FOODS;
  }

  async searchFoods(query: string = '', limit: number = 40): Promise<FoodItem[]> {
    const cleanQuery = query.trim().toLowerCase();

    if (!cleanQuery) {
      return this.getPopularFoods(limit);
    }

    try {
      const res = await api.get('/foods/search', {
        params: { query: cleanQuery, limit },
      });
      const items: FoodItem[] = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.items)
        ? res.data.items
        : [];
      if (items.length > 0) {
        const currentIds = new Set(this.memoryCache.map((f) => f.id));
        const newItems = items.filter((f: FoodItem) => !currentIds.has(f.id));
        if (newItems.length > 0) {
          this.persistCache([...newItems, ...this.memoryCache]);
        }
        return items;
      }
    } catch {
      // Fallback para busca local
    }

    return this.searchLocal(cleanQuery, limit);
  }

  async getPopularFoods(limit: number = 30): Promise<FoodItem[]> {
    const list = this.getAllFoods();

    const popularMatches: FoodItem[] = [];
    const otherFoods: FoodItem[] = [];

    list.forEach((food) => {
      const norm = normalizeText(food.name);
      const isPop = POPULAR_KEYWORDS.some((kw) => norm.includes(kw));
      if (isPop) {
        popularMatches.push(food);
      } else {
        otherFoods.push(food);
      }
    });

    return [...popularMatches, ...otherFoods].slice(0, limit);
  }

  searchLocal(query: string, limit: number = 40): FoodItem[] {
    const source = this.getAllFoods();
    const clean = query.trim();

    if (!clean) return source.slice(0, limit);

    const normQuery = normalizeText(clean);
    const terms = normQuery.split(/\s+/).filter(Boolean);

    return source
      .filter((food) => {
        const nameNorm = normalizeText(food.name);
        const catNorm = food.category ? normalizeText(food.category) : '';
        const subNorm = food.subCategory ? normalizeText(food.subCategory) : '';
        const tagsNorm = (food.tags || []).map((t) => normalizeText(t)).join(' ');
        return terms.every(
          (term) =>
            nameNorm.includes(term) ||
            catNorm.includes(term) ||
            subNorm.includes(term) ||
            tagsNorm.includes(term),
        );
      })
      .sort((a, b) => {
        const normA = normalizeText(a.name);
        const normB = normalizeText(b.name);

        if (normA === normQuery) return -1;
        if (normB === normQuery) return 1;

        const startsA = normA.startsWith(normQuery);
        const startsB = normB.startsWith(normQuery);
        if (startsA && !startsB) return -1;
        if (!startsA && startsB) return 1;

        const firstTerm = terms[0] || '';
        const firstA = normA.startsWith(firstTerm);
        const firstB = normB.startsWith(firstTerm);
        if (firstA && !firstB) return -1;
        if (!firstA && firstB) return 1;

        return 0;
      })
      .slice(0, limit);
  }

  async searchWithFilters(params: {
    query?: string;
    category?: string;
    subCategory?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ items: FoodItem[]; total: number }> {
    try {
      const res = await api.get('/foods/search', {
        params: {
          query: params.query?.trim() || undefined,
          category: params.category && params.category !== 'ALL' ? params.category : undefined,
          subCategory: params.subCategory && params.subCategory !== 'ALL' ? params.subCategory : undefined,
          limit: params.limit || 30,
          offset: params.offset || 0,
        },
      });
      const items: FoodItem[] = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.items)
        ? res.data.items
        : [];
      const total = typeof res.data?.total === 'number' ? res.data.total : items.length;
      return { items, total };
    } catch {
      const items = this.searchLocal(params.query || '', params.limit || 30);
      return { items, total: items.length };
    }
  }

  async getTaxonomy(): Promise<Array<{ category: string; subCategories: string[] }>> {
    try {
      const res = await api.get('/foods/taxonomy');
      if (Array.isArray(res.data) && res.data.length > 0) {
        return res.data;
      }
    } catch {
      // Fallback
    }
    const map = new Map<string, Set<string>>();
    for (const food of this.getAllFoods()) {
      if (food.category) {
        if (!map.has(food.category)) map.set(food.category, new Set());
        if (food.subCategory) map.get(food.category)!.add(food.subCategory);
      }
    }
    return Array.from(map.entries()).map(([category, subs]) => ({
      category,
      subCategories: Array.from(subs).sort(),
    }));
  }

  async getFoodById(id: string): Promise<FoodItem | null> {
    try {
      const res = await api.get(`/foods/${id}`);
      if (res.data) return res.data;
    } catch {
      // Fallback
    }

    const source = this.getAllFoods();
    return source.find((f) => f.id === id || f.legacyId === id) || null;
  }
}

export const foodService = new FoodService();
