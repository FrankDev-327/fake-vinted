import { PromGatewayService } from './prom-gateway.service';
import { Response } from 'express';
import * as client from 'prom-client';
import { Controller, Get, Res } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

@Controller('prom-gateway')
export class PromGatewayController {
    constructor(private readonly promService: PromGatewayService) { }


    @ApiOperation({ summary: 'List prometheus metrics and the ones were registered' })
    @Get('/metrics')
    async getMetrics(@Res() res: Response) {
        const metrics = await this.promService.getMetrics();
        res.setHeader('Content-Type', client.register.contentType);
        res.send(metrics);
    }
}
