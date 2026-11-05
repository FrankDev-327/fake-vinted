import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    DeleteObjectsCommand,
    HeadObjectCommand,
    HeadObjectCommandOutput,
    PutObjectCommand,
    S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const DELETE_OBJECTS_BATCH_SIZE = 1000; // S3 limit per DeleteObjects call

@Injectable()
export class S3Service {
    // Two clients because the host is part of the signature: listing talks to
    // http://floci:4566, while clients upload through the published port.
    private readonly internalClient: S3Client;
    private readonly publicClient: S3Client;
    private readonly bucket: string;

    constructor(configService: ConfigService) {
        this.bucket = configService.getOrThrow<string>('S3_BUCKET');
        const region = configService.getOrThrow<string>('S3_REGION');

        this.internalClient = new S3Client({
            region,
            endpoint: configService.getOrThrow<string>('S3_ENDPOINT'),
            forcePathStyle: true,
        });
        this.publicClient = new S3Client({
            region,
            endpoint: configService.getOrThrow<string>('S3_PUBLIC_ENDPOINT'),
            forcePathStyle: true,
            // otherwise the SDK adds a CRC32 checksum to the URL that clients would have to match
            requestChecksumCalculation: 'WHEN_REQUIRED',
        });
    }

    createUploadUrl(key: string, contentType: string, expiresIn: number): Promise<string> {
        return getSignedUrl(
            this.publicClient,
            new PutObjectCommand({ Bucket: this.bucket, Key: key, ContentType: contentType }),
            { expiresIn, signableHeaders: new Set(['content-type']) },
        );
    }

    /** Returns null when the object doesn't exist. */
    async headObject(key: string): Promise<HeadObjectCommandOutput | null> {
        try {
            return await this.internalClient.send(new HeadObjectCommand({ Bucket: this.bucket, Key: key }));
        } catch (error) {
            if ((error as { $metadata?: { httpStatusCode?: number } }).$metadata?.httpStatusCode === 404) {
                return null;
            }
            throw error;
        }
    }

    async deleteObjects(keys: string[]): Promise<void> {
        for (let i = 0; i < keys.length; i += DELETE_OBJECTS_BATCH_SIZE) {
            const batch = keys.slice(i, i + DELETE_OBJECTS_BATCH_SIZE);
            await this.internalClient.send(
                new DeleteObjectsCommand({
                    Bucket: this.bucket,
                    Delete: { Objects: batch.map((Key) => ({ Key })) },
                }),
            );
        }
    }
}
