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

export class CreateListingDto {
    @IsNumber()
    user_id: number;

    @IsString()
    @MinLength(3)
    @MaxLength(100)
    title: string;

    @IsString()
    @MinLength(10)
    @MaxLength(1000)
    description: string;

    @IsNumber()
    @IsPositive()
    price: number;

    @IsString()
    category: string;

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