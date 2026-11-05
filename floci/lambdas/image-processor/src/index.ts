import { S3Event } from 'aws-lambda';
import {
    DeleteObjectCommand,
    GetObjectCommand,
    HeadObjectCommand,
    PutObjectCommand,
    S3Client,
} from '@aws-sdk/client-s3';
import sharp from 'sharp';
import { assertAllowedImage, assertAllowedSize, ImageRejection, MAX_DIMENSION } from './validation';

const THUMBNAIL_WIDTH = 400;

// Floci injects AWS_ENDPOINT_URL and needs path-style URLs. Real AWS needs neither.
const s3 = new S3Client({ forcePathStyle: Boolean(process.env.AWS_ENDPOINT_URL) });

type ProcessingResult =
    | { s3_key: string; status: 'ready'; size_bytes: number; width: number; height: number; thumbnail_key: string }
    | { s3_key: string; status: 'rejected'; rejection_code: string; rejection_message: string };

// S3 calls this asynchronously, so nothing returned here reaches the user. Results go
// to the listing service, where the client reads them. A rejected image is an expected
// outcome and must not throw: throwing is what makes Lambda retry, so it's only for
// failures a retry could fix, like the listing service being down.
export const handler = async (event: S3Event): Promise<void> => {
    for (const record of event.Records) {
        // S3 URL-encodes keys in events and turns spaces into "+"
        const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));
        await processImage(record.s3.bucket.name, key);
    }
};

async function processImage(bucket: string, key: string): Promise<void> {
    const object = await headObject(bucket, key);
    if (!object) {
        console.log(`Skipping ${key}: already deleted, this is probably a retry`);
        return;
    }

    try {
        // Checked before downloading, so an oversized file never gets loaded into memory
        assertAllowedSize(object.ContentLength ?? 0);

        const image = await downloadObject(bucket, key);
        const metadata = await readMetadata(image);
        assertAllowedImage(metadata.format, metadata.width, metadata.height, object.ContentType);

        const thumbnailKey = await createThumbnail(bucket, key, image);
        const saved = await reportResult({
            s3_key: key,
            status: 'ready',
            size_bytes: image.length,
            width: metadata.width as number,
            height: metadata.height as number,
            thumbnail_key: thumbnailKey,
        });
        if (!saved) {
            await deleteObject(bucket, thumbnailKey);
            await deleteObject(bucket, key);
        }
        console.log(`Accepted ${key}`);
    } catch (error) {
        if (!(error instanceof ImageRejection)) throw error;

        console.log(`Rejected ${key}: ${error.code}`);
        // Report first: if this fails and Lambda retries, the object must still be there.
        await reportResult({
            s3_key: key,
            status: 'rejected',
            rejection_code: error.code,
            rejection_message: error.message,
        });
        await deleteObject(bucket, key);
    }
}

async function readMetadata(image: Buffer): Promise<sharp.Metadata> {
    try {
        return await sharp(image, { limitInputPixels: MAX_DIMENSION * MAX_DIMENSION }).metadata();
    } catch {
        throw new ImageRejection('UNSUPPORTED_FORMAT', 'The file is not a JPG or PNG image.');
    }
}

async function createThumbnail(bucket: string, key: string, image: Buffer): Promise<string> {
    let thumbnail: Buffer;
    try {
        // Decodes every pixel, which is what catches files with a valid header but broken data.
        // rotate() applies the EXIF orientation, so phone photos don't come out sideways.
        thumbnail = await sharp(image, { failOn: 'error', limitInputPixels: MAX_DIMENSION * MAX_DIMENSION })
            .rotate()
            .resize({ width: THUMBNAIL_WIDTH, withoutEnlargement: true })
            .webp()
            .toBuffer();
    } catch {
        throw new ImageRejection('CORRUPT_IMAGE', 'The image is damaged and could not be read.');
    }

    const thumbnailKey = key.replace(/^listings\//, 'thumbnails/').replace(/\.[^.]+$/, `_${THUMBNAIL_WIDTH}.webp`);
    await s3.send(
        new PutObjectCommand({ Bucket: bucket, Key: thumbnailKey, Body: thumbnail, ContentType: 'image/webp' }),
    );
    return thumbnailKey;
}

/** Returns false when the listing service no longer has a row for this image. */
async function reportResult(result: ProcessingResult): Promise<boolean> {
    const response = await fetch(`${process.env.LISTING_INTERNAL_URL}/internal/images/processing-result`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.IMAGE_PROCESSOR_API_KEY as string,
        },
        body: JSON.stringify(result),
    });

    if (response.status === 404) {
        console.log(`No image row for ${result.s3_key}, it was probably deleted during processing`);
        return false;
    }
    if (!response.ok) {
        throw new Error(`Listing service answered ${response.status} for ${result.s3_key}`);
    }
    return true;
}

async function headObject(bucket: string, key: string) {
    try {
        return await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    } catch (error) {
        if ((error as { $metadata?: { httpStatusCode?: number } }).$metadata?.httpStatusCode === 404) {
            return null;
        }
        throw error;
    }
}

async function downloadObject(bucket: string, key: string): Promise<Buffer> {
    const object = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
    return Buffer.from(await (object.Body as NonNullable<typeof object.Body>).transformToByteArray());
}

async function deleteObject(bucket: string, key: string): Promise<void> {
    await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}
