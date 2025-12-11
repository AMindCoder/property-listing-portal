'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

interface AdminHeaderProps {
    showBreadcrumb?: boolean
    breadcrumbs?: { label: string; href?: string }[]
}

export default function AdminHeader({ showBreadcrumb = true, breadcrumbs = [] }: AdminHeaderProps) {
    const router = useRouter()
    const pathname = usePathname()
    const [menuOpen, setMenuOpen] = useState(false)
    const [isLoggingOut, setIsLoggingOut] = useState(false)

    const handleLogout = async () => {
        setIsLoggingOut(true)
        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
            })
            router.push('/')
            router.refresh()
        } catch (error) {
            console.error('Logout failed:', error)
        } finally {
            setIsLoggingOut(false)
        }
    }

    const isActive = (path: string) => {
        if (path === '/admin' && pathname === '/admin') return true
        if (path !== '/admin' && pathname?.startsWith(path)) return true
        return false
    }

    const navItems = [
        { label: 'Dashboard', href: '/admin' },
        { label: 'Leads', href: '/admin/leads' },
        { label: 'Services', href: '/admin/services' },
    ]

    return (
        <>
            <header className="admin-header">
                <div className="container">
                    <div className="header-content">
                        <Link href="/admin" className="logo">PropertyHub</Link>

                        {/* Desktop Navigation */}
                        <nav className="admin-nav">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`admin-nav-link ${isActive(item.href) ? 'admin-nav-link-active' : ''}`}
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </nav>

                        {/* Desktop Actions */}
                        <div className="admin-header-actions">
                            <Link href="/" className="btn btn-secondary btn-sm" target="_blank">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                    <polyline points="15 3 21 3 21 9" />
                                    <line x1="10" y1="14" x2="21" y2="3" />
                                </svg>
                                View Site
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="btn btn-secondary btn-sm"
                                disabled={isLoggingOut}
                            >
                                {isLoggingOut ? (
                                    <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                        <polyline points="16 17 21 12 16 7" />
                                        <line x1="21" y1="12" x2="9" y2="12" />
                                    </svg>
                                )}
                                Logout
                            </button>
                        </div>

                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="admin-burger"
                            aria-label="Toggle menu"
                        >
                            {menuOpen ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="3" y1="12" x2="21" y2="12"></line>
                                    <line x1="3" y1="6" x2="21" y2="6"></line>
                                    <line x1="3" y1="18" x2="21" y2="18"></line>
                                </svg>
                            )}
                        </button>
                    </div>

                    {/* Mobile Menu Dropdown */}
                    {menuOpen && (
                        <div className="admin-mobile-menu">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`admin-mobile-link ${isActive(item.href) ? 'admin-mobile-link-active' : ''}`}
                                    onClick={() => setMenuOpen(false)}
                                >
                                    {item.label}
                                </Link>
                            ))}
                            <div className="admin-mobile-divider" />
                            <Link
                                href="/"
                                className="admin-mobile-link"
                                onClick={() => setMenuOpen(false)}
                                target="_blank"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                    <polyline points="15 3 21 3 21 9" />
                                    <line x1="10" y1="14" x2="21" y2="3" />
                                </svg>
                                View Site
                            </Link>
                            <button
                                onClick={() => { setMenuOpen(false); handleLogout(); }}
                                className="admin-mobile-link admin-mobile-link-danger"
                                disabled={isLoggingOut}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                    <polyline points="16 17 21 12 16 7" />
                                    <line x1="21" y1="12" x2="9" y2="12" />
                                </svg>
                                {isLoggingOut ? 'Logging out...' : 'Logout'}
                            </button>
                        </div>
                    )}
                </div>
            </header>

            {/* Breadcrumb */}
            {showBreadcrumb && breadcrumbs.length > 0 && (
                <div className="container">
                    <nav className="admin-breadcrumb">
                        <Link href="/admin" className="admin-breadcrumb-link">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                <polyline points="9 22 9 12 15 12 15 22" />
                            </svg>
                            Dashboard
                        </Link>
                        {breadcrumbs.map((crumb, index) => (
                            <span key={index}>
                                <span className="admin-breadcrumb-separator">/</span>
                                {crumb.href ? (
                                    <Link href={crumb.href} className="admin-breadcrumb-link">
                                        {crumb.label}
                                    </Link>
                                ) : (
                                    <span className="admin-breadcrumb-current">{crumb.label}</span>
                                )}
                            </span>
                        ))}
                    </nav>
                </div>
            )}
        </>
    )
}
