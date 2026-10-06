import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { DatabaseSync } from 'node:sqlite';
import * as fs from 'node:fs';
import * as path from 'node:path';

export interface RunResult {
  changes: number;
  lastInsertRowid: number | bigint;
}

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private db!: DatabaseSync;
  private readonly dbPath: string;

  constructor() {
    this.dbPath = process.env.DATABASE_PATH || 'nutriplan.sqlite';
  }

  onModuleInit() {
    this.connect();
    this.applyPragmas();
    this.runMigrations();
    this.seedInitialData();
  }

  onModuleDestroy() {
    if (this.db) {
      this.db.close();
      this.logger.log('Conexão SQLite encerrada com sucesso.');
    }
  }

  private connect() {
    this.logger.log(`Inicializando banco relacional SQLite: ${this.dbPath}`);
    this.db = new DatabaseSync(this.dbPath);
  }

  private applyPragmas() {
    this.db.exec('PRAGMA foreign_keys = ON;');
    this.db.exec('PRAGMA journal_mode = WAL;');
    this.db.exec('PRAGMA synchronous = NORMAL;');
  }

  private runMigrations() {
    const schemaPath = path.resolve(__dirname, 'schema.sql');
    let schemaSql: string;

    if (fs.existsSync(schemaPath)) {
      schemaSql = fs.readFileSync(schemaPath, 'utf8');
    } else {
      // Fallback para compilação ts / dist
      const altPath = path.resolve(process.cwd(), 'src', 'database', 'schema.sql');
      schemaSql = fs.readFileSync(altPath, 'utf8');
    }

    this.db.exec(schemaSql);
    this.logger.log('Schema relacional (17 tabelas e índices) verificado e pronto.');
  }

  private seedInitialData() {
    this.seedRestrictions();
    this.seedFoods();
    this.seedExercises();
  }

  private seedRestrictions() {
    const count = this.queryOne<{ count: number }>('SELECT COUNT(*) as count FROM restrictions');
    if (count && count.count > 0) return;

    this.logger.log('Semeando catálogo padrão de restrições alimentares...');
    const defaultRestrictions = [
      { id: 'res-lactose', name: 'Intolerância a Lactose', category: 'INTOLERANCE', description: 'Reação adversa ao açúcar do leite' },
      { id: 'res-gluten', name: 'Intolerância a Glúten / Celíaco', category: 'INTOLERANCE', description: 'Intolerância a proteínas de trigo, centeio e cevada' },
      { id: 'res-seafood', name: 'Alergia a Frutos do Mar', category: 'ALLERGY', description: 'Hipersensibilidade a crustáceos e moluscos' },
      { id: 'res-nuts', name: 'Alergia a Oleaginosas e Amendoim', category: 'ALLERGY', description: 'Hipersensibilidade a nozes, castanhas e amendoim' },
      { id: 'res-soy', name: 'Alergia a Soja', category: 'ALLERGY', description: 'Alergia a derivados proteicos de soja' },
      { id: 'res-vegan', name: 'Dieta Vegana', category: 'PREFERENCE', description: 'Não consome alimentos de origem animal' },
      { id: 'res-vegetarian', name: 'Dieta Vegetariana', category: 'PREFERENCE', description: 'Não consome carnes de qualquer espécie' },
    ];

    const stmt = this.db.prepare(
      'INSERT INTO restrictions (id, name, category, description, is_active) VALUES (?, ?, ?, ?, 1)'
    );

    for (const r of defaultRestrictions) {
      stmt.run(r.id, r.name, r.category, r.description);
    }
  }

  private seedFoods() {
    const count = this.queryOne<{ count: number }>('SELECT COUNT(*) as count FROM foods');
    if (count && count.count > 0) return;

    this.logger.log('Semeando base nutricional oficial TACO (744 alimentos)...');
    const possiblePaths = [
      path.resolve(process.cwd(), 'local-cache', 'foods.json'),
      path.resolve(process.cwd(), '..', 'web', 'src', 'data', 'tacoFoods.json'),
      path.resolve(__dirname, '..', '..', 'local-cache', 'foods.json'),
    ];

    let foodsData: any[] = [];
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        try {
          foodsData = JSON.parse(fs.readFileSync(p, 'utf8'));
          this.logger.log(`Alimentos carregados de: ${p} (${foodsData.length} itens)`);
          break;
        } catch (e) {
          this.logger.warn(`Falha ao ler arquivo de alimentos em ${p}: ${e}`);
        }
      }
    }

    if (foodsData.length === 0) {
      this.logger.warn('Nenhum arquivo de semente TACO encontrado. O banco de alimentos iniciará vazio.');
      return;
    }

    const stmt = this.db.prepare(`
      INSERT INTO foods (
        id, legacy_id, name, category, sub_category, source,
        calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g,
        sodium_mg_per_100g, micronutrients_json, tags_json, is_active, is_verified, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1, ?)
    `);

    const now = new Date().toISOString();
    this.transaction(() => {
      for (const f of foodsData) {
        stmt.run(
          f.id,
          f.legacyId || null,
          f.name,
          f.category || 'Outros',
          f.subCategory || null,
          f.source || 'TACO',
          Number(f.caloriesPer100g) || 0,
          Number(f.proteinPer100g) || 0,
          Number(f.carbsPer100g) || 0,
          Number(f.fatPer100g) || 0,
          Number(f.fiberPer100g) || 0,
          f.micronutrients?.sodium_mg ? Number(f.micronutrients.sodium_mg) : null,
          f.micronutrients ? JSON.stringify(f.micronutrients) : null,
          f.tags ? JSON.stringify(f.tags) : '[]',
          now
        );
      }
    });

    this.logger.log(`Concluída semente de ${foodsData.length} alimentos TACO.`);
  }

  private seedExercises() {
    const count = this.queryOne<{ count: number }>('SELECT COUNT(*) as count FROM exercises');
    if (count && count.count > 0) return;

    this.logger.log('Semeando catálogo oficial de exercícios físicos...');
    const possiblePaths = [
      path.resolve(process.cwd(), 'local-cache', 'exercises.json'),
      path.resolve(__dirname, '..', '..', 'local-cache', 'exercises.json'),
    ];

    let exercisesData: any[] = [];
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        try {
          exercisesData = JSON.parse(fs.readFileSync(p, 'utf8'));
          this.logger.log(`Exercícios carregados de: ${p} (${exercisesData.length} itens)`);
          break;
        } catch (e) {
          this.logger.warn(`Falha ao ler exercícios em ${p}: ${e}`);
        }
      }
    }

    if (exercisesData.length === 0) {
      this.logger.warn('Nenhum arquivo de semente de exercícios encontrado.');
      return;
    }

    const stmt = this.db.prepare(`
      INSERT INTO exercises (
        id, name, muscle_group, equipment, difficulty_level, instructions, is_active, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, 1, ?)
    `);

    const now = new Date().toISOString();
    this.transaction(() => {
      for (const ex of exercisesData) {
        stmt.run(
          ex.id,
          ex.name,
          (ex.muscleGroup || 'GERAL').toUpperCase(),
          ex.equipment || 'Livre',
          ex.difficultyLevel || 'INTERMEDIATE',
          ex.instructions || null,
          ex.createdAt || now
        );
      }
    });

    this.logger.log(`Concluída semente de ${exercisesData.length} exercícios.`);
  }

  exec(sql: string): void {
    this.db.exec(sql);
  }

  query<T = any>(sql: string, params: any[] = []): T[] {
    const stmt = this.db.prepare(sql);
    return stmt.all(...params) as T[];
  }

  queryOne<T = any>(sql: string, params: any[] = []): T | null {
    const stmt = this.db.prepare(sql);
    const result = stmt.get(...params);
    return (result as T) || null;
  }

  run(sql: string, params: any[] = []): RunResult {
    const stmt = this.db.prepare(sql);
    const res = stmt.run(...params);
    return {
      changes: Number(res.changes),
      lastInsertRowid: Number(res.lastInsertRowid),
    };
  }

  transaction<T>(fn: () => T): T {
    this.db.exec('BEGIN TRANSACTION;');
    try {
      const result = fn();
      this.db.exec('COMMIT;');
      return result;
    } catch (err) {
      this.db.exec('ROLLBACK;');
      throw err;
    }
  }

  // Utilitário para testes: cria instância de banco isolado em memória
  static createInMemory(): DatabaseService {
    const service = new DatabaseService();
    (service as any).dbPath = ':memory:';
    service.onModuleInit();
    return service;
  }
}
