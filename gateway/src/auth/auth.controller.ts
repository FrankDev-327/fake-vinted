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
import { Throttle, SkipThrottle } from '@nestjs/throttler';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Throttle({ default: { ttl: 60000, limit: 5 } })
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
