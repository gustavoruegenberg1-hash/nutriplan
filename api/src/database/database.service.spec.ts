import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DatabaseService } from './database.service';

describe('DatabaseService (Motor Relacional SQLite)', () => {
  let dbService: DatabaseService;

  beforeEach(() => {
    dbService = DatabaseService.createInMemory();
  });

  afterEach(() => {
    dbService.onModuleDestroy();
  });

  it('deve inicializar o banco e criar todas as 17 tabelas relacionais', () => {
    const tables = dbService.query<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
    );
    const tableNames = tables.map((t) => t.name);

    const expectedTables = [
      'audit_logs',
      'diets',
      'exercises',
      'foods',
      'goals',
      'meal_foods',
      'meals',
      'notifications',
      'profiles',
      'restrictions',
      'user_restrictions',
      'users',
      'weight_history',
      'workout_exercises',
      'workout_log_exercises',
      'workout_logs',
      'workouts',
    ];

    for (const expected of expectedTables) {
      expect(tableNames).toContain(expected);
    }
  });

  it('deve impor integridade referencial de chaves estrangeiras (PRAGMA foreign_keys = ON)', () => {
    // Tentar inserir profile para usuário inexistente deve falhar
    expect(() => {
      dbService.run(
        `INSERT INTO profiles (id, user_id, age, gender, weight, height, created_at, updated_at)
         VALUES ('p-1', 'user-inexistente', 25, 'MALE', 75, 175, '2026-10-06', '2026-10-06')`
      );
    }).toThrow();
  });

  it('deve semear restrições padrão no banco', () => {
    const restrictions = dbService.query('SELECT * FROM restrictions');
    expect(restrictions.length).toBeGreaterThanOrEqual(7);
    expect(restrictions.some((r) => r.id === 'res-lactose')).toBe(true);
    expect(restrictions.some((r) => r.id === 'res-gluten')).toBe(true);
  });

  it('deve semear alimentos da TACO e exercícios com integridade', () => {
    const foodsCount = dbService.queryOne<{ count: number }>('SELECT COUNT(*) as count FROM foods');
    const exercisesCount = dbService.queryOne<{ count: number }>('SELECT COUNT(*) as count FROM exercises');

    expect(foodsCount!.count).toBeGreaterThanOrEqual(700);
    expect(exercisesCount!.count).toBeGreaterThanOrEqual(100);
  });

  it('deve reverter transações em caso de erro (Rollback ACID)', () => {
    const now = new Date().toISOString();
    dbService.run(
      `INSERT INTO users (id, email, password_hash, name, created_at, updated_at)
       VALUES ('u-test-trans', 'test-trans@nutriplan.com', 'hash', 'Teste', ?, ?)`,
      [now, now]
    );

    expect(() => {
      dbService.transaction(() => {
        dbService.run(
          `INSERT INTO diets (id, user_id, name, created_at, updated_at)
           VALUES ('diet-trans-1', 'u-test-trans', 'Dieta Válida', ?, ?)`,
          [now, now]
        );
        // Lançar erro proposital
        throw new Error('Falha simulada na transação');
      });
    }).toThrow('Falha simulada na transação');

    const diet = dbService.queryOne('SELECT * FROM diets WHERE id = ?', ['diet-trans-1']);
    expect(diet).toBeNull();
  });
});
