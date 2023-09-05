import { Injectable } from '@nestjs/common';
import { log } from 'console';
import { Kafka, Producer, logLevel } from 'kafkajs';
import { MailerService } from 'src/mailer/mailer.service';

@Injectable()
export class KafkaService {
  private kafka: Kafka;
  private producer: Producer;

  constructor(private readonly mailer: MailerService) {
    this.kafka = new Kafka({
      clientId: 'MyKlad',
      brokers: ['localhost:9092'],
      logLevel: logLevel.ERROR,
    });

    this.producer = this.kafka.producer();
  }

  async produce(topic: string, message: string): Promise<void> {
    await this.producer.connect();
    await this.producer.send({
      topic,
      messages: [{ value: message }],
    });
    await this.producer.disconnect();
  }

  async consume(topics: string[]): Promise<void> {
    const consumer = this.kafka.consumer({ groupId: 'MyKlad' });

    await consumer.connect();
    await Promise.all(topics.map((topic) => consumer.subscribe({ topic })));

    await consumer.run({
      eachMessage: async ({ topic, partition, message, heartbeat }) => {
        const payload = JSON.parse(message.value.toString());
        log(payload);
        this.mailer.send({
          template: payload.template,
          to: payload.payload.email,
          user: payload.payload,
        });
        await heartbeat();
      },
    });
  }

  async onModuleInit() {
    await this.consume(['forgot_password', 'user_created', 'password_changed']);
  }
}
