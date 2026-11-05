import { ApiProperty } from '@nestjs/swagger';

// Validated by the listing service, which owns the rules. The gateway passes its 400s through.
export class CreateUploadUrlDto {
    @ApiProperty({ enum: ['image/jpeg', 'image/png', 'image/webp'] })
    content_type: string;
}

export class ConfirmImageDto {
    @ApiProperty({ example: 'listings/1/3f8a1c2e-0000-4000-8000-000000000000.jpg' })
    s3_key: string;
}
