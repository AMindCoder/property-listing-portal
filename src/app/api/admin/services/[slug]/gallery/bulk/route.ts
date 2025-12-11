import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

interface BulkImageInput {
    imageUrl: string;
    imageThumbnailUrl?: string;
    title?: string;
    description?: string;
    imageAltText?: string;
}

interface BulkCreateRequest {
    projectName: string;
    projectLocation?: string;
    completionDate?: string;
    projectDescription?: string;
    isActive: boolean;
    images: BulkImageInput[];
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;
        const body: BulkCreateRequest = await request.json();

        if (!body.projectName?.trim()) {
            return NextResponse.json({ error: 'Project name is required' }, { status: 400 });
        }

        if (!body.images || body.images.length === 0) {
            return NextResponse.json({ error: 'At least one image is required' }, { status: 400 });
        }

        if (body.images.length > 20) {
            return NextResponse.json({ error: 'Maximum 20 images allowed per batch' }, { status: 400 });
        }

        const category = await prisma.serviceCategory.findUnique({ where: { slug } });
        if (!category) {
            return NextResponse.json({ error: 'Category not found' }, { status: 404 });
        }

        const maxOrder = await prisma.galleryItem.aggregate({
            where: { categoryId: category.id },
            _max: { displayOrder: true },
        });

        const startOrder = (maxOrder._max.displayOrder || 0) + 1;

        const itemsToCreate = body.images.map((image, index) => {
            const title = image.title?.trim() || `${body.projectName} - Image ${index + 1}`;
            return {
                categoryId: category.id,
                title,
                description: image.description?.trim() || body.projectDescription || null,
                imageUrl: image.imageUrl,
                imageThumbnailUrl: image.imageThumbnailUrl || null,
                imageAltText: image.imageAltText?.trim() || title,
                projectName: body.projectName,
                projectLocation: body.projectLocation || null,
                completionDate: body.completionDate ? new Date(body.completionDate) : null,
                isActive: body.isActive,
                displayOrder: startOrder + index,
                tags: [],
            };
        });

        const createdItems = await prisma.$transaction(async (tx) => {
            const results = [];
            for (const itemData of itemsToCreate) {
                results.push(await tx.galleryItem.create({ data: itemData }));
            }
            return results;
        });

        return NextResponse.json({ success: true, created: createdItems.length, items: createdItems }, { status: 201 });
    } catch (error) {
        console.error('Error in bulk create:', error);
        return NextResponse.json({ error: 'Failed to create gallery items' }, { status: 500 });
    }
}
