import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST /api/admin/services/[slug]/gallery/reorder - Reorder gallery items
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;
        const body = await request.json();
        const { items } = body; // Array of { id, displayOrder }

        if (!items || !Array.isArray(items)) {
            return NextResponse.json(
                { error: 'Invalid items data' },
                { status: 400 }
            );
        }

        // Update display order for each item
        const updatePromises = items.map((item: { id: string; displayOrder: number }) =>
            prisma.galleryItem.update({
                where: { id: item.id },
                data: { displayOrder: item.displayOrder },
            })
        );

        await Promise.all(updatePromises);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error reordering gallery items:', error);
        return NextResponse.json(
            { error: 'Failed to reorder gallery items' },
            { status: 500 }
        );
    }
}
