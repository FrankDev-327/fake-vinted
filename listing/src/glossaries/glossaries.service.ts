import { Injectable, BadGatewayException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ListingEntity } from '../entities/listing.entity';
import { LogsService } from '../loggers/logs.service';
import { CreateListingDto } from './dto/create.glossary.dto';
import { UpdateListingDto } from './dto/update.glossary.dto';
import { SearchListingDto } from './dto/search.grossary-dto';

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

    async searchListings(dto: SearchListingDto): Promise<{ data: ListingEntity[], total: number }> {
        try {
            const query = this.listingRepository.createQueryBuilder('listing');

            // full text search using tsvector
            if (dto.q) {
                query.andWhere(
                    `listing.search_vector @@ plainto_tsquery('english', :query)`,
                    { query: dto.q }
                );
                // order by relevance when searching
                query.addSelect(
                    `ts_rank(listing.search_vector, plainto_tsquery('english', :query))`,
                    'rank'
                ).setParameter('query', dto.q)
                    .orderBy('rank', 'DESC');
            } else {
                query.orderBy('listing.created_at', 'DESC');
            }

            // filters
            if (dto.category) {
                query.andWhere('listing.category = :category', { category: dto.category });
            }

            if (dto.brand) {
                query.andWhere('listing.brand ILIKE :brand', { brand: `%${dto.brand}%` });
            }

            if (dto.size) {
                query.andWhere('listing.size = :size', { size: dto.size });
            }

            if (dto.condition) {
                query.andWhere('listing.condition = :condition', { condition: dto.condition });
            }

            if (dto.status) {
                query.andWhere('listing.status = :status', { status: dto.status });
            }

            if (dto.min_price) {
                query.andWhere('listing.price >= :min_price', { min_price: dto.min_price });
            }

            if (dto.max_price) {
                query.andWhere('listing.price <= :max_price', { max_price: dto.max_price });
            }

            if (dto.location) {
                query.andWhere('listing.location ILIKE :location', { location: `%${dto.location}%` });
            }

            // pagination
            const page = dto.page ?? 1;
            const limit = dto.limit ?? 20;
            query.skip((page - 1) * limit).take(limit);

            const [data, total] = await query.getManyAndCount();

            return { data, total };
        } catch (error) {
            this.logService.error(`Error searching listings: ${(error as Error).message}`);
            throw new BadGatewayException((error as Error).message);
        }
    }

    async truncateListinsTable(): Promise<void> {
        try {
            await this.listingRepository.deleteAll();
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw new NotFoundException((error as Error).message);
            }

            this.logService.error(`Error deleting listing: ${(error as Error).message}`);
            throw new BadGatewayException((error as Error).message);
        }
    }
}
