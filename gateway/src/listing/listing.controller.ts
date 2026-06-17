import { Body, Controller, Param, Post, Put, Get, UseGuards } from '@nestjs/common';
import {
    ApiTags,
    ApiBadRequestResponse,
    ApiOperation,
    ApiOkResponse,
} from '@nestjs/swagger';
import { CreateListingDto } from './dto/create.listing.dto';
import { UpdateListingDto } from './dto/update.listing.dto';
import { ListingService } from './listing.service';
import { JwtguardGuard } from '../jwtguard/jwtguard.guard';

@ApiTags('Listing')
@Controller('listing')
export class ListingController {
    constructor(private readonly listingService: ListingService) { }

    //@UseGuards(JwtguardGuard)
    @Post()
    @ApiOperation({ summary: 'Create a listing for a user' })
    // @ApiOkResponse({ type: LoginUserDto })
    @ApiBadRequestResponse({
        description: 'Error creating listing.',
    })
    async createListing(@Body() body: CreateListingDto): Promise<any> {
        return await this.listingService.createListing(body);
    }

    //@UseGuards(JwtguardGuard)
    @Post()
    @ApiOperation({ summary: 'Update a listing for a user' })
    // @ApiOkResponse({ type: LoginUserDto })
    @ApiBadRequestResponse({
        description: 'Error updating listing.',
    })
    async updateListing(@Param('id') id: number, @Body() body: UpdateListingDto): Promise<any> {
        return await this.listingService.updateListing(id, body);
    }
}
