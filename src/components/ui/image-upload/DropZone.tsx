import React from 'react';
import { useDropzone, DropzoneOptions } from 'react-dropzone';
import { UploadCloud, AlertCircle } from 'lucide-react';
import styles from './ImageUploader.module.css';

interface DropZoneProps extends DropzoneOptions {
    className?: string;
    error?: string;
}

export function DropZone({ className, error, ...props }: DropZoneProps) {
    const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
        accept: {
            'image/jpeg': [],
            'image/png': [],
            'image/webp': [],
            'image/heic': []
        },
        ...props
    });

    return (
        <div
            {...getRootProps()}
            className={`${styles.dropZone} ${isDragActive ? styles.dropZoneActive : ''} ${props.disabled ? styles.dropZoneDisabled : ''} ${className || ''}`}
        >
            <input {...getInputProps()} />

            {isDragReject ? (
                <AlertCircle size={48} color="#ef4444" />
            ) : (
                <UploadCloud size={48} className={styles.icon} />
            )}

            <div>
                <p className={styles.text}>
                    {isDragActive
                        ? "Drop the files here..."
                        : "Drag & drop property images here, or click to select"}
                </p>
                <p className={styles.subText}>
                    Supports JPG, PNG, WebP (Max {props.maxSize ? Math.round(props.maxSize / 1024 / 1024) : 10}MB)
                </p>
            </div>

            {error && (
                <p className={styles.errorText}>
                    {error}
                </p>
            )}
        </div>
    );
}
