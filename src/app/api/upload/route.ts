import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { v4 as uuidv4 } from 'uuid'
import path from 'path'
import fs from 'fs'
import { writeFile } from 'fs/promises'

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

        const uploadedPaths: string[] = []

        for (const file of files) {
            if (!file || !(file instanceof File)) {
                continue
            }

            // Generate unique filename
            const fileExtension = path.extname(file.name)
            const uniqueFilename = `${uuidv4()}${fileExtension}`

            // Check if Vercel Blob token is configured (supports both naming conventions)
            const blobToken = process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOBPROPERTY_READ_WRITE_TOKEN
            if (blobToken) {
                console.log('[API Upload] Using Vercel Blob')
                // Upload to Vercel Blob
                const blob = await put(uniqueFilename, file, {
                    access: 'public',
                    token: blobToken,
                })
                uploadedPaths.push(blob.url)
            } else {
                console.log('[API Upload] Using Local Storage Fallback')
                // Fallback: Save locally to public/uploads
                const bytes = await file.arrayBuffer()
                const buffer = Buffer.from(bytes)

                // Ensure uploads directory exists
                const uploadDir = path.join(process.cwd(), 'public', 'uploads')
                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true })
                }

                const filePath = path.join(uploadDir, uniqueFilename)
                await writeFile(filePath, buffer)

                // Store relative path (accessible via public URL)
                uploadedPaths.push(`/uploads/${uniqueFilename}`)
            }
        }

        return NextResponse.json({
            success: true,
            paths: uploadedPaths
        })
    } catch (error) {
        console.error('Upload error:', error)
        return NextResponse.json(
            { error: 'Failed to upload files' },
            { status: 500 }
        )
    }
}
