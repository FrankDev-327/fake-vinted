import { Injectable, BadGatewayException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Logs } from '../loggers/loggers.service';
import { AuthLoginDto } from './dto/auth.login.dto';
import { PromGatewayService } from '../prom-gateway/prom-gateway.service';
import { AxiosServiceService } from '../axios-service/axios-service.service';
import { LoginUserDto } from '../users/response/auth.user.token.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly axiosService: AxiosServiceService,
        private readonly configService: ConfigService,
        private readonly logs: Logs,
        private readonly promGatewayService: PromGatewayService
    ) { }

    async authenticateUser(authLoginDto: AuthLoginDto): Promise<LoginUserDto> {
        try {
            const url = `${this.configService.get<string>('MS_USER_URL')}/users/authenticate`;
            const data = { username: authLoginDto.username, password: authLoginDto.password };

            const headers = { 'Content-Type': 'application/json' };
            const response = await this.axiosService.post(url, data, headers);
            
            this.promGatewayService.incrementRequestCounter('POST', '/users/authenticate', 200);
            return response; // Return the response from the authentication service
        } catch (error) {
            this.promGatewayService.incrementRequestCounter('POST', '/users/authenticate', 502);
            this.logs.error(`Error authenticating user: ${(error as Error).message}`, error);
            throw new BadGatewayException((error as Error).message, error); // Handle errors appropriately
        }
    }
}
