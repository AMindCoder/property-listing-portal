import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { StorageFactory } from '@/lib/storage/factory';

export async function POST(request: Request): Promise<NextResponse> {
    const body = (await request.json()) as HandleUploadBody;

    try {
        const provider = StorageFactory.getProvider();

        // Check if provider supports authorization
        if (!provider.authorizeUpload) {
            return NextResponse.json(
                { error: 'Storage provider does not support client-side upload' },
                { status: 400 }
            );
        }

        const jsonResponse = await provider.authorizeUpload(request);
        return NextResponse.json(jsonResponse);
    } catch (error) {
        return NextResponse.json(
            { error: (error as Error).message },
            { status: 400 },
        );
    }
}
