'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'

interface HeaderProps {
    toggleSidebar?: () => void
    isSidebarCollapsed?: boolean
    backLink?: string
    backLabel?: string
}

const serviceCategories = [
    { name: 'Foundations & Structure', slug: 'foundations' },
    { name: 'Walls & Masonry', slug: 'walls' },
    { name: 'Interiors & Finishes', slug: 'interiors' },
    { name: 'Roofing & Ceilings', slug: 'ceilings' },
    { name: 'Stairs & Railings', slug: 'stairs' },
    { name: 'Exteriors & Landscaping', slug: 'exteriors' },
];

export default function Header({
    toggleSidebar,
    isSidebarCollapsed,
    backLink,
    backLabel = 'Back'
}: HeaderProps) {
    const pathname = usePathname()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false)
    const [mobileServicesOpen, setMobileServicesOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    const isActive = (path: string) => pathname === path
    const isServicesActive = pathname?.startsWith('/services')

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setServicesDropdownOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleMouseEnter = () => {
        if (dropdownTimeoutRef.current) {
            clearTimeout(dropdownTimeoutRef.current)
        }
        setServicesDropdownOpen(true)
    }

    const handleMouseLeave = () => {
        dropdownTimeoutRef.current = setTimeout(() => {
            setServicesDropdownOpen(false)
        }, 200)
    }

    return (
        <header className="header">
            <div className="container">
                <div className="header-content">
                    {/* Left: Logo and Filter Toggle */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {toggleSidebar && (
                            <button
                                onClick={toggleSidebar}
                                className="filter-toggle-btn"
                                aria-label={isSidebarCollapsed ? "Show filters" : "Hide filters"}
                                title={isSidebarCollapsed ? "Show filters" : "Hide filters"}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                                </svg>
                                <span className="filter-toggle-text">Filters</span>
                            </button>
                        )}
                        <Link href="/" className="logo hover:text-[var(--copper-400)] transition-colors">
                            PropertyHub
                        </Link>
                    </div>

                    {/* Center: Main Navigation (Desktop) */}
                    <nav className="main-nav">
                        <Link
                            href="/"
                            className={`nav-link ${isActive('/') ? 'nav-link-active' : ''}`}
                        >
                            Home
                        </Link>

                        {/* Services Dropdown */}
                        <div
                            ref={dropdownRef}
                            className="nav-dropdown"
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                        >
                            <button
                                className={`nav-link nav-dropdown-trigger ${isServicesActive ? 'nav-link-active' : ''}`}
                                onClick={() => setServicesDropdownOpen(!servicesDropdownOpen)}
                            >
                                Services
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    style={{
                                        marginLeft: '0.25rem',
                                        transform: servicesDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                        transition: 'transform 0.2s'
                                    }}
                                >
                                    <polyline points="6 9 12 15 18 9"></polyline>
                                </svg>
                            </button>

                            {servicesDropdownOpen && (
                                <div className="nav-dropdown-menu">
                                    {serviceCategories.map((category) => (
                                        <Link
                                            key={category.slug}
                                            href={`/services/${category.slug}`}
                                            className={`nav-dropdown-item ${pathname === `/services/${category.slug}` ? 'nav-dropdown-item-active' : ''}`}
                                            onClick={() => setServicesDropdownOpen(false)}
                                        >
                                            {category.name}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>

                        <Link
                            href="/login"
                            className={`nav-link ${isActive('/login') || pathname?.startsWith('/admin') ? 'nav-link-active' : ''}`}
                        >
                            Login
                        </Link>
                    </nav>

                    {/* Right: Mobile Menu Toggle */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {backLink && (
                            <Link href={backLink} className="btn btn-secondary text-sm py-2 px-4 h-auto min-h-0">
                                {backLabel}
                            </Link>
                        )}

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="mobile-menu-toggle"
                            aria-label="Toggle menu"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                {mobileMenuOpen ? (
                                    <>
                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                    </>
                                ) : (
                                    <>
                                        <line x1="3" y1="12" x2="21" y2="12"></line>
                                        <line x1="3" y1="6" x2="21" y2="6"></line>
                                        <line x1="3" y1="18" x2="21" y2="18"></line>
                                    </>
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation Dropdown */}
                {mobileMenuOpen && (
                    <nav className="mobile-nav">
                        <Link
                            href="/"
                            className={`mobile-nav-link ${isActive('/') ? 'mobile-nav-link-active' : ''}`}
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Home
                        </Link>

                        {/* Mobile Services Accordion */}
                        <div>
                            <button
                                className={`mobile-nav-link mobile-nav-accordion ${isServicesActive ? 'mobile-nav-link-active' : ''}`}
                                onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
                                style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                            >
                                Services
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    style={{
                                        transform: mobileServicesOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                        transition: 'transform 0.2s'
                                    }}
                                >
                                    <polyline points="6 9 12 15 18 9"></polyline>
                                </svg>
                            </button>

                            {mobileServicesOpen && (
                                <div className="mobile-nav-submenu">
                                    {serviceCategories.map((category) => (
                                        <Link
                                            key={category.slug}
                                            href={`/services/${category.slug}`}
                                            className={`mobile-nav-sublink ${pathname === `/services/${category.slug}` ? 'mobile-nav-link-active' : ''}`}
                                            onClick={() => {
                                                setMobileServicesOpen(false)
                                                setMobileMenuOpen(false)
                                            }}
                                        >
                                            {category.name}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>

                        <Link
                            href="/login"
                            className={`mobile-nav-link ${isActive('/login') || pathname?.startsWith('/admin') ? 'mobile-nav-link-active' : ''}`}
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Login
                        </Link>
                    </nav>
                )}
            </div>
        </header>
    )
}
