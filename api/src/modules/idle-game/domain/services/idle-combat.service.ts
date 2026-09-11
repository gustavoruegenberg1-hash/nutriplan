import { Injectable, Logger } from '@nestjs/common';
import { HeroEntity } from '../entities/hero.entity';
import {
  COMBAT_BALANCE,
  getMonsterStatsForStage,
  getStageRewards,
} from '../constants/game-balance.constant';

export interface UltraprocessedMonster {
  id: string;
  name: string;
  title: string;
  icon: string;
  color: string;
  specialAbility: string;
  abilityDescription: string;
  attack?: number;
}

export const BESTIARY: UltraprocessedMonster[] = [
  {
    id: 'trans_fat',
    name: 'Gordura Trans',
    title: 'O Coagulador Arterial',
    icon: '🧈',
    color: '#D97706',
    specialAbility: 'Placa de Ateroma',
    abilityDescription: 'Cria uma barreira rígida que bloqueia e dissipa impactos físicos.',
  },
  {
    id: 'sugary_soda',
    name: 'Titã do Refrigerante',
    title: 'Senhor do Pico Glicêmico',
    icon: '🥤',
    color: '#DC2626',
    specialAbility: 'Pico de Insulina',
    abilityDescription: 'Dispara uma onda ácida de glicose líquida que desestabiliza a energia.',
  },
  {
    id: 'salt_golem',
    name: 'Golem de Sal & Sódio',
    title: 'O Opressor Pressórico',
    icon: '🧂',
    color: '#E2E8F0',
    specialAbility: 'Retenção Hídrica',
    abilityDescription: 'Incha o tecido celular e reduz drasticamente a mobilidade do oponente.',
  },
  {
    id: 'fried_specter',
    name: 'Espectro do Fast Food',
    title: 'A Assombração Frita',
    icon: '🍗',
    color: '#EA580C',
    specialAbility: 'Névoa de Óleo Reutilizado',
    abilityDescription: 'Cobre o campo com fumaça tóxica oxidada que reduz a precisão dos ataques.',
  },
  {
    id: 'corn_syrup_witch',
    name: 'Bruxa do Xarope de Milho',
    title: 'A Ilusão da Saciedade',
    icon: '🍭',
    color: '#DB2777',
    specialAbility: 'Fissura por Açúcar',
    abilityDescription: 'Seduz e exaure os receptores de dopamina, provocando letargia contínua.',
  },
  {
    id: 'ultraprocessed_lord',
    name: 'Lorde Ultraprocessado',
    title: 'Soberano dos Aditivos Sintéticos',
    icon: '🍔',
    color: '#7C3AED',
    specialAbility: 'Coquetel de Emulsificantes',
    abilityDescription: 'Combina corantes, conservantes e aromas artificiais em um golpe devastador.',
  },
];

export interface AfkReport {
  minutesOffline: number;
  monstersDefeated: number;
  earnedGold: number;
  earnedXp: number;
  chestsFound: {
    titan: number;
    nutritionist: number;
    sage: number;
    sprinter: number;
  };
  currentMonster: UltraprocessedMonster;
  monsterCurrentHp: number;
  monsterMaxHp: number;
}

export interface CombatTurnResult {
  damageDealt: number;
  isCrit: boolean;
  isMonsterDead: boolean;
  nextMonsterHp: number;
  nextMonsterMaxHp: number;
  monsterDamageDealt: number;
  heroDied: boolean;
  nextHeroHp: number;
  nextHeroMaxHp: number;
  goldEarned: number;
  xpEarned: number;
  stageCleared: boolean;
  newStage: number;
  monster: UltraprocessedMonster;
  message?: string;
}

@Injectable()
export class IdleCombatService {
  private readonly logger = new Logger(IdleCombatService.name);

  // Obtém o monstro correspondente à fase atual com atributos balanceados
  getMonsterForStage(stage: number): {
    monster: UltraprocessedMonster;
    maxHp: number;
    attack: number;
    isBoss: boolean;
  } {
    const safeStage = Math.max(1, Math.floor(stage));
    const { maxHp, attack, isBoss } = getMonsterStatsForStage(safeStage);

    const monsterIndex = isBoss
      ? BESTIARY.length - 1 // Lorde Ultraprocessado nos múltiplos de 5
      : (safeStage - 1) % (BESTIARY.length - 1);

    const baseMonster = BESTIARY[monsterIndex];
    const monster: UltraprocessedMonster = {
      ...baseMonster,
      attack,
    };

    return { monster, maxHp, attack, isBoss };
  }

  // Calcula o progresso AFK (offline) equilibrado e passivo, SEM avançar fases
  calculateAfkProgress(hero: HeroEntity): AfkReport {
    const now = Date.now();
    const elapsedMs = Math.max(0, now - (hero.lastAfkTimestamp || now));
    // Teto de 8 horas offline
    const elapsedMinutes = Math.min(COMBAT_BALANCE.maxAfkMinutes, Math.floor(elapsedMs / (60 * 1000)));

    const currentStage = Math.max(1, hero.dungeonProgress.currentStage);
    const stats = hero.getDerivedStats();
    const { monster, maxHp } = this.getMonsterForStage(currentStage);

    if (elapsedMinutes < 1) {
      return {
        minutesOffline: 0,
        monstersDefeated: 0,
        earnedGold: 0,
        earnedXp: 0,
        chestsFound: { titan: 0, nutritionist: 0, sage: 0, sprinter: 0 },
        currentMonster: monster,
        monsterCurrentHp: hero.dungeonProgress.currentMonsterHp || maxHp,
        monsterMaxHp: maxHp,
      };
    }

    // Tempo médio para abater 1 monstro na fase atual (mínimo realista de 8s por combate)
    const effectiveDps = Math.max(10, stats.dps);
    const secondsPerKill = Math.max(8, Math.min(30, maxHp / effectiveDps));
    // Ritmo offline tem eficiência de 50% em relação ao jogo ativo
    const monstersPerMinute = (60 / secondsPerKill) * COMBAT_BALANCE.afkEfficiency;
    const monstersDefeated = Math.round(elapsedMinutes * monstersPerMinute);

    // Recompensas controladas baseadas na fase atual
    const { gold: goldPerKill, xp: xpPerKill } = getStageRewards(currentStage);
    const earnedGold = Math.round(monstersDefeated * goldPerKill);
    const earnedXp = Math.round(monstersDefeated * xpPerKill);

    // Baús raros acumulados durante a ausência
    const chestsFound = {
      titan: Math.min(3, Math.floor(elapsedMinutes / 150)),
      nutritionist: Math.min(2, Math.floor(elapsedMinutes / 180)),
      sage: Math.min(2, Math.floor(elapsedMinutes / 240)),
      sprinter: Math.min(2, Math.floor(elapsedMinutes / 200)),
    };

    // Aplica recompensas ao herói SEM alterar a fase da masmorra
    hero.gold += earnedGold;
    hero.addXp(earnedXp);
    hero.chests.titan += chestsFound.titan;
    hero.chests.nutritionist += chestsFound.nutritionist;
    hero.chests.sage += chestsFound.sage;
    hero.chests.sprinter += chestsFound.sprinter;

    // A fase PERMANECE a mesma (o usuário deve avançar ativamente)
    hero.dungeonProgress.currentMonsterMaxHp = maxHp;
    hero.dungeonProgress.currentMonsterHp = maxHp;
    hero.dungeonProgress.currentHeroHp = stats.maxHp;
    hero.lastAfkTimestamp = now;

    return {
      minutesOffline: elapsedMinutes,
      monstersDefeated,
      earnedGold,
      earnedXp,
      chestsFound,
      currentMonster: monster,
      monsterCurrentHp: maxHp,
      monsterMaxHp: maxHp,
    };
  }

  // Executa um turno de combate simultâneo: herói ataca e monstro contra-ataca
  executeActiveAttack(
    hero: HeroEntity,
    currentMonsterHp: number,
    currentHeroHp?: number
  ): CombatTurnResult {
    const stats = hero.getDerivedStats();
    const heroMaxHp = stats.maxHp;
    const currentStage = Math.max(1, hero.dungeonProgress.currentStage);
    const currentMonsterData = this.getMonsterForStage(currentStage);

    // 1. Dano do Avatar contra o Monstro
    const isCrit = Math.random() * 100 <= stats.critRate;
    const damageMultiplier = isCrit ? COMBAT_BALANCE.critMultiplier : 1.0;
    const damageVariance = 0.9 + Math.random() * 0.2; // +/- 10%
    const damageDealt = Math.max(1, Math.round(stats.attack * damageMultiplier * damageVariance));

    // Nunca permite HP negativo
    const nextMonsterHp = Math.max(0, currentMonsterHp - damageDealt);

    // 2. Dano do Monstro contra o Avatar (Contra-ataque)
    // Redução de dano pela defesa: Defense / (Defense + 100)
    const defenseReduction = Math.min(0.75, stats.damageReductionPct / 100);
    const monsterVariance = 0.9 + Math.random() * 0.2;
    const rawMonsterDmg = currentMonsterData.attack * (1 - defenseReduction) * monsterVariance;
    const monsterDamageDealt = Math.max(1, Math.round(rawMonsterDmg));

    const currentHeroHealth = currentHeroHp ?? hero.dungeonProgress.currentHeroHp ?? heroMaxHp;
    let nextHeroHp = Math.max(0, currentHeroHealth - monsterDamageDealt);

    // 3. Verificação de Derrota do Avatar (HP do Herói zerou)
    if (nextHeroHp <= 0) {
      // Regra de morte: herói é derrotado, recupera vida máxima e regride para a fase anterior continuando a lutar
      const previousStage = Math.max(1, currentStage - 1);
      hero.dungeonProgress.currentStage = previousStage;
      hero.dungeonProgress.stageStatus = 'in_battle'; // Continua lutando sem parar!

      const prevMonsterData = this.getMonsterForStage(previousStage);
      hero.dungeonProgress.currentMonsterHp = prevMonsterData.maxHp;
      hero.dungeonProgress.currentMonsterMaxHp = prevMonsterData.maxHp;
      hero.dungeonProgress.currentHeroHp = heroMaxHp;

      return {
        damageDealt,
        isCrit,
        isMonsterDead: false,
        nextMonsterHp: prevMonsterData.maxHp,
        nextMonsterMaxHp: prevMonsterData.maxHp,
        monsterDamageDealt,
        heroDied: true,
        nextHeroHp: heroMaxHp,
        nextHeroMaxHp: heroMaxHp,
        goldEarned: 0,
        xpEarned: 0,
        stageCleared: false,
        newStage: previousStage,
        monster: prevMonsterData.monster,
        message: `O Herói foi derrotado pelo ${currentMonsterData.monster.name}! Recuou para a Fase ${previousStage} e continua lutando!`,
      };
    }

    // 4. Verificação de Vitória sobre o Monstro (HP do Monstro zerou)
    if (nextMonsterHp <= 0) {
      const { gold, xp } = getStageRewards(currentStage);
      hero.gold += gold;
      hero.addXp(xp);

      // Registra a maior fase alcançada
      hero.dungeonProgress.highestStage = Math.max(
        hero.dungeonProgress.highestStage,
        currentStage
      );
      hero.dungeonProgress.stageStatus = 'in_battle'; // Continua farmando e lutando!
      hero.dungeonProgress.currentHeroHp = nextHeroHp;

      // Reseta a vida do monstro atual para permitir treino/farm contínuo
      hero.dungeonProgress.currentMonsterHp = currentMonsterData.maxHp;
      hero.dungeonProgress.currentMonsterMaxHp = currentMonsterData.maxHp;

      return {
        damageDealt,
        isCrit,
        isMonsterDead: true,
        nextMonsterHp: currentMonsterData.maxHp, // Renasce imediatamente para farm contínuo
        nextMonsterMaxHp: currentMonsterData.maxHp,
        monsterDamageDealt,
        heroDied: false,
        nextHeroHp,
        nextHeroMaxHp: heroMaxHp,
        goldEarned: gold,
        xpEarned: xp,
        stageCleared: true,
        newStage: currentStage,
        monster: currentMonsterData.monster,
        message: `Monstro derrotado! (+${gold} Ouro 🪙, +${xp} XP ⭐)`,
      };
    }

    // 5. Combate em andamento (ambos continuam vivos)
    hero.dungeonProgress.currentMonsterHp = nextMonsterHp;
    hero.dungeonProgress.currentHeroHp = nextHeroHp;
    hero.dungeonProgress.stageStatus = 'in_battle';

    return {
      damageDealt,
      isCrit,
      isMonsterDead: false,
      nextMonsterHp,
      nextMonsterMaxHp: currentMonsterData.maxHp,
      monsterDamageDealt,
      heroDied: false,
      nextHeroHp,
      nextHeroMaxHp: heroMaxHp,
      goldEarned: 0,
      xpEarned: 0,
      stageCleared: false,
      newStage: currentStage,
      monster: currentMonsterData.monster,
    };
  }

  // Avanço manual para a próxima fase (acionado estritamente por clique do usuário)
  advanceStage(hero: HeroEntity): {
    newStage: number;
    monster: UltraprocessedMonster;
    monsterMaxHp: number;
    heroHp: number;
  } {
    hero.dungeonProgress.currentStage += 1;
    hero.dungeonProgress.highestStage = Math.max(
      hero.dungeonProgress.highestStage,
      hero.dungeonProgress.currentStage
    );

    const stats = hero.getDerivedStats();
    const nextMonsterData = this.getMonsterForStage(hero.dungeonProgress.currentStage);

    hero.dungeonProgress.currentMonsterHp = nextMonsterData.maxHp;
    hero.dungeonProgress.currentMonsterMaxHp = nextMonsterData.maxHp;
    hero.dungeonProgress.currentHeroHp = stats.maxHp;
    hero.dungeonProgress.stageStatus = 'in_battle';

    return {
      newStage: hero.dungeonProgress.currentStage,
      monster: nextMonsterData.monster,
      monsterMaxHp: nextMonsterData.maxHp,
      heroHp: stats.maxHp,
    };
  }
}
