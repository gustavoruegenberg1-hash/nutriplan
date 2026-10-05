import { Injectable, Inject, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { IUserRepository } from '../ports/user-repository.port';
import { LoginDto } from '../../presentation/dto/login.dto';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject('USER_REPOSITORY')
    private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(dto: LoginDto): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Credenciais inválidas. Verifique seu e-mail e senha.');
    }

    try {
      const isPasswordValid = await argon2.verify(user.passwordHash, dto.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Credenciais inválidas. Verifique seu e-mail e senha.');
      }
    } catch (err: any) {
      if (err instanceof UnauthorizedException) throw err;
      throw new UnauthorizedException('Credenciais inválidas. Verifique seu e-mail e senha.');
    }

    if (user.isBanned) {
      throw new ForbiddenException(
        user.banReason
          ? `Sua conta foi suspensa pela administração. Motivo: ${user.banReason}`
          : 'Sua conta foi suspensa pela administração.'
      );
    }

    // Auto-promoção caso o email seja do administrador ou esteja configurado em ADMIN_EMAILS
    const adminEmails = [
      'gustavoruegenberg1@gmail.com',
      ...(process.env.ADMIN_EMAILS || '')
        .split(',')
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean),
    ];
    if (adminEmails.includes(user.email.toLowerCase()) && user.role !== 'ADMIN') {
      user.role = 'ADMIN';
      await this.userRepository.update(user.id, { role: 'ADMIN' });
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = await this.jwtService.signAsync(payload, { expiresIn: '30d' });
    const refreshToken = await this.jwtService.signAsync(payload, { expiresIn: '90d' });

    return {
      accessToken,
      refreshToken,
    };
  }
}
