import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';
import { CurrentUser } from '../../../../shared/decorators/current-user.decorator';
import { GamificationService, SHOP_CATALOG } from '../../domain/services/gamification.service';
import { PetSpecies } from '../../domain/entities/pet.entity';

@ApiTags('Gamification')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('gamification')
export class GamificationController {
  constructor(private readonly gamificationService: GamificationService) {}

  @Get('pet')
  @ApiOperation({ summary: 'Obtém o mascote do usuário' })
  async getPet(@CurrentUser() user: any) {
    const pet = await this.gamificationService.getPet(user.id);
    const quests = this.gamificationService.getDailyQuests(pet);
    return { pet, quests };
  }

  @Get('shop')
  @ApiOperation({ summary: 'Lista catálogo de itens da lojinha' })
  getShop() {
    return { items: SHOP_CATALOG };
  }

  @Get('quests')
  @ApiOperation({ summary: 'Lista missões diárias do mascote' })
  async getQuests(@CurrentUser() user: any) {
    const pet = await this.gamificationService.getPet(user.id);
    return { quests: this.gamificationService.getDailyQuests(pet) };
  }

  @Post('action')
  @ApiOperation({ summary: 'Registra ação saudável do usuário (água, treino, refeição, etc.)' })
  async recordAction(
    @CurrentUser() user: any,
    @Body() body: { action: 'DRINK_WATER' | 'REMOVE_WATER' | 'MEAL_SAVED' | 'WORKOUT_DONE' | 'PET_PET'; value?: any }
  ) {
    const result = await this.gamificationService.recordAction(user.id, body.action, body.value);
    const quests = this.gamificationService.getDailyQuests(result.pet);
    return { ...result, quests };
  }

  @Post('quest/claim')
  @ApiOperation({ summary: 'Resgata recompensa de missão diária' })
  async claimQuest(@CurrentUser() user: any, @Body() body: { questId: string }) {
    const result = await this.gamificationService.claimQuest(user.id, body.questId);
    const quests = this.gamificationService.getDailyQuests(result.pet);
    return { ...result, quests };
  }

  @Post('shop/buy')
  @ApiOperation({ summary: 'Compra item da lojinha com NutriCoins' })
  async buyItem(@CurrentUser() user: any, @Body() body: { itemId: string }) {
    return await this.gamificationService.buyItem(user.id, body.itemId);
  }

  @Post('equip')
  @ApiOperation({ summary: 'Equipa ou desequipa item do mascote' })
  async equipItem(
    @CurrentUser() user: any,
    @Body() body: { slot: 'head' | 'held' | 'background'; itemId: string | null }
  ) {
    return await this.gamificationService.equipItem(user.id, body.slot, body.itemId);
  }

  @Post('species')
  @ApiOperation({ summary: 'Altera a espécie e/ou nome do mascote' })
  async updateSpecies(
    @CurrentUser() user: any,
    @Body() body: { species: PetSpecies; name?: string }
  ) {
    return await this.gamificationService.updateSpecies(user.id, body.species, body.name);
  }
}
