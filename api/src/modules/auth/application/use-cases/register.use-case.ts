import { Injectable, Inject, ConflictException } from '@nestjs/common';
import { IUserRepository } from '../ports/user-repository.port';
import { RegisterDto } from '../../presentation/dto/register.dto';
import * as argon2 from 'argon2';
import { UserResponseDto } from '../../presentation/dto/user-response.dto';

@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject('USER_REPOSITORY')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(dto: RegisterDto): Promise<UserResponseDto> {
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('Este e-mail já está cadastrado no sistema.');
    }

    const passwordHash = await argon2.hash(dto.password);

    const user = await this.userRepository.create({
      email: dto.email,
      passwordHash,
      name: dto.name,
      role: 'USER',
      weight: null,
      height: null,
      age: null,
      gender: null,
      activityLevel: null,
      goal: null,
    });

    return UserResponseDto.fromEntity(user);
  }
}
