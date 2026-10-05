import { describe, it, expect, beforeEach } from 'vitest';
import { FirestoreFoodRepository } from './firestore-food.repository';

describe('FirestoreFoodRepository with Full TACO Catalog', () => {
  let repository: FirestoreFoodRepository;

  beforeEach(() => {
    const mockFirebase: any = {
      db: {
        collection: () => ({
          get: async () => ({ empty: true, docs: [] }),
          doc: () => ({ get: async () => ({ exists: false }) }),
        }),
      },
    };
    repository = new FirestoreFoodRepository(mockFirebase);
  });

  it('deve carregar todos os 745 alimentos (597 TACO + suplementos e extras)', async () => {
    const all = await repository.search('', 1000);
    expect(all.length).toBeGreaterThanOrEqual(745);
  });

  it('deve encontrar alimentos oficiais da TACO por busca com acento ou sem acento', async () => {
    const comAcento = await repository.search('maçã fuji', 10);
    const semAcento = await repository.search('maca fuji', 10);

    expect(comAcento.length).toBeGreaterThan(0);
    expect(semAcento.length).toBeGreaterThan(0);
    expect(comAcento[0].name.toLowerCase()).toContain('maçã');
    expect(semAcento[0].name.toLowerCase()).toContain('maçã');
  });

  it('deve encontrar itens por busca multi-palavra e partes da preparação', async () => {
    const results = await repository.search('arroz cozido', 10);
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((f) => f.name.toLowerCase().includes('arroz'))).toBe(true);
    expect(results.some((f) => f.name.toLowerCase().includes('cozido'))).toBe(true);
  });

  it('deve buscar por categoria TACO como cereais, frutas ou carnes', async () => {
    const results = await repository.search('cereais', 20);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].category).toBe('Cereais e derivados');
  });

  it('deve preservar suplementos populares com ID original e categoria', async () => {
    const whey = await repository.search('whey protein', 10);
    expect(whey.length).toBeGreaterThan(0);
    expect(whey[0].category).toBe('Suplementos');
  });

  it('deve encontrar alimento pelo ID oficial TACO taco-1', async () => {
    const food = await repository.findById('taco-1');
    expect(food).not.toBeNull();
    expect(food?.name).toBe('Arroz, integral, cozido');
    expect(food?.caloriesPer100g).toBe(124);
    expect(food?.category).toBe('Cereais e derivados');
  });
});
