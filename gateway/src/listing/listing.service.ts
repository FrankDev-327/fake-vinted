import { Injectable, BadGatewayException, NotFoundException } from '@nestjs/common';
import { CreateListingDto } from './dto/create.listing.dto';
import { UpdateListingDto } from './dto/update.listing.dto';
import { PromGatewayService } from '../prom-gateway/prom-gateway.service';
import { AxiosServiceService } from '../axios-service/axios-service.service';
import { ConfigService } from '@nestjs/config';
import { Logs } from '../loggers/loggers.service';
import { SearchListingDto } from './dto/search.grossary-dto';

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

            if (error instanceof NotFoundException) {
                throw new NotFoundException((error as Error).message)
            }
            throw new BadGatewayException((error as Error).message);
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
            if (error instanceof NotFoundException) {
                throw new NotFoundException((error as Error).message)
            }
            throw new BadGatewayException((error as Error).message);
        }
    }

    async findAll(): Promise<any> {
        try {
            const url = `${this.configService.get<string>('MS_LISTING_URL')}/glossaries`;
            const headers = { 'Content-Type': 'application/json' };
            const response = await this.axiosService.get(url, headers);

            this.promGatewayService.incrementRequestCounter('GET', '/listing', 200);
            return response;
        } catch (error) {
            this.promGatewayService.incrementRequestCounter('GET', '/listing/', 502);
            this.logs.error(`Error getting all listing: ${(error as Error).message}`, error);

            if (error instanceof NotFoundException) {
                throw new NotFoundException((error as Error).message)
            }
            throw new BadGatewayException((error as Error).message); //
        }
    }

    async findByUserId(user_id: number): Promise<any> {
        try {
            const url = `${this.configService.get<string>('MS_LISTING_URL')}/glossaries/user/${user_id}`;
            const headers = { 'Content-Type': 'application/json' };
            const response = await this.axiosService.get(url, headers);

            this.promGatewayService.incrementRequestCounter('GET', `/listing/${user_id}`, 200);
            return response;
        } catch (error) {
            this.promGatewayService.incrementRequestCounter('GET', `/listing/${user_id}`, 502);
            this.logs.error(`Error getting all listing by user id: ${(error as Error).message}`, error);

            if (error instanceof NotFoundException) {
                throw new NotFoundException((error as Error).message)
            }
            throw new BadGatewayException((error as Error).message); //
        }
    }

    async deleteListing(id: number): Promise<any> {
        try {
            const url = `${this.configService.get<string>('MS_LISTING_URL')}/glossaries/${id}`;
            const headers = { 'Content-Type': 'application/json' };
            const response = await this.axiosService.delete(url, headers);

            this.promGatewayService.incrementRequestCounter('DEL', `/listing/${id}`, 200);
            return response;
        } catch (error) {
            this.promGatewayService.incrementRequestCounter('DEL', `/listing/${id}`, 502);
            this.logs.error(`Error deleting listing by id: ${(error as Error).message}`, error);

            if (error instanceof NotFoundException) {
                throw new NotFoundException((error as Error).message)
            }

            throw new BadGatewayException((error as Error).message);
        }
    }

    async findById(id: number): Promise<any> {
        try {
            const url = `${this.configService.get<string>('MS_LISTING_URL')}/glossaries/${id}`;
            const headers = { 'Content-Type': 'application/json' };
            const response = await this.axiosService.get(url, headers);

            this.promGatewayService.incrementRequestCounter('GET', `/listing/${id}`, 200);
            return response;
        } catch (error) {
            this.promGatewayService.incrementRequestCounter('GET', `/listing/${id}`, 502);
            this.logs.error(`Error getting listing by id: ${(error as Error).message}`, error);

            if (error instanceof NotFoundException) {
                throw new NotFoundException((error as Error).message)
            }

            throw new BadGatewayException((error as Error).message);
        }
    }

    async searchListings(query: SearchListingDto): Promise<any> {
        try {
            const params = new URLSearchParams(query as any).toString();
            const url = `${this.configService.get<string>('MS_LISTING_URL')}/glossaries/search?${params}`;
            const headers = { 'Content-Type': 'application/json' };
            const response = await this.axiosService.get(url, headers);
            this.promGatewayService.incrementRequestCounter('GET', '/listing/search', 200);
            return response;
        } catch (error) {
            this.promGatewayService.incrementRequestCounter('GET', '/listing/search', 502);
            this.logs.error(`Error searching listings: ${(error as Error).message}`, error);
            throw new BadGatewayException((error as Error).message);
        }
    }

    async truncateListinsTable(): Promise<void> {
        try {
            const url = `${this.configService.get<string>('MS_LISTING_URL')}/glossaries/truncate`;
            const headers = { 'Content-Type': 'application/json' };
            const response = await this.axiosService.delete(url, headers);

            return response;
        } catch (error) {
            console.log(error);

            this.logs.error(`Error deleteting listing: ${(error as Error).message}`, error);
            if (error instanceof NotFoundException) {
                throw new NotFoundException((error as Error).message)
            }

            throw new BadGatewayException((error as Error).message);
        }
    }
}
