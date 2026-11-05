import {
    BadRequestException,
    Body,
    Controller,
    createParamDecorator,
    Delete,
    ExecutionContext,
    Get,
    Param,
    ParseIntPipe,
    Post,
} from '@nestjs/common';
import { CreateUploadUrlDto } from './dto/listing-image.dto';
import { ListingImagesService } from './listing-images.service';

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
        @Body() body: CreateUploadUrlDto,
    ) {
        return this.listingImagesService.createUploadUrl(id, userId, body);
    }

    @Get(':imageId')
    getImage(
        @Param('id', ParseIntPipe) id: number,
        @Param('imageId', ParseIntPipe) imageId: number,
        @UserId() userId: number,
    ) {
        return this.listingImagesService.getImage(id, userId, imageId);
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
