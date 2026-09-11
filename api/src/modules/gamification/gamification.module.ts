import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { GamificationController } from './presentation/controllers/gamification.controller';
import { GamificationService } from './domain/services/gamification.service';

@Module({
  imports: [PassportModule],
  controllers: [GamificationController],
  providers: [GamificationService],
  exports: [GamificationService],
})
export class GamificationModule {}
