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
      throw new UnauthorizedException();
    }

    let user = await this.userRepository.findById(payload.sub);
    if (!user && payload.email) {
      // Se o usuário possui token JWT válido e assinado mas o servidor reiniciou (cache em memória do Render),
      // restaura o usuário para manter a sessão ativa sem deslogar o cliente
      try {
        user = await this.userRepository.create({
          email: payload.email,
          name: payload.email.split('@')[0],
          role: payload.role || 'USER',
          isEmailVerified: true,
          passwordHash: '',
          provider: 'jwt-session',
        } as any);
      } catch {
        return { id: payload.sub, email: payload.email, role: payload.role || 'USER' };
      }
    }

    return { id: payload.sub, email: payload.email, role: payload.role || 'USER' };
  }
}
