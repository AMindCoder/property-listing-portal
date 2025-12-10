import { put, del, head } from '@vercel/blob'
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { v4 as uuidv4 } from 'uuid'
import { StorageProvider, StorageOptions, UploadResult, StorageError } from '../types'

export class VercelBlobProvider implements StorageProvider {
    private token: string

    constructor() {
        // Try to get the token from environment variables
        // BLOBPROPERTY_READ_WRITE_TOKEN seems to be a custom one, BLOB_READ_WRITE_TOKEN is standard
        const token = process.env.BLOBPROPERTY_READ_WRITE_TOKEN || process.env.BLOB_READ_WRITE_TOKEN

        if (!token) {
            throw new StorageError(
                'Vercel Blob token not configured. Please set BLOBPROPERTY_READ_WRITE_TOKEN or BLOB_READ_WRITE_TOKEN.',
                'CONFIG'
            )
        }
        this.token = token
    }

    async upload(file: File | Blob, options?: StorageOptions): Promise<UploadResult> {
        try {
            const folder = options?.folder ? `${options.folder}/` : ''
            const filename = options?.filename || `${uuidv4()}-${(file as File).name || 'file'}`
            const path = `${folder}${filename}`

            const blob = await put(path, file, {
                access: options?.access === 'private' ? 'public' : 'public', // Vercel Blob currently only supports public mainly, but let's default to public
                token: this.token,
                contentType: options?.contentType,
                addRandomSuffix: false, // We handle uniqueness if needed
            })

            return {
                url: blob.url,
                path: blob.pathname,
                provider: 'vercel-blob',
                contentType: blob.contentType,
                size: file.size,
            }
        } catch (error) {
            console.error('Vercel Blob upload error:', error)
            throw new StorageError(`Failed to upload file: ${(error as Error).message}`, 'UPLOAD')
        }
    }

    async uploadMultiple(files: (File | Blob)[], options?: StorageOptions): Promise<UploadResult[]> {
        return Promise.all(files.map(file => this.upload(file, options)))
    }

    async delete(pathOrUrl: string): Promise<void> {
        try {
            await del(pathOrUrl, { token: this.token })
        } catch (error) {
            console.error('Vercel Blob delete error:', error)
            throw new StorageError(`Failed to delete file: ${(error as Error).message}`, 'PROVIDER')
        }
    }

    async deleteMultiple(pathsOrUrls: string[]): Promise<void> {
        try {
            await del(pathsOrUrls, { token: this.token })
        } catch (error) {
            console.error('Vercel Blob delete multiple error:', error)
            throw new StorageError(`Failed to delete files: ${(error as Error).message}`, 'PROVIDER')
        }
    }

    getPublicUrl(path: string): string {
        // If it's already a URL, return it
        if (path.startsWith('http')) return path
        // Otherwise construct it (assuming standard Vercel Blob URL structure, but usually we store the full URL)
        // For now, let's return the path if we can't determine the domain simply, or handle it in the caller.
        // However, Vercel Blob puts return full URLs.
        return path
    }

    async exists(pathOrUrl: string): Promise<boolean> {
        try {
            await head(pathOrUrl, { token: this.token })
            return true
        } catch (error) {
            // head throws if not found
            return false
        }
    }

    async authorizeUpload(request: Request): Promise<any> {
        const body = (await request.json()) as HandleUploadBody

        try {
            const jsonResponse = await handleUpload({
                body,
                request,
                token: this.token,
                onBeforeGenerateToken: async (pathname) => {
                    // You can add logic here to validate the upload
                    // For now, we allow authenticated users (checked by middleware/caller)
                    return {
                        allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
                        tokenPayload: JSON.stringify({
                            // optional, sent to your server on upload completion
                        }),
                    }
                },
                onUploadCompleted: async ({ blob, tokenPayload }) => {
                    // This is called via webhook after upload
                    console.log('[VercelBlob] Upload completed:', blob.url)
                },
            })
            return jsonResponse
        } catch (error) {
            console.error('Vercel Blob authorize upload error:', error)
            throw new StorageError(`Failed to authorize upload: ${(error as Error).message}`, 'AUTH')
        }
    }
}
