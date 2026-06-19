import { Controller, Post, Body, Put, Param, Get, Delete, Patch } from '@nestjs/common';
import { GlossariesService } from './glossaries.service';
import { CreateListingDto } from './dto/create.glossary.dto';
import { UpdateListingDto } from './dto/update.glossary.dto';
import { ListingEntity } from '../entities/listing.entity';

@Controller('glossaries')
export class GlossariesController {
    constructor(private readonly glossaryService: GlossariesService) { }

    @Post()
    async createListing(@Body() body: CreateListingDto): Promise<ListingEntity> {
        return await this.glossaryService.createListing(body);
    }

    @Get()
    async findAll(): Promise<ListingEntity[]> {
        return await this.glossaryService.findAll();
    }

    // static routes before dynamic ones
    @Delete('truncate')
    async truncateListingsTable(): Promise<void> {
        return await this.glossaryService.truncateListinsTable();
    }

    @Get('user/:user_id')
    async findByUserId(@Param('user_id') user_id: number): Promise<ListingEntity[]> {
        return await this.glossaryService.findByUserId(user_id);
    }

    // dynamic routes last
    @Get(':id')
    async findById(@Param('id') id: number): Promise<ListingEntity> {
        return await this.glossaryService.findById(id);
    }

    @Patch(':id')
    async updateListing(@Param('id') id: number, @Body() body: UpdateListingDto): Promise<ListingEntity> {
        return await this.glossaryService.updateListing(id, body);
    }

    @Delete(':id')
    async deleteListing(@Param('id') id: number): Promise<void> {
        return await this.glossaryService.deleteListing(id);
    }
}