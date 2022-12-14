import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { Usuario } from '@prisma/client';
import { join } from 'path';
@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendUserConfirmation(user: Usuario, app_name: string, url: string) {
    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Bem vindo ao Easyvet! Confirme seu Email',
      template: join(
        process.cwd(),
        'dist',
        'mail',
        'templates',
        'confirmation.hbs',
      ),
      context: {
        name: user.nome,
        url,
        app_name,
      },
    });
  }

  async sendResetPasswordLink(email: string, url: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Reset password',
      template: join(
        process.cwd(),
        'dist',
        'mail',
        'templates',
        `reset_password.hbs`,
      ),
      context: {
        name: email,
        url,
        app_name: 'reset password',
      },
    });
  }
}
