import {
    IsString,
    IsNumber,
    IsEnum,
    IsOptional,
    IsPositive,
    MinLength,
    MaxLength,
} from 'class-validator';
import { ListingCondition, ListingStatus } from '../../entities/listing.entity';

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

    @IsString()
    @IsOptional()
    location?: string;
}