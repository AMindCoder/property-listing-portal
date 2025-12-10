import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const defaultCategories = [
    {
        name: 'Foundations & Structure',
        slug: 'foundations',
        description: 'Foundation work, basement construction, structural framework',
        displayOrder: 1,
        isActive: true,
        metaTitle: 'Foundations & Structure - Construction Services',
        metaDescription: 'Expert foundation and structural work for residential and commercial projects'
    },
    {
        name: 'Walls & Masonry',
        slug: 'walls',
        description: 'Brick work, block laying, plastering, wall finishes',
        displayOrder: 2,
        isActive: true,
        metaTitle: 'Walls & Masonry - Construction Services',
        metaDescription: 'Professional masonry and wall construction with quality materials'
    },
    {
        name: 'Interiors & Finishes',
        slug: 'interiors',
        description: 'Interior design, flooring, painting, fixtures, woodwork',
        displayOrder: 3,
        isActive: true,
        metaTitle: 'Interiors & Finishes - Construction Services',
        metaDescription: 'Premium interior finishing services for your dream home'
    },
    {
        name: 'Roofing & Ceilings',
        slug: 'ceilings',
        description: 'Ceiling designs, false ceilings, roofing work',
        displayOrder: 4,
        isActive: true,
        metaTitle: 'Roofing & Ceilings - Construction Services',
        metaDescription: 'Quality roofing and ceiling solutions for all types of buildings'
    },
    {
        name: 'Stairs & Railings',
        slug: 'stairs',
        description: 'Staircase construction, railings, balustrades',
        displayOrder: 5,
        isActive: true,
        metaTitle: 'Stairs & Railings - Construction Services',
        metaDescription: 'Custom staircase and railing designs with safety and aesthetics in mind'
    },
    {
        name: 'Exteriors & Landscaping',
        slug: 'exteriors',
        description: 'External finishes, landscaping, driveways, boundary walls',
        displayOrder: 6,
        isActive: true,
        metaTitle: 'Exteriors & Landscaping - Construction Services',
        metaDescription: 'Beautiful exterior finishes and landscaping services'
    }
];

async function seedServices() {
    console.log('🌱 Seeding service categories...');

    for (const category of defaultCategories) {
        await prisma.serviceCategory.upsert({
            where: { slug: category.slug },
            update: category,
            create: category,
        });
        console.log(`✅ Created/Updated: ${category.name}`);
    }

    console.log('✨ Service categories seeded successfully!');
}

seedServices()
    .catch((e) => {
        console.error('❌ Error seeding services:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
