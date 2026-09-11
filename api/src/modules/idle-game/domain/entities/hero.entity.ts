export type EquipmentSlot = 'weapon' | 'helmet' | 'chest' | 'legs' | 'boots' | 'amulet';

export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface EquipmentItem {
  id: string;
  name: string;
  slot: EquipmentSlot;
  rarity: ItemRarity;
  level: number;
  bonusStats: {
    attack?: number;
    defense?: number;
    hp?: number;
    critRate?: number;
    speed?: number;
  };
  icon: string;
  description: string;
  isEquipable?: boolean;
  type?: 'equipment';
}

export interface HeroCustomization {
  gender: 'male' | 'female' | 'neutral';
  skinTone: string; // Hex color (Fitzpatrick I to VI)
  hairStyle: 'short' | 'buzz' | 'wavy' | 'ponytail' | 'dreadlocks' | 'afro' | 'pompadour' | 'bald';
  hairColor: string; // Hex color
  beardStyle: 'none' | 'stubble' | 'full' | 'goatee' | 'mustache';
  beardColor: string; // Hex color
}

export interface HeroAttributes {
  strength: number; // STR -> Dano físico e crítico
  agility: number; // AGI -> Taxa de acerto, esquiva e chance crítica
  intelligence: number; // INT -> Dano especial e resistência
  speed: number; // SPD -> Cadência de ataques / DPS
}

export interface HabitCheckins {
  date: string; // YYYY-MM-DD
  workout: boolean;
  diet: boolean;
  quiz: boolean;
  cardio: boolean;
}

export interface DungeonProgress {
  currentStage: number; // 1, 2, 3...
  highestStage: number;
  currentMonsterHp: number;
  currentMonsterMaxHp: number;
  currentMonsterIndex: number;
  currentHeroHp?: number; // Vida atual do avatar
  stageStatus?: 'in_battle' | 'stage_cleared' | 'hero_defeated';
  autoAdvance?: boolean; // false por padrão (exige avanço manual do jogador)
}

export interface DerivedHeroStats {
  attack: number;
  defense: number;
  maxHp: number;
  critRate: number; // 0-75%
  dodgeRate: number; // 0-50%
  speed: number; // base 100
  dps: number;
  damageReductionPct: number;
}

export class HeroEntity {
  id: string;
  userId: string;
  name: string;
  level: number;
  currentXp: number;
  nextLevelXp: number;
  gold: number;
  upgradeEssences: number;
  attributes: HeroAttributes;
  customization: HeroCustomization;
  equipped: Record<EquipmentSlot, EquipmentItem | null>;
  inventory: EquipmentItem[];
  chests: {
    titan: number; // Baú de Força (Treino)
    nutritionist: number; // Baú de Agilidade/Suprimentos (Dieta)
    sage: number; // Baú de Inteligência/Amuletos (Quiz)
    sprinter: number; // Baú de Velocidade/Botas (Cardio)
  };
  completedHabitsToday: HabitCheckins;
  dungeonProgress: DungeonProgress;
  lastAfkTimestamp: number; // Epoch ms

  constructor(props?: Partial<HeroEntity>) {
    this.id = props?.id || `hero_${Date.now()}`;
    this.userId = props?.userId || '';
    this.name = props?.name || 'Herói do NutriPlan';
    this.level = props?.level || 1;
    this.currentXp = props?.currentXp || 0;
    this.nextLevelXp = props?.nextLevelXp || 100;
    this.gold = props?.gold ?? 50;
    this.upgradeEssences = props?.upgradeEssences ?? 10;

    this.attributes = props?.attributes || {
      strength: 10,
      agility: 10,
      intelligence: 10,
      speed: 10,
    };

    this.customization = props?.customization || {
      gender: 'male',
      skinTone: '#F3C5A5',
      hairStyle: 'short',
      hairColor: '#2B1B17',
      beardStyle: 'stubble',
      beardColor: '#2B1B17',
    };

    this.equipped = props?.equipped || {
      weapon: null,
      helmet: null,
      chest: null,
      legs: null,
      boots: null,
      amulet: null,
    };

    this.inventory = props?.inventory || [];

    this.chests = props?.chests || {
      titan: 1,
      nutritionist: 1,
      sage: 0,
      sprinter: 0,
    };

    const todayStr = new Date().toISOString().split('T')[0];
    this.completedHabitsToday = props?.completedHabitsToday || {
      date: todayStr,
      workout: false,
      diet: false,
      quiz: false,
      cardio: false,
    };

    this.dungeonProgress = {
      currentStage: props?.dungeonProgress?.currentStage || 1,
      highestStage: props?.dungeonProgress?.highestStage || 1,
      currentMonsterHp: props?.dungeonProgress?.currentMonsterHp ?? 85,
      currentMonsterMaxHp: props?.dungeonProgress?.currentMonsterMaxHp ?? 85,
      currentMonsterIndex: props?.dungeonProgress?.currentMonsterIndex || 0,
      currentHeroHp: props?.dungeonProgress?.currentHeroHp,
      stageStatus: props?.dungeonProgress?.stageStatus || 'in_battle',
      autoAdvance: props?.dungeonProgress?.autoAdvance ?? false,
    };

    this.lastAfkTimestamp = props?.lastAfkTimestamp || Date.now();
  }

  // Verifica e reseta os check-ins se virou o dia
  refreshDailyHabits(): void {
    const todayStr = new Date().toISOString().split('T')[0];
    if (this.completedHabitsToday.date !== todayStr) {
      this.completedHabitsToday = {
        date: todayStr,
        workout: false,
        diet: false,
        quiz: false,
        cardio: false,
      };
    }
  }

  // Calcula atributos derivados e DPS
  getDerivedStats(): DerivedHeroStats {
    let bonusAtk = 0;
    let bonusDef = 0;
    let bonusHp = 0;
    let bonusCrit = 0;
    let bonusSpd = 0;

    Object.values(this.equipped).forEach((item) => {
      if (item && item.bonusStats) {
        bonusAtk += item.bonusStats.attack || 0;
        bonusDef += item.bonusStats.defense || 0;
        bonusHp += item.bonusStats.hp || 0;
        bonusCrit += item.bonusStats.critRate || 0;
        bonusSpd += item.bonusStats.speed || 0;
      }
    });

    const attack = Math.round(15 + this.attributes.strength * 2.5 + bonusAtk);
    const defense = Math.round(5 + bonusDef);
    const maxHp = Math.round(120 + this.level * 25 + this.attributes.strength * 5 + bonusHp);
    const critRate = Math.min(75, Math.round(5 + this.attributes.agility * 0.4 + bonusCrit));
    const dodgeRate = Math.min(50, Math.round(this.attributes.agility * 0.3));
    const speed = Math.round(100 + this.attributes.speed * 1.5 + bonusSpd);

    // DPS = Dano * (Velocidade / 100) * (1 + CritChance * CritDmgMultiplier)
    const critMultiplier = 1 + (critRate / 100) * 0.6;
    const dps = Math.round(attack * (speed / 100) * critMultiplier);

    // Redução de dano percentual = Defesa / (Defesa + 100)
    const damageReductionPct = Math.round((defense / (defense + 100)) * 100);

    return {
      attack,
      defense,
      maxHp,
      critRate,
      dodgeRate,
      speed,
      dps,
      damageReductionPct,
    };
  }

  // Adiciona XP e processa Level Up
  addXp(xp: number): { leveledUp: boolean; newLevel: number; earnedGold: number } {
    this.currentXp += xp;
    let leveledUp = false;
    let earnedGold = 0;

    while (this.currentXp >= this.nextLevelXp) {
      this.currentXp -= this.nextLevelXp;
      this.level += 1;
      this.nextLevelXp = Math.round(100 * Math.pow(1.18, this.level - 1));
      const goldReward = 30 + this.level * 10;
      this.gold += goldReward;
      earnedGold += goldReward;
      leveledUp = true;
    }

    return { leveledUp, newLevel: this.level, earnedGold };
  }
}
