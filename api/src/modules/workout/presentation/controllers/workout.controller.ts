import { Controller, Post, Get, Body, Param, UseGuards, Inject, Delete } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';
import { CurrentUser } from '../../../../shared/decorators/current-user.decorator';
import { CreateRoutineUseCase } from '../../application/use-cases/create-routine.use-case';
import { GetRoutineUseCase } from '../../application/use-cases/get-routine.use-case';
import { ExportRoutineUseCase } from '../../application/use-cases/export-routine.use-case';
import { ImportRoutineUseCase } from '../../application/use-cases/import-routine.use-case';
import { CreateRoutineDto } from '../dto/create-routine.dto';
import { RoutineResponseDto } from '../dto/routine-response.dto';
import { IWorkoutRepository } from '../../application/ports/workout-repository.port';

@ApiTags('Routines')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('routines')
export class WorkoutController {
  constructor(
    private readonly createRoutineUseCase: CreateRoutineUseCase,
    private readonly getRoutineUseCase: GetRoutineUseCase,
    private readonly exportRoutineUseCase: ExportRoutineUseCase,
    private readonly importRoutineUseCase: ImportRoutineUseCase,
    @Inject('WORKOUT_REPOSITORY') private readonly workoutRepository: IWorkoutRepository,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new routine' })
  @ApiResponse({ type: RoutineResponseDto, status: 201 })
  async createRoutine(@CurrentUser() user: any, @Body() dto: CreateRoutineDto) {
    return this.createRoutineUseCase.execute(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List user routines' })
  @ApiResponse({ type: [RoutineResponseDto] })
  async listRoutines(@CurrentUser() user: any) {
    return this.workoutRepository.findByUserId(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get routine by ID' })
  @ApiResponse({ type: RoutineResponseDto })
  async getRoutine(@CurrentUser() user: any, @Param('id') id: string) {
    return this.getRoutineUseCase.execute(user.id, id);
  }

  @Get(':id/export')
  @ApiOperation({ summary: 'Export routine as JSON' })
  async exportRoutine(@CurrentUser() user: any, @Param('id') id: string) {
    return this.exportRoutineUseCase.execute(user.id, id);
  }

  @Post('import')
  @ApiOperation({ summary: 'Import routine from JSON' })
  @ApiResponse({ type: RoutineResponseDto, status: 201 })
  async importRoutine(@CurrentUser() user: any, @Body('data') data: string) {
    return this.importRoutineUseCase.execute(user.id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete routine' })
  async deleteRoutine(@CurrentUser() user: any, @Param('id') id: string) {
    const routine = await this.getRoutineUseCase.execute(user.id, id);
    await this.workoutRepository.delete(routine.id);
    return { success: true };
  }
}
