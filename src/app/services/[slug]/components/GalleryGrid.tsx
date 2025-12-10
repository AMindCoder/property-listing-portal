'use client';

import { useState } from 'react';
import { GalleryItem } from '@/types/services';
import GalleryLightbox from './GalleryLightbox';

interface GalleryGridProps {
    items: GalleryItem[];
}

export default function GalleryGrid({ items }: GalleryGridProps) {
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const handleImageClick = (index: number) => {
        setCurrentImageIndex(index);
        setLightboxOpen(true);
    };

    if (items.length === 0) {
        return (
            <div className="empty-state">
                <div className="empty-icon">🖼️</div>
                <h2 className="empty-title">Gallery Coming Soon</h2>
                <p className="empty-message">
                    We're currently adding projects to this gallery. Please check back soon.
                </p>
            </div>
        );
    }

    return (
        <>
            <div className="gallery-grid">
                {items.map((item, index) => (
                    <div
                        key={item.id}
                        className="gallery-item"
                        onClick={() => handleImageClick(index)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handleImageClick(index);
                            }
                        }}
                    >
                        <img
                            src={item.imageUrl}
                            alt={item.imageAltText || item.title}
                            className="gallery-image"
                        />
                        <div className="gallery-overlay">
                            <h3 className="gallery-item-title">{item.title}</h3>
                            <span className="gallery-view-hint">Click to view</span>
                        </div>
                    </div>
                ))}
            </div>

            {lightboxOpen && (
                <GalleryLightbox
                    items={items}
                    currentIndex={currentImageIndex}
                    onClose={() => setLightboxOpen(false)}
                    onNavigate={setCurrentImageIndex}
                />
            )}
        </>
    );
}
