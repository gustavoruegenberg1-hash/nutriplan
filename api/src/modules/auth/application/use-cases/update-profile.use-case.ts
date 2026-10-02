import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IUserRepository } from '../ports/user-repository.port';
import { UpdateProfileDto } from '../../presentation/dto/update-profile.dto';
import { UserResponseDto } from '../../presentation/dto/user-response.dto';

@Injectable()
export class UpdateProfileUseCase {
  constructor(
    @Inject('USER_REPOSITORY')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(userId: string, dto: UpdateProfileDto): Promise<UserResponseDto> {
    const updatedUser = await this.userRepository.update(userId, dto as any);
    return UserResponseDto.fromEntity(updatedUser);
  }
}
