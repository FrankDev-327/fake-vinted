import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { HttpModule } from '@nestjs/axios';
import { UsersModule } from './users/users.module';
import { AxiosServiceModule } from './axios-service/axios-service.module';
import { LoggersModule } from './loggers/loggers.module';
import { PromGatewayService } from './prom-gateway/prom-gateway.service';
import { PromGatewayModule } from './prom-gateway/prom-gateway.module';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true,
  }), AuthModule, UsersModule, HttpModule, AxiosServiceModule, LoggersModule, PromGatewayModule],
  controllers: [],
  providers: [PromGatewayService],
})
export class AppModule { }
