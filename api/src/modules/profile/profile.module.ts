import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { NutritionModule } from '../nutrition/nutrition.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [NutritionModule, AuthModule],
  controllers: [ProfileController],
  providers: [ProfileService],
  exports: [ProfileService],
})
export class ProfileModule {}
