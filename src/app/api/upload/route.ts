import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
    try {
        console.log('[API Upload] Received upload request')
        const formData = await request.formData()
        const files = formData.getAll('files') as File[]
        console.log(`[API Upload] Found ${files.length} files`)

        if (!files || files.length === 0) {
            return NextResponse.json(
                { error: 'No files provided' },
                { status: 400 }
            )
        }

        // Check if Vercel Blob token is configured
        const blobToken = process.env.BLOBPROPERTY_READ_WRITE_TOKEN || process.env.BLOB_READ_WRITE_TOKEN
        console.log('[API Upload] Blob token exists:', !!blobToken)

        if (!blobToken) {
            return NextResponse.json(
                { error: 'Storage not configured. Please set BLOBPROPERTY_READ_WRITE_TOKEN.' },
                { status: 500 }
            )
        }

        const uploadedPaths: string[] = []

        for (const file of files) {
            if (!file || !(file instanceof File)) {
                console.log('[API Upload] Skipping invalid file')
                continue
            }

            // Generate unique filename with properties prefix
            const fileExtension = file.name.substring(file.name.lastIndexOf('.')) || '.jpg'
            const uniqueFilename = `properties/${uuidv4()}${fileExtension}`

            console.log(`[API Upload] Uploading file: ${file.name} as ${uniqueFilename}`)

            try {
                const blob = await put(uniqueFilename, file, {
                    access: 'public',
                    token: blobToken,
                })
                console.log(`[API Upload] Successfully uploaded: ${blob.url}`)
                uploadedPaths.push(blob.url)
            } catch (blobError) {
                console.error('[API Upload] Blob upload error:', blobError)
                throw blobError
            }
        }

        return NextResponse.json({
            success: true,
            paths: uploadedPaths
        })
    } catch (error) {
        console.error('[API Upload] Error:', error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        return NextResponse.json(
            { error: `Failed to upload files: ${errorMessage}` },
            { status: 500 }
        )
    }
}
