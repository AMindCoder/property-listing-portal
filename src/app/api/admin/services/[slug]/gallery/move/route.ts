import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, UnauthorizedError, ForbiddenError } from '@/lib/auth';

interface MoveImagesRequest {
    imageIds: string[];
    targetProjectName: string;
    targetProjectLocation?: string;
    targetCompletionDate?: string;
}

// POST /api/admin/services/[slug]/gallery/move - Move images between projects
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        // Require admin access for moving images
        await requireAdmin();

        const { slug } = await params;
        const body: MoveImagesRequest = await request.json();

        if (!body.imageIds || body.imageIds.length === 0) {
            return NextResponse.json({ error: 'No images specified' }, { status: 400 });
        }

        if (!body.targetProjectName?.trim()) {
            return NextResponse.json({ error: 'Target project name is required' }, { status: 400 });
        }

        const category = await prisma.serviceCategory.findUnique({
            where: { slug },
        });

        if (!category) {
            return NextResponse.json({ error: 'Category not found' }, { status: 404 });
        }

        // Build update data
        const updateData: any = {
            projectName: body.targetProjectName.trim(),
        };

        // Only update location/date if provided (for new projects)
        if (body.targetProjectLocation !== undefined) {
            updateData.projectLocation = body.targetProjectLocation || null;
        }
        if (body.targetCompletionDate !== undefined) {
            updateData.completionDate = body.targetCompletionDate ? new Date(body.targetCompletionDate) : null;
        }

        // Move images to target project
        const result = await prisma.galleryItem.updateMany({
            where: {
                categoryId: category.id,
                id: { in: body.imageIds },
            },
            data: updateData,
        });

        return NextResponse.json({
            success: true,
            moved: result.count,
            targetProject: body.targetProjectName,
        });
    } catch (error) {
        if (error instanceof UnauthorizedError) {
            return NextResponse.json({ error: error.message, code: 'UNAUTHORIZED' }, { status: 401 });
        }
        if (error instanceof ForbiddenError) {
            return NextResponse.json({ error: error.message, code: 'FORBIDDEN' }, { status: 403 });
        }
        console.error('Error moving images:', error);
        return NextResponse.json({ error: 'Failed to move images' }, { status: 500 });
    }
}
