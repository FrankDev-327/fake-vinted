import { Counter } from "prom-client";

export const notificationCounter = new Counter({
    name: 'total_notification_counter',
    help: 'Total of the notifications sent',
    labelNames: ['type']
});