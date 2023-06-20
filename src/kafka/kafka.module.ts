import { Module } from '@nestjs/common';
import { KafkaService } from './kafka.service';
import { MailerService } from 'src/mailer/mailer.service';

@Module({
  controllers: [],
  providers: [KafkaService, MailerService],
})
export class KafkaModule {}
