import { CreateUploadUrlDto } from './dto/listing-image.dto';

export const MAX_IMAGE_SIZE_BYTES = 4 * 1024 * 1024;

const EXTENSION_BY_CONTENT_TYPE: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
};

export interface ImageValidationError {
    field: string;
    code: string;
    message: string;
}

export function imageExtension(contentType: string): string {
    return EXTENSION_BY_CONTENT_TYPE[contentType];
}

// Runs before the upload, so the user finds out right away. It can only check what the
// client declares: the image-processor Lambda checks the real file after the upload.
// Returns every problem at once, so the user doesn't have to fix them one retry at a time.
export function validateImageUpload(dto: Partial<CreateUploadUrlDto>): ImageValidationError[] {
    const errors: ImageValidationError[] = [];
    const { file_name: fileName, content_type: contentType, size_bytes: size } = dto ?? {};

    const extension = typeof fileName === 'string' ? fileName.split('.').pop()?.toLowerCase() : undefined;
    const validExtension = typeof fileName === 'string' && fileName.includes('.')
        && Object.values(EXTENSION_BY_CONTENT_TYPE).includes(extension as string);
    if (!validExtension) {
        errors.push({
            field: 'file_name',
            code: 'INVALID_EXTENSION',
            message: 'The file must have a .jpg or .png extension.',
        });
    }

    const expectedExtension = typeof contentType === 'string' ? EXTENSION_BY_CONTENT_TYPE[contentType] : undefined;
    if (!expectedExtension) {
        errors.push({
            field: 'content_type',
            code: 'INVALID_CONTENT_TYPE',
            message: 'The content type must be image/jpeg or image/png.',
        });
    } else if (validExtension && extension !== expectedExtension) {
        errors.push({
            field: 'content_type',
            code: 'TYPE_MISMATCH',
            message: `A .${extension} file can't be uploaded as ${contentType}.`,
        });
    }

    if (!Number.isInteger(size) || (size as number) <= 0) {
        errors.push({
            field: 'size_bytes',
            code: 'INVALID_SIZE',
            message: 'The file size must be given in bytes and be greater than 0.',
        });
    } else if ((size as number) > MAX_IMAGE_SIZE_BYTES) {
        const sizeMb = ((size as number) / (1024 * 1024)).toFixed(1);
        errors.push({
            field: 'size_bytes',
            code: 'FILE_TOO_LARGE',
            message: `The image is ${sizeMb} MB. The maximum size is 4 MB.`,
        });
    }

    return errors;
}
