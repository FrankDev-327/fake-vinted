import { Module } from '@nestjs/common';
import { PromNotificationService } from './prom_notification.service';
import { PromNotificationController } from './prom_notification.controller';

@Module({
  imports: [],
  exports: [PromNotificationService],
  providers: [PromNotificationService],
  controllers: [PromNotificationController]
})
export class PromNotificationModule { }
