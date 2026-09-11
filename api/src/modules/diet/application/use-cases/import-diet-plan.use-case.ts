import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IDietPlanRepository } from '../ports/diet-plan-repository.port';
import { IFoodRepository } from '../ports/food-repository.port';
import { DietPlan } from '../../domain/entities/diet-plan.entity';

@Injectable()
export class ImportDietPlanUseCase {
  constructor(
    @Inject('DIET_PLAN_REPOSITORY') private readonly dietPlanRepo: IDietPlanRepository,
    @Inject('FOOD_REPOSITORY') private readonly foodRepo: IFoodRepository,
  ) {}

  async execute(userId: string, data: any): Promise<DietPlan> {
    const foodIds = new Set<string>();
    data.days?.forEach((day: any) =>
      day.meals?.forEach((meal: any) =>
        meal.items?.forEach((item: any) => foodIds.add(item.foodItemId)),
      ),
    );

    const foods = await this.foodRepo.findByIds(Array.from(foodIds));
    if (foods.length !== foodIds.size) {
      throw new NotFoundException('Um ou mais alimentos importados não foram encontrados no banco de dados.');
    }

    const plan = await this.dietPlanRepo.create(userId, data);
    return plan;
  }
}
