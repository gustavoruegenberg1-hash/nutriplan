import { api } from '../api/client';
import { Exercise } from '../types';
import { SEED_EXERCISES } from '../data/seedData';

const EXERCISES_CACHE_KEY = 'nutriplan_exercises_cache';

class ExerciseService {
  private memoryCache: Exercise[] = [];

  constructor() {
    this.initCache();
  }

  private initCache() {
    try {
      const saved = localStorage.getItem(EXERCISES_CACHE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.memoryCache = parsed;
          return;
        }
      }
    } catch {
      // Ignora erro no storage
    }
    this.memoryCache = [...SEED_EXERCISES];
  }

  private persistCache(exercises: Exercise[]) {
    try {
      this.memoryCache = exercises;
      localStorage.setItem(EXERCISES_CACHE_KEY, JSON.stringify(exercises));
    } catch {
      // Storage indisponível
    }
  }

  /**
   * Obtém todo o catálogo de exercícios com fallback resiliente.
   */
  async getExercises(): Promise<Exercise[]> {
    try {
      const res = await api.get('/exercises');
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        this.persistCache(res.data);
        return res.data;
      }
    } catch (err) {
      console.warn('ExerciseService: API indisponível, utilizando catálogo local resiliente.', err);
    }

    // Retorna do cache ou seed caso a API falhe
    return this.memoryCache.length > 0 ? this.memoryCache : SEED_EXERCISES;
  }

  /**
   * Filtra exercícios localmente por grupo muscular e texto
   */
  filterExercises(
    exercises: Exercise[],
    query: string = '',
    muscleGroup: string = 'ALL'
  ): Exercise[] {
    const cleanQuery = query.trim().toLowerCase();
    const cleanGroup = (muscleGroup || 'ALL').toUpperCase();

    return exercises.filter((ex) => {
      // 1. Grupo muscular
      if (cleanGroup !== 'ALL') {
        const exGroup = (ex.muscleGroup || '').toUpperCase();
        if (exGroup !== cleanGroup) return false;
      }

      // 2. Busca textual
      if (cleanQuery) {
        const nameMatch = (ex.name || '').toLowerCase().includes(cleanQuery);
        const equipMatch = (ex.equipment || '').toLowerCase().includes(cleanQuery);
        if (!nameMatch && !equipMatch) return false;
      }

      return true;
    });
  }

  /**
   * Obtém exercício por ID
   */
  async getExerciseById(id: string): Promise<Exercise | null> {
    const all = await this.getExercises();
    return all.find((e) => e.id === id) || null;
  }
}

export const exerciseService = new ExerciseService();
