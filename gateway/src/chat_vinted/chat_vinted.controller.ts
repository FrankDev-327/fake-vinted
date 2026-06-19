
import { CreateConversationDto } from './dto/create.convsersation.dto';
import { ChatVintedService } from './chat_vinted.service';
import {
    ApiTags,
    ApiBadRequestResponse,
    ApiOperation,
    ApiOkResponse,
} from '@nestjs/swagger';
import { JwtguardGuard } from '../jwtguard/jwtguard.guard';
import { Controller, Patch, Post, Get, Body, Param, UseGuards, } from '@nestjs/common';

@ApiTags('ChatVinted')
@Controller('chat-vinted')
export class ChatVintedController {
    constructor(
        private readonly chatService: ChatVintedService
    ) { }

    @UseGuards(JwtguardGuard)
    @Post('conversations')
    @ApiOperation({ summary: 'Create a conversation' })
    @ApiBadRequestResponse({
        description: 'Error creating conversation.',
    })
    async createConversation(@Body() body: CreateConversationDto): Promise<any> {
        return await this.chatService.createConversation(body);
    }

    @UseGuards(JwtguardGuard)
    @Get('conversations/:userId')
    @ApiOperation({ summary: 'Get user conversation' })
    @ApiBadRequestResponse({
        description: 'Error getting conversation by user id.',
    })
    async getUserConversations(@Param('userId') userId: number): Promise<any> {
        return await this.chatService.getUserConversations(userId);
    }

    @UseGuards(JwtguardGuard)
    @Get('conversations/:conversationId/messages')
    @ApiOperation({ summary: 'Get conversation' })
    @ApiBadRequestResponse({
        description: 'Error getting conversation.',
    })
    async getConversationMessages(@Param('conversationId') conversationId: number) {
        return await this.chatService.getConversationMessages(conversationId);
    }

    @UseGuards(JwtguardGuard)
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
