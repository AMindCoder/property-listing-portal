'use client';

import { ProjectSummary } from '@/types/services';

interface ProjectCardProps {
    project: ProjectSummary;
    onClick: () => void;
}

export default function ProjectCard({ project, onClick }: ProjectCardProps) {
    // Get up to 4 preview images for the stack effect
    const previewImages = project.previewImages.slice(0, 4);

    // Format date if available
    const formattedDate = project.completionDate
        ? new Date(project.completionDate).toLocaleDateString('en-US', {
            month: 'short',
            year: 'numeric'
        })
        : null;

    return (
        <div className="project-card" onClick={onClick}>
            {/* Stacked Photos Effect */}
            <div className="project-stack">
                {previewImages.length === 0 ? (
                    // Empty state - show placeholder
                    <div className="stack-layer">
                        <div className="stack-empty">📷</div>
                    </div>
                ) : (
                    // Render images in order - CSS nth-child(1) is on top with z-index 4
                    // First preview image = nth-child(1) = top of stack
                    previewImages.map((imageUrl, index) => (
                        <div key={index} className="stack-layer">
                            <img
                                src={imageUrl}
                                alt={`${project.projectName} preview ${index + 1}`}
                                loading="lazy"
                            />
                        </div>
                    ))
                )}
            </div>

            {/* Project Info */}
            <div className="project-card-info">
                <h3 className="project-card-title">{project.projectName}</h3>

                {project.projectLocation && (
                    <p className="project-card-meta">
                        📍 {project.projectLocation}
                    </p>
                )}

                {formattedDate && (
                    <p className="project-card-meta">
                        {formattedDate}
                    </p>
                )}

                <div className="project-card-count">
                    <span>{project.imageCount}</span>
                    <span>{project.imageCount === 1 ? 'photo' : 'photos'}</span>
                    {project.activeCount < project.imageCount && (
                        <span style={{
                            marginLeft: '0.5rem',
                            color: 'var(--text-tertiary)',
                            fontSize: '0.75rem'
                        }}>
                            ({project.activeCount} active)
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
