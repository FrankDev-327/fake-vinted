import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthLoginDto } from './dto/auth.login.dto';
import { LoginUserDto } from '../users/response/auth.user.token.dto';
import {
    ApiTags,
    ApiBadRequestResponse,
    ApiOperation,
    ApiOkResponse,
} from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('login')
    @ApiOperation({ summary: 'User autentication' })
    @ApiOkResponse({ type: LoginUserDto })
    @ApiBadRequestResponse({
        description: 'The username or password are wrong. Try again.',
    })
    async login(@Body() authLoginDto: AuthLoginDto): Promise<LoginUserDto> {
        return this.authService.authenticateUser(authLoginDto);
    }
}
