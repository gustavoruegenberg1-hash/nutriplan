import { IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateDietDto {
  @IsNotEmpty({ message: 'O nome da dieta é obrigatório' })
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CreateMealDto {
  @IsNotEmpty({ message: 'O nome da refeição é obrigatório (ex: Café da Manhã, Almoço)' })
  @IsString()
  name!: string;

  @IsOptional()
  orderIndex?: number;

  @IsOptional()
  @IsString()
  targetTime?: string;
}

export class AddMealFoodDto {
  @IsNotEmpty({ message: 'O ID do alimento é obrigatório' })
  @IsString()
  foodId!: string;

  @IsNotEmpty({ message: 'A quantidade em gramas é obrigatória' })
  quantityGrams!: number;

  @IsOptional()
  orderIndex?: number;
}

export class UpdateMealFoodDto {
  @IsNotEmpty({ message: 'A quantidade em gramas é obrigatória' })
  quantityGrams!: number;
}

export class GenerateDietDto {
  @IsOptional()
  goal?: string;

  @IsOptional()
  mealsCount?: number;

  @IsOptional()
  customCalories?: number;
}
