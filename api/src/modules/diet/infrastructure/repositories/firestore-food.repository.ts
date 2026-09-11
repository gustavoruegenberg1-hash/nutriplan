import { Injectable, Logger } from '@nestjs/common';
import { IFoodRepository } from '../../application/ports/food-repository.port';
import { FoodItem } from '../../domain/entities/food-item.entity';
import { FirebaseService } from '../../../../shared/firebase/firebase.service';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FirestoreFoodRepository implements IFoodRepository {
  private readonly logger = new Logger(FirestoreFoodRepository.name);
  private memoryCache: FoodItem[] = [];

  constructor(private readonly firebase: FirebaseService) {
    this.initCache();
  }

  private initCache() {
    try {
      const localPath = path.resolve(process.cwd(), 'local-cache', 'foods.json');
      const exportPath = path.resolve(process.cwd(), 'firebase-export', 'foods.json');
      const targetPath = fs.existsSync(localPath) ? localPath : exportPath;
      if (fs.existsSync(targetPath)) {
        const raw = fs.readFileSync(targetPath, 'utf8');
        const list: any[] = JSON.parse(raw);
        this.memoryCache = list.map((item) => this.mapDoc(item));
        this.logger.log(`Carregados ${this.memoryCache.length} alimentos no cache de segurança.`);
      }
    } catch (err: any) {
      this.logger.warn(`Erro ao carregar alimentos do cache: ${err.message}`);
    }
  }

  private get collection() {
    return this.firebase.db.collection('foods');
  }

  private mapDoc(doc: any): FoodItem {
    const data = typeof doc.data === 'function' ? doc.data() : doc;
    return new FoodItem(
      doc.id || data.id,
      data.name,
      data.brand || null,
      Number(data.caloriesPer100g) || 0,
      Number(data.proteinPer100g) || 0,
      Number(data.carbsPer100g) || 0,
      Number(data.fatPer100g) || 0,
      Number(data.fiberPer100g) || 0,
      data.isVerified ?? true,
      data.createdById || null,
      data.createdAt ? new Date(data.createdAt._seconds ? data.createdAt._seconds * 1000 : data.createdAt) : new Date(),
      data.updatedAt ? new Date(data.updatedAt._seconds ? data.updatedAt._seconds * 1000 : data.updatedAt) : new Date(),
    );
  }

  async search(query: string, limit: number): Promise<FoodItem[]> {
    const cleanQuery = query.toLowerCase().trim();
    if (this.memoryCache.length === 0) {
      try {
        const snapshot = await this.collection.get();
        if (!snapshot.empty) {
          this.memoryCache = snapshot.docs.map((d) => this.mapDoc(d));
        }
      } catch (err: any) {
        this.logger.warn(`Fallback de busca de alimentos ativado: ${err.message}`);
      }
    }

    return this.memoryCache
      .filter((item) => !cleanQuery || item.name.toLowerCase().includes(cleanQuery))
      .slice(0, limit);
  }

  async findById(id: string): Promise<FoodItem | null> {
    try {
      const doc = await this.collection.doc(id).get();
      if (doc.exists) return this.mapDoc(doc);
    } catch (err: any) {
      this.logger.warn(`Fallback de alimento por ID: ${err.message}`);
    }
    return this.memoryCache.find((f) => f.id === id) || null;
  }

  async findByIds(ids: string[]): Promise<FoodItem[]> {
    if (!ids || ids.length === 0) return [];
    try {
      const snapshot = await this.collection.get();
      if (!snapshot.empty) {
        this.memoryCache = snapshot.docs.map((d) => this.mapDoc(d));
      }
    } catch (err: any) {
      this.logger.warn(`Fallback de alimentos por IDs: ${err.message}`);
    }
    const idSet = new Set(ids);
    return this.memoryCache.filter((d) => idSet.has(d.id));
  }

  async create(data: any): Promise<FoodItem> {
    const id = data.id || uuidv4();
    const now = new Date();
    const item = {
      id,
      name: data.name,
      brand: data.brand || null,
      caloriesPer100g: Number(data.caloriesPer100g) || 0,
      proteinPer100g: Number(data.proteinPer100g) || 0,
      carbsPer100g: Number(data.carbsPer100g) || 0,
      fatPer100g: Number(data.fatPer100g) || 0,
      fiberPer100g: Number(data.fiberPer100g) || 0,
      isVerified: data.isVerified ?? true,
      createdById: data.createdById || null,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    try {
      await this.collection.doc(id).set(item);
    } catch {
      this.logger.warn(`Salvando alimento em cache local`);
    }

    const created = this.mapDoc(item);
    this.memoryCache.push(created);
    return created;
  }

  async update(id: string, data: any): Promise<FoodItem> {
    try {
      await this.collection.doc(id).set(data, { merge: true });
    } catch {
      this.logger.warn(`Atualizando alimento em cache local`);
    }
    return (await this.findById(id))!;
  }

  async delete(id: string): Promise<void> {
    try {
      await this.collection.doc(id).delete();
    } catch {
      this.logger.warn(`Deletando alimento do cache local`);
    }
    this.memoryCache = this.memoryCache.filter((f) => f.id !== id);
  }
}
