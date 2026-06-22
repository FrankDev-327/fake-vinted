import { Module } from '@nestjs/common';
import { ListingService } from './listing.service';
import { ListingController } from './listing.controller';
import { RedisCachingModule } from '../redis_caching/redis_caching.module';
import { PromGatewayModule } from '../prom-gateway/prom-gateway.module';
import { AxiosServiceModule } from '../axios-service/axios-service.module';

@Module({
  exports: [ListingService],
  providers: [ListingService],
  controllers: [ListingController],
  imports: [AxiosServiceModule, PromGatewayModule, RedisCachingModule],
})
export class ListingModule { }
