'use client';

import { useState, useEffect, use } from 'react';
import { GalleryItem, ProjectSummary } from '@/types/services';
import GalleryItemModal from './components/GalleryItemModal';
import BulkUploadModal from './components/BulkUploadModal';
import ProjectsView from './components/ProjectsView';
import ProjectDetailView from './components/ProjectDetailView';
import ProjectEditModal from './components/ProjectEditModal';
import MoveImagesModal from './components/MoveImagesModal';
import AdminHeader from '@/app/components/AdminHeader';

type ViewMode = 'projects' | 'project-detail';

interface ViewState {
    mode: ViewMode;
    selectedProject: string | null;
}

export default function AdminCategoryGalleryPage({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = use(params);
    const slug = resolvedParams.slug;

    // View state
    const [viewState, setViewState] = useState<ViewState>({
        mode: 'projects',
        selectedProject: null
    });

    // Data state
    const [projects, setProjects] = useState<ProjectSummary[]>([]);
    const [projectImages, setProjectImages] = useState<GalleryItem[]>([]);
    const [categoryName, setCategoryName] = useState('');
    const [loading, setLoading] = useState(true);

    // Modal state
    const [galleryModalOpen, setGalleryModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
    const [bulkModalOpen, setBulkModalOpen] = useState(false);
    const [projectEditModalOpen, setProjectEditModalOpen] = useState(false);
    const [moveModalOpen, setMoveModalOpen] = useState(false);
    const [imagesToMove, setImagesToMove] = useState<string[]>([]);

    // Fetch projects list
    const fetchProjects = async () => {
        try {
            const res = await fetch(`/api/admin/services/${slug}/gallery/projects`);
            if (res.ok) {
                const data = await res.json();
                setProjects(data);
            }
        } catch (error) {
            console.error('Error fetching projects:', error);
        }
    };

    // Fetch images for a specific project
    const fetchProjectImages = async (projectName: string) => {
        try {
            const res = await fetch(`/api/admin/services/${slug}/gallery?project=${encodeURIComponent(projectName)}`);
            if (res.ok) {
                const images = await res.json();
                setProjectImages(images);
            }
        } catch (error) {
            console.error('Error fetching project images:', error);
        }
    };

    // Fetch category name
    const fetchCategory = async () => {
        try {
            const res = await fetch(`/api/services/${slug}`);
            if (res.ok) {
                const category = await res.json();
                setCategoryName(category.name);
            }
        } catch (error) {
            console.error('Error fetching category:', error);
        }
    };

    // Initial load
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await Promise.all([fetchProjects(), fetchCategory()]);
            setLoading(false);
        };
        loadData();
    }, [slug]);

    // Load project images when selecting a project
    useEffect(() => {
        if (viewState.mode === 'project-detail' && viewState.selectedProject) {
            fetchProjectImages(viewState.selectedProject);
        }
    }, [viewState.mode, viewState.selectedProject, slug]);

    // Get current project summary
    const currentProject = projects.find(p => p.projectName === viewState.selectedProject);

    // Navigate to project detail view
    const handleProjectClick = (projectName: string) => {
        setViewState({
            mode: 'project-detail',
            selectedProject: projectName
        });
    };

    // Navigate back to projects view
    const handleBackToProjects = () => {
        setViewState({
            mode: 'projects',
            selectedProject: null
        });
        setProjectImages([]);
        fetchProjects(); // Refresh projects list
    };

    // Open bulk upload modal for new project
    const handleNewProject = () => {
        setBulkModalOpen(true);
    };

    // Open bulk upload modal for adding to current project
    const handleAddImages = () => {
        setBulkModalOpen(true);
    };

    // Handle saving gallery item (edit or create)
    const handleSaveGalleryItem = async (data: any) => {
        try {
            const method = data.id ? 'PUT' : 'POST';
            const res = await fetch(`/api/admin/services/${slug}/gallery`, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                throw new Error('Failed to save');
            }

            // Refresh data
            if (viewState.mode === 'project-detail' && viewState.selectedProject) {
                await fetchProjectImages(viewState.selectedProject);
            }
            await fetchProjects();

            setGalleryModalOpen(false);
            setEditingItem(null);
        } catch (error) {
            console.error('Error saving item:', error);
            throw error;
        }
    };

    // Handle deleting gallery item
    const handleDeleteGalleryItem = async () => {
        if (!editingItem) return;

        try {
            const res = await fetch(`/api/admin/services/${slug}/gallery?ids=${editingItem.id}`, {
                method: 'DELETE',
            });

            if (!res.ok) {
                throw new Error('Failed to delete');
            }

            // Refresh data
            if (viewState.mode === 'project-detail' && viewState.selectedProject) {
                await fetchProjectImages(viewState.selectedProject);
            }
            await fetchProjects();

            setGalleryModalOpen(false);
            setEditingItem(null);
        } catch (error) {
            console.error('Error deleting item:', error);
            throw error;
        }
    };

    // Handle bulk upload success
    const handleBulkUploadSuccess = async () => {
        await fetchProjects();
        if (viewState.mode === 'project-detail' && viewState.selectedProject) {
            await fetchProjectImages(viewState.selectedProject);
        }
    };

    // Handle project edit
    const handleEditProject = () => {
        setProjectEditModalOpen(true);
    };

    // Handle project edit save
    const handleProjectEditSave = async () => {
        await fetchProjects();
        // If project was renamed, we need to update the view state
        // The modal will have triggered a re-fetch of projects
        if (viewState.selectedProject) {
            // Try to find the project by old name first
            const stillExists = projects.find(p => p.projectName === viewState.selectedProject);
            if (!stillExists) {
                // Project was renamed, go back to projects view
                handleBackToProjects();
            } else {
                await fetchProjectImages(viewState.selectedProject);
            }
        }
    };

    // Handle move images
    const handleMoveImages = (imageIds: string[]) => {
        setImagesToMove(imageIds);
        setMoveModalOpen(true);
    };

    // Handle move success
    const handleMoveSuccess = async () => {
        await fetchProjects();
        if (viewState.mode === 'project-detail' && viewState.selectedProject) {
            await fetchProjectImages(viewState.selectedProject);
        }
    };

    // Handle refresh for project detail view
    const handleRefreshProjectDetail = async () => {
        await fetchProjects();
        if (viewState.selectedProject) {
            await fetchProjectImages(viewState.selectedProject);
        }
    };

    // Build breadcrumbs based on current view
    const breadcrumbs = viewState.mode === 'projects'
        ? [
            { label: 'Services', href: '/admin/services' },
            { label: categoryName || 'Gallery' }
          ]
        : [
            { label: 'Services', href: '/admin/services' },
            { label: categoryName || 'Gallery', href: '#' },
            { label: viewState.selectedProject || 'Project' }
          ];

    if (loading) {
        return (
            <div className="page-gradient">
                <div className="noise-overlay" />
                <AdminHeader breadcrumbs={[{ label: 'Services', href: '/admin/services' }, { label: 'Loading...' }]} />
                <main className="container py-8">
                    <div className="skeleton-card" style={{ height: '200px', marginBottom: '1.5rem' }} />
                    <div className="property-grid">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="skeleton-card" style={{ height: '280px' }} />
                        ))}
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="page-gradient">
            <div className="noise-overlay" />
            <AdminHeader breadcrumbs={breadcrumbs} />

            <main className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
                {/* Page Header */}
                <div style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h1 className="page-title">{categoryName}</h1>
                            <p className="page-subtitle">
                                {viewState.mode === 'projects'
                                    ? `${projects.length} project${projects.length !== 1 ? 's' : ''}`
                                    : `${projectImages.length} image${projectImages.length !== 1 ? 's' : ''} in ${viewState.selectedProject}`
                                }
                            </p>
                        </div>
                    </div>
                </div>

            {/* Main Content - Two Level Navigation */}
            {viewState.mode === 'projects' ? (
                <ProjectsView
                    projects={projects}
                    onProjectClick={handleProjectClick}
                    onNewProject={handleNewProject}
                    onRefresh={fetchProjects}
                    categorySlug={slug}
                />
            ) : currentProject ? (
                <ProjectDetailView
                    project={currentProject}
                    images={projectImages}
                    categorySlug={slug}
                    onBack={handleBackToProjects}
                    onEditImage={(image) => {
                        setEditingItem(image);
                        setGalleryModalOpen(true);
                    }}
                    onAddImages={handleAddImages}
                    onRefresh={handleRefreshProjectDetail}
                    onEditProject={handleEditProject}
                    onMoveImages={handleMoveImages}
                />
            ) : (
                <div className="loading">Loading project...</div>
            )}

            {/* Gallery Item Modal (for editing individual images) */}
            <GalleryItemModal
                isOpen={galleryModalOpen}
                onClose={() => {
                    setGalleryModalOpen(false);
                    setEditingItem(null);
                }}
                onSave={handleSaveGalleryItem}
                onDelete={editingItem ? handleDeleteGalleryItem : undefined}
                categoryId={slug}
                item={editingItem}
            />

            {/* Bulk Upload Modal */}
            <BulkUploadModal
                isOpen={bulkModalOpen}
                onClose={() => setBulkModalOpen(false)}
                onSuccess={handleBulkUploadSuccess}
                categorySlug={slug}
                defaultProjectName={viewState.selectedProject || undefined}
            />

            {/* Project Edit Modal */}
            {currentProject && (
                <ProjectEditModal
                    isOpen={projectEditModalOpen}
                    onClose={() => setProjectEditModalOpen(false)}
                    onSave={handleProjectEditSave}
                    categorySlug={slug}
                    project={currentProject}
                />
            )}

            {/* Move Images Modal */}
            {viewState.selectedProject && (
                <MoveImagesModal
                    isOpen={moveModalOpen}
                    onClose={() => {
                        setMoveModalOpen(false);
                        setImagesToMove([]);
                    }}
                    onSuccess={handleMoveSuccess}
                    categorySlug={slug}
                    imageIds={imagesToMove}
                    currentProjectName={viewState.selectedProject}
                    allProjects={projects}
                />
            )}
            </main>
        </div>
    );
}
