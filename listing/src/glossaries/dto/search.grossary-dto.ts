import { Type } from 'class-transformer';
import { IsString, IsOptional, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { ListingCondition, ListingStatus } from '../../entities/listing.entity';

export class SearchListingDto {
    @IsString()
    @IsOptional()
    q?: string; // search query

    @IsString()
    @IsOptional()
    category?: string;

    @IsString()
    @IsOptional()
    brand?: string;

    @IsString()
    @IsOptional()
    size?: string;

    @IsEnum(ListingCondition)
    @IsOptional()
    condition?: ListingCondition;

    @IsEnum(ListingStatus)
    @IsOptional()
    status?: ListingStatus;

    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    min_price?: number;

    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    max_price?: number;

    @IsString()
    @IsOptional()
    location?: string;

    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    @Min(1)
    page?: number = 1;

    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    @Max(50)
    limit?: number = 20;
}