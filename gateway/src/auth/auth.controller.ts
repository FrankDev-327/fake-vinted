import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthLoginDto } from './dto/auth.login.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('login')
    async login(@Body() authLoginDto: AuthLoginDto): Promise<any> {
        return this.authService.authenticateUser(authLoginDto);
    }
}
