'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Property {
    id: string
    title: string
    location: string
    price: number
    status: string
}

export default function AdminDashboard() {
    const [properties, setProperties] = useState<Property[]>([])
    const [loading, setLoading] = useState(true)

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
        if (!confirm('Are you sure you want to delete this property?')) return

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
                    <div className="flex gap-4">
                        <Link href="/" className="btn btn-secondary">View Site</Link>
                        <Link href="/admin/add" className="btn btn-primary">Add Property</Link>
                    </div>
                </div>
            </header>

            <main className="py-8">
                <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

                {loading ? (
                    <div className="loading">Loading...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full bg-white rounded-lg shadow-md">
                            <thead className="bg-gray-100 border-b">
                                <tr>
                                    <th className="p-4 text-left">Title</th>
                                    <th className="p-4 text-left">Location</th>
                                    <th className="p-4 text-left">Price</th>
                                    <th className="p-4 text-left">Status</th>
                                    <th className="p-4 text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {properties.map((property) => (
                                    <tr key={property.id} className="border-b hover:bg-gray-50">
                                        <td className="p-4">{property.title}</td>
                                        <td className="p-4">{property.location}</td>
                                        <td className="p-4">${property.price.toLocaleString()}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-sm ${property.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                {property.status}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <button
                                                onClick={() => handleDelete(property.id)}
                                                className="text-red-600 hover:text-red-800 font-medium"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
        </div>
    )
}
