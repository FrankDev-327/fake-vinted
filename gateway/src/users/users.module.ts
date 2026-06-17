import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { JwtguardGuard } from '../jwtguard/jwtguard.guard';
import { AxiosServiceModule } from '../axios-service/axios-service.module';
import { PromGatewayModule } from '../prom-gateway/prom-gateway.module';

@Module({
    providers: [UsersService, JwtguardGuard],
    exports: [UsersService],
    imports: [AxiosServiceModule, PromGatewayModule],
    controllers: [UsersController]
})
export class UsersModule { }
