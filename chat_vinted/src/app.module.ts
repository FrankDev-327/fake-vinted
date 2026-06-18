import { Module } from '@nestjs/common';
import { dbdatasource } from '../orm';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatgatewayModule } from './chatgateway/chatgateway.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(dbdatasource),
    ConfigModule.forRoot({ isGlobal: true }),
    ChatgatewayModule,
    ChatModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
