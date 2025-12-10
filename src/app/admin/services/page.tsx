import Link from 'next/link';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

interface ServiceCategory {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    isActive: boolean;
    coverImageUrl: string | null;
    _count?: {
        galleryItems: number;
    };
}

async function getCategories(): Promise<ServiceCategory[]> {
    try {
        const categories = await prisma.serviceCategory.findMany({
            orderBy: { displayOrder: 'asc' },
            include: {
                _count: {
                    select: { galleryItems: true }
                }
            }
        });
        return categories;
    } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
}

export default async function AdminServicesPage() {
    const categories = await getCategories();

    return (
        <div style={{ padding: '2rem' }}>
            <div style={{ marginBottom: '2.5rem' }}>
                <h1 style={{
                    fontSize: '2.5rem',
                    fontWeight: 800,
                    marginBottom: '0.75rem',
                    fontFamily: "'Playfair Display', serif",
                    color: 'var(--text-primary)'
                }}>
                    Manage Services
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
                    Manage your construction service galleries and portfolio
                </p>
            </div>

            <div className="property-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
                {categories.map((category) => (
                    <div
                        key={category.id}
                        style={{
                            background: 'var(--bg-secondary)',
                            borderRadius: 'var(--radius-lg)',
                            border: '1px solid var(--border-subtle)',
                            overflow: 'hidden'
                        }}
                    >
                        {category.coverImageUrl ? (
                            <img
                                src={category.coverImageUrl}
                                alt={category.name}
                                style={{
                                    width: '100%',
                                    height: '180px',
                                    objectFit: 'cover',
                                    borderBottom: '1px solid var(--border-subtle)'
                                }}
                            />
                        ) : (
                            <div
                                style={{
                                    width: '100%',
                                    height: '180px',
                                    background: 'linear-gradient(135deg, var(--navy-700), var(--navy-600))',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '3rem',
                                    borderBottom: '1px solid var(--border-subtle)'
                                }}
                            >
                                🏗️
                            </div>
                        )}

                        <div style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                <h2 style={{
                                    fontSize: '1.25rem',
                                    fontWeight: 700,
                                    color: 'var(--text-primary)',
                                    fontFamily: "'Playfair Display', serif"
                                }}>
                                    {category.name}
                                </h2>

                                <span className={category.isActive ? 'status-available' : 'status-sold'} style={{ fontSize: '0.625rem' }}>
                                    {category.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>

                            <p style={{
                                color: 'var(--text-secondary)',
                                fontSize: '0.875rem',
                                marginBottom: '1rem',
                                minHeight: '40px'
                            }}>
                                {category.description || 'No description'}
                            </p>

                            <div style={{
                                padding: '0.75rem 0',
                                borderTop: '1px solid var(--border-subtle)',
                                borderBottom: '1px solid var(--border-subtle)',
                                marginBottom: '1rem'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    color: 'var(--text-tertiary)',
                                    fontSize: '0.875rem'
                                }}>
                                    <span>Gallery Items</span>
                                    <span style={{ fontWeight: 700, color: 'var(--copper-400)' }}>
                                        {category._count?.galleryItems || 0}
                                    </span>
                                </div>
                            </div>

                            <Link
                                href={`/admin/services/${category.slug}`}
                                className="btn btn-secondary"
                                style={{ width: '100%', textAlign: 'center', textDecoration: 'none', display: 'block', padding: '0.75rem' }}
                            >
                                Manage Gallery
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            {categories.length === 0 && (
                <div className="empty-state">
                    <div className="empty-icon">🏗️</div>
                    <h2 className="empty-title">No Categories Found</h2>
                    <p className="empty-message">
                        Run the seed script to populate the default service categories.
                    </p>
                </div>
            )}
        </div>
    );
}
