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
    onImagesChange?: (urls: string[]) => void; // Called whenever images change (add/remove)
    initialImages?: string[]; // Pre-existing image URLs for edit mode
    maxFiles?: number;
    maxFileSize?: number; // bytes
    folder?: string;
    preset?: string;
    className?: string;
}

export default function ImageUploader({
    onUploadComplete,
    onUploadError,
    onImagesChange,
    initialImages = [],
    maxFiles = 10,
    maxFileSize = 10 * 1024 * 1024, // 10MB
    folder = 'properties',
    className
}: ImageUploaderProps) {
    const [files, setFiles] = useState<FileWithPreview[]>([]);
    const [existingImages, setExistingImages] = useState<string[]>(initialImages);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        setError(null);

        const totalCount = existingImages.length + files.length + acceptedFiles.length;
        if (totalCount > maxFiles) {
            setError(`Maximum ${maxFiles} files allowed`);
            return;
        }

        const newFiles = acceptedFiles.map(file => Object.assign(file, {
            preview: URL.createObjectURL(file)
        }));

        setFiles(prev => [...prev, ...newFiles]);
    }, [files, existingImages, maxFiles]);

    const handleRemove = (index: number) => {
        setFiles(prev => {
            const newFiles = [...prev];
            URL.revokeObjectURL(newFiles[index].preview);
            newFiles.splice(index, 1);
            return newFiles;
        });
    };

    const handleRemoveExisting = (index: number) => {
        setExistingImages(prev => {
            const newImages = prev.filter((_, i) => i !== index);
            // Notify parent of change
            if (onImagesChange) {
                onImagesChange(newImages);
            }
            return newImages;
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

            const newUrls = results.map(r => r.url);
            const allUrls = [...existingImages, ...newUrls];

            // Notify parent with all URLs
            onUploadComplete(allUrls);
            if (onImagesChange) {
                onImagesChange(allUrls);
            }

            // Update existing images and cleanup new files
            setExistingImages(allUrls);
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
                maxFiles={maxFiles - existingImages.length - files.length}
                maxSize={maxFileSize}
                disabled={uploading || (existingImages.length + files.length) >= maxFiles}
                error={error || undefined}
            />

            {/* Existing images */}
            {existingImages.length > 0 && (
                <div style={{ marginTop: '1.5rem' }}>
                    <p style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                        Existing Images ({existingImages.length})
                    </p>
                    <div className={styles.previewGrid}>
                        {existingImages.map((url, index) => (
                            <div key={`existing-${index}`} className={styles.previewItem}>
                                <img
                                    src={url}
                                    alt={`Existing ${index + 1}`}
                                    className={styles.previewImage}
                                />
                                {!uploading && (
                                    <button
                                        type="button"
                                        className={styles.removeBtn}
                                        onClick={() => handleRemoveExisting(index)}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <line x1="18" y1="6" x2="6" y2="18" />
                                            <line x1="6" y1="6" x2="18" y2="18" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* New files to upload */}
            {files.length > 0 && (
                <div style={{ marginTop: '1.5rem' }}>
                    <p style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                        New Images to Upload ({files.length})
                    </p>
                    <PreviewList
                        files={files}
                        onRemove={handleRemove}
                        uploading={uploading}
                        progress={progress}
                    />
                </div>
            )}

            {files.length > 0 && (
                <div className={styles.actions}>
                    <button
                        type="button"
                        className={styles.btnSecondary}
                        onClick={() => setFiles([])}
                        disabled={uploading}
                    >
                        Clear New
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
                            `Upload ${files.length} Image${files.length > 1 ? 's' : ''}`
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}
