import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../shared/guards/roles.guard';
import { Roles } from '../../../../shared/decorators/roles.decorator';
import { CreateArticleUseCase } from '../../application/use-cases/create-article.use-case';
import { GetArticleUseCase } from '../../application/use-cases/get-article.use-case';
import { ListArticlesUseCase } from '../../application/use-cases/list-articles.use-case';
import { CreateArticleDto } from '../dto/create-article.dto';
import { ListArticlesQueryDto } from '../dto/list-articles-query.dto';

@ApiTags('Education')
@Controller('articles')
export class ArticleController {
  constructor(
    private readonly createArticleUseCase: CreateArticleUseCase,
    private readonly getArticleUseCase: GetArticleUseCase,
    private readonly listArticlesUseCase: ListArticlesUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List articles (public)' })
  async listArticles(@Query() query: ListArticlesQueryDto) {
    return this.listArticlesUseCase.execute(query.tag, query.page, query.limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get article by ID (public)' })
  async getArticle(@Param('id') id: string) {
    return this.getArticleUseCase.execute(id);
  }

  @Post()
  @ApiBearerAuth()
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Create new article (admin)' })
  async createArticle(@Body() dto: CreateArticleDto) {
    return this.createArticleUseCase.execute(dto);
  }
}
