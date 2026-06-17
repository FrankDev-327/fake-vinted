import { Body, Controller, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import {
    ApiTags,
    ApiBadRequestResponse,
    ApiOperation,
    ApiOkResponse,
} from '@nestjs/swagger';
import { CreateUserDto } from './dto/create.user.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
    constructor(private readonly userService: UsersService) { }

    @Post()
    @ApiOperation({ summary: 'Creation of a user' })
    // @ApiOkResponse({ type: LoginUserDto })
    @ApiBadRequestResponse({
        description: 'Error creating user.',
    })
    async createUser(@Body() body: CreateUserDto): Promise<any> {
        return await this.userService.createUser(body);
    }
}
