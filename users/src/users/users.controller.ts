import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { CreateUserDto } from './dto/users/create.user.dto';
import { UsersService } from './users.service';
import { UserEntity } from '../entities/user.entity';
import { UpdateUserDto } from './dto/users/update.user.dto';
import { AuthUserDto } from './dto/users/auth.user.dto';
import { LoginUserDto } from './users/auth.user.token.dto';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post()
    async createUser(@Body() createUserDto: CreateUserDto): Promise<UserEntity> {
        return await this.usersService.createUser(createUserDto);
    }

    @Get(':id')
    async findUserById(@Param('id') id: string): Promise<UserEntity | null> {
        return await this.usersService.findById(id);
    }

    @Put(':id')
    async updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto): Promise<UserEntity> {
        return await this.usersService.updateUser(id, updateUserDto);
    }

    @Post('/authenticate')
    async authenticateUser(@Body() authUserDto: AuthUserDto): Promise<LoginUserDto> { 
        return await this.usersService.authenticateUser(authUserDto);
    }
}
