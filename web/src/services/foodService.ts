import { api } from '../api/client';
import { FoodItem } from '../types';
import { SEED_FOODS } from '../data/seedData';

const FOODS_CACHE_KEY = 'nutriplan_foods_cache_v3';
const OLD_FOODS_CACHE_KEY = 'nutriplan_foods_cache_v2';
const LEGACY_CACHE_KEY = 'nutriplan_foods_cache';

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
      // Limpa caches antigos se existirem
      localStorage.removeItem(LEGACY_CACHE_KEY);
      localStorage.removeItem(OLD_FOODS_CACHE_KEY);

      const saved = localStorage.getItem(FOODS_CACHE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const seedMap = new Map(SEED_FOODS.map((f) => [f.id, f]));
          // Mescla itens personalizados do usuário com a base completa de alimentos
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
      // Ignora erro de storage desabilitado
    }
    this.memoryCache = [...SEED_FOODS];
  }

  private persistCache(foods: FoodItem[]) {
    try {
      this.memoryCache = foods;
      // Salva itens recentes mantendo integridade
      localStorage.setItem(FOODS_CACHE_KEY, JSON.stringify(foods.slice(0, 400)));
    } catch {
      // Storage cheio ou desabilitado
    }
  }

  /**
   * Retorna todo o acervo da Tabela TACO em memória
   */
  getAllFoods(): FoodItem[] {
    return this.memoryCache.length > 0 ? this.memoryCache : SEED_FOODS;
  }

  /**
   * Busca alimentos por termo ou retorna itens populares caso a consulta seja vazia.
   */
  async searchFoods(query: string = '', limit: number = 40): Promise<FoodItem[]> {
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
        const currentIds = new Set(this.memoryCache.map((f) => f.id));
        const newItems = res.data.filter((f: FoodItem) => !currentIds.has(f.id));
        if (newItems.length > 0) {
          this.persistCache([...newItems, ...this.memoryCache]);
        }
        return res.data;
      }
    } catch {
      // Fallback silencioso para busca local da Tabela TACO
    }

    // Busca local instantânea e resiliente com todos os 745 alimentos
    return this.searchLocal(cleanQuery, limit);
  }

  /**
   * Retorna os alimentos mais consumidos e recomendados da Tabela TACO.
   */
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

  /**
   * Busca resiliente no cache local com busca insensível a acentos e termos múltiplos
   */
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

  /**
   * Obtém alimento por ID (ou legacyId)
   */
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
