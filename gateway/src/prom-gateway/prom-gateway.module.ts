import { Global, Module } from '@nestjs/common';
import { PromGatewayService } from './prom-gateway.service';
import { PromGatewayController } from './prom-gateway.controller';
@Global()
@Module({
    imports: [],
    exports: [PromGatewayService],
    providers: [PromGatewayService],
    controllers: [PromGatewayController]
})
export class PromGatewayModule { }
