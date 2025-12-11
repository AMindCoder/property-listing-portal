import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/admin/services/[slug]/gallery/projects - List all projects with aggregations
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;

        const category = await prisma.serviceCategory.findUnique({
            where: { slug },
        });

        if (!category) {
            return NextResponse.json({ error: 'Category not found' }, { status: 404 });
        }

        // Get all gallery items grouped by project
        const items = await prisma.galleryItem.findMany({
            where: { categoryId: category.id },
            orderBy: [
                { projectName: 'asc' },
                { displayOrder: 'asc' }
            ],
            select: {
                id: true,
                projectName: true,
                projectLocation: true,
                completionDate: true,
                imageUrl: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
            }
        });

        // Group by projectName and aggregate
        const projectMap = new Map<string, {
            projectName: string;
            projectLocation: string | null;
            completionDate: Date | null;
            imageCount: number;
            activeCount: number;
            previewImages: string[];
            createdAt: Date;
            updatedAt: Date;
        }>();

        for (const item of items) {
            const existing = projectMap.get(item.projectName);

            if (existing) {
                existing.imageCount++;
                if (item.isActive) existing.activeCount++;
                if (existing.previewImages.length < 4) {
                    existing.previewImages.push(item.imageUrl);
                }
                if (item.createdAt < existing.createdAt) {
                    existing.createdAt = item.createdAt;
                }
                if (item.updatedAt > existing.updatedAt) {
                    existing.updatedAt = item.updatedAt;
                }
            } else {
                projectMap.set(item.projectName, {
                    projectName: item.projectName,
                    projectLocation: item.projectLocation,
                    completionDate: item.completionDate,
                    imageCount: 1,
                    activeCount: item.isActive ? 1 : 0,
                    previewImages: [item.imageUrl],
                    createdAt: item.createdAt,
                    updatedAt: item.updatedAt,
                });
            }
        }

        const projects = Array.from(projectMap.values());

        return NextResponse.json(projects);
    } catch (error) {
        console.error('Error fetching projects:', error);
        return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
    }
}
