import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dbdatasource } from '../orm';
import { ConfigModule } from '@nestjs/config';
import { GlossariesModule } from './glossaries/glossaries.module';
import { LogsModule } from './loggers/logs.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(dbdatasource),
    ConfigModule.forRoot({ isGlobal: true }),
    GlossariesModule,
    LogsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
