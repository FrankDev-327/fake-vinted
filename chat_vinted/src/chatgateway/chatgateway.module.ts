import { Module } from '@nestjs/common';
import { ChatModule } from '../chat/chat.module';
import { ChatgatewayGateway } from './chatgateway.gateway';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        ChatModule
    ],
    providers: [ChatgatewayGateway],
    exports: []
})
export class ChatgatewayModule { }
