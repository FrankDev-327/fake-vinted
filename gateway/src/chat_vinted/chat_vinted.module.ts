import { Module } from '@nestjs/common';
import { ChatVintedService } from './chat_vinted.service';
import { ChatVintedController } from './chat_vinted.controller';

@Module({
  providers: [ChatVintedService],
  controllers: [ChatVintedController]
})
export class ChatVintedModule {}
