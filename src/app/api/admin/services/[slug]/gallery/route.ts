import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { del } from '@vercel/blob';

// GET /api/admin/services/[slug]/gallery - Fetch gallery items (optionally filtered by project)
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;
        const { searchParams } = new URL(request.url);
        const projectName = searchParams.get('project');

        // First find the category
        const category = await prisma.serviceCategory.findUnique({
            where: { slug },
        });

        if (!category) {
            return NextResponse.json(
                { error: 'Category not found' },
                { status: 404 }
            );
        }

        // Build where clause
        const whereClause: any = {
            categoryId: category.id,
        };

        // Filter by project if specified
        if (projectName) {
            whereClause.projectName = decodeURIComponent(projectName);
        }

        // Fetch gallery items (including inactive for admin)
        const galleryItems = await prisma.galleryItem.findMany({
            where: whereClause,
            orderBy: {
                displayOrder: 'asc',
            },
        });

        return NextResponse.json(galleryItems);
    } catch (error) {
        console.error('Error fetching gallery items:', error);
        return NextResponse.json(
            { error: 'Failed to fetch gallery items' },
            { status: 500 }
        );
    }
}

// POST /api/admin/services/[slug]/gallery - Create new gallery item
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;
        const body = await request.json();

        // Find category
        const category = await prisma.serviceCategory.findUnique({
            where: { slug },
        });

        if (!category) {
            return NextResponse.json(
                { error: 'Category not found' },
                { status: 404 }
            );
        }

        // Get the next display order
        const maxOrder = await prisma.galleryItem.aggregate({
            where: {
                categoryId: category.id,
            },
            _max: {
                displayOrder: true,
            },
        });

        const galleryItem = await prisma.galleryItem.create({
            data: {
                categoryId: category.id,
                title: body.title,
                description: body.description,
                imageUrl: body.imageUrl,
                imageThumbnailUrl: body.imageThumbnailUrl,
                imageAltText: body.imageAltText || body.title,
                projectName: body.projectName,
                projectLocation: body.projectLocation,
                completionDate: body.completionDate ? new Date(body.completionDate) : null,
                tags: body.tags || [],
                displayOrder: (maxOrder._max.displayOrder || 0) + 1,
            },
        });

        return NextResponse.json(galleryItem, { status: 201 });
    } catch (error) {
        console.error('Error creating gallery item:', error);
        return NextResponse.json(
            { error: 'Failed to create gallery item' },
            { status: 500 }
        );
    }
}

// PUT /api/admin/services/[slug]/gallery - Update gallery item
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;
        const body = await request.json();
        const { id, imageUrl: newImageUrl, ...updateData } = body;

        // Get the existing item to check if image changed
        const existingItem = await prisma.galleryItem.findUnique({
            where: { id },
        });

        if (!existingItem) {
            return NextResponse.json(
                { error: 'Gallery item not found' },
                { status: 404 }
            );
        }

        // If image changed, delete old image from blob storage
        if (newImageUrl && newImageUrl !== existingItem.imageUrl) {
            try {
                await del(existingItem.imageUrl);
                if (existingItem.imageThumbnailUrl) {
                    await del(existingItem.imageThumbnailUrl);
                }
            } catch (error) {
                console.error('Error deleting old image:', error);
            }
            updateData.imageUrl = newImageUrl;
        }

        // Update completion date if provided
        if (updateData.completionDate) {
            updateData.completionDate = new Date(updateData.completionDate);
        }

        const galleryItem = await prisma.galleryItem.update({
            where: { id },
            data: updateData,
        });

        return NextResponse.json(galleryItem);
    } catch (error) {
        console.error('Error updating gallery item:', error);
        return NextResponse.json(
            { error: 'Failed to update gallery item' },
            { status: 500 }
        );
    }
}

// DELETE /api/admin/services/[slug]/gallery - Delete gallery item(s)
export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const ids = searchParams.get('ids')?.split(',') || [];

        if (ids.length === 0) {
            return NextResponse.json(
                { error: 'No IDs provided' },
                { status: 400 }
            );
        }

        // Fetch items to delete images
        const items = await prisma.galleryItem.findMany({
            where: {
                id: {
                    in: ids,
                },
            },
        });

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

        // Delete items from database
        await prisma.galleryItem.deleteMany({
            where: {
                id: {
                    in: ids,
                },
            },
        });

        return NextResponse.json({ success: true, deleted: ids.length });
    } catch (error) {
        console.error('Error deleting gallery items:', error);
        return NextResponse.json(
            { error: 'Failed to delete gallery items' },
            { status: 500 }
        );
    }
}
