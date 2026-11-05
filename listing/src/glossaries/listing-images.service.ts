import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { In, Repository } from 'typeorm';
import { ListingEntity } from '../entities/listing.entity';
import { ListingImageEntity } from '../entities/listing-image.entity';
import { LogsService } from '../loggers/logs.service';
import { S3Service } from '../s3/s3.service';
import { ALLOWED_IMAGE_TYPES } from './dto/listing-image.dto';

const UPLOAD_URL_TTL_SECONDS = 300;
const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;

@Injectable()
export class ListingImagesService {
    constructor(
        private readonly s3Service: S3Service,
        private readonly logService: LogsService,
        @InjectRepository(ListingEntity) private readonly listingRepository: Repository<ListingEntity>,
        @InjectRepository(ListingImageEntity) private readonly imageRepository: Repository<ListingImageEntity>,
    ) { }

    async createUploadUrl(listingId: number, userId: number, contentType: string) {
        await this.assertOwner(listingId, userId);

        const s3Key = `${this.keyPrefix(listingId)}${randomUUID()}.${ALLOWED_IMAGE_TYPES[contentType]}`;
        const uploadUrl = await this.s3Service.createUploadUrl(s3Key, contentType, UPLOAD_URL_TTL_SECONDS);

        return {
            upload_url: uploadUrl,
            s3_key: s3Key,
            content_type: contentType,
            expires_in: UPLOAD_URL_TTL_SECONDS,
        };
    }

    async confirmUpload(listingId: number, userId: number, s3Key: string): Promise<ListingImageEntity> {
        await this.assertOwner(listingId, userId);

        if (!s3Key.startsWith(this.keyPrefix(listingId))) {
            throw new BadRequestException('s3_key does not belong to this listing');
        }

        if (await this.imageRepository.existsBy({ s3_key: s3Key })) {
            throw new ConflictException('Image already confirmed');
        }

        const object = await this.s3Service.headObject(s3Key);
        if (!object) {
            throw new BadRequestException('Image has not been uploaded');
        }

        // A presigned PUT can't cap the size, so this is where it gets enforced.
        const size = object.ContentLength ?? 0;
        const contentType = object.ContentType ?? '';
        if (size > MAX_IMAGE_SIZE_BYTES || !ALLOWED_IMAGE_TYPES[contentType]) {
            await this.s3Service.deleteObjects([s3Key]);
            throw new BadRequestException('Image must be a JPEG, PNG or WebP of 10 MB or less');
        }

        return await this.imageRepository.save(
            this.imageRepository.create({
                listing_id: listingId,
                s3_key: s3Key,
                content_type: contentType,
                size_bytes: size,
            }),
        );
    }

    async deleteImage(listingId: number, userId: number, imageId: number): Promise<void> {
        await this.assertOwner(listingId, userId);

        const image = await this.imageRepository.findOneBy({ id: imageId, listing_id: listingId });
        if (!image) {
            throw new NotFoundException('Image not found');
        }

        await this.imageRepository.delete(image.id);
        await this.removeObjects([image.s3_key]);
    }

    async attachImages(listings: ListingEntity[]): Promise<void> {
        if (listings.length === 0) return;

        const images = await this.imageRepository.find({
            where: { listing_id: In(listings.map((listing) => listing.id)) },
            order: { id: 'ASC' },
        });

        for (const listing of listings) {
            listing.images = images.filter((image) => image.listing_id === listing.id);
        }
    }

    async findKeysByListing(listingId: number): Promise<string[]> {
        const images = await this.imageRepository.findBy({ listing_id: listingId });
        return images.map((image) => image.s3_key);
    }

    async findAllKeys(): Promise<string[]> {
        const images = await this.imageRepository.find({ select: { id: true, s3_key: true } });
        return images.map((image) => image.s3_key);
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

    private keyPrefix(listingId: number): string {
        return `listings/${listingId}/`;
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
