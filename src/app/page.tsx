'use client'

import { useState, useEffect } from 'react'
import PropertyCard from './components/PropertyCard'
import Sidebar from './components/Sidebar'
import Link from 'next/link'
import Footer from './components/Footer'
import Header from './components/Header'

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

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true)

  useEffect(() => {
    const handleResize = () => {
      // On desktop, show sidebar by default; on mobile, hide by default
      if (window.innerWidth >= 768) {
        setIsSidebarCollapsed(false)
      } else {
        setIsSidebarCollapsed(true)
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
      <Header
        toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isSidebarCollapsed={isSidebarCollapsed}
      />

      <main className={`container main-layout ${isSidebarCollapsed ? 'sidebar-collapsed' : 'sidebar-visible'}`}>
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

