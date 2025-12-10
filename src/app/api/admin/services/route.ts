import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/admin/services - Fetch all categories (including inactive)
export async function GET() {
    try {
        const categories = await prisma.serviceCategory.findMany({
            orderBy: {
                displayOrder: 'asc',
            },
            include: {
                _count: {
                    select: {
                        galleryItems: true,
                    },
                },
            },
        });

        return NextResponse.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        return NextResponse.json(
            { error: 'Failed to fetch categories' },
            { status: 500 }
        );
    }
}

// POST /api/admin/services - Create new category
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, slug, description, metaTitle, metaDescription } = body;

        // Get the next display order
        const maxOrder = await prisma.serviceCategory.aggregate({
            _max: {
                displayOrder: true,
            },
        });

        const category = await prisma.serviceCategory.create({
            data: {
                name,
                slug,
                description,
                metaTitle,
                metaDescription,
                displayOrder: (maxOrder._max.displayOrder || 0) + 1,
            },
        });

        return NextResponse.json(category, { status: 201 });
    } catch (error) {
        console.error('Error creating category:', error);
        return NextResponse.json(
            { error: 'Failed to create category' },
            { status: 500 }
        );
    }
}

// PUT /api/admin/services - Update category
export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, ...updateData } = body;

        const category = await prisma.serviceCategory.update({
            where: { id },
            data: updateData,
        });

        return NextResponse.json(category);
    } catch (error) {
        console.error('Error updating category:', error);
        return NextResponse.json(
            { error: 'Failed to update category' },
            { status: 500 }
        );
    }
}

// PATCH /api/admin/services - Toggle category active status
export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const { id, isActive } = body;

        const category = await prisma.serviceCategory.update({
            where: { id },
            data: { isActive },
        });

        return NextResponse.json(category);
    } catch (error) {
        console.error('Error toggling category status:', error);
        return NextResponse.json(
            { error: 'Failed to toggle category status' },
            { status: 500 }
        );
    }
}
