import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { NutritionModule } from './modules/nutrition/nutrition.module';
import { ProfileModule } from './modules/profile/profile.module';
import { FoodsModule } from './modules/foods/foods.module';
import { DietsModule } from './modules/diets/diets.module';
import { WorkoutsModule } from './modules/workouts/workouts.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { ProfessionalsModule } from './modules/professionals/professionals.module';
import { AdminModule } from './modules/admin/admin.module';
import { MessagesModule } from './modules/messages/messages.module';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    NutritionModule,
    ProfileModule,
    FoodsModule,
    DietsModule,
    WorkoutsModule,
    DashboardModule,
    ProfessionalsModule,
    AdminModule,
    MessagesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
