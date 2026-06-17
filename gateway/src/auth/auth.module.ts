import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PromGatewayModule } from '../prom-gateway/prom-gateway.module';
import { AxiosServiceModule } from '../axios-service/axios-service.module';

@Module({
  exports:[AuthService],
  imports: [AxiosServiceModule, PromGatewayModule],
  providers: [AuthService],
  controllers: [AuthController]
})
export class AuthModule {}
