'use client';

import { useState } from 'react';
import { ProjectSummary } from '@/types/services';
import ProjectCard from './ProjectCard';

interface ProjectsViewProps {
    projects: ProjectSummary[];
    onProjectClick: (projectName: string) => void;
    onNewProject: () => void;
    onRefresh: () => void;
    categorySlug: string;
}

export default function ProjectsView({
    projects,
    onProjectClick,
    onNewProject,
    onRefresh,
    categorySlug
}: ProjectsViewProps) {
    const [deletingProject, setDeletingProject] = useState<string | null>(null);

    const handleDeleteProject = async (projectName: string, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card click

        if (!confirm(`Delete project "${projectName}" and ALL its images? This cannot be undone.`)) {
            return;
        }

        setDeletingProject(projectName);
        try {
            const res = await fetch(
                `/api/admin/services/${categorySlug}/gallery/projects/${encodeURIComponent(projectName)}`,
                { method: 'DELETE' }
            );

            if (!res.ok) {
                throw new Error('Failed to delete project');
            }

            onRefresh();
        } catch (error) {
            console.error('Error deleting project:', error);
            alert('Failed to delete project');
        } finally {
            setDeletingProject(null);
        }
    };

    if (projects.length === 0) {
        return (
            <div className="empty-state">
                <div className="empty-icon">📁</div>
                <h2 className="empty-title">No Projects Yet</h2>
                <p className="empty-message">
                    Create your first project to start organizing your gallery images
                </p>
                <button
                    className="btn"
                    onClick={onNewProject}
                    style={{ marginTop: '1.5rem', padding: '0.875rem 2rem' }}
                >
                    + Create First Project
                </button>
            </div>
        );
    }

    return (
        <div>
            {/* Projects Grid */}
            <div className="projects-grid">
                {projects.map((project) => (
                    <div key={project.projectName} style={{ position: 'relative' }}>
                        <ProjectCard
                            project={project}
                            onClick={() => onProjectClick(project.projectName)}
                        />

                        {/* Quick Actions Overlay */}
                        <div style={{
                            position: 'absolute',
                            top: '0.5rem',
                            right: '0.5rem',
                            display: 'flex',
                            gap: '0.25rem',
                            opacity: 0,
                            transition: 'opacity 0.2s ease',
                        }}
                            className="project-card-actions"
                        >
                            <button
                                onClick={(e) => handleDeleteProject(project.projectName, e)}
                                disabled={deletingProject === project.projectName}
                                style={{
                                    background: 'rgba(239, 68, 68, 0.9)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 'var(--radius-sm)',
                                    padding: '0.375rem 0.625rem',
                                    fontSize: '0.75rem',
                                    cursor: 'pointer',
                                    fontWeight: 600
                                }}
                                title="Delete Project"
                            >
                                {deletingProject === project.projectName ? '...' : '🗑️'}
                            </button>
                        </div>

                        {/* Add hover styles via inline style tag */}
                        <style jsx>{`
                            div:hover .project-card-actions {
                                opacity: 1;
                            }
                        `}</style>
                    </div>
                ))}

                {/* New Project Card */}
                <div
                    onClick={onNewProject}
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '1rem',
                        padding: '2rem',
                        background: 'var(--bg-tertiary)',
                        borderRadius: 'var(--radius-lg)',
                        border: '2px dashed var(--border-subtle)',
                        cursor: 'pointer',
                        minHeight: '340px',
                        transition: 'border-color 0.2s ease, background 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--copper-400)';
                        e.currentTarget.style.background = 'var(--bg-secondary)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border-subtle)';
                        e.currentTarget.style.background = 'var(--bg-tertiary)';
                    }}
                >
                    <div style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '50%',
                        background: 'var(--copper-100)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2rem',
                        color: 'var(--copper-600)'
                    }}>
                        +
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <p style={{
                            fontWeight: 600,
                            color: 'var(--text-primary)',
                            fontSize: '1rem',
                            marginBottom: '0.25rem'
                        }}>
                            New Project
                        </p>
                        <p style={{
                            color: 'var(--text-tertiary)',
                            fontSize: '0.875rem'
                        }}>
                            Click to add images
                        </p>
                    </div>
                </div>
            </div>

            {/* Summary Stats */}
            <div style={{
                marginTop: '2rem',
                padding: '1rem 1.5rem',
                background: 'var(--bg-tertiary)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                gap: '2rem',
                flexWrap: 'wrap'
            }}>
                <div>
                    <span style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>Total Projects</span>
                    <p style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--text-primary)' }}>
                        {projects.length}
                    </p>
                </div>
                <div>
                    <span style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>Total Images</span>
                    <p style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--text-primary)' }}>
                        {projects.reduce((sum, p) => sum + p.imageCount, 0)}
                    </p>
                </div>
                <div>
                    <span style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>Active Images</span>
                    <p style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--copper-500)' }}>
                        {projects.reduce((sum, p) => sum + p.activeCount, 0)}
                    </p>
                </div>
            </div>
        </div>
    );
}
