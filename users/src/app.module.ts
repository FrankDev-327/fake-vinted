import { Module } from '@nestjs/common';
import { LogsModule } from './loggers/logs.module';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dbdatasource } from '../orm';
import { ConfigModule } from '@nestjs/config';
@Module({
  imports: [
    LogsModule,
    UsersModule,
    TypeOrmModule.forRoot(dbdatasource),
    ConfigModule.forRoot({ isGlobal: true }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
