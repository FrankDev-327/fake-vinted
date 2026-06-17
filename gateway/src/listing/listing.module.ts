import { Module } from '@nestjs/common';
import { ListingService } from './listing.service';
import { ListingController } from './listing.controller';
import { PromGatewayModule } from '../prom-gateway/prom-gateway.module';
import { AxiosServiceModule } from '../axios-service/axios-service.module';

@Module({
  exports: [ListingService],
  providers: [ListingService],
  controllers: [ListingController],
  imports: [AxiosServiceModule, PromGatewayModule],
})
export class ListingModule { }
