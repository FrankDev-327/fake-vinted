import { Injectable } from '@nestjs/common';
import { CreateMessageDto } from '../chatgateway/dto/create.message.dto';
import { MessageEntity } from '../entities/messages.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ChatService { }
