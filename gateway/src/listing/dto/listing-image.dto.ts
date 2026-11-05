import { ApiProperty } from '@nestjs/swagger';

// Validated by the listing service, which owns the rules. The gateway passes its 400s through.
export class CreateUploadUrlDto {
    @ApiProperty({ example: 'jacket.jpg', description: 'Must end in .jpg or .png' })
    file_name: string;

    @ApiProperty({ enum: ['image/jpeg', 'image/png'] })
    content_type: string;

    @ApiProperty({ example: 1048576, description: 'File size in bytes, 4 MB at most' })
    size_bytes: number;
}
