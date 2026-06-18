import { Module } from '@nestjs/common';
import { ChatService } from '../chat/chat.service';
import { ChatgatewayGateway } from './chatgateway.gateway';

@Module({
    providers:[ChatService, ChatgatewayGateway],
    exports:[ChatService]
})
export class ChatgatewayModule {}
