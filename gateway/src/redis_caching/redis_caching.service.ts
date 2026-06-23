import Redis from 'ioredis';
import { Injectable, BadGatewayException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Logs } from '../loggers/loggers.service';

@Injectable()
export class RedisCachingService {
    private redis: Redis;

    constructor(
        private readonly logService: Logs,
        private readonly configService: ConfigService
    ) {
        this.redis = new Redis({
            host: this.configService.get<string>('REDIS_HOST'),
            port: Number(this.configService.get<string>('REDIS_PORT'))
        })
    }

    async set(data, key: string, ttl = 400, checkTtl = false): Promise<void> {
        try {
            const json = JSON.stringify(data);
            if (checkTtl) {
                await this.redis.setex(key, ttl, json);
            } else {
                await this.redis.set(key, json);
            }
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw new NotFoundException((error as Error).message);
            }

            this.logService.error(`Error during the caching: ${(error as Error).message}`);
            throw new BadGatewayException((error as Error).message);
        }
    }

    async get(key: string) {
        try {
            return await this.redis.get(key);
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw new NotFoundException((error as Error).message);
            }

            this.logService.error(`Error getting the caching: ${(error as Error).message}`);
            throw new BadGatewayException((error as Error).message);
        }
    }

}
