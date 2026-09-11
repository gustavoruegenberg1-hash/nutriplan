import { Module } from '@nestjs/common';
import { WorkoutController } from './presentation/controllers/workout.controller';
import { ExerciseController } from './presentation/controllers/exercise.controller';
import { CreateRoutineUseCase } from './application/use-cases/create-routine.use-case';
import { GetRoutineUseCase } from './application/use-cases/get-routine.use-case';
import { ListExercisesUseCase } from './application/use-cases/list-exercises.use-case';
import { ExportRoutineUseCase } from './application/use-cases/export-routine.use-case';
import { ImportRoutineUseCase } from './application/use-cases/import-routine.use-case';
import { FirestoreWorkoutRepository } from './infrastructure/repositories/firestore-workout.repository';
import { FirestoreExerciseRepository } from './infrastructure/repositories/firestore-exercise.repository';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [PassportModule],
  controllers: [WorkoutController, ExerciseController],
  providers: [
    {
      provide: 'WORKOUT_REPOSITORY',
      useClass: FirestoreWorkoutRepository,
    },
    {
      provide: 'EXERCISE_REPOSITORY',
      useClass: FirestoreExerciseRepository,
    },
    CreateRoutineUseCase,
    GetRoutineUseCase,
    ListExercisesUseCase,
    ExportRoutineUseCase,
    ImportRoutineUseCase,
  ],
})
export class WorkoutModule {}
