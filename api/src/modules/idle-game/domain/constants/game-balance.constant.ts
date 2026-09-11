import { EquipmentItem, EquipmentSlot, ItemRarity } from '../entities/hero.entity';

export interface LootTableEntry {
  type: 'equipment' | 'gold' | 'xp' | 'essence';
  label: string;
  chancePct: number; // Porcentagem real calculada
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

export const RARITY_ORDER: ItemRarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

export const NEXT_RARITY_MAP: Record<ItemRarity, ItemRarity | null> = {
  common: 'uncommon',
  uncommon: 'rare',
  rare: 'epic',
  epic: 'legendary',
  legendary: null, // Raridade máxima
};

// 1 EQUIPAMENTO GENÉRICO BALANCEADO PARA CADA UM DOS 6 SLOTS
export const GENERIC_STARTER_EQUIPMENT: Record<EquipmentSlot, EquipmentItem> = {
  weapon: {
    id: 'starter_weapon_sword',
    name: 'Espada de Treino de Halter',
    slot: 'weapon',
    rarity: 'common',
    level: 1,
    bonusStats: {
      attack: 14,
      critRate: 3,
    },
    icon: '🗡️',
    description: 'Arma básica forjada a partir de ferro fundido de anilhas. Aumenta o dano base dos golpes.',
    isEquipable: true,
    type: 'equipment',
  },
  helmet: {
    id: 'starter_helmet_band',
    name: 'Faixa de Concentração do Guerreiro',
    slot: 'helmet',
    rarity: 'common',
    level: 1,
    bonusStats: {
      defense: 8,
      hp: 35,
    },
    icon: '🪖',
    description: 'Faixa respirável que protege a mente de distrações e eleva a firmeza em combate.',
    isEquipable: true,
    type: 'equipment',
  },
  chest: {
    id: 'starter_chest_vest',
    name: 'Colete de Fibras Protetoras',
    slot: 'chest',
    rarity: 'common',
    level: 1,
    bonusStats: {
      defense: 12,
      hp: 50,
    },
    icon: '🦺',
    description: 'Colete leve feito de fibras entrelaçadas que amortece impactos e promove saciedade tecidual.',
    isEquipable: true,
    type: 'equipment',
  },
  legs: {
    id: 'starter_legs_pants',
    name: 'Calça de Treino Funcional',
    slot: 'legs',
    rarity: 'common',
    level: 1,
    bonusStats: {
      defense: 8,
      speed: 10,
    },
    icon: '👖',
    description: 'Tecido flexível com suporte muscular que otimiza a postura e a cadência de movimento.',
    isEquipable: true,
    type: 'equipment',
  },
  boots: {
    id: 'starter_boots_shoes',
    name: 'Tênis de Corrida Amortecido',
    slot: 'boots',
    rarity: 'common',
    level: 1,
    bonusStats: {
      speed: 15,
      hp: 20,
    },
    icon: '👟',
    description: 'Calçado com solado de absorção de impacto que reduz o atrito e aumenta a velocidade de ataque.',
    isEquipable: true,
    type: 'equipment',
  },
  amulet: {
    id: 'starter_amulet_pendant',
    name: 'Pingente do Equilíbrio Biológico',
    slot: 'amulet',
    rarity: 'common',
    level: 1,
    bonusStats: {
      attack: 8,
      defense: 6,
      hp: 25,
    },
    icon: '🔮',
    description: 'Amuleto harmônico que calibra os processos anabólicos e protege contra o estresse celular.',
    isEquipable: true,
    type: 'equipment',
  },
};

// TABELA CENTRAL DE LOOT DOS BAÚS (TAXAS REAIS COMPARTILHADAS ENTRE SORTEIO E UI)
export const LOOT_TABLES: Record<'titan' | 'nutritionist' | 'sage' | 'sprinter', ChestLootTable> = {
  titan: {
    chestType: 'titan',
    title: 'Baú do Titã',
    description: 'Conquistado na conclusão de treinos de força. Focado em armas, elmos e poder muscular.',
    themeColor: '#EF4444',
    icon: '🧰',
    entries: [
      {
        type: 'equipment',
        label: 'Arma de Força (Espadas / Machados)',
        chancePct: 35,
        weight: 35,
        itemSlot: 'weapon',
        icon: '🗡️',
      },
      {
        type: 'equipment',
        label: 'Elmo de Foco e Proteção',
        chancePct: 20,
        weight: 20,
        itemSlot: 'helmet',
        icon: '🪖',
      },
      {
        type: 'gold',
        label: 'Moedas de Ouro (80 a 160 🪙)',
        chancePct: 25,
        weight: 25,
        minAmount: 80,
        maxAmount: 160,
        icon: '🪙',
      },
      {
        type: 'xp',
        label: 'Experiência de Herói (50 a 100 ⭐)',
        chancePct: 12,
        weight: 12,
        minAmount: 50,
        maxAmount: 100,
        icon: '⭐',
      },
      {
        type: 'essence',
        label: 'Essências de Aprimoramento (10 a 25 🧪)',
        chancePct: 8,
        weight: 8,
        minAmount: 10,
        maxAmount: 25,
        icon: '🧪',
      },
    ],
  },
  nutritionist: {
    chestType: 'nutritionist',
    title: 'Baú do Nutricionista',
    description: 'Conquistado ao registrar a primeira refeição do dia. Focado em peitorais, pernas e resistência.',
    themeColor: '#10B981',
    icon: '🥗',
    entries: [
      {
        type: 'equipment',
        label: 'Peitoral de Armadura Nutricional',
        chancePct: 35,
        weight: 35,
        itemSlot: 'chest',
        icon: '🦺',
      },
      {
        type: 'equipment',
        label: 'Calça de Firmeza e Densidade',
        chancePct: 20,
        weight: 20,
        itemSlot: 'legs',
        icon: '👖',
      },
      {
        type: 'gold',
        label: 'Moedas de Ouro (80 a 160 🪙)',
        chancePct: 25,
        weight: 25,
        minAmount: 80,
        maxAmount: 160,
        icon: '🪙',
      },
      {
        type: 'xp',
        label: 'Experiência de Herói (50 a 100 ⭐)',
        chancePct: 12,
        weight: 12,
        minAmount: 50,
        maxAmount: 100,
        icon: '⭐',
      },
      {
        type: 'essence',
        label: 'Essências de Aprimoramento (10 a 25 🧪)',
        chancePct: 8,
        weight: 8,
        minAmount: 10,
        maxAmount: 25,
        icon: '🧪',
      },
    ],
  },
  sage: {
    chestType: 'sage',
    title: 'Baú do Sábio',
    description: 'Conquistado ao responder o quiz ou estudar artigos científicos. Focado em amuletos e sabedoria.',
    themeColor: '#8B5CF6',
    icon: '🔮',
    entries: [
      {
        type: 'equipment',
        label: 'Amuleto da Evidência Científica',
        chancePct: 35,
        weight: 35,
        itemSlot: 'amulet',
        icon: '🔮',
      },
      {
        type: 'equipment',
        label: 'Diadema da Síntese Proteica',
        chancePct: 20,
        weight: 20,
        itemSlot: 'helmet',
        icon: '👑',
      },
      {
        type: 'gold',
        label: 'Moedas de Ouro (80 a 160 🪙)',
        chancePct: 25,
        weight: 25,
        minAmount: 80,
        maxAmount: 160,
        icon: '🪙',
      },
      {
        type: 'xp',
        label: 'Experiência de Herói (50 a 100 ⭐)',
        chancePct: 12,
        weight: 12,
        minAmount: 50,
        maxAmount: 100,
        icon: '⭐',
      },
      {
        type: 'essence',
        label: 'Essências de Aprimoramento (10 a 25 🧪)',
        chancePct: 8,
        weight: 8,
        minAmount: 10,
        maxAmount: 25,
        icon: '🧪',
      },
    ],
  },
  sprinter: {
    chestType: 'sprinter',
    title: 'Baú do Velocista',
    description: 'Conquistado na realização de cardio e passos. Focado em botas, calças e cadência veloz.',
    themeColor: '#0EA5E9',
    icon: '⚡',
    entries: [
      {
        type: 'equipment',
        label: 'Botas de Corrida Mitocondrial',
        chancePct: 35,
        weight: 35,
        itemSlot: 'boots',
        icon: '👟',
      },
      {
        type: 'equipment',
        label: 'Calça de Compressão Graduada',
        chancePct: 20,
        weight: 20,
        itemSlot: 'legs',
        icon: '👖',
      },
      {
        type: 'gold',
        label: 'Moedas de Ouro (80 a 160 🪙)',
        chancePct: 25,
        weight: 25,
        minAmount: 80,
        maxAmount: 160,
        icon: '🪙',
      },
      {
        type: 'xp',
        label: 'Experiência de Herói (50 a 100 ⭐)',
        chancePct: 12,
        weight: 12,
        minAmount: 50,
        maxAmount: 100,
        icon: '⭐',
      },
      {
        type: 'essence',
        label: 'Essências de Aprimoramento (10 a 25 🧪)',
        chancePct: 8,
        weight: 8,
        minAmount: 10,
        maxAmount: 25,
        icon: '🧪',
      },
    ],
  },
};

// BALANCEAMENTO CENTRAL DE COMBATE E PROGRESSÃO
export const COMBAT_BALANCE = {
  attackWindupMs: 150, // Milissegundo exato do impacto da arma no monstro
  attackRecoveryMs: 150, // Tempo de retorno do golpe
  monsterShakeMs: 160, // Tremor do monstro ao receber impacto
  avatarAttackIntervalMs: 1500, // Intervalo base de ataque do herói
  monsterAttackIntervalMs: 2200, // Intervalo base de ataque do monstro

  baseMonsterHp: 85,
  hpScalePerStage: 1.075, // Escalonamento suave de 7.5% ao invés de 16% explosivo
  bossHpMultiplier: 2.2,

  monsterBaseDamage: 7,
  damageScalePerStage: 1.055, // Escalonamento suave de dano de 5.5%
  bossDamageMultiplier: 1.6,

  critMultiplier: 1.75,

  // Sistema Offline / AFK balanceado
  maxAfkMinutes: 480, // Limite de 8 horas offline
  afkEfficiency: 0.5, // 50% de rendimento em relação ao jogo ativo
};

export function getMonsterStatsForStage(stage: number) {
  const safeStage = Math.max(1, Math.floor(stage));
  const isBoss = safeStage % 5 === 0;

  const scaleHp = Math.pow(COMBAT_BALANCE.hpScalePerStage, safeStage - 1);
  const scaleDmg = Math.pow(COMBAT_BALANCE.damageScalePerStage, safeStage - 1);

  const bossHpMulti = isBoss ? COMBAT_BALANCE.bossHpMultiplier : 1.0;
  const bossDmgMulti = isBoss ? COMBAT_BALANCE.bossDamageMultiplier : 1.0;

  const maxHp = Math.max(40, Math.round(COMBAT_BALANCE.baseMonsterHp * scaleHp * bossHpMulti));
  const attack = Math.max(4, Math.round(COMBAT_BALANCE.monsterBaseDamage * scaleDmg * bossDmgMulti));

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
