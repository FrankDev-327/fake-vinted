import { Injectable, BadGatewayException, NotFoundException } from '@nestjs/common';
import { AxiosServiceService } from '../axios-service/axios-service.service';
import { PromGatewayService } from '../prom-gateway/prom-gateway.service';
import { ConfigService } from '@nestjs/config';
import { Logs } from '../loggers/loggers.service';


@Injectable()
export class NotificationsService {
    constructor(
        private readonly axiosService: AxiosServiceService,
        private readonly configService: ConfigService,
        private readonly logs: Logs,
        private readonly promGatewayService: PromGatewayService
    ) { }

    async trucanteNotificationTable(): Promise<void> {
        try {
            const url = `${this.configService.get<string>('MS_NOTIFICATION_URL')}/notification/truncate`;
            const headers = { 'Content-Type': 'application/json' };
            const response = await this.axiosService.delete(url, headers);

            return response;
        } catch (error) {
            console.log(error);

            this.logs.error(`Error deleteting notifications: ${(error as Error).message}`, error);
            if (error instanceof NotFoundException) {
                throw new NotFoundException((error as Error).message)
            }

            throw new BadGatewayException((error as Error).message);
        }
    }

    async getUserNotifications(userId: number): Promise<any[]> {
        try {
            const url = `${this.configService.get<string>('MS_NOTIFICATION_URL')}/notification/user/${userId}`;
            const headers = { 'Content-Type': 'application/json' };
            const response = await this.axiosService.get(url, headers);
            this.promGatewayService.incrementRequestCounter('GET', `/notifications/user/${userId}`, 200);
            return response;
        } catch (error) {
            this.promGatewayService.incrementRequestCounter('GET', `/notifications/user/${userId}`, 502);
            this.logs.error(`Error getting notifications: ${(error as Error).message}`, error);
            if (error instanceof NotFoundException) {
                throw new NotFoundException((error as Error).message);
            }

            throw new BadGatewayException((error as Error).message);
        }
    }

    async markAsRead(id: number): Promise<void> {
        try {
            const url = `${this.configService.get<string>('MS_NOTIFICATION_URL')}/notification/${id}/read`;
            const headers = { 'Content-Type': 'application/json' };
            const response = await this.axiosService.patch(url, {}, headers);
            this.promGatewayService.incrementRequestCounter('PATCH', `/notifications/${id}/read`, 200);
            return response;
        } catch (error) {
            this.promGatewayService.incrementRequestCounter('PATCH', `/notifications/${id}/read`, 502);
            this.logs.error(`Error marking notification as read: ${(error as Error).message}`, error);
            if (error instanceof NotFoundException) {
                throw new NotFoundException((error as Error).message);
            }

            throw new BadGatewayException((error as Error).message);
        }
    }

    async markAllAsRead(userId: number): Promise<void> {
        try {
            const url = `${this.configService.get<string>('MS_NOTIFICATION_URL')}/notification/user/${userId}/read-all`;
            const headers = { 'Content-Type': 'application/json' };
            const response = await this.axiosService.patch(url, {}, headers);
            this.promGatewayService.incrementRequestCounter('PATCH', `/notifications/user/${userId}/read-all`, 200);
            return response;
        } catch (error) {
            this.promGatewayService.incrementRequestCounter('PATCH', `/notifications/user/${userId}/read-all`, 502);
            this.logs.error(`Error marking all notifications as read: ${(error as Error).message}`, error);
            if (error instanceof NotFoundException) {
                throw new NotFoundException((error as Error).message);
            }

            throw new BadGatewayException((error as Error).message);
        }
    }

}
