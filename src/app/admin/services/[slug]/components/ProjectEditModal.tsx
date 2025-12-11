'use client';

import { useState, useEffect } from 'react';
import { ProjectSummary } from '@/types/services';

interface ProjectEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    categorySlug: string;
    project: ProjectSummary | null;
}

export default function ProjectEditModal({
    isOpen,
    onClose,
    onSave,
    categorySlug,
    project
}: ProjectEditModalProps) {
    const [formData, setFormData] = useState({
        projectName: '',
        projectLocation: '',
        completionDate: '',
        isActive: true
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (project) {
            setFormData({
                projectName: project.projectName,
                projectLocation: project.projectLocation || '',
                completionDate: project.completionDate
                    ? new Date(project.completionDate).toISOString().split('T')[0]
                    : '',
                isActive: project.activeCount === project.imageCount
            });
        } else {
            setFormData({
                projectName: '',
                projectLocation: '',
                completionDate: '',
                isActive: true
            });
        }
        setError(null);
    }, [project, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!project) return;

        if (!formData.projectName.trim()) {
            setError('Project name is required');
            return;
        }

        setSaving(true);
        setError(null);

        try {
            const res = await fetch(
                `/api/admin/services/${categorySlug}/gallery/projects/${encodeURIComponent(project.projectName)}`,
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        newProjectName: formData.projectName !== project.projectName ? formData.projectName : undefined,
                        projectLocation: formData.projectLocation || null,
                        completionDate: formData.completionDate || null,
                        isActive: formData.isActive
                    })
                }
            );

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to update project');
            }

            onSave();
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update project');
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000
            }}
            onClick={onClose}
        >
            <div
                style={{
                    background: 'var(--bg-primary)',
                    borderRadius: 'var(--radius-lg)',
                    width: '100%',
                    maxWidth: '500px',
                    maxHeight: '90vh',
                    overflow: 'auto',
                    padding: '2rem'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <h2 style={{
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    fontFamily: "'Playfair Display', serif",
                    marginBottom: '1.5rem'
                }}>
                    Edit Project
                </h2>

                {error && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: 'var(--radius-md)',
                        padding: '0.75rem 1rem',
                        marginBottom: '1rem',
                        color: '#ef4444',
                        fontSize: '0.875rem'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1.25rem' }}>
                        <label style={{
                            display: 'block',
                            fontWeight: 600,
                            color: 'var(--text-primary)',
                            marginBottom: '0.5rem',
                            fontSize: '0.9375rem'
                        }}>
                            Project Name *
                        </label>
                        <input
                            type="text"
                            value={formData.projectName}
                            onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--border-subtle)',
                                background: 'var(--bg-secondary)',
                                color: 'var(--text-primary)',
                                fontSize: '1rem'
                            }}
                            placeholder="e.g., Villa Rosa Construction"
                            required
                        />
                        <p style={{
                            fontSize: '0.8125rem',
                            color: 'var(--text-tertiary)',
                            marginTop: '0.25rem'
                        }}>
                            Renaming will update all {project?.imageCount} images in this project
                        </p>
                    </div>

                    <div style={{ marginBottom: '1.25rem' }}>
                        <label style={{
                            display: 'block',
                            fontWeight: 600,
                            color: 'var(--text-primary)',
                            marginBottom: '0.5rem',
                            fontSize: '0.9375rem'
                        }}>
                            Location
                        </label>
                        <input
                            type="text"
                            value={formData.projectLocation}
                            onChange={(e) => setFormData({ ...formData, projectLocation: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--border-subtle)',
                                background: 'var(--bg-secondary)',
                                color: 'var(--text-primary)',
                                fontSize: '1rem'
                            }}
                            placeholder="e.g., Whitefield, Bangalore"
                        />
                    </div>

                    <div style={{ marginBottom: '1.25rem' }}>
                        <label style={{
                            display: 'block',
                            fontWeight: 600,
                            color: 'var(--text-primary)',
                            marginBottom: '0.5rem',
                            fontSize: '0.9375rem'
                        }}>
                            Completion Date
                        </label>
                        <input
                            type="date"
                            value={formData.completionDate}
                            onChange={(e) => setFormData({ ...formData, completionDate: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--border-subtle)',
                                background: 'var(--bg-secondary)',
                                color: 'var(--text-primary)',
                                fontSize: '1rem'
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            cursor: 'pointer'
                        }}>
                            <input
                                type="checkbox"
                                checked={formData.isActive}
                                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                style={{ width: '18px', height: '18px' }}
                            />
                            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                                All images active
                            </span>
                        </label>
                        <p style={{
                            fontSize: '0.8125rem',
                            color: 'var(--text-tertiary)',
                            marginTop: '0.25rem',
                            marginLeft: '2rem'
                        }}>
                            {formData.isActive ? 'All images will be visible on the public site' : 'All images will be hidden from the public site'}
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn btn-secondary"
                            style={{ padding: '0.75rem 1.5rem' }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn"
                            disabled={saving}
                            style={{ padding: '0.75rem 1.5rem' }}
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
