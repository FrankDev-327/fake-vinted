import {
    BadRequestException,
    Body,
    Controller,
    createParamDecorator,
    Delete,
    ExecutionContext,
    Param,
    ParseIntPipe,
    Post,
    ValidationPipe,
} from '@nestjs/common';
import { ConfirmImageDto, CreateUploadUrlDto } from './dto/listing-image.dto';
import { ListingImagesService } from './listing-images.service';

// x-user-id is set by the gateway from the verified JWT.
const UserId = createParamDecorator((_: unknown, context: ExecutionContext): number => {
    const userId = Number(context.switchToHttp().getRequest().headers['x-user-id']);
    if (!Number.isInteger(userId)) {
        throw new BadRequestException('x-user-id header is required');
    }
    return userId;
});

@Controller('glossaries/:id/images')
export class ListingImagesController {
    constructor(private readonly listingImagesService: ListingImagesService) { }

    @Post('upload-url')
    createUploadUrl(
        @Param('id', ParseIntPipe) id: number,
        @UserId() userId: number,
        @Body(new ValidationPipe()) body: CreateUploadUrlDto,
    ) {
        return this.listingImagesService.createUploadUrl(id, userId, body.content_type);
    }

    @Post()
    confirmUpload(
        @Param('id', ParseIntPipe) id: number,
        @UserId() userId: number,
        @Body(new ValidationPipe()) body: ConfirmImageDto,
    ) {
        return this.listingImagesService.confirmUpload(id, userId, body.s3_key);
    }

    @Delete(':imageId')
    deleteImage(
        @Param('id', ParseIntPipe) id: number,
        @Param('imageId', ParseIntPipe) imageId: number,
        @UserId() userId: number,
    ) {
        return this.listingImagesService.deleteImage(id, userId, imageId);
    }
}
