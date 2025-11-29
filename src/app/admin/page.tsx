'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import AdminPropertyCard from '../components/AdminPropertyCard'

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
    const [menuOpen, setMenuOpen] = useState(false)

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
                alert(`Failed to delete property: ${errorData.error || response.statusText}\nCheck console for details.`)
            }
        } catch (error) {
            console.error('[Frontend] Error deleting property:', error)
            alert(`Error deleting property: ${String(error)}`)
        }
    }

    return (
        <div className="container">
            <header className="header">
                <div className="header-content">
                    <Link href="/" className="logo">PropertyHub</Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex gap-4">
                        <Link href="/" className="btn btn-secondary">View Site</Link>
                        <Link href="/admin/add" className="btn btn-primary">Add Property</Link>
                    </div>

                    {/* Mobile Burger Menu */}
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="md:hidden p-2 text-[var(--copper-400)] hover:text-[var(--copper-500)] transition-colors"
                        aria-label="Toggle menu"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="3" y1="12" x2="21" y2="12"></line>
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <line x1="3" y1="18" x2="21" y2="18"></line>
                        </svg>
                    </button>
                </div>

                {/* Mobile Menu Dropdown */}
                {menuOpen && (
                    <div className="md:hidden bg-[var(--bg-secondary)] border-t border-[var(--border-medium)] py-4 px-4 space-y-2">
                        <Link
                            href="/"
                            className="block btn btn-secondary text-center"
                            onClick={() => setMenuOpen(false)}
                        >
                            View Site
                        </Link>
                        <Link
                            href="/admin/add"
                            className="block btn btn-primary text-center"
                            onClick={() => setMenuOpen(false)}
                        >
                            Add Property
                        </Link>
                    </div>
                )}
            </header>

            <main className="py-8">
                <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

                {loading ? (
                    <div className="loading">Loading...</div>
                ) : properties.length === 0 ? (
                    <div className="empty-state">
                        <p className="empty-message">No properties yet. Add one to get started!</p>
                        <Link href="/admin/add" className="btn btn-primary mt-4 inline-block">
                            Add Property
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {properties.map((property) => (
                            <AdminPropertyCard
                                key={property.id}
                                property={property}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}
