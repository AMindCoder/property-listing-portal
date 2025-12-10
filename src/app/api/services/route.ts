import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/services - Fetch all active service categories
export async function GET() {
    try {
        const categories = await prisma.serviceCategory.findMany({
            where: {
                isActive: true,
            },
            orderBy: {
                displayOrder: 'asc',
            },
            include: {
                _count: {
                    select: {
                        galleryItems: {
                            where: {
                                isActive: true,
                            },
                        },
                    },
                },
            },
        });

        return NextResponse.json(categories);
    } catch (error) {
        console.error('Error fetching service categories:', error);
        return NextResponse.json(
            { error: 'Failed to fetch service categories' },
            { status: 500 }
        );
    }
}
