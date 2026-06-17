import { Injectable, BadGatewayException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Logs } from '../loggers/loggers.service';
import { PromGatewayService } from '../prom-gateway/prom-gateway.service';
import { AxiosServiceService } from '../axios-service/axios-service.service';
import { CreateUserDto } from './dto/create.user.dto';

@Injectable()
export class UsersService {
    constructor(
        private readonly axiosService: AxiosServiceService,
        private readonly configService: ConfigService,
        private readonly logs: Logs,
        private readonly promGatewayService: PromGatewayService
    ) { }

    async createUser(body: CreateUserDto): Promise<any> {
        try {
            const url = `${this.configService.get<string>('MS_USER_URL')}/users`;
            const headers = { 'Content-Type': 'application/json' };
            const response = await this.axiosService.post(url, body, headers);

            this.promGatewayService.incrementRequestCounter('POST', '/users', 200);
            return response; // Return the response from the authentication service
        } catch (error) {
            this.promGatewayService.incrementRequestCounter('POST', '/users/', 502);
            this.logs.error(`Error authenticating user: ${(error as Error).message}`, error);
            throw new BadGatewayException((error as Error).message); //
        }
    }
}
