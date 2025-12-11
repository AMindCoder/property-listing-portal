import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/admin/services/all-projects - Get all unique project names across all categories
export async function GET() {
    try {
        // Get all gallery items with project names, grouped by project
        const items = await prisma.galleryItem.findMany({
            where: {
                projectName: { not: '' }
            },
            select: {
                projectName: true,
                projectLocation: true,
                category: {
                    select: {
                        name: true,
                        slug: true
                    }
                }
            },
            orderBy: { projectName: 'asc' }
        });

        // Group by project name and collect category info
        const projectMap = new Map<string, {
            projectName: string;
            projectLocation: string | null;
            categories: Array<{ name: string; slug: string }>;
        }>();

        for (const item of items) {
            const existing = projectMap.get(item.projectName);
            if (existing) {
                // Add category if not already present
                const hasCategory = existing.categories.some(c => c.slug === item.category.slug);
                if (!hasCategory) {
                    existing.categories.push({
                        name: item.category.name,
                        slug: item.category.slug
                    });
                }
            } else {
                projectMap.set(item.projectName, {
                    projectName: item.projectName,
                    projectLocation: item.projectLocation,
                    categories: [{
                        name: item.category.name,
                        slug: item.category.slug
                    }]
                });
            }
        }

        const projects = Array.from(projectMap.values());
        return NextResponse.json(projects);
    } catch (error) {
        console.error('Error fetching all projects:', error);
        return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
    }
}
