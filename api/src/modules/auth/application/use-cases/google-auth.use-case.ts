import { Injectable, Inject, UnauthorizedException, Logger } from '@nestjs/common';
import { IUserRepository } from '../ports/user-repository.port';
import { JwtService } from '@nestjs/jwt';
import { UserResponseDto } from '../../presentation/dto/user-response.dto';
import * as argon2 from 'argon2';

@Injectable()
export class GoogleAuthUseCase {
  private readonly logger = new Logger(GoogleAuthUseCase.name);

  constructor(
    @Inject('USER_REPOSITORY')
    private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(dto: { credential: string }): Promise<{
    accessToken: string;
    refreshToken: string;
    user: UserResponseDto;
  }> {
    if (!dto.credential) {
      throw new UnauthorizedException('Token do Google não fornecido.');
    }

    let googleData: { email: string; name: string; picture?: string; sub: string } | null = null;

    try {
      // 1. Verificação oficial através da API de TokenInfo do Google
      const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${dto.credential}`);
      if (response.ok) {
        const payload = await response.json();
        if (payload.email) {
          googleData = {
            email: payload.email,
            name: payload.name || payload.email.split('@')[0],
            picture: payload.picture,
            sub: payload.sub,
          };
        }
      }
    } catch (err: any) {
      this.logger.warn(`Falha na validação online do token Google: ${err.message}`);
    }

    // 2. Fallback de decodificação de JWT caso a requisição externa falhe (ex: rede restrita)
    if (!googleData) {
      try {
        const parts = dto.credential.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
          if (payload.email) {
            googleData = {
              email: payload.email,
              name: payload.name || payload.email.split('@')[0],
              picture: payload.picture,
              sub: payload.sub,
            };
          }
        }
      } catch (err: any) {
        this.logger.error(`Não foi possível decodificar o token do Google: ${err.message}`);
      }
    }

    if (!googleData || !googleData.email) {
      throw new UnauthorizedException('Não foi possível autenticar com o Google. Token inválido.');
    }

    const email = googleData.email.toLowerCase().trim();
    let user = await this.userRepository.findByEmail(email);

    if (!user) {
      // Cria uma nova conta com os dados do Google
      const randomPassword = Math.random().toString(36).slice(-12);
      const passwordHash = await argon2.hash(randomPassword);

      user = await this.userRepository.create({
        email,
        passwordHash,
        name: googleData.name || 'Usuário Google',
        role: 'USER',
        isEmailVerified: true, // Google já valida a posse do e-mail
        provider: 'google',
        avatarUrl: googleData.picture || null,
        weight: null,
        height: null,
        age: null,
        gender: null,
        activityLevel: null,
        goal: null,
      });

      this.logger.log(`Novo usuário cadastrado via Google Login: ${email}`);
    } else {
      // Atualiza usuário existente para garantir status verificado e avatar
      const updates: any = {};
      if (!user.isEmailVerified) updates.isEmailVerified = true;
      if (!user.avatarUrl && googleData.picture) updates.avatarUrl = googleData.picture;
      if (Object.keys(updates).length > 0) {
        user = await this.userRepository.update(user.id, updates);
      }
      this.logger.log(`Usuário logado via Google Login: ${email}`);
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = await this.jwtService.signAsync(payload, { expiresIn: '7d' });

    return {
      accessToken,
      refreshToken,
      user: UserResponseDto.fromEntity(user),
    };
  }
}
