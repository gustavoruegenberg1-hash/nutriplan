import { Injectable, Logger } from '@nestjs/common';
import { PetEntity, PetSpecies } from '../entities/pet.entity';
import * as fs from 'fs';
import * as path from 'path';

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

export const SHOP_CATALOG: ShopItem[] = [
  // Cabeça
  { id: 'item_headband', name: 'Faixa do Atleta', slot: 'head', price: 60, description: 'Foco e determinação nos treinos', icon: '🎗️' },
  { id: 'item_cap', name: 'Boné Esportivo', slot: 'head', price: 90, description: 'Estilo aerodinâmico para corridas', icon: '🧢' },
  { id: 'item_glasses', name: 'Óculos Foco Total', slot: 'head', price: 120, description: 'Proteção com estilo urbano', icon: '🕶️' },
  { id: 'item_crown', name: 'Coroa da Vitória', slot: 'head', price: 300, description: 'Para os mestres da disciplina', icon: '👑' },

  // Mão / Acessório
  { id: 'item_shaker', name: 'Coqueteleira Neon', slot: 'held', price: 50, description: 'Praticidade com proteína e sabor', icon: '🥤' },
  { id: 'item_dumbbell', name: 'Mini Halter de Ouro', slot: 'held', price: 100, description: 'Símbolo supremo de hipertrofia', icon: '🏋️' },
  { id: 'item_apple', name: 'Maçã Dourada', slot: 'held', price: 75, description: 'Super densidade de micronutrientes', icon: '🍎' },

  // Cenários
  { id: 'bg_gym', name: 'Academia Moderna', slot: 'background', price: 0, description: 'O ambiente clássico do ferro e suor', icon: '🏢' },
  { id: 'bg_park', name: 'Parque ao Ar Livre', slot: 'background', price: 100, description: 'Ar fresco, calistenia e luz solar', icon: '🌳' },
  { id: 'bg_zen', name: 'Templo das Montanhas', slot: 'background', price: 180, description: 'Serenidade, foco e recuperação ativa', icon: '⛩️' },
  { id: 'bg_cyber', name: 'Arena Futurista', slot: 'background', price: 250, description: 'Energia neon e alta performance', icon: '🚀' },
];

@Injectable()
export class GamificationService {
  private readonly logger = new Logger(GamificationService.name);
  private readonly cacheFilePath: string;
  private petsCache: Map<string, PetEntity> = new Map();

  constructor() {
    this.cacheFilePath = path.join(process.cwd(), 'local-cache', 'pets.json');
    this.loadCache();
  }

  private loadCache(): void {
    try {
      if (fs.existsSync(this.cacheFilePath)) {
        const raw = fs.readFileSync(this.cacheFilePath, 'utf8');
        const list: any[] = JSON.parse(raw);
        list.forEach((p) => this.petsCache.set(p.userId, new PetEntity(p)));
        this.logger.log(`Carregados ${this.petsCache.size} mascotes do cache local`);
      }
    } catch (err) {
      this.logger.warn(`Erro ao carregar pets.json: ${err}`);
    }
  }

  private async saveCache(): Promise<void> {
    try {
      const dir = path.dirname(this.cacheFilePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      const array = Array.from(this.petsCache.values());
      await fs.promises.writeFile(this.cacheFilePath, JSON.stringify(array, null, 2), 'utf8');
    } catch (err) {
      this.logger.warn(`Erro ao salvar pets.json: ${err}`);
    }
  }

  async getPet(userId: string): Promise<PetEntity> {
    let pet = this.petsCache.get(userId);
    const today = new Date().toISOString().split('T')[0];

    if (!pet) {
      pet = new PetEntity({
        userId,
        name: 'Draco',
        species: 'draco',
        level: 1,
        currentXp: 0,
        coins: 80, // Bônus inicial
        streakDays: 1,
        lastActiveDate: today,
        vitality: {
          hydration: 50,
          waterCups: 4,
          nutrition: 60,
          workout: 50,
          wisdom: 50,
        },
      });
      this.petsCache.set(userId, pet);
      await this.saveCache();
      return pet;
    }

    // Verificar virada de dia para atualizar streak e reset de água diária
    if (pet.lastActiveDate !== today) {
      const lastDate = new Date(pet.lastActiveDate);
      const currDate = new Date(today);
      const diffDays = Math.round((currDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));

      if (diffDays === 1) {
        pet.streakDays += 1;
        pet.addXp(15 * Math.min(5, pet.streakDays)); // Bônus diário
      } else if (diffDays > 1) {
        pet.streakDays = 1;
      }

      pet.lastActiveDate = today;
      pet.vitality.waterCups = 0;
      pet.vitality.hydration = 0;
      pet.completedQuests = [];
      await this.saveCache();
    }

    return pet;
  }

  getDailyQuests(pet: PetEntity): DailyQuest[] {
    const isWaterComplete = pet.vitality.waterCups >= 6;
    const isDietComplete = pet.vitality.nutrition >= 70;
    const isWorkoutComplete = pet.vitality.workout >= 70;

    return [
      {
        id: 'quest_water',
        title: 'Hidratação Essencial',
        description: 'Beba pelo menos 6 copos de água hoje (1500ml)',
        category: 'water',
        target: 6,
        current: Math.min(6, pet.vitality.waterCups),
        completed: isWaterComplete,
        rewardXp: 35,
        rewardCoins: 10,
      },
      {
        id: 'quest_diet',
        title: 'Nutrição Inteligente',
        description: 'Planeje ou mantenha sua alimentação dentro das metas',
        category: 'diet',
        target: 1,
        current: isDietComplete ? 1 : 0,
        completed: isDietComplete,
        rewardXp: 40,
        rewardCoins: 15,
      },
      {
        id: 'quest_workout',
        title: 'Corpo em Movimento',
        description: 'Execute ou registre seu treino do dia',
        category: 'workout',
        target: 1,
        current: isWorkoutComplete ? 1 : 0,
        completed: isWorkoutComplete,
        rewardXp: 50,
        rewardCoins: 20,
      },
    ];
  }

  async recordAction(
    userId: string,
    action: 'DRINK_WATER' | 'REMOVE_WATER' | 'MEAL_SAVED' | 'WORKOUT_DONE' | 'ARTICLE_READ' | 'PET_PET',
    _value?: any
  ): Promise<{ pet: PetEntity; message: string; earnedXp: number; earnedCoins: number; leveledUp: boolean }> {
    const pet = await this.getPet(userId);
    let earnedXp = 0;
    let earnedCoins = 0;
    let message = 'Ação registrada!';

    switch (action) {
      case 'DRINK_WATER': {
        pet.addWaterCup();
        earnedXp = 10;
        message = '💧 Glub glub! O mascote se hidratou (+10 XP)';
        if (pet.vitality.waterCups === 8) {
          earnedXp += 30;
          earnedCoins += 15;
          message = '🎉 Meta de 2L atingida! Bônus de Hidratação (+40 XP e +15 Moedas)';
        }
        break;
      }

      case 'REMOVE_WATER': {
        if (pet.vitality.waterCups > 0) {
          pet.vitality.waterCups -= 1;
          pet.vitality.hydration = Math.round((pet.vitality.waterCups / 8) * 100);
          message = 'Copo d\'água removido.';
        }
        break;
      }

      case 'MEAL_SAVED': {
        pet.setNutrition(Math.min(100, pet.vitality.nutrition + 25));
        earnedXp = 35;
        earnedCoins = 8;
        message = '🥗 Refeição nutritiva! Mascote alimentado (+35 XP e +8 Moedas)';
        break;
      }

      case 'WORKOUT_DONE': {
        pet.setWorkout(Math.min(100, pet.vitality.workout + 35));
        earnedXp = 50;
        earnedCoins = 15;
        message = '💪 Treino finalizado! O mascote ficou mais forte (+50 XP e +15 Moedas)';
        break;
      }

      case 'ARTICLE_READ': {
        pet.setWisdom(Math.min(100, pet.vitality.wisdom + 20));
        earnedXp = 25;
        earnedCoins = 5;
        message = '🧠 Conhecimento absorvido! Sabedoria aumentada (+25 XP e +5 Moedas)';
        break;
      }

      case 'PET_PET': {
        earnedXp = 5;
        message = '❤️ Mascote adorou o carinho! (+5 XP)';
        break;
      }
    }

    pet.coins += earnedCoins;
    const { leveledUp, newLevel } = pet.addXp(earnedXp);
    if (leveledUp) {
      message = `🌟 LEVEL UP! O seu mascote evoluiu para o Nível ${newLevel}!`;
    }

    await this.saveCache();
    return { pet, message, earnedXp, earnedCoins, leveledUp };
  }

  async claimQuest(
    userId: string,
    questId: string
  ): Promise<{ pet: PetEntity; success: boolean; message: string }> {
    const pet = await this.getPet(userId);
    if (pet.completedQuests.includes(questId)) {
      return { pet, success: false, message: 'Missão já resgatada hoje!' };
    }

    const quests = this.getDailyQuests(pet);
    const quest = quests.find((q) => q.id === questId);

    if (!quest || !quest.completed) {
      return { pet, success: false, message: 'Objetivo da missão ainda não foi cumprido.' };
    }

    pet.completedQuests.push(questId);
    pet.coins += quest.rewardCoins;
    pet.addXp(quest.rewardXp);

    await this.saveCache();
    return {
      pet,
      success: true,
      message: `Recompensa coletada! +${quest.rewardXp} XP e +${quest.rewardCoins} Moedas`,
    };
  }

  async buyItem(
    userId: string,
    itemId: string
  ): Promise<{ pet: PetEntity; success: boolean; message: string }> {
    const pet = await this.getPet(userId);
    if (pet.inventory.includes(itemId)) {
      return { pet, success: false, message: 'Você já possui este item!' };
    }

    const catalogItem = SHOP_CATALOG.find((i) => i.id === itemId);
    if (!catalogItem) {
      return { pet, success: false, message: 'Item não encontrado no catálogo.' };
    }

    if (pet.coins < catalogItem.price) {
      return { pet, success: false, message: `Moedas insuficientes. Preço: ${catalogItem.price} (Você tem ${pet.coins})` };
    }

    pet.coins -= catalogItem.price;
    pet.inventory.push(itemId);

    // Auto equipar ao comprar
    if (catalogItem.slot === 'head') pet.equipped.head = itemId;
    if (catalogItem.slot === 'held') pet.equipped.held = itemId;
    if (catalogItem.slot === 'background') pet.equipped.background = itemId;

    await this.saveCache();
    return {
      pet,
      success: true,
      message: `Item "${catalogItem.name}" adquirido e equipado com sucesso!`,
    };
  }

  async equipItem(
    userId: string,
    slot: 'head' | 'held' | 'background',
    itemId: string | null
  ): Promise<{ pet: PetEntity; message: string }> {
    const pet = await this.getPet(userId);

    if (itemId !== null && !pet.inventory.includes(itemId)) {
      return { pet, message: 'Você ainda não possui este item.' };
    }

    if (slot === 'head') pet.equipped.head = itemId;
    if (slot === 'held') pet.equipped.held = itemId;
    if (slot === 'background') pet.equipped.background = itemId || 'bg_gym';

    await this.saveCache();
    return { pet, message: 'Aparência atualizada!' };
  }

  async updateSpecies(
    userId: string,
    species: PetSpecies,
    name?: string
  ): Promise<{ pet: PetEntity; message: string }> {
    const pet = await this.getPet(userId);
    pet.species = species;
    if (name?.trim()) pet.name = name.trim();
    await this.saveCache();
    return { pet, message: `Mascote atualizado para ${pet.name} (${species})!` };
  }
}
