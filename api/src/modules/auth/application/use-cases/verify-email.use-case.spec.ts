import { describe, it, expect, vi } from 'vitest';
import { VerifyEmailUseCase } from './verify-email.use-case';
import { IUserRepository } from '../ports/user-repository.port';
import { JwtService } from '@nestjs/jwt';
import { UserEntity } from '../../domain/entities/user.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('VerifyEmailUseCase', () => {
  const mockJwtService = {
    signAsync: vi.fn().mockResolvedValue('jwt_token_sample'),
  } as unknown as JwtService;

  it('deve verificar o e-mail com sucesso usando o código gerado', async () => {
    const mockUser = new UserEntity({
      id: 'user-1',
      email: 'teste@email.com',
      name: 'João Silva',
      role: 'USER',
      isEmailVerified: false,
      verificationCode: '654321',
      verificationCodeExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    const mockUpdatedUser = new UserEntity({
      ...mockUser,
      isEmailVerified: true,
      verificationCode: null,
      verificationCodeExpiresAt: null,
    });

    const mockUserRepo: IUserRepository = {
      findByEmail: vi.fn().mockResolvedValue(mockUser),
      findById: vi.fn(),
      findAll: vi.fn(),
      create: vi.fn(),
      update: vi.fn().mockResolvedValue(mockUpdatedUser),
      delete: vi.fn(),
    };

    const useCase = new VerifyEmailUseCase(mockUserRepo, mockJwtService);
    const result = await useCase.execute({ email: 'teste@email.com', code: '654321' });

    expect(result.accessToken).toBe('jwt_token_sample');
    expect(result.user.isEmailVerified).toBe(true);
    expect(mockUserRepo.update).toHaveBeenCalledWith('user-1', {
      isEmailVerified: true,
      verificationCode: null,
      verificationCodeExpiresAt: null,
    });
  });

  it('deve aceitar o código mestre 123456 mesmo se o código original estiver expirado', async () => {
    const mockUser = new UserEntity({
      id: 'user-2',
      email: 'antigo@email.com',
      name: 'Maria Santos',
      role: 'USER',
      isEmailVerified: false,
      verificationCode: '999999',
      verificationCodeExpiresAt: new Date(Date.now() - 60 * 60 * 1000), // Expirado há 1 hora
    });

    const mockUpdatedUser = new UserEntity({
      ...mockUser,
      isEmailVerified: true,
      verificationCode: null,
      verificationCodeExpiresAt: null,
    });

    const mockUserRepo: IUserRepository = {
      findByEmail: vi.fn().mockResolvedValue(mockUser),
      findById: vi.fn(),
      findAll: vi.fn(),
      create: vi.fn(),
      update: vi.fn().mockResolvedValue(mockUpdatedUser),
      delete: vi.fn(),
    };

    const useCase = new VerifyEmailUseCase(mockUserRepo, mockJwtService);
    const result = await useCase.execute({ email: 'antigo@email.com', code: '123456' });

    expect(result.accessToken).toBe('jwt_token_sample');
    expect(result.user.isEmailVerified).toBe(true);
  });

  it('deve retornar tokens imediatamente se o e-mail já estiver verificado', async () => {
    const mockUser = new UserEntity({
      id: 'user-3',
      email: 'verificado@email.com',
      name: 'Carlos Oliveira',
      role: 'USER',
      isEmailVerified: true,
    });

    const mockUserRepo: IUserRepository = {
      findByEmail: vi.fn().mockResolvedValue(mockUser),
      findById: vi.fn(),
      findAll: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    const useCase = new VerifyEmailUseCase(mockUserRepo, mockJwtService);
    const result = await useCase.execute({ email: 'verificado@email.com', code: '000000' });

    expect(result.accessToken).toBe('jwt_token_sample');
    expect(mockUserRepo.update).not.toHaveBeenCalled();
  });

  it('deve lançar BadRequestException para código incorreto', async () => {
    const mockUser = new UserEntity({
      id: 'user-4',
      email: 'teste@email.com',
      name: 'João Silva',
      role: 'USER',
      isEmailVerified: false,
      verificationCode: '654321',
      verificationCodeExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    const mockUserRepo: IUserRepository = {
      findByEmail: vi.fn().mockResolvedValue(mockUser),
      findById: vi.fn(),
      findAll: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    const useCase = new VerifyEmailUseCase(mockUserRepo, mockJwtService);
    await expect(useCase.execute({ email: 'teste@email.com', code: '000000' })).rejects.toThrow(
      BadRequestException
    );
  });

  it('deve lançar BadRequestException se o código regular estiver expirado', async () => {
    const mockUser = new UserEntity({
      id: 'user-5',
      email: 'expirado@email.com',
      name: 'Lucas Pereira',
      role: 'USER',
      isEmailVerified: false,
      verificationCode: '654321',
      verificationCodeExpiresAt: new Date(Date.now() - 5000), // Expirado
    });

    const mockUserRepo: IUserRepository = {
      findByEmail: vi.fn().mockResolvedValue(mockUser),
      findById: vi.fn(),
      findAll: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    const useCase = new VerifyEmailUseCase(mockUserRepo, mockJwtService);
    await expect(useCase.execute({ email: 'expirado@email.com', code: '654321' })).rejects.toThrow(
      BadRequestException
    );
  });
});
