import { Injectable } from '@nestjs/common';
import * as client from 'prom-client';
import { requestCounter, requestDurationHistogram } from './prom.exporters';

@Injectable()
export class PromGatewayService {
    private readonly client: client.Registry;
    constructor() {
        this.client = new client.Registry();
        this.client.registerMetric(requestCounter);
        this.client.registerMetric(requestDurationHistogram);
        this.client.setDefaultLabels({ app: 'prom-gateway' });
        client.collectDefaultMetrics({
            register: this.client,
        });
    }

    async incrementRequestCounter(method: string, endpoint: string, statusCode: number) {
        requestCounter.inc({ method, endpoint, status_code: statusCode });
    }

    async observeRequestDuration(method: string, endpoint: string, statusCode: number, durationInSeconds: number) {
        requestDurationHistogram.observe({ method, endpoint, status_code: statusCode }, durationInSeconds);
    }

    async getMetrics() {
        return this.client.metrics();
    }
}
