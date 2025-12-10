export type StorageProviderType = 'vercel-blob' | 's3' | 'cloudinary' | 'local'

export type AccessType = 'public' | 'private'

export interface StorageOptions {
    folder?: string
    filename?: string
    access?: AccessType
    contentType?: string
    metadata?: Record<string, string>
    tags?: string[]
}

export interface UploadResult {
    url: string
    path: string
    size?: number
    contentType?: string
    provider: StorageProviderType
    metadata?: Record<string, any>
}

export interface StorageProvider {
    upload(file: File | Blob, options?: StorageOptions): Promise<UploadResult>
    uploadMultiple(files: (File | Blob)[], options?: StorageOptions): Promise<UploadResult[]>
    delete(pathOrUrl: string): Promise<void>
    deleteMultiple(pathsOrUrls: string[]): Promise<void>
    getPublicUrl(path: string): string
    exists(pathOrUrl: string): Promise<boolean>
    authorizeUpload?(request: Request): Promise<any>
}

export class StorageError extends Error {
    constructor(message: string, public type: 'AUTH' | 'QUOTA' | 'NOT_FOUND' | 'UPLOAD' | 'CONFIG' | 'PROVIDER') {
        super(message)
        this.name = 'StorageError'
    }
}
