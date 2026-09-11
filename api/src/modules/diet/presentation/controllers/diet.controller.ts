import { Controller, Post, Get, Delete, Body, Param, UseGuards, Inject } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';
import { CurrentUser } from '../../../../shared/decorators/current-user.decorator';
import { CreateDietPlanUseCase } from '../../application/use-cases/create-diet-plan.use-case';
import { GetDietPlanUseCase } from '../../application/use-cases/get-diet-plan.use-case';
import { ExportDietPlanUseCase } from '../../application/use-cases/export-diet-plan.use-case';
import { ImportDietPlanUseCase } from '../../application/use-cases/import-diet-plan.use-case';
import { CreateDietPlanDto } from '../dto/create-diet-plan.dto';
import { ImportDietPlanDto } from '../dto/import-diet-plan.dto';
import { IDietPlanRepository } from '../../application/ports/diet-plan-repository.port';

@ApiTags('Diet Plans')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('diet-plans')
export class DietController {
  constructor(
    private readonly createDietPlanUseCase: CreateDietPlanUseCase,
    private readonly getDietPlanUseCase: GetDietPlanUseCase,
    private readonly exportDietPlanUseCase: ExportDietPlanUseCase,
    private readonly importDietPlanUseCase: ImportDietPlanUseCase,
    @Inject('DIET_PLAN_REPOSITORY') private readonly dietPlanRepo: IDietPlanRepository,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new diet plan' })
  async create(@CurrentUser() user: any, @Body() dto: CreateDietPlanDto) {
    const plan = await this.createDietPlanUseCase.execute(user.id, dto);
    return { ...plan, totalMacros: plan.getTotalMacros() };
  }

  @Get()
  @ApiOperation({ summary: 'List user diet plans' })
  async list(@CurrentUser() user: any) {
    return this.dietPlanRepo.findByUserId(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get diet plan by ID' })
  async getById(@CurrentUser() user: any, @Param('id') id: string) {
    const plan = await this.getDietPlanUseCase.execute(id, user.id);
    return { ...plan, totalMacros: plan.getTotalMacros() };
  }

  @Get(':id/export')
  @ApiOperation({ summary: 'Export diet plan to JSON' })
  async export(@CurrentUser() user: any, @Param('id') id: string) {
    return this.exportDietPlanUseCase.execute(id, user.id);
  }

  @Post('import')
  @ApiOperation({ summary: 'Import diet plan from JSON' })
  async import(@CurrentUser() user: any, @Body() dto: ImportDietPlanDto) {
    const plan = await this.importDietPlanUseCase.execute(user.id, dto);
    return { ...plan, totalMacros: plan.getTotalMacros() };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete diet plan' })
  async delete(@CurrentUser() user: any, @Param('id') id: string) {
    await this.getDietPlanUseCase.execute(id, user.id); // Validates ownership
    await this.dietPlanRepo.delete(id);
  }
}
