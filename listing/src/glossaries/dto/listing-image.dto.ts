import { IsIn, IsInt, IsOptional, IsString } from 'class-validator';
import { ListingImageStatus } from '../../entities/listing-image.entity';

export class CreateUploadUrlDto {
    file_name: string;
    content_type: string;
    size_bytes: number;
}

// Sent by the image-processor Lambda
export class ProcessingResultDto {
    @IsString()
    s3_key: string;

    @IsIn([ListingImageStatus.READY, ListingImageStatus.REJECTED])
    status: ListingImageStatus;

    @IsOptional()
    @IsInt()
    size_bytes?: number;

    @IsOptional()
    @IsInt()
    width?: number;

    @IsOptional()
    @IsInt()
    height?: number;

    @IsOptional()
    @IsString()
    thumbnail_key?: string;

    @IsOptional()
    @IsString()
    rejection_code?: string;

    @IsOptional()
    @IsString()
    rejection_message?: string;
}
