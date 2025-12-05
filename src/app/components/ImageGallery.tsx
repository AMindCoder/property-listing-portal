'use client'

import { useState } from 'react'

interface ImageGalleryProps {
    images: string[]
    title: string
}

export default function ImageGallery({ images, title }: ImageGalleryProps) {
    const [mainImageIndex, setMainImageIndex] = useState(0)

    if (!images || images.length === 0) {
        return (
            <img
                src="https://placehold.co/1000x500/1a1a2e/7f8c8d?text=No+Image"
                alt={title}
                className="detail-image"
            />
        )
    }

    const hasMultipleImages = images.length > 1

    return (
        <div className="gallery-container">
            {/* Main Image */}
            <div className="relative group">
                <div className="main-image-wrapper">
                    <img
                        src={images[mainImageIndex]}
                        alt={`${title} - View ${mainImageIndex + 1}`}
                        className="main-image"
                    />
                </div>

                {hasMultipleImages && (
                    <>
                        <button
                            className="nav-btn prev"
                            onClick={() => setMainImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1)}
                            aria-label="Previous image"
                        >
                            ←
                        </button>
                        <button
                            className="nav-btn next"
                            onClick={() => setMainImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1)}
                            aria-label="Next image"
                        >
                            →
                        </button>
                    </>
                )}
            </div>

            {/* Thumbnails */}
            {hasMultipleImages && (
                <div className="thumbnails-track">
                    {images.map((img, index) => (
                        <button
                            key={index}
                            className={`thumbnail-btn ${mainImageIndex === index ? 'active' : ''}`}
                            onClick={() => setMainImageIndex(index)}
                            aria-label={`View image ${index + 1}`}
                        >
                            <img src={img} alt={`Thumbnail ${index + 1}`} className="thumbnail-img" />
                        </button>
                    ))}
                </div>
            )}

            <style jsx>{`
                .gallery-container {
                    margin-bottom: 2.5rem;
                }

                .main-image-wrapper {
                    position: relative;
                    width: 100%;
                    height: 550px;
                    border-radius: var(--radius-lg);
                    overflow: hidden;
                    border: 1px solid var(--border-medium);
                    box-shadow: var(--shadow-lg);
                    background: var(--bg-tertiary);
                }

                .main-image {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform var(--transition-base);
                }

                .nav-btn {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    background: rgba(0, 0, 0, 0.5);
                    color: white;
                    border: none;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.25rem;
                    opacity: 0;
                    transition: all var(--transition-base);
                    backdrop-filter: blur(4px);
                }

                .group:hover .nav-btn {
                    opacity: 1;
                }

                .nav-btn:hover {
                    background: var(--copper-500);
                }

                .prev { left: 1rem; }
                .next { right: 1rem; }

                .thumbnails-track {
                    display: flex;
                    gap: 1rem;
                    margin-top: 1rem;
                    overflow-x: auto;
                    padding-bottom: 0.5rem;
                    scrollbar-width: thin;
                    scrollbar-color: var(--copper-500) var(--bg-tertiary);
                    scroll-snap-type: x mandatory;
                }

                .thumbnail-btn {
                    flex-shrink: 0;
                    width: 100px;
                    height: 70px;
                    border-radius: var(--radius-md);
                    overflow: hidden;
                    border: 2px solid transparent;
                    cursor: pointer;
                    padding: 0;
                    transition: all var(--transition-base);
                    background: transparent;
                    scroll-snap-align: start;
                }

                .thumbnail-btn.active {
                    border-color: var(--copper-500);
                    box-shadow: var(--glow-copper);
                    transform: translateY(-2px);
                }

                .thumbnail-img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                @media (max-width: 768px) {
                    .main-image-wrapper {
                        height: 300px;
                    }
                    
                    .nav-btn {
                        opacity: 1; /* Always visible on mobile */
                        background: rgba(0, 0, 0, 0.3);
                    }
                    
                    .thumbnails-track {
                        gap: 0.75rem;
                    }
                    
                    .thumbnail-btn {
                        width: 80px;
                        height: 60px;
                    }
                }
            `}</style>
        </div>
    )
}
