import { describe, it, expect } from 'vitest';
import { UserEntity } from './user.entity';

describe('UserEntity', () => {
  describe('calculateBMR', () => {
    it('should calculate BMR for a male correctly', () => {
      const user = new UserEntity({
        weight: 80, // kg
        height: 180, // cm
        age: 30, // years
        gender: 'male',
      });
      // 10 * 80 + 6.25 * 180 - 5 * 30 + 5 = 800 + 1125 - 150 + 5 = 1780
      expect(user.calculateBMR()).toBe(1780);
    });

    it('should calculate BMR for a female correctly', () => {
      const user = new UserEntity({
        weight: 65, // kg
        height: 165, // cm
        age: 25, // years
        gender: 'female',
      });
      // 10 * 65 + 6.25 * 165 - 5 * 25 - 161 = 650 + 1031.25 - 125 - 161 = 1395.25 -> 1395
      expect(user.calculateBMR()).toBe(1395);
    });

    it('should return null if required fields are missing', () => {
      const user = new UserEntity({
        weight: 80,
      });
      expect(user.calculateBMR()).toBeNull();
    });
  });

  describe('calculateTDEE', () => {
    it('should calculate TDEE for lightly_active correctly', () => {
      const user = new UserEntity({
        weight: 80,
        height: 180,
        age: 30,
        gender: 'male',
        activityLevel: 'lightly_active',
      });
      const bmr = 1780;
      expect(user.calculateTDEE()).toBe(Math.round(bmr * 1.375));
    });

    it('should use moderately_active fallback if activityLevel is missing', () => {
      const user = new UserEntity({
        weight: 80,
        height: 180,
        age: 30,
        gender: 'male',
      });
      expect(user.calculateTDEE()).toBe(Math.round(1780 * 1.55));
    });
  });
});
