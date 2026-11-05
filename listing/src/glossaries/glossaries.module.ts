import { Module } from '@nestjs/common';
import { GlossariesService } from './glossaries.service';
import { GlossariesController } from './glossaries.controller';
import { ListingEntity } from '../entities/listing.entity';
import { ListingImageEntity } from '../entities/listing-image.entity';
import { ImageMetricsService } from './image-metrics.service';
import { InternalImagesController } from './internal-images.controller';
import { MetricsController } from './metrics.controller';
import { ListingImagesController } from './listing-images.controller';
import { ListingImagesService } from './listing-images.service';
import { S3Service } from '../s3/s3.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogsService } from '../loggers/logs.service';

@Module({
  imports: [TypeOrmModule.forFeature([ListingEntity, ListingImageEntity])],
  exports: [GlossariesService,],
  providers: [GlossariesService, ListingImagesService, ImageMetricsService, S3Service, {
    provide: LogsService,
    useValue: new LogsService(GlossariesService.name)
  }],
  controllers: [GlossariesController, ListingImagesController, InternalImagesController, MetricsController]
})
export class GlossariesModule { }
