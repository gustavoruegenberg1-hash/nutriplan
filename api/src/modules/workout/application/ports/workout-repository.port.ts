import { Routine } from '../../domain/entities/routine.entity';

export interface IWorkoutRepository {
  findByUserId(userId: string): Promise<Routine[]>;
  findById(id: string): Promise<Routine | null>;
  create(userId: string, data: any): Promise<Routine>;
  update(id: string, data: any): Promise<Routine>;
  delete(id: string): Promise<void>;
  deactivateUserRoutines(userId: string): Promise<void>;
}
