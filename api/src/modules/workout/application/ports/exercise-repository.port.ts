import { Exercise } from '../../domain/entities/exercise.entity';

export interface IExerciseRepository {
  findAll(): Promise<Exercise[]>;
  findById(id: string): Promise<Exercise | null>;
  findByMuscleGroup(muscleGroup: string): Promise<Exercise[]>;
  search(query: string): Promise<Exercise[]>;
  create(data: any): Promise<Exercise>;
}
