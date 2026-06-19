import { Module } from '@nestjs/common';
import { PromChatService } from './prom_chat.service';
import { PromChatController } from './prom_chat.controller';

@Module({
  imports: [],
  exports: [PromChatService],
  providers: [PromChatService],
  controllers: [PromChatController]
})
export class PromChatModule { }
