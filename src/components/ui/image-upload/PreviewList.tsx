import React from 'react';
import { X, CheckCircle, Loader2 } from 'lucide-react';
import styles from './ImageUploader.module.css';

export interface FileWithPreview extends File {
    preview: string;
}

interface PreviewListProps {
    files: FileWithPreview[];
    onRemove: (index: number) => void;
    progress?: number;
    uploading?: boolean;
}

export function PreviewList({ files, onRemove, progress, uploading }: PreviewListProps) {
    if (files.length === 0) return null;

    return (
        <div className={styles.previewGrid}>
            {files.map((file, index) => (
                <div key={`${file.name}-${index}`} className={styles.previewItem}>
                    <img
                        src={file.preview}
                        alt={file.name}
                        className={styles.previewImage}
                        onLoad={() => {
                            URL.revokeObjectURL(file.preview);
                        }}
                    />

                    {!uploading && (
                        <button
                            type="button"
                            className={styles.removeBtn}
                            onClick={() => onRemove(index)}
                        >
                            <X size={14} />
                        </button>
                    )}

                    {uploading && (
                        <div className={styles.progressOverlay}>
                            <div className={styles.progressBar}>
                                <div
                                    className={styles.progressFill}
                                    style={{ width: `${progress || 0}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
