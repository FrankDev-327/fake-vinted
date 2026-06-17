import {
    IsString,
    IsNumber,
    IsEnum,
    IsOptional,
    IsArray,
    IsPositive,
    MinLength,
    MaxLength,
} from 'class-validator';

export enum ListingCondition {
    NEW = 'new',
    LIKE_NEW = 'like_new',
    GOOD = 'good',
    FAIR = 'fair',
}

export enum ListingStatus {
    AVAILABLE = 'available',
    RESERVED = 'reserved',
    SOLD = 'sold',
}

export class UpdateListingDto {
    @IsString()
    @IsOptional()
    @MinLength(3)
    @MaxLength(100)
    title?: string;

    @IsString()
    @IsOptional()
    @MinLength(10)
    @MaxLength(1000)
    description?: string;

    @IsNumber()
    @IsPositive()
    @IsOptional()
    price?: number;

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

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    images?: string[];

    @IsString()
    @IsOptional()
    location?: string;
}