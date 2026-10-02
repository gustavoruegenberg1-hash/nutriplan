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
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    return UserResponseDto.fromEntity(user);
  }
}
