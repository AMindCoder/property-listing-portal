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
            <div className="gallery-placeholder">
                <div className="placeholder-icon">🏠</div>
                <p>No images available</p>
                <style jsx>{`
                    .gallery-placeholder {
                        width: 100%;
                        height: 400px;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        background: var(--bg-tertiary);
                        border-radius: var(--radius-lg);
                        border: 1px solid var(--border-medium);
                        margin-bottom: 2.5rem;
                        color: var(--text-tertiary);
                    }
                    .placeholder-icon {
                        font-size: 4rem;
                        margin-bottom: 1rem;
                        opacity: 0.5;
                    }
                `}</style>
            </div>
        )
    }

    const hasMultipleImages = images.length > 1

    return (
        <div className="gallery-container">
            {/* Main Image with Navigation */}
            <div className="main-image-section">
                <div className="main-image-wrapper">
                    <img
                        src={images[mainImageIndex]}
                        alt={`${title} - View ${mainImageIndex + 1}`}
                        className="main-image"
                    />

                    {/* Image Counter */}
                    {hasMultipleImages && (
                        <div className="image-counter">
                            {mainImageIndex + 1} / {images.length}
                        </div>
                    )}
                </div>

                {/* Navigation Buttons */}
                {hasMultipleImages && (
                    <>
                        <button
                            className="nav-btn nav-prev"
                            onClick={() => setMainImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1)}
                            aria-label="Previous image"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="15 18 9 12 15 6"></polyline>
                            </svg>
                        </button>
                        <button
                            className="nav-btn nav-next"
                            onClick={() => setMainImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1)}
                            aria-label="Next image"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                        </button>
                    </>
                )}
            </div>

            {/* Thumbnail Strip */}
            {hasMultipleImages && (
                <div className="thumbnails-container">
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
                </div>
            )}

            <style jsx>{`
                .gallery-container {
                    margin-bottom: 2.5rem;
                }

                .main-image-section {
                    position: relative;
                }

                .main-image-wrapper {
                    position: relative;
                    width: 100%;
                    height: 500px;
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
                }

                .image-counter {
                    position: absolute;
                    bottom: 1rem;
                    right: 1rem;
                    background: rgba(0, 0, 0, 0.7);
                    color: white;
                    padding: 0.375rem 0.75rem;
                    border-radius: var(--radius-full);
                    font-size: 0.875rem;
                    font-weight: 500;
                    backdrop-filter: blur(4px);
                }

                .nav-btn {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 48px;
                    height: 48px;
                    border-radius: var(--radius-full);
                    border: none;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                    z-index: 10;
                    background: rgba(255, 255, 255, 0.95);
                    color: var(--text-primary);
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
                }

                .nav-btn:hover {
                    background: var(--copper-500);
                    color: white;
                    transform: translateY(-50%) scale(1.05);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                }

                .nav-btn:active {
                    transform: translateY(-50%) scale(0.95);
                }

                .nav-prev {
                    left: 1rem;
                }

                .nav-next {
                    right: 1rem;
                }

                .thumbnails-container {
                    margin-top: 1rem;
                    padding: 0.25rem;
                }

                .thumbnails-track {
                    display: flex;
                    gap: 0.75rem;
                    overflow-x: auto;
                    padding: 0.5rem 0;
                    scrollbar-width: thin;
                    scrollbar-color: var(--copper-400) transparent;
                }

                .thumbnails-track::-webkit-scrollbar {
                    height: 6px;
                }

                .thumbnails-track::-webkit-scrollbar-track {
                    background: transparent;
                }

                .thumbnails-track::-webkit-scrollbar-thumb {
                    background: var(--copper-400);
                    border-radius: 3px;
                }

                .thumbnail-btn {
                    flex-shrink: 0;
                    width: 90px;
                    height: 65px;
                    border-radius: var(--radius-md);
                    overflow: hidden;
                    border: 3px solid transparent;
                    cursor: pointer;
                    padding: 0;
                    transition: all 0.2s ease;
                    background: transparent;
                    opacity: 0.7;
                }

                .thumbnail-btn:hover {
                    opacity: 1;
                    border-color: var(--copper-300);
                }

                .thumbnail-btn.active {
                    border-color: var(--copper-500);
                    opacity: 1;
                    box-shadow: 0 0 0 2px rgba(196, 139, 105, 0.3);
                }

                .thumbnail-img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                @media (max-width: 768px) {
                    .main-image-wrapper {
                        height: 280px;
                    }

                    .nav-btn {
                        width: 40px;
                        height: 40px;
                    }

                    .nav-prev {
                        left: 0.5rem;
                    }

                    .nav-next {
                        right: 0.5rem;
                    }

                    .thumbnails-track {
                        gap: 0.5rem;
                    }

                    .thumbnail-btn {
                        width: 70px;
                        height: 50px;
                    }

                    .image-counter {
                        bottom: 0.5rem;
                        right: 0.5rem;
                        font-size: 0.75rem;
                        padding: 0.25rem 0.5rem;
                    }
                }
            `}</style>
        </div>
    )
}
