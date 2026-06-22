import { Module } from '@nestjs/common';
import { RedisCachingService } from './redis_caching.service';
import { Logs } from '../loggers/loggers.service';


@Module({
  imports: [],
  providers: [RedisCachingService, {
    provide: Logs,
    useValue: new Logs(RedisCachingService.name)
  }],
  exports: [RedisCachingService],
})
export class RedisCachingModule { }
