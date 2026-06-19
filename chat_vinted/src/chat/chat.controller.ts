import { Controller, Post, Get, Body, Param, Patch, Delete } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateConversationDto } from '../chatgateway/dto/create.convsersation.dto';
@Controller('chat')
export class ChatController {
    constructor(private readonly chatService: ChatService) { }

    @Post('conversations')
    async createConversation(@Body() dto: CreateConversationDto) {
        return await this.chatService.createConversation(dto);
    }

    @Get('conversations/:userId')
    async getUserConversations(@Param('userId') userId: number) {
        return await this.chatService.getUserConversations(userId);
    }

    @Get('conversations/:conversationId/messages')
    async getMessages(@Param('conversationId') conversationId: number) {
        return await this.chatService.getConversationMessages(conversationId);
    }

    @Patch('conversations/:conversationId/read/:userId')
    async markAsRead(
        @Param('conversationId') conversationId: number,
        @Param('userId') userId: number,
    ) {
        return await this.chatService.markAsRead(conversationId, userId);
    }

    @Delete('truncate')
    async truncateMessagesTableAndConversations(): Promise<void> {
        await this.chatService.truncateMessagesTableAndConversations()
    }
}
