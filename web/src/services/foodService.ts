import { api } from '../api/client';
import { FoodItem } from '../types';
import { SEED_FOODS } from '../data/seedData';

const FOODS_CACHE_KEY = 'nutriplan_foods_cache';

const POPULAR_FOOD_NAMES = [
  'arroz branco cozido',
  'feijão carioca cozido',
  'frango filé de peito',
  'ovo de galinha',
  'aveia em flocos',
  'banana prata',
  'leite desnatado',
  'batata doce cozida',
  'azeite de oliva',
  'maçã fuji',
  'pão de forma integral',
  'carne bovina moída',
  'patinho bovino grelhado',
  'queijo minas frescal',
  'whey protein 80%',
];

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
          this.memoryCache = parsed;
          return;
        }
      }
    } catch {
      // Ignora erro de JSON no storage
    }
    this.memoryCache = [...SEED_FOODS];
  }

  private persistCache(foods: FoodItem[]) {
    try {
      this.memoryCache = foods;
      localStorage.setItem(FOODS_CACHE_KEY, JSON.stringify(foods.slice(0, 300)));
    } catch {
      // Storage cheio ou desabilitado
    }
  }

  /**
   * Busca alimentos por termo ou retorna itens populares caso a consulta seja vazia.
   */
  async searchFoods(query: string = '', limit: number = 30): Promise<FoodItem[]> {
    const cleanQuery = query.trim().toLowerCase();

    // Se busca vazia, prioriza alimentos populares da TACO
    if (!cleanQuery) {
      return this.getPopularFoods(limit);
    }

    try {
      const res = await api.get('/foods/search', {
        params: { query: cleanQuery, limit },
      });
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        // Atualiza memória cache com novos itens encontrados
        const currentIds = new Set(this.memoryCache.map((f) => f.id));
        const newItems = res.data.filter((f: FoodItem) => !currentIds.has(f.id));
        if (newItems.length > 0) {
          this.persistCache([...newItems, ...this.memoryCache]);
        }
        return res.data;
      }
    } catch (err) {
      console.warn('FoodService: API indisponível, usando acervo local resiliente da Tabela TACO.', err);
    }

    // Fallback local instantâneo
    return this.searchLocal(cleanQuery, limit);
  }

  /**
   * Retorna os alimentos mais consumidos e recomendados da Tabela TACO.
   */
  async getPopularFoods(limit: number = 24): Promise<FoodItem[]> {
    const list = this.memoryCache.length > 0 ? this.memoryCache : SEED_FOODS;

    const popularMatches: FoodItem[] = [];
    const otherFoods: FoodItem[] = [];

    list.forEach((food) => {
      const lower = food.name.toLowerCase();
      const isPop = POPULAR_FOOD_NAMES.some((pop) => lower.includes(pop));
      if (isPop) {
        popularMatches.push(food);
      } else {
        otherFoods.push(food);
      }
    });

    return [...popularMatches, ...otherFoods].slice(0, limit);
  }

  /**
   * Busca resiliente no cache local e seed
   */
  searchLocal(query: string, limit: number = 30): FoodItem[] {
    const clean = query.toLowerCase().trim();
    const source = this.memoryCache.length > 0 ? this.memoryCache : SEED_FOODS;

    if (!clean) return source.slice(0, limit);

    // Divisão de termos para busca multi-palavra (ex: "frango grelhado")
    const terms = clean.split(/\s+/).filter(Boolean);

    return source
      .filter((food) => {
        const nameLower = food.name.toLowerCase();
        return terms.every((term) => nameLower.includes(term));
      })
      .slice(0, limit);
  }

  /**
   * Obtém alimento por ID
   */
  async getFoodById(id: string): Promise<FoodItem | null> {
    try {
      const res = await api.get(`/foods/${id}`);
      if (res.data) return res.data;
    } catch {
      // Fallback
    }

    const source = this.memoryCache.length > 0 ? this.memoryCache : SEED_FOODS;
    return source.find((f) => f.id === id) || null;
  }
}

export const foodService = new FoodService();
