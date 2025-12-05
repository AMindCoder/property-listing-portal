'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Footer from '../../components/Footer'
import ImageGallery from '../../components/ImageGallery'

interface Property {
    id: string
    title: string
    description: string
    price: number
    location: string
    area: string
    bedrooms: number
    bathrooms: number
    propertyType: string
    status: string
    size?: number
    frontSize?: number
    backSize?: number
    images: string[]
    ownerName?: string
    ownerPhone?: string
}

export default function PropertyDetail({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params)
    const [property, setProperty] = useState<Property | null>(null)
    const [loading, setLoading] = useState(true)
    const [showLeadModal, setShowLeadModal] = useState(false)
    const [submittingLead, setSubmittingLead] = useState(false)
    const [leadForm, setLeadForm] = useState({
        name: '',
        phone: '',
        purpose: 'Buy',
        notes: ''
    })
    const router = useRouter()

    const handleLeadSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmittingLead(true)

        try {
            const response = await fetch('/api/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...leadForm,
                    propertyId: resolvedParams.id
                })
            })

            if (response.ok) {
                alert('Thank you! We will contact you soon.')
                setShowLeadModal(false)
                setLeadForm({ name: '', phone: '', purpose: 'Buy', notes: '' })
            } else {
                alert('Failed to send inquiry. Please try again.')
            }
        } catch (error) {
            console.error('Error sending lead:', error)
            alert('Error sending inquiry')
        } finally {
            setSubmittingLead(false)
        }
    }

    useEffect(() => {
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

        fetchProperty()
    }, [resolvedParams.id])

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
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

                <ImageGallery
                    images={property.images || []}
                    title={property.title}
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
                            <span>{property.area}, {property.location}</span>
                        </div>
                    </div>
                </div>

                <p className="detail-description">{property.description}</p>

                <div className="detail-specs">
                    {property.propertyType !== 'Plot' && (
                        <>
                            <div className="spec-item">
                                <div className="spec-label">Bedrooms</div>
                                <div className="spec-value">🛏️ {property.bedrooms}</div>
                            </div>
                            <div className="spec-item">
                                <div className="spec-label">Bathrooms</div>
                                <div className="spec-value">🚿 {property.bathrooms}</div>
                            </div>
                        </>
                    )}
                    <div className="spec-item">
                        <div className="spec-label">Property Type</div>
                        <div className="spec-value">🏠 {property.propertyType}</div>
                    </div>
                    {property.size && (
                        <div className="spec-item">
                            <div className="spec-label">Total Size</div>
                            <div className="spec-value">📐 {property.size.toLocaleString()} sq ft</div>
                        </div>
                    )}
                    {property.frontSize && property.backSize && (
                        <div className="spec-item">
                            <div className="spec-label">Dimensions</div>
                            <div className="spec-value">📏 {property.frontSize} x {property.backSize} ft</div>
                        </div>
                    )}
                    {(property.ownerName || property.ownerPhone) && (
                        <div className="spec-item" style={{ gridColumn: '1 / -1', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem', marginTop: '1rem' }}>
                            <div className="spec-label">Contact Owner</div>
                            <div className="spec-value" style={{ fontSize: '1.25rem' }}>
                                {property.ownerName && <div>👤 {property.ownerName}</div>}
                                {property.ownerPhone && <div style={{ marginTop: '0.5rem' }}>📞 <a href={`tel:${property.ownerPhone}`} style={{ color: 'var(--copper-500)', textDecoration: 'none' }}>{property.ownerPhone}</a></div>}
                            </div>
                        </div>
                    )}
                </div>

                {property.propertyType === 'Plot' && (
                    <div className="mt-8 p-6 bg-[var(--copper-50)] rounded-lg border border-[var(--copper-100)] flex flex-col md:flex-row items-center justify-between gap-4">
                        <div>
                            <h3 className="text-xl font-bold text-[var(--copper-500)]">Planning to build?</h3>
                            <p className="text-gray-600">Get expert construction services for this plot.</p>
                        </div>
                        <Link href="/services/construction" className="btn btn-primary whitespace-nowrap">
                            🏗️ Build Here?
                        </Link>
                    </div>
                )}

                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 md:static md:bg-transparent md:border-0 md:p-0 md:mt-8">
                    <button
                        onClick={() => setShowLeadModal(true)}
                        className="w-full md:w-auto btn btn-primary py-3 px-8 text-lg shadow-lg"
                    >
                        👋 I'm Interested
                    </button>
                </div>

                {showLeadModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg p-8 max-w-md w-full relative">
                            <button
                                onClick={() => setShowLeadModal(false)}
                                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>

                            <h2 className="text-2xl font-bold mb-6">I'm Interested</h2>

                            <form onSubmit={handleLeadSubmit} className="space-y-4">
                                <div>
                                    <label className="block mb-1 font-medium">Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full p-2 border rounded"
                                        value={leadForm.name}
                                        onChange={e => setLeadForm({ ...leadForm, name: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block mb-1 font-medium">Phone</label>
                                    <input
                                        type="tel"
                                        required
                                        className="w-full p-2 border rounded"
                                        value={leadForm.phone}
                                        onChange={e => setLeadForm({ ...leadForm, phone: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block mb-1 font-medium">Purpose</label>
                                    <select
                                        className="w-full p-2 border rounded"
                                        value={leadForm.purpose}
                                        onChange={e => setLeadForm({ ...leadForm, purpose: e.target.value })}
                                    >
                                        <option value="Buy">Buy</option>
                                        <option value="Rent">Rent</option>
                                        <option value="General Inquiry">General Inquiry</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block mb-1 font-medium">Message (Optional)</label>
                                    <textarea
                                        className="w-full p-2 border rounded"
                                        rows={3}
                                        value={leadForm.notes}
                                        onChange={e => setLeadForm({ ...leadForm, notes: e.target.value })}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full btn btn-primary py-3"
                                    disabled={submittingLead}
                                >
                                    {submittingLead ? 'Sending...' : 'Send Inquiry'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    )
}
