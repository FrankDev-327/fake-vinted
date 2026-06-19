import { Body, Controller, Param, Post, Put, Get, UseGuards, Delete } from '@nestjs/common';
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

    @UseGuards(JwtguardGuard)
    @Post()
    @ApiOperation({ summary: 'Create a listing for a user' })
    // @ApiOkResponse({ type: LoginUserDto })
    @ApiBadRequestResponse({
        description: 'Error creating listing.',
    })
    async createListing(@Body() body: CreateListingDto): Promise<any> {
        return await this.listingService.createListing(body);
    }

    @UseGuards(JwtguardGuard)
    @Put()
    @ApiOperation({ summary: 'Update a listing for a user' })
    // @ApiOkResponse({ type: LoginUserDto })
    @ApiBadRequestResponse({
        description: 'Error updating listing.',
    })
    async updateListing(@Param('id') id: number, @Body() body: UpdateListingDto): Promise<any> {
        return await this.listingService.updateListing(id, body);
    }

    @UseGuards(JwtguardGuard)
    @Get()
    @ApiOperation({ summary: 'Getting of a  listing for a user' })
    // @ApiOkResponse({ type: LoginUserDto })
    @ApiBadRequestResponse({
        description: 'Error getting listing.',
    })
    async findAll(): Promise<any[]> {
        return await this.listingService.findAll();
    }

    @Delete('truncate')
    async truncateListinsTable(): Promise<void> {
        return await this.listingService.truncateListinsTable();
    }

    @UseGuards(JwtguardGuard)
    @Get('/user/:user_id')
    @ApiOperation({ summary: 'Getting listing by user id' })
    // @ApiOkResponse({ type: LoginUserDto })
    @ApiBadRequestResponse({
        description: 'Error updating listing.',
    })
    async findByUserId(@Param('user_id') user_id: number): Promise<any[]> {
        return await this.listingService.findByUserId(user_id);
    }

    @UseGuards(JwtguardGuard)
    @Delete(':id')
    @ApiOperation({ summary: 'Delete a listing for a user' })
    // @ApiOkResponse({ type: LoginUserDto })
    @ApiBadRequestResponse({
        description: 'Error deleting listing.',
    })
    async deleteListing(@Param('id') id: number): Promise<any> {
        return await this.listingService.deleteListing(id);
    }

    @UseGuards(JwtguardGuard)
    @Get(':id')
    @ApiOperation({ summary: 'Getting listing by id' })
    // @ApiOkResponse({ type: LoginUserDto })
    @ApiBadRequestResponse({
        description: 'Error getting listing by id.',
    })
    async findById(@Param('id') id: number) {
        return await this.listingService.findById(id);
    }


}
