import { IsString, IsOptional, IsNumber, IsIn, IsBoolean, Min, Max, IsEmail } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class AdminUpdateUserDto {
  @ApiPropertyOptional({ example: 'João Silva' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'joao@email.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 'ADMIN', enum: ['USER', 'ADMIN', 'PROFESSIONAL'] })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.toUpperCase().trim() : value))
  @IsIn(['USER', 'ADMIN', 'PROFESSIONAL'])
  role?: 'USER' | 'ADMIN' | 'PROFESSIONAL';

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isEmailVerified?: boolean;

  @ApiPropertyOptional({ example: 75.5 })
  @IsOptional()
  @IsNumber()
  @Min(20)
  @Max(400)
  weight?: number | null;

  @ApiPropertyOptional({ example: 180 })
  @IsOptional()
  @IsNumber()
  @Min(50)
  @Max(260)
  height?: number | null;

  @ApiPropertyOptional({ example: 30 })
  @IsOptional()
  @IsNumber()
  @Min(10)
  @Max(120)
  age?: number | null;

  @ApiPropertyOptional({ example: 'male' })
  @IsOptional()
  @Transform(({ value }) => (!value || (typeof value === 'string' && value.trim() === '') ? null : value.toLowerCase()))
  @IsIn(['male', 'female', 'MALE', 'FEMALE'])
  gender?: string | null;

  @ApiPropertyOptional({ example: 'moderately_active' })
  @IsOptional()
  @Transform(({ value }) => (!value || (typeof value === 'string' && value.trim() === '') ? null : value.toLowerCase()))
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
  activityLevel?: string | null;

  @ApiPropertyOptional({ example: 'lose_weight' })
  @IsOptional()
  @Transform(({ value }) => (!value || (typeof value === 'string' && value.trim() === '') ? null : value.toLowerCase()))
  goal?: string | null;

  @ApiPropertyOptional({ example: 15.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  bodyFatPct?: number | null;
}
