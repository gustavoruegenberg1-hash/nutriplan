import { describe, it, expect } from 'vitest';
import { LootService } from '../../src/modules/idle-game/domain/services/loot.service';
import { EquipmentItem } from '../../src/modules/idle-game/domain/entities/hero.entity';

describe('LootService & Fusion System', () => {
  const lootService = new LootService();

  const makeItem = (slot: EquipmentItem['slot'], rarity: EquipmentItem['rarity'], id: string): EquipmentItem => ({
    id,
    name: `Item ${id}`,
    slot,
    rarity,
    level: 1,
    bonusStats: { attack: 10, defense: 5 },
    icon: '🗡️',
    description: 'Item de teste',
    isEquipable: true,
    type: 'equipment',
  });

  it('deve fundir 3 itens comuns em 1 item incomum equipável', () => {
    const items = [
      makeItem('weapon', 'common', '1'),
      makeItem('chest', 'common', '2'),
      makeItem('boots', 'common', '3'),
    ];

    const result = lootService.fuseItems(items, 5);
    expect(result.success).toBe(true);
    expect(result.resultItem).toBeDefined();
    expect(result.resultItem?.rarity).toBe('uncommon');
    expect(result.resultItem?.isEquipable).toBe(true);
    expect(result.resultItem?.type).toBe('equipment');
    expect(result.resultItem?.level).toBe(5);
    expect(['weapon', 'helmet', 'chest', 'legs', 'boots', 'amulet']).toContain(result.resultItem?.slot);
  });

  it('deve fundir 3 itens incomuns em 1 item raro', () => {
    const items = [
      makeItem('helmet', 'uncommon', '1'),
      makeItem('legs', 'uncommon', '2'),
      makeItem('amulet', 'uncommon', '3'),
    ];

    const result = lootService.fuseItems(items, 3);
    expect(result.success).toBe(true);
    expect(result.resultItem?.rarity).toBe('rare');
  });

  it('deve fundir 3 itens raros em 1 item épico', () => {
    const items = [
      makeItem('weapon', 'rare', '1'),
      makeItem('weapon', 'rare', '2'),
      makeItem('weapon', 'rare', '3'),
    ];

    const result = lootService.fuseItems(items, 4);
    expect(result.success).toBe(true);
    expect(result.resultItem?.rarity).toBe('epic');
  });

  it('deve fundir 3 itens épicos em 1 item lendário', () => {
    const items = [
      makeItem('chest', 'epic', '1'),
      makeItem('chest', 'epic', '2'),
      makeItem('chest', 'epic', '3'),
    ];

    const result = lootService.fuseItems(items, 10);
    expect(result.success).toBe(true);
    expect(result.resultItem?.rarity).toBe('legendary');
  });

  it('deve bloquear a fusão se a quantidade for menor ou maior que 3', () => {
    const twoItems = [
      makeItem('weapon', 'common', '1'),
      makeItem('chest', 'common', '2'),
    ];
    const res = lootService.fuseItems(twoItems, 1);
    expect(res.success).toBe(false);
    expect(res.message).toContain('3 equipamentos');
  });

  it('deve bloquear a fusão se as raridades forem divergentes', () => {
    const mixed = [
      makeItem('weapon', 'common', '1'),
      makeItem('chest', 'common', '2'),
      makeItem('boots', 'rare', '3'),
    ];
    const res = lootService.fuseItems(mixed, 1);
    expect(res.success).toBe(false);
    expect(res.message).toContain('mesma raridade');
  });

  it('deve bloquear fusão de itens lendários (raridade máxima)', () => {
    const legendaries = [
      makeItem('weapon', 'legendary', '1'),
      makeItem('chest', 'legendary', '2'),
      makeItem('boots', 'legendary', '3'),
    ];
    const res = lootService.fuseItems(legendaries, 1);
    expect(res.success).toBe(false);
    expect(res.message).toContain('raridade máxima');
  });

  it('drops de baús na categoria equipamento devem ser estritamente equipáveis', () => {
    for (let i = 0; i < 50; i++) {
      const drop = lootService.rollChestReward('titan', 5);
      if (drop.type === 'equipment' && drop.equipment) {
        expect(drop.equipment.isEquipable).toBe(true);
        expect(['weapon', 'helmet', 'chest', 'legs', 'boots', 'amulet']).toContain(drop.equipment.slot);
      }
    }
  });
});
