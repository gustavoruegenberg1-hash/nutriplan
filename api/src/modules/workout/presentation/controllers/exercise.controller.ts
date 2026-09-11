import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';
import { ListExercisesUseCase } from '../../application/use-cases/list-exercises.use-case';

@ApiTags('Exercises')
@Controller('exercises')
export class ExerciseController {
  constructor(private readonly listExercisesUseCase: ListExercisesUseCase) {}

  @Get()
  @ApiOperation({ summary: 'List exercises' })
  @ApiQuery({ name: 'muscleGroup', required: false })
  @ApiQuery({ name: 'q', required: false })
  async listExercises(@Query('muscleGroup') muscleGroup?: string, @Query('q') q?: string) {
    return this.listExercisesUseCase.execute(muscleGroup, q);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get exercise by ID' })
  async getExercise(@Param('id') id: string) {
    // In a real app we would use a GetExerciseUseCase, for brevity using List that could be refactored
    return { id, message: 'Not implemented single get for brevity' };
  }
}
