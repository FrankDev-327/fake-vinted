import { Module } from '@nestjs/common';
import { UserEntity } from '../entities/user.entity';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { LogsService } from '../loggers/logs.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]),],
  exports: [UsersService],
  providers: [UsersService, {
    provide: LogsService,
    useValue: new LogsService(UsersService.name)
  }],
  controllers: [UsersController]
})
export class UsersModule { }
