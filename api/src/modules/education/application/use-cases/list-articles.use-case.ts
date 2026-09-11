import { Injectable, Inject } from '@nestjs/common';
import { IArticleRepository } from '../ports/article-repository.port';
import { Article } from '../../domain/entities/article.entity';

@Injectable()
export class ListArticlesUseCase {
  constructor(
    @Inject('ARTICLE_REPOSITORY') private readonly articleRepository: IArticleRepository,
  ) {}

  async execute(tag?: string, page: number = 1, limit: number = 10): Promise<{ items: Article[]; total: number }> {
    return this.articleRepository.findAll({ tag, page, limit });
  }
}
