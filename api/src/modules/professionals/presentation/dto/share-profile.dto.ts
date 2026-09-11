import { IsString, IsOptional, IsNumber, IsArray } from 'class-validator';

export class ShareProfileDto {
  @IsOptional()
  @IsString()
  goal?: string;

  @IsOptional()
  @IsNumber()
  weight?: number;

  @IsOptional()
  @IsNumber()
  height?: number;

  @IsOptional()
  @IsArray()
  dietaryRestrictions?: string[];

  @IsOptional()
  @IsString()
  trainingExperience?: string;
}
