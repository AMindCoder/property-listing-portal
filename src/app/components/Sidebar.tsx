'use client'

import React from 'react'

interface SidebarProps {
    filters: {
        status: string
        minPrice: string
        maxPrice: string
        area: string
        propertyType: string
    }
    areas: string[]
    onFilterChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
    onApplyFilters: () => void
}

const PROPERTY_TYPES = ['Plot', 'House', 'Flat', 'Rental']

export default function Sidebar({ filters, areas, onFilterChange, onApplyFilters }: SidebarProps) {
    return (
        <aside className="sidebar">
            <div className="filter-section">
                <h2 className="filter-title">Filters</h2>

                <div className="filter-group">
                    <label htmlFor="propertyType" className="filter-label">Property Type</label>
                    <select
                        id="propertyType"
                        name="propertyType"
                        className="filter-select"
                        value={filters.propertyType}
                        onChange={onFilterChange}
                    >
                        <option value="ALL">All Types</option>
                        {PROPERTY_TYPES.map((type) => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </div>

                <div className="filter-group">
                    <label htmlFor="area" className="filter-label">Area</label>
                    <select
                        id="area"
                        name="area"
                        className="filter-select"
                        value={filters.area}
                        onChange={onFilterChange}
                    >
                        <option value="ALL">All Areas</option>
                        {areas.map((area) => (
                            <option key={area} value={area}>{area}</option>
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
                        onChange={onFilterChange}
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
                        onChange={onFilterChange}
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
                        onChange={onFilterChange}
                    />
                </div>

                <button className="btn btn-primary w-full" onClick={onApplyFilters}>
                    Apply Filters
                </button>
            </div>
        </aside>
    )
}
