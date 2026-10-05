import { Injectable, Inject, Optional, ConflictException } from '@nestjs/common';
import { IUserRepository } from '../ports/user-repository.port';
import { RegisterDto } from '../../presentation/dto/register.dto';
import * as argon2 from 'argon2';
import { UserResponseDto } from '../../presentation/dto/user-response.dto';
import { MailService } from '../../../../shared/mail/mail.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject('USER_REPOSITORY')
    private readonly userRepository: IUserRepository,
    private readonly mailService: MailService,
    @Optional()
    private readonly jwtService?: JwtService,
  ) {}

  async execute(dto: RegisterDto): Promise<
    UserResponseDto & {
      requiresVerification: boolean;
      accessToken?: string;
      refreshToken?: string;
    }
  > {
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
    const emailSent = await this.mailService.sendVerificationEmail(user.email, user.name, verificationCode);

    // Se o serviço de e-mail não estiver configurado ou falhar no envio, auto-valida para não travar o usuário
    if (!emailSent) {
      await this.userRepository.update(user.id, {
        isEmailVerified: true,
        verificationCode: null,
        verificationCodeExpiresAt: null,
      });
      user.isEmailVerified = true;
    }

    let accessToken: string | undefined;
    let refreshToken: string | undefined;
    if (this.jwtService) {
      const payload = { sub: user.id, email: user.email, role: user.role };
      accessToken = await this.jwtService.signAsync(payload, { expiresIn: '30d' });
      refreshToken = await this.jwtService.signAsync(payload, { expiresIn: '90d' });
    }

    const resDto = UserResponseDto.fromEntity(user);
    return {
      ...resDto,
      accessToken,
      refreshToken,
      requiresVerification: !user.isEmailVerified,
    };
  }
}
