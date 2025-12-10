'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import PropertyCard from './components/PropertyCard'
import Sidebar from './components/Sidebar'
import SearchBar from './components/search/SearchBar'
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

function HomeContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [properties, setProperties] = useState<Property[]>([])
  const [areas, setAreas] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [filters, setFilters] = useState({
    status: searchParams.get('status') || 'AVAILABLE',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    area: searchParams.get('area') || 'ALL',
    propertyType: searchParams.get('propertyType') || 'ALL',
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

    // Add search query if present
    if (searchQuery) {
      params.append('q', searchQuery)
    }

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

    // Update URL
    const newUrl = params.toString() ? `/?${params.toString()}` : '/'
    window.history.replaceState({}, '', newUrl)

    try {
      // Use search API if there's a query, otherwise use existing properties API
      const endpoint = searchQuery ? '/api/properties/search' : '/api/properties'
      const response = await fetch(`${endpoint}?${params.toString()}&t=${Date.now()}`, { cache: 'no-store' })
      const data = await response.json()

      // Handle search API response format
      if (data.success) {
        setProperties(data.data.properties)
      } else if (Array.isArray(data)) {
        setProperties(data)
      } else {
        setProperties([])
      }
    } catch (error) {
      console.error('Failed to fetch properties:', error)
      setProperties([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAreas()
  }, [])

  useEffect(() => {
    fetchProperties()
  }, [searchQuery])

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
    setTimeout(() => fetchProperties(), 0)
  }

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
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
          <div className="search-section">
            <SearchBar
              value={searchQuery}
              onChange={handleSearchChange}
              onSearch={handleSearch}
            />
            {searchQuery && (
              <div className="search-result-count">
                {loading ? 'Searching...' : `${properties.length} properties found`}
              </div>
            )}
          </div>
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

export default function Home() {
  return (
    <Suspense fallback={<div className="loading">Loading...</div>}>
      <HomeContent />
    </Suspense>
  )
}

