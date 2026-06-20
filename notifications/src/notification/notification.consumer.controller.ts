import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { NotificationType } from '../entities/notifications.entity';
import { NotificationService, CreateNotificationPayload } from './notification.service';

interface NotificationInterface {
    user_id: number;
    sender_id: number;
    conversation_id: number;
    listing_id: number;
    content: string;
}

@Controller()
export class NotificationConsumer {
    constructor(private readonly notificationsService: NotificationService) { }

    @EventPattern('new_message')
    async handleNewMessage(@Payload() payload: NotificationInterface) {
        await this.notificationsService.createNotification({
            user_id: payload.user_id,
            type: NotificationType.NEW_MESSAGE,
            title: 'New message received',
            message: `You have a new message`,
            metadata: {
                sender_id: payload.sender_id,
                conversation_id: payload.conversation_id,
                listing_id: payload.listing_id,
            },
        });
    }

    @EventPattern('item_sold')
    async handleItemSold(@Payload() payload: {
        user_id: number;
        listing_id: number;
        buyer_id: number;
    }) {
        await this.notificationsService.createNotification({
            user_id: payload.user_id,
            type: NotificationType.ITEM_SOLD,
            title: 'Your item was sold!',
            message: `Congratulations! Your item has been purchased`,
            metadata: {
                listing_id: payload.listing_id,
                buyer_id: payload.buyer_id,
            },
        });
    }

    @EventPattern('item_shipped')
    async handleItemShipped(@Payload() payload: {
        user_id: number;
        listing_id: number;
        tracking_number: string;
    }) {
        await this.notificationsService.createNotification({
            user_id: payload.user_id,
            type: NotificationType.ITEM_SHIPPED,
            title: 'Your item has been shipped!',
            message: `Your item is on its way`,
            metadata: {
                listing_id: payload.listing_id,
                tracking_number: payload.tracking_number,
            },
        });
    }
}
