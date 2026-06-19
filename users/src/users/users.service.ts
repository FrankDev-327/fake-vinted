import { Injectable, BadGatewayException, NotFoundException, ConflictException, UnauthorizedException } from '@nestjs/common';
import { UserEntity } from '../entities/user.entity';
import { LogsService } from '../loggers/logs.service';
import { CreateUserDto } from './dto/users/create.user.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateUserDto } from './dto/users/update.user.dto';
import { comparePasswords } from '../utils/generic';
import { AuthUserDto } from './dto/users/auth.user.dto';

@Injectable()
export class UsersService {
    constructor(
        private readonly logsService: LogsService,
        @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>
    ) { }

    async createUser(createUserDto: CreateUserDto): Promise<UserEntity> {
        try {
            const existingUser = await this.userRepository.findOneBy({ email: createUserDto.email });
            if (existingUser) {
                throw new ConflictException('User with this email already exists');
            }

            const user = this.userRepository.create(createUserDto);
            const userSaved = await this.userRepository.save(user);
            delete userSaved.password;
            return userSaved;
        } catch (error) {
            if (error instanceof ConflictException || error instanceof NotFoundException) {
                throw error;
            }

            this.logsService.error(`Error creating user: ${(error as Error).message}`);
            throw new BadGatewayException('Error creating user');
        }
    }

    async authenticateUser(authUserDto: AuthUserDto): Promise<UserEntity> {
        try {
            const user = await this.userRepository.findOneBy({ username: authUserDto.username });
            if (!user) {
                throw new NotFoundException('User not found');
            }

            const isPasswordValid = await comparePasswords(authUserDto.password, user.password);
            if (!isPasswordValid) {
                throw new UnauthorizedException('Invalid credentials');
            }

            
            delete user.password;
            return user;
        } catch (error) {
            this.logsService.error(`Error authenticating user: ${(error as Error).message}`);
            throw new BadGatewayException('Error authenticating user');
        }
    }

    async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<UserEntity> {
        try {
            const existingUser = await this.userRepository.findOneBy({ id });
            if (!existingUser) {
                throw new ConflictException('User not found');
            }

            await this.userRepository.update(id, updateUserDto);
            const updatedUser = await this.userRepository.findOneBy({ id });
            delete updatedUser.password;
            return updatedUser;
        } catch (error) {
            if (error instanceof ConflictException || error instanceof NotFoundException) {
                throw error;
            }

            this.logsService.error(`Error updating user: ${(error as Error).message}`);
            throw new BadGatewayException('Error updating user');
        }
    }

    async findByEmail(email: string): Promise<UserEntity | null> {
        try {
            return await this.userRepository.findOneBy({ email });
        } catch (error) {
            this.logsService.error(`Error finding user by email: ${(error as Error).message}`);
            throw new BadGatewayException('Error finding user by email');
        }
    }

    async findById(id: string): Promise<UserEntity | null> {
        try {
            return await this.userRepository.findOneBy({ id });
        } catch (error) {
            this.logsService.error(`Error finding user by id: ${(error as Error).message}`);
            throw new BadGatewayException('Error finding user by id');
        }
    }
}
