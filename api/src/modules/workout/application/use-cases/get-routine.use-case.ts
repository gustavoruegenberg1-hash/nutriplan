import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IWorkoutRepository } from '../ports/workout-repository.port';
import { Routine } from '../../domain/entities/routine.entity';

@Injectable()
export class GetRoutineUseCase {
  constructor(
    @Inject('WORKOUT_REPOSITORY') private readonly workoutRepository: IWorkoutRepository,
  ) {}

  async execute(id: string, userId: string): Promise<Routine> {
    const routine = await this.workoutRepository.findById(id);
    if (!routine || routine.userId !== userId) {
      throw new NotFoundException('Rotina de treino não encontrada.');
    }
    return routine;
  }
}
