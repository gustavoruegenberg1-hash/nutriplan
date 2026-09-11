import { Injectable, Logger } from '@nestjs/common';
import { IDietPlanRepository } from '../../application/ports/diet-plan-repository.port';
import { DietPlan, DayPlanEntity, MealEntity, MealItemEntity } from '../../domain/entities/diet-plan.entity';
import { FirebaseService } from '../../../../shared/firebase/firebase.service';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FirestoreDietPlanRepository implements IDietPlanRepository {
  private readonly logger = new Logger(FirestoreDietPlanRepository.name);
  private localDietPlans: Map<string, any> = new Map();
  private cacheFilePath: string;

  constructor(private readonly firebase: FirebaseService) {
    this.cacheFilePath = path.resolve(process.cwd(), 'local-cache', 'diet_plans.json');
    this.initCache();
  }

  private initCache() {
    try {
      if (fs.existsSync(this.cacheFilePath)) {
        const raw = fs.readFileSync(this.cacheFilePath, 'utf8');
        const list: any[] = JSON.parse(raw);
        list.forEach((p) => this.localDietPlans.set(p.id, p));
      }
    } catch (err: any) {
      this.logger.warn(`Erro ao carregar diet_plans do cache: ${err.message}`);
    }
  }

  private persistCache() {
    try {
      const list = Array.from(this.localDietPlans.values());
      const cacheDir = path.dirname(this.cacheFilePath);
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
      fs.writeFileSync(this.cacheFilePath, JSON.stringify(list, null, 2), 'utf8');
    } catch (err: any) {
      this.logger.warn(`Erro ao salvar diet_plans no cache: ${err.message}`);
    }
  }

  private get collection() {
    return this.firebase.db.collection('diet_plans');
  }

  private get foodsCollection() {
    return this.firebase.db.collection('foods');
  }

  private async enrichFoods(planData: any): Promise<DietPlan> {
    const days = (planData.days || []).map((d: any) => {
      const meals = (d.meals || []).map((m: any) => {
        const items = (m.items || []).map((i: any) => {
          return new MealItemEntity(
            i.id || uuidv4(),
            i.foodItemId,
            Number(i.quantityGrams) || 100,
            i.foodItem || null
          );
        });
        return new MealEntity(m.id || uuidv4(), m.name, m.timeOfDay || null, items);
      });
      return new DayPlanEntity(d.id || uuidv4(), d.dayOfWeek, meals);
    });

    return new DietPlan(
      planData.id,
      planData.userId,
      planData.name,
      planData.isActive ?? true,
      days,
      planData.createdAt ? new Date(planData.createdAt._seconds ? planData.createdAt._seconds * 1000 : planData.createdAt) : new Date(),
      planData.updatedAt ? new Date(planData.updatedAt._seconds ? planData.updatedAt._seconds * 1000 : planData.updatedAt) : new Date(),
    );
  }

  async findByUserId(userId: string): Promise<DietPlan[]> {
    try {
      const snapshot = await this.collection.where('userId', '==', userId).get();
      if (!snapshot.empty) {
        const plans = await Promise.all(snapshot.docs.map((doc) => this.enrichFoods({ id: doc.id, ...doc.data() })));
        snapshot.docs.forEach((doc) => this.localDietPlans.set(doc.id, { id: doc.id, ...doc.data() }));
        this.persistCache();
        return plans;
      }
    } catch (err: any) {
      this.logger.warn(`Fallback de diet_plans ativado: ${err.message}`);
    }

    const localList = Array.from(this.localDietPlans.values()).filter((p) => p.userId === userId);
    return Promise.all(localList.map((p) => this.enrichFoods(p)));
  }

  async findById(id: string): Promise<DietPlan | null> {
    try {
      const doc = await this.collection.doc(id).get();
      if (doc.exists) {
        const data = { id: doc.id, ...doc.data() };
        this.localDietPlans.set(id, data);
        this.persistCache();
        return this.enrichFoods(data);
      }
    } catch (err: any) {
      this.logger.warn(`Fallback de diet_plan por ID: ${err.message}`);
    }

    const local = this.localDietPlans.get(id);
    return local ? this.enrichFoods(local) : null;
  }

  async create(userId: string, data: any): Promise<DietPlan> {
    const id = data.id || uuidv4();
    const now = new Date();
    const docData = {
      id,
      userId,
      name: data.name,
      isActive: data.isActive ?? true,
      days: data.days || [],
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    try {
      await this.collection.doc(id).set(docData);
    } catch (err: any) {
      this.logger.warn(`Salvando diet_plan no cache local: ${err.message}`);
    }

    this.localDietPlans.set(id, docData);
    this.persistCache();

    return this.enrichFoods(docData);
  }

  async update(id: string, data: any): Promise<DietPlan> {
    const current = this.localDietPlans.get(id) || {};
    const updated = { ...current, ...data, id, updatedAt: new Date().toISOString() };

    try {
      await this.collection.doc(id).set(data, { merge: true });
    } catch (err: any) {
      this.logger.warn(`Atualizando diet_plan no cache local: ${err.message}`);
    }

    this.localDietPlans.set(id, updated);
    this.persistCache();

    return this.enrichFoods(updated);
  }

  async delete(id: string): Promise<void> {
    try {
      await this.collection.doc(id).delete();
    } catch (err: any) {
      this.logger.warn(`Deletando diet_plan no cache local: ${err.message}`);
    }
    this.localDietPlans.delete(id);
    this.persistCache();
  }

  async setActive(id: string, userId: string): Promise<void> {
    const plans = await this.findByUserId(userId);
    for (const p of plans) {
      await this.update(p.id, { isActive: p.id === id });
    }
  }
}
