import { DietPlan } from '../../domain/entities/diet-plan.entity';

export interface IDietPlanRepository {
  findByUserId(userId: string): Promise<DietPlan[]>;
  findById(id: string): Promise<DietPlan | null>;
  create(userId: string, data: any): Promise<DietPlan>;
  update(id: string, data: any): Promise<DietPlan>;
  delete(id: string): Promise<void>;
  setActive(id: string, userId: string): Promise<void>;
}
