import Link from 'next/link'

interface PropertyCardProps {
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
}

export default function PropertyCard(props: PropertyCardProps) {
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(price)
    }

    return (
        <Link href={`/properties/${props.id}`} className="property-card">
            <img
                src={props.images?.[0] || 'https://placehold.co/600x400/1a1a2e/7f8c8d?text=Property'}
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
                    {props.propertyType !== 'Plot' && (
                        <>
                            <div className="property-detail">
                                <span className="property-detail-icon">🛏️</span>
                                <span>{props.bedrooms} Beds</span>
                            </div>
                            <div className="property-detail">
                                <span className="property-detail-icon">🚿</span>
                                <span>{props.bathrooms} Baths</span>
                            </div>
                        </>
                    )}
                    <div className="property-detail">
                        <span className="property-detail-icon">🏠</span>
                        <span>{props.propertyType}</span>
                    </div>
                    {props.size && (
                        <div className="property-detail">
                            <span className="property-detail-icon">📐</span>
                            <span>{props.size.toLocaleString()} sq ft</span>
                        </div>
                    )}
                </div>

                <div className="property-footer">
                    <div className="property-price">{formatPrice(props.price)}</div>
                    <div className="property-location">
                        <span>📍</span>
                        <span>{props.area}, {props.location}</span>
                    </div>
                </div>
            </div>
        </Link>
    )
}
