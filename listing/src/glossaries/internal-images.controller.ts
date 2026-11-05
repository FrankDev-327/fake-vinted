import { Body, Controller, Headers, HttpCode, Post, UnauthorizedException, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { timingSafeEqual } from 'crypto';
import { ProcessingResultDto } from './dto/listing-image.dto';
import { ListingImagesService } from './listing-images.service';

// Called by the image-processor Lambda, not reachable through the gateway.
@Controller('internal/images')
export class InternalImagesController {
    private readonly apiKey: Buffer;

    constructor(
        private readonly listingImagesService: ListingImagesService,
        configService: ConfigService,
    ) {
        this.apiKey = Buffer.from(configService.getOrThrow<string>('IMAGE_PROCESSOR_API_KEY'));
    }

    @Post('processing-result')
    @HttpCode(200)
    saveProcessingResult(
        @Headers('x-api-key') apiKey: string,
        @Body(new ValidationPipe()) body: ProcessingResultDto,
    ): Promise<void> {
        const received = Buffer.from(apiKey ?? '');
        if (received.length !== this.apiKey.length || !timingSafeEqual(received, this.apiKey)) {
            throw new UnauthorizedException('Invalid API key');
        }

        return this.listingImagesService.saveProcessingResult(body);
    }
}
