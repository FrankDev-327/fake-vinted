import { BadGatewayException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateConversationDto } from './dto/create.convsersation.dto';
import { PromGatewayService } from '../prom-gateway/prom-gateway.service';
import { AxiosServiceService } from '../axios-service/axios-service.service';
import { ConfigService } from '@nestjs/config';
import { Logs } from '../loggers/loggers.service';

@Injectable()
export class ChatVintedService {
    constructor(
        private readonly axiosService: AxiosServiceService,
        private readonly configService: ConfigService,
        private readonly logs: Logs,
        private readonly promGatewayService: PromGatewayService
    ) { }

    async createConversation(body: CreateConversationDto): Promise<any> {
        try {
            const url = `${this.configService.get<string>('MS_CHAT_GATEWAY_URL')}/chat/conversations`;
            const headers = { 'Content-Type': 'application/json' };
            const response = await this.axiosService.post(url, body, headers);

            this.promGatewayService.incrementRequestCounter('POST', '/chat/conversations', 200);
            return response;
        } catch (error) {
            this.promGatewayService.incrementRequestCounter('POST', '/chat/conversations', 502);
            this.logs.error(`Error creating conversation: ${(error as Error).message}`, error);

            if (error instanceof NotFoundException) {
                throw new NotFoundException((error as Error).message)
            }
            throw new BadGatewayException((error as Error).message);
        }
    }

    async getUserConversations(user_id: number): Promise<any> {
        try {
            const url = `${this.configService.get<string>('MS_CHAT_GATEWAY_URL')}/chat/conversations/${user_id}`;
            const headers = { 'Content-Type': 'application/json' };
            const response = await this.axiosService.get(url, headers);

            this.promGatewayService.incrementRequestCounter('GET', `/chat/conversations/${user_id}`, 200);
            return response;
        } catch (error) {
            this.promGatewayService.incrementRequestCounter('GET', `/chat/conversations/${user_id}`, 502);
            this.logs.error(`Error getting conversation: ${(error as Error).message}`, error);

            if (error instanceof NotFoundException) {
                throw new NotFoundException((error as Error).message)
            }
            throw new BadGatewayException((error as Error).message);
        }
    }

    async getConversationMessages(conversationId: number): Promise<any> {
        try {
            const url = `${this.configService.get<string>('MS_CHAT_GATEWAY_URL')}/chat/conversations/${conversationId}/messages`;
            const headers = { 'Content-Type': 'application/json' };
            const response = await this.axiosService.get(url, headers);

            this.promGatewayService.incrementRequestCounter('GET', `/chat/conversations/${conversationId}/messages`, 200);
            return response;
        } catch (error) {
            this.promGatewayService.incrementRequestCounter('GET', `/chat/conversations/${conversationId}/messages`, 502);
            this.logs.error(`Error getting conversation: ${(error as Error).message}`, error);

            if (error instanceof NotFoundException) {
                throw new NotFoundException((error as Error).message)
            }
            throw new BadGatewayException((error as Error).message);
        }
    }

    async markAsRead(conversationId: number, user_id: number): Promise<any> {
        try {
            const url = `${this.configService.get<string>('MS_CHAT_GATEWAY_URL')}/chat/conversations/${conversationId}/read/${user_id}`;
            const headers = { 'Content-Type': 'application/json' };
            const response = await this.axiosService.patch(url, headers);

            this.promGatewayService.incrementRequestCounter('PATCH', `/chat/conversations/${conversationId}/read/${user_id}`, 200);
            return response;
        } catch (error) {
            this.promGatewayService.incrementRequestCounter('PATCH', `/chat/conversations/${conversationId}/read/${user_id}`, 502);
            this.logs.error(`Error getting conversation: ${(error as Error).message}`, error);

            if (error instanceof NotFoundException) {
                throw new NotFoundException((error as Error).message)
            }
            throw new BadGatewayException((error as Error).message);
        }
    }

    async truncateMessagesTableAndConversations(): Promise<void> {
        try {
            const url = `${this.configService.get<string>('MS_CHAT_GATEWAY_URL')}/chat/truncate`;
            const headers = { 'Content-Type': 'application/json' };
            const response = await this.axiosService.delete(url, headers);

            return response;
        } catch (error) {
            this.logs.error(`Error deleteting messages and conversations: ${(error as Error).message}`, error);
            if (error instanceof NotFoundException) {
                throw new NotFoundException((error as Error).message)
            }

            throw new BadGatewayException((error as Error).message);
        }
    }
}
