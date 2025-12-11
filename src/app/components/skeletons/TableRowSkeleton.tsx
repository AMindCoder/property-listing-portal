export default function TableRowSkeleton() {
    return (
        <div className="table-skeleton-row">
            <div className="skeleton skeleton-cell" style={{ width: '80%' }} />
            <div className="skeleton skeleton-cell" style={{ width: '90%' }} />
            <div className="skeleton skeleton-cell" style={{ width: '70%' }} />
            <div className="skeleton skeleton-cell" style={{ width: '50%' }} />
            <div className="skeleton skeleton-cell" style={{ width: '85%' }} />
            <div className="skeleton skeleton-cell" style={{ width: '60%' }} />
            <div className="skeleton skeleton-cell" style={{ width: '40%' }} />
        </div>
    )
}
