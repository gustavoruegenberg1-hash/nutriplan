import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private resend: Resend | null = null;
  private readonly fromEmail: string;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey && apiKey.trim() !== '') {
      this.resend = new Resend(apiKey);
      this.logger.log('📧 Serviço de E-mail Resend inicializado com sucesso.');
    } else {
      this.logger.warn('⚠️ RESEND_API_KEY não definida. Códigos de e-mail serão exibidos no console.');
    }

    this.fromEmail = process.env.RESEND_FROM_EMAIL || 'NutriPlan <onboarding@resend.dev>';
  }

  async sendVerificationEmail(to: string, name: string, code: string): Promise<boolean> {
    this.logger.log(`[VERIFICAÇÃO] Enviando código para ${to}: [ ${code} ]`);

    if (!this.resend) {
      this.logger.log(`👉 MODO DESENVOLVIMENTO: O código de verificação para ${to} é: ${code}`);
      return true;
    }

    try {
      const { data, error } = await this.resend.emails.send({
        from: this.fromEmail,
        to: [to],
        subject: `Seu código de verificação NutriPlan: ${code}`,
        html: `
          <!DOCTYPE html>
          <html lang="pt-BR">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Código de Verificação NutriPlan</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; color: #f8fafc; margin: 0; padding: 40px 20px;">
            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 520px; background-color: #1e293b; border-radius: 16px; border: 1px solid #334155; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.3);">
              <tr>
                <td style="padding: 32px 32px 20px; text-align: center;">
                  <div style="display: inline-block; width: 48px; height: 48px; background: linear-gradient(135deg, #10b981, #14b8a6); border-radius: 12px; line-height: 48px; font-size: 24px;">
                    🔥
                  </div>
                  <h1 style="color: #f8fafc; font-size: 24px; font-weight: 800; margin: 16px 0 4px; letter-spacing: -0.5px;">NutriPlan</h1>
                  <p style="color: #94a3b8; font-size: 14px; margin: 0;">Planejamento Nutricional & Treino Científico</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 0 32px 24px;">
                  <div style="background-color: #0f172a; border-radius: 12px; padding: 24px; border: 1px solid #334155; text-align: center;">
                    <p style="color: #cbd5e1; font-size: 15px; margin: 0 0 16px; line-height: 1.5;">
                      Olá, <strong>${name || 'Atleta'}</strong>! Bem-vindo ao NutriPlan.<br>
                      Use o código de 6 dígitos abaixo para verificar seu endereço de e-mail:
                    </p>
                    <div style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(20, 184, 166, 0.15)); border: 2px dashed #10b981; border-radius: 10px; padding: 16px 24px; display: inline-block; margin: 8px 0;">
                      <span style="font-family: monospace, Courier; font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #34d399;">
                        ${code}
                      </span>
                    </div>
                    <p style="color: #64748b; font-size: 13px; margin: 16px 0 0;">
                      ⏱️ Este código expira em <strong>15 minutos</strong>.
                    </p>
                  </div>
                </td>
              </tr>
              <tr>
                <td style="padding: 0 32px 32px; text-align: center;">
                  <p style="color: #64748b; font-size: 12px; margin: 0; line-height: 1.5;">
                    Se você não solicitou este cadastro no NutriPlan, apenas desconsidere esta mensagem.
                  </p>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `,
      });

      if (error) {
        this.logger.error(`Erro retornado pelo Resend ao enviar e-mail: ${JSON.stringify(error)}`);
        return false;
      }

      this.logger.log(`E-mail de verificação enviado com sucesso para ${to}. ID: ${data?.id}`);
      return true;
    } catch (err: any) {
      this.logger.error(`Exceção ao disparar e-mail via Resend: ${err.message}`);
      return false;
    }
  }
}
