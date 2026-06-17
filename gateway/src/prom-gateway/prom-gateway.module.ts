import { Module } from '@nestjs/common';
import { PromGatewayService } from './prom-gateway.service';

@Module({
    exports: [PromGatewayService],
    providers: [PromGatewayService]
})
export class PromGatewayModule { }
