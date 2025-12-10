import { upload } from '@vercel/blob/client';
import { compressImage } from './image-compression';

export interface ClientUploadOptions {
    files: File[];
    onProgress?: (progress: number) => void;
    folder?: string;
    metadata?: Record<string, string>;
    compress?: boolean;
}

export interface ClientUploadResult {
    url: string;
    pathname: string;
    contentType: string;
}

/**
 * Uploads files from the client directly to storage using Vercel Blob client SDK
 */
export async function uploadFilesClient(options: ClientUploadOptions): Promise<ClientUploadResult[]> {
    const { files, onProgress, folder, metadata } = options;
    const results: ClientUploadResult[] = [];
    const totalFiles = files.length;
    let completedFiles = 0;

    // We upload in parallel but simple loop for now
    // For proper progress tracking of combined files, we might need more complex logic
    // But Vercel upload function provides progress for single file.

    for (const file of files) {
        let fileToUpload = file;

        // Compress if requested (default true if undefined)
        if (options.compress !== false) {
            try {
                fileToUpload = await compressImage(file);
            } catch (e) {
                console.warn('Compression failed, uploading original', e);
            }
        }

        // Generate unique filename using UUID to avoid conflicts
        // Keep the original extension
        const extension = fileToUpload.name.split('.').pop() || 'jpg';
        const uniqueFilename = `${crypto.randomUUID()}.${extension}`;

        // Determine path with UUID filename
        const path = folder ? `${folder}/${uniqueFilename}` : uniqueFilename;

        try {
            const newBlob = await upload(path, fileToUpload, {
                access: 'public',
                handleUploadUrl: '/api/upload/sign',
                onUploadProgress: (progressEvent) => {
                    // This is per-file progress
                    // If we want overall progress, we need to average it or callback with file index
                    // For now, let's just callback with current file progress scaled by total files
                    if (onProgress) {
                        const currentFileParams = (progressEvent.percentage / 100);
                        const overall = ((completedFiles + currentFileParams) / totalFiles) * 100;
                        onProgress(overall);
                    }
                },
                clientPayload: metadata ? JSON.stringify(metadata) : undefined
            });

            results.push({
                url: newBlob.url,
                pathname: newBlob.pathname,
                contentType: newBlob.contentType || file.type
            });

            completedFiles++;

        } catch (error) {
            console.error('Client upload failed for file:', file.name, error);
            throw error;
        }
    }

    return results;
}
