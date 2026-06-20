import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
} from 'typeorm';

export enum NotificationType {
    NEW_MESSAGE = 'new_message',
    ITEM_SOLD = 'item_sold',
    OFFER_ACCEPTED = 'offer_accepted',
    OFFER_REJECTED = 'offer_rejected',
    ITEM_SHIPPED = 'item_shipped',
}

@Entity('notifications')
export class NotificationEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    user_id: number;

    @Column({
        type: 'enum',
        enum: NotificationType,
    })
    type: NotificationType;

    @Column()
    title: string;

    @Column({ type: 'text' })
    message: string;

    @Column({ default: false })
    is_read: boolean;

    @Column({ type: 'jsonb', nullable: true })
    metadata: Record<string, any>;

    @CreateDateColumn()
    created_at: Date;
}