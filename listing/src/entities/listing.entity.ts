import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

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

@Entity('listings')
export class ListingEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    user_id: number;

    @Column()
    title: string;

    @Column({ type: 'text' })
    description: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    price: number;

    @Column()
    category: string;

    @Column({ nullable: true })
    brand: string;

    @Column({ nullable: true })
    size: string;

    @Column({
        type: 'enum',
        enum: ListingCondition,
        default: ListingCondition.GOOD,
    })
    condition: ListingCondition;

    @Column({
        type: 'enum',
        enum: ListingStatus,
        default: ListingStatus.AVAILABLE,
    })
    status: ListingStatus;

    @Column({ type: 'simple-array', nullable: true })
    images: string[];

    @Column({ nullable: true })
    location: string;

    @Column({ type: 'tsvector', nullable: true, select: false })
    search_vector: any;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}