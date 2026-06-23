import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { HttpModule } from '@nestjs/axios';
import { UsersModule } from './users/users.module';
import { AxiosServiceModule } from './axios-service/axios-service.module';
import { LoggersModule } from './loggers/loggers.module';
import { PromGatewayModule } from './prom-gateway/prom-gateway.module';
import { ListingModule } from './listing/listing.module';
import { JwtModule } from '@nestjs/jwt';
import { ChatVintedModule } from './chat_vinted/chat_vinted.module';
import { NotificationsModule } from './notifications/notifications.module';
import { RedisCachingModule } from './redis_caching/redis_caching.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';


@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true,
  }),
  ThrottlerModule.forRootAsync({
    imports: [ConfigModule],
    useFactory: (configService: ConfigService) => ([{
      ttl: configService.get<number>('THROTTLE_TTL') ?? 60000, // 1 minute window
      limit: configService.get<string>('NODE_ENV') === 'prod'
        ? configService.get<number>('THROTTLE_LIMIT') ?? 100
        : 10000, // max 100 requests per window
    }]),
    inject: [ConfigService],
  }),
  JwtModule.register({
    global: true,
    secret: process.env.KEY_SECRET,
    signOptions: {
      expiresIn: '24h',
    },
  }),
    AuthModule,
    UsersModule,
    HttpModule,
    AxiosServiceModule,
    LoggersModule,
    PromGatewayModule,
    ListingModule,
    ChatVintedModule,
    NotificationsModule,
    RedisCachingModule
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard, // applies globally to all endpoints
    },
  ],
})
export class AppModule { }
