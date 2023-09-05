import { Injectable } from '@nestjs/common';
import { ISendMailInput, ISendMailPayload } from './mailer.interface';
import { MailerService as MailService } from '@nestjs-modules/mailer';
import { join } from 'path';
import * as ejs from 'ejs';
import { readFileSync } from 'fs';

@Injectable()
export class MailerService {
  constructor(private readonly service: MailService) {}

  async send(mailInput: ISendMailInput): Promise<ISendMailPayload> {
    const path = join(__dirname, `./templates/${mailInput.template}.ejs`);
    const template = readFileSync(path, 'utf8');
    const compiledTemplate = ejs.compile(template);
    const renderedContent = compiledTemplate({
      user: mailInput.user,
    });

    let subject = '';

    switch (mailInput.template) {
      case 'signup':
        subject = 'Bienvenue sur MyKlad';
        break;
      case 'forgot-password':
        subject = 'MyKlad - Demande de réinitialisation de mot de passe';
        break;
      case 'password-changed':
        subject = 'MyKlad - Mot de passe modifié';
        break;
      default:
        break;
    }

    await this.service.sendMail({
      to: mailInput.to,
      subject,
      html: renderedContent,
      headers: {
        From: 'MyKlad <noreply@myklad.com>',
      },
    });

    return { isSent: true };
  }
}
