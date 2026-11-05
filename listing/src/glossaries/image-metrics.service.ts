import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { collectDefaultMetrics, Counter, Gauge, Histogram, Registry } from 'prom-client';
import { Repository } from 'typeorm';
import { ListingImageEntity, ListingImageStatus } from '../entities/listing-image.entity';

@Injectable()
export class ImageMetricsService {
    private readonly registry = new Registry();

    private readonly uploadUrls = new Counter({
        name: 'listing_image_upload_urls_total',
        help: 'Upload URLs handed out to clients',
        registers: [this.registry],
    });

    private readonly refusedUploads = new Counter({
        name: 'listing_image_upload_refusals_total',
        help: 'Problems found by the instant checks, before the upload',
        labelNames: ['code'],
        registers: [this.registry],
    });

    private readonly processingResults = new Counter({
        name: 'listing_image_processing_results_total',
        help: 'Results reported by the image-processor Lambda',
        labelNames: ['status', 'code'],
        registers: [this.registry],
    });

    private readonly timeToResult = new Histogram({
        name: 'listing_image_time_to_result_seconds',
        help: 'Time from handing out the upload URL to the first Lambda result',
        labelNames: ['status'],
        buckets: [1, 2, 5, 10, 30, 60, 120, 300],
        registers: [this.registry],
    });

    private readonly imageSize = new Histogram({
        name: 'listing_image_size_bytes',
        help: 'Real size of the images that passed validation',
        buckets: [100 * 1024, 500 * 1024, 1024 * 1024, 2 * 1024 * 1024, 3 * 1024 * 1024, 4 * 1024 * 1024],
        registers: [this.registry],
    });

    private readonly deletedImages = new Counter({
        name: 'listing_images_deleted_total',
        help: 'Images deleted by their owner',
        registers: [this.registry],
    });

    constructor(
        @InjectRepository(ListingImageEntity) private readonly imageRepository: Repository<ListingImageEntity>,
    ) {
        this.registry.setDefaultLabels({ app: 'listing' });
        collectDefaultMetrics({ register: this.registry });

        const imageRepositoryRef = this.imageRepository;
        new Gauge({
            name: 'listing_images',
            help: 'Images currently stored, by status',
            labelNames: ['status'],
            registers: [this.registry],
            async collect() {
                const rows = await imageRepositoryRef
                    .createQueryBuilder('image')
                    .select('image.status', 'status')
                    .addSelect('COUNT(*)', 'count')
                    .groupBy('image.status')
                    .getRawMany<{ status: string; count: string }>();

                for (const status of Object.values(ListingImageStatus)) {
                    const row = rows.find((candidate) => candidate.status === status);
                    this.set({ status }, Number(row?.count ?? 0));
                }
            },
        });
    }

    uploadUrlIssued(): void {
        this.uploadUrls.inc();
    }

    uploadRefused(code: string): void {
        this.refusedUploads.inc({ code });
    }

    processingResult(status: ListingImageStatus, code: string | undefined, sizeBytes: number | undefined): void {
        this.processingResults.inc({ status, code: code ?? 'none' });
        if (status === ListingImageStatus.READY && sizeBytes !== undefined) {
            this.imageSize.observe(sizeBytes);
        }
    }

    firstResult(status: ListingImageStatus, seconds: number): void {
        this.timeToResult.observe({ status }, seconds);
    }

    imageDeleted(): void {
        this.deletedImages.inc();
    }

    contentType(): string {
        return this.registry.contentType;
    }

    metrics(): Promise<string> {
        return this.registry.metrics();
    }
}
