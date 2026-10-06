import { IsNotEmpty, IsString, IsOptional, IsInt, Min, Max, IsNumber, IsArray } from 'class-validator';

export class CreateWorkoutDto {
  @IsNotEmpty({ message: 'O nome do treino é obrigatório (ex: Treino A - Peito e Tríceps)' })
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  splitName?: string;

  @IsOptional()
  @IsInt()
  @Min(5, { message: 'Duração mínima é de 5 minutos' })
  @Max(300, { message: 'Duração máxima é de 300 minutos' })
  estimatedDurationMin?: number;
}

export class AddWorkoutExerciseDto {
  @IsNotEmpty({ message: 'O ID do exercício é obrigatório' })
  @IsString()
  exerciseId!: string;

  @IsOptional()
  @IsInt()
  orderIndex?: number;

  @IsNotEmpty({ message: 'A quantidade de séries é obrigatória' })
  @IsInt()
  @Min(1, { message: 'Mínimo de 1 série' })
  @Max(20, { message: 'Máximo de 20 séries' })
  sets!: number;

  @IsNotEmpty({ message: 'A quantidade de repetições é obrigatória' })
  @IsInt()
  @Min(1, { message: 'Mínimo de 1 repetição' })
  @Max(100, { message: 'Máximo de 100 repetições' })
  reps!: number;

  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'A carga deve ser positiva ou zero' })
  weightKg?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(600)
  restSeconds?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateWorkoutExerciseDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  sets?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  reps?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  weightKg?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(600)
  restSeconds?: number;

  @IsOptional()
  @IsInt()
  orderIndex?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class LogExerciseItemDto {
  @IsNotEmpty()
  @IsString()
  exerciseId!: string;

  @IsNotEmpty()
  @IsString()
  exerciseName!: string;

  @IsInt()
  @Min(1)
  setsCompleted!: number;

  @IsInt()
  @Min(1)
  repsCompleted!: number;

  @IsNumber()
  @Min(0)
  weightUsedKg!: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateWorkoutLogDto {
  @IsNotEmpty({ message: 'A data de execução é obrigatória' })
  @IsString()
  performedDate!: string;

  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(360)
  durationMin?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsArray()
  exercises!: LogExerciseItemDto[];
}

export class GenerateMultipleSuggestionsDto {
  @IsOptional()
  @IsArray()
  muscleGroups?: string[];

  @IsOptional()
  @IsString()
  goal?: string;

  @IsOptional()
  @IsString()
  level?: string;

  @IsOptional()
  @IsInt()
  durationMin?: number;
}

export class ApplySuggestionExerciseDto {
  @IsNotEmpty()
  @IsString()
  exerciseId!: string;

  @IsOptional()
  @IsInt()
  sets?: number;

  @IsOptional()
  @IsInt()
  reps?: number;

  @IsOptional()
  @IsNumber()
  weightKg?: number;

  @IsOptional()
  @IsInt()
  restSeconds?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class ApplyChosenSuggestionDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  splitName?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  estimatedDurationMin?: number;

  @IsArray()
  exercises!: ApplySuggestionExerciseDto[];
}
