import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { del } from '@vercel/blob';
import { requireAdmin, UnauthorizedError, ForbiddenError } from '@/lib/auth';

interface ProjectUpdateRequest {
    projectName?: string;
    projectLocation?: string;
    completionDate?: string;
    isActive?: boolean;
}

// PUT /api/admin/services/[slug]/gallery/projects/[projectName] - Bulk update project
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string; projectName: string }> }
) {
    try {
        // Require admin access for updating project
        await requireAdmin();

        const { slug, projectName } = await params;
        const decodedProjectName = decodeURIComponent(projectName);
        const body: ProjectUpdateRequest = await request.json();

        const category = await prisma.serviceCategory.findUnique({
            where: { slug },
        });

        if (!category) {
            return NextResponse.json({ error: 'Category not found' }, { status: 404 });
        }

        // Check if project exists
        const existingItems = await prisma.galleryItem.findFirst({
            where: {
                categoryId: category.id,
                projectName: decodedProjectName,
            },
        });

        if (!existingItems) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        // Build update data
        const updateData: any = {};

        if (body.projectName !== undefined) {
            updateData.projectName = body.projectName;
        }
        if (body.projectLocation !== undefined) {
            updateData.projectLocation = body.projectLocation || null;
        }
        if (body.completionDate !== undefined) {
            updateData.completionDate = body.completionDate ? new Date(body.completionDate) : null;
        }
        if (body.isActive !== undefined) {
            updateData.isActive = body.isActive;
        }

        // Bulk update all items in project
        const result = await prisma.galleryItem.updateMany({
            where: {
                categoryId: category.id,
                projectName: decodedProjectName,
            },
            data: updateData,
        });

        return NextResponse.json({
            success: true,
            updated: result.count,
            newProjectName: body.projectName || decodedProjectName,
        });
    } catch (error) {
        if (error instanceof UnauthorizedError) {
            return NextResponse.json({ error: error.message, code: 'UNAUTHORIZED' }, { status: 401 });
        }
        if (error instanceof ForbiddenError) {
            return NextResponse.json({ error: error.message, code: 'FORBIDDEN' }, { status: 403 });
        }
        console.error('Error updating project:', error);
        return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
    }
}

// DELETE /api/admin/services/[slug]/gallery/projects/[projectName] - Delete entire project
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string; projectName: string }> }
) {
    try {
        // Require admin access for deleting project
        await requireAdmin();

        const { slug, projectName } = await params;
        const decodedProjectName = decodeURIComponent(projectName);

        const category = await prisma.serviceCategory.findUnique({
            where: { slug },
        });

        if (!category) {
            return NextResponse.json({ error: 'Category not found' }, { status: 404 });
        }

        // Get all items to delete their images from blob storage
        const items = await prisma.galleryItem.findMany({
            where: {
                categoryId: category.id,
                projectName: decodedProjectName,
            },
            select: {
                id: true,
                imageUrl: true,
                imageThumbnailUrl: true,
            },
        });

        if (items.length === 0) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        // Delete images from blob storage
        for (const item of items) {
            try {
                await del(item.imageUrl);
                if (item.imageThumbnailUrl) {
                    await del(item.imageThumbnailUrl);
                }
            } catch (error) {
                console.error('Error deleting image:', error);
            }
        }

        // Delete all items in project
        const result = await prisma.galleryItem.deleteMany({
            where: {
                categoryId: category.id,
                projectName: decodedProjectName,
            },
        });

        return NextResponse.json({
            success: true,
            deleted: result.count,
        });
    } catch (error) {
        if (error instanceof UnauthorizedError) {
            return NextResponse.json({ error: error.message, code: 'UNAUTHORIZED' }, { status: 401 });
        }
        if (error instanceof ForbiddenError) {
            return NextResponse.json({ error: error.message, code: 'FORBIDDEN' }, { status: 403 });
        }
        console.error('Error deleting project:', error);
        return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
    }
}
