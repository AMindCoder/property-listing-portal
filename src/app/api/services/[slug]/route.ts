import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { NextRequest } from 'next/server';

const prisma = new PrismaClient();

// GET /api/services/[slug] - Fetch category by slug with gallery items
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;

        const category = await prisma.serviceCategory.findUnique({
            where: {
                slug,
                isActive: true,
            },
            include: {
                galleryItems: {
                    where: {
                        isActive: true,
                    },
                    orderBy: {
                        displayOrder: 'asc',
                    },
                },
            },
        });

        if (!category) {
            return NextResponse.json(
                { error: 'Category not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(category);
    } catch (error) {
        console.error('Error fetching category:', error);
        return NextResponse.json(
            { error: 'Failed to fetch category' },
            { status: 500 }
        );
    }
}
