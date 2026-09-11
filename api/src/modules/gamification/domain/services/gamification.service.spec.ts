import { describe, it, expect, beforeEach } from 'vitest';
import { GamificationService } from './gamification.service';

describe('GamificationService', () => {
  let service: GamificationService;
  let testUserId: string;

  beforeEach(() => {
    service = new GamificationService();
    testUserId = `test_user_game_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
  });

  it('should initialize a default pet for a new user', async () => {
    const pet = await service.getPet(testUserId);
    expect(pet).toBeDefined();
    expect(pet.userId).toBe(testUserId);
    expect(pet.level).toBe(1);
    expect(pet.coins).toBeGreaterThanOrEqual(50);
    expect(pet.species).toBe('draco');
  });

  it('should record water drinking and grant XP', async () => {
    const initialPet = await service.getPet(testUserId);
    const initialCups = initialPet.vitality.waterCups;
    const initialXp = initialPet.currentXp;

    const res = await service.recordAction(testUserId, 'DRINK_WATER');
    expect(res.pet.vitality.waterCups).toBe(initialCups + 1);
    expect(res.earnedXp).toBe(10);
    expect(res.pet.currentXp).toBe(initialXp + 10);
  });

  it('should level up when reaching nextLevelXp', async () => {
    const pet = await service.getPet(testUserId);
    const neededXp = pet.nextLevelXp;

    const { leveledUp, newLevel, earnedCoins } = pet.addXp(neededXp);
    expect(leveledUp).toBe(true);
    expect(newLevel).toBe(2);
    expect(earnedCoins).toBeGreaterThan(0);
  });

  it('should allow buying an item from catalog if user has enough coins', async () => {
    const buyUserId = `test_user_buy_${Date.now()}`;
    const pet = await service.getPet(buyUserId);
    pet.coins = 200; // ensure funds

    const buyRes = await service.buyItem(buyUserId, 'item_headband');
    expect(buyRes.success).toBe(true);
    expect(buyRes.pet.inventory).toContain('item_headband');
    expect(buyRes.pet.equipped.head).toBe('item_headband');
  });
});
