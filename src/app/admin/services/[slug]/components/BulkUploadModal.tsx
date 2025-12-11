'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { uploadFilesClient } from '@/lib/upload-service';
import { UploadCloud, X, ChevronDown, ChevronUp, Loader2, AlertCircle, Check } from 'lucide-react';

interface UploadedImage {
    file: File;
    preview: string;
    url?: string;
    uploading: boolean;
    uploaded: boolean;
    error?: string;
    title: string;
    description: string;
    altText: string;
    expanded: boolean;
}

interface ExistingProject {
    projectName: string;
    projectLocation: string | null;
    categories: Array<{ name: string; slug: string }>;
}

interface BulkUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    categorySlug: string;
    defaultProjectName?: string;
}

export default function BulkUploadModal({ isOpen, onClose, onSuccess, categorySlug, defaultProjectName }: BulkUploadModalProps) {
    // Project selection mode: 'new' or 'existing'
    const [projectMode, setProjectMode] = useState<'new' | 'existing'>('new');
    const [existingProjects, setExistingProjects] = useState<ExistingProject[]>([]);
    const [loadingProjects, setLoadingProjects] = useState(false);
    const [selectedExistingProject, setSelectedExistingProject] = useState<string>('');

    // Project-level state
    const [projectName, setProjectName] = useState(defaultProjectName || '');
    const [projectLocation, setProjectLocation] = useState('');
    const [completionDate, setCompletionDate] = useState('');
    const [projectDescription, setProjectDescription] = useState('');
    const [isActive, setIsActive] = useState(true);

    // Images state
    const [images, setImages] = useState<UploadedImage[]>([]);
    const [uploading, setUploading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch existing projects across all categories
    const fetchExistingProjects = async () => {
        setLoadingProjects(true);
        try {
            const res = await fetch('/api/admin/services/all-projects');
            if (res.ok) {
                const data = await res.json();
                setExistingProjects(data);
            }
        } catch (err) {
            console.error('Error fetching projects:', err);
        } finally {
            setLoadingProjects(false);
        }
    };

    // Update project name when defaultProjectName changes or modal opens
    useEffect(() => {
        if (isOpen) {
            fetchExistingProjects();
            if (defaultProjectName) {
                setProjectName(defaultProjectName);
                setProjectMode('new'); // Keep in new mode since it's adding to existing project in same category
            }
        }
    }, [isOpen, defaultProjectName]);

    // Handle selecting an existing project
    const handleSelectExistingProject = (projectName: string) => {
        setSelectedExistingProject(projectName);
        const project = existingProjects.find(p => p.projectName === projectName);
        if (project) {
            setProjectName(project.projectName);
            setProjectLocation(project.projectLocation || '');
        }
    };

    const allImagesUploaded = images.length > 0 && images.every(img => img.uploaded);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (images.length + acceptedFiles.length > 20) {
            setError('Maximum 20 images allowed per batch');
            return;
        }

        setError(null);

        // Create preview entries
        const newImages: UploadedImage[] = acceptedFiles.map((file, idx) => ({
            file,
            preview: URL.createObjectURL(file),
            uploading: true,
            uploaded: false,
            title: '',
            description: '',
            altText: '',
            expanded: false,
        }));

        setImages(prev => [...prev, ...newImages]);
        setUploading(true);

        // Upload each file
        for (let i = 0; i < acceptedFiles.length; i++) {
            const file = acceptedFiles[i];
            const imageIndex = images.length + i;

            try {
                const results = await uploadFilesClient({
                    files: [file],
                    folder: 'services',
                    compress: true,
                });

                setImages(prev => prev.map((img, idx) => {
                    if (idx === imageIndex) {
                        return { ...img, url: results[0].url, uploading: false, uploaded: true };
                    }
                    return img;
                }));
            } catch (err) {
                console.error('Upload error:', err);
                setImages(prev => prev.map((img, idx) => {
                    if (idx === imageIndex) {
                        return { ...img, uploading: false, error: 'Upload failed' };
                    }
                    return img;
                }));
            }
        }

        setUploading(false);
    }, [images.length]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/jpeg': [],
            'image/png': [],
            'image/webp': [],
        },
        maxSize: 10 * 1024 * 1024,
        disabled: uploading || submitting || images.length >= 20,
    });

    const removeImage = (index: number) => {
        setImages(prev => {
            const newImages = [...prev];
            URL.revokeObjectURL(newImages[index].preview);
            newImages.splice(index, 1);
            return newImages;
        });
    };

    const updateImage = (index: number, field: keyof UploadedImage, value: string | boolean) => {
        setImages(prev => prev.map((img, idx) =>
            idx === index ? { ...img, [field]: value } : img
        ));
    };

    const toggleExpand = (index: number) => {
        setImages(prev => prev.map((img, idx) =>
            idx === index ? { ...img, expanded: !img.expanded } : img
        ));
    };

    const handleSubmit = async () => {
        // Validate based on mode
        if (projectMode === 'existing') {
            if (!selectedExistingProject) {
                setError('Please select an existing project');
                return;
            }
        } else {
            if (!projectName.trim()) {
                setError('Project name is required');
                return;
            }
        }

        if (!allImagesUploaded) {
            setError('Please wait for all images to upload');
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            // Build payload based on mode
            const payload = projectMode === 'existing'
                ? {
                    projectName: selectedExistingProject,
                    projectLocation: projectLocation.trim() || undefined,
                    isActive,
                    images: images.map(img => ({
                        imageUrl: img.url!,
                        title: img.title.trim() || undefined,
                        description: img.description.trim() || undefined,
                        imageAltText: img.altText.trim() || undefined,
                    })),
                }
                : {
                    projectName: projectName.trim(),
                    projectLocation: projectLocation.trim() || undefined,
                    completionDate: completionDate || undefined,
                    projectDescription: projectDescription.trim() || undefined,
                    isActive,
                    images: images.map(img => ({
                        imageUrl: img.url!,
                        title: img.title.trim() || undefined,
                        description: img.description.trim() || undefined,
                        imageAltText: img.altText.trim() || undefined,
                    })),
                };

            const res = await fetch(`/api/admin/services/${categorySlug}/gallery/bulk`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to create gallery items');
            }

            // Success - close and refresh
            onSuccess();
            handleClose();
        } catch (err: any) {
            setError(err.message || 'Failed to create gallery items');
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        // Cleanup previews
        images.forEach(img => URL.revokeObjectURL(img.preview));
        // Reset state
        setProjectMode('new');
        setSelectedExistingProject('');
        setProjectName(defaultProjectName || '');
        setProjectLocation('');
        setCompletionDate('');
        setProjectDescription('');
        setIsActive(true);
        setImages([]);
        setError(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div
            onClick={handleClose}
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
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border-medium)',
                    maxWidth: '900px',
                    width: '100%',
                    maxHeight: '90vh',
                    overflow: 'auto',
                    padding: '2rem',
                }}
            >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{
                        fontSize: '1.75rem',
                        fontWeight: 700,
                        fontFamily: "'Playfair Display', serif",
                        color: 'var(--text-primary)'
                    }}>
                        Bulk Upload Images
                    </h2>
                    <button
                        onClick={handleClose}
                        disabled={submitting}
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

                {/* Error Display */}
                {error && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: 'var(--radius-md)',
                        padding: '1rem',
                        marginBottom: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                    }}>
                        <AlertCircle size={20} color="#ef4444" />
                        <span style={{ color: '#ef4444' }}>{error}</span>
                    </div>
                )}

                {/* Project Details Section */}
                <div style={{
                    background: 'var(--bg-tertiary)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.5rem',
                    marginBottom: '1.5rem',
                    border: '1px solid var(--border-subtle)'
                }}>
                    <h3 style={{
                        fontSize: '1rem',
                        fontWeight: 600,
                        color: 'var(--text-secondary)',
                        marginBottom: '1rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                    }}>
                        Project Details
                    </h3>

                    {/* Project Mode Toggle - Only show if not adding to existing project in same category */}
                    {!defaultProjectName && existingProjects.length > 0 && (
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
                                        name="projectMode"
                                        checked={projectMode === 'new'}
                                        onChange={() => {
                                            setProjectMode('new');
                                            setSelectedExistingProject('');
                                            setProjectName('');
                                            setProjectLocation('');
                                        }}
                                        disabled={submitting}
                                    />
                                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                                        New Project
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
                                        name="projectMode"
                                        checked={projectMode === 'existing'}
                                        onChange={() => setProjectMode('existing')}
                                        disabled={submitting}
                                    />
                                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                                        Add to Existing Project
                                    </span>
                                </label>
                            </div>
                        </div>
                    )}

                    {/* Existing Project Selector */}
                    {projectMode === 'existing' && (
                        <div style={{ marginBottom: '1rem' }}>
                            <label className="filter-label" style={{ display: 'block', marginBottom: '0.5rem' }}>
                                Select Existing Project *
                            </label>
                            {loadingProjects ? (
                                <div style={{ color: 'var(--text-tertiary)', padding: '0.5rem 0' }}>
                                    Loading projects...
                                </div>
                            ) : (
                                <select
                                    className="filter-input"
                                    value={selectedExistingProject}
                                    onChange={(e) => handleSelectExistingProject(e.target.value)}
                                    disabled={submitting}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <option value="">-- Select a project --</option>
                                    {existingProjects.map((project) => (
                                        <option key={project.projectName} value={project.projectName}>
                                            {project.projectName}
                                            {project.categories.length > 0 && ` (${project.categories.map(c => c.name).join(', ')})`}
                                        </option>
                                    ))}
                                </select>
                            )}
                            {selectedExistingProject && (
                                <p style={{
                                    marginTop: '0.5rem',
                                    fontSize: '0.875rem',
                                    color: 'var(--copper-400)'
                                }}>
                                    Images will be added to &quot;{selectedExistingProject}&quot; under the current category
                                </p>
                            )}
                        </div>
                    )}

                    {/* Project Name - Only for new projects */}
                    {projectMode === 'new' && (
                        <div style={{ marginBottom: '1rem' }}>
                            <label className="filter-label" style={{ display: 'block', marginBottom: '0.5rem' }}>
                                Project Name *
                            </label>
                            <input
                                type="text"
                                className="filter-input"
                                value={projectName}
                                onChange={(e) => setProjectName(e.target.value)}
                                maxLength={200}
                                placeholder="e.g., Villa Rosa Construction Phase 1"
                                disabled={submitting}
                            />
                        </div>
                    )}

                    {/* Location & Date Row - Only for new projects */}
                    {projectMode === 'new' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            <div>
                                <label className="filter-label" style={{ display: 'block', marginBottom: '0.5rem' }}>
                                    Project Location
                                </label>
                                <input
                                    type="text"
                                    className="filter-input"
                                    value={projectLocation}
                                    onChange={(e) => setProjectLocation(e.target.value)}
                                    maxLength={200}
                                    placeholder="e.g., Sector 45, Gurgaon"
                                    disabled={submitting}
                                />
                            </div>
                            <div>
                                <label className="filter-label" style={{ display: 'block', marginBottom: '0.5rem' }}>
                                    Completion Date
                                </label>
                                <input
                                    type="date"
                                    className="filter-input"
                                    value={completionDate}
                                    onChange={(e) => setCompletionDate(e.target.value)}
                                    max={new Date().toISOString().split('T')[0]}
                                    disabled={submitting}
                                />
                            </div>
                        </div>
                    )}

                    {/* Project Description - Only for new projects */}
                    {projectMode === 'new' && (
                        <div style={{ marginBottom: '1rem' }}>
                            <label className="filter-label" style={{ display: 'block', marginBottom: '0.5rem' }}>
                                Project Description
                                <span style={{ color: 'var(--text-tertiary)', fontWeight: 400, marginLeft: '0.5rem' }}>
                                    (applies to all images unless overridden)
                                </span>
                            </label>
                            <textarea
                                className="filter-input"
                                value={projectDescription}
                                onChange={(e) => setProjectDescription(e.target.value)}
                                maxLength={2000}
                                rows={3}
                                placeholder="Premium villa construction featuring modern architecture..."
                                style={{ resize: 'vertical', fontFamily: 'inherit' }}
                                disabled={submitting}
                            />
                        </div>
                    )}

                    {/* Active Status */}
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={isActive}
                            onChange={(e) => setIsActive(e.target.checked)}
                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                            disabled={submitting}
                        />
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', fontWeight: 500 }}>
                            Active (visible to public)
                        </span>
                    </label>
                </div>

                {/* Images Section */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{
                            fontSize: '1rem',
                            fontWeight: 600,
                            color: 'var(--text-secondary)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                        }}>
                            Images {images.length > 0 && `(${images.length} selected)`}
                        </h3>
                        {images.length > 0 && images.length < 20 && (
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => document.getElementById('bulk-file-input')?.click()}
                                disabled={uploading || submitting}
                                style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                            >
                                + Add More
                            </button>
                        )}
                    </div>

                    {/* Dropzone */}
                    {images.length === 0 && (
                        <div
                            {...getRootProps()}
                            style={{
                                border: `2px dashed ${isDragActive ? 'var(--copper-500)' : 'var(--border-medium)'}`,
                                borderRadius: 'var(--radius-md)',
                                padding: '3rem 2rem',
                                textAlign: 'center',
                                cursor: uploading || submitting ? 'not-allowed' : 'pointer',
                                background: isDragActive ? 'rgba(180, 83, 9, 0.05)' : 'transparent',
                                transition: 'all 0.2s ease',
                            }}
                        >
                            <input {...getInputProps()} id="bulk-file-input" />
                            <UploadCloud size={48} style={{ color: 'var(--text-tertiary)', marginBottom: '1rem' }} />
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                {isDragActive ? 'Drop the files here...' : 'Drag & drop images here, or click to select'}
                            </p>
                            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                                JPG, PNG, WebP - Max 10MB per image - Up to 20 images
                            </p>
                        </div>
                    )}

                    {/* Hidden input for "Add More" button */}
                    {images.length > 0 && (
                        <input
                            {...getInputProps()}
                            id="bulk-file-input"
                            style={{ display: 'none' }}
                        />
                    )}

                    {/* Image Preview Grid */}
                    {images.length > 0 && (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                            gap: '1rem',
                            marginTop: '1rem',
                        }}>
                            {images.map((img, index) => (
                                <div
                                    key={index}
                                    style={{
                                        background: 'var(--bg-tertiary)',
                                        borderRadius: 'var(--radius-md)',
                                        border: '1px solid var(--border-subtle)',
                                        overflow: 'hidden',
                                    }}
                                >
                                    {/* Image Preview */}
                                    <div style={{ position: 'relative', aspectRatio: '4/3' }}>
                                        <img
                                            src={img.preview}
                                            alt={`Preview ${index + 1}`}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                            }}
                                        />

                                        {/* Status Overlay */}
                                        {img.uploading && (
                                            <div style={{
                                                position: 'absolute',
                                                inset: 0,
                                                background: 'rgba(0,0,0,0.6)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}>
                                                <Loader2 size={32} className="animate-spin" style={{ color: 'white' }} />
                                            </div>
                                        )}

                                        {img.uploaded && (
                                            <div style={{
                                                position: 'absolute',
                                                top: '0.5rem',
                                                left: '0.5rem',
                                                background: 'rgba(34, 197, 94, 0.9)',
                                                borderRadius: '50%',
                                                padding: '0.25rem',
                                            }}>
                                                <Check size={16} style={{ color: 'white' }} />
                                            </div>
                                        )}

                                        {img.error && (
                                            <div style={{
                                                position: 'absolute',
                                                top: '0.5rem',
                                                left: '0.5rem',
                                                background: 'rgba(239, 68, 68, 0.9)',
                                                borderRadius: '50%',
                                                padding: '0.25rem',
                                            }}>
                                                <AlertCircle size={16} style={{ color: 'white' }} />
                                            </div>
                                        )}

                                        {/* Remove Button */}
                                        <button
                                            onClick={() => removeImage(index)}
                                            disabled={submitting}
                                            style={{
                                                position: 'absolute',
                                                top: '0.5rem',
                                                right: '0.5rem',
                                                background: 'rgba(0,0,0,0.7)',
                                                border: 'none',
                                                borderRadius: '50%',
                                                padding: '0.25rem',
                                                cursor: 'pointer',
                                                color: 'white',
                                            }}
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>

                                    {/* Title Input */}
                                    <div style={{ padding: '0.75rem' }}>
                                        <input
                                            type="text"
                                            className="filter-input"
                                            value={img.title}
                                            onChange={(e) => updateImage(index, 'title', e.target.value)}
                                            placeholder={`${projectName || 'Gallery'} - Image ${index + 1}`}
                                            style={{ fontSize: '0.875rem', padding: '0.5rem' }}
                                            disabled={submitting}
                                        />

                                        {/* Expand/Collapse */}
                                        <button
                                            type="button"
                                            onClick={() => toggleExpand(index)}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.25rem',
                                                background: 'transparent',
                                                border: 'none',
                                                color: 'var(--text-tertiary)',
                                                cursor: 'pointer',
                                                fontSize: '0.75rem',
                                                marginTop: '0.5rem',
                                                padding: 0,
                                            }}
                                        >
                                            {img.expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                            {img.expanded ? 'Less options' : 'More options'}
                                        </button>

                                        {/* Expanded Options */}
                                        {img.expanded && (
                                            <div style={{ marginTop: '0.75rem' }}>
                                                <textarea
                                                    className="filter-input"
                                                    value={img.description}
                                                    onChange={(e) => updateImage(index, 'description', e.target.value)}
                                                    placeholder="Custom description (optional)"
                                                    rows={2}
                                                    style={{ fontSize: '0.875rem', padding: '0.5rem', marginBottom: '0.5rem', resize: 'none' }}
                                                    disabled={submitting}
                                                />
                                                <input
                                                    type="text"
                                                    className="filter-input"
                                                    value={img.altText}
                                                    onChange={(e) => updateImage(index, 'altText', e.target.value)}
                                                    placeholder="Alt text (optional)"
                                                    style={{ fontSize: '0.875rem', padding: '0.5rem' }}
                                                    disabled={submitting}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div style={{
                    display: 'flex',
                    gap: '1rem',
                    justifyContent: 'flex-end',
                    paddingTop: '1.5rem',
                    marginTop: '1.5rem',
                    borderTop: '1px solid var(--border-subtle)'
                }}>
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={handleClose}
                        disabled={submitting}
                        style={{ padding: '0.75rem 1.5rem' }}
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        className="btn"
                        onClick={handleSubmit}
                        disabled={
                            submitting ||
                            !allImagesUploaded ||
                            images.length === 0 ||
                            (projectMode === 'new' && !projectName.trim()) ||
                            (projectMode === 'existing' && !selectedExistingProject)
                        }
                        style={{ padding: '0.75rem 1.5rem' }}
                    >
                        {submitting ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Loader2 size={18} className="animate-spin" />
                                Creating...
                            </span>
                        ) : (
                            `Upload ${images.length} Image${images.length !== 1 ? 's' : ''}`
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
