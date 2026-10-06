import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { ProfileModule } from '../profile/profile.module';
import { DietsModule } from '../diets/diets.module';
import { WorkoutsModule } from '../workouts/workouts.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [ProfileModule, DietsModule, WorkoutsModule, AuthModule],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
