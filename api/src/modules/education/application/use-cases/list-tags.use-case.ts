import { Injectable, Inject } from '@nestjs/common';
import { IArticleRepository } from '../ports/article-repository.port';

@Injectable()
export class ListTagsUseCase {
  constructor(
    @Inject('ARTICLE_REPOSITORY') private readonly articleRepository: IArticleRepository,
  ) {}

  async execute(): Promise<string[]> {
    return this.articleRepository.findTags();
  }
}
