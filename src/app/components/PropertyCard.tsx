import Link from 'next/link'

interface PropertyCardProps {
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

export default function PropertyCard(props: PropertyCardProps) {
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(price)
    }

    return (
        <Link href={`/properties/${props.id}`} className="property-card">
            <img
                src={props.imageUrl || 'https://placehold.co/600x400/1a1a2e/7f8c8d?text=Property'}
                alt={props.title}
                className="property-image"
            />
            <div className="property-content">
                <div className="property-header">
                    <h3 className="property-title">{props.title}</h3>
                    <span className={`status-badge ${props.status === 'AVAILABLE' ? 'status-available' : 'status-sold'}`}>
                        {props.status}
                    </span>
                </div>

                <p className="property-description">{props.description}</p>

                <div className="property-details">
                    <div className="property-detail">
                        <span className="property-detail-icon">🛏️</span>
                        <span>{props.bedrooms} Beds</span>
                    </div>
                    <div className="property-detail">
                        <span className="property-detail-icon">🚿</span>
                        <span>{props.bathrooms} Baths</span>
                    </div>
                    <div className="property-detail">
                        <span className="property-detail-icon">🏠</span>
                        <span>{props.propertyType}</span>
                    </div>
                </div>

                <div className="property-footer">
                    <div className="property-price">{formatPrice(props.price)}</div>
                    <div className="property-location">
                        <span>📍</span>
                        <span>{props.location}</span>
                    </div>
                </div>
            </div>
        </Link>
    )
}
