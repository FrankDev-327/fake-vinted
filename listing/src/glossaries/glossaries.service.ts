import { Injectable, BadGatewayException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ListingEntity } from '../entities/listing.entity';
import { LogsService } from '../loggers/logs.service';
import { CreateListingDto } from './dto/create.glossary.dto';
import { UpdateListingDto } from './dto/update.glossary.dto';

@Injectable()
export class GlossariesService {
    constructor(
        private readonly logService: LogsService,
        @InjectRepository(ListingEntity) private readonly listingRepository: Repository<ListingEntity>
    ) { }

    async createListing(dto: CreateListingDto): Promise<ListingEntity> {
        try {
            const glossary = this.listingRepository.create(dto);
            return await this.listingRepository.save(glossary);
        } catch (error) {
            this.logService.error(`Error creating listing: ${(error as Error).message}`);
            throw new BadGatewayException((error as Error).message);
        }
    }

    async updateListing(id: number, dto: UpdateListingDto): Promise<ListingEntity> {
        try {
            const listing = await this.findById(id);
            if (!listing) {
                throw new NotFoundException('Listing not found');
            }

            await this.listingRepository.update(id, dto);
            const updatedListing = await this.findById(id);
            return updatedListing;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw new NotFoundException((error as Error).message)
            }

            this.logService.error(`Error updating listing: ${(error as Error).message}`);
            throw new BadGatewayException((error as Error).message);
        }
    }

    async findById(id: number): Promise<ListingEntity | null> {
        try {
            return await this.listingRepository.findOneBy({ id });
        } catch (error) {
            this.logService.error(`Error getting listing item: ${(error as Error).message}`);
            throw new BadGatewayException((error as Error).message);
        }
    }

    async findAll(): Promise<ListingEntity[]> {
        try {
            return await this.listingRepository.find({
                order: { created_at: 'DESC' }
            });
        } catch (error) {
            this.logService.error(`Error finding listings: ${(error as Error).message}`);
            throw new BadGatewayException((error as Error).message);
        }
    }

    async findByUserId(userId: number): Promise<ListingEntity[]> {
        try {
            return await this.listingRepository.findBy({ user_id: userId });
        } catch (error) {
            this.logService.error(`Error finding listings by user: ${(error as Error).message}`);
            throw new BadGatewayException((error as Error).message);
        }
    }

    async deleteListing(id: number): Promise<void> {
        try {
            const listing = await this.listingRepository.findOneBy({ id });
            if (!listing) {
                throw new NotFoundException('Listing not found');
            }
            
            await this.listingRepository.delete(id);
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw new NotFoundException((error as Error).message);
            }

            this.logService.error(`Error deleting listing: ${(error as Error).message}`);
            throw new BadGatewayException((error as Error).message);
        }
    }
}
