import { Injectable } from '@nestjs/common';
import { ISendMailInput, ISendMailPayload } from './mailer.interface';
import { MailerService as MailService } from '@nestjs-modules/mailer';
import { KafkaClient, Consumer } from 'kafka-node';
import { join } from 'path';
import * as ejs from 'ejs';
import { readFileSync } from 'fs';

@Injectable()
export class MailerService {
  private readonly consumer: Consumer;

  constructor(private readonly service: MailService) {
    const kafkaClient = new KafkaClient({ kafkaHost: 'localhost:9092' });

    this.consumer = new Consumer(
      kafkaClient,
      [
        { topic: 'user_created', partition: 0, offset: 0 },
        { topic: 'forgot_password', partition: 0, offset: 0 },
      ],
      { fromOffset: true, groupId: 'myKlad' },
    );
  }

  async send(input: ISendMailInput): Promise<ISendMailPayload> {
    const path = join(__dirname, `./templates/${input.template}.ejs`);

    const mailInput = {
      ...input,
      user: JSON.parse(input.user),
    };

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

  onModuleInit() {
    this.consumer.on('message', (message) => {
      const parsedMessage = JSON.parse(<string>message.value);
      this.send({
        to: parsedMessage.payload.email,
        template: parsedMessage.template,
        user: JSON.stringify(parsedMessage.payload),
      });
      // Process the parsed message here
    });
  }
}
