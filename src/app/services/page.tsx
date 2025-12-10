import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

interface ServiceCategory {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    coverImageUrl: string | null;
    _count?: {
        galleryItems: number;
    };
}

async function getServiceCategories(): Promise<ServiceCategory[]> {
    try {
        const categories = await prisma.serviceCategory.findMany({
            where: { isActive: true },
            orderBy: { displayOrder: 'asc' },
            include: {
                _count: {
                    select: { galleryItems: true },
                },
            },
        });
        return categories;
    } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
}

export default async function ServicesPage() {
    const categories = await getServiceCategories();

    return (
        <>
            <Header />

            <main className="container">
                {/* Hero Section */}
                <section style={{ textAlign: 'center', padding: '4rem 0', marginTop: '3rem' }}>
                    <h1 style={{
                        fontSize: '3.5rem',
                        fontWeight: 800,
                        marginBottom: '1.5rem',
                        fontFamily: "'Playfair Display', serif",
                        color: 'var(--text-primary)'
                    }}>
                        Our Construction Services
                    </h1>
                    <p style={{
                        fontSize: '1.25rem',
                        color: 'var(--text-secondary)',
                        maxWidth: '700px',
                        margin: '0 auto',
                        lineHeight: 1.7
                    }}>
                        We bring your vision to life with expert craftsmanship and quality materials.
                        Browse our portfolio of construction work across various specializations.
                    </p>
                </section>

                {/* Category Grid */}
                <section style={{ paddingBottom: '5rem' }}>
                    <div className="property-grid">
                        {categories.map((category) => (
                            <Link
                                key={category.id}
                                href={`/services/${category.slug}`}
                                className="property-card"
                                style={{ textDecoration: 'none' }}
                            >
                                {category.coverImageUrl ? (
                                    <img
                                        src={category.coverImageUrl}
                                        alt={category.name}
                                        className="property-image"
                                    />
                                ) : (
                                    <div
                                        className="property-image"
                                        style={{
                                            background: 'linear-gradient(135deg, var(--navy-700), var(--navy-600))',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '4rem',
                                            color: 'var(--copper-400)',
                                            opacity: 0.5
                                        }}
                                    >
                                        🏗️
                                    </div>
                                )}

                                <div className="property-content">
                                    <div className="property-header">
                                        <h2 className="property-title">{category.name}</h2>
                                    </div>

                                    <p className="property-description">
                                        {category.description || 'View our portfolio of quality construction work.'}
                                    </p>

                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginTop: '1.5rem',
                                        padding: '1rem 0',
                                        borderTop: '1px solid var(--border-subtle)'
                                    }}>
                                        <span style={{
                                            color: 'var(--copper-400)',
                                            fontSize: '1.125rem',
                                            fontWeight: 600
                                        }}>
                                            {category._count?.galleryItems || 0} {category._count?.galleryItems === 1 ? 'Project' : 'Projects'}
                                        </span>

                                        <span style={{
                                            color: 'var(--copper-500)',
                                            fontSize: '0.875rem',
                                            fontWeight: 600
                                        }}>
                                            View Gallery →
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {categories.length === 0 && (
                        <div className="empty-state">
                            <div className="empty-icon">🏗️</div>
                            <h2 className="empty-title">Services Coming Soon</h2>
                            <p className="empty-message">
                                We're currently setting up our service galleries. Please check back soon.
                            </p>
                        </div>
                    )}
                </section>
            </main>

            <Footer />
        </>
    );
}
