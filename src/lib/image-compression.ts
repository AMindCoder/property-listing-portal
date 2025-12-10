import imageCompression from 'browser-image-compression';

export interface CompressionOptions {
    maxWidthOrHeight?: number;
    maxSizeMB?: number;
    useWebWorker?: boolean;
    initialQuality?: number;
    fileType?: string;
}

export const defaultCompressionOptions: CompressionOptions = {
    maxWidthOrHeight: 2400,
    maxSizeMB: 1, // 1MB
    useWebWorker: true,
    initialQuality: 0.8,
};

/**
 * Compresses an image file using browser-image-compression
 */
export async function compressImage(
    file: File,
    options: CompressionOptions = defaultCompressionOptions
): Promise<File> {
    // If not an image, return original
    if (!file.type.startsWith('image/')) {
        return file;
    }

    try {
        const compressedFile = await imageCompression(file, {
            ...defaultCompressionOptions,
            ...options
        });
        return compressedFile;
    } catch (error) {
        console.error('Image compression failed:', error);
        // Fallback to original file if compression fails
        return file;
    }
}

export interface ImageVariant {
    name: 'original' | 'thumbnail' | 'preview';
    file: File;
    width?: number;
    height?: number;
}

/**
 * Generates variants for an image (Original, Thumbnail).
 * Currently only specific variants are implemented to avoid excessive client processing.
 */
export async function generateVariants(file: File): Promise<ImageVariant[]> {
    const variants: ImageVariant[] = [];

    // 1. Original (Compressed)
    const compressedOriginal = await compressImage(file, {
        maxWidthOrHeight: 2400,
        maxSizeMB: 2, // Slightly larger allowed for "original"
        initialQuality: 0.85
    });
    variants.push({ name: 'original', file: compressedOriginal });

    // 2. Thumbnail (150x150)
    // We reuse the library but force smaller dimension
    const thumbnail = await compressImage(file, {
        maxWidthOrHeight: 150,
        maxSizeMB: 0.05, // 50KB
        initialQuality: 0.7
    });
    // We might want to rename the file to avoid overwrite if uploading to same folder
    // but the upload service handles unique naming usually.
    // The 'name' property of the File object is read-only, so we create a new one.
    const thumbFile = new File([thumbnail], `thumb_${file.name}`, { type: thumbnail.type });
    variants.push({ name: 'thumbnail', file: thumbFile });

    return variants;
}
