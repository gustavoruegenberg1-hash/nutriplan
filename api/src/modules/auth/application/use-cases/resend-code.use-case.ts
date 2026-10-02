import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { IUserRepository } from '../ports/user-repository.port';
import { MailService } from '../../../../shared/mail/mail.service';

@Injectable()
export class ResendCodeUseCase {
  constructor(
    @Inject('USER_REPOSITORY')
    private readonly userRepository: IUserRepository,
    private readonly mailService: MailService,
  ) {}

  async execute(dto: { email: string }): Promise<{ success: boolean; message: string }> {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    if (user.isEmailVerified) {
      return { success: true, message: 'Este endereço de e-mail já foi verificado.' };
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationCodeExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await this.userRepository.update(user.id, {
      verificationCode,
      verificationCodeExpiresAt,
    });

    await this.mailService.sendVerificationEmail(user.email, user.name, verificationCode);

    return {
      success: true,
      message: 'Novo código de verificação enviado com sucesso para o seu e-mail.',
    };
  }
}
