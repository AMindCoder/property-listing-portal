'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Footer from '../../components/Footer'
import ImageGallery from '../../components/ImageGallery'
import Header from '../../components/Header'

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
    size?: number | null
    frontSize?: number | null
    backSize?: number | null
    images: string[]
    ownerName?: string | null
    ownerPhone?: string | null
}

interface PropertyDetailClientProps {
    property: Property | null
}

export default function PropertyDetailClient({ property }: PropertyDetailClientProps) {
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

        if (!property) return

        try {
            const response = await fetch('/api/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...leadForm,
                    propertyId: property.id
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

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(price)
    }

    if (!property) {
        return (
            <div>
                <Header />
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
            <Header />

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
                    <div className="modal-overlay" onClick={() => setShowLeadModal(false)}>
                        <div className="modal-content" onClick={e => e.stopPropagation()}>
                            <button
                                onClick={() => setShowLeadModal(false)}
                                className="modal-close-btn"
                                aria-label="Close modal"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>

                            <h2 className="modal-title">I'm Interested</h2>

                            <form onSubmit={handleLeadSubmit} className="modal-form">
                                <div className="form-field">
                                    <label htmlFor="lead-name" className="form-label">
                                        Name <span className="required">*</span>
                                    </label>
                                    <input
                                        id="lead-name"
                                        type="text"
                                        required
                                        className="form-input"
                                        placeholder="Enter your name"
                                        value={leadForm.name}
                                        onChange={e => setLeadForm({ ...leadForm, name: e.target.value })}
                                    />
                                </div>

                                <div className="form-field">
                                    <label htmlFor="lead-phone" className="form-label">
                                        Phone <span className="required">*</span>
                                    </label>
                                    <input
                                        id="lead-phone"
                                        type="tel"
                                        required
                                        className="form-input"
                                        placeholder="Enter your phone number"
                                        value={leadForm.phone}
                                        onChange={e => setLeadForm({ ...leadForm, phone: e.target.value })}
                                    />
                                </div>

                                <div className="form-field">
                                    <label htmlFor="lead-purpose" className="form-label">Purpose</label>
                                    <select
                                        id="lead-purpose"
                                        className="form-input"
                                        value={leadForm.purpose}
                                        onChange={e => setLeadForm({ ...leadForm, purpose: e.target.value })}
                                    >
                                        <option value="Buy">Buy</option>
                                        <option value="Rent">Rent</option>
                                        <option value="General Inquiry">General Inquiry</option>
                                    </select>
                                </div>

                                <div className="form-field">
                                    <label htmlFor="lead-message" className="form-label">Message (Optional)</label>
                                    <textarea
                                        id="lead-message"
                                        className="form-input form-textarea"
                                        rows={3}
                                        placeholder="Any specific questions or requirements?"
                                        value={leadForm.notes}
                                        onChange={e => setLeadForm({ ...leadForm, notes: e.target.value })}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary submit-btn"
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
