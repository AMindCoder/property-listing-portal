'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { DropZone } from './DropZone';
import { PreviewList, FileWithPreview } from './PreviewList';
import { uploadFilesClient, ClientUploadResult } from '@/lib/upload-service';
import styles from './ImageUploader.module.css';
import { Loader2 } from 'lucide-react';

interface ImageUploaderProps {
    onUploadComplete: (urls: string[]) => void;
    onUploadError?: (error: any) => void;
    maxFiles?: number;
    maxFileSize?: number; // bytes
    folder?: string;
    preset?: string;
    className?: string;
}

export default function ImageUploader({
    onUploadComplete,
    onUploadError,
    maxFiles = 10,
    maxFileSize = 10 * 1024 * 1024, // 10MB
    folder = 'properties',
    className
}: ImageUploaderProps) {
    const [files, setFiles] = useState<FileWithPreview[]>([]);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        setError(null);

        if (files.length + acceptedFiles.length > maxFiles) {
            setError(`Maximum ${maxFiles} files allowed`);
            return;
        }

        const newFiles = acceptedFiles.map(file => Object.assign(file, {
            preview: URL.createObjectURL(file)
        }));

        setFiles(prev => [...prev, ...newFiles]);
    }, [files, maxFiles]);

    const handleRemove = (index: number) => {
        setFiles(prev => {
            const newFiles = [...prev];
            URL.revokeObjectURL(newFiles[index].preview);
            newFiles.splice(index, 1);
            return newFiles;
        });
    };

    const handleUpload = async () => {
        if (files.length === 0) return;

        setUploading(true);
        setProgress(0);
        setError(null);

        try {
            const results = await uploadFilesClient({
                files: files, // uploadFilesClient handles File[]
                folder: folder,
                onProgress: (p) => setProgress(p),
                compress: true
            });

            const urls = results.map(r => r.url);
            onUploadComplete(urls);

            // Cleanup
            setFiles([]);

        } catch (err) {
            console.error('Upload failed', err);
            setError('Failed to upload images. Please try again.');
            if (onUploadError) onUploadError(err);
        } finally {
            setUploading(false);
        }
    };

    useEffect(() => {
        // Cleanup previews on unmount
        return () => files.forEach(file => URL.revokeObjectURL(file.preview));
    }, [files]);

    return (
        <div className={`${styles.container} ${className || ''}`}>
            <DropZone
                onDrop={onDrop}
                maxFiles={maxFiles - files.length}
                maxSize={maxFileSize}
                disabled={uploading || files.length >= maxFiles}
                error={error || undefined}
            />

            <PreviewList
                files={files}
                onRemove={handleRemove}
                uploading={uploading}
                progress={progress}
            />

            {files.length > 0 && (
                <div className={styles.actions}>
                    <button
                        type="button"
                        className={styles.btnSecondary}
                        onClick={() => setFiles([])}
                        disabled={uploading}
                    >
                        Clear All
                    </button>

                    <button
                        type="button"
                        className={`${styles.btn} ${styles.btnPrimary}`}
                        onClick={handleUpload}
                        disabled={uploading}
                    >
                        {uploading ? (
                            <span className="flex items-center gap-2">
                                <Loader2 className="animate-spin" size={18} /> Uploading...
                            </span>
                        ) : (
                            `Upload ${files.length} Images`
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}
