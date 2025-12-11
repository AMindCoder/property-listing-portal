import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, UnauthorizedError, ForbiddenError } from '@/lib/auth';

// POST /api/admin/services/[slug]/gallery/reorder - Reorder gallery items
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        // Require admin access for reordering gallery items
        await requireAdmin();

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
        if (error instanceof UnauthorizedError) {
            return NextResponse.json({ error: error.message, code: 'UNAUTHORIZED' }, { status: 401 });
        }
        if (error instanceof ForbiddenError) {
            return NextResponse.json({ error: error.message, code: 'FORBIDDEN' }, { status: 403 });
        }
        console.error('Error reordering gallery items:', error);
        return NextResponse.json(
            { error: 'Failed to reorder gallery items' },
            { status: 500 }
        );
    }
}
