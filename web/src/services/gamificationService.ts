import { api } from '../api/client';
import { PetProfile, DailyQuest, ShopItem } from '../types/gamification';
import { waterReminderService } from './waterReminderService';

const DEFAULT_SHOP: ShopItem[] = [
  { id: 'item_headband', name: 'Faixa do Atleta', slot: 'head', price: 60, description: 'Foco e determinação nos treinos', icon: '🎗️' },
  { id: 'item_cap', name: 'Boné Esportivo', slot: 'head', price: 90, description: 'Estilo aerodinâmico para corridas', icon: '🧢' },
  { id: 'item_glasses', name: 'Óculos Foco Total', slot: 'head', price: 120, description: 'Proteção com estilo urbano', icon: '🕶️' },
  { id: 'item_crown', name: 'Coroa da Vitória', slot: 'head', price: 300, description: 'Para os mestres da disciplina', icon: '👑' },
  { id: 'item_shaker', name: 'Coqueteleira Neon', slot: 'held', price: 50, description: 'Praticidade com proteína e sabor', icon: '🥤' },
  { id: 'item_dumbbell', name: 'Mini Halter de Ouro', slot: 'held', price: 100, description: 'Símbolo supremo de hipertrofia', icon: '🏋️' },
  { id: 'item_apple', name: 'Maçã Dourada', slot: 'held', price: 75, description: 'Super densidade de micronutrientes', icon: '🍎' },
  { id: 'bg_gym', name: 'Academia Moderna', slot: 'background', price: 0, description: 'O ambiente clássico do ferro e suor', icon: '🏢' },
  { id: 'bg_park', name: 'Parque ao Ar Livre', slot: 'background', price: 100, description: 'Ar fresco, calistenia e luz solar', icon: '🌳' },
  { id: 'bg_zen', name: 'Templo das Montanhas', slot: 'background', price: 180, description: 'Serenidade, foco e recuperação ativa', icon: '⛩️' },
  { id: 'bg_cyber', name: 'Arena Futurista', slot: 'background', price: 250, description: 'Energia neon e alta performance', icon: '🚀' },
];

export const gamificationService = {
  getStorageKey(userId: string): string {
    return `nutriplan_pet_state_${userId || 'guest'}`;
  },

  getLocalPet(userId: string): PetProfile | null {
    try {
      const data = localStorage.getItem(this.getStorageKey(userId));
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  saveLocalPet(userId: string, pet: PetProfile): void {
    try {
      localStorage.setItem(this.getStorageKey(userId), JSON.stringify(pet));
    } catch {
      // ignore
    }
  },

  async fetchPet(userId: string): Promise<{ pet: PetProfile; quests: DailyQuest[] }> {
    try {
      const { data } = await api.get('/gamification/pet');
      if (data?.pet) {
        this.saveLocalPet(userId, data.pet);
        return data;
      }
    } catch {
      // Fallback local
    }

    const local = this.getLocalPet(userId);
    if (local) {
      return { pet: local, quests: [] };
    }

    const defaultPet: PetProfile = {
      id: `pet_${userId}`,
      userId,
      name: 'Draco',
      species: 'draco',
      level: 1,
      currentXp: 20,
      nextLevelXp: 100,
      coins: 80,
      streakDays: 1,
      lastActiveDate: new Date().toISOString().split('T')[0],
      vitality: {
        hydration: 50,
        waterCups: 4,
        nutrition: 60,
        workout: 50,
        wisdom: 40,
      },
      equipped: {
        head: null,
        held: null,
        background: 'gym',
      },
      inventory: ['bg_gym'],
      completedQuests: [],
    };
    this.saveLocalPet(userId, defaultPet);
    return { pet: defaultPet, quests: [] };
  },

  async recordAction(
    userId: string,
    action: 'DRINK_WATER' | 'REMOVE_WATER' | 'MEAL_SAVED' | 'WORKOUT_DONE' | 'PET_PET',
    value?: any
  ): Promise<{ pet: PetProfile; message: string; earnedXp: number; earnedCoins: number; leveledUp: boolean; quests?: DailyQuest[] }> {
    if (action === 'DRINK_WATER') {
      waterReminderService.recordWaterDrunk(userId);
    }

    try {
      const { data } = await api.post('/gamification/action', { action, value });
      if (data?.pet) {
        this.saveLocalPet(userId, data.pet);
        return data;
      }
    } catch {
      // Fallback local caso backend esteja offline
    }

    let pet = this.getLocalPet(userId) || (await this.fetchPet(userId)).pet;
    let earnedXp = 10;
    let earnedCoins = 0;
    let message = 'Ação registrada!';

    if (action === 'DRINK_WATER') {
      if (pet.vitality.waterCups < 12) {
        pet.vitality.waterCups += 1;
        pet.vitality.hydration = Math.min(100, Math.round((pet.vitality.waterCups / 8) * 100));
        earnedXp = 10;
        message = '💧 Mascote hidratado! (+10 XP)';
      }
    } else if (action === 'REMOVE_WATER') {
      if (pet.vitality.waterCups > 0) {
        pet.vitality.waterCups -= 1;
        pet.vitality.hydration = Math.round((pet.vitality.waterCups / 8) * 100);
        message = 'Copo d\'água removido.';
      }
    } else if (action === 'MEAL_SAVED') {
      pet.vitality.nutrition = Math.min(100, pet.vitality.nutrition + 25);
      earnedXp = 35;
      earnedCoins = 8;
      message = '🥗 Refeição nutritiva! (+35 XP e +8 Moedas)';
    } else if (action === 'WORKOUT_DONE') {
      pet.vitality.workout = Math.min(100, pet.vitality.workout + 35);
      earnedXp = 50;
      earnedCoins = 15;
      message = '💪 Treino finalizado! (+50 XP e +15 Moedas)';
    } else if (action === 'PET_PET') {
      earnedXp = 5;
      message = '❤️ Mascote adorou o carinho! (+5 XP)';
    }

    pet.currentXp += earnedXp;
    pet.coins += earnedCoins;
    let leveledUp = false;
    if (pet.currentXp >= pet.nextLevelXp) {
      pet.currentXp -= pet.nextLevelXp;
      pet.level += 1;
      pet.nextLevelXp = Math.round(100 * Math.pow(1.15, pet.level - 1));
      pet.coins += 25 + pet.level * 5;
      leveledUp = true;
      message = `🌟 LEVEL UP! Seu mascote atingiu o Nível ${pet.level}!`;
    }

    this.saveLocalPet(userId, pet);
    return { pet, message, earnedXp, earnedCoins, leveledUp };
  },

  async claimQuest(userId: string, questId: string): Promise<{ pet: PetProfile; success: boolean; message: string }> {
    try {
      const { data } = await api.post('/gamification/quest/claim', { questId });
      if (data?.pet) {
        this.saveLocalPet(userId, data.pet);
        return data;
      }
    } catch {
      // offline fallback
    }

    const pet = this.getLocalPet(userId) || (await this.fetchPet(userId)).pet;
    pet.completedQuests = pet.completedQuests || [];
    if (!pet.completedQuests.includes(questId)) {
      pet.completedQuests.push(questId);
      pet.coins += 15;
      pet.currentXp += 40;
      this.saveLocalPet(userId, pet);
      return { pet, success: true, message: 'Recompensa resgatada com sucesso!' };
    }
    return { pet, success: false, message: 'Missão já resgatada!' };
  },

  async buyItem(userId: string, itemId: string): Promise<{ pet: PetProfile; success: boolean; message: string }> {
    try {
      const { data } = await api.post('/gamification/shop/buy', { itemId });
      if (data?.pet) {
        this.saveLocalPet(userId, data.pet);
        return data;
      }
    } catch {
      // fallback
    }

    const pet = this.getLocalPet(userId) || (await this.fetchPet(userId)).pet;
    const item = DEFAULT_SHOP.find((i) => i.id === itemId);
    if (!item) return { pet, success: false, message: 'Item inválido.' };
    if (pet.coins < item.price) return { pet, success: false, message: 'Moedas insuficientes.' };

    pet.coins -= item.price;
    pet.inventory = pet.inventory || [];
    if (!pet.inventory.includes(itemId)) pet.inventory.push(itemId);
    if (item.slot === 'head') pet.equipped.head = itemId;
    if (item.slot === 'held') pet.equipped.held = itemId;
    if (item.slot === 'background') pet.equipped.background = itemId;

    this.saveLocalPet(userId, pet);
    return { pet, success: true, message: `Item ${item.name} adquirido!` };
  },

  async equipItem(userId: string, slot: 'head' | 'held' | 'background', itemId: string | null): Promise<PetProfile> {
    try {
      const { data } = await api.post('/gamification/equip', { slot, itemId });
      if (data?.pet) {
        this.saveLocalPet(userId, data.pet);
        return data.pet;
      }
    } catch {
      // fallback
    }

    const pet = this.getLocalPet(userId) || (await this.fetchPet(userId)).pet;
    if (slot === 'head') pet.equipped.head = itemId;
    if (slot === 'held') pet.equipped.held = itemId;
    if (slot === 'background') pet.equipped.background = itemId || 'bg_gym';

    this.saveLocalPet(userId, pet);
    return pet;
  },

  async updateSpecies(userId: string, species: 'draco' | 'kitsune' | 'panda', name?: string): Promise<PetProfile> {
    try {
      const { data } = await api.post('/gamification/species', { species, name });
      if (data?.pet) {
        this.saveLocalPet(userId, data.pet);
        return data.pet;
      }
    } catch {
      // fallback
    }

    const pet = this.getLocalPet(userId) || (await this.fetchPet(userId)).pet;
    pet.species = species;
    if (name?.trim()) pet.name = name.trim();
    this.saveLocalPet(userId, pet);
    return pet;
  },

  getShopCatalog(): ShopItem[] {
    return DEFAULT_SHOP;
  },
};
