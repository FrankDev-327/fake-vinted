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

    @CreateDateColumn()
    created_at: Date;

    // Only the key is stored, so moving to another host or a CDN doesn't need a data migration.
    url: string;

    @AfterLoad()
    @AfterInsert()
    buildUrl(): void {
        this.url = `${process.env.S3_PUBLIC_ENDPOINT}/${process.env.S3_BUCKET}/${this.s3_key}`;
    }
}
