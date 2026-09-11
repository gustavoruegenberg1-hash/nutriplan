import { describe, it, expect, vi } from 'vitest';
import { CreateDietPlanUseCase } from './create-diet-plan.use-case';
import { IDietPlanRepository } from '../ports/diet-plan-repository.port';
import { IFoodRepository } from '../ports/food-repository.port';
import { DietPlan } from '../../domain/entities/diet-plan.entity';
import { FoodItem } from '../../domain/entities/food-item.entity';
import { NotFoundException } from '@nestjs/common';

describe('CreateDietPlanUseCase', () => {
  it('should create and activate a diet plan when all food items exist', async () => {
    const mockFood = new FoodItem('food-1', 'Arroz Integral', 'TACO', 124, 2.6, 25.8, 1.0, 2.7);
    const mockPlan = new DietPlan('plan-1', 'user-1', 'Dieta Hipertrofia', true, []);

    const mockDietRepo: IDietPlanRepository = {
      findByUserId: vi.fn(),
      findById: vi.fn(),
      create: vi.fn().mockResolvedValue(mockPlan),
      update: vi.fn(),
      delete: vi.fn(),
      setActive: vi.fn().mockResolvedValue(undefined),
    };

    const mockFoodRepo: IFoodRepository = {
      search: vi.fn(),
      findById: vi.fn(),
      findByIds: vi.fn().mockResolvedValue([mockFood]),
      create: vi.fn(),
    };

    const useCase = new CreateDietPlanUseCase(mockDietRepo, mockFoodRepo);

    const dto = {
      name: 'Dieta Hipertrofia',
      days: [
        {
          dayOfWeek: 'MONDAY',
          meals: [
            {
              name: 'Almoço',
              items: [{ foodItemId: 'food-1', quantityGrams: 200 }],
            },
          ],
        },
      ],
    };

    const result = await useCase.execute('user-1', dto);

    expect(mockFoodRepo.findByIds).toHaveBeenCalledWith(['food-1']);
    expect(mockDietRepo.create).toHaveBeenCalledWith('user-1', dto);
    expect(mockDietRepo.setActive).toHaveBeenCalledWith('plan-1', 'user-1');
    expect(result.id).toBe('plan-1');
  });

  it('should throw NotFoundException if any foodItem is not found', async () => {
    const mockDietRepo: IDietPlanRepository = {
      findByUserId: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      setActive: vi.fn(),
    };

    const mockFoodRepo: IFoodRepository = {
      search: vi.fn(),
      findById: vi.fn(),
      findByIds: vi.fn().mockResolvedValue([]), // Food not found
      create: vi.fn(),
    };

    const useCase = new CreateDietPlanUseCase(mockDietRepo, mockFoodRepo);

    const dto = {
      name: 'Dieta',
      days: [
        {
          dayOfWeek: 'MONDAY',
          meals: [{ name: 'Almoço', items: [{ foodItemId: 'invalid-id', quantityGrams: 100 }] }],
        },
      ],
    };

    await expect(useCase.execute('user-1', dto)).rejects.toThrow(NotFoundException);
  });
});
