import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { ImageMetricsService } from './image-metrics.service';

@Controller('metrics')
export class MetricsController {
    constructor(private readonly imageMetricsService: ImageMetricsService) { }

    @Get()
    async getMetrics(@Res() res: Response): Promise<void> {
        res.setHeader('Content-Type', this.imageMetricsService.contentType());
        res.send(await this.imageMetricsService.metrics());
    }
}
