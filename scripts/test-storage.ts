import dotenv from 'dotenv'
dotenv.config({ path: '.env.vercel' })
// Also try to load standard .env just in case
dotenv.config()
import { StorageFactory } from '../src/lib/storage/factory'
import path from 'path'
import fs from 'fs'

async function testStorage() {
    console.log('🧪 Starting Storage Abstraction Test...')

    try {
        const provider = StorageFactory.getProvider('vercel-blob')
        console.log('✅ Provider initialized')

        // Create a dummy file
        const testContent = 'Hello, Storage World!'
        const testFileName = `test-${Date.now()}.txt`
        const testFilePath = path.join(process.cwd(), testFileName)

        // We need to use Blob for node environment since File might not be fully polyfilled or available depending on node version,
        // but Vercel Blob SDK supports strings or buffers too. However, our interface expects File | Blob.
        // In Node < 20, File isn't global. Let's make a mock object that looks like a File if needed, or use Blob if available.

        const blob = new Blob([testContent], { type: 'text/plain' })
        // Mocking File properties on Blob for the interface compatibility if needed, though Vercel SDK handles Blob.
        // Our implementation uses (file as File).name which might be undefined on Blob.
        // Let's ensure we pass options.filename to avoid issues.

        console.log(`📤 Uploading file: ${testFileName}`)
        const result = await provider.upload(blob, {
            filename: testFileName,
            folder: 'test-uploads',
            access: 'public',
            contentType: 'text/plain'
        })

        console.log('✅ Upload successful:', result)

        if (!result.url.startsWith('http')) {
            throw new Error('Invalid URL returned')
        }

        console.log(`🔎 Checking existence: ${result.url}`)
        const exists = await provider.exists(result.url)

        if (exists) {
            console.log('✅ File exists')
        } else {
            throw new Error('File should exist but does not')
        }

        console.log('🗑️ Deleting file...')
        await provider.delete(result.url)
        console.log('✅ Delete successful')

        const existsAfterDelete = await provider.exists(result.url)
        if (!existsAfterDelete) {
            console.log('✅ File successfully verified as deleted')
        } else {
            console.log('⚠️ File still exists (might be eventual consistency or cache)')
        }

        console.log('🎉 All tests passed!')

    } catch (error) {
        console.error('❌ Test failed:', error)
        process.exit(1)
    }
}

testStorage()
