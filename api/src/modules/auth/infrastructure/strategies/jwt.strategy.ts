import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { IUserRepository } from '../../application/ports/user-repository.port';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject('USER_REPOSITORY')
    private readonly userRepository: IUserRepository,
  ) {
    let jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret && typeof process.loadEnvFile === 'function') {
      try { process.loadEnvFile(); jwtSecret = process.env.JWT_SECRET; } catch {}
    }
    if (!jwtSecret) {
      jwtSecret = 'nutriplan-super-secret-jwt-key-change-in-production';
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: any) {
    if (!payload || !payload.sub) {
      throw new UnauthorizedException('Token inválido.');
    }

    const user = await this.userRepository.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Sessão expirada ou usuário não encontrado.');
    }

    if (user.isBanned) {
      throw new UnauthorizedException(
        user.banReason
          ? `Sua conta foi suspensa pela administração. Motivo: ${user.banReason}`
          : 'Sua conta foi suspensa pela administração.'
      );
    }

    const adminEmails = [
      'gustavoruegenberg1@gmail.com',
      ...(process.env.ADMIN_EMAILS || '')
        .split(',')
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean),
    ];
    let role = user.role || 'USER';
    if (adminEmails.includes(user.email.toLowerCase()) && role !== 'ADMIN') {
      role = 'ADMIN';
      user.role = 'ADMIN';
      await this.userRepository.update(user.id, { role: 'ADMIN' });
    }

    return { id: user.id, email: user.email, role };
  }
}
