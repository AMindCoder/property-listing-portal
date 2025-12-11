'use client';

import { useState, useEffect } from 'react';
import { ProjectSummary } from '@/types/services';

interface MoveImagesModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    categorySlug: string;
    imageIds: string[];
    currentProjectName: string;
    allProjects: ProjectSummary[];
}

export default function MoveImagesModal({
    isOpen,
    onClose,
    onSuccess,
    categorySlug,
    imageIds,
    currentProjectName,
    allProjects
}: MoveImagesModalProps) {
    const [targetProject, setTargetProject] = useState<'existing' | 'new'>('existing');
    const [selectedProjectName, setSelectedProjectName] = useState('');
    const [newProjectName, setNewProjectName] = useState('');
    const [newProjectLocation, setNewProjectLocation] = useState('');
    const [moving, setMoving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Filter out current project from available projects
    const availableProjects = allProjects.filter(p => p.projectName !== currentProjectName);

    useEffect(() => {
        if (isOpen) {
            setTargetProject('existing');
            setSelectedProjectName(availableProjects[0]?.projectName || '');
            setNewProjectName('');
            setNewProjectLocation('');
            setError(null);
        }
    }, [isOpen]);

    const handleMove = async () => {
        let targetName = '';

        if (targetProject === 'existing') {
            if (!selectedProjectName) {
                setError('Please select a project');
                return;
            }
            targetName = selectedProjectName;
        } else {
            if (!newProjectName.trim()) {
                setError('Please enter a project name');
                return;
            }
            targetName = newProjectName.trim();
        }

        setMoving(true);
        setError(null);

        try {
            const res = await fetch(`/api/admin/services/${categorySlug}/gallery/move`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    imageIds,
                    targetProjectName: targetName,
                    targetProjectLocation: targetProject === 'new' && newProjectLocation ? newProjectLocation : undefined
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to move images');
            }

            onSuccess();
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to move images');
        } finally {
            setMoving(false);
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
                    marginBottom: '0.5rem'
                }}>
                    Move Images
                </h2>

                <p style={{
                    color: 'var(--text-secondary)',
                    marginBottom: '1.5rem',
                    fontSize: '0.9375rem'
                }}>
                    Move {imageIds.length} {imageIds.length === 1 ? 'image' : 'images'} from "{currentProjectName}"
                </p>

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

                {/* Target Selection */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                        <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            cursor: 'pointer'
                        }}>
                            <input
                                type="radio"
                                name="targetType"
                                checked={targetProject === 'existing'}
                                onChange={() => setTargetProject('existing')}
                                disabled={availableProjects.length === 0}
                            />
                            <span style={{
                                color: availableProjects.length === 0 ? 'var(--text-tertiary)' : 'var(--text-primary)',
                                fontWeight: 500
                            }}>
                                Existing Project
                            </span>
                        </label>

                        <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            cursor: 'pointer'
                        }}>
                            <input
                                type="radio"
                                name="targetType"
                                checked={targetProject === 'new'}
                                onChange={() => setTargetProject('new')}
                            />
                            <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                                New Project
                            </span>
                        </label>
                    </div>

                    {/* Existing Project Dropdown */}
                    {targetProject === 'existing' && (
                        <div>
                            {availableProjects.length > 0 ? (
                                <select
                                    value={selectedProjectName}
                                    onChange={(e) => setSelectedProjectName(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 1rem',
                                        borderRadius: 'var(--radius-md)',
                                        border: '1px solid var(--border-subtle)',
                                        background: 'var(--bg-secondary)',
                                        color: 'var(--text-primary)',
                                        fontSize: '1rem',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {availableProjects.map((p) => (
                                        <option key={p.projectName} value={p.projectName}>
                                            {p.projectName} ({p.imageCount} images)
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <p style={{
                                    color: 'var(--text-tertiary)',
                                    fontStyle: 'italic',
                                    fontSize: '0.9375rem'
                                }}>
                                    No other projects available. Create a new project to move images.
                                </p>
                            )}
                        </div>
                    )}

                    {/* New Project Fields */}
                    {targetProject === 'new' && (
                        <div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{
                                    display: 'block',
                                    fontWeight: 600,
                                    color: 'var(--text-primary)',
                                    marginBottom: '0.5rem',
                                    fontSize: '0.875rem'
                                }}>
                                    Project Name *
                                </label>
                                <input
                                    type="text"
                                    value={newProjectName}
                                    onChange={(e) => setNewProjectName(e.target.value)}
                                    placeholder="e.g., Modern Kitchen Remodel"
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

                            <div>
                                <label style={{
                                    display: 'block',
                                    fontWeight: 600,
                                    color: 'var(--text-primary)',
                                    marginBottom: '0.5rem',
                                    fontSize: '0.875rem'
                                }}>
                                    Location (optional)
                                </label>
                                <input
                                    type="text"
                                    value={newProjectLocation}
                                    onChange={(e) => setNewProjectLocation(e.target.value)}
                                    placeholder="e.g., HSR Layout, Bangalore"
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
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                    <button
                        onClick={onClose}
                        className="btn btn-secondary"
                        style={{ padding: '0.75rem 1.5rem' }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleMove}
                        className="btn"
                        disabled={moving || (targetProject === 'existing' && availableProjects.length === 0)}
                        style={{ padding: '0.75rem 1.5rem' }}
                    >
                        {moving ? 'Moving...' : `Move ${imageIds.length} Image${imageIds.length > 1 ? 's' : ''}`}
                    </button>
                </div>
            </div>
        </div>
    );
}
