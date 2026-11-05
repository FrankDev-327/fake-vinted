import { IsIn, IsString } from 'class-validator';

export const ALLOWED_IMAGE_TYPES: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
};

export class CreateUploadUrlDto {
    @IsIn(Object.keys(ALLOWED_IMAGE_TYPES))
    content_type: string;
}

export class ConfirmImageDto {
    @IsString()
    s3_key: string;
}
