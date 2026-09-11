import { describe, it, expect, beforeEach } from 'vitest';
import { HeroEntity } from '../entities/hero.entity';
import { IdleCombatService } from './idle-combat.service';
import { LootService } from './loot.service';

describe('IdleCombatService and HeroEntity', () => {
  let combatService: IdleCombatService;
  let lootService: LootService;

  beforeEach(() => {
    combatService = new IdleCombatService();
    lootService = new LootService();
  });

  it('should calculate derived stats and DPS properly', () => {
    const hero = new HeroEntity({
      attributes: {
        strength: 20, // 15 + 20*2.5 = 65 atk
        agility: 15,
        intelligence: 10,
        speed: 20, // 100 + 20*1.5 = 130 spd
      },
    });

    const stats = hero.getDerivedStats();
    expect(stats.attack).toBe(65);
    expect(stats.speed).toBe(130);
    expect(stats.dps).toBeGreaterThan(65);
    expect(stats.critRate).toBeGreaterThanOrEqual(5);
    expect(stats.damageReductionPct).toBeGreaterThan(0);
  });

  it('should scale monster stats as stages increase and return boss on stage 5', () => {
    const stage1 = combatService.getMonsterForStage(1);
    const stage5 = combatService.getMonsterForStage(5);

    expect(stage1.isBoss).toBe(false);
    expect(stage5.isBoss).toBe(true);
    expect(stage5.maxHp).toBeGreaterThan(stage1.maxHp);
    expect(stage5.monster.id).toBe('ultraprocessed_lord');
  });

  it('should calculate AFK progress accurately when user is offline', () => {
    const hero = new HeroEntity({
      lastAfkTimestamp: Date.now() - 60 * 60 * 1000, // 60 minutos atrás
    });

    const report = combatService.calculateAfkProgress(hero);
    expect(report.minutesOffline).toBeGreaterThanOrEqual(59);
    expect(report.monstersDefeated).toBeGreaterThan(0);
    expect(report.earnedGold).toBeGreaterThan(0);
    expect(report.earnedXp).toBeGreaterThan(0);
    expect(hero.gold).toBeGreaterThan(50);
  });

  it('should generate equipment from chests with scaled stats and real loot tables', () => {
    const reward = lootService.rollChestReward('titan', 5);
    expect(reward).toBeDefined();
    expect(reward.type).toBeDefined();
    expect(['equipment', 'gold', 'xp', 'essence']).toContain(reward.type);
    if (reward.type === 'equipment' && reward.equipment) {
      expect(reward.equipment.slot).toBeDefined();
      expect(reward.equipment.bonusStats.attack || reward.equipment.bonusStats.hp).toBeGreaterThan(0);
    } else {
      expect(reward.amount).toBeGreaterThan(0);
    }
  });

  it('should process active attack correctly, reducing monster HP and avatar HP without negative values', () => {
    const hero = new HeroEntity({
      attributes: { strength: 15, agility: 10, intelligence: 10, speed: 10 },
      dungeonProgress: {
        currentStage: 1,
        highestStage: 1,
        currentMonsterHp: 100,
        currentMonsterMaxHp: 100,
        currentMonsterIndex: 0,
        currentHeroHp: 200,
      },
    });

    const result = combatService.executeActiveAttack(hero, 100, 200);

    expect(result.damageDealt).toBeGreaterThan(0);
    expect(result.nextMonsterHp).toBeLessThan(100);
    expect(result.nextMonsterHp).toBeGreaterThanOrEqual(0);
    expect(result.monsterDamageDealt).toBeGreaterThan(0);
    expect(result.nextHeroHp).toBeLessThan(200);
    expect(result.nextHeroHp).toBeGreaterThanOrEqual(0);
    expect(result.heroDied).toBe(false);
  });

  it('should floor monster HP at 0 when damage exceeds current HP and not auto-advance stage', () => {
    const hero = new HeroEntity({
      dungeonProgress: {
        currentStage: 3,
        highestStage: 3,
        currentMonsterHp: 10,
        currentMonsterMaxHp: 100,
        currentMonsterIndex: 0,
      },
    });

    const result = combatService.executeActiveAttack(hero, 5, 250); // HP 5 com dano > 20
    expect(result.isMonsterDead).toBe(true);
    expect(result.nextMonsterHp).toBeGreaterThan(0); // Renasce com vida para farm contínuo
    expect(result.goldEarned).toBeGreaterThan(0);
    expect(result.xpEarned).toBeGreaterThan(0);
    // NÃO deve avançar o estágio automaticamente
    expect(hero.dungeonProgress.currentStage).toBe(3);
    expect(hero.dungeonProgress.stageStatus).toBe('in_battle');
  });

  it('should advance stage only when advanceStage is manually called', () => {
    const hero = new HeroEntity({
      dungeonProgress: {
        currentStage: 3,
        highestStage: 3,
        currentMonsterHp: 100,
        currentMonsterMaxHp: 100,
        currentMonsterIndex: 0,
      },
    });

    const result = combatService.advanceStage(hero);
    expect(result.newStage).toBe(4);
    expect(hero.dungeonProgress.currentStage).toBe(4);
    expect(hero.dungeonProgress.highestStage).toBe(4);
    expect(hero.dungeonProgress.stageStatus).toBe('in_battle');
  });

  it('should handle avatar death by retreating to stage - 1, reviving at full HP and continuing in_battle', () => {
    const hero = new HeroEntity({
      dungeonProgress: {
        currentStage: 5,
        highestStage: 5,
        currentMonsterHp: 100,
        currentMonsterMaxHp: 100,
        currentMonsterIndex: 0,
        currentHeroHp: 2, // Quase morto
      },
    });

    // Forçar dano que mate o avatar (currentHeroHp: 1)
    const result = combatService.executeActiveAttack(hero, 100, 1);
    expect(result.heroDied).toBe(true);
    expect(result.newStage).toBe(4); // Voltou da 5 para 4
    expect(hero.dungeonProgress.currentStage).toBe(4);
    expect(hero.dungeonProgress.stageStatus).toBe('in_battle'); // Continua lutando!
    expect(result.nextHeroHp).toBe(hero.getDerivedStats().maxHp); // Vida cheia recuperada
  });

  it('should continuously regress across stages on consecutive deaths until surviving and fighting', () => {
    const hero = new HeroEntity({
      dungeonProgress: {
        currentStage: 4,
        highestStage: 4,
        currentMonsterHp: 100,
        currentMonsterMaxHp: 100,
        currentMonsterIndex: 0,
      },
    });

    // Morre na fase 4 -> regride para 3
    const res1 = combatService.executeActiveAttack(hero, 100, 1);
    expect(res1.heroDied).toBe(true);
    expect(res1.newStage).toBe(3);
    expect(hero.dungeonProgress.currentStage).toBe(3);
    expect(hero.dungeonProgress.stageStatus).toBe('in_battle');

    // Morre novamente na fase 3 -> regride para 2
    const res2 = combatService.executeActiveAttack(hero, 100, 1);
    expect(res2.heroDied).toBe(true);
    expect(res2.newStage).toBe(2);
    expect(hero.dungeonProgress.currentStage).toBe(2);
    expect(hero.dungeonProgress.stageStatus).toBe('in_battle');

    // Na fase 2, herói luta com vida cheia (200 HP) e sobrevive
    const res3 = combatService.executeActiveAttack(hero, 100, 200);
    expect(res3.heroDied).toBe(false);
    expect(res3.newStage).toBe(2); // Permanece na fase 2 onde não morre!
    expect(hero.dungeonProgress.currentStage).toBe(2);
    expect(hero.dungeonProgress.stageStatus).toBe('in_battle');
  });

  it('should never retreat below stage 1 on death (stage 1 death stays on stage 1)', () => {
    const hero = new HeroEntity({
      dungeonProgress: {
        currentStage: 1,
        highestStage: 1,
        currentMonsterHp: 100,
        currentMonsterMaxHp: 100,
        currentMonsterIndex: 0,
        currentHeroHp: 1,
      },
    });

    const result = combatService.executeActiveAttack(hero, 100, 1);
    expect(result.heroDied).toBe(true);
    expect(result.newStage).toBe(1); // Permanece na fase 1, nunca 0
    expect(hero.dungeonProgress.currentStage).toBe(1);
  });

  it('should calculate balanced offline progress without advancing stages', () => {
    const hero = new HeroEntity({
      lastAfkTimestamp: Date.now() - 4 * 60 * 60 * 1000, // 4 horas atrás
      dungeonProgress: {
        currentStage: 2,
        highestStage: 2,
        currentMonsterHp: 80,
        currentMonsterMaxHp: 80,
        currentMonsterIndex: 0,
      },
    });

    const initialStage = hero.dungeonProgress.currentStage;
    const report = combatService.calculateAfkProgress(hero);

    expect(report.minutesOffline).toBeGreaterThanOrEqual(239);
    expect(hero.dungeonProgress.currentStage).toBe(initialStage); // Estágio NÃO avançou
    expect(report.monstersDefeated).toBeGreaterThan(0);
    // Não deve gerar milhões de ouro
    expect(report.earnedGold).toBeLessThan(10000);
    expect(report.earnedXp).toBeLessThan(20000);
  });
});
