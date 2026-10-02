import { Injectable, Logger } from '@nestjs/common';
import { IUserRepository } from '../../application/ports/user-repository.port';
import { FirebaseService } from '../../../../shared/firebase/firebase.service';
import { UserEntity } from '../../domain/entities/user.entity';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FirestoreUserRepository implements IUserRepository {
  private readonly logger = new Logger(FirestoreUserRepository.name);
  private localUsersMap: Map<string, any> = new Map();
  private cacheFilePath: string;

  constructor(private readonly firebase: FirebaseService) {
    this.cacheFilePath = path.resolve(process.cwd(), 'local-cache', 'users.json');
    this.initLocalCache();
  }

  private initLocalCache() {
    try {
      const cacheDir = path.dirname(this.cacheFilePath);
      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
      }

      if (fs.existsSync(this.cacheFilePath)) {
        const raw = fs.readFileSync(this.cacheFilePath, 'utf8');
        const list: any[] = JSON.parse(raw);
        list.forEach((u) => {
          this.localUsersMap.set(u.id, u);
          if (u.email) this.localUsersMap.set(u.email.toLowerCase(), u);
        });
        this.logger.log(`Carregados ${list.length} usuários do cache local de segurança.`);
      } else {
        // Tenta ler do firebase-export se existir
        const exportPath = path.resolve(process.cwd(), 'firebase-export', 'users.json');
        if (fs.existsSync(exportPath)) {
          const raw = fs.readFileSync(exportPath, 'utf8');
          const list: any[] = JSON.parse(raw);
          list.forEach((u) => {
            this.localUsersMap.set(u.id, u);
            if (u.email) this.localUsersMap.set(u.email.toLowerCase(), u);
          });
          this.persistCache();
        }
      }
    } catch (err: any) {
      this.logger.warn(`Erro ao inicializar cache local de usuários: ${err.message}`);
    }
  }

  private persistCache() {
    try {
      const uniqueUsers = Array.from(new Set(this.localUsersMap.values()));
      fs.writeFileSync(this.cacheFilePath, JSON.stringify(uniqueUsers, null, 2), 'utf8');
    } catch (err: any) {
      this.logger.warn(`Erro ao persistir cache de usuários: ${err.message}`);
    }
  }

  private get collection() {
    return this.firebase.db.collection('users');
  }

  private mapDoc(doc: any): UserEntity {
    const data = typeof doc.data === 'function' ? doc.data() : doc;
    return new UserEntity({
      id: doc.id || data.id,
      email: data.email,
      passwordHash: data.passwordHash,
      name: data.name,
      weight: data.weight !== undefined && data.weight !== null ? Number(data.weight) : null,
      height: data.height !== undefined && data.height !== null ? Number(data.height) : null,
      age: data.age || null,
      gender: data.gender || null,
      activityLevel: data.activityLevel || null,
      goal: data.goal || null,
      role: data.role || 'USER',
      isEmailVerified: data.isEmailVerified ?? false,
      verificationCode: data.verificationCode || null,
      verificationCodeExpiresAt: data.verificationCodeExpiresAt || null,
      provider: data.provider || 'local',
      avatarUrl: data.avatarUrl || null,
      createdAt: data.createdAt ? new Date(data.createdAt._seconds ? data.createdAt._seconds * 1000 : data.createdAt) : new Date(),
      updatedAt: data.updatedAt ? new Date(data.updatedAt._seconds ? data.updatedAt._seconds * 1000 : data.updatedAt) : new Date(),

      // Alergias e Restrições Alimentares
      hasFoodAllergies: data.hasFoodAllergies ?? null,
      allergies: data.allergies || [],
      hasFoodIntolerances: data.hasFoodIntolerances ?? null,
      intolerances: data.intolerances || [],
      needsProfessionalSupervision: data.needsProfessionalSupervision || null,
      dietaryRestrictionsNotes: data.dietaryRestrictionsNotes || null,

      // Avaliação Física e Exercícios
      experienceLevel: data.experienceLevel || null,
      trainingFrequencyDays: data.trainingFrequencyDays !== undefined ? Number(data.trainingFrequencyDays) : null,
      weightTrainingExperience: data.weightTrainingExperience || null,
      weightTrainingTimeMonths: data.weightTrainingTimeMonths !== undefined ? Number(data.weightTrainingTimeMonths) : null,
      hasPhysicalDisabilities: data.hasPhysicalDisabilities || null,
      affectedBodyRegions: data.affectedBodyRegions || [],
      physicalDisabilityNotes: data.physicalDisabilityNotes || null,
      hasMuscleInjuries: data.hasMuscleInjuries || null,
      affectedMuscles: data.affectedMuscles || [],
      hasJointPain: data.hasJointPain || null,
      affectedJoints: data.affectedJoints || [],
      jointPainNotes: data.jointPainNotes || null,
      hasExercisePain: data.hasExercisePain || null,
      painDetails: data.painDetails || [],
      difficultMovements: data.difficultMovements || [],
      exercisesToAvoid: data.exercisesToAvoid || [],
      availableEquipment: data.availableEquipment || [],
      readArticles: data.readArticles || [],
    });
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const normEmail = email.toLowerCase().trim();
    try {
      const snapshot = await this.collection.where('email', '==', email).limit(1).get();
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        const entity = this.mapDoc(doc);
        const data = doc.data();
        this.localUsersMap.set(entity.id, data);
        this.localUsersMap.set(normEmail, data);
        this.persistCache();
        return entity;
      }
    } catch (err: any) {
      this.logger.warn(`Firestore indisponível para findByEmail (${err.message}). Consultando cache local...`);
    }

    const cached = this.localUsersMap.get(normEmail);
    if (cached) {
      return this.mapDoc(cached);
    }
    return null;
  }

  async findById(id: string): Promise<UserEntity | null> {
    try {
      const doc = await this.collection.doc(id).get();
      if (doc.exists) {
        const entity = this.mapDoc(doc);
        const data = doc.data()!;
        this.localUsersMap.set(id, data);
        if (data.email) this.localUsersMap.set(data.email.toLowerCase(), data);
        this.persistCache();
        return entity;
      }
    } catch (err: any) {
      this.logger.warn(`Firestore indisponível para findById (${err.message}). Consultando cache local...`);
    }

    const cached = this.localUsersMap.get(id);
    if (cached) {
      return this.mapDoc(cached);
    }
    return null;
  }

  async create(userData: Omit<UserEntity, 'id' | 'createdAt' | 'updatedAt' | 'calculateBMR' | 'calculateTDEE'>): Promise<UserEntity> {
    const id = uuidv4();
    const now = new Date();

    const dataToSave = {
      id,
      email: userData.email,
      passwordHash: userData.passwordHash,
      name: userData.name,
      weight: userData.weight !== null && userData.weight !== undefined ? Number(userData.weight) : null,
      height: userData.height !== null && userData.height !== undefined ? Number(userData.height) : null,
      age: userData.age || null,
      gender: userData.gender ? userData.gender.toUpperCase() : null,
      activityLevel: userData.activityLevel ? userData.activityLevel.toUpperCase() : null,
      goal: userData.goal ? userData.goal.toUpperCase() : null,
      role: userData.role ? userData.role.toUpperCase() : 'USER',
      isEmailVerified: userData.isEmailVerified ?? false,
      verificationCode: userData.verificationCode || null,
      verificationCodeExpiresAt: userData.verificationCodeExpiresAt || null,
      provider: userData.provider || 'local',
      avatarUrl: userData.avatarUrl || null,

      hasFoodAllergies: userData.hasFoodAllergies ?? null,
      allergies: userData.allergies || [],
      hasFoodIntolerances: userData.hasFoodIntolerances ?? null,
      intolerances: userData.intolerances || [],
      needsProfessionalSupervision: userData.needsProfessionalSupervision || null,
      dietaryRestrictionsNotes: userData.dietaryRestrictionsNotes || null,

      experienceLevel: userData.experienceLevel || null,
      trainingFrequencyDays: userData.trainingFrequencyDays || null,
      weightTrainingExperience: userData.weightTrainingExperience || null,
      weightTrainingTimeMonths: userData.weightTrainingTimeMonths || null,
      hasPhysicalDisabilities: userData.hasPhysicalDisabilities || null,
      affectedBodyRegions: userData.affectedBodyRegions || [],
      physicalDisabilityNotes: userData.physicalDisabilityNotes || null,
      hasMuscleInjuries: userData.hasMuscleInjuries || null,
      affectedMuscles: userData.affectedMuscles || [],
      hasJointPain: userData.hasJointPain || null,
      affectedJoints: userData.affectedJoints || [],
      jointPainNotes: userData.jointPainNotes || null,
      hasExercisePain: userData.hasExercisePain || null,
      painDetails: userData.painDetails || [],
      difficultMovements: userData.difficultMovements || [],
      exercisesToAvoid: userData.exercisesToAvoid || [],
      availableEquipment: userData.availableEquipment || [],
      readArticles: userData.readArticles || [],

      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    try {
      await this.collection.doc(id).set(dataToSave);
    } catch (err: any) {
      this.logger.warn(`Salvando novo usuário no cache local de segurança: ${err.message}`);
    }

    this.localUsersMap.set(id, dataToSave);
    if (dataToSave.email) this.localUsersMap.set(dataToSave.email.toLowerCase(), dataToSave);
    this.persistCache();

    return this.mapDoc(dataToSave);
  }

  async update(id: string, userData: Partial<UserEntity>): Promise<UserEntity> {
    const current = (await this.findById(id)) || new UserEntity({ id });
    const updateData: any = { ...userData };
    delete updateData.id;
    delete updateData.createdAt;
    delete updateData.calculateBMR;
    delete updateData.calculateTDEE;

    if (updateData.gender !== undefined) {
      updateData.gender = updateData.gender ? updateData.gender.toUpperCase() : null;
    }
    if (updateData.activityLevel !== undefined) {
      updateData.activityLevel = updateData.activityLevel ? updateData.activityLevel.toUpperCase() : null;
    }
    if (updateData.goal !== undefined) {
      updateData.goal = updateData.goal ? updateData.goal.toUpperCase() : null;
    }

    updateData.updatedAt = new Date().toISOString();

    const merged = { ...current, ...updateData, id };

    try {
      await this.collection.doc(id).set(updateData, { merge: true });
    } catch (err: any) {
      this.logger.warn(`Atualizando usuário no cache local: ${err.message}`);
    }

    this.localUsersMap.set(id, merged);
    if (merged.email) this.localUsersMap.set(merged.email.toLowerCase(), merged);
    this.persistCache();

    return this.mapDoc(merged);
  }
}
