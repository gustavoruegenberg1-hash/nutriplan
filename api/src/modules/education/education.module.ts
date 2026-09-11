import { Module } from '@nestjs/common';
import { ArticleController } from './presentation/controllers/article.controller';
import { CreateArticleUseCase } from './application/use-cases/create-article.use-case';
import { GetArticleUseCase } from './application/use-cases/get-article.use-case';
import { ListArticlesUseCase } from './application/use-cases/list-articles.use-case';
import { ListTagsUseCase } from './application/use-cases/list-tags.use-case';
import { FirestoreArticleRepository } from './infrastructure/repositories/firestore-article.repository';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [PassportModule],
  controllers: [ArticleController],
  providers: [
    {
      provide: 'ARTICLE_REPOSITORY',
      useClass: FirestoreArticleRepository,
    },
    CreateArticleUseCase,
    GetArticleUseCase,
    ListArticlesUseCase,
    ListTagsUseCase,
  ],
})
export class EducationModule {}
