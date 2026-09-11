import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IArticleRepository } from '../ports/article-repository.port';
import { Article } from '../../domain/entities/article.entity';

@Injectable()
export class GetArticleUseCase {
  constructor(
    @Inject('ARTICLE_REPOSITORY') private readonly articleRepository: IArticleRepository,
  ) {}

  async execute(id: string): Promise<Article> {
    const article = await this.articleRepository.findById(id);
    if (!article) {
      throw new NotFoundException(`Article with id ${id} not found`);
    }
    return article;
  }
}
