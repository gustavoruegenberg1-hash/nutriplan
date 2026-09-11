import { Injectable, Inject } from '@nestjs/common';
import { IArticleRepository } from '../ports/article-repository.port';
import { Article } from '../../domain/entities/article.entity';

@Injectable()
export class CreateArticleUseCase {
  constructor(
    @Inject('ARTICLE_REPOSITORY') private readonly articleRepository: IArticleRepository,
  ) {}

  async execute(data: any): Promise<Article> {
    if (data.tags && data.tags.length > 0) {
      for (const tag of data.tags) {
        await this.articleRepository.createTag(tag);
      }
    }
    return this.articleRepository.create(data);
  }
}
