export class UserResponseDto {
    id: string;
    email: string;
    username: string;
    full_name: string;
    avatar_url: string;
    bio: string;
    city: string;
    country: string;
    rating: number;
    total_reviews: number;
    items_sold: number;
    is_verified: boolean;
    created_at: Date;
}