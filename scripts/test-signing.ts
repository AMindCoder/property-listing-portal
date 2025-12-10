import dotenv from 'dotenv'
dotenv.config({ path: '.env.vercel' })
dotenv.config()
import { StorageFactory } from '../src/lib/storage/factory'

// Mock Request object for Node environment if needed, or use native global fetch/Request
async function testSigningEndpoint() {
    console.log('🧪 Testing Signing Endpoint Logic...')

    try {
        const provider = StorageFactory.getProvider('vercel-blob');
        if (!provider.authorizeUpload) {
            throw new Error('Provider does not support authorizeUpload');
        }

        // Mock a client request body for handleUpload
        const mockBody = {
            type: 'blob.upload-token', // This is what handleUpload expects roughly, but actually it expects event types usually
            // accessible via client SDK logic. 
            // NOTE: handleUpload expects a specific payload structure that the client SDK sends.
            // We can't easily mock it without knowing internal protocol, but we can call our provider method
            // with a mock request and see if it fails with "Invalid payload" which means it reached the logic.
            payload: 'test'
        };

        const mockRequest = {
            json: async () => mockBody
        } as unknown as Request;

        console.log('Attempting to authorize upload...');
        try {
            await provider.authorizeUpload(mockRequest);
        } catch (e) {
            // We expect it to fail validation of payload, but if it fails with "authorizeUpload is not a function" that's bad.
            // If it fails with "Vercel Blob... error" it means it tried to use Vercel SDK.
            console.log('Caught expected error (proving method integration):', (e as Error).message);
            if ((e as Error).message.includes('Vercel Blob authorize upload error')) {
                console.log('✅ Integration confirmed: Vercel SDK was called');
            } else {
                console.log('⚠️ Unexpected error type');
            }
        }

    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

testSigningEndpoint();
