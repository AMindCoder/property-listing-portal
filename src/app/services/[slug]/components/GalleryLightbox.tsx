'use client';

import { useState } from 'react';
import { GalleryItem } from '@/types/services';

interface GalleryLightboxProps {
    items: GalleryItem[];
    currentIndex: number;
    onClose: () => void;
    onNavigate: (index: number) => void;
}

export default function GalleryLightbox({ items, currentIndex, onClose, onNavigate }: GalleryLightboxProps) {
    const currentItem = items[currentIndex];

    const handlePrevious = () => {
        onNavigate(currentIndex > 0 ? currentIndex - 1 : items.length - 1);
    };

    const handleNext = () => {
        onNavigate(currentIndex < items.length - 1 ? currentIndex + 1 : 0);
    };

    // Keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
        if (e.key === 'ArrowLeft') handlePrevious();
        if (e.key === 'ArrowRight') handleNext();
    };

    return (
        <div
            className="lightbox-overlay"
            onClick={onClose}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            role="dialog"
            aria-modal="true"
        >
            <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
                {/* Close Button */}
                <button
                    className="lightbox-close"
                    onClick={onClose}
                    aria-label="Close"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>

                {/* Navigation Arrows */}
                {items.length > 1 && (
                    <>
                        <button
                            className="lightbox-nav lightbox-nav-prev"
                            onClick={handlePrevious}
                            aria-label="Previous image"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="15 18 9 12 15 6"></polyline>
                            </svg>
                        </button>

                        <button
                            className="lightbox-nav lightbox-nav-next"
                            onClick={handleNext}
                            aria-label="Next image"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                        </button>
                    </>
                )}

                {/* Image */}
                <div className="lightbox-image-container">
                    <img
                        src={currentItem.imageUrl}
                        alt={currentItem.imageAltText || currentItem.title}
                        className="lightbox-image"
                    />
                </div>

                {/* Info Panel */}
                <div className="lightbox-info">
                    <h2 className="lightbox-title">{currentItem.title}</h2>

                    {currentItem.description && (
                        <p className="lightbox-description">{currentItem.description}</p>
                    )}

                    {(currentItem.projectName || currentItem.projectLocation || currentItem.completionDate) && (
                        <div className="lightbox-metadata">
                            {currentItem.projectName && (
                                <div className="lightbox-meta-item">
                                    <span className="lightbox-meta-label">Project:</span>
                                    <span className="lightbox-meta-value">{currentItem.projectName}</span>
                                </div>
                            )}

                            {currentItem.projectLocation && (
                                <div className="lightbox-meta-item">
                                    <span className="lightbox-meta-label">Location:</span>
                                    <span className="lightbox-meta-value">{currentItem.projectLocation}</span>
                                </div>
                            )}

                            {currentItem.completionDate && (
                                <div className="lightbox-meta-item">
                                    <span className="lightbox-meta-label">Completed:</span>
                                    <span className="lightbox-meta-value">
                                        {new Date(currentItem.completionDate).toLocaleDateString('en-US', {
                                            month: 'long',
                                            year: 'numeric'
                                        })}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    {items.length > 1 && (
                        <div className="lightbox-counter">
                            {currentIndex + 1} / {items.length}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
