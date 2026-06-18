import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { MessageEntity } from '../entities/messages.entity';
import { ConversationEntity } from '../entities/conversations.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([MessageEntity, ConversationEntity]),
  ],
  exports: [ChatService],
  providers: [ChatService],
  controllers: [ChatController]
})
export class ChatModule { }
