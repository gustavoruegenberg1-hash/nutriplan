import { Module } from '@nestjs/common';
import { NutritionCalculatorService } from './nutrition-calculator.service';

@Module({
  providers: [NutritionCalculatorService],
  exports: [NutritionCalculatorService],
})
export class NutritionModule {}
