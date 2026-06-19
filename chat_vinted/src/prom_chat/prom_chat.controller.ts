import { Controller, Get, Res } from '@nestjs/common';
import { PromChatService } from './prom_chat.service';
import { Response } from 'express';
import * as client from 'prom-client';

@Controller('metrics')
export class PromChatController {
    constructor(private readonly promService: PromChatService) { }

    @Get()
    async getMetrics(@Res() res: Response) {
        const metrics = await this.promService.getMetrics();
        res.setHeader('Content-Type', client.register.contentType);
        res.send(metrics);
    }
}
