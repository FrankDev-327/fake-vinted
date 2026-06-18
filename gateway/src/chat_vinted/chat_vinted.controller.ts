import { Controller, Patch, Post, Get, Body, Param, } from '@nestjs/common';
import { CreateConversationDto } from './dto/create.convsersation.dto';
import { ChatVintedService } from './chat_vinted.service';
import {
    ApiTags,
    ApiBadRequestResponse,
    ApiOperation,
    ApiOkResponse,
} from '@nestjs/swagger';

@Controller('chat-vinted')
export class ChatVintedController {
    constructor(
        private readonly chatService: ChatVintedService
    ) { }


    @Post('conversations')
    @ApiOperation({ summary: 'Create a conversation' })
    @ApiBadRequestResponse({
        description: 'Error creating conversation.',
    })
    async createConversation(@Body() body: CreateConversationDto): Promise<any> {
        return await this.chatService.createConversation(body);
    }

    @Get('conversations/:userId')
    @ApiOperation({ summary: 'Get user conversation' })
    @ApiBadRequestResponse({
        description: 'Error getting conversation by user id.',
    })
    async getUserConversations(@Param('user_id') user_id: number): Promise<any> {
        return await this.chatService.getUserConversations(user_id);
    }

    @Get('conversations/:conversationId/messages')
    @ApiOperation({ summary: 'Get conversation' })
    @ApiBadRequestResponse({
        description: 'Error getting conversation.',
    })
    async getConversationMessages(@Param('conversationId') conversationId: number) {
        return await this.chatService.getConversationMessages(conversationId);
    }

    @Patch('conversations/:conversationId/read/:userId')
    @ApiOperation({ summary: 'Markk conversation read' })
    @ApiBadRequestResponse({
        description: 'Error marking conversation read.',
    })
    async markAsRead(
        @Param('conversationId') conversationId: number,
        @Param('userId') userId: number,
    ) {
        return await this.chatService.markAsRead(conversationId, userId);
    }
}
