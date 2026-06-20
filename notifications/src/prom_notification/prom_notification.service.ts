import { Injectable } from '@nestjs/common';
import * as client from 'prom-client'
import { notificationCounter } from './prom_notification_exporter';

@Injectable()
export class PromNotificationService {
    private readonly client: client.Registry;
    constructor() {
        this.client = new client.Registry();
        this.client.registerMetric(notificationCounter);
        this.client.setDefaultLabels({ app: 'prom-notification' });
        client.collectDefaultMetrics({
            register: this.client,
        });
    }

    countingNotification(typeNotification: string): void {
        notificationCounter.inc({ type: typeNotification })
    }

    async getMetrics(): Promise<string> {
        return this.client.metrics();
    }
}
