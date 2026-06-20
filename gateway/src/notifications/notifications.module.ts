import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { PromGatewayModule } from '../prom-gateway/prom-gateway.module';
import { AxiosServiceModule } from '../axios-service/axios-service.module';

@Module({
  imports: [AxiosServiceModule, PromGatewayModule],
  exports: [NotificationsService],
  providers: [NotificationsService],
  controllers: [NotificationsController]
})
export class NotificationsModule { }
