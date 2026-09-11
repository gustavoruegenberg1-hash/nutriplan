import { Injectable, Inject } from '@nestjs/common';
import { IWorkoutRepository } from '../ports/workout-repository.port';
import { IExerciseRepository } from '../ports/exercise-repository.port';
import { Routine } from '../../domain/entities/routine.entity';

@Injectable()
export class ImportRoutineUseCase {
  constructor(
    @Inject('WORKOUT_REPOSITORY') private readonly workoutRepository: IWorkoutRepository,
    @Inject('EXERCISE_REPOSITORY') private readonly exerciseRepository: IExerciseRepository,
  ) {}

  async execute(userId: string, jsonData: string): Promise<Routine> {
    const data = JSON.parse(jsonData);
    
    // Deactivate previous active routines
    await this.workoutRepository.deactivateUserRoutines(userId);
    
    return this.workoutRepository.create(userId, data);
  }
}
