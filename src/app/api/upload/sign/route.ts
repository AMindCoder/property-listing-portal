import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
    const body = (await request.json()) as HandleUploadBody;

    try {
        // Get the token from environment variables
        const token = process.env.BLOBPROPERTY_READ_WRITE_TOKEN ||
            process.env.BLOBPRROPERTY_READ_WRITE_TOKEN ||
            process.env.BLOB_READ_WRITE_TOKEN;

        if (!token) {
            return NextResponse.json(
                { error: 'Vercel Blob token not configured' },
                { status: 500 }
            );
        }

        const jsonResponse = await handleUpload({
            body,
            request,
            token,
            onBeforeGenerateToken: async (pathname) => {
                // Validate the upload - can add authentication checks here
                return {
                    allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic'],
                    tokenPayload: JSON.stringify({}),
                };
            },
            onUploadCompleted: async ({ blob, tokenPayload }) => {
                console.log('[Upload] Completed:', blob.url);
            },
        });

        return NextResponse.json(jsonResponse);
    } catch (error) {
        console.error('Upload sign error:', error);
        return NextResponse.json(
            { error: (error as Error).message },
            { status: 400 },
        );
    }
}
