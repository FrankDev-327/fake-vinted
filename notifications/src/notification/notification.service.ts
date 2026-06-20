import { Injectable, BadGatewayException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PromNotificationService } from '../prom_notification/prom_notification.service';
import { NotificationEntity, NotificationType } from '../entities/notifications.entity';

export interface CreateNotificationPayload {
    user_id: number;
    type: NotificationType;
    title: string;
    message: string;
    metadata?: Record<string, any>;
}

@Injectable()
export class NotificationService {
    constructor(
        @InjectRepository(NotificationEntity)
        private readonly notificationRepository: Repository<NotificationEntity>,
        private readonly promService: PromNotificationService
    ) { }

    async createNotification(payload: CreateNotificationPayload): Promise<NotificationEntity> {
        try {
            const notificationCreated = this.notificationRepository.create(payload);
            const notificationSaved = await this.notificationRepository.save(notificationCreated);
            this.promService.countingNotification(payload.type);
            return notificationSaved
        } catch (error) {
            throw new BadGatewayException((error as Error).message);
        }
    }

    async getUserNotifications(userId: number): Promise<NotificationEntity[]> {
        try {
            return await this.notificationRepository.find({
                where: { user_id: userId },
                order: { created_at: 'DESC' },
            });
        } catch (error) {
            throw new BadGatewayException((error as Error).message);
        }
    }

    async markAsRead(id: number): Promise<void> {
        try {
            await this.notificationRepository.update(id, { is_read: true });
        } catch (error) {
            throw new BadGatewayException((error as Error).message);
        }
    }

    async markAllAsRead(userId: number): Promise<void> {
        try {
            await this.notificationRepository.update(
                { user_id: userId, is_read: false },
                { is_read: true },
            );
        } catch (error) {
            throw new BadGatewayException((error as Error).message);
        }
    }
}
