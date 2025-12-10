import { StorageProvider, StorageProviderType } from './types'
import { VercelBlobProvider } from './providers/vercel-blob'

export class StorageFactory {
    private static instance: StorageProvider

    static getProvider(type: StorageProviderType = 'vercel-blob'): StorageProvider {
        if (this.instance) {
            return this.instance
        }

        switch (type) {
            case 'vercel-blob':
                this.instance = new VercelBlobProvider()
                break
            // S3 and Cloudinary placeholders
            case 's3':
                throw new Error('S3 provider not implemented yet')
            case 'cloudinary':
                throw new Error('Cloudinary provider not implemented yet')
            case 'local':
                throw new Error('Local provider not implemented yet')
            default:
                throw new Error(`Unsupported storage provider: ${type}`)
        }

        return this.instance
    }
}
