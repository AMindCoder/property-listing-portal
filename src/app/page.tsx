'use client'

import { useState, useEffect } from 'react'
import PropertyCard from './components/PropertyCard'

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
  imageUrl?: string
}

const PROPERTY_TYPES = ['Plot', 'House', 'Flat', 'Rental']

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
      const response = await fetch(`/api/properties?${params.toString()}`)
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
          </div>
        </div>
      </header>

      <main className="container">
        <div className="filter-section">
          <h2 className="filter-title">Find Your Dream Property</h2>
          <div className="filter-grid">
            <div className="filter-group">
              <label htmlFor="area" className="filter-label">Area</label>
              <select
                id="area"
                name="area"
                className="filter-select"
                value={filters.area}
                onChange={handleFilterChange}
              >
                <option value="ALL">All Areas</option>
                {areas.map((area) => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="propertyType" className="filter-label">Property Type</label>
              <select
                id="propertyType"
                name="propertyType"
                className="filter-select"
                value={filters.propertyType}
                onChange={handleFilterChange}
              >
                <option value="ALL">All Types</option>
                {PROPERTY_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="status" className="filter-label">Status</label>
              <select
                id="status"
                name="status"
                className="filter-select"
                value={filters.status}
                onChange={handleFilterChange}
              >
                <option value="AVAILABLE">Available</option>
                <option value="SOLD">Sold</option>
                <option value="ALL">All</option>
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="minPrice" className="filter-label">Min Price</label>
              <input
                id="minPrice"
                type="number"
                name="minPrice"
                placeholder="$0"
                className="filter-input"
                value={filters.minPrice}
                onChange={handleFilterChange}
              />
            </div>

            <div className="filter-group">
              <label htmlFor="maxPrice" className="filter-label">Max Price</label>
              <input
                id="maxPrice"
                type="number"
                name="maxPrice"
                placeholder="Any"
                className="filter-input"
                value={filters.maxPrice}
                onChange={handleFilterChange}
              />
            </div>

            <div className="filter-group" style={{ alignSelf: 'flex-end' }}>
              <button className="btn" onClick={applyFilters}>
                Apply Filters
              </button>
            </div>
          </div>
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
      </main>
    </div>
  )
}
