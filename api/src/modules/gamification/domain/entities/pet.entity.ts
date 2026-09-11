export type PetSpecies = 'draco' | 'kitsune' | 'panda';

export interface PetVitality {
  hydration: number; // 0-100%
  waterCups: number; // 0-12 copos
  nutrition: number; // 0-100%
  workout: number; // 0-100%
  wisdom: number; // 0-100%
}

export interface PetEquipped {
  head: string | null;
  held: string | null;
  background: string;
}

export class PetEntity {
  id: string;
  userId: string;
  name: string;
  species: PetSpecies;
  level: number;
  currentXp: number;
  nextLevelXp: number;
  coins: number;
  streakDays: number;
  lastActiveDate: string;
  vitality: PetVitality;
  equipped: PetEquipped;
  inventory: string[];
  completedQuests: string[];

  constructor(partial: Partial<PetEntity> & { userId: string }) {
    this.id = partial.id || `pet_${partial.userId}`;
    this.userId = partial.userId;
    this.name = partial.name || 'Draco';
    this.species = partial.species || 'draco';
    this.level = partial.level || 1;
    this.currentXp = partial.currentXp || 0;
    this.nextLevelXp = partial.nextLevelXp || this.calculateNextLevelXp(this.level);
    this.coins = partial.coins ?? 50;
    this.streakDays = partial.streakDays || 1;
    this.lastActiveDate = partial.lastActiveDate || new Date().toISOString().split('T')[0];
    this.vitality = partial.vitality || {
      hydration: 40,
      waterCups: 3,
      nutrition: 50,
      workout: 40,
      wisdom: 50,
    };
    this.equipped = partial.equipped || {
      head: null,
      held: null,
      background: 'gym',
    };
    this.inventory = partial.inventory || ['bg_gym'];
    this.completedQuests = partial.completedQuests || [];
  }

  calculateNextLevelXp(level: number): number {
    return Math.round(100 * Math.pow(1.15, level - 1));
  }

  addXp(amount: number): { leveledUp: boolean; newLevel: number; earnedCoins: number } {
    this.currentXp += amount;
    let leveledUp = false;
    let earnedCoins = 0;

    while (this.currentXp >= this.nextLevelXp) {
      this.currentXp -= this.nextLevelXp;
      this.level += 1;
      this.nextLevelXp = this.calculateNextLevelXp(this.level);
      leveledUp = true;
      const coinReward = 25 + this.level * 5;
      this.coins += coinReward;
      earnedCoins += coinReward;
    }

    return { leveledUp, newLevel: this.level, earnedCoins };
  }

  addWaterCup(): void {
    if (this.vitality.waterCups < 12) {
      this.vitality.waterCups += 1;
      this.vitality.hydration = Math.min(100, Math.round((this.vitality.waterCups / 8) * 100));
    }
  }

  setNutrition(score: number): void {
    this.vitality.nutrition = Math.max(0, Math.min(100, score));
  }

  setWorkout(score: number): void {
    this.vitality.workout = Math.max(0, Math.min(100, score));
  }

  setWisdom(score: number): void {
    this.vitality.wisdom = Math.max(0, Math.min(100, score));
  }
}
