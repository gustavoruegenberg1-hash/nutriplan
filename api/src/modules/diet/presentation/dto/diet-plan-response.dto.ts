import { ApiProperty } from '@nestjs/swagger';

export class MacroNutrientsDto {
  @ApiProperty() calories: number;
  @ApiProperty() protein: number;
  @ApiProperty() carbs: number;
  @ApiProperty() fat: number;
  @ApiProperty() fiber: number;
}

export class DietPlanResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
  @ApiProperty() isActive: boolean;
  @ApiProperty({ type: MacroNutrientsDto }) totalMacros: MacroNutrientsDto;
  // Further nested types omitted for brevity, will serialize fine
}
