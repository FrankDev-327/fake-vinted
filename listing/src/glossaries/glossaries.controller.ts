import { Controller, Post, Body, Put, Param, Get, Delete } from '@nestjs/common';
import { GlossariesService } from './glossaries.service';
import { CreateListingDto } from './dto/create.glossary.dto';
import { UpdateListingDto } from './dto/update.glossary.dto';
import { ListingEntity } from '../entities/listing.entity';

@Controller('glossaries')
export class GlossariesController {
    constructor(private readonly glossaryService: GlossariesService) { }

    @Post()
    async createListing(@Body() body: CreateListingDto): Promise<ListingEntity> {
        return await this.glossaryService.createListing(body)
    }

    @Put(':id')
    async updateListing(@Param('id') id: number, @Body() body: UpdateListingDto): Promise<ListingEntity> {
        return await this.glossaryService.updateListing(id, body);
    }

    @Get()
    async findAll(): Promise<ListingEntity[]> {
        return await this.glossaryService.findAll();
    }

    @Get('user/:user_id')
    async findByUserId(@Param('user_id') user_id: number): Promise<ListingEntity[]> {
        return await this.glossaryService.findByUserId(user_id);
    }

    @Delete(':id')
    async deleteListing(@Param('id') id: number): Promise<void> {
        return await this.glossaryService.deleteListing(id);
    }
}
