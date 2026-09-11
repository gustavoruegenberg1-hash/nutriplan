import { Controller, Get, Query, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';
import { SearchFoodUseCase } from '../../application/use-cases/search-food.use-case';
import { SearchFoodQueryDto } from '../dto/search-food.dto';
import { IFoodRepository } from '../../application/ports/food-repository.port';
import { Inject } from '@nestjs/common';

@ApiTags('Foods')
@Controller('foods')
export class FoodController {
  constructor(
    private readonly searchFoodUseCase: SearchFoodUseCase,
    @Inject('FOOD_REPOSITORY') private readonly foodRepository: IFoodRepository,
  ) {}

  @Get('search')
  @ApiOperation({ summary: 'Search foods' })
  async search(@Query() query: SearchFoodQueryDto) {
    const searchTerm = query.query || query.q || '';
    return this.searchFoodUseCase.execute(searchTerm, query.limit || 20);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get food by ID' })
  async getById(@Param('id') id: string) {
    return this.foodRepository.findById(id);
  }
}
