import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './presentation/controllers/auth.controller';
import { RegisterUseCase } from './application/use-cases/register.use-case';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { GetProfileUseCase } from './application/use-cases/get-profile.use-case';
import { UpdateProfileUseCase } from './application/use-cases/update-profile.use-case';
import { VerifyEmailUseCase } from './application/use-cases/verify-email.use-case';
import { ResendCodeUseCase } from './application/use-cases/resend-code.use-case';
import { GoogleAuthUseCase } from './application/use-cases/google-auth.use-case';
import { FirestoreUserRepository } from './infrastructure/repositories/firestore-user.repository';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';
import { MailModule } from '../../shared/mail/mail.module';

@Module({
  imports: [
    MailModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: () => {
        let jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret && typeof process.loadEnvFile === 'function') {
          try { process.loadEnvFile(); jwtSecret = process.env.JWT_SECRET; } catch {}
        }
        if (!jwtSecret) {
          jwtSecret = 'nutriplan-super-secret-jwt-key-change-in-production';
        }
        
        return {
          secret: jwtSecret,
          signOptions: { expiresIn: (process.env.JWT_EXPIRES_IN || '24h') as any },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    RegisterUseCase,
    LoginUseCase,
    GetProfileUseCase,
    UpdateProfileUseCase,
    VerifyEmailUseCase,
    ResendCodeUseCase,
    GoogleAuthUseCase,
    JwtStrategy,
    {
      provide: 'USER_REPOSITORY',
      useClass: FirestoreUserRepository,
    },
  ],
  exports: [JwtStrategy, PassportModule, 'USER_REPOSITORY'],
})
export class AuthModule {}
