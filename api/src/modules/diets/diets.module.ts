import { Module } from '@nestjs/common';
import { DietsService } from './diets.service';
import { DietsController } from './diets.controller';
import { NutritionModule } from '../nutrition/nutrition.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [NutritionModule, AuthModule],
  controllers: [DietsController],
  providers: [DietsService],
  exports: [DietsService],
})
export class DietsModule {}
