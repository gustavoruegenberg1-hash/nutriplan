import { IsString, IsNumber, Min, IsArray, ValidateNested, IsOptional, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMealItemDto {
  @ApiProperty()
  @IsUUID()
  foodItemId: string;

  @ApiProperty()
  @IsNumber()
  @Min(0.1)
  quantityGrams: number;
}

export class CreateMealDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  timeOfDay?: string;

  @ApiProperty({ type: [CreateMealItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMealItemDto)
  items: CreateMealItemDto[];
}

export class CreateDayPlanDto {
  @ApiProperty({ description: 'Day of week name (e.g. MONDAY) or number 0-6' })
  dayOfWeek: any;

  @ApiProperty({ type: [CreateMealDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMealDto)
  meals: CreateMealDto[];
}

export class CreateDietPlanDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ type: [CreateDayPlanDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateDayPlanDto)
  days: CreateDayPlanDto[];
}
