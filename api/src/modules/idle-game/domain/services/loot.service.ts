import { Injectable } from '@nestjs/common';
import { EquipmentItem, EquipmentSlot, ItemRarity } from '../entities/hero.entity';
import {
  LOOT_TABLES,
  GENERIC_STARTER_EQUIPMENT,
  NEXT_RARITY_MAP,
  LootTableEntry,
} from '../constants/game-balance.constant';

export interface ChestLootResult {
  type: 'equipment' | 'gold' | 'xp' | 'essence';
  equipment?: EquipmentItem;
  amount?: number;
  message: string;
  isDuplicateConverted?: boolean;
}

@Injectable()
export class LootService {
  private rollRarity(): ItemRarity {
    const roll = Math.random() * 100;
    if (roll < 55) return 'common';
    if (roll < 80) return 'uncommon';
    if (roll < 93) return 'rare';
    if (roll < 98.5) return 'epic';
    return 'legendary';
  }

  // Sorteia uma recompensa da Loot Table central
  rollChestReward(
    chestType: 'titan' | 'nutritionist' | 'sage' | 'sprinter',
    heroLevel: number,
    existingItems: EquipmentItem[] = [],
    equippedMap: Partial<Record<EquipmentSlot, EquipmentItem | null>> = {}
  ): ChestLootResult {
    const table = LOOT_TABLES[chestType];
    const totalWeight = table.entries.reduce((acc, e) => acc + e.weight, 0);
    const roll = Math.random() * totalWeight;

    let cumulative = 0;
    let selectedEntry: LootTableEntry = table.entries[0];

    for (const entry of table.entries) {
      cumulative += entry.weight;
      if (roll <= cumulative) {
        selectedEntry = entry;
        break;
      }
    }

    // 1. Recompensa de Ouro
    if (selectedEntry.type === 'gold') {
      const min = selectedEntry.minAmount || 80;
      const max = selectedEntry.maxAmount || 160;
      const amount = Math.round((min + Math.random() * (max - min)) * (1 + (heroLevel - 1) * 0.08));
      return {
        type: 'gold',
        amount,
        message: `Você encontrou um baú repleto de moedas! (+${amount} Ouro 🪙)`,
      };
    }

    // 2. Recompensa de XP
    if (selectedEntry.type === 'xp') {
      const min = selectedEntry.minAmount || 50;
      const max = selectedEntry.maxAmount || 100;
      const amount = Math.round(min + Math.random() * (max - min));
      return {
        type: 'xp',
        amount,
        message: `O conhecimento do baú expandiu sua mente! (+${amount} XP de Herói ⭐)`,
      };
    }

    // 3. Recompensa de Essência de Aprimoramento
    if (selectedEntry.type === 'essence') {
      const min = selectedEntry.minAmount || 10;
      const max = selectedEntry.maxAmount || 25;
      const amount = Math.round(min + Math.random() * (max - min));
      return {
        type: 'essence',
        amount,
        message: `Essências puras de disciplina colhidas! (+${amount} Essências 🧪)`,
      };
    }

    // 4. Recompensa de Equipamento
    const slot = selectedEntry.itemSlot || 'weapon';
    const genericTemplate = GENERIC_STARTER_EQUIPMENT[slot];
    const rarity = this.rollRarity();
    const rarityMultiplier = {
      common: 1.0,
      uncommon: 1.35,
      rare: 1.8,
      epic: 2.5,
      legendary: 3.5,
    }[rarity];

    const bonusStats: EquipmentItem['bonusStats'] = {};
    Object.entries(genericTemplate.bonusStats).forEach(([key, val]) => {
      if (val !== undefined) {
        (bonusStats as any)[key] = Math.round(val * rarityMultiplier + (heroLevel - 1) * 1.5);
      }
    });

    const generatedItem: EquipmentItem = {
      id: `item_${slot}_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      name: `${genericTemplate.name}${rarity !== 'common' ? ` (${rarity.toUpperCase()})` : ''}`,
      slot,
      rarity,
      level: heroLevel,
      bonusStats,
      icon: genericTemplate.icon,
      description: genericTemplate.description,
      isEquipable: true,
      type: 'equipment',
    };

    // Verificação de Duplicatas: se o jogador já possui um item idêntico equipado ou no inventário
    const isDuplicate =
      existingItems.some((i) => i.name === generatedItem.name && i.rarity === generatedItem.rarity) ||
      Object.values(equippedMap).some((i) => i?.name === generatedItem.name && i?.rarity === generatedItem.rarity);

    if (isDuplicate) {
      const goldRefund = 70 + heroLevel * 5;
      const essenceRefund = 12;
      return {
        type: 'equipment',
        equipment: generatedItem,
        isDuplicateConverted: true,
        amount: goldRefund,
        message: `Item repetido [${generatedItem.name}] convertido automaticamente em +${goldRefund} Ouro 🪙 e +${essenceRefund} Essências 🧪!`,
      };
    }

    return {
      type: 'equipment',
      equipment: generatedItem,
      isDuplicateConverted: false,
      message: `Você conquistou um novo equipamento: [${rarity.toUpperCase()}] ${generatedItem.name}!`,
    };
  }

  // Realiza a fusão de exatamente 3 itens da mesma raridade
  fuseItems(
    items: EquipmentItem[],
    heroLevel: number
  ): { success: boolean; resultItem?: EquipmentItem; message: string } {
    if (!items || items.length !== 3) {
      return {
        success: false,
        message: 'A fusão exige a seleção de exatamente 3 equipamentos.',
      };
    }

    const firstRarity = items[0].rarity;
    const sameRarity = items.every((i) => i.rarity === firstRarity);
    if (!sameRarity) {
      return {
        success: false,
        message: 'Todos os 3 equipamentos devem ser rigorosamente da mesma raridade para realizar a fusão!',
      };
    }

    const nextRarity = NEXT_RARITY_MAP[firstRarity];
    if (!nextRarity) {
      return {
        success: false,
        message: 'Equipamentos Lendários já atingiram a raridade máxima e não podem ser fundidos!',
      };
    }

    // Sorteia um slot aleatório dentre os 6 slots equipáveis
    const slots: EquipmentSlot[] = ['weapon', 'helmet', 'chest', 'legs', 'boots', 'amulet'];
    const randomSlot = slots[Math.floor(Math.random() * slots.length)];
    const template = GENERIC_STARTER_EQUIPMENT[randomSlot];

    const rarityMultiplier = {
      common: 1.0,
      uncommon: 1.35,
      rare: 1.8,
      epic: 2.5,
      legendary: 3.5,
    }[nextRarity];

    const bonusStats: EquipmentItem['bonusStats'] = {};
    Object.entries(template.bonusStats).forEach(([key, val]) => {
      if (val !== undefined) {
        (bonusStats as any)[key] = Math.round(val * rarityMultiplier + (heroLevel - 1) * 1.5);
      }
    });

    const resultItem: EquipmentItem = {
      id: `fused_${randomSlot}_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      name: `${template.name} (${nextRarity.toUpperCase()})`,
      slot: randomSlot,
      rarity: nextRarity,
      level: heroLevel,
      bonusStats,
      icon: template.icon,
      description: `Equipamento místico gerado a partir da fusão de 3 itens ${firstRarity.toUpperCase()}. ${template.description}`,
      isEquipable: true,
      type: 'equipment',
    };

    return {
      success: true,
      resultItem,
      message: `✨ Fusão mística concluída com sucesso! Você obteve [${nextRarity.toUpperCase()}] ${resultItem.name}!`,
    };
  }

  // Recicla item sobressalente do inventário
  recycleItem(item: EquipmentItem): { goldReward: number; essenceReward: number } {
    const values: Record<ItemRarity, { gold: number; essence: number }> = {
      common: { gold: 20, essence: 3 },
      uncommon: { gold: 45, essence: 6 },
      rare: { gold: 90, essence: 14 },
      epic: { gold: 200, essence: 35 },
      legendary: { gold: 450, essence: 80 },
    };

    const base = values[item.rarity] || values.common;
    const goldReward = Math.round(base.gold * (1 + item.level * 0.1));
    const essenceReward = base.essence;

    return { goldReward, essenceReward };
  }
}
