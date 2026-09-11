import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';
import { CurrentUser } from '../../../../shared/decorators/current-user.decorator';
import { IdleGameService } from '../../domain/services/idle-game.service';
import { IdleCombatService } from '../../domain/services/idle-combat.service';
import { EquipmentSlot, HeroCustomization } from '../../domain/entities/hero.entity';

@ApiTags('Idle Game (NutriHero)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('idle-game')
export class IdleGameController {
  constructor(
    private readonly idleGameService: IdleGameService,
    private readonly combatService: IdleCombatService
  ) {}

  @Get('hero')
  @ApiOperation({ summary: 'Obtém dados do herói, cálculos de AFK/offline e status derivados' })
  getHero(@CurrentUser() user: any) {
    return this.idleGameService.getHero(user.id);
  }

  @Get('loot-tables')
  @ApiOperation({ summary: 'Retorna a tabela oficial de loot com porcentagens reais dos baús' })
  getLootTables() {
    return this.idleGameService.getLootTables();
  }

  @Post('chest/open')
  @ApiOperation({ summary: 'Abre um baú e gera um equipamento procedural no inventário' })
  openChest(
    @CurrentUser() user: any,
    @Body() body: { chestType: 'titan' | 'nutritionist' | 'sage' | 'sprinter' }
  ) {
    return this.idleGameService.openChest(user.id, body.chestType);
  }

  @Post('equip')
  @ApiOperation({ summary: 'Equipa um item do inventário em um dos 6 slots' })
  equipItem(@CurrentUser() user: any, @Body() body: { itemId: string }) {
    return this.idleGameService.equipItem(user.id, body.itemId);
  }

  @Post('unequip')
  @ApiOperation({ summary: 'Desequipa um item de um slot para o inventário' })
  unequipItem(@CurrentUser() user: any, @Body() body: { slot: EquipmentSlot }) {
    return this.idleGameService.unequipItem(user.id, body.slot);
  }

  @Post('recycle')
  @ApiOperation({ summary: 'Recicla/Desencanta item em essências e ouro' })
  recycleItem(@CurrentUser() user: any, @Body() body: { itemId: string }) {
    return this.idleGameService.recycleItem(user.id, body.itemId);
  }

  @Post('fuse')
  @ApiOperation({ summary: 'Funde 3 equipamentos da mesma raridade em 1 de raridade superior' })
  fuseEquipment(@CurrentUser() user: any, @Body() body: { itemIds: string[] }) {
    return this.idleGameService.fuseEquipment(user.id, body.itemIds);
  }

  @Post('customize')
  @ApiOperation({ summary: 'Atualiza a aparência física do herói (pele, cabelo, barba e cores)' })
  customizeAvatar(@CurrentUser() user: any, @Body() body: Partial<HeroCustomization>) {
    return this.idleGameService.customizeAvatar(user.id, body);
  }

  @Post('task-checkin')
  @ApiOperation({ summary: 'Registra a conclusão de uma tarefa real (treino, dieta, cardio, etc.) e concede atributos' })
  taskCheckin(
    @CurrentUser() user: any,
    @Body() body: { taskType: 'workout' | 'diet' | 'quiz' | 'cardio' }
  ) {
    return this.idleGameService.taskCheckin(user.id, body.taskType);
  }

  @Post('attack')
  @ApiOperation({ summary: 'Executa um golpe de combate ativo contra o monstro ultraprocessado atual' })
  activeAttack(
    @CurrentUser() user: any,
    @Body() body: { currentMonsterHp: number; currentHeroHp?: number }
  ) {
    return this.idleGameService.activeAttack(user.id, body.currentMonsterHp, body.currentHeroHp);
  }

  @Post('advance-stage')
  @ApiOperation({ summary: 'Avança manualmente para a próxima fase da masmorra' })
  advanceStage(@CurrentUser() user: any) {
    return this.idleGameService.advanceStage(user.id);
  }

  @Get('quiz/daily')
  @ApiOperation({ summary: 'Obtém a pergunta do quiz diário de ciência da nutrição' })
  getDailyQuiz(@CurrentUser() user: any) {
    return this.idleGameService.getDailyQuiz(user.id);
  }

  @Post('quiz/answer')
  @ApiOperation({ summary: 'Responde à pergunta do quiz diário e concede +1 INT e Baú do Sábio se correta' })
  answerDailyQuiz(
    @CurrentUser() user: any,
    @Body() body: { quizId: string; selectedOption: number }
  ) {
    return this.idleGameService.answerDailyQuiz(user.id, body.quizId, body.selectedOption);
  }
}
