import { Injectable, BadGatewayException } from '@nestjs/common';
import { CreateListingDto } from './dto/create.listing.dto';
import { UpdateListingDto } from './dto/update.listing.dto';
import { PromGatewayService } from '../prom-gateway/prom-gateway.service';
import { AxiosServiceService } from '../axios-service/axios-service.service';
import { ConfigService } from '@nestjs/config';
import { Logs } from '../loggers/loggers.service';

@Injectable()
export class ListingService {
    constructor(
        private readonly axiosService: AxiosServiceService,
        private readonly configService: ConfigService,
        private readonly logs: Logs,
        private readonly promGatewayService: PromGatewayService
    ) { }

    async createListing(body: CreateListingDto): Promise<any> {
        try {
            const url = `${this.configService.get<string>('MS_LISTING_URL')}/glossaries`;
            const headers = { 'Content-Type': 'application/json' };
            const response = await this.axiosService.post(url, body, headers);

            this.promGatewayService.incrementRequestCounter('POST', '/listing', 200);
            return response;
        } catch (error) {
            this.promGatewayService.incrementRequestCounter('POST', '/listing/', 502);
            this.logs.error(`Error creating listing: ${(error as Error).message}`, error);
            throw new BadGatewayException((error as Error).message); //
        }
    }

    async updateListing(id: number, body: UpdateListingDto): Promise<any> {
        try {
            const url = `${this.configService.get<string>('MS_LISTING_URL')}/glossaries/${id}`;
            const headers = { 'Content-Type': 'application/json' };
            const response = await this.axiosService.put(url, body, headers);

            this.promGatewayService.incrementRequestCounter('PUT', '/listing', 200);
            return response;
        } catch (error) {
            this.promGatewayService.incrementRequestCounter('PUT', '/listing/', 502);
            this.logs.error(`Error updating listing: ${(error as Error).message}`, error);
            throw new BadGatewayException((error as Error).message); //
        }
    }
}
