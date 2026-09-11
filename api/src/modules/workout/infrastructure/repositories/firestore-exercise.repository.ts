import { Injectable, Logger } from '@nestjs/common';
import { IExerciseRepository } from '../../application/ports/exercise-repository.port';
import { Exercise } from '../../domain/entities/exercise.entity';
import { FirebaseService } from '../../../../shared/firebase/firebase.service';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FirestoreExerciseRepository implements IExerciseRepository {
  private readonly logger = new Logger(FirestoreExerciseRepository.name);
  private memoryCache: Exercise[] = [];

  constructor(private readonly firebase: FirebaseService) {
    this.initCache();
  }

  private initCache() {
    try {
      const localPath = path.resolve(process.cwd(), 'local-cache', 'exercises.json');
      const exportPath = path.resolve(process.cwd(), 'firebase-export', 'exercises.json');
      const targetPath = fs.existsSync(localPath) ? localPath : exportPath;
      if (fs.existsSync(targetPath)) {
        const raw = fs.readFileSync(targetPath, 'utf8');
        const list: any[] = JSON.parse(raw);
        this.memoryCache = list.map((e) => this.mapDoc(e));
        this.logger.log(`Carregados ${this.memoryCache.length} exercícios no cache de segurança.`);
      }
    } catch (err: any) {
      this.logger.warn(`Erro ao carregar exercícios do cache: ${err.message}`);
    }
  }

  private get collection() {
    return this.firebase.db.collection('exercises');
  }

  private mapDoc(doc: any): Exercise {
    const data = typeof doc.data === 'function' ? doc.data() : doc;
    return new Exercise(doc.id || data.id, data.name, data.muscleGroup, data.equipment || '');
  }

  async findAll(): Promise<Exercise[]> {
    if (this.memoryCache.length === 0) {
      try {
        const snapshot = await this.collection.get();
        if (!snapshot.empty) {
          this.memoryCache = snapshot.docs.map((doc) => this.mapDoc(doc));
        }
      } catch (err: any) {
        this.logger.warn(`Fallback de exercícios ativado: ${err.message}`);
      }
    }
    return this.memoryCache;
  }

  async findById(id: string): Promise<Exercise | null> {
    try {
      const doc = await this.collection.doc(id).get();
      if (doc.exists) return this.mapDoc(doc);
    } catch (err: any) {
      this.logger.warn(`Fallback de exercício por ID: ${err.message}`);
    }
    return this.memoryCache.find((e) => e.id === id) || null;
  }

  async findByMuscleGroup(muscleGroup: string): Promise<Exercise[]> {
    const groupUpper = muscleGroup.toUpperCase();
    try {
      const snapshot = await this.collection.where('muscleGroup', '==', groupUpper).get();
      if (!snapshot.empty) {
        return snapshot.docs.map((doc) => this.mapDoc(doc));
      }
    } catch (err: any) {
      this.logger.warn(`Fallback de exercício por grupo muscular: ${err.message}`);
    }
    return this.memoryCache.filter((e) => e.muscleGroup.toUpperCase() === groupUpper);
  }

  async search(query: string): Promise<Exercise[]> {
    const cleanQuery = query.toLowerCase().trim();
    try {
      const snapshot = await this.collection.get();
      if (!snapshot.empty) {
        this.memoryCache = snapshot.docs.map((doc) => this.mapDoc(doc));
      }
    } catch (err: any) {
      this.logger.warn(`Fallback de busca de exercício: ${err.message}`);
    }
    return this.memoryCache.filter((e) => e.name.toLowerCase().includes(cleanQuery));
  }

  async create(data: any): Promise<Exercise> {
    const id = data.id || uuidv4();
    const docData = {
      id,
      name: data.name,
      muscleGroup: (data.muscleGroup || 'FULL_BODY').toUpperCase(),
      equipment: data.equipment || null,
      createdAt: new Date().toISOString(),
    };

    try {
      await this.collection.doc(id).set(docData);
    } catch {
      this.logger.warn(`Salvando exercício em cache local`);
    }

    const created = new Exercise(id, docData.name, docData.muscleGroup, docData.equipment || '');
    this.memoryCache.push(created);
    return created;
  }
}
