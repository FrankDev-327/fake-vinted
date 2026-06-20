import { Module } from '@nestjs/common';
import { NotificationEntity } from '../entities/notifications.entity';
import { NotificationService } from './notification.service';
import { NotificationConsumer } from './notification.consumer.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationController } from './notification.controller';
import { PromNotificationModule } from '../prom_notification/prom_notification.module';

@Module({
  imports: [PromNotificationModule, TypeOrmModule.forFeature([NotificationEntity])],
  exports: [NotificationService],
  providers: [NotificationService],
  controllers: [NotificationConsumer, NotificationController]
})
export class NotificationModule { }
