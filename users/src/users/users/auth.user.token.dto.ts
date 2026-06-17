import { IsString } from "class-validator";

export class LoginUserDto {
    @IsString()
    access_token: string
}