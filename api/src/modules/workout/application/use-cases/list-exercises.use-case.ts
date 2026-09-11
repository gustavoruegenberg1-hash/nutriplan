import { Injectable, Inject } from '@nestjs/common';
import { IExerciseRepository } from '../ports/exercise-repository.port';
import { Exercise } from '../../domain/entities/exercise.entity';

@Injectable()
export class ListExercisesUseCase {
  constructor(
    @Inject('EXERCISE_REPOSITORY') private readonly exerciseRepository: IExerciseRepository,
  ) {}

  async execute(muscleGroup?: string, query?: string): Promise<Exercise[]> {
    if (query) {
      return this.exerciseRepository.search(query);
    }
    if (muscleGroup) {
      return this.exerciseRepository.findByMuscleGroup(muscleGroup);
    }
    return this.exerciseRepository.findAll();
  }
}
