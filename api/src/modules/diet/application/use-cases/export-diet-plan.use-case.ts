import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IDietPlanRepository } from '../ports/diet-plan-repository.port';

@Injectable()
export class ExportDietPlanUseCase {
  constructor(
    @Inject('DIET_PLAN_REPOSITORY') private readonly dietPlanRepo: IDietPlanRepository,
  ) {}

  async execute(id: string, userId: string): Promise<any> {
    const plan = await this.dietPlanRepo.findById(id);
    if (!plan || plan.userId !== userId) {
      throw new NotFoundException('Plano alimentar não encontrado.');
    }
    return {
      name: plan.name,
      days: plan.days.map(d => ({
        dayOfWeek: d.dayOfWeek,
        meals: d.meals.map(m => ({
          name: m.name,
          timeOfDay: m.timeOfDay,
          items: m.items.map(i => ({
            foodItemId: i.foodItemId,
            quantityGrams: i.quantityGrams
          }))
        }))
      }))
    };
  }
}
