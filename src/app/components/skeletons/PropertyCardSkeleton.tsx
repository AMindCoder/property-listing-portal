export default function PropertyCardSkeleton() {
    return (
        <div className="property-card-skeleton">
            <div className="skeleton skeleton-image" />
            <div className="skeleton-content">
                <div className="skeleton skeleton-title" />
                <div className="skeleton skeleton-description" />
                <div className="skeleton skeleton-description" style={{ width: '70%' }} />
                <div className="skeleton-details">
                    <div className="skeleton skeleton-detail" />
                    <div className="skeleton skeleton-detail" />
                    <div className="skeleton skeleton-detail" />
                </div>
                <div className="skeleton-footer">
                    <div className="skeleton skeleton-price" />
                    <div className="skeleton skeleton-location" />
                </div>
            </div>
        </div>
    )
}
