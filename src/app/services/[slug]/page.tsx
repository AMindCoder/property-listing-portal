import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import GalleryGrid from './components/GalleryGrid';
import { CategoryWithGallery } from '@/types/services';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

const serviceCategories = [
    { name: 'Foundations & Structure', slug: 'foundations' },
    { name: 'Walls & Masonry', slug: 'walls' },
    { name: 'Interiors & Finishes', slug: 'interiors' },
    { name: 'Roofing & Ceilings', slug: 'ceilings' },
    { name: 'Stairs & Railings', slug: 'stairs' },
    { name: 'Exteriors & Landscaping', slug: 'exteriors' },
];

async function getCategoryWithGallery(slug: string): Promise<CategoryWithGallery | null> {
    try {
        const category = await prisma.serviceCategory.findUnique({
            where: { slug },
            include: {
                galleryItems: {
                    where: { isActive: true },
                    orderBy: { displayOrder: 'asc' },
                },
            },
        });

        return category;
    } catch (error) {
        console.error('Error fetching category:', error);
        return null;
    }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const category = await getCategoryWithGallery(slug);

    if (!category) {
        return {
            title: 'Category Not Found',
        };
    }

    return {
        title: category.metaTitle || `${category.name} | Construction Services`,
        description: category.metaDescription || category.description || `View our portfolio of ${category.name.toLowerCase()} work`,
    };
}

export default async function ServiceCategoryPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const category = await getCategoryWithGallery(slug);

    if (!category) {
        notFound();
    }

    // Find current category index for navigation
    const currentIndex = serviceCategories.findIndex((cat) => cat.slug === slug);
    const previousCategory = currentIndex > 0 ? serviceCategories[currentIndex - 1] : null;
    const nextCategory = currentIndex < serviceCategories.length - 1 ? serviceCategories[currentIndex + 1] : null;

    return (
        <>
            <Header />

            <main className="container">
                {/* Breadcrumb */}
                <nav style={{ padding: '2rem 0 1rem', fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>
                    <Link href="/" style={{ color: 'var(--text-tertiary)', textDecoration: 'none' }}>Home</Link>
                    {' > '}
                    <Link href="/services" style={{ color: 'var(--text-tertiary)', textDecoration: 'none' }}>Services</Link>
                    {' > '}
                    <span style={{ color: 'var(--copper-400)' }}>{category.name}</span>
                </nav>

                {/* Category Header */}
                <header style={{ marginBottom: '3rem' }}>
                    <h1 style={{
                        fontSize: '3rem',
                        fontWeight: 800,
                        marginBottom: '1rem',
                        fontFamily: "'Playfair Display', serif",
                        color: 'var(--text-primary)'
                    }}>
                        {category.name}
                    </h1>

                    {category.description && (
                        <p style={{
                            fontSize: '1.125rem',
                            color: 'var(--text-secondary)',
                            lineHeight: 1.7,
                            maxWidth: '800px'
                        }}>
                            {category.description}
                        </p>
                    )}

                    <div style={{
                        marginTop: '1rem',
                        color: 'var(--text-tertiary)',
                        fontSize: '0.875rem',
                        fontWeight: 600
                    }}>
                        {category.galleryItems.length} {category.galleryItems.length === 1 ? 'Project' : 'Projects'}
                    </div>
                </header>

                {/* Category Navigation Pills */}
                <div className="category-nav" style={{
                    display: 'flex',
                    gap: '0.5rem',
                    marginBottom: '2.5rem',
                    flexWrap: 'wrap',
                    padding: '1.5rem',
                    background: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)'
                }}>
                    {serviceCategories.map((cat) => (
                        <Link
                            key={cat.slug}
                            href={`/services/${cat.slug}`}
                            className={cat.slug === slug ? 'category-nav-pill active' : 'category-nav-pill'}
                            style={{
                                padding: '0.625rem 1.125rem',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                textDecoration: 'none',
                                transition: 'all var(--transition-fast)',
                                background: cat.slug === slug ? 'var(--bg-tertiary)' : 'transparent',
                                color: cat.slug === slug ? 'var(--copper-400)' : 'var(--text-secondary)',
                                border: `1px solid ${cat.slug === slug ? 'var(--copper-500)' : 'var(--border-subtle)'}`,
                                whiteSpace: 'nowrap'
                            }}
                        >
                            {cat.name}
                        </Link>
                    ))}
                </div>

                {/* Gallery */}
                <section style={{ paddingBottom: '3rem' }}>
                    <GalleryGrid items={category.galleryItems} />
                </section>

                {/* Previous/Next Navigation */}
                {(previousCategory || nextCategory) && (
                    <nav style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '2rem 0 4rem',
                        borderTop: '1px solid var(--border-subtle)'
                    }}>
                        {previousCategory ? (
                            <Link
                                href={`/services/${previousCategory.slug}`}
                                className="btn btn-secondary"
                                style={{ textDecoration: 'none' }}
                            >
                                ← {previousCategory.name}
                            </Link>
                        ) : (
                            <div></div>
                        )}

                        {nextCategory && (
                            <Link
                                href={`/services/${nextCategory.slug}`}
                                className="btn btn-secondary"
                                style={{ textDecoration: 'none' }}
                            >
                                {nextCategory.name} →
                            </Link>
                        )}
                    </nav>
                )}
            </main>

            <Footer />
        </>
    );
}

