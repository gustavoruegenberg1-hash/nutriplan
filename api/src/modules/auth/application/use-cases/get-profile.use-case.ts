import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IUserRepository } from '../ports/user-repository.port';
import { UserResponseDto } from '../../presentation/dto/user-response.dto';

@Injectable()
export class GetProfileUseCase {
  constructor(
    @Inject('USER_REPOSITORY')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(userId: string): Promise<UserResponseDto> {
    let user = await this.userRepository.findById(userId);
    if (!user) {
      user = await this.userRepository.create({
        id: userId,
        email: `user_${userId.slice(0, 8)}@nutriplan.app`,
        name: 'Usuário NutriPlan',
        role: 'USER',
        isEmailVerified: true,
        passwordHash: '',
        provider: 'jwt-session',
      } as any);
    }

    return UserResponseDto.fromEntity(user);
  }
}
