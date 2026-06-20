import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import * as client from 'prom-client';
import { PromNotificationService } from './prom_notification.service';

@Controller('metrics')
export class PromNotificationController {
    constructor(
        private readonly promService: PromNotificationService
    ) { }

    @Get()
    async getMetrics(@Res() res: Response) {
        const metrics = await this.promService.getMetrics();
        res.setHeader('Content-Type', client.register.contentType);
        res.send(metrics);
    }
}
