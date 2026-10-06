import { IsOptional, IsNumber, IsString, IsIn, Min, Max, IsArray } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  @Min(10, { message: 'Idade mínima permitida é 10 anos' })
  @Max(120, { message: 'Idade máxima permitida é 120 anos' })
  age?: number;

  @IsOptional()
  @IsString()
  @IsIn(['MALE', 'FEMALE', 'male', 'female'], { message: 'Sexo deve ser MALE ou FEMALE' })
  gender?: string;

  @IsOptional()
  @IsNumber()
  @Min(20, { message: 'Peso mínimo é 20 kg' })
  @Max(350, { message: 'Peso máximo é 350 kg' })
  weight?: number;

  @IsOptional()
  @IsNumber()
  @Min(50, { message: 'Altura mínima é 50 cm' })
  @Max(250, { message: 'Altura máxima é 250 cm' })
  height?: number;

  @IsOptional()
  @IsString()
  @IsIn([
    'SEDENTARY',
    'LIGHTLY_ACTIVE',
    'MODERATELY_ACTIVE',
    'VERY_ACTIVE',
    'EXTRA_ACTIVE',
    'LIGHT',
    'MODERATE',
    'INTENSE',
    'VERY_INTENSE',
    'sedentary',
    'lightly_active',
    'moderately_active',
    'very_active',
    'extra_active',
    'light',
    'moderate',
    'intense',
    'very_intense',
  ], { message: 'Nível de atividade física inválido' })
  activityLevel?: string;

  @IsOptional()
  @IsString()
  @IsIn(['LOSE_WEIGHT', 'MAINTAIN', 'GAIN_WEIGHT', 'lose_weight', 'maintain', 'gain_weight'])
  goal?: string;

  @IsOptional()
  @IsString()
  dietaryNotes?: string;

  @IsOptional()
  @IsArray()
  restrictionIds?: string[];
}
