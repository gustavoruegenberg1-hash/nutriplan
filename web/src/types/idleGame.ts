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
  skinTone: string; // Hex
  hairStyle: 'short' | 'buzz' | 'wavy' | 'ponytail' | 'dreadlocks' | 'afro' | 'pompadour' | 'bald';
  hairColor: string; // Hex
  beardStyle: 'none' | 'stubble' | 'full' | 'goatee' | 'mustache';
  beardColor: string; // Hex
}

export interface HeroAttributes {
  strength: number; // STR
  agility: number; // AGI
  intelligence: number; // INT
  speed: number; // SPD
}

export interface HabitCheckins {
  date: string;
  workout: boolean;
  diet: boolean;
  quiz: boolean;
  cardio: boolean;
}

export interface DungeonProgress {
  currentStage: number;
  highestStage: number;
  currentMonsterHp: number;
  currentMonsterMaxHp: number;
  currentMonsterIndex: number;
  currentHeroHp?: number;
  stageStatus?: 'in_battle' | 'stage_cleared' | 'hero_defeated';
  autoAdvance?: boolean;
}

export interface DerivedHeroStats {
  attack: number;
  defense: number;
  maxHp: number;
  critRate: number;
  dodgeRate: number;
  speed: number;
  dps: number;
  damageReductionPct: number;
}

export interface HeroProfile {
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
    titan: number;
    nutritionist: number;
    sage: number;
    sprinter: number;
  };
  completedHabitsToday: HabitCheckins;
  dungeonProgress: DungeonProgress;
  lastAfkTimestamp: number;
}

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

export interface DailyQuizQuestion {
  id: string;
  title: string;
  articleSlug: string;
  articleTitle: string;
  question: string;
  options: string[];
  explanation: string;
}

export interface LootTableEntry {
  type: 'equipment' | 'gold' | 'xp' | 'essence';
  label: string;
  chancePct: number;
  weight: number;
  itemSlot?: EquipmentSlot;
  minAmount?: number;
  maxAmount?: number;
  icon: string;
}

export interface ChestLootTable {
  chestType: 'titan' | 'nutritionist' | 'sage' | 'sprinter';
  title: string;
  description: string;
  themeColor: string;
  icon: string;
  entries: LootTableEntry[];
}

export interface ChestReward {
  type: 'equipment' | 'gold' | 'xp' | 'essence';
  equipment?: EquipmentItem;
  amount?: number;
  isDuplicateConverted?: boolean;
  message?: string;
}
