'use client';

import { useState } from 'react';
import { GalleryItem, ProjectSummary } from '@/types/services';

interface ProjectDetailViewProps {
    project: ProjectSummary;
    images: GalleryItem[];
    categorySlug: string;
    onBack: () => void;
    onEditImage: (image: GalleryItem) => void;
    onAddImages: () => void;
    onRefresh: () => void;
    onEditProject: () => void;
    onMoveImages: (imageIds: string[]) => void;
    canModify?: boolean;
}

export default function ProjectDetailView({
    project,
    images,
    categorySlug,
    onBack,
    onEditImage,
    onAddImages,
    onRefresh,
    onEditProject,
    onMoveImages,
    canModify = true
}: ProjectDetailViewProps) {
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
    const [bulkActionLoading, setBulkActionLoading] = useState(false);

    const formattedDate = project.completionDate
        ? new Date(project.completionDate).toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric'
        })
        : null;

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
        if (selectedItems.size === images.length) {
            setSelectedItems(new Set());
        } else {
            setSelectedItems(new Set(images.map(item => item.id)));
        }
    };

    const handleBulkDelete = async () => {
        if (selectedItems.size === 0) return;

        if (!confirm(`Delete ${selectedItems.size} image(s)? This cannot be undone.`)) {
            return;
        }

        setBulkActionLoading(true);
        try {
            const ids = Array.from(selectedItems).join(',');
            const res = await fetch(`/api/admin/services/${categorySlug}/gallery?ids=${ids}`, {
                method: 'DELETE',
            });

            if (!res.ok) {
                throw new Error('Failed to delete');
            }

            setSelectedItems(new Set());
            onRefresh();
        } catch (error) {
            console.error('Error deleting items:', error);
            alert('Failed to delete items');
        } finally {
            setBulkActionLoading(false);
        }
    };

    const handleBulkActivate = async (activate: boolean) => {
        if (selectedItems.size === 0) return;

        setBulkActionLoading(true);
        try {
            const promises = Array.from(selectedItems).map(async (id) => {
                const res = await fetch(`/api/admin/services/${categorySlug}/gallery`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id, isActive: activate }),
                });
                return res.ok;
            });

            const results = await Promise.all(promises);
            if (results.every(r => r)) {
                setSelectedItems(new Set());
                onRefresh();
            } else {
                alert(`Some items failed to ${activate ? 'activate' : 'deactivate'}`);
            }
        } catch (error) {
            console.error(`Error ${activate ? 'activating' : 'deactivating'} items:`, error);
            alert(`Failed to ${activate ? 'activate' : 'deactivate'} items`);
        } finally {
            setBulkActionLoading(false);
        }
    };

    const handleDeleteProject = async () => {
        if (!confirm(`Delete project "${project.projectName}" and ALL ${images.length} images? This cannot be undone.`)) {
            return;
        }

        setBulkActionLoading(true);
        try {
            const res = await fetch(
                `/api/admin/services/${categorySlug}/gallery/projects/${encodeURIComponent(project.projectName)}`,
                { method: 'DELETE' }
            );

            if (!res.ok) {
                throw new Error('Failed to delete project');
            }

            onBack(); // Go back to projects view after deletion
        } catch (error) {
            console.error('Error deleting project:', error);
            alert('Failed to delete project');
        } finally {
            setBulkActionLoading(false);
        }
    };

    const handleMoveSelected = () => {
        if (selectedItems.size === 0) return;
        onMoveImages(Array.from(selectedItems));
    };

    return (
        <div>
            {/* Back Button & Header */}
            <div style={{ marginBottom: '2rem' }}>
                <button
                    onClick={onBack}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: 'none',
                        border: 'none',
                        color: 'var(--copper-500)',
                        fontSize: '0.9375rem',
                        cursor: 'pointer',
                        padding: '0.5rem 0',
                        marginBottom: '1rem',
                        fontWeight: 500
                    }}
                >
                    ← Back to Projects
                </button>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h2 style={{
                            fontSize: '2rem',
                            fontWeight: 800,
                            color: 'var(--text-primary)',
                            fontFamily: "'Playfair Display', serif",
                            marginBottom: '0.5rem'
                        }}>
                            {project.projectName}
                        </h2>

                        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
                            {project.projectLocation && (
                                <span>📍 {project.projectLocation}</span>
                            )}
                            {formattedDate && (
                                <span>📅 {formattedDate}</span>
                            )}
                            <span>🖼️ {images.length} {images.length === 1 ? 'image' : 'images'}</span>
                            <span style={{ color: 'var(--copper-500)' }}>
                                ✓ {project.activeCount} active
                            </span>
                        </div>
                    </div>

                    {canModify && (
                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                            <button
                                className="btn btn-secondary"
                                onClick={onEditProject}
                                style={{ padding: '0.625rem 1.25rem' }}
                            >
                                ✏️ Edit Project
                            </button>
                            <button
                                className="btn btn-danger"
                                onClick={handleDeleteProject}
                                disabled={bulkActionLoading}
                                style={{ padding: '0.625rem 1.25rem' }}
                            >
                                🗑️ Delete Project
                            </button>
                            <button
                                className="btn"
                                onClick={onAddImages}
                                style={{ padding: '0.625rem 1.25rem' }}
                            >
                                + Add Images
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Bulk Actions Bar */}
            {canModify && selectedItems.size > 0 && (
                <div style={{
                    background: 'var(--bg-tertiary)',
                    padding: '1rem 1.5rem',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    border: '1px solid var(--copper-500)'
                }}>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                        {selectedItems.size} image(s) selected
                    </span>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button
                            className="btn btn-secondary"
                            onClick={() => handleBulkActivate(true)}
                            disabled={bulkActionLoading}
                            style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                        >
                            ✓ Activate
                        </button>
                        <button
                            className="btn btn-secondary"
                            onClick={() => handleBulkActivate(false)}
                            disabled={bulkActionLoading}
                            style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                        >
                            ✗ Deactivate
                        </button>
                        <button
                            className="btn btn-secondary"
                            onClick={handleMoveSelected}
                            disabled={bulkActionLoading}
                            style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                        >
                            📁 Move
                        </button>
                        <button
                            className="btn btn-danger"
                            onClick={handleBulkDelete}
                            disabled={bulkActionLoading}
                            style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                        >
                            Delete
                        </button>
                    </div>
                </div>
            )}

            {/* Images Grid */}
            {images.length > 0 ? (
                <>
                    <div className="property-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
                        {images.map((item) => (
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
                                {/* Checkbox - only show for admins */}
                                {canModify && (
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
                                )}

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
                                        height: '180px',
                                        objectFit: 'cover',
                                        borderBottom: '1px solid var(--border-subtle)',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => onEditImage(item)}
                                />

                                <div style={{ padding: '1rem' }}>
                                    <h3 style={{
                                        fontSize: '1rem',
                                        fontWeight: 600,
                                        color: 'var(--text-primary)',
                                        marginBottom: '0.5rem',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        {item.title}
                                    </h3>

                                    {canModify ? (
                                        <button
                                            className="btn btn-secondary"
                                            onClick={() => onEditImage(item)}
                                            style={{ width: '100%', padding: '0.5rem', fontSize: '0.8125rem' }}
                                        >
                                            Edit
                                        </button>
                                    ) : (
                                        <span
                                            className="btn btn-secondary btn-disabled"
                                            style={{ width: '100%', padding: '0.5rem', fontSize: '0.8125rem', display: 'block', textAlign: 'center' }}
                                            title="View-only access"
                                        >
                                            View Only
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Select All Footer - only for admins */}
                    {canModify && (
                        <div style={{ marginTop: '1.5rem', padding: '1rem 0', borderTop: '1px solid var(--border-subtle)' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={selectedItems.size === images.length && images.length > 0}
                                    onChange={toggleSelectAll}
                                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                />
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', fontWeight: 500 }}>
                                    Select All ({images.length})
                                </span>
                            </label>
                        </div>
                    )}
                </>
            ) : (
                <div className="empty-state">
                    <div className="empty-icon">🖼️</div>
                    <h2 className="empty-title">No Images in Project</h2>
                    <p className="empty-message">
                        {canModify
                            ? 'Add images to this project to showcase your work'
                            : 'No images have been added to this project yet.'}
                    </p>
                    {canModify ? (
                        <button
                            className="btn"
                            onClick={onAddImages}
                            style={{ marginTop: '1.5rem', padding: '0.875rem 2rem' }}
                        >
                            + Add Images
                        </button>
                    ) : (
                        <span
                            className="btn btn-disabled"
                            style={{ marginTop: '1.5rem', padding: '0.875rem 2rem' }}
                            title="View-only access"
                        >
                            + Add Images
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}
