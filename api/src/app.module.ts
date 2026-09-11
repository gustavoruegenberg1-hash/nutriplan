import { Module } from '@nestjs/common';
import { FirebaseModule } from './shared/firebase/firebase.module';
import { AuthModule } from './modules/auth/auth.module';
import { DietModule } from './modules/diet/diet.module';
import { WorkoutModule } from './modules/workout/workout.module';
import { EducationModule } from './modules/education/education.module';
import { GamificationModule } from './modules/gamification/gamification.module';
import { IdleGameModule } from './modules/idle-game/idle-game.module';
import { ProfessionalsModule } from './modules/professionals/professionals.module';

@Module({
  imports: [
    FirebaseModule,
    AuthModule,
    DietModule,
    WorkoutModule,
    EducationModule,
    GamificationModule,
    IdleGameModule,
    ProfessionalsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
