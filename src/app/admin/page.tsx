'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import AdminHeader from '../components/AdminHeader'
import AdminPropertyCard from '../components/AdminPropertyCard'
import PropertyCardSkeleton from '../components/skeletons/PropertyCardSkeleton'
import { useUser } from '@/app/contexts/UserContext'

interface Property {
    id: string
    title: string
    location: string
    price: number
    status: string
    images: string[]
    bedrooms?: number
    bathrooms?: number
    propertyType: string
}

export default function AdminDashboard() {
    const [properties, setProperties] = useState<Property[]>([])
    const [loading, setLoading] = useState(true)
    const { user } = useUser()
    const canModify = user?.canModify ?? false

    const fetchProperties = async () => {
        try {
            const response = await fetch(`/api/properties?status=ALL&t=${Date.now()}`, { cache: 'no-store' })
            const data = await response.json()
            setProperties(data)
        } catch (error) {
            console.error('Failed to fetch properties:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchProperties()
    }, [])

    const handleDelete = async (id: string) => {
        if (!canModify) {
            alert('You do not have permission to delete properties')
            return
        }

        console.log(`[Frontend] Deleting property: ${id}`)
        try {
            const response = await fetch(`/api/properties/${id}`, {
                method: 'DELETE',
            })

            console.log(`[Frontend] Delete response status: ${response.status}`)

            if (response.ok) {
                setProperties(properties.filter(p => p.id !== id))
                alert('Property deleted successfully')
            } else {
                const errorData = await response.json()
                console.error('[Frontend] Failed to delete:', errorData)
                if (errorData.code === 'FORBIDDEN') {
                    alert('You do not have permission to delete properties')
                } else {
                    alert(`Failed to delete property: ${errorData.error || response.statusText}\nCheck console for details.`)
                }
            }
        } catch (error) {
            console.error('[Frontend] Error deleting property:', error)
            alert(`Error deleting property: ${String(error)}`)
        }
    }

    return (
        <div className="page-gradient noise-overlay">
            <AdminHeader showBreadcrumb={false} />

            <main className="container py-8 page-enter">
                <div className="page-header">
                    <div>
                        <h1 className="page-title">Dashboard</h1>
                        <p className="page-subtitle">Manage your property listings</p>
                    </div>
                    <div className="page-actions">
                        {canModify ? (
                            <Link href="/admin/add" className="btn glow-effect" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="12" y1="5" x2="12" y2="19"></line>
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                                Add Property
                            </Link>
                        ) : (
                            <span
                                className="btn btn-disabled"
                                title="View-only access - contact admin for full access"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="12" y1="5" x2="12" y2="19"></line>
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                                Add Property
                            </span>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <PropertyCardSkeleton key={i} />
                        ))}
                    </div>
                ) : properties.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">🏠</div>
                        <h2 className="empty-title">No Properties Yet</h2>
                        <p className="empty-message">
                            {canModify
                                ? 'Add your first property to get started!'
                                : 'No properties have been added yet.'}
                        </p>
                        {canModify && (
                            <Link href="/admin/add" className="btn btn-primary mt-4 inline-block">
                                Add Property
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {properties.map((property, index) => (
                            <div key={property.id} className="animate-stagger" style={{ animationDelay: `${index * 50}ms` }}>
                                <AdminPropertyCard
                                    property={property}
                                    onDelete={handleDelete}
                                    canModify={canModify}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}
