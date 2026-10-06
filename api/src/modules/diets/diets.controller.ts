import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { DietsService, CalculatedDiet } from './diets.service';
import { CreateDietDto, CreateMealDto, AddMealFoodDto, UpdateMealFoodDto, GenerateDietDto } from './dto/diet.dtos';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../auth/decorators/current-user.decorator';

@Controller('diets')
@UseGuards(JwtAuthGuard)
export class DietsController {
  constructor(private readonly dietsService: DietsService) {}

  @Get()
  async listDiets(@CurrentUser() user: CurrentUserPayload) {
    return this.dietsService.listUserDiets(user.userId);
  }

  @Post()
  async createDiet(@CurrentUser() user: CurrentUserPayload, @Body() dto: CreateDietDto): Promise<CalculatedDiet> {
    return this.dietsService.createDiet(user.userId, dto);
  }

  @Post('generate-suggestion')
  async generateSuggestion(@CurrentUser() user: CurrentUserPayload, @Body() dto: GenerateDietDto): Promise<CalculatedDiet> {
    return this.dietsService.generateSuggestion(user.userId, dto);
  }

  @Get(':id')
  async getDiet(@CurrentUser() user: CurrentUserPayload, @Param('id') id: string): Promise<CalculatedDiet> {
    return this.dietsService.getDietById(user.userId, id);
  }

  @Delete(':id')
  async deleteDiet(@CurrentUser() user: CurrentUserPayload, @Param('id') id: string) {
    return this.dietsService.deleteDiet(user.userId, id);
  }

  @Post(':id/meals')
  async addMeal(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') dietId: string,
    @Body() dto: CreateMealDto,
  ): Promise<CalculatedDiet> {
    return this.dietsService.addMeal(user.userId, dietId, dto);
  }

  @Delete(':id/meals/:mealId')
  async removeMeal(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') dietId: string,
    @Param('mealId') mealId: string,
  ): Promise<CalculatedDiet> {
    return this.dietsService.removeMeal(user.userId, dietId, mealId);
  }

  @Post(':id/meals/:mealId/foods')
  async addFoodToMeal(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') dietId: string,
    @Param('mealId') mealId: string,
    @Body() dto: AddMealFoodDto,
  ): Promise<CalculatedDiet> {
    return this.dietsService.addFoodToMeal(user.userId, dietId, mealId, dto);
  }

  @Put(':id/meals/:mealId/foods/:mealFoodId')
  async updateMealFood(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') dietId: string,
    @Param('mealId') mealId: string,
    @Param('mealFoodId') mealFoodId: string,
    @Body() dto: UpdateMealFoodDto,
  ): Promise<CalculatedDiet> {
    return this.dietsService.updateMealFood(user.userId, dietId, mealId, mealFoodId, dto);
  }

  @Delete(':id/meals/:mealId/foods/:mealFoodId')
  async removeMealFood(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') dietId: string,
    @Param('mealId') mealId: string,
    @Param('mealFoodId') mealFoodId: string,
  ): Promise<CalculatedDiet> {
    return this.dietsService.removeMealFood(user.userId, dietId, mealId, mealFoodId);
  }
}
