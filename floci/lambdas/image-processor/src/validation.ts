export const MAX_SIZE_BYTES = 4 * 1024 * 1024;
export const MIN_DIMENSION = 200;
export const MAX_DIMENSION = 8000;

const CONTENT_TYPE_BY_FORMAT: Record<string, string> = {
    jpeg: 'image/jpeg',
    png: 'image/png',
};

export class ImageRejection extends Error {
    constructor(readonly code: string, message: string) {
        super(message);
    }
}

export function assertAllowedSize(size: number): void {
    if (size === 0) {
        throw new ImageRejection('EMPTY_FILE', 'The uploaded file is empty.');
    }
    if (size > MAX_SIZE_BYTES) {
        const sizeMb = (size / (1024 * 1024)).toFixed(1);
        throw new ImageRejection('FILE_TOO_LARGE', `The image is ${sizeMb} MB. The maximum size is 4 MB.`);
    }
}

export function assertAllowedImage(
    format: string | undefined,
    width: number | undefined,
    height: number | undefined,
    storedContentType: string | undefined,
): void {
    const contentType = format ? CONTENT_TYPE_BY_FORMAT[format] : undefined;
    if (!contentType) {
        throw new ImageRejection('UNSUPPORTED_FORMAT', 'The file is not a JPG or PNG image.');
    }
    if (storedContentType !== contentType) {
        throw new ImageRejection(
            'TYPE_MISMATCH',
            `The file is a ${format?.toUpperCase()} image but was uploaded as ${storedContentType ?? 'an unknown type'}.`,
        );
    }
    if (!width || !height || width < MIN_DIMENSION || height < MIN_DIMENSION) {
        throw new ImageRejection(
            'IMAGE_TOO_SMALL',
            `The image is ${width}x${height} pixels. The minimum is ${MIN_DIMENSION}x${MIN_DIMENSION}.`,
        );
    }
    if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        throw new ImageRejection(
            'IMAGE_TOO_LARGE',
            `The image is ${width}x${height} pixels. The maximum is ${MAX_DIMENSION}x${MAX_DIMENSION}.`,
        );
    }
}
