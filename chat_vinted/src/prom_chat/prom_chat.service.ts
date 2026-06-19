import { Injectable } from '@nestjs/common';
import * as client from 'prom-client';
import { socketConnectionGauge, socketChatCounter, socketChatHistogram } from './prom_chat_exporter';

@Injectable()
export class PromChatService {
    private readonly client: client.Registry;
    constructor() {
        this.client = new client.Registry();
        this.client.registerMetric(socketConnectionGauge);
        this.client.registerMetric(socketChatCounter);
        this.client.registerMetric(socketChatHistogram);
        this.client.setDefaultLabels({ app: 'prom-chat' });
        client.collectDefaultMetrics({
            register: this.client,
        });
    }

    incrementConnection(instance: string): void {
        socketConnectionGauge.inc({ instance });
    }

    decrementConnection(instance: string): void {
        socketConnectionGauge.dec({ instance });
    }

    incrementMessageCounter(conversation_id: string): void {
        socketChatCounter.inc({ conversation_id });
    }

    observeMessageDuration(conversation_id: string, duration: number): void {
        socketChatHistogram.observe({ conversation_id }, duration);
    }

    async getMetrics(): Promise<string> {
        return await this.client.metrics();
    }
}
