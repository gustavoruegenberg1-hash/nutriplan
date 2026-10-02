import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, IsNumber, IsOptional, ValidateNested, IsArray, Min, IsBoolean } from 'class-validator';

export class CreateWorkoutSetDto {
  @ApiProperty()
  @IsNumber()
  @Min(1)
  reps: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  weightKg: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  restSeconds: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  rpe?: number;
}

export class CreateExerciseEntryDto {
  @ApiProperty()
  @IsString()
  exerciseId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  completed?: boolean;

  @ApiProperty({ type: [CreateWorkoutSetDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateWorkoutSetDto)
  sets: CreateWorkoutSetDto[];
}

export class CreateWorkoutDayDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Day of week enum name (e.g. MONDAY) or number 0-6' })
  dayOfWeek: any;

  @ApiProperty({ type: [CreateExerciseEntryDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateExerciseEntryDto)
  exercises: CreateExerciseEntryDto[];
}

export class CreateRoutineDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ type: [CreateWorkoutDayDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateWorkoutDayDto)
  workoutDays: CreateWorkoutDayDto[];
}
