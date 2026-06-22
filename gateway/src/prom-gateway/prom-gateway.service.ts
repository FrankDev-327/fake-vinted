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
        this.client.setDefaultLabels({ app: 'prom_gateway' });
        client.collectDefaultMetrics({
            register: this.client,
        });
    }

    incrementRequestCounter(method: string, endpoint: string, statusCode: number): void {
        requestCounter.inc({ method, endpoint, status_code: statusCode });
    }

    observeRequestDuration(method: string, endpoint: string, statusCode: number, durationInSeconds: number): void {
        requestDurationHistogram.observe({ method, endpoint, status_code: statusCode }, durationInSeconds);
    }

    async getMetrics(): Promise<string>  {
        return this.client.metrics();
    }
}
