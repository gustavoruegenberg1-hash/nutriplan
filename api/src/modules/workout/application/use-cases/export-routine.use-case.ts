import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IWorkoutRepository } from '../ports/workout-repository.port';

@Injectable()
export class ExportRoutineUseCase {
  constructor(
    @Inject('WORKOUT_REPOSITORY') private readonly workoutRepository: IWorkoutRepository,
  ) {}

  async execute(userId: string, routineId: string): Promise<any> {
    const routine = await this.workoutRepository.findById(routineId);
    if (!routine || routine.userId !== userId) {
      throw new NotFoundException(`Routine not found`);
    }
    // Export as structured JSON
    return JSON.stringify(routine, null, 2);
  }
}
