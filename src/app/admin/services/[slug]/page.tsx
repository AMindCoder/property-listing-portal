'use client';

import Link from 'next/link';
import { useState, useEffect, use } from 'react';
import { GalleryItem } from '@/types/services';
import GalleryItemModal from './components/GalleryItemModal';
import ReorderableGallery from './components/ReorderableGallery';

interface Params {
    slug: string;
}

export default function AdminCategoryGalleryPage({ params }: { params: Promise<{ slug: string }> }) {
    // Unwrap the Promise params in Next.js 15+
    const resolvedParams = use(params);
    const slug = resolvedParams.slug;

    const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
    const [categoryName, setCategoryName] = useState('');
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
    const [reorderMode, setReorderMode] = useState(false);
    const [savingOrder, setSavingOrder] = useState(false);

    useEffect(() => {
        fetchGalleryItems();
    }, [slug]);

    const fetchGalleryItems = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/services/${slug}/gallery`);
            if (res.ok) {
                const items = await res.json();
                setGalleryItems(items);
            }

            // Also fetch category details
            const catRes = await fetch(`/api/services/${slug}`);
            if (catRes.ok) {
                const category = await catRes.json();
                setCategoryName(category.name);
            }
        } catch (error) {
            console.error('Error fetching gallery items:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (data: any) => {
        try {
            const url = data.id
                ? `/api/admin/services/${slug}/gallery`
                : `/api/admin/services/${slug}/gallery`;

            const method = data.id ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                throw new Error('Failed to save');
            }

            await fetchGalleryItems();
            setModalOpen(false);
            setEditingItem(null);
        } catch (error) {
            console.error('Error saving item:', error);
            throw error;
        }
    };

    const handleDelete = async () => {
        if (!editingItem) return;

        try {
            const res = await fetch(`/api/admin/services/${slug}/gallery?ids=${editingItem.id}`, {
                method: 'DELETE',
            });

            if (!res.ok) {
                throw new Error('Failed to delete');
            }

            await fetchGalleryItems();
            setModalOpen(false);
            setEditingItem(null);
        } catch (error) {
            console.error('Error deleting item:', error);
            throw error;
        }
    };

    const handleBulkDelete = async () => {
        if (selectedItems.size === 0) return;

        if (!confirm(`Delete ${selectedItems.size} item(s)? This cannot be undone.`)) {
            return;
        }

        try {
            const ids = Array.from(selectedItems).join(',');
            const res = await fetch(`/api/admin/services/${slug}/gallery?ids=${ids}`, {
                method: 'DELETE',
            });

            if (!res.ok) {
                throw new Error('Failed to delete');
            }

            setSelectedItems(new Set());
            await fetchGalleryItems();
        } catch (error) {
            console.error('Error deleting items:', error);
            alert('Failed to delete items');
        }
    };

    const toggleItemSelection = (itemId: string) => {
        const newSelected = new Set(selectedItems);
        if (newSelected.has(itemId)) {
            newSelected.delete(itemId);
        } else {
            newSelected.add(itemId);
        }
        setSelectedItems(newSelected);
    };

    const toggleSelectAll = () => {
        if (selectedItems.size === galleryItems.length) {
            setSelectedItems(new Set());
        } else {
            setSelectedItems(new Set(galleryItems.map(item => item.id)));
        }
    };

    const handleReorder = async (reorderedItems: GalleryItem[]) => {
        setSavingOrder(true);
        try {
            const payload = {
                items: reorderedItems.map((item, index) => ({
                    id: item.id,
                    displayOrder: index + 1
                }))
            };

            const res = await fetch(`/api/admin/services/${slug}/gallery/reorder`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                throw new Error('Failed to save order');
            }

            // Update local state
            setGalleryItems(reorderedItems);
        } catch (error) {
            console.error('Error saving order:', error);
            alert('Failed to save new order');
            // Refresh from server on error
            await fetchGalleryItems();
        } finally {
            setSavingOrder(false);
        }
    };

    const handleBulkActivate = async () => {
        if (selectedItems.size === 0) return;

        try {
            const promises = Array.from(selectedItems).map(async (id) => {
                const res = await fetch(`/api/admin/services/${slug}/gallery`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id, isActive: true }),
                });
                return res.ok;
            });

            const results = await Promise.all(promises);
            if (results.every(r => r)) {
                await fetchGalleryItems();
                setSelectedItems(new Set());
            } else {
                alert('Some items failed to activate');
            }
        } catch (error) {
            console.error('Error activating items:', error);
            alert('Failed to activate items');
        }
    };

    const handleBulkDeactivate = async () => {
        if (selectedItems.size === 0) return;

        try {
            const promises = Array.from(selectedItems).map(async (id) => {
                const res = await fetch(`/api/admin/services/${slug}/gallery`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id, isActive: false }),
                });
                return res.ok;
            });

            const results = await Promise.all(promises);
            if (results.every(r => r)) {
                await fetchGalleryItems();
                setSelectedItems(new Set());
            } else {
                alert('Some items failed to deactivate');
            }
        } catch (error) {
            console.error('Error deactivating items:', error);
            alert('Failed to deactivate items');
        }
    };

    if (loading) {
        return <div className="loading">Loading gallery items...</div>;
    }

    return (
        <div style={{ padding: '2rem' }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <nav style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', marginBottom: '1rem' }}>
                    <Link href="/admin" style={{ color: 'var(--text-tertiary)', textDecoration: 'none' }}>Admin</Link>
                    {' > '}
                    <Link href="/admin/services" style={{ color: 'var(--text-tertiary)', textDecoration: 'none' }}>Services</Link>
                    {' > '}
                    <span style={{ color: 'var(--copper-400)' }}>{categoryName}</span>
                </nav>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{
                            fontSize: '2.5rem',
                            fontWeight: 800,
                            marginBottom: '0.5rem',
                            fontFamily: "'Playfair Display', serif",
                            color: 'var(--text-primary)'
                        }}>
                            {categoryName}
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
                            {galleryItems.length} gallery {galleryItems.length === 1 ? 'item' : 'items'}
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        {galleryItems.length > 1 && (
                            <button
                                className={reorderMode ? 'btn btn-secondary' : 'btn'}
                                onClick={() => {
                                    setReorderMode(!reorderMode);
                                    setSelectedItems(new Set()); // Clear selections when switching modes
                                }}
                                style={{ padding: '0.875rem 1.75rem' }}
                                disabled={savingOrder}
                            >
                                {savingOrder ? 'Saving...' : reorderMode ? '✓ Done Reordering' : '↕️ Reorder'}
                            </button>
                        )}
                        {!reorderMode && (
                            <button
                                className="btn"
                                onClick={() => {
                                    setEditingItem(null);
                                    setModalOpen(true);
                                }}
                                style={{ padding: '0.875rem 1.75rem' }}
                            >
                                + Add Gallery Item
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Bulk Actions */}
            {selectedItems.size > 0 && !reorderMode && (
                <div style={{
                    background: 'var(--bg-tertiary)',
                    padding: '1rem 1.5rem',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '2rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    border: '1px solid var(--copper-500)'
                }}>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                        {selectedItems.size} item(s) selected
                    </span>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button
                            className="btn btn-secondary"
                            onClick={handleBulkActivate}
                            style={{ padding: '0.625rem 1.25rem' }}
                        >
                            ✓ Activate
                        </button>
                        <button
                            className="btn btn-secondary"
                            onClick={handleBulkDeactivate}
                            style={{ padding: '0.625rem 1.25rem' }}
                        >
                            ✗ Deactivate
                        </button>
                        <button
                            className="btn btn-danger"
                            onClick={handleBulkDelete}
                            style={{ padding: '0.625rem 1.25rem' }}
                        >
                            Delete
                        </button>
                    </div>
                </div>
            )}

            {/* Gallery Grid */}
            {galleryItems.length > 0 ? (
                reorderMode ? (
                    <div style={{ maxWidth: '800px' }}>
                        <div style={{
                            padding: '1rem',
                            background: 'var(--bg-tertiary)',
                            borderRadius: 'var(--radius-md)',
                            marginBottom: '1rem',
                            border: '1px solid var(--copper-200)'
                        }}>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', margin: 0 }}>
                                💡 Drag items to reorder. Changes are saved automatically.
                            </p>
                        </div>
                        <ReorderableGallery items={galleryItems} onReorder={handleReorder} />
                    </div>
                ) : (
                    <div className="property-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                        {galleryItems.map((item) => (
                            <div
                                key={item.id}
                                style={{
                                    background: 'var(--bg-secondary)',
                                    borderRadius: 'var(--radius-lg)',
                                    border: selectedItems.has(item.id) ? '2px solid var(--copper-500)' : '1px solid var(--border-subtle)',
                                    overflow: 'hidden',
                                    position: 'relative'
                                }}
                            >
                                {/* Checkbox */}
                                <div style={{
                                    position: 'absolute',
                                    top: '0.75rem',
                                    left: '0.75rem',
                                    zIndex: 10
                                }}>
                                    <input
                                        type="checkbox"
                                        checked={selectedItems.has(item.id)}
                                        onChange={() => toggleItemSelection(item.id)}
                                        style={{
                                            width: '20px',
                                            height: '20px',
                                            cursor: 'pointer',
                                            accentColor: 'var(--copper-500)'
                                        }}
                                    />
                                </div>

                                {/* Status Badge */}
                                <div style={{
                                    position: 'absolute',
                                    top: '0.75rem',
                                    right: '0.75rem',
                                    zIndex: 10
                                }}>
                                    <span className={item.isActive ? 'status-available' : 'status-sold'}>
                                        {item.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>

                                <img
                                    src={item.imageUrl}
                                    alt={item.imageAltText || item.title}
                                    style={{
                                        width: '100%',
                                        height: '200px',
                                        objectFit: 'cover',
                                        borderBottom: '1px solid var(--border-subtle)'
                                    }}
                                />

                                <div style={{ padding: '1.25rem' }}>
                                    <h3 style={{
                                        fontSize: '1.125rem',
                                        fontWeight: 700,
                                        color: 'var(--text-primary)',
                                        marginBottom: '0.5rem',
                                        fontFamily: "'Playfair Display', serif",
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden'
                                    }}>
                                        {item.title}
                                    </h3>

                                    {item.description && (
                                        <p style={{
                                            color: 'var(--text-secondary)',
                                            fontSize: '0.875rem',
                                            marginBottom: '1rem',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden'
                                        }}>
                                            {item.description}
                                        </p>
                                    )}

                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => {
                                            setEditingItem(item);
                                            setModalOpen(true);
                                        }}
                                        style={{ width: '100%', padding: '0.625rem', fontSize: '0.875rem' }}
                                    >
                                        Edit
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            ) : (
                <div className="empty-state">
                    <div className="empty-icon">🖼️</div>
                    <h2 className="empty-title">No Gallery Items Yet</h2>
                    <p className="empty-message">
                        Add your first gallery item to showcase your construction work
                    </p>
                    <button
                        className="btn"
                        onClick={() => {
                            setEditingItem(null);
                            setModalOpen(true);
                        }}
                        style={{ marginTop: '1.5rem', padding: '0.875rem 2rem' }}
                    >
                        + Add Gallery Item
                    </button>
                </div>
            )}

            {/* Select All (if items exist) */}
            {galleryItems.length > 0 && (
                <div style={{ marginTop: '2rem', padding: '1rem 0', borderTop: '1px solid var(--border-subtle)' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={selectedItems.size === galleryItems.length && galleryItems.length > 0}
                            onChange={toggleSelectAll}
                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                        />
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', fontWeight: 500 }}>
                            Select All ({galleryItems.length})
                        </span>
                    </label>
                </div>
            )}

            {/* Modal */}
            <GalleryItemModal
                isOpen={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setEditingItem(null);
                }}
                onSave={handleSave}
                onDelete={editingItem ? handleDelete : undefined}
                categoryId={slug}
                item={editingItem}
            />
        </div>
    );
}
