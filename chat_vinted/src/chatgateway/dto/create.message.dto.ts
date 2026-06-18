// create.message.dto.ts
import { IsNumber, IsString, MinLength } from 'class-validator';

export class CreateMessageDto {
    @IsNumber()
    conversation_id: number;

    @IsNumber()
    sender_id: number;

    @IsString()
    @MinLength(1)
    content: string;
}