export type PetSpecies = 'draco' | 'kitsune' | 'panda';

export interface PetVitality {
  hydration: number; // 0-100%
  waterCups: number; // 0-12
  nutrition: number; // 0-100%
  workout: number; // 0-100%
  wisdom: number; // 0-100%
}

export interface PetEquipped {
  head: string | null;
  held: string | null;
  background: string;
}

export interface PetProfile {
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
}

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  category: 'water' | 'diet' | 'workout' | 'wisdom';
  target: number;
  current: number;
  completed: boolean;
  rewardXp: number;
  rewardCoins: number;
}

export interface ShopItem {
  id: string;
  name: string;
  slot: 'head' | 'held' | 'background';
  price: number;
  description: string;
  icon: string;
}
