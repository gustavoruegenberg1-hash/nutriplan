import { Injectable, Logger } from '@nestjs/common';
import { IWorkoutRepository } from '../../application/ports/workout-repository.port';
import { Routine, WorkoutDay, ExerciseEntry } from '../../domain/entities/routine.entity';
import { Exercise } from '../../domain/entities/exercise.entity';
import { WorkoutSet } from '../../domain/entities/workout-set.entity';
import { FirebaseService } from '../../../../shared/firebase/firebase.service';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FirestoreWorkoutRepository implements IWorkoutRepository {
  private readonly logger = new Logger(FirestoreWorkoutRepository.name);
  private localRoutines: Map<string, any> = new Map();
  private cacheFilePath: string;

  constructor(private readonly firebase: FirebaseService) {
    this.cacheFilePath = path.resolve(process.cwd(), 'local-cache', 'routines.json');
    this.initCache();
  }

  private initCache() {
    try {
      if (fs.existsSync(this.cacheFilePath)) {
        const raw = fs.readFileSync(this.cacheFilePath, 'utf8');
        const list: any[] = JSON.parse(raw);
        list.forEach((r) => this.localRoutines.set(r.id, r));
      }
    } catch (err: any) {
      this.logger.warn(`Erro ao carregar routines do cache: ${err.message}`);
    }
  }

  private persistCache() {
    try {
      const list = Array.from(this.localRoutines.values());
      const cacheDir = path.dirname(this.cacheFilePath);
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
      fs.writeFileSync(this.cacheFilePath, JSON.stringify(list, null, 2), 'utf8');
    } catch (err: any) {
      this.logger.warn(`Erro ao salvar routines no cache: ${err.message}`);
    }
  }

  private get collection() {
    return this.firebase.db.collection('routines');
  }

  private enrichRoutine(data: any): Routine {
    const rawDays = data.workoutDays || data.days || [];
    const days = rawDays.map((d: any) => {
      const entries = (d.exercises || []).map((e: any) => {
        const exercise = e.exercise
          ? new Exercise(e.exercise.id, e.exercise.name, e.exercise.muscleGroup, e.exercise.equipment || '')
          : new Exercise(e.exerciseId || '', e.exerciseName || 'Exercício', e.muscleGroup || 'CHEST', e.equipment || '');
        const sets = (e.sets || []).map((s: any, sIdx: number) =>
          new WorkoutSet(
            s.id || uuidv4(),
            s.setNumber || sIdx + 1,
            Number(s.reps) || 10,
            s.weightKg !== undefined && s.weightKg !== null ? Number(s.weightKg) : null,
            s.restSeconds !== undefined && s.restSeconds !== null ? Number(s.restSeconds) : 60,
            s.rpe !== undefined && s.rpe !== null ? Number(s.rpe) : null,
          )
        );
        return new ExerciseEntry(e.id || uuidv4(), exercise, e.notes || null, sets);
      });
      return new WorkoutDay(d.id || uuidv4(), d.name, d.dayOfWeek, entries);
    });

    return new Routine(data.id, data.userId, data.name, data.isActive ?? true, days);
  }

  async findByUserId(userId: string): Promise<Routine[]> {
    try {
      const snapshot = await this.collection.where('userId', '==', userId).get();
      if (!snapshot.empty) {
        const list = snapshot.docs.map((doc) => {
          const data = { id: doc.id, ...doc.data() };
          this.localRoutines.set(doc.id, data);
          return this.enrichRoutine(data);
        });
        this.persistCache();
        return list;
      }
    } catch (err: any) {
      this.logger.warn(`Fallback de routines ativado: ${err.message}`);
    }

    const localList = Array.from(this.localRoutines.values()).filter((r) => r.userId === userId);
    return localList.map((r) => this.enrichRoutine(r));
  }

  async findById(id: string): Promise<Routine | null> {
    try {
      const doc = await this.collection.doc(id).get();
      if (doc.exists) {
        const data = { id: doc.id, ...doc.data() };
        this.localRoutines.set(id, data);
        this.persistCache();
        return this.enrichRoutine(data);
      }
    } catch (err: any) {
      this.logger.warn(`Fallback de routine por ID: ${err.message}`);
    }

    const local = this.localRoutines.get(id);
    return local ? this.enrichRoutine(local) : null;
  }

  async create(userId: string, data: any): Promise<Routine> {
    const id = data.id || uuidv4();
    const docData = {
      id,
      userId,
      name: data.name,
      isActive: data.isActive ?? true,
      workoutDays: data.workoutDays || data.days || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await this.collection.doc(id).set(docData);
    } catch (err: any) {
      this.logger.warn(`Salvando routine no cache local: ${err.message}`);
    }

    this.localRoutines.set(id, docData);
    this.persistCache();

    return this.enrichRoutine(docData);
  }

  async update(id: string, data: any): Promise<Routine> {
    const current = this.localRoutines.get(id) || {};
    const updated = { ...current, ...data, id, updatedAt: new Date().toISOString() };

    try {
      await this.collection.doc(id).set(data, { merge: true });
    } catch (err: any) {
      this.logger.warn(`Atualizando routine no cache local: ${err.message}`);
    }

    this.localRoutines.set(id, updated);
    this.persistCache();

    return this.enrichRoutine(updated);
  }

  async delete(id: string): Promise<void> {
    try {
      await this.collection.doc(id).delete();
    } catch (err: any) {
      this.logger.warn(`Deletando routine do cache local: ${err.message}`);
    }
    this.localRoutines.delete(id);
    this.persistCache();
  }

  async deactivateUserRoutines(userId: string): Promise<void> {
    const routines = await this.findByUserId(userId);
    for (const r of routines) {
      if (r.isActive) {
        await this.update(r.id, { isActive: false });
      }
    }
  }
}
