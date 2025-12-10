'use client';

import { useState } from 'react';
import ImageUploader from '@/components/ui/image-upload/ImageUploader';
import { GalleryItem } from '@/types/services';

interface GalleryItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => Promise<void>;
    onDelete?: () => Promise<void>;
    categoryId: string;
    item?: GalleryItem | null;
}

export default function GalleryItemModal({
    isOpen,
    onClose,
    onSave,
    onDelete,
    categoryId,
    item
}: GalleryItemModalProps) {
    const [formData, setFormData] = useState({
        title: item?.title || '',
        description: item?.description || '',
        imageUrl: item?.imageUrl || '',
        imageAltText: item?.imageAltText || '',
        projectName: item?.projectName || '',
        projectLocation: item?.projectLocation || '',
        completionDate: item?.completionDate ? new Date(item.completionDate).toISOString().split('T')[0] : '',
        isActive: item?.isActive ?? true,
    });

    const [images, setImages] = useState<string[]>(item?.imageUrl ? [item.imageUrl] : []);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!images[0]) {
            alert('Please upload an image');
            return;
        }

        setSaving(true);
        try {
            await onSave({
                ...formData,
                imageUrl: images[0],
                categoryId,
                id: item?.id,
            });
            onClose();
        } catch (error) {
            console.error('Error saving gallery item:', error);
            alert('Failed to save gallery item');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!onDelete || !item) return;

        if (!confirm('Are you sure you want to delete this gallery item? This cannot be undone.')) {
            return;
        }

        setDeleting(true);
        try {
            await onDelete();
            onClose();
        } catch (error) {
            console.error('Error deleting gallery item:', error);
            alert('Failed to delete gallery item');
        } finally {
            setDeleting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="modal-overlay"
            onClick={onClose}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '1rem',
            }}
        >
            <div
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border-medium)',
                    maxWidth: '800px',
                    width: '100%',
                    maxHeight: '90vh',
                    overflow: 'auto',
                    padding: '2rem',
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h2 style={{
                        fontSize: '1.75rem',
                        fontWeight: 700,
                        fontFamily: "'Playfair Display', serif",
                        color: 'var(--text-primary)'
                    }}>
                        {item ? 'Edit Gallery Item' : 'Add Gallery Item'}
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-secondary)',
                            cursor: 'pointer',
                            fontSize: '1.5rem',
                            padding: '0.5rem',
                        }}
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Image Upload */}
                    <div style={{ marginBottom: '2rem' }}>
                        <label className="filter-label" style={{ display: 'block', marginBottom: '0.75rem' }}>
                            Image * <span style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', fontWeight: 400 }}>(Required)</span>
                        </label>
                        <ImageUploader
                            onUploadComplete={(urls) => setImages(urls)}
                            onImagesChange={(urls) => setImages(urls)}
                            initialImages={images}
                            maxFiles={1}
                            folder="services"
                        />
                        {!images[0] && !item && (
                            <p style={{
                                color: 'var(--copper-500)',
                                fontSize: '0.875rem',
                                marginTop: '0.5rem',
                                fontWeight: 500
                            }}>
                                ⚠️ Please upload an image to create the gallery item
                            </p>
                        )}
                    </div>

                    {/* Title */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label className="filter-label" style={{ display: 'block', marginBottom: '0.5rem' }}>
                            Title *
                        </label>
                        <input
                            type="text"
                            className="filter-input"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                            maxLength={200}
                            placeholder="e.g., Reinforced Foundation with Waterproofing"
                        />
                    </div>

                    {/* Description */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label className="filter-label" style={{ display: 'block', marginBottom: '0.5rem' }}>
                            Description
                        </label>
                        <textarea
                            className="filter-input"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            maxLength={2000}
                            rows={4}
                            placeholder="Describe the work, materials used, techniques, quality highlights..."
                            style={{ resize: 'vertical', fontFamily: 'inherit' }}
                        />
                    </div>

                    {/* Project Details */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div>
                            <label className="filter-label" style={{ display: 'block', marginBottom: '0.5rem' }}>
                                Project Name
                            </label>
                            <input
                                type="text"
                                className="filter-input"
                                value={formData.projectName}
                                onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                                maxLength={100}
                                placeholder="e.g., Sunrise Villa"
                            />
                        </div>

                        <div>
                            <label className="filter-label" style={{ display: 'block', marginBottom: '0.5rem' }}>
                                Project Location
                            </label>
                            <input
                                type="text"
                                className="filter-input"
                                value={formData.projectLocation}
                                onChange={(e) => setFormData({ ...formData, projectLocation: e.target.value })}
                                maxLength={200}
                                placeholder="e.g., Whitefield, Bangalore"
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div>
                            <label className="filter-label" style={{ display: 'block', marginBottom: '0.5rem' }}>
                                Completion Date
                            </label>
                            <input
                                type="date"
                                className="filter-input"
                                value={formData.completionDate}
                                onChange={(e) => setFormData({ ...formData, completionDate: e.target.value })}
                                max={new Date().toISOString().split('T')[0]}
                            />
                        </div>

                        <div>
                            <label className="filter-label" style={{ display: 'block', marginBottom: '0.5rem' }}>
                                Alt Text
                            </label>
                            <input
                                type="text"
                                className="filter-input"
                                value={formData.imageAltText}
                                onChange={(e) => setFormData({ ...formData, imageAltText: e.target.value })}
                                maxLength={200}
                                placeholder="Image description for accessibility"
                            />
                        </div>
                    </div>

                    {/* Active Status */}
                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={formData.isActive}
                                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                            />
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', fontWeight: 500 }}>
                                Active (visible to public)
                            </span>
                        </label>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
                        <div>
                            {item && onDelete && (
                                <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={handleDelete}
                                    disabled={deleting || saving}
                                    style={{ padding: '0.75rem 1.5rem' }}
                                >
                                    {deleting ? 'Deleting...' : 'Delete'}
                                </button>
                            )}
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={onClose}
                                disabled={saving || deleting}
                                style={{ padding: '0.75rem 1.5rem' }}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="btn"
                                disabled={saving || deleting || !images[0]}
                                style={{ padding: '0.75rem 1.5rem' }}
                                title={!images[0] && !item ? 'Please upload an image first' : ''}
                            >
                                {saving ? 'Saving...' : item ? 'Update' : 'Create'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
