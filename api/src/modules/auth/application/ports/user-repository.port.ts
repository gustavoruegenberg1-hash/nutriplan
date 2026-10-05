import { UserEntity } from '../../domain/entities/user.entity';

export interface IUserRepository {
  findByEmail(email: string): Promise<UserEntity | null>;
  findById(id: string): Promise<UserEntity | null>;
  findAll(): Promise<UserEntity[]>;
  create(user: Omit<UserEntity, 'id' | 'createdAt' | 'updatedAt' | 'calculateBMR' | 'calculateTDEE'>): Promise<UserEntity>;
  update(id: string, user: Partial<UserEntity>): Promise<UserEntity>;
  delete(id: string): Promise<boolean>;
}
