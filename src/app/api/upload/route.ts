import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData()
        const files = formData.getAll('files') as File[]

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

            const bytes = await file.arrayBuffer()
            const buffer = Buffer.from(bytes)

            // Generate unique filename
            const fileExtension = path.extname(file.name)
            const uniqueFilename = `${uuidv4()}${fileExtension}`
            const uploadPath = path.join(process.cwd(), 'public', 'uploads', uniqueFilename)

            // Save file
            await writeFile(uploadPath, buffer)

            // Store the public URL
            uploadedPaths.push(`/uploads/${uniqueFilename}`)
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
