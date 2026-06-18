import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    OneToMany,
} from 'typeorm';
import { MessageEntity } from './messages.entity';

@Entity('conversations')
export class ConversationEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    listing_id: number;

    @Column()
    buyer_id: number;

    @Column()
    seller_id: number;

    @OneToMany(() => MessageEntity, (message) => message.conversation)
    messages: MessageEntity[];

    @CreateDateColumn()
    created_at: Date;
}