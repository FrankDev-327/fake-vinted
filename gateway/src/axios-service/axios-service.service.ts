import { Injectable, BadGatewayException } from '@nestjs/common';
import { HttpService, } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Logs } from '../loggers/loggers.service';

@Injectable()
export class AxiosServiceService {
    constructor(private readonly httpService: HttpService,
        private readonly logs: Logs) { }

    async get(url: string, headers?: Record<string, string>): Promise<any> {
        try {
            const { data: responseData } = await firstValueFrom(
                this.httpService.get(url, { headers })
            );
            return responseData;
        } catch (error) {
            this.logs.error(`Error in GET request to ${url}: ${(error as Error).message}`, error);
            throw new BadGatewayException();
        }
    }

    async post(url: string, data: any, headers?: Record<string, string>): Promise<any> {
        try {
            const { data: responseData } = await firstValueFrom(
                this.httpService.post(url, data, { headers })
            );
            return responseData;
        } catch (error) {
            this.logs.error(`Error in POST request to ${url}: ${(error as Error).message}`, error);
            throw new BadGatewayException();
        }
    }

    async put(url: string, data: any, headers?: Record<string, string>): Promise<any> {
        try {
            const { data: responseData } = await firstValueFrom(
                this.httpService.put(url, data, { headers })
            );
            return responseData;
        } catch (error) {
            this.logs.error(`Error in PUT request to ${url}: ${(error as Error).message}`, error);
            throw new BadGatewayException();
        }
    }

    async delete(url: string, headers?: Record<string, string>): Promise<any> {
        try {
            const { data: responseData } = await firstValueFrom(
                this.httpService.delete(url, { headers })
            );
            return responseData;
        } catch (error) {
            this.logs.error(`Error in DEL request to ${url}: ${(error as Error).message}`, error);
            throw new BadGatewayException();
        }
    }

    async patch(url: string, data: any, headers?: Record<string, string>): Promise<any> {
        try {
            const { data: responseData } = await firstValueFrom(
                this.httpService.patch(url, { headers })
            );
            return responseData;
        } catch (error) {
            this.logs.error(`Error in PATCH request to ${url}: ${(error as Error).message}`, error);
            throw new BadGatewayException();
        }
    }
}
