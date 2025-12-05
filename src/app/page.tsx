'use client'

import { useState, useEffect } from 'react'
import PropertyCard from './components/PropertyCard'
import Sidebar from './components/Sidebar'
import Link from 'next/link'
import Footer from './components/Footer'

interface Property {
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

export default function Home() {
  const [properties, setProperties] = useState<Property[]>([])
  const [areas, setAreas] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    status: 'AVAILABLE',
    minPrice: '',
    maxPrice: '',
    area: 'ALL',
    propertyType: 'ALL',
  })

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarCollapsed(true)
      } else {
        setIsSidebarCollapsed(false)
      }
    }

    // Set initial state
    handleResize()

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const fetchAreas = async () => {
    try {
      const response = await fetch('/api/areas')
      const data = await response.json()
      setAreas(data)
    } catch (error) {
      console.error('Failed to fetch areas:', error)
    }
  }

  const fetchProperties = async () => {
    setLoading(true)
    const params = new URLSearchParams()

    if (filters.status) {
      params.append('status', filters.status)
    }
    if (filters.minPrice) {
      params.append('minPrice', filters.minPrice)
    }
    if (filters.maxPrice) {
      params.append('maxPrice', filters.maxPrice)
    }
    if (filters.area && filters.area !== 'ALL') {
      params.append('area', filters.area)
    }
    if (filters.propertyType && filters.propertyType !== 'ALL') {
      params.append('propertyType', filters.propertyType)
    }

    try {
      const response = await fetch(`/api/properties?${params.toString()}&t=${Date.now()}`, { cache: 'no-store' })
      const data = await response.json()
      setProperties(data)
    } catch (error) {
      console.error('Failed to fetch properties:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAreas()
    fetchProperties()
  }, [])

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    })
  }

  const applyFilters = () => {
    fetchProperties()
  }

  const clearFilters = () => {
    setFilters({
      status: 'AVAILABLE',
      minPrice: '',
      maxPrice: '',
      area: 'ALL',
      propertyType: 'ALL',
    })
    // Fetch will be triggered by the next Apply click or effect
    setTimeout(() => fetchProperties(), 0)
  }

  return (
    <div>
      <header className="header">
        <div className="container">
          <div className="header-content">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="mobile-nav-toggle p-2 text-[var(--copper-400)] hover:text-[var(--copper-500)] transition-colors"
                aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
              </button>
              <h1 className="logo">PropertyHub</h1>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Link
                href="/services/construction"
                className="hidden md:block text-[var(--copper-400)] hover:text-[var(--copper-500)] font-medium transition-colors"
              >
                Construction Services
              </Link>
              <Link
                href="/login"
                className="p-2 text-[var(--copper-400)] hover:text-[var(--copper-500)] transition-colors"
                aria-label="Admin Access"
                title="Admin Login"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                  <circle cx="20" cy="21" r="2"></circle>
                  <path d="M20 17a2 2 0 0 1 2 2"></path>
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className={`container main-layout ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Sidebar
          filters={filters}
          areas={areas}
          onFilterChange={handleFilterChange}
          onApplyFilters={applyFilters}
          onClearFilters={clearFilters}
          isCollapsed={isSidebarCollapsed}
        />

        <div className="content-area">
          {loading ? (
            <div className="loading">Loading properties...</div>
          ) : properties.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🏚️</div>
              <h3 className="empty-title">No properties found</h3>
              <p className="empty-message">Try adjusting your filters to see more results.</p>
            </div>
          ) : (
            <div className="property-grid">
              {properties.map((property) => (
                <PropertyCard key={property.id} {...property} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

