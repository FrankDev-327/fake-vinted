import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from '../chat/chat.service';
import { CreateMessageDto } from './dto/create.message.dto';
import { PromChatService } from '../prom_chat/prom_chat.service';
import { ConfigService } from '@nestjs/config';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';
import { Namespace } from 'socket.io';


@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/chat',
})
export class ChatgatewayGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly promService: PromChatService,
    private readonly chatService: ChatService,
    private readonly configService: ConfigService,
  ) { }

  async afterInit(server: Namespace) {
    const pubClient = new Redis({
      host: this.configService.get<string>('REDIS_HOST'),
      port: this.configService.get<number>('REDIS_PORT'),
    });
    const subClient = pubClient.duplicate();

    await Promise.all([
      new Promise((resolve) => pubClient.once('ready', resolve)),
      new Promise((resolve) => subClient.once('ready', resolve)),
    ]);

    pubClient.on('error', (err) => console.error('Redis pub error:', err));
    subClient.on('error', (err) => console.error('Redis sub error:', err));

    server.server.adapter(createAdapter(pubClient, subClient));
    console.log('Socket.io Redis adapter initialized ✅');
  }

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
    const sender_id = String(createMessageDto.sender_id);

    this.promService.incrementMessageCounter(conversation_id);
    this.promService.incrementMessageCounter(sender_id);
    this.promService.observeMessageDuration(conversation_id, duration);
    this.promService.observeMessageDuration(sender_id, duration);
    this.server
      .to(`conversation_${createMessageDto.conversation_id}`)
      .emit('newMessage', message);
    return message;
  }
}
