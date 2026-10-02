import { Injectable, Inject, ConflictException } from '@nestjs/common';
import { IUserRepository } from '../ports/user-repository.port';
import { RegisterDto } from '../../presentation/dto/register.dto';
import * as argon2 from 'argon2';
import { UserResponseDto } from '../../presentation/dto/user-response.dto';
import { MailService } from '../../../../shared/mail/mail.service';

@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject('USER_REPOSITORY')
    private readonly userRepository: IUserRepository,
    private readonly mailService: MailService,
  ) {}

  async execute(dto: RegisterDto): Promise<UserResponseDto & { requiresVerification: boolean }> {
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('Este e-mail já está cadastrado no sistema.');
    }

    const passwordHash = await argon2.hash(dto.password);
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationCodeExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

    const user = await this.userRepository.create({
      email: dto.email,
      passwordHash,
      name: dto.name,
      role: 'USER',
      isEmailVerified: false,
      verificationCode,
      verificationCodeExpiresAt,
      provider: 'local',
      weight: null,
      height: null,
      age: null,
      gender: null,
      activityLevel: null,
      goal: null,
    });

    // Dispara envio do e-mail de verificação
    await this.mailService.sendVerificationEmail(user.email, user.name, verificationCode);

    const resDto = UserResponseDto.fromEntity(user);
    return {
      ...resDto,
      requiresVerification: true,
    };
  }
}
