import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from '../chat/chat.service';
import { CreateMessageDto } from './dto/create.message.dto';
import { PromChatService } from '../prom_chat/prom_chat.service';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/chat',
})
export class ChatgatewayGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly promService: PromChatService,
    private readonly chatService: ChatService
  ) { }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
    this.promService.incrementConnection('chat');
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    this.promService.decrementConnection('chat');
  }

  @SubscribeMessage('joinConversation')
  handleJoinConversation(
    @MessageBody() conversationId: number,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`conversation_${conversationId}`);
    client.emit('joinedConversation', { conversationId });
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() createMessageDto: CreateMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    const start = Date.now();
    const message = await this.chatService.createMessage(createMessageDto);

    const duration = (Date.now() - start) / 1000;
    const conversation_id = String(createMessageDto.conversation_id);

    this.promService.incrementMessageCounter(conversation_id);
    this.promService.observeMessageDuration(conversation_id, duration);
    this.server
      .to(`conversation_${createMessageDto.conversation_id}`)
      .emit('newMessage', message);
    return message;
  }
}
