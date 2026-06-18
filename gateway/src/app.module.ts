import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { HttpModule } from '@nestjs/axios';
import { UsersModule } from './users/users.module';
import { AxiosServiceModule } from './axios-service/axios-service.module';
import { LoggersModule } from './loggers/loggers.module';
import { PromGatewayService } from './prom-gateway/prom-gateway.service';
import { PromGatewayModule } from './prom-gateway/prom-gateway.module';
import { ListingModule } from './listing/listing.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true,
  }),
  JwtModule.register({
    global: true,
    secret: process.env.KEY_SECRET,
    signOptions: {
      expiresIn: '15m',
    },
  }),
    AuthModule,
    UsersModule,
    HttpModule,
    AxiosServiceModule,
    LoggersModule,
    PromGatewayModule,
    ListingModule
  ],
  controllers: [],
  providers: [PromGatewayService],
})
export class AppModule { }
