import {
    ApiTags,
    ApiBadRequestResponse,
    ApiOperation,
} from '@nestjs/swagger';
import { CreateListingDto } from './dto/create.listing.dto';
import { UpdateListingDto } from './dto/update.listing.dto';
import { ListingService } from './listing.service';
import { JwtguardGuard } from '../jwtguard/jwtguard.guard';
import { SearchListingDto } from './dto/search.grossary-dto';
import { Body, Controller, Param, Post, Put, Get, UseGuards, Delete, Patch, Query } from '@nestjs/common';

@ApiTags('Listing')
@Controller('listing')
export class ListingController {
    constructor(private readonly listingService: ListingService) { }

    @UseGuards(JwtguardGuard)
    @Post()
    @ApiOperation({ summary: 'Create a listing for a user' })
    @ApiBadRequestResponse({ description: 'Error creating listing.' })
    async createListing(@Body() body: CreateListingDto): Promise<any> {
        return await this.listingService.createListing(body);
    }

    // specific static routes first
    @Delete('truncate')
    @ApiOperation({ summary: 'Truncate listings table' })
    async truncateListingsTable(): Promise<void> {
        return await this.listingService.truncateListinsTable();
    }

    @UseGuards(JwtguardGuard)
    @Get('search')
    async searchListings(@Query() dto: SearchListingDto): Promise<any> {
        return await this.listingService.searchListings(dto);
    }

    @UseGuards(JwtguardGuard)
    @Get('user/:user_id')
    @ApiOperation({ summary: 'Get listings by user id' })
    @ApiBadRequestResponse({ description: 'Error getting listings by user.' })
    async findByUserId(@Param('user_id') user_id: number): Promise<any[]> {
        return await this.listingService.findByUserId(user_id);
    }

    // dynamic routes after static ones
    @UseGuards(JwtguardGuard)
    @Get(':id')
    @ApiOperation({ summary: 'Get listing by id' })
    @ApiBadRequestResponse({ description: 'Error getting listing by id.' })
    async findById(@Param('id') id: number): Promise<any> {
        return await this.listingService.findById(id);
    }

    @UseGuards(JwtguardGuard)
    @Patch(':id')
    @ApiOperation({ summary: 'Update a listing' })
    @ApiBadRequestResponse({ description: 'Error updating listing.' })
    async updateListing(@Param('id') id: number, @Body() body: UpdateListingDto): Promise<any> {
        return await this.listingService.updateListing(id, body);
    }

    @UseGuards(JwtguardGuard)
    @Delete(':id')
    @ApiOperation({ summary: 'Delete a listing' })
    @ApiBadRequestResponse({ description: 'Error deleting listing.' })
    async deleteListing(@Param('id') id: number): Promise<any> {
        return await this.listingService.deleteListing(id);
    }
}