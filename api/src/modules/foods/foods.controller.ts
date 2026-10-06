import { Controller, Get, Param, Query, ParseIntPipe, Optional } from '@nestjs/common';
import { FoodsService, FoodEntity } from './foods.service';

@Controller('foods')
export class FoodsController {
  constructor(private readonly foodsService: FoodsService) {}

  @Get()
  async getFoods(
    @Query('query') query?: string,
    @Query('category') category?: string,
    @Query('tag') tag?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.foodsService.searchFoods({
      query,
      category,
      tag,
      limit: limit ? parseInt(limit, 10) : 40,
      offset: offset ? parseInt(offset, 10) : 0,
    });
  }

  @Get('categories')
  async getCategories(): Promise<string[]> {
    return this.foodsService.getCategories();
  }

  @Get(':id')
  async getFoodById(@Param('id') id: string): Promise<FoodEntity> {
    return this.foodsService.getFoodById(id);
  }

  @Get(':id/portion/:grams')
  async calculatePortion(
    @Param('id') id: string,
    @Param('grams', ParseIntPipe) grams: number,
  ) {
    return this.foodsService.calculatePortion(id, grams);
  }
}
