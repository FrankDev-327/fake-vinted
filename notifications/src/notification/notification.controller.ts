import { Controller, Get, Param, Patch } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationEntity } from '../entities/notifications.entity';

@Controller('notification')
export class NotificationController {
    constructor(private readonly notificationsService: NotificationService) { }

    @Get('user/:userId')
    async getUserNotifications(@Param('userId') userId: number): Promise<NotificationEntity[]> {
        return await this.notificationsService.getUserNotifications(userId);
    }

    @Patch(':id/read')
    async markAsRead(@Param('id') id: number): Promise<void> {
        return await this.notificationsService.markAsRead(id);
    }

    @Patch('user/:userId/read-all')
    async markAllAsRead(@Param('userId') userId: number): Promise<void> {
        return await this.notificationsService.markAllAsRead(userId);
    }
}
