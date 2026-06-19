import { Module } from '@nestjs/common';
import { dbdatasource } from '../orm';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatgatewayModule } from './chatgateway/chatgateway.module';
import { ChatModule } from './chat/chat.module';
import { PromChatModule } from './prom_chat/prom_chat.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(dbdatasource),
    ConfigModule.forRoot({ isGlobal: true }),
    ChatgatewayModule,
    ChatModule,
    PromChatModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
