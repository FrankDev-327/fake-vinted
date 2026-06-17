import { Module } from '@nestjs/common';
import { UserEntity } from '../entities/user.entity';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { LogsService } from '../loggers/logs.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]),
  JwtModule.register({
    global: true,
    secret: process.env.KEY_SECRET,
    signOptions: {
      expiresIn: '15m',
    },
  }),],
  exports: [UsersService],
  providers: [UsersService, {
    provide: LogsService,
    useValue: new LogsService(UsersService.name)
  }],
  controllers: [UsersController]
})
export class UsersModule { }
