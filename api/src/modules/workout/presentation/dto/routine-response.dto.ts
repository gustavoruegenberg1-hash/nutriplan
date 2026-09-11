import { ApiProperty } from '@nestjs/swagger';

export class WorkoutSetResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() setNumber: number;
  @ApiProperty() reps: number;
  @ApiProperty() weightKg: number;
  @ApiProperty() restSeconds: number;
  @ApiProperty({ required: false }) rpe?: number;
}

export class ExerciseResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
  @ApiProperty() muscleGroup: string;
  @ApiProperty() equipment: string;
}

export class ExerciseEntryResponseDto {
  @ApiProperty() id: string;
  @ApiProperty({ type: ExerciseResponseDto }) exercise: ExerciseResponseDto;
  @ApiProperty({ required: false }) notes?: string;
  @ApiProperty({ type: [WorkoutSetResponseDto] }) sets: WorkoutSetResponseDto[];
}

export class WorkoutDayResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
  @ApiProperty() dayOfWeek: number;
  @ApiProperty({ type: [ExerciseEntryResponseDto] }) exercises: ExerciseEntryResponseDto[];
}

export class RoutineResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() userId: string;
  @ApiProperty() name: string;
  @ApiProperty() isActive: boolean;
  @ApiProperty({ type: [WorkoutDayResponseDto] }) days: WorkoutDayResponseDto[];
}
