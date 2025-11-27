'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'

interface Property {
    id: string
    title: string
    description: string
    price: number
    location: string
    bedrooms: number
    bathrooms: number
    propertyType: string
    status: string
    imageUrl?: string
}

export default function PropertyDetail({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params)
    const [property, setProperty] = useState<Property | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        fetchProperty()
    }, [resolvedParams.id])

    const fetchProperty = async () => {
        setLoading(true)
        try {
            const response = await fetch(`/api/properties/${resolvedParams.id}`)
            const data = await response.json()
            setProperty(data)
        } catch (error) {
            console.error('Failed to fetch property:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleStatusToggle = async () => {
        if (!property) return

        const newStatus = property.status === 'AVAILABLE' ? 'SOLD' : 'AVAILABLE'

        try {
            await fetch(`/api/properties/${resolvedParams.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            })

            setProperty({ ...property, status: newStatus })
        } catch (error) {
            console.error('Failed to update property:', error)
        }
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(price)
    }

    if (loading) {
        return (
            <div>
                <header className="header">
                    <div className="container">
                        <div className="header-content">
                            <h1 className="logo">PropertyHub</h1>
                        </div>
                    </div>
                </header>
                <div className="container">
                    <div className="loading">Loading property details...</div>
                </div>
            </div>
        )
    }

    if (!property) {
        return (
            <div>
                <header className="header">
                    <div className="container">
                        <div className="header-content">
                            <h1 className="logo">PropertyHub</h1>
                        </div>
                    </div>
                </header>
                <div className="container">
                    <div className="empty-state">
                        <div className="empty-icon">🏚️</div>
                        <h3 className="empty-title">Property not found</h3>
                        <p className="empty-message">The property you are looking for does not exist.</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div>
            <header className="header">
                <div className="container">
                    <div className="header-content">
                        <h1 className="logo" style={{ cursor: 'pointer' }} onClick={() => router.push('/')}>
                            PropertyHub
                        </h1>
                    </div>
                </div>
            </header>

            <main className="container detail-container">
                <button className="btn btn-secondary" onClick={() => router.push('/')} style={{ marginBottom: '2rem' }}>
                    ← Back to Listings
                </button>

                <img
                    src={property.imageUrl || 'https://placehold.co/1000x500/1a1a2e/7f8c8d?text=Property'}
                    alt={property.title}
                    className="detail-image"
                />

                <div className="detail-header">
                    <div className="detail-info">
                        <h1 className="detail-title">{property.title}</h1>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                            <div className="property-price">{formatPrice(property.price)}</div>
                            <span className={`status-badge ${property.status === 'AVAILABLE' ? 'status-available' : 'status-sold'}`}>
                                {property.status}
                            </span>
                        </div>
                        <div className="property-location" style={{ fontSize: '1.125rem' }}>
                            <span>📍</span>
                            <span>{property.location}</span>
                        </div>
                    </div>
                    <button
                        className={`btn ${property.status === 'AVAILABLE' ? 'btn-danger' : 'btn'}`}
                        onClick={handleStatusToggle}
                    >
                        {property.status === 'AVAILABLE' ? 'Mark as Sold' : 'Mark as Available'}
                    </button>
                </div>

                <p className="detail-description">{property.description}</p>

                <div className="detail-specs">
                    <div className="spec-item">
                        <div className="spec-label">Bedrooms</div>
                        <div className="spec-value">🛏️ {property.bedrooms}</div>
                    </div>
                    <div className="spec-item">
                        <div className="spec-label">Bathrooms</div>
                        <div className="spec-value">🚿 {property.bathrooms}</div>
                    </div>
                    <div className="spec-item">
                        <div className="spec-label">Property Type</div>
                        <div className="spec-value">🏠 {property.propertyType}</div>
                    </div>
                </div>
            </main>
        </div>
    )
}
