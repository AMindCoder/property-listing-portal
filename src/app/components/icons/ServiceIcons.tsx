interface IconProps {
    className?: string
    size?: number
}

// Foundations & Structure - Foundation blocks / structural frame
export function FoundationIcon({ className = '', size = 48 }: IconProps) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 48 48"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            aria-label="Foundations & Structure"
        >
            {/* Base foundation blocks */}
            <rect x="4" y="36" width="40" height="8" rx="1" />
            <rect x="8" y="28" width="32" height="8" rx="1" />
            {/* Structural pillars */}
            <line x1="12" y1="12" x2="12" y2="28" />
            <line x1="24" y1="8" x2="24" y2="28" />
            <line x1="36" y1="12" x2="36" y2="28" />
            {/* Roof beam */}
            <path d="M8 12 L24 4 L40 12" />
            <line x1="8" y1="12" x2="40" y2="12" />
        </svg>
    )
}

// Walls & Masonry - Brick wall pattern
export function WallsIcon({ className = '', size = 48 }: IconProps) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 48 48"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            aria-label="Walls & Masonry"
        >
            {/* Brick rows */}
            <rect x="4" y="4" width="40" height="8" rx="1" />
            <rect x="4" y="14" width="40" height="8" rx="1" />
            <rect x="4" y="24" width="40" height="8" rx="1" />
            <rect x="4" y="34" width="40" height="8" rx="1" />
            {/* Vertical brick lines - staggered */}
            <line x1="14" y1="4" x2="14" y2="12" />
            <line x1="26" y1="4" x2="26" y2="12" />
            <line x1="38" y1="4" x2="38" y2="12" />
            <line x1="10" y1="14" x2="10" y2="22" />
            <line x1="22" y1="14" x2="22" y2="22" />
            <line x1="34" y1="14" x2="34" y2="22" />
            <line x1="14" y1="24" x2="14" y2="32" />
            <line x1="26" y1="24" x2="26" y2="32" />
            <line x1="38" y1="24" x2="38" y2="32" />
            <line x1="10" y1="34" x2="10" y2="42" />
            <line x1="22" y1="34" x2="22" y2="42" />
            <line x1="34" y1="34" x2="34" y2="42" />
        </svg>
    )
}

// Interiors & Finishes - Interior room with paint roller
export function InteriorsIcon({ className = '', size = 48 }: IconProps) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 48 48"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            aria-label="Interiors & Finishes"
        >
            {/* Room outline */}
            <rect x="6" y="8" width="36" height="32" rx="2" />
            {/* Floor perspective line */}
            <line x1="6" y1="32" x2="42" y2="32" />
            {/* Window */}
            <rect x="12" y="14" width="10" height="12" rx="1" />
            <line x1="17" y1="14" x2="17" y2="26" />
            <line x1="12" y1="20" x2="22" y2="20" />
            {/* Paint roller */}
            <rect x="30" y="12" width="8" height="6" rx="1" />
            <line x1="34" y1="18" x2="34" y2="28" />
            <ellipse cx="34" cy="30" rx="3" ry="2" />
        </svg>
    )
}

// Roofing & Ceilings - House roof with tiles
export function RoofingIcon({ className = '', size = 48 }: IconProps) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 48 48"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            aria-label="Roofing & Ceilings"
        >
            {/* Main roof shape */}
            <path d="M4 24 L24 6 L44 24" />
            {/* Roof tiles - top row */}
            <path d="M12 18 L24 8 L36 18" />
            {/* House walls */}
            <rect x="10" y="24" width="28" height="18" />
            {/* Chimney */}
            <rect x="32" y="12" width="6" height="12" />
            {/* Door */}
            <rect x="20" y="32" width="8" height="10" rx="1" />
            {/* Windows */}
            <rect x="14" y="28" width="4" height="4" rx="0.5" />
            <rect x="30" y="28" width="4" height="4" rx="0.5" />
        </svg>
    )
}

// Stairs & Railings - Staircase with railing
export function StairsIcon({ className = '', size = 48 }: IconProps) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 48 48"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            aria-label="Stairs & Railings"
        >
            {/* Stairs */}
            <path d="M8 42 L8 36 L16 36 L16 30 L24 30 L24 24 L32 24 L32 18 L40 18 L40 6" />
            {/* Railing posts */}
            <line x1="8" y1="36" x2="8" y2="30" />
            <line x1="16" y1="30" x2="16" y2="24" />
            <line x1="24" y1="24" x2="24" y2="18" />
            <line x1="32" y1="18" x2="32" y2="12" />
            <line x1="40" y1="6" x2="40" y2="4" />
            {/* Railing handrail */}
            <path d="M8 30 L16 24 L24 18 L32 12 L40 4" />
            {/* Bottom step */}
            <line x1="4" y1="42" x2="12" y2="42" />
        </svg>
    )
}

// Exteriors & Landscaping - House exterior with tree
export function ExteriorsIcon({ className = '', size = 48 }: IconProps) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 48 48"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            aria-label="Exteriors & Landscaping"
        >
            {/* House */}
            <path d="M8 24 L20 14 L32 24" />
            <rect x="10" y="24" width="20" height="16" />
            {/* Door */}
            <rect x="17" y="32" width="6" height="8" rx="0.5" />
            {/* Window */}
            <rect x="13" y="27" width="4" height="4" rx="0.5" />
            {/* Tree trunk */}
            <line x1="40" y1="40" x2="40" y2="26" />
            {/* Tree foliage (circles) */}
            <circle cx="40" cy="20" r="6" />
            <circle cx="35" cy="23" r="4" />
            <circle cx="45" cy="23" r="4" />
            {/* Ground line */}
            <line x1="4" y1="40" x2="44" y2="40" />
            {/* Small bushes */}
            <ellipse cx="6" cy="38" rx="3" ry="2" />
            <ellipse cx="34" cy="38" rx="2" ry="2" />
        </svg>
    )
}

// Map of slugs to icons
const iconMap: Record<string, React.FC<IconProps>> = {
    'foundations-structure': FoundationIcon,
    'walls-masonry': WallsIcon,
    'interiors-finishes': InteriorsIcon,
    'roofing-ceilings': RoofingIcon,
    'stairs-railings': StairsIcon,
    'exteriors-landscaping': ExteriorsIcon,
}

interface ServiceIconProps extends IconProps {
    slug: string
}

export function ServiceIcon({ slug, className = '', size = 48 }: ServiceIconProps) {
    const IconComponent = iconMap[slug]

    if (!IconComponent) {
        // Fallback to a generic construction icon
        return (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width={size}
                height={size}
                viewBox="0 0 48 48"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={className}
                aria-label="Service"
            >
                <rect x="8" y="8" width="32" height="32" rx="4" />
                <path d="M16 24 L24 16 L32 24 L24 32 Z" />
            </svg>
        )
    }

    return <IconComponent className={className} size={size} />
}

export default ServiceIcon
