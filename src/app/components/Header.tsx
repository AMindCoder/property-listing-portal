'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

interface HeaderProps {
    toggleSidebar?: () => void
    isSidebarCollapsed?: boolean
    backLink?: string
    backLabel?: string
}

export default function Header({
    toggleSidebar,
    isSidebarCollapsed,
    backLink,
    backLabel = 'Back'
}: HeaderProps) {
    const pathname = usePathname()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    const isActive = (path: string) => pathname === path

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
                        <Link
                            href="/services/construction"
                            className={`nav-link ${isActive('/services/construction') ? 'nav-link-active' : ''}`}
                        >
                            Construction
                        </Link>
                        <Link
                            href="/login"
                            className={`nav-link ${isActive('/login') || pathname?.startsWith('/admin') ? 'nav-link-active' : ''}`}
                        >
                            Admin
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
                        <Link
                            href="/services/construction"
                            className={`mobile-nav-link ${isActive('/services/construction') ? 'mobile-nav-link-active' : ''}`}
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Construction Services
                        </Link>
                        <Link
                            href="/login"
                            className={`mobile-nav-link ${isActive('/login') || pathname?.startsWith('/admin') ? 'mobile-nav-link-active' : ''}`}
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Admin Portal
                        </Link>
                    </nav>
                )}
            </div>
        </header>
    )
}
