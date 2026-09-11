import { Article } from '../../domain/entities/article.entity';

export interface IArticleRepository {
  findAll(filters: { tag?: string; page: number; limit: number }): Promise<{ items: Article[]; total: number }>;
  findById(id: string): Promise<Article | null>;
  create(data: any): Promise<Article>;
  update(id: string, data: any): Promise<Article>;
  delete(id: string): Promise<void>;
  findTags(): Promise<string[]>;
  createTag(name: string): Promise<void>;
}
