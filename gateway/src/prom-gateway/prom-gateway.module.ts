import { Global, Module } from '@nestjs/common';
import { PromGatewayService } from './prom-gateway.service';
@Global()
@Module({
    exports: [PromGatewayService],
    providers: [PromGatewayService]
})
export class PromGatewayModule { }
