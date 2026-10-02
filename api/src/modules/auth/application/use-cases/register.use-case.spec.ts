import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RegisterUseCase } from './register.use-case';
import { ConflictException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { UserEntity } from '../../domain/entities/user.entity';

vi.mock('argon2');

describe('RegisterUseCase', () => {
  let useCase: RegisterUseCase;
  let mockUserRepository: any;
  let mockMailService: any;

  beforeEach(() => {
    mockUserRepository = {
      findByEmail: vi.fn(),
      create: vi.fn(),
    };
    mockMailService = {
      sendVerificationEmail: vi.fn().mockResolvedValue(true),
    };
    useCase = new RegisterUseCase(mockUserRepository, mockMailService);
    vi.mocked(argon2.hash).mockResolvedValue('hashed_password');
  });

  it('should successfully register a new user', async () => {
    mockUserRepository.findByEmail.mockResolvedValue(null);
    const mockUserEntity = new UserEntity({
      id: '123',
      email: 'test@test.com',
      name: 'Test',
      role: 'USER',
      calculateBMR: () => null,
      calculateTDEE: () => null,
    });
    mockUserRepository.create.mockResolvedValue(mockUserEntity);

    const result = await useCase.execute({
      email: 'test@test.com',
      password: 'password',
      name: 'Test',
    });

    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('test@test.com');
    expect(argon2.hash).toHaveBeenCalledWith('password');
    expect(mockUserRepository.create).toHaveBeenCalled();
    expect(result.email).toBe('test@test.com');
  });

  it('should throw ConflictException if email already in use', async () => {
    mockUserRepository.findByEmail.mockResolvedValue(new UserEntity({}));

    await expect(useCase.execute({
      email: 'test@test.com',
      password: 'password',
      name: 'Test',
    })).rejects.toThrow(ConflictException);
    
    expect(mockUserRepository.create).not.toHaveBeenCalled();
  });
});
