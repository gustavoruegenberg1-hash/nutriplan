// Tipos principais do NutriLife Sim (Ankama 2D Isométrico - Fase 1)

export type Direction2D = 'FL' | 'FR' | 'BL' | 'BR'; // Front-Left, Front-Right, Back-Left, Back-Right

export interface PaperDollLayers {
  skinTone: string; // ex: '#f6d3b0', '#dfa877', '#8d5524'
  eyes: string;     // 'default' | 'focused' | 'fierce'
  hairStyle: string;// 'spiky' | 'braids' | 'arcane' | 'buzz'
  hairColor: string;// '#2b2d42', '#d90429', '#f77f00', '#06d6a0'
  bottom: string;   // 'jeans' | 'sweatpants' | 'combat_shorts' | 'arcane_skirt'
  shoes: string;    // 'sneakers' | 'combat_boots' | 'slippers'
  top: string;      // 'tshirt' | 'hoodie' | 'tank_top' | 'arcane_robe'
  accessories: string; // 'glasses' | 'headband' | 'none'
  heldItem: string; // 'water_bottle' | 'dumbbell' | 'spellbook' | 'none'
}

export interface CharacterAttributes {
  vigor: number;      // Derivado da meta de proteína batida (aumenta teto de estamina)
  lucidity: number;   // Derivado da hidratação / água (multiplica XP)
  discipline: number; // Derivado dos treinos (tokens para promoções e itens raros)
  energy: number;     // Estamina atual (consumida em trabalhos e estudos)
  maxEnergy: number;
}

export interface SleepSchedule {
  bedtime: string;       // ex: "23:00"
  wakeupTime: string;    // ex: "07:00"
  isSleeping: boolean;   // Personagem deitado na cama
  lastQualityPct: number;// Qualidade de sono (0-100%)
  morningBuffActive: boolean; // Buff matinal de revigoramento (+20%)
}

export interface ProductivityMetrics {
  totalScore: number;     // 0 a 100% (40% Dieta + 35% Treino + 25% Sono)
  dietScore: number;      // 0 a 100%
  workoutScore: number;   // 0 a 100%
  sleepScore: number;     // 0 a 100%
  daysStreakAbove80: number; // Dias consecutivos com produtividade > 80%
  targetDaysForPromo: number;// Meta para promoção (ex: 5 dias)
}

export interface GameCharacter {
  id: string;
  name: string;
  title: string;
  level: number;
  currentXp: number;
  nextLevelXp: number;
  kamas: number;             // Moedas de ouro do jogo
  disciplineTokens: number;  // Moeda conquistada por treinos reais
  streakDays: number;
  isRestDay: boolean;
  statusEffect: 'healthy' | 'exhausted' | 'energized';
  paperDoll: PaperDollLayers;
  attributes: CharacterAttributes;
  sleep: SleepSchedule;
  productivity: ProductivityMetrics;
}

export interface FurnitureItem {
  id: string;
  name: string;
  category: 'bed' | 'desk' | 'gym' | 'decor' | 'alchemy';
  tileX: number;
  tileY: number;
  tileWidth: number;
  tileHeight: number;
  icon: string;
  color: string;
  buffDescription: string;
}

export type CareerId = 'tech_alchemy' | 'combat_gladiator' | 'chef_alchemist';

export interface CareerTrack {
  id: CareerId;
  name: string;
  tagline: string;
  icon: string;
  rankTitle: string;
  level: number;
  requiredAttribute: keyof CharacterAttributes;
  baseSalary: number;
  salaryPerShift: number;
  shiftDurationMinutes: number;
  isWorking: boolean;
  shiftEndsAt?: string;
  canBePromoted: boolean;
}

export interface GameNotification {
  id: string;
  type: 'water' | 'sleep' | 'wake' | 'promo' | 'export';
  title: string;
  message: string;
  rewardKamas: number;
  rewardStamina: number;
  rewardXp: number;
  actionText: string;
}

export interface InGameMeal {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  time: string;
}

export interface InGameWorkoutItem {
  id: string;
  name: string;
  muscle: string;
  sets: number;
  reps: number;
}

export interface ShopItem {
  id: string;
  category: 'hair_style' | 'hair_color' | 'top' | 'furniture';
  name: string;
  price: number;
  previewValue: string; // id do estilo ou hex da cor ou ícone
  description: string;
  purchased: boolean;
}
