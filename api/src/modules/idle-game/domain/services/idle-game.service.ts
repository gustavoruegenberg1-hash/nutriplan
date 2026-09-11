import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { HeroEntity, HeroCustomization, EquipmentItem, EquipmentSlot } from '../entities/hero.entity';
import { IdleCombatService, AfkReport } from './idle-combat.service';
import { LootService } from './loot.service';
import { LOOT_TABLES } from '../constants/game-balance.constant';

export interface DailyQuizQuestion {
  id: string;
  title: string;
  articleSlug: string;
  articleTitle: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const SCIENCE_QUIZZES: DailyQuizQuestion[] = [
  {
    id: 'quiz_protein',
    title: 'Aporte Proteico & Hipertrofia',
    articleSlug: 'art-01-proteina-hipertrofia',
    articleTitle: 'Aporte Proteico Ideal para Hipertrofia Muscular',
    question: 'Qual a faixa diária de ingestão proteica recomendada por consensos científicos para maximizar a síntese proteica (mTOR)?',
    options: [
      '0.5 a 0.8 g por kg de peso corporal',
      '1.6 a 2.2 g por kg de peso corporal',
      '4.5 a 6.0 g por kg de peso corporal',
      'Proteínas não têm influência direta na hipertrofia',
    ],
    correctIndex: 1,
    explanation: 'A literatura científica (Morton et al., 2018) estabelece 1.6 a 2.2 g/kg como faixa ótima para sinalização hipertrófica máxima em atletas e praticantes de musculação.',
  },
  {
    id: 'quiz_fiber',
    title: 'Fibras Alimentares & Microbiota',
    articleSlug: 'art-03-fibras-microbiota',
    articleTitle: 'Fibras e Saúde Intestinal',
    question: 'Segundo as Diretrizes do Institute of Medicine (DRIs), qual a recomendação saudável de ingestão de fibras para adultos?',
    options: [
      '5g no total por dia',
      '14g para cada 1.000 kcal consumidas (25g a 38g/dia)',
      '100g de fibras isoladas diariamente',
      'Fibras devem ser evitadas em dietas de hipertrofia',
    ],
    correctIndex: 1,
    explanation: 'As DRIs recomendam 14g de fibras a cada 1.000 kcal da dieta, garantindo motilidade, saciedade e fermentação benéfica pela microbiota colônica.',
  },
  {
    id: 'quiz_deficit',
    title: 'Déficit Calórico Sustentável',
    articleSlug: 'art-02-deficit-sustentavel',
    articleTitle: 'Fisiologia do Déficit Calórico Sustentável',
    question: 'Por que restrições calóricas extremas (> 1.000 kcal) não são recomendadas para perda de gordura sustentável?',
    options: [
      'Aceleram excessivamente a perda de gordura sem efeito colateral',
      'Desencadeiam perda de massa magra, redução da taxa metabólica e compulsão',
      'Impedem a digestão de água no estômago',
      'Causam ganho de peso imediato no mesmo dia',
    ],
    correctIndex: 1,
    explanation: 'Déficits severos reduzem a leptina, elevam grelina e provocam termogênese adaptativa e catabolismo muscular. O CDC preconiza déficits moderados de 20% (350-750 kcal).',
  },
  {
    id: 'quiz_ultraprocessed',
    title: 'Alimentos Ultraprocessados',
    articleSlug: 'art-04-ultraprocessados-inflamacao',
    articleTitle: 'O Impacto dos Alimentos Ultraprocessados',
    question: 'Qual a principal razão biológica pela qual as gorduras trans industriais prejudicam a saúde cardiovascular?',
    options: [
      'Elas elevam a lipoproteína de baixa densidade (LDL) e reduzem a de alta densidade (HDL)',
      'Elas transformam carboidratos em fibras no estômago',
      'Aumentam a sensibilidade à insulina nos tecidos',
      'Promovem hidratação acelerada das artérias',
    ],
    correctIndex: 0,
    explanation: 'Gorduras trans aumentam o colesterol LDL aterogênico e diminuem o HDL protetor, aumentando o risco de trombose, aterosclerose e disfunção endotelial.',
  },
];

@Injectable()
export class IdleGameService {
  private readonly logger = new Logger(IdleGameService.name);
  private readonly cacheDir = path.resolve(process.cwd(), 'local-cache');
  private readonly heroesFilePath = path.join(this.cacheDir, 'heroes.json');
  private heroesMap = new Map<string, HeroEntity>();

  constructor(
    private readonly combatService: IdleCombatService,
    private readonly lootService: LootService
  ) {
    this.ensureCacheDir();
    this.loadCache();
  }

  private ensureCacheDir() {
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  private loadCache() {
    try {
      if (fs.existsSync(this.heroesFilePath)) {
        const raw = fs.readFileSync(this.heroesFilePath, 'utf-8');
        const list = JSON.parse(raw);
        if (Array.isArray(list)) {
          list.forEach((item) => {
            const hero = new HeroEntity(item);
            this.heroesMap.set(hero.userId, hero);
          });
          this.logger.log(`Carregados ${this.heroesMap.size} heróis do cache local.`);
        }
      }
    } catch (e) {
      this.logger.warn(`Falha ao ler cache de heróis: ${e}`);
    }
  }

  private async saveCache() {
    try {
      const list = Array.from(this.heroesMap.values());
      await fs.promises.writeFile(this.heroesFilePath, JSON.stringify(list, null, 2), 'utf-8');
    } catch (e) {
      this.logger.warn(`Falha ao salvar cache de heróis: ${e}`);
    }
  }

  // Obtém herói com processamento AFK
  async getHero(userId: string): Promise<{ hero: HeroEntity; afkReport: AfkReport; derivedStats: any }> {
    let hero = this.heroesMap.get(userId);
    if (!hero) {
      hero = new HeroEntity({ userId });
      this.heroesMap.set(userId, hero);
    }

    hero.refreshDailyHabits();
    const afkReport = this.combatService.calculateAfkProgress(hero);
    const derivedStats = hero.getDerivedStats();
    await this.saveCache();

    return { hero, afkReport, derivedStats };
  }

  // Retorna tabelas de loot oficiais para a interface
  getLootTables() {
    return LOOT_TABLES;
  }

  // Abertura de Baús (Consome exatamente 1 unidade)
  async openChest(
    userId: string,
    chestType: 'titan' | 'nutritionist' | 'sage' | 'sprinter'
  ): Promise<{
    hero: HeroEntity;
    reward: {
      type: 'equipment' | 'gold' | 'xp' | 'essence';
      equipment?: EquipmentItem;
      amount?: number;
      isDuplicateConverted?: boolean;
    };
    success: boolean;
    message: string;
  }> {
    const { hero } = await this.getHero(userId);

    if (!hero.chests[chestType] || hero.chests[chestType] <= 0) {
      return {
        hero,
        reward: null as any,
        success: false,
        message: 'Você não possui nenhum baú desse tipo no inventário!',
      };
    }

    // Consome exatamente 1 baú (nunca menor que 0)
    hero.chests[chestType] = Math.max(0, hero.chests[chestType] - 1);

    const result = this.lootService.rollChestReward(
      chestType,
      hero.level,
      hero.inventory,
      hero.equipped
    );

    if (result.type === 'equipment' && result.equipment) {
      if (result.isDuplicateConverted) {
        hero.gold += result.amount || 70;
        hero.upgradeEssences += 12;
      } else {
        hero.inventory.push(result.equipment);
      }
    } else if (result.type === 'gold' && result.amount) {
      hero.gold += result.amount;
    } else if (result.type === 'xp' && result.amount) {
      hero.addXp(result.amount);
    } else if (result.type === 'essence' && result.amount) {
      hero.upgradeEssences += result.amount;
    }

    await this.saveCache();

    return {
      hero,
      reward: {
        type: result.type,
        equipment: result.equipment,
        amount: result.amount,
        isDuplicateConverted: result.isDuplicateConverted,
      },
      success: true,
      message: result.message,
    };
  }

  // Equipar Item
  async equipItem(userId: string, itemId: string): Promise<{ hero: HeroEntity; success: boolean; message: string }> {
    const { hero } = await this.getHero(userId);
    const itemIndex = hero.inventory.findIndex((i) => i.id === itemId);

    if (itemIndex === -1) {
      return { hero, success: false, message: 'Item não encontrado no inventário.' };
    }

    const itemToEquip = hero.inventory[itemIndex];
    const targetSlot = itemToEquip.slot;
    const currentEquipped = hero.equipped[targetSlot];

    // Remove do inventário
    hero.inventory.splice(itemIndex, 1);

    // Se já havia item equipado, retorna para o inventário
    if (currentEquipped) {
      hero.inventory.push(currentEquipped);
    }

    hero.equipped[targetSlot] = itemToEquip;
    await this.saveCache();

    return {
      hero,
      success: true,
      message: `${itemToEquip.name} equipado com sucesso no slot ${targetSlot}!`,
    };
  }

  // Desequipar Item
  async unequipItem(userId: string, slot: EquipmentSlot): Promise<{ hero: HeroEntity; success: boolean; message: string }> {
    const { hero } = await this.getHero(userId);
    const equipped = hero.equipped[slot];

    if (!equipped) {
      return { hero, success: false, message: 'Nenhum item equipado neste slot.' };
    }

    hero.equipped[slot] = null;
    hero.inventory.push(equipped);
    await this.saveCache();

    return {
      hero,
      success: true,
      message: `${equipped.name} desequipado e enviado para o inventário.`,
    };
  }

  // Reciclar/Desencantar item
  async recycleItem(
    userId: string,
    itemId: string
  ): Promise<{ hero: HeroEntity; success: boolean; message: string; goldEarned: number; essenceEarned: number }> {
    const { hero } = await this.getHero(userId);
    const itemIndex = hero.inventory.findIndex((i) => i.id === itemId);

    if (itemIndex === -1) {
      return { hero, success: false, message: 'Item não encontrado.', goldEarned: 0, essenceEarned: 0 };
    }

    const item = hero.inventory[itemIndex];
    const { goldReward, essenceReward } = this.lootService.recycleItem(item);

    hero.inventory.splice(itemIndex, 1);
    hero.gold += goldReward;
    hero.upgradeEssences += essenceReward;
    await this.saveCache();

    return {
      hero,
      success: true,
      message: `${item.name} reciclado com sucesso (+${goldReward} Ouro, +${essenceReward} Essências)!`,
      goldEarned: goldReward,
      essenceEarned: essenceReward,
    };
  }

  // Fusão de 3 equipamentos da mesma raridade em 1 de raridade superior
  async fuseEquipment(
    userId: string,
    itemIds: string[]
  ): Promise<{ hero: HeroEntity; success: boolean; message: string; fusedItem?: EquipmentItem }> {
    const { hero } = await this.getHero(userId);

    if (!itemIds || itemIds.length !== 3) {
      return { hero, success: false, message: 'A fusão exige exatamente 3 equipamentos selecionados.' };
    }

    // Procura os itens no inventário
    const itemsToFuse: EquipmentItem[] = [];
    const itemIndices: number[] = [];

    for (const id of itemIds) {
      const idx = hero.inventory.findIndex((it, index) => it.id === id && !itemIndices.includes(index));
      if (idx === -1) {
        return {
          hero,
          success: false,
          message: 'Um ou mais equipamentos selecionados não foram encontrados no inventário.',
        };
      }
      itemIndices.push(idx);
      itemsToFuse.push(hero.inventory[idx]);
    }

    const fusionResult = this.lootService.fuseItems(itemsToFuse, hero.level);
    if (!fusionResult.success || !fusionResult.resultItem) {
      return {
        hero,
        success: false,
        message: fusionResult.message,
      };
    }

    // Remove os 3 itens do inventário (em ordem decrescente de índice para não afetar os índices subsequentes)
    itemIndices.sort((a, b) => b - a).forEach((idx) => {
      hero.inventory.splice(idx, 1);
    });

    // Adiciona o novo item fundido
    hero.inventory.push(fusionResult.resultItem);
    await this.saveCache();

    return {
      hero,
      success: true,
      message: fusionResult.message,
      fusedItem: fusionResult.resultItem,
    };
  }

  // Customização visual do avatar
  async customizeAvatar(
    userId: string,
    customization: Partial<HeroCustomization>
  ): Promise<{ hero: HeroEntity; success: boolean; message: string }> {
    const { hero } = await this.getHero(userId);
    hero.customization = { ...hero.customization, ...customization };
    await this.saveCache();

    return {
      hero,
      success: true,
      message: 'Aparência do herói personalizada com sucesso!',
    };
  }

  // Check-in diário de hábitos saudáveis reais
  async taskCheckin(
    userId: string,
    taskType: 'workout' | 'diet' | 'quiz' | 'cardio'
  ): Promise<{
    hero: HeroEntity;
    success: boolean;
    alreadyCompleted: boolean;
    message: string;
    attributeGained?: string;
  }> {
    const { hero } = await this.getHero(userId);
    hero.refreshDailyHabits();

    if (hero.completedHabitsToday[taskType]) {
      return {
        hero,
        success: false,
        alreadyCompleted: true,
        message: 'Você já resgatou o atributo e o baú desse hábito hoje! Continue focado para a renovação amanhã.',
      };
    }

    hero.completedHabitsToday[taskType] = true;
    let attributeGained = '';

    if (taskType === 'workout') {
      hero.attributes.strength += 1;
      hero.chests.titan += 1;
      hero.addXp(45);
      attributeGained = '+1 Força (STR) e +1 Baú do Titã';
    } else if (taskType === 'diet') {
      hero.attributes.agility += 1;
      hero.chests.nutritionist += 1;
      hero.addXp(40);
      attributeGained = '+1 Agilidade (AGI) e +1 Baú do Nutricionista';
    } else if (taskType === 'quiz') {
      hero.attributes.intelligence += 1;
      hero.chests.sage += 1;
      hero.addXp(35);
      attributeGained = '+1 Inteligência (INT) e +1 Baú do Sábio';
    } else if (taskType === 'cardio') {
      hero.attributes.speed += 1;
      hero.chests.sprinter += 1;
      hero.addXp(40);
      attributeGained = '+1 Velocidade (SPD) e +1 Baú do Velocista';
    }

    await this.saveCache();

    return {
      hero,
      success: true,
      alreadyCompleted: false,
      message: `Incrível! Sua dedicação real concedeu: ${attributeGained}!`,
      attributeGained,
    };
  }

  // Quiz Diário Científico
  async getDailyQuiz(userId: string): Promise<{
    quiz: Omit<DailyQuizQuestion, 'correctIndex'>;
    alreadyAnswered: boolean;
  }> {
    const { hero } = await this.getHero(userId);
    hero.refreshDailyHabits();

    // Sorteia baseado no dia do ano
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24
    );
    const quiz = SCIENCE_QUIZZES[dayOfYear % SCIENCE_QUIZZES.length];

    const { correctIndex: _correctIndex, ...safeQuiz } = quiz;

    return {
      quiz: safeQuiz,
      alreadyAnswered: hero.completedHabitsToday.quiz,
    };
  }

  // Responder Quiz Diário
  async answerDailyQuiz(
    userId: string,
    quizId: string,
    selectedOption: number
  ): Promise<{
    correct: boolean;
    hero: HeroEntity;
    message: string;
    explanation: string;
    articleSlug: string;
  }> {
    const quiz = SCIENCE_QUIZZES.find((q) => q.id === quizId) || SCIENCE_QUIZZES[0];
    const isCorrect = selectedOption === quiz.correctIndex;

    if (!isCorrect) {
      const { hero } = await this.getHero(userId);
      return {
        correct: false,
        hero,
        message: 'Resposta incorreta! Mas você aprendeu algo novo com a ciência hoje.',
        explanation: quiz.explanation,
        articleSlug: quiz.articleSlug,
      };
    }

    const checkinRes = await this.taskCheckin(userId, 'quiz');
    return {
      correct: true,
      hero: checkinRes.hero,
      message: 'Resposta Correta! Você demonstrou sabedoria científica (+1 INT e 1 Baú do Sábio)!',
      explanation: quiz.explanation,
      articleSlug: quiz.articleSlug,
    };
  }

  // Executa golpe de combate com persistência garantida do turno
  async activeAttack(
    userId: string,
    currentMonsterHp: number,
    currentHeroHp?: number
  ) {
    const { hero } = await this.getHero(userId);
    const result = this.combatService.executeActiveAttack(hero, currentMonsterHp, currentHeroHp);
    await this.saveCache();
    return result;
  }

  // Avança manualmente para a próxima fase
  async advanceStage(userId: string) {
    const { hero } = await this.getHero(userId);
    const result = this.combatService.advanceStage(hero);
    await this.saveCache();
    return result;
  }
}
