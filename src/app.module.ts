import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { MailerModule as MailModule } from '@nestjs-modules/mailer';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule } from './mailer/mailer.module';
import { join } from 'path';
import { KafkaModule } from './kafka/kafka.module';

@Module({
  imports: [
    MailModule.forRootAsync({
      imports: [ConfigModule],
      // !! Hardcoded SMTP CONFIG
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: 'smtp.mailtrap.io',
          port: 2525,
          ignoreTLS: true,
          secure: false,
          auth: {
            user: '8f4b4104410132',
            pass: '1aba88ce47e05c',
          },
          preview: true,
          defaults: {
            from: `"MyKlad" <noreply@myklad.com>`,
          },
          template: {
            dir: join(__dirname, 'templates'),
            adapter: new EjsAdapter(),
            options: {
              strict: true,
            },
          },
        },
      }),
      inject: [ConfigService],
    }),
    MailerModule,
    KafkaModule,
  ],
  providers: [AppService],
})
export class AppModule {}
