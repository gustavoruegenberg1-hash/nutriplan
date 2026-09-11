import { Injectable, Inject } from '@nestjs/common';
import { IFoodRepository } from '../ports/food-repository.port';
import { FoodItem } from '../../domain/entities/food-item.entity';

@Injectable()
export class SearchFoodUseCase {
  constructor(
    @Inject('FOOD_REPOSITORY') private readonly foodRepository: IFoodRepository,
  ) {}

  async execute(query: string, limit: number = 20): Promise<FoodItem[]> {
    return this.foodRepository.search(query, limit);
  }
}
