import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IDietPlanRepository } from '../ports/diet-plan-repository.port';
import { DietPlan } from '../../domain/entities/diet-plan.entity';

@Injectable()
export class GetDietPlanUseCase {
  constructor(
    @Inject('DIET_PLAN_REPOSITORY') private readonly dietPlanRepo: IDietPlanRepository,
  ) {}

  async execute(id: string, userId: string): Promise<DietPlan> {
    const plan = await this.dietPlanRepo.findById(id);
    if (!plan || plan.userId !== userId) {
      throw new NotFoundException('Plano alimentar não encontrado.');
    }
    return plan;
  }
}
