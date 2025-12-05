'use client'

import Link from 'next/link'

interface AdminPropertyCardProps {
    property: {
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
    onDelete: (id: string) => void
}

export default function AdminPropertyCard({ property, onDelete }: AdminPropertyCardProps) {
    const handleDelete = () => {
        if (confirm(`Are you sure you want to delete "${property.title}"?`)) {
            onDelete(property.id)
        }
    }

    return (
        <div className="bg-[var(--bg-secondary)] rounded-lg shadow-md border border-[var(--border-medium)] overflow-hidden hover:shadow-xl transition-shadow">
            {/* Image */}
            <div className="relative h-48 bg-[var(--bg-tertiary)] overflow-hidden">
                {property.images && property.images.length > 0 ? (
                    <img
                        src={property.images[0]}
                        alt={property.title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[var(--bg-tertiary)] to-[var(--bg-secondary)]">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--text-muted)] mb-2">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                            <circle cx="8.5" cy="8.5" r="1.5"></circle>
                            <polyline points="21 15 16 10 5 21"></polyline>
                        </svg>
                        <span className="text-[var(--text-muted)] text-sm">No Image</span>
                    </div>
                )}
                {/* Status Badge */}
                <div className="absolute top-2 right-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${property.status === 'AVAILABLE'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                        }`}>
                        {property.status}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-5">
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2 font-playfair">
                    {property.title}
                </h3>
                <p className="text-[var(--text-secondary)] text-sm mb-2">
                    📍 {property.location}
                </p>
                <p className="text-2xl font-bold text-[var(--copper-500)] mb-3">
                    {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(property.price)}
                </p>

                {/* Property Details */}
                <div className="flex gap-4 text-sm text-[var(--text-secondary)] mb-4">
                    {property.propertyType !== 'Plot' && property.bedrooms !== undefined && property.bedrooms > 0 && (
                        <span>🛏️ {property.bedrooms} Beds</span>
                    )}
                    {property.propertyType !== 'Plot' && property.bathrooms !== undefined && property.bathrooms > 0 && (
                        <span>🚿 {property.bathrooms} Baths</span>
                    )}
                    <span className="font-medium text-[var(--copper-400)]">{property.propertyType}</span>
                </div>

                {/* Action Buttons */}
                {/* Action Buttons */}
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                    <Link
                        href={`/admin/edit/${property.id}`}
                        className="text-gray-600 hover:text-blue-600 font-medium flex items-center gap-2 transition-colors px-2 py-1 rounded hover:bg-blue-50"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                        Edit
                    </Link>
                    <button
                        onClick={handleDelete}
                        className="text-gray-500 hover:text-red-600 font-medium flex items-center gap-2 transition-colors px-2 py-1 rounded hover:bg-red-50"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                        Delete
                    </button>
                </div>
            </div>
        </div>
    )
}
