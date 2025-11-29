'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
    const router = useRouter()
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

    const handleLogout = () => {
        router.push('/')
    }

    return (
        <div className="container">
            <header className="header">
                <div className="header-content">
                    <Link href="/" className="logo">PropertyHub</Link>

                    {/* Desktop Menu */}
                    <div className="admin-header-buttons hidden md:flex">
                        <Link href="/" className="btn btn-secondary">View Site</Link>
                        <Link href="/admin/add" className="btn btn-primary">Add Property</Link>
                        <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
                    </div>

                    {/* Mobile Burger Menu */}
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="admin-burger md:hidden"
                        aria-label="Toggle menu"
                    >
                        {menuOpen ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="3" y1="12" x2="21" y2="12"></line>
                                <line x1="3" y1="6" x2="21" y2="6"></line>
                                <line x1="3" y1="18" x2="21" y2="18"></line>
                            </svg>
                        )}
                    </button>
                </div>

                {/* Mobile Menu Dropdown */}
                {menuOpen && (
                    <div className="admin-mobile-menu md:hidden">
                        <Link
                            href="/"
                            className="btn btn-secondary"
                            onClick={() => setMenuOpen(false)}
                        >
                            View Site
                        </Link>
                        <Link
                            href="/admin/add"
                            className="btn btn-primary"
                            onClick={() => setMenuOpen(false)}
                        >
                            Add Property
                        </Link>
                        <button
                            onClick={() => { setMenuOpen(false); handleLogout(); }}
                            className="btn btn-secondary"
                        >
                            Logout
                        </button>
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
