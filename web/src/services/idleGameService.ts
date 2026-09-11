import { api } from '../api/client';
import {
  HeroProfile,
  AfkReport,
  EquipmentItem,
  EquipmentSlot,
  HeroCustomization,
  DailyQuizQuestion,
  DerivedHeroStats,
  UltraprocessedMonster,
  ChestReward,
  ChestLootTable,
  CombatTurnResult,
} from '../types/idleGame';

export function getMonsterStatsForStage(stage: number) {
  const safeStage = Math.max(1, Math.floor(stage));
  const isBoss = safeStage % 5 === 0;

  const scaleHp = Math.pow(1.075, safeStage - 1);
  const scaleDmg = Math.pow(1.055, safeStage - 1);

  const bossHpMulti = isBoss ? 2.2 : 1.0;
  const bossDmgMulti = isBoss ? 1.6 : 1.0;

  const maxHp = Math.max(40, Math.round(85 * scaleHp * bossHpMulti));
  const attack = Math.max(4, Math.round(7 * scaleDmg * bossDmgMulti));

  return { maxHp, attack, isBoss };
}

export function getStageRewards(stage: number) {
  const safeStage = Math.max(1, Math.floor(stage));
  const isBoss = safeStage % 5 === 0;
  const bossMultiplier = isBoss ? 2.0 : 1.0;

  const gold = Math.round((4 + safeStage * 1.5) * bossMultiplier);
  const xp = Math.round((8 + safeStage * 2.0) * bossMultiplier);

  return { gold, xp };
}

const DEFAULT_MONSTERS: UltraprocessedMonster[] = [
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

export const idleGameService = {
  getStorageKey(userId: string): string {
    return `nutrihero_state_${userId || 'guest'}`;
  },

  getLocalHero(userId: string): HeroProfile | null {
    try {
      const data = localStorage.getItem(this.getStorageKey(userId));
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  saveLocalHero(userId: string, hero: HeroProfile): void {
    try {
      localStorage.setItem(this.getStorageKey(userId), JSON.stringify(hero));
    } catch {
      // ignore
    }
  },

  async fetchHero(userId: string): Promise<{
    hero: HeroProfile;
    afkReport: AfkReport;
    derivedStats: DerivedHeroStats;
  }> {
    try {
      const { data } = await api.get('/idle-game/hero');
      if (data?.hero) {
        this.saveLocalHero(userId, data.hero);
        return data;
      }
    } catch {
      // Fallback
    }

    const local = this.getLocalHero(userId);
    const todayStr = new Date().toISOString().split('T')[0];

    let hero: HeroProfile = local || {
      id: `hero_${userId}`,
      userId,
      name: 'Guerreiro da Disciplina',
      level: 1,
      currentXp: 15,
      nextLevelXp: 100,
      gold: 120,
      upgradeEssences: 20,
      attributes: { strength: 12, agility: 10, intelligence: 10, speed: 10 },
      customization: {
        gender: 'male',
        skinTone: '#F3C5A5',
        hairStyle: 'short',
        hairColor: '#2B1B17',
        beardStyle: 'stubble',
        beardColor: '#2B1B17',
      },
      equipped: {
        weapon: {
          id: 'item_init_sword',
          name: 'Halter de Ferro Inicial',
          slot: 'weapon',
          rarity: 'common',
          level: 1,
          bonusStats: { attack: 15 },
          icon: '🗡️',
          description: 'Arma inicial forjada a partir de ferro fundido.',
        },
        helmet: null,
        chest: null,
        legs: null,
        boots: null,
        amulet: null,
      },
      inventory: [
        {
          id: 'item_init_chest',
          name: 'Colete de Fibras Simples',
          slot: 'chest',
          rarity: 'common',
          level: 1,
          bonusStats: { defense: 8, hp: 40 },
          icon: '🦺',
          description: 'Tecido leve que amortece impactos e promove saciedade.',
        },
      ],
      chests: { titan: 1, nutritionist: 1, sage: 0, sprinter: 0 },
      completedHabitsToday: {
        date: todayStr,
        workout: false,
        diet: false,
        quiz: false,
        cardio: false,
      },
      dungeonProgress: {
        currentStage: 1,
        highestStage: 1,
        currentMonsterHp: 85,
        currentMonsterMaxHp: 85,
        currentMonsterIndex: 0,
        currentHeroHp: 200,
        stageStatus: 'in_battle',
      },
      lastAfkTimestamp: Date.now() - 30 * 60 * 1000,
    };

    if (hero.completedHabitsToday.date !== todayStr) {
      hero.completedHabitsToday = {
        date: todayStr,
        workout: false,
        diet: false,
        quiz: false,
        cardio: false,
      };
    }

    const stats = this.calculateLocalDerivedStats(hero);
    if (!hero.dungeonProgress.currentHeroHp) {
      hero.dungeonProgress.currentHeroHp = stats.maxHp;
    }

    // Garante que monstros não fiquem com HP distorcido por bugs antigos
    const stageStats = getMonsterStatsForStage(hero.dungeonProgress.currentStage);
    hero.dungeonProgress.currentMonsterMaxHp = stageStats.maxHp;
    if (!hero.dungeonProgress.currentMonsterHp || hero.dungeonProgress.currentMonsterHp > stageStats.maxHp) {
      hero.dungeonProgress.currentMonsterHp = stageStats.maxHp;
    }

    const currentMonsterIndex = (hero.dungeonProgress.currentStage - 1) % DEFAULT_MONSTERS.length;
    const currentMonsterObj = {
      ...DEFAULT_MONSTERS[currentMonsterIndex],
      attack: stageStats.attack,
    };

    const afkReport: AfkReport = {
      minutesOffline: 30,
      monstersDefeated: 15,
      earnedGold: 90,
      earnedXp: 150,
      chestsFound: { titan: 0, nutritionist: 0, sage: 0, sprinter: 0 },
      currentMonster: currentMonsterObj,
      monsterCurrentHp: hero.dungeonProgress.currentMonsterHp,
      monsterMaxHp: hero.dungeonProgress.currentMonsterMaxHp,
    };

    this.saveLocalHero(userId, hero);
    return { hero, afkReport, derivedStats: stats };
  },

  calculateLocalDerivedStats(hero: HeroProfile): DerivedHeroStats {
    let bonusAtk = 0;
    let bonusDef = 0;
    let bonusHp = 0;
    let bonusCrit = 0;
    let bonusSpd = 0;

    Object.values(hero.equipped).forEach((item) => {
      if (item && item.bonusStats) {
        bonusAtk += item.bonusStats.attack || 0;
        bonusDef += item.bonusStats.defense || 0;
        bonusHp += item.bonusStats.hp || 0;
        bonusCrit += item.bonusStats.critRate || 0;
        bonusSpd += item.bonusStats.speed || 0;
      }
    });

    const attack = Math.round(15 + hero.attributes.strength * 2.5 + bonusAtk);
    const defense = Math.round(5 + bonusDef);
    const maxHp = Math.round(120 + hero.level * 25 + hero.attributes.strength * 5 + bonusHp);
    const critRate = Math.min(75, Math.round(5 + hero.attributes.agility * 0.4 + bonusCrit));
    const dodgeRate = Math.min(50, Math.round(hero.attributes.agility * 0.3));
    const speed = Math.round(100 + hero.attributes.speed * 1.5 + bonusSpd);

    const critMultiplier = 1 + (critRate / 100) * 0.6;
    const dps = Math.round(attack * (speed / 100) * critMultiplier);
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
  },

  async fetchLootTables(): Promise<Record<'titan' | 'nutritionist' | 'sage' | 'sprinter', ChestLootTable>> {
    try {
      const { data } = await api.get('/idle-game/loot-tables');
      if (data) return data;
    } catch {
      // offline fallback
    }

    return {
      titan: {
        chestType: 'titan',
        title: 'Baú do Titã',
        description: 'Conquistado na conclusão de treinos de força. Focado em armas, elmos e poder muscular.',
        themeColor: '#EF4444',
        icon: '🧰',
        entries: [
          { type: 'equipment', label: 'Arma de Força (Espadas / Machados)', chancePct: 35, weight: 35, itemSlot: 'weapon', icon: '🗡️' },
          { type: 'equipment', label: 'Elmo de Foco e Proteção', chancePct: 20, weight: 20, itemSlot: 'helmet', icon: '🪖' },
          { type: 'gold', label: 'Moedas de Ouro (80 a 160 🪙)', chancePct: 25, weight: 25, minAmount: 80, maxAmount: 160, icon: '🪙' },
          { type: 'xp', label: 'Experiência de Herói (50 a 100 ⭐)', chancePct: 12, weight: 12, minAmount: 50, maxAmount: 100, icon: '⭐' },
          { type: 'essence', label: 'Essências de Aprimoramento (10 a 25 🧪)', chancePct: 8, weight: 8, minAmount: 10, maxAmount: 25, icon: '🧪' },
        ],
      },
      nutritionist: {
        chestType: 'nutritionist',
        title: 'Baú do Nutricionista',
        description: 'Conquistado ao registrar a primeira refeição do dia. Focado em peitorais, pernas e resistência.',
        themeColor: '#10B981',
        icon: '🥗',
        entries: [
          { type: 'equipment', label: 'Peitoral de Armadura Nutricional', chancePct: 35, weight: 35, itemSlot: 'chest', icon: '🦺' },
          { type: 'equipment', label: 'Calça de Firmeza e Densidade', chancePct: 20, weight: 20, itemSlot: 'legs', icon: '👖' },
          { type: 'gold', label: 'Moedas de Ouro (80 a 160 🪙)', chancePct: 25, weight: 25, minAmount: 80, maxAmount: 160, icon: '🪙' },
          { type: 'xp', label: 'Experiência de Herói (50 a 100 ⭐)', chancePct: 12, weight: 12, minAmount: 50, maxAmount: 100, icon: '⭐' },
          { type: 'essence', label: 'Essências de Aprimoramento (10 a 25 🧪)', chancePct: 8, weight: 8, minAmount: 10, maxAmount: 25, icon: '🧪' },
        ],
      },
      sage: {
        chestType: 'sage',
        title: 'Baú do Sábio',
        description: 'Conquistado ao responder o quiz ou estudar artigos científicos. Focado em amuletos e sabedoria.',
        themeColor: '#8B5CF6',
        icon: '🔮',
        entries: [
          { type: 'equipment', label: 'Amuleto da Evidência Científica', chancePct: 35, weight: 35, itemSlot: 'amulet', icon: '🔮' },
          { type: 'equipment', label: 'Diadema da Síntese Proteica', chancePct: 20, weight: 20, itemSlot: 'helmet', icon: '👑' },
          { type: 'gold', label: 'Moedas de Ouro (80 a 160 🪙)', chancePct: 25, weight: 25, minAmount: 80, maxAmount: 160, icon: '🪙' },
          { type: 'xp', label: 'Experiência de Herói (50 a 100 ⭐)', chancePct: 12, weight: 12, minAmount: 50, maxAmount: 100, icon: '⭐' },
          { type: 'essence', label: 'Essências de Aprimoramento (10 a 25 🧪)', chancePct: 8, weight: 8, minAmount: 10, maxAmount: 25, icon: '🧪' },
        ],
      },
      sprinter: {
        chestType: 'sprinter',
        title: 'Baú do Velocista',
        description: 'Conquistado na realização de cardio e passos. Focado em botas, calças e cadência veloz.',
        themeColor: '#0EA5E9',
        icon: '⚡',
        entries: [
          { type: 'equipment', label: 'Botas de Corrida Mitocondrial', chancePct: 35, weight: 35, itemSlot: 'boots', icon: '👟' },
          { type: 'equipment', label: 'Calça de Compressão Graduada', chancePct: 20, weight: 20, itemSlot: 'legs', icon: '👖' },
          { type: 'gold', label: 'Moedas de Ouro (80 a 160 🪙)', chancePct: 25, weight: 25, minAmount: 80, maxAmount: 160, icon: '🪙' },
          { type: 'xp', label: 'Experiência de Herói (50 a 100 ⭐)', chancePct: 12, weight: 12, minAmount: 50, maxAmount: 100, icon: '⭐' },
          { type: 'essence', label: 'Essências de Aprimoramento (10 a 25 🧪)', chancePct: 8, weight: 8, minAmount: 10, maxAmount: 25, icon: '🧪' },
        ],
      },
    };
  },

  async openChest(
    userId: string,
    chestType: 'titan' | 'nutritionist' | 'sage' | 'sprinter'
  ): Promise<{ hero: HeroProfile; reward: ChestReward; success: boolean; message: string }> {
    try {
      const { data } = await api.post('/idle-game/chest/open', { chestType });
      if (data?.hero) {
        this.saveLocalHero(userId, data.hero);
        return data;
      }
    } catch {
      // offline fallback
    }

    const { hero } = await this.fetchHero(userId);
    if (hero.chests[chestType] <= 0) {
      return {
        hero,
        reward: null as any,
        success: false,
        message: 'Você não possui nenhum baú desse tipo no inventário!',
      };
    }

    // Consome exatamente 1 unidade
    hero.chests[chestType] -= 1;

    // Sorteio offline com Loot Table
    const tables = await this.fetchLootTables();
    const table = tables[chestType];
    const totalWeight = table.entries.reduce((acc, e) => acc + e.weight, 0);
    const roll = Math.random() * totalWeight;

    let cumulative = 0;
    let selected = table.entries[0];
    for (const entry of table.entries) {
      cumulative += entry.weight;
      if (roll <= cumulative) {
        selected = entry;
        break;
      }
    }

    let reward: ChestReward;

    if (selected.type === 'gold') {
      const amount = Math.round(90 + Math.random() * 60);
      hero.gold += amount;
      reward = {
        type: 'gold',
        amount,
        message: `Baú aberto! Você obteve +${amount} Moedas de Ouro 🪙!`,
      };
    } else if (selected.type === 'xp') {
      const amount = Math.round(60 + Math.random() * 40);
      hero.currentXp += amount;
      reward = {
        type: 'xp',
        amount,
        message: `Baú aberto! Você obteve +${amount} XP de Herói ⭐!`,
      };
    } else if (selected.type === 'essence') {
      const amount = Math.round(12 + Math.random() * 10);
      hero.upgradeEssences += amount;
      reward = {
        type: 'essence',
        amount,
        message: `Baú aberto! Você obteve +${amount} Essências de Aprimoramento 🧪!`,
      };
    } else {
      const slot = selected.itemSlot || 'weapon';
      const item: EquipmentItem = {
        id: `item_${slot}_${Date.now()}`,
        name:
          slot === 'weapon'
            ? 'Espada de Treino de Halter'
            : slot === 'helmet'
            ? 'Faixa de Concentração do Guerreiro'
            : slot === 'chest'
            ? 'Colete de Fibras Protetoras'
            : slot === 'legs'
            ? 'Calça de Treino Funcional'
            : slot === 'boots'
            ? 'Tênis de Corrida Amortecido'
            : 'Pingente do Equilíbrio Biológico',
        slot,
        rarity: 'common',
        level: hero.level,
        bonusStats:
          slot === 'weapon'
            ? { attack: 14 + hero.level * 2, critRate: 3 }
            : slot === 'chest'
            ? { defense: 12, hp: 50 }
            : slot === 'boots'
            ? { speed: 15, hp: 20 }
            : { defense: 8, hp: 35 },
        icon: slot === 'weapon' ? '🗡️' : slot === 'chest' ? '🦺' : slot === 'boots' ? '👟' : '🪖',
        description: 'Equipamento básico balanceado forjado para o desenvolvimento contínuo.',
        isEquipable: true,
        type: 'equipment',
      };

      hero.inventory.push(item);
      reward = {
        type: 'equipment',
        equipment: item,
        isDuplicateConverted: false,
        message: `Você abriu o Baú e obteve: [${item.rarity.toUpperCase()}] ${item.name}!`,
      };
    }

    this.saveLocalHero(userId, hero);
    return {
      hero,
      reward,
      success: true,
      message: reward.message || 'Baú aberto com sucesso!',
    };
  },

  async equipItem(userId: string, itemId: string): Promise<{ hero: HeroProfile; success: boolean; message: string }> {
    try {
      const { data } = await api.post('/idle-game/equip', { itemId });
      if (data?.hero) {
        this.saveLocalHero(userId, data.hero);
        return data;
      }
    } catch {
      // offline
    }

    const { hero } = await this.fetchHero(userId);
    const itemIndex = hero.inventory.findIndex((i) => i.id === itemId);
    if (itemIndex === -1) return { hero, success: false, message: 'Item não encontrado.' };

    const item = hero.inventory[itemIndex];
    hero.inventory.splice(itemIndex, 1);
    const prev = hero.equipped[item.slot];
    if (prev) hero.inventory.push(prev);
    hero.equipped[item.slot] = item;

    this.saveLocalHero(userId, hero);
    return { hero, success: true, message: `${item.name} equipado!` };
  },

  async unequipItem(userId: string, slot: EquipmentSlot): Promise<{ hero: HeroProfile; success: boolean; message: string }> {
    try {
      const { data } = await api.post('/idle-game/unequip', { slot });
      if (data?.hero) {
        this.saveLocalHero(userId, data.hero);
        return data;
      }
    } catch {
      // offline
    }

    const { hero } = await this.fetchHero(userId);
    const equipped = hero.equipped[slot];
    if (!equipped) return { hero, success: false, message: 'Nada equipado aqui.' };

    hero.equipped[slot] = null;
    hero.inventory.push(equipped);
    this.saveLocalHero(userId, hero);
    return { hero, success: true, message: `${equipped.name} desequipado!` };
  },

  async recycleItem(
    userId: string,
    itemId: string
  ): Promise<{ hero: HeroProfile; success: boolean; message: string; goldEarned: number; essenceEarned: number }> {
    try {
      const { data } = await api.post('/idle-game/recycle', { itemId });
      if (data?.hero) {
        this.saveLocalHero(userId, data.hero);
        return data;
      }
    } catch {
      // offline
    }

    const { hero } = await this.fetchHero(userId);
    const idx = hero.inventory.findIndex((i) => i.id === itemId);
    if (idx === -1) return { hero, success: false, message: 'Item não encontrado.', goldEarned: 0, essenceEarned: 0 };

    const item = hero.inventory[idx];
    hero.inventory.splice(idx, 1);
    const goldEarned = 50 + item.level * 5;
    const essenceEarned = 8;
    hero.gold += goldEarned;
    hero.upgradeEssences += essenceEarned;

    this.saveLocalHero(userId, hero);
    return {
      hero,
      success: true,
      message: `${item.name} reciclado (+${goldEarned} Ouro, +${essenceEarned} Essências)!`,
      goldEarned,
      essenceEarned,
    };
  },

  async fuseEquipment(
    userId: string,
    itemIds: string[]
  ): Promise<{ hero: HeroProfile; success: boolean; message: string; fusedItem?: EquipmentItem }> {
    try {
      const { data } = await api.post('/idle-game/fuse', { itemIds });
      if (data?.hero) {
        this.saveLocalHero(userId, data.hero);
        return data;
      }
    } catch {
      // offline fallback
    }

    const { hero } = await this.fetchHero(userId);
    if (!itemIds || itemIds.length !== 3) {
      return { hero, success: false, message: 'A fusão exige exatamente 3 equipamentos selecionados.' };
    }

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

    const firstRarity = itemsToFuse[0].rarity;
    const sameRarity = itemsToFuse.every((i) => i.rarity === firstRarity);
    if (!sameRarity) {
      return {
        hero,
        success: false,
        message: 'Todos os 3 equipamentos devem ser rigorosamente da mesma raridade!',
      };
    }

    const nextRarityMap: Record<string, string | null> = {
      common: 'uncommon',
      uncommon: 'rare',
      rare: 'epic',
      epic: 'legendary',
      legendary: null,
    };

    const nextRarity = nextRarityMap[firstRarity] as any;
    if (!nextRarity) {
      return {
        hero,
        success: false,
        message: 'Equipamentos Lendários já atingiram a raridade máxima e não podem ser fundidos!',
      };
    }

    const slots: EquipmentSlot[] = ['weapon', 'helmet', 'chest', 'legs', 'boots', 'amulet'];
    const randomSlot = slots[Math.floor(Math.random() * slots.length)];

    const templateNames: Record<EquipmentSlot, { name: string; icon: string; desc: string }> = {
      weapon: { name: 'Espada de Treino de Halter', icon: '🗡️', desc: 'Arma forjada para o combate.' },
      helmet: { name: 'Faixa de Concentração do Guerreiro', icon: '🪖', desc: 'Proteção para a mente em batalha.' },
      chest: { name: 'Colete de Fibras Protetoras', icon: '🦺', desc: 'Armadura leve que amortece impactos.' },
      legs: { name: 'Calça de Treino Funcional', icon: '👖', desc: 'Suporte muscular flexível.' },
      boots: { name: 'Tênis de Corrida Amortecido', icon: '👟', desc: 'Solado veloz com absorção de impacto.' },
      amulet: { name: 'Pingente do Equilíbrio Biológico', icon: '🔮', desc: 'Harmoniza as energias biológicas.' },
    };

    const tmpl = templateNames[randomSlot];
    const mult = ({ common: 1.0, uncommon: 1.35, rare: 1.8, epic: 2.5, legendary: 3.5 } as any)[nextRarity] || 1.0;

    const fusedItem: EquipmentItem = {
      id: `fused_${randomSlot}_${Date.now()}`,
      name: `${tmpl.name} (${nextRarity.toUpperCase()})`,
      slot: randomSlot,
      rarity: nextRarity,
      level: hero.level,
      bonusStats: {
        attack: Math.round(15 * mult + hero.level * 2),
        defense: Math.round(10 * mult + hero.level * 1.5),
        hp: Math.round(40 * mult + hero.level * 5),
      },
      icon: tmpl.icon,
      description: `Item forjado por fusão de 3 itens ${firstRarity.toUpperCase()}. ${tmpl.desc}`,
      isEquipable: true,
      type: 'equipment',
    };

    // Remove os 3 itens do inventário
    itemIndices.sort((a, b) => b - a).forEach((idx) => {
      hero.inventory.splice(idx, 1);
    });

    hero.inventory.push(fusedItem);
    this.saveLocalHero(userId, hero);

    return {
      hero,
      success: true,
      message: `✨ Fusão realizada! Você obteve [${nextRarity.toUpperCase()}] ${fusedItem.name}!`,
      fusedItem,
    };
  },

  async customizeAvatar(
    userId: string,
    customization: Partial<HeroCustomization>
  ): Promise<{ hero: HeroProfile; success: boolean; message: string }> {
    try {
      const { data } = await api.post('/idle-game/customize', customization);
      if (data?.hero) {
        this.saveLocalHero(userId, data.hero);
        return data;
      }
    } catch {
      // offline
    }

    const { hero } = await this.fetchHero(userId);
    hero.customization = { ...hero.customization, ...customization };
    this.saveLocalHero(userId, hero);
    return { hero, success: true, message: 'Avatar personalizado com sucesso!' };
  },

  async taskCheckin(
    userId: string,
    taskType: 'workout' | 'diet' | 'quiz' | 'cardio'
  ): Promise<{ hero: HeroProfile; success: boolean; alreadyCompleted: boolean; message: string; attributeGained?: string }> {
    try {
      const { data } = await api.post('/idle-game/task-checkin', { taskType });
      if (data?.hero) {
        this.saveLocalHero(userId, data.hero);
        return data;
      }
    } catch {
      // offline
    }

    const { hero } = await this.fetchHero(userId);
    if (hero.completedHabitsToday[taskType]) {
      return {
        hero,
        success: false,
        alreadyCompleted: true,
        message: 'Você já resgatou o atributo e o baú desta tarefa hoje!',
      };
    }

    hero.completedHabitsToday[taskType] = true;
    let attr = '';
    if (taskType === 'workout') {
      hero.attributes.strength += 1;
      hero.chests.titan += 1;
      attr = '+1 Força e +1 Baú do Titã';
    } else if (taskType === 'diet') {
      hero.attributes.agility += 1;
      hero.chests.nutritionist += 1;
      attr = '+1 Agilidade e +1 Baú do Nutricionista';
    } else if (taskType === 'quiz') {
      hero.attributes.intelligence += 1;
      hero.chests.sage += 1;
      attr = '+1 Inteligência e +1 Baú do Sábio';
    } else if (taskType === 'cardio') {
      hero.attributes.speed += 1;
      hero.chests.sprinter += 1;
      attr = '+1 Velocidade e +1 Baú do Velocista';
    }

    this.saveLocalHero(userId, hero);
    return {
      hero,
      success: true,
      alreadyCompleted: false,
      message: `Hábito registrado! Você conquistou ${attr}!`,
      attributeGained: attr,
    };
  },

  async fetchDailyQuiz(userId: string): Promise<{ quiz: DailyQuizQuestion; alreadyAnswered: boolean }> {
    try {
      const { data } = await api.get('/idle-game/quiz/daily');
      if (data?.quiz) return data;
    } catch {
      // offline
    }

    const { hero } = await this.fetchHero(userId);
    return {
      quiz: {
        id: 'quiz_protein',
        title: 'Aporte Proteico & Hipertrofia',
        articleSlug: 'art-01-proteina-hipertrofia',
        articleTitle: 'Aporte Proteico Ideal para Hipertrofia Muscular',
        question: 'Qual a faixa diária de ingestão proteica recomendada por consensos científicos para maximizar a síntese proteica?',
        options: [
          '0.5 a 0.8 g por kg de peso corporal',
          '1.6 a 2.2 g por kg de peso corporal',
          '4.5 a 6.0 g por kg de peso corporal',
          'Proteínas não têm influência direta na hipertrofia',
        ],
        explanation: 'A literatura científica (Morton et al., 2018) estabelece 1.6 a 2.2 g/kg como faixa ótima para sinalização hipertrófica máxima em atletas e praticantes de musculação.',
      },
      alreadyAnswered: hero.completedHabitsToday.quiz,
    };
  },

  async answerDailyQuiz(
    userId: string,
    quizId: string,
    selectedOption: number
  ): Promise<{ correct: boolean; hero: HeroProfile; message: string; explanation: string; articleSlug: string }> {
    try {
      const { data } = await api.post('/idle-game/quiz/answer', { quizId, selectedOption });
      if (data?.hero) {
        this.saveLocalHero(userId, data.hero);
        return data;
      }
    } catch {
      // offline
    }

    const isCorrect = selectedOption === 1;
    if (!isCorrect) {
      const { hero } = await this.fetchHero(userId);
      return {
        correct: false,
        hero,
        message: 'Resposta incorreta! Mas o aprendizado científico é contínuo.',
        explanation: 'A faixa padrão de 1.6 a 2.2 g/kg garante saturação da via mTOR para síntese proteica.',
        articleSlug: 'art-01-proteina-hipertrofia',
      };
    }

    const checkin = await this.taskCheckin(userId, 'quiz');
    return {
      correct: true,
      hero: checkin.hero,
      message: 'Resposta Correta! Você ganhou +1 Inteligência e 1 Baú do Sábio!',
      explanation: 'A literatura científica confirma que 1.6 a 2.2 g/kg maximiza os ganhos de massa muscular magra.',
      articleSlug: 'art-01-proteina-hipertrofia',
    };
  },

  async executeAttack(
    userId: string,
    currentMonsterHp: number,
    currentHeroHp?: number
  ): Promise<CombatTurnResult> {
    try {
      const { data } = await api.post('/idle-game/attack', { currentMonsterHp, currentHeroHp });
      if (data) {
        // Sincroniza estado local se o backend respondeu
        const local = this.getLocalHero(userId);
        if (local) {
          local.dungeonProgress.currentMonsterHp = data.nextMonsterHp;
          local.dungeonProgress.currentMonsterMaxHp = data.nextMonsterMaxHp;
          local.dungeonProgress.currentHeroHp = data.nextHeroHp;
          local.dungeonProgress.currentStage = data.newStage;
          if (data.isMonsterDead) {
            local.gold += data.goldEarned;
            local.currentXp += data.xpEarned;
            local.dungeonProgress.stageStatus = 'stage_cleared';
          } else if (data.heroDied) {
            local.dungeonProgress.stageStatus = 'hero_defeated';
          }
          this.saveLocalHero(userId, local);
        }
        return data;
      }
    } catch {
      // offline fallback
    }

    const { hero, derivedStats } = await this.fetchHero(userId);
    const heroMaxHp = derivedStats.maxHp;
    const currentStage = Math.max(1, hero.dungeonProgress.currentStage);
    const stageStats = getMonsterStatsForStage(currentStage);

    // 1. Dano do Avatar contra o Monstro
    const isCrit = Math.random() * 100 <= derivedStats.critRate;
    const damageMultiplier = isCrit ? 1.75 : 1.0;
    const damageVariance = 0.9 + Math.random() * 0.2;
    const damageDealt = Math.max(1, Math.round(derivedStats.attack * damageMultiplier * damageVariance));
    const nextMonsterHp = Math.max(0, currentMonsterHp - damageDealt);

    // 2. Dano do Monstro contra o Avatar (Contra-ataque)
    const defenseReduction = Math.min(0.75, derivedStats.damageReductionPct / 100);
    const rawMonsterDmg = stageStats.attack * (1 - defenseReduction) * (0.9 + Math.random() * 0.2);
    const monsterDamageDealt = Math.max(1, Math.round(rawMonsterDmg));

    const curHeroHp = currentHeroHp ?? hero.dungeonProgress.currentHeroHp ?? heroMaxHp;
    let nextHeroHp = Math.max(0, curHeroHp - monsterDamageDealt);

    const monsterIndex = (currentStage - 1) % DEFAULT_MONSTERS.length;
    const currentMonsterObj = {
      ...DEFAULT_MONSTERS[monsterIndex],
      attack: stageStats.attack,
    };

    // 3. Morte do Avatar (Continua lutando e regredindo de fase até não morrer)
    if (nextHeroHp <= 0) {
      const previousStage = Math.max(1, currentStage - 1);
      hero.dungeonProgress.currentStage = previousStage;
      hero.dungeonProgress.stageStatus = 'in_battle'; // Continua lutando!

      const prevStats = getMonsterStatsForStage(previousStage);
      const prevMonsterIndex = (previousStage - 1) % DEFAULT_MONSTERS.length;
      const prevMonsterObj = {
        ...DEFAULT_MONSTERS[prevMonsterIndex],
        attack: prevStats.attack,
      };

      hero.dungeonProgress.currentMonsterHp = prevStats.maxHp;
      hero.dungeonProgress.currentMonsterMaxHp = prevStats.maxHp;
      hero.dungeonProgress.currentHeroHp = heroMaxHp;
      this.saveLocalHero(userId, hero);

      return {
        damageDealt,
        isCrit,
        isMonsterDead: false,
        nextMonsterHp: prevStats.maxHp,
        nextMonsterMaxHp: prevStats.maxHp,
        monsterDamageDealt,
        heroDied: true,
        nextHeroHp: heroMaxHp,
        nextHeroMaxHp: heroMaxHp,
        goldEarned: 0,
        xpEarned: 0,
        stageCleared: false,
        newStage: previousStage,
        monster: prevMonsterObj,
        message: `O Herói foi derrotado! Recuou para a Fase ${previousStage} e continua lutando!`,
      };
    }

    // 4. Morte do Monstro (Fase Concluída e Farm Contínuo SEM Avanço Forçado)
    if (nextMonsterHp <= 0) {
      const rewards = getStageRewards(currentStage);
      hero.gold += rewards.gold;
      hero.currentXp += rewards.xp;
      hero.dungeonProgress.stageStatus = 'in_battle'; // Continua farmando e lutando!
      hero.dungeonProgress.highestStage = Math.max(hero.dungeonProgress.highestStage, currentStage);
      hero.dungeonProgress.currentHeroHp = nextHeroHp;
      hero.dungeonProgress.currentMonsterHp = stageStats.maxHp;
      hero.dungeonProgress.currentMonsterMaxHp = stageStats.maxHp;
      this.saveLocalHero(userId, hero);

      return {
        damageDealt,
        isCrit,
        isMonsterDead: true,
        nextMonsterHp: stageStats.maxHp, // Renasce imediatamente para farm contínuo
        nextMonsterMaxHp: stageStats.maxHp,
        monsterDamageDealt,
        heroDied: false,
        nextHeroHp,
        nextHeroMaxHp: heroMaxHp,
        goldEarned: rewards.gold,
        xpEarned: rewards.xp,
        stageCleared: true,
        newStage: currentStage,
        monster: currentMonsterObj,
        message: `Monstro derrotado! (+${rewards.gold} Ouro 🪙, +${rewards.xp} XP ⭐)`,
      };
    }

    // 5. Combate em andamento
    hero.dungeonProgress.currentMonsterHp = nextMonsterHp;
    hero.dungeonProgress.currentHeroHp = nextHeroHp;
    hero.dungeonProgress.stageStatus = 'in_battle';
    this.saveLocalHero(userId, hero);

    return {
      damageDealt,
      isCrit,
      isMonsterDead: false,
      nextMonsterHp,
      nextMonsterMaxHp: stageStats.maxHp,
      monsterDamageDealt,
      heroDied: false,
      nextHeroHp,
      nextHeroMaxHp: heroMaxHp,
      goldEarned: 0,
      xpEarned: 0,
      stageCleared: false,
      newStage: currentStage,
      monster: currentMonsterObj,
    };
  },

  // Avanço manual de fase acionado estritamente pelo botão [ AVANÇAR ]
  async advanceStage(userId: string): Promise<{
    newStage: number;
    monster: UltraprocessedMonster;
    monsterMaxHp: number;
    heroHp: number;
  }> {
    try {
      const { data } = await api.post('/idle-game/advance-stage');
      if (data) {
        const local = this.getLocalHero(userId);
        if (local) {
          local.dungeonProgress.currentStage = data.newStage;
          local.dungeonProgress.currentMonsterHp = data.monsterMaxHp;
          local.dungeonProgress.currentMonsterMaxHp = data.monsterMaxHp;
          local.dungeonProgress.currentHeroHp = data.heroHp;
          local.dungeonProgress.stageStatus = 'in_battle';
          this.saveLocalHero(userId, local);
        }
        return data;
      }
    } catch {
      // offline fallback
    }

    const { hero, derivedStats } = await this.fetchHero(userId);
    hero.dungeonProgress.currentStage += 1;
    hero.dungeonProgress.highestStage = Math.max(hero.dungeonProgress.highestStage, hero.dungeonProgress.currentStage);

    const nextStats = getMonsterStatsForStage(hero.dungeonProgress.currentStage);
    const monsterIndex = (hero.dungeonProgress.currentStage - 1) % DEFAULT_MONSTERS.length;
    const nextMonster: UltraprocessedMonster = {
      ...DEFAULT_MONSTERS[monsterIndex],
      attack: nextStats.attack,
    };

    hero.dungeonProgress.currentMonsterHp = nextStats.maxHp;
    hero.dungeonProgress.currentMonsterMaxHp = nextStats.maxHp;
    hero.dungeonProgress.currentHeroHp = derivedStats.maxHp;
    hero.dungeonProgress.stageStatus = 'in_battle';
    this.saveLocalHero(userId, hero);

    return {
      newStage: hero.dungeonProgress.currentStage,
      monster: nextMonster,
      monsterMaxHp: nextStats.maxHp,
      heroHp: derivedStats.maxHp,
    };
  },
};
