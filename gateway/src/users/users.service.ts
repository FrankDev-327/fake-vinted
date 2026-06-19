import { Injectable, BadGatewayException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Logs } from '../loggers/loggers.service';
import { PromGatewayService } from '../prom-gateway/prom-gateway.service';
import { AxiosServiceService } from '../axios-service/axios-service.service';
import { CreateUserDto } from './dto/create.user.dto';
import { UpdateUserDto } from './dto/update.user.dto';

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
            return response;
        } catch (error) {
            this.promGatewayService.incrementRequestCounter('POST', '/users/', 502);
            this.logs.error(`Error authenticating user: ${(error as Error).message}`, error);

            if (error instanceof NotFoundException) {
                throw new NotFoundException((error as Error).message)
            }
            throw new BadGatewayException((error as Error).message); //
        }
    }

    async updateUser(id: number, body: UpdateUserDto): Promise<any> {
        try {
            const url = `${this.configService.get<string>('MS_USER_URL')}/users/${id}`;
            const headers = { 'Content-Type': 'application/json' };
            const response = await this.axiosService.put(url, body, headers);

            this.promGatewayService.incrementRequestCounter('PUT', `/users/${id}`, 200);
            return response;
        } catch (error) {
            this.promGatewayService.incrementRequestCounter('PUT', `/users/${id}`, 502);
            this.logs.error(`Error update user: ${(error as Error).message}`, error);

            if (error instanceof NotFoundException) {
                throw new NotFoundException((error as Error).message)
            }
            throw new BadGatewayException((error as Error).message); //
        }
    }

    async findUserById(id: number): Promise<any> {
        try {
            const url = `${this.configService.get<string>('MS_USER_URL')}/users/${id}`;
            const headers = { 'Content-Type': 'application/json' };
            const response = await this.axiosService.get(url, headers);

            this.promGatewayService.incrementRequestCounter('GET', `/users/${id}`, 200);
            return response;
        } catch (error) {
            this.promGatewayService.incrementRequestCounter('GET', '/users/', 502);
            this.logs.error(`Error get details user: ${(error as Error).message}`, error);

            if (error instanceof NotFoundException) {
                throw new NotFoundException((error as Error).message)
            }
            throw new BadGatewayException((error as Error).message);
        }
    }

    async truncateUsersTable(): Promise<void> {
        try {
            const url = `${this.configService.get<string>('MS_USER_URL')}/users/truncate`;
            const headers = { 'Content-Type': 'application/json' };
            const response = await this.axiosService.delete(url, headers);
            return response;
        } catch (error) {
            this.logs.error(`Error deleting users table: ${(error as Error).message}`, error);
            if (error instanceof NotFoundException) {
                throw new NotFoundException((error as Error).message)
            }

            throw new BadGatewayException((error as Error).message);
        }
    }
}
