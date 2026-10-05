import { describe, it, expect, vi } from 'vitest';
import { LoginUseCase } from './login.use-case';
import { IUserRepository } from '../ports/user-repository.port';
import { JwtService } from '@nestjs/jwt';
import { UserEntity } from '../../domain/entities/user.entity';
import { UnauthorizedException } from '@nestjs/common';
import * as argon2 from 'argon2';

describe('LoginUseCase', () => {
  it('should authenticate user and return access token when credentials are valid', async () => {
    const hashedPassword = await argon2.hash('senha123');
    const mockUser = new UserEntity({
      id: 'user-1',
      email: 'teste@email.com',
      passwordHash: hashedPassword,
      name: 'João Silva',
      role: 'USER',
    });

    const mockUserRepo: IUserRepository = {
      findByEmail: vi.fn().mockResolvedValue(mockUser),
      findById: vi.fn(),
      findAll: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    const mockJwtService = {
      signAsync: vi.fn().mockResolvedValue('jwt_token_sample'),
    } as unknown as JwtService;

    const useCase = new LoginUseCase(mockUserRepo, mockJwtService);
    const result = await useCase.execute({ email: 'teste@email.com', password: 'senha123' });

    expect(result.accessToken).toBe('jwt_token_sample');
    expect(result.refreshToken).toBe('jwt_token_sample');
  });

  it('should throw UnauthorizedException if password does not match', async () => {
    const hashedPassword = await argon2.hash('senhaCorreta');
    const mockUser = new UserEntity({
      id: 'user-1',
      email: 'teste@email.com',
      passwordHash: hashedPassword,
      name: 'João Silva',
      role: 'USER',
    });

    const mockUserRepo: IUserRepository = {
      findByEmail: vi.fn().mockResolvedValue(mockUser),
      findById: vi.fn(),
      findAll: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    const mockJwtService = {
      signAsync: vi.fn(),
    } as unknown as JwtService;

    const useCase = new LoginUseCase(mockUserRepo, mockJwtService);

    await expect(
      useCase.execute({ email: 'teste@email.com', password: 'senhaIncorreta' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should throw ForbiddenException if user is banned', async () => {
    const hashedPassword = await argon2.hash('senha123');
    const mockBannedUser = new UserEntity({
      id: 'user-banned',
      email: 'banido@email.com',
      passwordHash: hashedPassword,
      name: 'Usuário Banido',
      role: 'USER',
      isBanned: true,
      banReason: 'Violação dos termos de uso',
    });

    const mockUserRepo: IUserRepository = {
      findByEmail: vi.fn().mockResolvedValue(mockBannedUser),
      findById: vi.fn(),
      findAll: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    const mockJwtService = {
      signAsync: vi.fn(),
    } as unknown as JwtService;

    const useCase = new LoginUseCase(mockUserRepo, mockJwtService);

    await expect(
      useCase.execute({ email: 'banido@email.com', password: 'senha123' }),
    ).rejects.toThrow('Sua conta foi suspensa pela administração.');
  });
});
