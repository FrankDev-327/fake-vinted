import { Injectable, BadGatewayException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Logs } from '../loggers/loggers.service';
import { AuthLoginDto } from './dto/auth.login.dto';
import { PromGatewayService } from '../prom-gateway/prom-gateway.service';
import { AxiosServiceService } from '../axios-service/axios-service.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly axiosService: AxiosServiceService,
        private readonly configService: ConfigService,
        private readonly logs: Logs,
        private readonly promGatewayService: PromGatewayService
    ) { }

    async authenticateUser(authLoginDto: AuthLoginDto): Promise<any> {
        const url = this.configService.get<string>('MS_USER_URL');
        const data = { username: authLoginDto.username, password: authLoginDto.password };

        try {
            const headers = { 'Content-Type': 'application/json' };
            const response = await this.axiosService.post(url, data, headers);
            return response; // Return the response from the authentication service
        } catch (error) {
            this.promGatewayService.incrementRequestCounter('POST', '/auth/login', 502);
            this.logs.error(`Error authenticating user: ${(error as Error).message}`, error);
            throw new BadGatewayException(); // Handle errors appropriately
        }
    }
}
