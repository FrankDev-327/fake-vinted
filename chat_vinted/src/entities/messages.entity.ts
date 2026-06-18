import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { ConversationEntity } from './conversations.entity';

@Entity('messages')
export class MessageEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    conversation_id: number;

    @Column()
    sender_id: number;

    @Column({ type: 'text' })
    content: string;

    @Column({ default: false })
    is_read: boolean;

    @ManyToOne(() => ConversationEntity, (conversation) => conversation.messages, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'conversation_id' })
    conversation: ConversationEntity;

    @CreateDateColumn()
    created_at: Date;
}