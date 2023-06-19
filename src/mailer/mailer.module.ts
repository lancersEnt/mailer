import { Module } from '@nestjs/common';
import { MailerModule as MailModule } from '@nestjs-modules/mailer';
import { MailerService } from './mailer.service';

@Module({
  imports: [MailModule],
  controllers: [],
  providers: [MailerService],
})
export class MailerModule {}
