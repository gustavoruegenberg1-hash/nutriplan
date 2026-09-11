import { Module } from '@nestjs/common';
import { FirestoreFoodRepository } from './infrastructure/repositories/firestore-food.repository';
import { FirestoreDietPlanRepository } from './infrastructure/repositories/firestore-diet-plan.repository';
import { SearchFoodUseCase } from './application/use-cases/search-food.use-case';
import { CreateDietPlanUseCase } from './application/use-cases/create-diet-plan.use-case';
import { GetDietPlanUseCase } from './application/use-cases/get-diet-plan.use-case';
import { ExportDietPlanUseCase } from './application/use-cases/export-diet-plan.use-case';
import { ImportDietPlanUseCase } from './application/use-cases/import-diet-plan.use-case';
import { MacroCalculatorService } from './domain/services/macro-calculator.service';
import { FoodController } from './presentation/controllers/food.controller';
import { DietController } from './presentation/controllers/diet.controller';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [PassportModule],
  controllers: [FoodController, DietController],
  providers: [
    {
      provide: 'FOOD_REPOSITORY',
      useClass: FirestoreFoodRepository,
    },
    {
      provide: 'DIET_PLAN_REPOSITORY',
      useClass: FirestoreDietPlanRepository,
    },
    MacroCalculatorService,
    SearchFoodUseCase,
    CreateDietPlanUseCase,
    GetDietPlanUseCase,
    ExportDietPlanUseCase,
    ImportDietPlanUseCase,
  ],
  exports: [MacroCalculatorService],
})
export class DietModule {}
