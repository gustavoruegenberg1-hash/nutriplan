import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AdminUsersController } from './admin-users.controller';
import { IUserRepository } from '../../../auth/application/ports/user-repository.port';
import { UserEntity } from '../../../auth/domain/entities/user.entity';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';

describe('AdminUsersController', () => {
  let controller: AdminUsersController;
  let mockUserRepo: IUserRepository;

  const adminUser = new UserEntity({
    id: 'admin-1',
    email: 'admin@nutriplan.com',
    name: 'Admin Master',
    role: 'ADMIN',
  });

  const regularUser = new UserEntity({
    id: 'user-2',
    email: 'user@nutriplan.com',
    name: 'User Comum',
    role: 'USER',
  });

  beforeEach(() => {
    mockUserRepo = {
      findById: vi.fn(),
      findByEmail: vi.fn(),
      findAll: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    controller = new AdminUsersController(mockUserRepo);
  });

  describe('listUsers', () => {
    it('should return all users mapped to UserResponseDto', async () => {
      vi.mocked(mockUserRepo.findAll).mockResolvedValue([adminUser, regularUser]);
      const res = await controller.listUsers();
      expect(res).toHaveLength(2);
      expect(res[0].email).toBe('admin@nutriplan.com');
      expect(res[1].email).toBe('user@nutriplan.com');
    });

    it('should filter users by search term', async () => {
      vi.mocked(mockUserRepo.findAll).mockResolvedValue([adminUser, regularUser]);
      const res = await controller.listUsers('Comum');
      expect(res).toHaveLength(1);
      expect(res[0].id).toBe('user-2');
    });

    it('should filter users by role', async () => {
      vi.mocked(mockUserRepo.findAll).mockResolvedValue([adminUser, regularUser]);
      const res = await controller.listUsers(undefined, 'ADMIN');
      expect(res).toHaveLength(1);
      expect(res[0].id).toBe('admin-1');
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      vi.mocked(mockUserRepo.findById).mockResolvedValue(regularUser);
      vi.mocked(mockUserRepo.update).mockResolvedValue(
        new UserEntity({ ...regularUser, name: 'Nome Atualizado' }),
      );

      const res = await controller.updateUser(
        'user-2',
        { name: 'Nome Atualizado' },
        { user: { id: 'admin-1' } },
      );

      expect(res.name).toBe('Nome Atualizado');
      expect(mockUserRepo.update).toHaveBeenCalledWith('user-2', { name: 'Nome Atualizado' });
    });

    it('should prevent admin from revoking their own admin role', async () => {
      vi.mocked(mockUserRepo.findById).mockResolvedValue(adminUser);

      await expect(
        controller.updateUser(
          'admin-1',
          { role: 'USER' },
          { user: { id: 'admin-1' } },
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('banUser', () => {
    it('should ban a user with a reason', async () => {
      vi.mocked(mockUserRepo.findById).mockResolvedValue(regularUser);
      vi.mocked(mockUserRepo.update).mockResolvedValue(
        new UserEntity({ ...regularUser, isBanned: true, banReason: 'Spam' }),
      );

      const res = await controller.banUser(
        'user-2',
        { isBanned: true, reason: 'Spam' },
        { user: { id: 'admin-1' } },
      );

      expect(res.isBanned).toBe(true);
      expect(res.banReason).toBe('Spam');
    });

    it('should prevent admin from banning themselves', async () => {
      vi.mocked(mockUserRepo.findById).mockResolvedValue(adminUser);

      await expect(
        controller.banUser(
          'admin-1',
          { isBanned: true },
          { user: { id: 'admin-1' } },
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('deleteUser', () => {
    it('should delete a user when not self', async () => {
      vi.mocked(mockUserRepo.findById).mockResolvedValue(regularUser);
      vi.mocked(mockUserRepo.delete).mockResolvedValue(true);

      const res = await controller.deleteUser('user-2', { user: { id: 'admin-1' } });
      expect(res.success).toBe(true);
      expect(mockUserRepo.delete).toHaveBeenCalledWith('user-2');
    });

    it('should prevent admin from deleting their own account', async () => {
      vi.mocked(mockUserRepo.findById).mockResolvedValue(adminUser);

      await expect(
        controller.deleteUser('admin-1', { user: { id: 'admin-1' } }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('claimInitialAdmin', () => {
    it('should grant admin role if no other admin exists', async () => {
      vi.mocked(mockUserRepo.findById).mockResolvedValue(regularUser);
      vi.mocked(mockUserRepo.findAll).mockResolvedValue([regularUser]);
      vi.mocked(mockUserRepo.update).mockResolvedValue(
        new UserEntity({ ...regularUser, role: 'ADMIN' }),
      );

      const res = await controller.claimInitialAdmin({ user: { id: 'user-2' } });
      expect(res.success).toBe(true);
      expect(mockUserRepo.update).toHaveBeenCalledWith('user-2', { role: 'ADMIN' });
    });

    it('should reject claim if an admin already exists', async () => {
      vi.mocked(mockUserRepo.findById).mockResolvedValue(regularUser);
      vi.mocked(mockUserRepo.findAll).mockResolvedValue([adminUser, regularUser]);

      await expect(
        controller.claimInitialAdmin({ user: { id: 'user-2' } }),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
