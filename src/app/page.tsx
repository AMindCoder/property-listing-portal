'use client'

import { useState, useEffect } from 'react'
import PropertyCard from './components/PropertyCard'
import Sidebar from './components/Sidebar'

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

  return (
    <div>
      <header className="header">
        <div className="container">
          <div className="header-content">
            <h1 className="logo">PropertyHub</h1>
            <a href="/admin" className="btn btn-secondary">Admin Console</a>
          </div>
        </div>
      </header>

      <main className="container main-layout">
        <Sidebar
          filters={filters}
          areas={areas}
          onFilterChange={handleFilterChange}
          onApplyFilters={applyFilters}
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
    </div>
  )
}

