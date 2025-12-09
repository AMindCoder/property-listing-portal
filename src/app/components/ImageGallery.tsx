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

    const goToPrev = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setMainImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1)
    }

    const goToNext = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setMainImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1)
    }

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

                    {/* Navigation Buttons - Inside the image wrapper */}
                    {hasMultipleImages && (
                        <>
                            <button
                                className="nav-btn nav-prev"
                                onClick={goToPrev}
                                aria-label="Previous image"
                                type="button"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </button>
                            <button
                                className="nav-btn nav-next"
                                onClick={goToNext}
                                aria-label="Next image"
                                type="button"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </button>
                        </>
                    )}
                </div>
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
                                type="button"
                                style={{
                                    flex: '0 0 80px',
                                    width: '80px',
                                    height: '60px',
                                    minWidth: '80px',
                                    maxWidth: '80px',
                                    minHeight: '60px',
                                    maxHeight: '60px',
                                }}
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
                    border-radius: 9999px;
                    font-size: 0.875rem;
                    font-weight: 500;
                    backdrop-filter: blur(4px);
                    z-index: 5;
                }

                .nav-btn {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    border: none;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                    z-index: 10;
                    background: rgba(255, 255, 255, 0.95);
                    color: #1a1a2e;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                }

                .nav-btn svg {
                    width: 24px;
                    height: 24px;
                    flex-shrink: 0;
                }

                .nav-btn:hover {
                    background: var(--copper-500, #c48b69);
                    color: white;
                    transform: translateY(-50%) scale(1.08);
                    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.35);
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
                    flex-wrap: nowrap;
                    gap: 0.75rem;
                    overflow-x: auto;
                    padding: 0.5rem 0;
                    scrollbar-width: thin;
                    scrollbar-color: var(--copper-400) transparent;
                    justify-content: flex-start;
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
                    flex: 0 0 80px !important;
                    width: 80px !important;
                    height: 60px !important;
                    min-width: 80px !important;
                    max-width: 80px !important;
                    min-height: 60px !important;
                    max-height: 60px !important;
                    border-radius: 8px;
                    overflow: hidden;
                    border: 3px solid transparent;
                    cursor: pointer;
                    padding: 0;
                    transition: border-color 0.2s ease, opacity 0.2s ease, box-shadow 0.2s ease;
                    background: var(--bg-tertiary, #2a3042);
                    opacity: 0.7;
                    box-sizing: border-box;
                }

                .thumbnail-btn:hover {
                    opacity: 1;
                    border-color: var(--copper-300, #d4a882);
                }

                .thumbnail-btn.active {
                    border-color: var(--copper-500, #c48b69);
                    opacity: 1;
                    box-shadow: 0 0 0 2px rgba(196, 139, 105, 0.3);
                }

                .thumbnail-img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    display: block;
                }

                @media (max-width: 768px) {
                    .main-image-wrapper {
                        height: 280px;
                    }

                    .nav-btn {
                        width: 40px;
                        height: 40px;
                    }

                    .nav-btn svg {
                        width: 20px;
                        height: 20px;
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
                        flex: 0 0 60px !important;
                        width: 60px !important;
                        height: 45px !important;
                        min-width: 60px !important;
                        max-width: 60px !important;
                        min-height: 45px !important;
                        max-height: 45px !important;
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
