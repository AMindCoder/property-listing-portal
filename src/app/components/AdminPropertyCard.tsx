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
            <div className="relative h-48 bg-[var(--bg-tertiary)]">
                {property.images && property.images.length > 0 ? (
                    <img
                        src={property.images[0]}
                        alt={property.title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)]">
                        No Image
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
                    ${property.price.toLocaleString()}
                </p>

                {/* Property Details */}
                <div className="flex gap-4 text-sm text-[var(--text-secondary)] mb-4">
                    {property.bedrooms && (
                        <span>🛏️ {property.bedrooms} Beds</span>
                    )}
                    {property.bathrooms && (
                        <span>🚿 {property.bathrooms} Baths</span>
                    )}
                    <span>{property.propertyType}</span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                    <Link
                        href={`/admin/edit/${property.id}`}
                        className="flex-1 btn btn-secondary text-center py-2"
                    >
                        Edit
                    </Link>
                    <button
                        onClick={handleDelete}
                        className="flex-1 py-2 rounded bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    )
}
