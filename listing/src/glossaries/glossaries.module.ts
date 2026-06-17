import { Module } from '@nestjs/common';
import { GlossariesService } from './glossaries.service';
import { GlossariesController } from './glossaries.controller';
import { ListingEntity } from '../entities/listing.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogsService } from '../loggers/logs.service';

@Module({
  imports: [TypeOrmModule.forFeature([ListingEntity])],
  exports: [GlossariesService,],
  providers: [GlossariesService, {
    provide: LogsService,
    useValue: new LogsService(GlossariesService.name)
  }],
  controllers: [GlossariesController]
})
export class GlossariesModule { }
