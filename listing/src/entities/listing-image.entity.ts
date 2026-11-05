import {
    AfterInsert,
    AfterLoad,
    Column,
    CreateDateColumn,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { ListingEntity } from './listing.entity';

export enum ListingImageStatus {
    PENDING = 'pending',
    READY = 'ready',
    REJECTED = 'rejected',
}

@Entity('listing_images')
export class ListingImageEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Index()
    @Column()
    listing_id: number;

    @ManyToOne(() => ListingEntity, (listing) => listing.images, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'listing_id' })
    listing: ListingEntity;

    @Column({ unique: true })
    s3_key: string;

    @Column()
    content_type: string;

    @Column()
    size_bytes: number;

    @Column({
        type: 'enum',
        enum: ListingImageStatus,
        enumName: 'listing_image_status',
        default: ListingImageStatus.PENDING,
    })
    status: ListingImageStatus;

    @Column({ type: 'varchar', nullable: true })
    rejection_code: string | null;

    @Column({ type: 'varchar', nullable: true })
    rejection_message: string | null;

    @Column({ type: 'varchar', nullable: true })
    thumbnail_key: string | null;

    @Column({ type: 'int', nullable: true })
    width: number | null;

    @Column({ type: 'int', nullable: true })
    height: number | null;

    @CreateDateColumn()
    created_at: Date;

    url: string;
    thumbnail_url: string | null;

    @AfterLoad()
    @AfterInsert()
    buildUrls(): void {
        this.url = this.publicUrl(this.s3_key);
        this.thumbnail_url = this.thumbnail_key ? this.publicUrl(this.thumbnail_key) : null;
    }

    private publicUrl(key: string): string {
        return `${process.env.S3_PUBLIC_ENDPOINT}/${process.env.S3_BUCKET}/${key}`;
    }
}
