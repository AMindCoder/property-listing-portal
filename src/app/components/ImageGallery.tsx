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
            <div style={{
                width: '100%',
                height: '400px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--bg-tertiary)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-medium)',
                marginBottom: '2.5rem',
                color: 'var(--text-tertiary)',
            }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.5 }}>🏠</div>
                <p>No images available</p>
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

    const navBtnStyle: React.CSSProperties = {
        position: 'absolute',
        top: '50%',
        transform: 'translateY(-50%)',
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s ease',
        zIndex: 10,
        background: 'rgba(255, 255, 255, 0.95)',
        color: '#1a1a2e',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
    }

    return (
        <div style={{ marginBottom: '2.5rem' }}>
            {/* Main Image with Navigation */}
            <div style={{ position: 'relative' }}>
                <div style={{
                    position: 'relative',
                    width: '100%',
                    height: '500px',
                    borderRadius: 'var(--radius-lg)',
                    overflow: 'hidden',
                    border: '1px solid var(--border-medium)',
                    boxShadow: 'var(--shadow-lg)',
                    background: 'var(--bg-tertiary)',
                }}>
                    <img
                        src={images[mainImageIndex]}
                        alt={`${title} - View ${mainImageIndex + 1}`}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                        }}
                    />

                    {/* Image Counter */}
                    {hasMultipleImages && (
                        <div style={{
                            position: 'absolute',
                            bottom: '1rem',
                            right: '1rem',
                            background: 'rgba(0, 0, 0, 0.7)',
                            color: 'white',
                            padding: '0.375rem 0.75rem',
                            borderRadius: '9999px',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            backdropFilter: 'blur(4px)',
                            zIndex: 5,
                        }}>
                            {mainImageIndex + 1} / {images.length}
                        </div>
                    )}

                    {/* Navigation Buttons - Inside the image wrapper */}
                    {hasMultipleImages && (
                        <>
                            <button
                                onClick={goToPrev}
                                aria-label="Previous image"
                                type="button"
                                style={{
                                    ...navBtnStyle,
                                    left: '1rem',
                                }}
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </button>
                            <button
                                onClick={goToNext}
                                aria-label="Next image"
                                type="button"
                                style={{
                                    ...navBtnStyle,
                                    right: '1rem',
                                }}
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
                <div style={{ marginTop: '1rem', padding: '0.25rem' }}>
                    <div style={{
                        display: 'flex',
                        flexWrap: 'nowrap',
                        gap: '0.75rem',
                        overflowX: 'auto',
                        padding: '0.5rem 0',
                        justifyContent: 'flex-start',
                    }}>
                        {images.map((img, index) => (
                            <button
                                key={index}
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
                                    borderRadius: '8px',
                                    overflow: 'hidden',
                                    border: mainImageIndex === index
                                        ? '3px solid var(--copper-500, #c48b69)'
                                        : '3px solid transparent',
                                    cursor: 'pointer',
                                    padding: 0,
                                    transition: 'border-color 0.2s ease, opacity 0.2s ease, box-shadow 0.2s ease',
                                    background: 'var(--bg-tertiary, #2a3042)',
                                    opacity: mainImageIndex === index ? 1 : 0.7,
                                    boxSizing: 'border-box',
                                    boxShadow: mainImageIndex === index
                                        ? '0 0 0 2px rgba(196, 139, 105, 0.3)'
                                        : 'none',
                                }}
                            >
                                <img
                                    src={img}
                                    alt={`Thumbnail ${index + 1}`}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        display: 'block',
                                    }}
                                />
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
