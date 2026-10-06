import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { WorkoutsService } from './workouts.service';
import {
  CreateWorkoutDto,
  AddWorkoutExerciseDto,
  UpdateWorkoutExerciseDto,
  CreateWorkoutLogDto,
  GenerateMultipleSuggestionsDto,
  ApplyChosenSuggestionDto,
} from './dto/workout.dtos';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../auth/decorators/current-user.decorator';

@Controller()
export class WorkoutsController {
  constructor(private readonly workoutsService: WorkoutsService) {}

  // 1. Catálogo de Exercícios (Aberto para consulta autenticada)
  @Get('exercises')
  @UseGuards(JwtAuthGuard)
  async listExercises(
    @Query('query') query?: string,
    @Query('muscleGroup') muscleGroup?: string,
    @Query('muscleGroups') muscleGroups?: string,
    @Query('equipment') equipment?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const combinedGroup = muscleGroups || muscleGroup;
    return this.workoutsService.searchExercises({
      query,
      muscleGroup: combinedGroup,
      equipment,
      limit: limit ? parseInt(limit, 10) : 50,
      offset: offset ? parseInt(offset, 10) : 0,
    });
  }

  @Get('exercises/:id')
  @UseGuards(JwtAuthGuard)
  async getExercise(@Param('id') id: string) {
    return this.workoutsService.getExerciseById(id);
  }

  // 2. Rotinas de Treino do Usuário
  @Get('workouts')
  @UseGuards(JwtAuthGuard)
  async listWorkouts(@CurrentUser() user: CurrentUserPayload) {
    return this.workoutsService.listUserWorkouts(user.userId);
  }

  @Post('workouts')
  @UseGuards(JwtAuthGuard)
  async createWorkout(@CurrentUser() user: CurrentUserPayload, @Body() dto: CreateWorkoutDto) {
    return this.workoutsService.createWorkout(user.userId, dto);
  }

  @Post('workouts/generate-suggestion')
  @UseGuards(JwtAuthGuard)
  async generateSuggestion(
    @CurrentUser() user: CurrentUserPayload,
    @Body()
    dto: {
      goal: string;
      level?: string;
      daysPerWeek: number;
      availableTimeMin?: number;
      equipment?: string;
    },
  ) {
    return this.workoutsService.generateSuggestion(user.userId, dto);
  }

  @Post('workouts/generate-suggestions')
  @UseGuards(JwtAuthGuard)
  async generateSuggestions(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: GenerateMultipleSuggestionsDto,
  ) {
    return this.workoutsService.generateMultipleSuggestions(user.userId, dto);
  }

  @Post('workouts/apply-suggestion')
  @UseGuards(JwtAuthGuard)
  async applySuggestion(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: ApplyChosenSuggestionDto,
  ) {
    return this.workoutsService.applyChosenSuggestion(user.userId, dto);
  }

  @Get('workouts/:id')
  @UseGuards(JwtAuthGuard)
  async getWorkout(@CurrentUser() user: CurrentUserPayload, @Param('id') id: string) {
    return this.workoutsService.getWorkoutById(user.userId, id);
  }

  @Put('workouts/:id')
  @UseGuards(JwtAuthGuard)
  async updateWorkout(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
    @Body() dto: CreateWorkoutDto,
  ) {
    return this.workoutsService.updateWorkout(user.userId, id, dto);
  }

  @Delete('workouts/:id')
  @UseGuards(JwtAuthGuard)
  async deleteWorkout(@CurrentUser() user: CurrentUserPayload, @Param('id') id: string) {
    return this.workoutsService.deleteWorkout(user.userId, id);
  }

  @Post('workouts/:id/exercises')
  @UseGuards(JwtAuthGuard)
  async addExercise(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') workoutId: string,
    @Body() dto: AddWorkoutExerciseDto,
  ) {
    return this.workoutsService.addExerciseToWorkout(user.userId, workoutId, dto);
  }

  @Put('workouts/:id/exercises/reorder')
  @UseGuards(JwtAuthGuard)
  async reorderExercises(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') workoutId: string,
    @Body() dto: { exerciseIds: string[] },
  ) {
    return this.workoutsService.reorderWorkoutExercises(user.userId, workoutId, dto.exerciseIds);
  }

  @Put('workouts/:id/exercises/:weId')
  @UseGuards(JwtAuthGuard)
  async updateExercise(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') workoutId: string,
    @Param('weId') weId: string,
    @Body() dto: UpdateWorkoutExerciseDto,
  ) {
    return this.workoutsService.updateWorkoutExercise(user.userId, workoutId, weId, dto);
  }

  @Delete('workouts/:id/exercises/:weId')
  @UseGuards(JwtAuthGuard)
  async removeExercise(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') workoutId: string,
    @Param('weId') weId: string,
  ) {
    return this.workoutsService.removeWorkoutExercise(user.userId, workoutId, weId);
  }

  // 3. Registro de Treino e Histórico
  @Post('workouts/:id/log')
  @UseGuards(JwtAuthGuard)
  async logWorkout(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') workoutId: string,
    @Body() dto: CreateWorkoutLogDto,
  ) {
    return this.workoutsService.logWorkout(user.userId, workoutId, dto);
  }

  @Get('workout-logs')
  @UseGuards(JwtAuthGuard)
  async listLogs(
    @CurrentUser() user: CurrentUserPayload,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.workoutsService.listWorkoutLogs(
      user.userId,
      limit ? parseInt(limit, 10) : 20,
      offset ? parseInt(offset, 10) : 0,
    );
  }

  @Get('workout-logs/:id')
  @UseGuards(JwtAuthGuard)
  async getLog(@CurrentUser() user: CurrentUserPayload, @Param('id') id: string) {
    return this.workoutsService.getWorkoutLogById(user.userId, id);
  }
}
