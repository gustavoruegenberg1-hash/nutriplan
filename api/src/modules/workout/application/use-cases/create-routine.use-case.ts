import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IWorkoutRepository } from '../ports/workout-repository.port';
import { IExerciseRepository } from '../ports/exercise-repository.port';
import { Routine } from '../../domain/entities/routine.entity';

@Injectable()
export class CreateRoutineUseCase {
  constructor(
    @Inject('WORKOUT_REPOSITORY') private readonly workoutRepository: IWorkoutRepository,
    @Inject('EXERCISE_REPOSITORY') private readonly exerciseRepository: IExerciseRepository,
  ) {}

  async execute(userId: string, data: any): Promise<Routine> {
    // Validate exercises exist
    for (const day of data.workoutDays) {
      for (const ex of day.exercises) {
        const exercise = await this.exerciseRepository.findById(ex.exerciseId);
        if (!exercise) {
          throw new NotFoundException(`Exercício com id ${ex.exerciseId} não foi encontrado.`);
        }
      }
    }

    // Deactivate previous
    await this.workoutRepository.deactivateUserRoutines(userId);

    // Create new
    return this.workoutRepository.create(userId, data);
  }
}
