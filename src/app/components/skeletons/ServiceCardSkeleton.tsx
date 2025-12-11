export default function ServiceCardSkeleton() {
    return (
        <div className="service-card-skeleton">
            <div className="skeleton-icon">
                <div className="skeleton skeleton-icon-circle" />
            </div>
            <div className="skeleton-info">
                <div className="skeleton skeleton-text" style={{ width: '70%', marginBottom: '0.75rem' }} />
                <div className="skeleton skeleton-text-sm" style={{ marginBottom: '0.5rem' }} />
                <div className="skeleton skeleton-text-sm" style={{ width: '80%', marginBottom: '1rem' }} />
                <div className="skeleton" style={{ height: '2.5rem', width: '100%' }} />
            </div>
        </div>
    )
}
