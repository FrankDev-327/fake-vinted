import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { In, MoreThan, Repository } from 'typeorm';
import { ListingEntity } from '../entities/listing.entity';
import { ListingImageEntity, ListingImageStatus } from '../entities/listing-image.entity';
import { LogsService } from '../loggers/logs.service';
import { S3Service } from '../s3/s3.service';
import { CreateUploadUrlDto, ProcessingResultDto } from './dto/listing-image.dto';
import { ImageMetricsService } from './image-metrics.service';
import { imageExtension, validateImageUpload } from './image-upload.validation';

const UPLOAD_URL_TTL_SECONDS = 300;
const MAX_IMAGES_PER_LISTING = 10;

@Injectable()
export class ListingImagesService {
    constructor(
        private readonly s3Service: S3Service,
        private readonly logService: LogsService,
        private readonly imageMetrics: ImageMetricsService,
        @InjectRepository(ListingEntity) private readonly listingRepository: Repository<ListingEntity>,
        @InjectRepository(ListingImageEntity) private readonly imageRepository: Repository<ListingImageEntity>,
    ) { }

    // The row is created here, before the upload, so it always exists by the time the
    // Lambda reports its result. Otherwise a fast Lambda could finish with no row to update.
    async createUploadUrl(listingId: number, userId: number, dto: CreateUploadUrlDto) {
        await this.assertOwner(listingId, userId);

        const errors = validateImageUpload(dto);
        if (errors.length > 0) {
            errors.forEach((error) => this.imageMetrics.uploadRefused(error.code));
            throw new BadRequestException({
                statusCode: 400,
                error: 'Bad Request',
                message: 'The image did not pass validation.',
                errors,
            });
        }

        if ((await this.countActiveImages(listingId)) >= MAX_IMAGES_PER_LISTING) {
            this.imageMetrics.uploadRefused('TOO_MANY_IMAGES');
            throw new ConflictException({
                statusCode: 409,
                error: 'Conflict',
                code: 'TOO_MANY_IMAGES',
                message: `A listing can have up to ${MAX_IMAGES_PER_LISTING} images. Delete one to add another.`,
            });
        }

        const s3Key = `listings/${listingId}/${randomUUID()}.${imageExtension(dto.content_type)}`;
        const uploadUrl = await this.s3Service.createUploadUrl(s3Key, dto.content_type, UPLOAD_URL_TTL_SECONDS);
        const image = await this.imageRepository.save(
            this.imageRepository.create({
                listing_id: listingId,
                s3_key: s3Key,
                content_type: dto.content_type,
                size_bytes: dto.size_bytes,
            }),
        );

        this.imageMetrics.uploadUrlIssued();

        return {
            image_id: image.id,
            status: image.status,
            upload_url: uploadUrl,
            content_type: dto.content_type,
            expires_in: UPLOAD_URL_TTL_SECONDS,
        };
    }

    async getImage(listingId: number, userId: number, imageId: number) {
        await this.assertOwner(listingId, userId);
        const image = await this.findImage(listingId, imageId);

        return {
            id: image.id,
            listing_id: image.listing_id,
            status: image.status,
            message: this.statusMessage(image),
            rejection_code: image.rejection_code,
            url: image.status === ListingImageStatus.READY ? image.url : null,
            thumbnail_url: image.thumbnail_url,
            width: image.width,
            height: image.height,
            size_bytes: image.size_bytes,
            content_type: image.content_type,
            created_at: image.created_at,
        };
    }

    async saveProcessingResult(result: ProcessingResultDto): Promise<void> {
        const image = await this.imageRepository.findOneBy({ s3_key: result.s3_key });
        if (!image) {
            throw new NotFoundException('Image not found');
        }

        // Always applied, whatever the current status: the upload URL stays valid for
        // 5 minutes, so an image that passed can be overwritten with one that doesn't.
        await this.imageRepository.update(image.id, {
            status: result.status,
            size_bytes: result.size_bytes ?? image.size_bytes,
            width: result.width ?? null,
            height: result.height ?? null,
            thumbnail_key: result.thumbnail_key ?? null,
            rejection_code: result.rejection_code ?? null,
            rejection_message: result.rejection_message ?? null,
        });

        this.imageMetrics.processingResult(result.status, result.rejection_code, result.size_bytes);
        // Only the first result: an overwrite minutes later says nothing about processing time
        if (image.status === ListingImageStatus.PENDING) {
            this.imageMetrics.firstResult(result.status, (Date.now() - image.created_at.getTime()) / 1000);
        }

        // An overwrite that got rejected would leave the earlier thumbnail behind
        if (image.thumbnail_key && image.thumbnail_key !== result.thumbnail_key) {
            await this.removeObjects([image.thumbnail_key]);
        }
    }

    async deleteImage(listingId: number, userId: number, imageId: number): Promise<void> {
        await this.assertOwner(listingId, userId);
        const image = await this.findImage(listingId, imageId);

        await this.imageRepository.delete(image.id);
        await this.removeObjects(this.objectKeys([image]));
        this.imageMetrics.imageDeleted();
    }

    // Public listing data only ever shows images that passed validation.
    async attachImages(listings: ListingEntity[]): Promise<void> {
        if (listings.length === 0) return;

        const images = await this.imageRepository.find({
            where: { listing_id: In(listings.map((listing) => listing.id)), status: ListingImageStatus.READY },
            order: { id: 'ASC' },
        });

        const imagesByListing = new Map<number, ListingImageEntity[]>();
        for (const image of images) {
            imagesByListing.set(image.listing_id, [...(imagesByListing.get(image.listing_id) ?? []), image]);
        }

        for (const listing of listings) {
            listing.images = imagesByListing.get(listing.id) ?? [];
        }
    }

    async findKeysByListing(listingId: number): Promise<string[]> {
        return this.objectKeys(await this.imageRepository.findBy({ listing_id: listingId }));
    }

    async findAllKeys(): Promise<string[]> {
        return this.objectKeys(await this.imageRepository.find());
    }

    // Runs after the DB delete: a failure leaves an orphaned object, never a row
    // pointing at an image that's gone.
    async removeObjects(keys: string[]): Promise<void> {
        try {
            await this.s3Service.deleteObjects(keys);
        } catch (error) {
            this.logService.error(`Error deleting images from S3: ${(error as Error).message}`);
        }
    }

    private objectKeys(images: ListingImageEntity[]): string[] {
        return images.flatMap((image) => (image.thumbnail_key ? [image.s3_key, image.thumbnail_key] : [image.s3_key]));
    }

    private statusMessage(image: ListingImageEntity): string {
        if (image.status === ListingImageStatus.READY) {
            return 'The image is ready.';
        }
        if (image.status === ListingImageStatus.REJECTED) {
            return image.rejection_message as string;
        }

        const ageSeconds = (Date.now() - image.created_at.getTime()) / 1000;
        return ageSeconds > UPLOAD_URL_TTL_SECONDS
            ? 'The upload was not completed or could not be processed. Please upload the image again.'
            : 'Waiting for the upload to be received and checked.';
    }

    // Rejected images don't count, and neither do pending ones whose upload URL has expired.
    private countActiveImages(listingId: number): Promise<number> {
        const uploadUrlStillValid = new Date(Date.now() - UPLOAD_URL_TTL_SECONDS * 1000);
        return this.imageRepository.count({
            where: [
                { listing_id: listingId, status: ListingImageStatus.READY },
                { listing_id: listingId, status: ListingImageStatus.PENDING, created_at: MoreThan(uploadUrlStillValid) },
            ],
        });
    }

    private async findImage(listingId: number, imageId: number): Promise<ListingImageEntity> {
        const image = await this.imageRepository.findOneBy({ id: imageId, listing_id: listingId });
        if (!image) {
            throw new NotFoundException('Image not found');
        }
        return image;
    }

    private async assertOwner(listingId: number, userId: number): Promise<void> {
        const listing = await this.listingRepository.findOneBy({ id: listingId });
        if (!listing) {
            throw new NotFoundException('Listing not found');
        }
        if (listing.user_id !== userId) {
            throw new ForbiddenException('You do not own this listing');
        }
    }
}
