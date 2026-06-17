import { Body, Controller, Param, Post, Put, Get, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import {
    ApiTags,
    ApiBadRequestResponse,
    ApiOperation,
    ApiOkResponse,
} from '@nestjs/swagger';
import { CreateUserDto } from './dto/create.user.dto';
import { UpdateUserDto } from './dto/update.user.dto';
import { JwtguardGuard } from '../jwtguard/jwtguard.guard';

@ApiTags('Users')
@Controller('users')
export class UsersController {
    constructor(private readonly userService: UsersService) { }

    @Post()
    @ApiOperation({ summary: 'Creation of an user' })
    // @ApiOkResponse({ type: LoginUserDto })
    @ApiBadRequestResponse({
        description: 'Error creating user.',
    })
    async createUser(@Body() body: CreateUserDto): Promise<any> {
        return await this.userService.createUser(body);
    }

    @UseGuards(JwtguardGuard)
    @Put(':id')
    @ApiOperation({ summary: 'Update of an user' })
    // @ApiOkResponse({ type: LoginUserDto })
    @ApiBadRequestResponse({
        description: 'Error updating user.',
    })
    async updateUser(@Param('id') id: number, @Body() body: UpdateUserDto): Promise<any> {
        return await this.userService.updateUser(id, body);
    }

    @UseGuards(JwtguardGuard)
    @Get(':id')
    @ApiOperation({ summary: 'Get info of an user' })
    // @ApiOkResponse({ type: LoginUserDto })
    @ApiBadRequestResponse({
        description: 'Error getting details user.',
    })
    async findUserById(@Param('id') id: number): Promise<any> {
        return await this.userService.findUserById(id);
    }
}
