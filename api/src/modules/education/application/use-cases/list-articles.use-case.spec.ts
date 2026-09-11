import { describe, it, expect, vi } from 'vitest';
import { ListArticlesUseCase } from './list-articles.use-case';
import { IArticleRepository } from '../ports/article-repository.port';
import { Article } from '../../domain/entities/article.entity';

describe('ListArticlesUseCase', () => {
  it('should list articles with optional tag filter', async () => {
    const mockArticles: Article[] = [
      new Article('art-1', 'Proteína e Hipertrofia', 'Resumo...', 'https://doi.org/1', ['Nutrição', 'Proteína'], new Date()),
      new Article('art-2', 'Volume de Treino', 'Resumo...', 'https://doi.org/2', ['Treino', 'Hipertrofia'], new Date()),
    ];

    const mockRepo: IArticleRepository = {
      findAll: vi.fn().mockResolvedValue({ items: mockArticles, total: 2 }),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findTags: vi.fn(),
      createTag: vi.fn(),
    };

    const useCase = new ListArticlesUseCase(mockRepo);
    const results = await useCase.execute('Nutrição', 1, 10);

    expect(mockRepo.findAll).toHaveBeenCalledWith({ tag: 'Nutrição', page: 1, limit: 10 });
    expect(results.items).toHaveLength(2);
    expect(results.items[0].title).toBe('Proteína e Hipertrofia');
  });
});
