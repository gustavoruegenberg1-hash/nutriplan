import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { IdleGameController } from './presentation/controllers/idle-game.controller';
import { IdleGameService } from './domain/services/idle-game.service';
import { IdleCombatService } from './domain/services/idle-combat.service';
import { LootService } from './domain/services/loot.service';

@Module({
  imports: [PassportModule],
  controllers: [IdleGameController],
  providers: [IdleGameService, IdleCombatService, LootService],
  exports: [IdleGameService, IdleCombatService, LootService],
})
export class IdleGameModule {}
