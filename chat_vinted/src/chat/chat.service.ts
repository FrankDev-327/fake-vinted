import { BadGatewayException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateMessageDto } from '../chatgateway/dto/create.message.dto';
import { CreateConversationDto } from '../chatgateway/dto/create.convsersation.dto';
import { MessageEntity } from '../entities/messages.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ConversationEntity } from '../entities/conversations.entity';
@Injectable()
export class ChatService {
    constructor(
        @InjectRepository(ConversationEntity)
        private readonly conversationRepository: Repository<ConversationEntity>,
        @InjectRepository(MessageEntity)
        private readonly messageRepository: Repository<MessageEntity>,
    ) { }

    async createConversation(dto: CreateConversationDto): Promise<ConversationEntity> {
        try {
            const existing = await this.conversationRepository.findOneBy({
                listing_id: dto.listing_id,
                buyer_id: dto.buyer_id,
                seller_id: dto.seller_id,
            });

            if (existing) return existing;
            const conversation = this.conversationRepository.create(dto);
            return await this.conversationRepository.save(conversation);
        } catch (error) {
            throw new BadGatewayException((error as Error).message);
        }
    }

    async createMessage(dto: CreateMessageDto): Promise<MessageEntity> {
        try {
            const conversation = await this.conversationRepository.findOneBy({
                id: dto.conversation_id,
            });

            if (!conversation) {
                throw new NotFoundException('Conversation not found');
            }

            const message = this.messageRepository.create(dto);
            return await this.messageRepository.save(message);
        } catch (error) {
            if (error instanceof NotFoundException) throw new NotFoundException((error as Error).message);
            throw new BadGatewayException((error as Error).message);
        }
    }

    async getConversationMessages(conversationId: number): Promise<MessageEntity[]> {
        try {
            return await this.messageRepository.find({
                where: { conversation_id: conversationId },
                order: { created_at: 'ASC' },
            });
        } catch (error) {
            throw new BadGatewayException((error as Error).message);
        }
    }

    async getUserConversations(userId: number): Promise<ConversationEntity[]> {
        try {
            return await this.conversationRepository.find({
                where: [{ buyer_id: userId }, { seller_id: userId }],
                order: { created_at: 'DESC' },
            });
        } catch (error) {
            throw new BadGatewayException((error as Error).message);
        }
    }

    async markAsRead(conversationId: number, userId: number): Promise<void> {
        try {
            await this.messageRepository.update(
                { conversation_id: conversationId, is_read: false },
                { is_read: true },
            );
        } catch (error) {
            throw new BadGatewayException((error as Error).message);
        }
    }

}
