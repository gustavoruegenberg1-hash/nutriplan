import { IsString, IsOptional, IsNumber, IsIn, IsBoolean, IsArray, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'John Doe' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 75.5 })
  @IsOptional()
  @IsNumber()
  @Min(20)
  @Max(400)
  weight?: number;

  @ApiPropertyOptional({ example: 180 })
  @IsOptional()
  @IsNumber()
  @Min(50)
  @Max(260)
  height?: number;

  @ApiPropertyOptional({ example: 30 })
  @IsOptional()
  @IsNumber()
  @Min(10)
  @Max(120)
  age?: number;

  @ApiPropertyOptional({ example: 'male' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.toLowerCase() : value))
  @IsIn(['male', 'female', 'MALE', 'FEMALE'])
  gender?: string;

  @ApiPropertyOptional({ example: 'moderately_active' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.toLowerCase() : value))
  @IsIn([
    'sedentary',
    'lightly_active',
    'moderately_active',
    'very_active',
    'extra_active',
    'SEDENTARY',
    'LIGHTLY_ACTIVE',
    'MODERATELY_ACTIVE',
    'VERY_ACTIVE',
    'EXTRA_ACTIVE',
  ])
  activityLevel?: string;

  @ApiPropertyOptional({ example: 'lose_weight' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.toLowerCase() : value))
  goal?: string;

  // Avaliação de Alergias e Restrições Alimentares
  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  hasFoodAllergies?: boolean;

  @ApiPropertyOptional({ example: ['amendoim', 'leite'] })
  @IsOptional()
  @IsArray()
  allergies?: string[];

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  hasFoodIntolerances?: boolean;

  @ApiPropertyOptional({ example: ['lactose'] })
  @IsOptional()
  @IsArray()
  intolerances?: string[];

  @ApiPropertyOptional({ example: 'NO' })
  @IsOptional()
  @IsString()
  needsProfessionalSupervision?: string;

  @ApiPropertyOptional({ example: 'Acompanhamento médico para hipertensão' })
  @IsOptional()
  @IsString()
  dietaryRestrictionsNotes?: string;

  // Avaliação Física e Limitações para Exercícios
  @ApiPropertyOptional({ example: 'INTERMEDIATE' })
  @IsOptional()
  @IsString()
  experienceLevel?: string;

  @ApiPropertyOptional({ example: 4 })
  @IsOptional()
  @IsNumber()
  trainingFrequencyDays?: number;

  @ApiPropertyOptional({ example: 'CURRENTLY' })
  @IsOptional()
  @IsString()
  weightTrainingExperience?: string;

  @ApiPropertyOptional({ example: 12 })
  @IsOptional()
  @IsNumber()
  weightTrainingTimeMonths?: number;

  @ApiPropertyOptional({ example: 'NO' })
  @IsOptional()
  @IsString()
  hasPhysicalDisabilities?: string;

  @ApiPropertyOptional({ example: ['ombro_direito'] })
  @IsOptional()
  @IsArray()
  affectedBodyRegions?: string[];

  @ApiPropertyOptional({ example: 'Cirurgia no manguito rotador há 2 anos' })
  @IsOptional()
  @IsString()
  physicalDisabilityNotes?: string;

  @ApiPropertyOptional({ example: 'NO' })
  @IsOptional()
  @IsString()
  hasMuscleInjuries?: string;

  @ApiPropertyOptional({ example: ['SHOULDERS', 'CHEST'] })
  @IsOptional()
  @IsArray()
  affectedMuscles?: string[];

  @ApiPropertyOptional({ example: 'NO' })
  @IsOptional()
  @IsString()
  hasJointPain?: string;

  @ApiPropertyOptional({ example: ['ombro_direito', 'joelho_direito'] })
  @IsOptional()
  @IsArray()
  affectedJoints?: string[];

  @ApiPropertyOptional({ example: 'Estalos no joelho ao agachar' })
  @IsOptional()
  @IsString()
  jointPainNotes?: string;

  @ApiPropertyOptional({ example: 'SOMETIMES' })
  @IsOptional()
  @IsString()
  hasExercisePain?: string;

  @ApiPropertyOptional()
  @IsOptional()
  painDetails?: Record<string, any>;

  @ApiPropertyOptional({ example: ['agachar', 'empurrar'] })
  @IsOptional()
  @IsArray()
  difficultMovements?: string[];

  @ApiPropertyOptional({ example: ['Desenvolvimento com Barra'] })
  @IsOptional()
  @IsArray()
  exercisesToAvoid?: string[];

  @ApiPropertyOptional({ example: ['FULL_GYM', 'DUMBBELLS'] })
  @IsOptional()
  @IsArray()
  availableEquipment?: string[];

  @ApiPropertyOptional({ example: ['art-01-proteina-hipertrofia'] })
  @IsOptional()
  @IsArray()
  readArticles?: string[];

  @ApiPropertyOptional({ example: 16.5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  bodyFatPct?: number;

  @ApiPropertyOptional({ example: { skinTone: '#F3C5A5', hairStyle: 'short', hairColor: '#2B1B17' } })
  @IsOptional()
  avatarAppearance?: Record<string, any>;
}
