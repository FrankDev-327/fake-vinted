import { Controller, Delete, Get, Param, Patch, Put, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtguardGuard } from '../jwtguard/jwtguard.guard';

@Controller('notifications')
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    @Delete('truncate')
    async trucanteNotificationTable(): Promise<void> {
        await this.notificationsService.trucanteNotificationTable();
    }

    @UseGuards(JwtguardGuard)
    @Get('user/:userId')
    async getUserNotifications(@Param('userId') userId: number): Promise<any[]> {
        return await this.notificationsService.getUserNotifications(userId);
    }

    @UseGuards(JwtguardGuard)
    @Patch(':id/read')
    async markAsRead(@Param('id') id: number): Promise<void> {
        return await this.notificationsService.markAsRead(id);
    }

    @UseGuards(JwtguardGuard)
    @Patch('user/:userId/read-all')
    async markAllAsRead(@Param('userId') userId: number): Promise<void> {
        return await this.notificationsService.markAllAsRead(userId);
    }
}