// create.conversation.dto.ts
import { IsNumber } from 'class-validator';

export class CreateConversationDto {
    @IsNumber()
    listing_id: number;

    @IsNumber()
    buyer_id: number;

    @IsNumber()
    seller_id: number;
}